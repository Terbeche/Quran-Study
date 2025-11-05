'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { globalAudioManager } from '@/lib/audioManager';

interface ChapterAudioPlayerProps {
  readonly totalVerses: number;
  readonly audioUrl: string;
  readonly timestamps: Array<{ 
    verse_key: string; 
    timestamp_from: number; 
    timestamp_to: number;
  }>;
  readonly reciters?: Array<{
    id: number;
    reciter_name: string;
    style?: string;
  }>;
  readonly currentReciterId?: number;
  readonly onReciterChange?: (reciterId: number, currentVerse?: number) => void;
}

export function ChapterAudioPlayer({ 
  totalVerses, 
  audioUrl, 
  timestamps, 
  reciters = [],
  currentReciterId,
  onReciterChange 
}: ChapterAudioPlayerProps) {
  const t = useTranslations('chapter.audioPlayer');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerse, setCurrentVerse] = useState(1);
  const [loopMode, setLoopMode] = useState<'off' | 'verse' | 'chapter'>('off');
  const audioRef = useRef<HTMLAudioElement>(null);
  const wasPlayingBeforeReciterChange = useRef(false);
  const previousAudioUrl = useRef(audioUrl);

  // Create a stable pause function that the audio manager can call
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

  // Handle reciter change (when audioUrl changes)
  useEffect(() => {
    if (!audioRef.current) return;
    
    // Check if audioUrl actually changed (reciter switch)
    if (previousAudioUrl.current !== audioUrl) {  
      // Store playing state
      wasPlayingBeforeReciterChange.current = isPlaying;
      
      // Load new audio
      audioRef.current.load();
      
      // Wait for metadata to be loaded, then seek to current verse
      const handleMetadataLoaded = () => {
        if (!audioRef.current || timestamps.length === 0) return;
        
        const timestamp = timestamps[currentVerse - 1];
        if (timestamp) {
          audioRef.current.currentTime = timestamp.timestamp_from / 1000;
          
          // Resume playing if it was playing before
          if (wasPlayingBeforeReciterChange.current) {
            globalAudioManager.register(pauseAudioCallback.current);
            audioRef.current.play().catch(console.error);
          }
        }
      };
      
      audioRef.current.addEventListener('loadedmetadata', handleMetadataLoaded, { once: true });
      
      // Update ref
      previousAudioUrl.current = audioUrl;
    }
  }, [audioUrl, currentVerse, timestamps, isPlaying]);

  const handlePlayPause = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Register with global audio manager to pause any playing verse audio
        globalAudioManager.register(pauseAudioCallback.current);
        audioRef.current.play().catch((error) => {
          console.error('Failed to play audio:', error);
        });
      }
    }
  }, [isPlaying]);

  const handleNext = useCallback(() => {
    if (!audioRef.current) return;
    
    // Can we go to next verse?
    if (currentVerse >= totalVerses) {
      console.log('Already at last verse');
      return;
    }
    
    // Get the next verse timestamp (currentVerse is 1-based, array is 0-based)
    const nextVerseIndex = currentVerse;
    const nextTimestamp = timestamps[nextVerseIndex];
    
    if (!nextTimestamp) {
      console.log('No timestamp found for next verse', { currentVerse, nextVerseIndex, timestampsLength: timestamps.length });
      return;
    }
    
    const newVerseNumber = currentVerse + 1;
      
    // Update verse number first
    setCurrentVerse(newVerseNumber);
    
    // Then jump to next verse timestamp (convert ms to seconds)
    // Use a slight delay to ensure state updates first
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = nextTimestamp.timestamp_from / 1000;
        
        // Resume playing if it was already playing
        if (isPlaying && audioRef.current.paused) {
          audioRef.current.play().catch(console.error);
        }
      }
    }, 0);
  }, [currentVerse, totalVerses, timestamps, isPlaying]);

  const handlePrevious = useCallback(() => {
    if (!audioRef.current) return;
    
    // Can we go to previous verse?
    if (currentVerse <= 1) {
      console.log('Already at first verse');
      return;
    }
    
    // Get the previous verse timestamp (currentVerse is 1-based, array is 0-based)
    const prevVerseIndex = currentVerse - 2;
    const prevTimestamp = timestamps[prevVerseIndex];
    
    if (!prevTimestamp) {
      console.log('No timestamp found for previous verse', { currentVerse, prevVerseIndex, timestampsLength: timestamps.length });
      return;
    }
    
    const newVerseNumber = currentVerse - 1;
    
    // Update verse number first
    setCurrentVerse(newVerseNumber);
    
    // Then jump to previous verse timestamp (convert ms to seconds)
    // Use a slight delay to ensure state updates first
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = prevTimestamp.timestamp_from / 1000;
        
        // Resume playing if it was already playing
        if (isPlaying && audioRef.current.paused) {
          audioRef.current.play().catch(console.error);
        }
      }
    }, 0);
  }, [currentVerse, timestamps, isPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        default:
          // Handle number keys 0-9 for jumping forward by N verses
          if (e.key >= '1' && e.key <= '9') {
            e.preventDefault();
            
            const jumpCount = Number.parseInt(e.key, 10);
            const targetVerse = currentVerse + jumpCount;
            
            if (targetVerse <= totalVerses && timestamps[targetVerse - 1]) {
              if (audioRef.current) {
                console.log(`Jumping forward by ${jumpCount} verses from ${currentVerse} to ${targetVerse}`);
                
                // Update verse number first
                setCurrentVerse(targetVerse);
                
                // Then update audio position with slight delay
                setTimeout(() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = timestamps[targetVerse - 1].timestamp_from / 1000;
                    
                    // Resume playing if it was already playing
                    if (isPlaying && audioRef.current.paused) {
                      audioRef.current.play().catch(console.error);
                    }
                  }
                }, 0);
              }
            }
          }
      }
    };

    globalThis.addEventListener('keydown', handleKeyPress);
    return () => globalThis.removeEventListener('keydown', handleKeyPress);
  }, [handlePlayPause, handleNext, handlePrevious, totalVerses, timestamps, currentVerse, isPlaying]);

  // Update current verse based on playback position
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    
    // Only auto-update verse number when actually playing
    if (!isPlaying) return;
    
    const currentTimeMs = audioRef.current.currentTime * 1000;
    const currentTimestamp = timestamps[currentVerse - 1];
    
    // Handle verse loop mode
    if (loopMode === 'verse' && currentTimestamp && currentTimeMs >= currentTimestamp.timestamp_to - 50) {
      // Loop back slightly before the end to avoid playing next verse
      audioRef.current.currentTime = currentTimestamp.timestamp_from / 1000;
      return;
    }
    
    // Find which verse we're currently playing (only if not in verse loop mode)
    if (loopMode === 'verse') return;
    
    for (let i = 0; i < timestamps.length; i++) {
      const timestamp = timestamps[i];
      if (currentTimeMs >= timestamp.timestamp_from && currentTimeMs <= timestamp.timestamp_to) {
        if (currentVerse !== i + 1) {
          setCurrentVerse(i + 1);
        }
        break;
      }
    }
  };

  const handleEnded = useCallback(() => {
    if (loopMode === 'chapter') {
      // Loop entire chapter
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        setCurrentVerse(1);
        globalAudioManager.register(pauseAudioCallback.current);
        audioRef.current.play().catch(console.error);
      }
    } else if (loopMode === 'verse' && currentVerse < totalVerses) {
      // Move to next verse when in verse loop mode
      handleNext();
    } else {
      // No loop - stop at end
      setIsPlaying(false);
      setCurrentVerse(1);
      globalAudioManager.unregister(pauseAudioCallback.current);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    }
  }, [loopMode, currentVerse, totalVerses, handleNext]);

  return (
    <div className="sticky top-20 glass rounded-2xl p-6 shadow-2xl mb-8 animate-fade-in border border-emerald-100">
      {/* Header with Verse Info */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-2xl">🎵</span>
          </div>
          <div>
            <h3 className="font-bold text-xl" style={{ color: 'var(--foreground)' }}>{t('title')}</h3>
            <p className="text-sm font-medium" style={{ color: 'var(--primary-green)' }}>
              {t('currentVerse', { current: currentVerse, total: totalVerses })}
            </p>
          </div>
        </div>
        
        {/* Audio Wave Visualization (when playing) */}
        {isPlaying && (
          <div className="flex items-center gap-1 h-10">
            <div className="w-1 bg-emerald-500 rounded-full audio-wave h-full" style={{ animationDelay: '0s' }} />
            <div className="w-1 bg-emerald-500 rounded-full audio-wave h-full" style={{ animationDelay: '0.1s' }} />
            <div className="w-1 bg-emerald-500 rounded-full audio-wave h-full" style={{ animationDelay: '0.2s' }} />
            <div className="w-1 bg-emerald-500 rounded-full audio-wave h-full" style={{ animationDelay: '0.3s' }} />
            <div className="w-1 bg-emerald-500 rounded-full audio-wave h-full" style={{ animationDelay: '0.4s' }} />
          </div>
        )}
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={handlePrevious}
          disabled={currentVerse === 1}
          className="w-12 h-12 rounded-full bg-emerald-50 hover:bg-emerald-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center text-emerald-600 hover:scale-110 disabled:hover:scale-100 cursor-pointer"
          aria-label={t('previous')}
          title={t('previousHint')}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
          </svg>
        </button>
        
        <button
          onClick={handlePlayPause}
          className={`w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 cursor-pointer ${
            isPlaying ? 'animate-pulse-glow' : ''
          }`}
          aria-label={isPlaying ? t('pause') : t('play')}
          title={isPlaying ? t('pauseHint') : t('playHint')}
        >
          {isPlaying ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        
        <button
          onClick={handleNext}
          disabled={currentVerse === totalVerses}
          className="w-12 h-12 rounded-full bg-emerald-50 hover:bg-emerald-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center text-emerald-600 hover:scale-110 disabled:hover:scale-100 cursor-pointer"
          aria-label={t('next')}
          title={t('nextHint')}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
          </svg>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-300 relative"
            style={{ width: `${(currentVerse / totalVerses) * 100}%` }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/40 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{t('verse')} {currentVerse}</span>
          <span>{t('totalVerses', { count: totalVerses })}</span>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex items-center gap-4 flex-wrap border-t border-emerald-100 pt-4">
        {/* Reciter Selector */}
        {reciters.length > 0 && onReciterChange && (
          <div className="flex items-center gap-2 bg-emerald-50 rounded-lg px-3 py-2 hover:bg-emerald-100 transition-all cursor-pointer hover:shadow-sm">
            <span className="text-emerald-700 text-xl">👤</span>
            <select
              id="reciter-select"
              value={currentReciterId || 7}
              onChange={(e) => onReciterChange(Number(e.target.value), currentVerse)}
              className="bg-transparent text-sm text-gray-700 font-medium border-none focus:outline-none cursor-pointer focus:ring-2 focus:ring-emerald-300 rounded"
              title={t('selectReciter')}
            >
              {reciters.map((reciter) => (
                <option key={reciter.id} value={reciter.id}>
                  {reciter.reciter_name} {reciter.style ? `(${reciter.style})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Loop Mode Selector */}
        <div className="flex items-center gap-2 bg-emerald-50 rounded-lg px-3 py-2 hover:bg-emerald-100 transition-all cursor-pointer hover:shadow-sm">
          <span className="text-emerald-700 text-xl">🔁</span>
          <select
            id="loop-mode"
            value={loopMode}
            onChange={(e) => setLoopMode(e.target.value as 'off' | 'verse' | 'chapter')}
            className="bg-transparent text-sm text-gray-700 font-medium border-none focus:outline-none cursor-pointer focus:ring-2 focus:ring-emerald-300 rounded"
            title={t('loopMode')}
          >
            <option value="off">{t('noLoop')}</option>
            <option value="verse">{t('loopVerse')}</option>
            <option value="chapter">{t('loopChapter')}</option>
          </select>
        </div>

        {/* Keyboard Shortcuts Info */}
        <div className="ml-auto hidden md:flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
          <span className="font-semibold text-emerald-600">⌨️</span>
          <div className="flex gap-3">
            <span className="font-mono">Space</span>
            <span className="font-mono">←→</span>
            <span className="font-mono">1-9</span>
          </div>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={handleEnded}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onTimeUpdate={handleTimeUpdate}
      >
        <track kind="captions" />
      </audio>
    </div>
  );
}
