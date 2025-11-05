import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { validateRequiredParams, internalError } from '@/lib/api/helpers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const verseKey = searchParams.get('verseKey');
    const userId = searchParams.get('userId');

    // Validate required parameters
    const validationError = validateRequiredParams(
      { verseKey, userId },
      ['verseKey', 'userId']
    );
    if (validationError) return validationError;

    // Fetch user's tags for this verse
    const userTags = await db
      .select()
      .from(tags)
      .where(and(
        eq(tags.userId, userId!),
        eq(tags.verseKey, verseKey!)
      ));

    return NextResponse.json({ tags: userTags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return internalError('Failed to fetch tags');
  }
}
