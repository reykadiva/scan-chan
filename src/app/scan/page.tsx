'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/stores/player-store';
import { SyncLoadingGate } from '@/components/game/sync-loading-gate';

/**
 * Fallback redirect route for legacy /scan URLs.
 * Sets activeView to SCAN and redirects to single-URL SPA root /.
 */
export default function ScanRedirectPage() {
  const router = useRouter();
  const setActiveView = usePlayerStore((s) => s.setActiveView);

  useEffect(() => {
    setActiveView('SCAN');
    router.replace('/');
  }, [router, setActiveView]);

  return <SyncLoadingGate message="LAUNCHING SCANNER..." />;
}
