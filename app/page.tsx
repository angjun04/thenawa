'use client'

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search,
  Smartphone,
  Laptop,
  Gamepad2,
  Home,
  Car,
  Shirt
} from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}&location=용답동`)
    }
  }

  const handleCategorySearch = (category: string) => {
    router.push(`/search?q=${encodeURIComponent(category)}&location=용답동`)
  }

  const popularCategories = [
    { icon: <Smartphone className="w-6 h-6" />, name: "스마트폰", search: "아이폰" },
    { icon: <Laptop className="w-6 h-6" />, name: "노트북", search: "노트북" },
    { icon: <Gamepad2 className="w-6 h-6" />, name: "게임", search: "게임기" },
    { icon: <Home className="w-6 h-6" />, name: "가전제품", search: "가전" },
    { icon: <Car className="w-6 h-6" />, name: "자동차", search: "자동차" },
    { icon: <Shirt className="w-6 h-6" />, name: "의류", search: "옷" }
  ]

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-orange-50 min-h-screen">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center">
                🔍
              </div>
              <span className="text-2xl font-bold text-brand-500">더나와</span>
            </div>
            <nav className="hidden md:flex gap-6">
              <Button variant="ghost" className="text-gray-600">
                검색
              </Button>
              <Button variant="ghost" className="text-gray-600">
                비교
              </Button>
              <Button variant="ghost" className="text-gray-600">
                도움말
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* 히어로 섹션 */}
        <section className="py-20">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              중고거래, 이제 
              <span className="text-brand-500"> 한 번에</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              당근마켓, 번개장터, 중고나라를 동시에 검색하고 
              AI가 추천하는 최적의 상품을 찾아보세요
            </p>

            {/* 검색 바 */}
            <form onSubmit={handleSearch} className="mb-8">
              <div className="relative max-w-2xl mx-auto">
                <Input
                  placeholder="찾고 있는 상품을 검색해보세요 (예: 아이폰 14, 갤럭시, 맥북)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-16 text-lg pr-16 rounded-2xl border-2 border-gray-200 focus:border-brand-500 shadow-lg"
                />
                <Button 
                  type="submit" 
                  size="lg"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-brand-500 hover:bg-brand-600 rounded-xl"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </form>

            {/* 인기 카테고리 */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {popularCategories.map((category, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleCategorySearch(category.search)}
                  className="flex items-center gap-2 rounded-full border-gray-200 hover:border-brand-300 hover:bg-brand-50"
                >
                  {category.icon}
                  {category.name}
                </Button>
              ))}
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-500 mb-2">3개</div>
                <div className="text-gray-600">연동 플랫폼</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-500 mb-2">실시간</div>
                <div className="text-gray-600">검색 결과</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-500 mb-2">AI</div>
                <div className="text-gray-600">가격 분석</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center">
                  🔍
                </div>
                <span className="text-xl font-bold">더나와</span>
              </div>
              <p className="text-gray-400 text-sm">
                중고거래의 새로운 패러다임을 제시합니다
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">서비스</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>통합검색</li>
                <li>가격비교</li>
                <li>AI 분석</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">지원</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>도움말</li>
                <li>문의하기</li>
                <li>피드백</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">연동 플랫폼</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-gray-400 border-gray-600">
                  당근마켓
                </Badge>
                <Badge variant="outline" className="text-gray-400 border-gray-600">
                  번개장터
                </Badge>
                <Badge variant="outline" className="text-gray-400 border-gray-600">
                  중고나라
                </Badge>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 더나와. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}