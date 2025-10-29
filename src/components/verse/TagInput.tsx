'use client';

import { useState, useTransition, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { createTagAction, deleteTagAction } from '@/actions/tag-actions';
import type { Tag } from '@/types/tag';
import TagToggleButton from '@/components/tags/TagToggleButton';
import { isValidTag, normalizeTag } from '@/lib/utils/tag-normalizer';

interface TagInputProps {
  readonly verseKey: string;
  readonly initialTags: Tag[];
  readonly userId: string | undefined;
}

export default function TagInput({ verseKey, initialTags, userId }: TagInputProps) {
  const t = useTranslations('verse');
  const [isPending, startTransition] = useTransition();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const tempIdCounter = useRef(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      setError(t('pleaseSignIn'));
      return;
    }

    if (!isValidTag(input)) {
      setError(t('tagValidation'));
      return;
    }

    const normalized = normalizeTag(input);

    // Check if tag already exists locally
    if (tags.some(tag => tag.tagText.toLowerCase() === normalized.toLowerCase())) {
      setError(t('tagAlreadyExists'));
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

  if (!userId) {
    return (
      <div className="mt-4 text-sm" style={{ color: 'rgba(0,0,0,0.5)' }}>
        {t('signInToTag')}
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
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-gray-100"
              style={{ color: 'var(--foreground)' }}
            >
              <span>#{tag.tagText}</span>
              
              {/* Toggle visibility button */}
              <TagToggleButton
                tagId={tag.id}
                isPublic={tag.isPublic}
                onToggle={(newIsPublic) => {
                  setTags(prev => prev.map(t =>
                    t.id === tag.id ? { ...t, isPublic: newIsPublic } : t
                  ));
                }}
              />

              {/* Delete button */}
              <button
                onClick={() => handleDelete(tag.id)}
                className="hover:text-red-600 hover:scale-110 font-bold transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isPending}
                aria-label={`Delete tag ${tag.tagText}`}
                title="Delete tag"
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
