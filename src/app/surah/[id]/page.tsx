import { VerseCard } from '@/components/verse/VerseCard';
import { ChapterAudioPlayer } from '@/components/verse/ChapterAudioPlayer';
import Link from 'next/link';
import { getChapter } from '@/lib/api/chapters';
import { getVersesByChapter } from '@/lib/api/verses';
import { getChapterAudio, getVerseAudioFiles } from '@/lib/quran-api/client';
import { auth } from '@/auth';
import { db } from '@/db';
import { collections } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { Chapter, Verse } from '@/types/verse';
import type { Collection } from '@/types/collection';

export const dynamic = 'force-dynamic';

interface SurahPageProps {
  params: Promise<{ id: string }>;
}

export default async function SurahPage({ params }: SurahPageProps) {
  const { id } = await params;
  const chapterId = Number.parseInt(id);

  // Check if user is authenticated
  const session = await auth();
  const userId = session?.user?.id;

  // Fetch user's collections if logged in
  let userCollections: Collection[] = [];
  if (userId) {
    userCollections = await db
      .select()
      .from(collections)
      .where(eq(collections.userId, userId));
  }

  // Fetch chapter info, verses, and audio files
  let chapter: Chapter | null = null;
  let verses: Verse[] = [];
  let chapterAudioUrl: string | undefined;
  let chapterAudioTimestamps: Array<{ verse_key: string; timestamp_from: number; timestamp_to: number }> = [];
  let verseAudioFiles: Array<{ url: string; verse_key: string }> = [];
  let error = null;

  try {
    const [chapterData, versesData, chapterAudioData, verseAudioData] = await Promise.all([
      getChapter(chapterId),
      getVersesByChapter(chapterId, 1, 50),
      getChapterAudio(7, chapterId), // Recitation ID 7 = Alafasy
      getVerseAudioFiles(7, chapterId, 1, 50)
    ]);
    
    chapter = chapterData.chapter;
    verses = versesData.verses || [];

    if (chapterAudioData.audio_file?.audio_url) {
      chapterAudioUrl = chapterAudioData.audio_file.audio_url;
      chapterAudioTimestamps = chapterAudioData.audio_file.timestamps || [];
    }
    
    // Convert relative audio URLs to absolute URLs for individual verse playback
    verseAudioFiles = (verseAudioData.audio_files || []).map((file: { url: string; verse_key: string }) => ({
      ...file,
      url: `https://verses.quran.com/${file.url}`
    }));
  } catch (err) {
    error = err;
  }

  if (error || !chapter) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Failed to load chapter. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Chapter Header */}
      <div className="mb-8">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Home
        </Link>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900">
                {chapter.name_simple}
              </h1>
              <p className="text-gray-700">{chapter.translated_name?.name}</p>
            </div>
            <div className="text-4xl font-arabic text-gray-900">{chapter.name_arabic}</div>
          </div>
          
          <div className="flex gap-6 text-sm text-gray-700">
            <span>📖 {chapter.verses_count} verses</span>
            <span className="capitalize">📍 Revelation: {chapter.revelation_place}</span>
            <span>🔢 Chapter {chapter.id}</span>
          </div>
        </div>
      </div>

      {/* Chapter Audio Player */}
      {chapterAudioUrl && (
        <ChapterAudioPlayer 
          totalVerses={chapter.verses_count}
          audioUrl={chapterAudioUrl}
          timestamps={chapterAudioTimestamps}
        />
      )}

      {/* Verses */}
      <div className="space-y-4">
        {verses.map((verse, index) => (
          <VerseCard 
            key={verse.verse_key} 
            verse={verse}
            audioUrl={verseAudioFiles[index]?.url}
            userCollections={userCollections}
          />
        ))}
      </div>

      {verses.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No verses found</p>
        </div>
      )}
    </div>
  );
}
