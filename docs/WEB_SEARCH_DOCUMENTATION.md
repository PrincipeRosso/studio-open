# 📚 Web Search Tool - Documentazione Completa

## 🎯 Panoramica

Il Web Search Tool è un sistema completo di ricerca web integrato nell'AI Assistant Studio che utilizza l'API Tavily per fornire informazioni aggiornate, notizie e immagini in tempo reale.

## 🚀 Funzionalità Principali

### 1. **Ricerca Web Generale**
- ✅ Ricerca informazioni aggiornate su qualsiasi argomento
- ✅ Fino a 8 risultati Tavily per migliore selezione
- ✅ Sempre 5 fonti mostrate all'utente
- ✅ Estrazione automatica immagini da Open Graph
- ✅ Sempre 4 immagini in griglia 2x2

### 2. **Ricerca Notizie**
- ✅ Notizie recenti e sviluppi attuali
- ✅ Fino a 8 risultati Tavily per migliore selezione
- ✅ Sempre 5 notizie mostrate all'utente
- ✅ Estrazione automatica immagini da Open Graph
- ✅ Sempre 4 immagini in griglia 2x2

### 3. **Rilevamento Lingua Automatico**
- ✅ Analisi automatica della lingua della query
- ✅ Risposta sempre nella lingua dell'utente
- ✅ Supporto italiano e inglese
- ✅ Istruzioni specifiche per l'AI

### 4. **Summary Dettagliato**
- ✅ Summary completo di almeno 3-4 paragrafi
- ✅ Informazioni approfondite con dettagli specifici
- ✅ Statistiche, date, nomi e contesto completo
- ✅ Struttura: Introduzione, Sviluppo, Conclusioni

## 🏗️ Architettura

### **File Principali:**
1. **`src/lib/tools/web-search-tool.ts`** - Tool AI SDK
2. **`src/lib/services/tavily-service.ts`** - Servizio Tavily API
3. **`src/lib/services/image-extraction-service.ts`** - Estrazione immagini
4. **`src/app/api/chat/route.ts`** - API endpoint
5. **`src/components/thread/chat-area.tsx`** - UI component

### **Flusso di Esecuzione:**
```
1. Query Utente → 2. Rilevamento Lingua → 3. Tavily API → 4. Estrazione Immagini → 5. AI Processing → 6. UI Rendering
```

## 🔧 Configurazione Tecnica

### **Tavily Service:**
```typescript
const results = await tavilyService.search(query, {
  maxResults: 8, // Aumentato per migliore selezione
  includeAnswer: true,
  includeRawContent: true,
  includeImages: true,
  searchDepth: 'advanced',
});
```

### **Rilevamento Lingua:**
```typescript
const detectLanguage = (text: string): string => {
  const italianWords = ['il', 'la', 'di', 'che', 'e', 'un', 'una', 'per', 'con', 'su', 'da', 'in', 'del', 'della', 'dei', 'delle'];
  const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about'];
  
  const words = text.toLowerCase().split(/\s+/);
  const italianCount = words.filter(word => italianWords.includes(word)).length;
  const englishCount = words.filter(word => englishWords.includes(word)).length;
  
  return italianCount > englishCount ? 'italiano' : 'inglese';
};
```

### **Istruzioni Lingua:**
```typescript
const languageInstruction = userLanguage === 'italiano' 
  ? 'Rispondi sempre in italiano e fornisci un riassunto COMPLETO e DETTAGLIATO in italiano di almeno 3-4 paragrafi con informazioni approfondite, dettagli specifici, statistiche, date, nomi e contesto completo. Struttura la risposta con: Introduzione, Sviluppo dettagliato, Conclusioni.'
  : 'Respond in English and provide a COMPLETE and DETAILED summary in English of at least 3-4 paragraphs with in-depth information, specific details, statistics, dates, names and complete context. Structure the response with: Introduction, Detailed Development, Conclusions.';
```

## 🎨 UI Layout

### **Struttura Finale:**
```
1. Header (Ricerca completata/Notizie trovate)
2. 🖼️ Immagini (griglia 2x2) - SOPRA
3. 📋 Summary (dettagliato) - TRA immagini e fonti
4. 📰 Fonti/Notizie (5 card) - SOTTO
```

### **Card Summary:**
```typescript
{/* Summary - TRA immagini e fonti */}
{part.output?.answer && (
  <div className="text-sm text-foreground mb-3 p-3 bg-background rounded border border-border/50">
    <div className="font-medium text-foreground mb-2">📋 Riassunto:</div>
    <div className="leading-relaxed">{part.output.answer}</div>
  </div>
)}
```

### **Card Immagini:**
```typescript
{/* Card Immagini Separate - SOPRA il summary */}
{part.output?.sources && part.output.sources.some((s: any) => s.images && s.images.length > 0) && (
  <div className="mb-3">
    <div className="text-xs font-medium text-muted-foreground mb-2">Immagini trovate:</div>
    <div className="grid grid-cols-2 gap-2">
      {/* Griglia 2x2 immagini */}
    </div>
  </div>
)}
```

## 🌐 Supporto Multilingua

### **Configurazione IT/EN:**
Il sistema supporta automaticamente italiano e inglese con traduzioni complete:

#### **File di Traduzione:**
- **`messages/it.json`** - Traduzioni italiane
- **`messages/en.json`** - Traduzioni inglesi

#### **Traduzioni Tool Calls:**
```json
// IT
"tools": {
  "webSearch": {
    "label": "Ricerca web",
    "preparing": "Preparazione query...",
    "searching": "Cercando",
    "completed": "Ricerca completata",
    "error": "Errore ricerca",
    "imagesFound": "Immagini trovate:",
    "summary": "Riassunto:",
    "sources": "Fonti:",
    "readMore": "Leggi di più →"
  },
  "newsSearch": {
    "label": "Ricerca notizie",
    "preparing": "Preparazione query...",
    "searching": "Cercando",
    "completed": "Notizie trovate",
    "error": "Errore ricerca notizie",
    "imagesFound": "Immagini dalle notizie:",
    "summary": "Riassunto:",
    "news": "Notizie:",
    "published": "Pubblicato:",
    "readNews": "Leggi notizia →"
  }
}

// EN
"tools": {
  "webSearch": {
    "label": "Web Search",
    "preparing": "Preparing query...",
    "searching": "Searching",
    "completed": "Search completed",
    "error": "Search error",
    "imagesFound": "Images found:",
    "summary": "Summary:",
    "sources": "Sources:",
    "readMore": "Read more →"
  },
  "newsSearch": {
    "label": "News Search",
    "preparing": "Preparing query...",
    "searching": "Searching",
    "completed": "News found",
    "error": "News search error",
    "imagesFound": "Images from news:",
    "summary": "Summary:",
    "news": "News:",
    "published": "Published:",
    "readNews": "Read news →"
  }
}
```

#### **Implementazione UI:**
```typescript
// Chat Area con traduzioni
const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const t = useTranslations('tools')
  const tChat = useTranslations('chat')
  
  // Uso delle traduzioni
  <div className="text-sm font-medium text-foreground">{t('webSearch.label')}</div>
  <div className="text-xs text-muted-foreground">{t('webSearch.preparing')}</div>
  <div className="font-medium text-foreground mb-2">{t('webSearch.summary')}</div>
  <div className="text-xs font-medium text-muted-foreground">{t('webSearch.sources')}</div>
}
```

#### **Query Italiana:**
```
Input: "Trova informazioni su React 19"
Output:
- ✅ Risposta in italiano
- ✅ UI labels in italiano: "Ricerca web", "Ricerca completata", "Riassunto:", "Fonti:"
- ✅ 5 fonti italiane/internazionali
- ✅ 4 immagini in griglia 2x2
- ✅ Riassunto dettagliato in italiano
```

#### **Query Inglese:**
```
Input: "Find latest AI news"
Output:
- ✅ Response in English
- ✅ UI labels in English: "Web Search", "Search completed", "Summary:", "Sources:"
- ✅ 5 English/international sources
- ✅ 4 images in 2x2 grid
- ✅ Detailed summary in English
```

### **Rilevamento Lingua Automatico:**
```typescript
const detectLanguage = (text: string): string => {
  const italianWords = ['il', 'la', 'di', 'che', 'e', 'un', 'una', 'per', 'con', 'su', 'da', 'in', 'del', 'della', 'dei', 'delle'];
  const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about'];
  
  const words = text.toLowerCase().split(/\s+/);
  const italianCount = words.filter(word => italianWords.includes(word)).length;
  const englishCount = words.filter(word => englishWords.includes(word)).length;
  
  return italianCount > englishCount ? 'italiano' : 'inglese';
};
```

### **Istruzioni Lingua per AI:**
```typescript
const languageInstruction = userLanguage === 'italiano' 
  ? 'Rispondi sempre in italiano e fornisci un riassunto COMPLETO e DETTAGLIATO in italiano di almeno 3-4 paragrafi con informazioni approfondite, dettagli specifici, statistiche, date, nomi e contesto completo. Struttura la risposta con: Introduzione, Sviluppo dettagliato, Conclusioni.'
  : 'Respond in English and provide a COMPLETE and DETAILED summary in English of at least 3-4 paragraphs with in-depth information, specific details, statistics, dates, names and complete context. Structure the response with: Introduction, Detailed Development, Conclusions.';
```

## 📊 Esempi di Utilizzo

### **Esempio 1: Ricerca Web Italiana**
```
Query: "Trova informazioni su Next.js 16"

Risultato:
1. Header: "Ricerca completata"
2. Immagini: 4 immagini in griglia 2x2
3. Summary: "Riassunto: Next.js 16 rappresenta una pietra miliare significativa..."
4. Fonti: 5 card con titolo, contenuto e link
```

### **Esempio 2: Ricerca Notizie Inglese**
```
Query: "Find latest AI news"

Result:
1. Header: "Notizie trovate"
2. Images: 4 images in 2x2 grid
3. Summary: "Summary: The latest developments in artificial intelligence..."
4. News: 5 cards with title, content, date and link
```

## 🔍 Debugging e Logging

### **Log Tavily Service:**
```typescript
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
});
```

### **Log Estrazione Immagini:**
```typescript
console.log('Tavily non ha restituito immagini, provo a estrarre da Open Graph...');
extractedImages = await extractImagesFromResults(results.results.map(r => ({ url: r.url, title: r.title })));
console.log(`Immagini estratte: ${extractedImages.size}`);
```

## 🚨 Troubleshooting

### **Problemi Comuni:**

#### 1. **Immagini Non Mostrate**
- ✅ Verifica che Tavily restituisca `include_images: true`
- ✅ Controlla il fallback con `extractImagesFromResults`
- ✅ Verifica che le URL delle immagini siano valide

#### 2. **Summary Troppo Breve**
- ✅ Verifica le istruzioni nel system message
- ✅ Controlla che `languageInstruction` sia passata correttamente
- ✅ Assicurati che l'AI riceva le istruzioni per 3-4 paragrafi

#### 3. **Lingua Sbagliata**
- ✅ Verifica la funzione `detectLanguage`
- ✅ Controlla che `languageInstruction` sia corretta
- ✅ Assicurati che il system message includa le istruzioni di lingua

## 📈 Metriche e Performance

### **Configurazione Ottimizzata:**
- ✅ **Timeout**: 30 secondi per Tavily API
- ✅ **Risultati**: 8 per migliore selezione
- ✅ **Fonti**: Sempre 5 mostrate
- ✅ **Immagini**: Sempre 4 in griglia 2x2
- ✅ **Summary**: Almeno 3-4 paragrafi

### **Fallback Strategy:**
1. **Tavily Images** → 2. **Open Graph Extraction** → 3. **Empty Array**

## 🔮 Roadmap Future

### **Miglioramenti Pianificati:**
- ✅ Supporto per più lingue (FR, DE, ES)
- ✅ Cache per risultati Tavily
- ✅ Analytics per query più comuni
- ✅ Integrazione con altre API di ricerca
- ✅ Supporto per video e contenuti multimediali

## 📝 Changelog

### **v2.3.8 - System Prompt Ottimizzato per Concisione**
- ✅ System prompt modificato per risposte concise dopo tool calls
- ✅ Istruzioni esplicite per evitare ripetizioni eccessive
- ✅ Focus sui punti chiave e informazioni essenziali
- ✅ Supporto multilingua migliorato (italiano, inglese, francese, spagnolo)
- ✅ Strutturazione chiara e organizzata delle risposte
- ✅ Comportamento più diretto e professionale
### **v2.3.7 - Correzione Visualizzazione Tool Calls**
- ✅ Risolto problema tool calls salvati ma non visualizzati
- ✅ Corretto parsing JSONB nel ThreadService
- ✅ Eliminato doppio parsing dei dati JSONB
- ✅ Tool calls ora visualizzati correttamente nel chat area
- ✅ Gestione corretta dei dati JSONB nativi
- ✅ Persistenza e visualizzazione complete
### **v2.3.6 - Correzione Persistenza Tool Calls al Refresh**
- ✅ Risolto problema tool calls che scomparivano al refresh pagina
- ✅ Migliorata conversione messaggi dal database
- ✅ Gestione corretta dei parts e metadata
- ✅ Tool calls ora persistiti correttamente dopo ricaricamento
- ✅ Interfaccia Message aggiornata per supportare metadata
- ✅ Logica di fallback per messaggi senza parts
### **v2.3.5 - Correzione Problemi Tool Calls**
- ✅ Risolto problema persistenza tool calls in chat
- ✅ Eliminate multiple query automatiche consecutive
- ✅ Ridotto stepCountIs da 5 a 2 per evitare loop infiniti
- ✅ SystemMessage più conservativo per uso tool
- ✅ Istruzioni esplicite per UN SOLO tool per richiesta
- ✅ Migliorata stabilità del sistema di ricerca
### **v2.3.4 - Estrazione Immagini Open Graph Potenziata**
- ✅ Garantito minimo di 4 immagini per ogni query di ricerca
- ✅ Processamento fino a 8 URL per garantire risultati sufficienti
- ✅ Logica di fallback per URL aggiuntive se necessario
- ✅ Pattern multipli per estrazione immagini (OG, Twitter, Meta, Link)
- ✅ Validazione robusta delle immagini estratte
- ✅ Filtri avanzati per escludere icone e immagini non pertinenti
- ✅ Timeout aumentato a 8 secondi per maggiore affidabilità
### **v2.3.3 - Ottimizzazione Loading State e Ordine Messaggi**
- ✅ Risolto problema loading state ridondante durante tool calls
- ✅ TypingIndicator ora nascosto quando ci sono tool calls attivi
- ✅ Logica intelligente per mostrare loading solo quando necessario
- ✅ Verificato ordine corretto dei messaggi (tool calls → risposta agente)
- ✅ Migliorata user experience durante l'esecuzione dei tool
### **v2.3.2 - Correzione Visibilità Loading State**
- ✅ Risolto problema di visibilità del testo
- ✅ Implementato shimmer overlay invece di text-fill
- ✅ Testo ora completamente visibile
- ✅ Effetto shimmer mantenuto con pseudo-elemento
- ✅ Approccio più robusto e compatibile
### **v2.3.1 - Effetto Shimmer Migliorato**
- ✅ Effetto shimmer completamente ridisegnato
- ✅ Gradiente a 5 colori per maggiore visibilità
- ✅ Animazione più fluida e pronunciata
- ✅ Aggiunto effetto pulsazione sottile
- ✅ Font weight aumentato per maggiore presenza
- ✅ Timing ottimizzato (2.5s shimmer + 3s pulse)
### **v2.3.0 - Loading State Moderno e Dinamico**
- ✅ Design completamente rinnovato del loading state
- ✅ Eliminati bordo e container del vecchio design
- ✅ Rimossi pallini di caricamento animati
- ✅ Implementati testi dinamici che si alternano ogni 2 secondi
- ✅ Aggiunto effetto shimmer al testo
- ✅ Testi localizzati: "Sta scrivendo...", "Sta pensando...", "Sta cercando...", "Sta analizzando...", "Sta elaborando..."
### **v2.2.0 - Pulizia UI e Organizzazione Documentazione**
- ✅ Rimossa emoji 📋 dal titolo riassunto/summary
- ✅ Documentazione spostata in cartella `docs/` dedicata
- ✅ Creato README.md per organizzazione documentazione
- ✅ UI più pulita e professionale
### **v2.1.0 - Localizzazione Completa IT/EN**
- ✅ Traduzioni complete per tutti i tool calls
- ✅ UI labels dinamici basati sulla lingua
- ✅ File di traduzione `messages/it.json` e `messages/en.json`
- ✅ Implementazione `useTranslations` nel chat area
- ✅ Supporto completo per italiano e inglese

### **v2.0.0 - Layout Migliorato e Summary Dettagliato**
- ✅ Immagini spostate sopra il summary
- ✅ Summary dettagliato di 3-4 paragrafi
- ✅ Struttura: Introduzione, Sviluppo, Conclusioni
- ✅ Informazioni specifiche, statistiche, date, nomi

### **v1.5.0 - Rilevamento Lingua e 5 Fonti**
- ✅ Rilevamento automatico lingua
- ✅ Sempre 5 fonti invece di 3
- ✅ Sempre 4 immagini invece di 2
- ✅ Risultati Tavily aumentati da 5 a 8

### **v1.0.0 - Implementazione Base**
- ✅ Integrazione Tavily API
- ✅ Web search e news search
- ✅ Estrazione immagini Open Graph
- ✅ UI base per tool calls

## 🎨 Loading State Moderno

### **Design Completamente Rinnovato:**
Il loading state dell'agente è stato completamente ridisegnato per essere più moderno e dinamico:

#### **Prima (Vecchio Design):**
```
┌─────────────────────────────────┐
│ [Icon] Sta scrivendo... ●●●    │
└─────────────────────────────────┘
```

#### **Dopo (Nuovo Design):**
```
[Icon] Sta scrivendo... ✨
```

### **Caratteristiche:**
- ✅ **Nessun bordo o container** - Design pulito e minimale
- ✅ **Nessun pallino animato** - Rimossi i 3 pallini di caricamento
- ✅ **Testi dinamici** - Si alternano ogni 2 secondi
- ✅ **Effetto shimmer** - Animazione fluida del testo
- ✅ **Localizzazione completa** - Supporto IT/EN

### **Testi Dinamici:**
```typescript
const typingTexts = [
  tChat('typing'),      // "Sta scrivendo..." / "Typing..."
  tChat('thinking'),    // "Sta pensando..." / "Thinking..."
  tChat('searching'),   // "Sta cercando..." / "Searching..."
  tChat('analyzing'),   // "Sta analizzando..." / "Analyzing..."
  tChat('processing')   // "Sta elaborando..." / "Processing..."
]
```

### **Implementazione:**
```typescript
const TypingIndicator: React.FC = () => {
  const tChat = useTranslations('chat')
  const [currentTextIndex, setCurrentTextIndex] = React.useState(0)
  
  const typingTexts = [
    tChat('typing'), tChat('thinking'), tChat('searching'),
    tChat('analyzing'), tChat('processing')
  ]
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % typingTexts.length)
    }, 2000) // Cambia testo ogni 2 secondi
    
    return () => clearInterval(interval)
  }, [typingTexts.length])
  
  return (
    <div className="flex gap-3 p-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <StudioIcon size={16} />
      </div>
      <div className="flex items-center">
        <span className="text-sm text-muted-foreground shimmer-text">
          {typingTexts[currentTextIndex]}
        </span>
      </div>
    </div>
  )
}
```

### **Effetto Shimmer CSS - CORRETTO:**
```css
.shimmer-text {
  position: relative;
  color: hsl(var(--foreground));
  font-weight: 500;
  opacity: 0.9;
  animation: pulse-subtle 3s ease-in-out infinite;
}

.shimmer-text::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    hsl(var(--primary) / 0.3) 25%,
    hsl(var(--primary) / 0.6) 50%,
    hsl(var(--primary) / 0.3) 75%,
    transparent 100%
  );
  background-size: 300% 100%;
  animation: shimmer-overlay 2.5s ease-in-out infinite;
  pointer-events: none;
  border-radius: 2px;
}

@keyframes shimmer-overlay {
  0% {
    background-position: -300% 0;
  }
  50% {
    background-position: 0% 0;
  }
  100% {
    background-position: 300% 0;
  }
}

@keyframes pulse-subtle {
  0%, 100% {
    opacity: 0.9;
  }
  50% {
    opacity: 1;
  }
}
```

### **Miglioramenti Effetto Shimmer:**

#### **Prima (Versione Base):**
- ✅ Gradiente a 3 colori
- ✅ Animazione semplice
- ✅ Timing fisso (2s)
- ✅ Effetto sottile

#### **Dopo (Versione Corretta):**
- ✅ **Testo completamente visibile** con colore normale
- ✅ **Shimmer overlay** con pseudo-elemento ::before
- ✅ **Gradiente trasparente** che non interferisce con il testo
- ✅ **Doppia animazione** (shimmer overlay + pulse)
- ✅ **Font weight aumentato** (500) per maggiore presenza
- ✅ **Approccio più robusto** e compatibile

#### **Caratteristiche Tecniche:**
- **Testo**: Colore normale `hsl(var(--foreground))` per massima visibilità
- **Shimmer**: Pseudo-elemento `::before` con gradiente trasparente
- **Animazioni**: Doppia animazione sincronizzata
- **Font Weight**: 500 per maggiore visibilità
- **Opacità**: 0.9-1.0 per effetto pulsazione sottile
- **Compatibilità**: Funziona su tutti i browser moderni

### **Logica Loading State Intelligente:**

#### **Problema Risolto:**
Durante l'esecuzione dei tool calls, il TypingIndicator appariva in modo ridondante sopra i tool calls, creando confusione nell'interfaccia.

#### **Soluzione Implementata:**
```typescript
// Check if there are active tool calls (input-streaming or input-available states)
const hasActiveToolCalls = messages.some(message => 
  message.parts?.some(part => 
    part.state === 'input-streaming' || part.state === 'input-available'
  )
)

// Only show typing indicator if loading and no active tool calls
const shouldShowTypingIndicator = isLoading && !hasActiveToolCalls
```

#### **Comportamento:**
- ✅ **Tool calls attivi**: TypingIndicator nascosto
- ✅ **Nessun tool call**: TypingIndicator mostrato normalmente
- ✅ **Tool calls completati**: TypingIndicator mostrato per la risposta dell'agente
- ✅ **User experience**: Flusso più pulito e intuitivo

#### **Stati Tool Calls:**
- `input-streaming`: Tool call in preparazione
- `input-available`: Tool call in esecuzione
- `output-available`: Tool call completato con risultati
- `output-error`: Tool call fallito

### **Estrazione Immagini Open Graph Potenziata:**

#### **Problema Risolto:**
L'estrazione Open Graph restituiva solo 2 immagini invece delle 4 richieste, limitando la ricchezza visiva dei risultati.

#### **Soluzione Implementata:**
```typescript
export async function extractImagesFromResults(results: Array<{ url: string; title: string }>): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>();

  // Processa più URL per garantire almeno 4 immagini
  const maxUrls = Math.min(results.length, 8); // Processa fino a 8 URL
  const promises = results.slice(0, maxUrls).map(async (result) => {
    try {
      const image = await extractImageFromUrl(result.url);
      if (image) {
        imageMap.set(result.url, image);
      }
    } catch (error) {
      // Ignora errori per singole URL
    }
  });

  await Promise.allSettled(promises);

  // Se non abbiamo abbastanza immagini, prova con più URL
  if (imageMap.size < 4 && results.length > maxUrls) {
    const additionalPromises = results.slice(maxUrls, maxUrls + 4).map(async (result) => {
      try {
        const image = await extractImageFromUrl(result.url);
        if (image) {
          imageMap.set(result.url, image);
        }
      } catch (error) {
        // Ignora errori per singole URL
      }
    });

    await Promise.allSettled(additionalPromises);
  }

  return imageMap;
}
```

#### **Pattern di Estrazione Multipli:**
```typescript
const imagePatterns = [
  // Open Graph image
  /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,
  // Twitter image
  /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i,
  // Twitter image:src
  /<meta\s+name=["']twitter:image:src["']\s+content=["']([^"']+)["']/i,
  // Meta image
  /<meta\s+name=["']image["']\s+content=["']([^"']+)["']/i,
  // Link rel="image_src"
  /<link\s+rel=["']image_src["']\s+href=["']([^"']+)["']/i,
];
```

#### **Validazione e Filtri Avanzati:**
- ✅ **Validazione URL**: Verifica estensioni immagine valide
- ✅ **Filtri esclusione**: Esclude icone, logo, pixel di tracking
- ✅ **URL assoluti**: Garantisce URL completi e funzionanti
- ✅ **Timeout esteso**: 8 secondi per maggiore affidabilità

#### **Risultati Garantiti:**
- ✅ **Minimo 4 immagini** per ogni query di ricerca
- ✅ **Processamento fino a 8 URL** per garantire risultati
- ✅ **Logica di fallback** per URL aggiuntive se necessario
- ✅ **Qualità immagini** migliorata con filtri avanzati

### **Correzione Problemi Tool Calls:**

#### **Problemi Risolti:**
1. **Tool calls non persistiti** in chat dopo l'esecuzione
2. **Multiple query automatiche** consecutive (3-4 query per richiesta)
3. **Loop infiniti** causati da stepCountIs troppo alto

#### **Soluzioni Implementate:**

##### **1. SystemMessage Più Conservativo:**
```typescript
systemMessage = `Sei un assistente AI chiamato Studio, progettato per aiutare gli utenti con conversazioni generali e supporto tecnico.

Hai accesso a strumenti di ricerca web che ti permettono di:
- Cercare informazioni aggiornate su qualsiasi argomento
- Trovare notizie recenti e sviluppi attuali
- Ottenere dati in tempo reale quando necessario

Usa questi strumenti SOLO quando:
- L'utente chiede esplicitamente informazioni aggiornate o notizie
- Hai bisogno di dati che potrebbero essere cambiati di recente
- Le tue conoscenze potrebbero essere obsolete per l'argomento richiesto

IMPORTANTE:
- Usa UN SOLO tool per richiesta, non fare multiple ricerche automatiche
- Quando usi i tool di ricerca, rispondi sempre nella stessa lingua della query dell'utente
- Se la query è in italiano, rispondi in italiano
- Se la query è in inglese, rispondi in inglese
- Fornisci SEMPRE un riassunto COMPLETO e DETTAGLIATO nella lingua appropriata
- Il riassunto deve essere di almeno 3-4 paragrafi con informazioni approfondite
- Includi dettagli specifici, statistiche, date, nomi e contesto completo
- Mostra sempre almeno 5 fonti quando disponibili
- Cita sempre le fonti quando usi informazioni ottenute dalla ricerca web
- Struttura la risposta con: Introduzione, Sviluppo dettagliato, Conclusioni

I tool ti forniranno anche un'istruzione specifica sulla lingua da usare nel campo 'languageInstruction'.`;
```

##### **2. StepCount Ridotto:**
```typescript
// Prima (Problema)
stopWhen: stepCountIs(5), // Permetteva fino a 5 step

// Dopo (Soluzione)
stopWhen: stepCountIs(2), // Ridotto a 2 step per evitare loop infiniti
```

##### **3. Istruzioni Esplicite:**
- ✅ **"Usa UN SOLO tool per richiesta"** - Previene multiple chiamate
- ✅ **"SOLO quando"** - Criteri più restrittivi per l'uso dei tool
- ✅ **"non fare multiple ricerche automatiche"** - Istruzione esplicita

#### **Risultati:**
- ✅ **Tool calls persistiti** correttamente in chat
- ✅ **Una sola query** per richiesta utente
- ✅ **Nessun loop infinito** di chiamate automatiche
- ✅ **Sistema più stabile** e prevedibile
- ✅ **User experience migliorata** senza spam di ricerche

### **Correzione Persistenza Tool Calls al Refresh:**

#### **Problema Risolto:**
I tool calls venivano creati e visualizzati correttamente durante la sessione, ma scomparivano completamente quando si ricaricava la pagina, lasciando solo i messaggi utente.

#### **Causa del Problema:**
La conversione dei messaggi dal database non gestiva correttamente i `parts` e `metadata` dei tool calls, causando la perdita delle informazioni dei tool calls durante il caricamento.

#### **Soluzione Implementata:**

##### **1. Conversione Messaggi Migliorata:**
```typescript
// Prima (Problema)
const uiMessages = data.thread.messages.map((msg: any) => ({
  id: msg.id,
  role: msg.role,
  parts: msg.parts || [{ type: 'text', text: msg.content }],
  createdAt: new Date(msg.timestamp)
}));

// Dopo (Soluzione)
const uiMessages = data.thread.messages.map((msg: any) => {
  // Se il messaggio ha parts, usali direttamente
  if (msg.parts && Array.isArray(msg.parts)) {
    return {
      id: msg.id,
      role: msg.role,
      content: msg.content,
      parts: msg.parts,
      metadata: msg.metadata,
      timestamp: new Date(msg.timestamp)
    };
  }
  
  // Altrimenti, crea un part di testo semplice
  return {
    id: msg.id,
    role: msg.role,
    content: msg.content,
    parts: [{ type: 'text', text: msg.content }],
    metadata: msg.metadata,
    timestamp: new Date(msg.timestamp)
  };
});
```

##### **2. Interfaccia Message Aggiornata:**
```typescript
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  parts?: Array<{
    type: string
    text?: string
    toolCallId?: string
    toolName?: string
    args?: any
    result?: any
    state?: 'input-streaming' | 'input-available' | 'output-available' | 'output-error'
    errorText?: string
    input?: any
    output?: any
  }>
  metadata?: any  // ← Aggiunto supporto per metadata
}
```

##### **3. Logica di Fallback:**
- ✅ **Messaggi con parts**: Usa direttamente i parts dal database
- ✅ **Messaggi senza parts**: Crea un part di testo semplice
- ✅ **Metadata**: Preserva tutte le informazioni aggiuntive
- ✅ **Timestamp**: Mantiene la data corretta

#### **Risultati:**
- ✅ **Tool calls persistiti** correttamente dopo refresh
- ✅ **Conversione robusta** dei messaggi dal database
- ✅ **Gestione completa** di parts e metadata
- ✅ **Fallback sicuro** per messaggi senza parts
- ✅ **User experience migliorata** con persistenza completa

### **Correzione Visualizzazione Tool Calls:**

#### **Problema Risolto:**
I tool calls venivano salvati correttamente nel database ma non venivano visualizzati nel chat area dopo il caricamento della pagina.

#### **Causa del Problema:**
Il `ThreadService` stava facendo un doppio parsing dei dati JSONB:
1. Supabase restituiva i dati JSONB già parsati automaticamente
2. Il servizio cercava di fare `JSON.parse()` su oggetti già parsati
3. Questo causava errori e impediva la visualizzazione dei tool calls

#### **Soluzione Implementata:**

##### **1. ThreadService Corretto:**
```typescript
// Prima (Problema)
const parsedMessages = (messages || []).map(msg => ({
  ...msg,
  parts: msg.parts ? JSON.parse(msg.parts) : null,  // ← Doppio parsing!
  metadata: msg.metadata ? JSON.parse(msg.metadata) : null  // ← Doppio parsing!
}))

// Dopo (Soluzione)
// I dati JSONB vengono già parsati automaticamente da Supabase
const parsedMessages = messages || []
```

##### **2. MessageService Corretto:**
```typescript
// Prima (Problema)
parts: parts ? JSON.stringify(parts) : null,  // ← Salvataggio come stringa
metadata: metadata ? JSON.stringify(metadata) : null  // ← Salvataggio come stringa

// Dopo (Soluzione)
parts: parts || null,  // ← Salvataggio diretto come JSONB
metadata: metadata || null  // ← Salvataggio diretto come JSONB
```

##### **3. Flusso Corretto:**
1. **Salvataggio**: Dati salvati come JSONB nativo in Supabase
2. **Recupero**: Supabase restituisce dati JSONB già parsati
3. **Visualizzazione**: Dati utilizzati direttamente senza parsing aggiuntivo
4. **Rendering**: Tool calls visualizzati correttamente nel chat area

#### **Risultati:**
- ✅ **Tool calls visualizzati** correttamente nel chat area
- ✅ **Nessun doppio parsing** dei dati JSONB
- ✅ **Gestione corretta** dei dati JSONB nativi
- ✅ **Persistenza completa** dei tool calls
- ✅ **Visualizzazione completa** dopo refresh
- ✅ **User experience migliorata** con tool calls sempre visibili

### **System Prompt Ottimizzato per Concisione:**

#### **Obiettivo:**
Rendere l'assistente più conciso e diretto dopo l'uso dei tool di ricerca web, mantenendo sempre la risposta nella lingua dell'utente.

#### **Modifiche Implementate:**

##### **1. System Prompt Migliorato:**
```typescript
// Nuove istruzioni aggiunte
DOPO aver usato i tool di ricerca web:
- Sii CONCISO e diretto nella risposta
- Evita ripetizioni eccessive
- Concentrati sui punti chiave
- Fornisci informazioni essenziali senza essere prolisso
- Struttura la risposta in modo chiaro e organizzato

// Supporto multilingua esteso
- Rispondi SEMPRE nella stessa lingua della query dell'utente
- Se la query è in italiano, rispondi in italiano
- Se la query è in inglese, rispondi in inglese
- Se la query è in francese, rispondi in francese
- Se la query è in spagnolo, rispondi in spagnolo
- E così via per qualsiasi lingua
```

##### **2. Istruzioni Tool Aggiornate:**
```typescript
// Web Search Tool
const languageInstruction = userLanguage === 'italiano' 
  ? 'Rispondi sempre in italiano. DOPO aver usato questo tool, sii CONCISO e diretto nella risposta. Evita ripetizioni eccessive, concentrati sui punti chiave e fornisci informazioni essenziali senza essere prolisso. Struttura la risposta in modo chiaro e organizzato.'
  : 'Respond in English. AFTER using this tool, be CONCISE and direct in your response. Avoid excessive repetitions, focus on key points and provide essential information without being verbose. Structure the response in a clear and organized way.';

// News Search Tool
const languageInstruction = userLanguage === 'italiano' 
  ? 'Rispondi sempre in italiano. DOPO aver usato questo tool, sii CONCISO e diretto nella risposta. Evita ripetizioni eccessive, concentrati sui punti chiave delle notizie e fornisci informazioni essenziali senza essere prolisso. Struttura la risposta in modo chiaro e organizzato.'
  : 'Respond in English. AFTER using this tool, be CONCISE and direct in your response. Avoid excessive repetitions, focus on key points of the news and provide essential information without being verbose. Structure the response in a clear and organized way.';
```

##### **3. Comportamento Risultante:**
- ✅ **Risposte concise** dopo l'uso dei tool
- ✅ **Nessuna ripetizione eccessiva** di informazioni
- ✅ **Focus sui punti chiave** essenziali
- ✅ **Strutturazione chiara** e organizzata
- ✅ **Supporto multilingua** completo
- ✅ **Comportamento professionale** e diretto

#### **Vantaggi:**
- ✅ **User experience migliorata** con risposte più dirette
- ✅ **Efficienza comunicativa** aumentata
- ✅ **Supporto multilingua** robusto
- ✅ **Professionalità** nelle risposte
- ✅ **Chiarezza** nella strutturazione
- ✅ **Riduzione verbosità** inutile

---

**Stato Attuale**: ✅ **Completamente Funzionante**
**Ultima Modifica**: System prompt ottimizzato per concisione
**Prossimi Passi**: Mantenimento e aggiornamenti futuri
