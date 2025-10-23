"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { ChatInput } from "@/components/thread/chat-input/chat-input"
import { ThreadHeader } from "@/components/thread/thread-header"
import { ChatArea } from "@/components/thread/chat-area"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ThreadData {
  id: string
  title: string
  messages: Message[]
  agent: {
    id: string
    name: string
  }
  model: {
    id: string
    name: string
    provider: string
  }
}

function ThreadContent() {
  const { user } = useAuth()
  const params = useParams()
  const threadId = params.id as string
  
  const [threadData, setThreadData] = useState<ThreadData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Carica i dati del thread da Supabase
  useEffect(() => {
    const loadThreadData = async () => {
      setIsLoading(true)
      
      try {
        // Chiamata API per caricare i dati del thread
        const response = await fetch(`/api/threads?id=${threadId}`)
        
        if (response.ok) {
          const data = await response.json()
          if (data.thread) {
            // Converte le date string in oggetti Date
            const threadWithDates = {
              ...data.thread,
              messages: data.thread.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
              }))
            }
            setThreadData(threadWithDates)
          } else {
            // Thread non trovato, usa dati mock per un nuovo thread
            const mockThreadData: ThreadData = {
              id: threadId,
              title: "Nuova conversazione",
              messages: [],
              agent: {
                id: 'studio',
                name: 'Studio'
              },
              model: {
                id: 'openai/gpt-oss-20b:free',
                name: 'GPT OSS 20B',
                provider: 'OpenRouter'
              }
            }
            setThreadData(mockThreadData)
          }
        } else {
          console.error('Errore nel caricamento del thread')
          // Fallback ai dati mock
          const mockThreadData: ThreadData = {
            id: threadId,
            title: "Nuova conversazione",
            messages: [],
            agent: {
              id: 'studio',
              name: 'Studio'
            },
            model: {
              id: 'openai/gpt-oss-20b:free',
              name: 'GPT OSS 20B',
              provider: 'OpenRouter'
            }
          }
          setThreadData(mockThreadData)
        }
      } catch (error) {
        console.error('Errore nel caricamento del thread:', error)
        // Fallback ai dati mock
        const mockThreadData: ThreadData = {
          id: threadId,
          title: "Nuova conversazione",
          messages: [],
          agent: {
            id: 'studio',
            name: 'Studio'
          },
          model: {
            id: 'openai/gpt-oss-20b:free',
            name: 'GPT OSS 20B',
            provider: 'OpenRouter'
          }
        }
        setThreadData(mockThreadData)
      }
      
      setIsLoading(false)
    }

    if (threadId) {
      loadThreadData()
    }
  }, [threadId])

  const handleSubmit = async (message: string, options?: { model_name?: string; agent_id?: string }) => {
    if (!threadData) return

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    }

    // Aggiungi il messaggio dell'utente
    setThreadData(prev => prev ? {
      ...prev,
      messages: [...prev.messages, newMessage]
    } : null)

    try {
      // Salva il messaggio dell'utente nel database
      await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: threadData.id,
          role: 'user',
          content: message
        })
      })

      // Chiamata API per ottenere la risposta dell'assistente
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...(threadData.messages || []), newMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          agent_id: options?.agent_id || threadData.agent.id,
          model_name: options?.model_name || threadData.model.id
        })
      })

      if (response.ok) {
        const reader = response.body?.getReader()
        if (reader) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: '',
            timestamp: new Date()
          }

          // Aggiungi il messaggio dell'assistente (inizialmente vuoto)
          setThreadData(prev => prev ? {
            ...prev,
            messages: [...prev.messages, assistantMessage]
          } : null)

          // Leggi lo stream della risposta
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = new TextDecoder().decode(value)
            assistantMessage.content += chunk

            // Aggiorna il messaggio dell'assistente
            setThreadData(prev => prev ? {
              ...prev,
              messages: prev.messages.map(msg => 
                msg.id === assistantMessage.id ? { ...assistantMessage } : msg
              )
            } : null)
          }

          // Salva il messaggio completo dell'assistente nel database
          if (assistantMessage.content) {
            await fetch('/api/threads', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                threadId: threadData.id,
                role: 'assistant',
                content: assistantMessage.content
              })
            })
          }
        }
      }
    } catch (error) {
      console.error('Errore nell\'invio del messaggio:', error)
    }
  }

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-sidebar">
          <div className="h-screen flex flex-col">
            {/* Thread Header Skeleton */}
            <ThreadHeader 
              title=""
              isLoading={true}
            />
            
            {/* Chat Area Skeleton */}
            <div className="flex-1 overflow-hidden">
              <ChatArea messages={[]} isPageLoading={true} />
            </div>
            
            {/* Chat Input Skeleton */}
            <div className="p-4">
              <ChatInput 
                onSubmit={() => {}}
                isLoading={true}
              />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!threadData) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-sidebar">
          <div className="h-screen flex items-center justify-center">
            <div className="text-muted-foreground">Thread non trovato</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-sidebar">
        <div className="h-screen flex flex-col">
          {/* Thread Header */}
          <ThreadHeader 
            title={threadData.title}
          />
          
          {/* Chat Area */}
          <div className="flex-1 overflow-hidden">
            <ChatArea messages={threadData.messages} />
          </div>
          
          {/* Chat Input */}
          <div className="p-4">
            <ChatInput 
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function ThreadPage() {
  return (
    <AuthProvider>
      <ThreadContent />
    </AuthProvider>
  )
}