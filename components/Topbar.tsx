'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Menu, X } from 'lucide-react'
import { useState } from 'react'

// Constants for better maintainability
const LOGO_SIZE = {
  DEFAULT: 'w-10 h-10',
  SMALL: 'w-8 h-8'
} as const

const LOGO_EMOJI = '🔍'
const BRAND_NAME = '더나와'

// Type definitions for predictability
interface TopbarProps {
  variant?: 'default' | 'compact'
  showSearch?: boolean
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  showAuth?: boolean
  currentPath?: string
  className?: string
  children?: React.ReactNode
}

interface NavItem {
  label: string
  href: string
  variant?: 'ghost' | 'default'
}

// Default navigation items
const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: '검색', href: '/search', variant: 'ghost' },
  { label: '비교', href: '/compare', variant: 'ghost' },
]

// Separate component for the logo to improve cohesion
function TopbarLogo({ size = 'DEFAULT' }: { size?: keyof typeof LOGO_SIZE }) {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className={`${LOGO_SIZE[size]} bg-brand-500 rounded-full flex items-center justify-center`}>
        {LOGO_EMOJI}
      </div>
      <span className={`font-bold text-brand-500 ${size === 'SMALL' ? 'text-xl' : 'text-2xl'}`}>
        {BRAND_NAME}
      </span>
    </Link>
  )
}

// Separate component for search functionality
function TopbarSearch({ 
  placeholder = "찾고 있는 상품을 검색해보세요", 
  onSearch,
  className = ""
}: { 
  placeholder?: string
  onSearch?: (query: string) => void
  className?: string 
}) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = () => {
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery)
      } else {
        router.push(`/search?q=${encodeURIComponent(searchQuery)}&location=용답동`)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className={`flex-1 max-w-xl mx-4 ${className}`}>
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full pr-10 rounded-lg border-gray-200 focus:border-brand-500"
        />
        <Button 
          type="button"
          size="sm"
          onClick={handleSearch}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-brand-500 hover:bg-brand-600 h-8 w-8 p-0"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Separate component for authentication buttons
function TopbarAuth() {
  return (
    <div className="flex gap-2">
      <Link href="/login">
        <Button variant="ghost" className="text-gray-600 hover:text-brand-500">
          로그인
        </Button>
      </Link>
      <Link href="/register">
        <Button className="bg-brand-500 hover:bg-brand-600 text-white">
          회원가입
        </Button>
      </Link>
    </div>
  )
}

// Mobile menu component
function TopbarMobileMenu({ 
  navItems = DEFAULT_NAV_ITEMS,
  showAuth = true,
  currentPath = ''
}: {
  navItems?: NavItem[]
  showAuth?: boolean
  currentPath?: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg md:hidden">
          <nav className="container mx-auto px-4 py-4">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button 
                    variant={currentPath === item.href ? 'default' : 'ghost'}
                    className="w-full justify-start"
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
              {showAuth && (
                <>
                  <div className="border-t border-gray-200 my-2" />
                  <Link href="/login">
                    <Button variant="ghost" className="w-full justify-start">
                      로그인
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full justify-start bg-brand-500 hover:bg-brand-600 text-white">
                      회원가입
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  )
}

// Main Topbar component using composition
export default function Topbar({
  variant = 'default',
  showSearch = false,
  searchPlaceholder,
  onSearch,
  showAuth = true,
  currentPath = '',
  className = '',
  children
}: TopbarProps) {
  const isCompact = variant === 'compact'
  
  return (
    <header className={`bg-white/80 backdrop-blur-sm border-b border-gray-200 relative ${className}`}>
      <div className="container mx-auto max-w-6xl px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <TopbarLogo size={isCompact ? 'SMALL' : 'DEFAULT'} />

          {/* Search bar (if enabled) */}
          {showSearch && (
            <TopbarSearch 
              placeholder={searchPlaceholder} 
              onSearch={onSearch}
              className="hidden md:flex"
            />
          )}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-4 items-center">
            {/* Render children or default navigation */}
            {children || (
              <>
                {DEFAULT_NAV_ITEMS.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button 
                      variant={currentPath === item.href ? 'default' : item.variant}
                      className={currentPath === item.href ? '' : 'text-gray-600'}
                    >
                      {item.label}
                    </Button>
                  </Link>
                ))}
                {showAuth && <TopbarAuth />}
              </>
            )}
          </nav>

          {/* Mobile Menu */}
          <TopbarMobileMenu 
            navItems={DEFAULT_NAV_ITEMS}
            showAuth={showAuth}
            currentPath={currentPath}
          />
        </div>

        {/* Mobile search bar */}
        {showSearch && (
          <div className="mt-4 md:hidden">
            <TopbarSearch 
              placeholder={searchPlaceholder} 
              onSearch={onSearch}
            />
          </div>
        )}
      </div>
    </header>
  )
}
