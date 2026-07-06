'use client';

import { usePlayerStore, xpForLevel } from '@/stores/legacy/player-store';
import { toast } from 'sonner';
import { Sparkles, Palette } from 'lucide-react';

interface UnlockItem {
  level: number;
  xpNeeded: number;
  rewardType: 'border' | 'theme' | 'avatar';
  rewardValue: string;
  name: string;
  description: string;
}

export function LevelRoadmap() {
  const { xp, level, selectedBorder, selectedTheme, selectBorder, selectTheme } = usePlayerStore();

  const roadmap: UnlockItem[] = [
    {
      level: 2,
      xpNeeded: xpForLevel(2),
      rewardType: 'border',
      rewardValue: 'bronze',
      name: 'Bronze Profile Border',
      description: 'Unlock a beautiful metallic bronze outline around your avatar.',
    },
    {
      level: 3,
      xpNeeded: xpForLevel(3),
      rewardType: 'theme',
      rewardValue: 'kawaii',
      name: 'Kawaii Pink Theme',
      description: 'Unlock a sweet pastel pink color scheme across the app.',
    },
    {
      level: 5,
      xpNeeded: xpForLevel(5),
      rewardType: 'border',
      rewardValue: 'silver',
      name: 'Silver Profile Border',
      description: 'Unlock a sleek polished silver outline for your profile.',
    },
    {
      level: 7,
      xpNeeded: xpForLevel(7),
      rewardType: 'theme',
      rewardValue: 'cyberpunk',
      name: 'Cyberpunk Neon Theme',
      description: 'Unlock a cool dark mode theme with neon cyan and pink outlines.',
    },
    {
      level: 8,
      xpNeeded: xpForLevel(8),
      rewardType: 'border',
      rewardValue: 'gold',
      name: 'Gold Profile Border',
      description: 'Unlock a prestigious glowing golden outline for your avatar.',
    },
    {
      level: 10,
      xpNeeded: xpForLevel(10),
      rewardType: 'border',
      rewardValue: 'holographic',
      name: 'Holographic Neo Border',
      description: 'Unlock the ultimate animated cyberpunk color-shifting outline.',
    },
  ];

  const handleEquipBorder = (border: 'none' | 'bronze' | 'silver' | 'gold' | 'holographic') => {
    selectBorder(border);
    toast.success(`Equipped ${border.toUpperCase()} border!`);
  };

  const handleEquipTheme = (theme: 'default' | 'kawaii' | 'cyberpunk') => {
    selectTheme(theme);
    toast.success(`Switched to ${theme.toUpperCase()} theme!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="card-bubbly bg-gradient-to-r from-brand-cyan/20 to-brand-pink/20 p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-none">
        <div className="space-y-1.5 text-center md:text-left">
          <h3 className="font-fredoka text-slate-800 text-xl font-bold flex items-center justify-center md:justify-start gap-2">
            <Sparkles className="w-5 h-5 text-brand-pink" />
            Level Roadmap & Unlocks
          </h3>
          <p className="font-nunito text-xs text-slate-500 font-medium">
            Scan products to gain XP, unlock themes, and claim profile borders.
          </p>
        </div>
        <div className="shrink-0 bg-white/80 backdrop-blur px-5 py-3 rounded-2xl flex items-center gap-3 shadow-sm border border-slate-100">
          <div className="text-right">
            <span className="text-[10px] font-fredoka font-bold text-slate-400 block uppercase">Current XP</span>
            <span className="font-fredoka font-bold text-slate-700 text-sm">{xp} XP</span>
          </div>
          <div className="w-[1px] h-8 bg-slate-200" />
          <div>
            <span className="text-[10px] font-fredoka font-bold text-slate-400 block uppercase">Current Level</span>
            <span className="font-fredoka font-bold text-brand-cyan text-sm">LVL {level}</span>
          </div>
        </div>
      </div>

      {/* Cosmetics Inventory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Borders Selection */}
        <div className="card-bubbly bg-white p-5 space-y-4">
          <h4 className="font-fredoka font-bold text-slate-800 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-cyan" />
            Available Borders
          </h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleEquipBorder('none')}
              className={`px-3 py-1.5 rounded-xl font-fredoka text-xs font-semibold border transition-all ${
                selectedBorder === 'none'
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Default
            </button>
            {roadmap
              .filter((item) => item.rewardType === 'border')
              .map((item) => {
                const isUnlocked = level >= item.level;
                return (
                  <button
                    key={item.rewardValue}
                    disabled={!isUnlocked}
                    onClick={() => handleEquipBorder(item.rewardValue as any)}
                    className={`px-3 py-1.5 rounded-xl font-fredoka text-xs font-semibold border transition-all ${
                      selectedBorder === item.rewardValue
                        ? 'bg-brand-cyan text-white border-brand-cyan'
                        : isUnlocked
                        ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        : 'bg-slate-100/50 text-slate-400 border-slate-100 cursor-not-allowed opacity-50'
                    }`}
                  >
                    {item.name.replace(' Profile Border', '').replace(' Border', '')} {!isUnlocked && '🔒'}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Themes Selection */}
        <div className="card-bubbly bg-white p-5 space-y-4">
          <h4 className="font-fredoka font-bold text-slate-800 text-sm flex items-center gap-2">
            <Palette className="w-4 h-4 text-brand-pink" />
            Available Themes
          </h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleEquipTheme('default')}
              className={`px-3 py-1.5 rounded-xl font-fredoka text-xs font-semibold border transition-all ${
                selectedTheme === 'default'
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Default
            </button>
            {roadmap
              .filter((item) => item.rewardType === 'theme')
              .map((item) => {
                const isUnlocked = level >= item.level;
                return (
                  <button
                    key={item.rewardValue}
                    disabled={!isUnlocked}
                    onClick={() => handleEquipTheme(item.rewardValue as any)}
                    className={`px-3 py-1.5 rounded-xl font-fredoka text-xs font-semibold border transition-all ${
                      selectedTheme === item.rewardValue
                        ? 'bg-brand-pink text-white border-brand-pink'
                        : isUnlocked
                        ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        : 'bg-slate-100/50 text-slate-400 border-slate-100 cursor-not-allowed opacity-50'
                    }`}
                  >
                    {item.name.replace(' Theme', '')} {!isUnlocked && '🔒'}
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* Roadmap timeline list */}
      <div className="space-y-4">
        <h4 className="font-fredoka font-bold text-slate-800 text-sm">Roadmap Rewards Timeline</h4>
        <div className="space-y-3">
          {roadmap.map((item) => {
            const isUnlocked = level >= item.level;
            return (
              <div
                key={item.level}
                className={`card-bubbly p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border transition-all ${
                  isUnlocked
                    ? 'bg-white border-slate-100 hover:border-brand-cyan/20'
                    : 'bg-slate-50/70 border-slate-100 opacity-80'
                }`}
              >
                <div className="flex gap-4 items-start">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-fredoka font-bold text-base ${
                      isUnlocked
                        ? 'bg-brand-cyan/10 text-brand-cyan'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    Lvl {item.level}
                  </div>
                  <div>
                    <h5 className="font-fredoka font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      {item.name}
                      {isUnlocked ? (
                        <span className="text-[10px] font-fredoka font-bold px-2 py-0.5 bg-green-500/10 text-green-600 rounded-full">
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-[10px] font-fredoka font-bold px-2 py-0.5 bg-slate-200 text-slate-500 rounded-full">
                          Locked ({item.xpNeeded} total XP)
                        </span>
                      )}
                    </h5>
                    <p className="font-nunito text-xs text-slate-400 font-medium mt-1 leading-normal">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {item.rewardType === 'border' ? (
                    <button
                      disabled={!isUnlocked}
                      onClick={() => handleEquipBorder(item.rewardValue as any)}
                      className={`btn-bubbly px-4 py-2 text-xs font-semibold w-full sm:w-auto ${
                        selectedBorder === item.rewardValue
                          ? 'bg-brand-cyan text-white'
                          : isUnlocked
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {selectedBorder === item.rewardValue ? 'Equipped' : isUnlocked ? 'Equip' : 'Locked'}
                    </button>
                  ) : (
                    <button
                      disabled={!isUnlocked}
                      onClick={() => handleEquipTheme(item.rewardValue as any)}
                      className={`btn-bubbly px-4 py-2 text-xs font-semibold w-full sm:w-auto ${
                        selectedTheme === item.rewardValue
                          ? 'bg-brand-pink text-white'
                          : isUnlocked
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {selectedTheme === item.rewardValue ? 'Equipped' : isUnlocked ? 'Equip' : 'Locked'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
