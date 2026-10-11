import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Colors, Typography, Layout, Radius } from '@/theme';
import { api } from '@/api/client';
import { Payment } from '@/types';
import { formatNaira } from '@/utils/money';
import { timeAgo } from '@/utils/date';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { CardSkeleton } from '@/components/common/SkeletonLoader';
import { EmptyState } from '@/components/common/EmptyState';
import { Chip } from '@/components/common/Chip';

export function MyPaymentsScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ['myPayments'],
    queryFn: () => api.get<{ payments: Payment[] }>('/payments/mine'),
  });

  const statusColor: Record<string, string> = {
    success: Colors.paid,
    failed: Colors.overdue,
    pending: Colors.due,
  };

  const renderItem = ({ item }: { item: Payment }) => (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.ref} numberOfLines={1}>Ref: {item.reference.slice(0, 10)}…</Text>
        <Text style={styles.method}>{item.method} · {timeAgo(item.createdAt)}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.amount}>{formatNaira(item.amount)}</Text>
        <View style={[styles.statusDot, { backgroundColor: statusColor[item.status] }]} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="My payments" />
      {isLoading ? (
        <View style={{ padding: Layout.screenPadding, gap: 12 }}>
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </View>
      ) : !data?.payments.length ? (
        <EmptyState title="No payments yet" subtitle="Your payment history will appear here." />
      ) : (
        <FlatList
          data={data.payments}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.screen },
  list: {
    padding: Layout.screenPadding,
    paddingBottom: Layout.contentBottomPadding,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.cardSm,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 14,
    gap: 12,
  },
  rowLeft: { flex: 1 },
  ref: { ...Typography.label, color: Colors.ink },
  method: { ...Typography.caption, color: Colors.textSecondary, textTransform: 'capitalize' },
  rowRight: { alignItems: 'flex-end', gap: 4 },
  amount: { ...Typography.label, color: Colors.ink },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
});
