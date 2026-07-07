/**
 * Pixel Art Icons - Chibi/Cute Style
 * 32x32px SVG icons with rounded, kawaii aesthetic
 */

import { cn } from "@/lib/utils";

interface PixelIconProps {
  className?: string;
  size?: number;
}

// ============================================================================
// PRIORITY 1: FOOD CATEGORY ICONS
// ============================================================================

/**
 * Pixel Meat/Drumstick Icon
 */
export function PixelMeat({ className = "", size = 32 }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn("pixelated", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bone part */}
      <ellipse cx="24" cy="10" rx="4" ry="5" fill="#f5deb3" />
      
      {/* Meat body */}
      <path
        d="M 10 12 Q 8 14 8 18 Q 8 24 14 26 Q 18 27 21 25 Q 24 23 24 18 Q 24 14 22 12 Z"
        fill="#d2691e"
      />
      
      {/* Meat highlight */}
      <ellipse cx="14" cy="16" rx="3" ry="4" fill="#cd853f" opacity="0.7" />
      
      {/* Shine effect */}
      <ellipse cx="12" cy="14" rx="2" ry="2.5" fill="#fff" opacity="0.4" />
      
      {/* Bone highlight */}
      <ellipse cx="24" cy="9" rx="1.5" ry="2" fill="#fff" opacity="0.5" />
    </svg>
  );
}

/**
 * Pixel Cake Slice Icon
 */
export function PixelCake({ className = "", size = 32 }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn("pixelated", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cake base (triangle slice) */}
      <path
        d="M 8 24 L 16 8 L 24 24 Z"
        fill="#ffd700"
      />
      
      {/* Frosting layers */}
      <path
        d="M 8 24 L 12 16 L 20 16 L 24 24 Z"
        fill="#ffb6c1"
      />
      
      <path
        d="M 10 20 L 14 14 L 18 14 L 22 20 Z"
        fill="#ff69b4"
      />
      
      {/* Cherry on top */}
      <circle cx="16" cy="8" r="2.5" fill="#dc143c" />
      <ellipse cx="16" cy="7.5" rx="1" ry="1" fill="#fff" opacity="0.4" />
      
      {/* Plate */}
      <ellipse cx="16" cy="25" rx="10" ry="2" fill="#e0e0e0" />
    </svg>
  );
}

/**
 * Pixel Drink Cup Icon
 */
export function PixelDrink({ className = "", size = 32 }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn("pixelated", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cup body */}
      <path
        d="M 10 10 L 8 26 L 24 26 L 22 10 Z"
        fill="#87ceeb"
      />
      
      {/* Cup rim */}
      <rect x="9" y="9" width="14" height="2" fill="#4682b4" rx="1" />
      
      {/* Liquid */}
      <path
        d="M 10.5 12 L 9 24 L 23 24 L 21.5 12 Z"
        fill="#ff69b4"
        opacity="0.8"
      />
      
      {/* Straw */}
      <rect x="18" y="4" width="2" height="12" fill="#ff6b6b" rx="1" />
      
      {/* Straw bend */}
      <path
        d="M 18 8 L 15 8 L 15 10 L 18 10 Z"
        fill="#ff6b6b"
      />
      
      {/* Shine on cup */}
      <ellipse cx="13" cy="14" rx="2" ry="4" fill="#fff" opacity="0.3" />
      
      {/* Ice cube */}
      <rect x="14" y="16" width="3" height="3" fill="#fff" opacity="0.6" rx="0.5" />
    </svg>
  );
}

/**
 * Pixel Candy/Lollipop Icon
 */
export function PixelCandy({ className = "", size = 32 }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn("pixelated", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Lollipop circle */}
      <circle cx="16" cy="12" r="8" fill="#ff69b4" />
      
      {/* Swirl pattern - white */}
      <path
        d="M 16 4 Q 20 6 20 12 Q 20 18 16 20"
        stroke="#fff"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Swirl pattern - pink */}
      <path
        d="M 16 6 Q 14 8 14 12 Q 14 16 16 18"
        stroke="#ff1493"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Stick */}
      <rect x="15" y="18" width="2" height="10" fill="#daa520" rx="1" />
      
      {/* Shine */}
      <circle cx="18" cy="10" r="2" fill="#fff" opacity="0.5" />
    </svg>
  );
}

/**
 * Pixel Cookie Icon
 */
export function PixelCookie({ className = "", size = 32 }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn("pixelated", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cookie base - irregular circle */}
      <circle cx="16" cy="16" r="10" fill="#d2691e" />
      <circle cx="14" cy="14" r="10" fill="#cd853f" />
      
      {/* Chocolate chips */}
      <circle cx="12" cy="14" r="2" fill="#3e2723" />
      <circle cx="18" cy="13" r="2" fill="#3e2723" />
      <circle cx="16" cy="18" r="2" fill="#3e2723" />
      <circle cx="20" cy="17" r="1.5" fill="#3e2723" />
      <circle cx="12" cy="19" r="1.5" fill="#3e2723" />
      
      {/* Cookie texture - small dots */}
      <circle cx="10" cy="16" r="0.8" fill="#8b4513" opacity="0.5" />
      <circle cx="22" cy="15" r="0.8" fill="#8b4513" opacity="0.5" />
      <circle cx="16" cy="12" r="0.8" fill="#8b4513" opacity="0.5" />
      
      {/* Shine */}
      <ellipse cx="11" cy="11" rx="2" ry="3" fill="#fff" opacity="0.3" />
    </svg>
  );
}

/**
 * Pixel Biscuit/Wafer Icon
 */
export function PixelBiscuit({ className = "", size = 32 }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn("pixelated", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Wafer body */}
      <rect x="8" y="10" width="16" height="12" fill="#f4a460" rx="2" />
      
      {/* Wafer layers */}
      <rect x="8" y="14" width="16" height="1" fill="#d2691e" opacity="0.5" />
      <rect x="8" y="18" width="16" height="1" fill="#d2691e" opacity="0.5" />
      
      {/* Wafer grid pattern */}
      <line x1="12" y1="10" x2="12" y2="22" stroke="#d2691e" strokeWidth="0.5" opacity="0.3" />
      <line x1="16" y1="10" x2="16" y2="22" stroke="#d2691e" strokeWidth="0.5" opacity="0.3" />
      <line x1="20" y1="10" x2="20" y2="22" stroke="#d2691e" strokeWidth="0.5" opacity="0.3" />
      
      {/* Cream filling edges */}
      <ellipse cx="8" cy="14" rx="1" ry="1.5" fill="#fffacd" />
      <ellipse cx="24" cy="14" rx="1" ry="1.5" fill="#fffacd" />
      <ellipse cx="8" cy="18" rx="1" ry="1.5" fill="#fffacd" />
      <ellipse cx="24" cy="18" rx="1" ry="1.5" fill="#fffacd" />
      
      {/* Shine */}
      <rect x="10" y="11" width="3" height="2" fill="#fff" opacity="0.3" rx="0.5" />
    </svg>
  );
}

/**
 * Pixel Dairy/Milk Icon
 */
export function PixelDairy({ className = "", size = 32 }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn("pixelated", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Milk carton body */}
      <path
        d="M 10 12 L 10 26 L 22 26 L 22 12 Z"
        fill="#fff"
        stroke="#4169e1"
        strokeWidth="1.5"
      />
      
      {/* Carton top */}
      <path
        d="M 10 12 L 12 8 L 20 8 L 22 12 Z"
        fill="#4169e1"
      />
      
      {/* Carton fold line */}
      <line x1="16" y1="8" x2="16" y2="12" stroke="#2c5aa0" strokeWidth="1" />
      
      {/* Label */}
      <rect x="12" y="15" width="8" height="6" fill="#87ceeb" rx="1" />
      
      {/* Milk drop on label */}
      <ellipse cx="16" cy="18" rx="2" ry="2.5" fill="#fff" />
      
      {/* Text lines on label */}
      <line x1="13" y1="16" x2="19" y2="16" stroke="#4169e1" strokeWidth="0.5" />
      <line x1="13" y1="20" x2="19" y2="20" stroke="#4169e1" strokeWidth="0.5" />
      
      {/* Shine on carton */}
      <rect x="11" y="14" width="2" height="8" fill="#fff" opacity="0.4" rx="0.5" />
    </svg>
  );
}

/**
 * Pixel Snack Bag Icon
 */
export function PixelSnack({ className = "", size = 32 }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn("pixelated", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bag body */}
      <path
        d="M 10 8 L 8 26 L 24 26 L 22 8 Z"
        fill="#ffd700"
      />
      
      {/* Bag top (crinkled) */}
      <path
        d="M 10 8 L 11 6 L 13 7 L 15 5 L 17 7 L 19 5 L 21 7 L 22 8 Z"
        fill="#ff8c00"
      />
      
      {/* Bag shine */}
      <ellipse cx="14" cy="14" rx="2" ry="6" fill="#fff" opacity="0.3" />
      
      {/* Label area */}
      <ellipse cx="16" cy="16" rx="5" ry="6" fill="#ff6347" />
      
      {/* Snack pieces visible */}
      <ellipse cx="14" cy="22" rx="2" ry="1.5" fill="#ff8c00" />
      <ellipse cx="18" cy="22" rx="2" ry="1.5" fill="#ff8c00" />
      <ellipse cx="16" cy="23" rx="1.5" ry="1" fill="#ff8c00" />
      
      {/* Label shine */}
      <circle cx="17" cy="14" r="1.5" fill="#fff" opacity="0.5" />
    </svg>
  );
}

// ============================================================================
// PRIORITY 2: ACTION ICONS
// ============================================================================

/**
 * Pixel Bowl Icon (Feed Action)
 */
export function PixelBowl({ className = "", size = 32 }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn("pixelated", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bowl body */}
      <path
        d="M 8 14 Q 8 24 16 26 Q 24 24 24 14 Z"
        fill="#ff6b6b"
      />
      
      {/* Bowl rim */}
      <ellipse cx="16" cy="14" rx="8" ry="3" fill="#ff8787" />
      
      {/* Food in bowl - kibble pieces */}
      <circle cx="13" cy="16" r="2" fill="#8b4513" />
      <circle cx="18" cy="16" r="2" fill="#a0522d" />
      <circle cx="15" cy="18" r="1.8" fill="#8b4513" />
      <circle cx="17" cy="19" r="1.5" fill="#a0522d" />
      
      {/* Bowl shine */}
      <ellipse cx="12" cy="16" rx="2" ry="3" fill="#fff" opacity="0.3" />
      
      {/* Bowl base shadow */}
      <ellipse cx="16" cy="27" rx="6" ry="1.5" fill="#000" opacity="0.2" />
    </svg>
  );
}

/**
 * Pixel Paw Icon (Pet Action)
 */
export function PixelPaw({ className = "", size = 32 }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn("pixelated", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main paw pad */}
      <ellipse cx="16" cy="18" rx="6" ry="7" fill="#ff69b4" />
      
      {/* Toe pads */}
      <ellipse cx="10" cy="12" rx="3" ry="4" fill="#ff69b4" />
      <ellipse cx="16" cy="10" rx="3" ry="4" fill="#ff69b4" />
      <ellipse cx="22" cy="12" rx="3" ry="4" fill="#ff69b4" />
      <ellipse cx="13" cy="14" rx="2.5" ry="3.5" fill="#ff69b4" />
      
      {/* Shine effects */}
      <ellipse cx="14" cy="17" rx="2" ry="3" fill="#fff" opacity="0.4" />
      <ellipse cx="10" cy="11" rx="1" ry="1.5" fill="#fff" opacity="0.4" />
      <ellipse cx="16" cy="9" rx="1" ry="1.5" fill="#fff" opacity="0.4" />
      <ellipse cx="22" cy="11" rx="1" ry="1.5" fill="#fff" opacity="0.4" />
    </svg>
  );
}

/**
 * Pixel Scanner Icon (Scan Action)
 */
export function PixelScanner({ className = "", size = 32 }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn("pixelated", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Barcode background */}
      <rect x="8" y="10" width="16" height="12" fill="#fff" rx="2" stroke="#333" strokeWidth="1.5" />
      
      {/* Barcode lines */}
      <rect x="10" y="12" width="1" height="8" fill="#000" />
      <rect x="12" y="12" width="2" height="8" fill="#000" />
      <rect x="15" y="12" width="1" height="8" fill="#000" />
      <rect x="17" y="12" width="1.5" height="8" fill="#000" />
      <rect x="19" y="12" width="1" height="8" fill="#000" />
      <rect x="21" y="12" width="2" height="8" fill="#000" />
      
      {/* Scanner laser line */}
      <rect x="6" y="15" width="20" height="2" fill="#ff0000" opacity="0.6" />
      <rect x="6" y="15.5" width="20" height="1" fill="#ff6b6b" opacity="0.8" />
      
      {/* Corner brackets */}
      <path d="M 8 10 L 8 8 L 10 8" stroke="#00ff00" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 24 10 L 24 8 L 22 8" stroke="#00ff00" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 8 22 L 8 24 L 10 24" stroke="#00ff00" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 24 22 L 24 24 L 22 24" stroke="#00ff00" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Pixel Apple Icon (Generic Food)
 */
export function PixelApple({ className = "", size = 32 }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn("pixelated", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Apple body */}
      <path
        d="M 16 8 Q 10 10 8 16 Q 8 24 16 28 Q 24 24 24 16 Q 22 10 16 8 Z"
        fill="#ff4444"
      />
      
      {/* Apple indent top */}
      <ellipse cx="16" cy="8" rx="3" ry="2" fill="#cc0000" />
      
      {/* Stem */}
      <rect x="15" y="4" width="2" height="5" fill="#8b4513" rx="1" />
      
      {/* Leaf */}
      <ellipse cx="18" cy="5" rx="3" ry="2" fill="#228b22" transform="rotate(-20 18 5)" />
      
      {/* Shine */}
      <ellipse cx="13" cy="12" rx="3" ry="5" fill="#fff" opacity="0.4" />
      
      {/* Darker side */}
      <path
        d="M 20 12 Q 22 16 22 20 Q 22 24 18 26"
        fill="#cc0000"
        opacity="0.4"
      />
    </svg>
  );
}

// ============================================================================
// PRIORITY 3: STATUS ICONS
// ============================================================================

/**
 * Pixel Hunger Icon (Stomach/Apple)
 */
export function PixelHunger({ className = "", size = 32 }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn("pixelated", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Fork */}
      <g transform="translate(-2, 0)">
        <rect x="10" y="18" width="1.5" height="8" fill="#c0c0c0" />
        <rect x="12.5" y="18" width="1.5" height="8" fill="#c0c0c0" />
        <rect x="15" y="18" width="1.5" height="8" fill="#c0c0c0" />
        <rect x="9" y="16" width="8.5" height="3" fill="#c0c0c0" rx="0.5" />
      </g>
      
      {/* Knife */}
      <g transform="translate(6, 0)">
        <rect x="16" y="18" width="2" height="8" fill="#a9a9a9" rx="0.5" />
        <path d="M 16 12 L 16 18 L 18 18 L 18 14 Z" fill="#d3d3d3" />
        <ellipse cx="17" cy="13" rx="0.5" ry="1" fill="#fff" opacity="0.5" />
      </g>
    </svg>
  );
}

/**
 * Pixel Happiness Icon (Chibi Heart)
 */
export function PixelHappiness({ className = "", size = 32 }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn("pixelated", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Heart shape - chibi rounded */}
      <path
        d="M 16 28 Q 6 20 6 13 Q 6 8 10 8 Q 13 8 16 11 Q 19 8 22 8 Q 26 8 26 13 Q 26 20 16 28 Z"
        fill="#ff69b4"
      />
      
      {/* Inner heart glow */}
      <path
        d="M 16 26 Q 8 19 8 13 Q 8 10 10 10 Q 12 10 14 12 L 16 14 L 18 12 Q 20 10 22 10 Q 24 10 24 13 Q 24 19 16 26 Z"
        fill="#ff1493"
        opacity="0.5"
      />
      
      {/* Shine top left */}
      <ellipse cx="12" cy="11" rx="3" ry="4" fill="#fff" opacity="0.5" />
      
      {/* Shine top right */}
      <ellipse cx="20" cy="11" rx="2.5" ry="3.5" fill="#fff" opacity="0.4" />
      
      {/* Small sparkle */}
      <circle cx="22" cy="15" r="1.5" fill="#fff" opacity="0.7" />
    </svg>
  );
}

/**
 * Pixel Health Icon (Medical Cross)
 */
export function PixelHealth({ className = "", size = 32 }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn("pixelated", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Circle background */}
      <circle cx="16" cy="16" r="12" fill="#fff" />
      <circle cx="16" cy="16" r="11" fill="#22c55e" />
      
      {/* Cross vertical */}
      <rect x="13" y="8" width="6" height="16" fill="#fff" rx="1" />
      
      {/* Cross horizontal */}
      <rect x="8" y="13" width="16" height="6" fill="#fff" rx="1" />
      
      {/* Shine on cross */}
      <rect x="14" y="9" width="2" height="6" fill="#fff" opacity="0.5" rx="0.5" />
      
      {/* Shadow on circle */}
      <path
        d="M 20 20 Q 24 18 24 16 Q 24 12 20 10"
        stroke="#16a34a"
        strokeWidth="2"
        fill="none"
        opacity="0.4"
      />
    </svg>
  );
}

/**
 * Pixel Energy Icon (Lightning Bolt)
 */
export function PixelEnergy({ className = "", size = 32 }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn("pixelated", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Lightning bolt */}
      <path
        d="M 18 4 L 10 16 L 15 16 L 14 28 L 22 14 L 17 14 Z"
        fill="#fbbf24"
      />
      
      {/* Inner lightning (brighter) */}
      <path
        d="M 17 6 L 12 16 L 15 16 L 15 24 L 20 14 L 17 14 Z"
        fill="#fef08a"
      />
      
      {/* Glow effect */}
      <path
        d="M 16 8 L 13 16 L 15 16 L 16 22 L 19 14 L 17 14 Z"
        fill="#fff"
        opacity="0.5"
      />
      
      {/* Sparkles around */}
      <circle cx="22" cy="10" r="1.5" fill="#fbbf24" opacity="0.7" />
      <circle cx="10" cy="12" r="1" fill="#fef08a" opacity="0.6" />
      <circle cx="23" cy="20" r="1.2" fill="#fbbf24" opacity="0.7" />
    </svg>
  );
}

/**
 * Pixel XP Icon (Chibi Star)
 */
export function PixelXP({ className = "", size = 32 }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn("pixelated", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Star shape - rounded chibi style */}
      <path
        d="M 16 4 L 19 13 L 28 13 L 21 19 L 24 28 L 16 22 L 8 28 L 11 19 L 4 13 L 13 13 Z"
        fill="#fbbf24"
      />
      
      {/* Inner star glow */}
      <path
        d="M 16 7 L 18 13 L 24 13 L 19 17 L 21 24 L 16 20 L 11 24 L 13 17 L 8 13 L 14 13 Z"
        fill="#fef08a"
      />
      
      {/* Center shine */}
      <circle cx="16" cy="15" r="4" fill="#fff" opacity="0.6" />
      
      {/* Small sparkles */}
      <circle cx="16" cy="4" r="1.5" fill="#fff" opacity="0.8" />
      <circle cx="28" cy="13" r="1.2" fill="#fff" opacity="0.7" />
      <circle cx="24" cy="28" r="1" fill="#fff" opacity="0.6" />
      <circle cx="8" cy="28" r="1" fill="#fff" opacity="0.6" />
      <circle cx="4" cy="13" r="1.2" fill="#fff" opacity="0.7" />
    </svg>
  );
}
