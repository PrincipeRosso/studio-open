import { tool } from 'ai';
import { z } from 'zod';
import { tavilyService } from '../services/tavily-service';
import { extractImagesFromResults } from '../services/image-extraction-service';

export const webSearchTool = tool({
  description: 'Esegue una ricerca web per ottenere informazioni aggiornate su qualsiasi argomento. Usa questo strumento quando l\'utente chiede informazioni che potrebbero essere cambiate di recente o quando hai bisogno di dati attuali.',
  inputSchema: z.object({
    query: z.string().describe('La query di ricerca da eseguire sul web'),
  }),
  execute: async ({ query }) => {
    try {
      const results = await tavilyService.search(query, {
        maxResults: 8, // Aumentiamo per avere più fonti
        includeAnswer: true,
        includeRawContent: true,
        includeImages: true,
        searchDepth: 'advanced',
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

      // Determina la lingua della query per il summary
      const detectLanguage = (text: string): string => {
        const italianWords = ['il', 'la', 'di', 'che', 'e', 'un', 'una', 'per', 'con', 'su', 'da', 'in', 'del', 'della', 'dei', 'delle'];
        const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about'];
        
        const words = text.toLowerCase().split(/\s+/);
        const italianCount = words.filter(word => italianWords.includes(word)).length;
        const englishCount = words.filter(word => englishWords.includes(word)).length;
        
        return italianCount > englishCount ? 'italiano' : 'inglese';
      };

      const userLanguage = detectLanguage(query);
      const languageInstruction = userLanguage === 'italiano' 
        ? 'Rispondi sempre in italiano e fornisci un riassunto COMPLETO e DETTAGLIATO in italiano di almeno 3-4 paragrafi con informazioni approfondite, dettagli specifici, statistiche, date, nomi e contesto completo. Struttura la risposta con: Introduzione, Sviluppo dettagliato, Conclusioni.'
        : 'Respond in English and provide a COMPLETE and DETAILED summary in English of at least 3-4 paragraphs with in-depth information, specific details, statistics, dates, names and complete context. Structure the response with: Introduction, Detailed Development, Conclusions.';

      // Ritorna un oggetto semplice con i risultati
      return {
        query: results.query,
        answer: results.answer || 'Nessuna risposta sintetizzata disponibile',
        sources: results.results.slice(0, 5).map(result => { // Mostra sempre 5 fonti
          const images = result.images && result.images.length > 0
            ? result.images
            : extractedImages?.has(result.url)
              ? [extractedImages.get(result.url)!]
              : [];
          
          return {
            title: result.title,
            url: result.url,
            content: result.content.substring(0, 300),
            images,
            rawContent: result.raw_content,
            publishedDate: result.published_date,
            relevanceScore: result.score,
          };
        }),
        followUpQuestions: results.follow_up_questions || [],
        languageInstruction, // Aggiungiamo l'istruzione per la lingua
      };
    } catch (error) {
      console.error('Errore nel web search tool:', error);
      return {
        query,
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
        answer: 'Non sono riuscito a completare la ricerca web richiesta.',
        sources: [],
      };
    }
  },
});

export const newsSearchTool = tool({
  description: 'Esegue una ricerca di notizie per ottenere informazioni aggiornate su eventi recenti, notizie e sviluppi attuali.',
  inputSchema: z.object({
    query: z.string().describe('La query di ricerca per le notizie'),
  }),
  execute: async ({ query }) => {
    try {
      const results = await tavilyService.searchNews(query, 8, { // Aumentiamo anche per le notizie
        includeImages: true,
        includeRawContent: true,
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

      // Determina la lingua della query per il summary
      const detectLanguage = (text: string): string => {
        const italianWords = ['il', 'la', 'di', 'che', 'e', 'un', 'una', 'per', 'con', 'su', 'da', 'in', 'del', 'della', 'dei', 'delle'];
        const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about'];
        
        const words = text.toLowerCase().split(/\s+/);
        const italianCount = words.filter(word => italianWords.includes(word)).length;
        const englishCount = words.filter(word => englishWords.includes(word)).length;
        
        return italianCount > englishCount ? 'italiano' : 'inglese';
      };

      const userLanguage = detectLanguage(query);
      const languageInstruction = userLanguage === 'italiano' 
        ? 'Rispondi sempre in italiano e fornisci un riassunto COMPLETO e DETTAGLIATO delle notizie in italiano di almeno 3-4 paragrafi con informazioni approfondite, dettagli specifici, statistiche, date, nomi e contesto completo. Struttura la risposta con: Introduzione, Sviluppo dettagliato, Conclusioni.'
        : 'Respond in English and provide a COMPLETE and DETAILED summary of the news in English of at least 3-4 paragraphs with in-depth information, specific details, statistics, dates, names and complete context. Structure the response with: Introduction, Detailed Development, Conclusions.';

      return {
        query: results.query,
        answer: results.answer || 'Nessuna sintesi disponibile',
        news: results.results.slice(0, 5).map(result => { // Mostra sempre 5 notizie
          const images = result.images && result.images.length > 0
            ? result.images
            : extractedImages?.has(result.url)
              ? [extractedImages.get(result.url)!]
              : [];
          
          return {
            title: result.title,
            url: result.url,
            content: result.content.substring(0, 300),
            images,
            rawContent: result.raw_content,
            publishedDate: result.published_date,
            relevanceScore: result.score,
          };
        }),
        followUpQuestions: results.follow_up_questions || [],
        languageInstruction, // Aggiungiamo l'istruzione per la lingua
      };
    } catch (error) {
      console.error('Errore nel news search tool:', error);
      return {
        query,
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
        answer: 'Non sono riuscito a completare la ricerca notizie richiesta.',
        news: [],
      };
    }
  },
});