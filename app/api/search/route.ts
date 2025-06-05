import { NextRequest, NextResponse } from 'next/server'
import { DanggeunScraper } from '@/lib/scrapers/danggeun-scraper'
import { BunjangScraper } from '@/lib/scrapers/bunjang-scraper'
import { JunggonaraScraper } from '@/lib/scrapers/junggonara-scraper'
import { SearchRequest, SearchResponse, Product } from '@/types/product'

export const dynamic = "force-dynamic"
export const maxDuration = 60 // Vercel 최대 타임아웃

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

    console.log(`모바일 최적화 검색 시작: "${query}", 플랫폼: ${sources.join(', ')}`)

    // 순차 실행으로 안정성 향상 (모바일 환경에서는 병렬보다 안정적)
    const products: Product[] = []

    if (sources.includes('danggeun')) {
      try {
        console.log('당근마켓 검색 시작...')
        const scraper = new DanggeunScraper()
        const result = await scraper.searchProducts(query, Math.ceil(limit / sources.length))
        products.push(...result)
        console.log(`당근마켓 완료: ${result.length}개`)
      } catch (error) {
        console.error('당근마켓 검색 실패:', error)
      }
    }

    if (sources.includes('bunjang')) {
      try {
        console.log('번개장터 검색 시작...')
        const scraper = new BunjangScraper()
        const result = await scraper.searchProducts(query, Math.ceil(limit / sources.length))
        products.push(...result)
        console.log(`번개장터 완료: ${result.length}개`)
      } catch (error) {
        console.error('번개장터 검색 실패:', error)
      }
    }

    if (sources.includes('junggonara')) {
      try {
        console.log('중고나라 검색 시작...')
        const scraper = new JunggonaraScraper()
        const result = await scraper.searchProducts(query, Math.ceil(limit / sources.length))
        products.push(...result)
        console.log(`중고나라 완료: ${result.length}개`)
      } catch (error) {
        console.error('중고나라 검색 실패:', error)
      }
    }

    // 중복 제거 및 정렬
    const uniqueProducts = products.filter((product, index, self) => 
      index === self.findIndex(p => p.productUrl === product.productUrl)
    ).sort((a, b) => a.price - b.price)

    const executionTime = Date.now() - startTime
    console.log(`모바일 검색 완료: ${uniqueProducts.length}개 상품, ${executionTime}ms 소요`)

    const response: SearchResponse = {
      query,
      sources,
      count: uniqueProducts.length,
      products: uniqueProducts.slice(0, limit),
      executionTime
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('모바일 검색 API 오류:', error)
    return NextResponse.json(
      { 
        error: '검색 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}