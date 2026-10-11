import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, Share, Alert } from 'react-native';
import Svg, { Path, Circle, Polygon, Ellipse, Rect } from 'react-native-svg';
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
  paidDate?: string;
  paymentId?: string;
  reference?: string;
  method?: string;
}

interface LineItem {
  id: string;
  label: string;
  description?: string;
  amount: number;
  paid?: boolean;
  paymentId?: string;
  reference?: string;
}

const MOCK_BILL_DETAILS: Record<string, { bill: Bill; allocations: AllocationRow[]; lineItems?: LineItem[] }> = {
  b1: {
    bill: { id: 'b1', type: 'electricity', title: 'August EKEDC', totalAmount: 1200000, dueDate: '2026-10-05', state: 'overdue', period: '2026-10' },
    allocations: [
      { id: 'a1', billId: 'b1', memberName: 'Tolu Adeyemi', householdName: 'Flat 3B', amount: 400000, paid: true, paidDate: '2026-10-03', paymentId: 'lv1', reference: 'PD-2026100001', method: 'wallet' },
      { id: 'a2', billId: 'b1', memberName: 'Kemi Okafor', householdName: 'Flat 2A', amount: 400000, paid: false },
      { id: 'a3', billId: 'b1', memberName: 'Femi Adekunle', householdName: 'Flat 4C', amount: 400000, paid: true, paidDate: '2026-10-04', paymentId: 'lv3', reference: 'PD-2026100003', method: 'wallet' },
    ],
  },
  b2: {
    bill: { id: 'b2', type: 'service_charge', title: 'October Service Charge', totalAmount: 500000, dueDate: '2026-10-15', state: 'due', period: '2026-10' },
    allocations: [
      { id: 'a4', billId: 'b2', memberName: 'Tolu Adeyemi', householdName: 'Flat 3B', amount: 250000, paid: false },
      { id: 'a5', billId: 'b2', memberName: 'Kemi Okafor', householdName: 'Flat 2A', amount: 250000, paid: true, paidDate: '2026-10-10', paymentId: 'lv2', reference: 'PD-2026100002', method: 'card' },
    ],
  },
  b3: {
    bill: { id: 'b3', type: 'water', title: 'Water Supply — Q4', totalAmount: 350000, dueDate: '2026-10-30', state: 'upcoming', period: '2026-10' },
    allocations: [
      { id: 'a6', billId: 'b3', memberName: 'Tolu Adeyemi', householdName: 'Flat 3B', amount: 116666, paid: false },
      { id: 'a7', billId: 'b3', memberName: 'Kemi Okafor', householdName: 'Flat 2A', amount: 116667, paid: false },
      { id: 'a8', billId: 'b3', memberName: 'Femi Adekunle', householdName: 'Flat 4C', amount: 116667, paid: false },
    ],
  },
  b4: {
    bill: { id: 'b4', type: 'security', title: 'Security Charge', totalAmount: 200000, dueDate: '2026-10-20', state: 'upcoming', period: '2026-10' },
    allocations: [
      { id: 'a9', billId: 'b4', memberName: 'Tolu Adeyemi', householdName: 'Flat 3B', amount: 100000, paid: false },
      { id: 'a10', billId: 'b4', memberName: 'Amara Nwosu', householdName: 'Flat 1A', amount: 100000, paid: false },
    ],
  },
  b5: {
    bill: { id: 'b5', type: 'internet', title: 'Estate Wi-Fi', totalAmount: 150000, dueDate: '2026-10-01', state: 'paid', period: '2026-10' },
    allocations: [
      { id: 'a11', billId: 'b5', memberName: 'Chidi Obi', householdName: 'Flat 5D', amount: 75000, paid: true, paidDate: '2026-10-01', paymentId: 'lv5', reference: 'PD-2026100005', method: 'wallet' },
      { id: 'a12', billId: 'b5', memberName: 'Kemi Okafor', householdName: 'Flat 2A', amount: 75000, paid: true, paidDate: '2026-10-01', paymentId: 'lv8', reference: 'PD-2026100008', method: 'bank_transfer' },
    ],
  },
  b6: {
    bill: { id: 'b6', type: 'electricity', title: 'September EKEDC', totalAmount: 1100000, dueDate: '2026-09-05', state: 'paid', period: '2026-09' },
    allocations: [
      { id: 'a13', billId: 'b6', memberName: 'Tolu Adeyemi', householdName: 'Flat 3B', amount: 550000, paid: true, paidDate: '2026-09-04', paymentId: 'mp3', reference: 'PD-2026090003', method: 'wallet' },
      { id: 'a14', billId: 'b6', memberName: 'Kemi Okafor', householdName: 'Flat 2A', amount: 550000, paid: true, paidDate: '2026-09-04', paymentId: 'lv6', reference: 'PD-2026100006', method: 'card' },
    ],
  },
  '1': {
    bill: { id: '1', type: 'electricity', title: 'August Bill', totalAmount: 1200000, dueDate: '2026-10-05', state: 'overdue', period: '2026-08' },
    allocations: [
      { id: 'a1', billId: '1', memberName: 'Tolu Adeyemi', householdName: 'Flat 3B', amount: 400000, paid: true, paidDate: '2026-10-03', paymentId: 'lv1', reference: 'PD-2026100001', method: 'wallet' },
      { id: 'a2', billId: '1', memberName: 'Kemi Okafor', householdName: 'Flat 2A', amount: 400000, paid: false },
      { id: 'a3', billId: '1', memberName: 'Femi Adekunle', householdName: 'Flat 4C', amount: 400000, paid: true, paidDate: '2026-10-04', paymentId: 'lv3', reference: 'PD-2026100003', method: 'wallet' },
    ],
  },
  '2': {
    bill: { id: '2', type: 'service_charge', title: 'Service charge', totalAmount: 500000, dueDate: '2026-10-15', state: 'due', period: '2026-10' },
    allocations: [
      { id: 'a4', billId: '2', memberName: 'Tolu Adeyemi', householdName: 'Flat 3B', amount: 250000, paid: false },
      { id: 'a5', billId: '2', memberName: 'Kemi Okafor', householdName: 'Flat 2A', amount: 250000, paid: true, paidDate: '2026-10-10', paymentId: 'lv2', reference: 'PD-2026100002', method: 'card' },
    ],
  },
  '3': {
    bill: { id: '3', type: 'water', title: 'Water supply', totalAmount: 350000, dueDate: '2026-10-30', state: 'upcoming', period: '2026-10' },
    allocations: [],
  },
  ot1: {
    bill: { id: 'ot1', type: 'other', title: 'Flat 3B — Plumbing repair', totalAmount: 180000, dueDate: '2026-10-18', state: 'due', period: '2026-10' },
    allocations: [],
    lineItems: [
      { id: 'li1', label: 'Labour fee', description: 'Plumber call-out', amount: 80000, paid: true, paymentId: 'lv4', reference: 'PD-2026100004' },
      { id: 'li2', label: 'Pipe replacement', description: 'Under-sink piping', amount: 60000, paid: false },
      { id: 'li3', label: 'Sealant & fittings', description: 'Materials', amount: 25000, paid: false },
      { id: 'li4', label: 'Service charge', description: 'Admin & inspection', amount: 15000, paid: false },
    ],
  },
  ot2: {
    bill: { id: 'ot2', type: 'other', title: 'Window replacement', totalAmount: 95000, dueDate: '2026-09-30', state: 'paid', period: '2026-09' },
    allocations: [],
    lineItems: [
      { id: 'ot2-l1', label: 'Window frame & pane', description: 'Flat 1A master bedroom', amount: 75000, paid: true, paymentId: 'mp4', reference: 'PD-2026090004' },
      { id: 'ot2-l2', label: 'Installation fee', description: 'Contractor labour', amount: 20000, paid: true, paymentId: 'lv7', reference: 'PD-2026100007' },
    ],
  },
  'private-all': {
    bill: { id: 'private-all', type: 'private', title: 'My Private Bills', totalAmount: 200000, dueDate: '2026-10-25', state: 'due', period: '2026-10' },
    allocations: [],
    lineItems: [
      { id: 'pb1', label: 'Netflix subscription', description: 'Due 25 Oct 2026', amount: 45000, paid: false },
      { id: 'pb2', label: 'Personal fibre — Q4', description: 'Paid', amount: 120000, paid: true, paymentId: 'lv5', reference: 'PD-2026100005' },
      { id: 'pb3', label: 'Amazon Prime', description: 'Paid', amount: 35000, paid: true, paymentId: 'mp3', reference: 'PD-2026090003' },
    ],
  },
  pb1: {
    bill: { id: 'pb1', type: 'private', title: 'Netflix subscription', totalAmount: 45000, dueDate: '2026-10-25', state: 'upcoming', period: '2026-10' },
    allocations: [],
    lineItems: [
      { id: 'pb1-l1', label: 'Monthly subscription', description: 'Standard plan', amount: 45000, paid: false },
    ],
  },
  pb2: {
    bill: { id: 'pb2', type: 'private', title: 'Personal fibre — Q4', totalAmount: 120000, dueDate: '2026-10-01', state: 'paid', period: '2026-10' },
    allocations: [],
    lineItems: [
      { id: 'pb2-l1', label: 'Q4 subscription', description: 'Oct – Dec 2026', amount: 120000, paid: true, paymentId: 'lv5', reference: 'PD-2026100005' },
    ],
  },
  pb3: {
    bill: { id: 'pb3', type: 'private', title: 'Amazon Prime', totalAmount: 35000, dueDate: '2026-09-20', state: 'paid', period: '2026-09' },
    allocations: [],
    lineItems: [
      { id: 'pb3-l1', label: 'Annual membership', description: 'Sep 2026', amount: 35000, paid: true, paymentId: 'mp3', reference: 'PD-2026090003' },
    ],
  },
  cp0: {
    bill: { id: 'cp0', type: 'copartner', title: 'Joint streaming plan', totalAmount: 60000, dueDate: '2026-10-20', state: 'paid', period: '2026-10' },
    allocations: [
      { id: 'ca1', billId: 'cp0', memberName: 'Femi Adekunle', householdName: 'Flat 4C', amount: 30000, paid: true, paidDate: '2026-10-18', paymentId: 'lv3', reference: 'PD-2026100003', method: 'wallet' },
      { id: 'ca2', billId: 'cp0', memberName: 'Tolu Adeyemi', householdName: 'Flat 3B', amount: 30000, paid: true, paidDate: '2026-10-18', paymentId: 'lv1', reference: 'PD-2026100001', method: 'wallet' },
    ],
  },
  cp2: {
    bill: { id: 'cp2', type: 'copartner', title: 'Shared broadband', totalAmount: 90000, dueDate: '2026-10-15', state: 'due', period: '2026-10' },
    allocations: [
      { id: 'ca3', billId: 'cp2', memberName: 'Kemi Okafor', householdName: 'Flat 2A', amount: 45000, paid: true, paidDate: '2026-10-12', paymentId: 'lv2', reference: 'PD-2026100002', method: 'card' },
      { id: 'ca4', billId: 'cp2', memberName: 'Ngozi Eze', householdName: 'Flat 6E', amount: 45000, paid: false },
    ],
  },
  cp3: {
    bill: { id: 'cp3', type: 'copartner', title: 'Joint streaming plan', totalAmount: 60000, dueDate: '2026-09-20', state: 'paid', period: '2026-09' },
    allocations: [
      { id: 'ca5', billId: 'cp3', memberName: 'Tolu Adeyemi', householdName: 'Flat 3B', amount: 30000, paid: true, paidDate: '2026-09-18', paymentId: 'mp1', reference: 'PD-2026100001', method: 'wallet' },
      { id: 'ca6', billId: 'cp3', memberName: 'Amara Nwosu', householdName: 'Flat 1A', amount: 30000, paid: true, paidDate: '2026-09-18', paymentId: 'lv4', reference: 'PD-2026100004', method: 'bank_transfer' },
    ],
  },
};

const FALLBACK = MOCK_BILL_DETAILS.b1;

const STATE_COLORS: Record<string, string> = {
  paid: Colors.green,
  overdue: '#E8724A',
  due: '#F5A623',
  upcoming: 'rgba(255,255,255,0.92)',
};

const STATE_TEXT_COLORS: Record<string, string> = {
  paid: Colors.ink,
  overdue: Colors.white,
  due: Colors.white,
  upcoming: Colors.ink,
};

// Zigzag SVG that transitions from violet (above) to white (below)
function ZigzagEdge() {
  const W = 400;
  const H = 32;
  const teeth = 13;
  const tw = W / teeth;
  // White teeth pointing UP into violet: fill white from bottom (y=H) up through peaks (y=0)
  let d = `M0 ${H} L${W} ${H}`;
  for (let i = teeth - 1; i >= 0; i--) {
    d += ` L${(i + 1) * tw - tw / 2} 0 L${i * tw} ${H}`;
  }
  d += ' Z';
  return (
    <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ marginTop: -1 }}>
      <Path d={d} fill={Colors.white} />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={2} y={2} width={20} height={20} rx={4} fill="none" stroke={Colors.green} strokeWidth={2} />
      <Path d="M7.5 12l3 3 6-6" stroke={Colors.green} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PendingIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={2} y={2} width={20} height={20} rx={4} fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth={2} />
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
  const lineItems = mockData.lineItems ?? [];
  const isPrivateBill = lineItems.length > 0;
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
  const total = isPrivateBill
    ? lineItems.reduce((s, li) => s + li.amount, 0)
    : allocations.reduce((s, a) => s + a.amount, 0);
  const progressPct = total > 0 ? Math.round((collected / total) * 100) : 0;
  const paidCount = allocations.filter(a => a.paid).length;

  const stateColor = STATE_COLORS[billState] ?? Colors.white;
  const stateTextColor = STATE_TEXT_COLORS[billState] ?? Colors.ink;

  const handleShare = async () => {
    const lines = allocations.map(a =>
      `${a.memberName}: ${formatNaira(a.amount)} — ${a.paid ? 'Paid' : 'Pending'}`
    ).join('\n');
    const message = `${bill.title}\n${formatDueDate(bill.dueDate)}\n\n${lines}\n\nTotal: ${formatNaira(total)}`;
    try {
      await Share.share({ message, title: bill.title });
    } catch {
      Alert.alert('Share', message);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Violet header area */}
        <View style={styles.violetSection}>
          {/* Back button + share */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M19 12H5M12 5l-7 7 7 7" stroke={Colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} onPress={handleShare}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" stroke={Colors.ink} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* Summary */}
          <View style={styles.summary}>
            <Text style={styles.billTitle}>
              {bill.type === 'private' ? 'My Private Bill' : bill.title}
            </Text>

            <View style={styles.metaRow}>
              <Text style={styles.dueText}>{formatDueDate(bill.dueDate)}</Text>
              <View style={[styles.stateBadge, { backgroundColor: stateColor }]}>
                <Text style={[styles.stateBadgeText, { color: stateTextColor }]}>
                  {billState.charAt(0).toUpperCase() + billState.slice(1)}
                </Text>
              </View>
            </View>

            {allocations.length > 0 && (
              <View style={styles.headerStats}>
                <View style={styles.headerStatCol}>
                  <Text style={styles.headerStatLabel}>Total fee</Text>
                  <Text style={styles.headerStatValue}>{formatNaira(bill.totalAmount)}</Text>
                </View>
                <View style={styles.headerStatDivider} />
                <View style={styles.headerStatCol}>
                  <Text style={styles.headerStatLabel}>Collected</Text>
                  <Text style={[styles.headerStatValue, { color: '#0D8C4B' }]}>{formatNaira(collected)}</Text>
                </View>
                <View style={styles.headerStatDivider} />
                <View style={styles.headerStatCol}>
                  <Text style={styles.headerStatLabel}>Unpaid</Text>
                  <Text style={[styles.headerStatValue, { color: outstanding > 0 ? '#E8724A' : 'rgba(12,24,34,0.3)' }]}>
                    {formatNaira(outstanding)}
                  </Text>
                </View>
              </View>
            )}

            {allocations.length > 0 && (
              <View style={styles.headerProgress}>
                <View style={styles.headerProgressTrack}>
                  <View style={[styles.headerProgressFill, { width: `${progressPct}%` as any }]} />
                </View>
                <Text style={styles.headerProgressCaption}>{paidCount} of {allocations.length} tenants paid</Text>
              </View>
            )}
          </View>

        </View>

        {/* White receipt card — floats on violet bg */}
        <View style={styles.receiptCard}>
          <ZigzagEdge />
          <View style={styles.receiptInner}>
          <View style={styles.receiptContent}>

        {isPrivateBill ? (
          <>
            <Text style={styles.listLabel}>{bill.title}</Text>
            {lineItems.map((item, i) => {
              const hasReceipt = !!item.paymentId;
              const RowComp = hasReceipt ? TouchableOpacity : View;
              return (
                <View key={item.id}>
                  {i > 0 && <View style={styles.rowDivider} />}
                  <RowComp
                    style={styles.allocRow}
                    {...(hasReceipt ? {
                      activeOpacity: 0.7,
                      onPress: () => (navigation as any).navigate('PaymentDetail', { paymentId: item.paymentId }),
                    } : {})}
                  >
                    <View style={styles.lineItemIconWrap}>
                      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                        <Path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke={Colors.violet} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    </View>
                    <View style={styles.allocInfo}>
                      <Text style={styles.allocName}>{item.label}</Text>
                      {item.description && <Text style={styles.allocUnit}>{item.description}</Text>}
                      {hasReceipt && (
                        <Text style={styles.receiptHint}>Tap to view receipt ›</Text>
                      )}
                    </View>
                    <Text style={styles.allocAmt}>{formatNaira(item.amount)}</Text>
                    {item.paid !== undefined && (
                      <View style={styles.checkWrap}>
                        {item.paid ? <CheckIcon /> : <PendingIcon />}
                      </View>
                    )}
                  </RowComp>
                </View>
              );
            })}
            <View style={styles.totalBar}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalAmt}>{formatNaira(total)}</Text>
            </View>
          </>
        ) : allocations.length > 0 && (
          <>
            {/* Tenants list */}
            <Text style={styles.listLabel}>
              {bill.type === 'copartner' ? 'Joint Bill' : 'Split Payment Bill'}
            </Text>
            {allocations.map((alloc, i) => {
              const hasReceipt = alloc.paid && !!alloc.paymentId;
              const RowComp = hasReceipt ? TouchableOpacity : View;
              return (
                <View key={alloc.id}>
                  {i > 0 && <View style={styles.rowDivider} />}
                  <RowComp
                    style={styles.allocRow}
                    {...(hasReceipt ? {
                      activeOpacity: 0.7,
                      onPress: () => (navigation as any).navigate('PaymentDetail', { paymentId: alloc.paymentId }),
                    } : {})}
                  >
                    <View style={styles.avatar}>
                      <Svg width={38} height={38} viewBox="15 28 90 75">
                        <Path d="M36 58L30 40L48 50Z" fill="#A98BFF" stroke="#0C1822" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M84 58L90 40L72 50Z" fill="#A98BFF" stroke="#0C1822" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
                        <Circle cx={60} cy={38} r={9} fill={alloc.paid ? Colors.green : '#A98BFF'} stroke="#0C1822" strokeWidth={2} />
                        <Ellipse cx={60} cy={78} rx={38} ry={30} fill="#A98BFF" stroke="#0C1822" strokeWidth={2.2} />
                        <Path d="M50 50h20" stroke="#0C1822" strokeWidth={3} strokeLinecap="round" />
                        <Rect x={37} y={64} width={15} height={10} rx={2.5} fill="#0C1822" />
                        <Rect x={64} y={64} width={15} height={10} rx={2.5} fill="#0C1822" />
                        <Ellipse cx={60} cy={88} rx={13} ry={9} fill={alloc.paid ? Colors.green : Colors.white} stroke="#0C1822" strokeWidth={2.2} />
                      </Svg>
                    </View>
                    <View style={styles.allocInfo}>
                      <Text style={styles.allocName}>{alloc.memberName}</Text>
                      <View style={styles.statusRowWithHint}>
                        <Text style={[styles.allocStatus, alloc.paid && styles.allocStatusPaid]}>
                          {alloc.paid ? 'Paid' : 'Unpaid'}
                        </Text>
                        {hasReceipt && (
                          <Text style={styles.receiptHint}>· View receipt ›</Text>
                        )}
                      </View>
                    </View>
                    <Text style={[styles.allocAmt, alloc.paid && { color: Colors.ink }]}>
                      {formatNaira(alloc.amount)}
                    </Text>
                    <View style={styles.checkWrap}>
                      {alloc.paid ? <CheckIcon /> : <PendingIcon />}
                    </View>
                  </RowComp>
                </View>
              );
            })}

            {/* Total bar */}
            <View style={styles.totalBar}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalAmt}>{formatNaira(total)}</Text>
            </View>
          </>
        )}

          </View>{/* end receiptContent */}
          </View>{/* end receiptInner */}
        </View>{/* end receiptCard */}

        {/* Share / Download actions */}
        <View style={styles.receiptActions}>
          <TouchableOpacity style={styles.receiptActionBtn} onPress={handleShare}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" stroke={Colors.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.receiptActionText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.receiptActionBtn, styles.receiptActionBtnOutline]}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke={Colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={[styles.receiptActionText, { color: Colors.ink }]}>Download</Text>
          </TouchableOpacity>
        </View>

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
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 80 },

  violetSection: { backgroundColor: Colors.violet },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding, paddingTop: 8, paddingBottom: 4,
  },
  backBtn: { width: 36 },
  shareBtn: { width: 36, alignItems: 'flex-end' },
  topBarTitle: { ...Typography.label, color: Colors.white, fontFamily: 'Syne_800ExtraBold', fontSize: 16 },
  topBarEdit: { ...Typography.label, color: 'rgba(255,255,255,0.8)', textAlign: 'right', width: 36 },

  // Summary on violet
  summary: { paddingHorizontal: Layout.screenPadding, paddingTop: 12, paddingBottom: 24, gap: 8 },
  summaryTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  billTitle: { ...Typography.h1, color: Colors.ink, flex: 1, marginRight: 12 },
  stateBadge: {
    borderRadius: 99,
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
  dueText: { ...Typography.caption, color: Colors.ink },

  // Header stats row (inside violet summary)
  headerStats: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: Radius.cardSm,
    paddingVertical: 12, paddingHorizontal: 16, marginTop: 12,
  },
  headerStatCol: { flex: 1, alignItems: 'center' },
  headerStatLabel: { ...Typography.captionSmall, color: 'rgba(12,24,34,0.7)', marginBottom: 3, fontFamily: 'DMSans_700Bold' },
  headerStatValue: { ...Typography.label, color: Colors.ink, fontFamily: 'Syne_800ExtraBold', fontSize: 14 },
  headerStatDivider: { width: 1, height: 32, backgroundColor: 'rgba(12,24,34,0.15)' },
  headerProgress: { marginTop: 10, gap: 6 },
  headerProgressTrack: { height: 5, backgroundColor: 'rgba(12,24,34,0.15)', borderRadius: 3, overflow: 'hidden' },
  headerProgressFill: { height: 5, backgroundColor: Colors.green, borderRadius: 3 },
  headerProgressCaption: { ...Typography.captionSmall, color: 'rgba(12,24,34,0.6)' },

  // White receipt card — floats on violet
  receiptCard: {
    marginHorizontal: 12,
    marginBottom: 28,
    borderBottomLeftRadius: Radius.card,
    borderBottomRightRadius: Radius.card,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  receiptInner: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: Radius.card,
    borderBottomRightRadius: Radius.card,
  },
  receiptContent: {
    padding: Layout.screenPadding,
    paddingBottom: 28,
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
  lineItemIconWrap: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(169,139,255,0.12)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  allocInfo: { flex: 1 },
  allocName: { ...Typography.label, color: Colors.ink },
  allocUnit: { ...Typography.captionSmall, color: Colors.textSecondary },
  allocStatus: { ...Typography.captionSmall, color: '#E8724A', fontFamily: 'DMSans_700Bold', marginTop: 2 },
  allocStatusPaid: { color: '#0D8C4B' },
  statusRowWithHint: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  receiptHint: { ...Typography.captionSmall, color: Colors.ink, fontSize: 11, fontFamily: 'DMSans_700Bold' },
  allocAmt: { ...Typography.label, color: Colors.textMuted },
  checkWrap: { width: 28, alignItems: 'center' },

  totalBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.line,
  },
  totalLabel: {
    ...Typography.captionSmall, color: Colors.textMuted,
    letterSpacing: 1.4, fontFamily: 'DMSans_700Bold',
  },
  totalAmt: { ...Typography.label, color: Colors.green, fontFamily: 'Syne_800ExtraBold', fontSize: 15 },

  paidBanner: {
    backgroundColor: Colors.mint, borderRadius: Radius.cardSm,
    padding: 14, alignItems: 'center', marginTop: 16,
    borderWidth: 1, borderColor: Colors.green,
  },
  paidBannerText: { ...Typography.label, color: Colors.ink, fontFamily: 'Syne_800ExtraBold' },

  receiptActions: {
    flexDirection: 'row', gap: 10,
    marginHorizontal: 12, marginTop: 4, marginBottom: 8,
  },
  receiptActionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.ink, borderRadius: Radius.cardSm,
    paddingVertical: 14,
  },
  receiptActionBtnOutline: {
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.line,
  },
  receiptActionText: {
    ...Typography.label, color: Colors.white, fontFamily: 'Syne_800ExtraBold', fontSize: 11,
  },

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
