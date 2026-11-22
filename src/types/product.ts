export interface Product {
  id: string;
  barcodeNumber: string;
  productName: string;
  brand: string | null;
  category: string | null;
  description: string | null;
  imageUrl: string | null;
  creatorId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProductTranslationStatus = 'translated' | 'unknown' | 'unsupported';

export interface ProductTranslationInput {
  readonly barcodeNumber: string;
  readonly productName?: string | null;
  readonly brand?: string | null;
  readonly category?: string | null;
  readonly description?: string | null;
}

export const CATEGORIES = [
  'Snack',
  'Drink',
  'Candy',
  'Biscuit',
  'Dairy',
  'Frozen',
  'Instant',
  'Seasoning',
  'Personal Care',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CONSUMABLE_CATEGORIES = [
  'Drink',
  'Snack',
  'Candy',
  'Biscuit',
  'Dairy',
  'Instant',
  'Frozen',
] as const;

export type ConsumableCategory = (typeof CONSUMABLE_CATEGORIES)[number];

const CONSUMABLE_KEYWORDS = [
  'drink',
  'beverage',
  'water',
  'juice',
  'tea',
  'coffee',
  'soda',
  'minuman',
  'air mineral',
  'snack',
  'camilan',
  'candy',
  'permen',
  'sweet',
  'chocolate',
  'cokelat',
  'biscuit',
  'biskuit',
  'cookie',
  'wafer',
  'dairy',
  'milk',
  'susu',
  'cheese',
  'keju',
  'yogurt',
  'instant',
  'noodle',
  'ramen',
  'mie',
  'frozen',
  'es krim',
  'food',
  'makanan',
  'meal',
];

export function isConsumableCategory(category?: string | null): boolean {
  if (!category) return false;
  const lower = category.trim().toLowerCase();
  if (CONSUMABLE_CATEGORIES.some((c) => c.toLowerCase() === lower)) {
    return true;
  }
  return CONSUMABLE_KEYWORDS.some((kw) => lower.includes(kw));
}

/** Backward-compatible alias for existing imports */
export const isFoodCategory = isConsumableCategory;

export const CATEGORY_COLORS: Record<string, string> = {
  Snack: '#FF9800',
  Drink: '#2196F3',
  Candy: '#E91E63',
  Biscuit: '#795548',
  Dairy: '#4CAF50',
  Frozen: '#00BCD4',
  Instant: '#FF5722',
  Seasoning: '#9C27B0',
  'Personal Care': '#3F51B5',
  Other: '#607D8B',
};

export const CATEGORY_EMOJIS: Record<string, string> = {
  Snack: '🍿',
  Drink: '🥤',
  Candy: '🍬',
  Biscuit: '🍪',
  Dairy: '🥛',
  Frozen: '🧊',
  Instant: '🍜',
  Seasoning: '🧂',
  'Personal Care': '🧴',
  Other: '📦',
};
