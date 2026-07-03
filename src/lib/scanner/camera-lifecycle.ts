import type {
  CameraAdapter,
  CameraLifecycleEventModel,
  CameraLifecycleStateModel,
  CameraPermissionState,
  CameraSessionCoordinator,
  CameraSessionModel,
} from '@/types/scanner';

export function createCameraLifecycleState(input: {
  session?: CameraSessionModel | null;
  permission?: CameraPermissionState;
  events?: readonly CameraLifecycleEventModel[];
  disposed?: boolean;
} = {}): CameraLifecycleStateModel {
  return {
    camera: {
      session: input.session ?? null,
      capabilities: [],
      permission: input.permission ?? 'unknown',
      lastError: null,
    },
    events: input.events ?? [],
    disposed: input.disposed ?? false,
  };
}

export function createCameraSessionCoordinator(input: {
  adapter: CameraAdapter;
  session: CameraSessionModel;
  permission?: CameraPermissionState;
}): CameraSessionCoordinator {
  let state = createCameraLifecycleState({ session: input.session, permission: input.permission ?? 'unknown' });

  const update = (session: CameraSessionModel, event: CameraLifecycleEventModel, disposed = state.disposed) => {
    state = { ...state, camera: { ...state.camera, session }, events: [...state.events, event], disposed };
    return state;
  };

  return {
    warmUp: async (now) => update(await input.adapter.lifecycle.warmUp(now), { type: 'warm-up', occurredAt: now }),
    start: async (now) => update(await input.adapter.lifecycle.start(now), { type: 'start', occurredAt: now }),
    pause: async (now) => update(await input.adapter.lifecycle.pause(now), { type: 'pause', occurredAt: now }),
    resume: async (now) => update(await input.adapter.lifecycle.resume(now), { type: 'resume', occurredAt: now }),
    enterBackground: async (now) => update(await input.adapter.lifecycle.pause(now), { type: 'background', occurredAt: now }),
    enterForeground: async (now) => update(await input.adapter.lifecycle.resume(now), { type: 'foreground', occurredAt: now }),
    changeOrientation: (orientation, now) => {
      const session = state.camera.session ?? input.session;
      return update({ ...session, orientation, updatedAt: now }, { type: 'orientation-change', occurredAt: now, orientation });
    },
    recover: async (now) => update(await input.adapter.lifecycle.resume(now), { type: 'recover', occurredAt: now }),
    shutdown: async (now) => {
      const stopped = await input.adapter.lifecycle.stop(now);
      await input.adapter.lifecycle.dispose(now);
      return update(stopped, { type: 'dispose', occurredAt: now }, true);
    },
  };
}

export function createMockCameraLifecycle(input: {
  adapter: CameraAdapter;
  session: CameraSessionModel;
  permission?: CameraPermissionState;
}) {
  return createCameraSessionCoordinator(input);
}
