import { NextRequest, NextResponse } from 'next/server'

// Simulazione di un database in memoria per i thread
// In un'applicazione reale, useresti un database vero
const threads = new Map<string, any>()

export async function POST(req: NextRequest) {
  try {
    const { id, firstMessage, agent_id, model_name } = await req.json()

    if (!id || !firstMessage) {
      return NextResponse.json(
        { error: 'ID thread e primo messaggio sono richiesti' },
        { status: 400 }
      )
    }

    // Crea un nuovo thread
    const newThread = {
      id,
      title: firstMessage.length > 50 
        ? firstMessage.substring(0, 50) + '...' 
        : firstMessage,
      messages: [
        {
          id: Date.now().toString(),
          role: 'user',
          content: firstMessage,
          timestamp: new Date().toISOString()
        }
      ],
      agent: {
        id: agent_id || 'studio',
        name: agent_id === 'studio' ? 'Studio' : 'Agente'
      },
      model: {
        id: model_name || 'openai/gpt-oss-20b:free',
        name: model_name?.includes('gpt-oss-20b') ? 'GPT OSS 20B' : 'Modello AI',
        provider: 'OpenRouter'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Salva il thread (in memoria per ora)
    threads.set(id, newThread)

    return NextResponse.json({ 
      success: true, 
      thread: newThread 
    })

  } catch (error) {
    console.error('Errore nella creazione del thread:', error)
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

    if (threadId) {
      // Restituisce un thread specifico
      const thread = threads.get(threadId)
      if (!thread) {
        return NextResponse.json(
          { error: 'Thread non trovato' },
          { status: 404 }
        )
      }
      return NextResponse.json({ thread })
    } else {
      // Restituisce tutti i thread
      const allThreads = Array.from(threads.values())
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      
      return NextResponse.json({ threads: allThreads })
    }

  } catch (error) {
    console.error('Errore nel recupero dei thread:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}