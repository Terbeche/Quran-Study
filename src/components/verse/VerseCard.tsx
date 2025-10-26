'use client';

import type { Verse } from '@/types/verse';
import { useState, useRef } from 'react';

interface VerseCardProps {
  readonly verse: Verse;
  readonly audioUrl?: string;
}

export function VerseCard({ verse, audioUrl }: VerseCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPause = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const getButtonLabel = () => {
    if (!audioUrl) return '🔇 No Audio';
    return isPlaying ? '⏸️ Pause' : '▶️ Play';
  };

  return (
    <div className="bg-white border rounded-lg p-6 mb-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-gray-700">
          {verse.verse_key}
        </div>
        
        {/* Audio Player */}
        <button
          onClick={handlePlayPause}
          disabled={!audioUrl}
          className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {getButtonLabel()}
        </button>
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
          >
            <track kind="captions" />
          </audio>
        )}
      </div>
      
      <div className="text-2xl font-arabic text-right mb-4 leading-loose text-gray-900">
        {verse.text_uthmani}
      </div>
      
      {verse.translations?.[0] && (
        <div className="text-gray-700">
          {verse.translations[0].text}
        </div>
      )}
    </div>
  );
}
