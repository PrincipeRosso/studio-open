"use client"

import React, { useEffect, useRef } from 'react'
import { StudioIcon } from '@/components/studio-icon'
import { User, Search, Newspaper, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

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
  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case 'webSearch':
        return <Search className="h-4 w-4" />
      case 'newsSearch':
        return <Newspaper className="h-4 w-4" />
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />
    }
  }

  const getToolLabel = (toolName: string) => {
    switch (toolName) {
      case 'webSearch':
        return 'Ricerca web'
      case 'newsSearch':
        return 'Ricerca notizie'
      default:
        return 'Strumento'
    }
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
          {args?.query || 'Esecuzione in corso...'}
        </div>
      </div>
      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
    </div>
  )
}

const ToolResult: React.FC<{ toolName: string; result: any }> = ({ toolName, result }) => {
  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case 'webSearch':
        return <Search className="h-4 w-4" />
      case 'newsSearch':
        return <Newspaper className="h-4 w-4" />
      default:
        return <Loader2 className="h-4 w-4" />
    }
  }

  const getToolLabel = (toolName: string) => {
    switch (toolName) {
      case 'webSearch':
        return 'Risultati ricerca web'
      case 'newsSearch':
        return 'Risultati notizie'
      default:
        return 'Risultato strumento'
    }
  }

  if (!result?.success) {
    return (
      <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center">
          {getToolIcon(toolName)}
        </div>
        <div className="text-sm text-destructive">
          Errore: {result?.error || 'Errore sconosciuto'}
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
    </div>
  )
}

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
              // Tool calls per webSearch
              if (part.type === 'tool-webSearch') {
                switch (part.state) {
                  case 'input-streaming':
                    return (
                      <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border/50">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <Search className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">{t('webSearch.label')}</div>
                          <div className="text-xs text-muted-foreground">{t('webSearch.preparing')}</div>
                        </div>
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    );
                  case 'input-available':
                    return (
                      <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border/50">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <Search className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">{t('webSearch.label')}</div>
                          <div className="text-xs text-muted-foreground">{t('webSearch.searching')}: {part.input?.query || '...'}</div>
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
                          <div className="text-sm font-medium text-foreground">{t('webSearch.completed')}</div>
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

              // Tool calls per newsSearch
              if (part.type === 'tool-newsSearch') {
                switch (part.state) {
                  case 'input-streaming':
                    return (
                      <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border/50">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <Newspaper className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">{t('newsSearch.label')}</div>
                          <div className="text-xs text-muted-foreground">{t('newsSearch.preparing')}</div>
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
                          <div className="text-sm font-medium text-foreground">{t('newsSearch.label')}</div>
                          <div className="text-xs text-muted-foreground">{t('newsSearch.searching')}: {part.input?.query || '...'}</div>
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
                          <div className="text-sm font-medium text-foreground">{t('newsSearch.completed')}</div>
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
                          {t('newsSearch.error')}: {part.errorText || t('generic.unknownError')}
                        </div>
                      </div>
                    );
                }
              }

              return null;
            })}
            
            {/* Poi mostra il testo dopo i tool calls */}
            {message.parts.filter(part => part.type === 'text').map((part, index) => (
              <div key={`text-${index}`} className="text-base leading-relaxed whitespace-pre-wrap">
                {part.text}
              </div>
            ))}
          </div>
        )}
        
        {/* Per messaggi utente: mostra solo il contenuto */}
        {isUser && message.content && (
          <div className="text-base leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
        )}
        
        {/* Per messaggi assistente senza parts: mostra il contenuto */}
        {!isUser && (!message.parts || message.parts.length === 0) && message.content && (
          <div className="text-base leading-relaxed whitespace-pre-wrap">
            {message.content}
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