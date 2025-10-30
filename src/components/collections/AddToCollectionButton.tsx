'use client';

import { useState, useTransition, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('collections');
  const tCommon = useTranslations('common');
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
        // Mark collection as added
        setCollectionIdsWithVerse(prev => new Set([...prev, collectionId]));
        
        // Find the collection name to send in the event
        const collection = collections.find(c => c.id === collectionId);
        
        // Dispatch custom event to notify other components
        if (collection && typeof globalThis !== 'undefined') {
          globalThis.dispatchEvent(new CustomEvent('verse-added-to-collection', {
            detail: { verseKey, collectionId, collectionName: collection.name }
          }));
        }
        
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
        className="text-sm link cursor-pointer hover:underline transition-all"
      >
        {t('addToCollection')}
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]" style={{ background: 'var(--modal-overlay)' }}>
          <div className="card glass max-w-md w-full max-h-96 overflow-y-auto relative z-10">
            <h2 className="text-xl font-bold mb-4 text-accent">{t('addToCollection')}</h2>

            {error && (
              <div className="mb-4 p-3 rounded text-sm" style={{ background: 'var(--error-bg)', color: 'var(--error-text)' }}>
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
                    className={`w-full text-left p-3 border rounded transition-all cursor-pointer ${
                      isAdded 
                        ? 'cursor-not-allowed' 
                        : 'disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                    style={isAdded 
                      ? { background: 'var(--success-bg)', borderColor: 'var(--success-border)' } 
                      : { borderColor: 'var(--card-border)', background: 'var(--card-bg)' }
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-accent">{collection.name}</div>
                        {collection.description && (
                          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{collection.description}</div>
                        )}
                      </div>
                      {isAdded && (
                        <span className="ml-2" style={{ color: 'var(--success-text)' }}>{t('added')}</span>
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
              className="mt-4 w-full px-4 py-2 border rounded transition-all text-accent cursor-pointer"
              style={{ borderColor: 'var(--primary-green)', background: 'transparent' }}
            >
              {tCommon('cancel')}
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
