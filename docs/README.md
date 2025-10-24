# 📚 Documentazione Studio Open

Questa cartella contiene tutta la documentazione tecnica del progetto Studio Open.

## 📋 File Disponibili

### **Web Search Tool**
- **`WEB_SEARCH_DOCUMENTATION.md`** - Documentazione completa del sistema di ricerca web integrato con Tavily API

## 🎯 Panoramica

Il Web Search Tool è un sistema completo di ricerca web che utilizza l'API Tavily per fornire:
- ✅ Ricerca web generale con informazioni aggiornate
- ✅ Ricerca notizie con sviluppi attuali
- ✅ Estrazione automatica immagini da Open Graph
- ✅ Rilevamento automatico lingua (IT/EN)
- ✅ Summary dettagliati di 3-4 paragrafi
- ✅ Layout ottimizzato: Immagini → Summary → Fonti

## 🚀 Funzionalità Principali

### **Ricerca Web**
- Fino a 8 risultati Tavily per migliore selezione
- Sempre 5 fonti mostrate all'utente
- Sempre 4 immagini in griglia 2x2
- Estrazione automatica immagini da Open Graph

### **Localizzazione**
- Supporto completo italiano e inglese
- UI dinamica che si adatta alla lingua dell'utente
- Traduzioni centralizzate in `messages/it.json` e `messages/en.json`

### **Summary Dettagliato**
- Almeno 3-4 paragrafi con informazioni approfondite
- Dettagli specifici, statistiche, date, nomi
- Struttura: Introduzione, Sviluppo, Conclusioni

## 📁 Struttura File

```
docs/
├── README.md                           # Questo file
└── WEB_SEARCH_DOCUMENTATION.md         # Documentazione completa Web Search Tool
```

## 🔧 Configurazione Tecnica

### **File Principali:**
- `src/lib/tools/web-search-tool.ts` - Tool AI SDK
- `src/lib/services/tavily-service.ts` - Servizio Tavily API
- `src/lib/services/image-extraction-service.ts` - Estrazione immagini
- `src/app/api/chat/route.ts` - API endpoint
- `src/components/thread/chat-area.tsx` - UI component

### **File di Traduzione:**
- `messages/it.json` - Traduzioni italiane
- `messages/en.json` - Traduzioni inglesi

## 📊 Esempi di Utilizzo

### **Query Italiana:**
```
Input: "Trova informazioni su React 19"
Output:
- UI in italiano: "Ricerca web", "Ricerca completata", "Riassunto:", "Fonti:"
- Risposta AI in italiano
- 5 fonti, 4 immagini, summary dettagliato
```

### **Query Inglese:**
```
Input: "Find latest AI news"
Output:
- UI in English: "Web Search", "Search completed", "Summary:", "Sources:"
- AI response in English
- 5 sources, 4 images, detailed summary
```

## 🚨 Troubleshooting

Per problemi comuni e soluzioni, consultare la documentazione specifica in `WEB_SEARCH_DOCUMENTATION.md`.

## 📝 Changelog

### **v2.1.0 - Localizzazione Completa IT/EN**
- ✅ Traduzioni complete per tutti i tool calls
- ✅ UI labels dinamici basati sulla lingua
- ✅ Supporto completo per italiano e inglese

### **v2.0.0 - Layout Migliorato e Summary Dettagliato**
- ✅ Immagini spostate sopra il summary
- ✅ Summary dettagliato di 3-4 paragrafi
- ✅ Informazioni specifiche, statistiche, date, nomi

### **v1.5.0 - Rilevamento Lingua e 5 Fonti**
- ✅ Rilevamento automatico lingua
- ✅ Sempre 5 fonti invece di 3
- ✅ Sempre 4 immagini invece di 2

---

**Stato Attuale**: ✅ **Completamente Funzionante**
**Ultima Modifica**: Organizzazione documentazione e rimozione emoji
**Prossimi Passi**: Mantenimento e aggiornamenti futuri
