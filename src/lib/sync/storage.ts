const STORAGE_VERSION = 1;
const PREFIX = 'scan-chan';

interface StorageEntry<T> {
  version: number;
  data: T;
  timestamp: number;
}

export const createVersionedStorage = <T>(key: string) => ({
  save: (data: T, mode: 'guest' | 'arashu') => {
    const storageKey = `${PREFIX}-${mode}-${key}`;
    const entry: StorageEntry<T> = {
      version: STORAGE_VERSION,
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(storageKey, JSON.stringify(entry));
  },
  
  load: (mode: 'guest' | 'arashu'): T | null => {
    const storageKey = `${PREFIX}-${mode}-${key}`;
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    
    try {
      const entry = JSON.parse(raw) as StorageEntry<T>;
      if (entry.version !== STORAGE_VERSION) return null;
      return entry.data;
    } catch {
      return null;
    }
  },
  
  clear: (mode: 'guest' | 'arashu') => {
    const storageKey = `${PREFIX}-${mode}-${key}`;
    localStorage.removeItem(storageKey);
  },
});
