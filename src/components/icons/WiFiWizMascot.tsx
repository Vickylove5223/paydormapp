import React from 'react';
import Svg, { Ellipse, Path, Rect, Circle } from 'react-native-svg';

interface Props { width?: number; height?: number }

export function WiFiWizMascot({ width = 100, height = 117 }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 120 140">
      <Ellipse cx="60" cy="132" rx="34" ry="4" fill="#0C1822" opacity={0.12} />
      {/* antenna horns */}
      <Path d="M40 52L28 20M80 52L92 20" stroke="#0C1822" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="28" cy="18" r="5" fill="#40CE86" stroke="#0C1822" strokeWidth="2" />
      <Circle cx="92" cy="18" r="5" fill="#40CE86" stroke="#0C1822" strokeWidth="2" />
      {/* left arm */}
      <Path d="M16 74Q8 78 7 90" fill="none" stroke="#0C1822" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 74Q8 78 7 90" fill="none" stroke="#A98BFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      {/* right arm */}
      <Path d="M104 74Q112 70 114 58" fill="none" stroke="#0C1822" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M104 74Q112 70 114 58" fill="none" stroke="#A98BFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      {/* left leg */}
      <Path d="M44 96V120" fill="none" stroke="#0C1822" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M44 96V120" fill="none" stroke="#A98BFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      {/* right leg */}
      <Path d="M76 96V120" fill="none" stroke="#0C1822" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M76 96V120" fill="none" stroke="#A98BFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      {/* feet */}
      <Ellipse cx="43" cy="123" rx="9" ry="5" fill="#A98BFF" stroke="#0C1822" strokeWidth="2" />
      <Ellipse cx="77" cy="123" rx="9" ry="5" fill="#A98BFF" stroke="#0C1822" strokeWidth="2" />
      {/* body */}
      <Rect x="14" y="50" width="92" height="48" rx="12" fill="#0C1822" />
      {/* eyes */}
      <Circle cx="44" cy="68" r="7" fill="#fff" />
      <Circle cx="76" cy="68" r="7" fill="#fff" />
      <Circle cx="45" cy="69" r="3" fill="#40CE86" />
      <Circle cx="77" cy="69" r="3" fill="#40CE86" />
      {/* smile */}
      <Path d="M52 78q8 8 16 0" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* wifi dots */}
      <Circle cx="30" cy="90" r="2.8" fill="#40CE86" />
      <Circle cx="42" cy="90" r="2.8" fill="#40CE86" />
      <Circle cx="54" cy="90" r="2.8" fill="#A98BFF" />
    </Svg>
  );
}
