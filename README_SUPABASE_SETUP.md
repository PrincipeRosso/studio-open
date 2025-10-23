# Guida alla Configurazione di Supabase

Questa guida ti aiuterà a configurare Supabase per abilitare la persistenza dei dati nell'applicazione Studio.

## 🚀 Setup Iniziale

### 1. Crea un Progetto Supabase

1. Vai su [supabase.com](https://supabase.com) e crea un account
2. Crea un nuovo progetto
3. Annota l'URL del progetto e la chiave API anonima

### 2. Configura le Variabili d'Ambiente

1. Copia il file `.env.local.example` in `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Compila le variabili d'ambiente in `.env.local`:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   
   # Optional: Supabase Service Role Key (for server-side operations)
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### 3. Esegui le Migrazioni del Database

1. Installa Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Accedi a Supabase:
   ```bash
   supabase login
   ```

3. Collega il progetto:
   ```bash
   supabase link --project-ref your-project-id
   ```

4. Esegui le migrazioni:
   ```bash
   supabase db push
   ```

   Oppure, copia manualmente il contenuto di `supabase/migrations/001_initial_schema.sql` nell'editor SQL di Supabase.

## 📊 Schema del Database

Il database include le seguenti tabelle:

### `users`
- `id` (UUID, Primary Key)
- `email` (Text, Unique)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### `threads`
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `title` (Text)
- `agent_id` (Text)
- `model_name` (Text)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### `messages`
- `id` (UUID, Primary Key)
- `thread_id` (UUID, Foreign Key → threads.id)
- `role` (Text: 'user' | 'assistant')
- `content` (Text)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## 🔐 Sicurezza (RLS)

Il database utilizza Row Level Security (RLS) per garantire che:
- Gli utenti possano accedere solo ai propri thread
- Gli utenti possano vedere solo i messaggi dei propri thread
- Tutte le operazioni CRUD rispettano i permessi utente

## 🛠️ Funzionalità Implementate

### ✅ Completate
- [x] Configurazione client Supabase (browser e server)
- [x] Schema del database con migrazioni SQL
- [x] Servizi per gestione thread (CRUD completo)
- [x] Servizi per gestione messaggi (CRUD completo)
- [x] API endpoints per thread (`/api/threads`, `/api/threads/[id]`)
- [x] Integrazione nei componenti esistenti
- [x] Sidebar con thread recenti e azioni (rinomina, elimina)
- [x] Caricamento dinamico dei thread dalla persistenza

### 🔄 Da Implementare
- [ ] Autenticazione utente reale (attualmente usa 'temp-user')
- [ ] Gestione errori più robusta
- [ ] Ottimizzazioni performance (caching, paginazione)
- [ ] Sincronizzazione real-time dei thread
- [ ] Backup e recovery dei dati

## 🧪 Test

Per testare l'integrazione:

1. Avvia il server di sviluppo:
   ```bash
   npm run dev
   ```

2. Crea una nuova conversazione dalla dashboard
3. Verifica che i thread appaiano nella sidebar
4. Testa le funzionalità di rinomina ed eliminazione
5. Controlla che i dati persistano dopo il refresh della pagina

## 🐛 Risoluzione Problemi

### Errore di Connessione
- Verifica che le variabili d'ambiente siano corrette
- Controlla che il progetto Supabase sia attivo
- Verifica la connessione internet

### Errori di Permessi
- Controlla che le policy RLS siano configurate correttamente
- Verifica che l'utente sia autenticato (quando implementato)

### Errori di Schema
- Assicurati che le migrazioni siano state eseguite
- Controlla che le tabelle esistano nel database Supabase

## 📚 Risorse Utili

- [Documentazione Supabase](https://supabase.com/docs)
- [Guida Next.js + Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)