import { createBrowserSupabaseClient, Database } from '@/lib/supabase'
import { createServerSupabaseClient, createServerSupabaseServiceClient } from '@/lib/supabase-server'

export type Message = Database['public']['Tables']['messages']['Row']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
export type MessageUpdate = Database['public']['Tables']['messages']['Update']

export class MessageService {
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

  // Crea un nuovo messaggio
  async createMessage(messageData: MessageInsert): Promise<Message | null> {
    try {
      const client = this.supabase || await this.initServerClient()
      
      const { data, error } = await client
        .from('messages')
        .insert(messageData as any)
        .select()
        .single()

      if (error) {
        console.error('Errore nella creazione del messaggio:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Errore nella creazione del messaggio:', error)
      return null
    }
  }

  // Ottieni tutti i messaggi di un thread
  async getThreadMessages(threadId: string): Promise<Message[]> {
    try {
      const client = this.supabase || await this.initServerClient()
      
      const { data, error } = await client
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Errore nel recupero dei messaggi:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Errore nel recupero dei messaggi:', error)
      return []
    }
  }

  // Ottieni un messaggio specifico
  async getMessage(messageId: string): Promise<Message | null> {
    try {
      const client = this.supabase || await this.initServerClient()
      
      const { data, error } = await client
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .single()

      if (error) {
        console.error('Errore nel recupero del messaggio:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Errore nel recupero del messaggio:', error)
      return null
    }
  }

  // Aggiorna un messaggio
  async updateMessage(messageId: string, updates: MessageUpdate): Promise<Message | null> {
    try {
      const client = this.supabase || await this.initServerClient()
      
      const { data, error } = await client
        .from('messages')
        .update(updates as any)
        .eq('id', messageId)
        .select()
        .single()

      if (error) {
        console.error('Errore nell\'aggiornamento del messaggio:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Errore nell\'aggiornamento del messaggio:', error)
      return null
    }
  }

  // Aggiorna il contenuto di un messaggio
  async updateMessageContent(messageId: string, content: string): Promise<boolean> {
    try {
      const client = this.supabase || await this.initServerClient()
      
      const { error } = await client
        .from('messages')
        .update({ content } as any)
        .eq('id', messageId)

      if (error) {
        console.error('Errore nell\'aggiornamento del contenuto:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Errore nell\'aggiornamento del contenuto:', error)
      return false
    }
  }

  // Elimina un messaggio
  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      const client = this.supabase || await this.initServerClient()
      
      const { error } = await client
        .from('messages')
        .delete()
        .eq('id', messageId)

      if (error) {
        console.error('Errore nell\'eliminazione del messaggio:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Errore nell\'eliminazione del messaggio:', error)
      return false
    }
  }

  // Elimina tutti i messaggi di un thread
  async deleteThreadMessages(threadId: string): Promise<boolean> {
    try {
      const client = this.supabase || await this.initServerClient()
      
      const { error } = await client
        .from('messages')
        .delete()
        .eq('thread_id', threadId)

      if (error) {
        console.error('Errore nell\'eliminazione dei messaggi del thread:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Errore nell\'eliminazione dei messaggi del thread:', error)
      return false
    }
  }

  // Crea un messaggio utente e uno dell'assistente in una transazione
  async createMessagePair(
    threadId: string, 
    userContent: string, 
    assistantContent: string
  ): Promise<{ userMessage: Message | null; assistantMessage: Message | null }> {
    try {
      const client = this.supabase || await this.initServerClient()
      
      // Crea il messaggio dell'utente
      const { data: userMessage, error: userError } = await client
        .from('messages')
        .insert({
          thread_id: threadId,
          role: 'user',
          content: userContent
        } as any)
        .select()
        .single()

      if (userError) {
        console.error('Errore nella creazione del messaggio utente:', userError)
        return { userMessage: null, assistantMessage: null }
      }

      // Crea il messaggio dell'assistente
      const { data: assistantMessage, error: assistantError } = await client
        .from('messages')
        .insert({
          thread_id: threadId,
          role: 'assistant',
          content: assistantContent
        } as any)
        .select()
        .single()

      if (assistantError) {
        console.error('Errore nella creazione del messaggio assistente:', assistantError)
        return { userMessage, assistantMessage: null }
      }

      return { userMessage, assistantMessage }
    } catch (error) {
      console.error('Errore nella creazione della coppia di messaggi:', error)
      return { userMessage: null, assistantMessage: null }
    }
  }

  // Conta i messaggi in un thread
  async countThreadMessages(threadId: string): Promise<number> {
    try {
      const client = this.supabase || await this.initServerClient()
      
      const { count, error } = await client
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('thread_id', threadId)

      if (error) {
        console.error('Errore nel conteggio dei messaggi:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('Errore nel conteggio dei messaggi:', error)
      return 0
    }
  }
}

// Istanze singleton per client e server
export const messageService = new MessageService(false) // Client-side
export const createServerMessageService = () => new MessageService(true, true) // Server-side con service role