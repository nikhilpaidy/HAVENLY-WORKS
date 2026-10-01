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
  background: '#050814',
  surface: '#080E1E',
  card: '#0B1120',
  cardBorder: '#1E293B',
  inputBg: '#0F172A',
  inputBorder: '#334155',

  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  primary: '#6366F1',
  primaryHover: '#4F46E5',
  primaryLight: '#818CF8',
  primaryGlow: 'rgba(99, 102, 241, 0.25)',

  gold: '#D4AF37',
  goldLight: '#E6D1A8',
  goldDark: '#91711B',
  goldGlow: 'rgba(212, 175, 55, 0.25)',

  brass: '#D4AF37',
  brassLight: '#E6D1A8',
  brassDark: '#91711B',
  brassGlow: 'rgba(212, 175, 55, 0.2)',

  success: '#10B981',
  successBg: 'rgba(16, 185, 129, 0.12)',
  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.12)',
  danger: '#EF4444',
  dangerBg: 'rgba(239, 68, 68, 0.12)',
  info: '#6366F1',
  infoBg: 'rgba(99, 102, 241, 0.12)',

  divider: '#1E293B'
};

export const lightColors: ColorTheme = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardBorder: '#E2E8F0',
  inputBg: '#F1F5F9',
  inputBorder: '#CBD5E1',

  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',

  primary: '#4F46E5',
  primaryHover: '#4338CA',
  primaryLight: '#6366F1',
  primaryGlow: 'rgba(79, 70, 229, 0.15)',

  gold: '#B8860B',
  goldLight: '#D4AF37',
  goldDark: '#785408',
  goldGlow: 'rgba(184, 134, 11, 0.18)',

  brass: '#B8860B',
  brassLight: '#D4AF37',
  brassDark: '#785408',
  brassGlow: 'rgba(184, 134, 11, 0.18)',

  success: '#059669',
  successBg: 'rgba(5, 150, 105, 0.12)',
  warning: '#D97706',
  warningBg: 'rgba(217, 119, 6, 0.12)',
  danger: '#DC2626',
  dangerBg: 'rgba(220, 38, 38, 0.12)',
  info: '#2563EB',
  infoBg: 'rgba(37, 99, 235, 0.12)',

  divider: '#E2E8F0'
};

export const colors = darkColors;
