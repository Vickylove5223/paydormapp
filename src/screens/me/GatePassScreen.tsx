import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Layout } from '@/theme';
import { LockoMascot } from '@/components/icons/LockoMascot';
import { ScreenHeader } from '@/components/common/ScreenHeader';

export function GatePassScreen() {
  const [notified, setNotified] = useState(false);

  const handleNotify = () => {
    setNotified(true);
    Alert.alert('Subscribed!', "We'll notify you as soon as Gate pass is ready.");
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Gate pass" />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mascotWrap}>
          <LockoMascot width={90} height={110} />
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Coming soon</Text>
        </View>
        <Text style={styles.title}>Gate pass</Text>
        <Text style={styles.subtitle}>
          Generate one-time OTP codes for visitors and guests. Guards can scan or verify codes at the gate.
        </Text>
        <TouchableOpacity
          style={[styles.notifyBtn, notified && styles.notifyBtnDone]}
          onPress={handleNotify}
          activeOpacity={0.8}
        >
          <Text style={styles.notifyBtnText}>
            {notified ? '✓ Subscribed' : 'Notify me'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.screen },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: Layout.contentBottomPadding + 44,
  },
  mascotWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  badge: {
    backgroundColor: Colors.violet,
    borderRadius: 99,
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderWidth: 1.5,
    borderColor: Colors.ink,
    marginBottom: 14,
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
    marginBottom: 10,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: 24,
  },
  notifyBtn: {
    backgroundColor: Colors.ink,
    borderRadius: 99,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  notifyBtnDone: {
    backgroundColor: Colors.green,
  },
  notifyBtnText: { ...Typography.buttonSmall, color: Colors.white },
});
