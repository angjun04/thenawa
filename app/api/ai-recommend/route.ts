import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/types/product";

export const dynamic = "force-dynamic";
export const maxDuration = 10; // AI 추천은 10초 제한

interface AIRecommendRequest {
  query: string;
  products: Product[];
}

interface AIRecommendResponse {
  success: boolean;
  recommendedIds: string[];
  reasoning?: string;
  executionTime: number;
  error?: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 🔑 API Key 확인
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          recommendedIds: [],
          error:
            "OpenRouter API Key가 설정되지 않았습니다. OPENROUTER_API_KEY 환경변수를 확인해주세요.",
          executionTime: Date.now() - startTime,
        } as AIRecommendResponse,
        { status: 500 }
      );
    }

    const body: AIRecommendRequest = await request.json();
    const { query, products } = body;

    if (!query?.trim()) {
      return NextResponse.json(
        {
          success: false,
          recommendedIds: [],
          error: "검색어를 입력해주세요.",
          executionTime: Date.now() - startTime,
        } as AIRecommendResponse,
        { status: 400 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json(
        {
          success: false,
          recommendedIds: [],
          error: "분석할 상품이 없습니다.",
          executionTime: Date.now() - startTime,
        } as AIRecommendResponse,
        { status: 400 }
      );
    }

    console.log(`🤖 AI 추천 시작: "${query}", ${products.length}개 상품 분석 (Qwen3-8B)`);

    // 🔥 상품 데이터 요약 (토큰 절약)
    const productSummary = products
      .map(
        (product, index) => `${index}: ${product.title} - ${product.priceText} (${product.source})`
      )
      .join("\n");

    // 🔥 최적화된 프롬프트 (단일 최고 상품 추천)
    const prompt = `중고거래 검색 전문가로서 사용자의 검색 의도에 **가장 적합한 최고의 상품 1개**를 선별해주세요.

검색어: "${query}"

상품 목록:
${productSummary}

다음 기준으로 **가장 완벽한 1개 상품**만 선별해주세요:
1. 검색어와의 관련성 (가장 중요)
2. 가격 대비 가치 (가성비)
3. 상품 상태 및 신뢰도
4. 종합적 만족도

JSON 형태로만 응답해주세요:
{
  "recommendedIndices": [2],
  "reasoning": "이 상품을 최고로 추천하는 구체적인 이유"
}

중요: 
- 배열에는 반드시 1개 인덱스만 포함
- 인덱스는 위 상품 목록의 번호(0부터 시작)
- 가장 완벽한 상품 1개만 선택`;

    // 🔥 OpenRouter API 호출
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", // 개발 환경용
        "X-Title": "더나와 - 중고 상품 추천",
      },
      body: JSON.stringify({
        model: "qwen/qwen3-8b:free", // 빠르고 정확한 무료 모델
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API 오류: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const responseText = data.choices[0]?.message?.content || "";

    console.log(`🤖 Qwen3-8B 응답: ${responseText}`);

    // 🔥 JSON 파싱 (안전한 파싱)
    let recommendationData;
    try {
      // JSON 부분만 추출 (```json ``` 마크다운 제거)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      recommendationData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("JSON 파싱 오류:", parseError);
      return NextResponse.json(
        {
          success: false,
          recommendedIds: [],
          error: "AI 응답을 파싱할 수 없습니다.",
          executionTime: Date.now() - startTime,
        } as AIRecommendResponse,
        { status: 500 }
      );
    }

    // 🔥 추천 인덱스를 상품 ID로 변환
    const recommendedIds: string[] = [];
    const validIndices = recommendationData.recommendedIndices || [];

    for (const index of validIndices) {
      if (typeof index === "number" && index >= 0 && index < products.length) {
        recommendedIds.push(products[index].id);
      }
    }

    const executionTime = Date.now() - startTime;
    console.log(
      `🤖 AI 최고 추천 완료: ${recommendedIds.length}개 상품 선별, ${executionTime}ms 소요`
    );

    const response2: AIRecommendResponse = {
      success: true,
      recommendedIds,
      reasoning: recommendationData.reasoning || "AI가 종합 분석하여 선별한 최고의 상품입니다.",
      executionTime,
    };

    return NextResponse.json(response2);
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error(`❌ AI 추천 오류 (${executionTime}ms):`, error);

    return NextResponse.json(
      {
        success: false,
        recommendedIds: [],
        error: error instanceof Error ? error.message : "AI 추천 중 오류가 발생했습니다.",
        executionTime,
      } as AIRecommendResponse,
      { status: 500 }
    );
  }
}

// 헬스체크 엔드포인트
export async function GET() {
  const hasApiKey = !!process.env.OPENROUTER_API_KEY;

  return NextResponse.json({
    status: "ok",
    hasApiKey,
    model: "qwen/qwen3-8b:free",
    timestamp: new Date().toISOString(),
  });
}
