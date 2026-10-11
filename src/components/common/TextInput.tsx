import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Colors, Typography, Radius, Spacing } from '@/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
  type?: string;
}

export function TextInput({
  label,
  error,
  rightIcon,
  onRightIconPress,
  style,
  containerStyle,
  inputContainerStyle,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const isEditable = props.editable !== false;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          !isEditable && styles.inputDisabled,
          focused && isEditable && styles.inputFocused,
          error ? styles.inputError : undefined,
          inputContainerStyle,
        ]}
      >
        <RNTextInput
          style={[styles.input, !isEditable && styles.inputDisabledText, style]}
          placeholderTextColor={Colors.textMuted}
          onFocus={() => isEditable && setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
            activeOpacity={0.7}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.base,
  },
  label: {
    ...Typography.label,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderRadius: Radius.cardSm,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    minHeight: 54,
  },
  inputFocused: {
    borderColor: Colors.ink,
  },
  inputDisabled: {
    backgroundColor: Colors.screen,
    borderColor: Colors.border,
    opacity: 0.85,
  },
  inputError: {
    borderColor: Colors.overdue,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    paddingVertical: 14,
    // suppress browser's native focus outline on web — component draws its own border
    outlineStyle: 'none',
  } as any,
  inputDisabledText: {
    color: Colors.textSecondary,
  },
  rightIcon: {
    paddingLeft: 8,
    minWidth: 32,
    alignItems: 'center',
  },
  errorText: {
    ...Typography.caption,
    color: Colors.overdue,
    marginTop: 4,
  },
});
