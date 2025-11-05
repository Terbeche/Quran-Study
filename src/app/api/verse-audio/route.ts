import { NextRequest, NextResponse } from 'next/server';
import { validateRequiredParams, validateNumberParams, internalError } from '@/lib/api/helpers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chapter = searchParams.get('chapter');
    const verse = searchParams.get('verse');

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

    // Construct the audio URL using the Quran.com verses CDN
    const chapterPadded = chapterId.toString().padStart(3, '0');
    const versePadded = verseNumber.toString().padStart(3, '0');
    
    // Using recitation ID 7 (Alafasy) format
    const audioUrl = `https://verses.quran.com/Alafasy/mp3/${chapterPadded}${versePadded}.mp3`;

    return NextResponse.json({
      audioUrl,
      verseKey: `${chapterId}:${verseNumber}`
    });
  } catch (error) {
    console.error('Error generating verse audio URL:', error);
    return internalError('Failed to generate audio URL');
  }
}
