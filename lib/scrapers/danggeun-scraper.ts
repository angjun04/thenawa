import { BaseScraper } from "./base-scraper";
import type { Product } from "@/types/product";
import * as cheerio from "cheerio";
import { browserManager } from "../browser-manager";

export class DanggeunScraper extends BaseScraper {
  sourceName = "danggeun";
  baseUrl = "https://www.daangn.com";

  async searchProducts(query: string, limit: number = 20): Promise<Product[]> {
    const products: Product[] = [];
    let page = null;

    try {
      // 🚀 Create page from shared browser
      page = await browserManager.createPage();

      // 🔥 당근마켓 검색 URL
      const searchUrl = `${this.baseUrl}/search/${encodeURIComponent(query)}`;
      console.log(`🔍 당근마켓 검색: ${searchUrl}`);

      // Navigate to search page
      await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });

      // Wait for search results with multiple possible selectors
      try {
        await page.waitForSelector('article[data-testid="article-card"]', { timeout: 15000 });
      } catch {
        try {
          await page.waitForSelector('a[href*="/articles/"]', { timeout: 10000 });
        } catch {
          await page.waitForSelector(".card-photo", { timeout: 5000 });
        }
      }

      // Pause to allow content to load
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Get HTML and parse with Cheerio
      const html = await page.content();
      console.log(`📄 당근마켓 HTML 길이: ${html.length}`);

      const $ = cheerio.load(html);

      // 🎯 당근마켓 상품 선택자들 (우선순위 순으로)
      const selectors = [
        'article[data-testid="article-card"]', // 최신 선택자
        'a[href*="/articles/"]', // 게시글 링크
        "article", // 일반 article 태그
        ".card-link",
        ".article-link",
        ".flea-market-article",
      ];

      let productElements = null;
      let usedSelector = "";

      // 선택자 시도
      for (const selector of selectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          productElements = elements;
          usedSelector = selector;
          console.log(`✅ 당근마켓 선택자 성공: ${selector} (${elements.length}개 요소)`);
          break;
        }
      }

      if (!productElements || productElements.length === 0) {
        console.log(`❌ 당근마켓: 상품 요소를 찾을 수 없음`);
        return [];
      }

      console.log(
        `🎯 당근마켓 상품 요소 발견: ${productElements.length}개 (선택자: ${usedSelector})`
      );

      productElements.slice(0, limit).each((index, element) => {
        try {
          const $element = $(element);

          // 🔍 제목 추출
          let title =
            $element.find('[data-testid="article-title"]').text().trim() ||
            $element.find(".article-title").text().trim() ||
            $element.find(".card-title").text().trim() ||
            $element.find("h3, h4, h5").text().trim() ||
            $element.find('[class*="title"]').text().trim() ||
            $element.find("img").attr("alt") ||
            "";

          // 제목이 유효하지 않으면 스킵
          if (!title || title.length < 3) {
            return;
          }

          // 🔍 가격 추출
          let priceText = "";
          const fullText = $element.text();

          // 가격 패턴 매칭 (숫자,원 형태)
          const priceRegex = /(\d{1,3}(?:,\d{3})*)\s*원/;
          const priceMatch = fullText.match(priceRegex);
          if (priceMatch) {
            priceText = priceMatch[0];
          } else {
            // 대체 방법들
            priceText =
              $element.find('[data-testid="article-price"]').text().trim() ||
              $element.find(".article-price").text().trim() ||
              $element.find(".card-price").text().trim() ||
              $element.find('[class*="price"]').text().trim() ||
              "가격 문의";
          }

          // 🔍 이미지 URL 추출
          let imageUrl = "";

          // 방법 1: 일반 이미지 태그
          const imgElement = $element.find("img").first();
          if (imgElement.length > 0) {
            imageUrl =
              imgElement.attr("src") ||
              imgElement.attr("data-src") ||
              imgElement.attr("data-lazy") ||
              "";
          }

          // 방법 2: 배경 이미지
          if (!imageUrl) {
            const bgElement = $element.find('[style*="background-image"]');
            if (bgElement.length > 0) {
              const style = bgElement.attr("style") || "";
              const bgMatch = style.match(/url\(['"]?(.*?)['"]?\)/);
              if (bgMatch) {
                imageUrl = bgMatch[1];
              }
            }
          }

          // 🔍 상품 URL 추출
          let productUrl = "";
          if ($element.is("a")) {
            productUrl = $element.attr("href") || "";
          } else {
            productUrl = $element.find("a").first().attr("href") || "";
          }

          // URL 정제
          if (productUrl && !productUrl.startsWith("http")) {
            productUrl = productUrl.startsWith("/")
              ? `${this.baseUrl}${productUrl}`
              : `${this.baseUrl}/${productUrl}`;
          }

          // 상품 URL이 유효하지 않으면 스킵
          if (
            !productUrl ||
            (!productUrl.includes("/articles/") && !productUrl.includes("/products/"))
          ) {
            return;
          }

          // 🔍 위치 정보 추출
          let location =
            $element.find('[data-testid="article-region"]').text().trim() ||
            $element.find(".article-region").text().trim() ||
            $element.find(".card-region").text().trim() ||
            $element.find('[class*="region"]').text().trim() ||
            $element.find('[class*="location"]').text().trim() ||
            "당근마켓";

          // 가격 처리
          if (!priceText) {
            priceText = "가격 문의";
          }
          const cleanPrice = priceText.replace(/[^\d]/g, "");
          const price = cleanPrice ? parseInt(cleanPrice) : 0;

          // 이미지 URL 정제
          if (imageUrl) {
            if (imageUrl.startsWith("//")) {
              imageUrl = `https:${imageUrl}`;
            } else if (!imageUrl.startsWith("http") && imageUrl.startsWith("/")) {
              imageUrl = `${this.baseUrl}${imageUrl}`;
            }
          } else {
            imageUrl = "";
          }

          const product: Product = {
            id: `danggeun-${index}-${Date.now()}`,
            title: title.substring(0, 100).trim(),
            price,
            priceText,
            source: "danggeun" as const,
            productUrl,
            imageUrl,
            location: location.substring(0, 50).trim(),
            timestamp: new Date().toISOString(),
            description: `당근마켓에서 판매 중인 ${title}`,
          };

          products.push(product);
          console.log(
            `✅ 당근마켓 상품 추가: ${title} - ${priceText} (이미지: ${imageUrl ? "있음" : "없음"})`
          );
        } catch (error) {
          console.error(`❌ 당근마켓 상품 파싱 오류:`, error);
        }
      });

      console.log(`🎯 당근마켓 최종 결과: ${products.length}개 상품`);
      return products.slice(0, limit);
    } catch (error) {
      console.error(`❌ 당근마켓 스크래핑 오류:`, error);
      return [];
    } finally {
      // Always close the page
      if (page) {
        try {
          await page.close();
        } catch (e) {
          console.error("❌ Error closing Danggeun page:", e);
        }
      }
    }
  }
}
