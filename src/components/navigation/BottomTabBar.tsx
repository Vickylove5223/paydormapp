import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Platform,
  AccessibilityInfo,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Layout, Shadow } from '@/theme';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import { HomeIcon, BillsIcon, LeviesIcon, MeIcon } from '@/components/icons/NavIcons';

const TABS = [
  { name: 'Home', label: 'Home', Icon: HomeIcon },
  { name: 'Bills', label: 'Bills', Icon: BillsIcon },
  { name: 'Levies', label: 'Charges', Icon: LeviesIcon },
  { name: 'Me', label: 'Me', Icon: MeIcon },
];

// 12-point starburst shape, 56×56 viewBox
const STARBURST_PATH =
  'M28 6 L32.14 12.55 L39 8.95 L39.31 16.69 L47.05 17 L43.45 23.86 L50 28 L43.45 32.14 L47.05 39 L39.31 39.31 L39 47.05 L32.14 43.45 L28 50 L23.86 43.45 L17 47.05 L16.69 39.31 L8.95 39 L12.55 32.14 L6 28 L12.55 23.86 L8.95 17 L16.69 16.69 L17 8.95 L23.86 12.55 Z';

export function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const unreadCount = useAppStore((s) => s.unreadCount);

  return (
    <View style={[styles.wrapper, { marginBottom: insets.bottom + Layout.bottomNavMargin }]}>
      <View style={[styles.container, Shadow.nav]}>
        {state.routes.map((route, index) => {
          const tab = TABS[index];
          const isFocused = state.index === index;

          return (
            <TabItem
              key={route.key}
              tab={tab}
              isFocused={isFocused}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

function TabItem({
  tab,
  isFocused,
  onPress,
}: {
  tab: (typeof TABS)[0];
  isFocused: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withTiming(isFocused ? 1 : 0.85, {
      duration: 220,
      easing: Easing.out(Easing.back(1.4)),
    });
    opacity.value = withTiming(isFocused ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.quad),
    });
  }, [isFocused]);

  const starStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const { Icon } = tab;

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      accessibilityState={{ selected: isFocused }}
    >
      <View style={styles.iconContainer}>
        {/* Starburst background */}
        <Animated.View style={[styles.starburstWrap, starStyle]} pointerEvents="none">
          <Svg width={56} height={56} viewBox="0 0 56 56" fill="none">
            <Path d={STARBURST_PATH} fill={Colors.violetTint} />
          </Svg>
        </Animated.View>
        {/* Icon */}
        <View style={styles.iconWrap}>
          <Icon active={isFocused} size={isFocused ? 26 : 24} />
        </View>
      </View>
      <Text
        style={[
          styles.label,
          isFocused ? styles.labelActive : styles.labelInactive,
        ]}
        numberOfLines={1}
      >
        {tab.label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: Layout.bottomNavMargin,
    right: Layout.bottomNavMargin,
    bottom: 0,
  },
  container: {
    height: Layout.bottomNavHeight,
    backgroundColor: Colors.white,
    borderRadius: Layout.bottomNavRadius,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF1EF',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    minHeight: Layout.minTouchTarget,
  },
  iconContainer: {
    width: 56,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  starburstWrap: {
    position: 'absolute',
    top: -3,
    left: 0,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  iconWrap: {
    zIndex: 1,
  },
  label: {
    ...Typography.captionSmall,
    marginTop: 2,
  },
  labelActive: {
    color: Colors.ink,
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 10,
  },
  labelInactive: {
    color: Colors.textMuted,
  },
});
