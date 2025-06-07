import { BaseScraper } from "./base-scraper";
import type { Product } from "@/types/product";
import * as cheerio from "cheerio";
import { browserManager } from "../browser-manager";

export class BunjangScraper extends BaseScraper {
  sourceName = "bunjang";
  baseUrl = "https://www.bunjang.co.kr";

  async searchProducts(query: string, limit: number = 20): Promise<Product[]> {
    const products: Product[] = [];
    let page = null;

    try {
      // 🚀 Create page from shared browser
      page = await browserManager.createPage();

      // 🔥 번개장터 검색 URL (exact same as example)
      const searchUrl = `${this.baseUrl}/search/products?q=${encodeURIComponent(query)}`;
      console.log(`🔍 번개장터 검색: ${searchUrl}`);

      // Navigate to search page
      await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 20000 });

      // Wait for product cards to load (key selector from example)
      await page.waitForSelector("a[data-pid]", { timeout: 20000 });

      // Pause to allow images to load
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get HTML and parse with Cheerio (like example)
      const html = await page.content();
      console.log(`📄 번개장터 HTML 길이: ${html.length}`);

      const $ = cheerio.load(html);

      // Use the exact selectors from your example
      const productCards = $("a[data-pid]");
      console.log(`🎯 번개장터 상품 카드 발견: ${productCards.length}개`);

      if (productCards.length === 0) {
        return [];
      }

      productCards.slice(0, limit).each((index, element) => {
        try {
          const card = $(element);

          const pid = card.attr("data-pid");
          const title = card.find("div.sc-RcBXQ").text().trim(); // Exact selector from example
          const priceText = card.find("div.sc-iSDuPN").text().trim(); // Exact selector from example
          const price = priceText ? parseInt(priceText.replace(/[^0-9]/g, ""), 10) || 0 : 0;

          // Image extraction (exact method from example)
          let imageUrl =
            card.find("img").attr("data-original") || card.find("img").attr("src") || "";
          if (imageUrl.startsWith("//")) {
            imageUrl = "https:" + imageUrl;
          }

          const href = card.attr("href") || "";
          const productUrl = href.startsWith("http") ? href : this.baseUrl + href;

          // Validate required fields (exact same logic as example)
          if (pid && title && productUrl) {
            const product: Product = {
              id: `bunjang-${index}-${Date.now()}`,
              title: title.substring(0, 100).trim(),
              price,
              priceText: priceText || "가격 문의",
              source: "bunjang" as const,
              productUrl,
              imageUrl: imageUrl || "",
              location: "번개장터",
              timestamp: new Date().toISOString(),
              description: `번개장터에서 판매 중인 ${title}`,
            };

            products.push(product);
            console.log(
              `✅ 번개장터 상품 추가: ${title} - ${priceText} (이미지: ${
                imageUrl ? "있음" : "없음"
              })`
            );
          }
        } catch (error) {
          console.error(`❌ 번개장터 상품 파싱 오류:`, error);
        }
      });

      console.log(`🎯 번개장터 최종 결과: ${products.length}개 상품`);
      return products.slice(0, limit);
    } catch (error) {
      console.error(`❌ 번개장터 스크래핑 오류:`, error);
      return [];
    } finally {
      // Always close the page
      if (page) {
        try {
          await page.close();
        } catch (e) {
          console.error("❌ Error closing Bunjang page:", e);
        }
      }
    }
  }
}
