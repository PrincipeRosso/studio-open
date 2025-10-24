import { TavilyClient } from 'tavily';

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  images?: string[];
  raw_content?: string;
  published_date?: string;
}

export interface TavilySearchResponse {
  results: TavilySearchResult[];
  answer?: string;
  query: string;
  follow_up_questions?: string[];
}

export class TavilyService {
  private client: TavilyClient;

  constructor() {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
      throw new Error('TAVILY_API_KEY environment variable is required');
    }
    this.client = new TavilyClient({ 
      apiKey,
      timeout: 30000 // 30 secondi di timeout
    });
  }

  async search(query: string, options?: {
    maxResults?: number;
    includeDomains?: string[];
    excludeDomains?: string[];
    includeAnswer?: boolean;
    includeRawContent?: boolean;
    includeImages?: boolean;
    searchDepth?: 'basic' | 'advanced';
  }): Promise<TavilySearchResponse> {
    try {
      const response = await this.client.search({
        query,
        max_results: options?.maxResults || 5,
        include_domains: options?.includeDomains,
        exclude_domains: options?.excludeDomains,
        include_answer: options?.includeAnswer !== false,
        include_raw_content: options?.includeRawContent !== false,
        include_images: options?.includeImages !== false,
        search_depth: options?.searchDepth || 'advanced',
      });

      // Log dettagliato per debug
      console.log('Tavily search response:', {
        query: response.query,
        resultsCount: response.results?.length || 0,
        hasAnswer: !!response.answer,
        firstResult: response.results?.[0] ? {
          title: response.results[0].title,
          hasImages: !!response.results[0].images,
          imagesCount: response.results[0].images?.length || 0,
          images: response.results[0].images || [],
        } : 'no results',
        includeImages: options?.includeImages,
        includeRawContent: options?.includeRawContent,
        searchDepth: options?.searchDepth,
        rawResponse: JSON.stringify(response.results?.[0] || {}).substring(0, 500)
      });

      return {
        results: response.results || [],
        answer: response.answer,
        query: response.query,
        follow_up_questions: response.follow_up_questions,
      };
    } catch (error) {
      console.error('Errore nella ricerca Tavily:', error);
      throw new Error('Errore durante la ricerca web');
    }
  }

  async searchNews(query: string, maxResults: number = 5, options?: {
    includeImages?: boolean;
    includeRawContent?: boolean;
  }): Promise<TavilySearchResponse> {
    try {
      const response = await this.client.search({
        query,
        max_results: maxResults,
        search_depth: 'basic',
        include_answer: true,
        include_raw_content: options?.includeRawContent !== false,
        include_images: options?.includeImages !== false,
      });

      // Log dettagliato per debug
      console.log('Tavily news search response:', {
        query: response.query,
        resultsCount: response.results?.length || 0,
        hasAnswer: !!response.answer,
        firstResult: response.results?.[0] ? {
          title: response.results[0].title,
          hasImages: !!response.results[0].images,
          imagesCount: response.results[0].images?.length || 0,
          images: response.results[0].images || [],
        } : 'no results',
        includeImages: options?.includeImages,
        includeRawContent: options?.includeRawContent,
        rawResponse: JSON.stringify(response.results?.[0] || {}).substring(0, 500)
      });

      return {
        results: response.results || [],
        answer: response.answer,
        query: response.query,
        follow_up_questions: response.follow_up_questions,
      };
    } catch (error) {
      console.error('Errore nella ricerca news Tavily:', error);
      throw new Error('Errore durante la ricerca news');
    }
  }
}

export const tavilyService = new TavilyService();
