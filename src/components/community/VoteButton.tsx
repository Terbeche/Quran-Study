'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { voteOnTagAction } from '@/actions/vote-actions';

interface VoteButtonProps {
  readonly tagId: string;
  readonly currentVotes: number;
  readonly userVote: number | null; // null, 1, or -1
}

export default function VoteButton({ tagId, currentVotes, userVote }: VoteButtonProps) {
  const t = useTranslations('community');
  const [isPending, startTransition] = useTransition();
  const [optimisticVotes, setOptimisticVotes] = useState(currentVotes);
  const [optimisticUserVote, setOptimisticUserVote] = useState(userVote);

  const handleVote = (value: 1 | -1) => {
    const previousVote = optimisticUserVote;
    const newVote = previousVote === value ? null : value;
    
    let voteDelta = 0;
    if (previousVote === null && newVote !== null) {
      voteDelta = newVote;
    } else if (previousVote !== null && newVote === null) {
      voteDelta = -previousVote;
    } else if (previousVote !== null && newVote !== null) {
      voteDelta = newVote - previousVote;
    }
    
    setOptimisticVotes(optimisticVotes + voteDelta);
    setOptimisticUserVote(newVote);

    startTransition(async () => {
      const result = await voteOnTagAction(tagId, value);
      if (result.error) {
        // Rollback on error
        setOptimisticVotes(currentVotes);
        setOptimisticUserVote(userVote);
      }
      // No refresh needed - optimistic update is the final state
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleVote(1)}
        disabled={isPending}
        className={`px-2 py-1 rounded transition-all cursor-pointer hover:scale-110 ${
          optimisticUserVote === 1
            ? 'bg-emerald-500 text-white'
            : 'hover:bg-emerald-100'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        style={optimisticUserVote === 1 ? {} : { background: 'rgba(16, 185, 129, 0.1)', color: 'var(--dark-green)' }}
        aria-label={optimisticUserVote === 1 ? t('removeUpvote') : t('upvote')}
        title={optimisticUserVote === 1 ? t('removeUpvote') : t('upvote')}
      >
        ▲
      </button>

      <span className="font-semibold min-w-[2rem] text-center text-accent">
        {optimisticVotes}
      </span>

      <button
        onClick={() => handleVote(-1)}
        disabled={isPending}
        className={`px-2 py-1 rounded transition-all cursor-pointer hover:scale-110 ${
          optimisticUserVote === -1
            ? 'bg-red-500 text-white'
            : 'hover:bg-red-100'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        style={optimisticUserVote === -1 ? {} : { background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }}
        aria-label={optimisticUserVote === -1 ? t('removeDownvote') : t('downvote')}
        title={optimisticUserVote === -1 ? t('removeDownvote') : t('downvote')}
      >
        ▼
      </button>
    </div>
  );
}
