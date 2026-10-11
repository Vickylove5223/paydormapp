import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography } from '@/theme';
import { LockoMascot } from '@/components/icons/LockoMascot';
import { ScreenHeader } from '@/components/common/ScreenHeader';

export function GatePassScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Gate pass" />
      <View style={styles.container}>
        <View style={styles.mascotWrap}>
          <LockoMascot width={100} height={120} />
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Coming soon</Text>
        </View>
        <Text style={styles.title}>Gate pass</Text>
        <Text style={styles.subtitle}>
          Generate one-time OTP codes for visitors and guests. Guards can scan or verify codes at the gate.
        </Text>
        <TouchableOpacity style={styles.notifyBtn}>
          <Text style={styles.notifyBtnText}>Notify me</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.screen },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  mascotWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  badge: {
    backgroundColor: Colors.violet,
    borderRadius: 99,
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderWidth: 1.5,
    borderColor: Colors.ink,
    marginBottom: 16,
  },
  badgeText: {
    ...Typography.captionSmall,
    color: Colors.ink,
    fontFamily: 'Syne_800ExtraBold',
  },
  title: {
    ...Typography.h2,
    color: Colors.ink,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: 32,
  },
  notifyBtn: {
    backgroundColor: Colors.ink,
    borderRadius: 99,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  notifyBtnText: { ...Typography.buttonSmall, color: Colors.white },
});
