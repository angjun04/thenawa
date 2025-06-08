import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("🧪 Test search request:", body);

    // Make the actual search request
    const searchResponse = await fetch(`${request.nextUrl.origin}/api/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await searchResponse.json();

    console.log("🧪 Test search response:", {
      count: data.count,
      sources: data.sources,
      executionTime: data.executionTime,
      sourceBreakdown:
        data.products?.reduce((acc: Record<string, number>, p: { source: string }) => {
          acc[p.source] = (acc[p.source] || 0) + 1;
          return acc;
        }, {}) || {},
    });

    return NextResponse.json({
      success: true,
      originalData: data,
      analysis: {
        totalProducts: data.products?.length || 0,
        sourceBreakdown:
          data.products?.reduce((acc: Record<string, number>, p: { source: string }) => {
            acc[p.source] = (acc[p.source] || 0) + 1;
            return acc;
          }, {}) || {},
        executionTime: data.executionTime,
      },
    });
  } catch (error) {
    console.error("🧪 Test search error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
