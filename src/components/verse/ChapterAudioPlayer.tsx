'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

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
  readonly onReciterChange?: (reciterId: number) => void;
}

export function ChapterAudioPlayer({ 
  totalVerses, 
  audioUrl, 
  timestamps, 
  reciters = [],
  currentReciterId,
  onReciterChange 
}: ChapterAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerse, setCurrentVerse] = useState(1);
  const [loopMode, setLoopMode] = useState<'off' | 'verse' | 'chapter'>('off');
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPause = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
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
      
    // Jump to next verse timestamp (convert ms to seconds)
    audioRef.current.currentTime = nextTimestamp.timestamp_from / 1000;
    setCurrentVerse(currentVerse + 1);
    
    if (!isPlaying) {
      audioRef.current.play().catch(console.error);
    }
  }, [audioRef, currentVerse, totalVerses, timestamps, isPlaying]);

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
    
    console.log('Jumping to previous verse', { from: currentVerse, to: currentVerse - 1, timestamp: prevTimestamp.timestamp_from / 1000 });
    
    // Jump to previous verse timestamp (convert ms to seconds)
    audioRef.current.currentTime = prevTimestamp.timestamp_from / 1000;
    setCurrentVerse(currentVerse - 1);
    
    if (!isPlaying) {
      audioRef.current.play().catch(console.error);
    }
  }, [audioRef, currentVerse, timestamps, isPlaying]);

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
                audioRef.current.currentTime = timestamps[targetVerse - 1].timestamp_from / 1000;
                setCurrentVerse(targetVerse);
                if (!isPlaying) {
                  audioRef.current.play().catch(console.error);
                }
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
        audioRef.current.play().catch(console.error);
      }
    } else if (loopMode === 'verse' && currentVerse < totalVerses) {
      // Move to next verse when in verse loop mode
      handleNext();
    } else {
      // No loop - stop at end
      setIsPlaying(false);
      setCurrentVerse(1);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    }
  }, [loopMode, currentVerse, totalVerses, handleNext]);

  return (
    <div className="sticky top-4 bg-white border-2 border-blue-200 rounded-lg p-6 shadow-lg mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg mb-1 text-gray-900">Chapter Audio Player</h3>
          <p className="text-sm text-gray-700">Verse {currentVerse} of {totalVerses}</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentVerse === 1}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
            aria-label="Previous verse"
          >
            ⏮️ Prev
          </button>
          
          <button
            onClick={handlePlayPause}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play Chapter'}
          </button>
          
          <button
            onClick={handleNext}
            disabled={currentVerse === totalVerses}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
            aria-label="Next verse"
          >
            Next ⏭️
          </button>
        </div>
      </div>

            {/* Speed and Loop Controls */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200 flex-wrap">
        {/* Reciter Selector */}
        {reciters.length > 0 && onReciterChange && (
          <div className="flex items-center gap-2">
            <label htmlFor="reciter-select" className="text-sm font-medium text-gray-700">
              Reciter:
            </label>
            <select
              id="reciter-select"
              value={currentReciterId || 7}
              onChange={(e) => onReciterChange(Number(e.target.value))}
              className="px-2 py-1 border rounded text-sm text-gray-900 bg-white"
            >
              {reciters.map((reciter) => (
                <option key={reciter.id} value={reciter.id}>
                  {reciter.reciter_name} {reciter.style ? `(${reciter.style})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-2">
          <label htmlFor="loop-mode" className="text-sm font-medium text-gray-700">
            Loop:
          </label>
          <select
            id="loop-mode"
            value={loopMode}
            onChange={(e) => setLoopMode(e.target.value as 'off' | 'verse' | 'chapter')}
            className="px-2 py-1 border rounded text-sm text-gray-900 bg-white"
          >
            <option value="off">Off</option>
            <option value="verse">Current Verse</option>
            <option value="chapter">Entire Chapter</option>
          </select>
        </div>

        <div className="text-xs text-gray-500 ml-auto">
          ⌨️ Space: Play/Pause | ←→: Prev/Next | 1-9: Jump forward N verses
        </div>
      </div>

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
      
      {/* Progress bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentVerse / totalVerses) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
