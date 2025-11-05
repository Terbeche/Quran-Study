import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { validateRequiredParams, internalError } from '@/lib/api/helpers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const verseKey = searchParams.get('verseKey');

    // Validate required parameters
    const validationError = validateRequiredParams(
      { verseKey },
      ['verseKey']
    );
    if (validationError) return validationError;

    // Fetch public tags for this verse, ordered by votes
    const topTags = await db
      .select({
        id: tags.id,
        tagText: tags.tagText,
        votes: tags.votes,
      })
      .from(tags)
      .where(and(
        eq(tags.verseKey, verseKey!),
        eq(tags.isPublic, true)
      ))
      .orderBy(desc(tags.votes))
      .limit(5);

    return NextResponse.json({ tags: topTags });
  } catch (error) {
    console.error('Error fetching community tags:', error);
    return internalError('Failed to fetch community tags');
  }
}
