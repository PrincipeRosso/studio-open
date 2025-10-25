import { tool } from 'ai';
import { z } from 'zod';
import { tavilyService } from '../services/tavily-service';
import { extractImagesFromResults } from '../services/image-extraction-service';

// Funzione helper per rilevare la lingua della query
function detectLanguage(query: string): 'it' | 'en' {
  const italianWords = [
    'come', 'cosa', 'quando', 'dove', 'perché', 'chi', 'quale', 'quali',
    'notizie', 'oggi', 'ieri', 'domani', 'questa', 'questo', 'questi',
    'italia', 'italiano', 'italiana', 'roma', 'milano', 'napoli', 'torino',
    'governo', 'politica', 'economia', 'sport', 'calcio', 'squadra',
    'partita', 'campionato', 'serie', 'juventus', 'inter', 'milan',
    'euro', 'europa', 'unione', 'parlamento', 'presidente', 'ministro'
  ];
  
  const englishWords = [
    'how', 'what', 'when', 'where', 'why', 'who', 'which', 'news',
    'today', 'yesterday', 'tomorrow', 'this', 'these', 'that',
    'italy', 'italian', 'rome', 'milan', 'naples', 'turin',
    'government', 'politics', 'economy', 'sport', 'football', 'team',
    'match', 'championship', 'league', 'juventus', 'inter', 'milan',
    'euro', 'europe', 'union', 'parliament', 'president', 'minister'
  ];
  
  const queryLower = query.toLowerCase();
  
  const italianCount = italianWords.filter(word => queryLower.includes(word)).length;
  const englishCount = englishWords.filter(word => queryLower.includes(word)).length;
  
  // Se non ci sono parole riconosciute, usa caratteri per determinare la lingua
  if (italianCount === 0 && englishCount === 0) {
    // Conta caratteri tipici italiani
    const italianChars = (query.match(/[àèéìíîòóùú]/gi) || []).length;
    const englishChars = (query.match(/[aeiou]/gi) || []).length;
    
    return italianChars > 0 ? 'it' : 'en';
  }
  
  return italianCount >= englishCount ? 'it' : 'en';
}

// Configurazioni per domini preferiti per lingua
const DOMAIN_CONFIGS = {
  it: {
    includeDomains: [
      'repubblica.it', 'corriere.it', 'ansa.it', 'tgcom24.mediaset.it',
      'ilsole24ore.com', 'gazzetta.it', 'sky.it', 'rainews.it',
      'adnkronos.com', 'ilmessaggero.it', 'lastampa.it', 'ilgiornale.it',
      'ilfattoquotidiano.it', 'huffingtonpost.it', 'fanpage.it',
      'tuttosport.com', 'calciomercato.com', 'sportmediaset.it'
    ]
  },
  en: {
    includeDomains: [
      'bbc.com', 'cnn.com', 'reuters.com', 'nytimes.com', 'washingtonpost.com',
      'guardian.com', 'independent.co.uk', 'telegraph.co.uk', 'ft.com',
      'wsj.com', 'bloomberg.com', 'forbes.com', 'techcrunch.com',
      'espn.com', 'sports.yahoo.com', 'skysports.com', 'goal.com'
    ]
  }
};

// Funzione helper per determinare se una query è relativa a notizie recenti
export function isNewsQuery(query: string): boolean {
  const newsKeywords = [
    'notizie', 'news', 'ultime notizie', 'recenti', 'oggi', 'ieri', 'questa settimana',
    'elezioni', 'politica', 'governo', 'parlamento', 'presidente', 'ministro',
    'economia', 'borsa', 'mercato', 'inflazione', 'crisi economica',
    'sport', 'calcio', 'partita', 'campionato', 'squadra',
    'emergenza', 'catastrofe', 'terremoto', 'alluvione', 'incidente',
    'scandalo', 'caso', 'indagine', 'arresto', 'processo',
    'summit', 'conferenza', 'vertice', 'incontro internazionale',
    'lancio', 'annuncio', 'nuovo prodotto', 'startup', 'IPO',
    'normativa', 'legge', 'decreto', 'regolamento', 'cambiamento normativo',
    'cronaca', 'eventi', 'accadimenti', 'sviluppi', 'aggiornamenti'
  ];
  
  const queryLower = query.toLowerCase();
  return newsKeywords.some(keyword => queryLower.includes(keyword));
}

// Funzione helper per eseguire web search
async function executeWebSearch(query: string) {
  try {
    // Rileva la lingua della query
    const language = detectLanguage(query);
    const domainConfig = DOMAIN_CONFIGS[language];
    
    console.log(`🌐 Ricerca web in lingua: ${language.toUpperCase()}`);
    console.log(`📰 Domini inclusi: ${domainConfig.includeDomains.slice(0, 3).join(', ')}...`);
    
    const results = await tavilyService.instance.search(query, {
      maxResults: 5, // Ridotto per evitare timeout
      includeAnswer: true,
      includeRawContent: false, // Disabilitato per ridurre carico
      includeImages: true,
      searchDepth: 'basic', // Ridotto per evitare timeout
      includeDomains: domainConfig.includeDomains
    });

    // Controlla se Tavily ha restituito immagini
    const hasImages = results.results.some(r => r.images && r.images.length > 0);
    
    // Se Tavily non ha restituito immagini, prova a estrarre da Open Graph
    let extractedImages: Map<string, string> | null = null;
    if (!hasImages) {
      console.log('Tavily non ha restituito immagini, provo a estrarre da Open Graph...');
      extractedImages = await extractImagesFromResults(results.results.map(r => ({ url: r.url, title: r.title })));
      console.log(`Immagini estratte: ${extractedImages.size}`);
    }

    // Istruzioni per il summary e la risposta dell'agente
    const languageInstruction = `Sei un Assistente di Ricerca esperto specializzato nella raccolta e analisi completa di informazioni. Il tuo obiettivo è aiutare gli utenti a trovare informazioni accurate, dettagliate e pertinenti su vari argomenti.

         ISTRUZIONI PER IL SUMMARY:
         Crea un summary DETTAGLIATO e PROFESSIONALE nella stessa lingua della query dell'utente che:
         1. Identifica il tema centrale e i sottotemi
         2. Fornisce un'analisi approfondita delle informazioni trovate
         3. Include dettagli specifici, statistiche, date e contesto
         4. Verifica le informazioni tra fonti multiple
         5. Presenta prospettive diverse quando rilevanti
         6. Fornisce citazioni e riferimenti appropriati
         7. Bilancia profondità tecnica con accessibilità
         
         Il summary deve essere:
         - Ben ricercato e accurato
         - Propriamente citato e referenziato
         - Logicamente strutturato e organizzato
         - Bilanciato nelle prospettive
         - Chiaro e accessibile
         - Tecnicamente preciso quando necessario
         - Pratico e applicabile
         
         IMPORTANTE - LA RISPOSTA DELL'AGENTE DOPO IL TOOL:
         Dopo aver mostrato questo summary dettagliato, l'agente deve rispondere in modo MOLTO BREVE (2-3 frasi massimo) nella stessa lingua della query dell'utente:
         - NON ripetere il summary già mostrato
         - Rispondi nella stessa lingua della query dell'utente
         - Aggiungi solo un breve commento contestuale o chiedi se serve altro approfondimento`;

    return {
      query: results.query,
      answer: results.answer || 'Nessuna risposta sintetizzata disponibile',
      sources: results.results.slice(0, 5).map(result => {
        const images = result.images && result.images.length > 0
          ? result.images
          : extractedImages?.has(result.url)
            ? [extractedImages.get(result.url)!]
            : [];
        
        return {
          title: result.title,
          url: result.url,
          content: result.content.substring(0, 500),
          images,
          rawContent: result.raw_content,
          publishedDate: result.published_date,
          relevanceScore: result.score,
        };
      }),
      followUpQuestions: results.follow_up_questions || [],
      languageInstruction,
    };
  } catch (error) {
    console.error('Errore nel web search:', error);
    return {
      query,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
      answer: 'Non sono riuscito a completare la ricerca web richiesta.',
      sources: [],
    };
  }
}

// Funzione helper per eseguire news search
async function executeNewsSearch(query: string) {
  try {
    // Rileva la lingua della query
    const language = detectLanguage(query);
    const domainConfig = DOMAIN_CONFIGS[language];
    
    console.log(`📰 Ricerca notizie in lingua: ${language.toUpperCase()}`);
    console.log(`📰 Domini inclusi: ${domainConfig.includeDomains.slice(0, 3).join(', ')}...`);
    
    const results = await tavilyService.instance.searchNews(query, 5, { // Ridotto per evitare timeout
      includeImages: true,
      includeRawContent: false, // Disabilitato per ridurre carico
      includeDomains: domainConfig.includeDomains
    });

    // Controlla se Tavily ha restituito immagini
    const hasImages = results.results.some(r => r.images && r.images.length > 0);
    
    // Se Tavily non ha restituito immagini, prova a estrarre da Open Graph
    let extractedImages: Map<string, string> | null = null;
    if (!hasImages) {
      console.log('Tavily news non ha restituito immagini, provo a estrarre da Open Graph...');
      extractedImages = await extractImagesFromResults(results.results.map(r => ({ url: r.url, title: r.title })));
      console.log(`Immagini news estratte: ${extractedImages.size}`);
    }

    // Istruzioni per il summary delle notizie e la risposta dell'agente
    const languageInstruction = `Sei un Assistente di Ricerca esperto specializzato nell'analisi di notizie e sviluppi attuali. Il tuo obiettivo è fornire una copertura completa e accurata degli eventi recenti.

         ISTRUZIONI PER IL SUMMARY DELLE NOTIZIE:
         Crea un summary DETTAGLIATO e GIORNALISTICO nella stessa lingua della query dell'utente che:
         1. Identifica gli eventi principali e i sottotemi
         2. Fornisce un'analisi approfondita delle notizie trovate
         3. Include dettagli specifici, sviluppi recenti, date e contesto
         4. Verifica le informazioni tra fonti multiple di notizie
         5. Presenta prospettive diverse quando rilevanti
         6. Fornisce citazioni dalle fonti giornalistiche
         7. Bilancia profondità informativa con chiarezza
         8. Collega eventi correlati quando appropriato
         
         Il summary delle notizie deve essere:
         - Ben ricercato e verificato
         - Propriamente citato dalle fonti
         - Logicamente strutturato e cronologico
         - Bilanciato nelle prospettive
         - Chiaro e accessibile
         - Giornalisticamente preciso
         - Attuale e rilevante
         
         IMPORTANTE - LA RISPOSTA DELL'AGENTE DOPO IL TOOL:
         Dopo aver mostrato questo summary dettagliato, l'agente deve rispondere in modo MOLTO BREVE (2-3 frasi massimo) nella stessa lingua della query dell'utente:
         - NON ripetere il summary già mostrato
         - Rispondi nella stessa lingua della query dell'utente
         - Aggiungi solo un breve commento contestuale o chiedi se serve altro approfondimento`;

    return {
      query: results.query,
      answer: results.answer || 'Nessuna sintesi disponibile',
      news: results.results.slice(0, 5).map(result => {
        const images = result.images && result.images.length > 0
          ? result.images
          : extractedImages?.has(result.url)
            ? [extractedImages.get(result.url)!]
            : [];
        
        return {
          title: result.title,
          url: result.url,
          content: result.content.substring(0, 500),
          images,
          rawContent: result.raw_content,
          publishedDate: result.published_date,
          relevanceScore: result.score,
        };
      }),
      followUpQuestions: results.follow_up_questions || [],
      languageInstruction,
    };
  } catch (error) {
    console.error('Errore nel news search:', error);
    return {
      query,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
      answer: 'Non sono riuscito a completare la ricerca notizie richiesta.',
      news: [],
    };
  }
}

// Tool unificato che seleziona automaticamente tra web search e news search
export const smartSearchTool = tool({
  description: 'Esegue una ricerca intelligente che seleziona automaticamente tra ricerca web generale e ricerca notizie in base al contenuto della query. Questo tool previene la ridondanza utilizzando sempre il tool più appropriato.',
  inputSchema: z.object({
    query: z.string().describe('La query di ricerca da eseguire'),
  }),
  execute: async ({ query }) => {
    // Determina se la query è relativa a notizie recenti
    const isNews = isNewsQuery(query);
    
    if (isNews) {
      // Usa news search per query relative a notizie
      return await executeNewsSearch(query);
    } else {
      // Usa web search per query generali
      return await executeWebSearch(query);
    }
  },
});
