'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SyncLoadingGate } from '@/components/game/sync-loading-gate';

/**
 * Fallback redirect for legacy /play/mode route.
 * Redirects seamlessly to single-URL SPA root /.
 */
export default function ModeRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return <SyncLoadingGate message="REDIRECTING TO HOME..." />;
}
