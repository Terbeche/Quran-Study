import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { collections, collectionVerses } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import Link from 'next/link';
import CreateCollectionButton from '@/components/collections/CreateCollectionButton';
import DeleteCollectionButton from '@/components/collections/DeleteCollectionButton';
import EditCollectionButton from '@/components/collections/EditCollectionButton';

export default async function CollectionsPage() {
  const session = await auth();

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
      createdAt: collections.createdAt,
      updatedAt: collections.updatedAt,
      verseCount: sql<number>`cast(count(${collectionVerses.id}) as integer)`,
    })
    .from(collections)
    .leftJoin(collectionVerses, eq(collections.id, collectionVerses.collectionId))
    .where(eq(collections.userId, session.user.id))
    .groupBy(collections.id)
    .orderBy(collections.createdAt);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Collections</h1>
        <CreateCollectionButton />
      </div>

      {userCollections.length === 0 && (
        <p className="text-gray-500">
          No collections yet. Create one to organize your favorite verses!
        </p>
      )}

      <div className="grid gap-4">
        {userCollections.map((collection) => (
          <div
            key={collection.id}
            className="p-6 bg-white border rounded-lg hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-2">
              <Link
                href={`/collections/${collection.id}`}
                className="flex-1"
              >
                <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600">
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
              <p className="text-gray-600 mb-3">{collection.description}</p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{collection.verseCount} verse{collection.verseCount === 1 ? '' : 's'}</span>
              {collection.isPublic && (
                <span className="text-blue-600">Public</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
