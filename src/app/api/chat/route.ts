import { streamText } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

export async function POST(req: Request) {
  try {
    const { messages, agent_id, model_name } = await req.json();

    // Usa il modello selezionato dall'utente o il default
    const selectedModel = model_name || 'openai/gpt-oss-20b:free';
    const selectedAgent = agent_id || 'studio';

    // Configura OpenRouter come provider
    const openrouter = createOpenAICompatible({
      baseURL: 'https://openrouter.ai/api/v1',
      name: 'openrouter',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
    });

    // Personalizza il comportamento in base all'agente selezionato
    let systemMessage = '';
    switch (selectedAgent) {
      case 'studio':
        systemMessage = 'Sei un assistente AI chiamato Studio, progettato per aiutare gli utenti con conversazioni generali e supporto tecnico.';
        break;
      default:
        systemMessage = 'Sei un assistente AI utile e cordiale.';
    }

    // Aggiungi il messaggio di sistema se non è già presente
    const messagesWithSystem = messages[0]?.role === 'system' 
      ? messages 
      : [{ role: 'system', content: systemMessage }, ...messages];

    const result = await streamText({
      model: openrouter(selectedModel),
      messages: messagesWithSystem,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Errore nell\'API chat:', error);
    return new Response('Errore interno del server', { status: 500 });
  }
}