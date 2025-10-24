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

---

**Stato Attuale**: ✅ **Completamente Funzionante**
**Ultima Modifica**: Pulizia UI e organizzazione documentazione
**Prossimi Passi**: Mantenimento e aggiornamenti futuri
