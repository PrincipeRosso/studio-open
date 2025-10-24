// Servizio per estrarre immagini da URL usando tecniche alternative
// Quando Tavily non restituisce immagini, possiamo provare a estrarre Open Graph images

export async function extractImageFromUrl(url: string): Promise<string | null> {
  try {
    // Prova a ottenere l'immagine Open Graph dall'URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StudioBot/1.0)',
      },
      signal: AbortSignal.timeout(5000), // 5 secondi di timeout
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    // Estrai Open Graph image
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    if (ogImageMatch && ogImageMatch[1]) {
      return ogImageMatch[1];
    }

    // Estrai Twitter image come fallback
    const twitterImageMatch = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);
    if (twitterImageMatch && twitterImageMatch[1]) {
      return twitterImageMatch[1];
    }

    // Estrai la prima immagine nel contenuto
    const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
    if (imgMatch && imgMatch[1]) {
      // Controlla che non sia un'icona piccola
      const src = imgMatch[1];
      if (!src.includes('icon') && !src.includes('logo') && !src.includes('pixel')) {
        return src;
      }
    }

    return null;
  } catch (error) {
    console.error(`Errore nell'estrazione immagine da ${url}:`, error);
    return null;
  }
}

export async function extractImagesFromResults(results: Array<{ url: string; title: string }>): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>();

  // Estrai immagini in parallelo ma con un limite
  const promises = results.slice(0, 3).map(async (result) => {
    try {
      const image = await extractImageFromUrl(result.url);
      if (image) {
        imageMap.set(result.url, image);
      }
    } catch (error) {
      // Ignora errori per singole URL
    }
  });

  await Promise.allSettled(promises);

  return imageMap;
}

