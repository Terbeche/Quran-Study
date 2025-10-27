'use client';

import { useTransition } from 'react';
import { removeVerseFromCollectionAction } from '@/actions/collection-actions';

interface RemoveFromCollectionButtonProps {
  readonly collectionId: string;
  readonly verseKey: string;
}

export default function RemoveFromCollectionButton({
  collectionId,
  verseKey,
}: RemoveFromCollectionButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleRemove = () => {
    startTransition(async () => {
        await removeVerseFromCollectionAction(collectionId, verseKey);
    });
  };

  return (
    <button
      onClick={handleRemove}
      disabled={isPending}
      className="px-3 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50"
      title="Remove from collection"
    >
      Remove from Collection
    </button>
  );
}
