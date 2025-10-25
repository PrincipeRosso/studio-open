"use client"

import React, { useEffect, useRef } from 'react'
import { StudioIcon } from '@/components/studio-icon'
import { GoogleCalendarIcon } from '@/components/google-calendar-icon'
import { CanvaIcon } from '@/components/canva-icon'
import { MiniCalendar } from '@/components/mini-calendar'
import { User, Search, Newspaper, Loader2, Mail, MessageSquare, Github, Slack, FileText, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { isNewsQuery } from '@/lib/tools/web-search-tool'

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
  metadata?: any
}

interface ChatAreaProps {
  messages: Message[]
  isLoading?: boolean
  isPageLoading?: boolean
}

const ToolCallIndicator: React.FC<{ toolName: string; args: any }> = ({ toolName, args }) => {
  const t = useTranslations('tools')
  
  const getComposioOperation = (name: string) => {
    const parts = name.split('_')
    const action = parts.slice(1).join('_').toLowerCase()
    
    const operations: Record<string, string> = {
      'create_event': t('composio.operations.createEvent'),
      'update_event': t('composio.operations.updateEvent'),
      'delete_event': t('composio.operations.deleteEvent'),
      'list_events': t('composio.operations.listEvents'),
      'get_event': t('composio.operations.getEvent'),
      'send_email': t('composio.operations.sendEmail'),
      'create_issue': t('composio.operations.createIssue'),
      'send_message': t('composio.operations.sendMessage')
    }
    
    return operations[action] || t('composio.completed')
  }
  
  const getToolIcon = (toolName: string) => {
    // Tool di ricerca
    if (toolName === 'webSearch' || toolName === 'smartSearch') {
        return <Search className="h-4 w-4" />
    }
    if (toolName === 'newsSearch') {
        return <Newspaper className="h-4 w-4" />
    }
    
    // Tool Composio - Google Calendar
    if (toolName.startsWith('GOOGLECALENDAR_')) {
      return <GoogleCalendarIcon className="h-4 w-4" />
    }
    
    // Tool Composio - Gmail
    if (toolName.startsWith('GMAIL_')) {
      return <Mail className="h-4 w-4" />
    }
    
    // Tool Composio - Slack
    if (toolName.startsWith('SLACK_')) {
      return <Slack className="h-4 w-4" />
    }
    
    // Tool Composio - GitHub
    if (toolName.startsWith('GITHUB_')) {
      return <Github className="h-4 w-4" />
    }
    
    // Tool Composio - generici
    if (toolName.includes('_')) {
      return <FileText className="h-4 w-4" />
    }
    
    return <Loader2 className="h-4 w-4 animate-spin" />
  }

  const getToolLabel = (toolName: string) => {
    // Tool di ricerca
    if (toolName === 'webSearch' || toolName === 'smartSearch') {
      return t('webSearch.label')
    }
    if (toolName === 'newsSearch') {
      return t('newsSearch.label')
    }
    
    // Tool Composio - formatta il nome
    if (toolName.includes('_')) {
      // Es: GOOGLECALENDAR_CREATE_EVENT -> Google Calendar: Create Event
      const parts = toolName.split('_')
      const app = parts[0].toLowerCase()
      const action = parts.slice(1).join(' ').toLowerCase()
      
      const appNames: Record<string, string> = {
        'googlecalendar': t('composio.googleCalendar'),
        'gmail': t('composio.gmail'),
        'slack': t('composio.slack'),
        'github': t('composio.github'),
        'notion': t('composio.notion'),
        'trello': t('composio.trello'),
        'asana': t('composio.asana')
      }
      
      const appName = appNames[app] || app.charAt(0).toUpperCase() + app.slice(1)
      const actionName = action.charAt(0).toUpperCase() + action.slice(1)
      
      return `${appName}: ${actionName}`
    }
    
    return t('generic.tool')
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border/50">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
        {getToolIcon(toolName)}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-foreground">
          {getToolLabel(toolName)}
        </div>
        <div className="text-xs text-muted-foreground">
          {args?.query || t('composio.executing')}
        </div>
      </div>
      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
    </div>
  )
}

const ToolResult: React.FC<{ toolName: string; result: any }> = ({ toolName, result }) => {
  const t = useTranslations('tools')
  
  const getComposioOperation = (name: string) => {
    const parts = name.split('_')
    const action = parts.slice(1).join('_').toLowerCase()
    
    const operations: Record<string, string> = {
      'create_event': t('composio.operations.createEvent'),
      'update_event': t('composio.operations.updateEvent'),
      'delete_event': t('composio.operations.deleteEvent'),
      'list_events': t('composio.operations.listEvents'),
      'get_event': t('composio.operations.getEvent'),
      'send_email': t('composio.operations.sendEmail'),
      'create_issue': t('composio.operations.createIssue'),
      'send_message': t('composio.operations.sendMessage')
    }
    
    return operations[action] || t('composio.completed')
  }
  
  const getToolIcon = (toolName: string) => {
    // Tool di ricerca
    if (toolName === 'webSearch' || toolName === 'smartSearch') {
        return <Search className="h-4 w-4" />
    }
    if (toolName === 'newsSearch') {
        return <Newspaper className="h-4 w-4" />
    }
    
    // Tool Composio - Google Calendar
    if (toolName.startsWith('GOOGLECALENDAR_')) {
      return <GoogleCalendarIcon className="h-4 w-4" />
    }
    
    // Tool Composio - Gmail
    if (toolName.startsWith('GMAIL_')) {
      return <Mail className="h-4 w-4" />
    }
    
    // Tool Composio - Slack
    if (toolName.startsWith('SLACK_')) {
      return <Slack className="h-4 w-4" />
    }
    
    // Tool Composio - GitHub
    if (toolName.startsWith('GITHUB_')) {
      return <Github className="h-4 w-4" />
    }
    
    // Tool Composio - generici
    if (toolName.includes('_')) {
      return <FileText className="h-4 w-4" />
    }
    
    return <Loader2 className="h-4 w-4" />
  }

  const getToolLabel = (toolName: string) => {
    // Tool di ricerca
    if (toolName === 'webSearch' || toolName === 'smartSearch') {
      return t('webSearch.completed')
    }
    if (toolName === 'newsSearch') {
      return t('newsSearch.completed')
    }
    
    // Tool Composio - formatta il nome
    if (toolName.includes('_')) {
      const parts = toolName.split('_')
      const app = parts[0].toLowerCase()
      const action = parts.slice(1).join(' ').toLowerCase()
      
      const appNames: Record<string, string> = {
        'googlecalendar': t('composio.googleCalendar'),
        'gmail': t('composio.gmail'),
        'slack': t('composio.slack'),
        'github': t('composio.github'),
        'notion': t('composio.notion'),
        'trello': t('composio.trello'),
        'asana': t('composio.asana')
      }
      
      const appName = appNames[app] || app.charAt(0).toUpperCase() + app.slice(1)
      const actionName = action.charAt(0).toUpperCase() + action.slice(1)
      
      return `${appName}: ${actionName}`
    }
    
    return t('generic.tool')
  }

  if (!result?.success) {
    return (
      <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center">
          {getToolIcon(toolName)}
        </div>
        <div className="text-sm text-destructive">
          {t('composio.error')}: {result?.error || t('generic.unknownError')}
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
          {getToolIcon(toolName)}
        </div>
        <div className="text-sm font-medium text-foreground">
          {getToolLabel(toolName)}
        </div>
      </div>
      
      {result.data?.answer && (
        <div className="text-sm text-foreground mb-2 p-2 bg-background rounded border">
          {result.data.answer}
        </div>
      )}
      
      {result.data?.sources && result.data.sources.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">Fonti:</div>
          {result.data.sources.slice(0, 3).map((source: any, index: number) => (
            <div key={index} className="text-xs text-muted-foreground">
              • {source.title}
            </div>
          ))}
        </div>
      )}
      
      {/* Mostra l'operazione specifica per tool Composio */}
      {toolName.includes('_') && (
        <div className="text-sm text-muted-foreground mt-2">
          ✓ {getComposioOperation(toolName)}
        </div>
      )}
    </div>
  )
}

// Funzione per processare il contenuto e riconoscere i link di Canva
const processMessageContent = (content: string) => {
  console.log('🔍 Processando contenuto:', content);
  
  // Test con un link semplice per debug
  if (content.includes('@https://www.canva.com/test')) {
    console.log('🧪 Test link trovato!');
  }
  
  // Test con link senza @
  if (content.includes('https://www.canva.com/api/design/')) {
    console.log('🧪 Link Canva API trovato!');
  }
  
  // Regex per riconoscere i link di Canva - sia con @ che senza
  const canvaLinkRegex = /(?:@)?(https:\/\/www\.canva\.com\/[^\s\)]+)/g;
  
  const parts: Array<{ type: 'text' | 'canva-link', content: string, url?: string }> = [];
  let lastIndex = 0;
  let match;
  
  while ((match = canvaLinkRegex.exec(content)) !== null) {
    console.log('🎨 Link Canva trovato:', match[0], 'URL:', match[1]);
    
    // Aggiungi il testo prima del link
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex, match.index)
      });
    }
    
    // Aggiungi il link di Canva
    parts.push({
      type: 'canva-link',
      content: match[1], // URL senza @
      url: match[1]
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Aggiungi il testo rimanente
  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.slice(lastIndex)
    });
  }
  
  console.log('📦 Parti processate:', parts);
  return parts;
}

// Componente per renderizzare un link di Canva
const CanvaLinkCard: React.FC<{ url: string }> = ({ url }) => {
  console.log('🎨 Rendering CanvaLinkCard con URL:', url);
  const t = useTranslations('tools.composio');
  
  // Estrai l'ID del design dall'URL per creare l'URL di preview
  const getPreviewUrl = (url: string) => {
    try {
      // Estrai l'ID del design dall'URL
      const designIdMatch = url.match(/\/design\/([^\/\?]+)/);
      if (designIdMatch) {
        const designId = designIdMatch[1];
        // URL per la preview dell'immagine (formato thumbnail)
        return `https://www.canva.com/api/design/${designId}/thumbnail?width=400&height=300&format=png`;
      }
    } catch (error) {
      console.error('Errore nel parsing URL Canva:', error);
    }
    return null;
  };
  
  const previewUrl = getPreviewUrl(url);
  
  return (
    <div className="mt-3 p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <CanvaIcon className="w-8 h-8" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="mb-1">
            <h4 className="font-semibold text-purple-900 dark:text-purple-100">
              {t('canva')} Design
            </h4>
          </div>
          <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
            Design creato con Canva
          </p>
          
          {/* Preview della slide */}
          {previewUrl && (
            <div className="mb-3">
              <div className="relative rounded-lg overflow-hidden border border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-800">
                <img
                  src={previewUrl}
                  alt="Preview del design Canva"
                  className="w-full h-auto max-h-48 object-contain"
                  onError={(e) => {
                    console.log('❌ Errore caricamento preview Canva:', previewUrl);
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const placeholder = document.createElement('div');
                      placeholder.className = 'w-full h-32 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400';
                      placeholder.innerHTML = `
                        <div class="text-center">
                          <p class="text-sm font-medium">Preview non disponibile</p>
                        </div>
                      `;
                      parent.appendChild(placeholder);
                    }
                  }}
                />
                {/* Overlay con icona Canva */}
                <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 rounded-full p-1">
                  <CanvaIcon className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}
          
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            <span>Apri in Canva</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user'
  const t = useTranslations('tools')
  const tChat = useTranslations('chat')
  
  return (
    <div className={cn(
      "flex flex-col p-4",
      isUser ? "ml-auto items-end max-w-[70%]" : "mr-auto items-start w-full"
    )}>
      {/* Header con icona e nome */}
      <div className="flex items-center gap-2 mb-2">
        {isUser ? (
          <>
            <span className="text-sm font-medium text-muted-foreground">Tu</span>
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-secondary-foreground" />
            </div>
          </>
        ) : (
          <>
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <StudioIcon size={16} />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Studio</span>
          </>
        )}
      </div>
      
      {/* Contenuto del messaggio */}
      <div className={cn(
        "w-full space-y-2",
        isUser 
          ? "bg-card text-foreground rounded-3xl border border-border shadow-sm px-4 py-4" 
          : "text-foreground"
      )}>
        {/* Per messaggi dell'assistente: prima i tool calls, poi il testo */}
        {!isUser && message.parts && message.parts.length > 0 && (
          <div className="space-y-2">
            {/* Prima mostra i tool calls */}
            {message.parts.filter(part => part.type?.startsWith('tool-')).map((part, index) => {
              // Estrai il nome del tool dal tipo (es: 'tool-GOOGLECALENDAR_CREATE_EVENT' -> 'GOOGLECALENDAR_CREATE_EVENT')
              const toolName = part.type?.replace('tool-', '') || '';
              
              // Tool Composio (tutti i tool con underscore nel nome)
              const isComposioTool = toolName.includes('_') && !['webSearch', 'newsSearch', 'smartSearch'].includes(toolName);
              
              if (isComposioTool) {
                const getComposioIcon = (name: string) => {
                  if (name.startsWith('GOOGLECALENDAR_')) return <GoogleCalendarIcon className="h-4 w-4" />
                  if (name.startsWith('CANVA_')) return <CanvaIcon className="h-4 w-4" />
                  if (name.startsWith('GMAIL_')) return <Mail className="h-4 w-4" />
                  if (name.startsWith('SLACK_')) return <Slack className="h-4 w-4" />
                  if (name.startsWith('GITHUB_')) return <Github className="h-4 w-4" />
                  return <FileText className="h-4 w-4" />
                }
                
                const getComposioLabel = (name: string) => {
                  const parts = name.split('_')
                  const app = parts[0].toLowerCase()
                  const action = parts.slice(1).join(' ').toLowerCase()
                  
                  const appNames: Record<string, string> = {
                    'googlecalendar': t('composio.googleCalendar'),
                    'canva': t('composio.canva'),
                    'gmail': t('composio.gmail'),
                    'slack': t('composio.slack'),
                    'github': t('composio.github'),
                    'notion': t('composio.notion'),
                    'trello': t('composio.trello'),
                    'asana': t('composio.asana')
                  }
                  
                  const appName = appNames[app] || app.charAt(0).toUpperCase() + app.slice(1)
                  const actionName = action.charAt(0).toUpperCase() + action.slice(1)
                  
                  return `${appName}: ${actionName}`
                }
                
                const getComposioOperation = (name: string) => {
                  const parts = name.split('_')
                  const action = parts.slice(1).join('_').toLowerCase()
                  
                  const operations: Record<string, string> = {
                    'create_event': t('composio.operations.createEvent'),
                    'update_event': t('composio.operations.updateEvent'),
                    'delete_event': t('composio.operations.deleteEvent'),
                    'list_events': t('composio.operations.listEvents'),
                    'get_event': t('composio.operations.getEvent'),
                    'send_email': t('composio.operations.sendEmail'),
                    'create_issue': t('composio.operations.createIssue'),
                    'send_message': t('composio.operations.sendMessage')
                  }
                  
                  return operations[action] || t('composio.completed')
                }
                
                switch (part.state) {
                  case 'input-streaming':
                  case 'input-available':
                    return (
                      <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border/50">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          {getComposioIcon(toolName)}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">
                            {getComposioLabel(toolName)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {t('composio.executing')}
                          </div>
                        </div>
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    );
                  case 'output-available':
                    // Per Google Calendar, mostra il mini calendario
                    if (toolName.startsWith('GOOGLECALENDAR_')) {
                      // Debug: log dei dati per capire la struttura
                      console.log('🗓️ Google Calendar Tool Data:', {
                        toolName,
                        partOutput: part.output,
                        partInput: part.input,
                        partArgs: part.args,
                        partState: part.state
                      });
                      
                      // Estrai informazioni dall'output, input o args
                      const eventData = part.output || part.input || part.args || {};
                      const eventDate = eventData.start_time || eventData.date || eventData.startTime || eventData.start?.dateTime || eventData.start?.date;
                      const eventTitle = eventData.summary || eventData.title || eventData.name || eventData.subject;
                      
                      // Estrai il tipo di operazione dal nome del tool
                      const operationType = toolName.split('_').slice(1).join('_').toLowerCase();
                      
                      console.log('🗓️ Extracted Event Data:', { eventDate, eventTitle, operationType });
                      
                      // Usa la data dell'evento se disponibile, altrimenti usa oggi
                      const dateToUse = eventDate || new Date().toISOString();
                      const locale = typeof window !== 'undefined' ? 
                        (document.documentElement.lang || 'it') : 'it';
                      const eventTime = eventDate ? 
                        new Date(eventDate).toLocaleTimeString(locale === 'it' ? 'it-IT' : 'en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : undefined;
                      
                      return (
                        <div key={index} className="p-3 bg-muted/30 rounded-lg border border-border/30">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                              {getComposioIcon(toolName)}
                            </div>
                            <div className="text-sm font-medium text-foreground">
                              {getComposioLabel(toolName)}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground mb-3">
                            ✓ {getComposioOperation(toolName)}
                          </div>
                          {/* Mini Calendar per eventi - sempre mostrato per Google Calendar */}
                          <MiniCalendar 
                            date={new Date(dateToUse).toISOString().split('T')[0]}
                            time={eventTime}
                            title={eventTitle}
                            operation={operationType}
                          />
                        </div>
                      );
                    }
                    
                    // Per altre app, mostra il design standard
                    return (
                      <div key={index} className="p-3 bg-muted/30 rounded-lg border border-border/30">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            {getComposioIcon(toolName)}
                          </div>
                          <div className="text-sm font-medium text-foreground">
                            {getComposioLabel(toolName)}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ✓ {getComposioOperation(toolName)}
                        </div>
                      </div>
                    );
                  case 'output-error':
                    return (
                      <div key={index} className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center">
                          {getComposioIcon(toolName)}
                        </div>
                        <div className="text-sm text-destructive">
                          {t('composio.error')}: {part.errorText || t('composio.error')}
                        </div>
                      </div>
                    );
                  default:
                    return null;
                }
              }
              
              // Determina il tipo di ricerca per smartSearch
              const isNews = part.type === 'tool-smartSearch' && part.input?.query ? isNewsQuery(part.input.query) : false;
              const isWebSearch = part.type === 'tool-webSearch' || (part.type === 'tool-smartSearch' && (part.output?.sources || (!part.output?.news && !isNews)));
              
              // Tool calls per webSearch e smartSearch (quando restituisce sources o durante loading)
              if (isWebSearch) {
                switch (part.state) {
                  case 'input-streaming':
                    return (
                      <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border/50">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          {part.type === 'tool-smartSearch' && isNews ? <Newspaper className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">
                            {part.type === 'tool-smartSearch' ? (isNews ? 'Ricerca notizie' : 'Ricerca web') : t('webSearch.label')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {part.type === 'tool-smartSearch' ? (isNews ? 'Preparazione ricerca notizie...' : 'Preparazione ricerca...') : t('webSearch.preparing')}
                          </div>
                        </div>
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    );
                  case 'input-available':
                    return (
                      <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border/50">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          {part.type === 'tool-smartSearch' && isNews ? <Newspaper className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">
                            {part.type === 'tool-smartSearch' ? (isNews ? 'Ricerca notizie' : 'Ricerca web') : t('webSearch.label')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {part.type === 'tool-smartSearch' ? (isNews ? 'Ricerca notizie in corso' : 'Ricerca in corso') : t('webSearch.searching')}: {part.input?.query || '...'}
                          </div>
                        </div>
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    );
                  case 'output-available':
                    return (
                      <div key={index} className="p-3 bg-muted/30 rounded-lg border border-border/30">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <Search className="h-4 w-4" />
                          </div>
                          <div className="text-sm font-medium text-foreground">
                            {part.type === 'tool-smartSearch' ? 'Ricerca completata' : t('webSearch.completed')}
                          </div>
                        </div>
                        
                        {/* Card Immagini Separate - SOPRA il summary */}
                        {part.output?.sources && part.output.sources.some((s: any) => s.images && s.images.length > 0) && (
                          <div className="mb-3">
                            <div className="text-xs font-medium text-muted-foreground mb-2">{t('webSearch.imagesFound')}</div>
                            <div className="flex gap-2 overflow-x-auto">
                              {part.output.sources
                                .filter((source: any) => source.images && source.images.length > 0)
                                .flatMap((source: any) => source.images.slice(0, 1).map((img: string) => ({ img, source })))
                                .slice(0, 4)
                                .map((item: any, idx: number) => (
                                  <div key={idx} className="flex-shrink-0 w-32 border rounded overflow-hidden bg-background">
                                    <img 
                                      src={item.img} 
                                      alt={`Immagine da ${item.source.title}`}
                                      className="w-full h-24 object-cover"
                                      onError={(e) => {
                                        e.currentTarget.parentElement!.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Summary - TRA immagini e fonti */}
                        {part.output?.answer && (
                          <div className="text-sm text-foreground mb-3 p-3 bg-background rounded border border-border/50">
                            <div className="font-medium text-foreground mb-2">{t('webSearch.summary')}</div>
                            <div className="leading-relaxed">{part.output.answer}</div>
                          </div>
                        )}
                        
                        {/* Card Fonti */}
                        {part.output?.sources && part.output.sources.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-muted-foreground">{t('webSearch.sources')}</div>
                            {part.output.sources.slice(0, 5).map((source: any, idx: number) => (
                              <div key={idx} className="text-xs border rounded p-2 bg-background/50">
                                <div className="font-medium text-foreground mb-1">{source.title}</div>
                                <div className="text-muted-foreground mb-1">{source.content}</div>
                                <div className="text-xs text-primary hover:text-primary/80">
                                  <a href={source.url} target="_blank" rel="noopener noreferrer">
                                    {t('webSearch.readMore')}
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  case 'output-error':
                    return (
                      <div key={index} className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center">
                          <Search className="h-4 w-4" />
                        </div>
                            <div className="text-sm text-destructive">
                              {t('webSearch.error')}: {part.errorText || t('generic.unknownError')}
                            </div>
                      </div>
                    );
                }
              }

              // Tool calls per newsSearch e smartSearch (quando restituisce news o durante loading)
              if (part.type === 'tool-newsSearch' || (part.type === 'tool-smartSearch' && (part.output?.news || isNews))) {
                switch (part.state) {
                  case 'input-streaming':
                    return (
                      <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border/50">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <Newspaper className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">
                            {part.type === 'tool-smartSearch' ? 'Ricerca notizie' : t('newsSearch.label')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {part.type === 'tool-smartSearch' ? 'Preparazione ricerca notizie...' : t('newsSearch.preparing')}
                          </div>
                        </div>
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    );
                  case 'input-available':
                    return (
                      <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border/50">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <Newspaper className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">
                            {part.type === 'tool-smartSearch' ? 'Ricerca notizie' : t('newsSearch.label')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {part.type === 'tool-smartSearch' ? 'Ricerca notizie in corso' : t('newsSearch.searching')}: {part.input?.query || '...'}
                          </div>
                        </div>
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    );
                  case 'output-available':
                    return (
                      <div key={index} className="p-3 bg-muted/30 rounded-lg border border-border/30">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <Newspaper className="h-4 w-4" />
                          </div>
                          <div className="text-sm font-medium text-foreground">
                            {part.type === 'tool-smartSearch' ? 'Ricerca notizie completata' : t('newsSearch.completed')}
                          </div>
                        </div>
                        
                        {/* Card Immagini Notizie Separate - SOPRA il summary */}
                        {part.output?.news && part.output.news.some((n: any) => n.images && n.images.length > 0) && (
                          <div className="mb-3">
                            <div className="text-xs font-medium text-muted-foreground mb-2">{t('newsSearch.imagesFound')}</div>
                            <div className="flex gap-2 overflow-x-auto">
                              {part.output.news
                                .filter((news: any) => news.images && news.images.length > 0)
                                .flatMap((news: any) => news.images.slice(0, 1).map((img: string) => ({ img, news })))
                                .slice(0, 4)
                                .map((item: any, idx: number) => (
                                  <div key={idx} className="flex-shrink-0 w-32 border rounded overflow-hidden bg-background">
                                    <img 
                                      src={item.img} 
                                      alt={`Immagine da ${item.news.title}`}
                                      className="w-full h-24 object-cover"
                                      onError={(e) => {
                                        e.currentTarget.parentElement!.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Summary - TRA immagini e notizie */}
                        {part.output?.answer && (
                          <div className="text-sm text-foreground mb-3 p-3 bg-background rounded border border-border/50">
                            <div className="font-medium text-foreground mb-2">{t('newsSearch.summary')}</div>
                            <div className="leading-relaxed">{part.output.answer}</div>
                          </div>
                        )}
                        
                        {/* Card Notizie */}
                        {part.output?.news && part.output.news.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-muted-foreground">{t('newsSearch.news')}</div>
                            {part.output.news.slice(0, 5).map((news: any, idx: number) => (
                              <div key={idx} className="text-xs border rounded p-2 bg-background/50">
                                <div className="font-medium text-foreground mb-1">{news.title}</div>
                                <div className="text-muted-foreground mb-1">{news.content}</div>
                                {news.publishedDate && (
                                  <div className="text-xs text-muted-foreground mb-1">
                                    {t('newsSearch.published')} {new Date(news.publishedDate).toLocaleDateString('it-IT')}
                                  </div>
                                )}
                                <div className="text-xs text-primary hover:text-primary/80">
                                  <a href={news.url} target="_blank" rel="noopener noreferrer">
                                    {t('newsSearch.readNews')}
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  case 'output-error':
                    return (
                      <div key={index} className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center">
                          <Newspaper className="h-4 w-4" />
                        </div>
                        <div className="text-sm text-destructive">
                          {part.type === 'tool-smartSearch' ? 'Errore ricerca notizie' : t('newsSearch.error')}: {part.errorText || t('generic.unknownError')}
                        </div>
                      </div>
                    );
                }
              }

              return null;
            })}
            
            {/* Poi mostra il testo dopo i tool calls */}
            {message.parts.filter(part => part.type === 'text').map((part, index) => (
              <div key={`text-${index}`} className="text-base leading-relaxed">
                {processMessageContent(part.text || '').map((contentPart, contentIndex) => (
                  <React.Fragment key={contentIndex}>
                    {contentPart.type === 'text' ? (
                      <span className="whitespace-pre-wrap">{contentPart.content}</span>
                    ) : (
                      <CanvaLinkCard url={contentPart.url!} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        )}
        
        {/* Per messaggi utente: mostra solo il contenuto */}
        {isUser && message.content && (
          <div className="text-base leading-relaxed">
            {processMessageContent(message.content).map((part, index) => (
              <React.Fragment key={index}>
                {part.type === 'text' ? (
                  <span className="whitespace-pre-wrap">{part.content}</span>
                ) : (
                  <CanvaLinkCard url={part.url!} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        
        {/* Per messaggi assistente senza parts: mostra il contenuto */}
        {!isUser && (!message.parts || message.parts.length === 0) && message.content && (
          <div className="text-base leading-relaxed">
            {processMessageContent(message.content).map((part, index) => (
              <React.Fragment key={index}>
                {part.type === 'text' ? (
                  <span className="whitespace-pre-wrap">{part.content}</span>
                ) : (
                  <CanvaLinkCard url={part.url!} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const TypingIndicator: React.FC = () => {
  const tChat = useTranslations('chat')
  const [currentTextIndex, setCurrentTextIndex] = React.useState(0)
  
  const typingTexts = [
    tChat('typing'),
    tChat('thinking'),
    tChat('searching'),
    tChat('analyzing'),
    tChat('processing')
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

const EmptyState: React.FC = () => {
  const tChat = useTranslations('chat')
  
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md mx-auto w-full max-w-2xl">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <StudioIcon size={24} />
        </div>
        <h3 className="text-lg mb-2">{tChat('emptyState.title')}</h3>
        <p className="text-muted-foreground text-sm">
          {tChat('emptyState.description')}
        </p>
      </div>
    </div>
  )
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, isLoading = false, isPageLoading = false }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading])

  // Check if there are active tool calls (input-streaming or input-available states)
  const hasActiveToolCalls = messages.some(message => 
    message.parts?.some(part => 
      part.state === 'input-streaming' || part.state === 'input-available'
    )
  )

  // Only show typing indicator if loading and no active tool calls
  const shouldShowTypingIndicator = isLoading && !hasActiveToolCalls

  // Skeleton per lo stato di caricamento della pagina
  if (isPageLoading) {
    return (
      <div className="h-full overflow-y-auto scroll-smooth">
        <div className="min-h-full flex flex-col">
          <div className="flex-1 mx-auto w-full max-w-2xl">
            {/* Skeleton per 3 messaggi */}
            {[1, 2, 3].map((index) => (
              <div key={index} className="flex flex-col p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                  <div className="w-16 h-4 bg-muted rounded animate-pulse" />
                </div>
                <div className="w-full">
                  <div className="bg-muted rounded-3xl p-4 animate-pulse">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted-foreground/20 rounded animate-pulse" style={{ width: "75%" }} />
                      <div className="h-4 bg-muted-foreground/20 rounded animate-pulse" style={{ width: "60%" }} />
                      {index % 2 === 0 && <div className="h-4 bg-muted-foreground/20 rounded animate-pulse" style={{ width: "45%" }} />}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="h-full flex flex-col">
        <EmptyState />
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="h-full overflow-y-auto scroll-smooth"
    >
      <div className="min-h-full flex flex-col">
        {/* Messages Container - Aligned with ChatInput */}
        <div className="flex-1 mx-auto w-full max-w-2xl">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {/* Typing Indicator - Only show when no active tool calls */}
          {shouldShowTypingIndicator && <TypingIndicator />}
        </div>
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}