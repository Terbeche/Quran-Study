'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';

interface VerseAudioPlayerProps {
  readonly audioUrl: string;
}

export default function VerseAudioPlayer({ audioUrl }: VerseAudioPlayerProps) {
  const t = useTranslations('verse');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <>
      <button
        onClick={handlePlayPause}
        className="px-3 py-1 rounded-md text-sm transition-all hover:shadow-sm cursor-pointer hover:scale-105"
        style={{ 
          background: isPlaying ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
          color: 'var(--dark-green)'
        }}
        aria-label={isPlaying ? t('pause') : t('play')}
        title={isPlaying ? t('pauseAudio') : t('playAudio')}
      >
        {isPlaying ? `⏸️ ${t('pause')}` : `▶️ ${t('play')}`}
      </button>
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      >
        <track kind="captions" />
      </audio>
    </>
  );
}
