'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ScrollToHash() {
  const pathname = usePathname();

  useEffect(() => {
    // Check if there's a hash in the URL
    const hash = globalThis.location.hash;
    if (hash) {
      // Remove the # and try to find the element
      const elementId = hash.substring(1);
      const element = document.getElementById(elementId);
      
      if (element) {
        // Scroll to the element with smooth behavior
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add a highlight effect
          element.style.transition = 'background-color 0.3s ease';
          element.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
          setTimeout(() => {
            element.style.backgroundColor = '';
          }, 2000);
        }, 100);
      }
    }
  }, [pathname]);

  return null;
}
