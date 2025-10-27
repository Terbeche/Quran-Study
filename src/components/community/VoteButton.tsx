'use client';

import { useTransition } from 'react';
import { voteOnTagAction } from '@/actions/vote-actions';

interface VoteButtonProps {
  readonly tagId: string;
  readonly currentVotes: number;
  readonly userVote: number | null; // null, 1, or -1
}

export default function VoteButton({ tagId, currentVotes, userVote }: VoteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleVote = (value: 1 | -1) => {
    startTransition(async () => {
      await voteOnTagAction(tagId, value);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleVote(1)}
        disabled={isPending}
        className={`px-2 py-1 rounded transition-colors ${
          userVote === 1
            ? 'bg-emerald-500 text-white'
            : 'hover:bg-emerald-100'
        } disabled:opacity-50`}
        style={userVote === 1 ? {} : { background: 'rgba(16, 185, 129, 0.1)', color: 'var(--dark-green)' }}
        aria-label={userVote === 1 ? 'Remove upvote' : 'Upvote'}
        title={userVote === 1 ? 'Remove upvote' : 'Upvote'}
      >
        ▲
      </button>

      <span className="font-semibold min-w-[2rem] text-center text-accent">
        {currentVotes}
      </span>

      <button
        onClick={() => handleVote(-1)}
        disabled={isPending}
        className={`px-2 py-1 rounded transition-colors ${
          userVote === -1
            ? 'bg-red-500 text-white'
            : 'hover:bg-red-100'
        } disabled:opacity-50`}
        style={userVote === -1 ? {} : { background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }}
        aria-label={userVote === -1 ? 'Remove downvote' : 'Downvote'}
        title={userVote === -1 ? 'Remove downvote' : 'Downvote'}
      >
        ▼
      </button>
    </div>
  );
}
