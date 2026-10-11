import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LeviesStackParams } from '@/navigation/types';
import { Colors, Typography, Layout, Radius } from '@/theme';
import { api } from '@/api/client';
import { Payment } from '@/types';
import { formatNaira } from '@/utils/money';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { CardSkeleton } from '@/components/common/SkeletonLoader';
import { Chip, billTypeLabel } from '@/components/common/Chip';

type Props = NativeStackScreenProps<LeviesStackParams, 'PaymentDetail'>;

const statusColor: Record<string, string> = {
  success: Colors.paid,
  failed: Colors.overdue,
  pending: Colors.due,
};

export function PaymentDetailScreen({ route }: Props) {
  const { paymentId } = route.params;

  const { data, isLoading } = useQuery({
    queryKey: ['payment', paymentId],
    queryFn: () => api.get<{ payment: Payment }>(`/payments/${paymentId}`),
  });

  const handleShare = async () => {
    if (!data?.payment) return;
    try {
      await Share.share({
        message: `PayDorm receipt\n\nRef: ${data.payment.reference}\nAmount: ${formatNaira(data.payment.amount)}\nStatus: ${data.payment.status}\n\nPowered by PayDorm`,
      });
    } catch (_) {}
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Payment details" />
        <View style={{ padding: Layout.screenPadding, gap: 12 }}>
          <CardSkeleton />
          <CardSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  const payment = data?.payment;
  if (!payment) return null;

  const rows: { label: string; value: string }[] = [
    { label: 'Reference', value: payment.reference },
    { label: 'Amount', value: formatNaira(payment.amount) },
    { label: 'Method', value: payment.method },
    { label: 'Date', value: new Date(payment.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) },
    { label: 'Status', value: payment.status },
  ];

  if (payment.billTitle) rows.splice(2, 0, { label: 'Bill', value: payment.billTitle });

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
        </View>

        {/* Detail rows */}
        <View style={styles.card}>
          {rows.map((row, i) => (
            <React.Fragment key={row.label}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.row}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowValue} numberOfLines={1}>{row.value}</Text>
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
    backgroundColor: Colors.ink,
    borderRadius: Radius.card,
    padding: 28,
    alignItems: 'center',
    gap: 6,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 4 },
  heroAmount: { ...Typography.amountLarge, color: Colors.green },
  heroStatus: { ...Typography.body, color: 'rgba(255,255,255,0.6)', textTransform: 'capitalize' },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.line,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  rowLabel: { ...Typography.label, color: Colors.textSecondary },
  rowValue: { ...Typography.label, color: Colors.ink, maxWidth: '60%', textAlign: 'right', textTransform: 'capitalize' },
  divider: { height: 1, backgroundColor: Colors.line, marginHorizontal: 16 },
  shareBtn: {
    backgroundColor: Colors.green,
    borderRadius: 99,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.ink,
  },
  shareBtnText: { ...Typography.button, color: Colors.ink },
});
