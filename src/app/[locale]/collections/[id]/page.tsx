import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/db';
import { collections, collectionVerses } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getVerseByKey } from '@/lib/api/verses';
import { VerseCard } from '@/components/verse/VerseCard';
import RemoveFromCollectionButton from '@/components/collections/RemoveFromCollectionButton';
import EditCollectionButton from '@/components/collections/EditCollectionButton';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations('collections');
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const { id: collectionId } = await params;

  // Get collection
  const [collection] = await db
    .select()
    .from(collections)
    .where(and(
      eq(collections.id, collectionId),
      eq(collections.userId, session.user.id)
    ))
    .limit(1);

  if (!collection) {
    notFound();
  }

  // Get verses in collection
  const verses = await db
    .select()
    .from(collectionVerses)
    .where(eq(collectionVerses.collectionId, collectionId))
    .orderBy(collectionVerses.position);

  // Fetch verse data
  const versesWithData = await Promise.all(
    verses.map(async (v) => {
      try {
        const verseData = await getVerseByKey(v.verseKey);
        return {
          ...v,
          verse: verseData,
        };
      } catch (error) {
        console.error(`Failed to fetch verse ${v.verseKey}:`, error);
        return {
          ...v,
          verse: null,
        };
      }
    })
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in">
      <div className="mb-6">
        <Link
          href="/collections"
          className="link text-sm mb-4 inline-block"
        >
          ← {t('backToCollections')}
        </Link>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h1 className="section-title mb-2">{collection.name}</h1>
            {collection.description && (
              <p style={{ color: 'var(--foreground)' }}>{collection.description}</p>
            )}
          </div>
          <EditCollectionButton
            collectionId={collection.id}
            currentName={collection.name}
            currentDescription={collection.description}
          />
        </div>
        <p className="text-sm mt-2" style={{ color: 'rgba(0,0,0,0.5)' }}>
          {t('versesInCollection', { count: verses.length })}
        </p>
      </div>

      {verses.length === 0 && (
        <div className="text-center py-12 card">
          <p className="mb-4" style={{ color: 'rgba(0,0,0,0.5)' }}>
            {t('noVersesInCollection')}
          </p>
          <Link
            href="/"
            className="link"
          >
            {t('browseQuran')}
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {versesWithData.map(({ verse, notes, verseKey }) => (
          <div key={verseKey}>
            {verse ? (
              <>
                <VerseCard verse={verse} showTags={false} />
                {notes && (
                  <div className="mt-2 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <p className="text-sm" style={{ color: 'var(--foreground)' }}>📝 {notes}</p>
                  </div>
                )}
                <div className="mt-2 flex justify-end">
                  <RemoveFromCollectionButton
                    collectionId={collectionId}
                    verseKey={verseKey}
                  />
                </div>
              </>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-600">
                  {t('failedToLoadVerse', { key: verseKey })}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
