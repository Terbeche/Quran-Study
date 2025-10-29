import { NextResponse } from 'next/server';
import { searchVerses } from '@/lib/api/search';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { eq, like, and } from 'drizzle-orm';
import { getVerseByKey } from '@/lib/api/verses';
import type { Verse } from '@/types/verse';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const searchType = searchParams.get('type') || 'text';
    const page = Number(searchParams.get('page')) || 1;

    if (!query) {
      return NextResponse.json({ verses: [] });
    }

    let verses: Verse[] = [];

    if (searchType === 'tag') {
      // Search by tag
      const tagResults = await db
        .select()
        .from(tags)
        .where(and(
          like(tags.tagText, `%${query}%`),
          eq(tags.isPublic, true)
        ));

      // Get unique verse keys
      const verseKeys = [...new Set(tagResults.map((t) => t.verseKey))];

      // Fetch verse data for each key
      const versePromises = verseKeys.map((key: string) => getVerseByKey(key));
      const versesData = await Promise.allSettled(versePromises);
      
      verses = versesData
        .filter((result): result is PromiseFulfilledResult<Verse> => result.status === 'fulfilled')
        .map(result => result.value);
      
    } else {
      // Search by text
      const data = await searchVerses(query, page);
      verses = data?.results || [];
    }

    return NextResponse.json({ verses });
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error, verses: [] }, { status: 500 });
  }
}
