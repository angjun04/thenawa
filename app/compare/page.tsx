'use client'

import React, { Suspense } from "react"
import ComparisonPageContent from "./ComparisonPageContent"
import { Loader2 } from "lucide-react"

function ComparisonPageFallback() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 text-center">
      <Loader2 className="w-12 h-12 animate-spin text-brand-500 mx-auto mb-4" />
      <p>페이지를 불러오는 중...</p>
    </div>
  )
}

export default function ComparisonPage() {
  return (
    <Suspense fallback={<ComparisonPageFallback />}>
      <ComparisonPageContent />
    </Suspense>
  )
}