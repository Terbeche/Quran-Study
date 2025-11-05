import { auth } from '@/auth';
import { db } from '@/db';
import { collections, collectionVerses } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { VerseCollectionBadgesClient } from './VerseCollectionBadgesClient';

interface VerseCollectionBadgesProps {
  readonly verseKey: string;
}

export async function VerseCollectionBadges({ verseKey }: VerseCollectionBadgesProps) {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  // Get collections that contain this verse
  const verseCollections = await db
    .select({
      id: collections.id,
      name: collections.name,
    })
    .from(collections)
    .innerJoin(collectionVerses, eq(collections.id, collectionVerses.collectionId))
    .where(and(
      eq(collections.userId, session.user.id),
      eq(collectionVerses.verseKey, verseKey)
    ));

  return (
    <VerseCollectionBadgesClient
      verseKey={verseKey}
      initialCollections={verseCollections}
    />
  );
}
