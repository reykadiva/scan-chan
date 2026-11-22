'use client';

import { useState, useEffect, useCallback, Suspense, useMemo, useRef } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  ScanLine,
  Flame,
  History,
  Package,
  BookOpen,
  Edit2,
  Check,
  X,
  ShoppingBag,
  Heart,
  Utensils,
  Settings,
  Crosshair,
  Sparkles,
  TrendingUp,
  Cloud,
} from 'lucide-react';
import { toast } from 'sonner';
import { PixelCat, type CatVariantId, type CatActionId } from '@/components/game/pixel-cat';
import { usePlayerStore, xpForLevel, levelFromXp, getPetStageFromLevel, isFoodCategory } from '@/stores/player-store';
import { GameMode } from '@/lib/game-config';
import { NicknameSetup } from '@/components/game/nickname-setup';
import { RegisterProductModal } from '@/components/game/register-product-modal';
import { SettingsModal } from '@/components/game/settings-modal';
import { ProductList } from '@/components/game/product-list';
import { ScanHistory } from '@/components/game/scan-history';
import { XpPopup } from '@/components/game/xp-popup';
import { CategoryIcon } from '@/components/ui/category-badge';
import { hasScannedToday, getTodayString, getLocalDateKey } from '@/lib/streak-helpers';
import { calculateStreakMultiplier } from '@/lib/streak-multiplier';
import type { Product } from '@/types';
import { useProductStore } from '@/stores/product-store';
import { SyncLoadingGate } from '@/components/game/sync-loading-gate';

// Map evolution stages to cute pixel cat variants
const STAGE_AVATARS: Record<string, CatVariantId> = {
  KITTEN: 'calico',
  YOUNG_CAT: 'tabby',
  ADULT_CAT: 'black',
  WISE_CAT: 'cyan',
  LEGENDARY_CAT: 'arashu-smiling',
};

const STAGE_LABELS: Record<string, string> = {
  KITTEN: 'Kitten',
  YOUNG_CAT: 'Young Cat',
  ADULT_CAT: 'Adult Cat',
  WISE_CAT: 'Wise Cat',
  LEGENDARY_CAT: 'Legendary Cat',
};

// ponytail: Lean relative time helper without moment/date-fns bloat
function formatRelativeTime(timestamp?: number): string {
  if (!timestamp) return 'Recently';
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  return `${diffDays}d ago`;
}

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

type ModalTab = 'bag' | 'catalog' | 'history' | 'guide' | null;

export function LobbyView() {
  const router = useRouter();

  const {
    mode,
    setMode,
    nickname,
    userEmail,
    avatar,
    xp,
    streak,
    lastActiveDate,
    creatorId,
    petName,
    petStage,
    petHunger,
    petAffection,
    feedPet,
    renamePet,
    foodInventory,
    scanHistory,
    lastScanTime,
    registerProduct,
    unregisterProduct,
    checkDailyReset,
    loadProfile,
    resetPlayer,
    petCat,
    dailyPetCount,
    lastPetDate,
    applyHungerDecay,
    applyAffectionDecay,
    isProfileLoaded,
    isLoading,
    error,
    lastCelebratedLevel,
    setLastCelebratedLevel,
    setActiveView,
  } = usePlayerStore();

  const [activeModal, setActiveModal] = useState<ModalTab>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [registerInitialBarcode, setRegisterInitialBarcode] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const isSigningOutRef = useRef(false);

  // Real-time daily streak & reset calculation (uniform local date)
  const [todayKey, setTodayKey] = useState(() => getLocalDateKey());
  const scannedToday = hasScannedToday(lastActiveDate, todayKey);
  const petsToday = lastPetDate === todayKey ? (dailyPetCount || 0) : 0;
  const lastPetToastTimeRef = useRef(0);

  // Recent scans product cache
  const [recentScanProducts, setRecentScanProducts] = useState<Record<string, Product>>({});

  // Pet interaction state
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(petName || 'Scan-chan Jr.');
  const [catAction, setCatAction] = useState<CatActionId>('none');
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [foodItems, setFoodItems] = useState<Product[]>([]);
  const [loadingFood, setLoadingFood] = useState(false);

  const displayLevel = levelFromXp(xp);
  const levelStartXp = xpForLevel(displayLevel);
  const levelEndXp = xpForLevel(displayLevel + 1);
  const levelProgressXp = Math.max(0, xp - levelStartXp);
  const levelRequiredXp = levelEndXp - levelStartXp;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setNewName(petName || 'Scan-chan Jr.');
  }, [petName]);

  // Celebrate Level Up ONLY after profile is hydrated and level strictly exceeds lastCelebratedLevel
  useEffect(() => {
    if (!mounted || !isProfileLoaded || isCheckingSession) return;
    const celebrated = lastCelebratedLevel || 1;
    if (displayLevel > celebrated) {
      toast.success(`🎉 LEVEL UP! You reached Level ${displayLevel}!`, {
        description: `Pet Stage: ${STAGE_LABELS[getPetStageFromLevel(displayLevel)] || 'Evolved!'}`,
      });
      setLastCelebratedLevel(displayLevel);
    }
  }, [displayLevel, lastCelebratedLevel, mounted, isProfileLoaded, isCheckingSession, setLastCelebratedLevel]);

  // Real-time automatic midnight, time-based decay & day transition watcher
  useEffect(() => {
    if (!mounted || mode === null) return;

    const handleSync = () => {
      // In Hunter Mode, wait until profile has been hydrated from server
      // so midnight/decay watcher doesn't push unhydrated state to cloud
      if (mode === GameMode.ARASHU && !usePlayerStore.getState().isProfileLoaded) return;
      const currentKey = getLocalDateKey();
      setTodayKey(currentKey);
      checkDailyReset(currentKey);
      applyHungerDecay();
      applyAffectionDecay();
    };

    handleSync();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        handleSync();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleSync);

    // Periodic time-based decay & day check every 60 seconds
    const interval = setInterval(handleSync, 60000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleSync);
      clearInterval(interval);
    };
  }, [mounted, mode, checkDailyReset, applyHungerDecay, applyAffectionDecay]);

  // Mode & session verification
  useEffect(() => {
    if (!mounted || isSigningOutRef.current) return;
    setIsCheckingSession(true);

    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          const currentUserId = data.user.id;
          if (data.user.email) {
            usePlayerStore.setState({ userEmail: data.user.email });
          }
          if (mode !== GameMode.ARASHU) {
            setMode(GameMode.ARASHU);
          }
          const store = usePlayerStore.getState();
          // Kunci loadProfile: hanya panggil jika profil belum dimuat ATAU user login berbeda
          if (!store.isProfileLoaded || store.loadedUserId !== currentUserId) {
            loadProfile(currentUserId)
              .then(() => {
                const currentKey = getLocalDateKey();
                setTodayKey(currentKey);
                checkDailyReset(currentKey);
                applyHungerDecay();
                applyAffectionDecay();
              })
              .catch((err) => {
                console.error('Failed to load Hunter profile:', err);
              })
              .finally(() => {
                setIsCheckingSession(false);
              });
          } else {
            setIsCheckingSession(false);
          }
          // Sync any locally registered products to cloud in Hunter Mode
          useProductStore.getState().syncPendingToServer().catch(() => {});
          useProductStore.getState().fetchAndMergeCatalog().catch(() => {});
        } else if (mode === GameMode.GUEST) {
          setIsCheckingSession(false);
          if (!nickname) {
            setShowSetup(true);
          }
        } else {
          // Unauthenticated / Session Expired / 401
          setIsCheckingSession(false);
          if (mode === GameMode.ARASHU) {
            toast.error('Session expired. Please sign in again.');
            resetPlayer();
          }
          setActiveView('TITLE');
        }
      })
      .catch(() => {
        setIsCheckingSession(false);
        if (mode !== GameMode.GUEST) {
          setActiveView('TITLE');
        }
      });
  }, [mounted, mode, nickname, setMode, loadProfile, resetPlayer, setActiveView]);

  // Zero-flicker instant food loading from local store cache
  useEffect(() => {
    async function loadFood() {
      const barcodes = Object.keys(foodInventory).filter((b) => (foodInventory[b] || 0) > 0);
      if (barcodes.length === 0) {
        setFoodItems([]);
        setLoadingFood(false);
        return;
      }

      const localMap = useProductStore.getState().products;
      const initialItems: Product[] = [];
      const missingBarcodes: string[] = [];

      for (const barcode of barcodes) {
        if (barcode.startsWith('login-reward-')) {
          initialItems.push({
            id: barcode,
            barcodeNumber: barcode,
            productName: '🍱 Delicious Bento Box',
            category: 'Snack',
            brand: 'Scan-chan Bakery',
            description: 'A special treat reward from daily login!',
          } as any);
        } else if (localMap[barcode]) {
          initialItems.push(localMap[barcode]);
        } else {
          missingBarcodes.push(barcode);
        }
      }

      // If we already have items from cache, show them IMMEDIATELY (0ms, zero flicker)
      if (initialItems.length > 0) {
        setFoodItems(initialItems);
        setLoadingFood(false);
      } else {
        setLoadingFood(true);
      }

      // Fetch only barcodes missing from local store
      if (missingBarcodes.length > 0) {
        try {
          const res = await fetch(`/api/products?limit=50&barcodes=${missingBarcodes.join(',')}`);
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            for (const p of data.data) {
              useProductStore.getState().upsertProduct(p);
            }
            setFoodItems((prev) => {
              const prevBarcodes = new Set(prev.map((i) => i.barcodeNumber));
              const newlyFetched = (data.data as Product[]).filter((p) => !prevBarcodes.has(p.barcodeNumber));
              return [...prev, ...newlyFetched];
            });
          }
        } catch {
          const fallbacks = missingBarcodes.map((b) => ({
            id: b,
            barcodeNumber: b,
            productName: `Snack Item (${b.slice(-4)})`,
            category: 'Snack',
            brand: 'Pantry Snack',
          }));
          setFoodItems((prev) => [...prev, ...(fallbacks as any)]);
        } finally {
          setLoadingFood(false);
        }
      } else {
        setLoadingFood(false);
      }
    }
    loadFood();
  }, [foodInventory]);

  // ponytail: Load metadata for recent scans list in left panel
  useEffect(() => {
    async function loadRecentProducts() {
      const topBarcodes = Array.from(new Set(scanHistory.slice(0, 6)));
      if (topBarcodes.length === 0) return;

      // Populate from local product cache immediately
      const localProductMap = useProductStore.getState().products;
      const initialMap: Record<string, Product> = {};
      for (const b of topBarcodes) {
        if (localProductMap[b]) initialMap[b] = localProductMap[b];
      }
      if (Object.keys(initialMap).length > 0) {
        setRecentScanProducts((prev) => ({ ...prev, ...initialMap }));
      }

      try {
        const res = await fetch(`/api/products?limit=10&barcodes=${topBarcodes.join(',')}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const map: Record<string, Product> = {};
          data.data.forEach((p: Product) => {
            map[p.barcodeNumber] = p;
          });
          setRecentScanProducts((prev) => ({ ...prev, ...map }));
        }
      } catch {}
    }
    loadRecentProducts();
  }, [scanHistory]);

  // Sync catalog when opening Product Registry modal
  useEffect(() => {
    if (activeModal === 'catalog') {
      useProductStore.getState().fetchAndMergeCatalog().catch(() => {});
    }
  }, [activeModal]);

  const handleRegisterParam = useCallback((barcode: string) => {
    setRegisterInitialBarcode(barcode);
    setShowRegisterModal(true);
  }, []);

  const handleRegisterSuccess = useCallback(
    (barcode: string, category: string, productName?: string) => {
      const cleanBarcode = barcode.trim();
      registerProduct(cleanBarcode, category);
      setShowRegisterModal(false);
      const isFood = isFoodCategory(category);
      if (isFood) {
        toast.success('🎉 Product registered & added to Food Bag! 📦🍖', {
          description: productName
            ? `${productName} (+1 food in bag)`
            : '+1 food added to your bag',
        });
      } else {
        toast.success('🎉 Product registered to Catalog! 📋✨', {
          description: productName
            ? `${productName} (Added to catalog)`
            : 'Added to catalog',
        });
      }
    },
    [registerProduct]
  );

  const handleProductDeleted = useCallback(
    (barcode: string) => {
      unregisterProduct(barcode);
    },
    [unregisterProduct]
  );

  const handleSignOut = async () => {
    try {
      isSigningOutRef.current = true;
      await fetch('/api/auth/logout', { method: 'POST' });
      resetPlayer();
      try {
        localStorage.removeItem('scan-chan-player-state');
      } catch {}
      toast.success('Signed out. See you soon!');
      setActiveView('TITLE');
    } catch {
      isSigningOutRef.current = false;
      toast.error('Failed to sign out');
    }
  };

  // Cleanup bubble timer on unmount
  useEffect(() => {
    return () => {
      if (bubbleTimerRef.current) {
        clearTimeout(bubbleTimerRef.current);
      }
    };
  }, []);

  // Pet actions with debounced timer & dynamic mood-aware dialog
  const handleCatClick = () => {
    const petResult = petCat();
    let petBonusText = '';
    if (petResult.success) {
      if (petResult.isMaxedJustNow) {
        toast.success('Daily happiness bonus maxed (3/3)! You can still play with your pet 💕');
      } else {
        toast.success(`+5 Happiness! (${petResult.dailyCount}/3 daily pets) 💕`);
      }
      petBonusText = ' 💕 (+5 Happiness!)';
    } else if (petResult.reason === 'daily_limit') {
      const now = Date.now();
      if (now - lastPetToastTimeRef.current > 25000) {
        lastPetToastTimeRef.current = now;
        toast.info('Daily happiness bonus maxed (3/3)! You can still play with your pet 💕');
      }
    }
    // If cooldown: NO toast at all. User can tap freely and enjoy the cat animations & meows!

    let dialogs: string[];
    let actionToSet: CatActionId = 'none';

    if (petHunger === 0) {
      dialogs = [
        'X_X ...so hungry... need food to revive...',
        '*fainted* ...feed me snacks to wake up...',
        'Bleurgh... out of energy... 🍖',
        'Zzz... zero hunger... need treats... 💤',
        '*limp meow* ...food... please... 🐟',
      ];
      actionToSet = 'fainted';
    } else if (petHunger <= 25) {
      dialogs = [
        '*sniff* ...tummy hurts so bad... 😢',
        'Please... just one snack... 😿',
        'So weak... can’t hunt barcodes... 🥺',
        '*shivering softly* ...feed me please... 🐾',
        'Hungry tears... got any food? 💧',
      ];
      actionToSet = 'starving';
    } else if (petHunger < 50) {
      dialogs = [
        'So hungry... need snacks! 🥺',
        'Meow... tummy rumbles! 🍽️',
        'Got any biscuits or milk? 😿',
        '*Tummy rumbles softly* 🐾',
        'Feed me some treats! 🐟',
      ];
      actionToSet = 'hungry';
    } else if (petHunger >= 85 && petAffection >= 60) {
      dialogs = [
        'Full & super happy! Purrr~ 💕',
        'Best scanning partner ever! ✨',
        'Nyaaa~! Love you so much! 💖',
        '*Nuzzle nuzzle* So warm! 😻',
        'Thanks for taking care of me! 🐾',
      ];
      const happyActions: CatActionId[] = ['say-hi', 'excited', 'play'];
      actionToSet = happyActions[Math.floor(Math.random() * happyActions.length)];
    } else if (petHunger >= 70) {
      dialogs = [
        'Ready to hunt new barcodes! 📦',
        'Let’s find more tasty snacks! 🍱',
        'Sharp eyes looking for barcodes! 🔍',
        'Purrr... full of energy today! 😸',
        'Any exciting new finds? 🌟',
      ];
      const happyActions: CatActionId[] = ['say-hi', 'excited', 'play'];
      actionToSet = happyActions[Math.floor(Math.random() * happyActions.length)];
    } else {
      dialogs = [
        'Nyaaa~! 🐾',
        'Purrr... got any snacks? 🐈',
        'Meow! Ready to scan! ✨',
        'Pet me again! 😸',
        'Zzz... dreaming of barcodes... 💤',
        'What did you buy today? 🛍️',
      ];
      const normalActions: CatActionId[] = ['say-hi', 'play'];
      actionToSet = normalActions[Math.floor(Math.random() * normalActions.length)];
    }

    setCatAction(actionToSet);
    const speech = dialogs[Math.floor(Math.random() * dialogs.length)] + petBonusText;
    setSpeechBubble(speech);

    if (bubbleTimerRef.current) {
      clearTimeout(bubbleTimerRef.current);
    }
    bubbleTimerRef.current = setTimeout(() => {
      setCatAction('none');
      setSpeechBubble(null);
      bubbleTimerRef.current = null;
    }, 2800);
  };

  const handleSaveName = () => {
    const trimmed = newName.trim();
    if (trimmed.length > 0) {
      renamePet(trimmed);
      setIsEditingName(false);
      toast.success(`Partner renamed to ${trimmed}!`);
    }
  };

  const handleFeedItem = (barcode: string, category: string, productName?: string) => {
    const currentHunger = Number(petHunger) || 0;
    if (currentHunger >= 100) {
      toast.info(`${petName || 'Scan-chan'} is already full! 😸`);
      return;
    }
    const wasDead = currentHunger === 0;
    feedPet(barcode, category || 'Snack');

    const currentStreak = streak || 0;
    const streakMult = calculateStreakMultiplier(currentStreak);
    const catLower = (category || '').toLowerCase();
    let baseXp = 10;
    if (
      catLower.includes('dairy') || catLower.includes('milk') || catLower.includes('susu') || catLower.includes('cheese') || catLower.includes('yogurt') ||
      catLower.includes('instant') || catLower.includes('noodle') || catLower.includes('ramen') || catLower.includes('mie')
    ) {
      baseXp = 15;
    } else if (
      catLower.includes('snack') || catLower.includes('biscuit') || catLower.includes('cookie') || catLower.includes('camilan') ||
      catLower.includes('frozen') || catLower.includes('ice cream') || catLower.includes('es krim')
    ) {
      baseXp = 12;
    }
    const xpGained = Math.floor(baseXp * streakMult);
    const streakBonusText = streakMult > 1 ? ` (${streakMult.toFixed(1)}x Streak Bonus)` : '';

    if (wasDead) {
      setCatAction('excited');
      setSpeechBubble('Nyaaa~! Revived! Thank you for the treats! ✨💖');
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
      bubbleTimerRef.current = setTimeout(() => {
        setCatAction('none');
        setSpeechBubble(null);
        bubbleTimerRef.current = null;
      }, 3000);
      toast.success(`Revived ${petName || 'Partner'}! +${xpGained} XP${streakBonusText} 🌟`);
    } else {
      setCatAction('rewards');
      setTimeout(() => setCatAction('none'), 1800);
      toast.success(`Fed ${petName || 'Partner'} ${productName || 'snack'}! +${xpGained} XP${streakBonusText} 🍖`);
    }
  };

  // Calculate total food in inventory
  const totalFoodCount = useMemo(() => {
    return Object.values(foodInventory).reduce((acc, count) => acc + count, 0);
  }, [foodInventory]);

  // Full-Screen Loading Gate: covers entire UI only if in Hunter mode and waiting for profile hydration
  const isSyncing =
    !mounted ||
    (mode === GameMode.ARASHU && (!isProfileLoaded || isLoading));

  if (isSyncing && mode === GameMode.ARASHU) {
    return (
      <SyncLoadingGate
        message="LOADING..."
        error={error}
        onRetry={() => {
          setIsCheckingSession(true);
          loadProfile().finally(() => setIsCheckingSession(false));
        }}
      />
    );
  }

  const effectiveStage = getPetStageFromLevel(displayLevel);
  const catVariant = STAGE_AVATARS[effectiveStage] || (avatar as CatVariantId) || 'calico';

  return (
    <div className="relative w-full min-h-screen px-3 sm:px-4 py-4 sm:py-6 select-none overflow-x-hidden">
      {/* 1. Main Pixel Art Garden Background (z-0) */}
      <div className="fixed inset-0 w-full h-full pixelated z-0 pointer-events-none">
        <Image
          src="/images/garden-bg.webp"
          alt="Garden Background"
          fill
          priority
          quality={95}
          className="object-cover object-[center_75%] pixelated filter blur-[1px] brightness-95 scale-105"
          sizes="100vw"
        />
        {/* Soft atmospheric overlay agar kartu retro RPG terbaca kontras dan tajam */}
        <div className="absolute inset-0 bg-black/35 backdrop-blur-[0.5px]" />
      </div>

      <Suspense fallback={null}>
        <RegisterParamHandler onBarcode={handleRegisterParam} />
      </Suspense>

      <XpPopup />

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
        {showSettingsModal && (
          <SettingsModal
            key="settings-modal"
            isOpen={showSettingsModal}
            onClose={() => setShowSettingsModal(false)}
            onSignOut={handleSignOut}
            isCloudMode={mode === GameMode.ARASHU}
            userEmail={userEmail}
          />
        )}
      </AnimatePresence>

      {/* ── Single-Column Centered Stack with relative z-10 ── */}
      <div className="relative z-10 max-w-2xl mx-auto space-y-4">
        {/* ─── 0. TOP FLOATING RETRO RPG HUD BAR ───────────────────────── */}
        <header className="rpg-panel px-2.5 sm:px-3.5 py-2 flex items-center justify-between gap-1.5 sm:gap-2.5 shadow-md overflow-x-hidden">
          {/* Brand / Title */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Link href="/" className="flex items-center gap-1.5 hover:brightness-110 transition-transform">
              <span className="font-fredoka text-base sm:text-xl font-black text-white tracking-wide drop-shadow-[1.5px_1.5px_0_var(--theme-dark)]">
                SCAN CHAN
              </span>
            </Link>
            <span className="hidden sm:inline-block font-pixel text-[9px] text-[var(--theme-text-dark)] bg-white px-2 py-0.5 rounded-lg border-2 border-[var(--theme-border)] uppercase tracking-widest shadow-[2px_2px_0_0_var(--theme-shadow)]">
              Lobby
            </span>
          </div>

          {/* Right Badges & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Real-Time TikTok Streak Badge */}
            <div
              className={`rpg-inner-box px-2 py-1 text-xs font-bold flex items-center gap-1 sm:gap-1.5 shrink-0 transition-all ${
                streak > 0 && scannedToday
                  ? 'bg-white border-2 border-[var(--theme-border)] text-[var(--theme-primary)] shadow-[2px_2px_0_0_var(--theme-shadow)]'
                  : streak > 0
                  ? 'bg-[var(--theme-surface-inner)] border-2 border-[var(--theme-primary)] text-[var(--theme-primary)] shadow-[2px_2px_0_0_var(--theme-primary)] animate-pulse'
                  : 'bg-white/70 text-[var(--theme-text-dark)]/60 border border-[var(--theme-border)]/40'
              }`}
              title={
                streak > 0 && scannedToday
                  ? `🔥 ${streak} Days Streak Active! You've scanned today.`
                  : streak > 0
                  ? `⚠️ ${streak} Days Streak at risk! Scan a barcode today to maintain your streak.`
                  : '0 Days Streak - Scan a barcode today to start your streak!'
              }
            >
              <Flame
                className={`w-3.5 h-3.5 shrink-0 ${
                  streak > 0 && scannedToday
                    ? 'fill-[var(--theme-primary)] text-[var(--theme-primary)]'
                    : streak > 0
                    ? 'fill-[var(--theme-primary)]/60 text-[var(--theme-primary)]'
                    : 'text-[var(--theme-text-dark)]/40'
                }`}
              />
              <span className="font-pixel text-[10px]">{streak}d</span>
              {streak > 0 && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    scannedToday ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'
                  }`}
                />
              )}
            </div>

            {/* Settings Button (⚙️) */}
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              aria-label="Open settings"
              className="rpg-inner-box px-2 sm:px-2.5 py-1 min-h-[34px] sm:min-h-auto text-xs font-bold text-[var(--theme-text-dark)] hover:text-[var(--theme-primary)] hover:bg-[var(--theme-surface-inner)] cursor-pointer flex items-center justify-center gap-1 transition-colors shrink-0"
              title="Game Settings"
            >
              <Settings className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">Settings</span>
            </button>

            {/* Guide Button */}
            <button
              type="button"
              onClick={() => setActiveModal('guide')}
              aria-label="How to play"
              className="rpg-inner-box px-2 sm:px-2.5 py-1 min-h-[34px] sm:min-h-auto text-xs font-bold text-[var(--theme-text-dark)] hover:text-[var(--theme-primary)] hover:bg-[var(--theme-surface-inner)] cursor-pointer flex items-center justify-center gap-1 transition-colors shrink-0"
              title="How to Play"
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">Guide</span>
            </button>
          </div>
        </header>

        {/* ─── 1. PARTNER PET CARD (TOP - COMPACT HORIZONTAL PROFILE) ─── */}
        <section className="rpg-panel-gold p-4 sm:p-5 space-y-3.5 shadow-md relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-white/20 pb-2.5">
            <div className="space-y-0.5 truncate">
              <span className="font-pixel text-[9px] text-white tracking-widest uppercase block drop-shadow-[1px_1px_0_var(--theme-dark)] font-bold">
                ⭐ Your Partner Companion
              </span>
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      maxLength={18}
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-white border-2 border-[var(--theme-border)] text-[var(--theme-text-dark)] font-fredoka font-bold px-2 py-0.5 rounded text-base outline-none shadow-[2px_2px_0_0_var(--theme-shadow)]"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      className="p-1 rounded bg-[var(--theme-primary)] hover:brightness-110 text-white cursor-pointer border border-white"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="font-fredoka text-xl sm:text-2xl font-black text-white tracking-wide truncate drop-shadow-[1.5px_1.5px_0_var(--theme-dark)]">
                      {petName || 'Scan-chan Jr.'}
                    </h2>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-1 text-white/80 hover:text-white cursor-pointer transition-colors drop-shadow-[1px_1px_0_var(--theme-dark)]"
                      title="Rename partner"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="font-pixel text-[9px] text-white font-semibold leading-none drop-shadow-[1px_1px_0_var(--theme-dark)]">
                  {STAGE_LABELS[effectiveStage] || 'Kitten'}
                </p>
                <span className="font-pixel text-[8px] bg-white/20 text-white px-1.5 py-0.5 rounded border border-white/30 drop-shadow-[1px_1px_0_var(--theme-dark)]">
                  Pets: {petsToday}/3 💕
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="font-pixel text-xs text-white font-bold drop-shadow-[1px_1px_0_var(--theme-dark)]">
                LEVEL {displayLevel}
              </div>
              <div className="font-mono text-[10px] text-white font-semibold drop-shadow-[1px_1px_0_var(--theme-dark)]">
                {levelProgressXp} / {levelRequiredXp} XP
              </div>
            </div>
          </div>

          {/* Responsive Profile View: Centered column on mobile, row on tablet/desktop */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-5 w-full">
            {/* Centered Garden Paddock with Pet */}
            <div
              onClick={handleCatClick}
              className="w-44 h-44 sm:w-48 sm:h-48 rounded-2xl bg-[var(--theme-surface-inner)] border-2 border-[var(--theme-border)] flex flex-col items-center justify-center cursor-pointer group shadow-[3px_3px_0_0_var(--theme-shadow)] shrink-0 relative mt-5 sm:mt-0 transition-transform hover:scale-[1.02] active:scale-95"
              title="Click your partner to interact!"
            >
              <AnimatePresence>
                {speechBubble && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.8 }}
                    animate={{ opacity: 1, y: -24, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.8 }}
                    transition={{ type: 'spring', damping: 14, stiffness: 220 }}
                    className="absolute -top-3 z-30 px-2.5 py-1.5 rounded-lg bg-white border-2 border-[var(--theme-border)] text-[var(--theme-text-dark)] font-pixel text-[9px] shadow-[3px_3px_0_0_var(--theme-shadow)] pointer-events-none max-w-[210px] text-center"
                  >
                    {speechBubble}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="transition-transform duration-200 group-hover:scale-108 active:scale-95 flex items-center justify-center -translate-y-2">
                <PixelCat variant={catVariant} action={catAction} hunger={petHunger} size={120} />
              </div>

              <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none z-10 px-2 flex justify-center">
                <span className={`font-pixel text-[8px] px-2 py-0.5 rounded-md border shadow-xs transition-colors ${
                  petHunger === 0
                    ? 'bg-rose-50 border-rose-300 text-rose-600 font-bold animate-pulse'
                    : petHunger <= 25
                    ? 'bg-amber-50 border-amber-300 text-amber-600 font-bold animate-pulse'
                    : petsToday >= 3
                    ? 'bg-white/80 border-[var(--theme-border)]/40 text-[var(--theme-text-dark)]/70'
                    : 'bg-white/95 border-[var(--theme-border)] text-[var(--theme-text-dark)] group-hover:text-[var(--theme-primary)]'
                }`}>
                  {petHunger === 0
                    ? '[Feed to Revive! 🍖]'
                    : petHunger <= 25
                    ? '[Feed Me! 😿]'
                    : petsToday >= 3
                    ? '[All Pets Done Today ✨]'
                    : `[Tap to Pet • ${petsToday}/3 💕]`}
                </span>
              </div>
            </div>

            {/* XP Bar & Vitals */}
            <div className="flex-1 w-full space-y-3">
              {/* XP Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-pixel font-bold text-white drop-shadow-[1px_1px_0_var(--theme-dark)]">
                  <span>Level XP Progress</span>
                  <span>
                    {Math.round((levelProgressXp / levelRequiredXp) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-[var(--theme-surface-inner)] border-2 border-[var(--theme-border)] rounded-full h-2.5 overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]">
                  <div
                    className="bg-[var(--theme-primary)] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (levelProgressXp / levelRequiredXp) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Vitals Grid (Hunger & Happiness) */}
              <div className="grid grid-cols-2 gap-2 rpg-inner-box p-2.5">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold font-fredoka">
                    <span className="flex items-center gap-1 text-[var(--theme-text-dark)] text-[11px]">
                      <Utensils className="w-3.5 h-3.5 text-[var(--theme-primary)]" /> Hunger
                    </span>
                    <span className="font-pixel text-[9px] text-[var(--theme-text-dark)] font-bold">{petHunger}%</span>
                  </div>
                  <div className="w-full bg-[var(--theme-surface-inner)] border-2 border-[var(--theme-border)] rounded-full h-2.5 overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]">
                    <div
                      className="bg-[var(--theme-primary)] h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, petHunger)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold font-fredoka">
                    <span className="flex items-center gap-1 text-[var(--theme-text-dark)] text-[11px]">
                      <Heart className="w-3.5 h-3.5 fill-[var(--theme-primary)] text-[var(--theme-primary)]" /> Happiness
                    </span>
                    <span className="font-pixel text-[9px] text-[var(--theme-text-dark)] font-bold">{petAffection}%</span>
                  </div>
                  <div className="w-full bg-[var(--theme-surface-inner)] border-2 border-[var(--theme-border)] rounded-full h-2.5 overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]">
                    <div
                      className="bg-[var(--theme-primary)] h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, petAffection)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Feed Row */}
          <div className="space-y-1.5 pt-1 border-t border-white/20">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-[9px] text-white uppercase tracking-wider drop-shadow-[1px_1px_0_var(--theme-dark)] font-bold">
                🍱 Quick Feed from Bag
              </span>
              <button
                onClick={() => setActiveModal('bag')}
                className="font-fredoka text-xs text-white font-bold underline hover:brightness-110 drop-shadow-[1px_1px_0_var(--theme-dark)] cursor-pointer"
              >
                View Bag ({totalFoodCount})
              </button>
            </div>

            {foodItems.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {foodItems.slice(0, 4).map((food) => {
                    const qty = foodInventory[food.barcodeNumber] || 1;
                    return (
                      <div
                        key={food.barcodeNumber}
                        className="rpg-inner-box p-2.5 flex flex-col justify-between gap-2"
                      >
                        {/* Baris atas: Nama produk + badge jumlah stok */}
                        <div className="flex items-center justify-between gap-1.5 min-w-0">
                          <p
                            className="font-fredoka font-bold text-xs text-[var(--theme-text-dark)] truncate flex-1 min-w-0"
                            title={food.productName}
                          >
                            {food.productName}
                          </p>
                          <span className="font-pixel text-[8px] text-[var(--theme-primary)] bg-white px-1.5 py-0.5 rounded border border-[var(--theme-border)] shrink-0 font-bold">
                            x{qty}
                          </span>
                        </div>

                        {/* Baris bawah: Tombol Feed selebar kartu */}
                        <button
                          type="button"
                          disabled={petHunger >= 100}
                          onClick={() => handleFeedItem(food.barcodeNumber, food.category || 'Snack', food.productName)}
                          className={`w-full py-1.5 rounded-lg font-fredoka font-bold text-xs border border-white transition-all flex items-center justify-center gap-1 ${
                            petHunger >= 100
                              ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60 shadow-none'
                              : 'bg-[var(--theme-primary)] hover:brightness-110 active:scale-95 text-white cursor-pointer shadow-[2px_2px_0_0_var(--theme-shadow)]'
                          }`}
                        >
                          {petHunger >= 100 ? 'Full 😸' : 'Feed 🍖'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {foodItems.length > 4 && (
                  <button
                    type="button"
                    onClick={() => setActiveModal('bag')}
                    className="w-full py-1.5 text-center font-fredoka font-bold text-xs text-white hover:underline drop-shadow-[1px_1px_0_var(--theme-dark)] cursor-pointer"
                  >
                    View All ({foodItems.length} items) →
                  </button>
                )}
              </div>
            ) : (
              <div className="rpg-inner-box px-3 py-2 flex items-center justify-center text-center text-xs">
                <span className="text-[11px] sm:text-xs text-[var(--theme-text-dark)] font-medium">
                  🥨 Bag is empty! Scan items for treats
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ─── 2. PRIMARY ACTION CARD ──────────────────────────────────── */}
        <section className="rpg-panel p-4 sm:p-5 space-y-2.5 shadow-md">
          <span className="font-pixel text-[10px] text-white tracking-widest uppercase drop-shadow-[1px_1px_0_var(--theme-dark)] font-bold">
            Primary Action
          </span>

          {/* Big Scan Barcode Button */}
          <button
            onClick={() => setActiveView('SCAN')}
            className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-white text-[var(--theme-primary)] font-fredoka font-black text-xl tracking-wide flex items-center justify-center gap-3 border-2 border-[var(--theme-border)] shadow-[4px_4px_0_0_var(--theme-shadow)] hover:bg-[var(--theme-surface-inner)] active:translate-y-0.5 active:shadow-[1px_1px_0_0_var(--theme-shadow)] transition-all cursor-pointer select-none text-center"
          >
            <ScanLine className="w-6 h-6 stroke-[2.5]" />
            <span>SCAN BARCODE</span>
          </button>
        </section>

        {/* ─── 3. LOBBY NAVIGATION (3-COLUMN ROW) ───────────────────────── */}
        <section className="rpg-panel p-3.5 sm:p-5 space-y-2.5 shadow-md">
          <span className="font-pixel text-[10px] text-white tracking-widest uppercase drop-shadow-[1px_1px_0_var(--theme-dark)] font-bold">
            Lobby Navigation
          </span>

          <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
            {/* 1. Food Bag */}
            <button
              onClick={() => setActiveModal('bag')}
              className="rpg-btn-menu p-2 sm:p-3 flex flex-col items-center justify-center gap-1 sm:gap-1.5 cursor-pointer text-center relative group min-h-[72px]"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--theme-surface-inner)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-primary)] group-hover:scale-105 transition-transform shrink-0">
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="font-fredoka font-bold text-[11px] sm:text-xs text-[var(--theme-text-dark)] leading-tight">Food Bag</span>
              <span className="font-pixel text-[7.5px] sm:text-[8px] text-[var(--theme-primary)] truncate max-w-full">
                {totalFoodCount} Snacks
              </span>
            </button>

            {/* 2. Catalog */}
            <button
              onClick={() => setActiveModal('catalog')}
              className="rpg-btn-menu p-2 sm:p-3 flex flex-col items-center justify-center gap-1 sm:gap-1.5 cursor-pointer text-center relative group min-h-[72px]"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--theme-surface-inner)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-primary)] group-hover:scale-105 transition-transform shrink-0">
                <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="font-fredoka font-bold text-[11px] sm:text-xs text-[var(--theme-text-dark)] leading-tight">Catalog</span>
              <span className="font-pixel text-[7.5px] sm:text-[8px] text-[var(--theme-primary)] truncate max-w-full">Registered</span>
            </button>

            {/* 3. History */}
            <button
              onClick={() => setActiveModal('history')}
              className="rpg-btn-menu p-2 sm:p-3 flex flex-col items-center justify-center gap-1 sm:gap-1.5 cursor-pointer text-center relative group min-h-[72px]"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--theme-surface-inner)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-primary)] group-hover:scale-105 transition-transform shrink-0">
                <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="font-fredoka font-bold text-[11px] sm:text-xs text-[var(--theme-text-dark)] leading-tight">History</span>
              <span className="font-pixel text-[7.5px] sm:text-[8px] text-[var(--theme-primary)] truncate max-w-full">Timeline</span>
            </button>
          </div>
        </section>

        {/* ─── 4. RECENT SCANS / HISTORY LOG PANEL ─────────────────────── */}
        <section className="rpg-panel p-4 sm:p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-[10px] text-white tracking-widest uppercase flex items-center gap-1.5 drop-shadow-[1px_1px_0_var(--theme-dark)] font-bold">
              📜 Recent Scans / Latest Logs
            </span>
            <button
              onClick={() => setActiveModal('history')}
              className="text-xs font-fredoka text-white font-bold underline hover:brightness-110 drop-shadow-[1px_1px_0_var(--theme-dark)] cursor-pointer"
            >
              View Full History →
            </button>
          </div>

          {scanHistory.length > 0 ? (
            <div className="space-y-2">
              {scanHistory.slice(0, 4).map((barcode, idx) => {
                const prod = recentScanProducts[barcode];
                const name = prod?.productName || `Scanned Item #${barcode.slice(-4)}`;
                const time = formatRelativeTime(lastScanTime[barcode]);
                return (
                  <div
                    key={`${barcode}-${idx}`}
                    className="rpg-inner-box px-3 py-2 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 truncate">
                      <div className="w-8 h-8 rounded-lg bg-white border border-[var(--theme-border)]/60 flex items-center justify-center shrink-0 shadow-xs">
                        <CategoryIcon category={prod?.category} size={16} />
                      </div>
                      <div className="min-w-0 flex-1 truncate">
                        <p className="font-fredoka font-bold text-sm text-[var(--theme-text-dark)] truncate">
                          {name}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="font-pixel text-[8px] text-[var(--theme-text-dark)]/70">{time}</span>
                          {prod?.category && (
                            <span className="font-fredoka text-[10px] text-[var(--theme-primary)] font-semibold">
                              • {prod.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isFoodCategory(prod?.category) ? (
                        <span className="font-pixel text-[9px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 font-bold flex items-center gap-1">
                          +1 Food 🍖
                        </span>
                      ) : (
                        <span className="font-pixel text-[9px] text-[var(--theme-text-dark)]/80 bg-[var(--theme-surface-inner)] px-2 py-0.5 rounded border border-[var(--theme-border)] font-semibold flex items-center gap-1">
                          Cataloged 📋
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rpg-inner-box p-6 text-center space-y-1.5">
              <p className="font-fredoka text-sm text-[var(--theme-primary)] font-bold">
                No scans yet. Get scanning! 🔍
              </p>
              <p className="text-xs text-[var(--theme-text-dark)]/80 font-nunito">
                Point your webcam at snack or drink barcodes to fill your food bag!
              </p>
            </div>
          )}
        </section>
      </div>

      {/* ─── 3. RETRO RPG DIALOG MODALS ───────────────────────────────── */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-black/75 backdrop-blur-xs select-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`rpg-panel-gold w-[94vw] ${activeModal === 'guide' ? 'max-w-4xl' : 'max-w-2xl'} max-h-[85dvh] flex flex-col p-3.5 sm:p-6 shadow-[6px_6px_0_0_var(--theme-shadow)] relative overflow-hidden`}
            >
              {/* Modal Header (Sticky) */}
              <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4 shrink-0">
                <div className="flex items-center gap-2 text-white min-w-0">
                  {activeModal === 'bag' && <ShoppingBag className="w-5 h-5 text-white shrink-0" />}
                  {activeModal === 'catalog' && <Package className="w-5 h-5 text-white shrink-0" />}
                  {activeModal === 'history' && <History className="w-5 h-5 text-white shrink-0" />}
                  {activeModal === 'guide' && <BookOpen className="w-5 h-5 text-white shrink-0" />}
                  <h3 className="font-fredoka text-lg sm:text-xl font-black uppercase tracking-wider text-white drop-shadow-[1.5px_1.5px_0_var(--theme-dark)] truncate">
                    {activeModal === 'bag' && 'Food Bag'}
                    {activeModal === 'catalog' && 'Product Registry'}
                    {activeModal === 'history' && 'Scan History'}
                    {activeModal === 'guide' && 'How to Play'}
                  </h3>
                </div>

                <button
                  onClick={() => setActiveModal(null)}
                  className="rpg-inner-box min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-[var(--theme-text-dark)] hover:text-[var(--theme-primary)] hover:bg-[var(--theme-surface-inner)] cursor-pointer shrink-0"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto pr-1 space-y-4 flex-1 text-foreground">
                {/* 1. BAG MODAL */}
                {activeModal === 'bag' && (
                  <div className="space-y-4 text-white">
                    <div className="flex items-center text-xs text-white drop-shadow-[1px_1px_0_var(--theme-dark)]">
                      <span>Total Items Collected: {totalFoodCount}</span>
                    </div>

                    {foodItems.length === 0 ? (
                      <div className="rpg-inner-box p-8 text-center text-[var(--theme-text-dark)] space-y-2">
                        <p className="font-fredoka text-lg font-bold">Your Bag is Empty! 🎒</p>
                        <p className="text-xs">
                          Point your webcam at barcode snacks, drinks, or groceries to collect food
                          for Scan-chan!
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {foodItems.map((food) => {
                          const qty = foodInventory[food.barcodeNumber] || 1;
                          return (
                            <div
                              key={food.barcodeNumber}
                              className="rpg-inner-box p-3 flex items-center justify-between gap-3"
                            >
                              <div className="truncate space-y-0.5">
                                <h4 className="font-fredoka font-bold text-sm text-[var(--theme-text-dark)] truncate">
                                  {food.productName}
                                </h4>
                                <p className="text-xs text-[var(--theme-text-dark)]/70">
                                  {food.category || 'Snack'} • {food.brand || 'Brand'}
                                </p>
                                <span className="inline-block font-pixel text-[9px] text-[var(--theme-primary)] font-bold">
                                  Quantity: {qty}x
                                </span>
                              </div>
                              <button
                                disabled={petHunger >= 100}
                                onClick={() =>
                                  handleFeedItem(food.barcodeNumber, food.category || 'Snack', food.productName)
                                }
                                className={`px-3 py-1.5 rounded-lg font-fredoka font-bold text-xs border border-white shrink-0 transition-all ${
                                  petHunger >= 100
                                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60 shadow-none'
                                    : 'bg-[var(--theme-primary)] hover:brightness-110 active:scale-95 text-white cursor-pointer shadow-[2px_2px_0_0_var(--theme-shadow)]'
                                }`}
                              >
                                {petHunger >= 100 ? 'Full 😸' : 'Feed 🍖'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. CATALOG MODAL */}
                {activeModal === 'catalog' && (
                  <div>
                    <ProductList
                      creatorId={creatorId}
                      onProductDeleted={handleProductDeleted}
                    />
                  </div>
                )}

                {/* 3. HISTORY MODAL */}
                {activeModal === 'history' && (
                  <div>
                    <ScanHistory />
                  </div>
                )}

                {/* 4. GUIDE MODAL */}
                {activeModal === 'guide' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 text-white">
                    {/* Section 1: Scan & Collect */}
                    <div className="rpg-inner-box p-3.5 sm:p-4.5 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2.5 pb-1 border-b border-black/10">
                          <div className="w-8 h-8 rounded-xl bg-[var(--theme-primary)] flex items-center justify-center shrink-0 border-2 border-white shadow-[2px_2px_0_0_var(--theme-shadow)]">
                            <Crosshair className="w-4 h-4 text-white" />
                          </div>
                          <h4 className="font-fredoka font-black text-sm sm:text-base text-[var(--theme-text-dark)] uppercase tracking-wide">
                            Scan & Collect
                          </h4>
                        </div>
                        <ul className="space-y-2 list-disc list-outside pl-4 text-xs sm:text-sm font-nunito text-[var(--theme-text-dark)] font-semibold leading-relaxed">
                          <li>
                            Point camera at any <strong>1D retail barcode</strong> (EAN-13, UPC-A, etc.) on food & drink packaging.
                          </li>
                          <li>
                            Scanning consumable products adds <strong>1 food item</strong> directly to your Food Bag.
                          </li>
                          <li>
                            <strong>Daily First Scan Bonus</strong>: Earn <strong>+20 XP</strong> on your very first scan each day (WIB)!
                          </li>
                          <li>
                            <strong>Global Discovery Bonus</strong>: Discover and register a brand new barcode for <strong>+40 bonus XP</strong>!
                          </li>
                          <li>
                            Scan daily to build your <strong>Daily Streak</strong> and unlock up to <strong>2.5x XP Multiplier</strong> when feeding!
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Section 2: Hunger & Feeding */}
                    <div className="rpg-inner-box p-3.5 sm:p-4.5 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2.5 pb-1 border-b border-black/10">
                          <div className="w-8 h-8 rounded-xl bg-[var(--theme-primary)] flex items-center justify-center shrink-0 border-2 border-white shadow-[2px_2px_0_0_var(--theme-shadow)]">
                            <Utensils className="w-4 h-4 text-white" />
                          </div>
                          <h4 className="font-fredoka font-black text-sm sm:text-base text-[var(--theme-text-dark)] uppercase tracking-wide">
                            Hunger & Feeding
                          </h4>
                        </div>
                        <ul className="space-y-2 list-disc list-outside pl-4 text-xs sm:text-sm font-nunito text-[var(--theme-text-dark)] font-semibold leading-relaxed">
                          <li>
                            Feed your companion from the <strong>Food Bag</strong> using items you scanned.
                          </li>
                          <li>
                            Base XP scales with your <strong>Daily Streak Multiplier</strong>:
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2">
                              <div className="flex items-center justify-between font-pixel text-[9px] bg-emerald-50 text-emerald-900 px-2 py-1.5 rounded-lg border border-emerald-300 font-bold">
                                <span>🥛 Dairy / Milk</span>
                                <span className="text-emerald-700">15 XP · +20 🍖</span>
                              </div>
                              <div className="flex items-center justify-between font-pixel text-[9px] bg-orange-50 text-orange-900 px-2 py-1.5 rounded-lg border border-orange-300 font-bold">
                                <span>🍜 Instant Noodle</span>
                                <span className="text-orange-700">15 XP · +25 🍖</span>
                              </div>
                              <div className="flex items-center justify-between font-pixel text-[9px] bg-amber-50 text-amber-900 px-2 py-1.5 rounded-lg border border-amber-300 font-bold">
                                <span>🍪 Snack / Biscuit</span>
                                <span className="text-amber-700">12 XP · +15 🍖</span>
                              </div>
                              <div className="flex items-center justify-between font-pixel text-[9px] bg-sky-50 text-sky-900 px-2 py-1.5 rounded-lg border border-sky-300 font-bold">
                                <span>🧃 Drink / Other</span>
                                <span className="text-sky-700">10 XP · +12 🍖</span>
                              </div>
                            </div>
                          </li>
                          <li>
                            Snacks grant <strong>+10 Affection</strong>, other foods <strong>+3 Affection</strong>. New food types give <strong>+5 variety bonus</strong>!
                          </li>
                          <li>
                            Hunger caps at <strong>100%</strong>. Decays at <strong>1 pt / 10 mins</strong> (6 pts/hr). If hunger drops to <strong>0%</strong>, feed to revive!
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Section 3: Happiness & Petting */}
                    <div className="rpg-inner-box p-3.5 sm:p-4.5 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2.5 pb-1 border-b border-black/10">
                          <div className="w-8 h-8 rounded-xl bg-[var(--theme-primary)] flex items-center justify-center shrink-0 border-2 border-white shadow-[2px_2px_0_0_var(--theme-shadow)]">
                            <Heart className="w-4 h-4 text-white" />
                          </div>
                          <h4 className="font-fredoka font-black text-sm sm:text-base text-[var(--theme-text-dark)] uppercase tracking-wide">
                            Happiness & Petting
                          </h4>
                        </div>
                        <ul className="space-y-2 list-disc list-outside pl-4 text-xs sm:text-sm font-nunito text-[var(--theme-text-dark)] font-semibold leading-relaxed">
                          <li>
                            Tap your pet for <strong>+5 Happiness</strong> (up to <strong>3 times/day</strong>, 10s cooldown).
                          </li>
                          <li>
                            Happiness decays slowly over time — pet and feed regularly to keep Scan-chan cheerful and energized.
                          </li>
                          <li>
                            You can tap and interact with your pet anytime to hear cute meows and see custom pixel animations, even after hitting the daily bonus limit.
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Section 4: Evolution & Progression */}
                    <div className="rpg-inner-box p-3.5 sm:p-4.5 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2.5 pb-1 border-b border-black/10">
                          <div className="w-8 h-8 rounded-xl bg-[var(--theme-primary)] flex items-center justify-center shrink-0 border-2 border-white shadow-[2px_2px_0_0_var(--theme-shadow)]">
                            <TrendingUp className="w-4 h-4 text-white" />
                          </div>
                          <h4 className="font-fredoka font-black text-sm sm:text-base text-[var(--theme-text-dark)] uppercase tracking-wide">
                            Evolution & Stages
                          </h4>
                        </div>
                        <ul className="space-y-2 list-disc list-outside pl-4 text-xs sm:text-sm font-nunito text-[var(--theme-text-dark)] font-semibold leading-relaxed">
                          <li>
                            Earn <strong>XP</strong> from scans and feeding to unlock new evolution stages and dynamic pixel cat avatars:
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2">
                              <div className="flex items-center justify-between font-pixel text-[9px] bg-slate-50 text-slate-800 px-2 py-1.5 rounded-lg border border-slate-300 font-bold">
                                <span>🍼 Kitten</span>
                                <span className="text-[8px] bg-slate-200/80 px-1.5 py-0.5 rounded">Lv 1 – 4</span>
                              </div>
                              <div className="flex items-center justify-between font-pixel text-[9px] bg-lime-50 text-lime-800 px-2 py-1.5 rounded-lg border border-lime-300 font-bold">
                                <span>🐾 Young Cat</span>
                                <span className="text-[8px] bg-lime-200/80 px-1.5 py-0.5 rounded">Lv 5 – 9</span>
                              </div>
                              <div className="flex items-center justify-between font-pixel text-[9px] bg-blue-50 text-blue-800 px-2 py-1.5 rounded-lg border border-blue-300 font-bold">
                                <span>⚡ Adult Cat</span>
                                <span className="text-[8px] bg-blue-200/80 px-1.5 py-0.5 rounded">Lv 10 – 19</span>
                              </div>
                              <div className="flex items-center justify-between font-pixel text-[9px] bg-purple-50 text-purple-800 px-2 py-1.5 rounded-lg border border-purple-300 font-bold">
                                <span>🔮 Wise Cat</span>
                                <span className="text-[8px] bg-purple-200/80 px-1.5 py-0.5 rounded">Lv 20 – 29</span>
                              </div>
                              <div className="sm:col-span-2 flex items-center justify-between font-pixel text-[9px] bg-amber-50 text-amber-900 px-2 py-1.5 rounded-lg border border-amber-300 font-bold">
                                <span>👑 Legendary Cat</span>
                                <span className="text-[8px] bg-amber-200/80 px-1.5 py-0.5 rounded">Level 30+</span>
                              </div>
                            </div>
                          </li>
                          <li>
                            Rename your companion anytime directly from the partner card in the lobby!
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Section 5: Hunter vs Guest Mode (Full Width) */}
                    <div className="rpg-inner-box p-3.5 sm:p-4.5 space-y-3 md:col-span-2">
                      <div className="flex items-center gap-2.5 pb-1 border-b border-black/10">
                        <div className="w-8 h-8 rounded-xl bg-[var(--theme-primary)] flex items-center justify-center shrink-0 border-2 border-white shadow-[2px_2px_0_0_var(--theme-shadow)]">
                          <Cloud className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="font-fredoka font-black text-sm sm:text-base text-[var(--theme-text-dark)] uppercase tracking-wide">
                          Hunter Mode vs Guest Mode
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-[var(--theme-text-dark)] space-y-1.5">
                          <span className="font-fredoka font-bold text-xs sm:text-sm text-amber-900 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                            Hunter Mode (Cloud Account)
                          </span>
                          <p className="font-nunito text-xs text-amber-950/85 leading-relaxed font-semibold">
                            Sign in with Google. All scans, registered products, streaks, and cat evolution stages are securely synced to the cloud and accessible across any smartphone or PC.
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200 text-[var(--theme-text-dark)] space-y-1.5">
                          <span className="font-fredoka font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                            <Cloud className="w-4 h-4 text-slate-500 shrink-0" />
                            Guest Mode (Local Browser Only)
                          </span>
                          <p className="font-nunito text-xs text-slate-950/85 leading-relaxed font-semibold">
                            Progress is stored strictly in your local browser memory. Clearing browser cookies or cache will erase local progress. Switch to Hunter mode anytime from Settings.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
