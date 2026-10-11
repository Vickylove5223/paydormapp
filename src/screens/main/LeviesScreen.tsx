import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Svg, { Path, Rect, Circle, Ellipse } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Layout, Radius } from '@/theme';
import { useAppStore } from '@/store/app';
import { Bill } from '@/types';
import { formatNaira } from '@/utils/money';
import { formatDueDate } from '@/utils/date';
import { billStateTone, billStateLabel } from '@/components/common/Chip';

type BillCategory = 'all' | 'shared' | 'one_time' | 'private' | 'copartner';

interface ManagedBill extends Bill {
  category: 'shared' | 'one_time' | 'private' | 'copartner';
  tenantName?: string;
  household?: string;
}

const ALL_BILLS: ManagedBill[] = [
  // Shared
  { id: 'b1', type: 'electricity', title: 'August EKEDC', totalAmount: 1200000, dueDate: '2026-10-05', state: 'overdue', period: '2026-10', category: 'shared', tenantName: 'All tenants' },
  { id: 'b2', type: 'service_charge', title: 'October Service Charge', totalAmount: 500000, dueDate: '2026-10-15', state: 'due', period: '2026-10', category: 'shared', tenantName: 'All tenants' },
  { id: 'b3', type: 'water', title: 'Water Supply — Q4', totalAmount: 350000, dueDate: '2026-10-30', state: 'upcoming', period: '2026-10', category: 'shared', tenantName: 'All tenants' },
  { id: 'b4', type: 'security', title: 'Security Charge', totalAmount: 200000, dueDate: '2026-10-20', state: 'upcoming', period: '2026-10', category: 'shared', tenantName: 'All tenants' },
  { id: 'b5', type: 'internet', title: 'Estate Wi-Fi', totalAmount: 150000, dueDate: '2026-10-01', state: 'paid', period: '2026-10', category: 'shared', tenantName: 'All tenants' },
  { id: 'b6', type: 'electricity', title: 'September EKEDC', totalAmount: 1100000, dueDate: '2026-09-05', state: 'paid', period: '2026-09', category: 'shared', tenantName: 'All tenants' },
  // One-time
  { id: 'ot1', type: 'other', title: 'Flat 3B — Plumbing repair', totalAmount: 180000, dueDate: '2026-10-18', state: 'due', period: '2026-10', category: 'one_time', tenantName: 'Femi Adekunle', household: 'Flat 3B' },
  { id: 'ot2', type: 'other', title: 'Window replacement', totalAmount: 95000, dueDate: '2026-09-30', state: 'paid', period: '2026-09', category: 'one_time', tenantName: 'Amara Nwosu', household: 'Flat 1A' },
  // Private
  { id: 'pb1', type: 'other', title: 'Netflix subscription', totalAmount: 45000, dueDate: '2026-10-25', state: 'upcoming', period: '2026-10', category: 'private' },
  { id: 'pb2', type: 'internet', title: 'Personal fibre — Q4', totalAmount: 120000, dueDate: '2026-10-01', state: 'paid', period: '2026-10', category: 'private' },
  { id: 'pb3', type: 'other', title: 'Amazon Prime', totalAmount: 35000, dueDate: '2026-09-20', state: 'paid', period: '2026-09', category: 'private' },
  // Co-partner
  { id: 'cp0', type: 'other', title: 'Joint streaming plan', totalAmount: 60000, dueDate: '2026-10-20', state: 'paid', period: '2026-10', category: 'copartner', tenantName: 'Femi Adekunle + 1' },
  { id: 'cp2', type: 'internet', title: 'Shared broadband', totalAmount: 90000, dueDate: '2026-10-15', state: 'due', period: '2026-10', category: 'copartner', tenantName: 'Kemi Okafor + 1' },
  { id: 'cp3', type: 'other', title: 'Joint streaming plan', totalAmount: 60000, dueDate: '2026-09-20', state: 'paid', period: '2026-09', category: 'copartner', tenantName: 'Tolu Adeyemi + 1' },
];

const CATEGORY_META: Record<string, { label: string; icon: () => React.ReactElement; iconBg: string }> = {
  shared: { label: 'Shared', icon: BuildingIcon, iconBg: Colors.mint },
  one_time: { label: 'One-time', icon: DocumentIcon, iconBg: Colors.violetTint },
  private: { label: 'Private', icon: LockIcon, iconBg: Colors.screen },
  copartner: { label: 'Co-partner', icon: PeopleIcon, iconBg: Colors.violetTint },
};

const STATE_DOT: Record<string, string> = {
  paid: Colors.green,
  overdue: '#E8724A',
  due: '#F0A060',
  upcoming: Colors.textMuted,
};

// ── Icons ──────────────────────────────────────────────────────────────────────

function BuildingIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 32 32" fill="none">
      <Path d="M6 28V10l10-6 10 6v18H6z" fill="#A98BFF" stroke="#0C1822" strokeWidth="2" strokeLinejoin="round" />
      <Path d="M4 28h24" stroke="#0C1822" strokeWidth="2" strokeLinecap="round" />
      <Rect x="13" y="19" width="6" height="9" rx="1" fill="#F4F7F5" stroke="#0C1822" strokeWidth="1.6" />
      <Rect x="8" y="13" width="4" height="4" rx="1" fill="#40CE86" stroke="#0C1822" strokeWidth="1.4" />
      <Rect x="20" y="13" width="4" height="4" rx="1" fill="#40CE86" stroke="#0C1822" strokeWidth="1.4" />
    </Svg>
  );
}

function DocumentIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="16" rx="2" fill={Colors.violet} stroke="#0C1822" strokeWidth="1.8" />
      <Path d="M7 9h10M7 13h6" stroke="#F4F7F5" strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}

function LockIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="11" width="14" height="10" rx="2" fill={Colors.violet} stroke="#0C1822" strokeWidth="1.8" />
      <Path d="M8 11V7a4 4 0 018 0v4" stroke="#0C1822" strokeWidth="1.8" strokeLinecap="round" />
      <Circle cx="12" cy="16" r="1.5" fill="#40CE86" />
    </Svg>
  );
}

function PeopleIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="7" r="3" fill={Colors.violet} stroke="#0C1822" strokeWidth="1.6" />
      <Circle cx="17" cy="8" r="2.5" fill={Colors.violet} stroke="#0C1822" strokeWidth="1.4" />
      <Path d="M3 19c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="#0C1822" strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M17 14c1.657 0 3 1.119 3 3.333" stroke="#0C1822" strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}

function EditIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={Colors.textSecondary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={Colors.textSecondary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function TrashIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="#E8724A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Bill row ───────────────────────────────────────────────────────────────────

function BillRow({
  item,
  onPress,
  onEdit,
  onDelete,
}: {
  item: ManagedBill;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const meta = CATEGORY_META[item.category];
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.iconBox, { backgroundColor: meta.iconBg }]}>
        <meta.icon />
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.rowMeta}>
          <Text style={styles.rowDue}>{formatDueDate(item.dueDate)}</Text>
          {item.tenantName && <Text style={styles.rowTenant} numberOfLines={1}> · {item.tenantName}</Text>}
        </View>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.rowAmount}>{formatNaira(item.totalAmount)}</Text>
        <View style={styles.rowStatusRow}>
          <View style={[styles.dot, { backgroundColor: STATE_DOT[item.state] ?? Colors.textMuted }]} />
          <Text style={styles.rowState}>{billStateLabel(item.state)}</Text>
        </View>
      </View>
      <View style={styles.rowActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}>
          <EditIcon />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
          <TrashIcon />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ── Category section header ────────────────────────────────────────────────────

function CategoryHeader({ label, count, total }: { label: string; count: number; total: number }) {
  return (
    <View style={styles.catHeader}>
      <Text style={styles.catLabel}>{label}</Text>
      <Text style={styles.catMeta}>{count} bills · {formatNaira(total)}</Text>
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────

const FILTERS: { id: BillCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'shared', label: 'Shared' },
  { id: 'one_time', label: 'One-time' },
  { id: 'private', label: 'Private' },
  { id: 'copartner', label: 'Co-partner' },
];

export function LeviesScreen() {
  const navigation = useNavigation<any>();
  const { role } = useAppStore();
  const effectiveRole = role ?? 'master_tenant';
  const canManage = effectiveRole === 'master_tenant' || effectiveRole === 'landlord' || effectiveRole === 'agent';

  const [filter, setFilter] = useState<BillCategory>('all');
  const [bills, setBills] = useState<ManagedBill[]>(ALL_BILLS);

  const filtered = filter === 'all' ? bills : bills.filter(b => b.category === filter);

  // Group by category for "all" view
  const categories: Array<'shared' | 'one_time' | 'private' | 'copartner'> = ['shared', 'one_time', 'private', 'copartner'];

  const totalCollected = bills.filter(b => b.state === 'paid').reduce((s, b) => s + b.totalAmount, 0);

  const handleDelete = (id: string) => {
    Alert.alert('Remove bill', 'Are you sure you want to remove this bill?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setBills(prev => prev.filter(b => b.id !== id)) },
    ]);
  };

  type ListItem =
    | { type: 'header'; category: string; count: number; total: number; key: string }
    | { type: 'bill'; bill: ManagedBill; key: string };

  const listData: ListItem[] = [];

  if (filter === 'all') {
    categories.forEach(cat => {
      const catBills = bills.filter(b => b.category === cat);
      if (catBills.length === 0) return;
      const meta = CATEGORY_META[cat];
      const catTotal = catBills.reduce((s, b) => s + b.totalAmount, 0);
      listData.push({ type: 'header', category: meta.label, count: catBills.length, total: catTotal, key: `hdr-${cat}` });
      catBills.forEach(b => listData.push({ type: 'bill', bill: b, key: b.id }));
    });
  } else {
    filtered.forEach(b => listData.push({ type: 'bill', bill: b, key: b.id }));
  }

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'header') {
      return <CategoryHeader label={item.category} count={item.count} total={item.total} />;
    }
    return (
      <BillRow
        item={item.bill}
        onPress={() => navigation.navigate('BillDetail', { billId: item.bill.id })}
        onEdit={() => navigation.navigate('AddBill', { billId: item.bill.id })}
        onDelete={() => handleDelete(item.bill.id)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Charges</Text>
          <Text style={styles.headerSub}>Bill management</Text>
        </View>
        {canManage && (
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddBill', {})}>
            <Text style={styles.addBtnText}>+ Add bill</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total collected</Text>
        <Text style={styles.summaryAmount}>{formatNaira(totalCollected)}</Text>
        <Text style={styles.summaryMeta}>{bills.filter(b => b.state === 'paid').length} of {bills.length} bills paid</Text>
      </View>

      {/* Filter chips */}
      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={f => f.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item: f }) => (
          <TouchableOpacity
            style={[styles.chip, filter === f.id && styles.chipActive]}
            onPress={() => setFilter(f.id)}
          >
            <Text style={[styles.chipText, filter === f.id && styles.chipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={item => item.key}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.screen },

  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding, paddingVertical: 16,
  },
  headerTitle: { ...Typography.h2, color: Colors.ink },
  headerSub: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  addBtn: { backgroundColor: Colors.ink, borderRadius: 99, paddingHorizontal: 14, paddingVertical: 8, marginTop: 4 },
  addBtnText: { ...Typography.buttonSmall, color: Colors.green },

  summaryCard: {
    marginHorizontal: Layout.screenPadding, marginBottom: 12,
    backgroundColor: Colors.ink, borderRadius: Radius.card, padding: 16,
  },
  summaryLabel: { ...Typography.caption, color: 'rgba(255,255,255,0.65)', marginBottom: 4 },
  summaryAmount: { ...Typography.amount, color: Colors.white },
  summaryMeta: { ...Typography.captionSmall, color: 'rgba(255,255,255,0.5)', marginTop: 4 },

  filterRow: { paddingHorizontal: Layout.screenPadding, paddingBottom: 12, gap: 8 },
  chip: {
    borderWidth: 1.5, borderColor: Colors.ink, borderRadius: 99,
    paddingHorizontal: 14, paddingVertical: 6, backgroundColor: Colors.white,
  },
  chipActive: { backgroundColor: Colors.green },
  chipText: { ...Typography.captionSmall, color: Colors.ink, fontFamily: 'Syne_800ExtraBold' },
  chipTextActive: { color: Colors.ink },

  list: { paddingHorizontal: Layout.screenPadding, paddingBottom: Layout.contentBottomPadding, gap: 8 },

  catHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 6, marginTop: 4,
  },
  catLabel: { ...Typography.label, color: Colors.ink, fontFamily: 'Syne_800ExtraBold' },
  catMeta: { ...Typography.captionSmall, color: Colors.textMuted },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.white, borderRadius: Radius.cardSm,
    borderWidth: 1, borderColor: Colors.line, padding: 12,
  },
  iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowInfo: { flex: 1, gap: 3 },
  rowTitle: { ...Typography.label, color: Colors.ink },
  rowMeta: { flexDirection: 'row', alignItems: 'center' },
  rowDue: { ...Typography.captionSmall, color: Colors.textSecondary },
  rowTenant: { ...Typography.captionSmall, color: Colors.textMuted, flexShrink: 1 },
  rowRight: { alignItems: 'flex-end', gap: 4 },
  rowAmount: { ...Typography.label, color: Colors.ink },
  rowStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  rowState: { ...Typography.captionSmall, color: Colors.textMuted },
  rowActions: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 4 },
  actionBtn: { padding: 4 },
});
