'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayerStore } from '@/stores/legacy/player-store';
import { PixelCat } from '@/components/legacy/pixel-cat';
import { toast } from 'sonner';

const DAY_REWARDS = [
  { day: 1, label: '+20 XP', emoji: '⭐', desc: 'XP & Food' },
  { day: 2, label: '+20 XP', emoji: '⭐', desc: 'XP & Food' },
  { day: 3, label: '+20 XP', emoji: '⭐', desc: 'XP & Food' },
  { day: 4, label: '+20 XP', emoji: '✨', desc: 'XP Boost' },
  { day: 5, label: '+30 XP', emoji: '💖', desc: '+15 Affection' },
  { day: 6, label: '+30 XP', emoji: '💖', desc: '+15 Affection' },
  { day: 7, label: '+50 XP', emoji: '👑', desc: 'Streak Master!' },
];

export function LoginCalendar() {
  const loginCalendar = usePlayerStore((s) => s.loginCalendar);
  const streak = usePlayerStore((s) => s.streak);
  const claimLoginReward = usePlayerStore((s) => s.claimLoginReward);
  const [showReward, setShowReward] = useState(false);
  const [rewardInfo, setRewardInfo] = useState<{ xp: number; food: boolean; affection: number; border: string | null } | null>(null);
  const [hasClaimed, setHasClaimed] = useState(false);

  const todayStr = new Date().toLocaleDateString('en-CA');
  const alreadyClaimed = loginCalendar.includes(todayStr);

  useEffect(() => {
    setHasClaimed(alreadyClaimed);
  }, [alreadyClaimed]);

  // Count consecutive days
  let consecutiveDays = 0;
  const today = new Date(todayStr);
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const checkStr = checkDate.toLocaleDateString('en-CA');
    if (loginCalendar.includes(checkStr)) {
      consecutiveDays++;
    } else {
      break;
    }
  }

  const handleClaim = () => {
    if (hasClaimed) return;
    const result = claimLoginReward(todayStr);
    setRewardInfo(result);
    setShowReward(true);
    setHasClaimed(true);

    if (result.border) {
      toast.success('🏆 Streak Master! You unlocked the Holographic border!');
    } else if (result.affection > 0) {
      toast.success(`💖 +${result.affection} Pet Affection boost!`);
    } else {
      toast.success(`⭐ +${result.xp} XP daily reward claimed!`);
    }

    setTimeout(() => setShowReward(false), 3000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-fredoka text-slate-800 text-lg font-bold flex items-center gap-2">
          <PixelCat variant="calico" action="achievements" size={28} />
          Daily Login Calendar
        </h3>
        <span className="text-xs font-nunito font-bold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full">
          🔥 {streak} day streak
        </span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {DAY_REWARDS.map((reward, idx) => {
          const isDone = idx < consecutiveDays;
          const isToday = idx === consecutiveDays && !hasClaimed;
          const isFuture = idx > consecutiveDays || (idx === consecutiveDays && hasClaimed);

          return (
            <motion.div
              key={reward.day}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={`relative rounded-xl p-2 flex flex-col items-center justify-center text-center aspect-square border-2 transition-all ${
                isDone
                  ? 'bg-green-50 border-green-300 shadow-sm'
                  : isToday
                  ? 'bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-400 shadow-md ring-2 ring-amber-300/50 animate-pulse cursor-pointer'
                  : 'bg-slate-50 border-slate-200 opacity-50'
              }`}
              onClick={isToday ? handleClaim : undefined}
            >
              <span className="text-lg leading-none">{isDone ? '✅' : reward.emoji}</span>
              <span className="font-fredoka text-[9px] font-bold text-slate-600 mt-0.5">
                Day {reward.day}
              </span>
              <span className="font-nunito text-[8px] text-slate-500 leading-tight">
                {reward.desc}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Claim button */}
      {!hasClaimed ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleClaim}
          className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white font-fredoka font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm cursor-pointer"
        >
          🎁 Claim Today&apos;s Login Reward!
        </motion.button>
      ) : (
        <div className="w-full py-3 bg-green-50 text-green-700 font-fredoka font-bold rounded-xl text-center text-sm border border-green-200">
          ✅ Reward claimed! Come back tomorrow~
        </div>
      )}

      {/* Reward popup */}
      <AnimatePresence>
        {showReward && rewardInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 text-center border border-amber-200 max-w-xs mx-4">
              <div className="text-4xl mb-2">🎉</div>
              <h4 className="font-fredoka text-lg font-bold text-slate-800">Reward Claimed!</h4>
              <p className="font-nunito text-sm text-slate-600 mt-1">
                +{rewardInfo.xp} XP earned
                {rewardInfo.food && ' • 🍱 Food item added'}
                {rewardInfo.affection > 0 && ` • 💖 +${rewardInfo.affection} Affection`}
                {rewardInfo.border && ' • 👑 Streak Master border unlocked!'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
