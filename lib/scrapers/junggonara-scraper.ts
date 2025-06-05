import { BaseScraper } from './base-scraper'
import { Product } from '@/types/product'
import { load } from 'cheerio'

export class JunggonaraScraper extends BaseScraper {
  sourceName = 'junggonara'
  baseUrl = 'https://web.joongna.com'

  async searchProducts(query: string, limit = 20): Promise<Product[]> {
    try {
      await this.initialize()
      if (!this.page) throw new Error('Page not initialized')

      const url = `${this.baseUrl}/search/${encodeURIComponent(query)}`
      
      console.log('중고나라 URL:', url)
      await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
      
      try {
        await this.page.waitForSelector('ul.search-results', { timeout: 25000 })
      } catch {
        await this.page.waitForSelector('.search-container', { timeout: 10000 })
      }
      
      await this.autoScroll()
      await new Promise(resolve => setTimeout(resolve, 3000))

      const html = await this.page.content()
      const $ = load(html)
      const products: Product[] = []

      $('ul.search-results > li').each((i, el) => {
        if (i >= limit) return false
        
        const card = $(el).find('a').first()
        if (!card.length) return

        const title = card.find('h2').text().trim()
        const priceText = card.find('.text-heading').text().trim()
        const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 0

        const infoSpans = card.find('.my-1 span')
        const location = infoSpans.length > 0 ? infoSpans.eq(0).text().trim() : ''

        let imageUrl = card.find('img').attr('src') || 
                      card.find('img').attr('data-src') || ''
        if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl

        const href = card.attr('href')
        if (!href) return
        
        const productUrl = href.startsWith('http') ? href : this.baseUrl + href

        if (title && productUrl) {
          products.push({
            id: `junggonara_${Date.now()}_${i}`,
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

      console.log(`중고나라 검색 결과: ${products.length}개`)
      return products
      
    } catch (error) {
      console.error('중고나라 스크래핑 오류:', error)
      return this.getMockProducts(query, limit)
    } finally {
      await this.cleanup()
    }
  }

  private getMockProducts(query: string, limit: number): Product[] {
    return Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
      id: `junggonara_mock_${Date.now()}_${i}`,
      title: `${query} - 중고나라 상품 ${i + 1}`,
      price: Math.floor(Math.random() * 500000) + 100000,
      priceText: new Intl.NumberFormat('ko-KR').format(Math.floor(Math.random() * 500000) + 100000) + '원',
      source: 'junggonara' as const,
      imageUrl: '/api/placeholder/300/200',
      productUrl: `https://web.joongna.com/mock/${i}`,
      location: '서울시',
      timestamp: new Date().toISOString()
    }))
  }
}