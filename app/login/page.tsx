'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Topbar from '@/components/Topbar'
import { 
  Mail, 
  Lock, 
  Loader2,
  Eye,
  EyeOff,
  Search,
  ShoppingBag,
  Users
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.')
      return
    }

    setLoading(true)
    
    // 실제 로그인 로직 구현
    try {
      // API 호출 예시
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 성공 시 홈으로 이동
      router.push('/')
    } catch (err) {
      setError('로그인에 실패했습니다. 다시 시도해주세요.')
      console.error(err);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-orange-50 min-h-screen">
      <Topbar />

      <main className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 좌측: 서비스 소개 */}
          <div className="hidden lg:block">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              중고거래의 모든 것,<br />
              <span className="text-brand-500">더나와</span>에서 시작하세요
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              당근마켓, 번개장터, 중고나라를 한 번에 검색하고
              AI가 추천하는 최적의 상품을 찾아보세요.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center">
                  <Search className="w-6 h-6 text-brand-500" />
                </div>
                <div>
                  <h3 className="font-semibold">통합 검색</h3>
                  <p className="text-sm text-gray-600">여러 플랫폼을 한 번에 검색</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold">AI 추천</h3>
                  <p className="text-sm text-gray-600">가격과 상태를 분석해 최적 상품 추천</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold">간편 비교</h3>
                  <p className="text-sm text-gray-600">여러 상품을 한눈에 비교</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Badge variant="outline" className="text-gray-600 border-gray-300">
                🥕 당근마켓
              </Badge>
              <Badge variant="outline" className="text-gray-600 border-gray-300">
                ⚡ 번개장터
              </Badge>
              <Badge variant="outline" className="text-gray-600 border-gray-300">
                💼 중고나라
              </Badge>
            </div>
          </div>

          {/* 우측: 로그인 폼 */}
          <div className="max-w-md mx-auto w-full">
            <Card className="rounded-2xl shadow-lg border-brand-200">
              <CardHeader className="space-y-1 text-center pb-4">
                <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl">👋</span>
                </div>
                <CardTitle className="text-2xl">다시 만나서 반가워요!</CardTitle>
                <CardDescription>
                  계정에 로그인하여 서비스를 이용하세요
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-3">
                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">이메일</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="email"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11 rounded-xl"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">비밀번호</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="비밀번호를 입력하세요"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-11 rounded-xl"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-gray-600">로그인 상태 유지</span>
                    </label>
                    <Link href="/forgot-password" className="text-brand-500 hover:underline">
                      비밀번호 찾기
                    </Link>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full h-11 bg-brand-500 hover:bg-brand-600 rounded-xl text-lg font-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        로그인 중...
                      </>
                    ) : (
                      '로그인'
                    )}
                  </Button>
                </form>
                
                <div className="mt-1">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">또는</span>
                    </div>
                  </div>
                  
                  <div className="mt-1 space-y-2">
                    <Button
                      variant="outline"
                      className="w-full h-11 rounded-xl"
                      onClick={() => {/* 구글 로그인 */}}
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Google로 로그인
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full h-11 rounded-xl bg-yellow-400 hover:bg-yellow-500 border-yellow-400"
                      onClick={() => {/* 카카오 로그인 */}}
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="#000000"
                          d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.85 5.33 4.65 6.75-.2.72-.74 2.7-.85 3.12-.14.52.19.53.4.39.16-.11 2.55-1.73 3.59-2.43.62.09 1.26.14 1.91.14 5.52 0 10-3.58 10-8 0-4.42-4.48-8-10-8z"
                        />
                      </svg>
                      카카오로 로그인
                    </Button>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-center pb-4">
                <p className="text-sm text-gray-600">
                  아직 계정이 없으신가요?{' '}
                  <Link href="/register" className="text-brand-500 font-semibold hover:underline">
                    회원가입
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-white py-6 mt-8">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <p className="text-sm text-gray-400">
            &copy; 2025 더나와. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}