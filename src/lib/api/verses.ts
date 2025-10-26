import { cache } from 'react';
import { getVersesByChapter as getVersesByChapterFromAPI, getVerseByKey as getVerseByKeyFromAPI } from '@/lib/quran-api/client';
import type { Verse } from '@/types/verse';

interface VersesResponse {
  verses: Verse[];
  pagination: {
    per_page: number;
    current_page: number;
    total_pages: number;
    total_records: number;
  };
}

// Get verses by chapter - cached and directly from Quran API
export const getVersesByChapter = cache(async (
  chapterId: number,
  page: number = 1,
  perPage: number = 50
): Promise<VersesResponse> => {
  return getVersesByChapterFromAPI(chapterId, page, perPage);
});

// Get specific verse by key - cached and directly from Quran API
export const getVerseByKey = cache(async (verseKey: string): Promise<Verse> => {
  return getVerseByKeyFromAPI(verseKey);
});
