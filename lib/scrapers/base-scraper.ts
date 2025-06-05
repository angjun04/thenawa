import chromium from "@sparticuz/chromium-min"
import puppeteer from "puppeteer-core"
import type { Browser, Page } from 'puppeteer-core'
import { Product } from '@/types/product'

export const dynamic = "force-dynamic"

const remoteExecutablePath = 
  "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar"

let globalBrowser: Browser | null = null

async function getBrowser(): Promise<Browser> {
  if (globalBrowser) return globalBrowser

  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV
  
  if (isVercel) {
    globalBrowser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(remoteExecutablePath),
      headless: true,
    })
  } else {
    const possiblePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
    ]

    let executablePath: string | undefined
    for (const path of possiblePaths) {
      try {
        const fs = await import('fs')
        if (fs.existsSync(path)) {
          executablePath = path
          break
        }
      } catch { continue }
    }

    if (!executablePath) {
      executablePath = await chromium.executablePath(remoteExecutablePath)
    }

    globalBrowser = await puppeteer.launch({
      executablePath,
      args: [
        "--no-sandbox", 
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-spdy",
        "--disable-features=VizDisplayCompositor"
      ],
      headless: true,
    })
  }
  
  return globalBrowser
}

export abstract class BaseScraper {
  protected browser: Browser | null = null
  protected page: Page | null = null
  
  abstract sourceName: string
  abstract baseUrl: string

  async initialize(): Promise<void> {
    this.browser = await getBrowser()
    this.page = await this.browser.newPage()
    
    // 모바일 뷰포트 설정
    await this.page.setViewport({ 
      width: 375, 
      height: 812,
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2
    })
    
    // 모바일 User-Agent 설정
    await this.page.setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) ' +
      'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 ' +
      'Mobile/15E148 Safari/604.1'
    )
    
    // 추가 헤더 설정
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    })
    
    this.page.setDefaultTimeout(30000)
    this.page.setDefaultNavigationTimeout(30000)
  }

  async cleanup(): Promise<void> {
    try {
      if (this.page && !this.page.isClosed()) {
        await this.page.close()
        this.page = null
      }
    } catch {
      this.page = null
    }
  }

  async autoScroll(): Promise<void> {
    if (!this.page) return
    
    await this.page.evaluate(async () => {
      await new Promise((resolve) => {
        let total = 0
        const distance = 100
        const timer = setInterval(() => {
          window.scrollBy(0, distance)
          total += distance
          if (total >= document.body.scrollHeight) {
            clearInterval(timer)
            resolve(undefined)
          }
        }, 100)
      })
    })
  }

  // 🔥 핵심 수정: 터치 제거, 안전한 스크롤로 교체
  async mobileScroll(): Promise<void> {
    if (!this.page) return
    
    try {
      // 터치 시뮬레이션 대신 안전한 JavaScript 스크롤 사용
      await this.page.evaluate(() => {
        // 3번 스크롤, 각각 화면 높이의 80%씩
        let scrollCount = 0
        const maxScrolls = 3
        
        const scrollStep = () => {
          if (scrollCount < maxScrolls) {
            window.scrollBy(0, window.innerHeight * 0.8)
            scrollCount++
            setTimeout(scrollStep, 1000) // 1초 간격
          }
        }
        
        scrollStep()
      })
      
      // 스크롤 완료 대기 (3초 + 여유분)
      await new Promise(resolve => setTimeout(resolve, 4000))
      
    } catch (error) {
      console.warn(`${this.sourceName} 모바일 스크롤 실패:`, error)
      // 스크롤 실패해도 계속 진행
    }
  }

  abstract searchProducts(query: string, limit?: number): Promise<Product[]>
}