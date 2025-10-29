import { db } from '@/db';
import { getTranslations } from 'next-intl/server';
import { tags } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

interface CommunityTagsPreviewProps {
  readonly verseKey: string;
}

export default async function CommunityTagsPreview({ verseKey }: CommunityTagsPreviewProps) {
  const t = await getTranslations('verse');
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
    <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--card-border)' }}>
      <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>{t('communityTags')}:</p>
      <div className="flex flex-wrap gap-2">
        {topTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
            style={{ background: 'rgba(147, 51, 234, 0.1)', color: 'var(--primary-green)' }}
          >
            #{tag.tagText}
            {tag.votes > 0 && (
              <span className="text-xs opacity-80">↑{tag.votes}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
