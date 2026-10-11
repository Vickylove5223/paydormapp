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
import { Colors, Typography, Layout, Radius } from '@/theme';
import { useAppStore } from '@/store/app';
import { api } from '@/api/client';
import { LevyRow, BillType } from '@/types';
import { formatNaira } from '@/utils/money';
import { timeAgo } from '@/utils/date';
import { Chip, billTypeTone, billTypeLabel } from '@/components/common/Chip';
import { CardSkeleton } from '@/components/common/SkeletonLoader';
import { EmptyState } from '@/components/common/EmptyState';

type FilterType = 'all' | 'shared' | 'one_time';

export function LeviesScreen() {
  const navigation = useNavigation<any>();
  const { activePropertyId } = useAppStore();
  const [filter, setFilter] = useState<FilterType>('all');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['levies', activePropertyId, filter],
    queryFn: () =>
      api.get<{ totalCollected: number; rows: LevyRow[] }>(
        `/levies?propertyId=${activePropertyId ?? ''}${filter !== 'all' ? `&type=${filter}` : ''}`
      ),
    enabled: !!activePropertyId,
  });

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'shared', label: 'Shared' },
    { id: 'one_time', label: 'One-time' },
  ];

  const renderRow = ({ item }: { item: LevyRow }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => navigation.navigate('PaymentDetail', { paymentId: item.paymentId })}
      activeOpacity={0.8}
    >
      <View style={styles.rowAvatar}>
        <Text style={styles.rowAvatarText}>{item.tenantName.charAt(0)}</Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{item.tenantName}</Text>
        <View style={styles.rowBillRow}>
          <Chip label={billTypeLabel(item.billType)} tone={billTypeTone(item.billType)} />
          <Text style={styles.rowBillTitle} numberOfLines={1}>{item.billTitle}</Text>
        </View>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.rowAmount}>{formatNaira(item.amount)}</Text>
        <Text style={styles.rowTime}>{timeAgo(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Levies</Text>
        <Text style={styles.headerSubtitle}>Payment ledger</Text>
      </View>

      {/* Total collected */}
      {data && (
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Collected this month</Text>
          <Text style={styles.totalAmount}>{formatNaira(data.totalCollected)}</Text>
        </View>
      )}

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
            onPress={() => setFilter(f.id)}
          >
            <Text style={[styles.filterChipText, filter === f.id && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={{ padding: Layout.screenPadding, gap: 12 }}>
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </View>
      ) : !data?.rows.length ? (
        <EmptyState
          title="No payments yet"
          subtitle="Payments made by tenants will appear here."
        />
      ) : (
        <FlatList
          data={data.rows}
          renderItem={renderRow}
          keyExtractor={(item) => item.paymentId}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.green} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.screen },
  header: {
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: 16,
    backgroundColor: Colors.screen,
  },
  headerTitle: { ...Typography.h2, color: Colors.ink },
  headerSubtitle: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  totalCard: {
    margin: Layout.screenPadding,
    backgroundColor: Colors.ink,
    borderRadius: Radius.card,
    padding: 16,
  },
  totalLabel: { ...Typography.caption, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  totalAmount: { ...Typography.amount, color: Colors.white },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    borderWidth: 1.5,
    borderColor: Colors.ink,
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: Colors.white,
  },
  filterChipActive: {
    backgroundColor: Colors.green,
  },
  filterChipText: {
    ...Typography.captionSmall,
    color: Colors.ink,
    fontFamily: 'Syne_800ExtraBold',
  },
  filterChipTextActive: { color: Colors.ink },
  list: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Layout.contentBottomPadding,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.cardSm,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  rowAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.mint,
    borderWidth: 1.5,
    borderColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowAvatarText: { ...Typography.label, color: Colors.ink },
  rowInfo: { flex: 1, gap: 4 },
  rowName: { ...Typography.label, color: Colors.ink },
  rowBillRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowBillTitle: { ...Typography.caption, color: Colors.textSecondary, flex: 1 },
  rowRight: { alignItems: 'flex-end', gap: 2 },
  rowAmount: { ...Typography.label, color: Colors.ink },
  rowTime: { ...Typography.caption, color: Colors.textMuted },
});
