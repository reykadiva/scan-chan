/**
 * Enhanced Progress Bars
 * Pixel art themed progress bars with gradients, animations, and shine effects
 */

import { cn } from "@/lib/utils";
import { PixelHeart, PixelStar } from "./pixel-illustrations";
import { StatusCatIcons } from "./cat-icon-variants";

interface ProgressBarProps {
  value: number;
  max: number;
  variant?: "hunger" | "happiness" | "health" | "xp" | "energy";
  showLabel?: boolean;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}

const variantStyles = {
  hunger: {
    gradient: "from-orange-400 via-orange-500 to-amber-600",
    glow: "shadow-orange-500/50",
    IconComponent: StatusCatIcons.Hunger,
    bg: "bg-orange-100",
    border: "border-orange-300",
  },
  happiness: {
    gradient: "from-pink-400 via-pink-500 to-rose-600",
    glow: "shadow-pink-500/50",
    IconComponent: StatusCatIcons.Happiness,
    bg: "bg-pink-100",
    border: "border-pink-300",
  },
  health: {
    gradient: "from-green-400 via-green-500 to-emerald-600",
    glow: "shadow-green-500/50",
    IconComponent: StatusCatIcons.Health,
    bg: "bg-green-100",
    border: "border-green-300",
  },
  xp: {
    gradient: "from-cyan-400 via-cyan-500 to-blue-600",
    glow: "shadow-cyan-500/50",
    IconComponent: StatusCatIcons.XP,
    bg: "bg-cyan-100",
    border: "border-cyan-300",
  },
  energy: {
    gradient: "from-yellow-400 via-yellow-500 to-amber-600",
    glow: "shadow-yellow-500/50",
    IconComponent: StatusCatIcons.Energy,
    bg: "bg-yellow-100",
    border: "border-yellow-300",
  },
};

const sizeStyles = {
  sm: { height: "h-2", text: "text-xs", iconSize: 12 },
  md: { height: "h-3", text: "text-sm", iconSize: 16 },
  lg: { height: "h-4", text: "text-base", iconSize: 20 },
};

export function EnhancedProgress({
  value,
  max,
  variant = "xp",
  showLabel = true,
  showPercentage = true,
  size = "md",
  animated = true,
  className = "",
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];
  const IconComponent = styles.IconComponent;

  return (
    <div className={cn("w-full space-y-1", className)}>
      {/* Label */}
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className={cn("font-medium capitalize flex items-center gap-2", sizes.text)}>
            <IconComponent size={sizes.iconSize} /> {variant}
          </span>
          {showPercentage && (
            <span className={cn("font-bold", sizes.text)}>
              {value}/{max}
            </span>
          )}
        </div>
      )}

      {/* Progress Bar Container */}
      <div
        className={cn(
          "relative w-full rounded-full overflow-hidden",
          "border-2 pixelated",
          styles.bg,
          styles.border,
          sizes.height
        )}
      >
        {/* Progress Fill */}
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-all duration-500 ease-out",
            styles.gradient,
            animated && "animate-pulse-slow",
            percentage >= 100 && "animate-pulse"
          )}
          style={{ width: `${percentage}%` }}
        >
          {/* Shine Effect */}
          {animated && percentage > 0 && (
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"
              style={{
                backgroundSize: "200% 100%",
              }}
            />
          )}
        </div>

        {/* Notches for pixel art effect */}
        <div className="absolute inset-0 flex items-center">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 border-r border-black/5 last:border-r-0"
              style={{ height: "100%" }}
            />
          ))}
        </div>
      </div>

      {/* Milestone Indicator (at 100%) */}
      {percentage >= 100 && (
        <div className="flex items-center justify-center gap-1 animate-bounce">
          <PixelStar size={sizes.iconSize} className="text-yellow-400" />
          <span className={cn("font-bold text-yellow-600", sizes.text)}>
            MAX!
          </span>
          <PixelStar size={sizes.iconSize} className="text-yellow-400" />
        </div>
      )}
    </div>
  );
}

/**
 * Circular Progress (for pet stats in compact view)
 */
interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  variant?: "hunger" | "happiness" | "health" | "xp" | "energy";
  showIcon?: boolean;
  className?: string;
}

export function CircularProgress({
  value,
  max,
  size = 60,
  strokeWidth = 6,
  variant = "xp",
  showIcon = true,
  className = "",
}: CircularProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const styles = variantStyles[variant];
  const IconComponent = styles.IconComponent;

  const colorMap = {
    hunger: "#f97316",
    happiness: "#ec4899",
    health: "#22c55e",
    xp: "#06b6d4",
    energy: "#eab308",
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          className="pixelated"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorMap[variant]}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out pixelated"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showIcon && (
          <IconComponent size={16} />
        )}
        <span className="text-xs font-bold">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}

/**
 * Multi-Stat Progress (for dashboard overview)
 */
interface MultiStatProgressProps {
  stats: Array<{
    label: string;
    value: number;
    max: number;
    variant: "hunger" | "happiness" | "health" | "xp" | "energy";
  }>;
  layout?: "vertical" | "horizontal";
  className?: string;
}

export function MultiStatProgress({
  stats,
  layout = "vertical",
  className = "",
}: MultiStatProgressProps) {
  return (
    <div
      className={cn(
        "gap-4",
        layout === "vertical" ? "flex flex-col" : "grid grid-cols-2",
        className
      )}
    >
      {stats.map((stat, index) => (
        <EnhancedProgress
          key={index}
          value={stat.value}
          max={stat.max}
          variant={stat.variant}
          showLabel={true}
          showPercentage={true}
          size="md"
          animated={true}
        />
      ))}
    </div>
  );
}

/**
 * Level Progress with XP
 */
interface LevelProgressProps {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  className?: string;
}

export function LevelProgress({
  currentLevel,
  currentXP,
  xpToNextLevel,
  className = "",
}: LevelProgressProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-full pixelated border-2 border-cyan-700">
            Lv. {currentLevel}
          </div>
          <PixelStar size={20} className="text-yellow-400 animate-spin-slow" />
        </div>
        <span className="text-sm font-medium text-gray-600">
          Next: Lv. {currentLevel + 1}
        </span>
      </div>
      
      <EnhancedProgress
        value={currentXP}
        max={xpToNextLevel}
        variant="xp"
        showLabel={false}
        showPercentage={true}
        size="lg"
        animated={true}
      />
    </div>
  );
}
