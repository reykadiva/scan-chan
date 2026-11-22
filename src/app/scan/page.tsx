'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Flashlight, FlashlightOff, X, RefreshCw } from 'lucide-react';
import { PixelCat } from '@/components/game/pixel-cat';
import { usePlayerStore } from '@/stores/player-store';
import { XpPopup } from '@/components/game/xp-popup';
import { getDeviceType, formatBarcode } from '@/lib/utils';
import { GAME_CONFIG, GameMode } from '@/lib/game-config';
import { useBarcodeScanner, isValidRetailBarcode } from '@/hooks/use-barcode-scanner';
import { playScannerBeep, playSuccessChime, playErrorBuzz } from '@/lib/sound-effects';
import { haptics } from '@/lib/haptics';
import type { Product } from '@/types/product';
import { CategoryIcon, CategoryBadge } from '@/components/ui/category-badge';
import { CATEGORY_COLORS } from '@/types';
import { RegisterProductModal } from '@/components/game/register-product-modal';
import { useProductStore } from '@/stores/product-store';
import { SyncLoadingGate } from '@/components/game/sync-loading-gate';
import { toast } from 'sonner';

type ScanPhase = 'scanning' | 'loading' | 'found' | 'not-found' | 'error';

interface ScanResultData {
  found: boolean;
  product: Product | null;
  isNew: boolean;
}

export default function ScanPage() {
  const router = useRouter();
  const recordScan = usePlayerStore((s) => s.recordScan);
  const mode = usePlayerStore((s) => s.mode);
  const creatorId = usePlayerStore((s) => s.creatorId);
  const isProfileLoaded = usePlayerStore((s) => s.isProfileLoaded);
  const isLoading = usePlayerStore((s) => s.isLoading);
  const loadProfile = usePlayerStore((s) => s.loadProfile);

  const [phase, setPhase] = useState<ScanPhase>('scanning');
  const [result, setResult] = useState<ScanResultData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [paused, setPaused] = useState(false);
  const [lastBarcode, setLastBarcode] = useState('');
  const lastDecodedRef = useRef('');
  const cooldownRef = useRef(false);

  const handleRegisterSuccess = useCallback(
    (barcode: string, category: string, productName?: string) => {
      const cleanBarcode = barcode.trim();
      usePlayerStore.getState().registerProduct(cleanBarcode, category);
      setShowRegisterModal(false);
      toast.success('🎉 Product registered & added to Food Bag! (+60 XP total) 📦🍖', {
        description: productName ? `${productName} (+1 food in bag)` : '+1 food added to your bag',
      });
      const cached = useProductStore.getState().products[cleanBarcode];
      setResult({
        found: true,
        product: (cached || {
          id: cleanBarcode,
          barcodeNumber: cleanBarcode,
          productName: productName || 'Registered Product',
          category,
        }) as any,
        isNew: true,
      });
      setPhase('found');
    },
    []
  );

  useEffect(() => {
    if (mode === null) {
      router.replace('/play/mode');
      return;
    }

    if (mode === GameMode.ARASHU && !isProfileLoaded) {
      fetch('/api/auth/session')
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated && data.user) {
            loadProfile(data.user.id).catch(() => {});
          } else {
            router.replace('/play/mode');
          }
        })
        .catch(() => {
          router.replace('/play/mode');
        });
    }
  }, [mode, isProfileLoaded, router, loadProfile]);

  const handleBarcode = useCallback(async (barcode: string) => {
    if (usePlayerStore.getState().isLoading || (mode === GameMode.ARASHU && !usePlayerStore.getState().isProfileLoaded)) {
      toast.warning('Still syncing player data. Please wait a moment...');
      return;
    }
    if (cooldownRef.current) return;
    if (!isValidRetailBarcode(barcode)) return;
    if (barcode === lastDecodedRef.current) return;

    cooldownRef.current = true;
    lastDecodedRef.current = barcode;
    setLastBarcode(barcode);
    setPaused(true);
    setPhase('loading');

    // Immediate tactile & audible feedback upon barcode capture
    playScannerBeep();
    haptics.medium();

    try {
      if (mode === GameMode.ARASHU) {
        // SC-002: Server-authoritative single scan execution path for Hunter Mode
        const res = await fetch('/api/actions/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barcodeNumber: barcode, deviceType: getDeviceType() }),
        });

        const json = await res.json();

        if (!json.success || !json.data) {
          playErrorBuzz();
          haptics.error();
          setPhase('error');
          setErrorMsg(json.error || 'Scan failed');
          return;
        }

        const d = json.data;
        playSuccessChime();
        haptics.success();

        // Exact server reconciliation for XP & inventory
        usePlayerStore.setState({
          xp: d.xp,
          level: d.level,
          streak: d.streak,
          petStage: d.petStage,
          pendingXpGain: d.pendingXpGain,
          foodInventory: d.foodInventory || usePlayerStore.getState().foodInventory,
          scanHistory: d.scanHistory || usePlayerStore.getState().scanHistory,
          lastActiveDate: d.lastActiveDate || usePlayerStore.getState().lastActiveDate,
          lastScanTime: { ...usePlayerStore.getState().lastScanTime, [barcode]: Date.now() },
          lastLocalMutationAt: Date.now(),
        });

        setResult({ found: d.found, product: d.product, isNew: d.isNewProduct });
        setPhase(d.found ? 'found' : 'not-found');
      } else {
        // Guest Mode: lookup product details, then record scan locally
        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barcodeNumber: barcode, deviceType: getDeviceType() }),
        });

        const json = await res.json();

        if (!json.success || !json.data) {
          playErrorBuzz();
          haptics.error();
          setPhase('error');
          setErrorMsg(json.error || 'Scan failed');
          return;
        }

        const { found, product } = json.data;
        const scanHistory = usePlayerStore.getState().scanHistory;
        const isNew = !scanHistory.includes(barcode);

        playSuccessChime();
        haptics.success();

        recordScan(barcode, isNew, product?.category ?? 'Other');

        setResult({ found, product, isNew });
        setPhase(found ? 'found' : 'not-found');
      }
    } catch {
      playErrorBuzz();
      haptics.error();
      setPhase('error');
      setErrorMsg('Network error. Check your connection.');
    }
  }, [recordScan, mode]);

  const { videoRef, torch, cameraError, restartCamera } = useBarcodeScanner({
    paused: paused || phase !== 'scanning',
    scanIntervalMs: 120,
    onScan: handleBarcode,
  });

  const resetScanner = () => {
    setPhase('scanning');
    setResult(null);
    setErrorMsg('');
    setPaused(false);
    lastDecodedRef.current = '';
    setTimeout(() => {
      cooldownRef.current = false;
    }, 400);
  };

  // Full-Screen Loading Gate: covers scanner UI until cloud profile is completely hydrated
  if (mode === GameMode.ARASHU && (!isProfileLoaded || isLoading)) {
    return (
      <SyncLoadingGate
        message="LOADING..."
        onRetry={() => loadProfile()}
      />
    );
  }

  // ponytail: no permission-state UI — browser handles the prompt natively
  return (
    <main className="fixed inset-0 z-50 bg-black flex flex-col">
      <XpPopup />
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 p-3 sm:p-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="min-w-[44px] min-h-[44px] bg-white border-2 border-[var(--theme-border)] rounded-xl flex items-center justify-center text-[var(--theme-text-dark)] hover:bg-[var(--theme-surface-inner)] shadow-[2px_2px_0_0_var(--theme-shadow)] transition-colors cursor-pointer shrink-0"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <span className="font-press-start font-bold text-white text-xs sm:text-sm tracking-widest drop-shadow-[2px_2px_0_var(--theme-dark)]">
          SCANNER
        </span>

        <div className="flex gap-2">
          {torch.isAvailable && (
            <button
              onClick={() => torch.toggle()}
              className="min-w-[44px] min-h-[44px] bg-white border-2 border-[var(--theme-border)] rounded-xl flex items-center justify-center text-[var(--theme-text-dark)] hover:bg-[var(--theme-surface-inner)] shadow-[2px_2px_0_0_var(--theme-shadow)] transition-colors cursor-pointer shrink-0"
              aria-label="Toggle flashlight"
            >
              {torch.isOn ? <FlashlightOff className="w-5 h-5" /> : <Flashlight className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Camera feed */}
      <div className="flex-1 relative overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Camera error / permission issue banner */}
        {cameraError && phase === 'scanning' && (
          <div className="absolute inset-0 z-20 bg-black/85 flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-2xl shadow-[2px_2px_0_0_var(--theme-shadow)]">
              📷
            </div>
            <p className="font-nunito text-sm text-white/90 max-w-xs">{cameraError}</p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => restartCamera()}
                className="btn-arcade text-xs px-4 py-2.5 flex items-center gap-2 cursor-pointer bg-white text-[var(--theme-text-dark)]"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Camera
              </button>
            </div>
          </div>
        )}

        {/* Viewfinder overlay */}
        {phase === 'scanning' && !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Darkened edges */}
            <div className="absolute inset-0 bg-black/40" />
            {/* Clear center window */}
            <div className="relative w-[75vw] max-w-xs h-48 sm:h-56 overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-transparent rounded-2xl" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)' }} />
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[var(--theme-primary)] rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[var(--theme-primary)] rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[var(--theme-primary)] rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[var(--theme-primary)] rounded-br-xl" />
              {/* Center crosshair dot */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                <div className="w-2 h-2 rounded-full bg-[var(--theme-accent)] shadow-[0_0_6px_var(--theme-accent)]" />
              </div>
              {/* Animated laser scan line */}
              <div className="absolute left-2 right-2 h-1 bg-[var(--theme-accent)] shadow-[0_0_12px_2px_var(--theme-accent)] rounded-full animate-scan-line pointer-events-none" />
            </div>
            <p className="absolute bottom-8 text-white font-press-start text-[9px] bg-black/60 px-3 py-1.5 rounded-lg border border-white/20">
              Point camera at a barcode
            </p>
          </div>
        )}

        {/* Loading overlay */}
        <AnimatePresence>
          {phase === 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="w-12 h-12 rounded-full border-4 border-[var(--theme-primary)] border-t-transparent"
                />
                <span className="font-press-start font-semibold text-white text-xs">Looking up product...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Result sheet */}
      <AnimatePresence>
        {(phase === 'found' || phase === 'not-found' || phase === 'error') && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-40 bg-white rounded-t-[2rem] border-t-4 border-[var(--theme-border)] shadow-[0_-6px_0_0_rgba(0,0,0,0.2)] max-h-[75vh] overflow-y-auto pb-safe pb-8"
          >
            {phase === 'found' && result?.product && (
              <ProductFoundSheet product={result.product} isNew={result.isNew} onReset={resetScanner} />
            )}
            {phase === 'not-found' && result && (
              <ProductNotFoundSheet
                barcode={lastBarcode}
                onReset={resetScanner}
                onRegister={() => setShowRegisterModal(true)}
              />
            )}
            {phase === 'error' && (
              <ErrorSheet message={errorMsg} onReset={resetScanner} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRegisterModal && (
          <RegisterProductModal
            initialBarcode={lastBarcode}
            creatorId={creatorId || ''}
            onClose={() => setShowRegisterModal(false)}
            onSuccess={handleRegisterSuccess}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

function ProductFoundSheet({ product, isNew, onReset }: { product: Product; isNew: boolean; onReset: () => void }) {
  return (
    <div className="p-6 pb-10 space-y-5">
      <div className="flex items-start justify-between">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[var(--theme-surface-inner)] border-2 border-[var(--theme-border)] shadow-[2px_2px_0_0_var(--theme-shadow)]">
            <CategoryIcon category={product.category} size={28} />
          </div>
          <div>
            <h2 className="font-fredoka font-bold text-xl text-[var(--theme-text-dark)] leading-tight">{product.productName}</h2>
            {product.brand && <p className="font-nunito text-sm text-[var(--theme-text-dark)]/80 font-medium">by {product.brand}</p>}
          </div>
        </motion.div>
        {isNew && (
          <motion.span
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', bounce: 0.6, delay: 0.3 }}
            className="bg-[var(--theme-surface-inner)] text-[var(--theme-text-dark)] border-2 border-[var(--theme-border)] font-press-start text-[8px] px-2.5 py-1 rounded-lg shadow-[2px_2px_0_0_var(--theme-shadow)]"
          >
            NEW!
          </motion.span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        {product.category && (
          <CategoryBadge category={product.category} size="md" />
        )}
        <span className="font-mono text-xs bg-white/80 px-2.5 py-1 rounded-lg border border-[var(--theme-border)]/50 text-[var(--theme-text-dark)] font-bold">
          {formatBarcode(product.barcodeNumber)}
        </span>
      </div>

      {product.imageUrl && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full h-40 bg-[var(--theme-surface-inner)] border-2 border-[var(--theme-border)] rounded-2xl overflow-hidden shadow-[2px_2px_0_0_var(--theme-shadow)]"
        >
          <img src={product.imageUrl} alt={product.productName} className="w-full h-full object-contain p-4" />
        </motion.div>
      )}

      {product.description && (
        <p className="font-nunito text-sm text-[var(--theme-text-dark)]/90 leading-relaxed">{product.description}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={onReset} className="btn-arcade-primary flex-1 py-3 text-sm flex items-center justify-center gap-2 cursor-pointer">
          <PixelCat variant="cyan" action="scan" size={24} />
          Scan Again
        </button>
        <Link href={`/play`} className="btn-arcade flex-1 py-3 text-sm text-center cursor-pointer">
          To Lobby
        </Link>
      </div>
    </div>
  );
}

function ProductNotFoundSheet({
  barcode,
  onReset,
  onRegister,
}: {
  barcode: string;
  onReset: () => void;
  onRegister?: () => void;
}) {
  return (
    <div className="p-6 pb-10 space-y-5">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        className="text-center"
      >
        <div className="w-20 h-20 bg-[var(--theme-surface-inner)] border-2 border-[var(--theme-border)] rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden shadow-[3px_3px_0_0_var(--theme-shadow)]">
          <PixelCat variant="tabby" action="none" size={56} />
        </div>
        <h2 className="font-fredoka font-bold text-2xl text-[var(--theme-text-dark)] mb-1">Product Not Found</h2>
        <p className="font-nunito text-[var(--theme-text-dark)]/80 font-medium">
          Barcode <span className="font-mono font-bold text-[var(--theme-text-dark)]">{formatBarcode(barcode)}</span> is not registered yet.
        </p>
      </motion.div>

      <div className="flex gap-3 pt-2">
        <button onClick={onReset} className="btn-arcade-primary flex-1 py-3 text-sm flex items-center justify-center gap-2 cursor-pointer">
          <PixelCat variant="cyan" action="scan" size={24} />
          Scan Again
        </button>
        {onRegister ? (
          <button
            type="button"
            onClick={onRegister}
            className="btn-arcade bg-[var(--theme-surface-inner)] hover:bg-white text-[var(--theme-text-dark)] flex-1 py-3 text-sm text-center flex items-center justify-center gap-2 cursor-pointer"
          >
            <PixelCat variant="pink" action="items" size={24} />
            Register
          </button>
        ) : (
          <Link
            href={`/play?register=${barcode}`}
            className="btn-arcade bg-[var(--theme-surface-inner)] hover:bg-white text-[var(--theme-text-dark)] flex-1 py-3 text-sm text-center flex items-center justify-center gap-2 cursor-pointer"
          >
            <PixelCat variant="pink" action="items" size={24} />
            Register
          </Link>
        )}
      </div>
    </div>
  );
}

function ErrorSheet({ message, onReset }: { message: string; onReset: () => void }) {
  return (
    <div className="p-6 pb-10 space-y-5 text-center">
      <div className="w-16 h-16 bg-[var(--theme-surface-inner)] border-2 border-[var(--theme-border)] rounded-full flex items-center justify-center mx-auto overflow-hidden shadow-[3px_3px_0_0_var(--theme-shadow)]">
        <PixelCat variant="gray" action="none" size={48} />
      </div>
      <div>
        <h2 className="font-fredoka font-bold text-xl text-[var(--theme-text-dark)] mb-1">Oops!</h2>
        <p className="font-nunito text-[var(--theme-text-dark)]/80 font-medium">{message}</p>
      </div>
      <button onClick={onReset} className="btn-arcade-primary w-full py-3 text-sm cursor-pointer">
        Try Again
      </button>
    </div>
  );
}
