import { searchVerses as searchVersesFromAPI } from '@/lib/quran-api/client';
import type { Verse } from '@/types/verse';

interface SearchResponse {
  results: Verse[];
  pagination?: {
    per_page: number;
    current_page: number;
    total_pages: number;
    total_records: number;
  };
}

// Search verses - directly from Quran API (not cached)
export async function searchVerses(query: string, page: number = 1): Promise<SearchResponse> {
  return searchVersesFromAPI(query, page);
}
