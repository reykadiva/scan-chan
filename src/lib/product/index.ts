import { createFood } from '@/lib/pet';
import { FoodCategory } from '@/types/pet';
import type { FoodModel } from '@/types/pet';
import type { ProductTranslationInput, ProductTranslationStatus } from '@/types/product';

const UNSUPPORTED_CATEGORIES = new Set(['personal care']);
const CATEGORY_TO_FOOD: Readonly<Record<string, FoodCategory>> = {
  snack: FoodCategory.SNACK,
  candy: FoodCategory.TREAT,
  biscuit: FoodCategory.TREAT,
  drink: FoodCategory.BEVERAGE,
  dairy: FoodCategory.INGREDIENT,
  frozen: FoodCategory.MEAL,
  instant: FoodCategory.MEAL,
  seasoning: FoodCategory.UNKNOWN,
  other: FoodCategory.UNKNOWN,
};

export interface ProductTranslationResult {
  readonly status: ProductTranslationStatus;
  readonly food: FoodModel;
  readonly qualityScore: number;
  readonly canFeed: boolean;
  readonly reasons: readonly string[];
}

export function translateProductToFood(product: ProductTranslationInput | null): ProductTranslationResult {
  if (!product) return unknownProductFood('unknown');

  const barcode = product.barcodeNumber.trim();
  const name = product.productName?.trim();
  const rawCategory = product.category?.trim().toLowerCase();
  const reasons: string[] = [];

  if (!barcode) reasons.push('missing-barcode');
  if (!name) reasons.push('missing-name');

  if (rawCategory && UNSUPPORTED_CATEGORIES.has(rawCategory)) {
    return {
      status: 'unsupported',
      canFeed: false,
      qualityScore: scoreProductQuality(product, reasons),
      reasons: [...reasons, 'unsupported-category'],
      food: createFood({
        id: `unsupported-${barcode || 'product'}`,
        name: name || 'Unsupported item',
        category: FoodCategory.UNKNOWN,
        nutrition: { hunger: 0, mood: 0, energy: 0, affection: 0, curiosity: 0 },
      }),
    };
  }

  const category = rawCategory ? CATEGORY_TO_FOOD[rawCategory] ?? FoodCategory.UNKNOWN : FoodCategory.UNKNOWN;
  const status: ProductTranslationStatus = name && category !== FoodCategory.UNKNOWN ? 'translated' : 'unknown';

  return {
    status,
    canFeed: true,
    qualityScore: scoreProductQuality(product, reasons),
    reasons,
    food: createFood({
      id: barcode || 'unknown-product',
      name: name || 'Mysterious find',
      category,
      isNew: status === 'unknown',
    }),
  };
}

function unknownProductFood(barcode: string): ProductTranslationResult {
  return {
    status: 'unknown',
    canFeed: true,
    qualityScore: 0,
    reasons: ['missing-product'],
    food: createFood({ id: barcode, name: 'Mysterious find', category: FoodCategory.UNKNOWN, isNew: true }),
  };
}

function scoreProductQuality(product: ProductTranslationInput, reasons: readonly string[]): number {
  return Math.max(
    0,
    Math.min(
      100,
      (product.barcodeNumber.trim() ? 25 : 0) +
        (product.productName?.trim() ? 35 : 0) +
        (product.category?.trim() ? 25 : 0) +
        (product.brand?.trim() || product.description?.trim() ? 15 : 0) -
        reasons.length * 10,
    ),
  );
}
