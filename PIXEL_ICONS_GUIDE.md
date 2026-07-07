# 🎨 Pixel Art Icons Guide

Complete guide for using the 17 chibi/cute style pixel art icons in Scan Chan.

## 📦 Available Icons

All icons are located in `src/components/ui/pixel-icons.tsx` and are 32x32px SVG components with a chibi/cute aesthetic.

### 🍖 Food Category Icons (8)

Perfect for food inventory and feeding UI:

| Icon | Component | Usage | Color Theme |
|------|-----------|-------|-------------|
| 🍖 | `PixelMeat` | Meat/protein items | Orange/brown |
| 🍰 | `PixelCake` | Cakes, desserts, pastries | Pink/cream |
| 🥤 | `PixelDrink` | Beverages, juice, drinks | Cyan/blue |
| 🍭 | `PixelCandy` | Candy, sweets | Pink/rainbow |
| 🍪 | `PixelCookie` | Cookies | Brown/tan |
| 🧇 | `PixelBiscuit` | Biscuits, wafers, crackers | Sandy/cream |
| 🥛 | `PixelDairy` | Milk, dairy products | White/blue |
| 🍿 | `PixelSnack` | Snacks, chips | Yellow/orange |

### 🎮 Action Icons (4)

For interactive buttons and actions:

| Icon | Component | Usage | Color Theme |
|------|-----------|-------|-------------|
| 🥣 | `PixelBowl` | Feed pet action | Red/brown |
| 🐾 | `PixelPaw` | Pet/interact action | Pink |
| 📱 | `PixelScanner` | Scan barcode action | White/green/red |
| 🍎 | `PixelApple` | Generic food icon | Red/green |

### 📊 Status Icons (5)

For progress bars and stat displays:

| Icon | Component | Usage | Color Theme |
|------|-----------|-------|-------------|
| 🍴 | `PixelHunger` | Hunger stat | Silver/gray |
| 💖 | `PixelHappiness` | Happiness/affection | Pink |
| 💚 | `PixelHealth` | Health stat | Green/white |
| ⚡ | `PixelEnergy` | Energy stat | Yellow/white |
| ⭐ | `PixelXP` | Experience points | Golden yellow |

## 🎯 Usage Examples

### Basic Usage

```tsx
import { PixelMeat, PixelBowl, PixelHappiness } from '@/components/ui/pixel-icons';

function MyComponent() {
  return (
    <div>
      {/* Default size (32px) */}
      <PixelMeat />
      
      {/* Custom size */}
      <PixelBowl size={48} />
      
      {/* With custom styling */}
      <PixelHappiness className="text-pink-500 drop-shadow-lg" size={24} />
    </div>
  );
}
```

### In Food Inventory

The pet-panel component automatically selects the right icon based on food category:

```tsx
// Automatic icon selection based on category
const getFoodIcon = (category: string | null | undefined) => {
  const cat = category?.toLowerCase() || 'other';
  
  if (cat.includes('meat')) return PixelMeat;
  if (cat.includes('cake')) return PixelCake;
  if (cat.includes('drink')) return PixelDrink;
  if (cat.includes('candy')) return PixelCandy;
  if (cat.includes('cookie')) return PixelCookie;
  if (cat.includes('biscuit')) return PixelBiscuit;
  if (cat.includes('dairy')) return PixelDairy;
  if (cat.includes('snack')) return PixelSnack;
  
  return PixelApple; // default
};

// Usage in component
const FoodIcon = getFoodIcon(item.category);
<FoodIcon className="w-8 h-8" />
```

### In Action Buttons

```tsx
import { PixelBowl, PixelPaw } from '@/components/ui/pixel-icons';

function ActionButtons() {
  return (
    <>
      {/* Feed button */}
      <button className="btn-bubbly flex items-center gap-2">
        <PixelBowl className="w-5 h-5" />
        Feed Pet
      </button>
      
      {/* Pet button */}
      <button className="btn-bubbly flex items-center gap-2">
        <PixelPaw className="w-5 h-5" />
        Pet Cat
      </button>
    </>
  );
}
```

### In Status Display

```tsx
import { PixelHunger, PixelHappiness } from '@/components/ui/pixel-icons';

function PetStats() {
  return (
    <div className="space-y-4">
      {/* With label */}
      <div className="flex items-center gap-2">
        <PixelHunger className="w-6 h-6" />
        <span>Hunger: {hunger}%</span>
      </div>
      
      {/* In progress bar label */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <PixelHappiness className="w-5 h-5 text-pink-500" />
          <span className="font-semibold">Happiness</span>
        </div>
        <EnhancedProgress value={happiness} max={100} variant="happiness" />
      </div>
    </div>
  );
}
```

### With Animations

```tsx
import { PixelApple } from '@/components/ui/pixel-icons';

function AnimatedIcon() {
  return (
    <>
      {/* Floating animation */}
      <PixelApple className="w-8 h-8 animate-float" />
      
      {/* Bounce animation */}
      <PixelApple className="w-8 h-8 animate-bounce" />
      
      {/* Wiggle animation */}
      <PixelApple className="w-8 h-8 animate-wiggle" />
      
      {/* Pulse animation */}
      <PixelApple className="w-8 h-8 animate-pulse" />
    </>
  );
}
```

## 🎨 Styling Tips

### Color Customization

Icons use `currentColor` for fill, so you can change colors with text color classes:

```tsx
{/* Different colors */}
<PixelMeat className="text-orange-600" />
<PixelCake className="text-pink-400" />
<PixelDrink className="text-cyan-500" />

{/* With opacity */}
<PixelCandy className="text-pink-500 opacity-70" />

{/* With hover effects */}
<PixelBowl className="text-red-500 hover:text-red-600 transition-colors" />
```

### Size Variations

```tsx
{/* Small - 16px */}
<PixelMeat size={16} className="inline-block" />

{/* Default - 32px */}
<PixelMeat />

{/* Large - 48px */}
<PixelMeat size={48} />

{/* Extra large - 64px */}
<PixelMeat size={64} />
```

### Effects

```tsx
{/* Drop shadow */}
<PixelHappiness className="drop-shadow-lg" />

{/* Glow effect */}
<PixelXP className="filter drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />

{/* Scale on hover */}
<PixelPaw className="hover:scale-110 transition-transform cursor-pointer" />

{/* Rotate */}
<PixelEnergy className="animate-spin-slow" />
```

## 📐 Design Specifications

### Style Characteristics

- **Style:** Chibi/cute pixel art
- **Base Size:** 32x32px viewBox
- **Format:** SVG components
- **Animation:** Static (no built-in animation)
- **Rendering:** Pixelated (crisp edges via CSS)

### Color Palette

Icons use theme-consistent colors:
- **Warm:** Orange (#d2691e), Brown (#8b4513), Red (#ff4444)
- **Cool:** Cyan (#87ceeb), Blue (#4682b4), Pink (#ff69b4)
- **Neutral:** White (#fff), Gray (#c0c0c0), Cream (#f5deb3)
- **Accents:** Yellow (#fbbf24), Green (#22c55e)

### Visual Features

- Rounded edges for chibi aesthetic
- Shine/highlight effects with white opacity
- Soft shadows for depth
- 2-3 color layers for dimension
- Minimal details for clarity at small sizes

## 🔧 Technical Details

### Props Interface

```typescript
interface PixelIconProps {
  className?: string;  // Tailwind classes
  size?: number;       // Width/height in pixels (default: 32)
}
```

### CSS Class Applied

All icons automatically get the `.pixelated` class for crisp rendering:

```css
.pixelated {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
```

## 🎯 Integration Checklist

Current implementation status:

- [x] **Created:** All 17 icons created
- [x] **Pet Panel:** Food icons and feed button updated
- [ ] **Scan Page:** Add PixelScanner icon
- [ ] **Missions Page:** Add status icons
- [ ] **Profile Page:** Add status icons in stats
- [ ] **History Page:** Add food icons in history list
- [ ] **Navigation:** Consider adding icon accents

## 🚀 Future Enhancements

Potential additions:

1. **More Food Categories:**
   - PixelFruit (apple, banana, etc)
   - PixelVeggie (carrot, broccoli, etc)
   - PixelFastFood (burger, pizza, etc)

2. **More Action Icons:**
   - PixelCamera (for photo features)
   - PixelGift (for rewards)
   - PixelShop (for store)

3. **More Status Icons:**
   - PixelSleep (for rest stat)
   - PixelMood (for emotional state)
   - PixelLevel (for progression)

4. **Animated Variants:**
   - Create animated versions with CSS keyframes
   - Sprite sheet versions for more complex animations

## 📚 Related Components

These icons work great with:
- `EnhancedProgress` - Status bars with gradients
- `ParticleSystem` - Floating icon effects
- `MilestoneCelebration` - Achievement popups
- `LoadingSkeleton` - Loading states

## 🎨 Design Philosophy

**Chibi/Cute Style Guidelines:**
- Simplified shapes with rounded corners
- Big, expressive features
- Soft, pastel color palette
- Friendly, approachable aesthetic
- Consistent with pixel cat theme

---

**Created:** 2026-07-07  
**Components:** 17 pixel art icons  
**Status:** Integrated in pet-panel.tsx  
**Next:** Expand to other pages
