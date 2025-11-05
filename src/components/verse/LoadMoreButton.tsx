'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Verse } from '@/types/verse';

interface LoadMoreButtonProps {
  readonly chapterId: number;
  readonly totalVerses: number;
  readonly versesPerPage: number;
  readonly currentPage: number;
  readonly totalLoaded: number;
  readonly onVersesLoaded: (verses: Verse[], nextPage: number) => void;
}

export function LoadMoreButton({ 
  chapterId,
  totalVerses, 
  versesPerPage, 
  currentPage,
  totalLoaded,
  onVersesLoaded
}: LoadMoreButtonProps) {
  const t = useTranslations('verse');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasMore = totalLoaded < totalVerses;

  const loadMore = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const nextPage = currentPage + 1;
      
      // Fetch next page of verses from API
      const response = await fetch(
        `/api/verses?chapter=${chapterId}&page=${nextPage}&perPage=${versesPerPage}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch verses');
      }

      const data = await response.json();
      
      if (data.verses && data.verses.length > 0) {
        onVersesLoaded(data.verses, nextPage);
      } else {
        setError(t('noMoreVerses'));
      }
    } catch (err) {
      console.error('Error loading more verses:', err);
      setError(t('failedToLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasMore) {
    return (
      <div className="text-center py-4 text-sm" style={{ color: 'var(--text-muted)' }}>
        {t('allVersesLoaded', { count: totalVerses })}
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      {error && (
        <p className="text-sm mb-3" style={{ color: 'var(--error-text)' }}>
          {error}
        </p>
      )}
      <button
        onClick={loadMore}
        disabled={isLoading}
        className="btn btn-primary"
      >
        {isLoading ? t('loading') : `${t('loadMore')} (${totalLoaded}/${totalVerses})`}
      </button>
    </div>
  );
}
