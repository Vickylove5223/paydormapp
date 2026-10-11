import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BillsStackParams } from '@/navigation/types';
import { Colors, Typography, Layout, Radius } from '@/theme';
import { Bill } from '@/types';
import { formatNaira } from '@/utils/money';
import { formatDueDate } from '@/utils/date';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { billTypeLabel } from '@/components/common/Chip';
import { Button } from '@/components/common/Button';
import { useAppStore } from '@/store/app';

type Props = NativeStackScreenProps<BillsStackParams, 'BillDetail'>;

interface AllocationRow {
  id: string;
  billId: string;
  amount: number;
  paid: boolean;
  memberName?: string;
  householdName?: string;
}

const MOCK_BILL_DETAILS: Record<string, { bill: Bill; allocations: AllocationRow[] }> = {
  b1: {
    bill: { id: 'b1', type: 'electricity', title: 'August EKEDC', totalAmount: 1200000, dueDate: '2026-10-05', state: 'overdue', period: '2026-08' },
    allocations: [
      { id: 'a1', billId: 'b1', memberName: 'Tolu Adeyemi', householdName: 'Flat 3B', amount: 400000, paid: true },
      { id: 'a2', billId: 'b1', memberName: 'Kemi Okafor', householdName: 'Flat 2A', amount: 400000, paid: false },
      { id: 'a3', billId: 'b1', memberName: 'Femi Adekunle', householdName: 'Flat 4C', amount: 400000, paid: true },
    ],
  },
  b2: {
    bill: { id: 'b2', type: 'service_charge', title: 'October Service Charge', totalAmount: 500000, dueDate: '2026-10-15', state: 'due', period: '2026-10' },
    allocations: [
      { id: 'a4', billId: 'b2', memberName: 'Tolu Adeyemi', householdName: 'Flat 3B', amount: 250000, paid: false },
      { id: 'a5', billId: 'b2', memberName: 'Kemi Okafor', householdName: 'Flat 2A', amount: 250000, paid: true },
    ],
  },
  '1': {
    bill: { id: '1', type: 'electricity', title: 'August EKEDC', totalAmount: 1200000, dueDate: '2026-10-05', state: 'overdue', period: '2026-08' },
    allocations: [
      { id: 'a1', billId: '1', memberName: 'Tolu Adeyemi', householdName: 'Flat 3B', amount: 400000, paid: true },
      { id: 'a2', billId: '1', memberName: 'Kemi Okafor', householdName: 'Flat 2A', amount: 400000, paid: false },
      { id: 'a3', billId: '1', memberName: 'Femi Adekunle', householdName: 'Flat 4C', amount: 400000, paid: true },
    ],
  },
  '2': {
    bill: { id: '2', type: 'service_charge', title: 'Service charge', totalAmount: 500000, dueDate: '2026-10-15', state: 'due', period: '2026-10' },
    allocations: [
      { id: 'a4', billId: '2', memberName: 'Tolu Adeyemi', householdName: 'Flat 3B', amount: 250000, paid: false },
      { id: 'a5', billId: '2', memberName: 'Kemi Okafor', householdName: 'Flat 2A', amount: 250000, paid: true },
    ],
  },
  '3': {
    bill: { id: '3', type: 'water', title: 'Water supply', totalAmount: 350000, dueDate: '2026-10-30', state: 'upcoming', period: '2026-10' },
    allocations: [],
  },
  ot1: {
    bill: { id: 'ot1', type: 'other', title: 'Flat 3B — Plumbing repair', totalAmount: 180000, dueDate: '2026-10-18', state: 'due', period: '2026-10' },
    allocations: [
      { id: 'oa1', billId: 'ot1', memberName: 'Femi Adekunle', householdName: 'Flat 3B', amount: 180000, paid: false },
    ],
  },
  cp0: {
    bill: { id: 'cp0', type: 'other', title: 'Joint streaming plan', totalAmount: 60000, dueDate: '2026-10-20', state: 'paid', period: '2026-10' },
    allocations: [
      { id: 'ca1', billId: 'cp0', memberName: 'Femi Adekunle', householdName: 'Flat 4C', amount: 30000, paid: true },
      { id: 'ca2', billId: 'cp0', memberName: 'Tolu Adeyemi', householdName: 'Flat 3B', amount: 30000, paid: true },
    ],
  },
  cp2: {
    bill: { id: 'cp2', type: 'internet', title: 'Shared broadband', totalAmount: 90000, dueDate: '2026-10-15', state: 'due', period: '2026-10' },
    allocations: [
      { id: 'ca3', billId: 'cp2', memberName: 'Kemi Okafor', householdName: 'Flat 2A', amount: 45000, paid: false },
      { id: 'ca4', billId: 'cp2', memberName: 'Ngozi Eze', householdName: 'Flat 6E', amount: 45000, paid: false },
    ],
  },
};

const FALLBACK = MOCK_BILL_DETAILS.b1;

const STATE_COLORS: Record<string, string> = {
  paid: Colors.green,
  overdue: Colors.clay,
  due: Colors.white,
  upcoming: 'rgba(255,255,255,0.6)',
};

// Zigzag SVG that transitions from violet (above) to white (below)
function ZigzagEdge() {
  const W = 400;
  const H = 20;
  const teeth = 22;
  const tw = W / teeth;
  let d = `M0 ${H}`;
  for (let i = 0; i < teeth; i++) {
    d += ` L${i * tw + tw / 2} 0 L${(i + 1) * tw} ${H}`;
  }
  d += ` L${W} 0 L0 0 Z`;
  return (
    <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <Path d={d} fill={Colors.violet} />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} fill={Colors.green} />
      <Path d="M7.5 12l3 3 6-6" stroke={Colors.ink} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PendingIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} stroke="rgba(0,0,0,0.15)" strokeWidth={2} />
    </Svg>
  );
}

export function BillDetailScreen({ route, navigation }: Props) {
  const { billId } = route.params;
  const role = useAppStore((s) => s.role);
  const effectiveRole = role ?? 'landlord';

  const mockData = MOCK_BILL_DETAILS[billId] ?? FALLBACK;
  const [billState, setBillState] = useState(mockData.bill.state);
  const [allocations] = useState(mockData.allocations);
  const [showPaySuccess, setShowPaySuccess] = useState(false);

  const bill = { ...mockData.bill, state: billState };
  const canPay = bill.state === 'due' || bill.state === 'overdue';
  const canEdit = (effectiveRole === 'master_tenant' || effectiveRole === 'landlord' || effectiveRole === 'agent') && bill.state !== 'paid';

  const handlePay = () => {
    setShowPaySuccess(true);
    setTimeout(() => {
      setShowPaySuccess(false);
      setBillState('paid');
    }, 1800);
  };

  const collected = allocations.filter(a => a.paid).reduce((s, a) => s + a.amount, 0);
  const outstanding = allocations.filter(a => !a.paid).reduce((s, a) => s + a.amount, 0);
  const total = allocations.reduce((s, a) => s + a.amount, 0);
  const progressPct = total > 0 ? Math.round((collected / total) * 100) : 0;
  const paidCount = allocations.filter(a => a.paid).length;

  const stateColor = STATE_COLORS[billState] ?? Colors.white;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Custom header on violet bg */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 5l-7 7 7 7" stroke={Colors.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Bill details</Text>
        {canEdit
          ? <TouchableOpacity onPress={() => navigation.navigate('AddBill', { billId })}><Text style={styles.topBarEdit}>Edit</Text></TouchableOpacity>
          : <View style={{ width: 36 }} />
        }
      </View>

      {/* Summary section (violet bg) */}
      <View style={styles.summary}>
        <View style={styles.summaryTop}>
          <Text style={styles.billTitle}>{bill.title}</Text>
          <View style={[styles.stateBadge, { borderColor: stateColor }]}>
            <Text style={[styles.stateBadgeText, { color: stateColor }]}>
              {billState.charAt(0).toUpperCase() + billState.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={styles.amount}>{formatNaira(bill.totalAmount)}</Text>
        <View style={styles.metaRow}>
          <View style={styles.typePill}>
            <Text style={styles.typeText}>{billTypeLabel(bill.type)}</Text>
          </View>
          <Text style={styles.dueText}>{formatDueDate(bill.dueDate)}</Text>
        </View>
      </View>

      {/* Zigzag transition to white */}
      <ZigzagEdge />

      {/* White receipt section */}
      <ScrollView style={styles.receiptScroll} contentContainerStyle={styles.receiptContent} showsVerticalScrollIndicator={false}>

        {allocations.length > 0 && (
          <>
            {/* Progress row */}
            <View style={styles.progressRow}>
              <View>
                <Text style={styles.progLabel}>Collected</Text>
                <Text style={styles.progAmount}>{formatNaira(collected)}</Text>
              </View>
              <View style={styles.progPctBadge}>
                <Text style={styles.progPctText}>{progressPct}%</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.progLabel}>Outstanding</Text>
                <Text style={[styles.progAmount, { color: outstanding > 0 ? '#E8724A' : Colors.textMuted }]}>
                  {formatNaira(outstanding)}
                </Text>
              </View>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct}%` as any }]} />
            </View>
            <Text style={styles.progCaption}>{paidCount} of {allocations.length} tenants paid</Text>

            {/* Dashed separator */}
            <View style={styles.dashedLine} />

            {/* Tenants list */}
            <Text style={styles.listLabel}>WHO PAYS WHAT</Text>
            {allocations.map((alloc, i) => (
              <View key={alloc.id}>
                {i > 0 && <View style={styles.rowDivider} />}
                <View style={styles.allocRow}>
                  <View style={[styles.avatar, alloc.paid && styles.avatarPaid]}>
                    <Text style={[styles.avatarText, alloc.paid && { color: Colors.ink }]}>
                      {(alloc.memberName ?? '?')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.allocInfo}>
                    <Text style={styles.allocName}>{alloc.memberName}</Text>
                    <Text style={styles.allocUnit}>{alloc.householdName}</Text>
                  </View>
                  <Text style={[styles.allocAmt, alloc.paid && { color: Colors.ink }]}>
                    {formatNaira(alloc.amount)}
                  </Text>
                  <View style={styles.checkWrap}>
                    {alloc.paid ? <CheckIcon /> : <PendingIcon />}
                  </View>
                </View>
              </View>
            ))}

            {/* Total bar */}
            <View style={styles.totalBar}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalAmt}>{formatNaira(total)}</Text>
            </View>
          </>
        )}

        {canPay && (
          <View style={{ marginTop: 16 }}>
            <Button label={`Pay ${formatNaira(bill.totalAmount)}`} onPress={handlePay} />
          </View>
        )}

        {billState === 'paid' && (
          <View style={styles.paidBanner}>
            <Text style={styles.paidBannerText}>✓ Fully paid</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={showPaySuccess} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.successCard}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successTitle}>Payment successful!</Text>
            <Text style={styles.successSub}>{formatNaira(bill.totalAmount)} paid for {bill.title}</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.violet },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding, paddingTop: 8, paddingBottom: 4,
  },
  backBtn: { width: 36 },
  topBarTitle: { ...Typography.label, color: Colors.white, fontFamily: 'Syne_800ExtraBold', fontSize: 16 },
  topBarEdit: { ...Typography.label, color: 'rgba(255,255,255,0.8)', textAlign: 'right', width: 36 },

  // Summary on violet
  summary: { paddingHorizontal: Layout.screenPadding, paddingTop: 12, paddingBottom: 24, gap: 8 },
  summaryTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  billTitle: { ...Typography.h1, color: Colors.white, flex: 1, marginRight: 12 },
  stateBadge: {
    borderWidth: 1.5, borderRadius: 99,
    paddingHorizontal: 12, paddingVertical: 5,
    flexShrink: 0, alignSelf: 'flex-start',
  },
  stateBadgeText: { ...Typography.captionSmall, fontFamily: 'DMSans_700Bold' },
  amount: { ...Typography.amountLarge, color: Colors.green, marginTop: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  typePill: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 99,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  typeText: { ...Typography.captionSmall, color: Colors.white, fontFamily: 'DMSans_700Bold' },
  dueText: { ...Typography.caption, color: 'rgba(255,255,255,0.7)' },

  // White receipt area
  receiptScroll: { flex: 1, backgroundColor: Colors.white },
  receiptContent: {
    padding: Layout.screenPadding,
    paddingBottom: Layout.contentBottomPadding,
  },

  // Progress
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  progLabel: { ...Typography.captionSmall, color: Colors.textSecondary, marginBottom: 2 },
  progAmount: { ...Typography.label, color: Colors.ink, fontFamily: 'Syne_800ExtraBold' },
  progPctBadge: {
    backgroundColor: Colors.mint, borderRadius: 99,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  progPctText: { ...Typography.label, color: Colors.ink, fontFamily: 'Syne_800ExtraBold' },
  progressTrack: { height: 6, backgroundColor: Colors.line, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: 6, backgroundColor: Colors.green, borderRadius: 3 },
  progCaption: { ...Typography.captionSmall, color: Colors.textMuted },

  dashedLine: {
    height: 1, borderWidth: 1, borderColor: Colors.line,
    borderStyle: 'dashed', marginVertical: 16,
  },

  listLabel: {
    ...Typography.captionSmall, color: Colors.textMuted,
    letterSpacing: 1.4, fontFamily: 'DMSans_700Bold',
    marginBottom: 12,
  },

  rowDivider: { height: 1, backgroundColor: Colors.line },

  allocRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.screen, borderWidth: 1.5, borderColor: Colors.line,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarPaid: { backgroundColor: Colors.mint, borderColor: Colors.green },
  avatarText: { ...Typography.label, color: Colors.textSecondary },
  allocInfo: { flex: 1 },
  allocName: { ...Typography.label, color: Colors.ink },
  allocUnit: { ...Typography.captionSmall, color: Colors.textSecondary },
  allocAmt: { ...Typography.label, color: Colors.textMuted },
  checkWrap: { width: 28, alignItems: 'center' },

  totalBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.ink, borderRadius: Radius.cardSm,
    paddingHorizontal: 16, paddingVertical: 14, marginTop: 8,
  },
  totalLabel: {
    ...Typography.captionSmall, color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.4, fontFamily: 'DMSans_700Bold',
  },
  totalAmt: { ...Typography.label, color: Colors.green, fontFamily: 'Syne_800ExtraBold', fontSize: 15 },

  paidBanner: {
    backgroundColor: Colors.mint, borderRadius: Radius.cardSm,
    padding: 14, alignItems: 'center', marginTop: 16,
    borderWidth: 1, borderColor: Colors.green,
  },
  paidBannerText: { ...Typography.label, color: Colors.ink, fontFamily: 'Syne_800ExtraBold' },

  overlay: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: 'rgba(12,24,34,0.75)', alignItems: 'center', justifyContent: 'center',
  },
  successCard: {
    backgroundColor: Colors.white, borderRadius: Radius.card,
    padding: 32, alignItems: 'center', gap: 10, marginHorizontal: 40,
  },
  successIcon: { fontSize: 48, color: Colors.green },
  successTitle: { ...Typography.title, color: Colors.ink },
  successSub: { ...Typography.caption, color: Colors.textSecondary, textAlign: 'center' },
});
