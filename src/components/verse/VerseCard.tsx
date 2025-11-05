import type { Verse } from '@/types/verse';
import type { Tag } from '@/types/tag';
import type { Collection } from '@/types/collection';
import { auth } from '@/auth';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import TagInput from './TagInput';
import { LazyVerseAudioPlayer } from './LazyVerseAudioPlayer';
import CommunityTagsPreview from './CommunityTagsPreview';
import AddToCollectionButton from '@/components/collections/AddToCollectionButton';
import { VerseCollectionBadges } from './VerseCollectionBadges';

interface VerseCardProps {
  readonly verse: Verse;
  readonly showTags?: boolean;
  readonly userCollections?: Collection[];
}

export async function VerseCard({ verse, showTags = true, userCollections = [] }: VerseCardProps) {
  let userTags: Tag[] = [];
  let userId: string | undefined;

  if (showTags) {
    const session = await auth();
    userId = session?.user?.id;

    if (userId) {
      userTags = await db
        .select()
        .from(tags)
        .where(and(
          eq(tags.userId, userId),
          eq(tags.verseKey, verse.verse_key)
        ));
    }
  }

  // Fetch initial community tags
  const communityTags = await db
    .select({
      id: tags.id,
      tagText: tags.tagText,
      votes: tags.votes,
    })
    .from(tags)
    .where(and(
      eq(tags.verseKey, verse.verse_key),
      eq(tags.isPublic, true)
    ))
    .orderBy(desc(tags.votes))
    .limit(5);

  return (
    <div id={`verse-${verse.verse_number}`} className="card card-hover animate-fade-in scroll-mt-20">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          {verse.verse_key}
        </div>
        
        {/* Lazy Audio Player - loads audio only when user clicks play */}
        <LazyVerseAudioPlayer verseKey={verse.verse_key} />
      </div>
      
      <div className="text-2xl font-arabic text-right mb-4 leading-loose text-accent">
        {verse.text_uthmani}
      </div>
      
      {verse.translations?.[0] && (
        <div style={{ color: 'var(--foreground)' }}>
          {verse.translations[0].text}
        </div>
      )}

      {/* Tag input */}
      {showTags && (
        <>
          <TagInput
            verseKey={verse.verse_key}
            initialTags={userTags}
            userId={userId}
          />
          
          {/* Add to Collection button */}
          {userCollections.length > 0 && (
            <div className="mt-3">
              <AddToCollectionButton
                verseKey={verse.verse_key}
                collections={userCollections}
              />
            </div>
          )}
        </>
      )}

      {/* Community tags preview */}
      <CommunityTagsPreview verseKey={verse.verse_key} initialTags={communityTags} />

      {/* Collection badges */}
      <VerseCollectionBadges verseKey={verse.verse_key} />
    </div>
  );
}
