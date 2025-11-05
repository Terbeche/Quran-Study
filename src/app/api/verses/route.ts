import { NextRequest, NextResponse } from 'next/server';
import { getVersesByChapter } from '@/lib/quran-api/client';
import { validateRequiredParams, validateNumberParams, internalError } from '@/lib/api/helpers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chapter = searchParams.get('chapter');
    const page = searchParams.get('page');
    const perPage = searchParams.get('perPage');

    // Validate required parameters
    const validationError = validateRequiredParams(
      { chapter, page, perPage },
      ['chapter', 'page', 'perPage']
    );
    if (validationError) return validationError;

    // Validate number parameters
    const numberError = validateNumberParams(
      { chapter: chapter!, page: page!, perPage: perPage! },
      ['chapter', 'page', 'perPage']
    );
    if (numberError) return numberError;

    const chapterId = Number.parseInt(chapter!);
    const pageNum = Number.parseInt(page!);
    const perPageNum = Number.parseInt(perPage!);

    // Fetch the requested page of verses
    const versesData = await getVersesByChapter(chapterId, pageNum, perPageNum);

    return NextResponse.json({
      verses: versesData.verses || [],
      pagination: versesData.pagination || null
    });
  } catch (error) {
    console.error('Error fetching verses:', error);
    return internalError('Failed to fetch verses');
  }
}
