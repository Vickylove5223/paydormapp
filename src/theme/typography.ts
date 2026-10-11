import { TextStyle } from 'react-native';

export const FontFamily = {
  syneExtraBold: 'Syne_800ExtraBold',
  syneBold: 'Syne_700Bold',
  dmSansRegular: 'DMSans_400Regular',
  dmSansMedium: 'DMSans_500Medium',
  dmSansBold: 'DMSans_700Bold',
} as const;

export const Typography = {
  display: {
    fontFamily: FontFamily.syneExtraBold,
    fontSize: 40,
    letterSpacing: -0.8,
    lineHeight: 44,
  } as TextStyle,

  h1: {
    fontFamily: FontFamily.syneExtraBold,
    fontSize: 34,
    letterSpacing: -0.68,
    lineHeight: 38,
  } as TextStyle,

  h2: {
    fontFamily: FontFamily.syneExtraBold,
    fontSize: 28,
    letterSpacing: -0.56,
    lineHeight: 32,
  } as TextStyle,

  title: {
    fontFamily: FontFamily.syneExtraBold,
    fontSize: 18,
    letterSpacing: -0.36,
    lineHeight: 22,
  } as TextStyle,

  amount: {
    fontFamily: FontFamily.syneExtraBold,
    fontSize: 28,
    letterSpacing: -0.56,
    lineHeight: 32,
  } as TextStyle,

  amountLarge: {
    fontFamily: FontFamily.syneExtraBold,
    fontSize: 34,
    letterSpacing: -0.68,
    lineHeight: 38,
  } as TextStyle,

  button: {
    fontFamily: FontFamily.syneExtraBold,
    fontSize: 15,
    letterSpacing: -0.3,
    lineHeight: 20,
  } as TextStyle,

  buttonSmall: {
    fontFamily: FontFamily.syneExtraBold,
    fontSize: 13,
    letterSpacing: -0.26,
    lineHeight: 18,
  } as TextStyle,

  body: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: 15,
    lineHeight: 22,
  } as TextStyle,

  bodySmall: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: 14,
    lineHeight: 20,
  } as TextStyle,

  caption: {
    fontFamily: FontFamily.dmSansMedium,
    fontSize: 12,
    lineHeight: 16,
  } as TextStyle,

  captionSmall: {
    fontFamily: FontFamily.dmSansMedium,
    fontSize: 11,
    lineHeight: 14,
  } as TextStyle,

  label: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: 13,
    lineHeight: 18,
  } as TextStyle,
} as const;
