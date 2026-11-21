export type ThemeId = 'pink' | 'sage' | 'butter' | 'blue' | 'lavender' | 'terracotta';

export interface ThemeColors {
  primary: string;       // Primary Panel
  surfaceInner: string;  // Secondary/Inner Surface
  surfaceCard: string;   // Card/Button Surface
  border: string;        // Border & Dark Text
  accent: string;        // Accent Fill
  shadow: string;        // Hard Pixel Shadow
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  subtitle: string;
  colors: ThemeColors;
}

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  pink: {
    id: 'pink',
    name: 'Retro Pink & White',
    subtitle: 'Classic Bubblegum Arcade',
    colors: {
      primary: '#d65a7a',
      surfaceInner: '#fff0f5',
      surfaceCard: '#ffffff',
      border: '#5c162e',
      accent: '#ff7597',
      shadow: '#5c162e',
    },
  },
  sage: {
    id: 'sage',
    name: 'Sage Green & Cream',
    subtitle: 'Peaceful Forest Meadow',
    colors: {
      primary: '#7a9a78',
      surfaceInner: '#f4f7f0',
      surfaceCard: '#fcfdf9',
      border: '#2d422c',
      accent: '#9ab897',
      shadow: '#2d422c',
    },
  },
  butter: {
    id: 'butter',
    name: 'Butter Yellow & Vanilla',
    subtitle: 'Warm Bakery Pastry',
    colors: {
      primary: '#e6c86e',
      surfaceInner: '#fdf9eb',
      surfaceCard: '#fffdf5',
      border: '#594616',
      accent: '#f2d885',
      shadow: '#594616',
    },
  },
  blue: {
    id: 'blue',
    name: 'Powder Blue & Cloud',
    subtitle: 'Breezy Sky Island',
    colors: {
      primary: '#7ba7cc',
      surfaceInner: '#f0f6fc',
      surfaceCard: '#ffffff',
      border: '#1f3f5c',
      accent: '#9ec2e0',
      shadow: '#1f3f5c',
    },
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender & Lilac',
    subtitle: 'Dreamy Twilight Castle',
    colors: {
      primary: '#9d8ec7',
      surfaceInner: '#f4f1fa',
      surfaceCard: '#fcfaff',
      border: '#362859',
      accent: '#b8ace0',
      shadow: '#362859',
    },
  },
  terracotta: {
    id: 'terracotta',
    name: 'Terracotta & Beige',
    subtitle: 'Warm Rustic Clay',
    colors: {
      primary: '#c48463',
      surfaceInner: '#f9f2ec',
      surfaceCard: '#fffaf5',
      border: '#522b18',
      accent: '#d99f80',
      shadow: '#522b18',
    },
  },
};

export const THEME_LIST: ThemeDefinition[] = [
  THEMES.pink,
  THEMES.sage,
  THEMES.butter,
  THEMES.blue,
  THEMES.lavender,
  THEMES.terracotta,
];

export function normalizeThemeId(theme?: string | null): ThemeId {
  if (!theme) return 'pink';
  const clean = theme.toLowerCase().trim();
  if (clean === 'default' || clean === 'pink') return 'pink';
  if (clean in THEMES) return clean as ThemeId;
  return 'pink';
}
