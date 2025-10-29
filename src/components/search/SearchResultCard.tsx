'use client';

import { Link } from '@/i18n/routing';
import type { Verse } from '@/types/verse';

interface SearchResultCardProps {
  readonly verse: Verse;
}

export function SearchResultCard({ verse }: SearchResultCardProps) {
  return (
    <Link
      href={`/surah/${verse.verse_key.split(':')[0]}#verse-${verse.verse_number}`}
      className="card card-hover block"
    >
      {/* Verse header */}
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm font-medium text-accent">
          {verse.verse_key}
        </div>
      </div>

      {/* Arabic text */}
      <div className="text-2xl text-right mb-4 leading-loose text-accent font-arabic">
        {verse.text_uthmani}
      </div>

      {/* Translation */}
      {verse.translations && verse.translations.length > 0 && (
        <div className="space-y-2">
          {verse.translations.map((translation) => (
            <div
              key={translation.id}
              className="text-sm leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
              // Render <em> tags for highlighted text
              dangerouslySetInnerHTML={{ __html: translation.text }}
            />
          ))}
        </div>
      )}
    </Link>
  );
}
