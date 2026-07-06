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

export const ROOMS: RoomOption[] = [
  { id: 'cozy', name: 'Cozy Bedroom', emoji: '🛋️', gradient: 'from-amber-100 via-orange-50 to-yellow-100', unlockLevel: 1 },
  { id: 'cyberpunk-cafe', name: 'Cyber Café', emoji: '🌃', gradient: 'from-indigo-900 via-purple-900 to-slate-900', unlockLevel: 3 },
  { id: 'outer-space', name: 'Outer Space', emoji: '🌌', gradient: 'from-slate-950 via-indigo-950 to-blue-950', unlockLevel: 5 },
  { id: 'kawaii-garden', name: 'Kawaii Garden', emoji: '🌸', gradient: 'from-pink-100 via-rose-50 to-fuchsia-100', unlockLevel: 7 },
];

export function getRoomGradient(roomId: RoomId): string {
  return ROOMS.find((r) => r.id === roomId)?.gradient || ROOMS[0].gradient;
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
