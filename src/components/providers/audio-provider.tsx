'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

export type BgmLoopMode = 'all' | 'bgm-1' | 'bgm-2' | 'bgm-3' | 'bgm-4';

export interface BgmTrack {
  id: string;
  name: string;
  label: string;
  src: string;
}

export const BGM_TRACKS: BgmTrack[] = [
  { id: 'bgm-1', name: 'Pufino - Soaked', label: 'Pufino - Soaked', src: '/audio/bgm-1.mp3' },
  { id: 'bgm-2', name: 'Nebulite - Kyoto', label: 'Nebulite - Kyoto', src: '/audio/bgm-2.mp3' },
  { id: 'bgm-3', name: 'Lukrembo - Bread', label: 'Lukrembo - Bread', src: '/audio/bgm-3.mp3' },
  { id: 'bgm-4', name: 'Massobeats - Honey Jam', label: 'Massobeats - Honey Jam', src: '/audio/bgm-4.mp3' },
];

export const LOOP_MODES: { id: BgmLoopMode; name: string; desc: string }[] = [
  { id: 'all', name: 'All Loop (Playlist)', desc: 'BGM 1 → 2 → 3 → 4 sequential continuous loop' },
  { id: 'bgm-1', name: 'BGM 1: Pufino - Soaked', desc: 'Loop Track 1 (Pufino - Soaked) continuously' },
  { id: 'bgm-2', name: 'BGM 2: Nebulite - Kyoto', desc: 'Loop Track 2 (Nebulite - Kyoto) continuously' },
  { id: 'bgm-3', name: 'BGM 3: Lukrembo - Bread', desc: 'Loop Track 3 (Lukrembo - Bread) continuously' },
  { id: 'bgm-4', name: 'BGM 4: Massobeats - Honey Jam', desc: 'Loop Track 4 (Massobeats - Honey Jam) continuously' },
];

interface AudioContextType {
  bgmEnabled: boolean;
  bgmVolume: number;
  isPlaying: boolean;
  loopMode: BgmLoopMode;
  currentTrackIndex: number;
  currentTrack: BgmTrack;
  tracks: BgmTrack[];
  toggleBgm: () => void;
  setBgmEnabled: (enabled: boolean) => void;
  setBgmVolume: (volume: number) => void;
  setLoopMode: (mode: BgmLoopMode) => void;
  selectTrack: (index: number) => void;
  unlockAndPlay: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

const STORAGE_KEY_ENABLED = 'scan_bgm_enabled';
const STORAGE_KEY_VOLUME = 'scan_bgm_volume';
const STORAGE_KEY_MODE = 'scan_bgm_mode';

// Global singleton audio instance to guarantee zero duplicate/overlapping tracks across re-renders
let globalAudioInstance: HTMLAudioElement | null = null;

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [bgmEnabled, setBgmEnabledState] = useState<boolean>(true);
  const [bgmVolume, setBgmVolumeState] = useState<number>(0.5);
  const [loopMode, setLoopModeState] = useState<BgmLoopMode>('all');
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loopModeRef = useRef<BgmLoopMode>('all');
  const currentTrackIndexRef = useRef<number>(0);
  const bgmEnabledRef = useRef<boolean>(true);
  const isUnlockedRef = useRef<boolean>(false);

  // Sync refs to avoid stale closures in event listeners
  useEffect(() => {
    loopModeRef.current = loopMode;
  }, [loopMode]);

  useEffect(() => {
    currentTrackIndexRef.current = currentTrackIndex;
  }, [currentTrackIndex]);

  useEffect(() => {
    bgmEnabledRef.current = bgmEnabled;
  }, [bgmEnabled]);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const savedEnabled = localStorage.getItem(STORAGE_KEY_ENABLED);
      if (savedEnabled !== null) {
        setBgmEnabledState(savedEnabled === 'true');
      }

      const savedVolume = localStorage.getItem(STORAGE_KEY_VOLUME);
      if (savedVolume !== null) {
        const parsed = parseFloat(savedVolume);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          setBgmVolumeState(parsed);
        }
      }

      const savedMode = localStorage.getItem(STORAGE_KEY_MODE) as BgmLoopMode | null;
      if (savedMode && (savedMode === 'all' || savedMode.startsWith('bgm-'))) {
        setLoopModeState(savedMode);
        if (savedMode.startsWith('bgm-')) {
          const idx = BGM_TRACKS.findIndex((t) => t.id === savedMode);
          if (idx !== -1) {
            setCurrentTrackIndex(idx);
          }
        }
      }
    } catch {
      // Ignore localStorage access errors
    }
  }, []);

  // Safe play helper
  const safePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = bgmVolume;
    audio
      .play()
      .then(() => {
        isUnlockedRef.current = true;
        setIsPlaying(true);
      })
      .catch(() => {
        setIsPlaying(false);
      });
  }, [bgmVolume]);

  const safePause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  // Initialize single HTMLAudioElement
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!globalAudioInstance) {
      const initialTrack = BGM_TRACKS[0];
      const audio = new Audio(initialTrack.src);
      audio.preload = 'auto';
      audio.volume = bgmVolume;
      globalAudioInstance = audio;
    }

    audioRef.current = globalAudioInstance;
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onError = () => setIsPlaying(false);

    // Continuous Playlist & Single Loop onEnded handler
    const onEnded = () => {
      const currentMode = loopModeRef.current;
      if (currentMode === 'all') {
        // Advance to next track in playlist
        const nextIndex = (currentTrackIndexRef.current + 1) % BGM_TRACKS.length;
        setCurrentTrackIndex(nextIndex);
        audio.src = BGM_TRACKS[nextIndex].src;
        audio.loop = false;
        if (bgmEnabledRef.current) {
          audio.play().catch(() => {});
        }
      } else {
        // Single track loop
        audio.currentTime = 0;
        if (bgmEnabledRef.current) {
          audio.play().catch(() => {});
        }
      }
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  // Sync volume changes to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = bgmVolume;
    }
  }, [bgmVolume]);

  // Set loop mode and handle audio source transition
  const setLoopMode = useCallback(
    (mode: BgmLoopMode) => {
      setLoopModeState(mode);
      try {
        localStorage.setItem(STORAGE_KEY_MODE, mode);
      } catch {}

      const audio = audioRef.current;
      if (!audio) return;

      if (mode === 'all') {
        audio.loop = false;
      } else {
        const targetIdx = BGM_TRACKS.findIndex((t) => t.id === mode);
        if (targetIdx !== -1) {
          setCurrentTrackIndex(targetIdx);
          audio.loop = true;
          const targetSrc = BGM_TRACKS[targetIdx].src;
          if (!audio.src.endsWith(targetSrc)) {
            audio.src = targetSrc;
            if (bgmEnabled) {
              audio.play().catch(() => {});
            }
          }
        }
      }
    },
    [bgmEnabled]
  );

  // Directly select a track to play
  const selectTrack = useCallback(
    (index: number) => {
      if (index < 0 || index >= BGM_TRACKS.length) return;
      setCurrentTrackIndex(index);
      const audio = audioRef.current;
      if (!audio) return;

      const track = BGM_TRACKS[index];
      audio.src = track.src;
      audio.loop = loopMode !== 'all';
      if (bgmEnabled) {
        audio.play().catch(() => {});
      }
    },
    [bgmEnabled, loopMode]
  );

  // Function to explicitly unlock on user gestures (e.g. Press to start, clicks)
  const unlockAndPlay = useCallback(() => {
    if (!bgmEnabled) return;
    safePlay();
  }, [bgmEnabled, safePlay]);

  // Global first user interaction listener to unblock autoplay
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleFirstInteraction = () => {
      if (bgmEnabled && !isPlaying) {
        safePlay();
      }
    };

    const events = ['click', 'keydown', 'pointerdown', 'touchstart'];
    events.forEach((ev) => window.addEventListener(ev, handleFirstInteraction, { once: true, passive: true }));

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleFirstInteraction));
    };
  }, [bgmEnabled, isPlaying, safePlay]);

  // Handle enabled/disabled toggle
  const setBgmEnabled = useCallback(
    (enabled: boolean) => {
      setBgmEnabledState(enabled);
      try {
        localStorage.setItem(STORAGE_KEY_ENABLED, String(enabled));
      } catch {}

      if (enabled) {
        safePlay();
      } else {
        safePause();
      }
    },
    [safePlay, safePause]
  );

  const toggleBgm = useCallback(() => {
    setBgmEnabled(!bgmEnabled);
  }, [bgmEnabled, setBgmEnabled]);

  const setBgmVolume = useCallback((volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    setBgmVolumeState(clamped);
    try {
      localStorage.setItem(STORAGE_KEY_VOLUME, String(clamped));
    } catch {}

    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  }, []);

  const currentTrack = BGM_TRACKS[currentTrackIndex] || BGM_TRACKS[0];

  return (
    <AudioContext.Provider
      value={{
        bgmEnabled,
        bgmVolume,
        isPlaying,
        loopMode,
        currentTrackIndex,
        currentTrack,
        tracks: BGM_TRACKS,
        toggleBgm,
        setBgmEnabled,
        setBgmVolume,
        setLoopMode,
        selectTrack,
        unlockAndPlay,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
