'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { removeVerseFromCollectionAction } from '@/actions/collection-actions';

interface RemoveFromCollectionButtonProps {
  readonly collectionId: string;
  readonly verseKey: string;
}

export default function RemoveFromCollectionButton({
  collectionId,
  verseKey,
}: RemoveFromCollectionButtonProps) {
  const t = useTranslations('collections');
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
      className="px-3 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50 transition-colors"
      title={t('removeFromCollection')}
    >
      {t('removeFromCollection')}
    </button>
  );
}
