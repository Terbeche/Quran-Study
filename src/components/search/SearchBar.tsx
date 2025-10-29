'use client';

import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

interface SearchBarProps {
  initialQuery?: string;
  initialSearchType?: 'text' | 'tag';
}

export function SearchBar({ initialQuery = '', initialSearchType = 'text' }: SearchBarProps) {
  const t = useTranslations('search');
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<'text' | 'tag'>(initialSearchType);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    startTransition(() => {
      const params = new URLSearchParams();
      params.set('q', query);
      if (searchType === 'tag') {
        params.set('type', 'tag');
      }
      router.push(`/search?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSearch} className="mb-6">
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setSearchType('text')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            searchType === 'text'
              ? 'btn-primary'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🔍 {t('textSearch')}
        </button>
        <button
          type="button"
          onClick={() => setSearchType('tag')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            searchType === 'tag'
              ? 'btn-primary'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🏷️ {t('tagSearch')}
        </button>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchType === 'tag' ? t('tagSearchPlaceholder') : t('textSearchPlaceholder')}
          className="input flex-1"
          style={{ color: 'var(--foreground)' }}
        />
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? t('searching') : t('search')}
        </button>
      </div>
      {searchType === 'tag' && (
        <p className="mt-2 text-sm" style={{ color: 'rgba(0,0,0,0.6)' }}>
          💡 {t('communityTagsHint')}
        </p>
      )}
    </form>
  );
}
