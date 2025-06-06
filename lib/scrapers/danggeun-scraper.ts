import { BaseScraper } from './base-scraper'
import { Product } from '@/types/product'
import { load } from 'cheerio'

export class DanggeunScraper extends BaseScraper {
  sourceName = 'danggeun'
  baseUrl = 'https://www.daangn.com'

  async searchProducts(query: string, limit = 10): Promise<Product[]> { // 🔥 기본 limit 10으로 축소
    try {
      await this.initialize()
      if (!this.page) throw new Error('Page not initialized')

      const region = '마장동-56'
      const url = `${this.baseUrl}/kr/buy-sell/?in=${encodeURIComponent(region)}&search=${encodeURIComponent(query)}`
      
      console.log(`🥕 당근마켓 고속 검색: ${query}`)
      
      // 🔥 최적화 1: 직접 검색 페이지로 이동 (홈페이지 건너뛰기)
      await this.page.goto(url, { 
        waitUntil: 'domcontentloaded', // networkidle2 대신 domcontentloaded로 더 빠르게
        timeout: 6000  // 6초로 단축
      })
      
      // 🔥 최적화 2: 빠른 셀렉터 대기 (더 짧은 타임아웃)
      try {
        await this.page.waitForSelector('a[data-gtm="search_article"]', { timeout: 3000 })
        console.log('✅ 당근마켓 상품 로드 완료')
      } catch {
        console.log('⚠️ 당근마켓 상품 로딩 지연, 계속 진행...')
        // 실패해도 계속 진행
      }
      
      // 🔥 최적화 3: 스크롤 최소화 (고속 스크롤 사용)
      await this.fastScroll()

      // 🔥 최적화 4: 즉시 파싱 (추가 대기 없음)
      const html = await this.page.content()
      const $ = load(html)
      const products: Product[] = []

      // 🔥 최적화 5: 간소화된 상품 추출
      $('a[data-gtm="search_article"]').each((i, el) => {
        if (i >= limit) return false // 조기 종료
        
        const card = $(el)
        
        // 🔥 빠른 데이터 추출 (첫 번째 매치만)
        const title = card.find('span.lm809sh').first().text().trim()
        const priceText = card.find('span.lm809si').first().text().trim()
        const location = card.find('span.lm809sj').first().text().trim()
        
        // 🔥 단순한 이미지 처리
        let imageUrl = card.find('img').first().attr('src') || ''
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl
        }
        
        // 🔥 기본 이미지가 없으면 빈 문자열 (플레이스홀더 생성 제거)
        if (!imageUrl || imageUrl.includes('data:image/gif') || imageUrl.length < 20) {
          imageUrl = ''
        }
        
        const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 0
        const relUrl = card.attr('href')
        const productUrl = relUrl ? this.baseUrl + relUrl : ''

        // 🔥 필수 필드만 검증
        if (title && productUrl) {
          products.push({
            id: `danggeun_fast_${Date.now()}_${i}`,
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

      console.log(`🥕 당근마켓 고속 완료: ${products.length}개`)
      return products
      
    } catch (error) {
      console.error('🥕 당근마켓 고속 오류:', error)
      return []
    } finally {
      await this.cleanup()
    }
  }
}