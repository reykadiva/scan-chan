'use client';

import { useState, useEffect } from 'react';
import { usePlayerStore } from '@/stores/player-store';
import { GameMode } from '@/lib/game-config';
import { TitleScreenView } from '@/components/views/title-screen-view';
import { LobbyView } from '@/components/views/lobby-view';
import { ScannerView } from '@/components/views/scanner-view';
import { SyncLoadingGate } from '@/components/game/sync-loading-gate';

export default function SinglePageApp() {
  const {
    activeView,
    setActiveView,
    mode,
    setMode,
    isProfileLoaded,
    isLoading,
    error,
    loadProfile,
  } = usePlayerStore();

  const [sessionChecked, setSessionChecked] = useState(false);

  // 1. Initial Auth & Background Hydration on Startup
  // Users always land on the 'TITLE' screen (Press To Start) upon initial load or refresh,
  // while valid Hunter sessions and cloud profiles hydrate quietly in the background.
  useEffect(() => {
    let isCancelled = false;

    async function checkSession() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();

        if (isCancelled) return;

        if (data.authenticated && data.user) {
          if (mode !== GameMode.ARASHU) {
            setMode(GameMode.ARASHU);
          }
          if (data.user.email) {
            usePlayerStore.setState({ userEmail: data.user.email });
          }

          // Quietly hydrate cloud profile in background while user enjoys the Title screen
          const currentStore = usePlayerStore.getState();
          if (!currentStore.isProfileLoaded || currentStore.loadedUserId !== data.user.id) {
            await loadProfile(data.user.id);
          }
        } else {
          // Unauthenticated / 401: Clear stale Hunter session state so we never get stuck
          if (mode === GameMode.ARASHU) {
            setMode(null);
            usePlayerStore.setState({
              isProfileLoaded: false,
              loadedUserId: null,
              isLoading: false,
              error: null,
            });
          }
        }
      } catch {
        if (!isCancelled) {
          if (mode === GameMode.ARASHU) {
            setMode(null);
            usePlayerStore.setState({
              isProfileLoaded: false,
              loadedUserId: null,
              isLoading: false,
              error: null,
            });
          }
        }
      } finally {
        if (!isCancelled) {
          setSessionChecked(true);
        }
      }
    }

    checkSession();

    return () => {
      isCancelled = true;
    };
  }, []); // Run once on startup

  // 2. Hardware / Browser Back Button Integration for SPA (popstate)
  useEffect(() => {
    const handlePopState = () => {
      if (usePlayerStore.getState().activeView === 'SCAN') {
        usePlayerStore.getState().setActiveView('LOBBY');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // When activeView becomes SCAN, push history state so back button returns to LOBBY
  useEffect(() => {
    if (activeView === 'SCAN') {
      window.history.pushState({ view: 'SCAN' }, '', '/');
    }
  }, [activeView]);

  // 3. Render Active View
  // Always render Title Screen first when at 'TITLE' (never block Title with a loading gate)
  if (activeView === 'TITLE') {
    return <TitleScreenView />;
  }

  // Camera Barcode Scanner View
  if (activeView === 'SCAN') {
    return <ScannerView onClose={() => setActiveView('LOBBY')} />;
  }

  // Lobby Garden View: Only show Loading Gate if in Hunter mode and waiting for cloud profile
  if (activeView === 'LOBBY') {
    const isWaitingHunterProfile =
      mode === GameMode.ARASHU && (!isProfileLoaded || isLoading);

    if (isWaitingHunterProfile) {
      return (
        <SyncLoadingGate
          message="SYNCING WITH CLOUD..."
          error={error}
          onRetry={() => {
            loadProfile();
          }}
        />
      );
    }

    return <LobbyView />;
  }

  return <TitleScreenView />;
}
