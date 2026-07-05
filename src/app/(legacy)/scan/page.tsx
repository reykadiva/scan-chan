'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useZxing } from 'react-zxing';
import { ArrowLeft, Flashlight, FlashlightOff, Keyboard, X, Search } from 'lucide-react';
import { PixelCat } from '@/components/legacy/pixel-cat';
import { usePlayerStore } from '@/stores/legacy/player-store';
import { useSound } from '@/hooks/use-sound';
import { XpPopup } from '@/components/legacy/game/xp-popup';
import { AchievementPopup } from '@/components/legacy/game/achievement-popup';
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
  const { playSound } = useSound();
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
    playSound('beep');

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
        playSound('error');
        return;
      }

      const { found, product } = json.data;
      const scanHistory = usePlayerStore.getState().scanHistory;
      const isNew = !scanHistory.includes(barcode);

      recordScan(barcode, isNew, product?.category ?? 'Other');

      setResult({ found, product, isNew });
      setPhase(found ? 'found' : 'not-found');
      playSound(found ? 'success' : 'error');
    } catch {
      setPhase('error');
      setErrorMsg('Network error. Check your connection.');
      playSound('error');
    }
  }, [playSound, recordScan]);

  const { ref: videoRef, torch } = useZxing({
    paused,
    timeBetweenDecodingAttempts: GAME_CONFIG.scanner.fallbackIntervalMs,
    constraints: { video: { facingMode: 'environment' } },
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
      <AchievementPopup />
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <span className="font-fredoka font-bold text-white text-lg drop-shadow-lg">Scanner</span>

        <div className="flex gap-2">
          {torch.isAvailable && (
            <button
              onClick={() => torch.isOn ? torch.off() : torch.on()}
              className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            >
              {torch.isOn ? <FlashlightOff className="w-5 h-5" /> : <Flashlight className="w-5 h-5" />}
            </button>
          )}
          <button
            onClick={() => setShowManualInput(true)}
            className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
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
            <div className="relative w-72 h-48 sm:w-80 sm:h-56">
              <div className="absolute inset-0 bg-transparent rounded-2xl" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)' }} />
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-brand-cyan rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-brand-cyan rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-brand-cyan rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-brand-cyan rounded-br-xl" />
              {/* Animated scan line */}
              <div className="absolute left-2 right-2 h-0.5 bg-brand-cyan/80 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.6)] animate-scan-line" />
            </div>
            <p className="absolute bottom-8 text-white/70 font-nunito text-sm font-medium">
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
                  className="w-12 h-12 rounded-full border-4 border-brand-cyan border-t-transparent"
                />
                <span className="font-fredoka font-semibold text-white text-lg">Looking up product...</span>
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
            className="absolute bottom-0 left-0 right-0 z-40 bg-white rounded-t-[2rem] shadow-2xl max-h-[70vh] overflow-y-auto"
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
            className="absolute inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-fredoka font-bold text-xl text-slate-800">Enter Barcode</h3>
                <button onClick={() => setShowManualInput(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <X className="w-4 h-4 text-slate-600" />
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
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 font-mono text-lg text-center focus:border-brand-cyan focus:outline-none transition-colors"
              />
              <button
                onClick={handleManualSubmit}
                disabled={manualBarcode.trim().length < 4}
                className="btn-bubbly bg-brand-cyan text-white w-full py-3 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Search className="w-5 h-5" />
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
  const color = CATEGORY_COLORS[product.category ?? 'Other'] ?? '#607D8B';

  return (
    <div className="p-6 pb-10 space-y-5">
      <div className="flex items-start justify-between">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: color + '20' }}>
            {emoji}
          </div>
          <div>
            <h2 className="font-fredoka font-bold text-xl text-slate-800 leading-tight">{product.productName}</h2>
            {product.brand && <p className="font-nunito text-sm text-slate-500 font-medium">by {product.brand}</p>}
          </div>
        </motion.div>
        {isNew && (
          <motion.span
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', bounce: 0.6, delay: 0.3 }}
            className="bg-brand-yellow text-amber-900 text-xs font-fredoka font-bold px-3 py-1 rounded-full"
          >
            NEW!
          </motion.span>
        )}
      </div>

      {product.category && (
        <div className="flex items-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-white text-xs font-nunito font-bold"
            style={{ backgroundColor: color }}
          >
            {emoji} {product.category}
          </span>
          <span className="font-mono text-xs text-slate-400">{formatBarcode(product.barcodeNumber)}</span>
        </div>
      )}

      {product.imageUrl && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full h-40 bg-slate-50 rounded-2xl overflow-hidden"
        >
          <img src={product.imageUrl} alt={product.productName} className="w-full h-full object-contain p-4" />
        </motion.div>
      )}

      {product.description && (
        <p className="font-nunito text-sm text-slate-600 leading-relaxed">{product.description}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={onReset} className="btn-bubbly bg-brand-cyan text-white flex-1 py-3 text-base flex items-center justify-center gap-2">
          <PixelCat variant="cyan" action="scan" size={24} />
          Scan Again
        </button>
        <Link href={`/product/${product.barcodeNumber}`} className="btn-bubbly bg-slate-800 text-white flex-1 py-3 text-base text-center">
          Details
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
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
          <PixelCat variant="tabby" action="none" size={56} />
        </div>
        <h2 className="font-fredoka font-bold text-2xl text-slate-800 mb-1">Product Not Found</h2>
        <p className="font-nunito text-slate-500 font-medium">
          Barcode <span className="font-mono font-bold text-slate-700">{formatBarcode(barcode)}</span> is not registered yet.
        </p>
      </motion.div>

      <div className="flex gap-3 pt-2">
        <button onClick={onReset} className="btn-bubbly bg-brand-cyan text-white flex-1 py-3 text-base flex items-center justify-center gap-2">
          <PixelCat variant="cyan" action="scan" size={24} />
          Scan Again
        </button>
        <Link
          href={`/play?register=${barcode}`}
          className="btn-bubbly bg-brand-pink text-white flex-1 py-3 text-base text-center flex items-center justify-center gap-2"
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
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto overflow-hidden">
        <PixelCat variant="gray" action="none" size={48} />
      </div>
      <div>
        <h2 className="font-fredoka font-bold text-xl text-slate-800 mb-1">Oops!</h2>
        <p className="font-nunito text-slate-500 font-medium">{message}</p>
      </div>
      <button onClick={onReset} className="btn-bubbly bg-brand-cyan text-white w-full py-3 text-base">
        Try Again
      </button>
    </div>
  );
}
