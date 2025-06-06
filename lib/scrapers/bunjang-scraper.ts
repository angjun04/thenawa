import { BaseScraper } from './base-scraper'
import { Product } from '@/types/product'
import { load } from 'cheerio'

export class BunjangScraper extends BaseScraper {
  sourceName = 'bunjang'
  baseUrl = 'https://m.bunjang.co.kr'

  async searchProducts(query: string, limit = 10): Promise<Product[]> {
    try {
      await this.initialize()
      if (!this.page) throw new Error('Page not initialized')

      const url = `${this.baseUrl}/search/products?q=${encodeURIComponent(query)}`
      console.log(`⚡ 번개장터 고속 검색: ${query}`)
      
      // 🔥 최적화 1: 직접 검색, 홈페이지 건너뛰기
      await this.page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 5000  // 5초로 단축
      })
      
      // 🔥 최적화 2: 빠른 셀렉터 감지
      const selectors = ['a[data-pid]', '.sc-bdfBQB', '.product-item']
      let found = false
      
      for (const selector of selectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 2000 }) // 2초로 단축
          found = true
          console.log(`✅ 번개장터 상품 발견: ${selector}`)
          break
        } catch {
          continue
        }
      }

      if (!found) {
        console.log('⚠️ 번개장터 상품 없음, 빠른 종료')
        return []
      }

      // 🔥 최적화 3: 최소한의 스크롤
      await this.fastScroll()

      const html = await this.page.content()
      const $ = load(html)
      const products: Product[] = []

      // 🔥 최적화 4: 첫 번째 성공 셀렉터만 사용
      const productSelectors = ['a[data-pid]', '.sc-bdfBQB a', '.product-item']
      let foundSelector = ''

      for (const selector of productSelectors) {
        const elements = $(selector)
        if (elements.length > 0) {
          foundSelector = selector
          break
        }
      }

      if (!foundSelector) {
        console.log('⚡ 번개장터 파싱 실패')
        return []
      }

      // 🔥 최적화 5: 빠른 데이터 추출
      $(foundSelector).slice(0, limit).each((i, el) => {
        const card = $(el)
        
        // 간단한 셀렉터만 사용
        const titleSelectors = ['div.sc-RcBXQ', '.product-title', 'h3']
        let title = ''
        for (const sel of titleSelectors) {
          const titleEl = card.find(sel).first()
          if (titleEl.length && titleEl.text().trim()) {
            title = titleEl.text().trim()
            break
          }
        }

        const priceSelectors = ['div.sc-iSDuPN', '.product-price', '.price']
        let priceText = ''
        for (const sel of priceSelectors) {
          const priceEl = card.find(sel).first()
          if (priceEl.length && priceEl.text().trim()) {
            priceText = priceEl.text().trim()
            break
          }
        }

        const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 0
        
        // 🔥 단순한 이미지 추출
        let imageUrl = ''
        const imgElement = card.find('img').first()
        
        if (imgElement.length) {
          const imageAttributes = ['data-original', 'data-src', 'src']
          
          for (const attr of imageAttributes) {
            const attrValue = imgElement.attr(attr)
            if (attrValue && attrValue.trim() && attrValue.length > 20 && 
                !attrValue.includes('data:image/gif')) {
              imageUrl = attrValue.trim()
              if (imageUrl.startsWith('//')) {
                imageUrl = 'https:' + imageUrl
              } else if (imageUrl.startsWith('/')) {
                imageUrl = this.baseUrl + imageUrl
              }
              break
            }
          }
        }

        const href = card.attr('href') || ''
        const productUrl = href.startsWith('http') ? href : this.baseUrl + href

        if (title && productUrl) {
          products.push({
            id: `bunjang_fast_${Date.now()}_${i}`,
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

      console.log(`⚡ 번개장터 고속 완료: ${products.length}개`)
      return products
      
    } catch (error) {
      console.error('⚡ 번개장터 고속 오류:', error)
      return []
    } finally {
      await this.cleanup()
    }
  }
}