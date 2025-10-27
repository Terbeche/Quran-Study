import { auth } from '@/auth';
import { db } from '@/db';
import { collections, collectionVerses } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import Link from 'next/link';

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

  if (verseCollections.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="flex items-start gap-2">
        <span className="text-xs text-gray-500 font-medium mt-1">In Collections:</span>
        <div className="flex flex-wrap gap-2">
          {verseCollections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.id}`}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
            >
              📚 {collection.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
