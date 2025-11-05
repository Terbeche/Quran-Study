import { SCROLL_HIGHLIGHT_COLOR, SCROLL_HIGHLIGHT_DURATION } from '../constants';

/**
 * Scrolls to an element by hash and applies a highlight effect
 * @param hash - The hash string (e.g., "#verse-255")
 * @returns boolean - true if element was found and scrolled to
 */
export function scrollToHashElement(hash: string): boolean {
  if (!hash) return false;

  const elementId = hash.substring(1); // Remove the #
  const element = document.getElementById(elementId);
  
  if (!element) return false;

  // Scroll to the element
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  // Apply highlight effect
  element.style.transition = 'background-color 0.3s ease';
  element.style.backgroundColor = SCROLL_HIGHLIGHT_COLOR;
  
  // Remove highlight after duration
  setTimeout(() => {
    element.style.backgroundColor = '';
  }, SCROLL_HIGHLIGHT_DURATION);

  return true;
}

/**
 * Extracts verse number from hash (e.g., "#verse-255" -> 255)
 * @param hash - The hash string
 * @returns number | null - The verse number or null if invalid
 */
export function extractVerseNumberFromHash(hash: string): number | null {
  if (!hash) return null;
  
  const regex = /^#verse-(\d+)$/;
  const match = regex.exec(hash);
  
  if (!match) return null;
  
  return Number.parseInt(match[1], 10);
}
