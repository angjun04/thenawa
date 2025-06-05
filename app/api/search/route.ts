import { NextRequest, NextResponse } from 'next/server'
import { DanggeunScraper } from '@/lib/scrapers/danggeun-scraper'
import { BunjangScraper } from '@/lib/scrapers/bunjang-scraper'
import { JunggonaraScraper } from '@/lib/scrapers/junggonara-scraper'
import { SearchRequest, SearchResponse, Product } from '@/types/product'

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body: SearchRequest = await request.json()
    const { query, sources = ['danggeun', 'bunjang', 'junggonara'], limit = 20 } = body

    if (!query?.trim()) {
      return NextResponse.json(
        { error: '검색어를 입력해주세요.' },
        { status: 400 }
      )
    }

    console.log(`검색 시작: "${query}", 플랫폼: ${sources.join(', ')}`)

    // 검색어 확장 (첫 번째 쿼리만 사용하여 빠른 응답)
    const expandedQueries = [query] // 단순화
    console.log('검색어:', expandedQueries)

    // 병렬 스크래핑 실행
    const scrapingTasks: Promise<Product[]>[] = []

    if (sources.includes('danggeun')) {
      const scraper = new DanggeunScraper()
      scrapingTasks.push(scraper.searchProducts(query, Math.ceil(limit / sources.length)))
    }

    if (sources.includes('bunjang')) {
      const scraper = new BunjangScraper()
      scrapingTasks.push(scraper.searchProducts(query, Math.ceil(limit / sources.length)))
    }

    if (sources.includes('junggonara')) {
      const scraper = new JunggonaraScraper()
      scrapingTasks.push(scraper.searchProducts(query, Math.ceil(limit / sources.length)))
    }

    console.log(`${scrapingTasks.length}개 플랫폼에서 병렬 스크래핑 시작...`)

    const results = await Promise.allSettled(scrapingTasks)
    const products: Product[] = []

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        products.push(...result.value)
        console.log(`플랫폼 ${index + 1} 완료: ${result.value.length}개 상품`)
      } else {
        console.error(`플랫폼 ${index + 1} 실패:`, result.reason)
      }
    })

    // 중복 제거 및 정렬
    const uniqueProducts = products.filter((product, index, self) => 
      index === self.findIndex(p => p.productUrl === product.productUrl)
    ).sort((a, b) => a.price - b.price)

    const executionTime = Date.now() - startTime
    console.log(`검색 완료: ${uniqueProducts.length}개 상품, ${executionTime}ms 소요`)

    const response: SearchResponse = {
      query,
      sources,
      count: uniqueProducts.length,
      products: uniqueProducts.slice(0, limit),
      executionTime
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('검색 API 오류:', error)
    return NextResponse.json(
      { 
        error: '검색 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}