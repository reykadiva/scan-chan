'use client';

import { motion } from 'motion/react';
import { usePlayerStore } from '@/stores/legacy/player-store';

type RoomId = 'cozy' | 'cyberpunk-cafe' | 'outer-space' | 'kawaii-garden';

interface RoomOption {
  id: RoomId;
  name: string;
  emoji: string;
  gradient: string;
  unlockLevel: number;
}

interface RoomTheme {
  gradient: string;
  isDark: boolean;
  textColor: string;
  subTextColor: string;
  hungerBarColor: string;
  hungerBarBg: string;
  affectionBarColor: string;
  affectionBarBg: string;
  borderColor: string;
  accentColor: string;
  labelBg: string;
  labelText: string;
  pixelDecoration: string;
}

export const ROOMS: RoomOption[] = [
  { id: 'cozy', name: 'Cozy Bedroom', emoji: '🛋️', gradient: 'from-amber-100 via-orange-50 to-yellow-100', unlockLevel: 1 },
  { id: 'cyberpunk-cafe', name: 'Cyber Café', emoji: '🌃', gradient: 'from-indigo-900 via-purple-900 to-slate-900', unlockLevel: 3 },
  { id: 'outer-space', name: 'Outer Space', emoji: '🌌', gradient: 'from-slate-950 via-indigo-950 to-blue-950', unlockLevel: 5 },
  { id: 'kawaii-garden', name: 'Kawaii Garden', emoji: '🌸', gradient: 'from-pink-100 via-rose-50 to-fuchsia-100', unlockLevel: 7 },
];

export const ROOM_THEMES: Record<RoomId, RoomTheme> = {
  'cozy': {
    gradient: 'from-amber-100 via-orange-50 to-yellow-100',
    isDark: false,
    textColor: 'text-amber-900',
    subTextColor: 'text-amber-700',
    hungerBarColor: 'bg-gradient-to-r from-orange-500 to-amber-500',
    hungerBarBg: 'bg-amber-200/50',
    affectionBarColor: 'bg-gradient-to-r from-rose-500 to-pink-500',
    affectionBarBg: 'bg-orange-200/50',
    borderColor: 'border-amber-300/50',
    accentColor: 'text-amber-600',
    labelBg: 'bg-amber-800',
    labelText: 'text-amber-50',
    pixelDecoration: '🍂☕🏠',
  },
  'cyberpunk-cafe': {
    gradient: 'from-indigo-900 via-purple-900 to-slate-900',
    isDark: true,
    textColor: 'text-cyan-100',
    subTextColor: 'text-cyan-300',
    hungerBarColor: 'bg-gradient-to-r from-cyan-400 to-blue-500',
    hungerBarBg: 'bg-slate-800/80',
    affectionBarColor: 'bg-gradient-to-r from-fuchsia-500 to-pink-500',
    affectionBarBg: 'bg-purple-900/80',
    borderColor: 'border-cyan-500/30',
    accentColor: 'text-cyan-400',
    labelBg: 'bg-cyan-500',
    labelText: 'text-slate-900',
    pixelDecoration: '⚡🌃💾',
  },
  'outer-space': {
    gradient: 'from-slate-950 via-indigo-950 to-blue-950',
    isDark: true,
    textColor: 'text-blue-100',
    subTextColor: 'text-blue-300',
    hungerBarColor: 'bg-gradient-to-r from-blue-400 to-indigo-500',
    hungerBarBg: 'bg-slate-900/80',
    affectionBarColor: 'bg-gradient-to-r from-purple-400 to-pink-500',
    affectionBarBg: 'bg-indigo-950/80',
    borderColor: 'border-blue-500/30',
    accentColor: 'text-blue-400',
    labelBg: 'bg-blue-500',
    labelText: 'text-slate-900',
    pixelDecoration: '✨🌌🚀',
  },
  'kawaii-garden': {
    gradient: 'from-pink-100 via-rose-50 to-fuchsia-100',
    isDark: false,
    textColor: 'text-pink-900',
    subTextColor: 'text-pink-700',
    hungerBarColor: 'bg-gradient-to-r from-rose-400 to-pink-500',
    hungerBarBg: 'bg-pink-200/50',
    affectionBarColor: 'bg-gradient-to-r from-fuchsia-500 to-pink-600',
    affectionBarBg: 'bg-rose-200/50',
    borderColor: 'border-pink-300/50',
    accentColor: 'text-pink-600',
    labelBg: 'bg-pink-600',
    labelText: 'text-pink-50',
    pixelDecoration: '🌸🦋🌺',
  },
};

export function getRoomGradient(roomId: RoomId): string {
  return ROOMS.find((r) => r.id === roomId)?.gradient || ROOMS[0].gradient;
}

export function getRoomTheme(roomId: RoomId): RoomTheme {
  return ROOM_THEMES[roomId] || ROOM_THEMES['cozy'];
}

export function RoomSelector() {
  const selectedRoom = usePlayerStore((s) => s.selectedRoom);
  const selectRoom = usePlayerStore((s) => s.selectRoom);
  const level = usePlayerStore((s) => s.level);

  return (
    <div className="space-y-3">
      <h4 className="font-fredoka text-sm font-bold text-slate-700 flex items-center gap-2">
        🏠 Room Background
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {ROOMS.map((room) => {
          const isLocked = level < room.unlockLevel;
          const isActive = selectedRoom === room.id;

          return (
            <motion.button
              key={room.id}
              whileHover={!isLocked ? { scale: 1.03 } : {}}
              whileTap={!isLocked ? { scale: 0.97 } : {}}
              onClick={() => !isLocked && selectRoom(room.id)}
              disabled={isLocked}
              className={`relative p-3 rounded-xl flex flex-col items-center gap-1 border-2 transition-all text-center cursor-pointer ${
                isActive
                  ? 'border-amber-400 bg-amber-50 shadow-md ring-2 ring-amber-300/40'
                  : isLocked
                  ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {/* Mini preview */}
              <div className={`w-full h-8 rounded-lg bg-gradient-to-br ${room.gradient} ${isLocked ? 'grayscale' : ''}`} />
              <span className="text-base leading-none">{room.emoji}</span>
              <span className="font-fredoka text-[10px] font-bold text-slate-600 leading-tight">
                {room.name}
              </span>
              {isLocked && (
                <span className="text-[8px] font-nunito font-bold text-slate-400">
                  🔒 Lv.{room.unlockLevel}
                </span>
              )}
              {isActive && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-white text-[8px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                  ✓
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
