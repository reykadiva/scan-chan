'use client';

import { motion } from 'motion/react';

export function ScanOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center">
      {/* Dark overlay with hole */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />

      {/* Scan window */}
      <div className="relative z-10 w-[80%] max-w-[400px] h-[250px] md:h-[300px] flex-shrink-0">
        {/* Corner brackets - softer and thicker */}
        {/* Top-left */}
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="absolute top-0 left-0 w-10 h-10 border-t-[6px] border-l-[6px] border-brand-cyan rounded-tl-2xl"
        />
        {/* Top-right */}
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut', delay: 0.5 }}
          className="absolute top-0 right-0 w-10 h-10 border-t-[6px] border-r-[6px] border-brand-pink rounded-tr-2xl"
        />
        {/* Bottom-left */}
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-0 left-0 w-10 h-10 border-b-[6px] border-l-[6px] border-brand-yellow rounded-bl-2xl"
        />
        {/* Bottom-right */}
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut', delay: 1.5 }}
          className="absolute bottom-0 right-0 w-10 h-10 border-b-[6px] border-r-[6px] border-brand-mint rounded-br-2xl"
        />

        {/* Scanning laser line */}
        <motion.div
          animate={{ top: ['10%', '90%', '10%'] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="absolute left-4 right-4 h-1.5 rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent, #22d3ee, #f472b6, #22d3ee, transparent)',
            boxShadow: '0 0 15px 3px rgba(244, 114, 182, 0.5)',
          }}
        />

        {/* Center hint text */}
        <div className="absolute -bottom-20 left-0 right-0 flex flex-col items-center gap-2">
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="px-5 py-2 bg-slate-900/60 backdrop-blur-md rounded-full border border-white/20 shadow-xl flex flex-col items-center"
          >
            <p className="text-white text-sm font-fredoka font-medium tracking-wide">
              Aim at a barcode
            </p>
          </motion.div>
          <span className="text-white/70 font-nunito text-[11px] drop-shadow-md">
            (Blurry? Move camera back slightly)
          </span>
        </div>
      </div>
    </div>
  );
}
