import { createBrowserSupabaseClient, Database } from '@/lib/supabase'
import { createServerSupabaseClient, createServerSupabaseServiceClient } from '@/lib/supabase-server'

export type Thread = Database['public']['Tables']['threads']['Row']
export type ThreadInsert = Database['public']['Tables']['threads']['Insert']
export type ThreadUpdate = Database['public']['Tables']['threads']['Update']

export interface ThreadWithMessages extends Thread {
  messages: Array<{
    id: string
    role: 'user' | 'assistant'
    content: string
    created_at: string
  }>
}

export class ThreadService {
  private supabase: any
  private useServiceRole: boolean

  constructor(isServer = false, useServiceRole = false) {
    if (isServer) {
      // Per operazioni server-side, creiamo il client in modo asincrono
      this.supabase = null
      this.useServiceRole = useServiceRole
    } else {
      this.supabase = createBrowserSupabaseClient()
      this.useServiceRole = false
    }
  }

  // Metodo per inizializzare il client server
  async initServerClient() {
    if (!this.supabase) {
      if (this.useServiceRole) {
        this.supabase = createServerSupabaseServiceClient()
      } else {
        this.supabase = await createServerSupabaseClient()
      }
    }
    return this.supabase
  }

  // Crea un nuovo thread
  async createThread(threadData: ThreadInsert): Promise<Thread | null> {
    try {
      const client = this.supabase || await this.initServerClient()
      
      const { data, error } = await client
        .from('threads')
        .insert(threadData as any)
        .select()
        .single()

      if (error) {
        console.error('Errore nella creazione del thread:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Errore nella creazione del thread:', error)
      return null
    }
  }

  // Ottieni tutti i thread di un utente
  async getUserThreads(userId: string): Promise<Thread[]> {
    try {
      const client = this.supabase || await this.initServerClient()
      
      const { data, error } = await client
        .from('threads')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Errore nel recupero dei thread:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Errore nel recupero dei thread:', error)
      return []
    }
  }

  // Ottieni un thread specifico con i suoi messaggi
  async getThreadWithMessages(threadId: string): Promise<ThreadWithMessages | null> {
    try {
      const client = this.supabase || await this.initServerClient()
      
      const { data: thread, error: threadError } = await client
        .from('threads')
        .select('*')
        .eq('id', threadId)
        .single()

      if (threadError) {
        console.error('Errore nel recupero del thread:', threadError)
        return null
      }

      const { data: messages, error: messagesError } = await client
        .from('messages')
        .select('id, role, content, created_at')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })

      if (messagesError) {
        console.error('Errore nel recupero dei messaggi:', messagesError)
        return null
      }

      return {
        ...thread,
        messages: messages || []
      } as ThreadWithMessages
    } catch (error) {
      console.error('Errore nel recupero del thread con messaggi:', error)
      return null
    }
  }

  // Aggiorna un thread
  async updateThread(threadId: string, updates: ThreadUpdate): Promise<Thread | null> {
    try {
      const client = this.supabase || await this.initServerClient()
      
      const { data, error } = await client
        .from('threads')
        .update(updates as any)
        .eq('id', threadId)
        .select()
        .single()

      if (error) {
        console.error('Errore nell\'aggiornamento del thread:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Errore nell\'aggiornamento del thread:', error)
      return null
    }
  }

  // Aggiorna il titolo di un thread
  async updateThreadTitle(threadId: string, title: string): Promise<boolean> {
    try {
      const client = this.supabase || await this.initServerClient()
      
      const { error } = await client
        .from('threads')
        .update({ title } as any)
        .eq('id', threadId)

      if (error) {
        console.error('Errore nell\'aggiornamento del titolo:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Errore nell\'aggiornamento del titolo:', error)
      return false
    }
  }

  // Elimina un thread
  async deleteThread(threadId: string): Promise<boolean> {
    try {
      const client = this.supabase || await this.initServerClient()
      
      const { error } = await client
        .from('threads')
        .delete()
        .eq('id', threadId)

      if (error) {
        console.error('Errore nell\'eliminazione del thread:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Errore nell\'eliminazione del thread:', error)
      return false
    }
  }

  // Aggiorna il timestamp updated_at di un thread (utile quando si aggiunge un messaggio)
  async touchThread(threadId: string): Promise<boolean> {
    try {
      const client = this.supabase || await this.initServerClient()
      
      const { error } = await client
        .from('threads')
        .update({ updated_at: new Date().toISOString() } as any)
        .eq('id', threadId)

      if (error) {
        console.error('Errore nell\'aggiornamento del timestamp:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Errore nell\'aggiornamento del timestamp:', error)
      return false
    }
  }
}

// Istanze singleton per client e server
export const threadService = new ThreadService(false) // Client-side
export const createServerThreadService = () => new ThreadService(true, true) // Server-side con service role