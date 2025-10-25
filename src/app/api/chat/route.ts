import { streamText, convertToModelMessages, stepCountIs } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createServerMessageService } from '@/lib/services/message-service';
import { createServerThreadService } from '@/lib/services/thread-service';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { smartSearchTool } from '@/lib/tools/web-search-tool';
import { composioService } from '@/lib/services/composio-service';

export async function POST(req: Request) {
  try {
    const { messages, threadId, agent_id, model_name } = await req.json();

    // Ottieni l'utente autenticato dalla sessione
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response('Utente non autenticato', { status: 401 });
    }

    // Inizializza i servizi
    const messageService = createServerMessageService();
    const threadService = createServerThreadService();

    // Usa il modello selezionato dall'utente o il default
    const selectedModel = model_name || 'gpt-4.1-mini';
    const selectedAgent = agent_id || 'studio';

    // Genera informazioni temporali per l'agente
    const now = new Date();
    const timeInfo = {
      currentDate: now.toLocaleDateString('it-IT', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      currentTime: now.toLocaleTimeString('it-IT', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Europe/Rome'
      }),
      isoDate: now.toISOString().split('T')[0], // YYYY-MM-DD
      isoDateTime: now.toISOString(),
      timezone: 'Europe/Rome (CET/CEST)'
    };

    // Debug: Log delle informazioni temporali
    console.log('🕐 Informazioni temporali generate:', timeInfo);

    // Recupera i tools di Composio per l'utente (se ha app connesse)
    let composioTools: Record<string, any> = {};
    try {
      console.log(`🔍 Recupero tools Composio per utente ${user.id}...`);
      const tools = await composioService.instance.getToolsForUser(user.id);
      
      // I tools sono già nel formato corretto (oggetto) per Vercel AI SDK
      if (typeof tools === 'object' && tools !== null && !Array.isArray(tools)) {
        composioTools = tools;
        const toolCount = Object.keys(composioTools).length;
        console.log(`✅ ${toolCount} tools Composio caricati`);
      } else {
        console.warn(`⚠️ Formato tools non valido, ricevuto:`, typeof tools);
      }
    } catch (error) {
      console.error('⚠️ Errore nel recupero tools Composio:', error);
      // Continua senza tools Composio in caso di errore
    }

    // Personalizza il comportamento in base all'agente selezionato
    let systemMessage = '';
    let tools = [];
    
    switch (selectedAgent) {
      case 'studio':
    systemMessage = `Sei un assistente AI chiamato Studio, progettato per aiutare gli utenti con conversazioni generali e supporto tecnico.

    INFORMAZIONI TEMPORALI CORRENTI:
    - Data e ora attuale: ${timeInfo.currentDate} alle ${timeInfo.currentTime}
    - Data ISO: ${timeInfo.isoDate}
    - Data e ora ISO completa: ${timeInfo.isoDateTime}
    - Fuso orario: ${timeInfo.timezone}
    
    ⚠️ CRITICO - RIFERIMENTI TEMPORALI:
    La data corrente è: ${timeInfo.currentDate} (${timeInfo.isoDate})
    L'ora corrente è: ${timeInfo.currentTime}
    
    REGOLE ASSOLUTE PER LE DATE:
    - "OGGI" = ${timeInfo.isoDate} (NON ALTRE DATE!)
    - "DOMANI" = ${new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]} (NON ALTRE DATE!)
    - "IERI" = ${new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]} (NON ALTRE DATE!)
    - NON usare MAI date diverse da quelle specificate sopra
    - NON basarti sulle tue conoscenze pre-addestrate per le date
    - USA SEMPRE le date esatte fornite qui sopra
    - Per eventi e appuntamenti, usa sempre il formato ISO (YYYY-MM-DD)
    - Considera sempre il fuso orario italiano (Europe/Rome)
    
    ESEMPIO CONCRETO:
    Se l'utente dice "crea un evento per domani", usa SEMPRE la data: ${new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
    NON usare MAI altre date come 2024-06-05 o qualsiasi altra data diversa da quella specificata.

    Hai accesso a UN SOLO strumento di ricerca intelligente:

    SMART SEARCH TOOL - Ricerca intelligente che seleziona automaticamente:
    - Per informazioni generali: guide, tutorial, spiegazioni tecniche, dati, statistiche, definizioni, ricerche accademiche, cultura, scienza, prodotti, servizi, aziende, persone famose, eventi storici, luoghi, tecnologia generale
    - Per notizie recenti: eventi di cronaca, sviluppi politici, economia attuale, sport recenti, emergenze, catastrofi, elezioni, annunci aziendali recenti, lanci prodotti, summit internazionali, cambiamenti normativi

    REGOLE CRITICHE:
    - USA SEMPRE SOLO IL SMART SEARCH TOOL
    - Il tool seleziona automaticamente tra ricerca web e notizie
    - NON usare mai altri tool di ricerca
    - Una sola ricerca per richiesta

    IMPORTANTE LINGUA:
    - Rispondi SEMPRE nella stessa lingua della query dell'utente
    - Se l'utente scrive in italiano, rispondi SEMPRE in italiano
    - Se l'utente scrive in inglese, rispondi SEMPRE in inglese
    - NON cambiare mai lingua durante la conversazione

    IMPORTANTE - DOPO aver usato i tool di ricerca web:
    I tool hanno GIÀ fornito un SUMMARY DETTAGLIATO delle informazioni/notizie trovate.
    La tua risposta deve essere MOLTO BREVE e CONTESTUALE (2-3 frasi massimo):
    - NON ripetere il summary già mostrato dal tool
    - NON creare un altro riassunto delle informazioni
    - NON elencare nuovamente le fonti o i dettagli già mostrati
    - Rispondi direttamente alla domanda dell'utente in modo naturale
    - Aggiungi valore con un commento, insight o collegamento contestuale
    - Sii conversazionale e umano, non ripetitivo
    - Mantieni SEMPRE la stessa lingua della query dell'utente
    
    Esempio CORRETTO:
    Utente: "Dammi notizie su ChatGPT"
    Tool: [mostra summary dettagliato + 5 fonti]
    Tu: "Come puoi vedere dalle fonti trovate, ChatGPT continua ad evolversi rapidamente. C'è qualcosa di specifico che ti interessa approfondire?"
    
    Esempio SBAGLIATO:
    Tu: "ChatGPT è un modello di linguaggio... [ripete il summary del tool]... Come mostrato nelle fonti..."

    I tool ti forniranno anche un'istruzione specifica sulla lingua da usare nel campo 'languageInstruction'.
    
    ${Object.keys(composioTools).length > 0 ? `
    INTEGRAZIONI DISPONIBILI:
    Hai accesso a ${Object.keys(composioTools).length} strumenti aggiuntivi dalle app che l'utente ha connesso.
    Questi strumenti ti permettono di interagire con servizi esterni come Gmail, Slack, Google Calendar, GitHub, ecc.
    Usa questi strumenti quando l'utente ti chiede di eseguire azioni specifiche su queste piattaforme.
    ` : ''}`;
        tools = [smartSearchTool];
        break;
      default:
        systemMessage = `Sei un assistente AI utile e cordiale.

    INFORMAZIONI TEMPORALI CORRENTI:
    - Data e ora attuale: ${timeInfo.currentDate} alle ${timeInfo.currentTime}
    - Data ISO: ${timeInfo.isoDate}
    - Data e ora ISO completa: ${timeInfo.isoDateTime}
    - Fuso orario: ${timeInfo.timezone}
    
    ⚠️ CRITICO - RIFERIMENTI TEMPORALI:
    La data corrente è: ${timeInfo.currentDate} (${timeInfo.isoDate})
    L'ora corrente è: ${timeInfo.currentTime}
    
    REGOLE ASSOLUTE PER LE DATE:
    - "OGGI" = ${timeInfo.isoDate} (NON ALTRE DATE!)
    - "DOMANI" = ${new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]} (NON ALTRE DATE!)
    - "IERI" = ${new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]} (NON ALTRE DATE!)
    - NON usare MAI date diverse da quelle specificate sopra
    - NON basarti sulle tue conoscenze pre-addestrate per le date
    - USA SEMPRE le date esatte fornite qui sopra
    - Per eventi e appuntamenti, usa sempre il formato ISO (YYYY-MM-DD)
    - Considera sempre il fuso orario italiano (Europe/Rome)
    
    ESEMPIO CONCRETO:
    Se l'utente dice "crea un evento per domani", usa SEMPRE la data: ${new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
    NON usare MAI altre date come 2024-06-05 o qualsiasi altra data diversa da quella specificata.`;
        tools = [smartSearchTool];
    }

    // Converti i UIMessage in ModelMessage per streamText
    const modelMessages = convertToModelMessages(messages);

    // Aggiungi il messaggio di sistema se non è già presente
    const messagesWithSystem = modelMessages[0]?.role === 'system' 
      ? modelMessages 
      : [{ role: 'system' as const, content: systemMessage }, ...modelMessages];

    // Save user message to Supabase if threadId is provided
    if (threadId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        // Handle UIMessage structure from useChat
        let content = '';
        if (typeof lastMessage.content === 'string') {
          content = lastMessage.content;
        } else if (lastMessage.parts) {
          // Extract text from parts array
          content = lastMessage.parts
            .filter((part: any) => part.type === 'text')
            .map((part: any) => part.text)
            .join('');
        } else if (Array.isArray(lastMessage.content)) {
          content = lastMessage.content.map((part: any) => part.text).join('');
        }

        await messageService.createMessageWithParts(
          threadId,
          'user',
          content,
          lastMessage.parts || [{ type: 'text', text: content }],
          {
            hasToolCalls: false,
            finishReason: 'stop'
          }
        );
      }
    }

    // Combina i tools standard con quelli di Composio
    const allTools: Record<string, any> = {};
    
    // Aggiungi i tools standard
    if (tools.length > 0) {
      allTools.smartSearch = smartSearchTool;
    }
    
    // Aggiungi i tools di Composio (se disponibili)
    const composioToolsCount = Object.keys(composioTools).length;
    if (composioToolsCount > 0) {
      console.log(`🔧 Aggiunta di ${composioToolsCount} tools Composio all'agent`);
      // I tools di Composio sono già nel formato corretto per Vercel AI SDK
      // grazie al VercelProvider - basta fare un merge degli oggetti
      Object.assign(allTools, composioTools);
    }

    const result = await streamText({
      model: openai(selectedModel),
      messages: messagesWithSystem,
      tools: Object.keys(allTools).length > 0 ? allTools : undefined,
      stopWhen: stepCountIs(2), // Ridotto a 2 step per evitare multiple chiamate automatiche
    });

    return result.toUIMessageStreamResponse({
      onFinish: async ({ responseMessage }) => {
        // Salva la risposta dell'assistente su Supabase con parti
        if (threadId && responseMessage) {
          // Estrai il contenuto testuale dal messaggio
          const textContent = responseMessage.parts
            .filter(part => part.type === 'text')
            .map(part => part.text)
            .join('');
          
          // Genera un UUID valido se l'ID è vuoto
          const messageId = responseMessage.id || crypto.randomUUID();
          
          if (textContent) {
            try {
              // Salva il messaggio con le parti (inclusi tool calls)
              const savedMessage = await messageService.createMessageWithParts(
                threadId,
                'assistant',
                textContent,
                responseMessage.parts,
                {
                  toolCallsCount: responseMessage.parts.filter(part => part.type?.startsWith('tool-')).length,
                  hasToolCalls: responseMessage.parts.some(part => part.type?.startsWith('tool-')),
                  finishReason: 'stop'
                }
              );
              
              console.log('Messaggio salvato con parti:', savedMessage?.id);
            } catch (error) {
              console.error('Errore nel salvataggio del messaggio:', error);
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Errore nell\'API chat:', error);
    return new Response('Errore interno del server', { status: 500 });
  }
}