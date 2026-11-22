import { NextRequest, NextResponse } from 'next/server';
import { productCreateSchema } from '@/lib/validations/product';
import { createClient } from '@/lib/supabase/server';
import { getProducts, createProduct } from '@/services/product-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') ?? '';
    const category = searchParams.get('category') ?? '';
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '10')));
    const barcodesParam = searchParams.get('barcodes');
    const barcodes = barcodesParam ? barcodesParam.split(',').filter(Boolean) : undefined;

    const result = await getProducts({
      search,
      category,
      barcodes,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result.products,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (error: any) {
    console.error('[API GET /api/products]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = productCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid product data' },
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

    const created = await createProduct(parsed.data, userId);

    return NextResponse.json({
      success: true,
      data: created,
    }, { status: 201 });
  } catch (error: any) {
    console.error('[API POST /api/products]', error);
    const isConflict = error.message?.includes('already exists') || error.code === 'P2002';
    return NextResponse.json(
      {
        success: false,
        error: isConflict ? 'Product with this barcode already exists' : 'Failed to create product',
      },
      { status: isConflict ? 409 : 500 }
    );
  }
}
