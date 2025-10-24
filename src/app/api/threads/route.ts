import { NextRequest, NextResponse } from 'next/server'
import { createServerMessageService } from '@/lib/services/message-service'
import { createServerThreadService } from '@/lib/services/thread-service'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Ottieni l'utente autenticato dalla sessione
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Utente non autenticato' },
        { status: 401 }
      )
    }

    // Inizializza i servizi
    const threadService = createServerThreadService()
    const messageService = createServerMessageService()

    // Controlla se è una richiesta per creare un nuovo thread o aggiungere un messaggio
    if (body.threadId && body.role && body.content) {
      // Aggiungi un messaggio a un thread esistente
      const messageData = {
        id: crypto.randomUUID(),
        thread_id: body.threadId,
        role: body.role as 'user' | 'assistant',
        content: body.content
      }

      const newMessage = await messageService.createMessage(messageData)

      if (!newMessage) {
        return NextResponse.json(
          { error: 'Errore nella creazione del messaggio' },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        message: {
          id: newMessage.id,
          role: newMessage.role,
          content: newMessage.content,
          timestamp: newMessage.created_at
        }
      })
    }

    // Altrimenti, crea un nuovo thread (logica esistente)
    const { id, firstMessage, agent_id, model_name } = body

    if (!id || !firstMessage) {
      return NextResponse.json(
        { error: 'ID thread e primo messaggio sono richiesti' },
        { status: 400 }
      )
    }

    // Crea un nuovo thread con l'ID dell'utente autenticato
    const threadData = {
      id,
      title: firstMessage.length > 50 
        ? firstMessage.substring(0, 50) + '...' 
        : firstMessage,
      user_id: user.id, // Usa l'ID dell'utente autenticato
      agent_id: agent_id || 'studio',
      model_name: model_name || 'gpt-4.1-mini'
    }

    const newThread = await threadService.createThread(threadData)
    
    if (!newThread) {
      return NextResponse.json(
        { error: 'Errore nella creazione del thread' },
        { status: 500 }
      )
    }

    // Crea il primo messaggio
    const messageData = {
      id: crypto.randomUUID(),
      thread_id: id,
      role: 'user' as const,
      content: firstMessage
    }

    const firstMsg = await messageService.createMessage(messageData)

    // Prepara la risposta nel formato atteso dal frontend
    const responseThread = {
      id: newThread.id,
      title: newThread.title,
      messages: firstMsg ? [{
        id: firstMsg.id,
        role: firstMsg.role,
        content: firstMsg.content,
        timestamp: firstMsg.created_at
      }] : [],
      agent: {
        id: newThread.agent_id,
        name: newThread.agent_id === 'studio' ? 'Studio' : 'Agente'
      },
      model: {
        id: newThread.model_name,
        name: newThread.model_name?.includes('gpt-4.1-mini') ? 'GPT-4.1 Mini' : 'Modello AI',
        provider: 'OpenAI'
      },
      createdAt: newThread.created_at,
      updatedAt: newThread.updated_at
    }

    return NextResponse.json({ 
      success: true, 
      thread: responseThread 
    })

  } catch (error) {
    console.error('Errore nella creazione del thread o messaggio:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const threadId = searchParams.get('id')

    // Ottieni l'utente autenticato dalla sessione
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Utente non autenticato' },
        { status: 401 }
      )
    }

    // Inizializza i servizi
    const threadService = createServerThreadService()
    const messageService = createServerMessageService()

    if (threadId) {
      // Restituisce un thread specifico con i suoi messaggi
      const thread = await threadService.getThreadWithMessages(threadId)
      if (!thread) {
        return NextResponse.json(
          { error: 'Thread non trovato' },
          { status: 404 }
        )
      }

      // Formatta la risposta per il frontend
      const responseThread = {
        id: thread.id,
        title: thread.title,
        messages: thread.messages?.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.created_at
        })) || [],
        agent: {
          id: thread.agent_id,
          name: thread.agent_id === 'studio' ? 'Studio' : 'Agente'
        },
        model: {
          id: thread.model_name,
          name: thread.model_name?.includes('gpt-4.1-mini') ? 'GPT-4.1 Mini' : 'Modello AI',
          provider: 'OpenAI'
        },
        createdAt: thread.created_at,
        updatedAt: thread.updated_at
      }

      return NextResponse.json({ thread: responseThread })
    } else {
      // Restituisce tutti i thread dell'utente autenticato
      const allThreads = await threadService.getUserThreads(user.id)
      
      const formattedThreads = allThreads.map(thread => ({
        id: thread.id,
        title: thread.title,
        agent: {
          id: thread.agent_id,
          name: thread.agent_id === 'studio' ? 'Studio' : 'Agente'
        },
        model: {
          id: thread.model_name,
          name: thread.model_name?.includes('gpt-4.1-mini') ? 'GPT-4.1 Mini' : 'Modello AI',
          provider: 'OpenAI'
        },
        createdAt: thread.created_at,
        updatedAt: thread.updated_at
      }))
      
      return NextResponse.json({ threads: formattedThreads })
    }

  } catch (error) {
    console.error('Errore nel recupero dei thread:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}