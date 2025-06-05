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

      const region = '마장동-56'
      const url = `${this.baseUrl}/kr/buy-sell/?in=${encodeURIComponent(region)}&search=${encodeURIComponent(query)}`
      
      console.log('당근마켓 URL:', url)
      await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 })
      
      await this.page.waitForSelector('a[data-gtm="search_article"]', { timeout: 15000 })
      await this.autoScroll()
      await new Promise(resolve => setTimeout(resolve, 1000))

      const html = await this.page.content()
      const $ = load(html)
      const products: Product[] = []

      $('a[data-gtm="search_article"]').each((i, el) => {
        if (i >= limit) return false
        
        const card = $(el)
        const title = card.find('span.lm809sh').text().trim()
        const priceText = card.find('span.lm809si').text().trim()
        const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 0
        const location = card.find('span.lm809sj').first().text().trim()

        let imageUrl = card.find('img').attr('src') || ''
        if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl

        const relUrl = card.attr('href')
        const productUrl = this.baseUrl + relUrl

        if (title && productUrl) {
          products.push({
            id: `danggeun_${Date.now()}_${i}`,
            title,
            price,
            priceText,
            location,
            imageUrl,
            productUrl,
            source: 'danggeun',
            timestamp: new Date().toISOString(),
          })
        }
      })

      console.log(`당근마켓 검색 결과: ${products.length}개`)
      return products
      
    } catch (error) {
      console.error('당근마켓 스크래핑 오류:', error)
      return this.getMockProducts(query, limit)
    } finally {
      await this.cleanup()
    }
  }

  private getMockProducts(query: string, limit: number): Product[] {
    return Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
      id: `danggeun_mock_${Date.now()}_${i}`,
      title: `${query} - 당근마켓 상품 ${i + 1}`,
      price: Math.floor(Math.random() * 500000) + 100000,
      priceText: new Intl.NumberFormat('ko-KR').format(Math.floor(Math.random() * 500000) + 100000) + '원',
      source: 'danggeun' as const,
      imageUrl: '/api/placeholder/300/200',
      productUrl: `https://www.daangn.com/mock/${i}`,
      location: '서울시',
      timestamp: new Date().toISOString()
    }))
  }
}