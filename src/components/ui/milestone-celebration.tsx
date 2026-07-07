/**
 * Milestone Celebration Component
 * Displays confetti and animations for achievements
 */

"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { PixelStar, PixelHeart, PixelSparkle } from "./pixel-illustrations";
import { sounds } from "@/lib/sounds";
import { haptics } from "@/lib/haptics";

interface MilestoneCelebrationProps {
  show: boolean;
  message?: string;
  type?: "levelup" | "achievement" | "milestone" | "perfect";
  onComplete?: () => void;
  duration?: number;
}

export function MilestoneCelebration({
  show,
  message = "Amazing!",
  type = "achievement",
  onComplete,
  duration = 3000,
}: MilestoneCelebrationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      
      // Play sound and haptic feedback
      if (type === "levelup") {
        sounds.play("levelup");
        haptics.heavy();
      } else if (type === "perfect") {
        sounds.play("milestone");
        haptics.success();
      } else {
        sounds.play("achievement");
        haptics.success();
      }

      // Auto-hide after duration
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete, type]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      {/* Overlay with fade */}
      <div className="absolute inset-0 bg-black/20 animate-in fade-in duration-300" />

      {/* Confetti particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => {
          const types: Array<"star" | "heart" | "sparkle"> = ["star", "heart", "sparkle"];
          const colors = [
            "text-yellow-400",
            "text-pink-400",
            "text-cyan-400",
            "text-green-400",
            "text-purple-400",
            "text-orange-400",
          ];
          
          return (
            <ConfettiPiece
              key={i}
              delay={i * 50}
              left={Math.random() * 100}
              type={types[Math.floor(Math.random() * 3)]}
              color={colors[Math.floor(Math.random() * 6)]}
            />
          );
        })}
      </div>

      {/* Main message */}
      <div className="relative z-10 text-center animate-in zoom-in duration-500">
        <div className="bg-white rounded-3xl shadow-2xl px-8 py-6 border-4 border-yellow-400 max-w-md mx-4">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            {type === "levelup" && (
              <div className="text-6xl animate-bounce">🎉</div>
            )}
            {type === "achievement" && (
              <div className="text-6xl animate-pulse">🏆</div>
            )}
            {type === "milestone" && (
              <div className="text-6xl animate-spin-slow">⭐</div>
            )}
            {type === "perfect" && (
              <div className="text-6xl animate-wiggle">💯</div>
            )}
          </div>

          {/* Message */}
          <h2 className="text-3xl font-bold text-gray-800 mb-2 font-heading">
            {message}
          </h2>

          {/* Subtitle based on type */}
          <p className="text-gray-600 font-medium">
            {type === "levelup" && "Level Up!"}
            {type === "achievement" && "Achievement Unlocked!"}
            {type === "milestone" && "Milestone Reached!"}
            {type === "perfect" && "Perfect Score!"}
          </p>

          {/* Decorative elements */}
          <div className="flex justify-center gap-3 mt-4">
            <PixelStar size={24} className="text-yellow-400 animate-pulse" />
            <PixelHeart size={24} className="text-pink-400 animate-pulse delay-100" />
            <PixelStar size={24} className="text-cyan-400 animate-pulse delay-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface ConfettiPieceProps {
  delay: number;
  left: number;
  type: "star" | "heart" | "sparkle";
  color: string;
}

function ConfettiPiece({ delay, left, type, color }: ConfettiPieceProps) {
  const size = 16 + Math.random() * 16;
  const duration = 2000 + Math.random() * 2000;

  return (
    <div
      className="absolute animate-confetti-fall"
      style={{
        left: `${left}%`,
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
      }}
    >
      {type === "star" && <PixelStar size={size} className={color} />}
      {type === "heart" && <PixelHeart size={size} className={color} />}
      {type === "sparkle" && <PixelSparkle size={size} className={color} />}
    </div>
  );
}

/**
 * Quick celebration toast for smaller wins
 */
interface QuickCelebrationProps {
  show: boolean;
  message: string;
  icon?: string;
  onComplete?: () => void;
}

export function QuickCelebration({
  show,
  message,
  icon = "✨",
  onComplete,
}: QuickCelebrationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      sounds.play("success");
      haptics.light();

      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
      <div className="bg-white rounded-full shadow-lg px-6 py-3 border-2 border-cyan-400 flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <span className="font-semibold text-gray-800">{message}</span>
      </div>
    </div>
  );
}
