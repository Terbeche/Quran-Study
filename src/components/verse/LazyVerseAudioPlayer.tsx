'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { globalAudioManager } from '@/lib/audioManager';
import { useReciter } from '@/contexts/ReciterContext';

interface LazyVerseAudioPlayerProps {
  readonly verseKey: string;
}

export function LazyVerseAudioPlayer({ verseKey }: LazyVerseAudioPlayerProps) {
  const { currentReciterId } = useReciter();
  const t = useTranslations('verse');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch audio URL only when user wants to play
  const fetchAudioUrl = useCallback(async () => {
    setIsLoading(true);
    setError(false);

    try {
      // Extract chapter and verse from verse_key (e.g., "2:255" -> chapter=2, verse=255)
      const [chapterId, verseNumber] = verseKey.split(':').map(Number);
      
      // Fetch just this single verse's audio with current reciter
      const response = await fetch(`/api/verse-audio?chapter=${chapterId}&verse=${verseNumber}&reciter=${currentReciterId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch audio');
      }

      const data = await response.json();
      
      if (data.audioUrl) {
        setAudioUrl(data.audioUrl);
      } else {
        throw new Error('Audio URL not found');
      }
    } catch (err) {
      console.error('Error fetching verse audio:', err);
      setError(true);
      setIsLoading(false);
    }
  }, [verseKey, currentReciterId]);

  // Stable pause function that the audio manager can call
  const pauseAudioCallback = useRef(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  });

  // Cleanup on unmount
  useEffect(() => {
    const cleanup = () => {
      globalAudioManager.unregister(pauseAudioCallback.current);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
    
    return cleanup;
  }, []);

  // Reload audio when reciter changes
  useEffect(() => {
    // If audio was loaded and reciter changed, reload it
    if (audioUrl) {
      setAudioUrl(null); // Reset URL to force reload
      if (isPlaying) {
        // If was playing, reload and auto-play
        setShouldAutoPlay(true);
        fetchAudioUrl();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentReciterId]);

  // Auto-play after audio URL is loaded (only if user clicked play)
  useEffect(() => {
    if (audioUrl && audioRef.current && shouldAutoPlay) {
      setShouldAutoPlay(false);
      setIsLoading(false);
      
      // Register with global audio manager to pause other playing audio
      globalAudioManager.register(pauseAudioCallback.current);
      
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error('Auto-play failed:', err);
        setIsPlaying(false);
        setError(true);
      });
    }
  }, [audioUrl, shouldAutoPlay]);

  const handlePlayPause = async () => {
    // If no audio URL yet or loading, fetch it first
    if ((!audioUrl || isLoading) && !error) {
      setShouldAutoPlay(true);
      await fetchAudioUrl();
      return;
    }

    // If audio URL exists, play/pause
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Register with global audio manager before playing
        globalAudioManager.register(pauseAudioCallback.current);
        audioRef.current.play().catch((err) => {
          console.error('Play failed:', err);
          setError(true);
          setIsPlaying(false);
        });
      }
    }
  };

  if (error) {
    return (
      <button
        disabled
        className="px-3 py-1 rounded-md text-sm opacity-50 cursor-not-allowed"
        style={{ 
          background: 'rgba(239, 68, 68, 0.1)',
          color: 'var(--error-text)'
        }}
        title={t('audioUnavailable')}
      >
        🔇 {t('audioError')}
      </button>
    );
  }

  // Compute button text and title
  let buttonText = `▶️ ${t('play')}`;
  let buttonTitle = t('playAudio');
  
  if (isLoading) {
    buttonText = '⏳ Loading...';
    buttonTitle = t('loadingAudio');
  } else if (isPlaying) {
    buttonText = `⏸️ ${t('pause')}`;
    buttonTitle = t('pauseAudio');
  }

  return (
    <>
      <button
        onClick={handlePlayPause}
        disabled={isLoading}
        className="px-3 py-1 rounded-md text-sm transition-all hover:shadow-sm cursor-pointer hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
        style={{ 
          background: isPlaying ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
          color: 'var(--dark-green)'
        }}
        aria-label={isPlaying ? t('pause') : t('play')}
        title={buttonTitle}
      >
        {buttonText}
      </button>
      
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => {
            setIsPlaying(false);
            globalAudioManager.unregister(pauseAudioCallback.current);
          }}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          preload="none"
          loop={false}
        >
          <track kind="captions" />
        </audio>
      )}
    </>
  );
}
