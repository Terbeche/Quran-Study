'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface Tag {
  id: string;
  tagText: string;
  votes: number;
}

interface CommunityTagsPreviewProps {
  readonly verseKey: string;
  readonly initialTags?: Tag[];
}

export default function CommunityTagsPreview({ verseKey, initialTags = [] }: CommunityTagsPreviewProps) {
  const t = useTranslations('verse');
  const [topTags, setTopTags] = useState<Tag[]>(initialTags);

  // Fetch community tags and listen for changes
  useEffect(() => {
    const fetchCommunityTags = () => {
      fetch(`/api/community-tags?verseKey=${verseKey}`)
        .then(res => res.json())
        .then(data => {
          if (data.tags) {
            setTopTags(data.tags);
          }
        })
        .catch(err => console.error('Failed to load community tags:', err));
    };

    // Initial fetch
    fetchCommunityTags();

    // Listen for tag visibility changes
    const handleTagVisibilityChanged = (event: Event) => {
      const customEvent = event as CustomEvent<{ verseKey: string; tagId: string; isPublic: boolean }>;
      if (customEvent.detail.verseKey === verseKey) {
        // Refetch community tags when a tag is made public/private
        fetchCommunityTags();
      }
    };

    globalThis.addEventListener('tag-visibility-changed', handleTagVisibilityChanged);
    return () => {
      globalThis.removeEventListener('tag-visibility-changed', handleTagVisibilityChanged);
    };
  }, [verseKey]);

  if (topTags.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--card-border)' }}>
      <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>{t('communityTags')}:</p>
      <div className="flex flex-wrap gap-2">
        {topTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
            style={{ background: 'rgba(147, 51, 234, 0.1)', color: 'var(--primary-green)' }}
          >
            #{tag.tagText}
            {tag.votes > 0 && (
              <span className="text-xs opacity-80">↑{tag.votes}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
