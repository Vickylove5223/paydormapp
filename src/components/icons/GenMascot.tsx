import React from 'react';
import Svg, { Ellipse, Path, Rect, Circle } from 'react-native-svg';

interface Props { width?: number; height?: number }

export function GenMascot({ width = 100, height = 117 }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 120 140">
      <Ellipse cx="60" cy="132" rx="34" ry="4" fill="#0C1822" opacity={0.12} />
      {/* exhaust pipe + smoke */}
      <Circle cx="86" cy="22" r="6" fill="#fff" stroke="#0C1822" strokeWidth="2" />
      <Circle cx="94" cy="12" r="4" fill="#fff" stroke="#0C1822" strokeWidth="2" />
      <Rect x="82" y="30" width="9" height="22" rx="2" fill="#fff" stroke="#0C1822" strokeWidth="2" />
      {/* right exhaust hose */}
      <Path d="M96 70q12 4 8 18" fill="none" stroke="#0C1822" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <Rect x="100" y="86" width="8" height="8" rx="2" fill="#40CE86" stroke="#0C1822" strokeWidth="2" />
      {/* left arm */}
      <Path d="M24 78Q10 82 8 96" fill="none" stroke="#0C1822" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M24 78Q10 82 8 96" fill="none" stroke="#A98BFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      {/* roof frame */}
      <Path d="M30 52V38H78V52" fill="none" stroke="#0C1822" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      {/* body */}
      <Rect x="24" y="50" width="72" height="54" rx="10" fill="#A98BFF" stroke="#0C1822" strokeWidth="2.2" />
      {/* top stripe */}
      <Rect x="28" y="54" width="64" height="7" rx="3" fill="#40CE86" stroke="#0C1822" strokeWidth="1.8" />
      {/* eyes */}
      <Circle cx="46" cy="72" r="9" fill="#fff" stroke="#0C1822" strokeWidth="2" />
      <Circle cx="47" cy="73" r="4.1" fill="#0C1822" />
      <Circle cx="74" cy="72" r="9" fill="#fff" stroke="#0C1822" strokeWidth="2" />
      <Circle cx="75" cy="73" r="4.1" fill="#0C1822" />
      {/* grille lines */}
      <Path d="M44 90h32M44 96h32" stroke="#0C1822" strokeWidth="2.4" strokeLinecap="round" />
      {/* wheels */}
      <Circle cx="36" cy="108" r="10" fill="#0C1822" />
      <Circle cx="36" cy="108" r="3.6" fill="#40CE86" />
      <Circle cx="84" cy="108" r="10" fill="#0C1822" />
      <Circle cx="84" cy="108" r="3.6" fill="#40CE86" />
    </Svg>
  );
}
