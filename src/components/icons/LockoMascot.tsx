import React from 'react';
import Svg, { Rect, Circle, Path, Ellipse } from 'react-native-svg';

interface LockoMascotProps {
  width?: number;
  height?: number;
}

export function LockoMascot({ width = 100, height = 120 }: LockoMascotProps) {
  return (
    <Svg width={width} height={height} viewBox="12 28 96 108">
      <Ellipse cx="60" cy="132" rx="34" ry="4" fill="#0C1822" opacity={0.12} />
      {/* Shackle (lock arch) */}
      <Path d="M42 58V38a18 18 0 0 1 36 0V58" fill="none" stroke="#0C1822" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M42 58V38a18 18 0 0 1 36 0V58" fill="none" stroke="#E6F8EE" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      {/* Left arm */}
      <Path d="M28 80Q14 84 12 98" fill="none" stroke="#0C1822" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M28 80Q14 84 12 98" fill="none" stroke="#A98BFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      {/* Right arm */}
      <Path d="M92 80Q106 76 108 62" fill="none" stroke="#0C1822" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M92 80Q106 76 108 62" fill="none" stroke="#A98BFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      {/* Left leg */}
      <Path d="M48 106V120" fill="none" stroke="#0C1822" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M48 106V120" fill="none" stroke="#A98BFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      {/* Right leg */}
      <Path d="M72 106V120" fill="none" stroke="#0C1822" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M72 106V120" fill="none" stroke="#A98BFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      {/* Feet */}
      <Ellipse cx="47" cy="123" rx="9" ry="5" fill="#A98BFF" stroke="#0C1822" strokeWidth="2" />
      <Ellipse cx="73" cy="123" rx="9" ry="5" fill="#A98BFF" stroke="#0C1822" strokeWidth="2" />
      {/* Lock body */}
      <Rect x="28" y="54" width="64" height="54" rx="12" fill="#A98BFF" stroke="#0C1822" strokeWidth="2.2" />
      {/* Eyes */}
      <Circle cx="47" cy="72" r="7" fill="#fff" stroke="#0C1822" strokeWidth="2" />
      <Circle cx="48" cy="73" r="3.2" fill="#0C1822" />
      <Circle cx="73" cy="72" r="7" fill="#fff" stroke="#0C1822" strokeWidth="2" />
      <Circle cx="74" cy="73" r="3.2" fill="#0C1822" />
      {/* Keyhole */}
      <Circle cx="60" cy="90" r="5" fill="#0C1822" />
      <Path d="M60 92v10" stroke="#0C1822" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* Cheek blushes */}
      <Circle cx="38" cy="84" r="3.6" fill="#40CE86" opacity={0.8} />
      <Circle cx="82" cy="84" r="3.6" fill="#40CE86" opacity={0.8} />
    </Svg>
  );
}
