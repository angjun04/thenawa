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
  
  export interface SearchRequest {
    query: string
    sources?: string[]
    limit?: number
    location?: string
  }
  
  export interface SearchResponse {
    query: string
    sources: string[]
    count: number
    products: Product[]
    executionTime: number
  }
  
  export interface ProductDetailResponse {
    product: Product
    similarProducts: Product[]
    marketAnalysis: {
      marketPrice: number
      disparity: number
      disparityPercentage: number
      marketProducts: Product[]
    }
  }