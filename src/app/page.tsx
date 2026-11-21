'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { PixelCat, CatVariantId, CatActionId, CAT_PALETTES } from '@/components/game/pixel-cat';
import { usePlayerStore } from '@/stores/player-store';
import { useAudio } from '@/components/providers/audio-provider';
import { GameMode } from '@/lib/game-config';
import { toast } from 'sonner';
import { Lock, Mail, User, Sparkles, X, Loader2, Play, ShieldAlert } from 'lucide-react';

const CAT_AVATARS: CatVariantId[] = ['calico', 'gray', 'cyan', 'pink', 'black', 'tabby'];

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
  const [modalTab, setModalTab] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<CatVariantId>('calico');
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

  // Submit Auth Form
  const handleSubmitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authLoading) return;
    setAuthLoading(true);
    setAuthError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setAuthError('Please fill in both email and password.');
      setAuthLoading(false);
      return;
    }

    try {
      if (modalTab === 'register') {
        if (!nickname.trim()) {
          setAuthError('Please choose a hunter nickname.');
          setAuthLoading(false);
          return;
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password: cleanPassword,
            nickname: nickname.trim(),
            avatar: selectedAvatar,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Registration failed');
        }

        toast.success('Account created! Welcome to the hunt! 🐱');
        setMode(GameMode.ARASHU);
        await loadProfile();
        router.push('/play');
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password: cleanPassword,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Invalid credentials');
        }

        toast.success(`Welcome back, ${data.user?.nickname || 'Hunter'}! 🌟`);
        setMode(GameMode.ARASHU);
        await loadProfile();
        router.push('/play');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please try again.');
    } finally {
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
                  Scan everyday barcodes to feed and evolve your pixel cat. Free on mobile & desktop.
                </p>
              </div>

              {/* Tab Switcher (Log in | Sign up) */}
              <div className="grid grid-cols-2 gap-2 mt-4 p-1 rounded-xl bg-black/15 border-2 border-white/40">
                <button
                  type="button"
                  onClick={() => {
                    setModalTab('login');
                    setAuthError('');
                  }}
                  className={`py-2 text-[10px] font-press-start rounded-lg transition-all cursor-pointer ${
                    modalTab === 'login'
                      ? 'bg-white text-[var(--theme-primary)] font-bold shadow-[2px_2px_0_0_var(--theme-shadow)] border border-[var(--theme-border)]'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalTab('register');
                    setAuthError('');
                  }}
                  className={`py-2 text-[10px] font-press-start rounded-lg transition-all cursor-pointer ${
                    modalTab === 'register'
                      ? 'bg-white text-[var(--theme-primary)] font-bold shadow-[2px_2px_0_0_var(--theme-shadow)] border border-[var(--theme-border)]'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Sign up
                </button>
              </div>

              {/* Error banner */}
              {authError && (
                <div className="mt-3 p-2.5 rounded-lg bg-white border-2 border-[var(--theme-border)] text-[var(--theme-text-dark)] text-[10px] font-pixelify flex items-center gap-2 shadow-[2px_2px_0_0_var(--theme-shadow)]">
                  <ShieldAlert className="w-4 h-4 text-[var(--theme-primary)] shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Auth Form */}
              <form onSubmit={handleSubmitAuth} className="space-y-3.5 mt-4">
                {modalTab === 'register' && (
                  <>
                    <div>
                      <label className="block text-[9px] font-press-start text-white mb-1 uppercase tracking-wider drop-shadow-[1px_1px_0_var(--theme-dark)]">
                        Hunter Nickname
                      </label>
                      <input
                        type="text"
                        required
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="e.g. MasterScanner"
                        maxLength={24}
                        className="w-full px-3 py-2 rounded-lg bg-white border-2 border-[var(--theme-border)] text-[var(--theme-text-dark)] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-press-start text-white mb-1 uppercase tracking-wider drop-shadow-[1px_1px_0_var(--theme-dark)]">
                        Choose Companion
                      </label>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {CAT_AVATARS.map((av) => (
                          <button
                            key={av}
                            type="button"
                            onClick={() => setSelectedAvatar(av)}
                            title={CAT_PALETTES[av]?.label || av}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all cursor-pointer overflow-hidden ${
                              selectedAvatar === av
                                ? 'border-[var(--theme-border)] bg-white scale-105 shadow-[2px_2px_0_0_var(--theme-shadow)]'
                                : 'border-white/40 bg-black/15 hover:border-white'
                            }`}
                          >
                            <PixelCat variant={av} size={28} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[9px] font-press-start text-white mb-1 uppercase tracking-wider drop-shadow-[1px_1px_0_var(--theme-dark)]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hunter@scanchan.com"
                    className="w-full px-3 py-2 rounded-lg bg-white border-2 border-[var(--theme-border)] text-[var(--theme-text-dark)] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-press-start text-white mb-1 uppercase tracking-wider drop-shadow-[1px_1px_0_var(--theme-dark)]">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-lg bg-white border-2 border-[var(--theme-border)] text-[var(--theme-text-dark)] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>

                {/* Primary Button */}
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full mt-2 py-3 px-4 rounded-lg bg-white hover:bg-[var(--theme-surface-inner)] text-[var(--theme-primary)] font-press-start text-[11px] border-2 border-[var(--theme-border)] shadow-[4px_4px_0_0_var(--theme-shadow)] active:translate-y-1 active:shadow-[1px_1px_0_0_var(--theme-shadow)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {authLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[var(--theme-primary)]" />
                  ) : modalTab === 'register' ? (
                    'Create Account'
                  ) : (
                    'Log In'
                  )}
                </button>

                {/* Quick Play as Guest (Instant Access) */}
                <button
                  type="button"
                  onClick={handlePlayGuest}
                  disabled={authLoading}
                  className="w-full py-2.5 px-4 rounded-lg bg-[var(--theme-surface-inner)] hover:bg-white text-[var(--theme-text-dark)] font-press-start text-[10px] border-2 border-[var(--theme-border)] shadow-[3px_3px_0_0_var(--theme-shadow)] active:translate-y-0.5 active:shadow-[1px_1px_0_0_var(--theme-shadow)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play as Guest</span>
                </button>
              </form>

              {/* Bottom Cloud Info Subtext */}
              <div className="mt-5 pt-3 border-t border-white/30 text-center space-y-1">
                <p className="text-[8px] font-press-start text-white/90">
                  Your game is saved in the cloud when logged in.
                </p>
                <p className="text-[9px] font-pixelify text-white/70">
                  Guest progress is stored locally in this browser.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
