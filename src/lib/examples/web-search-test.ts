// Esempio di utilizzo del Web Search Tool
// Questo file mostra come testare l'implementazione

import { tavilyService } from '@/lib/services/tavily-service';

export async function testWebSearch() {
  try {
    console.log('🔍 Testando la ricerca web...');
    
    // Test ricerca generale
    const searchResults = await tavilyService.search('ultime notizie tecnologia AI 2024', {
      maxResults: 3,
      includeAnswer: true,
    });
    
    console.log('📊 Risultati ricerca:', {
      query: searchResults.query,
      answer: searchResults.answer,
      resultsCount: searchResults.results.length,
      firstResult: searchResults.results[0]?.title,
    });
    
    // Test ricerca notizie
    const newsResults = await tavilyService.searchNews('OpenAI GPT-4', 2);
    
    console.log('📰 Risultati notizie:', {
      query: newsResults.query,
      answer: newsResults.answer,
      resultsCount: newsResults.results.length,
    });
    
    return { success: true, message: 'Test completato con successo!' };
  } catch (error) {
    console.error('❌ Errore nel test:', error);
    return { success: false, error: error.message };
  }
}

// Funzione per testare i tools direttamente
export async function testTools() {
  const { webSearchTool, newsSearchTool } = await import('@/lib/tools/web-search-tool');
  
  try {
    console.log('🛠️ Testando webSearchTool...');
    const webResult = await webSearchTool.execute({
      query: 'migliori framework JavaScript 2024',
      maxResults: 2,
      includeAnswer: true,
    });
    console.log('Web Search Result:', webResult);
    
    console.log('📰 Testando newsSearchTool...');
    const newsResult = await newsSearchTool.execute({
      query: 'React 19 nuove funzionalità',
      maxResults: 2,
    });
    console.log('News Search Result:', newsResult);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Errore nel test tools:', error);
    return { success: false, error: error.message };
  }
}
