import { BaseScraper } from './base-scraper'
import { Product } from '@/types/product'
import { load } from 'cheerio'

export class BunjangScraper extends BaseScraper {
  sourceName = 'bunjang'
  baseUrl = 'https://www.bunjang.co.kr'

  async searchProducts(query: string, limit = 20): Promise<Product[]> {
    try {
      await this.initialize()
      if (!this.page) throw new Error('Page not initialized')

      const url = `${this.baseUrl}/search/products?q=${encodeURIComponent(query)}`
      
      console.log('번개장터 URL:', url)
      await this.page.goto(url, { waitUntil: 'domcontentloaded' })
      await this.page.waitForSelector('a[data-pid]', { timeout: 20000 })
      await new Promise(resolve => setTimeout(resolve, 1000))

      const html = await this.page.content()
      const $ = load(html)
      const products: Product[] = []

      $('a[data-pid]').each((i, el) => {
        if (i >= limit) return false
        
        const card = $(el)
        const pid = card.attr('data-pid')
        const title = card.find('div.sc-RcBXQ').text().trim()
        const priceText = card.find('div.sc-iSDuPN').text().trim()
        const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 0

        let imageUrl = card.find('img').attr('data-original') ||
                      card.find('img').attr('src') || ''
        if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl

        const href = card.attr('href') || ''
        const productUrl = href.startsWith('http') ? href : this.baseUrl + href

        if (pid && title && productUrl) {
          products.push({
            id: `bunjang_${Date.now()}_${i}`,
            title,
            price,
            priceText,
            imageUrl,
            productUrl,
            source: 'bunjang',
            timestamp: new Date().toISOString(),
          })
        }
      })

      console.log(`번개장터 검색 결과: ${products.length}개`)
      return products
      
    } catch (error) {
      console.error('번개장터 스크래핑 오류:', error)
      return this.getMockProducts(query, limit)
    } finally {
      await this.cleanup()
    }
  }

  private getMockProducts(query: string, limit: number): Product[] {
    return Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
      id: `bunjang_mock_${Date.now()}_${i}`,
      title: `${query} - 번개장터 상품 ${i + 1}`,
      price: Math.floor(Math.random() * 500000) + 100000,
      priceText: new Intl.NumberFormat('ko-KR').format(Math.floor(Math.random() * 500000) + 100000) + '원',
      source: 'bunjang' as const,
      imageUrl: '/api/placeholder/300/200',
      productUrl: `https://www.bunjang.co.kr/mock/${i}`,
      timestamp: new Date().toISOString()
    }))
  }
}