'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayerStore } from '@/stores/legacy/player-store';
import { PixelCat } from '@/components/legacy/pixel-cat';
import { PixelBarcode } from '@/components/ui/pixel-illustrations';

export function BountyHunt() {
  const activeBounty = usePlayerStore((s) => s.activeBounty);
  const generateBounty = usePlayerStore((s) => s.generateBounty);
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!activeBounty) return;

    const timer = setInterval(() => {
      const remaining = activeBounty.expiresAt - Date.now();
      if (remaining <= 0) {
        setIsExpired(true);
        setTimeLeft('Expired!');
        clearInterval(timer);
        return;
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      setIsExpired(false);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeBounty]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-fredoka text-slate-800 text-lg font-bold flex items-center gap-2">
          <PixelCat variant="tabby" action="scan" size={28} />
          Bounty Hunt
        </h3>
        {!activeBounty && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateBounty}
            className="px-4 py-1.5 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white font-fredoka font-bold rounded-full text-xs shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
          >
            <PixelBarcode size={16} /> New Bounty
          </motion.button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeBounty ? (
          <motion.div
            key="bounty-active"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`card-bubbly p-5 border-2 ${
              isExpired
                ? 'bg-red-50/80 border-red-300'
                : 'bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
                <PixelCat variant="calico" action="excited" size={40} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-fredoka font-bold text-sm text-cyan-700 flex items-center gap-1.5">
                    <PixelBarcode size={16} /> Cat Request
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isExpired
                      ? 'bg-red-100 text-red-600'
                      : 'bg-cyan-100 text-cyan-700'
                  }`}>
                    {isExpired ? '⏰ Expired' : `⏳ ${timeLeft}`}
                  </span>
                </div>
                <p className="font-nunito text-sm text-slate-700 italic leading-snug">
                  {activeBounty.description}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-xs font-fredoka font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    +{activeBounty.xpBonus} Bonus XP
                  </span>
                  <span className="text-xs font-nunito text-slate-500">
                    Scan a <strong>{activeBounty.category}</strong> product
                  </span>
                </div>
              </div>
            </div>

            {isExpired && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateBounty}
                className="mt-3 w-full py-2 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white font-fredoka font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <PixelBarcode size={14} /> Generate New Bounty
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="bounty-empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="card-bubbly bg-white p-8 text-center border border-slate-100"
          >
            <div className="mb-3 overflow-hidden flex justify-center">
              <PixelCat variant="gray" action="sleeping" size={48} />
            </div>
            <p className="font-fredoka font-bold text-slate-500 text-sm">
              No active bounty
            </p>
            <p className="font-nunito text-xs text-slate-400 mt-1">
              Tap &quot;New Bounty&quot; to get a cat request! Complete it to earn bonus XP~
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
