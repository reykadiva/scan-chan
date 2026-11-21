export const dynamic = 'force-dynamic';

import { getProductByBarcode } from '@/services/product-service';
import type { Metadata } from 'next';
import Link from 'next/link';
import { formatDate, formatBarcode } from '@/lib/utils';
import { CategoryBadge, CategoryIcon } from '@/components/ui/category-badge';
import { ArrowLeft, ScanLine, Package, Tag, Calendar, BarChart3, Plus } from 'lucide-react';

type Props = { params: Promise<{ barcode: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { barcode } = await params;
  const product = await getProductByBarcode(barcode);
  if (!product) return { title: 'Product Not Found - Scan Chan' };
  return {
    title: `${product.productName} - Scan Chan`,
    description: product.description ?? `${product.productName} by ${product.brand ?? 'Unknown brand'}. Barcode: ${barcode}`,
  };
}

export default async function ProductPage({ params }: Props) {
  const { barcode } = await params;

  const product = await getProductByBarcode(barcode);
  const scanCount = product?.scanCount ?? 0;

  if (!product) {
    return (
      <div className="py-12 flex items-center justify-center">
        <div className="card-arcade p-8 max-w-md text-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto text-3xl">
            📦
          </div>
          <h1 className="font-fredoka text-2xl font-bold text-foreground">Product Not Found</h1>
          <p className="text-sm text-muted-foreground">
            Barcode <span className="font-mono font-bold text-foreground">{barcode}</span> has not been registered in the database yet.
          </p>
          <div className="flex gap-2.5 justify-center pt-2">
            <Link href="/" className="btn-arcade text-xs bg-muted text-foreground border border-border">
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
            <Link href={`/play?register=${barcode}`} className="btn-arcade-primary text-xs">
              <Plus className="w-4 h-4" /> Register Item
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      {/* Navigation breadcrumb */}
      <div className="flex items-center justify-between">
        <Link href="/play" className="inline-flex items-center gap-1.5 text-xs font-bold font-fredoka text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Hub
        </Link>
        <Link href="/scan" className="btn-arcade-primary text-xs !py-1.5 !px-3">
          <ScanLine className="w-3.5 h-3.5" /> Scan Again
        </Link>
      </div>

      {/* Main Product Card */}
      <div className="card-arcade overflow-hidden">
        <div className="relative bg-muted/40 h-64 flex items-center justify-center border-b border-border">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.productName}
              className="h-full w-full object-contain p-6"
            />
          ) : (
            <div className="text-center space-y-2">
              <div className="w-20 h-20 rounded-2xl bg-white border border-border flex items-center justify-center mx-auto shadow-xs">
                <CategoryIcon category={product.category} size={42} />
              </div>
              <p className="text-muted-foreground text-xs font-mono">No product photo</p>
            </div>
          )}

          {product.category && (
            <div className="absolute top-4 left-4">
              <CategoryBadge category={product.category} size="md" />
            </div>
          )}
        </div>

        <div className="p-6 space-y-3">
          <div>
            <h1 className="font-fredoka text-2xl sm:text-3xl font-bold text-foreground">
              {product.productName}
            </h1>
            {product.brand && (
              <p className="text-sm font-semibold text-muted-foreground">Brand: {product.brand}</p>
            )}
          </div>

          {product.description && (
            <p className="text-sm text-foreground/80 leading-relaxed pt-1">
              {product.description}
            </p>
          )}
        </div>
      </div>

      {/* Product Meta Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card-arcade p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#DCA1A1]/20 border border-[#DCA1A1]/40 flex items-center justify-center text-[#733636] dark:text-[#f7caca]">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-pixel uppercase font-bold text-muted-foreground">Barcode</p>
            <p className="font-mono font-bold text-foreground text-sm">{formatBarcode(product.barcodeNumber)}</p>
          </div>
        </div>

        <div className="card-arcade p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-pixel uppercase font-bold text-muted-foreground">Total Scans</p>
            <p className="font-mono font-bold text-foreground text-sm">{scanCount} Times</p>
          </div>
        </div>

        <div className="card-arcade p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-pixel uppercase font-bold text-muted-foreground">First Logged</p>
            <p className="font-mono font-bold text-foreground text-sm">{formatDate(product.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
