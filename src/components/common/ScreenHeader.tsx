import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Layout } from '@/theme';

function BackArrow({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M5 12L11 6M5 12L11 18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

interface ScreenHeaderProps {
  title?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode | { label: string; onPress: () => void };
  onBack?: () => void;
  dark?: boolean;
  noBorder?: boolean;
  backgroundColor?: string;
}

export function ScreenHeader({
  title = '',
  showBack = true,
  rightAction,
  onBack,
  dark = false,
  noBorder = false,
  backgroundColor,
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const bg = backgroundColor ?? (dark ? Colors.ink : Colors.screen);
  const fg = dark ? Colors.white : Colors.ink;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8, backgroundColor: bg }, noBorder && styles.noBorder]}>
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity
            onPress={onBack ?? (() => navigation.goBack())}
            style={styles.backBtn}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <BackArrow color={fg} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}

        <Text style={[styles.title, { color: fg }]} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.right}>
          {rightAction && typeof rightAction === 'object' && 'label' in rightAction ? (
            <TouchableOpacity onPress={rightAction.onPress}>
              <Text style={[styles.rightLabel, { color: fg }]}>{rightAction.label}</Text>
            </TouchableOpacity>
          ) : (
            rightAction as React.ReactNode
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    ...Typography.title,
    fontSize: 15,
    lineHeight: 20,
  },
  right: {
    minWidth: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rightLabel: {
    ...Typography.caption,
    color: Colors.violet,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
});
