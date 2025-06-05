import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { productIds } = await request.json()

    if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
      return NextResponse.json(
        { error: '비교할 제품을 최소 2개 선택해주세요.' },
        { status: 400 }
      )
    }

    // Mock 비교 결과 (AI 없이 간단한 규칙 기반)
    const products = productIds.map((id: string, index: number) => ({
      id,
      valueRating: index === 0 ? 8.5 : 7.2,
      pros: index === 0 ? ["저렴한 가격", "양호한 상태"] : ["큰 용량", "최신 상태"],
      cons: index === 0 ? ["상대적으로 작은 용량"] : ["높은 가격"]
    }))

    const analysis = {
      comparison: {
        "가격": "첫 번째 제품이 더 저렴합니다",
        "상태": "두 제품 모두 양호한 상태입니다",
        "용량": "두 번째 제품이 더 큰 용량을 제공합니다"
      },
      products,
      bestValue: {
        reason: "첫 번째 제품이 가격 대비 성능이 우수합니다"
      },
      recommendations: "용량이 중요하다면 두 번째 제품을, 가격이 중요하다면 첫 번째 제품을 추천합니다"
    }

    return NextResponse.json({ analysis })

  } catch (error) {
    console.error('비교 API 오류:', error)
    return NextResponse.json(
      { error: '비교 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}