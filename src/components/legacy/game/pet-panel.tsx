'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayerStore } from '@/stores/legacy/player-store';
import { PixelCat, type CatVariantId, type CatActionId } from '@/components/legacy/pixel-cat';
import { Edit2, Check, Loader2, Apple } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/types';
import { getRoomGradient, getRoomTheme, RoomSelector } from '@/components/legacy/game/room-selector';

// ponytail: map evolution stages to cute pixel cat variants
const STAGE_AVATARS: Record<string, CatVariantId> = {
  KITTEN: 'calico',
  YOUNG_CAT: 'tabby',
  ADULT_CAT: 'black',
  WISE_CAT: 'cyan',
  LEGENDARY_CAT: 'arashu-smiling',
};

const STAGE_LABELS: Record<string, string> = {
  KITTEN: 'Kitten',
  YOUNG_CAT: 'Young Cat',
  ADULT_CAT: 'Adult Cat',
  WISE_CAT: 'Wise Cat',
  LEGENDARY_CAT: 'Legendary Cat',
};

export function PetPanel() {
  const { petName, petStage, petHunger, petAffection, feedPet, renamePet, foodInventory, petCat } = usePlayerStore();
  const selectedRoom = usePlayerStore((s) => s.selectedRoom);
  const roomTheme = getRoomTheme(selectedRoom);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(petName);
  const [foodItems, setFoodItems] = useState<Product[]>([]);
  const [loadingFood, setLoadingFood] = useState(true);
  const [catAction, setCatAction] = useState<CatActionId>('none');
  const [fedPopups, setFedPopups] = useState<{ id: number; text: string }[]>([]);

  const handlePetClick = () => {
    petCat();
    playMeow();
    setCatAction('excited');

    const reactionText = ['Purrr~ 💖', '*purrs softly*', 'So happy! ✨', 'Meow! 🐾', 'Happy kitten! 🥰'];
    const randomText = reactionText[Math.floor(Math.random() * reactionText.length)];
    const id = Date.now();
    setFedPopups((prev) => [...prev, { id, text: randomText }]);

    setTimeout(() => setCatAction('none'), 1800);
    setTimeout(() => {
      setFedPopups((prev) => prev.filter((p) => p.id !== id));
    }, 1800);
  };

  // Fetch product details for food inventory to list available food
  useEffect(() => {
    async function loadFood() {
      const foodBarcodes = Object.keys(foodInventory);
      if (foodBarcodes.length === 0) {
        setFoodItems([]);
        setLoadingFood(false);
        return;
      }
      setLoadingFood(true);
      try {
        const dbBarcodes = foodBarcodes.filter((b) => !b.startsWith('login-reward-'));
        let dbProducts: Product[] = [];
        if (dbBarcodes.length > 0) {
          const res = await fetch(`/api/products?limit=50&barcodes=${dbBarcodes.join(',')}`);
          const data = await res.json();
          if (data.success) {
            dbProducts = data.data;
          }
        }
        
        // Append mocked products for login rewards
        const allItems = [...dbProducts];
        for (const barcode of foodBarcodes) {
          if (barcode.startsWith('login-reward-')) {
            allItems.push({
              id: barcode,
              barcodeNumber: barcode,
              productName: '🍱 Delicious Login Bento',
              category: 'Snack',
              brand: 'Scan-chan Bakery',
              description: 'A special tasty lunch box given to loyal players!',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } as any);
          }
        }

        setFoodItems(allItems);
      } catch {
        toast.error('Failed to load food inventory');
      } finally {
        setLoadingFood(false);
      }
    }
    loadFood();
  }, [foodInventory]);

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
      toast.info(`${petName} is full!`);
      return;
    }
    
    // ponytail: animate feeding action
    setCatAction('rewards');
    setTimeout(() => setCatAction('none'), 1500);

    feedPet(product.barcodeNumber, product.category || 'Other');
    toast.success(`Fed ${product.productName} to ${petName}!`);
    
    // Add a floating text animation
    const id = Date.now();
    setFedPopups((prev) => [...prev, { id, text: `+ Yum! (Hunger filled)` }]);
    setTimeout(() => {
      setFedPopups((prev) => prev.filter((p) => p.id !== id));
    }, 1500);
  };

  // ponytail: 8-bit chip-tune meow synthesizer
  const playMeow = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = 'triangle';
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(450, now);
      oscillator.frequency.exponentialRampToValueAtTime(850, now + 0.12);
      oscillator.frequency.exponentialRampToValueAtTime(750, now + 0.3);
      
      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      
      oscillator.start(now);
      oscillator.stop(now + 0.3);
    } catch {}
  };

  const handleCatClick = () => {
    playMeow();
    const actions: CatActionId[] = ['say-hi', 'excited', 'sleeping'];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    setCatAction(randomAction);

    const meows = ['Meow! 🐾', 'Nyaaa~ 😸', 'Purrr... 🐈', '*Wiggle* ✨', 'Hi human! 👋'];
    const randomMeow = meows[Math.floor(Math.random() * meows.length)];
    const id = Date.now();
    setFedPopups((prev) => [...prev, { id, text: randomMeow }]);

    setTimeout(() => setCatAction('none'), 1800);
    setTimeout(() => {
      setFedPopups((prev) => prev.filter((p) => p.id !== id));
    }, 1800);
  };

  const catVariant = STAGE_AVATARS[petStage] || 'calico';

  const getIdleAction = (): CatActionId => {
    if (catAction !== 'none') return catAction;
    if (petHunger < 30) return 'starving';
    if (petHunger < 70) return 'hungry';
    return 'full';
  };

  return (
    <div className="space-y-6">
      {/* Main Pet Display Card */}
      <div className={`card-bubbly p-6 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br ${getRoomGradient(selectedRoom)}`}>
        {/* Pixel decoration in corners */}
        <div className="absolute top-3 right-3 text-3xl opacity-40 pointer-events-none select-none animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
          {roomTheme.pixelDecoration.split('')[0]}
        </div>
        <div className="absolute bottom-3 right-8 text-2xl opacity-30 pointer-events-none select-none animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4s' }}>
          {roomTheme.pixelDecoration.split('')[1]}
        </div>
        <div className="absolute bottom-8 left-8 text-2xl opacity-35 pointer-events-none select-none animate-bounce" style={{ animationDelay: '1s', animationDuration: '3.5s' }}>
          {roomTheme.pixelDecoration.split('')[2]}
        </div>
        {/* Extra pixel cats decorations */}
        <div className="absolute top-1/2 right-12 opacity-20 pointer-events-none">
          <PixelCat variant="calico" action="none" size={24} />
        </div>
        <div className="absolute top-16 left-1/3 opacity-15 pointer-events-none">
          <PixelCat variant="tabby" action="none" size={20} />
        </div>
        
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

        {/* Big Pixel Cat View with glow effect */}
        <div 
          onClick={handleCatClick}
          className={`relative group w-36 h-36 bg-gradient-to-br from-white/20 to-white/10 rounded-[2.5rem] flex items-center justify-center border-4 ${roomTheme.borderColor} shadow-xl overflow-hidden shrink-0 cursor-pointer active:scale-95 transition-all hover:shadow-2xl hover:brightness-110`}
          title="Click me to play!"
        >
          <PixelCat variant={catVariant} action={getIdleAction()} size={110} />
          {/* Sparkle effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
                  className={`px-3 py-1.5 rounded-xl border-2 ${roomTheme.borderColor} font-fredoka font-semibold ${roomTheme.isDark ? 'bg-slate-800/50 text-white placeholder:text-slate-400' : 'bg-white text-slate-800'} focus:outline-none focus:border-brand-cyan text-sm w-44`}
                />
                <button onClick={handleRename} className="p-2 bg-brand-cyan text-white rounded-xl hover:brightness-110">
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className={`font-fredoka text-2xl font-bold ${roomTheme.textColor} drop-shadow-sm`}>{petName}</h3>
                <button onClick={() => setIsEditingName(true)} className={`p-1.5 ${roomTheme.subTextColor} hover:brightness-110 transition-colors`}>
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <span className={`${roomTheme.labelBg} ${roomTheme.labelText} text-xs font-fredoka font-bold px-3 py-1 rounded-full shrink-0 shadow-sm`}>
                {STAGE_LABELS[petStage]}
              </span>
              <button
                onClick={handlePetClick}
                className="bg-brand-pink text-white text-xs font-fredoka font-bold px-3 py-1 rounded-full shrink-0 hover:brightness-105 active:scale-95 transition-all shadow-sm flex items-center gap-1 cursor-pointer"
              >
                💖 Pet Cat
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Hunger Progress */}
            <div className="space-y-1.5">
              <div className={`flex justify-between items-center text-xs font-fredoka font-bold ${roomTheme.subTextColor}`}>
                <span className="flex items-center gap-1">
                  🍽️ Hunger
                </span>
                <span>{petHunger}%</span>
              </div>
              <div className={`w-full ${roomTheme.hungerBarBg} rounded-full h-3 border ${roomTheme.borderColor} overflow-hidden shadow-inner`}>
                <div
                  className={`${roomTheme.hungerBarColor} h-full rounded-full transition-all duration-500 shadow-sm`}
                  style={{ width: `${petHunger}%` }}
                />
              </div>
              <div className={`font-nunito text-[10px] ${roomTheme.subTextColor} font-semibold mt-1`}>
                {petHunger < 30 ? (
                  <span className="inline-flex items-center gap-1">
                    <PixelCat variant="gray" action="starving" size={16} /> Starving! Feed immediately.
                  </span>
                ) : petHunger < 70 ? (
                  <span className="inline-flex items-center gap-1">
                    <PixelCat variant="tabby" action="hungry" size={16} /> Slightly hungry.
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <PixelCat variant="cyan" action="full" size={16} /> Full and happy!
                  </span>
                )}
              </div>
            </div>

            {/* Affection Progress */}
            <div className="space-y-1.5">
              <div className={`flex justify-between items-center text-xs font-fredoka font-bold ${roomTheme.subTextColor}`}>
                <span className="flex items-center gap-1">
                  💗 Affection
                </span>
                <span>{petAffection}%</span>
              </div>
              <div className={`w-full ${roomTheme.affectionBarBg} rounded-full h-3 border ${roomTheme.borderColor} overflow-hidden shadow-inner`}>
                <div
                  className={`${roomTheme.affectionBarColor} h-full rounded-full transition-all duration-500 shadow-sm`}
                  style={{ width: `${petAffection}%` }}
                />
              </div>
              <p className={`font-nunito text-[10px] ${roomTheme.subTextColor} font-semibold`}>
                Keep caring for your pet to trigger the next evolution!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Food Section */}
      <div className="space-y-3">
        <h4 className="font-fredoka text-slate-800 text-lg font-bold flex items-center gap-2">
          <Apple className="w-5 h-5 text-brand-pink animate-bounce" />
          Feed Pet (Food Inventory)
        </h4>
        <p className="font-nunito text-xs text-slate-400 font-medium">
          Food items collected from scanning products (Snack, Drink, Candy, Biscuit, Dairy).
        </p>

        {loadingFood ? (
          <div className="py-12 flex justify-center items-center">
            <Loader2 className="w-6 h-6 text-brand-cyan animate-spin" />
          </div>
        ) : foodItems.length === 0 ? (
          <div className="card-bubbly bg-white p-8 text-center text-slate-400 font-nunito font-semibold">
            You don't have any food in your inventory yet. Go scan some snacks or beverages first!
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
                    <div className="flex gap-2 items-center mt-1">
                      <span className="inline-block px-2 py-0.5 bg-brand-pink/10 text-brand-pink rounded-full text-[10px] font-fredoka font-semibold">
                        {item.category}
                      </span>
                      <span className="text-[10px] font-nunito font-bold text-slate-500">
                        Qty: {foodInventory[item.barcodeNumber] || 0}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleFeed(item)}
                  className="btn-bubbly bg-brand-pink text-white w-full py-2 text-xs flex items-center justify-center gap-1.5"
                >
                  Feed {petName}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Room Background Selector */}
      <RoomSelector />
    </div>
  );
}
