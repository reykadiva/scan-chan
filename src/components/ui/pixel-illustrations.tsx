/**
 * Pixel Art Illustrations
 * Cute pixel art SVGs for empty states and decorations
 */

export function EmptyFoodPantry({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Empty bowl */}
      <g>
        {/* Bowl shadow */}
        <ellipse cx="60" cy="95" rx="25" ry="5" fill="#cbd5e1" opacity="0.3" />
        
        {/* Bowl body */}
        <path
          d="M 40 70 Q 40 90 60 90 Q 80 90 80 70 L 75 60 L 45 60 Z"
          fill="#f1f5f9"
          stroke="#64748b"
          strokeWidth="2"
        />
        
        {/* Bowl rim */}
        <ellipse cx="60" cy="60" rx="20" ry="5" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
        
        {/* Crack lines to show empty */}
        <path d="M 50 75 L 52 65" stroke="#94a3b8" strokeWidth="1" opacity="0.5" />
        <path d="M 70 75 L 68 65" stroke="#94a3b8" strokeWidth="1" opacity="0.5" />
      </g>

      {/* Sad cat face above bowl */}
      <g transform="translate(60, 35)">
        {/* Head */}
        <rect x="-12" y="-12" width="24" height="24" fill="#f59e0b" rx="4" />
        
        {/* Ears */}
        <polygon points="-12,-12 -8,-16 -12,-16" fill="#f59e0b" />
        <polygon points="12,-12 8,-16 12,-16" fill="#f59e0b" />
        
        {/* Eyes (sad) */}
        <circle cx="-5" cy="-3" r="2" fill="#1e293b" />
        <circle cx="5" cy="-3" r="2" fill="#1e293b" />
        
        {/* Sad mouth */}
        <path d="M -4 6 Q 0 4 4 6" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        
        {/* Tears */}
        <circle cx="-5" cy="2" r="1.5" fill="#06b6d4" opacity="0.6" />
        <circle cx="5" cy="2" r="1.5" fill="#06b6d4" opacity="0.6" />
      </g>

      {/* Empty indicator lines */}
      <g opacity="0.2">
        <line x1="30" y1="45" x2="35" y2="45" stroke="#64748b" strokeWidth="2" />
        <line x1="85" y1="45" x2="90" y2="45" stroke="#64748b" strokeWidth="2" />
      </g>
    </svg>
  );
}

export function EmptyMissionBoard({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Clipboard */}
      <g>
        {/* Board shadow */}
        <rect x="32" y="32" width="56" height="75" fill="#cbd5e1" opacity="0.2" rx="3" />
        
        {/* Board body */}
        <rect x="30" y="25" width="60" height="75" fill="#fef3c7" stroke="#78716c" strokeWidth="2" rx="3" />
        
        {/* Clip at top */}
        <rect x="50" y="20" width="20" height="8" fill="#94a3b8" rx="2" />
        <rect x="52" y="18" width="16" height="6" fill="#cbd5e1" rx="2" />
        
        {/* Empty checkboxes */}
        <g opacity="0.3">
          <rect x="40" y="40" width="8" height="8" fill="none" stroke="#78716c" strokeWidth="1.5" />
          <rect x="40" y="55" width="8" height="8" fill="none" stroke="#78716c" strokeWidth="1.5" />
          <rect x="40" y="70" width="8" height="8" fill="none" stroke="#78716c" strokeWidth="1.5" />
        </g>
        
        {/* Empty lines */}
        <g opacity="0.2">
          <line x1="52" y1="44" x2="75" y2="44" stroke="#78716c" strokeWidth="1.5" />
          <line x1="52" y1="59" x2="75" y2="59" stroke="#78716c" strokeWidth="1.5" />
          <line x1="52" y1="74" x2="75" y2="74" stroke="#78716c" strokeWidth="1.5" />
        </g>
      </g>

      {/* Sleeping cat */}
      <g transform="translate(60, 90)">
        {/* Body */}
        <ellipse cx="0" cy="0" rx="15" ry="10" fill="#f59e0b" />
        
        {/* Head */}
        <circle cx="-8" cy="-5" r="8" fill="#f59e0b" />
        
        {/* Ears */}
        <polygon points="-12,-10 -10,-13 -8,-10" fill="#f59e0b" />
        <polygon points="-4,-10 -6,-13 -8,-10" fill="#f59e0b" />
        
        {/* Sleeping eyes */}
        <path d="M -10 -5 L -6 -5" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M -4 -5 L -2 -5" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Tail */}
        <path d="M 12 2 Q 18 0 20 -4" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" fill="none" />
        
        {/* Z's for sleeping */}
        <text x="15" y="-8" fill="#64748b" fontSize="10" opacity="0.5">z</text>
        <text x="20" y="-15" fill="#64748b" fontSize="8" opacity="0.3">z</text>
      </g>
    </svg>
  );
}

export function EmptyHistory({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Clock/History icon */}
      <g transform="translate(60, 50)">
        {/* Clock face */}
        <circle cx="0" cy="0" r="25" fill="#f1f5f9" stroke="#64748b" strokeWidth="2" />
        
        {/* Clock markings */}
        <circle cx="0" cy="-20" r="2" fill="#94a3b8" />
        <circle cx="20" cy="0" r="2" fill="#94a3b8" />
        <circle cx="0" cy="20" r="2" fill="#94a3b8" />
        <circle cx="-20" cy="0" r="2" fill="#94a3b8" />
        
        {/* Clock hands (pointing to 12) */}
        <line x1="0" y1="0" x2="0" y2="-12" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="0" y1="0" x2="8" y2="0" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
        
        {/* Center dot */}
        <circle cx="0" cy="0" r="3" fill="#334155" />
      </g>

      {/* Question mark cat */}
      <g transform="translate(60, 95)">
        {/* Cat body */}
        <ellipse cx="0" cy="0" rx="12" ry="8" fill="#f59e0b" />
        
        {/* Head with question */}
        <circle cx="0" cy="-8" r="7" fill="#f59e0b" />
        
        {/* Ears */}
        <polygon points="-5,-13 -3,-16 -1,-13" fill="#f59e0b" />
        <polygon points="1,-13 3,-16 5,-13" fill="#f59e0b" />
        
        {/* Eyes */}
        <circle cx="-3" cy="-8" r="1.5" fill="#1e293b" />
        <circle cx="3" cy="-8" r="1.5" fill="#1e293b" />
        
        {/* Question mark bubble */}
        <circle cx="15" cy="-15" r="8" fill="#fef3c7" stroke="#78716c" strokeWidth="1.5" />
        <text x="12" y="-10" fill="#78716c" fontSize="12" fontWeight="bold">?</text>
      </g>
    </svg>
  );
}

export function LoadingCat({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 60"
      className={`${className} animate-bounce`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Animated cat running */}
      <g transform="translate(30, 30)">
        {/* Body */}
        <ellipse cx="0" cy="0" rx="15" ry="12" fill="#06b6d4">
          <animate attributeName="rx" values="15;16;15" dur="0.6s" repeatCount="indefinite" />
        </ellipse>
        
        {/* Head */}
        <circle cx="-8" cy="-5" r="10" fill="#06b6d4" />
        
        {/* Ears */}
        <polygon points="-13,-12 -10,-16 -7,-12" fill="#06b6d4" />
        <polygon points="-3,-12 -6,-16 -9,-12" fill="#06b6d4" />
        
        {/* Eyes */}
        <circle cx="-11" cy="-5" r="2" fill="#1e293b" />
        <circle cx="-5" cy="-5" r="2" fill="#1e293b" />
        
        {/* Legs (animated) */}
        <g>
          <rect x="-12" y="8" width="3" height="6" fill="#06b6d4" rx="1">
            <animate attributeName="height" values="6;4;6" dur="0.3s" repeatCount="indefinite" />
          </rect>
          <rect x="-3" y="8" width="3" height="6" fill="#06b6d4" rx="1">
            <animate attributeName="height" values="4;6;4" dur="0.3s" repeatCount="indefinite" />
          </rect>
          <rect x="6" y="8" width="3" height="6" fill="#06b6d4" rx="1">
            <animate attributeName="height" values="6;4;6" dur="0.3s" repeatCount="indefinite" />
          </rect>
        </g>
        
        {/* Tail */}
        <path d="M 12 2 Q 18 -2 20 -8" stroke="#06b6d4" strokeWidth="4" strokeLinecap="round" fill="none">
          <animate attributeName="d" 
            values="M 12 2 Q 18 -2 20 -8;M 12 2 Q 18 2 20 6;M 12 2 Q 18 -2 20 -8" 
            dur="0.6s" 
            repeatCount="indefinite" />
        </path>
      </g>
    </svg>
  );
}

export function CelebrationStars({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Sparkle stars */}
      <g className="animate-pulse">
        <path d="M 50 50 L 52 48 L 54 50 L 52 52 Z" fill="#fbbf24" />
        <path d="M 150 30 L 153 27 L 156 30 L 153 33 Z" fill="#fbbf24" />
        <path d="M 30 150 L 33 147 L 36 150 L 33 153 Z" fill="#f472b6" />
        <path d="M 170 170 L 173 167 L 176 170 L 173 173 Z" fill="#06b6d4" />
        <path d="M 100 20 L 103 17 L 106 20 L 103 23 Z" fill="#fbbf24" />
        <path d="M 180 100 L 183 97 L 186 100 L 183 103 Z" fill="#f472b6" />
      </g>
      
      {/* Larger stars */}
      <g className="animate-spin" style={{ transformOrigin: 'center', animationDuration: '4s' }}>
        <path d="M 100 100 L 104 96 L 108 100 L 104 104 Z" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1" />
      </g>
    </svg>
  );
}

export function PixelHeart({ className = "", size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 8 14 L 2 8 L 2 5 L 5 2 L 8 5 L 11 2 L 14 5 L 14 8 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function PixelStar({ className = "", size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 8 2 L 9 6 L 13 6 L 10 9 L 11 13 L 8 10 L 5 13 L 6 9 L 3 6 L 7 6 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function PixelSparkle({ className = "", size = 12 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 6 1 L 7 5 L 11 6 L 7 7 L 6 11 L 5 7 L 1 6 L 5 5 Z"
        fill="currentColor"
      />
    </svg>
  );
}
