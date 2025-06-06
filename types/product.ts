// 🔥 기본 Product 인터페이스
export interface Product {
    id: string
    title: string
    price: number
    priceText: string
    source: 'danggeun' | 'bunjang' | 'junggonara' | 'coupang'
    imageUrl: string
    productUrl: string
    location?: string
    description?: string
    condition?: string
    sellerName?: string
    timestamp?: string
    specs?: Record<string, string>
  }
  
  // 🔥 검색 요청 인터페이스
  export interface SearchRequest {
    query: string
    sources?: string[]
    limit?: number
    location?: string
    forceRefresh?: boolean  // 캐시 무시 옵션
  }
  
  // 🔥 성능 메트릭 인터페이스 (최적화된 API용)
  export interface PerformanceMetrics {
    totalTime: number
    avgTimePerProduct: number
    isOptimized: boolean
    scraperTimings?: Record<string, number>  // 각 스크래퍼별 소요 시간
    cacheHit?: boolean                       // 캐시 히트 여부
  }
  
  // 🔥 검색 응답 인터페이스 (성능 메트릭 포함)
  export interface SearchResponse {
    query: string
    sources: string[]
    count: number
    products: Product[]
    executionTime: number
    performance?: PerformanceMetrics  // 선택적 성능 정보
    warnings?: string[]               // 부분 실패 시 경고 메시지
    cached?: boolean                  // 캐시된 결과인지 여부
    timestamp?: string                // 응답 생성 시각
  }
  
  // 🔥 상품 상세 응답 인터페이스
  export interface ProductDetailResponse {
    product: Product
    similarProducts: Product[]
    marketAnalysis: {
      marketPrice: number
      disparity: number
      disparityPercentage: number
      marketProducts: Product[]
      priceRange: {
        min: number
        max: number
        avg: number
      }
      recommendations: string[]  // 가격 추천 메시지
    }
    fetchedAt: string  // 데이터 조회 시점
  }
  
  // 🔥 비교 분석 인터페이스
  export interface ComparisonResponse {
    products: Product[]
    analysis: {
      cheapest: Product
      mostExpensive: Product
      priceRange: {
        min: number
        max: number
        avg: number
      }
      recommendations: {
        bestValue: Product
        quickSale: Product
        reasons: Record<string, string>
      }
    }
    generatedAt: string
  }
  
  // 🔥 에러 응답 인터페이스
  export interface ErrorResponse {
    error: string
    details?: string
    code?: string
    timestamp?: string
    query?: string
    sources?: string[]
  }
  
  // 🔥 스크래퍼 상태 인터페이스
  export interface ScraperStatus {
    name: string
    isAvailable: boolean
    averageResponseTime: number
    lastChecked: string
    errorRate: number
  }
  
  // 🔥 시스템 상태 응답
  export interface HealthCheckResponse {
    status: 'ok' | 'degraded' | 'down'
    timestamp: string
    scrapers: ScraperStatus[]
    performance: {
      avgSearchTime: number
      successRate: number
      totalSearches: number
    }
    config: {
      maxTimeout: number
      defaultLimit: number
      enabledSources: string[]
    }
  }
  
  // 🔥 캐시 관련 인터페이스
  export interface CacheInfo {
    key: string
    createdAt: string
    expiresAt: string
    size: number
    hitCount: number
  }
  
  export interface CacheStats {
    totalEntries: number
    totalSize: number
    hitRate: number
    oldestEntry: string
    newestEntry: string
    topQueries: Array<{ query: string; hits: number }>
  }
  
  // 🔥 타입 가드 함수들
  export function isProduct(obj: any): obj is Product {
    return (
      typeof obj === 'object' &&
      typeof obj.id === 'string' &&
      typeof obj.title === 'string' &&
      typeof obj.price === 'number' &&
      typeof obj.priceText === 'string' &&
      ['danggeun', 'bunjang', 'junggonara', 'coupang'].includes(obj.source) &&
      typeof obj.imageUrl === 'string' &&
      typeof obj.productUrl === 'string'
    )
  }
  
  export function isSearchResponse(obj: any): obj is SearchResponse {
    return (
      typeof obj === 'object' &&
      typeof obj.query === 'string' &&
      Array.isArray(obj.sources) &&
      typeof obj.count === 'number' &&
      Array.isArray(obj.products) &&
      typeof obj.executionTime === 'number' &&
      obj.products.every(isProduct)
    )
  }
  
  export function isErrorResponse(obj: any): obj is ErrorResponse {
    return (
      typeof obj === 'object' &&
      typeof obj.error === 'string'
    )
  }
  
  // 🔥 유틸리티 타입들
  export type SourceName = Product['source']
  export type SortOption = 'price_asc' | 'price_desc' | 'date_desc' | 'popularity'
  export type FilterOptions = {
    minPrice?: number
    maxPrice?: number
    sources?: SourceName[]
    location?: string
    condition?: string
  }
  
  // 🔥 상수 정의
  export const SOURCES = {
    DANGGEUN: 'danggeun' as const,
    BUNJANG: 'bunjang' as const,
    JUNGGONARA: 'junggonara' as const,
    COUPANG: 'coupang' as const,
  } as const
  
  export const DEFAULT_SEARCH_CONFIG = {
    LIMIT: 10,
    TIMEOUT: 25000,
    SOURCES: [SOURCES.DANGGEUN, SOURCES.BUNJANG, SOURCES.JUNGGONARA], // 🔥 당근마켓 다시 포함
    CACHE_TTL: 300000, // 5분
  } as const
  
  // 🔥 에러 코드 상수
  export const ERROR_CODES = {
    INVALID_QUERY: 'INVALID_QUERY',
    TIMEOUT: 'TIMEOUT',
    SCRAPER_ERROR: 'SCRAPER_ERROR',
    RATE_LIMIT: 'RATE_LIMIT',
    INVALID_SOURCE: 'INVALID_SOURCE',
  } as const