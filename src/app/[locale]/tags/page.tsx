import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { Link } from '@/i18n/routing';
import TagToggleButton from '@/components/tags/TagToggleButton';
import DeleteTagButton from '@/components/tags/DeleteTagButton';
import { getTranslations } from 'next-intl/server';

export default async function MyTagsPage() {
  const session = await auth();
  const t = await getTranslations('tags');
  const tVerse = await getTranslations('verse');

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
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in">
      <h1 className="section-title">{t('title')}</h1>

      {Object.keys(groupedTags).length === 0 && (
        <p style={{ color: 'rgba(0,0,0,0.6)' }}>
          {t('noTags')}. {t('createFirst')}
        </p>
      )}

      {Object.entries(groupedTags).map(([tagText, tagList]) => (
        <div key={tagText} className="mb-6 card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-accent">
              <Link 
                href={`/search?q=${encodeURIComponent(tagText)}&type=tag`}
                className="hover:underline"
                title="Search verses with this tag"
              >
                #{tagText}
              </Link>
              {' '}
              <span className="text-sm" style={{ color: 'rgba(0,0,0,0.5)' }}>
                ({tagList.length === 1 
                  ? t('verseCountSingular') 
                  : t('verseCount', { count: tagList.length })})
              </span>
            </h2>
            <Link
              href={`/search?q=${encodeURIComponent(tagText)}&type=tag`}
              className="text-sm link"
            >
              Search this tag →
            </Link>
          </div>
          <div className="space-y-2">
            {tagList.map((tag) => {
              const [chapterId, verseNumber] = tag.verseKey.split(':');
              return (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-3 rounded transition-all"
                  style={{ background: 'rgba(16, 185, 129, 0.05)' }}
                >
                  <Link
                    href={`/surah/${chapterId}#verse-${verseNumber}`}
                    className="link font-medium"
                  >
                    {tVerse('verse')} {tag.verseKey}
                  </Link>
                  
                  <div className="flex items-center gap-2">
                    <TagToggleButton tagId={tag.id} isPublic={tag.isPublic} />
                    <DeleteTagButton tagId={tag.id} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
