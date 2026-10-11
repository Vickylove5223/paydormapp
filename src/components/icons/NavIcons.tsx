import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { Colors } from '@/theme';

interface NavIconProps {
  active?: boolean;
  size?: number;
}

export function HomeIcon({ active, size = 24 }: NavIconProps) {
  const houseFill = active ? Colors.green : 'none';
  const doorFill = active ? '#0C1822' : 'none';
  const stroke = active ? '#0C1822' : Colors.textMuted;
  const sw = active ? 1.8 : 1.5;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10.5l9-8 9 8V21H3z"
        fill={houseFill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.5 21v-6.5h5V21"
        fill={doorFill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function BillsIcon({ active, size = 24 }: NavIconProps) {
  const bodyFill = active ? Colors.violet : 'none';
  const badgeFill = active ? Colors.green : 'none';
  const checkStroke = active ? '#fff' : Colors.textMuted;
  const stroke = active ? '#0C1822' : Colors.textMuted;
  const sw = active ? 1.8 : 1.5;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Document page */}
      <Path
        d="M5 3h9l5 5v13H5z"
        fill={bodyFill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      {/* Folded corner */}
      <Path
        d="M14 3v5h5"
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      {/* Lines */}
      <Path d="M8 13h5M8 16h3" stroke={active ? '#E6F8EE' : Colors.textMuted} strokeWidth={1.3} strokeLinecap="round" />
      {/* Badge circle */}
      <Circle
        cx={17} cy={18} r={4}
        fill={badgeFill}
        stroke={stroke}
        strokeWidth={sw}
      />
      {/* Check inside badge */}
      <Path
        d="M15 18l1.5 1.5L19 16"
        stroke={checkStroke}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function LeviesIcon({ active, size = 24 }: NavIconProps) {
  const bodyFill = active ? Colors.mint : 'none';
  const pocketFill = active ? Colors.violet : 'none';
  const stroke = active ? '#0C1822' : Colors.textMuted;
  const sw = active ? 1.8 : 1.5;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Wallet body */}
      <Path
        d="M3 8h18v11a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
        fill={bodyFill}
        stroke={stroke}
        strokeWidth={sw}
      />
      {/* Wallet flap top */}
      <Path
        d="M3 8l1.5-3h15L21 8"
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      {/* Coin pocket */}
      <Rect
        x={14} y={11.5} width={7} height={4} rx={2}
        fill={pocketFill}
        stroke={stroke}
        strokeWidth={sw}
      />
    </Svg>
  );
}

export function MeIcon({ active, size = 24 }: NavIconProps) {
  const headFill = active ? Colors.violet : 'none';
  const bodyFill = active ? Colors.mint : 'none';
  const stroke = active ? '#0C1822' : Colors.textMuted;
  const sw = active ? 1.8 : 1.5;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx={12} cy={8} r={4}
        fill={headFill}
        stroke={stroke}
        strokeWidth={sw}
      />
      <Path
        d="M4 21a8 8 0 0116 0z"
        fill={bodyFill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
