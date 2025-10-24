"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { AuthCard } from "@/components/auth-card"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { ChatInput } from "@/components/thread/chat-input/chat-input"
import { TypewriterText } from "@/components/typewriter-text"
import { Button } from "@/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { User, LogOut } from "lucide-react"
import { useRouter, useParams } from "next/navigation"

function DashboardContent() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  const handleSubmit = async (message: string, options?: { model_name?: string; agent_id?: string }) => {
    // Genera un UUID valido per il nuovo thread
    const threadId = crypto.randomUUID()
    
    try {
      // Crea un nuovo thread con il primo messaggio
      const response = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: threadId,
          firstMessage: message,
          agent_id: options?.agent_id || 'studio',
          model_name: options?.model_name || 'gpt-4.1-mini'
        })
      })

      if (response.ok) {
        // Reindirizza alla pagina del thread mantenendo la localizzazione
        router.push(`/${locale}/thread/${threadId}`)
      } else {
        console.error('Errore nella creazione del thread')
      }
    } catch (error) {
      console.error('Errore nella creazione del thread:', error)
      // Fallback: reindirizza comunque alla pagina del thread mantenendo la localizzazione
      router.push(`/${locale}/thread/${threadId}`)
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-sidebar">
        <div className="h-screen flex items-center justify-center p-4 pb-20">
          <div className="w-full max-w-4xl space-y-12">
            <div className="text-center">
              <TypewriterText />
            </div>
            <div className="flex justify-center">
              <ChatInput 
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
        
        {/* Auth Card - only show when user is not logged in */}
        {!user && <AuthCard />}
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function Page() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  )
}
