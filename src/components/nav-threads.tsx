"use client"

import { useState, useEffect } from "react"
import { MessageSquare, MoreHorizontal, Trash2, Edit3 } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { useParams, useRouter } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Thread {
  id: string
  title: string
  createdAt: string
  updatedAt: string
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

export function NavThreads() {
  const t = useTranslations()
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string
  const currentThreadId = params.id as string
  
  const [threads, setThreads] = useState<Thread[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Carica i thread dall'API
  useEffect(() => {
    const loadThreads = async () => {
      try {
        const response = await fetch('/api/threads')
        if (response.ok) {
          const data = await response.json()
          setThreads(data.threads || [])
        } else {
          console.error('Errore nel caricamento dei thread')
        }
      } catch (error) {
        console.error('Errore nel caricamento dei thread:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadThreads()
  }, [])

  const handleDeleteThread = async (threadId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Sei sicuro di voler eliminare questo thread?')) {
      return
    }

    try {
      const response = await fetch(`/api/threads/${threadId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Rimuovi il thread dalla lista locale
        setThreads(prev => prev.filter(thread => thread.id !== threadId))
        
        // Se stiamo eliminando il thread corrente, reindirizza alla dashboard
        if (threadId === currentThreadId) {
          router.push(`/${locale}/dashboard`)
        }
      } else {
        console.error('Errore nell\'eliminazione del thread')
      }
    } catch (error) {
      console.error('Errore nell\'eliminazione del thread:', error)
    }
  }

  const handleRenameThread = async (threadId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/threads/${threadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
      })

      if (response.ok) {
        // Aggiorna il thread nella lista locale
        setThreads(prev => prev.map(thread => 
          thread.id === threadId 
            ? { ...thread, title: newTitle }
            : thread
        ))
      } else {
        console.error('Errore nel rinominare il thread')
      }
    } catch (error) {
      console.error('Errore nel rinominare il thread:', error)
    }
  }

  const truncateTitle = (title: string, maxLength: number = 25) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title
  }

  if (isLoading) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Thread</SidebarGroupLabel>
        <SidebarMenu>
          {[...Array(3)].map((_, i) => (
            <SidebarMenuItem key={i}>
              <SidebarMenuSkeleton showIcon />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t('threads.label')}</SidebarGroupLabel>
      <SidebarMenu>
        {threads.slice(0, 10).map((thread) => (
          <SidebarMenuItem key={thread.id}>
            <SidebarMenuButton 
              asChild 
              className={`font-normal ${currentThreadId === thread.id ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}`}
            >
              <Link href={`/thread/${thread.id}`}>
                <MessageSquare className="h-4 w-4 opacity-70" />
                <span className="font-normal" title={thread.title}>
                  {truncateTitle(thread.title)}
                </span>
              </Link>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">{t('threads.moreActions')}</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={() => {
                    const newTitle = prompt(t('threads.newTitlePrompt'), thread.title)
                    if (newTitle && newTitle.trim() !== thread.title) {
                      handleRenameThread(thread.id, newTitle.trim())
                    }
                  }}
                >
                  <Edit3 className="h-4 w-4" />
                  {t('threads.rename')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={(e) => handleDeleteThread(thread.id, e)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  {t('threads.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        {threads.length === 0 && (
          <SidebarMenuItem>
            <div className="px-2 py-1 text-sm text-muted-foreground">
              {t('threads.noConversations')}
            </div>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}