'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayerStore } from '@/stores/player-store';
import { PixelCat, type CatVariantId, type CatActionId } from '@/components/game/pixel-cat';
import { Edit2, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/types';
import { getRoomGradient, getRoomTheme, RoomSelector } from '@/components/game/room-selector';
import { EnhancedProgress } from '@/components/ui/enhanced-progress';
import { EmptyFoodPantry, LoadingCat } from '@/components/ui/pixel-illustrations';
import { ParticleSystem } from '@/components/ui/particle-system';
import { MilestoneCelebration } from '@/components/ui/milestone-celebration';
import { FoodCatIcons, ActionCatIcons, type CatIconColor } from '@/components/ui/cat-icon-variants';
import { haptics } from '@/lib/haptics';

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
  const { petName, petStage, petHunger, petAffection, feedPet, renamePet, foodInventory, avatar } = usePlayerStore();
  const selectedRoom = usePlayerStore((s) => s.selectedRoom);
  const roomTheme = getRoomTheme(selectedRoom);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(petName);
  const [foodItems, setFoodItems] = useState<Product[]>([]);
  const [loadingFood, setLoadingFood] = useState(true);
  const [catAction, setCatAction] = useState<CatActionId>('none');
  const [fedPopups, setFedPopups] = useState<{ id: number; text: string }[]>([]);
  const [showParticles, setShowParticles] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'levelup' | 'achievement' | 'milestone' | 'perfect'>('achievement');

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
      haptics.medium();
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
    haptics.medium();
    
    // Show particles
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 1000);
    
    setTimeout(() => setCatAction('none'), 1500);

    const prevHunger = petHunger;
    const wasDead = petHunger === 0;
    feedPet(product.barcodeNumber, product.category || 'Other');
    
    // Check if we hit 100%
    if (prevHunger < 100 && petHunger + 10 >= 100) {
      setTimeout(() => {
        setCelebrationType('perfect');
        setShowCelebration(true);
      }, 500);
    }
    
    if (wasDead) {
      setCatAction('excited');
      toast.success(`Revived ${petName}! ✨ He is back to life!`);
    } else {
      toast.success(`Fed ${product.productName} to ${petName}!`);
    }
    
    // Add a floating text animation
    const id = Date.now();
    setFedPopups((prev) => [...prev, { id, text: wasDead ? '✨ Revived!' : `+ Yum! (Hunger filled)` }]);
    setTimeout(() => {
      setFedPopups((prev) => prev.filter((p) => p.id !== id));
    }, 1500);
  };

  const handleCatClick = () => {
    haptics.light();
    let meows: string[];
    let actionToSet: CatActionId = 'say-hi';

    if (petHunger === 0) {
      meows = [
        'X_X ...so hungry... need food to revive...',
        '*fainted* ...feed me snacks to wake up...',
        'Bleurgh... out of energy... 🍖',
        'Zzz... zero hunger... need treats... 💤',
      ];
      actionToSet = 'fainted';
    } else if (petHunger <= 25) {
      meows = [
        '*sniff* ...tummy hurts so bad... 😢',
        'Please... just one snack... 😿',
        'So weak... can’t hunt barcodes... 🥺',
        '*shivering softly* ...feed me please... 🐾',
      ];
      actionToSet = 'starving';
    } else if (petHunger < 70) {
      meows = [
        'Tummy is hungry... need snacks! 🥺',
        'Feed me some treats! 🐟',
        'Craving tasty snacks! 😿',
        '*Tummy rumbles* 🐾',
      ];
      actionToSet = 'hungry';
    } else if (petHunger >= 80 && petAffection >= 50) {
      meows = [
        'Full & happy! Purrr~ 💕',
        'Best scanner partner! ✨',
        'Nyaaa~! Love you! 💖',
        '*Nuzzle nuzzle* 😻',
      ];
      const actions: CatActionId[] = ['say-hi', 'excited', 'play'];
      actionToSet = actions[Math.floor(Math.random() * actions.length)];
    } else {
      meows = [
        'Meow! Ready to scan? 🐾',
        'Nyaaa~ 😸',
        'Purrr... got any snacks? 🐈',
        '*Wiggle* ✨',
        'Hi human! 👋',
        'Zzz... dreaming of barcodes... 💤',
      ];
      actionToSet = 'say-hi';
    }
    setCatAction(actionToSet);

    // Show particles
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 1000);

    const randomMeow = meows[Math.floor(Math.random() * meows.length)];
    const id = Date.now();
    setFedPopups((prev) => [...prev, { id, text: randomMeow }]);

    setTimeout(() => setCatAction('none'), 1800);
    setTimeout(() => {
      setFedPopups((prev) => prev.filter((p) => p.id !== id));
    }, 1800);
  };

  const catVariant = (avatar as CatVariantId) || STAGE_AVATARS[petStage] || 'calico';

  const getIdleAction = (): CatActionId => {
    if (catAction !== 'none') return catAction;
    if (petHunger === 0) return 'fainted';
    if (petHunger <= 25) return 'starving';
    if (petHunger < 70) return 'hungry';
    return 'full';
  };

  // Helper to get cat icon for food category
  const getFoodCatIcon = (category: string | null | undefined) => {
    const cat = category?.toLowerCase() || 'other';
    
    if (cat.includes('meat') || cat.includes('protein')) 
      return { Component: FoodCatIcons.Meat, color: 'orange' as CatIconColor };
    if (cat.includes('cake') || cat.includes('dessert') || cat.includes('pastry')) 
      return { Component: FoodCatIcons.Cake, color: 'pink' as CatIconColor };
    if (cat.includes('drink') || cat.includes('beverage') || cat.includes('juice')) 
      return { Component: FoodCatIcons.Drink, color: 'cyan' as CatIconColor };
    if (cat.includes('candy') || cat.includes('sweet')) 
      return { Component: FoodCatIcons.Candy, color: 'pastel-pink' as CatIconColor };
    if (cat.includes('cookie')) 
      return { Component: FoodCatIcons.Cookie, color: 'brown' as CatIconColor };
    if (cat.includes('biscuit') || cat.includes('wafer') || cat.includes('cracker')) 
      return { Component: FoodCatIcons.Biscuit, color: 'cream' as CatIconColor };
    if (cat.includes('dairy') || cat.includes('milk') || cat.includes('yogurt') || cat.includes('cheese')) 
      return { Component: FoodCatIcons.Dairy, color: 'white' as CatIconColor };
    if (cat.includes('snack') || cat.includes('chip')) 
      return { Component: FoodCatIcons.Snack, color: 'amber' as CatIconColor };
    
    return { Component: ActionCatIcons.Apple, color: 'red' as CatIconColor }; // default
  };

  return (
    <div className="space-y-6">
      {/* Main Pet Display Card */}
      <div className={`card-bubbly p-4 sm:p-6 relative overflow-hidden flex flex-col items-center gap-6 max-w-xl mx-auto md:max-w-none md:flex-row md:items-center bg-gradient-to-br ${getRoomGradient(selectedRoom)}`}>
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
        <div 
          onClick={handleCatClick}
          className={`relative group w-44 h-44 sm:w-48 sm:h-48 mt-4 sm:mt-0 bg-gradient-to-br from-white/20 to-white/10 rounded-[2.5rem] flex items-center justify-center border-4 ${roomTheme.borderColor} shadow-xl shrink-0 cursor-pointer active:scale-95 transition-all hover:shadow-2xl hover:brightness-110`}
          title="Click me to play!"
        >
          <PixelCat variant={catVariant} action={getIdleAction()} hunger={petHunger} size={120} />
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
                <h3 className={`font-fredoka text-2xl font-bold ${roomTheme.textColor}`}>{petName}</h3>
                <button onClick={() => setIsEditingName(true)} className={`p-1.5 ${roomTheme.subTextColor} hover:brightness-110 transition-colors`}>
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <span className={`${roomTheme.labelBg} ${roomTheme.labelText} text-xs font-fredoka font-bold px-3 py-1 rounded-full shrink-0 shadow-sm`}>
                {STAGE_LABELS[petStage]}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Hunger Progress - Enhanced */}
            <EnhancedProgress 
              value={petHunger} 
              max={100} 
              variant="hunger"
              showLabel={true}
              showPercentage={true}
              size="md"
              animated={true}
            />

            {/* Affection Progress - Enhanced */}
            <EnhancedProgress 
              value={petAffection} 
              max={100} 
              variant="happiness"
              showLabel={true}
              showPercentage={true}
              size="md"
              animated={true}
            />
          </div>
        </div>
      </div>

      {/* Available Food Section */}
      <div className="space-y-3">
        <h4 className="font-fredoka text-slate-800 text-lg font-bold flex items-center gap-2">
          <ActionCatIcons.Apple size={24} color="red" />
          Feed Pet (Food Inventory)
        </h4>
        <p className="font-nunito text-xs text-slate-400 font-medium">
          Food items collected from scanning products (Snack, Drink, Candy, Biscuit, Dairy).
        </p>

        {loadingFood ? (
          <div className="py-12 flex justify-center items-center">
            <LoadingCat className="w-24 h-24" />
          </div>
        ) : foodItems.length === 0 ? (
          <div className="card-bubbly bg-white p-6 text-center space-y-3">
            <EmptyFoodPantry className="w-32 h-32 mx-auto" />
            <h3 className="text-lg font-bold text-gray-700 font-fredoka">No Food Yet!</h3>
            <p className="text-gray-500 font-nunito text-xs max-w-xs mx-auto">
              Scan some snacks or beverages to feed your pet
            </p>
            <Link
              href="/scan"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--theme-primary)] hover:brightness-110 active:scale-95 text-white font-fredoka font-bold text-xs shadow-[2px_2px_0_0_var(--theme-shadow)] border border-white"
            >
              Scan Food →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {foodItems.map((item) => {
              const { Component: FoodIcon, color } = getFoodCatIcon(item.category);
              
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  className="card-bubbly bg-white p-4 flex flex-col justify-between gap-3 border border-slate-100 hover:border-brand-pink/30"
                >
                  <div className="flex gap-3 items-start">
                    <div className="w-12 h-12 rounded-xl bg-brand-pink/5 flex items-center justify-center shrink-0">
                      <FoodIcon size={40} color={color} />
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
                    <ActionCatIcons.Bowl size={16} color="white" />
                    Feed {petName}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Room Background Selector */}
      <RoomSelector />

      {/* Particle Effects */}
      <ParticleSystem 
        active={showParticles}
        type="mixed"
        count={12}
      />

      {/* Milestone Celebrations */}
      <MilestoneCelebration
        show={showCelebration}
        type={celebrationType}
        message={
          celebrationType === 'perfect' 
            ? `${petName} is fully fed!` 
            : 'Amazing!'
        }
        onComplete={() => setShowCelebration(false)}
      />
    </div>
  );
}
