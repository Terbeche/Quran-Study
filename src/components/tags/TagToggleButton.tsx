'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { toggleTagVisibilityAction } from '@/actions/tag-actions';

interface TagToggleButtonProps {
  readonly tagId: string;
  readonly isPublic: boolean;
  readonly onToggle?: (newIsPublic: boolean) => void;
}

export default function TagToggleButton({ tagId, isPublic, onToggle }: TagToggleButtonProps) {
  const t = useTranslations('tags');
  const [isPending, startTransition] = useTransition();
  const [localIsPublic, setLocalIsPublic] = useState(isPublic);

  const handleToggle = () => {
    const previousIsPublic = localIsPublic;
    
    startTransition(async () => {
      // Optimistic update
      const newIsPublic = !previousIsPublic;
      setLocalIsPublic(newIsPublic);
      onToggle?.(newIsPublic);

      const result = await toggleTagVisibilityAction(tagId, newIsPublic);
      
      if (result.error) {
        // Rollback on error
        setLocalIsPublic(previousIsPublic);
        onToggle?.(previousIsPublic);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
        localIsPublic
          ? 'bg-purple-100 text-purple-800 hover:bg-purple-200 hover:shadow-sm'
          : 'hover:bg-gray-300 hover:shadow-sm'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      style={localIsPublic ? {} : { background: 'rgba(0,0,0,0.1)', color: 'var(--foreground)' }}
      title={localIsPublic ? t('makePrivate') : t('makePublic')}
    >
      {localIsPublic ? `🌐 ${t('publicTag')}` : `🔒 ${t('privateTag')}`}
    </button>
  );
}
