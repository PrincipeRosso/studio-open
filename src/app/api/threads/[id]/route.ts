import { NextRequest, NextResponse } from 'next/server'
import { createServerThreadService } from '@/lib/services/thread-service'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: threadId } = await params
    const body = await request.json()
    
    const threadService = createServerThreadService()
    
    // Aggiorna solo il titolo se fornito
    if (body.title) {
      const updatedThread = await threadService.updateThreadTitle(threadId, body.title)
      
      if (!updatedThread) {
        return NextResponse.json(
          { error: 'Thread non trovato' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({ 
        success: true, 
        thread: updatedThread 
      })
    }
    
    // Aggiornamento completo del thread
    const updatedThread = await threadService.updateThread(threadId, body)
    
    if (!updatedThread) {
      return NextResponse.json(
        { error: 'Thread non trovato' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      thread: updatedThread 
    })
    
  } catch (error) {
    console.error('Errore nell\'aggiornamento del thread:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: threadId } = await params
    
    const threadService = createServerThreadService()
    
    const success = await threadService.deleteThread(threadId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Thread non trovato' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Thread eliminato con successo'
    })
    
  } catch (error) {
    console.error('Errore nell\'eliminazione del thread:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}