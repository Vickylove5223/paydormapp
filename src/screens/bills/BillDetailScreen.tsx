import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BillsStackParams } from '@/navigation/types';
import { Colors, Typography, Layout, Radius, Shadow } from '@/theme';
import { api } from '@/api/client';
import { Bill, BillAllocation } from '@/types';
import { formatNaira } from '@/utils/money';
import { formatDueDate } from '@/utils/date';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Chip, billStateTone, billStateLabel, billTypeLabel } from '@/components/common/Chip';
import { Button } from '@/components/common/Button';
import { CardSkeleton } from '@/components/common/SkeletonLoader';
import { useAppStore } from '@/store/app';

type Props = NativeStackScreenProps<BillsStackParams, 'BillDetail'>;

export function BillDetailScreen({ route, navigation }: Props) {
  const { billId } = route.params;
  const role = useAppStore((s) => s.role);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['bill', billId],
    queryFn: () => api.get<{ bill: Bill; allocations: BillAllocation[] }>(`/bills/${billId}`),
  });

  const payMutation = useMutation({
    mutationFn: () => api.post(`/bills/${billId}/pay`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill', billId] });
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
    onError: (e: any) => Alert.alert('Payment failed', e.message),
  });

  const bill = data?.bill;
  const allocations = data?.allocations ?? [];

  const canPay = bill && (bill.state === 'due' || bill.state === 'overdue');
  const canEdit = (role === 'master_tenant' || role === 'landlord' || role === 'agent') && bill?.state !== 'paid';

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Bill details" />
        <View style={{ padding: Layout.screenPadding, gap: 12 }}>
          <CardSkeleton />
          <CardSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  if (!bill) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Bill details"
        rightAction={
          canEdit
            ? { label: 'Edit', onPress: () => navigation.navigate('AddBill', { billId }) }
            : undefined
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.billTitle}>{bill.title}</Text>
            <Chip tone={billStateTone(bill.state)} label={billStateLabel(bill.state)} />
          </View>
          <Text style={styles.amount}>{formatNaira(bill.totalAmount)}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Text style={styles.metaText}>{billTypeLabel(bill.type)}</Text>
            </View>
            <Text style={styles.dueDate}>Due {formatDueDate(bill.dueDate)}</Text>
          </View>
        </View>

        {/* Line items */}
        {bill.lineItems && bill.lineItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Breakdown</Text>
            {bill.lineItems.map((item) => (
              <View key={item.id} style={styles.lineRow}>
                <Text style={styles.lineDesc}>{item.description}</Text>
                <Text style={styles.lineAmount}>{formatNaira(item.amount)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Allocations */}
        {allocations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Who owes what</Text>
            {allocations.map((alloc) => (
              <View key={alloc.id} style={styles.allocRow}>
                <View style={styles.allocAvatar}>
                  <Text style={styles.allocAvatarText}>
                    {(alloc.memberName ?? '?')[0].toUpperCase()}
                  </Text>
                </View>
                <View style={styles.allocInfo}>
                  <Text style={styles.allocName}>{alloc.memberName}</Text>
                  <Text style={styles.allocUnit}>{alloc.householdName}</Text>
                </View>
                <View style={styles.allocRight}>
                  <Text style={styles.allocAmount}>{formatNaira(alloc.amount)}</Text>
                  <Chip
                    tone={billStateTone(alloc.paid ? 'paid' : 'due')}
                    label={alloc.paid ? 'Paid' : 'Due'}
                    size="sm"
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {canPay && (
          <Button
            label={`Pay ${formatNaira(bill.totalAmount)}`}
            onPress={() => payMutation.mutate()}
            loading={payMutation.isPending}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.screen },
  content: { padding: Layout.screenPadding, paddingBottom: Layout.contentBottomPadding, gap: 16 },
  summaryCard: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.card,
    padding: 20,
    gap: 8,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  billTitle: { ...Typography.title, color: Colors.white, flex: 1, marginRight: 8 },
  amount: { ...Typography.amountLarge, color: Colors.green },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  metaPill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  metaText: { ...Typography.captionSmall, color: Colors.white },
  dueDate: { ...Typography.caption, color: Colors.textMuted },
  section: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 16,
    gap: 12,
  },
  sectionLabel: { ...Typography.label, color: Colors.ink, marginBottom: 4 },
  lineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lineDesc: { ...Typography.body, color: Colors.textSecondary, flex: 1 },
  lineAmount: { ...Typography.label, color: Colors.ink },
  allocRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  allocAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.violetTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allocAvatarText: { ...Typography.label, color: Colors.violet },
  allocInfo: { flex: 1 },
  allocName: { ...Typography.label, color: Colors.ink },
  allocUnit: { ...Typography.caption, color: Colors.textSecondary },
  allocRight: { alignItems: 'flex-end', gap: 4 },
  allocAmount: { ...Typography.label, color: Colors.ink },
});
