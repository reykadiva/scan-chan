/**
 * Cat Icon Variants
 * Pixel cat heads with icon eyes in 30 color variations
 * Based on original PixelCat component
 */

'use client';

import React from 'react';

// 30 Color Palettes
export type CatIconColor =
  // Warm Colors (10)
  | 'orange' | 'coral' | 'peach' | 'red' | 'pink' 
  | 'rose' | 'salmon' | 'amber' | 'brown' | 'cream'
  // Cool Colors (10)
  | 'cyan' | 'sky' | 'navy' | 'purple' | 'lavender'
  | 'mint' | 'teal' | 'turquoise' | 'emerald' | 'lime'
  // Special Colors (10)
  | 'gold' | 'silver' | 'sunset' | 'ocean' | 'forest'
  | 'pastel-pink' | 'pastel-blue' | 'pastel-yellow' | 'white' | 'rainbow';

// Icon Types for eyes
export type CatIconType =
  // Food Categories
  | 'meat' | 'cake' | 'drink' | 'candy' | 'cookie'
  | 'biscuit' | 'dairy' | 'snack'
  // Actions
  | 'bowl' | 'paw' | 'scanner' | 'apple'
  // Status
  | 'hunger' | 'happiness' | 'health' | 'energy' | 'xp'
  // Default
  | 'normal';

interface CatPalette {
  fur: string;
  dark: string;
  light: string;
  accent?: string; // For gradients
}

// 30 Color Definitions
const COLOR_PALETTES: Record<CatIconColor, CatPalette> = {
  // Warm Colors
  'orange': { fur: '#fb923c', dark: '#ea580c', light: '#fed7aa' },
  'coral': { fur: '#ff7f7f', dark: '#ff4444', light: '#ffb3b3' },
  'peach': { fur: '#ffdab9', dark: '#ff9f6b', light: '#fff5ee' },
  'red': { fur: '#ef4444', dark: '#b91c1c', light: '#fecaca' },
  'pink': { fur: '#f472b6', dark: '#be185d', light: '#fdf2f8' },
  'rose': { fur: '#fb7185', dark: '#e11d48', light: '#ffe4e6' },
  'salmon': { fur: '#fa8072', dark: '#cd5c5c', light: '#ffe4e1' },
  'amber': { fur: '#f59e0b', dark: '#b45309', light: '#fef3c7' },
  'brown': { fur: '#a0522d', dark: '#5d3a1a', light: '#d2b48c' },
  'cream': { fur: '#faf8e6', dark: '#e6daa6', light: '#fffef7' },
  
  // Cool Colors
  'cyan': { fur: '#22d3ee', dark: '#0891b2', light: '#ecfeff' },
  'sky': { fur: '#7dd3fc', dark: '#0284c7', light: '#f0f9ff' },
  'navy': { fur: '#3b82f6', dark: '#1e40af', light: '#dbeafe' },
  'purple': { fur: '#a855f7', dark: '#7e22ce', light: '#f3e8ff' },
  'lavender': { fur: '#c4b5fd', dark: '#7c3aed', light: '#f5f3ff' },
  'mint': { fur: '#86efac', dark: '#16a34a', light: '#f0fdf4' },
  'teal': { fur: '#2dd4bf', dark: '#0f766e', light: '#f0fdfa' },
  'turquoise': { fur: '#5eead4', dark: '#14b8a6', light: '#ccfbf1' },
  'emerald': { fur: '#34d399', dark: '#047857', light: '#d1fae5' },
  'lime': { fur: '#a3e635', dark: '#65a30d', light: '#f7fee7' },
  
  // Special Colors
  'gold': { fur: '#fbbf24', dark: '#d97706', light: '#fef3c7', accent: '#eab308' },
  'silver': { fur: '#cbd5e1', dark: '#64748b', light: '#f1f5f9', accent: '#94a3b8' },
  'sunset': { fur: '#fb923c', dark: '#f472b6', light: '#fed7aa', accent: '#f97316' },
  'ocean': { fur: '#06b6d4', dark: '#0891b2', light: '#22d3ee', accent: '#3b82f6' },
  'forest': { fur: '#16a34a', dark: '#15803d', light: '#4ade80', accent: '#65a30d' },
  'pastel-pink': { fur: '#fbcfe8', dark: '#f472b6', light: '#fce7f3' },
  'pastel-blue': { fur: '#bfdbfe', dark: '#60a5fa', light: '#eff6ff' },
  'pastel-yellow': { fur: '#fef08a', dark: '#eab308', light: '#fefce8' },
  'white': { fur: '#ffffff', dark: '#e5e7eb', light: '#fafafa', accent: '#f3f4f6' },
  'rainbow': { fur: '#f472b6', dark: '#7c3aed', light: '#fef3c7', accent: '#22d3ee' },
};

// Base Cat Head Bitmap (simplified, head only - 16x12)
const CAT_HEAD_BITMAP: string[] = [
  '....KK....KK....', // 0 - ears
  '...KFFK..KFFK...', // 1
  '...KPPK..KPPK...', // 2
  '.KDDFFFFFFFDDK..', // 3
  '.KFFFFFFFFFFFFK.', // 4
  'KFFFFFFFFFFFFFFK', // 5
  'KFFFFFFFFFFFFFFK', // 6
  'KFFEEFFFFFFEEFFK', // 7 - eyes (E = eye position for icons)
  'KFFEEFFFFFFEEFFK', // 8
  'KFFPPFFFFFFPPFFK', // 9 - cheeks
  'KFFFFFFKKFFFFFFK', // 10 - nose
  '.KFFFFFFFFFFFFK.', // 11
];

// Eye Icon Bitmaps (4x2 pixels for each eye icon)
const EYE_ICONS: Record<CatIconType, string[]> = {
  // Normal eyes
  'normal': ['KKKK', 'KKKK'],
  
  // Food Icons
  'meat': ['KOOK', 'KOOO'], // Drumstick shape
  'cake': ['KPPK', 'PPPP'], // Cake slice (pink)
  'drink': ['KBBB', 'BBBB'], // Cup (blue)
  'candy': ['KPPK', 'KPPK'], // Lollipop (pink circle)
  'cookie': ['KBRK', 'BRRB'], // Cookie with chips (brown)
  'biscuit': ['YYYY', 'YYYY'], // Wafer (yellow)
  'dairy': ['KWWK', 'WWWW'], // Milk (white)
  'snack': ['KYYK', 'YYYY'], // Snack chip (yellow)
  
  // Actions
  'bowl': ['KRRK', 'RRRR'], // Bowl (red)
  'paw': ['KPPK', 'PPKK'], // Paw print (pink)
  'scanner': ['KGGK', 'GGGG'], // Scanner (green)
  'apple': ['KRRK', 'RRRR'], // Apple (red)
  
  // Status
  'hunger': ['KSSK', 'SSSS'], // Fork/knife (silver)
  'happiness': ['KPPK', 'PPPP'], // Heart (pink)
  'health': ['KGGK', 'KGGK'], // Plus sign (green)
  'energy': ['KYYK', 'KYKK'], // Lightning (yellow)
  'xp': ['KYKY', 'KYKK'], // Star shape (yellow)
};

// Icon Color Mapping
const ICON_COLORS: Record<string, string> = {
  'K': '#1a1a1a', // Black outline
  'O': '#fb923c', // Orange (meat)
  'P': '#f472b6', // Pink
  'B': '#3b82f6', // Blue
  'R': '#ef4444', // Red
  'Y': '#fbbf24', // Yellow
  'W': '#ffffff', // White
  'G': '#22c55e', // Green
  'S': '#cbd5e1', // Silver
};

interface CatIconProps {
  color?: CatIconColor;
  iconType?: CatIconType;
  size?: number;
  className?: string;
}

export function CatIcon({
  color = 'cyan',
  iconType = 'normal',
  size = 32,
  className = '',
}: CatIconProps) {
  const palette = COLOR_PALETTES[color];
  const eyeIcon = EYE_ICONS[iconType];
  const pixels: Array<{ x: number; y: number; color: string }> = [];

  // Draw cat head
  CAT_HEAD_BITMAP.forEach((row, y) => {
    row.split('').forEach((char, x) => {
      let pixelColor: string | null = null;

      if (char === 'K') pixelColor = '#1a1a1a'; // Black outline
      else if (char === 'F') pixelColor = palette.fur; // Fur
      else if (char === 'D') pixelColor = palette.dark; // Dark fur
      else if (char === 'P') pixelColor = '#f9a8d4'; // Pink inner ear/cheek
      else if (char === 'L') pixelColor = palette.light; // Light highlight
      else if (char === 'E') {
        // Eye position - replace with icon
        const eyeRow = y - 7; // Eyes start at row 7
        const eyeCol = x <= 7 ? x - 3 : x - 11; // Left eye: col 3-6, right eye: col 11-14
        
        if (eyeRow >= 0 && eyeRow < 2 && eyeCol >= 0 && eyeCol < 4) {
          const iconChar = eyeIcon[eyeRow][eyeCol];
          pixelColor = ICON_COLORS[iconChar] || palette.fur;
        } else {
          pixelColor = palette.fur; // Fallback
        }
      }

      if (pixelColor) {
        pixels.push({ x, y, color: pixelColor });
      }
    });
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 12"
      xmlns="http://www.w3.org/2000/svg"
      className={`pixelated ${className}`}
      style={{ imageRendering: 'pixelated' }}
      role="img"
    >
      {pixels.map((p, idx) => (
        <rect
          key={idx}
          x={p.x}
          y={p.y}
          width={1}
          height={1}
          fill={p.color}
        />
      ))}
    </svg>
  );
}

// Convenience exports for specific icon types
export const FoodCatIcons = {
  Meat: (props: Omit<CatIconProps, 'iconType'>) => <CatIcon {...props} iconType="meat" color={props.color || 'orange'} />,
  Cake: (props: Omit<CatIconProps, 'iconType'>) => <CatIcon {...props} iconType="cake" color={props.color || 'pink'} />,
  Drink: (props: Omit<CatIconProps, 'iconType'>) => <CatIcon {...props} iconType="drink" color={props.color || 'cyan'} />,
  Candy: (props: Omit<CatIconProps, 'iconType'>) => <CatIcon {...props} iconType="candy" color={props.color || 'pastel-pink'} />,
  Cookie: (props: Omit<CatIconProps, 'iconType'>) => <CatIcon {...props} iconType="cookie" color={props.color || 'brown'} />,
  Biscuit: (props: Omit<CatIconProps, 'iconType'>) => <CatIcon {...props} iconType="biscuit" color={props.color || 'cream'} />,
  Dairy: (props: Omit<CatIconProps, 'iconType'>) => <CatIcon {...props} iconType="dairy" color={props.color || 'white'} />,
  Snack: (props: Omit<CatIconProps, 'iconType'>) => <CatIcon {...props} iconType="snack" color={props.color || 'amber'} />,
};

export const ActionCatIcons = {
  Bowl: (props: Omit<CatIconProps, 'iconType'>) => <CatIcon {...props} iconType="bowl" color={props.color || 'red'} />,
  Paw: (props: Omit<CatIconProps, 'iconType'>) => <CatIcon {...props} iconType="paw" color={props.color || 'pink'} />,
  Scanner: (props: Omit<CatIconProps, 'iconType'>) => <CatIcon {...props} iconType="scanner" color={props.color || 'teal'} />,
  Apple: (props: Omit<CatIconProps, 'iconType'>) => <CatIcon {...props} iconType="apple" color={props.color || 'red'} />,
};

export const StatusCatIcons = {
  Hunger: (props: Omit<CatIconProps, 'iconType'>) => <CatIcon {...props} iconType="hunger" color={props.color || 'silver'} />,
  Happiness: (props: Omit<CatIconProps, 'iconType'>) => <CatIcon {...props} iconType="happiness" color={props.color || 'rose'} />,
  Health: (props: Omit<CatIconProps, 'iconType'>) => <CatIcon {...props} iconType="health" color={props.color || 'emerald'} />,
  Energy: (props: Omit<CatIconProps, 'iconType'>) => <CatIcon {...props} iconType="energy" color={props.color || 'gold'} />,
  XP: (props: Omit<CatIconProps, 'iconType'>) => <CatIcon {...props} iconType="xp" color={props.color || 'gold'} />,
};
