import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { collections, collectionVerses } from '@/db/schema';
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

    // Get collections that contain this verse for this user
    const verseCollections = await db
      .select({
        id: collections.id,
        name: collections.name,
      })
      .from(collections)
      .innerJoin(collectionVerses, eq(collections.id, collectionVerses.collectionId))
      .where(and(
        eq(collections.userId, userId!),
        eq(collectionVerses.verseKey, verseKey!)
      ));

    return NextResponse.json({ collections: verseCollections });
  } catch (error) {
    console.error('Error fetching verse collections:', error);
    return internalError('Failed to fetch collections');
  }
}
