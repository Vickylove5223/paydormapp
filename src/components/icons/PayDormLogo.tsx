import React from 'react';
import Svg, { Rect, Path, Circle, Text as SvgText } from 'react-native-svg';
import { Colors } from '@/theme';

interface LogoProps {
  size?: number;
  variant?: 'full' | 'mark';
  onDark?: boolean;
}

export function PayDormLogo({ size = 40, variant = 'full', onDark = false }: LogoProps) {
  if (variant === 'mark') {
    return (
      <Svg width={size} height={size} viewBox="0 0 56 56">
        <Rect width={56} height={56} rx={16} fill={Colors.ink} />
        <Path
          d="M10 24L28 9L46 24"
          fill="none"
          stroke={Colors.white}
          strokeWidth={3.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx={22} cy={36} r={9.5} fill={Colors.green} />
        <Circle
          cx={34}
          cy={36}
          r={9.5}
          fill={Colors.violet}
          stroke={Colors.ink}
          strokeWidth={2.6}
        />
      </Svg>
    );
  }

  const markSize = size;
  const totalWidth = (markSize / 56) * 232;

  return (
    <Svg width={totalWidth} height={markSize} viewBox="0 0 232 56">
      <Rect width={56} height={56} rx={16} fill={Colors.ink} />
      <Path
        d="M10 24L28 9L46 24"
        fill="none"
        stroke={Colors.white}
        strokeWidth={3.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={22} cy={36} r={9.5} fill={Colors.green} />
      <Circle
        cx={34}
        cy={36}
        r={9.5}
        fill={Colors.violet}
        stroke={Colors.ink}
        strokeWidth={2.6}
      />
      <SvgText
        x={68}
        y={41}
        fontFamily="Syne_800ExtraBold"
        fontWeight="800"
        fontSize={35}
        letterSpacing={-1.2}
        fill={onDark ? Colors.white : Colors.ink}
      >
        paydorm
      </SvgText>
    </Svg>
  );
}
