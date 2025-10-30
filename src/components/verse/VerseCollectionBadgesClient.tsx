'use client';

import { useState, useTransition, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { removeVerseFromCollectionAction } from '@/actions/collection-actions';

interface Collection {
  id: string;
  name: string;
}

interface VerseCollectionBadgesClientProps {
  readonly verseKey: string;
  readonly initialCollections: Collection[];
}

export function VerseCollectionBadgesClient({ verseKey, initialCollections }: VerseCollectionBadgesClientProps) {
  const t = useTranslations('verse');
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [isPending, startTransition] = useTransition();

  // Listen for collection additions
  useEffect(() => {
    const handleCollectionAdded = (event: CustomEvent) => {
      const { verseKey: eventVerseKey, collectionId, collectionName } = event.detail;
      if (eventVerseKey === verseKey) {
        // Add the new collection to the list if not already present
        setCollections(prev => {
          if (prev.some(c => c.id === collectionId)) {
            return prev;
          }
          return [...prev, { id: collectionId, name: collectionName }];
        });
      }
    };

    globalThis.addEventListener('verse-added-to-collection', handleCollectionAdded as EventListener);
    return () => {
      globalThis.removeEventListener('verse-added-to-collection', handleCollectionAdded as EventListener);
    };
  }, [verseKey]);

  const handleRemove = (collectionId: string) => {
    startTransition(async () => {
      // Optimistically remove
      const removed = collections.find(c => c.id === collectionId);
      setCollections(prev => prev.filter(c => c.id !== collectionId));

      const result = await removeVerseFromCollectionAction(collectionId, verseKey);
      
      if (result.error) {
        // Restore on error
        if (removed) {
          setCollections(prev => [...prev, removed]);
        }
        alert(result.error);
      }
    });
  };

  if (collections.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--card-border)' }}>
      <div className="flex items-start gap-2">
        <span className="text-xs font-medium mt-1" style={{ color: 'var(--text-muted)' }}>{t('inCollections')}:</span>
        <div className="flex flex-wrap gap-2">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: 'rgba(147, 51, 234, 0.1)', color: 'var(--primary-green)' }}
            >
              <Link
                href={`/collections/${collection.id}`}
                className="hover:underline"
              >
                📚 {collection.name}
              </Link>
              <button
                onClick={() => handleRemove(collection.id)}
                className="hover:text-red-600 hover:scale-110 font-bold ml-1 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isPending}
                aria-label={`Remove from ${collection.name}`}
                title={t('removeFromCollection')}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
