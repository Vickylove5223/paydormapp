import React from 'react';
import Svg, { Ellipse, Path, Rect, Circle } from 'react-native-svg';

interface Props { width?: number; height?: number }

export function DripMascot({ width = 100, height = 117 }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 120 140">
      <Ellipse cx="60" cy="132" rx="34" ry="4" fill="#0C1822" opacity={0.12} />
      {/* left arm */}
      <Path d="M30 84Q16 90 14 102" fill="none" stroke="#0C1822" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M30 84Q16 90 14 102" fill="none" stroke="#89DCE4" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      {/* right arm */}
      <Path d="M90 84Q104 80 106 66" fill="none" stroke="#0C1822" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M90 84Q104 80 106 66" fill="none" stroke="#89DCE4" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      {/* left leg */}
      <Path d="M52 108V122" fill="none" stroke="#0C1822" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M52 108V122" fill="none" stroke="#89DCE4" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      {/* right leg */}
      <Path d="M68 108V122" fill="none" stroke="#0C1822" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M68 108V122" fill="none" stroke="#89DCE4" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      {/* feet */}
      <Ellipse cx="51" cy="125" rx="9" ry="5" fill="#89DCE4" stroke="#0C1822" strokeWidth="2" />
      <Ellipse cx="69" cy="125" rx="9" ry="5" fill="#89DCE4" stroke="#0C1822" strokeWidth="2" />
      {/* teardrop body */}
      <Path d="M60 8C60 8 28 48 28 78a32 32 0 0 0 64 0C92 48 60 8 60 8Z" fill="#89DCE4" stroke="#0C1822" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      {/* gloss highlight */}
      <Path d="M42 76q0 14 10 22" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
      {/* eyes */}
      <Rect x="41" y="66" width="15" height="10" rx="2.5" fill="#0C1822" />
      <Rect x="62" y="66" width="15" height="10" rx="2.5" fill="#0C1822" />
      <Path d="M56 70H62" stroke="#0C1822" strokeWidth="2" />
      {/* smile */}
      <Path d="M52 82q8 8 16 0" fill="none" stroke="#0C1822" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* cheeks */}
      <Circle cx="40" cy="84" r="3.6" fill="#A98BFF" opacity={0.8} />
      <Circle cx="80" cy="84" r="3.6" fill="#A98BFF" opacity={0.8} />
    </Svg>
  );
}
