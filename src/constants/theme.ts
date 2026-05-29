/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#FBFAF6', // warm "ballot paper" off-white
    backgroundElement: '#F1EFE7',
    backgroundSelected: '#E6E3D7',
    textSecondary: '#5B6168',
    tint: '#1C5DBE', // primary brand blue
    tintText: '#FFFFFF',
    border: '#D9D5C7',
    card: '#FFFFFF',
    success: '#2E7D4F',
    warning: '#B7791F',
    danger: '#C0392B',
  },
  dark: {
    text: '#ECEDEE',
    background: '#0E1116',
    backgroundElement: '#1A1E25',
    backgroundSelected: '#262B33',
    textSecondary: '#9BA1A8',
    tint: '#4E8FE8',
    tintText: '#0E1116',
    border: '#2A2F37',
    card: '#161A20',
    success: '#4CAF7D',
    warning: '#D6A45A',
    danger: '#E0685A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Party brand colors (theme-independent). */
export const PartyColors: Record<string, string> = {
  Democratic: '#2166D6',
  Republican: '#D63B3B',
  Libertarian: '#E0A82E',
  Green: '#3AA655',
  Independent: '#7A5BB5',
  Nonpartisan: '#6B7280',
  Unknown: '#6B7280',
};

export function partyColor(party?: string | null): string {
  if (!party) return PartyColors.Unknown;
  const key = Object.keys(PartyColors).find((k) =>
    party.toLowerCase().includes(k.toLowerCase()),
  );
  return key ? PartyColors[key] : PartyColors.Unknown;
}

/** Match-quality colors by score (0-100). */
export function matchColor(score: number): string {
  if (score >= 70) return '#2E7D4F';
  if (score >= 45) return '#B7791F';
  return '#9AA0A6';
}

export const Radius = {
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
