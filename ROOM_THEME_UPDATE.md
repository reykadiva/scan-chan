# 🏠 Room Background Theme System - Update

## ✨ Fitur Baru

Sistem room background sekarang sudah dilengkapi dengan **adaptive theming** yang membuat semua elemen UI otomatis menyesuaikan warna berdasarkan room yang dipilih!

## 🎨 Perubahan yang Diterapkan

### 1. **Adaptive Color System**
Setiap room background sekarang memiliki color palette yang sinkron:

- **🛋️ Cozy Bedroom** (Warm & Cozy)
  - Text: Amber tones
  - Hunger Bar: Orange-Amber gradient
  - Affection Bar: Rose-Pink gradient
  - Decorations: 🍂☕🏠
  - Unlock: Level 1 (Default)

- **🌸 Kawaii Garden** (Soft & Sweet)
  - Text: Pink tones
  - Hunger Bar: Rose-Pink gradient
  - Affection Bar: Fuchsia-Pink gradient
  - Decorations: 🌸🦋🌺
  - Unlock: Level 3

### 2. **Pixel Art Decorations**
Ditambahkan elemen dekoratif pixel art yang beranimasi:
- Emoji tematik di sudut-sudut card dengan bounce animation
- Mini pixel cats yang mengambang
- Efek sparkle saat hover di mascot utama

### 3. **Enhanced Visual Effects**
- Gradient progress bars dengan shadow
- Border colors yang match dengan theme
- Glow effects saat hover
- Drop shadows untuk better readability
- Smooth transitions antar room themes

## 📝 Technical Changes

### Files Modified:
1. `src/components/legacy/game/room-selector.tsx`
   - Added `RoomTheme` interface
   - Added `ROOM_THEMES` configuration (2 cute rooms only!)
   - Added `getRoomTheme()` helper function

2. `src/components/legacy/game/pet-panel.tsx`
   - Import `getRoomTheme` function
   - Apply dynamic theme colors to all UI elements
   - Added pixel art decorations
   - Enhanced visual effects

3. `src/stores/legacy/player-store.ts`
   - Updated room types to only include cozy & kawaii-garden

## 🎮 Cara Menggunakan

1. Buka Game Hub
2. Scroll ke bagian "🏠 Room Background"
3. Pilih antara Cozy Bedroom atau Kawaii Garden
4. Lihat semua warna dan dekorasi berubah otomatis!

## 🐱 Easter Eggs

- Mini pixel cats tersembunyi di background
- Emoji beranimasi bounce dengan timing berbeda
- Sparkle effect saat hover di pixel cat utama
- Progress bars dengan gradient smooth

---

**Created with 💖 by Kiro AI**
*Keep scanning with Scan-chan! 🎀*
