import { BaseScraper } from "./base-scraper";
import type { Product } from "@/types/product";
import * as cheerio from "cheerio";

export class JunggonaraScraper extends BaseScraper {
  sourceName = "junggonara";
  baseUrl = "https://web.joongna.com";

  async searchProducts(query: string, limit: number = 20): Promise<Product[]> {
    const products: Product[] = [];

    try {
      // 🔥 중고나라 검색 URL
      const searchUrl = `https://web.joongna.com/search/${encodeURIComponent(query)}`;

      console.log(`🔍 중고나라 검색: ${searchUrl}`);

      const response = await fetch(searchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      if (!response.ok) {
        console.log(`❌ 중고나라: HTTP ${response.status} ${response.statusText}`);
        return [];
      }

      const html = await response.text();
      console.log(`📄 중고나라 HTML 길이: ${html.length}`);

      const $ = cheerio.load(html);

      // 🎯 상품 선택자들 (우선순위 순으로)
      const selectors = [
        'a[href*="/product/"]', // 상품 링크
        ".product-item",
        ".item-card",
        '[data-testid="product-card"]',
        ".product-list-item",
      ];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let productElements: cheerio.Cheerio<any> | null = null;
      let usedSelector = "";

      // 선택자 시도
      for (const selector of selectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          productElements = elements;
          usedSelector = selector;
          console.log(`✅ 중고나라 선택자 성공: ${selector} (${elements.length}개 요소)`);
          break;
        }
      }

      if (!productElements || productElements.length === 0) {
        console.log(`❌ 중고나라: 상품 요소를 찾을 수 없음`);
        return [];
      }

      console.log(
        `🎯 중고나라 상품 요소 발견: ${productElements.length}개 (선택자: ${usedSelector})`
      );

      productElements.slice(0, limit).each((index, element) => {
        try {
          const $element = $(element);

          // 🔍 제목 추출
          const title =
            $element.find('[data-testid="product-title"]').text().trim() ||
            $element.find("h3, h4, h5").text().trim() ||
            $element.find(".product-title").text().trim() ||
            $element.find('[class*="title"]').text().trim() ||
            $element.find("img").attr("alt") ||
            "";

          // 제목이 유효하지 않으면 스킵
          if (!title || title.length < 3) {
            return;
          }

          // 🔍 가격 추출 (전체 텍스트에서 가격 패턴 찾기)
          let priceText = "";
          const fullText = $element.text();

          // 가격 패턴 매칭 (숫자,원 형태)
          const priceRegex = /(\d{1,3}(?:,\d{3})*)\s*원/;
          const priceMatch = fullText.match(priceRegex);
          if (priceMatch) {
            priceText = priceMatch[0]; // "85,000원" 형태
          } else {
            // 대체 방법들
            priceText =
              $element.find('[data-testid="product-price"]').text().trim() ||
              $element.find(".product-price").text().trim() ||
              $element.find('[class*="price"]').text().trim() ||
              $element
                .find("*")
                .filter((_, el) => $(el).text().includes("원"))
                .first()
                .text()
                .trim() ||
              "가격 문의";
          }

          // 🔍 이미지 URL 추출 (다양한 방법)
          let imageUrl = "";

          // 방법 1: data-testid 기반
          const imgElement = $element.find('[data-testid="product-image"] img');
          if (imgElement.length > 0) {
            imageUrl = imgElement.attr("src") || imgElement.attr("data-src") || "";
          }

          // 방법 2: 일반 이미지 태그
          if (!imageUrl) {
            const generalImg = $element.find("img").first();
            imageUrl =
              generalImg.attr("src") ||
              generalImg.attr("data-src") ||
              generalImg.attr("data-lazy") ||
              "";
          }

          // 방법 3: 배경 이미지
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
          if (!productUrl || !productUrl.includes("/product/")) {
            return;
          }

          // 🔍 위치 정보 추출
          const location =
            $element.find('[data-testid="product-location"]').text().trim() ||
            $element.find(".product-location").text().trim() ||
            $element.find('[class*="region"]').text().trim() ||
            $element.find('[class*="location"]').text().trim() ||
            "중고나라";

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
            id: `junggonara-${products.length}-${Date.now()}`,
            title: title.substring(0, 100).trim(),
            price,
            priceText,
            source: "junggonara" as const,
            productUrl,
            imageUrl,
            location: location.substring(0, 50).trim(),
            timestamp: new Date().toISOString(),
            description: `중고나라에서 판매 중인 ${title}`,
          };

          products.push(product);
          console.log(
            `✅ 중고나라 상품 추가: ${title} - ${priceText} (이미지: ${imageUrl ? "있음" : "없음"})`
          );
        } catch (error) {
          console.error(`❌ 중고나라 상품 파싱 오류:`, error);
        }
      });

      console.log(`🎯 중고나라 최종 결과: ${products.length}개 상품`);
      return products.slice(0, limit);
    } catch (error) {
      console.error(`❌ 중고나라 스크래핑 오류:`, error);
      return [];
    }
  }
}
