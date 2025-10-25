import { tool } from 'ai';
import { z } from 'zod';
import { composioService } from '@/lib/services/composio-service';

// Tool per ottenere i tools di Composio per un utente
export const composioGetToolsTool = tool({
  description: 'Ottiene i tools di Composio disponibili per un utente specifico',
  parameters: z.object({
    userId: z.string().describe('ID dell\'utente'),
    tools: z.array(z.string()).describe('Lista dei nomi dei tools da ottenere (es. ["GMAIL_SEND_EMAIL", "SLACK_SEND_MESSAGE"])')
  }),
  execute: async ({ userId, tools }) => {
    try {
      const composioTools = await composioService.instance.getTools(userId, tools);
      
      return {
        success: true,
        tools: composioTools,
        message: `Tools ottenuti con successo per l'utente ${userId}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
        message: `Errore nel recupero dei tools: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`
      };
    }
  }
});

// Export del tool Composio
export const composioTools = {
  getTools: composioGetToolsTool
};
