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

    // 실제 제품 데이터가 없으므로 에러 반환
    return NextResponse.json(
      { error: '비교 기능은 현재 개발 중입니다.' },
      { status: 501 }
    )

  } catch (error) {
    console.error('비교 API 오류:', error)
    return NextResponse.json(
      { error: '비교 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}