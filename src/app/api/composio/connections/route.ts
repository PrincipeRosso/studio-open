import { NextRequest, NextResponse } from 'next/server';
import { composioService } from '@/lib/services/composio-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
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
    
    const connections = await composioService.instance.getUserConnections(userId);
    
    return NextResponse.json({
      success: true,
      connections
    });
  } catch (error) {
    console.error('Errore nel recupero connessioni:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
}

