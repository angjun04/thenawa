import { BaseScraper } from './base-scraper'
import { Product } from '@/types/product'
import { load } from 'cheerio'

export class JunggonaraScraper extends BaseScraper {
  sourceName = 'junggonara'
  baseUrl = 'https://web.joongna.com'

  async searchProducts(query: string, limit = 10): Promise<Product[]> {
    try {
      await this.initialize()
      if (!this.page) throw new Error('Page not initialized')

      const url = `${this.baseUrl}/search/${encodeURIComponent(query)}`
      console.log(`💼 중고나라 고속 검색: ${query}`)
      
      // 🔥 최적화 1: 빠른 페이지 로드
      await this.page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 6000
      })
      
      // 🔥 최적화 2: 빠른 요소 대기
      try {
        await this.page.waitForSelector('ul.search-results', { timeout: 3000 })
        console.log('✅ 중고나라 상품 로드 완료')
      } catch {
        try {
          await this.page.waitForSelector('.search-container', { timeout: 2000 })
          console.log('✅ 중고나라 대체 컨테이너 발견')
        } catch {
          console.log('⚠️ 중고나라 상품 없음, 빠른 종료')
          return []
        }
      }
      
      // 🔥 최적화 3: 고속 스크롤
      await this.fastScroll()

      const html = await this.page.content()
      const $ = load(html)
      const products: Product[] = []

      // 🔥 최적화 4: 빠른 상품 처리
      $('ul.search-results > li').each((i, el) => {
        if (i >= limit) return false
        
        const card = $(el).find('a').first()
        if (!card.length) return

        const title = card.find('h2').first().text().trim()
        const priceText = card.find('.text-heading').first().text().trim()
        const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 0

        const infoSpans = card.find('.my-1 span')
        const location = infoSpans.length > 0 ? infoSpans.eq(0).text().trim() : ''

        // 🔥 단순한 이미지 처리
        let imageUrl = card.find('img').first().attr('src') || 
                      card.find('img').first().attr('data-src') || ''
        if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl

        const href = card.attr('href')
        if (!href) return
        
        const productUrl = href.startsWith('http') ? href : this.baseUrl + href

        if (title && productUrl) {
          products.push({
            id: `junggonara_fast_${Date.now()}_${i}`,
            title,
            price,
            priceText,
            location,
            imageUrl,
            productUrl,
            source: 'junggonara',
            timestamp: new Date().toISOString(),
          })
        }
      })

      console.log(`💼 중고나라 고속 완료: ${products.length}개`)
      return products
      
    } catch (error) {
      console.error('💼 중고나라 고속 오류:', error)
      return []
    } finally {
      await this.cleanup()
    }
  }
}