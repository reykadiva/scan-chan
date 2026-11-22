import { NextRequest, NextResponse } from 'next/server';
import { productUpdateSchema } from '@/lib/validations/product';
import { createClient } from '@/lib/supabase/server';
import { getProductByBarcode, updateProduct, deleteProduct } from '@/services/product-service';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ barcode: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { barcode } = await params;
    const product = await getProductByBarcode(barcode);

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    console.error('[API GET /api/products/[barcode]]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { barcode } = await params;
    const body = await request.json();
    const parsed = productUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid product update' },
        { status: 400 }
      );
    }

    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) userId = user.id;
    } catch {
      userId = null;
    }

    const updated = await updateProduct(barcode, parsed.data, userId);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('[API PUT /api/products/[barcode]]', error);
    const isUnauthorized = error.message?.includes('Unauthorized');
    const isNotFound = error.message?.includes('not found');
    const status = isUnauthorized ? 403 : isNotFound ? 404 : 500;
    const errorMessage = isUnauthorized
      ? 'Unauthorized to update product'
      : isNotFound
      ? 'Product not found'
      : 'Failed to update product';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { barcode } = await params;

    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) userId = user.id;
    } catch {
      userId = null;
    }

    await deleteProduct(barcode, userId);
    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error: any) {
    console.error('[API DELETE /api/products/[barcode]]', error);
    const isUnauthorized = error.message?.includes('Unauthorized');
    const isNotFound = error.message?.includes('not found');
    const status = isUnauthorized ? 403 : isNotFound ? 404 : 500;
    const errorMessage = isUnauthorized
      ? 'Unauthorized to delete product'
      : isNotFound
      ? 'Product not found'
      : 'Failed to delete product';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status }
    );
  }
}
