'use client';

import { useState, useTransition, useEffect } from 'react';
import { addVerseToCollectionAction, getVerseCollectionsAction } from '@/actions/collection-actions';
import type { Collection } from '@/types/collection';

interface AddToCollectionButtonProps {
  readonly verseKey: string;
  readonly collections: Collection[];
}

export default function AddToCollectionButton({
  verseKey,
  collections,
}: AddToCollectionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [collectionIdsWithVerse, setCollectionIdsWithVerse] = useState<Set<string>>(new Set());

  // Fetch which collections already contain this verse when modal opens
  useEffect(() => {
    if (isOpen) {
      startTransition(async () => {
        const result = await getVerseCollectionsAction(verseKey);
        if (result.data) {
          setCollectionIdsWithVerse(new Set(result.data.map(c => c.id)));
        }
      });
    }
  }, [isOpen, verseKey]);

  const handleAdd = (collectionId: string) => {
    setError('');
    startTransition(async () => {
      const result = await addVerseToCollectionAction(collectionId, verseKey);
      if (result.error) {
        setError(result.error);
      } else {
        setCollectionIdsWithVerse(prev => new Set([...prev, collectionId]));
        setIsOpen(false);
      }
    });
  };

  if (collections.length === 0) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm text-blue-600 hover:underline"
      >
        + Add to Collection
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Add to Collection</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              {collections.map((collection) => {
                const isAdded = collectionIdsWithVerse.has(collection.id);
                return (
                  <button
                    key={collection.id}
                    onClick={() => !isAdded && handleAdd(collection.id)}
                    disabled={isPending || isAdded}
                    className={`w-full text-left p-3 border rounded transition ${
                      isAdded 
                        ? 'bg-green-50 border-green-300 cursor-not-allowed' 
                        : 'hover:bg-gray-50 disabled:opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{collection.name}</div>
                        {collection.description && (
                          <div className="text-sm text-gray-500">{collection.description}</div>
                        )}
                      </div>
                      {isAdded && (
                        <span className="text-green-600 ml-2">✓ Added</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                setError('');
              }}
              className="mt-4 w-full px-4 py-2 border rounded hover:bg-gray-50 text-gray-900"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
