import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    console.log(params+request.url)
  try {

    // 실제 데이터가 없으므로 404 반환
    return NextResponse.json(
      { error: '상품을 찾을 수 없습니다.' },
      { status: 404 }
    )

  } catch (error) {
    console.error('상품 상세 API 오류:', error)
    return NextResponse.json(
      { error: '상품 정보를 불러올 수 없습니다.' },
      { status: 500 }
    )
  }
}