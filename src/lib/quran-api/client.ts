import { cache } from 'react';

const BASE_URL = process.env.API_BASE_URL;
const CLIENT_ID = process.env.QURAN_API_CLIENT_ID;
const CLIENT_SECRET = process.env.QURAN_API_CLIENT_SECRET;
const TOKEN_URL = process.env.QURAN_API_TOKEN_URL;

// Token cache
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

// Get OAuth2 access token using Basic Auth
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && tokenExpiry > Date.now() + 60000) {
    return cachedToken;
  }

  if (!CLIENT_ID || !CLIENT_SECRET || !TOKEN_URL) {
    throw new Error('Quran API credentials not configured. Please set QURAN_API_CLIENT_ID, QURAN_API_CLIENT_SECRET, and QURAN_API_TOKEN_URL in .env.local');
  }

  // Create Basic Auth header
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  try {
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&scope=content',
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OAuth2 token request failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    if (!data.access_token) {
      throw new Error('OAuth2 response missing access_token');
    }

    // Cache the token (expires_in is in seconds)
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000);

    return data.access_token;
  } catch (error) {
    // Clear cache on error
    cachedToken = null;
    tokenExpiry = 0;
    
    if (error instanceof Error) {
      throw new Error(`Failed to obtain OAuth2 token: ${error.message}`);
    }
    throw error;
  }
}

async function fetchAPI(url: string, options: RequestInit = {}) {
  // Basic runtime checks to catch misconfiguration early
  if (!BASE_URL) {
    throw new Error('Quran API base URL (API_BASE_URL) is not configured. Please set API_BASE_URL in your environment.');
  }

  const token = await getAccessToken();

  // Build headers: prefer existing headers but ensure required headers are present
  const userHeaders = options.headers ? (options.headers as Record<string, string>) : {};

  const headers: Record<string, string> = {
    Accept: 'application/json',
    // Preserve any user-supplied headers
    ...userHeaders,
  };

  if (token) {
    headers['x-auth-token'] = token;
  }

  if (CLIENT_ID) {
    headers['x-client-id'] = CLIENT_ID;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    // Network or DNS errors surface as TypeError from fetch
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Network request failed for ${url}: ${message}`);
  }

  if (!response.ok) {
    let bodyText: string | undefined;
    try {
      bodyText = await response.text();
    } catch {
      // ignore body parsing errors
    }

    const messageParts = [`API Error: ${response.status} ${response.statusText}`];
    if (bodyText) {
      // Truncate overly large responses to keep messages readable
      const truncated = bodyText.length > 2000 ? bodyText.slice(0, 2000) + '... (truncated)' : bodyText;
      messageParts.push(`body: ${truncated}`);
    }

    const err = new Error(messageParts.join(' | '));
    // Attach status/body with a typed shape for programmatic checks
    const apiErr = err as Error & { status?: number; body?: string };
    apiErr.status = response.status;
    apiErr.body = bodyText;
    throw apiErr;
  }

  // Parse JSON; if response is empty this will throw which is fine to surface
  return response.json();
}

// Search verses with automatic request deduplication
export const searchVerses = cache(async (query: string, page: number = 1) => {
  const data = await fetchAPI(
    `${BASE_URL}/search?q=${encodeURIComponent(query)}&page=${page}&size=20&translations=85`
  );
  
  // The API returns search results with the structure: { search: { results: [...] } }
  const searchResults = data.search?.results || [];
  
  // Map the search results to our Verse format
  const verses = searchResults.map((result: {
    verse_key?: string;
    verse?: { verse_key: string; id?: number; text_uthmani?: string };
    id?: number;
    text_uthmani?: string;
    translations?: Array<{
      resource_id?: number;
      text: string;
      resource_name?: string;
      language_name?: string;
    }>;
  }) => {
    const verse = result.verse_key ? result : result.verse;
    if (!verse?.verse_key) {
      throw new Error('Invalid search result: missing verse_key');
    }
    const [chapterNum, verseNum] = verse.verse_key.split(':');
    
    return {
      id: verse.id || 0,
      verse_key: verse.verse_key,
      verse_number: Number.parseInt(verseNum),
      chapter_id: Number.parseInt(chapterNum),
      text_uthmani: verse.text_uthmani || '',
      translations: result.translations ? result.translations.map((t) => ({
        id: t.resource_id || 85,
        text: t.text,
        resource_name: t.resource_name || '',
        language_name: t.language_name || ''
      })) : []
    };
  });
  
  return {
    results: verses,
    pagination: data.search?.pagination || {
      per_page: 20,
      current_page: page,
      total_pages: 1,
      total_records: verses.length
    }
  };
});

// Get all chapters (cache for 24 hours)
export const getChapters = cache(async () => {
   return fetchAPI(`${BASE_URL}/chapters`);
});

// Get specific chapter
export const getChapter = cache(async (id: number) => {
  return fetchAPI(`${BASE_URL}/chapters/${id}`);
});

// Get verses by chapter - combines Arabic text and translations
export const getVersesByChapter = cache(async (
  chapterId: number,
  page: number = 1,
  perPage: number = 10
) => {
  const data = await fetchAPI(
    `${BASE_URL}/verses/by_chapter/${chapterId}?translations=85&fields=text_uthmani&page=${page}&per_page=${perPage}`
  );

  // The API returns verses with translations already included
  const verses = (data.verses || []).map((verse: {
    id: number;
    verse_key: string;
    verse_number: number;
    text_uthmani?: string;
    translations?: Array<{
      id: number;
      text: string;
      resource_name: string;
      language_name: string;
    }>;
  }) => ({
    id: verse.id,
    verse_key: verse.verse_key,
    verse_number: verse.verse_number,
    chapter_id: chapterId,
    text_uthmani: verse.text_uthmani || '',
    translations: verse.translations || []
  }));

  return {
    verses,
    pagination: data.pagination || {
      per_page: perPage,
      current_page: page,
      total_pages: 1,
      total_records: verses.length
    }
  };
});

// Get specific verse by key (ayah)
export async function getVerseByKey(verseKey: string) {
  const [chapterNum, verseNum] = verseKey.split(':');
  const chapterId = Number.parseInt(chapterNum);
  const verseNumber = Number.parseInt(verseNum);
  
  // Calculate which page this verse is on (using per_page=50)
  const perPage = 50;
  const page = Math.ceil(verseNumber / perPage);
  
  // Fetch the specific page that contains this verse
  const data = await fetchAPI(
    `${BASE_URL}/verses/by_chapter/${chapterId}?translations=85&fields=text_uthmani&page=${page}&per_page=${perPage}`
  );
  
  // Find the specific verse we want
  const verse = data.verses?.find((v: { verse_number: number }) => v.verse_number === verseNumber);
  
  if (!verse) {
    throw new Error(`Verse ${verseKey} not found in API response`);
  }
  
  return {
    id: verse.id || 0,
    verse_key: verseKey,
    verse_number: verseNumber,
    chapter_id: chapterId,
    text_uthmani: verse.text_uthmani || '',
    translations: verse.translations || []
  };
}

// Get list of available recitations/reciters
// Returns: list of reciters with their IDs, names, and styles
export const getRecitations = cache(async (language: string = 'en') => {
  return fetchAPI(`${BASE_URL}/resources/recitations?language=${language}`);
});

// Get audio file for a specific verse (ayah)
// Returns: audio_files array with URL, format, and metadata for the verse
export const getVerseAudio = cache(async (recitationId: number, verseKey: string) => {
  return fetchAPI(`${BASE_URL}/recitations/${recitationId}/by_ayah/${verseKey}`);
});

// Get chapter audio file metadata and URL
// Returns: audio file URL, format, and optionally verse timestamps with segments
export const getChapterAudio = cache(async (reciterId: number, chapterNumber: number, segments: boolean = false) => {
  const segmentsParam = segments ? '?segments=true' : '';
  return fetchAPI(`${BASE_URL}/chapter_recitations/${reciterId}/${chapterNumber}${segmentsParam}`);
});

// Get Ayah-by-Ayah recitations for a chapter
// Returns: array of audio_files with URLs for each verse, pagination info
export const getVerseAudioFiles = cache(async (
  recitationId: number,
  chapterNumber: number,
  page: number = 1,
  perPage: number = 50
) => {
  return fetchAPI(
    `${BASE_URL}/recitations/${recitationId}/by_chapter/${chapterNumber}?page=${page}&per_page=${perPage}`
  );
});
