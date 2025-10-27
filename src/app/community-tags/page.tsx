import { auth } from '@/auth';
import { db } from '@/db';
import { tags, tagVotes } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import VoteButton from '@/components/community/VoteButton';
import Link from 'next/link';

export default async function CommunityTagsPage() {
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
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Community Tags</h1>
        <p className="text-gray-600 mt-2">
          Discover how others tag and organize Quranic verses
        </p>
      </div>

      {publicTags.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No public tags yet. Be the first to share!</p>
          <Link
            href="/tags"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to My Tags
          </Link>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(groupedTags).map(([tagText, tagList]) => {
          const totalVotes = tagList.reduce((sum, tag) => sum + tag.votes, 0);

          return (
            <div key={tagText} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">#{tagText}</h2>
                <div className="text-sm text-gray-500">
                  <span className="font-medium">{tagList.length}</span> verse
                  {tagList.length > 1 ? 's' : ''} · <span className="font-medium">{totalVotes}</span> total votes
                </div>
              </div>

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

                    {userId ? (
                      <VoteButton
                        tagId={tag.id}
                        currentVotes={tag.votes}
                        userVote={userVotes[tag.id] || null}
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-sm">↑ {tag.votes}</span>
                        <Link
                          href="/auth/signin"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Sign in to vote
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
