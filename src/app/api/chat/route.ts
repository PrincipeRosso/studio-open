import { streamText, convertToModelMessages, stepCountIs } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createServerMessageService } from '@/lib/services/message-service';
import { createServerThreadService } from '@/lib/services/thread-service';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { smartSearchTool } from '@/lib/tools/web-search-tool';

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

    // Personalizza il comportamento in base all'agente selezionato
    let systemMessage = '';
    let tools = [];
    
    switch (selectedAgent) {
      case 'studio':
    systemMessage = `Sei un assistente AI chiamato Studio, progettato per aiutare gli utenti con conversazioni generali e supporto tecnico.

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

    I tool ti forniranno anche un'istruzione specifica sulla lingua da usare nel campo 'languageInstruction'.`;
        tools = [smartSearchTool];
        break;
      default:
        systemMessage = 'Sei un assistente AI utile e cordiale.';
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

    const result = await streamText({
      model: openai(selectedModel),
      messages: messagesWithSystem,
      tools: tools.length > 0 ? {
        smartSearch: smartSearchTool,
      } : undefined,
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