import { auth } from '@/auth';
import { db } from '@/db';
import { tags, tagVotes } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import VoteButton from '@/components/community/VoteButton';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';

export default async function CommunityTagsPage() {
  const t = await getTranslations('community');
  const session = await auth();
  const userId = session?.user?.id;

  // Get all public tags sorted by votes
  const publicTags = await db
    .select()
    .from(tags)
    .where(eq(tags.isPublic, true))
    .orderBy(desc(tags.votes))
    .limit(100);

  // Get user's votes
  let userVotes: Record<string, number> = {};
  if (userId) {
    const votes = await db
      .select()
      .from(tagVotes)
      .where(eq(tagVotes.userId, userId));

    userVotes = votes.reduce((acc, vote) => {
      acc[vote.tagId] = vote.voteType;
      return acc;
    }, {} as Record<string, number>);
  }

  // Group by tag text
  const groupedTags = publicTags.reduce((acc, tag) => {
    if (!acc[tag.tagText]) {
      acc[tag.tagText] = [];
    }
    acc[tag.tagText].push(tag);
    return acc;
  }, {} as Record<string, typeof publicTags>);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in">
      <div className="mb-8">
        <h1 className="section-title mb-2">{t('title')}</h1>
        <p style={{ color: 'var(--foreground)' }}>
          {t('description')}
        </p>
      </div>

      {publicTags.length === 0 && (
        <div className="text-center py-12 card">
          <p style={{ color: 'rgba(0,0,0,0.5)' }}>{t('noTags')}</p>
          <Link
            href="/tags"
            className="mt-4 inline-block btn-primary"
          >
            {t('goToMyTags')}
          </Link>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(groupedTags).map(([tagText, tagList]) => {
          const totalVotes = tagList.reduce((sum, tag) => sum + tag.votes, 0);

          return (
            <div key={tagText} className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-accent">
                  <Link 
                    href={`/search?q=${encodeURIComponent(tagText)}&type=tag`}
                    className="hover:underline"
                    title="Search verses with this tag"
                  >
                    #{tagText}
                  </Link>
                </h2>
                <div className="flex items-center gap-4">
                  <div className="text-sm" style={{ color: 'rgba(0,0,0,0.5)' }}>
                    <span className="font-medium">{tagList.length}</span> {t('verse', { count: tagList.length })} · <span className="font-medium">{totalVotes}</span> {t('totalVotes')}
                  </div>
                  <Link
                    href={`/search?q=${encodeURIComponent(tagText)}&type=tag`}
                    className="text-sm link whitespace-nowrap"
                  >
                    {t('search')} →
                  </Link>
                </div>
              </div>

              <div className="space-y-2">
                {tagList.map((tag) => {
                  const [chapterId, verseNumber] = tag.verseKey.split(':');
                  return (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between p-3 rounded transition-colors"
                      style={{ background: 'rgba(16, 185, 129, 0.05)' }}
                    >
                      <Link
                        href={`/surah/${chapterId}#verse-${verseNumber}`}
                        className="link font-medium"
                      >
                        {t('verseLink', { key: tag.verseKey })}
                      </Link>

                      {userId ? (
                        <VoteButton
                          tagId={tag.id}
                          currentVotes={tag.votes}
                          userVote={userVotes[tag.id] || null}
                        />
                      ) : (
                      <div className="flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                        <span className="text-sm">↑ {tag.votes}</span>
                        <Link
                          href="/auth/signin"
                          className="text-sm link"
                        >
                          {t('signInToVote')}
                        </Link>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
