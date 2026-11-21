'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { usePlayerStore } from '@/stores/player-store';
import { Sparkles } from 'lucide-react';
import { PixelCat, CAT_PALETTES, type CatVariantId } from '@/components/game/pixel-cat';

const CAT_VARIANTS: CatVariantId[] = ['calico', 'gray', 'cyan', 'pink', 'black'];

interface NicknameSetupProps {
  onComplete: () => void;
}

export function NicknameSetup({ onComplete }: NicknameSetupProps) {
  const [nickname, setNickname] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<CatVariantId>('calico');
  const initializePlayer = usePlayerStore((state) => state.initializePlayer);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    initializePlayer(nickname.trim(), selectedVariant);
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
        className="bg-[var(--theme-primary)] border-4 border-white shadow-[6px_6px_0_0_var(--theme-shadow)] rounded-2xl max-w-md w-full p-6 sm:p-8 text-white relative overflow-hidden"
      >
        <div className="text-center mb-6 relative z-10">
          {/* Show selected cat as the header icon */}
          <div className="w-20 h-20 bg-[var(--theme-surface-inner)] border-2 border-[var(--theme-border)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[3px_3px_0_0_var(--theme-shadow)]">
            <PixelCat variant={selectedVariant} size={52} />
          </div>
          <h2 className="font-fredoka text-2xl font-black text-white uppercase tracking-wider mb-1 drop-shadow-[1.5px_1.5px_0_var(--theme-dark)]">Create Character</h2>
          <p className="font-nunito text-white/90 text-sm font-semibold drop-shadow-[1px_1px_0_var(--theme-dark)]">Pick your cat companion to start hunting!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {/* Cat variant picker */}
          <div>
            <label className="block font-fredoka font-bold text-white text-xs mb-2 uppercase tracking-wide drop-shadow-[1px_1px_0_var(--theme-dark)]">
              Choose Your Cat
            </label>
            <div className="grid grid-cols-5 gap-2">
              {CAT_VARIANTS.map((variant) => {
                const isSelected = selectedVariant === variant;
                return (
                  <button
                    type="button"
                    key={variant}
                    onClick={() => setSelectedVariant(variant)}
                    title={CAT_PALETTES[variant].label}
                    className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-white border-2 border-[var(--theme-border)] scale-105 shadow-[2px_2px_0_0_var(--theme-shadow)]'
                        : 'bg-black/15 border-2 border-white/40 hover:border-white'
                    }`}
                  >
                    <PixelCat variant={variant} size={32} />
                    <span
                      className={`font-fredoka text-[9px] font-bold leading-none truncate w-full text-center ${
                        isSelected ? 'text-[var(--theme-primary)]' : 'text-white/90'
                      }`}
                    >
                      {CAT_PALETTES[variant].label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nickname input */}
          <div>
            <label htmlFor="nickname" className="block font-fredoka font-bold text-white text-xs mb-1.5 uppercase tracking-wide drop-shadow-[1px_1px_0_var(--theme-dark)]">
              Hunter Nickname
            </label>
            <input
              id="nickname"
              type="text"
              required
              maxLength={15}
              placeholder="Enter your name..."
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--theme-border)] bg-white font-mono font-bold text-[var(--theme-text-dark)] placeholder-[var(--theme-text-dark)]/40 focus:outline-none focus:ring-2 focus:ring-white shadow-[2px_2px_0_0_var(--theme-shadow)] text-base"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!nickname.trim()}
            className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-[var(--theme-surface-inner)] text-[var(--theme-primary)] font-fredoka font-black text-sm uppercase tracking-wider border-2 border-[var(--theme-border)] shadow-[4px_4px_0_0_var(--theme-shadow)] active:translate-y-0.5 active:shadow-[1px_1px_0_0_var(--theme-shadow)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-[var(--theme-primary)]" />
            <span>Begin Adventure</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}
