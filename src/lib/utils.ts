import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Product } from '@prisma/client';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatBarcode(barcode: string): string {
  if (barcode.length === 13) {
    return `${barcode.slice(0, 1)}-${barcode.slice(1, 7)}-${barcode.slice(7, 12)}-${barcode.slice(12)}`;
  }
  if (barcode.length === 12) {
    return `${barcode.slice(0, 1)}-${barcode.slice(1, 6)}-${barcode.slice(6, 11)}-${barcode.slice(11)}`;
  }
  return barcode;
}

export function getDeviceType(): string {
  if (typeof window === 'undefined') return 'server';
  const ua = navigator.userAgent;
  if (/Mobile|Android|iPhone/i.test(ua)) return 'mobile';
  if (/Tablet|iPad/i.test(ua)) return 'tablet';
  return 'desktop';
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Converts a Product record (Prisma or Local) to a JSON-safe plain object
 * with Date fields serialized to ISO strings.
 */
export function serializeProduct(product: any) {
  return {
    ...product,
    brand: product.brand ?? null,
    category: product.category ?? null,
    description: product.description ?? null,
    imageUrl: product.imageUrl ?? null,
    creatorId: product.creatorId ?? null,
    foodValue: product.foodValue ?? null,
    rarity: product.rarity ?? null,
    petReaction: product.petReaction ?? null,
    createdAt: typeof product.createdAt === 'string' ? product.createdAt : product.createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: typeof product.updatedAt === 'string' ? product.updatedAt : product.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  };
}
