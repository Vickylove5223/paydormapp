import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Path, Circle } from 'react-native-svg';
import { Colors, Typography } from '@/theme';

function HelpIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Rounded square background */}
      <Rect x="1" y="1" width="22" height="22" rx="7" fill={Colors.green} stroke={Colors.ink} strokeWidth="1.5" />
      {/* Question mark curve */}
      <Path
        d="M9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.5 13.2 11.2 12.5 12C12.17 12.38 12 12.8 12 13.5"
        stroke={Colors.ink}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dot */}
      <Circle cx="12" cy="17" r="1" fill={Colors.ink} />
    </Svg>
  );
}

export function GetHelpBtn({ onPress }: { onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.btn} activeOpacity={0.7} onPress={onPress}>
      <HelpIcon size={22} />
      <Text style={styles.label}>Get help</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { ...Typography.caption, color: Colors.ink, fontFamily: 'DMSans_700Bold' },
});
