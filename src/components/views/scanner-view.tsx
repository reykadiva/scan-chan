'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Flashlight, FlashlightOff, RefreshCw } from 'lucide-react';
import { PixelCat } from '@/components/game/pixel-cat';
import { usePlayerStore, levelFromXp, getPetStageFromLevel } from '@/stores/player-store';
import { isConsumableCategory } from '@/types';
import { XpPopup } from '@/components/game/xp-popup';
import { getDeviceType, formatBarcode } from '@/lib/utils';
import { GameMode } from '@/lib/game-config';
import { useBarcodeScanner, isValidRetailBarcode } from '@/hooks/use-barcode-scanner';
import { playScannerBeep, playSuccessChime, playErrorBuzz } from '@/lib/sound-effects';
import { haptics } from '@/lib/haptics';
import type { Product } from '@/types/product';
import { CategoryIcon, CategoryBadge } from '@/components/ui/category-badge';
import { CATEGORY_COLORS } from '@/types';
import { RegisterProductModal } from '@/components/game/register-product-modal';
import { useProductStore } from '@/stores/product-store';
import { toast } from 'sonner';

type ScanPhase = 'scanning' | 'loading' | 'found' | 'not-found' | 'error';

interface ScanResultData {
  found: boolean;
  product: Product | null;
  isNew: boolean;
}

interface ScannerViewProps {
  onClose?: () => void;
}

export function ScannerView({ onClose }: ScannerViewProps) {
  const recordScan = usePlayerStore((s) => s.recordScan);
  const mode = usePlayerStore((s) => s.mode);
  const creatorId = usePlayerStore((s) => s.creatorId);
  const setActiveView = usePlayerStore((s) => s.setActiveView);

  const [phase, setPhase] = useState<ScanPhase>('scanning');
  const [result, setResult] = useState<ScanResultData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [paused, setPaused] = useState(false);
  const [lastBarcode, setLastBarcode] = useState('');
  const lastDecodedRef = useRef('');
  const cooldownRef = useRef(false);

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      setActiveView('LOBBY');
    }
  }, [onClose, setActiveView]);

  const handleRegisterSuccess = useCallback(
    (barcode: string, category: string, productName?: string) => {
      const cleanBarcode = barcode.trim();
      usePlayerStore.getState().registerProduct(cleanBarcode, category);
      setShowRegisterModal(false);
      const isFood = isConsumableCategory(category);
      if (isFood) {
        toast.success('🎉 Product registered & added to Food Bag! 📦🍖', {
          description: productName ? `${productName} (+1 food in bag)` : '+1 food added to your bag',
        });
      } else {
        toast.success('🎉 Product registered to Catalog! 📋✨', {
          description: productName ? `${productName} (Added to catalog)` : 'Added to catalog',
        });
      }
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

  const handleBarcode = useCallback(
    async (barcode: string) => {
      if (
        usePlayerStore.getState().isLoading ||
        (mode === GameMode.ARASHU && !usePlayerStore.getState().isProfileLoaded)
      ) {
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

      // Immediate tactile & audible feedback upon barcode capture
      playScannerBeep();
      haptics.medium();

      // Client-Side Product Cache & Instant Feedback (0ms):
      // Check if product was already loaded in catalog/Zustand store to display optimistically
      const cachedProduct = useProductStore.getState().products[barcode];
      if (cachedProduct) {
        const isNew = !usePlayerStore.getState().scanHistory.includes(barcode);
        setResult({
          found: true,
          product: cachedProduct as any,
          isNew,
        });
        setPhase('found');
      } else {
        setPhase('loading');
      }

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
            cooldownRef.current = false;
            lastDecodedRef.current = '';
            return;
          }

          const d = json.data;
          playSuccessChime();
          haptics.success();

          const computedLevel = levelFromXp(d.xp);
          const computedStage = getPetStageFromLevel(computedLevel);

          // Exact server reconciliation for XP & inventory (deterministic cross-device level & pet stage)
          usePlayerStore.setState({
            xp: d.xp,
            level: computedLevel,
            streak: typeof d.streak === 'number' ? d.streak : 0,
            petStage: computedStage,
            pendingXpGain: d.pendingXpGain,
            foodInventory: d.foodInventory || usePlayerStore.getState().foodInventory,
            scanHistory: d.scanHistory || usePlayerStore.getState().scanHistory,
            lastActiveDate: d.lastActiveDate || usePlayerStore.getState().lastActiveDate,
            lastScanTime: { ...usePlayerStore.getState().lastScanTime, [barcode]: Date.now() },
            lastLocalMutationAt: Date.now(),
          });

          if (d.product) {
            useProductStore.getState().upsertProduct(d.product);
          }

          setResult({
            found: d.found,
            product: d.product || (cachedProduct as any) || null,
            isNew: d.isNewProduct,
          });
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
            cooldownRef.current = false;
            lastDecodedRef.current = '';
            return;
          }

          const { found, product } = json.data;
          const scanHistory = usePlayerStore.getState().scanHistory;
          const isNew = !scanHistory.includes(barcode);

          playSuccessChime();
          haptics.success();

          if (product) {
            useProductStore.getState().upsertProduct(product);
          }

          recordScan(barcode, isNew, product?.category ?? cachedProduct?.category ?? 'Other');

          setResult({
            found: found || !!cachedProduct,
            product: product || (cachedProduct as any) || null,
            isNew,
          });
          setPhase(found || !!cachedProduct ? 'found' : 'not-found');
        }
      } catch {
        playErrorBuzz();
        haptics.error();
        setPhase('error');
        setErrorMsg('Network error. Check your connection.');
        cooldownRef.current = false;
        lastDecodedRef.current = '';
      }
    },
    [recordScan, mode]
  );

  const { videoRef, torch, cameraError, restartCamera, resume } = useBarcodeScanner({
    paused: paused || phase !== 'scanning',
    scanIntervalMs: 120,
    onScan: handleBarcode,
  });

  const resetScanner = useCallback(() => {
    setPhase('scanning');
    setResult(null);
    setErrorMsg('');
    setPaused(false);
    lastDecodedRef.current = '';
    cooldownRef.current = false;
    resume().catch(() => {});
  }, [resume]);

  return (
    <div className="fixed inset-0 z-40 bg-black flex flex-col overflow-hidden select-none">
      <XpPopup />

      {/* Top action header */}
      <div className="relative z-30 pt-safe px-4 py-3 flex items-center justify-between bg-black/60 backdrop-blur-md border-b-2 border-white/20">
        <button
          onClick={handleClose}
          className="min-w-[44px] min-h-[44px] bg-white border-2 border-[var(--theme-border)] rounded-xl flex items-center justify-center text-[var(--theme-text-dark)] hover:bg-[var(--theme-surface-inner)] shadow-[2px_2px_0_0_var(--theme-shadow)] transition-colors cursor-pointer shrink-0"
          aria-label="Back to Garden"
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
              <div
                className="absolute inset-0 bg-transparent rounded-2xl"
                style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)' }}
              />
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
                <span className="font-press-start font-semibold text-white text-xs text-center px-4">
                  Searching catalog...
                </span>
                <span className="font-nunito text-xs text-white/70">
                  Checking database & OpenFoodFacts
                </span>
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
              <ProductFoundSheet
                product={result.product}
                isNew={result.isNew}
                onReset={resetScanner}
                onDone={handleClose}
              />
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
            creatorId={creatorId}
            onClose={() => setShowRegisterModal(false)}
            onSuccess={handleRegisterSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductFoundSheet({
  product,
  isNew,
  onReset,
  onDone,
}: {
  product: Product;
  isNew: boolean;
  onReset: () => void;
  onDone?: () => void;
}) {
  const catColor = CATEGORY_COLORS[product.category ?? 'Other'] ?? CATEGORY_COLORS['Other'];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <CategoryBadge category={product.category ?? 'Other'} />
        <div className="flex items-center gap-1.5">
          {isNew && (
            <span className="font-press-start text-[9px] bg-emerald-600 text-white px-2 py-1 rounded-lg border-2 border-[var(--theme-border)] shadow-[1px_1px_0_0_var(--theme-shadow)]">
              DISCOVERY! 🌟
            </span>
          )}
          {isConsumableCategory(product.category) ? (
            <span className="font-press-start text-[9px] bg-[var(--theme-primary)] text-white px-2 py-1 rounded-lg border-2 border-[var(--theme-border)] shadow-[1px_1px_0_0_var(--theme-shadow)]">
              +1 FOOD 🍖
            </span>
          ) : (
            <span className="font-press-start text-[9px] bg-slate-700 text-white px-2 py-1 rounded-lg border-2 border-[var(--theme-border)] shadow-[1px_1px_0_0_var(--theme-shadow)]">
              CATALOGED 📋
            </span>
          )}
        </div>
      </div>

      <div className="flex items-start gap-4">
        {product.imageUrl ? (
          <div className="w-20 h-20 rounded-2xl bg-[var(--theme-surface-inner)] border-2 border-[var(--theme-border)] overflow-hidden shrink-0 shadow-[2px_2px_0_0_var(--theme-shadow)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.imageUrl} alt={product.productName} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 border-2 border-[var(--theme-border)] shadow-[2px_2px_0_0_var(--theme-shadow)] text-white"
            style={{ backgroundColor: catColor }}
          >
            <CategoryIcon category={product.category ?? 'Other'} size={36} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="font-fredoka font-bold text-xl text-[var(--theme-text-dark)] leading-tight truncate">
            {product.productName}
          </h2>
          {product.brand && (
            <p className="font-nunito text-xs text-[var(--theme-text-dark)]/70 font-semibold">{product.brand}</p>
          )}
          <p className="font-mono text-xs text-[var(--theme-text-dark)]/50 mt-1">
            {formatBarcode(product.barcodeNumber)}
          </p>
        </div>
      </div>

      {product.description && (
        <p className="font-nunito text-sm text-[var(--theme-text-dark)]/80 bg-[var(--theme-surface-inner)] p-3 rounded-xl border border-[var(--theme-border)] leading-relaxed">
          {product.description}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={onReset}
          className="btn-arcade-primary flex-1 py-3 text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <PixelCat variant="calico" action="play" size={24} />
          Scan Next
        </button>
        {onDone && (
          <button
            onClick={onDone}
            className="btn-arcade bg-[var(--theme-surface-inner)] hover:bg-white text-[var(--theme-text-dark)] px-5 py-3 text-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Done
          </button>
        )}
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
  onRegister: () => void;
}) {
  return (
    <div className="p-6 space-y-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <div className="w-20 h-20 bg-[var(--theme-surface-inner)] border-2 border-[var(--theme-border)] rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden shadow-[3px_3px_0_0_var(--theme-shadow)]">
          <PixelCat variant="tabby" action="none" size={56} />
        </div>
        <h2 className="font-fredoka font-bold text-2xl text-[var(--theme-text-dark)] mb-1">
          Product Not Found
        </h2>
        <p className="font-nunito text-[var(--theme-text-dark)]/80 font-medium">
          Barcode <span className="font-mono font-bold text-[var(--theme-text-dark)]">{formatBarcode(barcode)}</span> is not registered yet.
        </p>
      </motion.div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onReset}
          className="btn-arcade-primary flex-1 py-3 text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <PixelCat variant="cyan" action="scan" size={24} />
          Scan Again
        </button>
        <button
          type="button"
          onClick={onRegister}
          className="btn-arcade bg-[var(--theme-surface-inner)] hover:bg-white text-[var(--theme-text-dark)] flex-1 py-3 text-sm text-center flex items-center justify-center gap-2 cursor-pointer"
        >
          <PixelCat variant="pink" action="items" size={24} />
          Register
        </button>
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
