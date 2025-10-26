import { cache } from 'react';
import { getChapters as getChaptersFromAPI, getChapter as getChapterFromAPI } from '@/lib/quran-api/client';
import type { Chapter } from '@/types/verse';

interface ChaptersResponse {
  chapters: Chapter[];
}

interface ChapterResponse {
  chapter: Chapter;
}

// Get all chapters - cached and directly from Quran API
export const getChapters = cache(async (): Promise<ChaptersResponse> => {
  return getChaptersFromAPI();
});

// Get specific chapter - cached and directly from Quran API
export const getChapter = cache(async (id: number): Promise<ChapterResponse> => {
  return getChapterFromAPI(id);
});
