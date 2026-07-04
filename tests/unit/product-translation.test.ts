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
    expect(result.reactionMessage).toBeDefined();
  });

  it('handles unknown products with a safe generic food model', () => {
    const result = translateProductToFood({ barcodeNumber: '999', productName: null, category: null });

    expect(result).toMatchObject({
      status: 'unknown',
      canFeed: true,
      food: { id: '999', name: 'Mysterious find', category: FoodCategory.UNKNOWN, isNew: true },
    });
    expect(result.reactionMessage).toBeDefined();
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

  it('maps expanded category keywords to food categories', () => {
    expect(translateProductToFood({ barcodeNumber: '1', productName: 'Chocolate', category: 'chocolate' }).food.category).toBe(FoodCategory.TREAT);
    expect(translateProductToFood({ barcodeNumber: '2', productName: 'Juice', category: 'juice' }).food.category).toBe(FoodCategory.BEVERAGE);
    expect(translateProductToFood({ barcodeNumber: '3', productName: 'Noodles', category: 'noodles' }).food.category).toBe(FoodCategory.MEAL);
    expect(translateProductToFood({ barcodeNumber: '4', productName: 'Flour', category: 'flour' }).food.category).toBe(FoodCategory.INGREDIENT);
  });

  it('includes reaction message from food category definitions', () => {
    const snackResult = translateProductToFood({ barcodeNumber: '1', productName: 'Chips', category: 'snack' });
    const mealResult = translateProductToFood({ barcodeNumber: '2', productName: 'Pasta', category: 'meal' });
    
    expect(snackResult.reactionMessage).toBeDefined();
    expect(mealResult.reactionMessage).toBeDefined();
    expect(typeof snackResult.reactionMessage).toBe('string');
  });
});
