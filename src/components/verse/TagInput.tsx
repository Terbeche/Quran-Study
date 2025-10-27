'use client';

import { useOptimistic, useState, useTransition, useRef } from 'react';
import { createTagAction, deleteTagAction } from '@/actions/tag-actions';
import { normalizeTag, isValidTag } from '@/lib/utils/tag-normalizer';
import type { Tag } from '@/types/tag';

interface TagInputProps {
  readonly verseKey: string;
  readonly initialTags: Tag[];
  readonly userId: string | undefined;
}

export default function TagInput({ verseKey, initialTags, userId }: TagInputProps) {
  const [isPending, startTransition] = useTransition();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const tempIdCounter = useRef(0);

  const [optimisticTags, addOptimisticTag] = useOptimistic(
    initialTags,
    (state, newTag: Tag) => [...state, newTag]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      setError('Please sign in to add tags');
      return;
    }

    if (!isValidTag(input)) {
      setError('Tag must be 2-50 characters');
      return;
    }

    const normalized = normalizeTag(input);

    // Create optimistic tag with stable ID
    tempIdCounter.current += 1;
    const tempTag: Tag = {
      id: `temp-${tempIdCounter.current}`,
      userId,
      verseKey,
      tagText: normalized,
      isPublic: false,
      votes: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setInput('');
    setError('');

    startTransition(async () => {
      addOptimisticTag(tempTag);
      const result = await createTagAction(verseKey, input);
      if (result.error) {
        setError(result.error);
      }
    });
  };

  const handleDelete = (tagId: string) => {
    startTransition(async () => {
      await deleteTagAction(tagId);
    });
  };

  if (!userId) {
    return (
      <div className="mt-4 text-sm text-gray-500">
        Sign in to add personal tags
      </div>
    );
  }

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a tag..."
          className="flex-1 px-3 py-2 border rounded-md text-gray-900"
          maxLength={50}
        />
        <button
          type="submit"
          disabled={isPending || !isValidTag(input)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {optimisticTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {optimisticTags.map((tag) => (
            <div
              key={tag.id}
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
            >
              <span>#{tag.tagText}</span>
              <button
                onClick={() => handleDelete(tag.id)}
                className="hover:text-red-600 font-bold"
                disabled={isPending}
                aria-label={`Delete tag ${tag.tagText}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
