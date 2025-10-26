import { VerseCard } from './VerseCard';
import type { Verse } from '@/types/verse';

interface VerseListProps {
  verses: Verse[];
}

export function VerseList({ verses }: VerseListProps) {
  if (!verses || verses.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No verses found</p>
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
