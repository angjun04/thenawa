import { NextRequest, NextResponse } from 'next/server'
import { ProductDetailResponse, Product } from '@/types/product'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Mock 데이터 (실제로는 DB나 캐시에서 가져옴)
    const product: Product = {
      id,
      title: "아이폰 14 Pro 128GB 딥퍼플",
      price: 920000,
      priceText: "920,000원",
      source: "danggeun",
      imageUrl: "/api/placeholder/400/300",
      productUrl: "https://example.com/1",
      location: "용답동",
      description: "아이폰 14 Pro 128GB 딥퍼플 색상입니다. 케이스와 함께 사용해서 상태 양호합니다.",
      condition: "상급",
      sellerName: "김**",
      timestamp: new Date().toISOString(),
      specs: {
        "모델명": "iPhone 14 Pro",
        "용량": "128GB",
        "색상": "딥퍼플",
        "출시년도": "2022년"
      }
    }

    const similarProducts: Product[] = [
      {
        id: "2",
        title: "아이폰 14 Pro 256GB 스페이스블랙",
        price: 1050000,
        priceText: "1,050,000원",
        source: "bunjang",
        imageUrl: "/api/placeholder/400/300",
        productUrl: "https://example.com/2",
        location: "성수동"
      }
    ]

    const marketProducts: Product[] = [
      {
        id: "market1",
        title: "아이폰 14 Pro 128GB (쿠팡)",
        price: 1200000,
        priceText: "1,200,000원",
        source: "coupang",
        imageUrl: "/api/placeholder/300/200",
        productUrl: "https://coupang.com/example"
      }
    ]

    const marketPrice = 1200000
    const disparity = marketPrice - product.price
    const disparityPercentage = (disparity / marketPrice) * 100

    const response: ProductDetailResponse = {
      product,
      similarProducts,
      marketAnalysis: {
        marketPrice,
        disparity,
        disparityPercentage,
        marketProducts
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('상품 상세 API 오류:', error)
    return NextResponse.json(
      { error: '상품 정보를 불러올 수 없습니다.' },
      { status: 500 }
    )
  }
}