'use client';

import { useState, useEffect } from 'react';
import { SearchResultCard } from './SearchResultCard';
import Link from 'next/link';
import type { Verse } from '@/types/verse';

interface SearchResultsProps {
  readonly query: string;
  readonly searchType: 'text' | 'tag';
}

export function SearchResults({ query, searchType }: SearchResultsProps) {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          q: query,
          type: searchType,
        });

        const response = await fetch(`/api/search?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }

        const data = await response.json();
        setVerses(data.verses || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [query, searchType]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 border-4 rounded-full animate-spin mb-4"
          style={{ 
            borderColor: 'var(--primary-green)',
            borderTopColor: 'transparent'
          }}
        />
        <p style={{ color: 'rgba(0,0,0,0.6)' }}>
          {searchType === 'tag' ? 'Searching tags...' : 'Searching verses...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
        <p className="text-red-600">
          Error loading search results. {searchType === 'tag' ? 'Please try again.' : 'Please check your API credentials.'}
        </p>
        <p className="text-sm text-red-500 mt-2">{error}</p>
      </div>
    );
  }

  if (verses.length === 0) {
    return (
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
    );
  }

  return (
    <>
      <div className="mb-4 text-sm" style={{ color: 'rgba(0,0,0,0.6)' }}>
        Found {verses.length} verse{verses.length === 1 ? '' : 's'} 
        {searchType === 'tag' && ` tagged with "${query}"`}
      </div>
      <div className="space-y-4">
        {verses.map((verse) => (
          <SearchResultCard key={verse.verse_key} verse={verse} />
        ))}
      </div>
    </>
  );
}
