'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { scrollToHashElement } from '@/lib/utils/scroll';
import { SCROLL_RETRY_TIMEOUTS } from '@/lib/constants';

// Global scroll-to-hash handler for VerseList scrolling after auto-loading verses

export function ScrollToHash() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = globalThis.location.hash;
    if (!hash) return;

    const attemptScroll = () => scrollToHashElement(hash);

    // Try scroll immediately on pathname change
    attemptScroll();
    
    // Retry with increasing delays in case content is still loading
    const timeouts = SCROLL_RETRY_TIMEOUTS.map(delay => 
      setTimeout(attemptScroll, delay)
    );

    // Also listen for hash changes (for same-page navigation)
    const handleHashChange = () => {
      setTimeout(attemptScroll, 100);
    };

    globalThis.addEventListener('hashchange', handleHashChange);

    return () => {
      for (const timeout of timeouts) {
        clearTimeout(timeout);
      }
      globalThis.removeEventListener('hashchange', handleHashChange);
    };
  }, [pathname]);

  return null;
}
