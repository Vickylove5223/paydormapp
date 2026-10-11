import React from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { Path, Rect, Circle, Ellipse } from 'react-native-svg';
import { Colors } from '@/theme';
import { FlexMascot } from '@/components/icons/FlexMascot';
import { LockoMascot } from '@/components/icons/LockoMascot';
import { WiFiWizMascot } from '@/components/icons/WiFiWizMascot';
import { DripMascot } from '@/components/icons/DripMascot';
import { GenMascot } from '@/components/icons/GenMascot';

export interface MascotOption {
  id: string;
  name: string;
  subtitle: string;
  bg: string;
}

export const MASCOT_LIBRARY: MascotOption[] = [
  { id: 'mascot:piggy', name: 'Piggy', subtitle: 'Savings & Wallet', bg: '#D8FDE6' },
  { id: 'mascot:flex', name: 'Flex', subtitle: 'Resident & Community', bg: '#E6F8EE' },
  { id: 'mascot:locko', name: 'Locko', subtitle: 'Security & Gate Pass', bg: '#F2EEFF' },
  { id: 'mascot:wifi', name: 'WiFi Wiz', subtitle: 'Estate Utilities', bg: '#FFF7D6' },
  { id: 'mascot:drip', name: 'Drip', subtitle: 'Water & Maintenance', bg: '#E0F7FA' },
  { id: 'mascot:gen', name: 'Genny', subtitle: 'Power & Generator', bg: '#FFF0F5' },
];

export interface UserAvatarProps {
  size?: number;
  avatarUrl?: string | null;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

export function PiggyMascot({ width = 54, height = 54 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="15 28 90 75">
      <Path d="M36 58L30 40L48 50Z" fill="#A98BFF" stroke="#0C1822" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M84 58L90 40L72 50Z" fill="#A98BFF" stroke="#0C1822" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={60} cy={38} r={9} fill="#40CE86" stroke="#0C1822" strokeWidth={2} />
      <Path d="M55 36h10M55 40h10" stroke="#0C1822" strokeWidth={1.8} />
      <Ellipse cx={60} cy={78} rx={38} ry={30} fill="#A98BFF" stroke="#0C1822" strokeWidth={2.2} />
      <Path d="M50 50h20" stroke="#0C1822" strokeWidth={3} strokeLinecap="round" />
      <Rect x={37} y={64} width={15} height={10} rx={2.5} fill="#0C1822" />
      <Rect x={64} y={64} width={15} height={10} rx={2.5} fill="#0C1822" />
      <Path d="M52 68H64" stroke="#0C1822" strokeWidth={2} />
      <Ellipse cx={60} cy={88} rx={13} ry={9} fill="#40CE86" stroke="#0C1822" strokeWidth={2.2} />
      <Circle cx={55} cy={88} r={2} fill="#0C1822" />
      <Circle cx={65} cy={88} r={2} fill="#0C1822" />
      <Circle cx={34} cy={82} r={3.6} fill="#40CE86" opacity={0.8} />
      <Circle cx={86} cy={82} r={3.6} fill="#40CE86" opacity={0.8} />
    </Svg>
  );
}

export function UserAvatar({
  size = 64,
  avatarUrl,
  style,
  backgroundColor,
  borderColor = Colors.ink,
  borderWidth = 2,
}: UserAvatarProps) {
  const isImage = avatarUrl && (avatarUrl.startsWith('data:') || avatarUrl.startsWith('http') || avatarUrl.startsWith('blob:'));
  const mascotKey = avatarUrl?.startsWith('mascot:') ? avatarUrl.replace('mascot:', '') : 'piggy';
  const matchedMascot = MASCOT_LIBRARY.find((m) => m.id === (avatarUrl || 'mascot:piggy'));
  const effectiveBg = backgroundColor ?? matchedMascot?.bg ?? Colors.mint;

  const containerStyle = [
    styles.container,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: effectiveBg,
      borderColor,
      borderWidth,
    },
    style,
  ];

  if (isImage) {
    return (
      <View style={containerStyle}>
        <Image
          source={{ uri: avatarUrl }}
          style={{ width: size - borderWidth * 2, height: size - borderWidth * 2, borderRadius: size / 2 }}
          resizeMode="cover"
        />
      </View>
    );
  }

  const renderMascot = () => {
    switch (mascotKey) {
      case 'flex':
        return <FlexMascot width={size * 0.72} height={size * 0.86} />;
      case 'locko':
        return <LockoMascot width={size * 0.72} height={size * 0.86} />;
      case 'wifi':
        return <WiFiWizMascot width={size * 0.72} height={size * 0.86} />;
      case 'drip':
        return <DripMascot width={size * 0.72} height={size * 0.86} />;
      case 'gen':
        return <GenMascot width={size * 0.72} height={size * 0.86} />;
      case 'piggy':
      default:
        return <PiggyMascot width={size * 0.8} height={size * 0.8} />;
    }
  };

  return <View style={containerStyle}>{renderMascot()}</View>;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
