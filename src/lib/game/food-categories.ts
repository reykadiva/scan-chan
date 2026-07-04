import type { FoodCategoryDefinition } from '@/types/content';
import { FoodCategory } from '@/types/pet';

export const FOOD_CATEGORY_DEFINITIONS: readonly FoodCategoryDefinition[] = [
  {
    category: FoodCategory.SNACK,
    statBoosts: {
      hunger: 10,
      mood: 5,
      energy: 5,
    },
    reactionMessages: [
      'Yum! A tasty snack!',
      'Munch munch munch...',
      'Just what I needed!',
      'Delicious!',
    ],
  },
  {
    category: FoodCategory.MEAL,
    statBoosts: {
      hunger: 25,
      mood: 10,
      energy: 10,
    },
    reactionMessages: [
      'A full meal! Thank you!',
      'This looks amazing!',
      'So filling and warm...',
      'Just like home!',
    ],
  },
  {
    category: FoodCategory.BEVERAGE,
    statBoosts: {
      hunger: 5,
      mood: 5,
      energy: 15,
    },
    reactionMessages: [
      'Refreshing!',
      'Glug glug glug...',
      'I feel hydrated!',
      'Perfect temperature!',
    ],
  },
  {
    category: FoodCategory.TREAT,
    statBoosts: {
      hunger: 15,
      mood: 20,
      affection: 10,
    },
    reactionMessages: [
      'A special treat! You remembered!',
      'My favorite!',
      'You spoil me!',
      'This makes me so happy!',
    ],
  },
  {
    category: FoodCategory.INGREDIENT,
    statBoosts: {
      hunger: 8,
      curiosity: 10,
    },
    reactionMessages: [
      'Interesting... what can we make with this?',
      'I wonder how this tastes...',
      'A building block for something great!',
      'Raw, but full of potential!',
    ],
  },
  {
    category: FoodCategory.UNKNOWN,
    statBoosts: {
      hunger: 5,
      curiosity: 15,
      mood: 5,
    },
    reactionMessages: [
      'Something new to discover!',
      'I\'ve never seen this before...',
      'An adventure in every bite!',
      'Mystery food!',
    ],
  },
] as const;
