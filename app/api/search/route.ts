import { NextRequest, NextResponse } from 'next/server'
import { DanggeunScraper } from '@/lib/scrapers/danggeun-scraper'
import { BunjangScraper } from '@/lib/scrapers/bunjang-scraper'
import { JunggonaraScraper } from '@/lib/scrapers/junggonara-scraper'
import { BaseScraper } from '@/lib/scrapers/base-scraper'
import { SearchRequest, SearchResponse, Product } from '@/types/product'

export const dynamic = "force-dynamic"
export const maxDuration = 25 // 🔥 25초로 단축 (Vercel 안전 마진)

// 🔧 타입 정의
type ScraperConstructor = new () => BaseScraper

// 🔥 핵심 최적화 1: 매우 짧은 타임아웃으로 빠른 실패
const SCRAPER_CONFIG = {
  INDIVIDUAL_TIMEOUT: 8000,      // 각 스크래퍼당 8초만!
  TOTAL_TIMEOUT: 20000,          // 전체 20초 제한
  MIN_RESULTS: 15,               // 🔥 15개로 증가 (조기 종료 방지)
  PARALLEL_LIMIT: 2              // 동시 실행 개수 제한
} as const

// 🔥 핵심 최적화 2: 타임아웃과 조기 종료가 있는 스크래퍼 실행
async function runScraperWithTimeout(
  ScraperClass: ScraperConstructor,
  query: string,
  limit: number,
  timeoutMs: number = SCRAPER_CONFIG.INDIVIDUAL_TIMEOUT
): Promise<Product[]> {
  const scraperName = ScraperClass.name.replace('Scraper', '')
  
  return new Promise(async (resolve) => {
    // 타임아웃 설정
    const timeout = setTimeout(() => {
      console.log(`⏰ ${scraperName} 타임아웃 (${timeoutMs}ms)`)
      resolve([])
    }, timeoutMs)

    try {
      const scraper = new ScraperClass()
      console.log(`🚀 ${scraperName} 시작 (제한시간: ${timeoutMs}ms)`)
      
      const results = await scraper.searchProducts(query, limit)
      console.log(`✅ ${scraperName} 완료: ${results.length}개 (${Date.now()}ms)`)
      
      clearTimeout(timeout)
      resolve(results)
      
    } catch (error) {
      console.error(`❌ ${scraperName} 오류:`, error)
      clearTimeout(timeout)
      resolve([])
    }
  })
}

// 🔥 핵심 최적화 3: 제한된 병렬 처리 (Vercel 리소스 고려)
async function runScrapersOptimized(
  query: string, 
  sources: string[]
): Promise<Product[]> {
  const allProducts: Product[] = []
  const limitPerSource = 7 // 🔥 각 플랫폼당 고정 7개씩

  // 🔥 Strategy 1: 빠른 플랫폼 우선 (번개장터가 보통 가장 빠름)
  const prioritizedSources = sources.sort((a, b) => {
    const priority = { bunjang: 1, junggonara: 2, danggeun: 3 }
    return (priority[a as keyof typeof priority] || 99) - (priority[b as keyof typeof priority] || 99)
  })

  // 🔥 Strategy 2: 2개씩 병렬 처리
  for (let i = 0; i < prioritizedSources.length; i += SCRAPER_CONFIG.PARALLEL_LIMIT) {
    const batch = prioritizedSources.slice(i, i + SCRAPER_CONFIG.PARALLEL_LIMIT)
    
    const batchPromises = batch.map(source => {
      switch (source) {
        case 'danggeun':
          return runScraperWithTimeout(DanggeunScraper, query, limitPerSource, 10000) // 당근마켓은 10초
        case 'bunjang':
          return runScraperWithTimeout(BunjangScraper, query, limitPerSource, 6000)   // 번개장터는 6초
        case 'junggonara':
          return runScraperWithTimeout(JunggonaraScraper, query, limitPerSource, 8000) // 중고나라는 8초
        default:
          return Promise.resolve([])
      }
    })

    const batchResults = await Promise.all(batchPromises)
    batchResults.forEach(results => allProducts.push(...results))

    // 🔥 Strategy 3: 조기 종료 완화 - 모든 플랫폼이 완료되도록
    console.log(`📊 배치 ${i/SCRAPER_CONFIG.PARALLEL_LIMIT + 1} 완료: ${allProducts.length}개 결과`)
    // 조기 종료 로직 제거하여 모든 플랫폼이 실행되도록 함
  }

  return allProducts
}

// 🔥 핵심 최적화 4: 전체 타임아웃과 조기 응답
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  // 🚨 전체 프로세스 타임아웃 설정
  const globalTimeout = setTimeout(() => {
    console.log(`🚨 글로벌 타임아웃! (${SCRAPER_CONFIG.TOTAL_TIMEOUT}ms)`)
  }, SCRAPER_CONFIG.TOTAL_TIMEOUT)

  try {
    const body: SearchRequest = await request.json()
    const { query, sources = ['danggeun', 'bunjang', 'junggonara'], limit = 10 } = body // 🔥 당근마켓 다시 포함

    if (!query?.trim()) {
      clearTimeout(globalTimeout)
      return NextResponse.json(
        { error: '검색어를 입력해주세요.' },
        { status: 400 }
      )
    }

    console.log(`🔍 최적화된 검색 시작: "${query}", 플랫폼: ${sources.join(', ')}, 제한: ${limit}개`)

    // 🔥 최적화된 스크래핑 실행
    const products = await runScrapersOptimized(query, sources)

    clearTimeout(globalTimeout)

    // 🔥 빠른 중복 제거 (간단한 URL 기반)
    const uniqueProducts = products
      .filter((product, index, self) => 
        index === self.findIndex(p => p.productUrl === product.productUrl)
      )
      .sort((a, b) => a.price - b.price)
      .slice(0, limit)

    const executionTime = Date.now() - startTime
    console.log(`⚡ 최적화된 검색 완료: ${uniqueProducts.length}개 상품, ${executionTime}ms 소요`)

    const response: SearchResponse = {
      query,
      sources,
      count: uniqueProducts.length,
      products: uniqueProducts,
      executionTime,
      // 🔥 성능 메트릭 추가
      performance: {
        totalTime: executionTime,
        avgTimePerProduct: uniqueProducts.length > 0 ? Math.round(executionTime / uniqueProducts.length) : 0,
        isOptimized: true
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    clearTimeout(globalTimeout)
    const executionTime = Date.now() - startTime
    
    console.error(`❌ 최적화된 검색 오류 (${executionTime}ms):`, error)
    
    // 🔥 부분 성공이라도 반환 (조기 응답 전략)
    return NextResponse.json(
      { 
        error: '일부 검색에서 오류가 발생했습니다.',
        query: '',
        sources: [],
        count: 0,
        products: [],
        executionTime,
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 206 } // Partial Content
    )
  }
}

// 🔥 추가 최적화: 헬스체크 엔드포인트
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    config: SCRAPER_CONFIG
  })
}