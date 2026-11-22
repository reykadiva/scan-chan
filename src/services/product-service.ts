import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { localDb } from '@/lib/database/local-db';
import { serializeProduct } from '@/lib/utils';
import type { ProductCreateInput, ProductUpdateInput } from '@/lib/validations/product';
import { clearBarcodeNegativeCache } from '@/services/scanner-service';

export async function getProducts(options: {
  search?: string;
  category?: string;
  barcodes?: string[];
  page?: number;
  limit?: number;
}) {
  const { search, category, barcodes, page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  try {
    const where: Prisma.ProductWhereInput = {};

    if (barcodes && barcodes.length > 0) {
      where.barcodeNumber = { in: barcodes };
    } else if (search) {
      where.OR = [
        { productName: { contains: search, mode: 'insensitive' } },
        { barcodeNumber: { contains: search } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products: products.map(serializeProduct),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err) {
    console.warn('[getProducts] Prisma query failed, using local store:', err);
    const allProds = localDb.getAllProducts({ search, category, barcodes });
    const paginated = allProds.slice(skip, skip + limit);
    return {
      products: paginated.map(serializeProduct),
      total: allProds.length,
      page,
      limit,
      totalPages: Math.ceil(allProds.length / limit),
    };
  }
}

export async function getProductByBarcode(barcode: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { barcodeNumber: barcode },
      include: {
        _count: { select: { scanHistory: true } },
      },
    });

    if (product) {
      return {
        ...serializeProduct(product),
        scanCount: product._count.scanHistory,
      };
    }
  } catch (err) {
    console.warn('[getProductByBarcode] Prisma lookup failed, using local store:', err);
  }

  const localProduct = localDb.getProduct(barcode);
  if (!localProduct) return null;

  return {
    ...serializeProduct(localProduct),
    scanCount: localDb.countProductScans(barcode),
  };
}

export async function createProduct(input: ProductCreateInput, creatorId?: string | null) {
  try {
    const existing = await prisma.product.findUnique({
      where: { barcodeNumber: input.barcodeNumber },
    });

    if (existing) {
      throw new Error('A product with this barcode already exists');
    }

    const product = await prisma.product.create({
      data: {
        barcodeNumber: input.barcodeNumber,
        productName: input.productName,
        brand: input.brand ?? null,
        category: input.category ?? null,
        description: input.description ?? null,
        imageUrl: input.imageUrl ?? null,
        creatorId: creatorId ?? input.creatorId ?? null,
        foodValue: input.foodValue ?? null,
        rarity: input.rarity ?? null,
        petReaction: input.petReaction ?? null,
      },
    });

    // Also mirror to local store
    try {
      localDb.saveProduct({
        id: product.id,
        ...input,
        creatorId: creatorId ?? input.creatorId ?? null,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      });
    } catch {}

    // Clear from negative cache since product is now registered
    clearBarcodeNegativeCache(input.barcodeNumber);

    return serializeProduct(product);
  } catch (err: any) {
    if (err.message?.includes('already exists')) {
      throw err;
    }
    console.warn('[createProduct] Prisma failed, saving to local store:', err);

    const existingLocal = localDb.getProduct(input.barcodeNumber);
    if (existingLocal) {
      throw new Error('A product with this barcode already exists');
    }

    const newProd = localDb.saveProduct({
      id: `prod_${Date.now()}`,
      barcodeNumber: input.barcodeNumber,
      productName: input.productName,
      brand: input.brand ?? null,
      category: input.category ?? null,
      description: input.description ?? null,
      imageUrl: input.imageUrl ?? null,
      creatorId: creatorId ?? input.creatorId ?? null,
      foodValue: input.foodValue ?? null,
      rarity: input.rarity ?? null,
      petReaction: input.petReaction ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return serializeProduct(newProd);
  }
}

export async function updateProduct(barcode: string, input: ProductUpdateInput, userId?: string | null) {
  try {
    const existing = await prisma.product.findUnique({
      where: { barcodeNumber: barcode },
    });

    if (existing) {
      if (existing.creatorId && existing.creatorId !== 'openfoodfacts' && userId && existing.creatorId !== userId) {
        throw new Error('Unauthorized: You can only edit products you created');
      }

      const product = await prisma.product.update({
        where: { barcodeNumber: barcode },
        data: input,
      });

      try {
        const local = localDb.getProduct(barcode);
        if (local) {
          localDb.saveProduct({ ...local, ...input });
        }
      } catch {}

      // Clear from negative cache since product is now updated
      clearBarcodeNegativeCache(barcode);

      return serializeProduct(product);
    }
  } catch (err: any) {
    if (err.message?.includes('Unauthorized')) {
      throw err;
    }
    console.warn('[updateProduct] Prisma update failed, falling back to local store:', err);
  }

  const existingLocal = localDb.getProduct(barcode);
  if (!existingLocal) {
    throw new Error('Product not found');
  }

  if (existingLocal.creatorId && existingLocal.creatorId !== 'openfoodfacts' && userId && existingLocal.creatorId !== userId) {
    throw new Error('Unauthorized: You can only edit products you created');
  }

  const updated = localDb.saveProduct({
    ...existingLocal,
    ...input,
  });

  return serializeProduct(updated);
}

export async function deleteProduct(barcode: string, userId?: string | null) {
  try {
    const existing = await prisma.product.findUnique({
      where: { barcodeNumber: barcode },
    });

    if (existing) {
      if (existing.creatorId && existing.creatorId !== 'openfoodfacts' && userId && existing.creatorId !== userId) {
        throw new Error('Unauthorized: You can only delete products you created');
      }

      await prisma.product.delete({
        where: { barcodeNumber: barcode },
      });

      localDb.deleteProduct(barcode);
      return { success: true };
    }
  } catch (err: any) {
    if (err.message?.includes('Unauthorized')) {
      throw err;
    }
    console.warn('[deleteProduct] Prisma delete failed, falling back to local store:', err);
  }

  const existingLocal = localDb.getProduct(barcode);
  if (!existingLocal) {
    throw new Error('Product not found');
  }

  if (existingLocal.creatorId && existingLocal.creatorId !== 'openfoodfacts' && userId && existingLocal.creatorId !== userId) {
    throw new Error('Unauthorized: You can only delete products you created');
  }

  localDb.deleteProduct(barcode);
  return { success: true };
}
