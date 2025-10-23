"use client"

import React, { useEffect, useRef } from 'react'
import { StudioIcon } from '@/components/studio-icon'
import { User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatAreaProps {
  messages: Message[]
  isLoading?: boolean
  isPageLoading?: boolean
}

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user'
  
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
        "w-full px-4 py-4",
        isUser 
          ? "bg-card text-foreground rounded-3xl border border-border shadow-sm" 
          : "text-foreground"
      )}>
        <div className="text-base leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    </div>
  )
}

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex gap-3 p-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <StudioIcon size={16} />
      </div>
      <div className="bg-muted text-muted-foreground rounded-2xl px-4 py-3">
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-xs ml-2 opacity-70">Sta scrivendo...</span>
        </div>
      </div>
    </div>
  )
}

const EmptyState: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md mx-auto w-full max-w-2xl">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <StudioIcon size={24} />
        </div>
        <h3 className="text-lg mb-2">Inizia una nuova conversazione</h3>
        <p className="text-muted-foreground text-sm">
          Scrivi un messaggio qui sotto per iniziare a chattare con Studio.
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
                      <div className="h-4 bg-muted-foreground/20 rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
                      <div className="h-4 bg-muted-foreground/20 rounded animate-pulse" style={{ width: `${40 + Math.random() * 40}%` }} />
                      {Math.random() > 0.5 && <div className="h-4 bg-muted-foreground/20 rounded animate-pulse" style={{ width: `${30 + Math.random() * 50}%` }} />}
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
          
          {/* Typing Indicator */}
          {isLoading && <TypingIndicator />}
        </div>
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}