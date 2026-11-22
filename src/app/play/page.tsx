'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SyncLoadingGate } from '@/components/game/sync-loading-gate';

/**
 * Fallback redirect route for legacy /play URLs.
 * Redirects seamlessly to single-URL SPA root /.
 */
export default function PlayRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return <SyncLoadingGate message="REDIRECTING TO GARDEN..." />;
}
