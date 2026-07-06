'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import { PixelCat, type CatVariantId } from '@/components/legacy/pixel-cat';
import { usePlayerStore, xpForLevel } from '@/stores/legacy/player-store';
import { GameMode } from '@/lib/game-config';
import { NicknameSetup } from '@/components/legacy/game/nickname-setup';
import { RegisterProductModal } from '@/components/legacy/game/register-product-modal';
import { ProductList } from '@/components/legacy/game/product-list';
import { GameStats } from '@/components/legacy/game/game-stats';
import { ScanHistory } from '@/components/legacy/game/scan-history';
import { XpPopup } from '@/components/legacy/game/xp-popup';
import { DailyMissions } from '@/components/legacy/game/daily-missions';
import { GameAchievements } from '@/components/legacy/game/game-achievements';
import { AchievementPopup } from '@/components/legacy/game/achievement-popup';
import { createClient } from '@/lib/supabase/client';
import { PetPanel } from '@/components/legacy/game/pet-panel';
import { LevelRoadmap } from '@/components/legacy/game/level-roadmap';
import { LoginCalendar } from '@/components/legacy/game/login-calendar';
import { BountyHunt } from '@/components/legacy/game/bounty-hunt';
import { CategoryBadges } from '@/components/legacy/game/category-badges';

// Separate component so useSearchParams is inside a Suspense boundary
function RegisterParamHandler({ onBarcode }: { onBarcode: (b: string) => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const barcode = searchParams.get('register');
    if (barcode) {
      onBarcode(barcode);
      router.replace('/play');
    }
  }, [searchParams, onBarcode, router]);

  return null;
}

type Tab = 'missions' | 'stats' | 'roadmap' | 'history' | 'achievements' | 'products' | 'login' | 'bounty' | 'badges';

export default function GameHubPage() {
  const router = useRouter();

  const mode = usePlayerStore((state) => state.mode);
  const nickname = usePlayerStore((state) => state.nickname);
  const avatar = usePlayerStore((state) => state.avatar);
  const xp = usePlayerStore((state) => state.xp);
  const level = usePlayerStore((state) => state.level);
  const streak = usePlayerStore((state) => state.streak);
  const creatorId = usePlayerStore((state) => state.creatorId);
  const resetPlayer = usePlayerStore((state) => state.resetPlayer);
  const registerProduct = usePlayerStore((state) => state.registerProduct);
  const unregisterProduct = usePlayerStore((state) => state.unregisterProduct);
  const checkDailyReset = usePlayerStore((state) => state.checkDailyReset);
  const selectedBorder = usePlayerStore((state) => state.selectedBorder);
  const selectedTheme = usePlayerStore((state) => state.selectedTheme);
  const loadProfile = usePlayerStore((state) => state.loadProfile);
  const selectedTitle = usePlayerStore((state) => state.selectedTitle);

  const [activeTab, setActiveTab] = useState<Tab>('missions');
  const [showSetup, setShowSetup] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerInitialBarcode, setRegisterInitialBarcode] = useState('');
  const [mounted, setMounted] = useState(false);

  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('scan-chan-muted') === 'true';
    }
    return false;
  });

  const [lastLevel, setLastLevel] = useState(level);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      localStorage.setItem('scan-chan-muted', String(next));
      return next;
    });
  };

  const playFanfare = () => {
    if (typeof window === 'undefined') return;
    const isMutedSetting = localStorage.getItem('scan-chan-muted') === 'true';
    if (isMutedSetting) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      
      const playNote = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.12, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      playNote(261.63, now, 0.15); // C4
      playNote(329.63, now + 0.12, 0.15); // E4
      playNote(392.00, now + 0.24, 0.15); // G4
      playNote(523.25, now + 0.36, 0.45); // C5
    } catch {}
  };

  useEffect(() => {
    if (!mounted) return;
    if (level > lastLevel) {
      playFanfare();
      toast.success(`🎉 LEVEL UP! You reached Level ${level}!`, {
        description: 'New titles or pet accessories unlocked. Check the Roadmap tab!',
      });
      setLastLevel(level);
    }
  }, [level, lastLevel, mounted]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!mounted || mode === null) return;
    const localDateString = new Date().toLocaleDateString('en-CA');
    checkDailyReset(localDateString);
  }, [mounted, mode, checkDailyReset]);

  useEffect(() => {
    if (!mounted) return;

    if (mode === null) {
      router.push('/play/mode');
      return;
    }
    
    if (mode === GameMode.GUEST && !nickname) {
      const t = setTimeout(() => setShowSetup(true), 0);
      return () => clearTimeout(t);
    }
  }, [mode, nickname, mounted, router]);

  // Session check for Arashu's Mode
  useEffect(() => {
    if (!mounted || mode !== GameMode.ARASHU) return;
    if (nickname === 'Arashu Tester') return; // Bypass session verify for developer tester account

    async function verifySession() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Session expired. Please log in again.');
        resetPlayer();
        router.push('/play/mode');
      }
    }

    verifySession();
  }, [mounted, mode, router, resetPlayer, nickname]);

  // Sync state on load for Arashu's Mode
  useEffect(() => {
    if (mounted && mode === GameMode.ARASHU) {
      if (nickname === 'Arashu Tester') return;
      loadProfile();
    }
  }, [mounted, mode, loadProfile, nickname]);

  // Handle ?register=<barcode> from scanner "Register" button
  // This is in a separate component because useSearchParams needs Suspense
  const handleRegisterParam = useCallback((barcode: string) => {
    setRegisterInitialBarcode(barcode);
    setShowRegisterModal(true);
    setActiveTab('products');
  }, []);

  const handleOpenRegisterModal = useCallback(() => {
    setRegisterInitialBarcode('');
    setShowRegisterModal(true);
  }, []);

  const handleRegisterSuccess = useCallback((barcode: string, category: string) => {
    registerProduct(barcode, category);
    setShowRegisterModal(false);
    setActiveTab('products');
  }, [registerProduct]);

  const handleProductDeleted = useCallback((barcode: string) => {
    unregisterProduct(barcode);
  }, [unregisterProduct]);

  const handleExit = async () => {
    if (mode === GameMode.ARASHU) {
      // Arashu mode uses Supabase auth — sign out and reset session state
      const supabase = createClient();
      await supabase.auth.signOut();
      resetPlayer();
    }
    // Guest mode: preserve progress, just navigate away
    router.push('/play/mode');
  };

  if (!mounted || mode === null) {
    return (
      <div className="min-h-screen bg-mesh-soft pb-24 relative p-4 space-y-6 max-w-5xl mx-auto mt-8">
        {/* Profile Card Skeleton */}
        <div className="card-bubbly bg-white/60 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-200 rounded-2xl" />
            <div className="space-y-2">
              <div className="h-6 w-32 bg-slate-200 rounded-full" />
              <div className="h-4 w-20 bg-slate-200 rounded-full" />
            </div>
          </div>
          <div className="h-12 w-full sm:w-48 bg-slate-200 rounded-full" />
        </div>

        {/* Tab Controls Skeleton */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-28 bg-white/60 rounded-full shrink-0 animate-pulse" />
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card-bubbly bg-white/60 p-6 h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const borderClasses = 
    selectedBorder === 'bronze' ? 'border-4 border-[#cd7f32] shadow-[0_0_10px_rgba(205,127,50,0.5)]' :
    selectedBorder === 'silver' ? 'border-4 border-[#c0c0c0] shadow-[0_0_12px_rgba(192,192,192,0.6)]' :
    selectedBorder === 'gold' ? 'border-4 border-[#ffd700] shadow-[0_0_15px_rgba(255,215,0,0.7)] border-double' :
    selectedBorder === 'holographic' ? 'border-4 border-transparent bg-gradient-to-tr from-cyan-400 via-pink-400 to-yellow-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] animate-pulse' :
    'border-2 border-white shadow-md';

  const theme = {
    bg: selectedTheme === 'kawaii' 
      ? 'bg-gradient-to-br from-pink-100 via-rose-50 to-pink-100 min-h-screen text-slate-800'
      : selectedTheme === 'cyberpunk'
      ? 'bg-slate-950 text-slate-100 min-h-screen'
      : 'bg-mesh-soft min-h-screen text-slate-800',
    header: selectedTheme === 'cyberpunk'
      ? 'bg-slate-900/60 border-b border-indigo-500/30'
      : 'bg-white/30 border-b border-white/20',
    card: selectedTheme === 'cyberpunk'
      ? 'bg-slate-900/90 border border-indigo-500/30 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]'
      : selectedTheme === 'kawaii'
      ? 'bg-white/90 border border-pink-100 shadow-[0_4px_20px_rgba(244,114,182,0.15)] text-slate-850'
      : 'bg-white text-slate-800 shadow-md',
    text: selectedTheme === 'cyberpunk' ? 'text-slate-100' : 'text-slate-800',
    subtext: selectedTheme === 'cyberpunk' ? 'text-slate-400' : 'text-slate-500',
  };

  return (
    <main className={`pb-24 relative ${theme.bg}`}>
      {/* Handles ?register=<barcode> query param from scanner — must be in Suspense */}
      <Suspense fallback={null}>
        <RegisterParamHandler onBarcode={handleRegisterParam} />
      </Suspense>

      <XpPopup />
      <AchievementPopup />

      <AnimatePresence>
        {showSetup && <NicknameSetup onComplete={() => setShowSetup(false)} />}
        {showRegisterModal && (
          <RegisterProductModal
            key="register-modal"
            initialBarcode={registerInitialBarcode}
            creatorId={creatorId}
            onClose={() => setShowRegisterModal(false)}
            onSuccess={handleRegisterSuccess}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className={`px-4 md:px-8 py-5 sticky top-0 backdrop-blur-md z-40 ${theme.header}`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Pixel cat logo */}
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center card-bubbly shadow-sm overflow-hidden">
              <PixelCat variant="calico" size={32} aria-label="Scan Chan logo" />
            </div>
            <span className={`font-fredoka font-bold text-xl tracking-tight ${theme.text}`}>Game Hub</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="p-2 bg-white/80 hover:bg-white text-slate-600 rounded-full card-bubbly hover:scale-105 transition-transform flex items-center justify-center cursor-pointer"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-rose-500 animate-pulse" /> : <Volume2 className="w-5 h-5 text-brand-cyan" />}
            </button>
            <button
              onClick={handleExit}
              className="flex items-center gap-2 px-4 py-1.5 bg-white/80 hover:bg-white text-slate-600 rounded-full font-fredoka font-semibold text-sm card-bubbly hover:scale-105 transition-transform overflow-hidden animate-fade-in"
            >
              <PixelCat variant="gray" action="exit" size={24} aria-hidden="true" />
              Exit
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-6">
        {/* Profile Card */}
        <div className={`card-bubbly p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 ${theme.card}`}>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 bg-gradient-to-br from-brand-cyan/10 to-brand-pink/10 rounded-2xl flex items-center justify-center select-none overflow-hidden transition-all ${borderClasses}`}>
              {mode === GameMode.ARASHU
                ? <PixelCat variant="arashu-smiling" size={52} aria-label="Arashu profile avatar" />
                : <PixelCat variant={(avatar as CatVariantId) || 'calico'} size={52} />}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className={`font-fredoka text-xl font-bold ${theme.text}`}>
                  {mode === GameMode.ARASHU ? "Arashu's" : nickname || 'Guest Player'}
                </h2>
                {streak > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-orange-600 font-semibold" title={`${streak}-day streak`}>
                    <PixelCat variant="tabby" action="fire-streak" size={24} /> {streak}
                  </span>
                )}
              </div>
              {selectedTitle && (
                <div className="text-[10px] font-fredoka font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full inline-block mb-1.5 uppercase tracking-wide">
                  👑 {selectedTitle}
                </div>
              )}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="bg-brand-cyan/20 text-cyan-800 text-xs font-fredoka font-bold px-2.5 py-0.5 rounded-full">
                    LVL {level}
                  </span>
                  <span className={`font-nunito text-xs font-bold ${theme.subtext}`}>
                    {xp - xpForLevel(level)} / {xpForLevel(level + 1) - xpForLevel(level)} XP
                  </span>
                </div>
                <div className="w-40 bg-slate-100/80 rounded-full h-1.5 border border-slate-200/30 overflow-hidden mt-1">
                  <div
                    className="bg-brand-cyan h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        ((xp - xpForLevel(level)) / (xpForLevel(level + 1) - xpForLevel(level))) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link href="/scan" className="w-full sm:w-auto">
              <button className="btn-bubbly bg-brand-cyan text-white px-6 py-3 w-full flex items-center justify-center gap-2 font-fredoka font-semibold overflow-hidden">
                <PixelCat variant="cyan" action="scan" size={28} />
                Scan Barcode
              </button>
            </Link>
            <button
              onClick={handleOpenRegisterModal}
              className="btn-bubbly bg-brand-pink text-white px-6 py-3 w-full sm:w-auto flex items-center justify-center gap-2 font-fredoka font-semibold overflow-hidden"
            >
              <PixelCat variant="pink" action="items" size={28} />
              Register Product
            </button>
          </div>
        </div>

        {/* Pet Panel is now Main Showcase Hero Content */}
        <PetPanel />

        {/* Tab controls */}
        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-none">
          {([
            { id: 'missions', label: 'Missions', action: 'missions', variant: 'tabby' },
            { id: 'login', label: 'Login', action: 'achievements', variant: 'calico' },
            { id: 'bounty', label: 'Bounty', action: 'scan', variant: 'tabby' },
            { id: 'stats', label: 'Stats', action: 'stats', variant: 'cyan' },
            { id: 'roadmap', label: 'Roadmap', action: 'play', variant: 'black' },
            { id: 'badges', label: 'Badges', action: 'achievements', variant: 'pink' },
            { id: 'history', label: 'History', action: 'history', variant: 'gray' },
            { id: 'achievements', label: 'Achievements', action: 'achievements', variant: 'calico' },
            { id: 'products', label: 'Products', action: 'items', variant: 'pink' },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full font-fredoka font-semibold text-sm whitespace-nowrap transition-all tab-bubbly flex items-center gap-2 focus:outline-none focus:ring-0 active:scale-95 ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-white hover:bg-slate-700 font-bold scale-105 shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              <PixelCat variant={tab.variant} action={tab.action} size={24} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="min-h-[300px]">
          {activeTab === 'missions' && (
            <DailyMissions />
          )}
          {activeTab === 'login' && (
            <LoginCalendar />
          )}
          {activeTab === 'bounty' && (
            <BountyHunt />
          )}
          {activeTab === 'stats' && (
            <GameStats />
          )}
          {activeTab === 'roadmap' && (
            <LevelRoadmap />
          )}
          {activeTab === 'badges' && (
            <CategoryBadges />
          )}
          {activeTab === 'history' && (
            <ScanHistory />
          )}
          {activeTab === 'achievements' && (
            <GameAchievements />
          )}
          {activeTab === 'products' && (
            <ProductList
              creatorId={creatorId}
              onProductDeleted={handleProductDeleted}
            />
          )}
        </div>
      </div>
    </main>
  );
}
