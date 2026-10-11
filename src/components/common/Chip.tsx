import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, Radius } from '@/theme';
import { BillState, BillType } from '@/types';

type ChipTone = 'paid' | 'due' | 'overdue' | 'upcoming' | 'shared' | 'one_time' | 'private' | 'copartner' | 'neutral';

interface ChipProps {
  label: string;
  tone?: ChipTone;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

const toneStyles: Record<ChipTone, { bg: string; color: string }> = {
  paid: { bg: Colors.greenTint, color: Colors.ink },
  due: { bg: Colors.violetTint, color: Colors.ink },
  overdue: { bg: Colors.peachTint, color: Colors.overdue },
  upcoming: { bg: Colors.line, color: Colors.textSecondary },
  shared: { bg: Colors.tagShared, color: Colors.ink },
  one_time: { bg: Colors.tagOneTime, color: Colors.ink },
  private: { bg: Colors.tagPrivate, color: Colors.textSecondary },
  copartner: { bg: Colors.tagCoPartner, color: Colors.ink },
  neutral: { bg: Colors.line, color: Colors.textSecondary },
};

export function Chip({ label, tone = 'neutral', size = 'md', style }: ChipProps) {
  const { bg, color } = toneStyles[tone];
  return (
    <View style={[styles.chip, size === 'sm' && styles.chipSm, { backgroundColor: bg }, style]}>
      <Text style={[styles.label, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function billStateTone(state: BillState): ChipTone {
  switch (state) {
    case 'paid': return 'paid';
    case 'due': return 'due';
    case 'overdue': return 'overdue';
    case 'partially_paid': return 'due';
    case 'upcoming': return 'upcoming';
    default: return 'neutral';
  }
}

export function billStateLabel(state: BillState): string {
  switch (state) {
    case 'paid': return 'Paid';
    case 'due': return 'Due';
    case 'overdue': return 'Overdue';
    case 'partially_paid': return 'Partial';
    case 'upcoming': return 'Upcoming';
    default: return state;
  }
}

export function billTypeLabel(type: BillType): string {
  switch (type) {
    case 'shared': return 'Shared';
    case 'one_time': return 'One-time';
    case 'private': return 'Private';
    case 'copartner': return 'Co-partner';
    case 'electricity': return 'Electricity';
    case 'water': return 'Water';
    case 'service_charge': return 'Service charge';
    case 'security': return 'Security';
    case 'waste': return 'Waste';
    case 'internet': return 'Internet';
    case 'other': return 'Other';
    default: return type;
  }
}

export function billTypeTone(type: BillType): ChipTone {
  switch (type) {
    case 'shared': return 'shared';
    case 'one_time': return 'one_time';
    case 'private': return 'private';
    case 'copartner': return 'copartner';
    default: return 'shared';
  }
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: Radius.chip,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  chipSm: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  label: {
    ...Typography.captionSmall,
    fontFamily: 'Syne_800ExtraBold',
  },
});
