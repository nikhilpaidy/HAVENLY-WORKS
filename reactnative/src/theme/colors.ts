export interface ColorTheme {
  background: string;
  surface: string;
  card: string;
  cardBorder: string;
  inputBg: string;
  inputBorder: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryDark: string;
  primaryGlow: string;

  gold: string;
  goldLight: string;
  goldDark: string;
  goldGlow: string;

  brass: string;
  brassLight: string;
  brassDark: string;
  brassGlow: string;

  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  danger: string;
  dangerBg: string;
  info: string;
  infoBg: string;

  divider: string;
}

export const darkColors: ColorTheme = {
  background: '#0A0F1D',
  surface: '#0F172A',
  card: '#121A2D',
  cardBorder: '#1E293B',
  inputBg: '#131C31',
  inputBorder: '#27354F',

  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  primary: '#00A859',
  primaryHover: '#008C4A',
  primaryLight: '#34D399',
  primaryDark: '#0A3826',
  primaryGlow: 'rgba(0, 168, 89, 0.25)',

  gold: '#00A859',
  goldLight: '#34D399',
  goldDark: '#0A3826',
  goldGlow: 'rgba(0, 168, 89, 0.25)',

  brass: '#00C261',
  brassLight: '#6EE7B7',
  brassDark: '#0A3826',
  brassGlow: 'rgba(0, 194, 97, 0.2)',

  success: '#10B981',
  successBg: 'rgba(16, 185, 129, 0.12)',
  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.12)',
  danger: '#EF4444',
  dangerBg: 'rgba(239, 68, 68, 0.12)',
  info: '#00A859',
  infoBg: 'rgba(0, 168, 89, 0.12)',

  divider: '#1E293B'
};

export const lightColors: ColorTheme = {
  background: '#F7F9FC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardBorder: '#E2E8F0',
  inputBg: '#F1F5F9',
  inputBorder: '#CBD5E1',

  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',

  primary: '#00A859',
  primaryHover: '#008C4A',
  primaryLight: '#34D399',
  primaryDark: '#0A3826',
  primaryGlow: 'rgba(0, 168, 89, 0.15)',

  gold: '#00A859',
  goldLight: '#34D399',
  goldDark: '#0A3826',
  goldGlow: 'rgba(0, 168, 89, 0.18)',

  brass: '#00C261',
  brassLight: '#6EE7B7',
  brassDark: '#0A3826',
  brassGlow: 'rgba(0, 194, 97, 0.15)',

  success: '#10B981',
  successBg: '#ECFDF5',
  warning: '#F59E0B',
  warningBg: '#FFFBEB',
  danger: '#EF4444',
  dangerBg: '#FEF2F2',
  info: '#00A859',
  infoBg: 'rgba(0, 168, 89, 0.1)',

  divider: '#E2E8F0'
};

export const colors = darkColors;
