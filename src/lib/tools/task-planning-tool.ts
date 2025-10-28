import { tool } from 'ai';
import { z } from 'zod';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';

/**
 * Tool per decomporre logicamente una richiesta dell'utente in task e sotto-task.
 * Questo tool usa un LLM dedicato (gpt-4o-mini) per strutturare il lavoro in modo organizzato.
 */
export const taskPlanningTool = tool({
  description: `Decompone una richiesta dell'utente in una lista logica di task e sotto-task usando un LLM dedicato per l'analisi e la strutturazione.
  
  Usa questo tool quando:
  - La richiesta dell'utente è complessa e richiede più azioni
  - Hai bisogno di organizzare il lavoro in step sequenziali
  - La richiesta implica più strumenti o operazioni
  
  Non usare questo tool se:
  - La richiesta è semplice e diretta (es. una domanda singola)
  - Richiede solo una singola azione
  - Puoi rispondere immediatamente senza decomposizione`,
  
  inputSchema: z.object({
    userRequest: z.string().describe('La richiesta completa dell\'utente da analizzare e decomporre in task'),
  }),
  
  execute: async ({ userRequest }) => {
    console.log('📋 Task Planning Tool - Analisi richiesta utente con LLM dedicato...');
    console.log(`📝 Richiesta: ${userRequest}`);
    
    try {
      // Usa un LLM dedicato per il task planning (modello veloce ed economico)
      const { object: plan } = await generateObject({
        model: openai('gpt-4.1-mini'), // Modello veloce ed economico per planning
        schema: z.object({
          tasks: z.array(z.object({
            taskId: z.string().describe('Identificativo univoco del task (es: task_1, task_2)'),
            title: z.string().describe('Titolo breve e descrittivo del task'),
            description: z.string().describe('Descrizione dettagliata di cosa fare'),
            requiredTools: z.array(z.string()).optional().describe('Lista di strumenti necessari (es: smartSearch, notion, gmail)'),
            dependencies: z.array(z.string()).optional().describe('Lista di taskId che devono essere completati prima'),
          })),
        }),
        prompt: `Sei un esperto di task planning per agent AI. Il tuo compito è decomporre la richiesta dell'utente in task logici, sequenziali e ben strutturati.

RICHIESTA DELL'UTENTE:
"${userRequest}"

ISTRUZIONI:
1. Analizza la richiesta e identifica tutti i task necessari per completarla
2. Organizza i task in ordine logico sequenziale
3. Identifica le dipendenze tra task (se alcuni devono essere completati prima)
4. Specifica quali strumenti sono necessari per ciascun task
5. Mantieni i task specifici, azionabili e chiari

ESEMPIO DI BUONA DECOMPOSIZIONE:
Richiesta: "Cerca notizie su AI, salva su Notion e invia una email"
Task:
- task_1: Cerca notizie recenti su AI (smartSearch)
- task_2: Salva informazioni su Notion (notion) - dipende da: task_1
- task_3: Invia email con riepilogo (gmail) - dipende da: task_1, task_2

Struttura la tua risposta con solo i task necessari per completare la richiesta.`,
      });
      
      const tasks = plan.tasks || [];
      
      console.log(`✅ Piano di lavoro creato con ${tasks.length} task:`);
      tasks.forEach((task, index) => {
        console.log(`  ${index + 1}. [${task.taskId}] ${task.title}`);
        if (task.requiredTools && task.requiredTools.length > 0) {
          console.log(`     Tools: ${task.requiredTools.join(', ')}`);
        }
        if (task.dependencies && task.dependencies.length > 0) {
          console.log(`     Dipendenze: ${task.dependencies.join(', ')}`);
        }
      });
      
      return {
        status: 'plan_created',
        message: 'Piano di lavoro creato con successo',
        userRequest,
        tasksCount: tasks.length,
        tasks,
        timestamp: new Date().toISOString(),
      };
      
    } catch (error) {
      console.error('❌ Errore nel task planning:', error);
      return {
        status: 'error',
        message: 'Errore nella creazione del piano di lavoro',
        userRequest,
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
        timestamp: new Date().toISOString(),
      };
    }
  },
});
