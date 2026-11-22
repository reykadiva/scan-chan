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
    loadedUserId,
    isLoading,
    loadProfile,
  } = usePlayerStore();

  const [sessionChecked, setSessionChecked] = useState(false);

  // 1. Initial Auth & Session Hydration
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

          const currentStore = usePlayerStore.getState();
          if (!currentStore.isProfileLoaded || currentStore.loadedUserId !== data.user.id) {
            await loadProfile(data.user.id);
          }
          setActiveView('LOBBY');
        } else if (mode === GameMode.GUEST) {
          setActiveView('LOBBY');
        } else {
          setActiveView('TITLE');
        }
      } catch {
        if (!isCancelled) {
          if (mode === GameMode.GUEST) {
            setActiveView('LOBBY');
          } else {
            setActiveView('TITLE');
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
  }, [mode, setMode, loadProfile, setActiveView]);

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

  // 3. Top-level Loading Gate during Cloud Profile Hydration
  const isHydratingCloud =
    !sessionChecked ||
    isLoading ||
    (mode === GameMode.ARASHU && !isProfileLoaded);

  if (isHydratingCloud && mode === GameMode.ARASHU) {
    return <SyncLoadingGate message="SYNCING WITH CLOUD..." />;
  }

  // 4. Render Active View
  if (activeView === 'SCAN') {
    return <ScannerView onClose={() => setActiveView('LOBBY')} />;
  }

  if (activeView === 'LOBBY') {
    return <LobbyView />;
  }

  return <TitleScreenView />;
}
