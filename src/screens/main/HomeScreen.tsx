import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Pressable,
  Animated,
} from 'react-native';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Ellipse, Rect } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Layout, Radius } from '@/theme';
import { useAuthStore } from '@/store/auth';
import { useAppStore } from '@/store/app';
import { formatNaira } from '@/utils/money';
import { UserRole } from '@/types';

const MOCK_PROPERTY_LIST = [
  { id: 'prop1', name: 'Lekki Gardens Estate', city: 'Lagos', role: 'Landlord' },
  { id: 'prop2', name: 'Victoria Island Towers', city: 'Lagos', role: 'Agent' },
];

// ── Mock data ──────────────────────────────────────────────────────────────────

const MOCK_LANDLORD = {
  propertyName: 'Lekki Gardens Estate',
  collectedKobo: 28450000,
  outstandingKobo: 4500000,
  collectionRate: 0.86,
  tenantCount: 12,
  bills: [
    {
      id: '1', title: 'August EKEDC', type: 'electricity',
      state: 'overdue' as BillState, dueDate: '2026-10-05',
      amountPerHousehold: 1200000, paidCount: 7, totalCount: 12,
    },
    {
      id: '2', title: 'Service charge', type: 'service_charge',
      state: 'due' as BillState, dueDate: '2026-10-15',
      amountPerHousehold: 500000, paidCount: 4, totalCount: 12,
    },
    {
      id: '3', title: 'Water supply', type: 'water',
      state: 'upcoming' as BillState, dueDate: '2026-10-30',
      amountPerHousehold: 350000, paidCount: 0, totalCount: 12,
    },
  ],
  payments: [
    { id: 'p1', tenantName: 'Tolu Adeyemi', billTitle: 'August EKEDC', billCat: 'shared' as const, billMonth: 'October', amount: 1200000, createdAt: '2026-10-11T08:22:00Z', household: 'Flat 3B', isOwn: false },
    { id: 'p2', tenantName: 'Kemi Okafor', billTitle: 'Service charge', billCat: 'shared' as const, billMonth: 'October', amount: 500000, createdAt: '2026-10-10T16:45:00Z', household: 'Flat 2A', isOwn: false },
    { id: 'p3', tenantName: 'Femi Adekunle', billTitle: 'Plumbing repair', billCat: 'one_time' as const, billMonth: 'October', amount: 1200000, createdAt: '2026-10-10T11:30:00Z', household: 'Flat 4C', isOwn: true },
    { id: 'p4', tenantName: 'Amara Nwosu', billTitle: 'Netflix', billCat: 'private' as const, billMonth: 'October', amount: 500000, createdAt: '2026-10-09T09:15:00Z', household: 'Flat 1A', isOwn: false },
  ],
};

const MOCK_TENANT = {
  propertyName: 'Lekki Gardens Estate',
  household: 'Flat 3B',
  dueThisMonth: 2050000,
  walletBalance: 3450000,
  communityBills: { total: 9200000, paidCount: 3, totalCount: 4, youOwe: 0 },
  bills: [
    { id: '1', title: 'August EKEDC', state: 'overdue' as BillState, dueDate: '2026-10-05', amountDue: 1200000 },
    { id: '2', title: 'Service charge', state: 'due' as BillState, dueDate: '2026-10-15', amountDue: 500000 },
    { id: '3', title: 'Water supply', state: 'upcoming' as BillState, dueDate: '2026-10-30', amountDue: 350000 },
  ],
  payments: [
    { id: 'p1', billTitle: 'September EKEDC', billCat: 'shared' as const, billMonth: 'September', amount: 1200000, createdAt: '2026-09-29T08:00:00Z' },
    { id: 'p2', billTitle: 'Plumbing repair', billCat: 'one_time' as const, billMonth: 'September', amount: 500000, createdAt: '2026-09-28T10:00:00Z' },
    { id: 'p3', billTitle: 'Netflix', billCat: 'private' as const, billMonth: 'September', amount: 350000, createdAt: '2026-09-27T14:00:00Z' },
  ],
};

// ── Types & helpers ────────────────────────────────────────────────────────────

type BillState = 'overdue' | 'due' | 'upcoming' | 'partially_paid' | 'paid';

// Unified bill shape used by the card stack
type UnifiedBill = { id: string; title: string; subtitle?: string; state: BillState; dueDate: string; amountDue: number };

const BILL_TONE: Record<BillState, { bg: string; text: string; dot: string }> = {
  overdue: { bg: Colors.overdueBg, text: Colors.clay, dot: Colors.clay },
  due: { bg: Colors.dueBg, text: Colors.violet, dot: Colors.violet },
  upcoming: { bg: Colors.upcoming, text: Colors.textSecondary, dot: Colors.textMuted },
  partially_paid: { bg: Colors.dueBg, text: Colors.violet, dot: Colors.violet },
  paid: { bg: Colors.paidBg, text: Colors.paid, dot: Colors.paid },
};

const BILL_STATE_LABEL: Record<BillState, string> = {
  overdue: 'Overdue',
  due: 'Due soon',
  upcoming: 'Upcoming',
  partially_paid: 'Part paid',
  paid: 'Paid',
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
  const time = d.toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${date} · ${time}`;
}

function timeAgoShort(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

// ── SVG icons ──────────────────────────────────────────────────────────────────

function BellIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 10a6 6 0 0 0-12 0c0 3.5-2 5-2 5h16s-2-1.5-2-5z"
        fill={Colors.violet}
        stroke={Colors.ink}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path
        d="M12 21a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2z"
        fill={Colors.green}
        stroke={Colors.ink}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

function PlusIcon({ color = Colors.white }: { color?: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

function BuildingIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 32 32" fill="none">
      {/* Body fill */}
      <Path d="M6 28V10l10-6 10 6v18H6z" fill={Colors.violet} stroke="#0C1822" strokeWidth="2" strokeLinejoin="round" />
      {/* Roof accent */}
      <Path d="M4 28h24" stroke="#0C1822" strokeWidth="2" strokeLinecap="round" />
      {/* Door */}
      <Rect x="13" y="19" width="6" height="9" rx="1" fill="#F4F7F5" stroke="#0C1822" strokeWidth="1.6" />
      {/* Windows */}
      <Rect x="8" y="13" width="4" height="4" rx="1" fill={Colors.green} stroke="#0C1822" strokeWidth="1.4" />
      <Rect x="20" y="13" width="4" height="4" rx="1" fill={Colors.green} stroke="#0C1822" strokeWidth="1.4" />
    </Svg>
  );
}

function PersonAddIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={7} r={4} stroke={Colors.ink} strokeWidth={2} />
      <Path d="M3 20c0-3.87 2.69-7 6-7h2M18 15v6M15 18h6" stroke={Colors.ink} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function DefaultAvatarIcon({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="15 28 90 75">
      <Path d="M36 58L30 40L48 50Z" fill="#A98BFF" stroke="#0C1822" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M84 58L90 40L72 50Z" fill="#A98BFF" stroke="#0C1822" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={60} cy={38} r={9} fill="#40CE86" stroke="#0C1822" strokeWidth={2} />
      <Path d="M55 36h10M55 40h10" stroke="#0C1822" strokeWidth={1.8} />
      <Ellipse cx={60} cy={78} rx={38} ry={30} fill="#A98BFF" stroke="#0C1822" strokeWidth={2.2} />
      <Path d="M50 50h20" stroke="#0C1822" strokeWidth={3} strokeLinecap="round" />
      <Rect x={37} y={64} width={15} height={10} rx={2.5} fill="#0C1822" />
      <Rect x={64} y={64} width={15} height={10} rx={2.5} fill="#0C1822" />
      <Path d="M52 68H64" stroke="#0C1822" strokeWidth={2} />
      <Ellipse cx={60} cy={88} rx={13} ry={9} fill="#40CE86" stroke="#0C1822" strokeWidth={2.2} />
      <Circle cx={55} cy={88} r={2} fill="#0C1822" />
      <Circle cx={65} cy={88} r={2} fill="#0C1822" />
      <Circle cx={34} cy={82} r={3.6} fill="#40CE86" opacity={0.8} />
      <Circle cx={86} cy={82} r={3.6} fill="#40CE86" opacity={0.8} />
    </Svg>
  );
}

function ChevronDown() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9l6 6 6-6" stroke={Colors.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronRight() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke={Colors.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────────

function SectionCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.section}>{children}</View>;
}

function SectionHead({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity style={styles.seeAllBtn} onPress={onSeeAll}>
          <Text style={styles.seeAll}>See all</Text>
          <ChevronRight />
        </TouchableOpacity>
      )}
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

// ── Property selector modal ────────────────────────────────────────────────────

function PropertySelectorModal({
  visible,
  current,
  onSelect,
  onClose,
}: {
  visible: boolean;
  current: string;
  onSelect: (name: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.propSelectorWrap}>
        <View style={styles.propSelector}>
          <Text style={styles.propSelectorTitle}>Switch property</Text>
          {MOCK_PROPERTY_LIST.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.propSelectorRow, current === p.name && styles.propSelectorRowActive]}
              onPress={() => { onSelect(p.name); onClose(); }}
              activeOpacity={0.8}
            >
              <View style={styles.propSelectorLeft}>
                <Text style={styles.propSelectorName}>{p.name}</Text>
                <Text style={styles.propSelectorMeta}>{p.city} · {p.role}</Text>
              </View>
              {current === p.name && <Text style={styles.propSelectorCheck}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}

// ── Bill card stack (tinder-style, works for all roles) ───────────────────────

function BillCardStack({ bills, onPayPress }: { bills: UnifiedBill[]; onPayPress?: (id: string) => void }) {
  const [frontIdx, setFrontIdx] = useState(0);
  const slideX = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  const n = bills.length;

  if (n === 0) return null;

  const front = bills[frontIdx];
  const second = n >= 2 ? bills[(frontIdx + 1) % n] : null;
  const third = n >= 3 ? bills[(frontIdx + 2) % n] : null;
  const frontTone = BILL_TONE[front.state];

  const advance = () => {
    if (n <= 1) return;
    Animated.parallel([
      Animated.timing(slideX, { toValue: 420, duration: 260, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: -20, duration: 260, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setFrontIdx((p) => (p + 1) % n);
      slideX.setValue(0);
      slideY.setValue(0);
      cardOpacity.setValue(1);
    });
  };

  return (
    <View style={styles.stackContainer}>
      {/* 3rd card — furthest behind */}
      {third && (
        <View style={[styles.billCard, styles.billCardBack, {
          zIndex: 1, backgroundColor: '#FFE8D6',
          transform: [{ translateY: 22 }, { scale: 0.93 }],
        }]} />
      )}
      {/* 2nd card */}
      {second && (
        <View style={[styles.billCard, styles.billCardBack, {
          zIndex: 2, backgroundColor: '#FFF3E6',
          transform: [{ translateY: 11 }, { scale: 0.965 }],
        }]} />
      )}
      {/* Front card — animated */}
      <AnimatedTouchable
        activeOpacity={n > 1 ? 0.92 : 1}
        onPress={n > 1 ? advance : undefined}
        style={[styles.billCard, {
          zIndex: 10, backgroundColor: '#FFF8F2',
          transform: [{ translateX: slideX }, { translateY: slideY }],
          opacity: cardOpacity,
        }]}
      >
        <View style={styles.billCardTitleRow}>
          <Text style={styles.billCardName} numberOfLines={1}>{front.title}</Text>
          <View style={[styles.stateChip, { backgroundColor: frontTone.bg }]}>
            <Text style={[styles.stateChipText, { color: frontTone.text }]}>{BILL_STATE_LABEL[front.state]}</Text>
          </View>
        </View>
        <View style={styles.billCardMeta}>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.billUnit}>{formatNaira(front.amountDue)}</Text>
          </View>
        </View>
        {(front.state === 'overdue' || front.state === 'due') && (
          <TouchableOpacity
            style={[styles.payNowBtn, { alignSelf: 'flex-end', paddingHorizontal: 16 }]}
            onPress={(e) => { e.stopPropagation?.(); onPayPress?.(front.id); }}
          >
            <Text style={styles.payNowText}>Pay now</Text>
          </TouchableOpacity>
        )}
      </AnimatedTouchable>
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const { unreadCount, role } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showPropertySelector, setShowPropertySelector] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(MOCK_LANDLORD.propertyName);

  const effectiveRole: UserRole = role ?? 'master_tenant';
  const isLandlordOrAgent =
    effectiveRole === 'landlord' || effectiveRole === 'agent' || effectiveRole === 'master_tenant';
  const paysSharedBills =
    effectiveRole === 'tenant' || effectiveRole === 'master_tenant';

  const propertyName = selectedProperty;

  // Wallet balance — always show user's wallet
  const walletLabel = 'Wallet Balance';
  const walletAmount = MOCK_TENANT.walletBalance;

  // Bill-type summary cards for the tinder stack
  const activeBills: UnifiedBill[] = [
    { id: 'shared', title: 'Shared bills', subtitle: '3 active bills', state: 'overdue', dueDate: '2026-10-05', amountDue: 2050000 },
    { id: 'private', title: 'Private bills', subtitle: '1 active bill', state: 'due', dueDate: '2026-10-15', amountDue: 500000 },
    { id: 'one_time', title: 'One-time bills', subtitle: '2 active bills', state: 'upcoming', dueDate: '2026-10-30', amountDue: 1200000 },
  ];

  function fmtBillSub(billCat: 'shared' | 'one_time' | 'private', billTitle: string, billMonth: string) {
    if (billCat === 'shared') return `${billMonth} shared bill`;
    if (billCat === 'private') return 'Private bill';
    return billTitle;
  }

  // Recent payments — unified shape
  const recentPayments = isLandlordOrAgent
    ? MOCK_LANDLORD.payments.map(p => ({ id: p.id, name: p.tenantName, bill: fmtBillSub(p.billCat, p.billTitle, p.billMonth), date: fmtDateTime(p.createdAt), amount: p.amount }))
    : MOCK_TENANT.payments.map(p => ({ id: p.id, name: 'You', bill: fmtBillSub(p.billCat, p.billTitle, p.billMonth), date: timeAgoShort(p.createdAt), amount: p.amount }));

  const communityData = MOCK_TENANT.communityBills;

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.green} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>Property</Text>
            <TouchableOpacity style={styles.propertySwitcher} activeOpacity={0.7} onPress={() => setShowPropertySelector(true)}>
              <Text style={styles.propertyName}>{propertyName}</Text>
              <ChevronDown />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => navigation.navigate('Notifications')}
            accessibilityLabel={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          >
            <BellIcon />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Overview card */}
        <View style={styles.overviewCard}>
          <View style={styles.walletRow}>
            <View>
              <Text style={styles.overviewEyebrow}>{walletLabel}</Text>
              <Text style={styles.overviewAmount}>{formatNaira(walletAmount)}</Text>
            </View>
            <TouchableOpacity style={styles.topupBtn} activeOpacity={0.75} onPress={() => navigation.navigate('Me', { screen: 'Wallet' })}>
              <PlusIcon color={Colors.white} />
              <Text style={styles.topupText}>Fund wallet</Text>
            </TouchableOpacity>
          </View>

          {/* Community bills card — all roles */}
          <View style={styles.communityCard}>
              <View style={styles.communityTitleRow}>
                <View style={styles.communityIconCircle}>
                  <BuildingIcon />
                </View>
                <Text style={styles.communityTitle}>Shared Compound Bills</Text>
              </View>

              <View style={styles.communityAmountRow}>
                <View>
                  <Text style={styles.communityLabel}>Total</Text>
                  <Text style={styles.communityTotalAmount}>{formatNaira(communityData.total)}</Text>
                </View>
                <View style={styles.paidBadge}>
                  <Text style={styles.paidCountText}>{communityData.paidCount} of {communityData.totalCount} paid</Text>
                  <View style={styles.avatarStack}>
                    {Array.from({ length: Math.min(communityData.paidCount, 3) }).map((_, i) => (
                      <View key={i} style={[styles.miniAvatar, { marginLeft: i > 0 ? -8 : 0, zIndex: 3 - i, overflow: 'hidden' }]}>
                        <DefaultAvatarIcon size={24} />
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.communityDivider} />

              <View style={styles.communityFooter}>
                <View>
                  <Text style={styles.communityLabel}>You Owe</Text>
                  <Text style={styles.communityOweAmount}>{formatNaira(communityData.youOwe)}</Text>
                </View>
                <TouchableOpacity style={styles.payNowDarkBtn} activeOpacity={0.8}>
                  <Text style={styles.payNowDarkText}>Pay Now</Text>
                </TouchableOpacity>
              </View>
          </View>
        </View>

        {/* Quick actions — landlord/agent only */}
        {isLandlordOrAgent && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionPrimary}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Bills', { screen: 'AddBill', params: {} })}
            >
              <PlusIcon />
              <Text style={styles.actionPrimaryLabel}>New bill</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionOutline} activeOpacity={0.8}>
              <PersonAddIcon />
              <Text style={styles.actionOutlineLabel}>Invite tenant</Text>
            </TouchableOpacity>
          </View>
        )}


        {/* Active bills stack — no card wrapper so back cards can overflow */}
        <View style={styles.activeBillsSection}>
          <Text style={styles.activeBillsTitle}>Upcoming bills</Text>
          <BillCardStack
            bills={activeBills}
            onPayPress={(id) => navigation.navigate('BillDetail', { billId: id })}
          />
        </View>

        {/* Recent payments — all roles */}
        <SectionCard>
          <SectionHead
            title={isLandlordOrAgent ? 'Recent payments' : 'My payments'}
            onSeeAll={() => navigation.navigate('Bills')}
          />
          {recentPayments.map((p, i) => (
            <View key={p.id}>
              {i > 0 && <Divider />}
              <View style={styles.paymentRow}>
                <View style={styles.avatar}>
                  <DefaultAvatarIcon size={40} />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentName}>{p.name}</Text>
                  <Text style={styles.paymentSub}>{p.bill}</Text>
                </View>
                <View style={styles.paymentRight}>
                  <Text style={styles.paymentAmount}>{formatNaira(p.amount)}</Text>
                  <Text style={styles.paymentDate}>{p.date}</Text>
                </View>
              </View>
            </View>
          ))}
        </SectionCard>
      </ScrollView>

      <PropertySelectorModal
        visible={showPropertySelector}
        current={selectedProperty}
        onSelect={setSelectedProperty}
        onClose={() => setShowPropertySelector(false)}
      />
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.screen },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 4,
  },
  headerLabel: { ...Typography.captionSmall, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 9 },
  propertySwitcher: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 },
  propertyName: { ...Typography.label, color: Colors.ink, fontSize: 15 },
  bellBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  badge: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: Colors.overdue, borderRadius: 8,
    minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  badgeText: { ...Typography.captionSmall, color: Colors.white, fontSize: 9 },

  content: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Layout.contentBottomPadding,
    gap: 12,
  },

  // Overview card
  overviewCard: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.card,
    padding: 20,
  },
  overviewEyebrow: { ...Typography.caption, color: 'rgba(255,255,255,0.6)', marginBottom: 6 },
  overviewAmount: { ...Typography.amountLarge, color: Colors.white, marginBottom: 16, fontSize: 20, lineHeight: 24 },

  // Wallet row
  walletRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  topupBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 99,
    paddingHorizontal: 14, paddingVertical: 9, marginTop: 4,
  },
  topupText: { ...Typography.captionSmall, color: Colors.white, fontFamily: 'DMSans_700Bold' },

  // Green community bills card
  communityCard: {
    backgroundColor: Colors.green,
    borderRadius: Radius.cardSm,
    padding: 14,
    gap: 10,
    marginTop: 16,
  },
  communityIconCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(12,24,34,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  communityTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  communityTitle: { ...Typography.label, color: Colors.ink, fontSize: 14, fontFamily: 'Syne_800ExtraBold' },
  paidBadge: { alignItems: 'flex-end', gap: 4 },
  avatarStack: { flexDirection: 'row', alignItems: 'center' },
  miniAvatar: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.green, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  paidCountText: { ...Typography.captionSmall, color: Colors.textSecondary, fontFamily: 'DMSans_700Bold', fontSize: 12 },
  communityAmountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  communityLabel: { ...Typography.body, fontSize: 15, fontFamily: 'DMSans_700Bold', color: 'rgba(12,24,34,0.65)' },
  communityTotalAmount: { ...Typography.amountLarge, color: Colors.ink, fontSize: 20, lineHeight: 26 },
  communityDivider: { height: 1, backgroundColor: 'rgba(12,24,34,0.08)' },
  communityFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  communityOweAmount: { ...Typography.amountLarge, color: Colors.ink, fontSize: 20, marginTop: 2 },
  payNowDarkBtn: {
    backgroundColor: Colors.white, borderRadius: 99,
    borderWidth: 1.5, borderColor: Colors.ink,
    paddingHorizontal: 18, paddingVertical: 10,
  },
  payNowDarkText: { ...Typography.caption, color: Colors.ink, fontFamily: 'DMSans_700Bold', fontSize: 13 },

  // Quick actions
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionPrimary: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: Colors.ink, borderRadius: 99, paddingVertical: 10,
  },
  actionPrimaryLabel: { ...Typography.buttonSmall, color: Colors.white, fontSize: 12 },
  actionOutline: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: Colors.white, borderRadius: 99, paddingVertical: 10,
    borderWidth: 1.5, borderColor: Colors.ink,
  },
  actionOutlineLabel: { ...Typography.buttonSmall, color: Colors.ink, fontSize: 12 },

  // Active bills (no card wrapper)
  activeBillsSection: { gap: 10, overflow: 'visible', marginTop: 8, marginBottom: -20 },
  activeBillsTitle: { ...Typography.label, color: Colors.ink },

  // Section card
  section: { backgroundColor: Colors.white, borderRadius: Radius.card, padding: 16, gap: 14, overflow: 'visible' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { ...Typography.label, color: Colors.ink },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAll: { ...Typography.caption, color: Colors.textSecondary },
  divider: { height: 1, backgroundColor: Colors.line, marginVertical: 12 },

  // Shared chip styles
  stateChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  stateChipText: { ...Typography.captionSmall },

  // Bill card stack
  stackContainer: { height: 180, position: 'relative', overflow: 'visible' },
  billCard: {
    position: 'absolute', top: 0, left: 0, right: 0,
    backgroundColor: Colors.white,
    borderRadius: Radius.cardSm,
    padding: 14, gap: 8,
  },
  billCardBack: { overflow: 'hidden' },
  billCardAccent: { position: 'absolute', top: 0, left: 0, width: 4, bottom: 0, borderTopLeftRadius: Radius.cardSm, borderBottomLeftRadius: Radius.cardSm },
  billCardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, paddingLeft: 8 },
  billCardName: { ...Typography.label, color: Colors.ink, flex: 1 },
  billCardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 8 },
  billMetaText: { ...Typography.captionSmall, color: Colors.textMuted },
  billUnit: { ...Typography.captionSmall, color: Colors.textSecondary, fontFamily: 'DMSans_700Bold' },
  swipeHint: { ...Typography.captionSmall, color: Colors.textMuted, textAlign: 'right', paddingLeft: 8 },
  payNowBtn: {
    backgroundColor: Colors.ink, borderRadius: 99,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  payNowText: { ...Typography.captionSmall, color: Colors.green },

  // Property selector modal
  backdrop: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(12,24,34,0.55)' },
  propSelectorWrap: { position: 'absolute', top: 90, left: Layout.screenPadding, right: Layout.screenPadding },
  propSelector: {
    backgroundColor: Colors.white, borderRadius: Radius.card,
    borderWidth: 1.5, borderColor: Colors.line, overflow: 'hidden', padding: 4,
  },
  propSelectorTitle: {
    ...Typography.captionSmall, color: Colors.textMuted,
    fontFamily: 'Syne_800ExtraBold', textTransform: 'uppercase', letterSpacing: 0.5,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  propSelectorRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
    paddingVertical: 12, borderRadius: Radius.cardSm, gap: 12,
  },
  propSelectorRowActive: { backgroundColor: Colors.mint },
  propSelectorLeft: { flex: 1 },
  propSelectorName: { ...Typography.label, color: Colors.ink },
  propSelectorMeta: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  propSelectorCheck: { fontSize: 16, color: Colors.green, fontFamily: 'Syne_800ExtraBold' },

  // Payment rows
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5, borderColor: Colors.line,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  paymentInfo: { flex: 1 },
  paymentName: { ...Typography.label, color: Colors.ink },
  paymentSub: { ...Typography.captionSmall, color: Colors.textSecondary, marginTop: 1 },
  paymentRight: { alignItems: 'flex-end', gap: 2 },
  paymentAmount: { ...Typography.label, color: Colors.ink },
  paymentDate: { ...Typography.captionSmall, color: Colors.textMuted },
});
