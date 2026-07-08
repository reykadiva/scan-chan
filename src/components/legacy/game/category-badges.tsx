'use client';

import { motion } from 'motion/react';
import { usePlayerStore } from '@/stores/legacy/player-store';
import { PixelCat } from '@/components/legacy/pixel-cat';
import { 
  PixelSnack, 
  PixelDrink, 
  PixelCandy, 
  PixelDairy, 
  PixelBiscuit, 
  PixelFood 
} from '@/components/ui/pixel-illustrations';

interface Badge {
  id: string;
  title: string;
  icon: 'snack' | 'drink' | 'candy' | 'dairy' | 'biscuit' | 'night';
  category: string; // 'Snack' | 'Drink' | 'night' etc.
  threshold: number;
  color: string; // tailwind gradient
  description: string;
}

const BADGES: Badge[] = [
  {
    id: 'snack-master',
    title: 'Snack Master',
    icon: 'snack',
    category: 'Snack',
    threshold: 20,
    color: 'from-orange-400 to-amber-500',
    description: 'Scan 20+ snack products',
  },
  {
    id: 'drink-champion',
    title: 'Healthy Hydration',
    icon: 'drink',
    category: 'Drink',
    threshold: 20,
    color: 'from-cyan-400 to-blue-500',
    description: 'Scan 20+ drink products',
  },
  {
    id: 'candy-collector',
    title: 'Candy Collector',
    icon: 'candy',
    category: 'Candy',
    threshold: 15,
    color: 'from-pink-400 to-rose-500',
    description: 'Scan 15+ candy products',
  },
  {
    id: 'dairy-devotee',
    title: 'Dairy Devotee',
    icon: 'dairy',
    category: 'Dairy',
    threshold: 15,
    color: 'from-emerald-400 to-teal-500',
    description: 'Scan 15+ dairy products',
  },
  {
    id: 'biscuit-boss',
    title: 'Biscuit Boss',
    icon: 'biscuit',
    category: 'Biscuit',
    threshold: 15,
    color: 'from-amber-500 to-yellow-600',
    description: 'Scan 15+ biscuit products',
  },
  {
    id: 'midnight-gamer',
    title: 'Midnight Gamer',
    icon: 'night',
    category: 'night',
    threshold: 5,
    color: 'from-indigo-500 to-purple-600',
    description: 'Scan 5+ products after 11 PM',
  },
];

export function CategoryBadges() {
  const categoryScans = usePlayerStore((s) => s.categoryScans);
  const nightScans = usePlayerStore((s) => s.nightScans);

  const getProgress = (badge: Badge): number => {
    if (badge.category === 'night') return nightScans;
    return categoryScans[badge.category] || 0;
  };

  const unlockedCount = BADGES.filter((b) => getProgress(b) >= b.threshold).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-fredoka text-slate-800 text-lg font-bold flex items-center gap-2">
          <PixelCat variant="cyan" action="achievements" size={28} />
          Category Badges
        </h3>
        <span className="text-xs font-nunito font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
          🏅 {unlockedCount}/{BADGES.length} unlocked
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {BADGES.map((badge, idx) => {
          const progress = getProgress(badge);
          const isUnlocked = progress >= badge.threshold;
          const percentage = Math.min(100, (progress / badge.threshold) * 100);

          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className={`card-bubbly p-4 flex flex-col items-center text-center border-2 transition-all ${
                isUnlocked
                  ? 'bg-gradient-to-br from-white to-slate-50 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                  : 'bg-white border-slate-200'
              }`}
            >
              {/* Badge Icon */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                isUnlocked
                  ? `bg-gradient-to-br ${badge.color} shadow-md`
                  : 'bg-slate-100'
              }`}>
                <span className={`${isUnlocked ? '' : 'grayscale opacity-50'}`}>
                  {badge.icon === 'snack' && <PixelSnack size={24} />}
                  {badge.icon === 'drink' && <PixelDrink size={24} />}
                  {badge.icon === 'candy' && <PixelCandy size={24} />}
                  {badge.icon === 'dairy' && <PixelDairy size={24} />}
                  {badge.icon === 'biscuit' && <PixelBiscuit size={24} />}
                  {badge.icon === 'night' && <span className="text-xl">🌙</span>}
                </span>
              </div>

              <h4 className={`font-fredoka text-xs font-bold leading-tight ${
                isUnlocked ? 'text-slate-800' : 'text-slate-400'
              }`}>
                {badge.title}
              </h4>

              <p className="font-nunito text-[9px] text-slate-400 mt-0.5 leading-tight">
                {badge.description}
              </p>

              {/* Progress bar */}
              <div className="w-full mt-2">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-nunito text-[9px] font-bold text-slate-500">
                    {progress}/{badge.threshold}
                  </span>
                  {isUnlocked && (
                    <span className="text-[9px] font-bold text-amber-600">✨ Done!</span>
                  )}
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.06 }}
                    className={`h-full rounded-full ${
                      isUnlocked
                        ? `bg-gradient-to-r ${badge.color}`
                        : 'bg-slate-300'
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
