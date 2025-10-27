import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';
import TagToggleButton from '@/components/tags/TagToggleButton';
import DeleteTagButton from '@/components/tags/DeleteTagButton';

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
        <div key={tagText} className="mb-6 border rounded-lg p-4 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">
            #{tagText} <span className="text-sm text-gray-500">({tagList.length} verse{tagList.length > 1 ? 's' : ''})</span>
          </h2>
          <div className="space-y-2">
            {tagList.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
              >
                <Link
                  href={`/surah/${tag.verseKey.split(':')[0]}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Verse {tag.verseKey}
                </Link>
                
                <div className="flex items-center gap-2">
                  <TagToggleButton tagId={tag.id} isPublic={tag.isPublic} />
                  <DeleteTagButton tagId={tag.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
