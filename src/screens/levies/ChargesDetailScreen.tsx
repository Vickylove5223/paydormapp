import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import Svg, { Path, Circle, Rect, Ellipse } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LeviesStackParams } from '@/navigation/types';
import { Colors, Typography, Layout, Radius, FontFamily } from '@/theme';
import { formatNaira } from '@/utils/money';
import { formatRecurringDay } from '@/utils/date';
import { BankFavicon } from '@/components/common/BankFavicon';

type Props = NativeStackScreenProps<LeviesStackParams, 'ChargesDetail'>;

const STATE_COLORS: Record<string, string> = {
  paid: Colors.green,
  overdue: '#E8724A',
  due: '#F5A623',
  upcoming: Colors.violet,
};

const STATE_TEXT: Record<string, string> = {
  paid: 'Paid', overdue: 'Overdue', due: 'Due', upcoming: 'Upcoming',
};

function ZigzagEdge() {
  const W = 400;
  const H = 28;
  const teeth = 14;
  const tw = W / teeth;
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

function SadPiggyMascot() {
  return (
    <Svg width={100} height={100} viewBox="0 0 120 120">
      {/* ears */}
      <Path d="M28 52L20 34L40 44Z" fill="#A98BFF" stroke="#0C1822" strokeWidth={2.5} strokeLinejoin="round" />
      <Path d="M92 52L100 34L80 44Z" fill="#A98BFF" stroke="#0C1822" strokeWidth={2.5} strokeLinejoin="round" />
      {/* coin slot top */}
      <Circle cx={60} cy={30} r={10} fill="#EF4444" stroke="#0C1822" strokeWidth={2} />
      <Rect x={55} y={25} width={10} height={3} rx={1.5} fill="#0C1822" />
      {/* body */}
      <Ellipse cx={60} cy={76} rx={38} ry={30} fill="#A98BFF" stroke="#0C1822" strokeWidth={2.5} />
      {/* snout */}
      <Ellipse cx={60} cy={86} rx={13} ry={9} fill="#C4ADFF" stroke="#0C1822" strokeWidth={2} />
      {/* sad mouth */}
      <Path d="M53 90 Q60 86 67 90" stroke="#0C1822" strokeWidth={2.2} strokeLinecap="round" fill="none" />
      {/* eyes — sad */}
      <Path d="M50 68 Q53 65 56 68" stroke="#0C1822" strokeWidth={2.2} strokeLinecap="round" fill="none" />
      <Path d="M64 68 Q67 65 70 68" stroke="#0C1822" strokeWidth={2.2} strokeLinecap="round" fill="none" />
      {/* tear drop */}
      <Ellipse cx={49} cy={73} rx={2.5} ry={3.5} fill="#A0C4FF" opacity={0.9} />
      {/* legs */}
      <Rect x={38} y={96} width={14} height={10} rx={3} fill="#0C1822" />
      <Rect x={68} y={96} width={14} height={10} rx={3} fill="#0C1822" />
    </Svg>
  );
}

function PiggyAvatar({ paid }: { paid: boolean }) {
  return (
    <Svg width={36} height={36} viewBox="15 28 90 75">
      <Path d="M36 58L30 40L48 50Z" fill="#A98BFF" stroke="#0C1822" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M84 58L90 40L72 50Z" fill="#A98BFF" stroke="#0C1822" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={60} cy={38} r={9} fill={paid ? Colors.green : '#A98BFF'} stroke="#0C1822" strokeWidth={2} />
      <Ellipse cx={60} cy={78} rx={38} ry={30} fill="#A98BFF" stroke="#0C1822" strokeWidth={2.2} />
      <Path d="M50 50h20" stroke="#0C1822" strokeWidth={3} strokeLinecap="round" />
      <Rect x={37} y={64} width={15} height={10} rx={2.5} fill="#0C1822" />
      <Rect x={64} y={64} width={15} height={10} rx={2.5} fill="#0C1822" />
      <Ellipse cx={60} cy={88} rx={13} ry={9} fill={paid ? Colors.green : Colors.white} stroke="#0C1822" strokeWidth={2.2} />
    </Svg>
  );
}

export function ChargesDetailScreen({ route, navigation }: Props) {
  const { billData: item } = route.params;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const stateColor = STATE_COLORS[item.state] ?? Colors.green;
  const stateLabel = STATE_TEXT[item.state] ?? item.state;

  const copartners = item.copartners ?? [];
  const syntheticTenant = copartners.length === 0 && item.tenantName
    ? [{ id: 'single', name: item.tenantName, household: item.household ?? '', amount: item.totalAmount, paid: item.state === 'paid', isOwn: false }]
    : [];
  const tenants = copartners.length > 0 ? copartners : syntheticTenant;
  const paidCount = tenants.filter((c: any) => c.paid).length;
  const collected = tenants.filter((c: any) => c.paid).reduce((s: number, c: any) => s + c.amount, 0);
  const outstanding = tenants.filter((c: any) => !c.paid).reduce((s: number, c: any) => s + c.amount, 0);
  const progressPct = item.totalAmount > 0 ? Math.min(100, Math.round((collected / item.totalAmount) * 100)) : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Violet hero ── */}
        <View style={styles.violetSection}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M19 12H5M12 5l-7 7 7 7" stroke={Colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerIconBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() => navigation.navigate('AddBill', {
                  billId: item.id,
                  title: item.title,
                  totalAmount: String(item.totalAmount),
                  dueDate: item.dueDate,
                  billType: item.type,
                  scope: 'compound',
                })}
              >
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={Colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={Colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerIconBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() => setShowDeleteModal(true)}
              >
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke={Colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  <Path d="M10 11v6M14 11v6" stroke={Colors.ink} strokeWidth={2} strokeLinecap="round" />
                </Svg>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" stroke={Colors.ink} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.summary}>
            <View style={styles.summaryTop}>
              <Text style={styles.billTitle} numberOfLines={2}>{item.title}</Text>
            </View>

            <Text style={styles.amount}>{formatNaira(item.totalAmount)}</Text>
            <Text style={styles.dueText}>
              {(() => {
                const d = new Date(item.dueDate).getDate();
                const s = d >= 11 && d <= 13 ? 'th' : d % 10 === 1 ? 'st' : d % 10 === 2 ? 'nd' : d % 10 === 3 ? 'rd' : 'th';
                if (item.category === 'private') {
                  return `My bill for ${item.title} every ${d}${s} of the month`;
                }
                if (item.category === 'copartner') {
                  if (item.category === 'one_time') {
                    const dt = new Date(item.dueDate);
                    const month = dt.toLocaleDateString('en-NG', { month: 'long' });
                    const year = dt.getFullYear();
                    return `Total fee we're co-paying for ${item.title} on ${d}${s}, ${month}, ${year}`;
                  }
                  return `Total fee we're co-paying for ${item.title} every ${d}${s} of the month`;
                }
                const firstHousehold = tenants[0]?.household;
                const who = firstHousehold && item.propertyLabel
                  ? `${firstHousehold}, ${item.propertyLabel}`
                  : item.propertyLabel ?? (tenants.length > 0 ? `${tenants.length} households` : (item.tenantName ?? 'All tenants'));
                if (item.category === 'one_time') {
                  const dt = new Date(item.dueDate);
                  const month = dt.toLocaleDateString('en-NG', { month: 'long' });
                  const year = dt.getFullYear();
                  return `Total fee ${who} pay for ${item.title} on ${d}${s}, ${month}, ${year}`;
                }
                return `Total fee ${who} pay for ${item.title} every ${d}${s} of the month`;
              })()}
            </Text>

            {item.category !== 'one_time' && <TouchableOpacity
              style={styles.historyLink}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => navigation.navigate('TransactionHistory', { billId: item.id, billData: item })}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={12} r={9} stroke="rgba(12,24,34,0.65)" strokeWidth={2} />
                <Path d="M12 7v5l3 3" stroke="rgba(12,24,34,0.65)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={styles.historyLinkText}>View transaction history</Text>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path d="M9 18l6-6-6-6" stroke="rgba(12,24,34,0.65)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>}

          </View>
        </View>

        {/* ── Zigzag + white receipt ── */}
        <View style={styles.receiptCard}>
          <ZigzagEdge />
          <View style={styles.receiptInner}>

            {/* Payout destination */}
            {item.payoutBank && (
              <View style={styles.payoutSection}>
                <Text style={styles.sectionLabel}>PAYOUT DESTINATION</Text>
                <View style={styles.payoutRow}>
                  <BankFavicon bankName={item.payoutBank} size={40} />
                  <View style={styles.payoutDetails}>
                    <Text style={styles.payoutName}>{item.accountName}</Text>
                    <Text style={styles.payoutBank}>{item.payoutBank} · {item.payoutAcct}</Text>
                    {item.payoutPersonName && (
                      <Text style={styles.payoutPerson}>{item.payoutPersonName}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.sectionDivider} />
              </View>
            )}

            {/* Tenant payment list */}
            {tenants.length > 0 && (
              <View style={styles.tenantsSection}>
                <Text style={styles.sectionLabel}>SPLIT PAYMENT</Text>
                {tenants.map((cp: any, i: number) => (
                  <View key={cp.id}>
                    {i > 0 && <View style={styles.rowDivider} />}
                    <View style={styles.tenantRow}>
                      <View style={styles.tenantAvatar}>
                        <PiggyAvatar paid={cp.paid} />
                      </View>
                      <View style={styles.tenantInfo}>
                        <Text style={styles.tenantName}>{cp.name}{cp.isOwn ? ' (You)' : ''}</Text>
                      </View>
                      <Text style={[styles.tenantAmount, cp.paid ? styles.tenantAmountPaid : null]}>{formatNaira(cp.amount)}</Text>
                    </View>
                  </View>
                ))}
                <View style={styles.totalBar}>
                  <Text style={styles.totalLabel}>TOTAL</Text>
                  <Text style={styles.totalAmt}>{formatNaira(item.totalAmount)}</Text>
                </View>
              </View>
            )}


          </View>
        </View>

        {/* Share / Download actions — outside card, in violet area */}
        <View style={styles.receiptActions}>
          <TouchableOpacity style={styles.receiptActionBtn}>
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

      {/* ── Delete confirmation modal ── */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalMascot}>
              <SadPiggyMascot />
            </View>
            <Text style={styles.modalTitle}>Delete Bill?</Text>
            <Text style={styles.modalBillName} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.modalWarning}>This action cannot be undone. All payment records for this bill will be removed.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalDeleteBtn}
                onPress={() => { setShowDeleteModal(false); navigation.goBack(); }}
              >
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke={Colors.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  <Path d="M10 11v6M14 11v6" stroke={Colors.white} strokeWidth={2} strokeLinecap="round" />
                </Svg>
                <Text style={styles.modalDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.violet },
  scroll: { flex: 1, backgroundColor: Colors.violet },
  scrollContent: { flexGrow: 1, paddingBottom: 100, backgroundColor: Colors.violet },

  // ── Violet hero ──
  violetSection: { backgroundColor: Colors.violet },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding, paddingTop: 8, paddingBottom: 4,
  },
  backBtn: { width: 32, height: 32, alignItems: 'flex-start', justifyContent: 'center' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  headerIconBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },

  summary: { paddingHorizontal: Layout.screenPadding, paddingTop: 12, paddingBottom: 28, gap: 4 },
  summaryTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 },
  billTitle: { ...Typography.h1, color: Colors.ink, flex: 1, fontSize: 20 },
  stateBadge: { borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'flex-start', flexShrink: 0 },
  stateBadgeText: { ...Typography.captionSmall, color: Colors.white, fontFamily: 'DMSans_700Bold', fontSize: 12 },
  amount: { fontFamily: 'Syne_800ExtraBold', fontSize: 32, color: Colors.ink, letterSpacing: -0.5, marginTop: 2 },
  dueText: { ...Typography.caption, color: 'rgba(12,24,34,0.55)', marginBottom: 6, fontSize: 14 },
  historyLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, marginBottom: 4, alignSelf: 'flex-start' },
  historyLinkText: { ...Typography.label, color: 'rgba(12,24,34,0.65)', fontSize: 15, fontFamily: 'DMSans_700Bold', textDecorationLine: 'underline' },

  headerStats: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: Radius.cardSm,
    paddingVertical: 12, paddingHorizontal: 14, marginTop: 8,
  },
  headerStatCol: { flex: 1, alignItems: 'center' },
  headerStatLabel: { ...Typography.captionSmall, color: 'rgba(12,24,34,0.6)', fontSize: 9, fontFamily: 'DMSans_700Bold', marginBottom: 3, letterSpacing: 0.5 },
  headerStatValue: { ...Typography.label, color: Colors.ink, fontFamily: FontFamily.syneBold, fontSize: 13 },
  headerStatDivider: { width: 1, height: 28, backgroundColor: 'rgba(12,24,34,0.15)' },
  headerProgress: { marginTop: 10, gap: 5 },
  headerProgressTrack: { height: 5, backgroundColor: 'rgba(12,24,34,0.15)', borderRadius: 3, overflow: 'hidden' },
  headerProgressFill: { height: 5, backgroundColor: Colors.green, borderRadius: 3 },
  headerProgressCaption: { ...Typography.captionSmall, color: 'rgba(12,24,34,0.55)', fontSize: 11 },

  // ── Receipt card ──
  receiptCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: Radius.card,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  receiptInner: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: Radius.card,
    borderBottomRightRadius: Radius.card,
  },

  payoutSection: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 0 },
  tenantsSection: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 20 },

  sectionLabel: {
    ...Typography.captionSmall, color: Colors.textMuted,
    fontFamily: FontFamily.syneBold, fontSize: 10,
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10,
  },
  sectionDivider: { height: 1, backgroundColor: Colors.line, marginTop: 14, marginBottom: 0 },

  payoutRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  payoutDetails: { flex: 1 },
  payoutName: { ...Typography.label, color: Colors.ink, fontFamily: FontFamily.syneBold, fontSize: 13 },
  payoutBank: { ...Typography.captionSmall, color: Colors.textSecondary, marginTop: 2, fontSize: 13 },
  payoutPerson: { ...Typography.captionSmall, color: Colors.textMuted, marginTop: 2, fontSize: 12 },

  rowDivider: { height: 1, backgroundColor: Colors.line },
  tenantRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  tenantAvatar: {
    width: 36, height: 36, borderRadius: 18, overflow: 'hidden',
    backgroundColor: Colors.screen, borderWidth: 1.5, borderColor: Colors.line,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  tenantInfo: { flex: 1, gap: 2 },
  tenantName: { ...Typography.label, color: Colors.ink, fontSize: 13 },
  tenantHousehold: { ...Typography.captionSmall, color: Colors.textSecondary, fontSize: 11 },
  statusPill: { alignSelf: 'flex-start', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2, marginTop: 2 },
  statusPillPaid: { backgroundColor: '#E6F8EE' },
  statusPillUnpaid: { backgroundColor: '#FEF0EB' },
  statusPillText: { fontFamily: 'DMSans_700Bold', fontSize: 10 },
  statusTextPaid: { color: '#0D8C4B' },
  statusTextUnpaid: { color: '#E8724A' },
  tenantAmount: { ...Typography.label, color: Colors.textMuted },
  tenantAmountPaid: { color: Colors.ink },

  totalBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.line,
  },
  totalLabel: {
    ...Typography.captionSmall, color: Colors.textMuted,
    letterSpacing: 1.4, fontFamily: 'DMSans_700Bold',
  },
  totalAmt: { ...Typography.label, color: Colors.green, fontFamily: 'Syne_800ExtraBold', fontSize: 15 },

  assignedRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  assignedText: { ...Typography.label, color: Colors.ink },
  assignedHousehold: { ...Typography.captionSmall, color: Colors.textSecondary },

  // ── Delete modal ──
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(12,24,34,0.6)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  modalCard: {
    backgroundColor: Colors.white, borderRadius: 24,
    padding: 28, alignItems: 'center', width: '100%', maxWidth: 340,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18, shadowRadius: 24, elevation: 12,
  },
  modalMascot: { marginBottom: 16 },
  modalTitle: {
    fontFamily: 'Syne_800ExtraBold', fontSize: 22, color: Colors.ink,
    textAlign: 'center', marginBottom: 6,
  },
  modalBillName: {
    fontFamily: 'DMSans_700Bold', fontSize: 15, color: Colors.violet,
    textAlign: 'center', marginBottom: 12,
  },
  modalWarning: {
    fontFamily: 'DMSans_400Regular' as any, fontSize: 13,
    color: Colors.textSecondary, textAlign: 'center',
    lineHeight: 19, marginBottom: 24,
  },
  modalActions: { flexDirection: 'row', gap: 10, width: '100%' },
  modalCancelBtn: {
    flex: 1, borderWidth: 1.5, borderColor: Colors.line,
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  modalCancelText: { fontFamily: 'DMSans_700Bold', fontSize: 15, color: Colors.ink },
  modalDeleteBtn: {
    flex: 1, backgroundColor: '#EF4444', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 6,
  },
  modalDeleteText: { fontFamily: 'DMSans_700Bold', fontSize: 15, color: Colors.white },

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
});
