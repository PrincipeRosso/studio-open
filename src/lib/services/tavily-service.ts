import { TavilyClient } from 'tavily';

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: string | number;
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
      apiKey
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
      // Parametri semplificati per evitare timeout
      const response = await this.client.search({
        query,
        max_results: options?.maxResults || 5,                    // Ridotto per evitare timeout
        include_domains: options?.includeDomains,
        exclude_domains: options?.excludeDomains,
        include_answer: true,                                      // Sempre abilitato per summary migliori
        include_raw_content: false,                               // Disabilitato per ridurre carico
        include_images: true,                                      // Sempre abilitato per immagini
        search_depth: 'basic',                                    // Ridotto per evitare timeout
      });

      // Log dettagliato per debug - Immagini e Summary
      console.log('🔍 Tavily search response:', {
        query: response.query,
        resultsCount: response.results?.length || 0,
        hasAnswer: !!response.answer,
        answerLength: response.answer?.length || 0,
        imagesFound: response.results?.reduce((total, r) => total + ((r as any).images?.length || 0), 0) || 0,
        firstResult: response.results?.[0] ? {
          title: response.results[0].title,
          hasImages: !!(response.results[0] as any).images,
          imagesCount: (response.results[0] as any).images?.length || 0,
          images: (response.results[0] as any).images || [],
          hasRawContent: !!response.results[0].raw_content,
          rawContentLength: response.results[0].raw_content?.length || 0,
        } : 'no results',
        allResultsImages: response.results?.map(r => ({
          title: r.title,
          imagesCount: (r as any).images?.length || 0,
          images: (r as any).images || []
        })) || [],
        parameters: {
          maxResults: options?.maxResults || 8,
          includeAnswer: true,
          includeRawContent: true,
          includeImages: true,
          searchDepth: 'advanced',
          includeDomains: options?.includeDomains,
          excludeDomains: options?.excludeDomains
        }
      });

      return {
        results: response.results || [],
        answer: response.answer,
        query: response.query,
        follow_up_questions: response.follow_up_questions,
      };
    } catch (error) {
      console.error('Errore nella ricerca Tavily:', error);
      
      // Gestione errori specifici
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('TimeoutError')) {
          throw new Error('Timeout: La ricerca sta impiegando troppo tempo. Riprova con una query più semplice.');
        } else if (error.message.includes('rate limit')) {
          throw new Error('Rate limit: Troppe richieste. Riprova tra qualche minuto.');
        } else if (error.message.includes('unauthorized') || error.message.includes('401')) {
          throw new Error('Errore di autenticazione: Verifica la chiave API Tavily.');
        }
      }
      
      throw new Error('Errore durante la ricerca web: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'));
    }
  }

  async searchNews(query: string, maxResults: number = 8, options?: {
    includeImages?: boolean;
    includeRawContent?: boolean;
    includeDomains?: string[];
    excludeDomains?: string[];
  }): Promise<TavilySearchResponse> {
    try {
      // Parametri semplificati per evitare timeout
      const response = await this.client.search({
        query,
        max_results: maxResults,                                    // Ridotto per evitare timeout
        search_depth: 'basic',                                     // Ridotto per evitare timeout
        include_answer: true,                                       // Sempre abilitato per summary migliori
        include_raw_content: false,                                 // Disabilitato per ridurre carico
        include_images: true,                                       // Sempre abilitato per immagini
        include_domains: options?.includeDomains,
        exclude_domains: options?.excludeDomains,
      });

      // Log dettagliato per debug - News con Immagini e Summary
      console.log('📰 Tavily news search response:', {
        query: response.query,
        resultsCount: response.results?.length || 0,
        hasAnswer: !!response.answer,
        answerLength: response.answer?.length || 0,
        imagesFound: response.results?.reduce((total, r) => total + ((r as any).images?.length || 0), 0) || 0,
        firstResult: response.results?.[0] ? {
          title: response.results[0].title,
          hasImages: !!(response.results[0] as any).images,
          imagesCount: (response.results[0] as any).images?.length || 0,
          images: (response.results[0] as any).images || [],
          hasRawContent: !!response.results[0].raw_content,
          rawContentLength: response.results[0].raw_content?.length || 0,
        } : 'no results',
        allResultsImages: response.results?.map(r => ({
          title: r.title,
          imagesCount: (r as any).images?.length || 0,
          images: (r as any).images || []
        })) || [],
        parameters: {
          maxResults: maxResults,
          includeAnswer: true,
          includeRawContent: true,
          includeImages: true,
          searchDepth: 'advanced',
          includeDomains: options?.includeDomains,
          excludeDomains: options?.excludeDomains
        }
      });

      return {
        results: response.results || [],
        answer: response.answer,
        query: response.query,
        follow_up_questions: response.follow_up_questions,
      };
    } catch (error) {
      console.error('Errore nella ricerca news Tavily:', error);
      
      // Gestione errori specifici
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('TimeoutError')) {
          throw new Error('Timeout: La ricerca notizie sta impiegando troppo tempo. Riprova con una query più semplice.');
        } else if (error.message.includes('rate limit')) {
          throw new Error('Rate limit: Troppe richieste. Riprova tra qualche minuto.');
        } else if (error.message.includes('unauthorized') || error.message.includes('401')) {
          throw new Error('Errore di autenticazione: Verifica la chiave API Tavily.');
        }
      }
      
      throw new Error('Errore durante la ricerca news: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'));
    }
  }
}

// Lazy instantiation per evitare problemi con le variabili d'ambiente
let _tavilyService: TavilyService | null = null;

export const tavilyService = {
  get instance() {
    if (!_tavilyService) {
      _tavilyService = new TavilyService();
    }
    return _tavilyService;
  }
};
