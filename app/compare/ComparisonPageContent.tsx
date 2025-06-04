'use client'

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft,
  Loader2,
  Star,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import { getSourceName, getSourceColor } from "@/lib/utils"

// 타입 정의 (동일)
interface Product {
  id: string
  title: string
  price: number
  priceText: string
  source: string
  imageUrl: string
  productUrl: string
}

interface ProductAnalysis {
  id: string
  valueRating: number
  pros: string[]
  cons: string[]
}

interface ComparisonAnalysis {
  comparison: Record<string, string>
  products: ProductAnalysis[]
  bestValue: {
    reason: string
  }
  recommendations: string
}

// Mock API functions (동일)
const getProductById = async (id: string): Promise<Product> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const mockProducts: Record<string, Product> = {
    "1": {
      id: "1",
      title: "아이폰 14 Pro 128GB 딥퍼플",
      price: 920000,
      priceText: "920,000원",
      source: "danggeun",
      imageUrl: "/api/placeholder/400/300",
      productUrl: "https://example.com/1",
    },
    "2": {
      id: "2",
      title: "아이폰 14 Pro 256GB 스페이스블랙",
      price: 1050000,
      priceText: "1,050,000원",
      source: "bunjang",
      imageUrl: "/api/placeholder/400/300",
      productUrl: "https://example.com/2",
    }
  }
  
  return mockProducts[id] || mockProducts["1"]
}

const compareTechProducts = async (productIds: string[]): Promise<{ analysis: ComparisonAnalysis }> => {
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  return {
    analysis: {
      comparison: {
        "가격": "첫 번째 제품이 더 저렴합니다",
        "상태": "두 제품 모두 양호한 상태입니다", 
        "용량": "두 번째 제품이 더 큰 용량을 제공합니다"
      },
      products: productIds.map((id, index) => ({
        id,
        valueRating: index === 0 ? 8.5 : 7.2,
        pros: index === 0 ? ["저렴한 가격", "양호한 상태"] : ["큰 용량", "최신 상태"],
        cons: index === 0 ? ["상대적으로 작은 용량"] : ["높은 가격"]
      })),
      bestValue: {
        reason: "첫 번째 제품이 가격 대비 성능이 우수합니다"
      },
      recommendations: "용량이 중요하다면 두 번째 제품을, 가격이 중요하다면 첫 번째 제품을 추천합니다"
    }
  }
}

export default function ComparisonPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const productIds = (searchParams.get("ids") || "").split(",").filter(Boolean)
  
  const [products, setProducts] = useState<Product[]>([])
  const [analysis, setAnalysis] = useState<ComparisonAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (productIds.length < 2) {
      setError("비교할 제품을 최소 2개 선택해주세요.")
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      // 제품 정보 가져오기
      const productPromises = productIds.map(id => getProductById(id))
      const fetchedProducts = await Promise.all(productPromises)
      setProducts(fetchedProducts)
      
      // AI 비교 분석
      const comparisonResult = await compareTechProducts(productIds)
      setAnalysis(comparisonResult.analysis)
    } catch (err) {
      setError("비교 분석을 불러오는데 실패했습니다."+err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [productIds.join(",")]) // 의존성 배열 최적화

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-12 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-brand-500 mx-auto mb-4" />
        <p>제품을 비교 분석하는 중...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="text-center">
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto max-w-6xl px-4 py-6">
        {/* 뒤로가기 버튼 */}
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>

        <h1 className="text-3xl font-bold mb-8">제품 비교</h1>

        {/* 제품 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {products.map((product) => (
            <Card key={product.id} className="rounded-xl">
              <div className="aspect-video bg-gray-100 rounded-t-xl overflow-hidden">
                <img 
                  src={product.imageUrl} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <Badge 
                  className="mb-2 text-white"
                  style={{ backgroundColor: getSourceColor(product.source) }}
                >
                  {getSourceName(product.source)}
                </Badge>
                <h3 className="text-xl font-semibold mb-2">{product.title}</h3>
                <p className="text-2xl font-bold text-brand-500">{product.priceText}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI 분석 결과 */}
        {analysis && (
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                🤖 AI 비교 분석
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 전체 비교 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">📊 종합 비교</h3>
                <div className="space-y-3">
                  {Object.entries(analysis.comparison).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-4">
                      <div className="font-medium text-brand-600 mb-1">{key}</div>
                      <div className="text-gray-700">{value as string}</div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* 개별 제품 분석 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">🎯 개별 제품 분석</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analysis.products.map((productAnalysis: ProductAnalysis, index: number) => {
                    const product = products[index]
                    if (!product) return null
                    
                    return (
                      <Card key={productAnalysis.id} className="border-2">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium truncate">{product.title}</h4>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-500 mr-1" />
                              <span className="font-bold">{productAnalysis.valueRating}/10</span>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center text-green-600 text-sm font-medium mb-1">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                장점
                              </div>
                              <div className="text-sm text-gray-700">
                                {productAnalysis.pros.join(", ")}
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex items-center text-red-600 text-sm font-medium mb-1">
                                <TrendingDown className="w-3 h-3 mr-1" />
                                단점
                              </div>
                              <div className="text-sm text-gray-700">
                                {productAnalysis.cons.join(", ")}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              <Separator />

              {/* 최고 가성비 제품 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">🏆 최고 가성비</h3>
                <Alert className="bg-yellow-50 border-yellow-200">
                  <Star className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <div className="font-medium mb-1">추천 제품</div>
                    <div>{analysis.bestValue.reason}</div>
                  </AlertDescription>
                </Alert>
              </div>

              <Separator />

              {/* 구매 추천 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">💡 구매 가이드</h3>
                <div className="bg-brand-50 rounded-lg p-4 text-brand-800">
                  {analysis.recommendations}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}