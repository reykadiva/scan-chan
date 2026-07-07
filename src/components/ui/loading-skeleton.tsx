/**
 * Loading Skeleton Components
 * Pixel art themed loading states
 */

import { cn } from "@/lib/utils";
import { LoadingCat } from "./pixel-illustrations";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "card" | "list" | "stats" | "pet";
  count?: number;
}

export function LoadingSkeleton({
  className = "",
  variant = "card",
  count = 1,
}: LoadingSkeletonProps) {
  if (variant === "pet") {
    return <PetLoadingSkeleton className={className} />;
  }

  if (variant === "stats") {
    return <StatsLoadingSkeleton className={className} />;
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <ListItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="card-bubbly p-4 space-y-3 animate-pulse">
      <div className="h-6 bg-gray-200 rounded-full w-3/4" />
      <div className="h-4 bg-gray-200 rounded-full w-full" />
      <div className="h-4 bg-gray-200 rounded-full w-5/6" />
      <div className="flex gap-2 mt-4">
        <div className="h-8 bg-gray-200 rounded-full w-20" />
        <div className="h-8 bg-gray-200 rounded-full w-20" />
      </div>
    </div>
  );
}

function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 animate-pulse">
      <div className="w-12 h-12 bg-gray-200 rounded-xl pixelated" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded-full w-3/4" />
        <div className="h-3 bg-gray-200 rounded-full w-1/2" />
      </div>
      <div className="w-16 h-6 bg-gray-200 rounded-full" />
    </div>
  );
}

function StatsLoadingSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2 animate-pulse">
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded-full w-24" />
            <div className="h-4 bg-gray-200 rounded-full w-16" />
          </div>
          <div className="h-3 bg-gray-200 rounded-full w-full" />
        </div>
      ))}
    </div>
  );
}

function PetLoadingSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 space-y-4", className)}>
      {/* Animated loading cat */}
      <LoadingCat className="w-24 h-24" />
      
      <div className="space-y-2 w-full max-w-xs animate-pulse">
        <div className="h-4 bg-gray-200 rounded-full w-3/4 mx-auto" />
        <div className="h-3 bg-gray-200 rounded-full w-1/2 mx-auto" />
      </div>
    </div>
  );
}

/**
 * Inline loading spinner with pixel cat
 */
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  message,
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <LoadingCat className={sizeClasses[size]} />
      {message && (
        <p className="text-sm text-gray-600 font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}

/**
 * Full page loading screen
 */
interface LoadingScreenProps {
  message?: string;
  tip?: string;
}

export function LoadingScreen({ message = "Loading...", tip }: LoadingScreenProps) {
  const tips = [
    "💡 Pet your cat daily for happiness!",
    "💡 Scan healthy foods for bonus XP!",
    "💡 Complete daily missions for rewards!",
    "💡 Feed your pet before they get too hungry!",
    "💡 Level up to unlock new features!",
  ];

  const randomTip = tip || tips[Math.floor(Math.random() * tips.length)];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-cyan-50 via-pink-50 to-yellow-50 flex items-center justify-center z-50">
      <div className="text-center space-y-6 p-8">
        {/* Loading Cat */}
        <div className="flex justify-center">
          <LoadingCat className="w-32 h-32" />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-800 font-heading animate-pulse">
            {message}
          </h2>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce pixelated"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>

        {/* Tip */}
        {randomTip && (
          <div className="bg-white/80 rounded-2xl px-6 py-3 max-w-sm mx-auto border border-gray-200">
            <p className="text-sm text-gray-700">{randomTip}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Progress Loading Bar
 */
interface ProgressLoadingProps {
  progress: number;
  message?: string;
  className?: string;
}

export function ProgressLoading({
  progress,
  message = "Loading...",
  className = "",
}: ProgressLoadingProps) {
  return (
    <div className={cn("w-full max-w-md space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{message}</span>
        <span className="text-sm font-bold text-cyan-600">{Math.round(progress)}%</span>
      </div>
      
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden border-2 border-gray-300 pixelated">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 ease-out relative"
          style={{ width: `${progress}%` }}
        >
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
        </div>
      </div>
    </div>
  );
}
