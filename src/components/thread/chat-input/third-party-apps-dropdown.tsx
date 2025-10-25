'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Settings2, Plus, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComposioApp, ComposioConnection } from '@/lib/services/composio-service';
import { IntegrationsModal } from '@/components/integrations-modal';
import { GoogleCalendarIcon } from '@/components/google-calendar-icon';
import { useTranslations } from 'next-intl';

interface ThirdPartyAppsDropdownProps {
  userId: string;
  disabled?: boolean;
}

export const ThirdPartyAppsDropdown: React.FC<ThirdPartyAppsDropdownProps> = ({
  userId,
  disabled = false
}) => {
  const t = useTranslations('integrations');
  const [availableApps, setAvailableApps] = useState<ComposioApp[]>([]);
  const [connectedApps, setConnectedApps] = useState<ComposioConnection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Carica app disponibili e connessioni al mount
  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Chiamiamo le API routes invece di usare il servizio direttamente
      const [appsResponse, connectionsResponse] = await Promise.all([
        fetch('/api/composio/apps'),
        fetch(`/api/composio/connections?userId=${userId}`)
      ]);
      
      const appsData = await appsResponse.json();
      const connectionsData = await connectionsResponse.json();
      
      if (appsData.success) {
        setAvailableApps(appsData.apps);
      }
      
      if (connectionsData.success) {
        setConnectedApps(connectionsData.connections);
      }
    } catch (error) {
      console.error('Errore nel caricamento dati Composio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectApp = async (appId: string) => {
    setIsConnecting(appId);
    try {
      // Chiamiamo l'API route per ottenere l'URL di autenticazione
      const response = await fetch('/api/composio/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, appId })
      });
      
      const data = await response.json();
      
      if (!data.success || !data.authUrl) {
        throw new Error(data.error || 'Errore nella connessione');
      }
      
      // Apri URL di autenticazione in nuova finestra
      const popup = window.open(
        data.authUrl,
        'composio-auth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      // Polling per verificare se la finestra è stata chiusa
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          setIsConnecting(null);
          // Ricarica le connessioni
          loadData();
        }
      }, 1000);

    } catch (error) {
      console.error('Errore nella connessione app:', error);
      setIsConnecting(null);
    }
  };

  const handleDisconnectApp = async (connectionId: string) => {
    try {
      // Chiamiamo l'API route per disconnettere l'app
      const response = await fetch('/api/composio/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, connectionId })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Errore nella disconnessione');
      }
      
      // Rimuovi dalla lista locale
      setConnectedApps(prev => prev.filter(conn => conn.id !== connectionId));
    } catch (error) {
      console.error('Errore nella disconnessione app:', error);
    }
  };

  const getAppIcon = (app: ComposioApp | ComposioConnection) => {
    // Gestione corretta dei tipi per ComposioApp e ComposioConnection
    const iconUrl = 'appIcon' in app ? app.appIcon : (app as ComposioApp).icon;
    const appName = 'appName' in app ? app.appName : (app as ComposioApp).name;
    
    // Debug: log per verificare le icone delle connessioni
    if ('appIcon' in app) {
      console.log(`🔍 Icona per ${appName}:`, iconUrl);
    }
    
    // Icona speciale per Google Calendar
    if (appName?.toLowerCase().includes('google calendar') || 
        appName?.toLowerCase().includes('googlecalendar') ||
        (app as ComposioApp).id?.toLowerCase().includes('googlecalendar')) {
      return <GoogleCalendarIcon className="w-5 h-5" />;
    }
    
    if (iconUrl) {
      return (
        <img 
          src={iconUrl} 
          alt={appName || 'App icon'}
          className="w-5 h-5 rounded-md object-cover"
          onError={(e) => {
            console.log(`❌ Errore caricamento icona per ${appName}:`, iconUrl);
            // Se l'immagine non carica, mostra placeholder
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const placeholder = document.createElement('div');
              placeholder.className = 'w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs';
              placeholder.textContent = (appName || '?').charAt(0).toUpperCase();
              parent.appendChild(placeholder);
            }
          }}
        />
      );
    }
    
    // Placeholder con iniziale dell'app
    return (
      <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
        {(appName || '?').charAt(0).toUpperCase()}
      </div>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return <AlertCircle className="w-3 h-3 text-yellow-500" />;
    }
  };

  return (
    <>
      <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={disabled || isLoading}
                className={cn(
                  "w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-muted/50 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <Settings2 className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                )}
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="start" className="w-80">
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                {t('title')}
              </DropdownMenuLabel>
              
              {/* App Connesse */}
              {connectedApps.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-medium">
                    {t('connectedApps')} ({connectedApps.length})
                  </DropdownMenuLabel>
                  
                  {connectedApps.map((connection) => (
                    <DropdownMenuItem
                      key={connection.id}
                      className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted/50 transition-colors"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="relative">
                          {getAppIcon(connection)}
                          {connection.status === 'active' && (
                            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                        <span className="text-sm font-medium truncate">
                          {connection.appName}
                        </span>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={() => handleDisconnectApp(connection.id)}
                        title="Disconnetti app"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
              
              {/* App Disponibili */}
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs font-medium">
                {t('popularApps')}
              </DropdownMenuLabel>
              
              {availableApps.slice(0, 5).map((app) => {
                const isConnected = connectedApps.some(conn => conn.appId === app.id);
                const isConnectingThis = isConnecting === app.id;
                
                return (
                  <DropdownMenuItem
                    key={app.id}
                    className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted/50 transition-colors"
                    disabled={isConnected || isConnectingThis}
                    onSelect={(e) => {
                      e.preventDefault();
                      if (!isConnected && !isConnectingThis) {
                        handleConnectApp(app.id);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="relative">
                        {getAppIcon(app)}
                        {isConnected && (
                          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate">
                          {app.name}
                        </span>
                        <div className="text-xs text-muted-foreground truncate">
                          {app.description}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      {isConnectingThis ? (
                        <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                      ) : isConnected ? (
                        <span className="text-xs text-muted-foreground">{t('connected')}</span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title={t('connect')}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </DropdownMenuItem>
                );
              })}
              
              {availableApps.length > 5 && (
                <DropdownMenuItem className="text-center text-xs text-muted-foreground">
{t('moreApps', { count: availableApps.length - 5 })}
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-center text-xs cursor-pointer"
                onClick={() => setIsModalOpen(true)}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                {t('manageAll')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        
        <TooltipContent side="top">
          <p>{t('title')}</p>
        </TooltipContent>
      </Tooltip>
      </TooltipProvider>
      
      {/* Modale per gestire tutte le integrazioni */}
      <IntegrationsModal 
        userId={userId}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
};
