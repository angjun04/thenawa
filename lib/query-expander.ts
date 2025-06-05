export class QueryExpander {
    private static rules = new Map<string, string[]>([
      ['아이폰', ['아이폰', 'iPhone', '아폰']],
      ['iphone', ['iPhone', '아이폰', '아폰']],
      ['갤럭시', ['갤럭시', 'Galaxy', '갤랙시']],
      ['galaxy', ['Galaxy', '갤럭시', '갤랙시']],
      ['노트북', ['노트북', '랩톱', 'laptop']],
      ['laptop', ['laptop', '노트북', '랩톱']],
      ['맥북', ['맥북', 'MacBook', '맥북프로']],
      ['macbook', ['MacBook', '맥북', '맥북프로']],
    ])
  
    static expandQuery(query: string): string[] {
      const normalizedQuery = query.toLowerCase().trim()
      
      for (const [key, variations] of this.rules.entries()) {
        if (normalizedQuery.includes(key)) {
          return variations
        }
      }
      
      return [query]
    }
  }