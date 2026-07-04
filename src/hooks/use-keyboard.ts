import { useEffect } from 'react';

export const useKeyboard = (key: string, callback: (e: KeyboardEvent) => void, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === key) callback(e);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, enabled]);
};

export const useEscape = (callback: () => void, enabled = true) => {
  useKeyboard('Escape', callback, enabled);
};
