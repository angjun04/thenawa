'use client'

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  MapPin, 
  ChevronDown,
  TrendingDown
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("용답동")
  const router = useRouter()


  const seoulDongs = {
    "성동구": ["용답동", "성수동", "왕십리동", "금호동", "옥수동", "행당동", "응봉동"],
    "강남구": ["역삼동", "개포동", "청담동", "삼성동", "대치동", "논현동", "압구정동"],
    "서초구": ["서초동", "잠원동", "반포동", "방배동", "양재동", "내곡동"],
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}&location=${selectedLocation}`)
    }
  }

  const priceData = [
    { name: "당근마켓", price: "920,000", isLowest: true },
    { name: "번개장터", price: "950,000", isLowest: false },
    { name: "중고나라", price: "980,000", isLowest: false },
  ]

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto max-w-4xl pt-8 pb-12 px-4">
        <div className="text-center mb-8">
          <div className="text-brand-500 font-bold text-lg mb-6">
            🔍 더나와
          </div>
        </div>

        {/* 메인 타이틀 */}
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
          여러 사이트 가격을 한번에 비교하고
          <span className="text-brand-500"> 최저가 </span>
          찾아보세요
        </h1>

        <p className="text-center text-gray-600 mb-8">
          당근마켓 · 번개장터 · 중고나라 실시간 비교
        </p>

        {/* 지역 선택 + 검색 바 */}
        <div className="mb-8">
          {/* 지역 선택 버튼 */}
          <div className="flex justify-center mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="bg-brand-50 text-brand-500 border-brand-200 hover:bg-brand-100"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {selectedLocation}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 max-h-72 overflow-y-auto">
                <DropdownMenuLabel className="text-brand-500 font-bold">
                  서울시 성동구
                </DropdownMenuLabel>
                {seoulDongs["성동구"].map((dong) => (
                  <DropdownMenuItem
                    key={dong}
                    onClick={() => setSelectedLocation(dong)}
                    className={selectedLocation === dong ? "bg-brand-50" : ""}
                  >
                    {dong}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-brand-500 font-bold">
                  서울시 강남구
                </DropdownMenuLabel>
                {seoulDongs["강남구"].map((dong) => (
                  <DropdownMenuItem
                    key={dong}
                    onClick={() => setSelectedLocation(dong)}
                    className={selectedLocation === dong ? "bg-brand-50" : ""}
                  >
                    {dong}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-brand-500 font-bold">
                  서울시 서초구
                </DropdownMenuLabel>
                {seoulDongs["서초구"].map((dong) => (
                  <DropdownMenuItem
                    key={dong}
                    onClick={() => setSelectedLocation(dong)}
                    className={selectedLocation === dong ? "bg-brand-50" : ""}
                  >
                    {dong}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* 검색 바 */}
          <form onSubmit={handleSearch} className="relative">
            <Input
              placeholder="상품명을 입력해주세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pr-12 text-lg rounded-xl border-2 focus:border-brand-500"
            />
            <Button 
              type="submit" 
              size="icon" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-brand-500 hover:bg-brand-600"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* 가격 비교 예시 */}
        <Card className="rounded-xl mb-8 border-brand-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💡 아이폰 14 Pro 실시간 가격
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {priceData.map((item, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg text-center ${
                    item.isLowest 
                      ? 'bg-brand-50 border-2 border-brand-500' 
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="text-xs text-gray-600 mb-1">
                    {item.name}
                  </div>
                  <div className={`text-lg font-bold ${
                    item.isLowest ? 'text-brand-500' : 'text-gray-900'
                  }`}>
                    {item.price}원
                  </div>
                  {item.isLowest && (
                    <Badge className="mt-2 bg-brand-500 text-white text-xs">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      최저가
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 핵심 기능 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="text-2xl mb-2">🔍</div>
            <h3 className="font-semibold mb-2">실시간 비교</h3>
            <p className="text-sm text-gray-600">
              3개 플랫폼 가격을 한눈에
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">📱</div>
            <h3 className="font-semibold mb-2">최저가 알림</h3>
            <p className="text-sm text-gray-600">
              원하는 가격이 되면 알림
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">✅</div>
            <h3 className="font-semibold mb-2">안전 거래</h3>
            <p className="text-sm text-gray-600">
              신뢰도 높은 판매자만
            </p>
          </div>
        </div>

        {/* 간단한 설명 */}
        <div className="text-center py-6">
          <p className="text-gray-600">
            검색창에 원하는 상품을 입력하고 엔터를 누르세요
          </p>
        </div>
      </div>
    </div>
  )
}