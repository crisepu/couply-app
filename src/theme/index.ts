import { MD3LightTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

export const Colors = {
  background: '#FAFAF8',
  primary: '#4A7C59',
  accent: '#C4714A',
  text: '#1A1A1A',
  textMuted: '#6B7280',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  error: '#C4714A',
  white: '#FFFFFF',
} as const;

export const FontFamily = {
  display: 'DMSerifDisplay_400Regular',
  bodyRegular: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 22,
  '2xl': 28,
  '3xl': 36,
  '4xl': 48,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 12,
  lg: 20,
  full: 999,
} as const;

const fontConfig = configureFonts({
  config: {
    fontFamily: FontFamily.bodyRegular,
  },
});

export const paperTheme: MD3Theme = {
  ...MD3LightTheme,
  fonts: fontConfig,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    surface: Colors.surface,
    error: Colors.error,
    onPrimary: Colors.white,
    onBackground: Colors.text,
    onSurface: Colors.text,
    outline: Colors.border,
  },
};
