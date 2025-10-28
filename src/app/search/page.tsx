import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import Link from 'next/link';
import { getChapters } from '@/lib/api/chapters';
import type { Chapter } from '@/types/verse';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  readonly searchParams: Promise<{ q?: string; page?: string; type?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || '';
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

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="section-title">
        {searchType === 'tag' ? '🏷️ Tag Search Results' : '📖 Text Search Results'}
      </h1>
      <SearchBar initialQuery={query} initialSearchType={searchType} />
      <SearchResults query={query} searchType={searchType} />
    </div>
  );
}
