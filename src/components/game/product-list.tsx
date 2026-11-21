'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  Barcode,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/types';
import { CATEGORIES } from '@/types';
import { PixelCat } from '@/components/game/pixel-cat';
import { CategoryBadge } from '@/components/ui/category-badge';
import { useDebounce } from '@/hooks/use-debounce';
import { getCategoryVariant } from '@/lib/game-utils';

interface ProductListProps {
  creatorId: string;
  onProductDeleted: (barcode: string) => void;
}

const PAGE_LIMIT = 12;

export function ProductList({ creatorId, onProductDeleted }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingBarcode, setDeletingBarcode] = useState<string | null>(null);
  const [copiedBarcode, setCopiedBarcode] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_LIMIT),
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(category && { category }),
        });
        const res = await fetch(`/api/products?${params}`);
        const data = await res.json();
        if (data.success && active) {
          setProducts(data.data);
          setTotal(data.total);
        }
      } catch {
        toast.error('Failed to load products');
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [page, debouncedSearch, category, refreshKey]);

  const handleDelete = async (product: Product) => {
    if (deletingBarcode) return;
    setDeletingBarcode(product.barcodeNumber);
    try {
      const res = await fetch(`/api/products/${product.barcodeNumber}`, {
        method: 'DELETE',
        headers: { 'x-creator-id': creatorId },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Delete failed');
      toast.success('Product removed from registry');
      onProductDeleted(product.barcodeNumber);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingBarcode(null);
    }
  };

  const handleCopyBarcode = (barcodeNumber: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(barcodeNumber);
      }
      setCopiedBarcode(barcodeNumber);
      toast.success(`Copied barcode ${barcodeNumber}!`);
      setTimeout(() => {
        setCopiedBarcode((prev) => (prev === barcodeNumber ? null : prev));
      }, 1800);
    } catch {
      toast.error('Failed to copy barcode');
    }
  };

  const totalPages = Math.ceil(total / PAGE_LIMIT);

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search products by name or barcode..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-slate-200 font-nunito font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-cyan transition-all text-xs sm:text-sm bg-white shadow-[2px_2px_0_0_rgba(0,0,0,0.04)]"
          />
        </div>
        <div className="relative shrink-0">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="appearance-none pl-3.5 pr-9 py-2.5 rounded-xl border-2 border-slate-200 font-nunito font-bold text-slate-700 focus:outline-none focus:border-brand-cyan transition-all text-xs sm:text-sm bg-white w-full sm:w-auto shadow-[2px_2px_0_0_rgba(0,0,0,0.04)] cursor-pointer"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            strokeWidth={2.4}
          />
        </div>
      </div>

      {/* Product Cards Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-brand-cyan animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="card-bubbly bg-white p-8 text-center border-2 border-[var(--theme-border)] rounded-2xl shadow-[3px_3px_0_0_var(--theme-shadow)]">
          <PixelCat variant="calico" action="items" size={72} className="mx-auto mb-3" />
          <p className="font-fredoka text-lg font-bold text-[var(--theme-text-dark)] mb-1">
            Registry is Empty
          </p>
          <p className="font-nunito text-[var(--theme-text-dark)]/80 text-xs sm:text-sm max-w-sm mx-auto">
            No products match your criteria. Scan a barcode or add an item manually to grow your registry!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 items-stretch">
          {products.map((product) => {
            const isOwner = !!creatorId && product.creatorId === creatorId;
            const isDeleting = deletingBarcode === product.barcodeNumber;
            const catVariant = getCategoryVariant(product.category);
            const isCopied = copiedBarcode === product.barcodeNumber;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex flex-col justify-between bg-white rounded-2xl border-2 border-[var(--theme-border)] shadow-[3px_3px_0_0_var(--theme-shadow)] p-3.5 sm:p-4 hover:shadow-[4px_4px_0_0_var(--theme-shadow)] transition-all relative overflow-hidden"
              >
                {/* Top Section */}
                <div className="space-y-3">
                  {/* Header: Thumbnail + Title/Brand + Delete */}
                  <div className="flex items-start gap-3">
                    {/* Thumbnail / Sprite */}
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <PixelCat variant={catVariant} size={36} />
                      )}
                    </div>

                    {/* Title & Brand (Fixed Height Slots) */}
                    <div className="flex-1 min-w-0">
                      <h4
                        className="font-fredoka font-bold text-slate-800 text-sm leading-snug line-clamp-2 min-h-[2.4rem] flex items-center"
                        title={product.productName}
                      >
                        {product.productName}
                      </h4>

                      {/* Brand Row - Guaranteed Fixed Slot Height */}
                      <div className="h-4 flex items-center mt-0.5">
                        {product.brand && product.brand.trim() ? (
                          <span
                            className="font-nunito font-semibold text-xs text-slate-500 truncate"
                            title={product.brand}
                          >
                            {product.brand}
                          </span>
                        ) : (
                          <span className="font-nunito font-medium text-[11px] text-slate-400 italic">
                            Generic
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete Action (Owner only) */}
                    {isOwner && (
                      <button
                        onClick={() => handleDelete(product)}
                        disabled={isDeleting}
                        title="Delete product"
                        className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors shrink-0 disabled:opacity-50 text-red-500 cursor-pointer border border-red-200/70"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={2.4} />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Category Badge Row */}
                  <div className="pt-0.5 flex items-center">
                    <CategoryBadge category={product.category} size="sm" />
                  </div>
                </div>

                {/* Bottom Section: Barcode Monospace Pill with Copy Action */}
                <div className="pt-3 border-t border-slate-100 mt-3">
                  <div className="flex items-center justify-between gap-2 bg-slate-50/90 hover:bg-slate-100/90 px-2.5 py-1.5 rounded-xl border border-slate-200/80 transition-colors">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Barcode className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={2.2} />
                      <span className="font-mono text-xs font-semibold text-slate-700 tracking-wider truncate">
                        {product.barcodeNumber}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopyBarcode(product.barcodeNumber)}
                      title="Copy barcode"
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-white transition-all cursor-pointer shrink-0"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 stroke-[2.2]" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="font-nunito text-slate-500 text-xs sm:text-sm font-semibold">
            {total} product{total !== 1 ? 's' : ''} in registry
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <span className="font-fredoka font-semibold text-slate-700 text-xs sm:text-sm px-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
