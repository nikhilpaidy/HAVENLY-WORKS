export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  screenPadding: 20
};

export const radii = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 9999
};

export const typography = {
  display: {
    fontSize: 26,
    fontWeight: '800' as const,
    lineHeight: 32,
    letterSpacing: -0.5
  },
  title1: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
    letterSpacing: -0.3
  },
  title2: {
    fontSize: 18,
    fontWeight: '700' as const,
    lineHeight: 24
  },
  title3: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 20
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20
  },
  bodyBold: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20
  },
  subtext: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16
  },
  subtextMedium: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16
  },
  caption: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 14,
    letterSpacing: 0.2
  },
  badge: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const
  },
  tabular: {
    fontVariant: ['tabular-nums' as const],
    fontWeight: '700' as const
  }
};

export const shadows = {
  subtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  elevated: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5
  },
  glowPrimary: {
    shadowColor: '#00A859',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4
  }
};
