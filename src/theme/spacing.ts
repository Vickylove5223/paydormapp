export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const Radius = {
  chip: 99,
  button: 99,
  cardSm: 16,
  card: 20,
  sheet: 24,
  avatar: 999,
} as const;

export const Layout = {
  screenPadding: 16,
  cardPadding: 14,
  bottomNavHeight: 64,
  bottomNavMargin: 8,
  bottomNavRadius: 22,
  contentBottomPadding: 76,
  minTouchTarget: 44,
} as const;

export const Shadow = {
  nav: {
    shadowColor: '#0C1822',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    shadowColor: '#0C1822',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sticker: {
    shadowColor: '#0C1822',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
} as const;
