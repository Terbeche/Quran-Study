'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { deleteCollectionAction } from '@/actions/collection-actions';
import { useRouter } from '@/i18n/routing';

interface DeleteCollectionButtonProps {
  readonly collectionId: string;
}

export default function DeleteCollectionButton({ collectionId }: DeleteCollectionButtonProps) {
  const t = useTranslations('collections');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
    const result = await deleteCollectionAction(collectionId);
    if (result.success) {
        router.push('/collections');
    }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="px-3 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer hover:shadow-sm"
      title={t('deleteCollection')}
    >
      {t('delete')}
    </button>
  );
}
