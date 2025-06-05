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
        "--disable-spdy"
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
    
    await this.page.setViewport({ width: 1280, height: 800 })
    await this.page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/112.0.0.0 Safari/537.36'
    )
    
    this.page.setDefaultTimeout(20000)
    this.page.setDefaultNavigationTimeout(20000)
  }

  async cleanup(): Promise<void> {
    try {
      if (this.page && !this.page.isClosed()) {
        await this.page.close()
        this.page = null
      }
    } catch (error) {
        console.log(error)
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

  abstract searchProducts(query: string, limit?: number): Promise<Product[]>
}