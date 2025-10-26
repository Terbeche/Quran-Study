import { VerseList } from '@/components/verse/VerseList';
import { SearchBar } from '@/components/search/SearchBar';
import Link from 'next/link';
import { getChapters } from '@/lib/api/chapters';
import { searchVerses } from '@/lib/api/search';
import type { Chapter } from '@/types/verse';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  readonly searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || '';
  const page = Number(params.page) || 1;

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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Search Quran</h1>
        <SearchBar />
        <p className="text-gray-700 mt-4 mb-8">Enter a search term to begin, or browse all chapters below</p>
        
        {/* All Chapters */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">📚 All Chapters (Surahs)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/surah/${chapter.id}`}
                className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold mb-1 text-gray-900">{chapter.name_simple}</div>
                    <div className="text-sm text-gray-700">{chapter.translated_name?.name}</div>
                  </div>
                  <div className="text-2xl font-arabic text-gray-900">{chapter.name_arabic}</div>
                </div>
                <div className="text-xs text-gray-500 flex gap-4">
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

  try {
    data = await searchVerses(query, page);
  } catch (err) {
    error = err;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Search Quran</h1>
        <SearchBar initialQuery={query} />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <p className="text-red-600">
            Error loading search results. Please check your API credentials.
          </p>
          <p className="text-sm text-red-500 mt-2">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Search Results</h1>
      <SearchBar initialQuery={query} />
      <VerseList verses={data?.results || []} />
    </div>
  );
}
