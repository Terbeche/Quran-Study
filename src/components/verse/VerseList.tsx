import { VerseCard } from './VerseCard';
import { useTranslations } from 'next-intl';
import type { Verse } from '@/types/verse';

interface VerseListProps {
  verses: Verse[];
}

export function VerseList({ verses }: VerseListProps) {
  const t = useTranslations('verse');
  
  if (!verses || verses.length === 0) {
    return (
      <div className="text-center py-12 card">
        <p style={{ color: 'var(--text-muted)' }}>{t('noVerses')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {verses.map((verse) => (
        <VerseCard key={verse.verse_key} verse={verse} />
      ))}
    </div>
  );
}
