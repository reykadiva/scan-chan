'use client';

import { useState, useEffect, useCallback, Suspense, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  ScanLine,
  Plus,
  Flame,
  History,
  Package,
  LogOut,
  Edit2,
  Check,
  X,
  ShoppingBag,
  Heart,
  Utensils,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import { PixelCat, type CatVariantId, type CatActionId } from '@/components/game/pixel-cat';
import { usePlayerStore, xpForLevel, levelFromXp } from '@/stores/player-store';
import { GameMode } from '@/lib/game-config';
import { NicknameSetup } from '@/components/game/nickname-setup';
import { RegisterProductModal } from '@/components/game/register-product-modal';
import { SettingsModal } from '@/components/game/settings-modal';
import { ProductList } from '@/components/game/product-list';
import { ScanHistory } from '@/components/game/scan-history';
import { XpPopup } from '@/components/game/xp-popup';
import { hasScannedToday, getTodayString } from '@/lib/streak-helpers';
import type { Product } from '@/types';

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

// ponytail: Quick semantic emoji mapper for Indonesian snacks & everyday items
function getProductEmoji(name?: string, category?: string | null): string {
  const text = `${name || ''} ${category || ''}`.toLowerCase();
  if (text.includes('indomie') || text.includes('mie') || text.includes('noodle')) return '🍜';
  if (text.includes('teh') || text.includes('botol') || text.includes('drink') || text.includes('air') || text.includes('water') || text.includes('soda')) return '🥤';
  if (text.includes('susu') || text.includes('milk') || text.includes('dairy') || text.includes('cheese') || text.includes('keju')) return '🥛';
  if (text.includes('kopi') || text.includes('coffee')) return '☕';
  if (text.includes('snack') || text.includes('chiki') || text.includes('chip') || text.includes('wafer') || text.includes('biskuit')) return '🥨';
  if (text.includes('roti') || text.includes('bread') || text.includes('bakery')) return '🍞';
  if (text.includes('bento') || text.includes('nasi') || text.includes('rice')) return '🍱';
  return '📦';
}

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

type ModalTab = 'bag' | 'catalog' | 'history' | null;

export default function GameHubPage() {
  const router = useRouter();

  const {
    mode,
    nickname,
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
  } = usePlayerStore();

  const [activeModal, setActiveModal] = useState<ModalTab>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [registerInitialBarcode, setRegisterInitialBarcode] = useState('');
  const [mounted, setMounted] = useState(false);
  const isSigningOutRef = useRef(false);

  // Real-time daily streak calculation (TikTok style)
  const todayStr = useMemo(() => getTodayString(), []);
  const scannedToday = hasScannedToday(lastActiveDate, todayStr);

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

  const [lastLevel, setLastLevel] = useState(() => levelFromXp(xp));
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

  useEffect(() => {
    if (!mounted) return;
    if (displayLevel > lastLevel) {
      toast.success(`🎉 LEVEL UP! You reached Level ${displayLevel}!`);
      setLastLevel(displayLevel);
    }
  }, [displayLevel, lastLevel, mounted]);

  useEffect(() => {
    if (!mounted || mode === null) return;
    const localDateString = new Date().toLocaleDateString('en-CA');
    checkDailyReset(localDateString);
  }, [mounted, mode, checkDailyReset]);

  // Mode verification
  useEffect(() => {
    if (!mounted || isSigningOutRef.current) return;

    if (mode === null) {
      router.push('/play/mode');
      return;
    }

    if (mode === GameMode.GUEST && !nickname) {
      setShowSetup(true);
      return;
    }

    if (mode === GameMode.ARASHU) {
      fetch('/api/auth/session')
        .then((res) => res.json())
        .then((data) => {
          if (!data.authenticated) {
            toast.error('Session expired. Please sign in again.');
            resetPlayer();
            router.push('/?auth=true');
          } else {
            loadProfile();
          }
        })
        .catch(() => {});
    }
  }, [mode, nickname, mounted, router, loadProfile, resetPlayer]);

  // Load food inventory products
  useEffect(() => {
    async function loadFood() {
      const barcodes = Object.keys(foodInventory).filter((b) => (foodInventory[b] || 0) > 0);
      if (barcodes.length === 0) {
        setFoodItems([]);
        return;
      }
      setLoadingFood(true);
      try {
        const dbBarcodes = barcodes.filter((b) => !b.startsWith('login-reward-'));
        let dbProducts: Product[] = [];
        if (dbBarcodes.length > 0) {
          const res = await fetch(`/api/products?limit=50&barcodes=${dbBarcodes.join(',')}`);
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            dbProducts = data.data;
          }
        }

        // Add login rewards
        const allItems: any[] = [...dbProducts];
        for (const barcode of barcodes) {
          if (barcode.startsWith('login-reward-')) {
            allItems.push({
              id: barcode,
              barcodeNumber: barcode,
              productName: '🍱 Delicious Bento Box',
              category: 'Snack',
              brand: 'Scan-chan Bakery',
              description: 'A special treat reward from daily login!',
            });
          }
        }
        setFoodItems(allItems);
      } catch {
        // Fallback placeholder items for food
        const fallbacks = barcodes.map((b) => ({
          id: b,
          barcodeNumber: b,
          productName: `Snack Item (${b.slice(-4)})`,
          category: 'Snack',
          brand: 'Pantry Snack',
        }));
        setFoodItems(fallbacks as any);
      } finally {
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

  const handleRegisterParam = useCallback((barcode: string) => {
    setRegisterInitialBarcode(barcode);
    setShowRegisterModal(true);
  }, []);

  const handleOpenRegisterModal = useCallback(() => {
    setRegisterInitialBarcode('');
    setShowRegisterModal(true);
  }, []);

  const handleRegisterSuccess = useCallback(
    (barcode: string, category: string) => {
      registerProduct(barcode, category);
      setShowRegisterModal(false);
      toast.success('Product registered to catalog! 📦');
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
      window.location.href = '/';
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
    const speech = dialogs[Math.floor(Math.random() * dialogs.length)];
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
    if (petHunger >= 100) {
      toast.info(`${petName || 'Scan-chan'} is already full! 😸`);
      return;
    }
    const wasDead = petHunger === 0;
    feedPet(barcode, category || 'Snack');

    if (wasDead) {
      setCatAction('excited');
      setSpeechBubble('Nyaaa~! Revived! Thank you for the treats! ✨💖');
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
      bubbleTimerRef.current = setTimeout(() => {
        setCatAction('none');
        setSpeechBubble(null);
        bubbleTimerRef.current = null;
      }, 3000);
      toast.success(`Revived ${petName || 'Partner'}! He is back to life! 🌟`);
    } else {
      setCatAction('rewards');
      setTimeout(() => setCatAction('none'), 1800);
      toast.success(`Fed ${petName || 'Partner'} ${productName || 'snack'}! (+Hunger, +XP) 🍖`);
    }
  };

  // Calculate total food in inventory
  const totalFoodCount = useMemo(() => {
    return Object.values(foodInventory).reduce((acc, count) => acc + count, 0);
  }, [foodInventory]);

  if (!mounted || mode === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="rpg-panel p-6 text-center animate-pulse">
          <p className="font-fredoka text-amber-300 font-bold">Loading Game Lobby...</p>
        </div>
      </div>
    );
  }

  const catVariant = (avatar as CatVariantId) || STAGE_AVATARS[petStage] || 'calico';

  return (
    <div className="w-full min-h-screen px-3 sm:px-4 py-4 sm:py-6 select-none">
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
          />
        )}
      </AnimatePresence>

      {/* ── Single-Column Centered Stack (max-w-2xl mx-auto space-y-4) ── */}
      <div className="max-w-2xl mx-auto space-y-4">
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

            {/* Account Status with Chosen Cat Sprite Avatar */}
            <div className="flex items-center gap-1 sm:gap-1.5 rpg-inner-box px-1.5 sm:px-2.5 py-1 text-xs font-semibold text-[var(--theme-text-dark)] shrink-0 min-w-0">
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <PixelCat variant={(avatar as CatVariantId) || 'calico'} hunger={petHunger} size={20} />
              </div>
              <span className="max-w-[70px] xs:max-w-[95px] sm:max-w-[160px] truncate font-fredoka text-xs">
                {nickname || (mode === GameMode.ARASHU ? 'Hunter' : 'Guest')}
              </span>
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

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              aria-label="Exit or sign out"
              className="rpg-inner-box px-2 sm:px-2.5 py-1 min-h-[34px] sm:min-h-auto text-xs font-bold text-[var(--theme-primary)] hover:text-[var(--theme-text-dark)] hover:bg-[var(--theme-surface-inner)] cursor-pointer flex items-center justify-center gap-1 transition-colors shrink-0"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">Exit</span>
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
              <p className="font-pixel text-[9px] text-white font-semibold leading-none drop-shadow-[1px_1px_0_var(--theme-dark)]">
                {STAGE_LABELS[petStage] || 'Kitten'} • Stage {petStage}
              </p>
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

              <div className="transition-transform duration-200 group-hover:scale-108 active:scale-95 flex items-center justify-center">
                <PixelCat variant={catVariant} action={catAction} hunger={petHunger} size={120} />
              </div>

              <div className="absolute bottom-2.5 inset-x-0 text-center pointer-events-none z-10 px-2">
                <span className={`font-pixel text-[8px] transition-colors ${
                  petHunger === 0
                    ? 'text-rose-600 font-bold animate-pulse'
                    : petHunger <= 25
                    ? 'text-amber-600 font-bold animate-pulse'
                    : 'text-[var(--theme-text-dark)] group-hover:text-[var(--theme-primary)]'
                }`}>
                  {petHunger === 0
                    ? '[Feed to Revive! 🍖]'
                    : petHunger <= 25
                    ? '[Feed Me! 😿]'
                    : '[Tap to Meow]'}
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
              <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none">
                {foodItems.slice(0, 4).map((food) => {
                  const qty = foodInventory[food.barcodeNumber] || 1;
                  return (
                    <div
                      key={food.barcodeNumber}
                      className="rpg-inner-box px-3 py-2 flex items-center justify-between gap-2.5 shrink-0 min-w-[160px]"
                    >
                      <div className="truncate min-w-0 flex-1">
                        <p className="font-fredoka font-bold text-xs text-[var(--theme-text-dark)] truncate">
                          {food.productName}
                        </p>
                        <p className="font-pixel text-[8px] text-[var(--theme-text-dark)]/70">{qty}x in Bag</p>
                      </div>
                      <button
                        onClick={() => handleFeedItem(food.barcodeNumber, food.category || 'Snack', food.productName)}
                        className="px-2.5 py-1 rounded bg-[var(--theme-primary)] hover:brightness-110 active:scale-95 text-white font-fredoka font-bold text-xs cursor-pointer shadow-[2px_2px_0_0_var(--theme-shadow)] border border-white shrink-0"
                      >
                        Feed
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rpg-inner-box px-3 py-2 flex items-center justify-between gap-2 text-xs">
                <span className="text-[11px] sm:text-xs text-[var(--theme-text-dark)] font-medium truncate min-w-0">
                  🥨 Bag is empty! Scan items for treats
                </span>
                <Link
                  href="/scan"
                  className="px-2.5 py-1 rounded-lg bg-[var(--theme-primary)] hover:brightness-110 active:scale-95 text-white font-fredoka font-bold text-xs whitespace-nowrap shrink-0 shadow-[2px_2px_0_0_var(--theme-shadow)] border border-white transition-all inline-flex items-center gap-1"
                >
                  Scan →
                </Link>
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
          <Link
            href="/scan"
            className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-white text-[var(--theme-primary)] font-fredoka font-black text-xl tracking-wide flex items-center justify-center gap-3 border-2 border-[var(--theme-border)] shadow-[4px_4px_0_0_var(--theme-shadow)] hover:bg-[var(--theme-surface-inner)] active:translate-y-0.5 active:shadow-[1px_1px_0_0_var(--theme-shadow)] transition-all cursor-pointer select-none text-center"
          >
            <ScanLine className="w-6 h-6 stroke-[2.5]" />
            <span>SCAN BARCODE</span>
          </Link>

          {/* Quick Manual Entry */}
          <button
            onClick={handleOpenRegisterModal}
            className="w-full py-2 px-4 rounded-xl bg-[var(--theme-surface-inner)] hover:bg-white border-2 border-[var(--theme-border)] text-[var(--theme-text-dark)] font-fredoka font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[3px_3px_0_0_var(--theme-shadow)] active:translate-y-0.5 active:shadow-[1px_1px_0_0_var(--theme-shadow)]"
          >
            <Plus className="w-4 h-4 text-[var(--theme-primary)]" />
            <span>Manual Barcode Entry / Add Item</span>
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
                const emoji = getProductEmoji(name, prod?.category);
                const time = formatRelativeTime(lastScanTime[barcode]);
                return (
                  <div
                    key={`${barcode}-${idx}`}
                    className="rpg-inner-box px-3 py-2 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 truncate">
                      <span className="text-base shrink-0">{emoji}</span>
                      <div className="min-w-0 flex-1 truncate">
                        <p className="font-fredoka font-bold text-sm text-[var(--theme-text-dark)] truncate">
                          {name}
                        </p>
                        <span className="font-pixel text-[8px] text-[var(--theme-text-dark)]/70">{time}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-pixel text-[9px] text-[var(--theme-text-dark)] bg-[var(--theme-surface-inner)] px-2 py-0.5 rounded border border-[var(--theme-border)]">
                        +10 XP
                      </span>
                      <span className="font-pixel text-[9px] text-[var(--theme-text-dark)] bg-white px-2 py-0.5 rounded border border-[var(--theme-border)]">
                        +1 🍖
                      </span>
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
              className="rpg-panel-gold w-[94vw] max-w-2xl max-h-[85dvh] flex flex-col p-3.5 sm:p-6 shadow-[6px_6px_0_0_var(--theme-shadow)] relative"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4 shrink-0">
                <div className="flex items-center gap-2 text-white min-w-0">
                  {activeModal === 'bag' && <ShoppingBag className="w-5 h-5 text-white shrink-0" />}
                  {activeModal === 'catalog' && <Package className="w-5 h-5 text-white shrink-0" />}
                  {activeModal === 'history' && <History className="w-5 h-5 text-white shrink-0" />}
                  <h3 className="font-fredoka text-lg sm:text-xl font-black uppercase tracking-wider text-white drop-shadow-[1.5px_1.5px_0_var(--theme-dark)] truncate">
                    {activeModal === 'bag' && 'Food Bag'}
                    {activeModal === 'catalog' && 'Product Registry'}
                    {activeModal === 'history' && 'Scan History'}
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
              <div className="overflow-y-auto pr-1 space-y-4 max-h-[calc(85dvh-100px)] text-foreground">
                {/* 1. BAG MODAL */}
                {activeModal === 'bag' && (
                  <div className="space-y-4 text-white">
                    <div className="flex items-center justify-between text-xs text-white drop-shadow-[1px_1px_0_var(--theme-dark)]">
                      <span>Total Items Collected: {totalFoodCount}</span>
                      <Link
                        href="/scan"
                        className="text-white font-bold underline hover:brightness-110"
                      >
                        + Scan More Food
                      </Link>
                    </div>

                    {foodItems.length === 0 ? (
                      <div className="rpg-inner-box p-8 text-center text-[var(--theme-text-dark)] space-y-2">
                        <p className="font-fredoka text-lg font-bold">Your Bag is Empty! 🎒</p>
                        <p className="text-xs">
                          Point your webcam at barcode snacks, drinks, or groceries to collect food
                          for Scan-chan!
                        </p>
                        <Link
                          href="/scan"
                          className="btn-arcade-primary inline-flex text-xs py-2 px-4 mt-2"
                        >
                          Launch Barcode Scanner
                        </Link>
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
                                onClick={() =>
                                  handleFeedItem(food.barcodeNumber, food.category || 'Snack', food.productName)
                                }
                                className="px-3 py-1.5 rounded-lg bg-[var(--theme-primary)] hover:brightness-110 active:scale-95 text-white font-fredoka font-bold text-xs cursor-pointer border border-white shadow-[2px_2px_0_0_var(--theme-shadow)] shrink-0"
                              >
                                Feed 🍖
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
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
