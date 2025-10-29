import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { collections, collectionVerses } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { Link } from '@/i18n/routing';
import CreateCollectionButton from '@/components/collections/CreateCollectionButton';
import DeleteCollectionButton from '@/components/collections/DeleteCollectionButton';
import EditCollectionButton from '@/components/collections/EditCollectionButton';
import { getTranslations } from 'next-intl/server';

export default async function CollectionsPage() {
  const session = await auth();
  const t = await getTranslations('collections');

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Get collections with verse counts
  const userCollections = await db
    .select({
      id: collections.id,
      name: collections.name,
      description: collections.description,
      isPublic: collections.isPublic,
      verseCount: sql<number>`cast(count(${collectionVerses.id}) as integer)`,
    })
    .from(collections)
    .leftJoin(collectionVerses, eq(collections.id, collectionVerses.collectionId))
    .where(eq(collections.userId, session.user.id))
    .groupBy(collections.id)
    .orderBy(collections.createdAt);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title mb-0">{t('title')}</h1>
        <CreateCollectionButton />
      </div>

      {userCollections.length === 0 && (
        <p style={{ color: 'var(--text-muted)' }}>
          {t('noCollections')}. {t('createFirst')}
        </p>
      )}

      <div className="grid gap-4">
        {userCollections.map((collection) => (
          <div
            key={collection.id}
            className="card card-hover"
          >
            <div className="flex items-start justify-between mb-2">
              <Link
                href={`/collections/${collection.id}`}
                className="flex-1"
              >
                <h2 className="text-xl font-semibold text-accent hover:opacity-80 transition-opacity">
                  {collection.name}
                </h2>
              </Link>
              <div className="flex gap-2">
                <EditCollectionButton
                  collectionId={collection.id}
                  currentName={collection.name}
                  currentDescription={collection.description}
                />
                <DeleteCollectionButton collectionId={collection.id} />
              </div>
            </div>
            
            {collection.description && (
              <p className="mb-3" style={{ color: 'var(--foreground)' }}>{collection.description}</p>
            )}
            
            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
              <span>
                {collection.verseCount === 1 
                  ? t('verseCountSingular') 
                  : t('verseCount', { count: collection.verseCount })}
              </span>
              {collection.isPublic && (
                <span className="badge">{t('publicTag')}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
