import fs from 'fs';
import path from 'path';
import os from 'os';

export interface LocalUser {
  id: string;
  email: string;
  password?: string;
  nickname: string;
  avatar: string;
  mode: 'GUEST' | 'ARASHU';
  progress: {
    xp: number;
    level: number;
    streak: number;
    lastActiveDate?: string | null;
  };
  pet: {
    name: string;
    stage: 'KITTEN' | 'YOUNG_CAT' | 'ADULT_CAT' | 'WISE_CAT' | 'LEGENDARY_CAT';
    stats: {
      hunger: number;
      affection: number;
    };
  };
  settings: {
    theme: string;
    sound?: boolean;
    metadata: Record<string, any>;
  };
  foodInventory: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface LocalProduct {
  id: string;
  barcodeNumber: string;
  productName: string;
  brand?: string | null;
  category?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  creatorId?: string | null;
  foodValue?: number | null;
  rarity?: string | null;
  petReaction?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LocalScanHistory {
  id: string;
  userId?: string | null;
  barcodeNumber: string;
  productId?: string | null;
  deviceType?: string | null;
  xpAwarded?: number | null;
  scannedAt: string;
}

interface LocalDatabaseState {
  users: Record<string, LocalUser>;
  products: Record<string, LocalProduct>;
  scanHistory: LocalScanHistory[];
}

// Detect serverless environment (Vercel, AWS Lambda, or read-only production container)
const isServerless =
  Boolean(process.env.VERCEL) ||
  Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
  Boolean(process.env.LAMBDA_TASK_ROOT);

const DATA_DIR = isServerless
  ? path.join(os.tmpdir(), 'scan-chan-data')
  : path.join(process.cwd(), 'data');

const DB_FILE = path.join(DATA_DIR, 'local-store.json');

// In-memory state cache to guarantee 100% uptime even if filesystem is read-only
let memoryState: LocalDatabaseState = {
  users: {},
  products: {},
  scanHistory: [],
};
let isMemoryInitialized = false;

function ensureDbFile(): LocalDatabaseState {
  if (isMemoryInitialized && memoryState) {
    return memoryState;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      memoryState = JSON.parse(content);
      isMemoryInitialized = true;
      return memoryState;
    }

    // Try seed from local file if exists in process.cwd()/data/local-store.json (e.g. deployed with build)
    const seedFile = path.join(process.cwd(), 'data', 'local-store.json');
    if (seedFile !== DB_FILE && fs.existsSync(seedFile)) {
      try {
        const seedContent = fs.readFileSync(seedFile, 'utf-8');
        memoryState = JSON.parse(seedContent);
      } catch {
        // Ignore read error
      }
    }

    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(memoryState, null, 2), 'utf-8');
    } catch {
      // Ignore write failure in restricted environment
    }

    isMemoryInitialized = true;
    return memoryState;
  } catch (err) {
    console.warn('[localDb] Filesystem access restricted, operating in-memory:', (err as Error).message);
    isMemoryInitialized = true;
    return memoryState;
  }
}

function saveDb(state: LocalDatabaseState) {
  memoryState = state;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    // Soft warning, never crash the process or bubble up ENOENT / EROFS to Next.js routes
    console.warn('[localDb] Note: persistence to disk skipped in serverless context:', (err as Error).message);
  }
}

export const localDb = {
  getUser(id: string): LocalUser | null {
    const db = ensureDbFile();
    return db.users[id] || null;
  },

  findUserByEmail(email: string): LocalUser | null {
    const db = ensureDbFile();
    const cleanEmail = email.toLowerCase().trim();
    return Object.values(db.users).find((u) => u.email.toLowerCase() === cleanEmail) || null;
  },

  saveUser(user: LocalUser) {
    const db = ensureDbFile();
    db.users[user.id] = { ...user, updatedAt: new Date().toISOString() };
    saveDb(db);
    return db.users[user.id];
  },

  getProduct(barcode: string): LocalProduct | null {
    const db = ensureDbFile();
    return db.products[barcode] || null;
  },

  getAllProducts(filter?: { category?: string; search?: string; barcodes?: string[] }) {
    const db = ensureDbFile();
    let prods = Object.values(db.products);

    if (filter?.barcodes && filter.barcodes.length > 0) {
      prods = prods.filter((p) => filter.barcodes!.includes(p.barcodeNumber));
    }

    if (filter?.category) {
      prods = prods.filter((p) => p.category?.toLowerCase() === filter.category!.toLowerCase());
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      prods = prods.filter(
        (p) =>
          p.productName.toLowerCase().includes(q) ||
          p.barcodeNumber.includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q))
      );
    }

    return prods.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  saveProduct(prod: LocalProduct) {
    const db = ensureDbFile();
    db.products[prod.barcodeNumber] = { ...prod, updatedAt: new Date().toISOString() };
    saveDb(db);
    return db.products[prod.barcodeNumber];
  },

  deleteProduct(barcode: string) {
    const db = ensureDbFile();
    if (db.products[barcode]) {
      delete db.products[barcode];
      saveDb(db);
      return true;
    }
    return false;
  },

  addScanHistory(entry: LocalScanHistory) {
    const db = ensureDbFile();
    db.scanHistory.unshift(entry);
    saveDb(db);
  },

  countProductScans(barcode: string): number {
    const db = ensureDbFile();
    return db.scanHistory.filter((s) => s.barcodeNumber === barcode).length;
  },
};
