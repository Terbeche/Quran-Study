'use client';

import { useState, useTransition, useRef } from 'react';
import { createTagAction, deleteTagAction, toggleTagVisibilityAction } from '@/actions/tag-actions';
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
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const tempIdCounter = useRef(0);

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

    // Check if tag already exists locally
    if (tags.some(tag => tag.tagText.toLowerCase() === normalized.toLowerCase())) {
      setError('You already have this tag on this verse');
      return;
    }

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
    
    // Optimistically add the tag
    setTags(prev => [...prev, tempTag]);

    startTransition(async () => {
      const result = await createTagAction(verseKey, normalized);
      if (result.error) {
        // Remove the optimistic tag on error
        setTags(prev => prev.filter(tag => tag.id !== tempTag.id));
        setError(result.error);
      } else if (result.data) {
        // Replace the temp tag with the real one
        setTags(prev => prev.map(tag => 
          tag.id === tempTag.id ? result.data : tag
        ));
      }
    });
  };

  const handleDelete = (tagId: string) => {
    startTransition(async () => {
      // Optimistically remove the tag
      const tagToDelete = tags.find(tag => tag.id === tagId);
      if (tagToDelete) {
        setTags(prev => prev.filter(tag => tag.id !== tagId));
        
        const result = await deleteTagAction(tagId);
        if (result.error) {
          // Restore the tag on error
          setTags(prev => [...prev, tagToDelete]);
        }
      }
    });
  };

  const handleToggleVisibility = async (tagId: string, currentIsPublic: boolean) => {
    if (isPending) return;
    
    startTransition(async () => {
      setError('');
      
      // Optimistically update the tag visibility
      setTags(prev => prev.map(tag =>
        tag.id === tagId ? { ...tag, isPublic: !currentIsPublic } : tag
      ));

      const result = await toggleTagVisibilityAction(tagId, !currentIsPublic);

      if (result.error) {
        setError(result.error);
        // Rollback on error
        setTags(prev => prev.map(tag =>
          tag.id === tagId ? { ...tag, isPublic: currentIsPublic } : tag
        ));
      }
    });
  };

  if (!userId) {
    return (
      <div className="mt-4 text-sm" style={{ color: 'rgba(0,0,0,0.5)' }}>
        Sign in to add personal tags
      </div>
    );
  }

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a tag..."
            className="input flex-1"
            maxLength={50}
          />
          <button
            type="submit"
            disabled={isPending || !isValidTag(input)}
            className="btn-primary disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </form>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                tag.isPublic
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              <span>#{tag.tagText}</span>
              
              {/* Toggle visibility button */}
              <button
                onClick={() => handleToggleVisibility(tag.id, tag.isPublic)}
                className="hover:opacity-70 text-xs"
                disabled={isPending}
                title={tag.isPublic ? 'Make private' : 'Make public'}
                aria-label={tag.isPublic ? 'Make tag private' : 'Make tag public'}
              >
                {tag.isPublic ? '🌐' : '🔒'}
              </button>

              {/* Delete button */}
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
