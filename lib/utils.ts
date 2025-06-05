import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR').format(price) + '원'
}

export function getSourceName(source: string): string {
  const sourceNames: Record<string, string> = {
    danggeun: '당근마켓',
    bunjang: '번개장터',
    junggonara: '중고나라',
    coupang: '쿠팡'
  }
  return sourceNames[source] || source
}

export function getSourceColor(source: string): string {
  const sourceColors: Record<string, string> = {
    danggeun: '#ff6f00',
    bunjang: '#ff4757',
    junggonara: '#5f27cd',
    coupang: '#1e90ff'
  }
  return sourceColors[source] || '#666666'
}

export function extractNumberFromString(str: string): number {
  const match = str.match(/\d+/)
  return match ? parseInt(match[0]) : 0
}

export function generateProductId(url: string, source: string): string {
  const timestamp = Date.now()
  const hash = Buffer.from(url).toString('base64').slice(0, 8)
  return `${source}_${timestamp}_${hash}`
}