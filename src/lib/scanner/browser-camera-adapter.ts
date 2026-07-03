import {
  createCameraAdapterError,
  createCameraCapability,
  createCameraSession,
  createScanFrame,
  transitionCameraSession,
} from '@/lib/scanner/camera-adapter';
import type {
  BrowserCameraAdapter,
  BrowserCameraDeviceModel,
  CameraFacingMode,
} from '@/types/scanner';
import { buildMobileCameraConstraints, detectMobileDeviceHint } from './mobile-optimization';

type MediaDevicesAccess = Pick<MediaDevices, 'enumerateDevices' | 'getUserMedia'>;

export function createBrowserCameraAdapter(mediaDevices: MediaDevicesAccess = getBrowserMediaDevices()): BrowserCameraAdapter {
  let stream: MediaStream | null = null;
  let session = createCameraSession({ id: 'browser-camera-session', adapterTarget: 'camera-adapter', now: 0 });

  const createStream = async (input: { deviceId?: string; facingMode?: CameraFacingMode; now: number }) => {
    stopStream(stream);
    const hint = detectMobileDeviceHint();
    const constraints = buildMobileCameraConstraints(hint, {
      deviceId: input.deviceId,
      facingMode: input.facingMode === 'unknown' ? 'environment' : input.facingMode,
    });
    stream = await mediaDevices.getUserMedia(constraints);
    session = transitionCameraSession(session, 'ready', input.now);
    return stream;
  };

  return {
    target: 'camera-adapter',
    detectCapabilities: async () => createCameraCapability('camera-adapter', true),
    createSession: (input) => {
      session = createCameraSession({ id: input.id, adapterTarget: 'camera-adapter', now: input.now, facingMode: input.facingMode });
      return session;
    },
    lifecycle: {
      warmUp: async (now) => (session = transitionCameraSession(session, 'warming-up', now)),
      start: async (now) => {
        if (!stream) await createStream({ facingMode: session.facingMode, now });
        return (session = transitionCameraSession(session, 'ready', now));
      },
      pause: async (now) => (session = transitionCameraSession(session, 'paused', now)),
      resume: async (now) => {
        if (!stream) await createStream({ facingMode: session.facingMode, now });
        return (session = transitionCameraSession(session, 'ready', now));
      },
      stop: async (now) => {
        stopStream(stream);
        stream = null;
        return (session = transitionCameraSession(session, 'stopped', now));
      },
      dispose: async () => {
        stopStream(stream);
        stream = null;
      },
    },
    focus: { supportsContinuousAutofocus: false, requestAutofocus: async () => false },
    torch: { supportsTorch: false, setTorch: async () => false },
    zoom: { supportsZoom: false, setZoom: async () => false },
    readFrame: async (now) => createScanFrame({ id: `browser-frame-${now}`, capturedAt: now }),
    enumerateDevices: async () => (await mediaDevices.enumerateDevices()).filter(isVideoInput).map(toCameraDevice),
    createStream,
    switchCamera: createStream,
    shutdownStream: () => {
      stopStream(stream);
      stream = null;
    },
    getStream: () => stream,
  };
}

export function createMockBrowserCameraAdapter(options: {
  devices?: readonly BrowserCameraDeviceModel[];
  stream?: MediaStream | readonly MediaStream[];
} = {}) {
  const devices = options.devices ?? [{ deviceId: 'rear-camera', label: 'Rear Camera', facingMode: 'environment' as const }];
  const streams = Array.isArray(options.stream) ? [...options.stream] : [options.stream ?? createMockMediaStream()];
  return createBrowserCameraAdapter({
    enumerateDevices: async () =>
      devices.map((device) => ({
        deviceId: device.deviceId,
        groupId: '',
        kind: 'videoinput' as const,
        label: device.label,
        toJSON: () => device,
      })),
    getUserMedia: async () => streams.shift() ?? streams[0] ?? createMockMediaStream(),
  });
}

function getBrowserMediaDevices(): MediaDevicesAccess {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
    throw createCameraAdapterError('adapter-unavailable', 'Browser media devices are unavailable.');
  }
  return navigator.mediaDevices;
}

function isVideoInput(device: MediaDeviceInfo) {
  return device.kind === 'videoinput';
}

function toCameraDevice(device: MediaDeviceInfo): BrowserCameraDeviceModel {
  const label = device.label || 'Camera';
  return {
    deviceId: device.deviceId,
    label,
    facingMode: /front|user/i.test(label) ? 'user' : /rear|back|environment/i.test(label) ? 'environment' : 'unknown',
  };
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

function createMockMediaStream(): MediaStream {
  return { getTracks: () => [{ stop: () => undefined }] } as MediaStream;
}
