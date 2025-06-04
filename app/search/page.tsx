'use client'

import React, { Suspense } from "react"
import SearchPageContent from "./SearchPageContent"
import { Loader2 } from "lucide-react"

function SearchPageFallback() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center">
                🔍
              </div>
              <span className="text-xl font-bold text-brand-500">더나와</span>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto max-w-6xl px-4 py-12 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-brand-500 mx-auto mb-4" />
        <p>검색 페이지를 불러오는 중...</p>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchPageContent />
    </Suspense>
  )
}