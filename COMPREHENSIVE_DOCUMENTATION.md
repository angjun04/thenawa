# 더나와 (TheNawa) - 중고거래 통합검색 플랫폼

> "다나와? 아니, 더나와." - AI 기반 중고거래 통합검색 및 비교 플랫폼

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [아키텍처](#아키텍처)
3. [기존 기능](#기존-기능)
4. [계획된 기능](#계획된-기능)
5. [React 컴포넌트 구조](#react-컴포넌트-구조)
6. [AI 기능](#ai-기능)
7. [웹 스크래핑 알고리즘](#웹-스크래핑-알고리즘)
8. [API 엔드포인트](#api-엔드포인트)
9. [문제점과 해결방안](#문제점과-해결방안)
10. [성능 최적화](#성능-최적화)
11. [배포 설정](#배포-설정)

## 🎯 프로젝트 개요

더나와는 **당근마켓**, **번개장터**, **중고나라**를 동시에 검색하고 AI가 최적의 상품을 추천하는 통합 플랫폼입니다.

### 핵심 가치 제안

- **통합 검색**: 3개 플랫폼을 한 번에 검색
- **AI 추천**: OpenRouter API 기반 상품 분석 및 추천
- **실시간 비교**: AI 기반 상품 비교 분석
- **최적화된 성능**: Vercel 환경에 특화된 웹 스크래핑

### 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Web Scraping**: Puppeteer Core, Cheerio, @sparticuz/chromium-min
- **AI**: OpenRouter API (meta-llama/llama-3.1-8b-instruct:free)
- **UI**: Radix UI, Framer Motion, Lucide Icons
- **Deployment**: Vercel (서울 리전)

## 🏗 아키텍처

### 시스템 구조

```
Frontend (Next.js)
├── 검색 인터페이스
├── 결과 표시
└── 비교 분석

Backend (API Routes)
├── /api/search - 통합 검색
├── /api/ai-recommend - AI 추천
├── /api/compare - 상품 비교
└── /api/products/[id] - 상품 상세

Web Scraping Layer
├── BaseScraper (공통 기능)
├── DanggeunFastScraper (당근마켓)
├── BunjangFastScraper (번개장터)
└── JunggonaraFastScraper (중고나라)
```

## ✅ 기존 기능

### 1. 통합 검색 기능

- **실시간 검색**: 3개 플랫폼 동시 검색
- **필터링**: 가격 범위, 소스 선택, 정렬 옵션
- **무한 스크롤**: 50개 상품까지 표시
- **반응형 디자인**: 모바일/데스크톱 최적화

### 2. AI 상품 추천

- **모델**: meta-llama/llama-3.1-8b-instruct:free
- **기능**: 검색어 기반 최적 상품 1개 추천
- **분석 요소**: 가격 대비 가치, 상품 상태, 신뢰도
- **한국어 응답**: 추천 이유 상세 제공

### 3. AI 기반 상품 비교

- **상세 정보 수집**: 각 상품의 자세한 정보 크롤링
- **AI 분석**: 상태, 가격, 판매자, 사양 비교
- **추천 생성**: 최고 가치 상품 선별 및 이유 설명
- **시각적 표시**: 점수 기반 차트 및 표

### 4. 고급 웹 스크래핑

- **Fast-Fetch 방식**: API/HTTP 직접 호출로 속도 향상
- **Puppeteer 폴백**: 차단 시 브라우저 자동화로 대체
- **환경별 최적화**: Vercel/로컬 환경별 설정
- **오류 처리**: 타임아웃, 재시도, 부분 실패 허용

## 🔮 계획된 기능

### 단기 계획 (1-2개월)

- **알림 기능**: 원하는 상품 등록 시 알림
- **가격 변동 추적**: 상품 가격 히스토리
- **사용자 계정**: 찜하기, 검색 기록
- **고급 필터**: 지역, 카테고리, 상태별 필터

### 중기 계획 (3-6개월)

- **추가 플랫폼**: 쿠팡, 네이버쇼핑 연동
- **AI 채팅봇**: 상품 관련 질문 응답
- **가격 예측**: 머신러닝 기반 가격 트렌드 예측
- **모바일 앱**: React Native 기반 모바일 앱

### 장기 계획 (6개월+)

- **커뮤니티 기능**: 리뷰, 평점, 댓글
- **판매자 평가**: AI 기반 판매자 신뢰도 분석
- **자동 협상**: AI 기반 가격 협상 도우미
- **API 서비스**: 외부 개발자용 API 제공

## 🧩 React 컴포넌트 구조

### 페이지 컴포넌트

```typescript
app/
├── page.tsx                    // 홈페이지 (검색 시작점)
├── search/
│   ├── page.tsx               // 검색 결과 페이지 래퍼
│   └── SearchPageContent.tsx  // 메인 검색 기능
├── compare/
│   ├── page.tsx               // 비교 페이지 래퍼
│   └── ComparisonPageContent.tsx // 비교 분석 기능
└── product/[id]/page.tsx      // 상품 상세 페이지
```

### UI 컴포넌트

```typescript
components/ui/
├── logo.tsx           // 브랜드 로고 (SVG 애니메이션)
├── theme-provider.tsx // 다크/라이트 모드
├── theme-toggle.tsx   // 테마 전환 버튼
├── dynamic-loader.tsx // 동적 로딩 애니메이션
├── button.tsx         // 버튼 컴포넌트
├── input.tsx          // 입력 필드
├── card.tsx           // 카드 레이아웃
├── badge.tsx          // 소스 배지
├── table.tsx          // 비교 테이블
├── tabs.tsx           // 탭 네비게이션
├── slider.tsx         // 가격 범위 슬라이더
└── select.tsx         // 드롭다운 선택
```

### 컴포넌트별 역할

#### SearchPageContent.tsx

- **상태 관리**: 검색어, 필터, 결과, AI 추천
- **API 호출**: 검색 및 AI 추천 API
- **UI 렌더링**: 상품 카드, 필터, 로딩 상태
- **상호작용**: 상품 선택, 비교 모드 전환

#### ComparisonPageContent.tsx

- **URL 파라미터 파싱**: 선택된 상품 정보 복원
- **비교 분석 API 호출**: 상세 정보 및 AI 분석
- **결과 시각화**: 점수 차트, 비교 테이블
- **추천 표시**: AI 기반 최고 가치 상품

#### DynamicLoader.tsx

- **타입별 로딩**: search, ai-analysis, comparison
- **진행률 표시**: 실시간 진행률 바
- **애니메이션**: Framer Motion 기반 부드러운 전환
- **단계 표시**: 각 작업 단계별 메시지

## 🤖 AI 기능

### AI 추천 시스템 (/api/ai-recommend)

#### 사용 모델

- **모델**: meta-llama/llama-3.1-8b-instruct:free
- **제공자**: OpenRouter API
- **언어**: 한국어 특화 프롬프트

#### 동작 방식

```typescript
// 1. 상품 데이터 전처리 (최대 20개)
const maxProducts = Math.min(products.length, 20);
const selectedProducts = products.slice(0, maxProducts);

// 2. AI 프롬프트 생성
const prompt = `당신은 한국 중고거래 전문가입니다. 
검색어: "${query}"
분석 기준:
1. 검색어와의 관련성
2. 가격 대비 가치  
3. 상품 상태 및 신뢰도
4. 전체적인 만족도 예상`;

// 3. OpenRouter API 호출
const response = await fetch("https://openrouter.ai/api/v1/chat/completions");

// 4. JSON 파싱 및 상품 ID 변환
const recommendedIds = validIndices.map((index) => products[index].id);
```

#### 최적화 기법

- **액세서리 필터링**: iPhone 검색 시 케이스, 충전기 제외
- **상품 제한**: 최대 20개로 제한하여 응답 속도 향상
- **타임아웃**: 10초 제한으로 안정성 확보
- **오류 처리**: JSON 파싱 실패 시 안전한 폴백

### AI 비교 시스템 (/api/compare)

#### 비교 분석 과정

```typescript
// 1. 상세 정보 수집 (병렬 처리)
const detailedProducts = await scraper.scrapeProductsDetails(products);

// 2. AI 비교 분석 요청
const prompt = `중고거래 전문가로서 ${products.length}개 제품을 상세히 비교 분석해주세요.
분석 지침:
- 제목과 설명을 자세히 읽고 실제 상태를 추출하세요
- 판매자의 신뢰도와 거래방식을 분석하세요  
- 실제 사양과 가격 대비 가치를 평가하세요`;

// 3. 구조화된 응답 생성
interface ComparisonAnalysis {
  comparison: Record<string, string>; // 카테고리별 비교
  products: ProductAnalysis[]; // 개별 상품 분석
  bestValue: { productId: string; reason: string }; // 최고 가치 상품
  recommendations: string; // 구매 가이드
  summary: string; // 핵심 요약
}
```

#### AI 분석 항목

- **가격 비교**: 동일 사양 대비 가격 분석
- **상태 평가**: 설명에서 추출한 실제 상태 정보
- **판매자 신뢰도**: 플랫폼별 판매자 특징 분석
- **사양 비교**: 기술적 스펙 차이점
- **거래 편의성**: 위치, 배송 방식 등

## 🕸 웹 스크래핑 알고리즘

### 아키텍처 개요

#### BaseScraper 클래스

```typescript
export abstract class BaseScraper {
  protected browser: Browser | null = null;
  protected page: Page | null = null;

  abstract sourceName: string;
  abstract baseUrl: string;
  abstract searchProducts(query: string, limit?: number): Promise<Product[]>;
}
```

#### 공통 최적화 기법

- **리소스 차단**: 이미지, CSS, 폰트 로딩 차단으로 속도 향상
- **작은 뷰포트**: 모바일 크기로 설정하여 메모리 절약
- **타임아웃 설정**: Vercel(15초)/로컬(8초) 환경별 차별화
- **빠른 스크롤**: 3회만 스크롤하여 lazy loading 트리거

### 플랫폼별 스크래핑 전략

#### 1. 당근마켓 (DanggeunFastScraper)

**전략**: Fast-Fetch → Puppeteer 폴백

```typescript
// Fast-Fetch 방식 (1차 시도)
const searchUrl = `${this.baseUrl}/kr/buy-sell/?in=${region}&search=${query}`;
const response = await fetch(searchUrl, { headers: mobileHeaders });
const html = await response.text();

// 정규표현식으로 상품 추출
const articleRegex = /<a[^>]*data-gtm="search_article"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
```

**특징**:

- **지역 기반**: 마장동-56 기본 설정
- **차단 감지**: "차단", "robot" 키워드 체크
- **Puppeteer 폴백**: Fast-Fetch 실패 시 브라우저 자동화
- **이미지 URL 정리**: 상대 경로 → 절대 경로 변환

#### 2. 번개장터 (BunjangFastScraper)

**전략**: API 직접 호출 (초고속)

```typescript
// 공개 API 활용
const apiUrl = `https://api.bunjang.co.kr/api/1/find_v2.json?q=${query}&n=${limit}`;
const response = await fetch(apiUrl, { headers: apiHeaders });
const data = await response.json();

// API 응답 직접 파싱
data.list.forEach((item) => {
  const productUrl = `${this.baseUrl}/products/${item.pid}`;
  const imageUrl = item.product_image.replace("{res}", "266");
});
```

**특징**:

- **최고 속도**: API 호출로 5초 내 완료
- **안정성**: Puppeteer 불필요로 차단 위험 없음
- **이미지 처리**: {res} 템플릿 → 실제 해상도 변환
- **5초 타임아웃**: API 특성상 빠른 응답 기대

#### 3. 중고나라 (JunggonaraFastScraper)

**전략**: HTML 파싱 (Cheerio 활용)

```typescript
// 직접 HTML 요청
const searchUrl = `https://web.joongna.com/search/${encodeURIComponent(query)}`;
const response = await fetch(searchUrl, { headers: desktopHeaders });
const html = await response.text();

// 여러 선택자로 안정성 확보
const selectors = [
  'a[href^="/product/"]', // 주 선택자
  "a.relative.group", // 백업 선택자
  ".relative.group a", // 대체 선택자
];
```

**특징**:

- **다중 선택자**: 페이지 구조 변경에 대한 내성
- **차단 감지**: "Access Denied", HTML 길이 체크
- **한국어 검증**: 정상 페이지 여부 확인
- **8초 타임아웃**: HTML 파싱 시간 고려

### 환경별 최적화

#### Vercel 환경

```typescript
const SCRAPER_CONFIG = {
  INDIVIDUAL_TIMEOUT: 28000, // 일반 스크래퍼
  DANGGEUN_TIMEOUT: 35000, // 당근마켓 전용 (복잡함)
  TOTAL_TIMEOUT: 38000, // 전체 제한시간
  PARALLEL_LIMIT: 3, // 3개 플랫폼 동시 실행
  VERCEL_FAST_MODE: true, // 조기 종료 허용
  GRACEFUL_DEGRADATION: true, // 부분 성공 허용
};
```

#### 로컬 환경

```typescript
const SCRAPER_CONFIG = {
  INDIVIDUAL_TIMEOUT: 8000, // 빠른 로컬 환경
  TOTAL_TIMEOUT: 25000,
  PARALLEL_LIMIT: 2, // 리소스 절약
  VERCEL_FAST_MODE: false, // 완전한 결과 대기
};
```

### 브라우저 관리 (browser-manager.ts)

#### 싱글톤 패턴

```typescript
class BrowserManager {
  private browser: Browser | null = null;
  private isLaunching = false; // 중복 실행 방지

  async getBrowser(): Promise<Browser> {
    if (this.browser?.connected) return this.browser;
    // 브라우저 실행 로직...
  }
}
```

#### Vercel 최적화 설정

```typescript
const vercelArgs = [
  "--no-sandbox", // 보안 제한 제거
  "--disable-dev-shm-usage", // 메모리 최적화
  "--disable-gpu", // GPU 비활성화
  "--disable-background-timer-throttling", // 성능 향상
  "--memory-pressure-off", // 메모리 압박 해제
  "--max_old_space_size=4096", // Node.js 힙 크기
  "--aggressive-cache-discard", // 캐시 적극 정리
];
```

## 🔌 API 엔드포인트

### 1. 검색 API (/api/search)

#### 요청 형식

```typescript
interface SearchRequest {
  query: string; // 검색어
  sources: string[]; // ["danggeun", "bunjang", "junggonara"]
  limit: number; // 결과 개수 (기본: 50)
}
```

#### 응답 형식

```typescript
interface SearchResponse {
  query: string;
  sources: string[];
  count: number;
  products: Product[];
  executionTime: number;
  warnings?: string[]; // 부분 실패 경고
}
```

#### 최적화 로직

- **우선순위 스크래핑**: 중고나라 → 번개장터 → 당근마켓
- **Vercel 고속 모드**: 충분한 결과 확보 시 조기 종료
- **타임아웃 처리**: 개별/전체 타임아웃으로 안정성 확보

### 2. AI 추천 API (/api/ai-recommend)

#### 요청/응답

```typescript
interface AIRecommendRequest {
  query: string;
  products: Product[];
}

interface AIRecommendResponse {
  success: boolean;
  recommendedIds: string[]; // 추천 상품 ID 배열
  reasoning: string; // 한국어 추천 이유
  executionTime: number;
}
```

### 3. 비교 API (/api/compare)

#### 요청 형식

```typescript
interface ComparisonRequest {
  products: Product[]; // 비교할 상품 목록
}
```

#### 분석 결과

```typescript
interface ComparisonAnalysis {
  comparison: {
    가격: string; // 가격 비교 요약
    상태: string; // 상태 분석
    판매자: string; // 판매자 신뢰도
    사양: string; // 사양 비교
  };
  products: ProductAnalysis[]; // 개별 상품 분석
  bestValue: {
    // 최고 가치 상품
    productId: string;
    reason: string;
  };
}
```

### 4. 디버그 API (/api/debug-env)

환경 정보 및 설정 확인용

```typescript
interface DebugInfo {
  environment: {
    isVercel: boolean;
    platform: string;
    nodeVersion: string;
  };
  scraperConfig: typeof SCRAPER_CONFIG;
  memoryUsage: NodeJS.MemoryUsage;
  envVars: {
    hasOpenRouterKey: boolean;
  };
}
```

## ⚠️ 문제점과 해결방안

### 1. 웹 스크래핑 차단 문제

#### 문제점

- **반복 요청 차단**: IP 기반 차단
- **봇 감지**: User-Agent, 브라우저 시그니처 감지
- **CAPTCHA**: 자동화 방지 시스템

#### 해결방안

```typescript
// 1. Fast-Fetch 우선 시도
const fetchResults = await this.tryFetchApproach(query, limit);
if (fetchResults.length > 0) {
  return fetchResults; // 차단 없이 성공
}

// 2. Puppeteer 폴백
return await this.tryPuppeteerApproach(query, limit);

// 3. 실제 브라우저 시뮬레이션
await page.setUserAgent("Mozilla/5.0 (Macintosh...)");
await page.setViewport({ width: 1280, height: 800 });
```

#### 추가 대응책

- **회전 User-Agent**: 여러 브라우저 시그니처 순환
- **요청 간격**: 인간적인 요청 패턴 모방
- **API 활용**: 번개장터처럼 공개 API 우선 사용

### 2. Vercel 서버리스 제한

#### 문제점

- **실행 시간 제한**: 최대 60초
- **메모리 제한**: 1GB
- **콜드 스타트**: 초기 실행 지연

#### 해결방안

```typescript
// 환경별 타임아웃 설정
const isVercel = process.env.VERCEL === "1";
const SCRAPER_CONFIG = {
  INDIVIDUAL_TIMEOUT: isVercel ? 28000 : 8000,
  VERCEL_FAST_MODE: isVercel, // 조기 종료 허용
  GRACEFUL_DEGRADATION: isVercel, // 부분 성공 허용
};

// 메모리 최적화
const vercelArgs = [
  "--memory-pressure-off",
  "--max_old_space_size=4096",
  "--aggressive-cache-discard",
];
```

### 3. AI API 안정성 문제

#### 문제점

- **API 키 만료**: 무료 할당량 초과
- **응답 불안정**: JSON 파싱 실패
- **느린 응답**: 대용량 프롬프트 처리 지연

#### 해결방안

```typescript
// 1. 프롬프트 최적화
const maxProducts = Math.min(products.length, 20); // 상품 수 제한
const selectedProducts = products.slice(0, maxProducts);

// 2. 안전한 JSON 파싱
try {
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  const jsonString = jsonMatch ? jsonMatch[0] : responseText;
  recommendationData = JSON.parse(jsonString);
} catch (parseError) {
  return { success: false, error: "JSON 파싱 실패" };
}

// 3. 타임아웃 및 폴백
signal: AbortSignal.timeout(15000), // 15초 제한
```

### 4. 성능 및 안정성 문제

#### 초기 문제점 (example scraper에서 확인)

- **메모리 누수**: 페이지 정리 미흡
- **긴 대기시간**: `networkidle2` 사용으로 느린 로딩
- **동기화 처리**: 순차 실행으로 비효율

#### 현재 해결책

```typescript
// 1. 적절한 정리
try {
  const results = await scraper.searchProducts(query, limit);
  return results;
} finally {
  await scraper.cleanup(); // 반드시 정리
}

// 2. 빠른 로딩 전략
await page.goto(url, { waitUntil: "domcontentloaded" }); // networkidle2 대신
await page.waitForSelector(selector, { timeout: 5000 });

// 3. 병렬 처리
const batchPromises = sources.map((source) => runScraperWithTimeout(ScraperClass, query, limit));
const results = await Promise.all(batchPromises);
```

## 🚀 성능 최적화

### 1. 스크래핑 최적화

#### Fast-Fetch 전략

```typescript
// HTTP 직접 요청으로 10배 속도 향상
const response = await fetch(searchUrl, {
  signal: AbortSignal.timeout(5000), // 빠른 타임아웃
  headers: {
    /* 최적화된 헤더 */
  },
});

// Cheerio로 빠른 파싱
const $ = cheerio.load(html);
$('a[href^="/product/"]').each((i, el) => {
  // 직접 DOM 파싱
});
```

#### 브라우저 최적화

```typescript
// 불필요한 리소스 차단
this.page.on("request", (request) => {
  const resourceType = request.resourceType();
  if (resourceType === "image" || resourceType === "stylesheet") {
    request.abort(); // 차단
  } else {
    request.continue();
  }
});
```

### 2. AI 응답 최적화

#### 프롬프트 최적화

```typescript
// 간결한 프롬프트로 응답 속도 향상
const prompt = `당신은 한국 중고거래 전문가입니다.
검색어: "${query}"
상품 목록: [최대 20개만]
응답은 반드시 JSON 형식으로만 해주세요.`;

// temperature 낮춤으로 일관성 향상
temperature: 0.3,
max_tokens: 1000, // 토큰 수 제한
```

### 3. 프론트엔드 최적화

#### 동적 로딩

```typescript
// 프로그레스 바로 사용자 경험 향상
const [progress, setProgress] = useState(0);

// 단계별 메시지 표시
const loadingSteps = {
  search: [
    { text: "번개장터 API 수집 중...", duration: 150 },
    { text: "중고나라 스크래핑 중...", duration: 200 },
    { text: "당근마켓 데이터 수집 중...", duration: 150 },
  ],
};
```

#### 상태 관리 최적화

```typescript
// useCallback으로 리렌더링 방지
const doSearch = useCallback(async () => {
  // 검색 로직
}, [queryFromUrl, selectedSources, priceRange]);

// 조건부 API 호출
useEffect(() => {
  if (products.length > 0 && !aiLoading) {
    getAIRecommendationsForProducts(products);
  }
}, [products, queryFromUrl]);
```

## ⚙️ 배포 설정

### Vercel 설정 (vercel.json)

```json
{
  "functions": {
    "app/api/search/route.ts": {
      "maxDuration": 50, // 검색 API: 50초
      "memory": 1024 // 1GB 메모리
    },
    "app/api/compare/route.ts": {
      "maxDuration": 60, // 비교 API: 60초
      "memory": 1024
    },
    "app/api/ai-recommend/route.ts": {
      "maxDuration": 30, // AI 추천: 30초
      "memory": 512 // 512MB 메모리
    }
  },
  "regions": ["icn1"], // 서울 리전
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    }
  ]
}
```

### 환경 변수

#### 필수 환경 변수

```bash
# AI 기능용
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Vercel 배포용
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
```

#### 개발 환경 설정

```bash
# 로컬 개발
npm run dev

# 빌드 테스트
npm run build
npm run start

# 타입 체크
npx tsc --noEmit
```

### 배포 최적화

#### Next.js 설정 (next.config.ts)

```typescript
const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Vercel 이미지 최적화 비활성화
  },
};
```

#### 패키지 최적화

- **@sparticuz/chromium-min**: Vercel용 경량 Chromium
- **puppeteer-core**: 기본 Chromium 제외한 경량 버전
- **cheerio**: 서버사이드 jQuery, 빠른 HTML 파싱

## 📊 성능 지표

### 현재 성능

- **검색 속도**: 5-15초 (플랫폼별 차이)
- **AI 추천**: 3-8초
- **상품 비교**: 10-30초 (상품 수에 따라)
- **동시 처리**: 3개 플랫폼 병렬

### 플랫폼별 속도

1. **번개장터**: ~2초 (API 직접 호출)
2. **중고나라**: 3-8초 (HTML 파싱)
3. **당근마켓**: 5-15초 (복잡한 구조)

### 최적화 목표

- **검색 속도**: 10초 이내
- **AI 응답**: 5초 이내
- **전체 워크플로우**: 20초 이내

---

## 📝 개발 현황

### 완료된 기능 ✅

- [x] 3개 플랫폼 통합 검색
- [x] AI 기반 상품 추천
- [x] AI 기반 상품 비교
- [x] 반응형 웹 디자인
- [x] 다크/라이트 테마
- [x] Vercel 배포 최적화

### 진행 중인 작업 🔄

- [ ] 성능 모니터링 시스템
- [ ] 오류 추적 및 알림
- [ ] 캐싱 시스템 개선
- [ ] 추가 플랫폼 연동

### 기술 부채 ⚠️

- 레거시 스크래퍼 코드 정리 필요 (example scraper 폴더)
- 타입 정의 통합 및 정리
- 테스트 코드 부족
- 에러 처리 표준화 필요

---

**더나와 팀** | 2025년 5월
