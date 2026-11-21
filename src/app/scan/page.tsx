'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useZxing, type BarcodeFormat } from 'react-zxing';
import { ArrowLeft, Flashlight, FlashlightOff, Keyboard, X, Search } from 'lucide-react';
import { PixelCat } from '@/components/game/pixel-cat';
import { usePlayerStore } from '@/stores/player-store';
import { XpPopup } from '@/components/game/xp-popup';
import { getDeviceType, formatBarcode } from '@/lib/utils';
import { GAME_CONFIG } from '@/lib/game-config';
import type { Product } from '@/types/product';
import { CATEGORY_EMOJIS, CATEGORY_COLORS } from '@/types';

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

  const [phase, setPhase] = useState<ScanPhase>('scanning');
  const [result, setResult] = useState<ScanResultData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [paused, setPaused] = useState(false);
  const [lastBarcode, setLastBarcode] = useState('');
  const lastDecodedRef = useRef('');
  const cooldownRef = useRef(false);

  useEffect(() => {
    if (mode === null) {
      router.replace('/play/mode');
    }
  }, [mode, router]);

  const handleBarcode = useCallback(async (barcode: string) => {
    if (cooldownRef.current) return;
    if (barcode === lastDecodedRef.current) return;

    cooldownRef.current = true;
    lastDecodedRef.current = barcode;
    setLastBarcode(barcode);
    setPaused(true);
    setPhase('loading');

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcodeNumber: barcode, deviceType: getDeviceType() }),
      });

      const json = await res.json();

      if (!json.success) {
        setPhase('error');
        setErrorMsg(json.error || 'Scan failed');
        return;
      }

      const { found, product } = json.data;
      const scanHistory = usePlayerStore.getState().scanHistory;
      const isNew = !scanHistory.includes(barcode);

      recordScan(barcode, isNew, product?.category ?? 'Other');

      setResult({ found, product, isNew });
      setPhase(found ? 'found' : 'not-found');
    } catch {
      setPhase('error');
      setErrorMsg('Network error. Check your connection.');
    }
  }, [recordScan]);

  const { ref: videoRef, torch } = useZxing({
    paused,
    timeBetweenDecodingAttempts: GAME_CONFIG.scanner.fallbackIntervalMs,
    constraints: { video: { facingMode: 'environment' } },
    formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'] as BarcodeFormat[],
    onDecodeResult: (decoded) => {
      handleBarcode(decoded.rawValue);
    },
  });

  const handleManualSubmit = () => {
    const trimmed = manualBarcode.trim();
    if (trimmed.length >= 4) {
      setShowManualInput(false);
      handleBarcode(trimmed);
    }
  };

  const resetScanner = () => {
    setPhase('scanning');
    setResult(null);
    setErrorMsg('');
    setPaused(false);
    lastDecodedRef.current = '';
    setTimeout(() => { cooldownRef.current = false; }, GAME_CONFIG.cooldowns.scanCooldownMs);
  };

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
              onClick={() => torch.isOn ? torch.off() : torch.on()}
              className="min-w-[44px] min-h-[44px] bg-white border-2 border-[var(--theme-border)] rounded-xl flex items-center justify-center text-[var(--theme-text-dark)] hover:bg-[var(--theme-surface-inner)] shadow-[2px_2px_0_0_var(--theme-shadow)] transition-colors cursor-pointer shrink-0"
              aria-label="Toggle flashlight"
            >
              {torch.isOn ? <FlashlightOff className="w-5 h-5" /> : <Flashlight className="w-5 h-5" />}
            </button>
          )}
          <button
            onClick={() => setShowManualInput(true)}
            className="min-w-[44px] min-h-[44px] bg-white border-2 border-[var(--theme-border)] rounded-xl flex items-center justify-center text-[var(--theme-text-dark)] hover:bg-[var(--theme-surface-inner)] shadow-[2px_2px_0_0_var(--theme-shadow)] transition-colors cursor-pointer shrink-0"
            aria-label="Manual barcode input"
          >
            <Keyboard className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Camera feed */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Viewfinder overlay */}
        {phase === 'scanning' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Darkened edges */}
            <div className="absolute inset-0 bg-black/40" />
            {/* Clear center window */}
            <div className="relative w-[75vw] max-w-xs h-44 sm:h-56">
              <div className="absolute inset-0 bg-transparent rounded-2xl" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)' }} />
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[var(--theme-primary)] rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[var(--theme-primary)] rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[var(--theme-primary)] rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[var(--theme-primary)] rounded-br-xl" />
              {/* Animated scan line */}
              <div className="absolute left-2 right-2 h-0.5 bg-[var(--theme-accent)] shadow-[0_2px_0_0_var(--theme-shadow)] animate-scan-line" />
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
              <ProductNotFoundSheet barcode={lastBarcode} onReset={resetScanner} />
            )}
            {phase === 'error' && (
              <ErrorSheet message={errorMsg} onReset={resetScanner} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual input modal */}
      <AnimatePresence>
        {showManualInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-4"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-[94vw] max-w-md max-h-[85dvh] overflow-y-auto bg-[var(--theme-primary)] border-4 border-white shadow-[6px_6px_0_0_var(--theme-shadow)] rounded-2xl p-4 sm:p-6 space-y-4 text-white"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-press-start font-bold text-xs sm:text-sm text-white drop-shadow-[1.5px_1.5px_0_var(--theme-dark)]">Enter Barcode</h3>
                <button
                  onClick={() => setShowManualInput(false)}
                  className="min-w-[44px] min-h-[44px] rounded-xl bg-white border-2 border-[var(--theme-border)] text-[var(--theme-text-dark)] flex items-center justify-center hover:bg-[var(--theme-surface-inner)] shadow-[2px_2px_0_0_var(--theme-shadow)] cursor-pointer shrink-0"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <input
                type="text"
                inputMode="numeric"
                placeholder="e.g. 8992761136109"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                autoFocus
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--theme-border)] bg-white font-mono text-lg text-center text-[var(--theme-text-dark)] focus:outline-none focus:ring-2 focus:ring-white shadow-[2px_2px_0_0_var(--theme-shadow)]"
              />
              <button
                onClick={handleManualSubmit}
                disabled={manualBarcode.trim().length < 4}
                className="btn-arcade w-full py-3 text-xs font-press-start flex items-center justify-center gap-2 disabled:opacity-50 text-[var(--theme-primary)] cursor-pointer"
              >
                <Search className="w-4 h-4" />
                Lookup
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function ProductFoundSheet({ product, isNew, onReset }: { product: Product; isNew: boolean; onReset: () => void }) {
  const emoji = CATEGORY_EMOJIS[product.category ?? 'Other'] ?? '📦';

  return (
    <div className="p-6 pb-10 space-y-5">
      <div className="flex items-start justify-between">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-[var(--theme-surface-inner)] border-2 border-[var(--theme-border)] shadow-[2px_2px_0_0_var(--theme-shadow)]">
            {emoji}
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

      {product.category && (
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg text-white text-xs font-nunito font-bold bg-[var(--theme-primary)] border border-[var(--theme-border)]">
            {emoji} {product.category}
          </span>
          <span className="font-mono text-xs text-[var(--theme-text-dark)]/70">{formatBarcode(product.barcodeNumber)}</span>
        </div>
      )}

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

function ProductNotFoundSheet({ barcode, onReset }: { barcode: string; onReset: () => void }) {
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
        <Link
          href={`/play?register=${barcode}`}
          className="btn-arcade bg-[var(--theme-surface-inner)] hover:bg-white text-[var(--theme-text-dark)] flex-1 py-3 text-sm text-center flex items-center justify-center gap-2 cursor-pointer"
        >
          <PixelCat variant="pink" action="items" size={24} />
          Register
        </Link>
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
