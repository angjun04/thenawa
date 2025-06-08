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

      // Set user agent and viewport (from working example)
      await page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/112.0.0.0 Safari/537.36"
      );
      await page.setViewport({ width: 1280, height: 800 });

      // 🔥 번개장터 검색 URL (exact same as working example)
      const searchUrl = `${this.baseUrl}/search/products?q=${encodeURIComponent(query)}`;
      console.log(`🔍 번개장터 검색: ${searchUrl}`);

      // Navigate with domcontentloaded (faster than networkidle2)
      await page.goto(searchUrl, { waitUntil: "domcontentloaded" });

      // Wait a bit for page to stabilize instead of waiting for specific selector
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Get HTML and parse with Cheerio
      const html = await page.content();
      console.log(`📄 번개장터 HTML 길이: ${html.length}`);

      const $ = cheerio.load(html);

      // Try multiple selectors to find products (more robust approach)
      const selectors = ["a[data-pid]", 'a[href*="/product/"]', ".product-item", ".item-card"];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let productCards: cheerio.Cheerio<any> | null = null;
      let usedSelector = "";

      for (const selector of selectors) {
        const cards = $(selector);
        if (cards.length > 0) {
          productCards = cards;
          usedSelector = selector;
          console.log(`✅ 번개장터 선택자 성공: ${selector} (${cards.length}개 요소)`);
          break;
        }
      }

      if (!productCards || productCards.length === 0) {
        console.log(`❌ 번개장터: 상품 요소를 찾을 수 없음`);
        return [];
      }

      console.log(`🎯 번개장터 상품 카드 발견: ${productCards.length}개 (선택자: ${usedSelector})`);

      productCards.slice(0, limit).each((index, element) => {
        try {
          const card = $(element);

          // Extract data with fallback methods
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const pid = card.attr("data-pid") || `bunjang-${index}`;

          const title =
            card.find("div.sc-RcBXQ").text().trim() ||
            card.find('[class*="title"]').text().trim() ||
            card.find("h3, h4, h5").text().trim() ||
            card.text().trim().split("\n")[0] ||
            "";

          let priceText =
            card.find("div.sc-iSDuPN").text().trim() ||
            card.find('[class*="price"]').text().trim() ||
            "";

          // If no price found, look for price patterns in text
          if (!priceText) {
            const fullText = card.text().trim();
            const priceMatch = fullText.match(/(\d{1,3}(?:,\d{3})*원?|\d+원)/);
            if (priceMatch) {
              priceText = priceMatch[0];
            }
          }

          const price = priceText ? parseInt(priceText.replace(/[^0-9]/g, ""), 10) || 0 : 0;

          // Image extraction (exact method from working example)
          let imageUrl =
            card.find("img").attr("data-original") ||
            card.find("img").attr("src") ||
            card.find("img").attr("data-src") ||
            "";
          if (imageUrl.startsWith("//")) {
            imageUrl = "https:" + imageUrl;
          }

          const href = card.attr("href") || "";
          const productUrl = href.startsWith("http") ? href : this.baseUrl + href;

          // More lenient validation
          if (title && title.length > 2 && productUrl && productUrl.includes("bunjang")) {
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
