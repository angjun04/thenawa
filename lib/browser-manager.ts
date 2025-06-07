import puppeteer, { Browser, Page } from "puppeteer";

class BrowserManager {
  private browser: Browser | null = null;
  private isLaunching = false;

  async getBrowser(): Promise<Browser> {
    if (this.browser && this.browser.connected) {
      return this.browser;
    }

    if (this.isLaunching) {
      // Wait for the browser to finish launching
      while (this.isLaunching) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      if (this.browser && this.browser.connected) {
        return this.browser;
      }
    }

    this.isLaunching = true;

    try {
      console.log("🚀 Launching Puppeteer browser...");
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-web-security",
          "--disable-features=VizDisplayCompositor",
          "--disable-dev-shm-usage",
          "--no-first-run",
          "--no-default-browser-check",
          "--disable-default-apps",
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-renderer-backgrounding",
        ],
        defaultViewport: { width: 1280, height: 800 },
      });

      console.log("✅ Browser launched successfully");
      return this.browser;
    } catch (error) {
      console.error("❌ Failed to launch browser:", error);
      throw error;
    } finally {
      this.isLaunching = false;
    }
  }

  async createPage(): Promise<Page> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/112.0.0.0 Safari/537.36"
    );

    return page;
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
        this.browser = null;
        console.log("🔒 Browser closed");
      } catch (error) {
        console.error("❌ Error closing browser:", error);
      }
    }
  }
}

// Singleton instance
export const browserManager = new BrowserManager();
