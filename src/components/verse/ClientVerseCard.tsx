'use client';

import type { Verse } from '@/types/verse';
import type { Collection } from '@/types/collection';
import { LazyVerseAudioPlayer } from './LazyVerseAudioPlayer';
import TagInput from './TagInput';
import AddToCollectionButton from '@/components/collections/AddToCollectionButton';
import CommunityTagsPreview from './CommunityTagsPreview';
import { VerseCollectionBadgesClient } from './VerseCollectionBadgesClient';
import { useEffect, useState } from 'react';
import type { Tag } from '@/types/tag';

interface ClientVerseCardProps {
  readonly verse: Verse;
  readonly userId?: string;
  readonly userCollections?: Collection[];
  readonly showTags?: boolean;
}

interface VerseCollection {
  id: string;
  name: string;
}

/**
 * Client-side version of VerseCard for dynamically loaded verses
 * Supports tags, collections, and audio - just like server-rendered verses
 */
export function ClientVerseCard({ 
  verse, 
  userId,
  userCollections = [],
  showTags = true 
}: ClientVerseCardProps) {
  const [userTags, setUserTags] = useState<Tag[]>([]);
  const [verseCollections, setVerseCollections] = useState<VerseCollection[]>([]);

  // Fetch user's tags for this verse
  useEffect(() => {
    if (userId && showTags) {
      fetch(`/api/tags?verseKey=${verse.verse_key}&userId=${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.tags) {
            setUserTags(data.tags);
          }
        })
        .catch(err => console.error('Failed to load tags for verse:', err));
    }
  }, [verse.verse_key, userId, showTags]);

  // Fetch collections that contain this verse (for VerseCollectionBadgesClient)
  useEffect(() => {
    if (userId) {
      fetch(`/api/verse-collections?verseKey=${verse.verse_key}&userId=${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.collections) {
            setVerseCollections(data.collections);
          }
        })
        .catch(err => console.error('Error loading verse collections:', err));
    }
  }, [verse.verse_key, userId]);

  return (
    <div id={`verse-${verse.verse_number}`} className="card card-hover animate-fade-in scroll-mt-20">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          {verse.verse_key}
        </div>
        
        {/* Lazy Audio Player - loads audio only when user clicks play */}
        <LazyVerseAudioPlayer verseKey={verse.verse_key} />
      </div>
      
      <div className="text-2xl font-arabic text-right mb-4 leading-loose text-accent">
        {verse.text_uthmani}
      </div>
      
      {verse.translations?.[0] && (
        <div style={{ color: 'var(--foreground)' }}>
          {verse.translations[0].text}
        </div>
      )}

      {/* Tag input */}
      {showTags && (
        <>
          <TagInput
            verseKey={verse.verse_key}
            initialTags={userTags}
            userId={userId}
          />
          
          {/* Add to Collection button */}
          {userCollections.length > 0 && (
            <div className="mt-3">
              <AddToCollectionButton
                verseKey={verse.verse_key}
                collections={userCollections}
              />
            </div>
          )}
        </>
      )}

      {/* Community tags preview */}
      <CommunityTagsPreview verseKey={verse.verse_key} />

      {/* Collection badges */}
      <VerseCollectionBadgesClient
        verseKey={verse.verse_key}
        initialCollections={verseCollections}
      />
    </div>
  );
}
