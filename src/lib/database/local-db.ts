import fs from 'fs';
import path from 'path';

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

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'local-store.json');

function ensureDbFile(): LocalDatabaseState {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialState: LocalDatabaseState = {
      users: {},
      products: {},
      scanHistory: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialState, null, 2), 'utf-8');
    return initialState;
  }

  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { users: {}, products: {}, scanHistory: [] };
  }
}

function saveDb(state: LocalDatabaseState) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save local database:', err);
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
