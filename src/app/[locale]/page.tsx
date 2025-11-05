import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { VerseCard } from '@/components/verse/VerseCard';
import { getChapters } from '@/lib/api/chapters';
import { getVerseByKey } from '@/lib/api/verses';
import { auth } from '@/auth';
import type { Chapter, Verse } from '@/types/verse';

export const revalidate = 3600;

export default async function Home() {
  const t = await getTranslations('home');
  const tChapter = await getTranslations('chapter');
  const session = await auth();
  
  // Fetch featured verse (Ayat al-Kursi)
  // Audio will be lazy-loaded when user clicks play
  let featuredVerse: Verse | null = null;
  
  try {
    const verseData = await getVerseByKey('2:255');
    featuredVerse = verseData;
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
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8 animate-fade-in">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-8 md:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold p-2 mb-3 md:mb-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent animate-slide-in">
          {t('heroTitle')}
        </h1>
        <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 px-2" style={{ color: 'var(--foreground)' }}>
          {t('heroDescription')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
          <Link
            href="/search"
            className="btn-primary font-medium text-sm sm:text-base"
          >
            🔍 {t('searchQuran')}
          </Link>
          {!session?.user && (
            <Link
              href="/auth/signin"
              className="px-6 py-3 border-2 rounded-xl font-medium transition-all duration-300 text-sm sm:text-base"
              style={{ 
                borderColor: 'var(--primary-green)', 
                color: 'var(--primary-green)',
                background: 'transparent'
              }}
            >
              {t('signInToTag')}
            </Link>
          )}
        </div>
      </div>

      {/* Featured Verse */}
      {featuredVerse && (
        <div className="max-w-4xl mx-auto mb-8 md:mb-12 animate-fade-in">
          <h2 className="section-title text-xl sm:text-2xl">📖 {t('featuredVerse')}: {t('ayatAlKursi')}</h2>
          <VerseCard verse={featuredVerse} />
        </div>
      )}

      {/* Browse Chapters */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="section-title mb-0 text-xl sm:text-2xl">📚 {t('browseChapters')}</h2>
          <Link 
            href="/search"
            className="link font-medium text-sm sm:text-base"
          >
            {t('viewAll')} →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {chapters.slice(0, 12).map((chapter) => (
            <Link
              key={chapter.id}
              href={`/surah/${chapter.id}`}
              className="card card-hover"
            >
              <div className="flex justify-between items-start mb-2 gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base sm:text-lg truncate" style={{ color: 'var(--dark-green)' }}>{chapter.name_simple}</h3>
                  <p className="text-xs sm:text-sm truncate" style={{ color: 'var(--foreground)' }}>{chapter.translated_name?.name}</p>
                </div>
                <div className="text-xl sm:text-2xl font-arabic flex-shrink-0" style={{ color: 'var(--dark-green)' }}>{chapter.name_arabic}</div>
              </div>
              <div className="text-xs flex gap-3 sm:gap-4" style={{ color: 'var(--text-muted)' }}>
                <span>{tChapter('verses', { count: chapter.verses_count })}</span>
                <span className="capitalize">{chapter.revelation_place}</span>
              </div>
            </Link>
          ))}
        </div>

        {chapters.length === 0 && (
          <div className="text-center py-8 md:py-12 card">
            <p style={{ color: 'var(--text-muted)' }}>{t('failedToLoad')}</p>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
        <div className="feature-box">
          <div className="text-4xl mb-4">🏷️</div>
          <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--dark-green)' }}>{t('features.tag.title')}</h3>
          <p style={{ color: 'var(--foreground)' }}>
            {t('features.tag.description')}
          </p>
        </div>
        <div className="feature-box">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--dark-green)' }}>{t('features.community.title')}</h3>
          <p style={{ color: 'var(--foreground)' }}>
            {t('features.community.description')}
          </p>
        </div>
        <div className="feature-box">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--dark-green)' }}>{t('features.collect.title')}</h3>
          <p style={{ color: 'var(--foreground)' }}>
            {t('features.collect.description')}
          </p>
        </div>
      </div>
    </div>
  );
}
