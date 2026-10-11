import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Colors, Typography, Layout, Spacing, Radius } from '@/theme';
import { useAppStore } from '@/store/app';
import { api } from '@/api/client';
import { Bill, BillType, UserRole } from '@/types';
import { formatNaira } from '@/utils/money';
import { formatDueDate } from '@/utils/date';
import { Chip, billStateTone, billTypeLabel, billTypeTone } from '@/components/common/Chip';
import { CardSkeleton } from '@/components/common/SkeletonLoader';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/common/Button';

export function BillsScreen() {
  const navigation = useNavigation<any>();
  const { activePropertyId, role, privateMode } = useAppStore();

  const canAddBill = role === 'master_tenant' || role === 'landlord' || role === 'agent';

  const { data: bills = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['bills', activePropertyId],
    queryFn: () =>
      api.get<Bill[]>(`/bills?propertyId=${activePropertyId ?? ''}`),
  });

  const grouped = groupBills(bills);

  const renderBillItem = ({ item }: { item: Bill }) => (
    <TouchableOpacity
      style={styles.billCard}
      onPress={() => navigation.navigate('BillDetail', { billId: item.id })}
      activeOpacity={0.8}
    >
      <View style={styles.billTop}>
        <Chip label={billTypeLabel(item.type)} tone={billTypeTone(item.type)} />
        <Chip
          label={item.state === 'paid' ? 'Paid' : item.state === 'overdue' ? 'Overdue' : item.state === 'due' ? 'Due soon' : 'Upcoming'}
          tone={billStateTone(item.state)}
        />
      </View>
      <Text style={styles.billTitle}>{item.title}</Text>
      <View style={styles.billBottom}>
        <Text style={styles.billAmount}>{formatNaira(item.totalAmount)}</Text>
        <Text style={styles.billDue}>{formatDueDate(item.dueDate)}</Text>
      </View>
      {item.state !== 'paid' && (
        <TouchableOpacity style={styles.payBtn}>
          <Text style={styles.payBtnText}>Pay</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bills</Text>
        {canAddBill && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddBill', {})}
          >
            <Text style={styles.addBtnText}>+ Add bill</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </View>
      ) : bills.length === 0 ? (
        <EmptyState
          title="No bills yet"
          subtitle={canAddBill ? 'Add your first bill to start splitting costs.' : 'No bills have been added to this property yet.'}
          actionLabel={canAddBill ? 'Add bill' : undefined}
          onAction={canAddBill ? () => navigation.navigate('AddBill', {}) : undefined}
        />
      ) : (
        <FlatList
          data={bills}
          renderItem={renderBillItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.green} />
          }
          ListFooterComponent={
            !canAddBill ? (
              <TouchableOpacity style={styles.addPrivateLink} onPress={() => navigation.navigate('AddBill', { type: 'private' })}>
                <Text style={styles.addPrivateLinkText}>+ Add private bill</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

function groupBills(bills: Bill[]) {
  const order: Record<string, number> = { overdue: 0, due: 1, partially_paid: 2, upcoming: 3, paid: 4 };
  return [...bills].sort((a, b) => (order[a.state] ?? 5) - (order[b.state] ?? 5));
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.screen },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: 16,
    backgroundColor: Colors.screen,
  },
  headerTitle: { ...Typography.h2, color: Colors.ink },
  addBtn: {
    backgroundColor: Colors.ink,
    borderRadius: 99,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addBtnText: { ...Typography.buttonSmall, color: Colors.green },
  loadingContainer: { padding: Layout.screenPadding, gap: 12 },
  list: {
    padding: Layout.screenPadding,
    paddingBottom: Layout.contentBottomPadding,
    gap: 12,
  },
  billCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    borderWidth: 1.5,
    borderColor: Colors.line,
    padding: 16,
    gap: 8,
  },
  billTop: { flexDirection: 'row', gap: 8 },
  billTitle: { ...Typography.label, color: Colors.ink },
  billBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  billAmount: { ...Typography.amount, color: Colors.ink, fontSize: 22 },
  billDue: { ...Typography.caption, color: Colors.textSecondary },
  payBtn: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.ink,
    borderRadius: 99,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  payBtnText: { ...Typography.buttonSmall, color: Colors.green },
  addPrivateLink: {
    padding: 16,
    alignItems: 'center',
  },
  addPrivateLinkText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontFamily: 'Syne_800ExtraBold',
  },
});
