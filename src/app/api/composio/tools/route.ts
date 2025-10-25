import { NextRequest, NextResponse } from 'next/server';
import { composioService } from '@/lib/services/composio-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId è richiesto'
        },
        { status: 400 }
      );
    }
    
    // Ottieni i tools basati sulle app connesse dell'utente
    const tools = await composioService.instance.getToolsForUser(userId);
    
    return NextResponse.json({
      success: true,
      tools,
      count: tools.length || 0
    });
  } catch (error) {
    console.error('Errore nel recupero tools:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
}

