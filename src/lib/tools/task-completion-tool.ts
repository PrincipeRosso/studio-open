import { tool } from 'ai';
import { z } from 'zod';

/**
 * Tool per segnalare il completamento di una task complessa.
 * Quando l'agente invoca questo tool, l'esecuzione si ferma automaticamente
 * grazie alla configurazione stopWhen: hasToolCall('task_completed')
 */
export const taskCompletedTool = tool({
  description: `Segnala che hai completato con successo tutti i task richiesti dall'utente.
  Usa questo tool SOLO quando:
  - Hai completato tutte le attività richieste
  - Hai fornito una risposta completa e soddisfacente
  - Non sono necessarie ulteriori azioni
  
  Non usare questo tool se:
  - Devi ancora completare azioni richieste
  - Hai bisogno di informazioni aggiuntive
  - La risposta è incompleta o parziale`,
  
  inputSchema: z.object({
    summary: z.string().describe('Breve riepilogo di ciò che è stato completato'),
  }),
  
  execute: async ({ summary }) => {
    console.log('✅ Agent ha completato il task:', summary);
    return {
      status: 'completed',
      message: 'Task completato con successo',
      summary,
      timestamp: new Date().toISOString(),
    };
  },
});

