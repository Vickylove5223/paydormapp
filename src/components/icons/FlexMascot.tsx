import React from 'react';
import Svg, { Rect, Circle, Path, Ellipse } from 'react-native-svg';

interface FlexMascotProps {
  width?: number;
  height?: number;
}

export function FlexMascot({ width = 100, height = 120 }: FlexMascotProps) {
  return (
    <Svg width={width} height={height} viewBox="14 26 92 100">
      <Rect x="44" y="26" width="32" height="22" rx="3" fill="#FFFFFF" stroke="#0C1822" strokeWidth="2" />
      <Path d="M52 34h16M52 40h16" stroke="#0C1822" strokeWidth="2" />
      <Path d="M30 66Q16 72 14 88" fill="none" stroke="#0C1822" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M30 66Q16 72 14 88" fill="none" stroke="#40CE86" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M90 66Q104 60 106 44" fill="none" stroke="#0C1822" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M90 66Q104 60 106 44" fill="none" stroke="#40CE86" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M48 104V118" fill="none" stroke="#0C1822" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M48 104V118" fill="none" stroke="#40CE86" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M72 104V118" fill="none" stroke="#0C1822" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M72 104V118" fill="none" stroke="#40CE86" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <Ellipse cx="47" cy="121" rx="9" ry="5" fill="#40CE86" stroke="#0C1822" strokeWidth="2" />
      <Ellipse cx="73" cy="121" rx="9" ry="5" fill="#40CE86" stroke="#0C1822" strokeWidth="2" />
      <Rect x="30" y="42" width="60" height="62" rx="14" fill="#40CE86" stroke="#0C1822" strokeWidth="2.2" />
      <Path d="M30 58a16 16 0 0 1 16-16H74a16 16 0 0 1 16 16Z" fill="#A98BFF" stroke="#0C1822" strokeWidth="2.2" />
      <Rect x="80" y="70" width="18" height="13" rx="6.5" fill="#A98BFF" stroke="#0C1822" strokeWidth="2.2" />
      <Circle cx="89" cy="76.5" r="2" fill="#0C1822" />
      <Rect x="37" y="66" width="15" height="10" rx="2.5" fill="#0C1822" />
      <Rect x="58" y="66" width="15" height="10" rx="2.5" fill="#0C1822" />
      <Path d="M52 70H58" stroke="#0C1822" strokeWidth="2" />
      <Path d="M46 88q9 8 18 0" fill="none" stroke="#0C1822" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="38" cy="90" r="3.6" fill="#A98BFF" opacity={0.8} />
      <Circle cx="70" cy="90" r="3.6" fill="#A98BFF" opacity={0.8} />
    </Svg>
  );
}
