import { browserManager } from "../browser-manager";
import * as cheerio from "cheerio";

export interface ProductDetail {
  id: string;
  title: string;
  price: number;
  priceText: string;
  source: string;
  imageUrl: string;
  productUrl: string;
  location?: string;

  // Detailed information
  description: string;
  condition: string;
  sellerName: string;
  sellerRating?: number;
  additionalImages: string[];
  specifications: Record<string, string>;
  tags: string[];
  viewCount?: number;
  likeCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export class ProductDetailScraper {
  async scrapeProductDetail(productUrl: string, source: string): Promise<ProductDetail | null> {
    let page = null;

    try {
      console.log(`🔍 상품 상세 정보 수집 시작: ${source} - ${productUrl}`);

      page = await browserManager.createPage();

      // Set user agent and viewport
      await page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/112.0.0.0 Safari/537.36"
      );
      await page.setViewport({ width: 1280, height: 800 });

      // Navigate to product page
      await page.goto(productUrl, { waitUntil: "domcontentloaded", timeout: 15000 });

      // Wait for page to stabilize
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const html = await page.content();
      const $ = cheerio.load(html);

      let productDetail: ProductDetail | null = null;

      switch (source) {
        case "danggeun":
          productDetail = this.scrapeDanggeunDetail($, productUrl);
          break;
        case "bunjang":
          productDetail = this.scrapeBunjangDetail($, productUrl);
          break;
        case "junggonara":
          productDetail = this.scrapeJunggonaraDetail($, productUrl);
          break;
        default:
          console.log(`❌ 지원하지 않는 플랫폼: ${source}`);
          return null;
      }

      if (productDetail) {
        console.log(`✅ ${source} 상품 상세 정보 수집 완료: ${productDetail.title}`);
      }

      return productDetail;
    } catch (error) {
      console.error(`❌ ${source} 상품 상세 정보 수집 오류:`, error);
      return null;
    } finally {
      if (page) {
        try {
          await page.close();
        } catch (e) {
          console.error("❌ Error closing detail page:", e);
        }
      }
    }
  }

  private scrapeDanggeunDetail($: cheerio.CheerioAPI, productUrl: string): ProductDetail | null {
    try {
      const title =
        $('h1, .title, [class*="title"]').first().text().trim() ||
        $('meta[property="og:title"]').attr("content") ||
        "";

      const priceText =
        $('.price, [class*="price"], .amount').first().text().trim() ||
        $('meta[property="product:price:amount"]').attr("content") ||
        "";

      const price = priceText ? parseInt(priceText.replace(/[^0-9]/g, ""), 10) || 0 : 0;

      const description =
        $('.description, .content, [class*="description"], [class*="content"]').text().trim() ||
        $('meta[property="og:description"]').attr("content") ||
        "";

      const condition =
        $('.condition, [class*="condition"]').text().trim() || "상품 상태 정보 없음";

      const sellerName =
        $('.seller, .author, [class*="seller"], [class*="author"]').text().trim() || "판매자";

      const location =
        $('.location, [class*="location"], .address').text().trim() || "위치 정보 없음";

      // Extract additional images
      const additionalImages: string[] = [];
      $("img").each((_, img) => {
        const src = $(img).attr("src") || $(img).attr("data-src") || "";
        if (src && src.includes("daangn") && !additionalImages.includes(src)) {
          additionalImages.push(src.startsWith("//") ? "https:" + src : src);
        }
      });

      // Extract specifications from any structured data
      const specifications: Record<string, string> = {};
      $('.spec, .specification, [class*="spec"]').each((_, elem) => {
        const key = $(elem).find(".key, .label").text().trim();
        const value = $(elem).find(".value, .text").text().trim();
        if (key && value) {
          specifications[key] = value;
        }
      });

      const imageUrl = additionalImages[0] || "";

      return {
        id: `danggeun-detail-${Date.now()}`,
        title,
        price,
        priceText,
        source: "danggeun",
        imageUrl,
        productUrl,
        location,
        description,
        condition,
        sellerName,
        additionalImages,
        specifications,
        tags: [],
      };
    } catch (error) {
      console.error("당근마켓 상세 정보 파싱 오류:", error);
      return null;
    }
  }

  private scrapeBunjangDetail($: cheerio.CheerioAPI, productUrl: string): ProductDetail | null {
    try {
      const title =
        $('h1, .title, [class*="title"]').first().text().trim() ||
        $('meta[property="og:title"]').attr("content") ||
        "";

      const priceText =
        $('.price, [class*="price"]').first().text().trim() ||
        $('meta[property="product:price:amount"]').attr("content") ||
        "";

      const price = priceText ? parseInt(priceText.replace(/[^0-9]/g, ""), 10) || 0 : 0;

      const description =
        $('.description, .content, [class*="description"]').text().trim() ||
        $('meta[property="og:description"]').attr("content") ||
        "";

      const condition =
        $('.condition, [class*="condition"]').text().trim() || "상품 상태 정보 없음";

      const sellerName = $('.seller, [class*="seller"]').text().trim() || "판매자";

      // Extract additional images
      const additionalImages: string[] = [];
      $("img").each((_, img) => {
        const src =
          $(img).attr("src") || $(img).attr("data-src") || $(img).attr("data-original") || "";
        if (src && src.includes("bunjang") && !additionalImages.includes(src)) {
          additionalImages.push(src.startsWith("//") ? "https:" + src : src);
        }
      });

      const specifications: Record<string, string> = {};
      $('.spec, [class*="spec"]').each((_, elem) => {
        const text = $(elem).text().trim();
        if (text) {
          const [key, ...valueParts] = text.split(":");
          if (key && valueParts.length > 0) {
            specifications[key.trim()] = valueParts.join(":").trim();
          }
        }
      });

      const imageUrl = additionalImages[0] || "";

      return {
        id: `bunjang-detail-${Date.now()}`,
        title,
        price,
        priceText,
        source: "bunjang",
        imageUrl,
        productUrl,
        description,
        condition,
        sellerName,
        additionalImages,
        specifications,
        tags: [],
      };
    } catch (error) {
      console.error("번개장터 상세 정보 파싱 오류:", error);
      return null;
    }
  }

  private scrapeJunggonaraDetail($: cheerio.CheerioAPI, productUrl: string): ProductDetail | null {
    try {
      const title =
        $('h1, .title, [class*="title"]').first().text().trim() ||
        $('meta[property="og:title"]').attr("content") ||
        "";

      const priceText =
        $('.price, [class*="price"]').first().text().trim() ||
        $('meta[property="product:price:amount"]').attr("content") ||
        "";

      const price = priceText ? parseInt(priceText.replace(/[^0-9]/g, ""), 10) || 0 : 0;

      const description =
        $('.description, .content, [class*="description"], [class*="content"]').text().trim() ||
        $('meta[property="og:description"]').attr("content") ||
        "";

      const condition =
        $('.condition, [class*="condition"]').text().trim() || "상품 상태 정보 없음";

      const sellerName = $('.seller, [class*="seller"], .author').text().trim() || "판매자";

      // Extract additional images
      const additionalImages: string[] = [];
      $("img").each((_, img) => {
        const src = $(img).attr("src") || $(img).attr("data-src") || "";
        if (src && src.includes("joongna") && !additionalImages.includes(src)) {
          additionalImages.push(src.startsWith("//") ? "https:" + src : src);
        }
      });

      const specifications: Record<string, string> = {};
      $('.spec, [class*="spec"]').each((_, elem) => {
        const text = $(elem).text().trim();
        if (text) {
          const [key, ...valueParts] = text.split(":");
          if (key && valueParts.length > 0) {
            specifications[key.trim()] = valueParts.join(":").trim();
          }
        }
      });

      const imageUrl = additionalImages[0] || "";

      return {
        id: `junggonara-detail-${Date.now()}`,
        title,
        price,
        priceText,
        source: "junggonara",
        imageUrl,
        productUrl,
        description,
        condition,
        sellerName,
        additionalImages,
        specifications,
        tags: [],
      };
    } catch (error) {
      console.error("중고나라 상세 정보 파싱 오류:", error);
      return null;
    }
  }
}
