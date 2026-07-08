/**
 * Sound Effects Library
 * Manages audio playback for game interactions
 */

type SoundType =
  | "pet"
  | "feed"
  | "levelup"
  | "achievement"
  | "scan"
  | "error"
  | "success"
  | "click"
  | "notification"
  | "milestone";

interface SoundConfig {
  volume: number;
  playbackRate?: number;
}

class SoundManager {
  private sounds: Map<SoundType, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeSounds();
      this.loadSettings();
    }
  }

  /**
   * Initialize Web Audio API sounds with oscillators for pixel-style sounds
   */
  private initializeSounds() {
    // We'll use the Web Audio API to generate retro 8-bit style sounds
    // These are procedurally generated, no external files needed
  }

  /**
   * Load sound preferences from localStorage
   */
  private loadSettings() {
    try {
      const savedEnabled = localStorage.getItem("soundEnabled");
      const savedVolume = localStorage.getItem("soundVolume");
      
      if (savedEnabled !== null) {
        this.enabled = savedEnabled === "true";
      }
      if (savedVolume !== null) {
        this.volume = parseFloat(savedVolume);
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  /**
   * Play a sound effect
   */
  play(type: SoundType, config?: Partial<SoundConfig>) {
    if (!this.enabled || typeof window === "undefined" || !navigator.userActivation?.hasBeenActive) return;

    try {
      const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const audioContext = new AudioCtx();
      const volume = config?.volume ?? this.volume;

      switch (type) {
        case "pet":
          this.playPetSound(audioContext, volume);
          break;
        case "feed":
          this.playFeedSound(audioContext, volume);
          break;
        case "levelup":
          this.playLevelUpSound(audioContext, volume);
          break;
        case "achievement":
          this.playAchievementSound(audioContext, volume);
          break;
        case "scan":
          this.playScanSound(audioContext, volume);
          break;
        case "error":
          this.playErrorSound(audioContext, volume);
          break;
        case "success":
          this.playSuccessSound(audioContext, volume);
          break;
        case "click":
          this.playClickSound(audioContext, volume);
          break;
        case "notification":
          this.playNotificationSound(audioContext, volume);
          break;
        case "milestone":
          this.playMilestoneSound(audioContext, volume);
          break;
      }
    } catch (e) {
      console.warn("Sound playback failed:", e);
    }
  }

  /**
   * Pet sound - cute short beep
   */
  private playPetSound(context: AudioContext, volume: number) {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.frequency.setValueAtTime(800, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, context.currentTime + 0.1);

    gainNode.gain.setValueAtTime(volume * 0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.15);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.15);
  }

  /**
   * Feed sound - munching effect
   */
  private playFeedSound(context: AudioContext, volume: number) {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(400, context.currentTime);
    oscillator.frequency.setValueAtTime(300, context.currentTime + 0.05);
    oscillator.frequency.setValueAtTime(400, context.currentTime + 0.1);

    gainNode.gain.setValueAtTime(volume * 0.2, context.currentTime);
    gainNode.gain.setValueAtTime(0.01, context.currentTime + 0.15);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.15);
  }

  /**
   * Level up sound - ascending arpeggio
   */
  private playLevelUpSound(context: AudioContext, volume: number) {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, index) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.setValueAtTime(freq, context.currentTime + index * 0.1);
      gainNode.gain.setValueAtTime(volume * 0.3, context.currentTime + index * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + index * 0.1 + 0.2);

      oscillator.start(context.currentTime + index * 0.1);
      oscillator.stop(context.currentTime + index * 0.1 + 0.2);
    });
  }

  /**
   * Achievement sound - fanfare
   */
  private playAchievementSound(context: AudioContext, volume: number) {
    const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50];
    
    notes.forEach((freq, index) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(freq, context.currentTime + index * 0.08);
      gainNode.gain.setValueAtTime(volume * 0.25, context.currentTime + index * 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + index * 0.08 + 0.15);

      oscillator.start(context.currentTime + index * 0.08);
      oscillator.stop(context.currentTime + index * 0.08 + 0.15);
    });
  }

  /**
   * Scan sound - beep beep
   */
  private playScanSound(context: AudioContext, volume: number) {
    [0, 0.15].forEach((delay) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.setValueAtTime(1000, context.currentTime + delay);
      gainNode.gain.setValueAtTime(volume * 0.3, context.currentTime + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + delay + 0.1);

      oscillator.start(context.currentTime + delay);
      oscillator.stop(context.currentTime + delay + 0.1);
    });
  }

  /**
   * Error sound - descending tone
   */
  private playErrorSound(context: AudioContext, volume: number) {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(400, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, context.currentTime + 0.2);

    gainNode.gain.setValueAtTime(volume * 0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.2);
  }

  /**
   * Success sound - positive chime
   */
  private playSuccessSound(context: AudioContext, volume: number) {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.frequency.setValueAtTime(600, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(900, context.currentTime + 0.15);

    gainNode.gain.setValueAtTime(volume * 0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.2);
  }

  /**
   * Click sound - short blip
   */
  private playClickSound(context: AudioContext, volume: number) {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.frequency.setValueAtTime(800, context.currentTime);
    gainNode.gain.setValueAtTime(volume * 0.2, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.05);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.05);
  }

  /**
   * Notification sound - attention grabber
   */
  private playNotificationSound(context: AudioContext, volume: number) {
    [800, 1000].forEach((freq, index) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.setValueAtTime(freq, context.currentTime + index * 0.1);
      gainNode.gain.setValueAtTime(volume * 0.25, context.currentTime + index * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + index * 0.1 + 0.15);

      oscillator.start(context.currentTime + index * 0.1);
      oscillator.stop(context.currentTime + index * 0.1 + 0.15);
    });
  }

  /**
   * Milestone sound - triumphant
   */
  private playMilestoneSound(context: AudioContext, volume: number) {
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    
    notes.forEach((freq, index) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(freq, context.currentTime + index * 0.12);
      gainNode.gain.setValueAtTime(volume * 0.3, context.currentTime + index * 0.12);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + index * 0.12 + 0.3);

      oscillator.start(context.currentTime + index * 0.12);
      oscillator.stop(context.currentTime + index * 0.12 + 0.3);
    });
  }

  /**
   * Enable/disable sounds
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    try {
      localStorage.setItem("soundEnabled", String(enabled));
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  /**
   * Set master volume (0-1)
   */
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    try {
      localStorage.setItem("soundVolume", String(this.volume));
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  /**
   * Get current enabled state
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.volume;
  }
}

// Export singleton instance
export const sounds = new SoundManager();

// Convenience functions
export const playSound = (type: SoundType, config?: Partial<SoundConfig>) => {
  sounds.play(type, config);
};

export const toggleSounds = () => {
  sounds.setEnabled(!sounds.isEnabled());
  return sounds.isEnabled();
};

export const setSoundVolume = (volume: number) => {
  sounds.setVolume(volume);
};
