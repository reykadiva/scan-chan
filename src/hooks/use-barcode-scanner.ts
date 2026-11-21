'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/library';

/**
 * Validates that scanned text is a genuine 1D retail product barcode.
 * Rejects QR codes, promo URLs (http://, https://), and strings with complex symbols.
 */
export function isValidRetailBarcode(rawText: string): boolean {
  if (!rawText) return false;
  const trimmed = rawText.trim();

  // 1. Explicitly ignore URLs and protocol links from packaging promo QR codes
  if (/^(https?:\/\/|www\.|\/\/|[a-z0-9]+:\/\/)/i.test(trimmed)) {
    return false;
  }

  // 2. Ignore text containing URL/query/JSON delimiters (?, &, =, #, /, \, {, }, [, ], ", ;, %)
  if (/[?&=#\/\\{}\[\]";%<>]/.test(trimmed)) {
    return false;
  }

  // 3. Retail 1D barcodes strictly consist of alphanumeric characters with standard hyphen/dash/dot (Code 128/39)
  if (!/^[A-Za-z0-9\-._]+$/.test(trimmed)) {
    return false;
  }

  // 4. Barcode length boundaries: consumer retail barcodes are between 4 and 48 characters
  if (trimmed.length < 4 || trimmed.length > 48) {
    return false;
  }

  return true;
}

interface UseBarcodeScannerOptions {
  onScan: (barcode: string) => void;
  paused?: boolean;
  scanIntervalMs?: number;
}

interface TorchState {
  isAvailable: boolean;
  isOn: boolean;
  toggle: () => Promise<void>;
}

interface UseBarcodeScannerResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isScanning: boolean;
  hasCamera: boolean;
  cameraError: string | null;
  torch: TorchState;
  restartCamera: () => Promise<void>;
}

export function useBarcodeScanner({
  onScan,
  paused = false,
  scanIntervalMs = 80,
}: UseBarcodeScannerOptions): UseBarcodeScannerResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const zxingReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const nativeDetectorRef = useRef<any>(null);

  const [hasCamera, setHasCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  const onScanRef = useRef(onScan);
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // Initialize ZXing reader with strict 1D retail barcode formats (ignoring 2D/QR codes)
  useEffect(() => {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.ITF,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);

    const reader = new BrowserMultiFormatReader(hints);
    zxingReaderRef.current = reader;

    // Check native W3C BarcodeDetector support (whitelisted to 1D retail formats only)
    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      try {
        const NativeDetector = (window as any).BarcodeDetector;
        nativeDetectorRef.current = new NativeDetector({
          formats: [
            'ean_13',
            'ean_8',
            'upc_a',
            'upc_e',
            'code_128',
            'code_39',
            'itf',
          ],
        });
      } catch (e) {
        nativeDetectorRef.current = null;
      }
    }

    return () => {
      try {
        reader.reset();
      } catch {
        // ignore reset errors
      }
      zxingReaderRef.current = null;
      nativeDetectorRef.current = null;
    };
  }, []);

  // Safe camera stream acquisition with multi-stage fallback
  const startCamera = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera API is not supported in this browser.');
      return;
    }

    // Stop existing stream if running
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCameraError(null);
    let stream: MediaStream | null = null;

    // Stage 1: Rear environment camera with HD resolution
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
    } catch {
      // Stage 2: Rear camera without specific resolution
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
      } catch {
        // Stage 3: Any available camera (desktop webcam, Mac FaceTime camera, etc.)
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch (finalErr: any) {
          console.warn('[useBarcodeScanner] Camera access failed:', finalErr);
          setCameraError(
            finalErr?.name === 'NotAllowedError'
              ? 'Camera permission denied. Please allow camera access in your browser settings.'
              : 'Could not access camera. Please check your device camera.'
          );
          setHasCamera(false);
          return;
        }
      }
    }

    if (!stream) return;
    streamRef.current = stream;
    setHasCamera(true);

    // Check torch capabilities
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      try {
        const capabilities = (videoTrack.getCapabilities?.() as any) || {};
        setTorchAvailable(!!capabilities.torch);
      } catch {
        setTorchAvailable(false);
      }
    }

    // Bind to video element
    const video = videoRef.current;
    if (video) {
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('muted', 'true');

      try {
        await video.play();
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.warn('[useBarcodeScanner] video.play() error:', err);
        }
      }
    }
  }, []);

  // Torch toggle
  const toggleTorch = useCallback(async () => {
    if (!torchAvailable || !streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextState = !torchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextState }],
      });
      setTorchOn(nextState);
    } catch (e) {
      console.warn('[useBarcodeScanner] Failed to toggle torch:', e);
    }
  }, [torchAvailable, torchOn]);

  // Main scanning loop
  useEffect(() => {
    let animId: number;
    let isMounted = true;
    let isProcessing = false;
    let lastScanTime = 0;

    const scanFrame = async (timestamp: number) => {
      if (!isMounted) return;

      if (!pausedRef.current && timestamp - lastScanTime >= scanIntervalMs) {
        lastScanTime = timestamp;
        const video = videoRef.current;

        if (
          video &&
          video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
          video.videoWidth > 0 &&
          !isProcessing
        ) {
          isProcessing = true;
          let detectedBarcode: string | null = null;

          // 1. Try Native BarcodeDetector first (GPU-accelerated, ultra fast)
          if (nativeDetectorRef.current) {
            try {
              const barcodes = await nativeDetectorRef.current.detect(video);
              if (barcodes && barcodes.length > 0) {
                const raw = barcodes[0].rawValue?.trim();
                if (raw) {
                  detectedBarcode = raw;
                }
              }
            } catch {
              // Native detector error on this frame, fall through to ZXing
            }
          }

          // 2. Fallback to ZXing pure JS engine (Safari, iOS, Firefox, unsupported native)
          if (!detectedBarcode && zxingReaderRef.current) {
            try {
              const result = zxingReaderRef.current.decode(video);
              if (result) {
                const text = result.getText()?.trim();
                if (text) {
                  detectedBarcode = text;
                }
              }
            } catch {
              // No barcode found in current frame, normal loop
            }
          }

          isProcessing = false;

          // Validate that the detected text is a genuine 1D retail barcode (and not a QR code/URL)
          if (detectedBarcode) {
            if (!isValidRetailBarcode(detectedBarcode)) {
              detectedBarcode = null;
            }
          }

          if (detectedBarcode && !pausedRef.current) {
            setIsScanning(false);
            onScanRef.current(detectedBarcode);
            return; // Pause loop until parent resets
          }
        }
      }

      animId = requestAnimationFrame(scanFrame);
    };

    startCamera().then(() => {
      if (isMounted) {
        setIsScanning(true);
        animId = requestAnimationFrame(scanFrame);
      }
    });

    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [startCamera, scanIntervalMs]);

  return {
    videoRef,
    isScanning,
    hasCamera,
    cameraError,
    torch: {
      isAvailable: torchAvailable,
      isOn: torchOn,
      toggle: toggleTorch,
    },
    restartCamera: startCamera,
  };
}
