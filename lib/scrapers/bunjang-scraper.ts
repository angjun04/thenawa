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
        
        let imageUrl = card.find('img').attr('data-original') ||
                      card.find('img').attr('data-src') ||
                      card.find('img').attr('src') || ''
        if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl

        const href = card.attr('href') || ''
        const productUrl = href.startsWith('http') ? href : this.baseUrl + href

        if (title && productUrl) {
          products.push({
            id: `bunjang_${Date.now()}_${i}`,
            title,
            price,
            priceText: priceText || '가격 문의',
            imageUrl,
            productUrl,
            source: 'bunjang',
            timestamp: new Date().toISOString(),
          })
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