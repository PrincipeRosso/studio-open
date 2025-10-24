import { streamText, convertToModelMessages, stepCountIs } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createServerMessageService } from '@/lib/services/message-service';
import { createServerThreadService } from '@/lib/services/thread-service';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { webSearchTool, newsSearchTool } from '@/lib/tools/web-search-tool';

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

Hai accesso a strumenti di ricerca web che ti permettono di:
- Cercare informazioni aggiornate su qualsiasi argomento
- Trovare notizie recenti e sviluppi attuali
- Ottenere dati in tempo reale quando necessario

Usa questi strumenti quando:
- L'utente chiede informazioni che potrebbero essere cambiate di recente
- Hai bisogno di dati aggiornati o notizie attuali
- Le tue conoscenze potrebbero essere obsolete per l'argomento richiesto

IMPORTANTE:
- Quando usi i tool di ricerca, rispondi sempre nella stessa lingua della query dell'utente
- Se la query è in italiano, rispondi in italiano
- Se la query è in inglese, rispondi in inglese
- Fornisci SEMPRE un riassunto COMPLETO e DETTAGLIATO nella lingua appropriata
- Il riassunto deve essere di almeno 3-4 paragrafi con informazioni approfondite
- Includi dettagli specifici, statistiche, date, nomi e contesto completo
- Mostra sempre almeno 5 fonti quando disponibili
- Cita sempre le fonti quando usi informazioni ottenute dalla ricerca web
- Struttura la risposta con: Introduzione, Sviluppo dettagliato, Conclusioni

I tool ti forniranno anche un'istruzione specifica sulla lingua da usare nel campo 'languageInstruction'.`;
        tools = [webSearchTool, newsSearchTool];
        break;
      default:
        systemMessage = 'Sei un assistente AI utile e cordiale.';
        tools = [webSearchTool, newsSearchTool];
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
        webSearch: webSearchTool,
        newsSearch: newsSearchTool,
      } : undefined,
      stopWhen: stepCountIs(5), // Permette fino a 5 step per l'esecuzione dei tools
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