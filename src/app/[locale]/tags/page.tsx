import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getTranslations } from 'next-intl/server';
import TagsList from '@/components/tags/TagsList';

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

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in">
      <h1 className="section-title">{t('title')}</h1>

      {userTags.length === 0 && (
        <p style={{ color: 'var(--text-muted)' }}>
          {t('noTags')}. {t('createFirst')}
        </p>
      )}

      <TagsList 
        initialTags={userTags} 
        translations={{
          verseCountSingular: t('verseCountSingular'),
          verseCountPlural: t('verseCount', { count: 0 }),
          verse: tVerse('verse'),
          searchThisTag: t('searchThisTag'),
          delete: t('delete'),
        }}
      />
    </div>
  );
}
