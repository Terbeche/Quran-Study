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
            ? 'bg-green-500 text-white'
            : 'bg-gray-200 hover:bg-green-100 text-gray-700'
        } disabled:opacity-50`}
        aria-label={userVote === 1 ? 'Remove upvote' : 'Upvote'}
        title={userVote === 1 ? 'Remove upvote' : 'Upvote'}
      >
        ▲
      </button>

      <span className="font-semibold min-w-[2rem] text-center text-gray-900">
        {currentVotes}
      </span>

      <button
        onClick={() => handleVote(-1)}
        disabled={isPending}
        className={`px-2 py-1 rounded transition-colors ${
          userVote === -1
            ? 'bg-red-500 text-white'
            : 'bg-gray-200 hover:bg-red-100 text-gray-700'
        } disabled:opacity-50`}
        aria-label={userVote === -1 ? 'Remove downvote' : 'Downvote'}
        title={userVote === -1 ? 'Remove downvote' : 'Downvote'}
      >
        ▼
      </button>
    </div>
  );
}
