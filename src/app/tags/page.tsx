import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';

export default async function MyTagsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const userTags = await db
    .select()
    .from(tags)
    .where(eq(tags.userId, session.user.id))
    .orderBy(desc(tags.createdAt));

  // Group by tag text
  const groupedTags = userTags.reduce((acc, tag) => {
    if (!acc[tag.tagText]) {
      acc[tag.tagText] = [];
    }
    acc[tag.tagText].push(tag);
    return acc;
  }, {} as Record<string, typeof userTags>);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">My Tags</h1>

      {Object.keys(groupedTags).length === 0 && (
        <p className="text-gray-600">
          No tags yet. Start tagging verses to organize your study!
        </p>
      )}

      {Object.entries(groupedTags).map(([tagText, tagList]) => (
        <div key={tagText} className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-900">
            #{tagText} ({tagList.length})
          </h2>
          <div className="space-y-2">
            {tagList.map((tag) => (
              <Link
                key={tag.id}
                href={`/surah/${tag.verseKey.split(':')[0]}`}
                className="block p-3 bg-gray-50 rounded hover:bg-gray-100 text-gray-900"
              >
                Verse {tag.verseKey}
                {tag.isPublic && (
                  <span className="ml-2 text-xs text-blue-600 font-medium">Public</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
