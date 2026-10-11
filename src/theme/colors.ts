export const Colors = {
  green: '#40CE86',
  ink: '#0C1822',
  white: '#FFFFFF',
  violet: '#A98BFF',
  mint: '#E6F8EE',
  sky: '#89DCE4',
  clay: '#D4977F',
  violetTint: '#EADFFF',
  greenTint: '#D9F5E6',
  peachTint: '#FFF1EA',
  screen: '#F4F7F5',
  line: '#DFE6E2',

  // Semantic
  error: '#E53535',
  textPrimary: '#0C1822',
  textSecondary: '#4A6070',
  textMuted: '#8FA4B0',
  surfaceCard: '#FFFFFF',
  surfaceScreen: '#F4F7F5',
  border: '#DFE6E2',
  borderStrong: '#0C1822',

  // Bill states
  paid: '#40CE86',
  paidBg: '#D9F5E6',
  due: '#A98BFF',
  dueBg: '#EADFFF',
  overdue: '#D4977F',
  overdueBg: '#FFF1EA',
  upcoming: '#DFE6E2',

  // Tag colors
  tagShared: '#E6F8EE',
  tagOneTime: '#EADFFF',
  tagPrivate: '#F4F7F5',
  tagCoPartner: '#89DCE4',
} as const;

export type ColorKey = keyof typeof Colors;
