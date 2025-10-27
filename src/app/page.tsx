import Link from 'next/link';
import { VerseCard } from '@/components/verse/VerseCard';
import { getChapters } from '@/lib/api/chapters';
import { getVerseByKey } from '@/lib/api/verses';
import { getVerseAudio } from '@/lib/quran-api/client';
import type { Chapter, Verse } from '@/types/verse';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function Home() {
  // Fetch featured verse (Ayat al-Kursi)
  let featuredVerse: Verse | null = null;
  let featuredVerseAudio: string | undefined;
  
  try {
    const verseData = await getVerseByKey('2:255');
    featuredVerse = verseData;
    
    // Try to get audio, but don't fail if it doesn't work
    try {
      const audioData = await getVerseAudio(7, '2:255');
      if (audioData.audio_files?.[0]?.url) {
        featuredVerseAudio = `https://verses.quran.com/${audioData.audio_files[0].url}`;
      }
    } catch (audioError) {
      console.error('Failed to load featured verse audio:', audioError);
      // Continue without audio
    }
  } catch (error) {
    console.error('Failed to load featured verse:', error);
  }

  // Get all chapters for browsing
  let chapters: Chapter[] = [];
  try {
    const data = await getChapters();
    chapters = data.chapters || [];
  } catch (error) {
    console.error('Failed to load chapters:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent animate-slide-in">
          QuranVerseTagger
        </h1>
        <p className="text-xl mb-8" style={{ color: 'var(--foreground)' }}>
          Engage deeply with the Quran through personal tagging, community insights, and organized collections
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/search"
            className="btn-primary font-medium"
          >
            🔍 Search Quran
          </Link>
          <Link
            href="/auth/signin"
            className="px-6 py-3 border-2 rounded-xl font-medium transition-all duration-300 hover:bg-emerald-50"
            style={{ borderColor: 'var(--primary-green)', color: 'var(--primary-green)' }}
          >
            Sign In to Tag Verses
          </Link>
        </div>
      </div>

      {/* Featured Verse */}
      {featuredVerse && (
        <div className="max-w-4xl mx-auto mb-12 animate-fade-in">
          <h2 className="section-title">📖 Featured Verse: Ayat al-Kursi</h2>
          <VerseCard verse={featuredVerse} audioUrl={featuredVerseAudio} />
        </div>
      )}

      {/* Browse Chapters */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="section-title mb-0">📚 Browse Chapters (Surahs)</h2>
          <Link 
            href="/search"
            className="link font-medium"
          >
            View All →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chapters.slice(0, 12).map((chapter) => (
            <Link
              key={chapter.id}
              href={`/surah/${chapter.id}`}
              className="card card-hover"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg" style={{ color: 'var(--dark-green)' }}>{chapter.name_simple}</h3>
                  <p className="text-sm" style={{ color: 'var(--foreground)' }}>{chapter.translated_name?.name}</p>
                </div>
                <div className="text-2xl font-arabic" style={{ color: 'var(--dark-green)' }}>{chapter.name_arabic}</div>
              </div>
              <div className="text-xs flex gap-4" style={{ color: 'rgba(0,0,0,0.5)' }}>
                <span>{chapter.verses_count} verses</span>
                <span className="capitalize">{chapter.revelation_place}</span>
              </div>
            </Link>
          ))}
        </div>

        {chapters.length === 0 && (
          <div className="text-center py-12 card">
            <p style={{ color: 'rgba(0,0,0,0.5)' }}>Failed to load chapters. Please try again later.</p>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto mt-16 grid md:grid-cols-3 gap-8">
        <div className="feature-box">
          <div className="text-4xl mb-4">🏷️</div>
          <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--dark-green)' }}>Personal Tags</h3>
          <p style={{ color: 'var(--foreground)' }}>
            Create custom tags to organize and reflect on verses that resonate with you
          </p>
        </div>
        <div className="feature-box">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--dark-green)' }}>Community Insights</h3>
          <p style={{ color: 'var(--foreground)' }}>
            Discover how others interpret verses through community tags and voting
          </p>
        </div>
        <div className="feature-box">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--dark-green)' }}>Collections</h3>
          <p style={{ color: 'var(--foreground)' }}>
            Build custom collections of verses for study, memorization, or sharing
          </p>
        </div>
      </div>
    </div>
  );
}
