import { streamText, convertToModelMessages, stepCountIs, hasToolCall } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createServerMessageService } from '@/lib/services/message-service';
import { createServerThreadService } from '@/lib/services/thread-service';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { smartSearchTool } from '@/lib/tools/web-search-tool';
import { taskCompletedTool } from '@/lib/tools/task-completion-tool';
import { taskPlanningTool } from '@/lib/tools/task-planning-tool';
import { composioService } from '@/lib/services/composio-service';
import { getStudioSystemPrompt, getDefaultSystemPrompt } from '@/lib/prompts/system-prompts';

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
        systemMessage = getStudioSystemPrompt({
          timeInfo,
          now,
          composioTools,
        });
        tools = [smartSearchTool, taskPlanningTool, taskCompletedTool];
        break;
      default:
        systemMessage = getDefaultSystemPrompt({
          timeInfo,
          now,
        });
        tools = [smartSearchTool, taskPlanningTool, taskCompletedTool];
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
      allTools.taskPlanning = taskPlanningTool;
      allTools.taskCompleted = taskCompletedTool;
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
      stopWhen: hasToolCall('taskCompleted'), // Si ferma quando l'agent ha completato il task
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