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
        console.error('Error creating message:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error creating message:', error)
      return null
    }
  }

  // Crea un messaggio con parti (per tool calls)
  async createMessageWithParts(
    threadId: string,
    role: 'user' | 'assistant',
    content: string,
    parts?: any[],
    metadata?: any
  ): Promise<Message | null> {
    try {
      const client = this.supabase || await this.initServerClient()
      
      const messageData = {
        thread_id: threadId,
        role,
        content,
        parts: parts || null,  // Salva direttamente come JSONB, non come stringa
        metadata: metadata || null  // Salva direttamente come JSONB, non come stringa
      }

      const { data, error } = await client
        .from('messages')
        .insert(messageData)
        .select()
        .single()

      if (error) {
        console.error('Error creating message with parts:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error creating message with parts:', error)
      return null
    }
  }

  // Ottieni tutti i messaggi di un thread con parti
  async getThreadMessagesWithParts(threadId: string): Promise<any[]> {
    try {
      const client = this.supabase || await this.initServerClient()
      
      const { data, error } = await client
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error getting thread messages with parts:', error)
        return []
      }

      // I dati JSONB vengono già parsati automaticamente da Supabase
      return data || []
    } catch (error) {
      console.error('Error getting thread messages with parts:', error)
      return []
    }
  }

  // Ottieni tutti i messaggi di un thread (metodo originale per compatibilità)
  async getThreadMessages(threadId: string): Promise<Message[]> {
    try {
      const client = this.supabase || await this.initServerClient()
      
      const { data, error } = await client
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })

      if (error) {
        return []
      }

      return data || []
    } catch (error) {
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
        return null
      }

      return data
    } catch (error) {
      return null
    }
  }

  // Aggiorna un messaggio
  async updateMessage(messageId: string, updates: MessageUpdate): Promise<Message | null> {
    try {
      const client = this.supabase || await this.initServerClient()
      
      const { data, error } = await client
        .from('messages')
        .update(updates)
        .eq('id', messageId)
        .select()
        .single()

      if (error) {
        return null
      }

      return data
    } catch (error) {
      return null
    }
  }

  // Aggiorna solo il contenuto di un messaggio
  async updateMessageContent(messageId: string, content: string): Promise<boolean> {
    try {
      const client = this.supabase || await this.initServerClient()
      
      const { error } = await client
        .from('messages')
        .update({ content })
        .eq('id', messageId)

      if (error) {
        return false
      }

      return true
    } catch (error) {
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
        return false
      }

      return true
    } catch (error) {
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
        return false
      }

      return true
    } catch (error) {
      return false
    }
  }

  // Crea una coppia di messaggi (utente + assistente)
  async createMessagePair(
    threadId: string, 
    userContent: string, 
    assistantContent: string
  ): Promise<{ userMessage: Message | null; assistantMessage: Message | null }> {
    try {
      const client = this.supabase || await this.initServerClient()
      
      // Crea il messaggio utente
      const userMessage = await this.createMessage({
        thread_id: threadId,
        role: 'user',
        content: userContent
      } as MessageInsert)

      if (!userMessage) {
        return { userMessage: null, assistantMessage: null }
      }

      // Crea il messaggio assistente
      const assistantMessage = await this.createMessage({
        thread_id: threadId,
        role: 'assistant',
        content: assistantContent
      } as MessageInsert)

      if (!assistantMessage) {
        return { userMessage, assistantMessage: null }
      }

      return { userMessage, assistantMessage }
    } catch (error) {
      return { userMessage: null, assistantMessage: null }
    }
  }

  // Conta i messaggi di un thread
  async countThreadMessages(threadId: string): Promise<number> {
    try {
      const client = this.supabase || await this.initServerClient()
      
      const { count, error } = await client
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('thread_id', threadId)

      if (error) {
        return 0
      }

      return count || 0
    } catch (error) {
      return 0
    }
  }
}

// Istanze singleton per client e server
export const messageService = new MessageService(false) // Client-side
export const createServerMessageService = () => new MessageService(true, true) // Server-side con service role