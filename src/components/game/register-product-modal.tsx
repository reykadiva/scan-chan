'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { X, Package, Upload, Loader2, ScanLine, Camera, ChevronDown, Flashlight, FlashlightOff } from 'lucide-react';
import { CATEGORIES } from '@/types';
import { useBarcodeScanner, isValidRetailBarcode } from '@/hooks/use-barcode-scanner';
import { playScannerBeep } from '@/lib/sound-effects';
import { toast } from 'sonner';
import { WebcamCapture } from '@/components/game/webcam-capture';
import { useProductStore } from '@/stores/product-store';

function compressImageToDataUrl(
  file: File,
  maxDimension: number,
  quality: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not supported')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Image load failed')); };
    img.src = objectUrl;
  });
}

function BarcodeScannerOverlay({
  onScan,
  onClose,
}: {
  onScan: (barcode: string) => void;
  onClose: () => void;
}) {
  const [paused, setPaused] = useState(false);

  const { videoRef, torch } = useBarcodeScanner({
    onScan: (barcode) => {
      if (!isValidRetailBarcode(barcode)) return;
      setPaused(true);
      playScannerBeep();
      onScan(barcode);
    },
    paused,
    scanIntervalMs: 120,
  });

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col animate-pop-in">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 p-3 sm:p-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="min-w-[44px] min-h-[44px] bg-white border-2 border-[var(--theme-border)] rounded-xl flex items-center justify-center text-[var(--theme-text-dark)] hover:bg-[var(--theme-surface-inner)] shadow-[2px_2px_0_0_var(--theme-shadow)] transition-colors cursor-pointer shrink-0"
        >
          <X className="w-5 h-5" />
        </button>

        <span className="font-press-start font-bold text-white text-xs sm:text-sm tracking-wider drop-shadow-[2px_2px_0_var(--theme-dark)]">
          SCAN BARCODE
        </span>

        <div className="flex gap-2">
          {torch.isAvailable && (
            <button
              type="button"
              onClick={() => torch.toggle()}
              className="min-w-[44px] min-h-[44px] bg-white border-2 border-[var(--theme-border)] rounded-xl flex items-center justify-center text-[var(--theme-text-dark)] hover:bg-[var(--theme-surface-inner)] shadow-[2px_2px_0_0_var(--theme-shadow)] transition-colors cursor-pointer shrink-0"
            >
              {torch.isOn ? <FlashlightOff className="w-5 h-5" /> : <Flashlight className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Video stream */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Viewfinder overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-72 h-48 sm:w-80 sm:h-56">
            <div className="absolute inset-0 bg-transparent rounded-2xl" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)' }} />
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[var(--theme-primary)] rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[var(--theme-primary)] rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[var(--theme-primary)] rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[var(--theme-primary)] rounded-br-xl" />
            <div className="absolute left-2 right-2 h-0.5 bg-[var(--theme-accent)] shadow-[0_2px_0_0_var(--theme-shadow)] animate-scan-line" />
          </div>
          <p className="absolute bottom-8 text-white font-press-start text-[9px] bg-black/60 px-3 py-1.5 rounded-lg border border-white/20">
            Point camera at the product barcode
          </p>
        </div>
      </div>
    </div>
  );
}

interface RegisterProductModalProps {
  initialBarcode?: string;
  creatorId: string;
  onClose: () => void;
  onSuccess: (barcode: string, category: string, productName?: string) => void;
}

export function RegisterProductModal({
  initialBarcode = '',
  creatorId,
  onClose,
  onSuccess,
}: RegisterProductModalProps) {
  const [form, setForm] = useState({
    barcodeNumber: initialBarcode,
    productName: '',
    brand: '',
    category: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanningBarcode, setIsScanningBarcode] = useState(false);
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      let imageUrl: string | null = null;

      // Compress and encode image client-side (no /api/upload route needed)
      if (imageFile) {
        try {
          imageUrl = await compressImageToDataUrl(imageFile, 800, 0.7);
        } catch {
          // Skip image on compression failure — registration can still proceed
          imageUrl = null;
        }
      }

      const cleanBarcode = form.barcodeNumber.trim();
      const localProduct = {
        id: cleanBarcode,
        barcodeNumber: cleanBarcode,
        productName: form.productName.trim(),
        brand: form.brand?.trim() || null,
        category: form.category || null,
        description: form.description?.trim() || null,
        imageUrl,
        creatorId: creatorId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Always save to local store immediately to prevent any data loss
      useProductStore.getState().upsertProduct(localProduct, true);

      let isSynced = false;
      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            barcodeNumber: cleanBarcode,
            productName: form.productName.trim(),
            brand: form.brand?.trim() || null,
            category: form.category || null,
            description: form.description?.trim() || null,
            imageUrl,
            creatorId,
          }),
        });

        const data = await res.json();
        if (data.success && data.data) {
          useProductStore.getState().upsertProduct(data.data, false);
          isSynced = true;
        }
      } catch {
        // Server fetch failed, but local copy is already saved safely in productStore
      }

      onSuccess(cleanBarcode, form.category, form.productName.trim());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
        className="bg-[var(--theme-primary)] border-4 border-white shadow-[6px_6px_0_0_var(--theme-shadow)] rounded-2xl w-[94vw] max-w-lg max-h-[85dvh] flex flex-col relative text-white overflow-hidden"
      >
        {/* Header (Sticky) */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/20 shrink-0 bg-[var(--theme-primary)] rounded-t-2xl z-10">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 bg-white border-2 border-[var(--theme-border)] rounded-xl flex items-center justify-center text-[var(--theme-primary)] shadow-[2px_2px_0_0_var(--theme-shadow)] shrink-0">
              <Package className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <h2 className="font-fredoka text-lg sm:text-xl font-black text-white uppercase tracking-wider drop-shadow-[1.5px_1.5px_0_var(--theme-dark)] truncate">Register Product</h2>
          </div>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] rounded-xl bg-white border-2 border-[var(--theme-border)] text-[var(--theme-text-dark)] hover:bg-[var(--theme-surface-inner)] flex items-center justify-center shadow-[2px_2px_0_0_var(--theme-shadow)] cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Barcode */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block font-fredoka font-bold text-white text-xs uppercase tracking-wide drop-shadow-[1px_1px_0_var(--theme-dark)]">
                Barcode Number <span className="text-white">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsScanningBarcode(true)}
                className="text-xs font-fredoka font-bold text-[var(--theme-text-dark)] bg-white hover:bg-[var(--theme-surface-inner)] px-2.5 py-1 rounded-lg border-2 border-[var(--theme-border)] shadow-[2px_2px_0_0_var(--theme-shadow)] flex items-center gap-1.5 cursor-pointer"
              >
                <ScanLine className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                Scan Barcode
              </button>
            </div>
            <input
              type="text"
              required
              maxLength={20}
              value={form.barcodeNumber}
              onChange={(e) => setForm({ ...form, barcodeNumber: e.target.value })}
              placeholder="e.g. 8991234567890"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-[var(--theme-border)] bg-white text-[var(--theme-text-dark)] font-mono text-sm placeholder-[var(--theme-text-dark)]/40 focus:outline-none focus:ring-2 focus:ring-white shadow-[2px_2px_0_0_var(--theme-shadow)]"
            />
          </div>

          {/* Product Name */}
          <div>
            <label className="block font-fredoka font-bold text-white text-xs mb-1.5 uppercase tracking-wide drop-shadow-[1px_1px_0_var(--theme-dark)]">
              Product Name <span className="text-white">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={255}
              value={form.productName}
              onChange={(e) => setForm({ ...form, productName: e.target.value })}
              placeholder="e.g. Indomie Goreng"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-[var(--theme-border)] bg-white text-[var(--theme-text-dark)] font-nunito font-bold text-sm placeholder-[var(--theme-text-dark)]/40 focus:outline-none focus:ring-2 focus:ring-white shadow-[2px_2px_0_0_var(--theme-shadow)]"
            />
          </div>

          {/* Brand + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-fredoka font-bold text-white text-xs mb-1.5 uppercase tracking-wide drop-shadow-[1px_1px_0_var(--theme-dark)]">Brand</label>
              <input
                type="text"
                maxLength={255}
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="e.g. Indofood"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-[var(--theme-border)] bg-white text-[var(--theme-text-dark)] font-nunito font-bold text-sm placeholder-[var(--theme-text-dark)]/40 focus:outline-none focus:ring-2 focus:ring-white shadow-[2px_2px_0_0_var(--theme-shadow)]"
              />
            </div>
            <div>
              <label className="block font-fredoka font-bold text-white text-xs mb-1.5 uppercase tracking-wide drop-shadow-[1px_1px_0_var(--theme-dark)]">Category</label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="appearance-none w-full pl-4 pr-10 py-2.5 rounded-xl border-2 border-[var(--theme-border)] bg-white text-[var(--theme-text-dark)] font-nunito font-bold text-sm focus:outline-none focus:ring-2 focus:ring-white shadow-[2px_2px_0_0_var(--theme-shadow)]"
                >
                  <option value="">Select...</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--theme-text-dark)]" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-fredoka font-bold text-white text-xs mb-1.5 uppercase tracking-wide drop-shadow-[1px_1px_0_var(--theme-dark)]">Description</label>
            <textarea
              maxLength={500}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief product description..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-[var(--theme-border)] bg-white text-[var(--theme-text-dark)] font-nunito font-medium text-sm placeholder-[var(--theme-text-dark)]/40 focus:outline-none focus:ring-2 focus:ring-white shadow-[2px_2px_0_0_var(--theme-shadow)] resize-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block font-fredoka font-bold text-white text-xs mb-1.5 uppercase tracking-wide drop-shadow-[1px_1px_0_var(--theme-dark)]">Product Photo</label>
            {imagePreview ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border-2 border-[var(--theme-border)] bg-white">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-white border border-[var(--theme-border)] rounded-lg shadow flex items-center justify-center text-[var(--theme-text-dark)] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-white/60 bg-black/15 rounded-xl cursor-pointer hover:bg-white/10 transition-colors gap-1.5 text-center p-2">
                  <Upload className="w-5 h-5 text-white" />
                  <span className="text-white font-nunito text-xs font-bold">Upload Photo</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
                </label>
                <button
                  type="button"
                  onClick={() => setIsCapturingPhoto(true)}
                  className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-white/60 bg-black/15 rounded-xl cursor-pointer hover:bg-white/10 transition-colors gap-1.5 text-center p-2 text-white"
                >
                  <Camera className="w-5 h-5 text-white" />
                  <span className="text-white font-nunito text-xs font-bold">Take Photo</span>
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-[var(--theme-surface-inner)] text-[var(--theme-primary)] font-fredoka font-black text-sm uppercase tracking-wider border-2 border-[var(--theme-border)] shadow-[4px_4px_0_0_var(--theme-shadow)] active:translate-y-0.5 active:shadow-[1px_1px_0_0_var(--theme-shadow)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin text-[var(--theme-primary)]" /> Registering...</>
            ) : (
              <><Package className="w-5 h-5" /> Register Product</>
            )}
          </button>
        </form>
      </motion.div>

      {/* Barcode scanner sub-overlay */}
      {isScanningBarcode && typeof document !== 'undefined' && createPortal(
        <BarcodeScannerOverlay
          onScan={(barcode) => {
            setForm((prev) => ({ ...prev, barcodeNumber: barcode }));
            setIsScanningBarcode(false);
          }}
          onClose={() => setIsScanningBarcode(false)}
        />,
        document.body
      )}

      {/* Camera Capture sub-overlay */}
      {isCapturingPhoto && typeof document !== 'undefined' && createPortal(
        <WebcamCapture
          onCapture={(file) => {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setIsCapturingPhoto(false);
          }}
          onClose={() => setIsCapturingPhoto(false)}
        />,
        document.body
      )}
    </div>
  );
}
