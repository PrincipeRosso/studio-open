import { NextRequest, NextResponse } from 'next/server';
import { composioService } from '@/lib/services/composio-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, connectionId } = body;
    
    if (!userId || !connectionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId e connectionId sono richiesti'
        },
        { status: 400 }
      );
    }
    
    await composioService.instance.disconnectApp(userId, connectionId);
    
    return NextResponse.json({
      success: true,
      message: `Connessione ${connectionId} disconnessa con successo`
    });
  } catch (error) {
    console.error('Errore nella disconnessione app:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
}

