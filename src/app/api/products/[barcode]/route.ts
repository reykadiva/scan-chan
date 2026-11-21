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
      { success: false, error: error.message || 'Internal server error' },
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
    const status = error.message?.includes('Unauthorized') ? 403 : error.message?.includes('not found') ? 404 : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
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
    const status = error.message?.includes('Unauthorized') ? 403 : error.message?.includes('not found') ? 404 : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status }
    );
  }
}
