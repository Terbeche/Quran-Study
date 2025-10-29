'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { deleteTagAction } from '@/actions/tag-actions';

interface DeleteTagButtonProps {
  readonly tagId: string;
}

export default function DeleteTagButton({ tagId }: DeleteTagButtonProps) {
  const t = useTranslations('tags');
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteTagAction(tagId);
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="px-3 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer hover:shadow-sm"
      title={t('deleteTag')}
    >
      {t('delete')}
    </button>
  );
}
