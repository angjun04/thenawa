import { NextRequest, NextResponse } from 'next/server'
import { DanggeunScraper } from '@/lib/scrapers/danggeun-scraper'
import { BunjangScraper } from '@/lib/scrapers/bunjang-scraper'
import { JunggonaraScraper } from '@/lib/scrapers/junggonara-scraper'
import { BaseScraper } from '@/lib/scrapers/base-scraper'
import { SearchRequest, SearchResponse, Product } from '@/types/product'

export const dynamic = "force-dynamic"
export const maxDuration = 50

// 🔧 TypeScript 타입 정의 - 스크래퍼 생성자 타입
type ScraperConstructor = new () => BaseScraper

// 🔧 개별 스크래퍼 실행 함수 (타입 안전)
async function runScraper(
  ScraperClass: ScraperConstructor, 
  query: string, 
  limit: number
): Promise<Product[]> {
  let scraper: BaseScraper | null = null
  try {
    scraper = new ScraperClass()
    console.log(`${scraper.sourceName} 스크래핑 시작...`)
    const results = await scraper.searchProducts(query, limit)
    console.log(`${scraper.sourceName} 완료: ${results.length}개`)
    return results
  } catch (error) {
    console.error(`스크래퍼 실패:`, error)
    return []
  } finally {
    if (scraper && scraper.cleanup) {
      try {
        await scraper.cleanup()
      } catch (cleanupError) {
        console.warn('cleanup 실패:', cleanupError)
      }
    }
  }
}

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

    // 🔥 순차 실행으로 안정성 향상 + 타입 안전
    const products: Product[] = []

    if (sources.includes('danggeun')) {
      const results = await runScraper(DanggeunScraper, query, Math.ceil(limit / sources.length))
      products.push(...results)
    }

    if (sources.includes('bunjang')) {
      const results = await runScraper(BunjangScraper, query, Math.ceil(limit / sources.length))
      products.push(...results)
    }

    if (sources.includes('junggonara')) {
      const results = await runScraper(JunggonaraScraper, query, Math.ceil(limit / sources.length))
      products.push(...results)
    }

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