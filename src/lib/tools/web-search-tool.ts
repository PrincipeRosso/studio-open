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
            content: result.content.substring(0, 500), // Aumentato da 300 a 500 caratteri per più contesto
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
        news: results.results.slice(0, 5).map(result => { // Mostra sempre 5 notizie
          const images = result.images && result.images.length > 0
            ? result.images
            : extractedImages?.has(result.url)
              ? [extractedImages.get(result.url)!]
              : [];
          
          return {
            title: result.title,
            url: result.url,
            content: result.content.substring(0, 500), // Aumentato da 300 a 500 caratteri per più contesto
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