'use client';

import React from 'react';
import {
  Utensils,
  CupSoda,
  Candy,
  Cookie,
  Milk,
  Snowflake,
  Soup,
  Sparkles,
  Package,
  type LucideIcon,
} from 'lucide-react';

export interface CategoryConfig {
  label: string;
  Icon: LucideIcon;
  badgeClass: string;
  iconColor: string;
}

const CATEGORY_MAP: Record<string, CategoryConfig> = {
  Snack: {
    label: 'Snack',
    Icon: Utensils,
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-200/80 hover:bg-amber-100/70',
    iconColor: 'text-amber-600',
  },
  Drink: {
    label: 'Drink',
    Icon: CupSoda,
    badgeClass: 'bg-sky-50 text-sky-900 border-sky-200/80 hover:bg-sky-100/70',
    iconColor: 'text-sky-600',
  },
  Candy: {
    label: 'Candy',
    Icon: Candy,
    badgeClass: 'bg-pink-50 text-pink-900 border-pink-200/80 hover:bg-pink-100/70',
    iconColor: 'text-pink-600',
  },
  Biscuit: {
    label: 'Biscuit',
    Icon: Cookie,
    badgeClass: 'bg-orange-50 text-orange-950 border-orange-200/80 hover:bg-orange-100/70',
    iconColor: 'text-orange-600',
  },
  Dairy: {
    label: 'Dairy',
    Icon: Milk,
    badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-200/80 hover:bg-emerald-100/70',
    iconColor: 'text-emerald-600',
  },
  Frozen: {
    label: 'Frozen',
    Icon: Snowflake,
    badgeClass: 'bg-cyan-50 text-cyan-900 border-cyan-200/80 hover:bg-cyan-100/70',
    iconColor: 'text-cyan-600',
  },
  Instant: {
    label: 'Instant',
    Icon: Soup,
    badgeClass: 'bg-rose-50 text-rose-900 border-rose-200/80 hover:bg-rose-100/70',
    iconColor: 'text-rose-600',
  },
  Seasoning: {
    label: 'Seasoning',
    Icon: Sparkles,
    badgeClass: 'bg-purple-50 text-purple-900 border-purple-200/80 hover:bg-purple-100/70',
    iconColor: 'text-purple-600',
  },
  'Personal Care': {
    label: 'Personal Care',
    Icon: Sparkles,
    badgeClass: 'bg-indigo-50 text-indigo-900 border-indigo-200/80 hover:bg-indigo-100/70',
    iconColor: 'text-indigo-600',
  },
  Other: {
    label: 'Other',
    Icon: Package,
    badgeClass: 'bg-slate-50 text-slate-800 border-slate-200/80 hover:bg-slate-100/70',
    iconColor: 'text-slate-500',
  },
};

export function getCategoryConfig(category?: string | null): CategoryConfig {
  if (!category) return CATEGORY_MAP.Other;

  const raw = String(category).trim();
  if (CATEGORY_MAP[raw]) {
    return CATEGORY_MAP[raw];
  }

  const lower = raw.toLowerCase();
  if (lower.includes('drink') || lower.includes('beverage') || lower.includes('juice') || lower.includes('soda') || lower.includes('tea') || lower.includes('water')) {
    return CATEGORY_MAP.Drink;
  }
  if (lower.includes('candy') || lower.includes('sweet') || lower.includes('chocolate') || lower.includes('permen')) {
    return CATEGORY_MAP.Candy;
  }
  if (lower.includes('biscuit') || lower.includes('cookie') || lower.includes('wafer') || lower.includes('biskuit')) {
    return CATEGORY_MAP.Biscuit;
  }
  if (lower.includes('dairy') || lower.includes('milk') || lower.includes('cheese') || lower.includes('yogurt') || lower.includes('susu')) {
    return CATEGORY_MAP.Dairy;
  }
  if (lower.includes('frozen') || lower.includes('ice') || lower.includes('es')) {
    return CATEGORY_MAP.Frozen;
  }
  if (lower.includes('instant') || lower.includes('noodle') || lower.includes('mie') || lower.includes('ramen') || lower.includes('soup')) {
    return CATEGORY_MAP.Instant;
  }
  if (lower.includes('seasoning') || lower.includes('bumbu') || lower.includes('sauce') || lower.includes('sambal')) {
    return CATEGORY_MAP.Seasoning;
  }
  if (lower.includes('personal') || lower.includes('care') || lower.includes('soap') || lower.includes('shampoo') || lower.includes('sabun')) {
    return CATEGORY_MAP['Personal Care'];
  }
  if (lower.includes('snack') || lower.includes('chip') || lower.includes('keripik') || lower.includes('food')) {
    return CATEGORY_MAP.Snack;
  }

  return {
    label: raw,
    Icon: Package,
    badgeClass: 'bg-slate-50 text-slate-800 border-slate-200/80 hover:bg-slate-100/70',
    iconColor: 'text-slate-500',
  };
}

interface CategoryBadgeProps {
  category?: string | null;
  size?: 'sm' | 'md';
  className?: string;
  showIcon?: boolean;
}

export function CategoryBadge({
  category,
  size = 'md',
  className = '',
  showIcon = true,
}: CategoryBadgeProps) {
  const config = getCategoryConfig(category);
  const IconComponent = config.Icon;

  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-fredoka font-semibold whitespace-nowrap border shadow-[1px_1px_0_0_rgba(0,0,0,0.05)] select-none transition-colors ${config.badgeClass} ${
        isSmall ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      } ${className}`}
    >
      {showIcon && (
        <IconComponent
          className={`shrink-0 ${config.iconColor} ${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'}`}
          strokeWidth={2.4}
        />
      )}
      <span className="truncate">{config.label}</span>
    </span>
  );
}

export function CategoryIcon({
  category,
  className = '',
  size = 16,
}: {
  category?: string | null;
  className?: string;
  size?: number;
}) {
  const config = getCategoryConfig(category);
  const IconComponent = config.Icon;

  return (
    <IconComponent
      size={size}
      className={`shrink-0 ${config.iconColor} ${className}`}
      strokeWidth={2.4}
    />
  );
}
