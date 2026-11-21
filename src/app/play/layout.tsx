import type { Metadata } from 'next';
import { GardenAmbientBackground } from '@/components/layout/garden-ambient-background';

export const metadata: Metadata = {
  title: 'Scan Chan - Barcode Pet Game',
  description: 'Your arcade companion garden and scanner dashboard',
};

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full min-h-screen flex flex-col select-none">
      {/* Living Pixel Garden Background - fixed in viewport behind centered column */}
      {/* ponytail: Fixed garden canvas that stays visible around single-column content */}
      <GardenAmbientBackground
        particles={true}
        showCats={true}
      />

      {/* Main Game Hub Content */}
      <div className="relative z-10 w-full min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}
