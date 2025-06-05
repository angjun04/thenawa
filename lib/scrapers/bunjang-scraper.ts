import { BaseScraper } from './base-scraper'
import { Product } from '@/types/product'
import { load } from 'cheerio'

export class BunjangScraper extends BaseScraper {
  sourceName = 'bunjang'
  baseUrl = 'https://m.bunjang.co.kr'

  async searchProducts(query: string, limit = 20): Promise<Product[]> {
    try {
      await this.initialize()
      if (!this.page) throw new Error('Page not initialized')

      // 홈페이지 먼저 방문 (봇 탐지 우회)
      console.log('번개장터 홈페이지 방문...')
      await this.page.goto(this.baseUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      })
      await new Promise(resolve => setTimeout(resolve, 2000))

      const url = `${this.baseUrl}/search/products?q=${encodeURIComponent(query)}`
      console.log('번개장터 검색 URL:', url)
      
      await this.page.goto(url, { waitUntil: 'domcontentloaded' })
      
      // 다양한 셀렉터로 시도
      const selectors = [
        'a[data-pid]',
        '.sc-bdfBQB',
        '.product-item',
        '[data-testid="product-item"]'
      ]

      let found = false
      for (const selector of selectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 10000 })
          found = true
          console.log(`번개장터 셀렉터 발견: ${selector}`)
          break
        } catch {
          console.log(`번개장터 셀렉터 실패: ${selector}`)
          continue
        }
      }

      if (!found) {
        console.log('번개장터 상품 셀렉터를 찾을 수 없습니다.')
        return []
      }

      // 모바일 스크롤
      await this.mobileScroll()
      await new Promise(resolve => setTimeout(resolve, 2000))

      const html = await this.page.content()
      const $ = load(html)
      const products: Product[] = []

      // 다양한 셀렉터로 상품 추출 시도
      const productSelectors = [
        'a[data-pid]',
        '.sc-bdfBQB a',
        '.product-item',
        'article a'
      ]

      let foundSelector = ''

      for (const selector of productSelectors) {
        const elements = $(selector)
        if (elements.length > 0) {
          console.log(`번개장터 상품 발견: ${selector} (${elements.length}개)`)
          foundSelector = selector
          break
        }
      }

      if (!foundSelector) {
        console.log('번개장터 상품을 찾을 수 없습니다.')
        return []
      }

      // 찾은 셀렉터로 상품 처리
      $(foundSelector).slice(0, limit).each((i, el) => {
        const card = $(el)
        
        // 다양한 제목 셀렉터 시도
        const titleSelectors = [
          'div.sc-RcBXQ',
          '.product-title',
          'h3',
          'h4',
          '.title'
        ]
        
        let title = ''
        for (const sel of titleSelectors) {
          const titleEl = card.find(sel)
          if (titleEl.length && titleEl.text().trim()) {
            title = titleEl.text().trim()
            break
          }
        }

        // 다양한 가격 셀렉터 시도
        const priceSelectors = [
          'div.sc-iSDuPN',
          '.product-price',
          '.price',
          '.amount'
        ]
        
        let priceText = ''
        for (const sel of priceSelectors) {
          const priceEl = card.find(sel)
          if (priceEl.length && priceEl.text().trim()) {
            priceText = priceEl.text().trim()
            break
          }
        }

        const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 0
        
        // 🔥 이미지 추출 로직 대폭 개선
        let imageUrl = ''
        const imgElement = card.find('img').first()
        
        if (imgElement.length) {
          // 다양한 이미지 속성 확인 (우선순위 순)
          const imageAttributes = [
            'data-original',      // 번개장터 주요 속성
            'data-src',           // lazy loading
            'data-lazy',          // lazy loading
            'data-lazy-src',      // lazy loading
            'src',                // 기본 src
            'data-image',         // 커스텀 속성
            'data-url'            // 커스텀 속성
          ]
          
          for (const attr of imageAttributes) {
            const attrValue = imgElement.attr(attr)
            if (attrValue && attrValue.trim() && attrValue !== 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7') {
              imageUrl = attrValue.trim()
              console.log(`번개장터 이미지 발견 (${attr}): ${imageUrl.substring(0, 50)}...`)
              break
            }
          }
          
          // srcset도 확인
          if (!imageUrl) {
            const srcset = imgElement.attr('srcset')
            if (srcset) {
              const srcsetUrls = srcset.split(',').map(s => s.trim().split(' ')[0])
              if (srcsetUrls.length > 0 && srcsetUrls[0]) {
                imageUrl = srcsetUrls[0]
                console.log(`번개장터 이미지 발견 (srcset): ${imageUrl.substring(0, 50)}...`)
              }
            }
          }
        }
        
        // 이미지 URL 정규화
        if (imageUrl) {
          if (imageUrl.startsWith('//')) {
            imageUrl = 'https:' + imageUrl
          } else if (imageUrl.startsWith('/')) {
            imageUrl = this.baseUrl + imageUrl
          }
          
          // 유효하지 않은 이미지 URL 필터링
          if (imageUrl.includes('placeholder') || 
              imageUrl.includes('loading') || 
              imageUrl.includes('data:image/svg') ||
              imageUrl.length < 10) {
            imageUrl = ''
          }
        }

        const href = card.attr('href') || ''
        const productUrl = href.startsWith('http') ? href : this.baseUrl + href

        if (title && productUrl) {
          products.push({
            id: `bunjang_${Date.now()}_${i}`,
            title,
            price,
            priceText: priceText || '가격 문의',
            imageUrl: imageUrl || '', // 빈 문자열 대신 명시적으로 처리
            productUrl,
            source: 'bunjang',
            timestamp: new Date().toISOString(),
          })
          
          // 디버그 로그
          if (!imageUrl) {
            console.log(`번개장터 ${i}: 이미지 없음 - ${title.substring(0, 30)}...`)
          }
        }
      })

      console.log(`번개장터 최종 검색 결과: ${products.length}개`)
      return products
      
    } catch (error) {
      console.error('번개장터 스크래핑 오류:', error)
      return []
    } finally {
      await this.cleanup()
    }
  }
}