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
  User,
  Phone,
  Loader2,
  Eye,
  EyeOff,
  Check,
  X,
  MapPin,
  Search,
  ShoppingBag,
  Users
} from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    location: '용답동'
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [agreedPrivacy, setAgreedPrivacy] = useState(false)
  const [agreedMarketing, setAgreedMarketing] = useState(false)

  // Password validation states
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    hasNumber: false,
    hasSpecial: false,
    hasUpperCase: false
  })

  const validatePassword = (password: string) => {
    setPasswordValidation({
      length: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*]/.test(password),
      hasUpperCase: /[A-Z]/.test(password)
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    
    // Validate password in real-time
    if (name === 'password') {
      validatePassword(value)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name) newErrors.name = '이름을 입력해주세요.'
    if (!formData.email) newErrors.email = '이메일을 입력해주세요.'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = '올바른 이메일 형식이 아닙니다.'
    
    if (!formData.phone) newErrors.phone = '전화번호를 입력해주세요.'
    else if (!/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(formData.phone.replace(/-/g, ''))) {
      newErrors.phone = '올바른 전화번호 형식이 아닙니다.'
    }
    
    if (!formData.password) newErrors.password = '비밀번호를 입력해주세요.'
    else if (!Object.values(passwordValidation).every(v => v)) {
      newErrors.password = '비밀번호 조건을 모두 충족해주세요.'
    }
    
    if (!formData.confirmPassword) newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.'
    else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.'
    }
    
    if (!agreedTerms) newErrors.terms = '이용약관에 동의해주세요.'
    if (!agreedPrivacy) newErrors.privacy = '개인정보 처리방침에 동의해주세요.'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      // API 호출 예시
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 성공 시 로그인 페이지로 이동
      router.push('/login')
    } catch (err) {
      setErrors({ submit: '회원가입에 실패했습니다. 다시 시도해주세요.' })
      console.error(err);
    } finally {
      setLoading(false)
    }
  }

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
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

          {/* 우측: 회원가입 폼 */}
          <div className="max-w-md mx-auto w-full">
            <Card className="rounded-2xl shadow-lg border-brand-200">
              <CardHeader className="space-y-1 text-center pb-4">
                <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl">🎉</span>
                </div>
                <CardTitle className="text-2xl">환영합니다!</CardTitle>
                <CardDescription>
                  더나와와 함께 스마트한 중고거래를 시작하세요
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-3">
                  {errors.submit && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                      {errors.submit}
                    </div>
                  )}
                  
                  {/* 이름 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">이름</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        name="name"
                        placeholder="홍길동"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`pl-10 h-11 rounded-xl ${errors.name ? 'border-red-500' : ''}`}
                        disabled={loading}
                      />
                    </div>
                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                  </div>
                  
                  {/* 이메일 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">이메일</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        name="email"
                        type="email"
                        placeholder="example@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`pl-10 h-11 rounded-xl ${errors.email ? 'border-red-500' : ''}`}
                        disabled={loading}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                  </div>
                  
                  {/* 전화번호 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">전화번호</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        name="phone"
                        placeholder="010-1234-5678"
                        value={formData.phone}
                        onChange={(e) => {
                          const formatted = formatPhoneNumber(e.target.value)
                          setFormData(prev => ({ ...prev, phone: formatted }))
                          if (errors.phone) {
                            setErrors(prev => ({ ...prev, phone: '' }))
                          }
                        }}
                        className={`pl-10 h-11 rounded-xl ${errors.phone ? 'border-red-500' : ''}`}
                        disabled={loading}
                      />
                    </div>
                    {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                  </div>
                  
                  {/* 지역 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">지역</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        name="location"
                        placeholder="예: 용답동"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="pl-10 h-11 rounded-xl"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  {/* 비밀번호 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">비밀번호</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="비밀번호를 입력하세요"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`pl-10 pr-10 h-11 rounded-xl ${errors.password ? 'border-red-500' : ''}`}
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
                    {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                    
                    {/* 비밀번호 체크리스트 */}
                    {formData.password && (
                      <div className="space-y-1 mt-2">
                        <div className={`flex items-center gap-2 text-xs ${passwordValidation.length ? 'text-green-600' : 'text-gray-400'}`}>
                          {passwordValidation.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          8자 이상
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                          {passwordValidation.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          숫자 포함
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${passwordValidation.hasSpecial ? 'text-green-600' : 'text-gray-400'}`}>
                          {passwordValidation.hasSpecial ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          특수문자 포함 (!@#$%^&*)
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-400'}`}>
                          {passwordValidation.hasUpperCase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          대문자 포함
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* 비밀번호 확인 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">비밀번호 확인</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="비밀번호를 다시 입력하세요"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`pl-10 pr-10 h-11 rounded-xl ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                  </div>
                  
                  {/* 약관 동의 */}
                  <div className="space-y-2 pt-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={agreedTerms && agreedPrivacy && agreedMarketing}
                        onChange={(e) => {
                          const checked = e.target.checked
                          setAgreedTerms(checked)
                          setAgreedPrivacy(checked)
                          setAgreedMarketing(checked)
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm font-semibold">전체 동의</span>
                    </label>
                    <Separator />
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={agreedTerms}
                        onChange={(e) => setAgreedTerms(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">
                        [필수] 이용약관에 동의합니다
                      </span>
                    </label>
                    {errors.terms && <p className="text-xs text-red-500 ml-6">{errors.terms}</p>}
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={agreedPrivacy}
                        onChange={(e) => setAgreedPrivacy(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">
                        [필수] 개인정보 처리방침에 동의합니다
                      </span>
                    </label>
                    {errors.privacy && <p className="text-xs text-red-500 ml-6">{errors.privacy}</p>}
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={agreedMarketing}
                        onChange={(e) => setAgreedMarketing(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">
                        [선택] 마케팅 정보 수신에 동의합니다
                      </span>
                    </label>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full h-11 bg-brand-500 hover:bg-brand-600 rounded-xl text-lg font-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        회원가입 중...
                      </>
                    ) : (
                      '회원가입'
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
                      onClick={() => {/* 구글 회원가입 */}}
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
                      Google로 회원가입
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full h-11 rounded-xl bg-yellow-400 hover:bg-yellow-500 border-yellow-400"
                      onClick={() => {/* 카카오 회원가입 */}}
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="#000000"
                          d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.85 5.33 4.65 6.75-.2.72-.74 2.7-.85 3.12-.14.52.19.53.4.39.16-.11 2.55-1.73 3.59-2.43.62.09 1.26.14 1.91.14 5.52 0 10-3.58 10-8 0-4.42-4.48-8-10-8z"
                        />
                      </svg>
                      카카오로 회원가입
                    </Button>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-center pb-4">
                <p className="text-sm text-gray-600">
                  이미 계정이 있으신가요?{' '}
                  <Link href="/login" className="text-brand-500 font-semibold hover:underline">
                    로그인
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