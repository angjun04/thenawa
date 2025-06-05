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
      
      console.log('당근마켓 검색 URL:', url)
      
      // 검증된 방식
      await this.page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 15000 
      })
      
      await this.page.waitForSelector('a[data-gtm="search_article"]', { 
        timeout: 15000 
      })
      
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
        const location = card.find('span.lm809sj').first().text().trim()
        
        // 🔥 대안 1: 기본 이미지 추출 시도
        let imageUrl = card.find('img').attr('src') || ''
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl
        }

        // 🔥 대안 2: 이미지가 없으면 당근마켓 기본 이미지 사용
        if (!imageUrl || imageUrl.includes('data:image/gif') || imageUrl.length < 20) {
          // 🎯 초간단 버전: 그냥 빈 문자열로 두기 (프론트엔드에서 처리)
          imageUrl = ''
          
          // 🔧 또는 외부 플레이스홀더 서비스 사용 (선택사항)
          // imageUrl = `https://via.placeholder.com/300x300/FF6B35/FFFFFF?text=${encodeURIComponent(title.substring(0, 10))}`
        }
        
        const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 0
        const relUrl = card.attr('href')
        const productUrl = relUrl ? this.baseUrl + relUrl : ''

        if (title && productUrl) {
          products.push({
            id: `danggeun_practical_${Date.now()}_${i}`,
            title,
            price,
            priceText: priceText || '가격 문의',
            location: location || '서울시',
            imageUrl,
            productUrl,
            source: 'danggeun',
            timestamp: new Date().toISOString(),
          })
          
          console.log(`${i}: ${title.substring(0, 30)}... (이미지: ${imageUrl ? 'O' : 'X'})`)
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

  // 🔥 대안 2: 간단한 플레이스홀더 이미지 생성 (btoa 문제 해결)
  private generateCarrotPlaceholder(title: string, priceText: string): string {
    // 제품명의 첫 글자를 이용한 색상 결정
    const firstChar = title.charAt(0) || '?'
    const colorIndex = firstChar.charCodeAt(0) % 6
    const colors = [
      'FF6B35', // 당근 오렌지
      'F7931E', // 진한 오렌지  
      'FFB84D', // 밝은 오렌지
      'FF8C42', // 살구색
      'FF7518', // 호박색
      'E8751A'  // 갈색 오렌지
    ]
    const bgColor = colors[colorIndex]
    
    // 🔥 Node.js 환경에서 안전한 Base64 인코딩
    const svgContent = `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="300" fill="#${bgColor}"/>
        <circle cx="150" cy="120" r="40" fill="white" opacity="0.3"/>
        <text x="150" y="130" text-anchor="middle" fill="white" font-size="32" font-weight="bold" font-family="Arial">${firstChar}</text>
        <rect x="20" y="200" width="260" height="80" rx="10" fill="white" opacity="0.9"/>
        <text x="150" y="225" text-anchor="middle" fill="#333" font-size="14" font-weight="bold" font-family="Arial">당근마켓</text>
        <text x="150" y="245" text-anchor="middle" fill="#666" font-size="12" font-family="Arial">${title.substring(0, 15)}${title.length > 15 ? '...' : ''}</text>
        <text x="150" y="265" text-anchor="middle" fill="#FF6B35" font-size="16" font-weight="bold" font-family="Arial">${priceText || '가격 문의'}</text>
      </svg>`

    // Buffer를 사용한 안전한 Base64 인코딩
    const base64Content = Buffer.from(svgContent, 'utf-8').toString('base64')
    return `data:image/svg+xml;base64,${base64Content}`
  }
}

// 🔥 대안 3: SearchPageContent.tsx에서 이미지 컴포넌트 개선
// 당근마켓 이미지가 없을 때 더 나은 UX 제공

/*
기존:
{product.imageUrl ? (
  <Image src={product.imageUrl} ... />
) : (
  <div>이미지 없음</div>  // ← 별로임
)}

개선:
<ProductImageWithFallback 
  imageUrl={product.imageUrl}
  title={product.title}
  source={product.source}
  priceText={product.priceText}
/>
*/