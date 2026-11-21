'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';
import { PixelCat, CatVariantId, CatActionId } from '@/components/game/pixel-cat';

interface GardenAmbientBackgroundProps {
  /** Optional custom ambient overlay tint */
  overlayClassName?: string;
  /** Whether to render floating petals & fireflies */
  particles?: boolean;
  /** Whether to render wandering pets in the garden */
  showCats?: boolean;
}

interface AmbientCat {
  id: string;
  variant: CatVariantId;
  action: CatActionId;
  x: number; // percentage
  y: number; // percentage
  scale: number;
}

export function GardenAmbientBackground({
  // ponytail: Pure solid retro palette, zero gradients
  overlayClassName = 'bg-black/20',
  particles = true,
  showCats = true,
}: GardenAmbientBackgroundProps) {
  // Pre-seed deterministic petal and firefly positions
  const petals = useMemo(
    () => [
      { id: 1, left: 10, delay: 0, duration: 11, size: 10 },
      { id: 2, left: 28, delay: 3, duration: 13, size: 8 },
      { id: 3, left: 50, delay: 1, duration: 12, size: 11 },
      { id: 4, left: 72, delay: 4, duration: 14, size: 9 },
      { id: 5, left: 88, delay: 2, duration: 10, size: 12 },
    ],
    []
  );

  const fireflies = useMemo(
    () => [
      { id: 1, left: 14, top: 22, duration: 4 },
      { id: 2, left: 38, top: 44, duration: 5.5 },
      { id: 3, left: 62, top: 28, duration: 4.8 },
      { id: 4, left: 82, top: 58, duration: 6 },
    ],
    []
  );

  const ambientCats: AmbientCat[] = useMemo(
    () => [
      { id: 'cat-calico', variant: 'calico', action: 'play', x: 25, y: 76, scale: 1.15 },
      { id: 'cat-shadow', variant: 'black', action: 'excited', x: 12, y: 62, scale: 0.95 },
      { id: 'cat-tabby', variant: 'tabby', action: 'sleeping', x: 88, y: 80, scale: 1.05 },
      { id: 'cat-cyan', variant: 'cyan', action: 'say-hi', x: 74, y: 66, scale: 0.9 },
    ],
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Sharp High-Contrast Pixel Garden Artwork */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/garden-bg.jpg')",
          backgroundPosition: 'center 70%',
          imageRendering: 'pixelated',
        }}
      />

      {/* 2. Natural Ambient Tone */}
      <div className="absolute inset-0 bg-black/15" />

      {/* 3. Wandering Pixel Pets roaming in the background */}
      {showCats && (
        <div className="absolute inset-0 overflow-hidden">
          {ambientCats.map((cat) => (
            <div
              key={cat.id}
              className="absolute transition-transform"
              style={{
                left: `${cat.x}%`,
                top: `${cat.y}%`,
                transform: `translate(-50%, -50%) scale(${cat.scale})`,
                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.45))',
              }}
            >
              <PixelCat variant={cat.variant} action={cat.action} size={42} />
            </div>
          ))}
        </div>
      )}

      {/* 4. Floating Petals & Fireflies */}
      {particles && (
        <div className="absolute inset-0 overflow-hidden">
          {petals.map((petal) => (
            <motion.div
              key={`petal-${petal.id}`}
              initial={{ y: -30, x: `${petal.left}vw`, rotate: 0, opacity: 0 }}
              animate={{
                y: '105vh',
                x: [`${petal.left}vw`, `${(petal.left + 6) % 100}vw`, `${(petal.left - 4) % 100}vw`],
                rotate: [0, 180, 360],
                opacity: [0, 0.85, 0.85, 0],
              }}
              transition={{
                duration: petal.duration,
                delay: petal.delay,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute rounded-full bg-[var(--theme-primary)] border border-[var(--theme-border)]"
              style={{
                width: petal.size,
                height: petal.size * 0.7,
                filter: 'drop-shadow(0 2px 4px rgba(220,161,161,0.4))',
              }}
            />
          ))}

          {fireflies.map((fly) => (
            <motion.div
              key={`firefly-${fly.id}`}
              initial={{ opacity: 0.2, scale: 0.8 }}
              animate={{
                opacity: [0.2, 0.9, 0.2],
                scale: [0.8, 1.25, 0.8],
                y: [0, -12, 0],
                x: [0, 8, -6, 0],
              }}
              transition={{
                duration: fly.duration,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_#fde047]"
              style={{
                left: `${fly.left}%`,
                top: `${fly.top}%`,
              }}
            />
          ))}
        </div>
      )}

      {/* 5. Minimal Crisp Contrast Vignette (no washed-out white veil) */}
      <div className={`absolute inset-0 pointer-events-none ${overlayClassName}`} />
    </div>
  );
}
