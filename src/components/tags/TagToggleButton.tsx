'use client';

import { useTransition } from 'react';
import { toggleTagVisibilityAction } from '@/actions/tag-actions';

interface TagToggleButtonProps {
  readonly tagId: string;
  readonly isPublic: boolean;
}

export default function TagToggleButton({ tagId, isPublic }: TagToggleButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleTagVisibilityAction(tagId, !isPublic);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
        isPublic
          ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      } disabled:opacity-50`}
      title={isPublic ? 'Make private' : 'Make public'}
    >
      {isPublic ? '🌐 Public' : '🔒 Private'}
    </button>
  );
}
