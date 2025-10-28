import { VerseList } from '@/components/verse/VerseList';
import { SearchBar } from '@/components/search/SearchBar';
import Link from 'next/link';
import { getChapters } from '@/lib/api/chapters';
import { searchVerses } from '@/lib/api/search';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { eq, like, and } from 'drizzle-orm';
import { getVerseByKey } from '@/lib/api/verses';
import type { Chapter, Verse } from '@/types/verse';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  readonly searchParams: Promise<{ q?: string; page?: string; type?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || '';
  const page = Number(params.page) || 1;
  const searchType = params.type === 'tag' ? 'tag' : 'text';

  // Load all chapters for browsing
  let chapters: Chapter[] = [];
  try {
    const data = await getChapters();
    chapters = data.chapters || [];
  } catch (error) {
    console.error('Failed to load chapters:', error);
  }

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <h1 className="section-title">Search Quran</h1>
        <SearchBar />
        <p className="mt-4 mb-8" style={{ color: 'var(--foreground)' }}>
          Search by text content or by tags. Browse all chapters below.
        </p>
        
        {/* All Chapters */}
        <div className="mt-8">
          <h2 className="section-title">📚 All Chapters (Surahs)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/surah/${chapter.id}`}
                className="card card-hover"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold mb-1 text-accent">{chapter.name_simple}</div>
                    <div className="text-sm" style={{ color: 'var(--foreground)' }}>{chapter.translated_name?.name}</div>
                  </div>
                  <div className="text-2xl font-arabic text-accent">{chapter.name_arabic}</div>
                </div>
                <div className="text-xs flex gap-4" style={{ color: 'rgba(0,0,0,0.5)' }}>
                  <span>{chapter.verses_count} verses</span>
                  <span className="capitalize">{chapter.revelation_place}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  let data;
  let error = null;
  let verses: Verse[] = [];

  if (searchType === 'tag') {
    // Search by tag
    try {
      const tagResults = await db
        .select()
        .from(tags)
        .where(and(
          like(tags.tagText, `%${query}%`),
          eq(tags.isPublic, true)
        ));

      // Get unique verse keys
      const verseKeys = [...new Set(tagResults.map((t) => t.verseKey))];

      // Fetch verse data for each key
      const versePromises = verseKeys.map((key: string) => getVerseByKey(key));
      const versesData = await Promise.allSettled(versePromises);
      
      verses = versesData
        .filter((result): result is PromiseFulfilledResult<Verse> => result.status === 'fulfilled')
        .map(result => result.value);
      
    } catch (err) {
      error = err;
    }
  } else {
    // Search by text
    try {
      data = await searchVerses(query, page);
      verses = data?.results || [];
    } catch (err) {
      error = err;
    }
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <h1 className="section-title">Search Quran</h1>
        <SearchBar initialQuery={query} initialSearchType={searchType} />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <p className="text-red-600">
            Error loading search results. {searchType === 'tag' ? 'Please try again.' : 'Please check your API credentials.'}
          </p>
          <p className="text-sm text-red-500 mt-2">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="section-title">
        {searchType === 'tag' ? '🏷️ Tag Search Results' : '📖 Text Search Results'}
      </h1>
      <SearchBar initialQuery={query} initialSearchType={searchType} />
      
      {verses.length === 0 ? (
        <div className="card text-center py-8">
          <p style={{ color: 'rgba(0,0,0,0.6)' }}>
            {searchType === 'tag' 
              ? `No verses found with tag "${query}". Try a different tag or make sure tags are public.`
              : 'No results found. Try different keywords.'}
          </p>
          {searchType === 'tag' && (
            <Link href="/community-tags" className="mt-4 inline-block link">
              Browse all community tags →
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm" style={{ color: 'rgba(0,0,0,0.6)' }}>
            Found {verses.length} verse{verses.length === 1 ? '' : 's'} 
            {searchType === 'tag' && ` tagged with "${query}"`}
          </div>
          <VerseList verses={verses} />
        </>
      )}
    </div>
  );
}
