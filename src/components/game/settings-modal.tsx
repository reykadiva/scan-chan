'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Volume2,
  VolumeX,
  Palette,
  Music,
  Check,
  Sparkles,
  Disc,
  LogOut,
  AlertTriangle,
  User,
  Mail,
  Cloud,
  LogIn,
} from 'lucide-react';
import { useAppTheme } from '@/components/providers/theme-provider';
import { useAudio, LOOP_MODES, type BgmLoopMode } from '@/components/providers/audio-provider';
import { THEME_LIST, type ThemeId } from '@/lib/theme-config';
import { haptics } from '@/lib/haptics';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut?: () => void;
  isCloudMode?: boolean;
  userEmail?: string | null;
}

export function SettingsModal({
  isOpen,
  onClose,
  onSignOut,
  isCloudMode = false,
  userEmail,
}: SettingsModalProps) {
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const { currentTheme, setTheme } = useAppTheme();
  const {
    bgmEnabled,
    bgmVolume,
    isPlaying,
    loopMode,
    currentTrack,
    toggleBgm,
    setBgmVolume,
    setLoopMode,
  } = useAudio();

  if (!isOpen) return null;

  const handleSelectTheme = (themeId: ThemeId) => {
    haptics.light();
    setTheme(themeId);
  };

  const handleToggleAudio = () => {
    haptics.medium();
    toggleBgm();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setBgmVolume(val);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          className="relative w-[94vw] max-w-lg rounded-2xl bg-[var(--theme-primary)] border-4 border-white shadow-[6px_6px_0_0_var(--theme-shadow)] p-4 sm:p-7 text-white max-h-[85dvh] overflow-y-auto scrollbar-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/20">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white border-2 border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-primary)] shadow-[2px_2px_0_0_var(--theme-shadow)] shrink-0">
                <span className="text-base select-none">⚙️</span>
              </div>
              <div className="min-w-0">
                <h2 className="font-press-start text-xs sm:text-base text-white tracking-wide truncate">
                  SETTINGS
                </h2>
                <p className="font-nunito text-[11px] sm:text-xs text-white/80 font-semibold truncate">
                  Companion & Audio Config
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="min-w-[44px] min-h-[44px] rounded-xl bg-white border-2 border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-text-dark)] hover:bg-[var(--theme-surface-inner)] transition-colors cursor-pointer shadow-[2px_2px_0_0_var(--theme-shadow)] shrink-0"
              aria-label="Close settings"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          <div className="space-y-6 pt-5">
            {/* ─── SECTION 1: THEME PALETTES ─────────────────────────────── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-press-start text-[10px] text-white uppercase tracking-wider flex items-center gap-1.5 drop-shadow-[1px_1px_0_var(--theme-dark)]">
                  <Palette className="w-3.5 h-3.5" />
                  Color Theme (6 Palettes)
                </span>
                <span className="font-pixel text-[9px] text-white/90 uppercase drop-shadow-[1px_1px_0_var(--theme-dark)]">
                  Real-time Sync
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {THEME_LIST.map((theme) => {
                  const isSelected = currentTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleSelectTheme(theme.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer relative flex flex-col justify-between gap-2.5 select-none ${
                        isSelected
                          ? 'bg-white border-[var(--theme-border)] shadow-[3px_3px_0_0_var(--theme-shadow)] translate-x-0.5'
                          : 'bg-white/90 hover:bg-white border-white/60 hover:border-white shadow-[2px_2px_0_0_rgba(0,0,0,0.15)]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p
                            className={`font-fredoka font-bold text-xs truncate ${
                              isSelected ? 'text-[var(--theme-text-dark)]' : 'text-slate-800'
                            }`}
                          >
                            {theme.name}
                          </p>
                          <p className="font-nunito text-[10px] text-slate-500 font-semibold truncate">
                            {theme.subtitle}
                          </p>
                        </div>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-md bg-[var(--theme-primary)] text-white flex items-center justify-center shrink-0 border border-[var(--theme-border)]">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      {/* Color Swatch Dots */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <span
                          className="w-4 h-4 rounded-full border border-black/20 shadow-xs"
                          style={{ backgroundColor: theme.colors.primary }}
                          title={`Primary: ${theme.colors.primary}`}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-black/20 shadow-xs"
                          style={{ backgroundColor: theme.colors.surfaceInner }}
                          title={`Inner: ${theme.colors.surfaceInner}`}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-black/20 shadow-xs"
                          style={{ backgroundColor: theme.colors.border }}
                          title={`Border/Dark: ${theme.colors.border}`}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-black/20 shadow-xs"
                          style={{ backgroundColor: theme.colors.accent }}
                          title={`Accent: ${theme.colors.accent}`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ─── SECTION 2: BACKGROUND MUSIC (BGM) ──────────────────────── */}
            <div className="space-y-3 pt-2 border-t border-white/20">
              <div className="flex items-center justify-between">
                <span className="font-press-start text-[10px] text-white uppercase tracking-wider flex items-center gap-1.5 drop-shadow-[1px_1px_0_var(--theme-dark)]">
                  <Music className="w-3.5 h-3.5" />
                  Background Music (BGM)
                </span>
                <span className="font-pixel text-[9px] text-white/90 drop-shadow-[1px_1px_0_var(--theme-dark)]">
                  {bgmEnabled && isPlaying ? `● Playing: ${currentTrack.name}` : '○ Paused'}
                </span>
              </div>

              {/* BGM Toggle Card */}
              <div className="p-3.5 rounded-xl bg-white border-2 border-[var(--theme-border)] text-[var(--theme-text-dark)] shadow-[3px_3px_0_0_var(--theme-shadow)] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleToggleAudio}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 border-[var(--theme-border)] cursor-pointer transition-transform active:scale-95 ${
                      bgmEnabled
                        ? 'bg-[var(--theme-primary)] text-white shadow-[2px_2px_0_0_var(--theme-shadow)]'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {bgmEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </button>
                  <div>
                    <p className="font-fredoka font-bold text-sm">
                      {bgmEnabled ? 'Music Enabled' : 'Music Muted'}
                    </p>
                    <p className="font-nunito text-xs text-slate-500 font-semibold">
                      Looping arcade garden soundtrack
                    </p>
                  </div>
                </div>

                {/* Retro Pill Toggle */}
                <button
                  type="button"
                  onClick={handleToggleAudio}
                  className={`relative w-14 h-7 rounded-full border-2 border-[var(--theme-border)] transition-colors cursor-pointer ${
                    bgmEnabled ? 'bg-[var(--theme-primary)]' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white border border-[var(--theme-border)] shadow-xs transition-transform ${
                      bgmEnabled ? 'left-7.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* BGM Track & Loop Mode Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold font-fredoka">
                  <span className="flex items-center gap-1.5 text-white drop-shadow-[1px_1px_0_var(--theme-dark)]">
                    <Disc className="w-3.5 h-3.5" />
                    BGM Track & Loop Mode
                  </span>
                  <span className="font-pixel text-[9px] text-white/90 drop-shadow-[1px_1px_0_var(--theme-dark)]">
                    5 Modes
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {LOOP_MODES.map((mode) => {
                    const isSelected = loopMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                          haptics.light();
                          setLoopMode(mode.id);
                        }}
                        className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-white border-[var(--theme-border)] shadow-[3px_3px_0_0_var(--theme-shadow)] translate-x-0.5'
                            : 'bg-white/90 hover:bg-white border-white/60 hover:border-white shadow-[2px_2px_0_0_rgba(0,0,0,0.15)]'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p
                            className={`font-fredoka font-bold text-xs truncate ${
                              isSelected ? 'text-[var(--theme-text-dark)]' : 'text-slate-800'
                            }`}
                          >
                            {mode.name}
                          </p>
                          <p className="font-nunito text-[10px] text-slate-500 font-semibold truncate">
                            {mode.desc}
                          </p>
                        </div>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-md bg-[var(--theme-primary)] text-white flex items-center justify-center shrink-0 border border-[var(--theme-border)]">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Volume Slider Card */}
              <div className="p-3.5 rounded-xl bg-white border-2 border-[var(--theme-border)] text-[var(--theme-text-dark)] shadow-[3px_3px_0_0_var(--theme-shadow)] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold font-fredoka">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-[var(--theme-primary)]" />
                    BGM Volume
                  </span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-[var(--theme-surface-inner)] border border-[var(--theme-border)]">
                    {Math.round(bgmVolume * 100)}%
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <span className="font-mono text-[10px] text-slate-400">0%</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={bgmVolume}
                    disabled={!bgmEnabled}
                    onChange={handleVolumeChange}
                    className="w-full h-2.5 bg-[var(--theme-surface-inner)] border-2 border-[var(--theme-border)] rounded-lg appearance-none cursor-pointer accent-[var(--theme-primary)] disabled:opacity-40"
                  />
                  <span className="font-mono text-[10px] text-slate-400">100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-3 border-t border-white/20 space-y-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[var(--theme-surface-inner)] text-[var(--theme-text-dark)] font-press-start text-[10px] border-2 border-[var(--theme-border)] shadow-[4px_4px_0_0_var(--theme-shadow)] active:translate-y-0.5 active:shadow-[1px_1px_0_0_var(--theme-shadow)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
              <span>SAVE & CLOSE</span>
            </button>

            {/* ─── SECTION: ACCOUNT INFO ─────────────────────────────────── */}
            <div className="p-3.5 rounded-xl bg-white border-2 border-[var(--theme-border)] text-[var(--theme-text-dark)] shadow-[3px_3px_0_0_var(--theme-shadow)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-press-start text-[10px] uppercase tracking-wider flex items-center gap-1.5 text-[var(--theme-text-dark)]">
                  <User className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                  Account Info
                </span>
                {isCloudMode ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-300 font-pixel text-[9px] uppercase font-bold">
                    <Cloud className="w-2.5 h-2.5" /> Hunter Account
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-300 font-pixel text-[9px] uppercase font-bold">
                    Guest Mode
                  </span>
                )}
              </div>

              {isCloudMode ? (
                <div className="flex items-center gap-2 pt-1 min-w-0">
                  <Mail className="w-3.5 h-3.5 text-[var(--theme-primary)] shrink-0" />
                  <span className="font-nunito font-bold text-xs text-slate-700 truncate" title={userEmail || ''}>
                    {userEmail || 'Google Account Connected'}
                  </span>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <p className="font-nunito text-xs text-slate-500 font-semibold leading-relaxed">
                    Guest Mode (Local Storage Only). Data is saved on this browser.
                  </p>
                  <Link
                    href="/?auth=true"
                    className="w-full py-2 px-3 rounded-xl bg-[var(--theme-primary)] hover:brightness-105 active:scale-[0.99] text-white font-fredoka font-bold text-xs border border-[var(--theme-border)] shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In with Google</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Destructive Exit Action */}
            {onSignOut && (
              <div className="pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    haptics.medium();
                    setShowConfirmExit(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-press-start text-[10px] border-2 border-white shadow-[3px_3px_0_0_rgba(0,0,0,0.3)] active:translate-y-0.5 active:shadow-[1px_1px_0_0_rgba(0,0,0,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>EXIT GAME</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirmExit && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 10 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="w-full max-w-sm rounded-2xl bg-white border-4 border-slate-900 shadow-[6px_6px_0_0_rgba(0,0,0,0.5)] p-5 text-slate-800 space-y-4"
              >
                <div className="flex items-center gap-2.5 text-rose-600">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 border-2 border-rose-300 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-fredoka font-black text-base text-slate-900">
                      Exit Game?
                    </h3>
                    <p className="font-nunito text-xs text-slate-500 font-semibold">
                      {isCloudMode ? 'Cloud Synced' : 'Guest Mode'}
                    </p>
                  </div>
                </div>

                <p className="font-nunito text-xs text-slate-600 leading-relaxed">
                  {isCloudMode
                    ? 'Your game progress is saved in the cloud with your Google account. You can safely sign out and continue playing on any device anytime.'
                    : 'You are playing in Guest Mode. Your progress is saved in this browser, but clearing browser cache or cookies will erase your companion progress.'}
                </p>

                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmExit(false)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 font-fredoka font-bold text-xs text-slate-700 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      haptics.heavy();
                      setShowConfirmExit(false);
                      onSignOut?.();
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-fredoka font-bold text-xs border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(0,0,0,0.4)] cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Yes, Exit</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}
