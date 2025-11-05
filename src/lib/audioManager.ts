/**
 * Global Audio Manager
 * Ensures only one verse audio plays at a time across the application
 */

type AudioPlayerCallback = () => void;

class GlobalAudioManager {
  private currentPlayingCallback: AudioPlayerCallback | null = null;

  /**
   * Register a new audio player
   * When a new player starts, it pauses any currently playing audio
   */
  register(callback: AudioPlayerCallback) {
    // Pause the currently playing audio (if any)
    if (this.currentPlayingCallback && this.currentPlayingCallback !== callback) {
      this.currentPlayingCallback();
    }
    // Set this as the current playing audio
    this.currentPlayingCallback = callback;
  }

  /**
   * Unregister when audio stops
   */
  unregister(callback: AudioPlayerCallback) {
    if (this.currentPlayingCallback === callback) {
      this.currentPlayingCallback = null;
    }
  }
}

// Singleton instance
export const globalAudioManager = new GlobalAudioManager();
