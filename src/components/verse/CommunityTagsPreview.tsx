import { db } from '@/db';
import { tags } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

interface CommunityTagsPreviewProps {
  readonly verseKey: string;
}

export default async function CommunityTagsPreview({ verseKey }: CommunityTagsPreviewProps) {
  const topTags = await db
    .select()
    .from(tags)
    .where(and(
      eq(tags.verseKey, verseKey),
      eq(tags.isPublic, true)
    ))
    .orderBy(desc(tags.votes))
    .limit(5);

  if (topTags.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(16, 185, 129, 0.1)' }}>
      <p className="text-sm mb-2" style={{ color: 'rgba(0,0,0,0.6)' }}>Community tags:</p>
      <div className="flex flex-wrap gap-2">
        {topTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
          >
            #{tag.tagText}
            {tag.votes > 0 && (
              <span className="text-xs text-purple-600">↑{tag.votes}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
