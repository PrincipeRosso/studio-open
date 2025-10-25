import { NextRequest, NextResponse } from 'next/server';
import { composioService } from '@/lib/services/composio-service';

export async function GET(request: NextRequest) {
  try {
    const apps = await composioService.instance.getAvailableApps();
    
    return NextResponse.json({
      success: true,
      apps
    });
  } catch (error) {
    console.error('Errore nel recupero app:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
}

