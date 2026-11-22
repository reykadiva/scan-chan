'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { PixelCat, CatVariantId, CatActionId } from '@/components/game/pixel-cat';
import { usePlayerStore } from '@/stores/player-store';
import { useAudio } from '@/components/providers/audio-provider';
import { GameMode } from '@/lib/game-config';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { X, Loader2, Play, ShieldAlert } from 'lucide-react';

interface WanderingCat {
  id: string;
  variant: CatVariantId;
  action: CatActionId;
  initialX: number; // percentage across screen
  initialY: number; // percentage down screen
  scale: number;
  label: string;
  speech?: string;
}

const INITIAL_CATS: WanderingCat[] = [
  {
    id: 'cat-junior',
    variant: 'calico',
    action: 'play',
    initialX: 42,
    initialY: 68,
    scale: 1.3,
    label: 'Scan-chan Jr.',
    speech: 'Nya~! Ready to scan?',
  },
  {
    id: 'cat-shadow',
    variant: 'black',
    action: 'excited',
    initialX: 18,
    initialY: 55,
    scale: 1.1,
    label: 'Shadow',
    speech: 'Sneaking through the bushes...',
  },
  {
    id: 'cat-tabby',
    variant: 'tabby',
    action: 'sleeping',
    initialX: 72,
    initialY: 74,
    scale: 1.2,
    label: 'Marmalade',
    speech: 'Zzz... warm cobblestones...',
  },
  {
    id: 'cat-arashu',
    variant: 'arashu-smiling',
    action: 'say-hi',
    initialX: 82,
    initialY: 48,
    scale: 1.15,
    label: 'Blossom',
    speech: 'Welcome to the secret garden! 🌸',
  },
];

export function TitleScreenView() {
  const { setMode, initializePlayer, setActiveView } = usePlayerStore();
  const { unlockAndPlay } = useAudio();

  const [checkingAuth, setCheckingAuth] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Interactive wandering cats state
  const [cats, setCats] = useState<WanderingCat[]>(INITIAL_CATS);
  const [activeSpeech, setActiveSpeech] = useState<{ id: string; text: string } | null>(null);

  // Floating petals & fireflies
  const [petals, setPetals] = useState<Array<{ id: number; left: number; delay: number; duration: number; size: number }>>([]);
  const [fireflies, setFireflies] = useState<Array<{ id: number; left: number; top: number; duration: number }>>([]);

  useEffect(() => {
    // Check if opened with auth query param
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('auth') === 'true') {
        setShowModal(true);
      }
    }

    // Generate gentle particle seeds
    const generatedPetals = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 6 + Math.random() * 6,
      size: 10 + Math.random() * 12,
    }));
    setPetals(generatedPetals);

    const generatedFireflies = Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      left: 10 + Math.random() * 80,
      top: 20 + Math.random() * 70,
      duration: 3 + Math.random() * 4,
    }));
    setFireflies(generatedFireflies);
  }, []);

  // Check auth and handle Start trigger
  const handlePressToStart = useCallback(async () => {
    unlockAndPlay();
    if (checkingAuth || showModal) return;
    setCheckingAuth(true);

    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();

      if (data.authenticated && data.user) {
        toast.success(`Welcome back, ${data.user.nickname}! 🎮`);
        setMode(GameMode.ARASHU);
        setActiveView('LOBBY');
      } else {
        setShowModal(true);
      }
    } catch {
      setShowModal(true);
    } finally {
      setCheckingAuth(false);
    }
  }, [checkingAuth, showModal, unlockAndPlay, setMode, setActiveView]);

  // Global Keyboard listener for Enter or Space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showModal) return;
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        handlePressToStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, handlePressToStart]);

  // Handle Cat Click
  const handleCatClick = (cat: WanderingCat) => {
    setActiveSpeech({ id: cat.id, text: cat.speech || 'Nya~!' });

    // Switch action temporarily on poke
    setCats((prev) =>
      prev.map((c) =>
        c.id === cat.id
          ? { ...c, action: c.action === 'excited' ? 'play' : 'excited' }
          : c
      )
    );

    setTimeout(() => {
      setActiveSpeech((curr) => (curr?.id === cat.id ? null : curr));
    }, 3500);
  };

  // Google OAuth Sign In
  const handleGoogleSignIn = async () => {
    if (authLoading) return;
    try {
      setAuthLoading(true);
      setAuthError('');
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        throw error;
      }
    } catch (err: any) {
      setAuthError(err.message || 'Google sign-in failed. Please try again.');
      setAuthLoading(false);
    }
  };

  // Quick Play as Guest
  const handlePlayGuest = async () => {
    try {
      setAuthLoading(true);
      await fetch('/api/auth/guest', { method: 'POST' });
      setMode(GameMode.GUEST);
      initializePlayer('Guest Hunter', 'calico');
      toast.info('Guest mode activated. Safe travels in the garden! 🍃');
      setActiveView('LOBBY');
    } catch {
      setMode(GameMode.GUEST);
      initializePlayer('Guest Hunter', 'calico');
      setActiveView('LOBBY');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#1c261d]">
      {/* 1. Full-screen Pixel Art Garden Background */}
      <div
        className="absolute inset-0 w-full h-full pixelated transition-transform duration-1000 ease-out"
        style={{
          transform: showModal ? 'scale(1.04) filter(blur(2px))' : 'scale(1)',
        }}
      >
        <Image
          src="/images/garden-bg.webp"
          alt="Pixel Art Garden Background"
          fill
          priority
          quality={90}
          className="object-cover object-[center_75%] pixelated"
          sizes="100vw"
        />
      </div>

      {/* Atmospheric dynamic lighting overlay (solid retro tone - zero gradients) */}
      <div className="absolute inset-0 bg-[#0d160f]/40 backdrop-blur-[0.5px] pointer-events-none" />

      {/* 2. Floating Fireflies / Garden Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {fireflies.map((f) => (
          <motion.div
            key={`firefly-${f.id}`}
            className="absolute w-2 h-2 rounded-full bg-[#fef08a] shadow-[0_0_8px_#fef08a]"
            style={{ left: `${f.left}%`, top: `${f.top}%` }}
            animate={{
              y: [-8, 8, -8],
              x: [-6, 6, -6],
              opacity: [0.2, 0.9, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: f.duration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {petals.map((p) => (
          <motion.div
            key={`petal-${p.id}`}
            className="absolute rounded-tl-full rounded-br-full bg-[#fda4af]/60"
            style={{
              left: `${p.left}%`,
              top: '-5%',
              width: `${p.size}px`,
              height: `${p.size * 0.7}px`,
            }}
            animate={{
              y: ['0vh', '105vh'],
              x: [-15, 20, -10, 15],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* 3. Wandering Pixel Cats across Garden Ground */}
      <div className="absolute inset-0 pointer-events-auto">
        {cats.map((cat) => (
          <div
            key={cat.id}
            onClick={() => handleCatClick(cat)}
            className="absolute z-20 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
            style={{
              left: `${cat.initialX}%`,
              top: `${cat.initialY}%`,
            }}
            title={`${cat.label} (Tap to poke!)`}
          >
            {/* Interactive speech balloon */}
            <AnimatePresence>
              {activeSpeech?.id === cat.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.8 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 pointer-events-none whitespace-nowrap"
                >
                  <div className="rpg-panel border-2 border-[#3c2a1a] bg-[#fff8eb] px-3 py-1.5 rounded-lg shadow-[3px_3px_0_0_#2b180d] text-center">
                    <span className="font-pixel text-[9px] text-[#4a2e18] font-bold block">
                      {activeSpeech.text}
                    </span>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-solid border-t-[#fff8eb] border-t-6 border-x-transparent border-x-6 border-b-0" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              whileHover={{ scale: cat.scale * 1.15 }}
              whileTap={{ scale: cat.scale * 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <PixelCat
                variant={cat.variant}
                action={cat.action}
                size={Math.round(48 * cat.scale)}
              />
            </motion.div>
          </div>
        ))}
      </div>

      {/* 4. Top Branding Bar */}
      <header className="relative z-30 pt-6 px-6 sm:pt-8 flex items-center justify-between max-w-5xl mx-auto pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#3b2716] border-2 border-[#e8d5b5] flex items-center justify-center shadow-[2px_2px_0_0_#1c1008]">
            <PixelCat variant="calico" action="none" size={24} />
          </div>
          <span className="font-pixel text-[10px] text-[#fbf6ea] tracking-wider drop-shadow-[2px_2px_0_#1c1008] uppercase">
            Scan-chan 2.0
          </span>
        </div>

        <div className="pointer-events-auto">
          <span className="font-pixel text-[9px] text-[#fbf6ea]/70 drop-shadow-[1px_1px_0_#1c1008]">
            Version 2.0.4 • Secret Garden
          </span>
        </div>
      </header>

      {/* 5. Center Hero Logo & "Press To Start" */}
      <main className="relative z-30 flex flex-col items-center justify-center h-[calc(100vh-140px)] text-center px-4">
        {/* Giant Retro RPG Title Logo */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring', bounce: 0.3 }}
          className="mb-8"
        >
          {/* Main Title Badge */}
          <div className="inline-block relative">
            <h1
              className="font-fredoka text-6xl sm:text-7xl md:text-8xl font-black tracking-tight text-[#ffeed2] drop-shadow-[5px_5px_0_#1f140d]"
              style={{
                textShadow:
                  '4px 4px 0 #2c1a0e, 6px 6px 0 #1b0e06, 0 0 20px rgba(254, 240, 138, 0.3)',
              }}
            >
              SCAN CHAN
            </h1>
            <div className="absolute -bottom-3 right-2 sm:right-4 bg-[#f43f5e] border-2 border-[#fff8eb] px-3 py-0.5 rounded-full rotate-[-4deg] shadow-[3px_3px_0_0_#1c1008]">
              <span className="font-pixel text-[9px] sm:text-[10px] text-white font-bold tracking-wider">
                GARDEN HUB
              </span>
            </div>
          </div>

          <p className="font-pixel text-xs sm:text-sm text-[#fef9c3] mt-5 tracking-widest uppercase drop-shadow-[2px_2px_0_#1f140d]">
            Barcode Companion & Secret Haven
          </p>
        </motion.div>

        {/* Pulsing "Press To Start" Retro RPG Button */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handlePressToStart}
            disabled={checkingAuth}
            className="group relative cursor-pointer px-8 py-4 sm:px-10 sm:py-5 rounded-2xl bg-[#f59e0b] hover:bg-[#fbbf24] active:translate-y-1 active:shadow-[1px_1px_0_0_#1f140d] border-4 border-[#fffbeb] shadow-[6px_6px_0_0_#1f140d] transition-all transform hover:scale-105"
            aria-label="Start Game"
          >
            <div className="flex items-center gap-3">
              <Play className="w-5 h-5 sm:w-6 sm:h-6 text-[#451a03] fill-[#451a03]" />
              <span className="font-pixel text-sm sm:text-base font-bold text-[#451a03] tracking-widest uppercase">
                {checkingAuth ? 'SYNCING...' : 'PRESS TO START'}
              </span>
            </div>
          </button>

          <span className="font-pixel text-[9px] text-[#fef08a]/80 animate-pulse tracking-wider drop-shadow-[1px_1px_0_#1c1008]">
            [ Press Enter / Space / Tap Screen ]
          </span>
        </div>
      </main>

      {/* 6. Mode Selection Modal (Hunter OAuth vs Guest) */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="rpg-panel border-4 border-[#2b180d] bg-[#fbf6ea] max-w-md w-full p-6 sm:p-7 shadow-[8px_8px_0_0_#1c1008] text-center relative"
            >
              {/* Close button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-[#e2d5c3] hover:bg-[#d5c3ad] border-2 border-[#2b180d] flex items-center justify-center text-[#2b180d] cursor-pointer shadow-[2px_2px_0_0_#1c1008]"
                aria-label="Close"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>

              {/* Title & Mascot */}
              <div className="w-16 h-16 rounded-2xl bg-[#e8dbcc] border-2 border-[#2b180d] flex items-center justify-center mx-auto mb-3 shadow-[3px_3px_0_0_#2b180d]">
                <PixelCat variant="calico" action="play" size={48} />
              </div>

              <h2 className="font-fredoka text-2xl sm:text-3xl font-black text-[#2b180d] mb-1">
                Choose Play Mode
              </h2>
              <p className="font-nunito text-xs text-[#523d2e] font-semibold mb-6">
                Choose how you want to explore the secret garden
              </p>

              {/* Error feedback */}
              {authError && (
                <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 rounded-xl text-left flex items-start gap-2 text-xs text-red-800">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3.5">
                {/* 1. Hunter Mode (Google OAuth) */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className="w-full p-4 rounded-xl bg-white hover:bg-[#fffbeb] border-3 border-[#2b180d] shadow-[4px_4px_0_0_#2b180d] active:translate-y-0.5 active:shadow-[1px_1px_0_0_#2b180d] flex items-center gap-3.5 transition-all cursor-pointer text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#f0ede6] border-2 border-[#2b180d] flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-fredoka font-bold text-sm text-[#2b180d]">
                        Hunter Mode (Google Sign-In)
                      </span>
                      <span className="font-pixel text-[8px] bg-[#10b981] text-white px-1.5 py-0.5 rounded border border-[#064e3b]">
                        CLOUD
                      </span>
                    </div>
                    <span className="font-nunito text-[11px] text-[#6d5543] block truncate">
                      Cloud save, cross-device sync & progression protection
                    </span>
                  </div>
                </button>

                {/* 2. Guest Mode */}
                <button
                  onClick={handlePlayGuest}
                  disabled={authLoading}
                  className="w-full p-4 rounded-xl bg-[#ece1d3] hover:bg-[#e4d6c4] border-3 border-[#2b180d] shadow-[4px_4px_0_0_#2b180d] active:translate-y-0.5 active:shadow-[1px_1px_0_0_#2b180d] flex items-center gap-3.5 transition-all cursor-pointer text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#dacbba] border-2 border-[#2b180d] flex items-center justify-center shrink-0">
                    <PixelCat variant="gray" action="none" size={26} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-fredoka font-bold text-sm text-[#2b180d]">
                        Guest Mode (Quick Play)
                      </span>
                      <span className="font-pixel text-[8px] bg-[#64748b] text-white px-1.5 py-0.5 rounded border border-[#1e293b]">
                        LOCAL
                      </span>
                    </div>
                    <span className="font-nunito text-[11px] text-[#6d5543] block truncate">
                      Instant offline play, saved only on this device
                    </span>
                  </div>
                </button>
              </div>

              {authLoading && (
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#523d2e] font-pixel">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Preparing Garden...</span>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
