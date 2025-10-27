'use server';

import { getRecitations as getRecitationsAPI, getChapterAudio as getChapterAudioAPI } from '@/lib/quran-api/client';

export async function getRecitationsAction(language: string = 'en') {
  try {
    return await getRecitationsAPI(language);
  } catch (error) {
    console.error('Failed to fetch recitations:', error);
    throw error;
  }
}

export async function getChapterAudioAction(recitationId: number, chapterId: number) {
  try {
    // Pass segments=true to get timestamps for verse navigation
    return await getChapterAudioAPI(recitationId, chapterId, true);
  } catch (error) {
    console.error('Failed to fetch chapter audio:', error);
    throw error;
  }
}
