# Manual Screenshot Guide

Follow these steps to capture remaining screenshots for verification.

## Setup
1. Open browser: http://localhost:3000/play/mode
2. Click "Guest" to enter Guest mode
3. Fill in nickname and click "Let's Play!"

---

## Screenshot Checklist

### ✅ COMPLETED (from automated tests)
- [x] Game mode selection
- [x] Guest onboarding
- [x] Play page loaded
- [x] Login calendar full view
- [x] Calendar grid closeup

---

### ⏳ REMAINING SCREENSHOTS

#### 1. Streak Display with Pixel Flame
**Location:** Top section of play page, look for "X day streak"

**What to verify:**
- Should see pixel art flame icon (not 🔥 emoji)
- Flame should be STATIC (no pulsing animation)
- Flame has detailed gradient (red→orange→yellow→white)

**How to capture:**
1. Stay on Missions tab (default)
2. Scroll to top if needed
3. Take screenshot of streak section

**Save as:** `manual-streak-display.png`

---

#### 2. Bounty Hunt - Cyan Theme
**Location:** Click "Bounty" tab

**What to verify:**
- "New Bounty" button is CYAN blue (not purple)
- Icon is BLACK barcode (not emoji 🎯)
- Card background has cyan gradient

**How to capture:**
1. Click "Bounty" tab in navigation
2. Wait for page to load
3. Full page screenshot

**Save as:** `manual-bounty-cyan.png`

**Expected colors:**
- Button: Cyan (#22d3ee / from-cyan-400 to-cyan-500)
- Icon: Black barcode
- Card: Light cyan gradient (from-cyan-50 to-cyan-100)

---

#### 3. Category Badges with Pixel Icons
**Location:** Click "Badges" tab

**What to verify:**
- Each badge has pixel art icon (not emoji)
- Icons:
  - Snack: Red chip 🍟 → pixel chip
  - Drink: Cyan juice box 🥤 → pixel juice
  - Candy: Pink candy 🍬 → pixel candy
  - Dairy: Blue milk carton 🥛 → pixel milk
  - Biscuit: Yellow cookie 🍪 → pixel cookie
  - Food: Green bento 🍱 → pixel bento
  - Other: Gray box 📦 → pixel box

**How to capture:**
1. Click "Badges" tab
2. Scroll to see all badges
3. Full page screenshot

**Save as:** `manual-badges-icons.png`

---

#### 4. Products Tab with Category Icons
**Location:** Click "Products" tab

**What to verify:**
- Each product card shows category icon
- Icons match category type
- Clean pixel art style

**How to capture:**
1. Click "Products" tab
2. If no products, scan a test barcode first
3. Screenshot showing product cards with icons

**Save as:** `manual-products-icons.png`

---

#### 5. Feed Pet Section (Static Icon)
**Location:** Main play page, "Feed Pet (Food Inventory)" section

**What to verify:**
- Apple/food icon is STATIC (no floating animation)
- Icon should not bounce or move

**How to capture:**
1. Scroll to "Feed Pet" section
2. Observe for 3-5 seconds to confirm no animation
3. Screenshot of the section

**Save as:** `manual-feed-pet-static.png`

---

## Quick Navigation Reference

### Tab Order (left to right):
1. Missions (default, shopping bag icon)
2. Login (flame icon)
3. Bounty (target/barcode icon)
4. Stats (chart icon)
5. Roadmap (map icon)
6. Badges (medal icon)
7. History (clock icon)
8. Products (package icon)

### Key Areas to Check:
- **Top bar:** Streak display with flame
- **Pet panel:** Scan-chan Jr. card
- **Feed Pet:** Food inventory section
- **Room Background:** Theme selection
- **Bottom tabs:** Navigation with icons

---

## Verification Checklist

After capturing all screenshots, verify:

### Icons Replaced
- [ ] 🔥 → PixelFlame (streak, login calendar)
- [ ] ⭐ → PixelStar (login calendar days 1-4)
- [ ] ❤️ → PixelHeart (login calendar days 5-6)
- [ ] 👑 → PixelCrown (login calendar day 7)
- [ ] ✅ → PixelCheck pink (login calendar completed days)
- [ ] 🎯 → PixelBarcode black (bounty hunt)
- [ ] 🍟 → PixelSnack (snack badge)
- [ ] 🥤 → PixelDrink (drink badge)
- [ ] 🍬 → PixelCandy (candy badge)
- [ ] 🥛 → PixelDairy (dairy badge)
- [ ] 🍪 → PixelBiscuit (biscuit badge)
- [ ] 🍱 → PixelFood (food badge)
- [ ] 📦 → PixelOther (other badge)

### Animations Removed
- [ ] Streak flame is static (no pulse)
- [ ] Feed Pet icon is static (no float)
- [ ] All pixel icons are static (no animations)

### Theme Changes
- [ ] Bounty hunt button is cyan (was purple)
- [ ] Bounty hunt card has cyan gradient
- [ ] Barcode icon is black (not blue)

### Dynamic Calendar
- [ ] Shows Day 1-7 by default
- [ ] Week number appears after week 1
- [ ] Pattern repeats: ⭐⭐⭐⭐💖💖👑
- [ ] Pink border on completed days

---

## Browser Developer Tools

If you need to inspect elements:

1. **Open DevTools:** Press F12
2. **Inspect icon:** Right-click icon → Inspect
3. **Check classes:** Look for `animate-pulse` or `animate-float` (should NOT exist)
4. **Verify colors:** Check computed styles for cyan colors

### Expected Classes (Good):
- `from-cyan-400 to-cyan-500` (bounty button)
- `bg-gradient-to-r` (gradient background)
- No animation classes

### Unexpected Classes (Bad):
- `animate-pulse` (should be removed)
- `animate-float` (should be removed)
- `from-purple-*` (old bounty theme)

---

## Troubleshooting

### Icon Not Loading
- Check browser console (F12) for errors
- Refresh page (Ctrl+R)
- Clear cache (Ctrl+Shift+R)

### Animation Still Present
- Hard refresh (Ctrl+Shift+R)
- Check if dev server restarted after code changes
- Verify file saved correctly

### Wrong Colors
- Check if you're on correct tab
- Verify mode (Guest vs Arashu)
- Check browser zoom level (should be 100%)

---

## After Manual Testing

Once all screenshots captured and verified:

1. Update `PIXEL_ICONS_QA_REPORT.md` with results
2. Check all items in verification checklist
3. Report any issues found
4. If all good, ready for production deploy!

---

**Good luck with manual testing! 🚀**
