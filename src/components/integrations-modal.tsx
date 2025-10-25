'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Settings2, 
  Plus, 
  CheckCircle, 
  Loader2, 
  Search,
  Grid3X3,
  List,
  Zap,
  Shield,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComposioApp, ComposioConnection } from '@/lib/services/composio-service';
import { GoogleCalendarIcon } from '@/components/google-calendar-icon';
import { useTranslations } from 'next-intl';

interface IntegrationsModalProps {
  userId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const IntegrationsModal: React.FC<IntegrationsModalProps> = ({
  userId,
  open,
  onOpenChange
}) => {
  const t = useTranslations('integrations');
  const [availableApps, setAvailableApps] = useState<ComposioApp[]>([]);
  const [connectedApps, setConnectedApps] = useState<ComposioConnection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Carica dati quando il modale si apre
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, userId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
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
          loadData(); // Ricarica i dati
        }
      }, 1000);

    } catch (error) {
      console.error('Errore nella connessione app:', error);
      setIsConnecting(null);
    }
  };

  const handleDisconnectApp = async (connectionId: string) => {
    try {
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
      
      setConnectedApps(prev => prev.filter(conn => conn.id !== connectionId));
    } catch (error) {
      console.error('Errore nella disconnessione app:', error);
    }
  };

  const getAppIcon = (app: ComposioApp | ComposioConnection) => {
    const iconUrl = (app as ComposioApp).icon || (app as ComposioConnection).appIcon;
    const appName = (app as ComposioApp).name || (app as ComposioConnection).appName || 'App';
    
    // Icona speciale per Google Calendar
    if (appName?.toLowerCase().includes('google calendar') || 
        appName?.toLowerCase().includes('googlecalendar') ||
        (app as ComposioApp).id?.toLowerCase().includes('googlecalendar')) {
      return <GoogleCalendarIcon className="w-8 h-8" />;
    }
    
    if (iconUrl) {
      return (
        <img 
          src={iconUrl} 
          alt={appName}
          className="w-8 h-8 rounded-lg object-cover"
          onError={(e) => {
            // Se l'immagine non carica, mostra placeholder
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const placeholder = document.createElement('div');
              placeholder.className = 'w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm';
              placeholder.textContent = appName.charAt(0).toUpperCase();
              parent.appendChild(placeholder);
            }
          }}
        />
      );
    }
    
    return (
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
        {appName.charAt(0).toUpperCase()}
      </div>
    );
  };

  const isAppConnected = (appId: string) => {
    return connectedApps.some(conn => conn.appId === appId);
  };

  const getConnectedApp = (appId: string) => {
    return connectedApps.find(conn => conn.appId === appId);
  };

  const filteredApps = availableApps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
    >
      <DialogContent 
        className="overflow-hidden flex flex-col"
        style={{
          width: '95vw',
          height: '90vh',
          maxWidth: 'none',
          maxHeight: 'none'
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Filtri e ricerca */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 bg-muted/50 border-0 rounded-lg placeholder:text-muted-foreground/60 focus-visible:bg-background transition-colors"
              />
            </div>

            <div className="flex items-center gap-1 ml-auto bg-muted/50 p-1 rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-7 w-7 p-0"
                title="Grid view"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-7 w-7 p-0"
                title="List view"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Statistiche - Design minimal */}
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{connectedApps.length} {t('connected')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{availableApps.length} {t('available')}</span>
            </div>
          </div>

          <Separator />

          {/* Lista app */}
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">{t('loadingApps')}</span>
              </div>
            ) : (
              <div className={cn(
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
                  : 'space-y-2'
              )}>
                {filteredApps.map((app) => {
                  const isConnected = isAppConnected(app.id);
                  const connectedApp = getConnectedApp(app.id);
                  
                  return (
                    <Card key={app.id} className={cn(
                      "transition-all duration-200 hover:shadow-md cursor-pointer",
                      viewMode === 'grid' && "flex flex-col"
                    )}>
                      <CardHeader className={cn(
                        "pb-3",
                        viewMode === 'grid' ? "text-center" : ""
                      )}>
                        {viewMode === 'grid' ? (
                          <div className="flex flex-col items-center gap-3">
                            <div className="relative">
                              {getAppIcon(app)}
                              {isConnected && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                  <CheckCircle className="w-2 h-2 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-center">
                              <CardTitle className="text-sm font-medium">{app.name}</CardTitle>
                              <CardDescription className="text-xs mt-1 text-muted-foreground">
                                {app.description}
                              </CardDescription>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                {getAppIcon(app)}
                                {isConnected && (
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-2 h-2 text-white" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <CardTitle className="text-sm font-medium">{app.name}</CardTitle>
                                <CardDescription className="text-xs text-muted-foreground">
                                  {app.description}
                                </CardDescription>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        {viewMode === 'grid' ? (
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                              <Shield className="h-3 w-3" />
                              <span>{app.permissions.length} {t('permissions')}</span>
                            </div>
                            
                            <div className="flex justify-center">
                              {isConnected ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDisconnectApp(connectedApp?.id || app.id)}
                                  className="h-7 px-3 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                >
{t('disconnect')}
                                </Button>
                              ) : (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleConnectApp(app.id)}
                                  disabled={isConnecting === app.id}
                                  className="h-7 px-3 text-xs"
                                >
                                  {isConnecting === app.id ? (
                                    <>
                                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                      {t('connecting')}
                                    </>
                                  ) : (
                                    t('connect')
                                  )}
                                </Button>
                              )}
                            </div>
                            
                            {isConnected && connectedApp && (
                              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{t('connectedOn')} {new Date(connectedApp.createdAt).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Shield className="h-3 w-3" />
                              <span>{app.permissions.length} {t('permissions')}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {isConnected ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDisconnectApp(connectedApp?.id || app.id)}
                                  className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                >
{t('disconnect')}
                                </Button>
                              ) : (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleConnectApp(app.id)}
                                  disabled={isConnecting === app.id}
                                  className="h-7 px-2 text-xs"
                                >
                                  {isConnecting === app.id ? (
                                    <>
                                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                      {t('connecting')}
                                    </>
                                  ) : (
                                    t('connect')
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {viewMode === 'list' && isConnected && connectedApp && (
                          <div className="mt-2 pt-2 border-t">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>Connessa il {new Date(connectedApp.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
