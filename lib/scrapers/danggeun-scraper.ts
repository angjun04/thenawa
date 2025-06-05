import { BaseScraper } from './base-scraper'
import { Product } from '@/types/product'
import { load } from 'cheerio'

export class DanggeunScraper extends BaseScraper {
  sourceName = 'danggeun'
  baseUrl = 'https://www.daangn.com'

  async searchProducts(query: string, limit = 20): Promise<Product[]> {
    try {
      await this.initialize()
      if (!this.page) throw new Error('Page not initialized')

      // 홈페이지 먼저 방문
      console.log('당근마켓 홈페이지 방문...')
      await this.page.goto(this.baseUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      })
      await new Promise(resolve => setTimeout(resolve, 2000))

      const region = '마장동-56'
      const url = `${this.baseUrl}/kr/buy-sell/?in=${encodeURIComponent(region)}&search=${encodeURIComponent(query)}`
      
      console.log('당근마켓 검색 URL:', url)
      await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
      
      // 다양한 셀렉터로 시도
      const selectors = [
        'a[data-gtm="search_article"]',
        'article a',
        '.card-photo',
        '[data-testid="article-card"]'
      ]

      let found = false
      for (const selector of selectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 10000 })
          found = true
          console.log(`당근마켓 셀렉터 발견: ${selector}`)
          break
        } catch {
          console.log(`당근마켓 셀렉터 실패: ${selector}`)
          continue
        }
      }

      if (!found) {
        console.log('당근마켓 상품 셀렉터를 찾을 수 없습니다.')
        return []
      }

      await this.mobileScroll()
      await new Promise(resolve => setTimeout(resolve, 2000))

      const html = await this.page.content()
      const $ = load(html)
      const products: Product[] = []

      // 다양한 상품 셀렉터 시도
      const productSelectors = [
        'a[data-gtm="search_article"]',
        'article a',
        '.card-photo'
      ]

      let foundSelector = ''

      for (const selector of productSelectors) {
        const elements = $(selector)
        if (elements.length > 0) {
          console.log(`당근마켓 상품 발견: ${selector} (${elements.length}개)`)
          foundSelector = selector
          break
        }
      }

      if (!foundSelector) {
        console.log('당근마켓 상품을 찾을 수 없습니다.')
        return []
      }

      // 찾은 셀렉터로 상품 처리
      $(foundSelector).slice(0, limit).each((i, el) => {
        const card = $(el)
        
        // 제목 추출
        const titleSelectors = [
          'span.lm809sh',
          '.article-title',
          'h2',
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

        // 가격 추출
        const priceSelectors = [
          'span.lm809si',
          '.article-price',
          '.price'
        ]
        
        let priceText = ''
        for (const sel of priceSelectors) {
          const priceEl = card.find(sel)
          if (priceEl.length && priceEl.text().trim()) {
            priceText = priceEl.text().trim()
            break
          }
        }

        // 지역 추출
        const locationSelectors = [
          'span.lm809sj',
          '.article-region',
          '.region'
        ]
        
        let location = ''
        for (const sel of locationSelectors) {
          const locationEl = card.find(sel).first()
          if (locationEl.length && locationEl.text().trim()) {
            location = locationEl.text().trim()
            break
          }
        }

        const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 0
        
        let imageUrl = card.find('img').attr('src') || ''
        if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl

        const relUrl = card.attr('href')
        const productUrl = relUrl ? this.baseUrl + relUrl : ''

        if (title && productUrl) {
          products.push({
            id: `danggeun_${Date.now()}_${i}`,
            title,
            price,
            priceText: priceText || '가격 문의',
            location: location || '서울시',
            imageUrl,
            productUrl,
            source: 'danggeun',
            timestamp: new Date().toISOString(),
          })
        }
      })

      console.log(`당근마켓 최종 검색 결과: ${products.length}개`)
      return products
      
    } catch (error) {
      console.error('당근마켓 스크래핑 오류:', error)
      return []
    } finally {
      await this.cleanup()
    }
  }
}