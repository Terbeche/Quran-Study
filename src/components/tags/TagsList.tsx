'use client';

import { useOptimistic, useTransition, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import TagToggleButton from '@/components/tags/TagToggleButton';
import { deleteTagWithRevalidationAction, toggleTagVisibilityWithRevalidationAction } from '@/actions/tag-actions';
import type { Tag } from '@/types/tag';

interface TagsListProps {
  readonly initialTags: Tag[];
  readonly translations: {
    verseCountSingular: string;
    verseCountPlural: string;
    verse: string;
    searchThisTag: string;
    delete: string;
  };
}

type OptimisticAction = 
  | { type: 'delete'; tagId: string }
  | { type: 'toggle'; tagId: string; isPublic: boolean };

export default function TagsList({ initialTags, translations }: TagsListProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticTags, updateOptimisticTags] = useOptimistic<Tag[], OptimisticAction>(
    initialTags,
    (state, action) => {
      switch (action.type) {
        case 'delete':
          return state.filter(tag => tag.id !== action.tagId);
        case 'toggle':
          return state.map(tag =>
            tag.id === action.tagId ? { ...tag, isPublic: action.isPublic } : tag
          );
        default:
          return state;
      }
    }
  );

  // Listen for tag changes from other components (verse cards)
  useEffect(() => {
    const handleTagVisibilityChanged = (event: Event) => {
      const customEvent = event as CustomEvent<{ tagId: string; isPublic: boolean }>;
      if (customEvent.detail) {
        updateOptimisticTags({ 
          type: 'toggle', 
          tagId: customEvent.detail.tagId, 
          isPublic: customEvent.detail.isPublic 
        });
      }
    };

    const handleTagDeleted = (event: Event) => {
      const customEvent = event as CustomEvent<{ tagId: string }>;
      if (customEvent.detail) {
        updateOptimisticTags({ 
          type: 'delete', 
          tagId: customEvent.detail.tagId 
        });
      }
    };

    globalThis.addEventListener('tag-visibility-changed', handleTagVisibilityChanged);
    globalThis.addEventListener('tag-deleted', handleTagDeleted);
    
    return () => {
      globalThis.removeEventListener('tag-visibility-changed', handleTagVisibilityChanged);
      globalThis.removeEventListener('tag-deleted', handleTagDeleted);
    };
  }, [updateOptimisticTags]);

  const handleDelete = (tagId: string) => {
    startTransition(async () => {
      // Optimistically remove the tag
      updateOptimisticTags({ type: 'delete', tagId });
      
      // Call server action with revalidation
      await deleteTagWithRevalidationAction(tagId);
    });
  };

  const handleToggle = (tagId: string, newIsPublic: boolean) => {
    startTransition(async () => {
      // Optimistically update the tag
      updateOptimisticTags({ type: 'toggle', tagId, isPublic: newIsPublic });
      
      // Call server action with revalidation
      await toggleTagVisibilityWithRevalidationAction(tagId, newIsPublic);
    });
  };

  // Group by tag text
  const groupedTags = optimisticTags.reduce((acc, tag) => {
    if (!acc[tag.tagText]) {
      acc[tag.tagText] = [];
    }
    acc[tag.tagText].push(tag);
    return acc;
  }, {} as Record<string, Tag[]>);

  if (Object.keys(groupedTags).length === 0) {
    return null;
  }

  return (
    <>
      {Object.entries(groupedTags).map(([tagText, tagList]) => (
        <div key={tagText} className="mb-6 card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-accent">
              <Link 
                href={`/search?q=${encodeURIComponent(tagText)}&type=tag`}
                className="hover:underline"
                title="Search verses with this tag"
              >
                #{tagText}
              </Link>
              {' '}
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                ({tagList.length === 1 
                  ? translations.verseCountSingular
                  : translations.verseCountPlural.replace('0', tagList.length.toString())})
              </span>
            </h2>
            <Link
              href={`/search?q=${encodeURIComponent(tagText)}&type=tag`}
              className="text-sm link"
            >
              {translations.searchThisTag} →
            </Link>
          </div>
          <div className="space-y-2">
            {tagList.map((tag) => {
              const [chapterId, verseNumber] = tag.verseKey.split(':');
              return (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-3 rounded transition-all"
                  style={{ background: 'var(--input-bg)' }}
                >
                  <Link
                    href={`/surah/${chapterId}#verse-${verseNumber}`}
                    className="link font-medium"
                  >
                    {translations.verse} {tag.verseKey}
                  </Link>
                  
                  <div className="flex items-center gap-2">
                    <TagToggleButton 
                      tagId={tag.id} 
                      isPublic={tag.isPublic}
                      onToggle={(newIsPublic) => handleToggle(tag.id, newIsPublic)}
                    />
                    <button
                      onClick={() => handleDelete(tag.id)}
                      disabled={isPending}
                      className="px-3 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer hover:shadow-sm"
                      title="Delete tag"
                    >
                      {translations.delete}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
