'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

export default function TitleScreenPage() {
  const router = useRouter();
  const { setMode, initializePlayer, loadProfile } = usePlayerStore();
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
        router.push('/play');
      } else {
        setShowModal(true);
      }
    } catch {
      setShowModal(true);
    } finally {
      setCheckingAuth(false);
    }
  }, [checkingAuth, showModal, router]);

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
      router.push('/play');
    } catch {
      setMode(GameMode.GUEST);
      initializePlayer('Guest Hunter', 'calico');
      router.push('/play');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-black">
      {/* 1. Full-screen Pixel Art Garden Background */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center pixelated transition-transform duration-1000 ease-out"
        style={{
          backgroundImage: "url('/images/garden-bg.jpg')",
          backgroundPosition: 'center 75%',
          transform: showModal ? 'scale(1.04) filter(blur(2px))' : 'scale(1)',
        }}
      />

      {/* Atmospheric dynamic lighting overlay (solid retro tone - zero gradients) */}
      <div className="absolute inset-0 pointer-events-none bg-black/25" />

      {/* 2. Floating Wind & Flower Petal Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {petals.map((petal) => (
          <motion.div
            key={`petal-${petal.id}`}
            initial={{ y: -50, x: `${petal.left}vw`, rotate: 0, opacity: 0 }}
            animate={{
              y: '105vh',
              x: [`${petal.left}vw`, `${(petal.left + 8) % 100}vw`, `${(petal.left - 5) % 100}vw`],
              rotate: [0, 180, 360],
              opacity: [0, 0.9, 0.9, 0],
            }}
            transition={{
              duration: petal.duration,
              delay: petal.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute rounded-full bg-[var(--theme-primary)] border border-[var(--theme-border)]"
            style={{
              width: petal.size,
              height: petal.size * 0.7,
            }}
          />
        ))}

        {/* Solid Retro Fireflies */}
        {fireflies.map((fly) => (
          <motion.div
            key={`firefly-${fly.id}`}
            initial={{ opacity: 0.2, scale: 0.8 }}
            animate={{
              opacity: [0.2, 0.9, 0.3],
              scale: [0.8, 1.2, 0.9],
              y: [0, -18, 0],
              x: [0, 10, -8, 0],
            }}
            transition={{
              duration: fly.duration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute w-2 h-2 rounded-full bg-[var(--theme-accent)] shadow-[2px_2px_0_0_var(--theme-shadow)]"
            style={{
              left: `${fly.left}%`,
              top: `${fly.top}%`,
            }}
          />
        ))}
      </div>

      {/* 3. Living Pixel Cats Wandering in the Garden */}
      <div className="absolute inset-0 z-20 pointer-events-auto">
        {cats.map((cat) => (
          <div
            key={cat.id}
            onClick={() => handleCatClick(cat)}
            className="absolute cursor-pointer transition-transform hover:scale-115 active:scale-95 group"
            style={{
              left: `${cat.initialX}%`,
              top: `${cat.initialY}%`,
              transform: `translate(-50%, -50%) scale(${cat.scale})`,
            }}
          >
            {/* Speech Bubble on click */}
            <AnimatePresence>
              {activeSpeech?.id === cat.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: -45, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute left-1/2 -translate-x-1/2 -top-4 z-30 whitespace-nowrap px-2.5 py-1 rounded-md bg-white border-2 border-[var(--theme-border)] text-[var(--theme-text-dark)] font-press-start text-[8px] shadow-[2px_2px_0_0_var(--theme-shadow)] pointer-events-none"
                >
                  {activeSpeech.text}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[var(--theme-border)]" />
                </motion.div>
              )}
            </AnimatePresence>

            <PixelCat variant={cat.variant} action={cat.action} size={48} />

            {/* Subtle Name Pill on Hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-1/2 -translate-x-1/2 -bottom-4 text-[7px] font-press-start px-1.5 py-0.5 rounded bg-white border border-[var(--theme-border)] text-[var(--theme-text-dark)] whitespace-nowrap pointer-events-none shadow-[1px_1px_0_0_var(--theme-shadow)]">
              {cat.label}
            </div>
          </div>
        ))}
      </div>

      {/* 4. Centered Title Screen UI (Active when Modal is Closed) */}
      <AnimatePresence>
        {!showModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92, filter: 'blur(4px)' }}
            transition={{ duration: 0.25 }}
            onClick={handlePressToStart}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center cursor-pointer px-4 text-center"
          >
            {/* Title & Badge */}
            <div className="space-y-3 max-w-xl">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <span className="inline-block px-3 py-1 mb-2 rounded-lg bg-white border-2 border-[var(--theme-border)] text-[var(--theme-primary)] font-press-start text-[9px] tracking-widest uppercase shadow-[2px_2px_0_0_var(--theme-shadow)]">
                  ★ BARCODE COMPANION ★
                </span>
                <h1 className="text-3xl xs:text-4xl sm:text-6xl md:text-7xl font-black tracking-wider text-pixel-title leading-tight select-none drop-shadow-[2.5px_2.5px_0_var(--theme-dark)]">
                  SCAN CHAN
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-xs sm:text-sm font-press-start text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] max-w-md mx-auto leading-relaxed px-2"
              >
                Survive the hunt with your pixel companion cat
              </motion.p>
            </div>

            {/* Blinking "Press to start" prompt */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 sm:mt-16 flex flex-col items-center gap-3"
            >
              <div className="animate-pulse flex items-center gap-2 px-4 sm:px-5 py-3 rounded-xl bg-white border-2 border-[var(--theme-border)] shadow-[4px_4px_0_0_var(--theme-shadow)] min-h-[44px]">
                <span className="text-[var(--theme-primary)] font-press-start text-[11px] sm:text-sm tracking-wider">
                  {checkingAuth ? 'LOADING...' : '▶ PRESS TO START ◀'}
                </span>
              </div>
              <span className="text-[9px] font-pixelify text-white/75 drop-shadow-md">
                (Click anywhere or press ENTER / SPACE)
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Retro RPG/Arcade Login & Sign Up Dialog Modal (matching PokéSurvivor Layout) */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              className="relative w-[94vw] max-w-md max-h-[85dvh] overflow-y-auto rounded-2xl bg-[var(--theme-primary)] border-4 border-white shadow-[6px_6px_0_0_var(--theme-shadow)] p-5 sm:p-7 text-white scrollbar-none"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 min-w-[44px] min-h-[44px] rounded-xl bg-white border-2 border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-text-dark)] hover:bg-[var(--theme-surface-inner)] transition-colors cursor-pointer shadow-[2px_2px_0_0_var(--theme-shadow)]"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Brand Header */}
              <div className="text-center space-y-1.5 pb-2">
                <h2 className="text-xl sm:text-2xl font-bold font-press-start text-pixel-title tracking-wide drop-shadow-[1.5px_1.5px_0_var(--theme-dark)]">
                  SCAN CHAN
                </h2>
                <div className="inline-block px-2.5 py-0.5 rounded-lg bg-white border-2 border-[var(--theme-border)] text-[var(--theme-primary)] font-press-start text-[8px] uppercase tracking-wider shadow-[2px_2px_0_0_var(--theme-shadow)]">
                  MYSTERY ADVENTURE
                </div>
                <p className="text-[10px] font-pixelify text-white/80 max-w-xs mx-auto pt-1 leading-snug drop-shadow-[1px_1px_0_var(--theme-dark)]">
                  Choose your hunter access to start feeding & evolving your companion cat:
                </p>
              </div>

              {/* Error banner */}
              {authError && (
                <div className="mt-3 p-2.5 rounded-lg bg-white border-2 border-[var(--theme-border)] text-[var(--theme-text-dark)] text-[10px] font-pixelify flex items-center gap-2 shadow-[2px_2px_0_0_var(--theme-shadow)]">
                  <ShieldAlert className="w-4 h-4 text-[var(--theme-primary)] shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Clean Auth Options: Google OAuth & Guest Mode */}
              <div className="space-y-3 mt-5">
                {/* 1. Continue with Google */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-[var(--theme-surface-inner)] text-[var(--theme-text-dark)] font-press-start text-[11px] border-2 border-[var(--theme-border)] shadow-[4px_4px_0_0_var(--theme-shadow)] active:translate-y-1 active:shadow-[1px_1px_0_0_var(--theme-shadow)] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                >
                  {authLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[var(--theme-primary)]" />
                  ) : (
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                  )}
                  <span>Continue with Google</span>
                </button>

                {/* 2. Quick Play as Guest */}
                <button
                  type="button"
                  onClick={handlePlayGuest}
                  disabled={authLoading}
                  className="w-full py-3 px-4 rounded-xl bg-[var(--theme-surface-inner)] hover:bg-white text-[var(--theme-text-dark)] font-press-start text-[10px] border-2 border-[var(--theme-border)] shadow-[3px_3px_0_0_var(--theme-shadow)] active:translate-y-0.5 active:shadow-[1px_1px_0_0_var(--theme-shadow)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play as Guest</span>
                </button>
              </div>

              {/* Bottom Cloud Info Subtext */}
              <div className="mt-5 pt-3 border-t border-white/30 text-center space-y-1">
                <p className="text-[8px] font-press-start text-white/90">
                  Google accounts sync your pet, level, and streaks to the cloud.
                </p>
                <p className="text-[9px] font-pixelify text-white/70">
                  Guest progress is stored locally in this browser.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Retro Landing Footer with Privacy Policy */}
      <footer className="absolute bottom-3 inset-x-0 z-30 flex items-center justify-center gap-2.5 text-[10px] font-pixelify text-white/80 drop-shadow-md pointer-events-auto">
        <span>Scan Chan © 2026</span>
        <span>•</span>
        <Link
          href="/privacy"
          className="underline hover:text-white transition-colors cursor-pointer"
        >
          Privacy Policy
        </Link>
      </footer>
    </div>
  );
}
