// Servizio per estrarre immagini da URL usando tecniche alternative
// Quando Tavily non restituisce immagini, possiamo provare a estrarre Open Graph images

export async function extractImageFromUrl(url: string): Promise<string | null> {
  try {
    // Prova a ottenere l'immagine Open Graph dall'URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StudioBot/1.0)',
      },
      signal: AbortSignal.timeout(8000), // Aumentato a 8 secondi
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    // Lista di pattern per cercare immagini
    const imagePatterns = [
      // Open Graph image
      /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,
      // Twitter image
      /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i,
      // Twitter image:src
      /<meta\s+name=["']twitter:image:src["']\s+content=["']([^"']+)["']/i,
      // Meta image
      /<meta\s+name=["']image["']\s+content=["']([^"']+)["']/i,
      // Link rel="image_src"
      /<link\s+rel=["']image_src["']\s+href=["']([^"']+)["']/i,
    ];

    // Prova ogni pattern
    for (const pattern of imagePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const imageUrl = match[1];
        // Verifica che sia un'immagine valida
        if (isValidImageUrl(imageUrl)) {
          return imageUrl;
        }
      }
    }

    // Fallback: cerca immagini nel contenuto
    const imgMatches = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
    if (imgMatches) {
      for (const imgMatch of imgMatches) {
        const srcMatch = imgMatch.match(/src=["']([^"']+)["']/i);
        if (srcMatch && srcMatch[1]) {
          const src = srcMatch[1];
          if (isValidImageUrl(src) && !isExcludedImage(src)) {
            return src;
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error(`Errore nell'estrazione immagine da ${url}:`, error);
    return null;
  }
}

// Funzione helper per verificare se un URL è un'immagine valida
function isValidImageUrl(url: string): boolean {
  if (!url || url.length < 10) return false;
  
  // Verifica che sia un URL assoluto
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return false;
  }
  
  // Verifica estensioni di immagine comuni
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const hasImageExtension = imageExtensions.some(ext => 
    url.toLowerCase().includes(ext)
  );
  
  return hasImageExtension;
}

// Funzione helper per escludere immagini non desiderate
function isExcludedImage(url: string): boolean {
  const excludedPatterns = [
    'icon', 'logo', 'pixel', 'tracking', 'analytics', 
    'favicon', 'sprite', 'placeholder', 'loading',
    'avatar', 'profile', 'thumbnail'
  ];
  
  const lowerUrl = url.toLowerCase();
  return excludedPatterns.some(pattern => lowerUrl.includes(pattern));
}

export async function extractImagesFromResults(results: Array<{ url: string; title: string }>): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>();

  // Processa più URL per garantire almeno 4 immagini
  const maxUrls = Math.min(results.length, 8); // Processa fino a 8 URL
  const promises = results.slice(0, maxUrls).map(async (result) => {
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

  // Se non abbiamo abbastanza immagini, prova con più URL
  if (imageMap.size < 4 && results.length > maxUrls) {
    const additionalPromises = results.slice(maxUrls, maxUrls + 4).map(async (result) => {
      try {
        const image = await extractImageFromUrl(result.url);
        if (image) {
          imageMap.set(result.url, image);
        }
      } catch (error) {
        // Ignora errori per singole URL
      }
    });

    await Promise.allSettled(additionalPromises);
  }

  return imageMap;
}

