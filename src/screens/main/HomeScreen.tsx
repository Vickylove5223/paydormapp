import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Ellipse, Rect } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Layout, Radius } from '@/theme';
import { useAuthStore } from '@/store/auth';
import { useAppStore } from '@/store/app';
import { formatNaira } from '@/utils/money';
import { UserRole } from '@/types';

// ── Mock data ──────────────────────────────────────────────────────────────────
// Replace these with API calls once endpoints are wired up.

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
    { id: 'p1', tenantName: 'Tolu Adeyemi', billTitle: 'August EKEDC', amount: 1200000, createdAt: '2026-10-11T08:22:00Z', household: 'Flat 3B' },
    { id: 'p2', tenantName: 'Kemi Okafor', billTitle: 'Service charge', amount: 500000, createdAt: '2026-10-10T16:45:00Z', household: 'Flat 2A' },
    { id: 'p3', tenantName: 'Femi Adekunle', billTitle: 'August EKEDC', amount: 1200000, createdAt: '2026-10-10T11:30:00Z', household: 'Flat 4C' },
    { id: 'p4', tenantName: 'Amara Nwosu', billTitle: 'Service charge', amount: 500000, createdAt: '2026-10-09T09:15:00Z', household: 'Flat 1A' },
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
    { id: 'p1', billTitle: 'July EKEDC', amount: 1200000, createdAt: '2026-09-29T08:00:00Z' },
    { id: 'p2', billTitle: 'Service charge', amount: 500000, createdAt: '2026-09-28T10:00:00Z' },
    { id: 'p3', billTitle: 'Water supply', amount: 350000, createdAt: '2026-09-27T14:00:00Z' },
  ],
};

// ── Types & helpers ────────────────────────────────────────────────────────────

type BillState = 'overdue' | 'due' | 'upcoming' | 'partially_paid' | 'paid';

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

function timeAgoShort(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
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
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4M9 11h2M13 11h2M9 15h2M13 15h2" stroke={Colors.ink} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
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

function DefaultAvatarIcon({ size = 24 }: { size?: number }) {
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

// ── Landlord/Agent view ────────────────────────────────────────────────────────

function LandlordHome({ navigation }: { navigation: any }) {
  const d = MOCK_LANDLORD;

  return (
    <>
      {/* Overview card */}
      <View style={styles.overviewCard}>
        <Text style={styles.overviewEyebrow}>Collected this month</Text>
        <Text style={styles.overviewAmount}>{formatNaira(d.collectedKobo)}</Text>
        <View style={styles.overviewBarBg}>
          <View style={[styles.overviewBarFill, { width: `${Math.round(d.collectionRate * 100)}%` as any }]} />
        </View>
        <Text style={styles.overviewRate}>{Math.round(d.collectionRate * 100)}% collection rate</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{d.tenantCount}</Text>
            <Text style={styles.statLabel}>Tenants</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{formatNaira(d.outstandingKobo)}</Text>
            <Text style={styles.statLabel}>Outstanding</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{d.bills.length}</Text>
            <Text style={styles.statLabel}>Active bills</Text>
          </View>
        </View>
      </View>

      {/* Quick actions */}
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

      {/* Bills section */}
      <SectionCard>
        <SectionHead title="Active bills" onSeeAll={() => navigation.navigate('Bills')} />
        {d.bills.map((bill, i) => {
          const tone = BILL_TONE[bill.state];
          const pct = bill.totalCount > 0 ? bill.paidCount / bill.totalCount : 0;
          return (
            <View key={bill.id}>
              {i > 0 && <Divider />}
              <View style={styles.billRow}>
                <View style={[styles.billDot, { backgroundColor: tone.dot }]} />
                <View style={styles.billInfo}>
                  <View style={styles.billTitleRow}>
                    <Text style={styles.billName} numberOfLines={1}>{bill.title}</Text>
                    <View style={[styles.stateChip, { backgroundColor: tone.bg }]}>
                      <Text style={[styles.stateChipText, { color: tone.text }]}>
                        {BILL_STATE_LABEL[bill.state]}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.billMeta}>
                    <Text style={styles.billMetaText}>{bill.paidCount}/{bill.totalCount} paid · Due {fmtDate(bill.dueDate)}</Text>
                    <Text style={styles.billUnit}>{formatNaira(bill.amountPerHousehold)}/unit</Text>
                  </View>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: `${Math.round(pct * 100)}%` as any }]} />
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </SectionCard>

      {/* Recent payments */}
      <SectionCard>
        <SectionHead title="Recent payments" onSeeAll={() => navigation.navigate('Levies')} />
        {d.payments.map((p, i) => {
          return (
            <View key={p.id}>
              {i > 0 && <Divider />}
              <View style={styles.paymentRow}>
                <View style={styles.avatar}>
                  <DefaultAvatarIcon size={22} />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentName}>{p.tenantName}</Text>
                  <Text style={styles.paymentSub}>{p.billTitle} · {p.household}</Text>
                </View>
                <View style={styles.paymentRight}>
                  <Text style={styles.paymentAmount}>{formatNaira(p.amount)}</Text>
                  <Text style={styles.paymentTime}>{timeAgoShort(p.createdAt)}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </SectionCard>
    </>
  );
}

// ── Tenant / Master Tenant view ────────────────────────────────────────────────

function TenantHome({ navigation }: { navigation: any }) {
  const d = MOCK_TENANT;

  return (
    <>
      {/* Wallet Balance + Community Bills card */}
      <View style={styles.overviewCard}>
        {/* Top: wallet balance + topup button */}
        <View style={styles.walletRow}>
          <View>
            <Text style={styles.overviewEyebrow}>Wallet Balance</Text>
            <Text style={styles.overviewAmount}>{formatNaira(d.walletBalance)}</Text>
          </View>
          <TouchableOpacity style={styles.topupBtn} activeOpacity={0.75}>
            <PlusIcon color={Colors.green} />
            <Text style={styles.topupText}>Topup Wallet</Text>
          </TouchableOpacity>
        </View>

        {/* Green community bills nested card */}
        <View style={styles.communityCard}>
          {/* Header row: icon + title | paid count + avatars */}
          <View style={styles.communityHeaderRow}>
            <View style={styles.communityTitleRow}>
              <BuildingIcon />
              <Text style={styles.communityTitle}>Shared Community Bills</Text>
            </View>
            <View style={styles.paidBadge}>
              {/* Mini avatar stack */}
              <View style={styles.avatarStack}>
                {['#A98BFF', '#40CE86', '#F6A935'].slice(0, Math.min(d.communityBills.paidCount, 3)).map((color, i) => (
                  <View key={i} style={[styles.miniAvatar, { backgroundColor: color, marginLeft: i > 0 ? -6 : 0, zIndex: 3 - i }]} />
                ))}
              </View>
              <Text style={styles.paidCountText}>{d.communityBills.paidCount} of {d.communityBills.totalCount} paid</Text>
            </View>
          </View>

          {/* Total amount */}
          <View style={styles.communityAmountRow}>
            <Text style={styles.communityLabel}>Total</Text>
            <Text style={styles.communityTotalAmount}>{formatNaira(d.communityBills.total)}</Text>
          </View>

          <View style={styles.communityDivider} />

          {/* You Owe + Pay Now */}
          <View style={styles.communityFooter}>
            <View>
              <Text style={styles.communityLabel}>You Owe</Text>
              <Text style={styles.communityOweAmount}>{formatNaira(d.communityBills.youOwe)}</Text>
            </View>
            <TouchableOpacity style={styles.payNowDarkBtn} activeOpacity={0.8}>
              <Text style={styles.payNowDarkText}>Pay Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* My bills */}
      <SectionCard>
        <SectionHead title="My bills" onSeeAll={() => navigation.navigate('Bills')} />
        {d.bills.map((bill, i) => {
          const tone = BILL_TONE[bill.state];
          return (
            <View key={bill.id}>
              {i > 0 && <Divider />}
              <View style={styles.tenantBillRow}>
                <View style={[styles.billDot, { backgroundColor: tone.dot, marginTop: 6 }]} />
                <View style={styles.billInfo}>
                  <View style={styles.billTitleRow}>
                    <Text style={styles.billName} numberOfLines={1}>{bill.title}</Text>
                    <View style={[styles.stateChip, { backgroundColor: tone.bg }]}>
                      <Text style={[styles.stateChipText, { color: tone.text }]}>
                        {BILL_STATE_LABEL[bill.state]}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.billMetaText}>Due {fmtDate(bill.dueDate)}</Text>
                </View>
                <View style={styles.tenantBillRight}>
                  <Text style={styles.paymentAmount}>{formatNaira(bill.amountDue)}</Text>
                  {(bill.state === 'overdue' || bill.state === 'due') && (
                    <TouchableOpacity style={styles.payNowBtn}>
                      <Text style={styles.payNowText}>Pay</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </SectionCard>

      {/* Recent payments */}
      <SectionCard>
        <SectionHead title="My payments" onSeeAll={() => navigation.navigate('Levies')} />
        {d.payments.map((p, i) => (
          <View key={p.id}>
            {i > 0 && <Divider />}
            <View style={styles.paymentRow}>
              <View style={[styles.avatar, { backgroundColor: Colors.paidBg }]}>
                <Text style={[styles.avatarText, { color: Colors.paid }]}>✓</Text>
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentName}>{p.billTitle}</Text>
                <Text style={styles.paymentSub}>{timeAgoShort(p.createdAt)}</Text>
              </View>
              <Text style={styles.paymentAmount}>{formatNaira(p.amount)}</Text>
            </View>
          </View>
        ))}
      </SectionCard>
    </>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const { unreadCount, role } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  const firstName = user?.firstName ?? 'there';

  // During preview, default to landlord view. In production role comes from setActiveContext.
  const effectiveRole: UserRole = role ?? 'landlord';
  const isLandlordOrAgent = effectiveRole === 'landlord' || effectiveRole === 'agent';
  const propertyName = isLandlordOrAgent ? MOCK_LANDLORD.propertyName : MOCK_TENANT.propertyName;

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
        {/* Header — scrolls with content */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>Property</Text>
            <TouchableOpacity style={styles.propertySwitcher} activeOpacity={0.7}>
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

        {isLandlordOrAgent
          ? <LandlordHome navigation={navigation} />
          : <TenantHome navigation={navigation} />
        }
      </ScrollView>
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
  headerLabel: { ...Typography.captionSmall, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
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

  // Overview card (shared by both views)
  overviewCard: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.card,
    padding: 20,
  },
  overviewEyebrow: { ...Typography.caption, color: 'rgba(255,255,255,0.6)', marginBottom: 6 },
  overviewAmount: { ...Typography.amountLarge, color: Colors.white, marginBottom: 16 },
  overviewBarBg: {
    height: 5, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 99, overflow: 'hidden', marginBottom: 6,
  },
  overviewBarFill: { height: 5, backgroundColor: Colors.green, borderRadius: 99 },
  overviewRate: { ...Typography.caption, color: Colors.green, marginBottom: 20 },
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: Radius.cardSm, padding: 14,
  },
  statCell: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { ...Typography.buttonSmall, color: Colors.white },
  statLabel: { ...Typography.captionSmall, color: 'rgba(255,255,255,0.55)' },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.12)' },

  // Quick actions
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionPrimary: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.ink, borderRadius: 99, paddingVertical: 13,
  },
  actionPrimaryLabel: { ...Typography.buttonSmall, color: Colors.white },
  actionOutline: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.white, borderRadius: 99, paddingVertical: 13,
    borderWidth: 1.5, borderColor: Colors.ink,
  },
  actionOutlineLabel: { ...Typography.buttonSmall, color: Colors.ink },

  // Section card
  section: { backgroundColor: Colors.white, borderRadius: Radius.card, padding: 16, gap: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { ...Typography.label, color: Colors.ink },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAll: { ...Typography.caption, color: Colors.textSecondary },
  divider: { height: 1, backgroundColor: Colors.line, marginVertical: 12 },

  // Bill rows (landlord)
  billRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  billDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5, flexShrink: 0 },
  billInfo: { flex: 1, gap: 6 },
  billTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  billName: { ...Typography.label, color: Colors.ink, flex: 1 },
  stateChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  stateChipText: { ...Typography.captionSmall },
  billMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  billMetaText: { ...Typography.captionSmall, color: Colors.textMuted },
  billUnit: { ...Typography.captionSmall, color: Colors.textSecondary, fontFamily: 'DMSans_700Bold' },
  barBg: { height: 4, backgroundColor: Colors.line, borderRadius: 99, overflow: 'hidden' },
  barFill: { height: 4, backgroundColor: Colors.green, borderRadius: 99 },

  // Tenant bill rows
  tenantBillRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  tenantBillRight: { alignItems: 'flex-end', gap: 6 },
  payNowBtn: {
    backgroundColor: Colors.ink, borderRadius: 99,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  payNowText: { ...Typography.captionSmall, color: Colors.green },

  // Payment rows (shared)
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.mint, borderWidth: 1.5, borderColor: Colors.line,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarText: { ...Typography.label, color: Colors.ink },
  paymentInfo: { flex: 1 },
  paymentName: { ...Typography.label, color: Colors.ink },
  paymentSub: { ...Typography.captionSmall, color: Colors.textSecondary, marginTop: 1 },
  paymentRight: { alignItems: 'flex-end' },
  paymentAmount: { ...Typography.label, color: Colors.ink },
  paymentTime: { ...Typography.captionSmall, color: Colors.textMuted, marginTop: 1 },

  // Tenant wallet row inside overview card
  walletRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  topupBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1.5, borderColor: Colors.green, borderRadius: 99,
    paddingHorizontal: 12, paddingVertical: 7, marginTop: 4,
  },
  topupText: { ...Typography.captionSmall, color: Colors.green, fontFamily: 'DMSans_700Bold' },

  // Green community bills card
  communityCard: {
    backgroundColor: Colors.mint,
    borderRadius: Radius.cardSm,
    padding: 14,
    gap: 10,
  },
  communityHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  communityTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  communityTitle: { ...Typography.label, color: Colors.ink, fontSize: 13 },
  paidBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  avatarStack: { flexDirection: 'row', alignItems: 'center' },
  miniAvatar: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: Colors.mint },
  paidCountText: { ...Typography.captionSmall, color: Colors.textSecondary },
  communityAmountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  communityLabel: { ...Typography.captionSmall, color: Colors.textMuted },
  communityTotalAmount: { ...Typography.buttonSmall, color: Colors.ink },
  communityDivider: { height: 1, backgroundColor: 'rgba(12,24,34,0.08)' },
  communityFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  communityOweAmount: { ...Typography.label, color: Colors.ink, marginTop: 2 },
  payNowDarkBtn: {
    backgroundColor: Colors.ink, borderRadius: 99,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  payNowDarkText: { ...Typography.captionSmall, color: Colors.white, fontFamily: 'DMSans_700Bold' },
});
