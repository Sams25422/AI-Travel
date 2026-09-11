/**
 * Atlas design tokens — warm travel journal aesthetic
 */

export const COLORS = {
  primary: '#1B4D3E',
  primaryDark: '#0F2F26',
  primaryLight: '#2D6B56',
  accent: '#C45C26',
  accentSoft: '#E8A87C',

  black: '#0B0F0E',
  white: '#FFFFFF',
  cream: '#F7F3EC',
  parchment: '#EFE8DC',

  gray50: '#F9F7F3',
  gray100: '#F0EBE3',
  gray200: '#DDD5C8',
  gray300: '#C4B9A8',
  gray400: '#9A8F7E',
  gray500: '#6F675A',
  gray600: '#524C42',
  gray700: '#3A362F',
  gray800: '#24211C',
  gray900: '#141210',

  success: '#2F7D4A',
  warning: '#C48A1A',
  error: '#B33A3A',
  info: '#3A6EA5',

  background: '#F7F3EC',
  backgroundSecondary: '#EFE8DC',
  surface: '#FFFFFF',
  overlay: 'rgba(11, 15, 14, 0.45)',

  textPrimary: '#141210',
  textSecondary: '#6F675A',
  textDisabled: '#C4B9A8',
  textInverse: '#FFFFFF',
  mapPath: '#1B4D3E',
  mapPin: '#C45C26',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  xxxl: 42,
} as const;

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
