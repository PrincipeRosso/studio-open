# Ricerca Approfondita: Integrazione Composio per Studio

## 📋 Panoramica

Composio è una piattaforma che permette agli agenti AI di integrarsi con oltre 250 applicazioni di terze parti, fornendo API unificate per l'automazione e l'interazione con servizi esterni.

## 🔍 Scoperte Principali

### 1. **Capacità di Composio**
- **250+ Integrazioni**: Supporta applicazioni popolari come Slack, Gmail, Google Calendar, Notion, Trello, GitHub, etc.
- **API Unificate**: Fornisce un'interfaccia standardizzata per interagire con diverse applicazioni
- **Autenticazione OAuth**: Gestisce automaticamente i flussi di autenticazione per le app terze
- **SDK Disponibili**: Offre SDK per JavaScript/TypeScript, Python e altre lingue

### 2. **Architettura di Integrazione**

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Studio Agent  │───▶│   Composio   │───▶│  App Terze      │
│                 │    │   Platform   │    │  (Slack, Gmail) │
└─────────────────┘    └──────────────┘    └─────────────────┘
```

### 3. **Flusso di Autenticazione**
1. **Utente clicca** sull'icona Settings2 nel chat input
2. **Redirect OAuth** verso Composio per autorizzazione
3. **Callback** con token di accesso
4. **Configurazione** delle app disponibili per l'utente
5. **Integrazione** attiva per l'agent

## 🛠 Piano di Implementazione per Studio

### Fase 1: Setup Iniziale
```typescript
// 1. Installazione SDK
npm install @composio/sdk

// 2. Configurazione API Key
const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY;

// 3. Inizializzazione client
import { ComposioClient } from '@composio/sdk';
const composio = new ComposioClient(COMPOSIO_API_KEY);
```

### Fase 2: Interfaccia Utente

#### A. Dropdown Menu per App Terze
```typescript
// Componente per gestire le integrazioni
const ThirdPartyAppsDropdown = () => {
  const [availableApps, setAvailableApps] = useState([]);
  const [connectedApps, setConnectedApps] = useState([]);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Settings2 className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>App Connesse</DropdownMenuLabel>
        {connectedApps.map(app => (
          <DropdownMenuItem key={app.id}>
            <div className="flex items-center gap-2">
              <img src={app.icon} className="w-4 h-4" />
              <span>{app.name}</span>
              <Badge variant="success">Connesso</Badge>
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>App Disponibili</DropdownMenuLabel>
        {availableApps.map(app => (
          <DropdownMenuItem key={app.id} onClick={() => connectApp(app)}>
            <div className="flex items-center gap-2">
              <img src={app.icon} className="w-4 h-4" />
              <span>{app.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
```

#### B. Modal di Configurazione
```typescript
const AppIntegrationModal = ({ app, onClose }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Avvia flusso OAuth
      const authUrl = await composio.getAuthUrl(app.id);
      window.open(authUrl, '_blank');
      
      // Polling per completamento
      const connection = await composio.waitForConnection(app.id);
      onClose(connection);
    } catch (error) {
      console.error('Errore connessione:', error);
    } finally {
      setIsConnecting(false);
    }
  };
  
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connetti {app.name}</DialogTitle>
          <DialogDescription>
            Autorizza Studio ad accedere a {app.name} per automatizzare le tue attività.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img src={app.icon} className="w-8 h-8" />
            <div>
              <h3 className="font-medium">{app.name}</h3>
              <p className="text-sm text-muted-foreground">{app.description}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Permessi Richiesti:</h4>
            {app.permissions.map(permission => (
              <div key={permission} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm">{permission}</span>
              </div>
            ))}
          </div>
          
          <Button onClick={handleConnect} disabled={isConnecting}>
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Connessione in corso...
              </>
            ) : (
              'Connetti App'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

### Fase 3: Integrazione con Agent

#### A. Tool per App Terze
```typescript
// Nuovo tool per interagire con app connesse
export const thirdPartyAppTool = tool({
  description: 'Interagisce con app terze connesse dall\'utente',
  parameters: z.object({
    app: z.string().describe('Nome dell\'app da utilizzare'),
    action: z.string().describe('Azione da eseguire'),
    parameters: z.record(z.any()).describe('Parametri per l\'azione')
  }),
  execute: async ({ app, action, parameters }) => {
    try {
      const result = await composio.executeAction({
        app,
        action,
        parameters
      });
      
      return {
        success: true,
        result,
        message: `Azione ${action} eseguita con successo su ${app}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Errore nell'esecuzione dell'azione su ${app}`
      };
    }
  }
});
```

#### B. Sistema di Gestione Connessioni
```typescript
// Service per gestire le connessioni Composio
export class ComposioService {
  private client: ComposioClient;
  
  constructor() {
    this.client = new ComposioClient(process.env.COMPOSIO_API_KEY);
  }
  
  async getAvailableApps() {
    return await this.client.getApps();
  }
  
  async getUserConnections(userId: string) {
    return await this.client.getUserConnections(userId);
  }
  
  async connectApp(userId: string, appId: string) {
    const authUrl = await this.client.getAuthUrl(appId, {
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/composio/callback`,
      userId
    });
    
    return authUrl;
  }
  
  async executeAction(connectionId: string, action: string, parameters: any) {
    return await this.client.executeAction({
      connectionId,
      action,
      parameters
    });
  }
}
```

### Fase 4: Database Schema

```sql
-- Tabella per le connessioni Composio degli utenti
CREATE TABLE composio_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id VARCHAR NOT NULL,
  connection_id VARCHAR NOT NULL,
  app_name VARCHAR NOT NULL,
  app_icon VARCHAR,
  permissions JSONB,
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabella per le azioni disponibili per app
CREATE TABLE composio_app_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id VARCHAR NOT NULL,
  action_name VARCHAR NOT NULL,
  action_description TEXT,
  parameters_schema JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🎯 App Prioritarie per Integrazione

### 1. **Produttività**
- **Slack**: Invio messaggi, creazione canali, gestione workspace
- **Gmail**: Lettura email, invio messaggi, gestione etichette
- **Google Calendar**: Creazione eventi, gestione calendari
- **Notion**: Creazione pagine, aggiornamento database

### 2. **Sviluppo**
- **GitHub**: Creazione issue, pull request, gestione repository
- **GitLab**: Simile a GitHub
- **Jira**: Gestione ticket, progetti

### 3. **Marketing**
- **HubSpot**: Gestione contatti, pipeline vendite
- **Salesforce**: CRM avanzato
- **Mailchimp**: Campagne email

## 🔐 Considerazioni di Sicurezza

### 1. **Gestione Token**
- Token OAuth crittografati nel database
- Refresh automatico dei token scaduti
- Revoca token su disconnessione

### 2. **Permessi Granulari**
- Richiesta solo dei permessi necessari
- Revoca permessi non utilizzati
- Audit log delle azioni

### 3. **Isolamento Utente**
- Connessioni per utente isolate
- Nessuna condivisione dati tra utenti
- Cancellazione dati su eliminazione account

## 📊 Metriche e Monitoraggio

### 1. **Utilizzo App**
- App più utilizzate
- Frequenza di utilizzo
- Errori di connessione

### 2. **Performance**
- Tempo di risposta API
- Successo/failure rate
- Timeout e retry

## 🚀 Roadmap di Implementazione

### **Settimana 1-2: Setup Base**
- [ ] Configurazione Composio SDK
- [ ] Setup database schema
- [ ] Implementazione service base

### **Settimana 3-4: UI/UX**
- [ ] Dropdown menu per app terze
- [ ] Modal di configurazione
- [ ] Gestione stato connessioni

### **Settimana 5-6: Integrazione Agent**
- [ ] Tool per app terze
- [ ] Sistema di autenticazione OAuth
- [ ] Gestione errori e retry

### **Settimana 7-8: Testing e Ottimizzazione**
- [ ] Test integrazione principali app
- [ ] Ottimizzazione performance
- [ ] Documentazione utente

## 💡 Prossimi Passi Immediati

1. **Registrazione Composio**: Creare account e ottenere API key
2. **Prototipo SDK**: Testare integrazione base con app popolari
3. **Design UI**: Creare mockup per dropdown e modal
4. **Database**: Implementare schema per connessioni utente

## 📚 Risorse Utili

- [Composio.dev Documentation](https://composio.dev/docs)
- [Composio GitHub Repository](https://github.com/composiohq)
- [OAuth 2.0 Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)
- [Next.js OAuth Integration Guide](https://nextjs.org/docs/authentication)

---

*Documento creato il: ${new Date().toLocaleDateString('it-IT')}*
*Versione: 1.0*
