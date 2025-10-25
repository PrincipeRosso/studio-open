import { Composio } from '@composio/core';
import { VercelProvider } from '@composio/vercel';

// Singleton pattern per il client Composio
let _composioService: ComposioService | null = null;

export class ComposioService {
  private client: Composio<VercelProvider>;

  constructor() {
    const apiKey = process.env.COMPOSIO_API_KEY;
    
    if (!apiKey) {
      throw new Error('COMPOSIO_API_KEY environment variable is required');
    }
    
    // Inizializza il client Composio con VercelProvider
    // strict: false permette maggiore flessibilità nella validazione dei tools
    this.client = new Composio({
      apiKey,
      provider: new VercelProvider({ strict: false })
    });
    
    console.log('✅ Composio client inizializzato con VercelProvider (strict: false)');
  }

  // Metodo per ottenere tutte le app disponibili dall'API di Composio
  async getAvailableApps() {
    try {
      console.log('🔍 Recupero lista app da Composio API...');
      
      // Proviamo diversi modi per accedere all'API delle apps
      let appsResponse;
      
      // Metodo 1: Prova con client.apps
      if ((this.client as any).apps) {
        console.log('📡 Tentativo con client.apps...');
        appsResponse = await (this.client as any).apps.list();
      }
      // Metodo 2: Prova con client.getApps
      else if ((this.client as any).getApps) {
        console.log('📡 Tentativo con client.getApps...');
        appsResponse = await (this.client as any).getApps();
      }
      // Metodo 3: Prova con apiClient interno
      else if ((this.client as any).apiClient?.apps) {
        console.log('📡 Tentativo con apiClient.apps...');
        appsResponse = await (this.client as any).apiClient.apps.list();
      }
      // Metodo 4: Chiamata HTTP diretta all'API
      else {
        console.log('📡 Tentativo con chiamata HTTP diretta...');
        const response = await fetch('https://backend.composio.dev/api/v1/apps', {
          headers: {
            'X-API-Key': process.env.COMPOSIO_API_KEY || '',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        appsResponse = await response.json();
      }
      
      console.log('✅ Risposta API Composio ricevuta');
      console.log('📊 Struttura risposta:', Object.keys(appsResponse || {}));
      
      // Trasformiamo la risposta nell'interfaccia ComposioApp
      const items = appsResponse?.items || appsResponse?.apps || appsResponse || [];
      
      if (!Array.isArray(items) || items.length === 0) {
        console.warn('⚠️ Nessuna app trovata nella risposta, uso fallback');
        return this.getFallbackApps();
      }
      
      const apps: ComposioApp[] = items.map((app: any) => ({
        id: app.key || app.appId || app.name?.toLowerCase().replace(/\s+/g, '_'),
        name: app.name || app.displayName || 'Unknown App',
        description: app.description || app.tagline || `Integrazione con ${app.name}`,
        icon: app.logo || app.icon || undefined,
        category: app.categories?.[0] || app.category || 'other',
        permissions: app.auth_schemes?.map((scheme: any) => scheme.mode) || []
      }));
      
      console.log(`📱 ${apps.length} app Composio caricate dall'API`);
      return apps;
      
    } catch (error) {
      console.error('❌ Errore nel recupero app da Composio API:', error);
      console.log('🔄 Uso lista fallback');
      return this.getFallbackApps();
    }
  }

  // Lista fallback in caso l'API non sia disponibile
  private getFallbackApps(): ComposioApp[] {
    return [
      {
        id: 'gmail',
        name: 'Gmail',
        description: 'Email e comunicazione',
        icon: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico',
        category: 'communication',
        permissions: ['gmail:read', 'gmail:write']
      },
      {
        id: 'slack',
        name: 'Slack',
        description: 'Messaggistica e collaborazione team',
        icon: 'https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png',
        category: 'communication',
        permissions: ['channels:read', 'chat:write']
      },
      {
        id: 'google_calendar',
        name: 'Google Calendar',
        description: 'Gestione calendario e eventi',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/2048px-Google_Calendar_icon_%282020%29.svg.png',
        category: 'productivity',
        permissions: ['calendar:read', 'calendar:write']
      },
      {
        id: 'notion',
        name: 'Notion',
        description: 'Workspace per note e documenti',
        icon: 'https://www.notion.so/images/logo-ios.png',
        category: 'productivity',
        permissions: ['notion:read', 'notion:write']
      },
      {
        id: 'github',
        name: 'GitHub',
        description: 'Gestione repository e codice',
        icon: 'https://github.githubassets.com/favicons/favicon.svg',
        category: 'developer',
        permissions: ['repo:read', 'repo:write']
      }
    ];
  }

  // Metodo per ottenere le connessioni attive di un utente
  async getUserConnections(userId: string) {
    try {
      console.log(`🔍 Recupero connessioni per utente ${userId}...`);
      
      // Proviamo diversi metodi per accedere alle connessioni
      let connectionsResponse;
      
      // Metodo 1: Prova con client.connections
      if ((this.client as any).connections) {
        console.log('📡 Tentativo con client.connections...');
        connectionsResponse = await (this.client as any).connections.list({ userId });
      }
      // Metodo 2: Prova con client.getConnections
      else if ((this.client as any).getConnections) {
        console.log('📡 Tentativo con client.getConnections...');
        connectionsResponse = await (this.client as any).getConnections(userId);
      }
      // Metodo 3: Chiamata HTTP diretta
      else {
        console.log('📡 Tentativo con chiamata HTTP diretta...');
        const response = await fetch(`https://backend.composio.dev/api/v1/connectedAccounts?user_uuid=${userId}`, {
          headers: {
            'X-API-Key': process.env.COMPOSIO_API_KEY || '',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        connectionsResponse = await response.json();
      }
      
      console.log('✅ Risposta connessioni ricevuta');
      
      // Trasformiamo la risposta nell'interfaccia ComposioConnection
      const items = connectionsResponse?.items || connectionsResponse?.connectedAccounts || connectionsResponse || [];
      
      if (!Array.isArray(items)) {
        console.warn('⚠️ Risposta non è un array, restituisco array vuoto');
        return [];
      }
      
      const connections: ComposioConnection[] = items.map((conn: any) => {
        const appId = conn.appName || conn.appId || conn.app;
        const appName = conn.appName || conn.app || 'Unknown App';
        
        // Prova a recuperare l'icona dalla connessione o dalle app disponibili
        let appIcon = conn.logo || conn.icon || conn.appIcon;
        
        // Se non c'è icona nella connessione, prova a recuperarla dalle app disponibili
        if (!appIcon) {
          try {
            const availableApps = this.getFallbackApps();
            const matchingApp = availableApps.find(app => 
              app.id === appId || 
              app.name.toLowerCase() === appName.toLowerCase()
            );
            appIcon = matchingApp?.icon;
          } catch (error) {
            console.log(`⚠️ Impossibile recuperare icona per ${appName}`);
          }
        }
        
        return {
          id: conn.id || conn.connectionId || `${appName}_${Date.now()}`,
          appId,
          appName,
          appIcon,
          status: conn.status === 'ACTIVE' || conn.status === 'active' ? 'active' : 
                  conn.status === 'ERROR' || conn.status === 'error' ? 'error' : 'inactive',
          permissions: conn.scopes || [],
          createdAt: conn.createdAt || conn.created_at || new Date().toISOString(),
          lastUsed: conn.lastUsed || conn.last_used
        };
      });
      
      console.log(`🔗 ${connections.length} connessioni attive trovate per utente ${userId}`);
      return connections;
      
    } catch (error) {
      console.error('❌ Errore nel recupero connessioni utente:', error);
      // Non lanciamo errore, restituiamo array vuoto
      return [];
    }
  }

  // Metodo per avviare il flusso di connessione OAuth
  async connectApp(userId: string, appId: string) {
    try {
      // Utilizziamo l'API reale di Composio per ottenere URL di autenticazione
      const connection = await this.client.toolkits.authorize(userId, appId);
      
      console.log(`🔐 URL autenticazione per ${appId}:`, connection.redirectUrl);
      return connection.redirectUrl;
    } catch (error) {
      console.error('Errore nella creazione URL autenticazione:', error);
      throw new Error('Errore nella configurazione della connessione');
    }
  }

  // Metodo per ottenere i tools di Composio per l'agent basati sulle app connesse
  async getToolsForUser(userId: string) {
    try {
      console.log(`🛠️ Recupero tools per utente ${userId}...`);
      
      // Prima otteniamo le connessioni attive dell'utente
      const connections = await this.getUserConnections(userId);
      
      if (connections.length === 0) {
        console.log('⚠️ Nessuna app connessa, nessun tool disponibile');
        return [];
      }
      
      console.log(`📱 ${connections.length} app connesse, recupero tools...`);
      
      // Estraiamo i nomi delle app connesse per usarli come toolkits
      const connectedApps = connections
        .filter(conn => conn.status === 'active')
        .map(conn => conn.appId);
      
      console.log(`🔧 Recupero tools per app connesse:`, connectedApps);
      
      if (connectedApps.length === 0) {
        console.log('⚠️ Nessuna app attiva, nessun tool disponibile');
        return [];
      }
      
      // Otteniamo i tools per le app connesse usando il parametro toolkits
      const composioTools = await this.client.tools.get(userId, { 
        toolkits: connectedApps 
      });
      
      // Debug dettagliato della risposta
      console.log(`📊 Tipo risposta tools:`, typeof composioTools);
      console.log(`📊 È array:`, Array.isArray(composioTools));
      
      // VercelProvider restituisce un oggetto Record<string, Tool> pronto per Vercel AI SDK
      // Questo è il formato corretto per passare a streamText({ tools: {...} })
      if (typeof composioTools === 'object' && composioTools !== null) {
        const toolNames = Object.keys(composioTools);
        console.log(`✅ ${toolNames.length} tools Composio pronti per l'agent`);
        console.log(`🔧 Tools disponibili:`, toolNames.slice(0, 10));
        
        if (toolNames.length > 0) {
          const firstToolName = toolNames[0];
          console.log(`📋 Esempio tool "${firstToolName}":`, {
            description: (composioTools as any)[firstToolName].description?.substring(0, 100) + '...'
          });
        }
      }
      
      return composioTools;
      
    } catch (error) {
      console.error('❌ Errore nel recupero tools:', error);
      return [];
    }
  }

  // Metodo per ottenere tools specifici per l'agent
  async getSpecificTools(userId: string, toolNames: string[]) {
    try {
      console.log(`🛠️ Recupero tools specifici per utente ${userId}:`, toolNames);
      
      // Utilizziamo l'API reale di Composio per ottenere i tools
      const composioTools = await this.client.tools.get(userId, { tools: toolNames });
      
      console.log(`✅ Tools specifici ottenuti per utente ${userId}`);
      return composioTools;
    } catch (error) {
      console.error('❌ Errore nel recupero tools specifici:', error);
      throw new Error(`Errore nel recupero dei tools: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    }
  }

  // Metodo per disconnettere un'app
  async disconnectApp(userId: string, connectionId: string) {
    try {
      console.log(`🔌 Disconnessione connessione ${connectionId} per utente ${userId}...`);
      
      // Proviamo diversi metodi per disconnettere
      let disconnectResponse;
      
      // Metodo 1: Prova con client.connections.delete
      if ((this.client as any).connections?.delete) {
        console.log('📡 Tentativo con client.connections.delete...');
        disconnectResponse = await (this.client as any).connections.delete(connectionId);
      }
      // Metodo 2: Chiamata HTTP diretta
      else {
        console.log('📡 Tentativo con chiamata HTTP diretta...');
        const response = await fetch(`https://backend.composio.dev/api/v1/connectedAccounts/${connectionId}`, {
          method: 'DELETE',
          headers: {
            'X-API-Key': process.env.COMPOSIO_API_KEY || '',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        disconnectResponse = await response.json();
      }
      
      console.log(`✅ Connessione ${connectionId} disconnessa con successo`);
      return true;
      
    } catch (error) {
      console.error('❌ Errore nella disconnessione app:', error);
      throw new Error('Errore nella disconnessione dell\'app');
    }
  }
}

// Export del singleton
export const composioService = {
  get instance() {
    if (!_composioService) {
      _composioService = new ComposioService();
    }
    return _composioService;
  }
};

// Tipi per le app e connessioni
export interface ComposioApp {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category: string;
  permissions: string[];
}

export interface ComposioConnection {
  id: string;
  appId: string;
  appName: string;
  appIcon?: string;
  status: 'active' | 'inactive' | 'error';
  permissions: string[];
  createdAt: string;
  lastUsed?: string;
}