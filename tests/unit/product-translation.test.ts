import { describe, expect, it } from 'vitest';
import { translateProductToFood } from '@/lib/product';
import { DefaultScannerService } from '@/services/scanner';
import { createMockRepositories } from '@tests/mocks';
import { FoodCategory } from '@/types/pet';

describe('product translation', () => {
  it('translates supported product metadata into feeding-compatible food', () => {
    const result = translateProductToFood({
      barcodeNumber: '123',
      productName: 'Berry Snack',
      brand: 'Scan Chan Pantry',
      category: 'Snack',
      description: null,
    });

    expect(result).toMatchObject({
      status: 'translated',
      canFeed: true,
      qualityScore: 100,
      food: {
        id: '123',
        name: 'Berry Snack',
        category: FoodCategory.SNACK,
      },
    });
    expect(result.food.nutrition.hunger).toBeGreaterThan(0);
  });

  it('handles unknown products with a safe generic food model', () => {
    const result = translateProductToFood({ barcodeNumber: '999', productName: null, category: null });

    expect(result).toMatchObject({
      status: 'unknown',
      canFeed: true,
      food: { id: '999', name: 'Mysterious find', category: FoodCategory.UNKNOWN, isNew: true },
    });
  });

  it('marks unsupported products as non-feedable without breaking FoodModel compatibility', () => {
    const result = translateProductToFood({
      barcodeNumber: '456',
      productName: 'Hand Soap',
      category: 'Personal Care',
    });

    expect(result).toMatchObject({
      status: 'unsupported',
      canFeed: false,
      reasons: expect.arrayContaining(['unsupported-category']),
      food: { id: 'unsupported-456', category: FoodCategory.UNKNOWN },
    });
    expect(result.food.nutrition).toMatchObject({ hunger: 0, mood: 0, energy: 0, affection: 0, curiosity: 0 });
  });

  it('keeps scanner service orchestration free of translation business logic', () => {
    const service = new DefaultScannerService(createMockRepositories().scanner);

    expect(service.translateProductToFood({ barcodeNumber: '321', productName: 'Milk', category: 'Dairy' }).data).toMatchObject({
      status: 'translated',
      food: { category: FoodCategory.INGREDIENT },
    });
  });
});
