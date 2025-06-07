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
    // 🔑 API Key 체크 및 디버깅
    const apiKey = process.env.OPENROUTER_API_KEY;
    const hasApiKey = !!apiKey;
    console.log(`🔑 API Key loaded: ${hasApiKey ? "YES" : "NO"}`);
    console.log(`🔑 API Key starts with: ${apiKey?.substring(0, 12)}...`);
    console.log(`🔑 API Key length: ${apiKey?.length}`);
    console.log(
      `🔑 Full environment keys:`,
      Object.keys(process.env).filter((k) => k.includes("OPENROUTER"))
    );

    if (!hasApiKey) {
      return NextResponse.json(
        {
          success: false,
          recommendedIds: [],
          error: "OpenRouter API 키가 설정되지 않았습니다.",
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
          error: "Please enter a search query.",
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
          error: "No products to analyze.",
          executionTime: Date.now() - startTime,
        } as AIRecommendResponse,
        { status: 400 }
      );
    }

    console.log(`🤖 AI 추천 시작: "${query}", ${products.length}개 상품 분석 (Qwen3 8B)`);

    // 🔥 상품 데이터 요약 (토큰 절약)
    const productSummary = products
      .map(
        (product, index) => `${index}: ${product.title} - ${product.priceText} (${product.source})`
      )
      .join("\n");

    // 🔥 최적화된 프롬프트 (단일 최고 상품 추천)
    const prompt = `You are a product recommendation expert for Korean secondhand marketplaces.

Search Query: "${query}"

Product List:
${productSummary}

Select the BEST 1 product based on:
1. Relevance to search query (most important)
2. Price-value ratio
3. Product condition and reliability
4. Overall satisfaction potential

Respond ONLY in JSON format:
{
  "recommendedIndices": [2],
  "reasoning": "Specific reason why this product is the best choice"
}

Important: 
- Array must contain exactly 1 index
- Index is the product number from the list above (starting from 0)
- Select only the most perfect product`;

    // 🔥 OpenRouter API 호출
    console.log(`🚀 Making OpenRouter request to: https://openrouter.ai/api/v1/chat/completions`);
    console.log(`🚀 Model: meta-llama/llama-3.1-8b-instruct:free`);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://thenawa.vercel.app",
        "X-Title": "TheNawa Product Search",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
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

    console.log(`📥 OpenRouter response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ OpenRouter error response: ${errorText}`);
      throw new Error(`OpenRouter API 오류: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const responseText = data.choices[0]?.message?.content || "";

    console.log(`🤖 Qwen3 8B 응답: ${responseText}`);

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
          error: "Cannot parse AI response.",
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
      reasoning:
        recommendationData.reasoning || "AI-selected best product based on comprehensive analysis.",
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
        error: error instanceof Error ? error.message : "Error occurred during AI recommendation.",
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
    model: "meta-llama/llama-3.1-8b-instruct:free",
    timestamp: new Date().toISOString(),
  });
}
