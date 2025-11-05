'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import type { Verse } from '@/types/verse';
import type { Collection } from '@/types/collection';
import { LoadMoreButton } from './LoadMoreButton';
import { ClientVerseCard } from './ClientVerseCard';
import { scrollToHashElement, extractVerseNumberFromHash } from '@/lib/utils/scroll';
import { VERSES_PER_PAGE } from '@/lib/constants';

interface VerseListProps {
  readonly chapterId: number;
  readonly initialVersesContent: ReactNode;
  readonly initialVerses: Verse[];
  readonly totalVerses: number;
  readonly versesPerPage?: number;
  readonly userId?: string;
  readonly userCollections?: Collection[];
}


export function VerseList({ 
  chapterId,
  initialVersesContent,
  initialVerses,
  totalVerses, 
  versesPerPage = VERSES_PER_PAGE,
  userId,
  userCollections = []
}: VerseListProps) {
  const t = useTranslations('verse');
  const [additionalVerses, setAdditionalVerses] = useState<Verse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const hasAutoLoaded = useRef(false);
  const pendingScrollHash = useRef<string | null>(null);

  // Separate effect to handle scrolling after verses are rendered
  useEffect(() => {
    if (!pendingScrollHash.current) return;

    const hash = pendingScrollHash.current;
    const scrolled = scrollToHashElement(hash);
    
    if (scrolled) {
      // Clear the pending scroll
      pendingScrollHash.current = null;
    }
  }, [additionalVerses]); // Runs after additionalVerses changes (after render)

  // Check if we need to auto-load verses based on hash
  useEffect(() => {
    if (hasAutoLoaded.current) return;

    const loadVersesForHash = async () => {
      const hash = globalThis.location.hash;
      if (!hash) return;

      // Extract verse number from hash (e.g., #verse-255 -> 255)
      const targetVerseNumber = extractVerseNumberFromHash(hash);
      if (!targetVerseNumber) return;

      // If target verse is in initial load, no need to load more
      if (targetVerseNumber <= initialVerses.length) return;

      hasAutoLoaded.current = true;

      try {
        // Calculate how many verses we need to load
        const versesNeeded = targetVerseNumber - initialVerses.length;
        const pagesToLoad = Math.ceil(versesNeeded / versesPerPage);

        // Load verses in batches
        const allNewVerses: Verse[] = [];
        for (let i = 0; i < pagesToLoad; i++) {
          const nextPage = 2 + i; // Start from page 2 since page 1 is initial
          const response = await fetch(
            `/api/verses?chapter=${chapterId}&page=${nextPage}&perPage=${versesPerPage}`
          );

          if (response.ok) {
            const data = await response.json();
            if (data.verses && data.verses.length > 0) {
              allNewVerses.push(...data.verses);
            }
          }
        }

        if (allNewVerses.length > 0) {
          // Store hash for scrolling after render
          pendingScrollHash.current = hash;
          
          // Update state - this will trigger re-render and then the scroll effect
          setAdditionalVerses(allNewVerses);
          setCurrentPage(1 + pagesToLoad);
        }
      } catch (error) {
        console.error('Error auto-loading verses for hash:', error);
      }
    };

    loadVersesForHash();
  }, [chapterId, initialVerses.length, versesPerPage])

  const handleVersesLoaded = (newVerses: Verse[], nextPage: number) => {
    setAdditionalVerses(prev => [...prev, ...newVerses]);
    setCurrentPage(nextPage);
  };

  const totalLoaded = initialVerses.length + additionalVerses.length;

  if (initialVerses.length === 0) {
    return (
      <div className="text-center py-12 card">
        <p style={{ color: 'var(--text-muted)' }}>{t('noVerses')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4" id="verses-container">
        {/* Server-rendered initial verses */}
        {initialVersesContent}
        
        {/* Dynamically loaded verses */}
        {additionalVerses.map((verse) => (
          <ClientVerseCard
            key={verse.verse_key}
            verse={verse}
            userId={userId}
            userCollections={userCollections}
          />
        ))}
      </div>

      <LoadMoreButton 
        chapterId={chapterId}
        totalVerses={totalVerses}
        versesPerPage={versesPerPage}
        currentPage={currentPage}
        totalLoaded={totalLoaded}
        onVersesLoaded={handleVersesLoaded}
      />
    </>
  );
}
