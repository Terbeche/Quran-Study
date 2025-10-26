'use client';

import { useState, useRef } from 'react';

interface ChapterAudioPlayerProps {
  readonly totalVerses: number;
  readonly audioUrl: string;
  readonly timestamps: Array<{ 
    verse_key: string; 
    timestamp_from: number; 
    timestamp_to: number;
  }>;
}

export function ChapterAudioPlayer({ totalVerses, audioUrl, timestamps }: ChapterAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerse, setCurrentVerse] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((error) => {
          console.error('Failed to play audio:', error);
        });
      }
    }
  };

  const handleNext = () => {
    if (currentVerse < totalVerses && audioRef.current && timestamps[currentVerse]) {
      // Jump to next verse timestamp (convert ms to seconds)
      audioRef.current.currentTime = timestamps[currentVerse].timestamp_from / 1000;
      setCurrentVerse(currentVerse + 1);
    }
  };

  const handlePrevious = () => {
    if (currentVerse > 1 && audioRef.current && timestamps[currentVerse - 2]) {
      // Jump to previous verse timestamp (convert ms to seconds)
      audioRef.current.currentTime = timestamps[currentVerse - 2].timestamp_from / 1000;
      setCurrentVerse(currentVerse - 1);
    }
  };

  // Update current verse based on playback position
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    
    const currentTimeMs = audioRef.current.currentTime * 1000;
    
    // Find which verse we're currently playing
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

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentVerse(1);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <div className="sticky top-4 bg-white border-2 border-blue-200 rounded-lg p-6 shadow-lg mb-8">
      <div className="flex items-center justify-between">
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
