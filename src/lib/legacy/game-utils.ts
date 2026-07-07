import type { CatVariantId } from '@/components/legacy/pixel-cat';

/**
 * Maps a product category string to a pixel cat variant for visual theming.
 * Returns 'gray' as the fallback for unknown or null categories.
 */
export function getCategoryVariant(category: string | null): CatVariantId {
  if (!category) return 'gray';
  const cat = category.toLowerCase();
  if (cat.includes('snack')) return 'calico';
  if (cat.includes('drink')) return 'cyan';
  if (cat.includes('dairy')) return 'pink';
  if (cat.includes('instant')) return 'tabby';
  if (cat.includes('personal')) return 'black';
  return 'gray';
}
