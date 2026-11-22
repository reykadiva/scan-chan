# DEEP SYSTEM AUDIT REPORT: SCAN-CHAN BUG & ARCHITECTURE AUDIT

> **Status:** READ-ONLY SYSTEM AUDIT  
> **Tanggal:** 22 November 2026  
> **Target:** Codebase Scan-chan (`src/`, `prisma/schema.prisma`)  

---

## DAFTAR ISI
1. [Avatar Kucing Terkunci (Evolusi Stage Tidak Mengubah Sprite)](#1-avatar-kucing-terkunci-evolusi-stage-tidak-mengubah-sprite)
2. [Bug Rollback Feeding di PC (Makanan & Vitals Mental Kembali)](#2-bug-rollback-feeding-di-pc-makanan--vitals-mental-kembali)
3. [Scanner Random Macet / Freeze Saat Klik "Scan Again / Scan Next"](#3-scanner-random-macet--freeze-saat-klik-scan-again--scan-next)
4. [Data Terlambat Muncul di Lobby Setelah "Press to Start"](#4-data-terlambat-muncul-di-lobby-setelah-press-to-start)
5. [Pemetaan Seluruh Jejak OpenFoodFacts & Rencana Reset Total Katalog](#5-pemetaan-seluruh-jejak-openfoodfacts--rencana-reset-total-katalog)
6. [Audit Isolasi Guest Mode (Ephemeral in RAM)](#6-audit-isolasi-guest-mode-ephemeral-in-ram)
7. [Audit Form Registrasi Produk & UX/UI Guide Modal](#7-audit-form-registrasi-produk--uxui-guide-modal)

---

## 1. Avatar Kucing Terkunci (Evolusi Stage Tidak Mengubah Sprite)

### A. Lokasi File & Nomor Baris
- **`src/components/views/lobby-view.tsx`**: Baris 43–49 dan Baris 597–598
- **`src/components/game/pet-panel.tsx`**: Baris 20–35 dan Baris 249
- **`src/stores/player-store.ts`**: Baris 155, 1087, dan 1199
- **`src/components/game/pixel-cat.tsx`**: Baris 6–14 dan Baris 45–54

### B. Alur Kode Asli & Temuan Masalah
Di `lobby-view.tsx`:
```typescript
// Baris 43-49
const STAGE_AVATARS: Record<string, CatVariantId> = {
  KITTEN: 'calico',
  YOUNG_CAT: 'tabby',
  ADULT_CAT: 'black',
  WISE_CAT: 'cyan',
  LEGENDARY_CAT: 'arashu-smiling',
};

// Baris 597-598
const effectiveStage = getPetStageFromLevel(displayLevel);
const catVariant = (avatar as CatVariantId) || STAGE_AVATARS[effectiveStage] || 'calico';
```
Dan di `pet-panel.tsx`:
```typescript
// Baris 249
const catVariant = (avatar as CatVariantId) || STAGE_AVATARS[petStage] || 'calico';
```

### C. Root Cause (Akar Penyebab)
1. **Operator Logika `||` Mengunci Evaluasi:**
   Variabel `avatar` diinisialisasi dengan nilai `'calico'` (di `player-store.ts` Baris 155 dan default database `prisma.user.create` Baris 245). Nilai `'calico'` bertipe string non-empty yang bernilai **truthy**.
2. Akibatnya, ekspresi `(avatar as CatVariantId) || STAGE_AVATARS[effectiveStage]` selalu mengevaluasi `avatar` (`'calico'`) terlebih dahulu. Bagian `STAGE_AVATARS[effectiveStage]` **tidak pernah dieksekusi sama sekali**, berapapun level dan stage pemain (`YOUNG_CAT`, `ADULT_CAT`, `WISE_CAT`, atau `LEGENDARY_CAT`).
3. Label teks di UI membaca `effectiveStage` / `displayStage` secara langsung sehingga teksnya berubah menjadi *"Young Cat"*, namun sprite visual PixelCat tetap menampilkan varian `'calico'`.

### D. Rekomendasi Solusi
- Prioritaskan stage evolusi di atas base avatar, atau tentukan peran `avatar`: jika `avatar` adalah breed dasar pemain (`calico`, `gray`, `tabby`), gunakan mapping evolusi breed, atau gunakan stage mapping langsung:
  ```typescript
  const catVariant = STAGE_AVATARS[effectiveStage] || (avatar as CatVariantId) || 'calico';
  ```
  Atau jika pemain boleh memilih skin kosmetik di Settings, hanya override jika pemain secara eksplisit mengaktifkan kostum/skin tertentu.

---

## 2. Bug Rollback Feeding di PC (Makanan & Vitals Mental Kembali)

### A. Lokasi File & Nomor Baris
- **`src/stores/player-store.ts`**: Baris 482–574 (Optimistic Update), Baris 584–591 (Rollback Handler), Baris 1000–1058 (Anti-Rollback Guard pada `loadProfile`), dan Baris 1231–1244 (Auto-Sync Subscriber).
- **`src/services/player-service.ts`**: Baris 592–605 (`executeFeedAction` verifikasi stok database).
- **`src/app/api/actions/feed/route.ts`**: Baris 23–50.

### B. Alur Kode Asli & Temuan Masalah
1. Di `player-store.ts`, saat pemain menekan tombol **Feed**, `feedPet` langsung melakukan pembaruan optimistik di memori Zustand:
   - `petHunger` bertambah, `xp` bertambah, `foodInventory[cleanBarcode]` dikurangi 1.
   - Mengambil `previousSnapshot` untuk persiapan rollback jika server menolak.
2. `feedPet` kemudian memanggil HTTP POST ke `/api/actions/feed`:
   ```typescript
   // src/stores/player-store.ts: Baris 585-591
   if (!res.ok) {
     if (_pendingFeedCount <= 1) {
       set(previousSnapshot); // <--- INI PENYEBAB VISUAL ROLLBACK!
     }
     return;
   }
   ```
3. Di sisi server (`src/services/player-service.ts`: Baris 597–605):
   ```typescript
   const foodItem = userInventory?.items.find(
     (item) => item.type === 'FOOD' && item.itemKey === cleanBarcode
   );

   if (!foodItem || foodItem.quantity <= 0) {
     const err = new Error('Food item is not available in inventory');
     (err as any).statusCode = 400;
     throw err;
   }
   ```

### C. Root Cause (Akar Penyebab)
Terdapat 3 faktor yang menyebabkan visual rollback:
1. **Desinkronisasi Inventaris DB vs Zustand (`Food item is not available in inventory`):**
   - Jika pemain memindai makanan saat status koneksi tidak stabil, atau produk didaftarkan di client sebelum sinkronisasi server selesai, item makanan tercatat di `localStorage` Zustand client (`foodInventory`), tetapi **belum ada record `InventoryItem` di database PostgreSQL**.
   - Saat tombol Feed ditekan, client optimistik memotong item dan menambah hunger/XP. Namun server menolak dengan HTTP 400 karena `foodItem` tidak ditemukan di tabel `inventory_items`. Client menerima `!res.ok` lalu mengeksekusi `set(previousSnapshot)`, membatalkan feeding beberapa detik kemudian.
2. **Race Condition dengan Auto-Sync Subscriber & Debounce:**
   - Pembaruan optimistik `feedPet` mengubah `lastLocalMutationAt`.
   - Subscriber di baris 1235–1242 mendeteksi perubahan ini dan menjadwalkan `saveProfileToServer()` dalam 1000ms.
   - Endpoint `POST /api/profile` yang dipanggil `saveProfileToServer` **tidak menyertakan `foodInventory`** (hanya menyimpan metadata tema/nama pet).
3. **Celah pada `loadProfile` Guard (`finalXp = serverXp`):**
   - Di `player-store.ts` Baris 1057–1058, `finalHunger` dan `finalFoodInventory` diproteksi oleh `protectLocalVitals`, **tetapi `finalXp` selalu mengambil `serverXp`**.
   - Jika `loadProfile()` terpanggil di latar belakang sebelum transaksi feed di server tuntas dicatat, `finalXp` ditimpa kembali oleh nilai lama dari database.

### D. Rekomendasi Solusi
- Di `player-service.ts` `executeFeedAction`: Berikan toleransi rekonsiliasi jika item tercatat di client tapi record inventaris database tertinggal (auto-upsert atau verifikasi riwayat scan).
- Tampilkan error toast informatif jika server mengembalikan HTTP 400 alih-alih rollback diam-diam (`toast.error('Item out of sync with cloud inventory')`).
- Proteksi `finalXp` di `loadProfile()` dengan `protectLocalVitals` (`finalXp = protectLocalVitals ? Math.max(serverXp, afterFetchState.xp) : serverXp`).

---

## 3. Scanner Random Macet / Freeze Saat Klik "Scan Again / Scan Next"

### A. Lokasi File & Nomor Baris
- **`src/hooks/use-barcode-scanner.ts`**: Baris 66–67, Baris 243–266 (`resumeCamera`), Baris 271–342 (`scanFrame` loop), dan Baris 346–352.
- **`src/components/views/scanner-view.tsx`**: Baris 97–104 (`handleBarcode`), Baris 248–252 (`useBarcodeScanner` hook call), dan Baris 254–262 (`resetScanner`).

### B. Alur Kode Asli & Temuan Masalah
Di `use-barcode-scanner.ts`:
```typescript
// Baris 271-290
let isProcessing = false;

const scanFrame = async (timestamp: number) => {
  if (!isMountedRef.current) return;
  if (!pausedRef.current && timestamp - lastScanTime >= scanIntervalMs) {
    if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && !isProcessing) {
      isProcessing = true; // <--- KUNCI LOCK
      // ...
      if (nativeDetectorRef.current) {
        const barcodes = await nativeDetectorRef.current.detect(video); // BISA HANG / REJECT
      }
      isProcessing = false;
      
      if (detectedBarcode && !pausedRef.current) {
        setIsScanning(false);
        onScanRef.current(detectedBarcode); // BISA THROW EXCEPTION
      }
    }
  }
  animIdRef.current = requestAnimationFrame((ts) => scanFrameRef.current(ts));
};
```
Dan di `resumeCamera`:
```typescript
// Baris 262-265
if (!isLoopActiveRef.current && isMountedRef.current) {
  isLoopActiveRef.current = true;
  animIdRef.current = requestAnimationFrame((ts) => scanFrameRef.current(ts));
}
```

### C. Root Cause (Akar Penyebab)
1. **`isLoopActiveRef.current` Menipu `resumeCamera()`:**
   - Variabel `isLoopActiveRef.current` di-set menjadi `true` saat inisialisasi awal dan **tidak pernah di-set kembali ke `false`** kecuali komponen di-unmount.
   - Jika loop `requestAnimationFrame` terhenti (misalnya akibat unhandled exception pada `onScanRef` atau browser menangguhkan frame video saat bottom sheet naik), fungsi `resumeCamera()` mengira loop masih aktif (`if (!isLoopActiveRef.current)` bernilai false) sehingga **tidak pernah menjadwalkan ulang `requestAnimationFrame`**.
2. **Deadlock / Hanging pada `isProcessing`:**
   - `isProcessing` adalah variabel lokal penutup (*closure variable*) di dalam `useEffect`.
   - Jika `nativeDetectorRef.current.detect(video)` mengalami promise stalling pada browser Chromium saat resolusi video berubah atau frame tertahan, `isProcessing` terkunci pada status `true`.
   - `resumeCamera()` tidak memiliki akses untuk mereset `isProcessing = false`. Akibatnya, `!isProcessing` selalu false dan pemindaian frame mati permanen sampai user keluar dari Scanner.
3. **Stale Closure pada `pausedRef`:**
   - Di `scanner-view.tsx`, `resetScanner` memanggil `setPaused(false)` lalu `resume()`.
   - Namun `pausedRef.current` di hook baru terupdate setelah React render cycle berikutnya berjalan. Pada frame pertama saat kamera bangun, `pausedRef.current` masih terbaca `true`.

### D. Rekomendasi Solusi
- Pindahkan `isProcessing` ke dalam `useRef` (`isProcessingRef.current = false`) dan reset secara eksplisit di dalam `resumeCamera()`.
- Bungkus pemanggilan `onScanRef.current(detectedBarcode)` dalam blok `try...catch` agar error di sisi consumer tidak mematikan rantai `requestAnimationFrame`.
- Pastikan `resumeCamera()` membatalkan `cancelAnimationFrame(animIdRef.current)` lama dan selalu memulai tick baru tanpa terhalang `isLoopActiveRef`.

---

## 4. Data Terlambat Muncul di Lobby Setelah "Press to Start"

### A. Lokasi File & Nomor Baris
- **`src/app/page.tsx`**: Baris 48–50 dan Baris 120–137 (`isWaitingHunterProfile`).
- **`src/components/views/title-screen-view.tsx`**: Baris 120–134 (`handlePressToStart`).
- **`src/stores/player-store.ts`**: Baris 1184–1193 (`persist` hydration) dan Baris 899–913 (`loadProfile`).

### B. Alur Kode Asli & Temuan Masalah
Di `title-screen-view.tsx`:
```typescript
// Baris 123-129
if (data.authenticated && data.user) {
  setMode(GameMode.ARASHU);
  const store = usePlayerStore.getState();
  if (!store.isProfileLoaded || store.loadedUserId !== data.user.id) {
    loadProfile(data.user.id).catch(() => {}); // <--- FIRE AND FORGET (TANPA AWAIT!)
  }
  setActiveView('LOBBY'); // <--- LANGSUNG MASUK KE LOBBY SEKETIKA
}
```
Dan di `src/app/page.tsx`:
```typescript
// Baris 120-137
if (activeView === 'LOBBY') {
  const isWaitingHunterProfile =
    mode === GameMode.ARASHU && (!isProfileLoaded || isLoading);

  if (isWaitingHunterProfile) {
    return <SyncLoadingGate message="SYNCING WITH CLOUD..." error={error} onRetry={() => loadProfile()} />;
  }

  return <LobbyView />;
}
```

### C. Root Cause (Akar Penyebab)
1. **`loadProfile` Dipanggil Secara Fire-and-Forget:**
   - Di `handlePressToStart`, pemanggilan `loadProfile(data.user.id)` tidak di-`await`.
   - Aplikasi langsung mengeksekusi `setActiveView('LOBBY')` pada baris berikutnya.
2. **False Negative pada Gate `isWaitingHunterProfile` Akibat Zustand Persist:**
   - Zustand me-restore state sesi sebelumnya dari `localStorage`.
   - Di `localStorage`, field `isProfileLoaded` sudah bernilai `true` dari sesi lalu, sementara `isLoading` awalnya masih bernilai `false` (karena request fetch jaringan baru saja dimulai).
   - Akibatnya: `(!isProfileLoaded || isLoading)` bernilai `(!true || false) = false`!
   - `page.tsx` menganggap profil sudah siap dan **langsung merender `LobbyView`**.
3. **Hasil di Layar:**
   - User melihat Lobby dalam keadaan inventaris kosong (atau data cache lokal basi).
   - Setelah 500–1500ms, request `/api/profile` di background selesai dan memanggil `set({ foodInventory: d.foodInventory })`.
   - User melihat item di Food Bag "pop-up" terlambat / berkedip masuk setelah berada di dalam Lobby.

### D. Rekomendasi Solusi
- `handlePressToStart` wajib menunggu proses hidrasi:
  ```typescript
  if (!store.isProfileLoaded || store.loadedUserId !== data.user.id) {
    await loadProfile(data.user.id);
  }
  setActiveView('LOBBY');
  ```
- Di `player-store.ts`, tandai `isProfileLoaded: false` saat inisialisasi awal atau saat user ID berbeda sebelum network request selesai.

---

## 5. Pemetaan Seluruh Jejak OpenFoodFacts & Rencana Reset Total Katalog

### A. Daftar Lengkap File & Kode Terkait OpenFoodFacts

| File | Baris | Kode / Referensi | Keterangan |
| :--- | :--- | :--- | :--- |
| `src/services/scanner-service.ts` | 8–110 | `mapOpenFoodFactsCategory()` | Fungsi pemetaan kategori dari string OpenFoodFacts |
| `src/services/scanner-service.ts` | 113–115 | `negativeCache = new Map<string, number>()` | In-memory negative cache untuk barcode 404 OFF |
| `src/services/scanner-service.ts` | 139–206 | `fetch('https://world.openfoodfacts.org/api/v0/product/...')` | External HTTP API request fallback ke OFF & auto-register |
| `src/services/scanner-service.ts` | 174 | `creatorId: 'openfoodfacts'` | Penanda kepemilikan produk dari OpenFoodFacts |
| `src/services/product-service.ts` | 172 | `existing.creatorId !== 'openfoodfacts'` | Izin edit produk sistem OFF |
| `src/services/product-service.ts` | 205 | `existingLocal.creatorId !== 'openfoodfacts'` | Izin edit produk sistem OFF (local DB) |
| `src/services/product-service.ts` | 224 | `existing.creatorId !== 'openfoodfacts'` | Izin hapus produk sistem OFF |
| `src/services/product-service.ts` | 247 | `existingLocal.creatorId !== 'openfoodfacts'` | Izin hapus produk sistem OFF (local DB) |
| `src/components/views/scanner-view.tsx` | 372 | `Checking database & OpenFoodFacts` | String teks UI saat loading scan |

### B. Prosedur Aman Reset & Pembersihan Total Katalog (Clean Slate)

#### 1. Pembersihan Kode Eksternal API:
- Hapus blok fallback OpenFoodFacts di `src/services/scanner-service.ts`. Jika produk tidak ditemukan di database internal (`!product`), langsung kembalikan status `{ found: false, product: null, isNewProduct: false }`.
- Ubah string loading di `scanner-view.tsx` menjadi `"Checking database catalog..."`.
- Bersihkan filter `creatorId !== 'openfoodfacts'` di `product-service.ts`.

#### 2. Integritas Relasi Foreign Key Database:
Di `prisma/schema.prisma`:
```prisma
model ScanHistory {
  productId String? @map("product_id")
  product Product? @relation(fields: [productId], references: [id], onDelete: SetNull)
}
```
- **Aman Dihapus:** Relasi antara `products` dan `scan_logs` menggunakan `onDelete: SetNull`.
- Tabel `inventory_items` menggunakan field `itemKey: String` (kode barcode langsung), **bukan foreign key** ke `products.id`.
- Oleh karena itu, mengosongkan tabel `products` **tidak akan merusak `users` maupun riwayat XP pemain**.

#### 3. Perintah SQL Pembersihan Bersih:
```sql
-- 1. Putuskan referensi produk pada scan history tanpa menghapus riwayat scan pemain
UPDATE scan_logs SET product_id = NULL;

-- 2. Bersihkan seluruh produk katalog lama
DELETE FROM products;

-- 3. Reset cache local-db (jika menggunakan fallback file json)
-- Kosongkan objek "products": {} pada local-db.json
```
Di client-side: Kosongkan cache `useProductStore.getState().products = {}` dan hapus key localStorage `scan-chan-products-storage`.

---

## 6. Audit Isolasi Guest Mode (Ephemeral in RAM)

### A. Titik Kebocoran Data Guest Mode Saat Ini

1. **Zustand `persist` (`localStorage`):**
   - File: `src/stores/player-store.ts` (Baris 1195–1226).
   - State `foodInventory`, `petHunger`, `xp`, `streak`, `registeredBarcodes` disimpan ke `localStorage` di bawah key `'scan-chan-player-state'` tanpa memeriksa apakah user berstatus Guest atau Hunter.
   - Saat browser di-refresh, data Guest tidak terhapus dan terbaca kembali.
2. **Product Store `persist` (`localStorage`):**
   - File: `src/stores/product-store.ts` (Baris 25).
   - Disimpan di bawah key `'scan-chan-products-storage'`.
3. **Cookie `scan_mode`:**
   - File: `src/app/api/auth/guest/route.ts` (Baris 12–17).
   - Menyetel cookie `scan_mode=guest` dengan masa berlaku **30 hari** (`maxAge: 60 * 60 * 24 * 30`).
4. **Pencatatan Database oleh Aksi Guest:**
   - File: `src/app/api/scan/route.ts` (Baris 27–35): Guest memanggil `/api/scan` dengan `userId = null`.
   - File: `src/services/scanner-service.ts` (Baris 218): Menyimpan data scan ke tabel `scan_logs` database dengan `userId: null`.
   - File: `src/app/api/products/route.ts` (Baris 55–65): Guest yang mendaftarkan produk baru menyimpan record langsung ke tabel `products` dengan `creatorId: 'guest'`.

### B. Langkah Isolasi Total (100% Ephemeral in RAM)
1. **Putuskan Penyimpanan LocalStorage untuk Guest:**
   - Di `player-store.ts`, ubah `partialize`: jika `state.mode === GameMode.GUEST`, jangan simpan apa pun ke `localStorage` (kembalikan objek kosong `{}`), atau gunakan sessionStorage / RAM murni.
2. **Hapus Cookie 30 Hari:**
   - Ubah `POST /api/auth/guest` agar tidak menyetel cookie berumur 30 hari, melainkan session-only cookie (tanpa `maxAge`), atau cukup andalkan state runtime.
3. **Blokir Penulisan Database untuk Unauthenticated/Guest:**
   - Pada `processBarcodeScan`: Jika `userId` bernilai `null` (Guest), lewati penulisan `prisma.scanHistory.create`.
   - Pada saat Guest keluar (*Exit to Title Screen* atau refresh), panggil `resetPlayer()` untuk membersihkan seluruh state RAM.

---

## 7. Audit Form Registrasi Produk & UX/UI Guide Modal

### A. Audit `register-product-modal.tsx`

#### 1. Validasi Field Wajib Saat Ini
- **Barcode Number:** Memiliki atribut HTML `required` (Baris 267).
- **Product Name:** Memiliki atribut HTML `required` (Baris 283).
- **Category:** **TIDAK MEMILIKI `required`** (Baris 308–317).
  - Pilihan awal dropdown adalah `<option value="">Select...</option>`.
  - Jika pemain tidak memilih kategori, produk tersimpan dengan `category = null`.
  - Dampak fatal: Karena kategori bernilai `null`, `isConsumableCategory(null)` bernilai `false`. Produk makanan yang baru didaftarkan **tidak akan masuk ke Food Bag**, mengecewakan pemain.
  - **Solusi:** Tambahkan atribut `required` pada `<select>` dan validasi eksplisit `if (!form.category) throw new Error('Please select a product category')`.

#### 2. Struktur Input Brand
- Field Brand saat ini berupa input teks bebas polos (`<input type="text" placeholder="e.g. Indofood">`) tanpa normalisasi.
- Tidak ada validasi konsistensi huruf (kapital vs kecil) maupun autocomplete daftar brand terdaftar, sehingga berpotensi menciptakan duplikasi brand yang terpecah-pecah di katalog.

---

### B. Audit Tampilan Guide Modal (`lobby-view.tsx`)

#### 1. Masalah Tampilan Desktop
- File: `src/components/views/lobby-view.tsx` Baris 1227–1340.
- Seluruh konten (5 section: Scan & Collect, Hunger & Feeding, Happiness & Petting, Evolution & Stats, Hunter vs Guest) diletakkan dalam satu kontainer vertikal tunggal (`<div className="space-y-4">`) di dalam modal `max-h-[85dvh]`.
- Pada layar monitor desktop yang lebar, teks membentang terlalu panjang (*excessive line length*), hierarki poin visual kurang menonjol, dan mengharuskan user melakukan scrolling vertikal yang jauh, alih-alih memanfaatkan layout grid 2 kolom atau sistem kartu/tab yang modular.

#### 2. Masalah Tampilan Mobile
- Di layar smartphone (lebar viewport < 400px):
  - Padding inner box `p-3.5` dikombinasikan dengan bullet list margin `pl-4` memakan area pandang horizontal.
  - Elemen pill badge kategori (Dairy, Instant, Snack, Candy, Drink) membungkus (*wrap*) secara tidak beraturan dan berdempetan dengan teks panduan.
  - Baris item level evolusi bertumpuk rapat tanpa jarak vertikal (*gap*) yang proporsional.
  - Modal terkunci di `max-h-[85dvh]` dengan padding bawah `pb-safe pb-8`, membuat area baca terasa sempit dan claustrophobic.

---

## RINGKASAN REKOMENDASI PRIORITAS

| No | Komponen | Prioritas | Estimasi Kompleksitas | Dampak Perbaikan |
| :---: | :--- | :---: | :---: | :--- |
| **1** | **Fix Avatar Stage Evolution** | **Tinggi** | Rendah (1 baris logika) | Sprite kucing langsung berevolusi sesuai level pemain |
| **2** | **Fix Scanner Freezing** | **Kritis** | Sedang | Tombol "Scan Next/Again" tidak akan pernah macet lagi |
| **3** | **Fix Data Delay di Lobby** | **Tinggi** | Rendah | Food bag & status kucing instan muncul saat Start |
| **4** | **Fix Feed Rollback Race Condition** | **Tinggi** | Sedang | Makanan tidak mental kembali saat dimakan di PC |
| **5** | **Hapus OpenFoodFacts & Reset DB** | **Tinggi** | Sedang | 100% katalog mandiri & bersih dari data luar |
| **6** | **Guest Mode Ephemeral RAM** | **Sedang** | Sedang | Data guest tidak bocor ke cloud atau penyimpanan permanen |
| **7** | **Fix Category Required & Guide UI** | **Sedang** | Rendah | Produk baru selalu masuk tas, panduan rapi & nyaman dibaca |
