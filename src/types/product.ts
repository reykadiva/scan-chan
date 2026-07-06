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
