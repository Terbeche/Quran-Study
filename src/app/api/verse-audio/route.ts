import { NextRequest, NextResponse } from 'next/server';
import { validateRequiredParams, validateNumberParams, internalError } from '@/lib/api/helpers';
import { getVerseAudioFiles } from '@/lib/quran-api/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chapter = searchParams.get('chapter');
    const verse = searchParams.get('verse');
    const reciter = searchParams.get('reciter') || '7'; // Default to Alafasy

    // Validate required parameters
    const validationError = validateRequiredParams(
      { chapter, verse },
      ['chapter', 'verse']
    );
    if (validationError) return validationError;

    // Validate number parameters
    const numberError = validateNumberParams(
      { chapter: chapter!, verse: verse! },
      ['chapter', 'verse']
    );
    if (numberError) return numberError;

    const chapterId = Number.parseInt(chapter!);
    const verseNumber = Number.parseInt(verse!);
    const reciterId = Number.parseInt(reciter);

    // Fetch verse audio from Quran.com API
    const audioData = await getVerseAudioFiles(reciterId, chapterId, 1, 300);
    
    // Find the specific verse in the audio files
    const verseAudio = audioData.audio_files?.find(
      (file: { verse_key: string }) => file.verse_key === `${chapterId}:${verseNumber}`
    );

    if (!verseAudio?.url) {
      return NextResponse.json(
        { error: 'Audio not found for this verse' },
        { status: 404 }
      );
    }

    // Convert relative URL to absolute URL if needed
    let audioUrl = verseAudio.url;
    if (!audioUrl.startsWith('http')) {
      audioUrl = `https://verses.quran.com/${audioUrl}`;
    }

    return NextResponse.json({
      audioUrl,
      verseKey: `${chapterId}:${verseNumber}`
    });
  } catch (error) {
    console.error('Error fetching verse audio:', error);
    return internalError('Failed to fetch audio URL');
  }
}
