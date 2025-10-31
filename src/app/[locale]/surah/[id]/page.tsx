import { VerseCard } from '@/components/verse/VerseCard';
import { ReciterAudioPlayer } from '@/components/verse/ReciterAudioPlayer';
import { ScrollToHash } from '@/components/layout/ScrollToHash';
import { Link } from '@/i18n/routing';
import { getChapter } from '@/lib/api/chapters';
import { getVersesByChapter } from '@/lib/api/verses';
import { getChapterAudio, getVerseAudioFiles } from '@/lib/quran-api/client';
import { auth } from '@/auth';
import { db } from '@/db';
import { collections } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getTranslations } from 'next-intl/server';
import type { Chapter, Verse } from '@/types/verse';
import type { Collection } from '@/types/collection';
import type { Metadata } from 'next';

export const revalidate = 3600;

interface SurahPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SurahPageProps): Promise<Metadata> {
  const { id } = await params;
  const chapterId = Number.parseInt(id);
  
  try {
    const chapterData = await getChapter(chapterId);
    const chapter = chapterData.chapter;
    
    return {
      title: `${chapter.name_simple} (${chapter.name_arabic}) - Chapter ${chapter.id}`,
      description: `Read and study Surah ${chapter.name_simple} with translations, audio recitation, and verse-by-verse insights. ${chapter.verses_count} verses, ${chapter.revelation_place} revelation.`,
      openGraph: {
        title: `${chapter.name_simple} - Quran Study`,
        description: `Study Surah ${chapter.name_simple} with translations and audio`,
        type: 'article',
      },
    };
  } catch {
    return {
      title: 'Chapter Not Found',
    };
  }
}

export default async function SurahPage({ params }: SurahPageProps) {
  const { id } = await params;
  const chapterId = Number.parseInt(id);
  const t = await getTranslations('chapter');

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
    // First fetch chapter info to get verse count
    const chapterData = await getChapter(chapterId);
    chapter = chapterData.chapter;
    
    // Fetch all verses and audio in parallel
    const [versesData, chapterAudioData, verseAudioData] = await Promise.all([
      getVersesByChapter(chapterId, 1, chapter.verses_count), // Fetch ALL verses
      getChapterAudio(7, chapterId, true), // Recitation ID 7 = Alafasy, segments=true for timestamps
      getVerseAudioFiles(7, chapterId, 1, chapter.verses_count) // Fetch ALL verse audio files
    ]);
    
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
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="rounded-lg p-4" style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)' }}>
          <p style={{ color: 'var(--error-text)' }}>{t('failedToLoad')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8 animate-fade-in max-w-5xl">
      {/* Handle scroll to hash for verse navigation */}
      <ScrollToHash />
      
      {/* Chapter Header */}
      <div className="mb-6 md:mb-8">
        <Link href="/" className="link mb-3 md:mb-4 inline-block text-sm md:text-base">
          ← {t('backToHome')}
        </Link>
        
        <div className="card">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-accent">
                {chapter.name_simple}
              </h1>
              <p className="text-sm md:text-base" style={{ color: 'var(--foreground)' }}>{chapter.translated_name?.name}</p>
            </div>
            <div className="text-3xl sm:text-4xl font-arabic text-accent">{chapter.name_arabic}</div>
          </div>
          
          <div className="flex flex-wrap gap-3 sm:gap-6 text-xs sm:text-sm" style={{ color: 'var(--foreground)' }}>
            <span>📖 {t('verses', { count: chapter.verses_count })}</span>
            <span className="capitalize">📍 {t('revelationPlace', { place: t(chapter.revelation_place) })}</span>
            <span>🔢 {t('chapterNumber', { number: chapter.id })}</span>
          </div>
        </div>
      </div>

      {/* Chapter Audio Player */}
      {chapterAudioUrl && (
        <ReciterAudioPlayer 
          chapterId={chapterId}
          totalVerses={chapter.verses_count}
          initialAudioUrl={chapterAudioUrl}
          initialTimestamps={chapterAudioTimestamps}
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
        <div className="text-center py-12 card">
          <p style={{ color: 'var(--text-muted)' }}>{t('noVerses')}</p>
        </div>
      )}
    </div>
  );
}
