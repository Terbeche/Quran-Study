'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

interface SearchBarProps {
  initialQuery?: string;
}

export function SearchBar({ initialQuery = '' }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    });
  };

  return (
    <form onSubmit={handleSearch} className="mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Quran..."
          className="input flex-1"
          style={{ color: 'var(--foreground)' }}
        />
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Searching...' : 'Search'}
        </button>
      </div>
    </form>
  );
}
