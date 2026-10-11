import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Typography, Radius } from '@/theme';

type Variant = 'primary' | 'accent' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        styles[`size_${size}`],
        styles[`variant_${variant}`],
        isDisabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? Colors.green : Colors.ink}
        />
      ) : (
        <Text
          style={[
            styles.label,
            styles[`labelVariant_${variant}`],
            styles[`labelSize_${size}`],
            textStyle,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  // Sizes
  size_sm: { height: 36, paddingHorizontal: 16 },
  size_md: { height: 44, paddingHorizontal: 20 },
  size_lg: { height: 54, paddingHorizontal: 24 },

  // Variants
  variant_primary: {
    backgroundColor: Colors.ink,
  },
  variant_accent: {
    backgroundColor: Colors.green,
    borderWidth: 1.5,
    borderColor: Colors.ink,
  },
  variant_outline: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.ink,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },

  disabled: { opacity: 0.5 },

  // Labels
  label: {
    ...Typography.button,
  },
  labelSize_sm: { ...Typography.buttonSmall },
  labelSize_md: { ...Typography.button, fontSize: 14 },
  labelSize_lg: { ...Typography.button },

  labelVariant_primary: { color: Colors.white },
  labelVariant_accent: { color: Colors.ink },
  labelVariant_outline: { color: Colors.ink },
  labelVariant_ghost: { color: Colors.ink },
});
