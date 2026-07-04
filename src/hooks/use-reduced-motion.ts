import { useSettingsStore } from '@/stores/settings-store';

export const useReducedMotion = () => {
  const reducedMotion = useSettingsStore((state) => state.reducedMotion);
  
  if (typeof window === 'undefined') return false;
  
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  return reducedMotion || prefersReduced;
};
