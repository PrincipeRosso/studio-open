import { NextRequest, NextResponse } from 'next/server';
import { composioService } from '@/lib/services/composio-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, appId } = body;
    
    if (!userId || !appId) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId e appId sono richiesti'
        },
        { status: 400 }
      );
    }
    
    const authUrl = await composioService.instance.connectApp(userId, appId);
    
    return NextResponse.json({
      success: true,
      authUrl
    });
  } catch (error) {
    console.error('Errore nella connessione app:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
}

