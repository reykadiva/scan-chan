/**
 * Sprint 3.9 — Mobile Scanner Optimization
 *
 * Device-specific camera constraints, autofocus reliability,
 * scan latency tuning, Safari/Android Chrome compatibility,
 * orientation handling, memory cleanup, and battery efficiency.
 *
 * This module provides pure configuration and utility functions.
 * It does not own camera streams, barcode decoding, product lookup,
 * feeding, pet state, rewards, or UI rendering.
 */

// ---------------------------------------------------------------------------
// Device Detection
// ---------------------------------------------------------------------------

export type MobileDeviceHint =
  | 'iphone-legacy'     // iPhone 11 and older — blurry ultra-wide default
  | 'iphone-modern'     // iPhone 12+
  | 'android-low-end'   // budget Android with limited camera API
  | 'android-mid'       // mid-range Android
  | 'android-high-end'  // flagship Android
  | 'ipad'
  | 'android-tablet'
  | 'desktop'
  | 'unknown';

export function detectMobileDeviceHint(): MobileDeviceHint {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent;

  // iPad detection (iPadOS spoofs desktop Safari UA but has touch)
  if (/iPad/i.test(ua) || (/Macintosh/i.test(ua) && 'ontouchend' in document)) return 'ipad';

  // iPhone detection
  if (/iPhone/i.test(ua)) {
    // iPhone 11 and older have screen heights ≤ 896 CSS px
    const screenH = window.screen?.height ?? 0;
    return screenH <= 896 ? 'iphone-legacy' : 'iphone-modern';
  }

  // Android tablet (large screen)
  if (/Android/i.test(ua)) {
    const isTablet = Math.min(window.screen?.width ?? 0, window.screen?.height ?? 0) >= 600;
    if (isTablet) return 'android-tablet';

    // Rough RAM-based tier if available
    const ram = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
    if (ram !== undefined) {
      if (ram <= 2) return 'android-low-end';
      if (ram <= 4) return 'android-mid';
      return 'android-high-end';
    }
    return 'android-mid';
  }

  return 'desktop';
}

// ---------------------------------------------------------------------------
// Camera Constraints — per-device optimal getUserMedia constraints
// ---------------------------------------------------------------------------

export interface MobileCameraConstraints {
  readonly video: MediaTrackConstraints;
  readonly audio: false;
}

/**
 * Builds device-optimised getUserMedia constraints.
 *
 * Key mitigations:
 * - iPhone 11 blurry preview: avoids ultra-wide by requesting environment
 *   facing with explicit width/height and NO exact resolution so the OS
 *   picks the main wide-angle lens instead of the ultra-wide.
 * - Safari: avoids `advanced` constraints that Safari ignores or rejects.
 * - Low-end Android: lowers resolution to reduce decode latency.
 * - All mobile: prefers continuous autofocus when supported.
 */
export function buildMobileCameraConstraints(
  hint: MobileDeviceHint,
  options?: { deviceId?: string; facingMode?: 'environment' | 'user' },
): MobileCameraConstraints {
  const facingMode = options?.facingMode ?? 'environment';

  // Base constraints shared across all devices
  const base: MediaTrackConstraints = options?.deviceId
    ? { deviceId: { exact: options.deviceId } }
    : { facingMode };

  switch (hint) {
    case 'iphone-legacy':
      // iPhone 11: request ideal 1280×720 so OS picks the main lens,
      // avoid exact constraints that could select the ultra-wide
      return {
        video: {
          ...base,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 30 },
        },
        audio: false,
      };

    case 'iphone-modern':
      return {
        video: {
          ...base,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30, max: 60 },
        },
        audio: false,
      };

    case 'android-low-end':
      // Lower resolution for faster decode and lower battery draw
      return {
        video: {
          ...base,
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 24, max: 30 },
        },
        audio: false,
      };

    case 'android-mid':
      return {
        video: {
          ...base,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 30 },
        },
        audio: false,
      };

    case 'android-high-end':
      return {
        video: {
          ...base,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30, max: 60 },
        },
        audio: false,
      };

    case 'ipad':
    case 'android-tablet':
      return {
        video: {
          ...base,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 30 },
        },
        audio: false,
      };

    default:
      // Desktop / unknown — generous defaults
      return {
        video: {
          ...base,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      };
  }
}

// ---------------------------------------------------------------------------
// Autofocus Reliability
// ---------------------------------------------------------------------------

/**
 * Attempts to apply continuous autofocus via the ImageCapture API
 * or MediaStreamTrack.applyConstraints.
 * Returns true if autofocus was successfully requested, false otherwise.
 */
export async function requestContinuousAutofocus(stream: MediaStream): Promise<boolean> {
  const track = stream.getVideoTracks()[0];
  if (!track) return false;

  try {
    const capabilities = track.getCapabilities?.() as MediaTrackCapabilities & { focusMode?: string[] };
    if (capabilities?.focusMode?.includes('continuous')) {
      await track.applyConstraints({
        advanced: [{ focusMode: 'continuous' } as MediaTrackConstraintSet],
      });
      return true;
    }
  } catch {
    // applyConstraints may throw on Safari; fall through
  }

  return false;
}

// ---------------------------------------------------------------------------
// Scan Latency Tuning
// ---------------------------------------------------------------------------

/**
 * Returns the optimal decode interval in milliseconds based on device tier.
 * Lower-end devices get a longer interval to avoid frame-dropping.
 */
export function getDecodeIntervalMs(hint: MobileDeviceHint): number {
  switch (hint) {
    case 'android-low-end':
      return 500;
    case 'android-mid':
    case 'iphone-legacy':
    case 'ipad':
    case 'android-tablet':
      return 350;
    case 'iphone-modern':
    case 'android-high-end':
      return 250;
    case 'desktop':
      return 200;
    default:
      return 300;
  }
}

// ---------------------------------------------------------------------------
// Orientation Handling
// ---------------------------------------------------------------------------

export type DeviceOrientation = 'portrait' | 'landscape' | 'unknown';

export function getDeviceOrientation(): DeviceOrientation {
  if (typeof window === 'undefined') return 'unknown';

  // Screen orientation API (modern)
  const so = screen.orientation;
  if (so) {
    return so.type.startsWith('portrait') ? 'portrait' : 'landscape';
  }

  // Fallback to matchMedia
  if (window.matchMedia?.('(orientation: portrait)').matches) return 'portrait';
  if (window.matchMedia?.('(orientation: landscape)').matches) return 'landscape';

  return 'unknown';
}

/**
 * Subscribes to orientation changes and calls the handler.
 * Returns an unsubscribe function for cleanup.
 */
export function onOrientationChange(handler: (orientation: DeviceOrientation) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const callback = () => handler(getDeviceOrientation());

  if (screen.orientation) {
    screen.orientation.addEventListener('change', callback);
    return () => screen.orientation.removeEventListener('change', callback);
  }

  // Fallback: deprecated but widely supported
  window.addEventListener('orientationchange', callback);
  return () => window.removeEventListener('orientationchange', callback);
}

// ---------------------------------------------------------------------------
// Memory Cleanup
// ---------------------------------------------------------------------------

/**
 * Safely disposes a MediaStream by stopping all tracks.
 * Idempotent — safe to call multiple times.
 */
export function disposeMediaStream(stream: MediaStream | null): void {
  if (!stream) return;
  stream.getTracks().forEach((track) => {
    try { track.stop(); } catch { /* already stopped */ }
  });
}

/**
 * Releases the video element's srcObject reference and resets it.
 * Prevents Safari memory leaks where video elements hold stream references.
 */
export function releaseVideoElement(video: HTMLVideoElement | null): void {
  if (!video) return;
  video.pause();
  video.srcObject = null;
  video.removeAttribute('src');
  video.load(); // Forces Safari to release the stream reference
}

// ---------------------------------------------------------------------------
// Background / Foreground Recovery
// ---------------------------------------------------------------------------

export type AppVisibilityState = 'visible' | 'hidden';

/**
 * Subscribes to Page Visibility API changes.
 * Returns an unsubscribe function.
 */
export function onVisibilityChange(handler: (state: AppVisibilityState) => void): () => void {
  if (typeof document === 'undefined') return () => {};

  const callback = () => handler(document.visibilityState === 'visible' ? 'visible' : 'hidden');
  document.addEventListener('visibilitychange', callback);
  return () => document.removeEventListener('visibilitychange', callback);
}

// ---------------------------------------------------------------------------
// Battery Efficiency
// ---------------------------------------------------------------------------

/**
 * Returns whether the device is on a low battery level (< 20%).
 * When low, the decode loop should widen its interval.
 */
export async function isLowBattery(): Promise<boolean> {
  try {
    const battery = await (navigator as unknown as { getBattery?: () => Promise<{ level: number; charging: boolean }> }).getBattery?.();
    if (battery && !battery.charging && battery.level < 0.2) return true;
  } catch {
    // Battery API unavailable
  }
  return false;
}

/**
 * Returns a multiplier for the decode interval.
 * When battery is low, doubles the interval to save power.
 */
export async function getBatteryDecodeMultiplier(): Promise<number> {
  return (await isLowBattery()) ? 2 : 1;
}

// ---------------------------------------------------------------------------
// Safari Compatibility Helpers
// ---------------------------------------------------------------------------

/**
 * Safari on iOS has specific quirks:
 * - getUserMedia requires `playsinline` attribute on video element
 * - autoplay requires user gesture on first use
 * - MediaStream tracks may freeze on background/foreground
 *
 * This helper detects Safari for conditional code paths.
 */
export function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /Safari/i.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS/i.test(ua);
}

/**
 * Android Chrome also has quirks:
 * - May require explicit facingMode rather than deviceId for environment camera
 * - Some OEMs return duplicate devices from enumerateDevices
 */
export function isAndroidChrome(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /Android/i.test(ua) && /Chrome/i.test(ua) && !/EdgA/i.test(ua);
}

// ---------------------------------------------------------------------------
// Preview Rendering Performance
// ---------------------------------------------------------------------------

/**
 * Configures a video element for optimal mobile scanner preview:
 * - playsInline for iOS Safari
 * - muted to enable autoplay
 * - disablePictureInPicture to prevent accidental PiP
 * - object-fit cover for clean full-bleed preview
 */
export function configureVideoForMobileScanning(video: HTMLVideoElement): void {
  video.playsInline = true;
  video.muted = true;
  video.autoplay = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('muted', '');
  video.setAttribute('autoplay', '');
  video.disablePictureInPicture = true;
  video.style.objectFit = 'cover';
}
