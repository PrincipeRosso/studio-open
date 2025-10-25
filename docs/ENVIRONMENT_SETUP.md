# Configurazione Variabili d'Ambiente - Studio

## Variabili Richieste

### Supabase
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### AI Models
```bash
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

### Web Search
```bash
TAVILY_API_KEY=your_tavily_api_key_here
```

## Variabili Opzionali

### Composio Integration
```bash
# Se non configurata, usa dati mock
COMPOSIO_API_KEY=your_composio_api_key_here
```

### App Configuration
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Note

- **COMPOSIO_API_KEY**: Se non configurata, il sistema userà dati mock per le integrazioni app terze
- **TAVILY_API_KEY**: Necessaria per le ricerche web e notizie
- **Supabase**: Necessario per autenticazione e database
- **AI Models**: Almeno una chiave API è necessaria per il funzionamento dell'agent

## Setup Rapido

1. Copia `.env.local.example` in `.env.local`
2. Configura le variabili richieste
3. Per Composio, puoi lasciare vuota la chiave per usare i mock
4. Riavvia il server di sviluppo
