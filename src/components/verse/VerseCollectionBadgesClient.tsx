'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
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
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [isPending, startTransition] = useTransition();

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
    <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(16, 185, 129, 0.1)' }}>
      <div className="flex items-start gap-2">
        <span className="text-xs font-medium mt-1" style={{ color: 'rgba(0,0,0,0.5)' }}>In Collections:</span>
        <div className="flex flex-wrap gap-2">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
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
                title="Remove from collection"
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
