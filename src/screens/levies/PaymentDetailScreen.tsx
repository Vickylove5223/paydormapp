import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LeviesStackParams } from '@/navigation/types';
import { Colors, Typography, Layout, Radius } from '@/theme';
import { formatNaira } from '@/utils/money';
import { ScreenHeader } from '@/components/common/ScreenHeader';

type Props = NativeStackScreenProps<LeviesStackParams, 'PaymentDetail'>;

interface MockPayment {
  id: string;
  reference: string;
  method: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  createdAt: string;
  billTitle: string;
  tenantName?: string;
}

const MOCK_PAYMENTS: Record<string, MockPayment> = {
  lv1: { id: 'lv1', reference: 'PD-2026100001', method: 'wallet', amount: 1200000, status: 'success', createdAt: '2026-10-11T08:22:00Z', billTitle: 'August EKEDC', tenantName: 'Tolu Adeyemi' },
  lv2: { id: 'lv2', reference: 'PD-2026100002', method: 'card', amount: 500000, status: 'success', createdAt: '2026-10-10T16:45:00Z', billTitle: 'October Service Charge', tenantName: 'Kemi Okafor' },
  lv3: { id: 'lv3', reference: 'PD-2026100003', method: 'wallet', amount: 1200000, status: 'success', createdAt: '2026-10-10T11:30:00Z', billTitle: 'August EKEDC', tenantName: 'Femi Adekunle' },
  lv4: { id: 'lv4', reference: 'PD-2026100004', method: 'bank_transfer', amount: 500000, status: 'success', createdAt: '2026-10-09T09:15:00Z', billTitle: 'October Service Charge', tenantName: 'Amara Nwosu' },
  lv5: { id: 'lv5', reference: 'PD-2026100005', method: 'wallet', amount: 150000, status: 'success', createdAt: '2026-10-08T14:00:00Z', billTitle: 'Estate Wi-Fi — October', tenantName: 'Chidi Obi' },
  lv6: { id: 'lv6', reference: 'PD-2026100006', method: 'card', amount: 1200000, status: 'success', createdAt: '2026-10-07T10:20:00Z', billTitle: 'August EKEDC', tenantName: 'Ngozi Eze' },
  lv7: { id: 'lv7', reference: 'PD-2026100007', method: 'wallet', amount: 150000, status: 'success', createdAt: '2026-10-06T08:00:00Z', billTitle: 'Estate Wi-Fi — October', tenantName: 'Yemi Balogun' },
  lv8: { id: 'lv8', reference: 'PD-2026100008', method: 'bank_transfer', amount: 150000, status: 'success', createdAt: '2026-10-05T12:30:00Z', billTitle: 'Estate Wi-Fi — October', tenantName: 'Kemi Okafor' },
  mp1: { id: 'mp1', reference: 'PD-2026100001', method: 'wallet', amount: 1200000, status: 'success', createdAt: '2026-10-11T08:22:00Z', billTitle: 'August EKEDC' },
  mp2: { id: 'mp2', reference: 'PD-2026100002', method: 'card', amount: 500000, status: 'success', createdAt: '2026-10-09T16:45:00Z', billTitle: 'October Service Charge' },
  mp3: { id: 'mp3', reference: 'PD-2026090003', method: 'wallet', amount: 1200000, status: 'success', createdAt: '2026-09-29T08:00:00Z', billTitle: 'September EKEDC' },
  mp4: { id: 'mp4', reference: 'PD-2026090004', method: 'bank_transfer', amount: 500000, status: 'success', createdAt: '2026-09-28T10:00:00Z', billTitle: 'September Service Charge' },
  mp5: { id: 'mp5', reference: 'PD-2026090005', method: 'wallet', amount: 350000, status: 'failed', createdAt: '2026-09-27T14:00:00Z', billTitle: 'Water Supply' },
};

const statusColor: Record<string, string> = {
  success: Colors.paid,
  failed: Colors.overdue,
  pending: Colors.due,
};

const methodLabel: Record<string, string> = {
  wallet: 'PayDorm Wallet',
  card: 'Debit card',
  bank_transfer: 'Bank transfer',
  direct_debit: 'Direct debit',
};

export function PaymentDetailScreen({ route, navigation }: Props) {
  const { paymentId } = route.params;
  const payment = MOCK_PAYMENTS[paymentId];

  const handleShare = () => {
    if (!payment) return;
    Alert.alert(
      'Share receipt',
      `PayDorm Receipt\n\nRef: ${payment.reference}\nBill: ${payment.billTitle}\nAmount: ${formatNaira(payment.amount)}\nStatus: ${payment.status.toUpperCase()}\n\nPowered by PayDorm`,
      [{ text: 'OK' }]
    );
  };

  if (!payment) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Payment details" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ ...Typography.body, color: Colors.textMuted }}>Receipt not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const rows: { label: string; value: string }[] = [
    { label: 'Reference', value: payment.reference },
    { label: 'Bill', value: payment.billTitle },
    { label: 'Amount', value: formatNaira(payment.amount) },
    { label: 'Method', value: methodLabel[payment.method] ?? payment.method },
    { label: 'Date', value: new Date(payment.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) },
    { label: 'Time', value: new Date(payment.createdAt).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit', hour12: true }) },
    { label: 'Status', value: payment.status.toUpperCase() },
  ];
  if (payment.tenantName) rows.splice(1, 0, { label: 'Tenant', value: payment.tenantName });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Payment details"
        rightAction={{ label: 'Share', onPress: handleShare }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Amount hero */}
        <View style={styles.heroCard}>
          <View style={[styles.statusDot, { backgroundColor: statusColor[payment.status] ?? Colors.textMuted }]} />
          <Text style={styles.heroAmount}>{formatNaira(payment.amount)}</Text>
          <Text style={styles.heroStatus}>{payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}</Text>
          <Text style={styles.heroBill}>{payment.billTitle}</Text>
        </View>

        {/* Detail rows */}
        <View style={styles.card}>
          {rows.map((row, i) => (
            <React.Fragment key={row.label}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.row}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={[styles.rowValue, row.label === 'Status' && { color: statusColor[payment.status] }]}>
                  {row.value}
                </Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
          <Text style={styles.shareBtnText}>Share receipt</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.screen },
  content: { padding: Layout.screenPadding, paddingBottom: Layout.contentBottomPadding, gap: 16 },
  heroCard: {
    backgroundColor: Colors.ink, borderRadius: Radius.card,
    padding: 28, alignItems: 'center', gap: 6,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 4 },
  heroAmount: { ...Typography.amountLarge, color: Colors.green },
  heroStatus: { ...Typography.body, color: 'rgba(255,255,255,0.6)', textTransform: 'capitalize' },
  heroBill: { ...Typography.caption, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  card: {
    backgroundColor: Colors.white, borderRadius: Radius.card,
    borderWidth: 1, borderColor: Colors.line, overflow: 'hidden',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  rowLabel: { ...Typography.label, color: Colors.textSecondary },
  rowValue: { ...Typography.label, color: Colors.ink, maxWidth: '60%', textAlign: 'right', textTransform: 'capitalize' },
  divider: { height: 1, backgroundColor: Colors.line, marginHorizontal: 16 },
  shareBtn: {
    backgroundColor: Colors.green, borderRadius: 99, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1.5, borderColor: Colors.ink,
  },
  shareBtnText: { ...Typography.button, color: Colors.ink },
});
