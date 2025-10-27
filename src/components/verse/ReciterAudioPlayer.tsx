'use client';

import { useState, useEffect } from 'react';
import { ChapterAudioPlayer } from './ChapterAudioPlayer';
import { getRecitationsAction, getChapterAudioAction } from '@/lib/actions/audio-actions';

interface ReciterAudioPlayerProps {
  readonly chapterId: number;
  readonly totalVerses: number;
  readonly initialAudioUrl: string;
  readonly initialTimestamps: Array<{ 
    verse_key: string; 
    timestamp_from: number; 
    timestamp_to: number;
  }>;
}

interface Recitation {
  id: number;
  reciter_name: string;
  style?: string;
}

export function ReciterAudioPlayer({ 
  chapterId,
  totalVerses, 
  initialAudioUrl, 
  initialTimestamps 
}: ReciterAudioPlayerProps) {
  const [reciters, setReciters] = useState<Recitation[]>([]);
  const [currentReciterId, setCurrentReciterId] = useState(7); // Default: Alafasy
  const [audioUrl, setAudioUrl] = useState(initialAudioUrl);
  const [timestamps, setTimestamps] = useState(initialTimestamps);
  const [isLoading, setIsLoading] = useState(false);

  // Debug: Log initial timestamps
  useEffect(() => {
    console.log('ReciterAudioPlayer mounted', {
      chapterId,
      totalVerses,
      initialTimestampsLength: initialTimestamps.length,
      timestampsLength: timestamps.length,
      firstTimestamp: initialTimestamps[0],
    });
  }, [chapterId, totalVerses, initialTimestamps, timestamps.length]);

  // Sync timestamps when initialTimestamps changes
  useEffect(() => {
    if (initialTimestamps && initialTimestamps.length > 0) {
      console.log('Setting timestamps from initialTimestamps', { length: initialTimestamps.length });
      setTimestamps(initialTimestamps);
    }
  }, [initialTimestamps]);

  // Fetch available reciters on mount
  useEffect(() => {
    const fetchReciters = async () => {
      try {
        const recitations = await getRecitationsAction('en');
        console.log('Fetched recitations:', recitations);
        setReciters(recitations.recitations || []);
      } catch (error) {
        console.error('Failed to fetch reciters:', error);
        // Fallback to default reciter
        setReciters([{ id: 7, reciter_name: 'Mishari Rashid al-`Afasy' }]);
      }
    };
    
    fetchReciters();
  }, []);

  // Handle reciter change
  const handleReciterChange = async (reciterId: number) => {
    if (reciterId === currentReciterId) return;
    
    const previousReciterId = currentReciterId; // Store for rollback
    setIsLoading(true);
    setCurrentReciterId(reciterId);

    try {
      const audioData = await getChapterAudioAction(reciterId, chapterId);
      
      if (audioData.audio_file?.audio_url) {
        setAudioUrl(audioData.audio_file.audio_url);
        setTimestamps(audioData.audio_file.timestamps || []);
      }
    } catch (error) {
      console.error('Failed to load reciter audio:', error);
      // Revert to previous reciter on error
      setCurrentReciterId(previousReciterId);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
          <div className="text-blue-600 font-medium">Loading reciter...</div>
        </div>
      )}
      
      <ChapterAudioPlayer
        totalVerses={totalVerses}
        audioUrl={audioUrl}
        timestamps={timestamps}
        reciters={reciters}
        currentReciterId={currentReciterId}
        onReciterChange={handleReciterChange}
      />
    </div>
  );
}
