import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

// Tipi per il database
export interface Database {
  public: {
    Tables: {
      threads: {
        Row: {
          id: string
          user_id: string
          title: string
          agent_id: string
          agent_name: string
          model_id: string
          model_name: string
          model_provider: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          title: string
          agent_id?: string
          agent_name?: string
          model_id?: string
          model_name?: string
          model_provider?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          agent_id?: string
          agent_name?: string
          model_id?: string
          model_name?: string
          model_provider?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          thread_id: string
          role: 'user' | 'assistant'
          content: string
          created_at: string
        }
        Insert: {
          id: string
          thread_id: string
          role: 'user' | 'assistant'
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          thread_id?: string
          role?: 'user' | 'assistant'
          content?: string
        }
      }
    }
  }
}

// Client per il browser
export const createBrowserSupabaseClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// Client semplice per operazioni non autenticate
export const supabase = createSupabaseClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Funzione legacy per compatibilità
export function createClient() {
  return createBrowserSupabaseClient()
}