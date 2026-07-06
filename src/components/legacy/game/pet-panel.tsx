'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayerStore } from '@/stores/legacy/player-store';
import { PixelCat, type CatVariantId, type CatActionId } from '@/components/legacy/pixel-cat';
import { Edit2, Check, Loader2, Apple } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/types';

// ponytail: map evolution stages to cute pixel cat variants
const STAGE_AVATARS: Record<string, CatVariantId> = {
  KITTEN: 'calico',
  YOUNG_CAT: 'tabby',
  ADULT_CAT: 'black',
  WISE_CAT: 'cyan',
  LEGENDARY_CAT: 'arashu-smiling',
};

const STAGE_LABELS: Record<string, string> = {
  KITTEN: 'Kitten 🍼',
  YOUNG_CAT: 'Young Cat 🎒',
  ADULT_CAT: 'Adult Cat 🎩',
  WISE_CAT: 'Wise Cat 🎓',
  LEGENDARY_CAT: 'Legendary Cat 👑',
};

export function PetPanel() {
  const { petName, petStage, petHunger, petAffection, feedPet, renamePet, scanHistory } = usePlayerStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(petName);
  const [foodItems, setFoodItems] = useState<Product[]>([]);
  const [loadingFood, setLoadingFood] = useState(true);
  const [catAction, setCatAction] = useState<CatActionId>('none');
  const [fedPopups, setFedPopups] = useState<{ id: number; text: string }[]>([]);

  // Fetch product details for scan history to list available food
  useEffect(() => {
    async function loadFood() {
      if (scanHistory.length === 0) {
        setLoadingFood(false);
        return;
      }
      setLoadingFood(true);
      try {
        const uniqueBarcodes = Array.from(new Set(scanHistory));
        const res = await fetch(`/api/products?limit=50&barcodes=${uniqueBarcodes.join(',')}`);
        const data = await res.json();
        if (data.success) {
          // Filter to consumable categories
          const consumables = data.data.filter((p: Product) =>
            p.category && ['Snack', 'Drink', 'Candy', 'Biscuit', 'Dairy'].includes(p.category)
          );
          setFoodItems(consumables);
        }
      } catch {
        toast.error('Failed to load food inventory');
      } finally {
        setLoadingFood(false);
      }
    }
    loadFood();
  }, [scanHistory]);

  const handleRename = () => {
    const trimmed = newName.trim();
    if (trimmed.length > 0) {
      renamePet(trimmed);
      setIsEditingName(false);
      toast.success(`Pet renamed to ${trimmed}!`);
    }
  };

  const handleFeed = (product: Product) => {
    if (petHunger >= 100) {
      toast.info(`${petName} is full! 😺`);
      return;
    }
    
    // ponytail: animate feeding action
    setCatAction('rewards');
    setTimeout(() => setCatAction('none'), 1500);

    feedPet(product.barcodeNumber, product.category || 'Other');
    toast.success(`Fed ${product.productName} to ${petName}! 🐟`);
    
    // Add a floating text animation
    const id = Date.now();
    setFedPopups((prev) => [...prev, { id, text: `+ Yum! (Hunger filled)` }]);
    setTimeout(() => {
      setFedPopups((prev) => prev.filter((p) => p.id !== id));
    }, 1500);
  };

  const catVariant = STAGE_AVATARS[petStage] || 'calico';

  return (
    <div className="space-y-6">
      {/* Main Pet Display Card */}
      <div className="card-bubbly bg-white p-6 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
        {/* Floating popups */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <AnimatePresence>
            {fedPopups.map((pop) => (
              <motion.div
                key={pop.id}
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: -20, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-brand-pink text-white text-xs font-fredoka font-bold px-3 py-1.5 rounded-full shadow-md"
              >
                {pop.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Big Pixel Cat View */}
        <div className="relative group w-36 h-36 bg-gradient-to-br from-brand-cyan/10 to-brand-pink/10 rounded-[2.5rem] flex items-center justify-center border-4 border-white shadow-xl overflow-hidden shrink-0">
          <PixelCat variant={catVariant} action={catAction} size={110} />
        </div>

        {/* Pet details and progress bars */}
        <div className="flex-1 space-y-4 w-full text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={20}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                  className="px-3 py-1.5 rounded-xl border-2 border-slate-200 font-fredoka font-semibold text-slate-800 focus:outline-none focus:border-brand-cyan text-sm w-44"
                />
                <button onClick={handleRename} className="p-2 bg-brand-cyan text-white rounded-xl hover:brightness-110">
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="font-fredoka text-2xl font-bold text-slate-800">{petName}</h3>
                <button onClick={() => setIsEditingName(true)} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <span className="bg-slate-800 text-white text-xs font-fredoka font-bold px-3 py-1 rounded-full shrink-0">
              {STAGE_LABELS[petStage]}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Hunger Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-fredoka font-bold text-slate-500">
                <span>Hunger (Kekenyangan)</span>
                <span>{petHunger}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 border border-slate-200/50 overflow-hidden">
                <div
                  className="bg-orange-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${petHunger}%` }}
                />
              </div>
              <p className="font-nunito text-[10px] text-slate-400 font-semibold">
                {petHunger < 30 ? '😿 Sangat lapar! Beri makan segera.' : petHunger < 70 ? '😺 Agak lapar.' : '😸 Kenyang dan senang!'}
              </p>
            </div>

            {/* Affection Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-fredoka font-bold text-slate-500">
                <span>Affection (Kasih Sayang)</span>
                <span>{petAffection}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 border border-slate-200/50 overflow-hidden">
                <div
                  className="bg-brand-pink h-full rounded-full transition-all duration-500"
                  style={{ width: `${petAffection}%` }}
                />
              </div>
              <p className="font-nunito text-[10px] text-slate-400 font-semibold">
                Tingkatkan terus untuk evolusi berikutnya!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Food Section */}
      <div className="space-y-3">
        <h4 className="font-fredoka text-slate-800 text-lg font-bold flex items-center gap-2">
          <Apple className="w-5 h-5 text-brand-pink animate-bounce" />
          Beri Makan (Food Inventory)
        </h4>
        <p className="font-nunito text-xs text-slate-400 font-medium">
          Daftar makanan yang berhasil Anda kumpulkan dari hasil scan belanjaan Anda (Kategori Snack, Drink, Candy, Biscuit, Dairy).
        </p>

        {loadingFood ? (
          <div className="py-12 flex justify-center items-center">
            <Loader2 className="w-6 h-6 text-brand-cyan animate-spin" />
          </div>
        ) : foodItems.length === 0 ? (
          <div className="card-bubbly bg-white p-8 text-center text-slate-400 font-nunito font-semibold">
            Kamu belum mempunyai makanan di riwayat scan. Yuk, scan produk snack atau minuman terlebih dahulu!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {foodItems.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02 }}
                className="card-bubbly bg-white p-4 flex flex-col justify-between gap-3 border border-slate-100 hover:border-brand-pink/30"
              >
                <div className="flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-xl bg-brand-pink/5 flex items-center justify-center shrink-0">
                    <Apple className="w-5 h-5 text-brand-pink" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-fredoka font-bold text-slate-800 text-sm truncate leading-tight">
                      {item.productName}
                    </h5>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-brand-pink/10 text-brand-pink rounded-full text-[10px] font-fredoka font-semibold">
                      {item.category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleFeed(item)}
                  className="btn-bubbly bg-brand-pink text-white w-full py-2 text-xs flex items-center justify-center gap-1.5"
                >
                  Suapi {petName} 🥣
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
