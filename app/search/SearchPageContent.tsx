'use client'

import React, { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Search, 
  MapPin, 
  Settings,
  ArrowUpDown,
  Eye,
  Plus,
  Loader2
} from "lucide-react"
import { formatPrice, getSourceName, getSourceColor } from "@/lib/utils"

// Product 타입 정의 (검색 페이지용, id로 변경)
interface Product {
  id: string
  title: string
  price: number
  priceText: string
  source: string
  imageUrl: string
  productUrl: string
  location?: string
}

interface SearchResponse {
  products: Product[]
}

// Mock API function (검색 API, id로 수정)
const searchProducts = async (
    query: string, 
    sources: string[], 
    minPrice: number, 
    maxPrice: number
  ): Promise<SearchResponse> => {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, sources, limit: 20 })
    })
  
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || '검색 중 오류가 발생했습니다.')
    }
  
    const data = await response.json()
    
    // 가격 필터링
    const filteredProducts = data.products.filter((product: Product) => 
      product.price >= minPrice && product.price <= maxPrice
    )
  
    return { ...data, products: filteredProducts, count: filteredProducts.length }
}

export default function SearchPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const queryFromUrl = searchParams.get("q") || ""
  const locationFromUrl = searchParams.get("location") || "용답동"

  const [searchQuery, setSearchQuery] = useState(queryFromUrl)
  const [selectedLocation] = useState(locationFromUrl)
  const [keywordFilter, setKeywordFilter] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [priceRange, setPriceRange] = useState([0, 1000000])
  const [selectedSources, setSelectedSources] = useState([
    "danggeun",
    "bunjang", 
    "junggonara",
  ])
  const [sortBy, setSortBy] = useState("price_asc")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const tabs = [
    { id: "all", label: "전체", emoji: "🔍", value: null },
    { id: "danggeun", label: "당근마켓", emoji: "🥕", value: "danggeun" },
    { id: "bunjang", label: "번개장터", emoji: "⚡", value: "bunjang" },
    { id: "junggonara", label: "중고나라", emoji: "💼", value: "junggonara" },
  ]

  const doSearch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await searchProducts(
        searchQuery,
        selectedSources,
        priceRange[0],
        priceRange[1]
      )
      setProducts(result.products)
      setSelectedIds([])
    } catch (e) {
      setError("검색 중 오류가 발생했습니다."+e)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedSources, priceRange])

  const handleSearch = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}&location=${selectedLocation}`)
      doSearch()
    }
  }, [searchQuery, selectedLocation, router, doSearch])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id)
        : [...prev, id]
    )
  }, [])

  const goCompare = useCallback(() => {
    router.push(`/compare?ids=${selectedIds.join(",")}`)
  }, [router, selectedIds])

  const handleSourcesChange = useCallback((value: string) => {
    const newSources = value.split(',').filter(Boolean)
    setSelectedSources(newSources)
  }, [])

  // 필터링 및 정렬
  const tokens = keywordFilter.split(/[,\s]+/).filter(t => t)
  const includeKeys = tokens.filter(t => t.startsWith("+")).map(t => t.slice(1))
  const excludeKeys = tokens.filter(t => t.startsWith("-")).map(t => t.slice(1))

  const filtered = products
    .filter(p => activeTab === "all" ? true : p.source === activeTab)
    .filter(p => selectedSources.includes(p.source))
    .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    .filter(p => includeKeys.every(k => p.title.includes(k)))
    .filter(p => excludeKeys.every(k => !p.title.includes(k)))

  const sorted = [...filtered].sort((a, b) =>
    sortBy === "price_asc" ? a.price - b.price : b.price - a.price
  )

  // useEffect 의존성 배열 최적화
  useEffect(() => {
    if (queryFromUrl) {
      doSearch()
    }
  }, [queryFromUrl, doSearch])

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 헤더 섹션 */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between mb-6">
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => router.push("/")}
            >
              <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center">
                🔍
              </div>
              <span className="text-xl font-bold text-brand-500">더나와</span>
            </div>
            
            <Badge variant="outline" className="text-brand-500 border-brand-200">
              <MapPin className="w-3 h-3 mr-1" />
              {selectedLocation}
            </Badge>
          </div>

          {/* 검색 바 */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-8">
                <div className="relative">
                  <Input
                    placeholder="찾고 있는 상품을 검색해보세요"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 pr-12 rounded-xl border-2 focus:border-brand-500"
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-brand-500 hover:bg-brand-600"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="md:col-span-2">
                <Button
                  onClick={doSearch}
                  disabled={loading}
                  className="w-full h-12 bg-brand-500 hover:bg-brand-600 rounded-xl"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "검색"}
                </Button>
              </div>
              <div className="md:col-span-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full h-12 border-brand-200 text-brand-500 hover:bg-brand-50 rounded-xl"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  필터
                </Button>
              </div>
            </div>
          </form>

          {/* 비교 버튼 */}
          {selectedIds.length >= 2 && (
            <div className="mb-4">
              <Button
                onClick={goCompare}
                className="bg-red-500 hover:bg-red-600 rounded-xl"
              >
                <ArrowUpDown className="w-4 h-4 mr-2" />
                상품 비교하기 ({selectedIds.length}개)
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-6">
        {/* 플랫폼 탭 */}
        <Card className="rounded-xl mb-6 border-brand-200">
          <CardContent className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="data-[state=active]:bg-brand-100 data-[state=active]:text-brand-700"
                  >
                    <span className="mr-2">{tab.emoji}</span>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* 필터 섹션 */}
        {showFilters && (
          <Card className="rounded-xl mb-6 border-brand-200">
            <CardHeader>
              <CardTitle className="text-brand-500">
                🎛️ 세부 필터
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">검색 대상 플랫폼</label>
                  <Select 
                    value={selectedSources.join(',')} 
                    onValueChange={handleSourcesChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="플랫폼 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="danggeun">🥕 당근마켓</SelectItem>
                      <SelectItem value="bunjang">⚡ 번개장터</SelectItem>
                      <SelectItem value="junggonara">💼 중고나라</SelectItem>
                      <SelectItem value="danggeun,bunjang,junggonara">모든 플랫폼</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">정렬 기준</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price_asc">💰 가격 낮은 순</SelectItem>
                      <SelectItem value="price_desc">💎 가격 높은 순</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    💵 가격 범위: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={1000000}
                    step={10000}
                    className="mt-2"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">🔍 키워드 필터</label>
                <Input
                  placeholder="+포함할키워드, -제외할키워드 (쉼표로 구분)"
                  value={keywordFilter}
                  onChange={(e) => setKeywordFilter(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  + 기호로 포함할 키워드, - 기호로 제외할 키워드를 지정하세요
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 검색 결과 */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-brand-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">검색 중입니다...</h3>
          </div>
        ) : error ? (
          <Card className="rounded-xl border-red-200">
            <CardContent className="p-6 text-center">
              <div className="text-red-500 mb-2">❌</div>
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 검색 결과 헤더 */}
            {sorted.length > 0 && (
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  📦 검색 결과 ({sorted.length}개)
                </h2>
                <p className="text-sm text-gray-600">
                  {selectedLocation}에서 검색한 결과입니다
                </p>
              </div>
            )}

            {/* 상품 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map((product) => (
                <Card
                  key={product.id}
                  className={`rounded-xl border-2 transition-all hover:scale-105 hover:shadow-lg ${
                    selectedIds.includes(product.id)
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-gray-200 hover:border-brand-300'
                  }`}
                >
                  <div className="aspect-video bg-gray-100 rounded-t-xl overflow-hidden relative">
                    <Image 
                      src={product.imageUrl} 
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <CardContent className="p-4">
                    <Badge 
                      className="mb-2"
                      style={{ 
                        backgroundColor: getSourceColor(product.source),
                        color: '#fff'
                      }}
                    >
                      {getSourceName(product.source)}
                    </Badge>
                    <h3 className="font-semibold mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-xl font-bold text-brand-500">
                      {product.priceText}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(product.productUrl)}
                      className="text-brand-500 border-brand-200 hover:bg-brand-50"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      보기
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedIds.includes(product.id) ? "default" : "outline"}
                      onClick={() => toggleSelect(product.id)}
                      className={
                        selectedIds.includes(product.id)
                          ? "bg-brand-500 hover:bg-brand-600"
                          : "text-brand-500 border-brand-200 hover:bg-brand-50"
                      }
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {selectedIds.includes(product.id) ? "선택됨" : "선택"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/product/${product.id}`)}
                      className="text-brand-500 border-brand-200 hover:bg-brand-50"
                    >
                      상세
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* 검색 결과 없음 */}
            {sorted.length === 0 && !loading && (
                <div className="text-center py-12">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold mb-2">검색 결과가 없습니다</h3>
                    <p className="text-gray-600 mb-4">
                    `{searchQuery}` 에 대한 검색 결과를 찾을 수 없습니다.
                    </p>
                    <div className="text-sm text-gray-500">
                    <p>• 다른 키워드로 검색해보세요</p>
                    <p>• 검색어의 맞춤법을 확인해보세요</p>
                    <p>• 더 간단한 키워드를 사용해보세요</p>
                    </div>
                </div>
                )}
          </>
        )}
      </div>
    </div>
  )
}