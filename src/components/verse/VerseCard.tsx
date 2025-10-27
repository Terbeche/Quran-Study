import type { Verse } from '@/types/verse';
import type { Tag } from '@/types/tag';
import { auth } from '@/auth';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import TagInput from './TagInput';
import VerseAudioPlayer from './VerseAudioPlayer';
import CommunityTagsPreview from './CommunityTagsPreview';

interface VerseCardProps {
  readonly verse: Verse;
  readonly audioUrl?: string;
  readonly showTags?: boolean;
}

export async function VerseCard({ verse, audioUrl, showTags = true }: VerseCardProps) {
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

  return (
    <div className="bg-white border rounded-lg p-6 mb-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-gray-700">
          {verse.verse_key}
        </div>
        
        {/* Audio Player */}
        {audioUrl && <VerseAudioPlayer audioUrl={audioUrl} />}
      </div>
      
      <div className="text-2xl font-arabic text-right mb-4 leading-loose text-gray-900">
        {verse.text_uthmani}
      </div>
      
      {verse.translations?.[0] && (
        <div className="text-gray-700">
          {verse.translations[0].text}
        </div>
      )}

      {/* Tag input */}
      {showTags && (
        <TagInput
          verseKey={verse.verse_key}
          initialTags={userTags}
          userId={userId}
        />
      )}

      {/* Community tags preview */}
      <CommunityTagsPreview verseKey={verse.verse_key} />
    </div>
  );
}
