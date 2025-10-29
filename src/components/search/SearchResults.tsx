'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { SearchResultCard } from './SearchResultCard';
import { Link } from '@/i18n/routing';
import type { Verse } from '@/types/verse';

interface SearchResultsProps {
  readonly query: string;
  readonly searchType: 'text' | 'tag';
}

export function SearchResults({ query, searchType }: SearchResultsProps) {
  const t = useTranslations('search');
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
        <p style={{ color: 'var(--text-muted)' }}>
          {t('searching')}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg p-4 mt-4" style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)' }}>
        <p style={{ color: 'var(--error-text)' }}>
          {t('errorLoading')}
        </p>
        <p className="text-sm mt-2" style={{ color: 'var(--error-text)', opacity: 0.8 }}>{error}</p>
      </div>
    );
  }

  if (verses.length === 0) {
    return (
      <div className="card text-center py-8">
        <p style={{ color: 'var(--text-muted)' }}>
          {t('noResults', { query })}
          <br />
          {t('tryDifferent')}
        </p>
        {searchType === 'tag' && (
          <Link href="/community-tags" className="mt-4 inline-block link">
            {t('browseAllTags')} →
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
        {t('foundVerses', { count: verses.length })}
        {searchType === 'tag' && ` ${t('taggedWith', { query })}`}
      </div>
      <div className="space-y-4">
        {verses.map((verse) => (
          <SearchResultCard key={verse.verse_key} verse={verse} />
        ))}
      </div>
    </>
  );
}
