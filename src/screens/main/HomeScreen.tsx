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
  Share,
  TextInput,
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
import { Button } from '@/components/common/Button';
import { BankFavicon } from '@/components/common/BankFavicon';

export interface HouseholdOption {
  id: string;
  name: string;
  floorOrBlock?: string;
  propertyId: string;
  propertyName: string;
  city: string;
  role: string;
}

export const MOCK_HOUSEHOLDS: HouseholdOption[] = [
  {
    id: 'h1',
    name: 'Flat 3B',
    floorOrBlock: 'Block B',
    propertyId: 'prop1',
    propertyName: 'Lekki Gardens Estate',
    city: 'Lagos',
    role: 'Tenant',
  },
  {
    id: 'h2',
    name: 'Flat 2A',
    floorOrBlock: 'Block A',
    propertyId: 'prop1',
    propertyName: 'Lekki Gardens Estate',
    city: 'Lagos',
    role: 'Tenant',
  },
  {
    id: 'h3',
    name: 'Flat 1A',
    floorOrBlock: 'Block A',
    propertyId: 'prop1',
    propertyName: 'Lekki Gardens Estate',
    city: 'Lagos',
    role: 'Landlord',
  },
  {
    id: 'h4',
    name: 'Flat 4C',
    floorOrBlock: 'Block C',
    propertyId: 'prop1',
    propertyName: 'Lekki Gardens Estate',
    city: 'Lagos',
    role: 'Tenant',
  },
  {
    id: 'h5',
    name: 'Apt 502',
    floorOrBlock: 'Floor 5',
    propertyId: 'prop2',
    propertyName: 'Victoria Island Towers',
    city: 'Lagos',
    role: 'Tenant',
  },
  {
    id: 'h6',
    name: 'Apt 201',
    floorOrBlock: 'Floor 2',
    propertyId: 'prop2',
    propertyName: 'Victoria Island Towers',
    city: 'Lagos',
    role: 'Agent',
  },
  {
    id: 'h7',
    name: 'Unit 4',
    floorOrBlock: 'Wing B',
    propertyId: 'prop3',
    propertyName: 'Palm Heights Compound',
    city: 'Abuja',
    role: 'Master Tenant',
  },
];

export interface MonthlyPayableBill {
  id: string;
  title: string;
  category: 'one_time' | 'private';
  categoryLabel: string;
  dueDate: string;
  amount: number; // in kobo
}

export const MONTHLY_ADDITIONAL_BILLS: MonthlyPayableBill[] = [
  {
    id: 'ot-1',
    title: 'Plumbing repair',
    category: 'one_time',
    categoryLabel: 'One-time',
    dueDate: '18 Oct',
    amount: 1800000, // ₦18,000
  },
  {
    id: 'pb-1',
    title: 'Netflix subscription',
    category: 'private',
    categoryLabel: 'Private',
    dueDate: '25 Oct',
    amount: 450000, // ₦4,500
  },
  {
    id: 'pb-2',
    title: 'Personal fibre broadband',
    category: 'private',
    categoryLabel: 'Private',
    dueDate: '30 Oct',
    amount: 1200000, // ₦12,000
  },
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
  communityBills: { total: 9200000, paidCount: 3, totalCount: 4, youOwe: 2300000 },
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

function daysLabel(iso: string) {
  const diff = Math.round((new Date(iso).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000);
  if (diff === 0) return 'Due today';
  if (diff > 0) return `Due in ${diff} day${diff === 1 ? '' : 's'}`;
  return `${Math.abs(diff)} day${Math.abs(diff) === 1 ? '' : 's'} overdue`;
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

function PropertyIcon({ color = Colors.ink }: { color?: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="3" width="16" height="18" rx="2" stroke={color} strokeWidth={2} />
      <Path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M9 21v-3h6v3" stroke={color} strokeWidth={1.8} />
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

// ── Household selector modal ───────────────────────────────────────────────────

function HouseholdSelectorModal({
  visible,
  currentId,
  onSelect,
  onClose,
}: {
  visible: boolean;
  currentId: string;
  onSelect: (household: HouseholdOption) => void;
  onClose: () => void;
}) {
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState<string>('all');

  const uniqueProperties = [
    { id: 'all', name: 'All' },
    ...Array.from(new Set(MOCK_HOUSEHOLDS.map((h) => h.propertyId))).map((propId) => {
      const match = MOCK_HOUSEHOLDS.find((h) => h.propertyId === propId)!;
      return { id: propId, name: match.propertyName, city: match.city };
    }),
  ];

  const filteredHouseholds =
    selectedPropertyFilter === 'all'
      ? MOCK_HOUSEHOLDS
      : MOCK_HOUSEHOLDS.filter((h) => h.propertyId === selectedPropertyFilter);

  const propertyGroups = Array.from(
    new Set(filteredHouseholds.map((h) => h.propertyId))
  ).map((propId) => {
    const households = filteredHouseholds.filter((h) => h.propertyId === propId);
    return {
      propertyId: propId,
      propertyName: households[0].propertyName,
      city: households[0].city,
      households,
    };
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.propSelectorWrap}>
        <View style={styles.propSelector}>
          <View style={styles.sheetHandle} />
          <View style={styles.propSelectorHeaderRow}>
            <View>
              <Text style={styles.propSelectorTitle}>Switch Household</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={8} style={styles.propSelectorCloseBtn}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path d="M18 6L6 18M6 6l12 12" stroke={Colors.ink} strokeWidth={2.2} strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* List of households */}
          <ScrollView style={styles.propSelectorScroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
            {propertyGroups.map((group, gIdx) => (
              <View key={group.propertyId} style={[styles.propGroup, gIdx > 0 && styles.propGroupBorder]}>
                {group.households.map((h) => {
                  const isSelected = currentId === h.id;
                  const isLandlord = h.role === 'Landlord';
                  return (
                    <TouchableOpacity
                      key={h.id}
                      style={[styles.propSelectorRow, isSelected && styles.propSelectorRowActive]}
                      onPress={() => { onSelect(h); onClose(); }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.propSelectorLeft}>
                        <View style={styles.householdNameRow}>
                          <Text style={[styles.propSelectorName, isSelected && { color: Colors.ink, fontFamily: 'DMSans_700Bold' }]}>{h.name}</Text>
                          {h.floorOrBlock ? (
                            <View style={styles.propSelectorBadge}>
                              <Text style={styles.propSelectorBadgeText}>{h.floorOrBlock}</Text>
                            </View>
                          ) : null}
                        </View>
                        <View style={styles.propSelectorMetaRow}>
                          <Text style={styles.propSelectorMeta}>{h.propertyName}</Text>
                          <View style={[styles.roleChip, isLandlord ? styles.roleChipLandlord : styles.roleChipTenant]}>
                            <Text style={[styles.roleChipText, isLandlord ? { color: '#065F46' } : { color: '#3730A3' }]}>{h.role}</Text>
                          </View>
                        </View>
                      </View>
                      {isSelected ? (
                        <View style={styles.propCheckCircle}>
                          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                            <Path d="M5 12l5 5L20 7" stroke={Colors.white} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                          </Svg>
                        </View>
                      ) : (
                        <View style={styles.propCheckEmpty} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ── Invite tenant modal ────────────────────────────────────────────────────────

function InviteTenantModal({
  visible,
  household,
  onClose,
}: {
  visible: boolean;
  household: HouseholdOption;
  onClose: () => void;
}) {
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [sent, setSent] = useState(false);

  const inviteCode = `PD-${household.name.replace(/\s+/g, '').toUpperCase()}-8821`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join ${household.name} at ${household.propertyName} on PayDorm! Use unit invite code: ${inviteCode}`,
        title: 'Invite Tenant to PayDorm',
      });
    } catch {
      // ignore
    }
  };

  const handleSendInvite = () => {
    if (!phoneOrEmail.trim()) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setPhoneOrEmail('');
      onClose();
    }, 1200);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.paySheetWrap}>
        <View style={styles.paySheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.propSelectorHeaderRow}>
            <View>
              <Text style={styles.propSelectorTitle}>Invite Tenant</Text>
              <Text style={styles.propSelectorSub}>
                {household.name} · {household.propertyName}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Text style={styles.propSelectorClose}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Invite Code Card */}
          <View style={styles.inviteCodeCard}>
            <Text style={styles.inviteCodeLabel}>Unit Invite Code</Text>
            <Text style={styles.inviteCodeVal}>{inviteCode}</Text>
            <TouchableOpacity style={styles.inviteShareBtn} activeOpacity={0.8} onPress={handleShare}>
              <Text style={styles.inviteShareBtnText}>Share code via...</Text>
            </TouchableOpacity>
          </View>

          {/* Direct invite */}
          <View style={styles.inviteInputSection}>
            <Text style={styles.inviteInputLabel}>Or invite via phone / email</Text>
            <View style={styles.inviteInputRow}>
              <TextInput
                placeholder="e.g. +234 801 234 5678"
                value={phoneOrEmail}
                onChangeText={setPhoneOrEmail}
                style={styles.inviteInput}
                placeholderTextColor={Colors.textMuted}
              />
              <TouchableOpacity
                style={[styles.inviteSendBtn, !phoneOrEmail.trim() && styles.inviteSendBtnDisabled]}
                onPress={handleSendInvite}
                disabled={!phoneOrEmail.trim()}
              >
                <Text style={styles.inviteSendBtnText}>{sent ? 'Sent ✓' : 'Invite'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Button label="Done" variant="ghost" onPress={onClose} />
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
          zIndex: 1, backgroundColor: '#6B50D8', height: 114,
          transform: [{ translateY: 8 }, { scale: 0.93 }],
        }]} />
      )}
      {/* 2nd card */}
      {second && (
        <View style={[styles.billCard, styles.billCardBack, {
          zIndex: 2, backgroundColor: '#8B70F0', height: 114,
          transform: [{ translateY: 4 }, { scale: 0.965 }],
        }]} />
      )}
      {/* Front card — animated */}
      <AnimatedTouchable
        activeOpacity={n > 1 ? 0.92 : 1}
        onPress={n > 1 ? advance : undefined}
        style={[styles.billCard, {
          zIndex: 10, backgroundColor: Colors.violet,
          transform: [{ translateX: slideX }, { translateY: slideY }],
          opacity: cardOpacity,
        }]}
      >
        <View style={styles.billCardTopRow}>
          <View style={styles.daysChip}>
            <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
              <Circle cx={12} cy={12} r={9} stroke="#7A4800" strokeWidth={2} />
              <Path d="M12 7v5l3 3" stroke="#7A4800" strokeWidth={2} strokeLinecap="round" />
            </Svg>
            <Text style={styles.daysChipText}>{daysLabel(front.dueDate)}</Text>
          </View>
          {(front.state === 'overdue' || front.state === 'due') && (
            <TouchableOpacity
              style={styles.payNowBtn}
              onPress={(e) => { e.stopPropagation?.(); onPayPress?.(front.id); }}
            >
              <Text style={styles.payNowText}>Pay now</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.billCardTitleRow}>
          <Text style={styles.billCardName} numberOfLines={1}>{front.title}</Text>
          <Text style={styles.billUnit}>{formatNaira(front.amountDue)}</Text>
        </View>
        {front.subtitle ? (
          <Text style={styles.billCardSubtitle} numberOfLines={1}>{front.subtitle}</Text>
        ) : null}
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
  const [showHouseholdSelector, setShowHouseholdSelector] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState<HouseholdOption>(MOCK_HOUSEHOLDS[0]);

  const effectiveRole: UserRole = role ?? (selectedHousehold.role.toLowerCase().replace(' ', '_') as UserRole);
  const isLandlordOrAgent =
    effectiveRole === 'landlord' || effectiveRole === 'agent' || effectiveRole === 'master_tenant';
  const paysSharedBills =
    effectiveRole === 'tenant' || effectiveRole === 'master_tenant';

  const propertyName = selectedHousehold.propertyName;

  // Wallet balance — always show user's wallet
  const walletLabel = 'Wallet Balance';
  const [walletAmount, setWalletAmount] = useState(MOCK_TENANT.walletBalance);
  const [communityData, setCommunityData] = useState(MOCK_TENANT.communityBills);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [includeCompound, setIncludeCompound] = useState(true);
  const [selectedAdditionalBillIds, setSelectedAdditionalBillIds] = useState<string[]>([]);
  const [paidTotalAmount, setPaidTotalAmount] = useState(0);
  const [paidBillsList, setPaidBillsList] = useState<{ title: string; categoryLabel: string; amount: number }[]>([]);

  const selectedAdditionalBills = MONTHLY_ADDITIONAL_BILLS.filter((b) =>
    selectedAdditionalBillIds.includes(b.id)
  );
  const compoundAmount = includeCompound ? communityData.youOwe : 0;
  const additionalTotal = selectedAdditionalBills.reduce((acc, b) => acc + b.amount, 0);
  const totalToPay = compoundAmount + additionalTotal;
  const totalBillsCount = (includeCompound && communityData.youOwe > 0 ? 1 : 0) + selectedAdditionalBills.length;

  const toggleAdditionalBill = (id: string) => {
    setSelectedAdditionalBillIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedAdditionalBillIds.length === MONTHLY_ADDITIONAL_BILLS.length && includeCompound) {
      setSelectedAdditionalBillIds([]);
    } else {
      setIncludeCompound(true);
      setSelectedAdditionalBillIds(MONTHLY_ADDITIONAL_BILLS.map((b) => b.id));
    }
  };

  const handleOpenPay = (e?: any) => {
    e?.stopPropagation?.();
    setPaySuccess(false);
    setIncludeCompound(true);
    setSelectedAdditionalBillIds([]);
    setShowPayModal(true);
  };

  const handleConfirmPay = () => {
    if (totalToPay <= 0) return;
    setIsPaying(true);

    const paidList: { title: string; categoryLabel: string; amount: number }[] = [];
    if (includeCompound && communityData.youOwe > 0) {
      paidList.push({
        title: 'Shared Compound Bills',
        categoryLabel: 'Shared',
        amount: communityData.youOwe,
      });
    }
    selectedAdditionalBills.forEach((b) => {
      paidList.push({
        title: b.title,
        categoryLabel: b.categoryLabel,
        amount: b.amount,
      });
    });

    setTimeout(() => {
      setIsPaying(false);
      setPaidTotalAmount(totalToPay);
      setPaidBillsList(paidList);
      setPaySuccess(true);
      setWalletAmount((w) => Math.max(0, w - totalToPay));
      if (includeCompound) {
        setCommunityData((prev) => ({
          ...prev,
          youOwe: 0,
          paidCount: prev.totalCount,
        }));
      }
    }, 500);
  };

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

  // Recent payments — always show community payments with tenant names
  const recentPayments = MOCK_LANDLORD.payments.map(p => ({ id: p.id, name: p.tenantName, bill: fmtBillSub(p.billCat, p.billTitle, p.billMonth), date: fmtDateTime(p.createdAt), amount: p.amount }));

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
            <Text style={styles.headerLabel}>Household</Text>
            <TouchableOpacity
              style={styles.propertySwitcher}
              activeOpacity={0.7}
              onPress={() => setShowHouseholdSelector(true)}
            >
              <Text style={styles.propertyName}>{selectedHousehold.name}</Text>
              <Text style={styles.propertySub}>· {selectedHousehold.propertyName}</Text>
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
          <TouchableOpacity
            style={styles.communityCard}
            activeOpacity={0.92}
            onPress={() => navigation.navigate('BillDetail', { billId: 'shared-compound' })}
          >
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
                  {Array.from({ length: Math.min(communityData.paidCount, 4) }).map((_, i) => (
                    <View key={i} style={[styles.miniAvatar, { marginLeft: i > 0 ? -8 : 0, zIndex: 4 - i, overflow: 'hidden' }]}>
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
                <Text style={styles.communityOweAmount}>
                  {communityData.youOwe > 0 ? formatNaira(communityData.youOwe) : '₦0 (Paid ✓)'}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.payNowDarkBtn,
                  communityData.youOwe === 0 && styles.payNowDarkBtnDisabled,
                ]}
                activeOpacity={communityData.youOwe > 0 ? 0.8 : 1}
                onPress={handleOpenPay}
              >
                <Text style={[styles.payNowDarkText, communityData.youOwe === 0 && styles.payNowDarkTextDisabled]}>
                  {communityData.youOwe > 0 ? 'Pay Now' : 'Paid ✓'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
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
              <Text style={styles.actionPrimaryLabel} numberOfLines={1}>New charges</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionOutline}
              activeOpacity={0.8}
              onPress={() => setShowInviteModal(true)}
            >
              <PersonAddIcon />
              <Text style={styles.actionOutlineLabel} numberOfLines={1}>Invite tenant</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionOutline}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Me', { screen: 'Properties' })}
            >
              <PropertyIcon />
              <Text style={styles.actionOutlineLabel} numberOfLines={1}>Properties</Text>
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
            title="Recent payments"
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

      <HouseholdSelectorModal
        visible={showHouseholdSelector}
        currentId={selectedHousehold.id}
        onSelect={setSelectedHousehold}
        onClose={() => setShowHouseholdSelector(false)}
      />

      <InviteTenantModal
        visible={showInviteModal}
        household={selectedHousehold}
        onClose={() => setShowInviteModal(false)}
      />

      {/* Pay Compound & Monthly Bills Modal */}
      <Modal visible={showPayModal} transparent animationType="slide" onRequestClose={() => setShowPayModal(false)}>
        <Pressable style={styles.backdrop} onPress={() => setShowPayModal(false)} />
        <View style={styles.paySheetWrap}>
          <View style={styles.paySheet}>
            <View style={styles.sheetHandle} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.paySheetScroll}>
              {!paySuccess ? (
                <>
                  <View style={styles.payHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.paySheetTitle}>Pay Monthly Bills</Text>
                      <Text style={styles.paySheetSub}>
                        October 2026 · {selectedHousehold.name} ({selectedHousehold.propertyName})
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowPayModal(false)} hitSlop={8}>
                      <Text style={styles.propSelectorClose}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Summary Card */}
                  <View style={styles.payAmountCard}>
                    <Text style={styles.payAmountLabel}>
                      {totalBillsCount > 1
                        ? `Total to pay (${totalBillsCount} bills selected)`
                        : 'Your share to pay'}
                    </Text>
                    <Text style={styles.payAmountValue}>{formatNaira(totalToPay)}</Text>
                    <View style={styles.paySplitPill}>
                      <Text style={styles.paySplitPillText}>
                        {totalBillsCount === 0
                          ? 'Select bills below to proceed'
                          : totalBillsCount === 1 && includeCompound
                          ? `Equal 1/4 share (${selectedHousehold.name})`
                          : includeCompound
                          ? `Compound (${formatNaira(communityData.youOwe)}) + ${selectedAdditionalBills.length} other bill${selectedAdditionalBills.length === 1 ? '' : 's'}`
                          : `${selectedAdditionalBills.length} bill${selectedAdditionalBills.length === 1 ? '' : 's'} selected`}
                      </Text>
                    </View>
                  </View>

                  {/* Selection List: Compound, One-time & Private bills */}
                  <View style={styles.addBillsSection}>
                    <View style={styles.addBillsHeaderRow}>
                      <Text style={styles.addBillsSectionTitle}>Bills to pay together</Text>
                      <TouchableOpacity onPress={toggleSelectAll} hitSlop={6}>
                        <Text style={styles.addBillsSelectAll}>
                          {selectedAdditionalBillIds.length === MONTHLY_ADDITIONAL_BILLS.length && includeCompound
                            ? 'Deselect all'
                            : 'Select all'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Shared Compound Bill */}
                    {communityData.youOwe > 0 && (
                      <TouchableOpacity
                        style={[styles.addBillRow, includeCompound && styles.addBillRowSelected]}
                        onPress={() => setIncludeCompound((prev) => !prev)}
                        activeOpacity={0.75}
                      >
                        <View style={[styles.checkbox, includeCompound && styles.checkboxActive]}>
                          {includeCompound && <Text style={styles.checkmarkText}>✓</Text>}
                        </View>
                        <View style={styles.addBillInfo}>
                          <View style={styles.addBillTitleRow}>
                            <Text style={styles.addBillTitle}>Shared Compound Bills</Text>
                            <View style={[styles.addBillBadge, styles.badgeShared]}>
                              <Text style={styles.addBillBadgeText}>Shared</Text>
                            </View>
                          </View>
                          <Text style={styles.addBillDueDate}>Due 15 Oct · Compound share</Text>
                        </View>
                        <Text style={[styles.addBillAmount, includeCompound && styles.addBillAmountSelected]}>
                          {formatNaira(communityData.youOwe)}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* One-time & Private bills */}
                    {MONTHLY_ADDITIONAL_BILLS.map((b) => {
                      const isSelected = selectedAdditionalBillIds.includes(b.id);
                      return (
                        <TouchableOpacity
                          key={b.id}
                          style={[styles.addBillRow, isSelected && styles.addBillRowSelected]}
                          onPress={() => toggleAdditionalBill(b.id)}
                          activeOpacity={0.75}
                        >
                          <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                            {isSelected && <Text style={styles.checkmarkText}>✓</Text>}
                          </View>
                          <View style={styles.addBillInfo}>
                            <View style={styles.addBillTitleRow}>
                              <Text style={styles.addBillTitle}>{b.title}</Text>
                              <View
                                style={[
                                  styles.addBillBadge,
                                  b.category === 'one_time' ? styles.badgeOneTime : styles.badgePrivate,
                                ]}
                              >
                                <Text style={styles.addBillBadgeText}>{b.categoryLabel}</Text>
                              </View>
                            </View>
                            <Text style={styles.addBillDueDate}>Due {b.dueDate}</Text>
                          </View>
                          <Text style={[styles.addBillAmount, isSelected && styles.addBillAmountSelected]}>
                            +{formatNaira(b.amount)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Payment Method */}
                  <View style={styles.payMethodCard}>
                    <Text style={styles.payMethodTitle}>Payment Method</Text>
                    <View style={styles.payMethodRow}>
                      <View style={styles.payMethodIconWrap}>
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                          <Rect x={2} y={5} width={20} height={14} rx={2} stroke={Colors.ink} strokeWidth={2} />
                          <Path d="M2 10h20M16 14h2" stroke={Colors.ink} strokeWidth={2} strokeLinecap="round" />
                        </Svg>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.payMethodName}>Flex Wallet</Text>
                        <Text style={styles.payMethodBal}>Balance: {formatNaira(walletAmount)}</Text>
                      </View>
                      <Text style={styles.payMethodCheck}>✓</Text>
                    </View>
                  </View>

                  {/* Payout note */}
                  <View style={styles.payPayoutCard}>
                    <View style={styles.payPayoutRow}>
                      <BankFavicon bankName="GTBank" size={20} />
                      <Text style={styles.payPayoutText}>Settles to ADEWALE OKONKWO · GTBank 0045678901</Text>
                    </View>
                  </View>

                  <View style={styles.paySheetActions}>
                    <Button
                      label={
                        isPaying
                          ? 'Processing...'
                          : totalToPay > 0
                          ? `Confirm & Pay ${formatNaira(totalToPay)}`
                          : 'Select bills to pay'
                      }
                      onPress={handleConfirmPay}
                      disabled={isPaying || totalToPay <= 0}
                    />
                    <Button label="Cancel" variant="ghost" onPress={() => setShowPayModal(false)} />
                  </View>
                </>
              ) : (
                <View style={styles.paySuccessContainer}>
                  <View style={styles.paySuccessBadge}>
                    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M5 13l4 4L19 7"
                        stroke={Colors.ink}
                        strokeWidth={2.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </View>
                  <Text style={styles.paySuccessTitle}>Payment Successful!</Text>
                  <Text style={styles.paySuccessSub}>
                    {formatNaira(paidTotalAmount)} has been debited from your Flex Wallet for {paidBillsList.length} bill{paidBillsList.length === 1 ? '' : 's'}.
                  </Text>
                  <View style={styles.payReceiptCard}>
                    <View style={styles.payReceiptRow}>
                      <Text style={styles.payReceiptLabel}>Total amount paid</Text>
                      <Text style={styles.payReceiptVal}>{formatNaira(paidTotalAmount)}</Text>
                    </View>
                    <View style={styles.payReceiptDivider} />
                    <Text style={styles.payReceiptSectionTitle}>Bills Paid ({paidBillsList.length})</Text>
                    {paidBillsList.map((item, idx) => (
                      <View key={idx} style={styles.payReceiptItemRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.payReceiptItemName}>{item.title}</Text>
                          <Text style={styles.payReceiptItemCat}>{item.categoryLabel}</Text>
                        </View>
                        <Text style={styles.payReceiptItemAmount}>{formatNaira(item.amount)}</Text>
                      </View>
                    ))}
                    <View style={styles.payReceiptDivider} />
                    <View style={styles.payReceiptRow}>
                      <Text style={styles.payReceiptLabel}>Household</Text>
                      <Text style={styles.payReceiptVal}>{selectedHousehold.name}</Text>
                    </View>
                    <View style={styles.payReceiptRow}>
                      <Text style={styles.payReceiptLabel}>Reference</Text>
                      <Text style={[styles.payReceiptVal, styles.payReceiptMono]}>PD-202610-MULTI88</Text>
                    </View>
                    <View style={styles.payReceiptRow}>
                      <Text style={styles.payReceiptLabel}>Status</Text>
                      <Text style={[styles.payReceiptVal, { color: '#0D8C4B', fontFamily: 'DMSans_700Bold' }]}>Paid ✓</Text>
                    </View>
                  </View>
                  <View style={styles.paySheetActions}>
                    <Button label="Done" onPress={() => setShowPayModal(false)} />
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  propertySub: { ...Typography.caption, color: Colors.textSecondary, fontSize: 13 },
  bellBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  badge: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: '#EF4444', borderRadius: 8,
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
  payNowDarkBtnDisabled: {
    backgroundColor: 'rgba(12,24,34,0.1)',
    borderColor: 'transparent',
  },
  payNowDarkText: { ...Typography.caption, color: Colors.ink, fontFamily: 'DMSans_700Bold', fontSize: 13 },
  payNowDarkTextDisabled: { color: 'rgba(12,24,34,0.4)' },

  // Quick actions (3 CTAs)
  actionsRow: { flexDirection: 'row', gap: 8 },
  actionPrimary: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, backgroundColor: Colors.ink, borderRadius: 99, paddingVertical: 10, paddingHorizontal: 4,
  },
  actionPrimaryLabel: { ...Typography.buttonSmall, color: Colors.white, fontSize: 11, textAlign: 'center' },
  actionOutline: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, backgroundColor: Colors.white, borderRadius: 99, paddingVertical: 10, paddingHorizontal: 4,
    borderWidth: 1.5, borderColor: Colors.ink,
  },
  actionOutlineLabel: { ...Typography.buttonSmall, color: Colors.ink, fontSize: 11, textAlign: 'center' },

  // Active bills (no card wrapper)
  activeBillsSection: { gap: 10, overflow: 'visible', marginTop: 8, marginBottom: 4 },
  activeBillsTitle: { ...Typography.label, color: Colors.ink },

  // Section card
  section: { backgroundColor: Colors.white, borderRadius: Radius.card, padding: 16, gap: 0, overflow: 'visible' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  sectionTitle: { ...Typography.label, color: Colors.ink },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAll: { ...Typography.caption, color: Colors.textSecondary },
  divider: { height: 1, backgroundColor: Colors.line },

  // Shared chip styles
  stateChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  stateChipText: { ...Typography.captionSmall },
  daysChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFE44D', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  daysChipText: { ...Typography.captionSmall, color: '#7A4800', fontFamily: 'DMSans_700Bold' },

  // Bill card stack
  stackContainer: { height: 131, position: 'relative', overflow: 'visible' },
  billCard: {
    position: 'absolute', top: 0, left: 0, right: 0,
    backgroundColor: Colors.white,
    borderRadius: Radius.cardSm,
    padding: 14, gap: 8,
  },
  billCardBack: { overflow: 'hidden' },
  billCardAccent: { position: 'absolute', top: 0, left: 0, width: 4, bottom: 0, borderTopLeftRadius: Radius.cardSm, borderBottomLeftRadius: Radius.cardSm },
  billCardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  billCardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, paddingLeft: 8 },
  billCardName: { ...Typography.label, color: Colors.ink, flex: 1, fontFamily: 'Syne_800ExtraBold', fontSize: 16 },
  billCardSubtitle: { ...Typography.captionSmall, color: 'rgba(12,24,34,0.55)', paddingLeft: 8, marginTop: -2 },
  billCardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 8 },
  billMetaText: { ...Typography.captionSmall, color: Colors.textMuted },
  billDueDate: { ...Typography.captionSmall, color: Colors.ink, fontFamily: 'DMSans_700Bold', backgroundColor: '#C8FFD4', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, alignSelf: 'flex-start', marginLeft: 0 },
  billUnit: { ...Typography.captionSmall, color: Colors.ink, fontFamily: 'DMSans_700Bold', fontSize: 15 },
  swipeHint: { ...Typography.captionSmall, color: Colors.textMuted, textAlign: 'right', paddingLeft: 8 },
  payNowBtn: {
    backgroundColor: Colors.ink, borderRadius: 99,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  payNowText: { ...Typography.captionSmall, color: Colors.white, fontFamily: 'DMSans_700Bold' },

  // Household selector modal
  backdrop: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(12,24,34,0.55)' },
  propSelectorWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '85%' },
  propSelector: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  propSelectorHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10,
  },
  propSelectorTitle: {
    ...Typography.title, color: Colors.ink, fontSize: 16, fontFamily: 'DMSans_700Bold',
  },
  propSelectorSub: {
    ...Typography.captionSmall, color: Colors.textSecondary, marginTop: 2,
  },
  propSelectorClose: {
    fontSize: 16, color: Colors.textMuted, padding: 4, fontFamily: 'DMSans_700Bold',
  },
  filterTabsRow: {
    paddingHorizontal: 12, paddingBottom: 10, gap: 8,
  },
  filterTab: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99,
    backgroundColor: Colors.screen, borderWidth: 1, borderColor: Colors.line,
  },
  filterTabActive: {
    backgroundColor: Colors.ink, borderColor: Colors.ink,
  },
  filterTabText: {
    ...Typography.captionSmall, color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: Colors.white, fontFamily: 'DMSans_700Bold',
  },
  propSelectorScroll: {
    maxHeight: 340,
  },
  propGroup: {
    marginBottom: 4,
  },
  propGroupBorder: {
    borderTopWidth: 1, borderTopColor: Colors.line,
  },
  propGroupHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, backgroundColor: Colors.screen,
  },
  propGroupTitle: {
    ...Typography.captionSmall, fontFamily: 'Syne_800ExtraBold',
    color: Colors.ink, fontSize: 10, letterSpacing: 0,
  },
  propGroupCity: {
    ...Typography.captionSmall, color: Colors.textMuted, fontSize: 10,
  },
  propSelectorRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14,
    paddingVertical: 10, gap: 12,
  },
  propSelectorRowActive: { backgroundColor: Colors.violetTint },
  propSelectorIconBox: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.violetTint,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  propSelectorIconBoxActive: { backgroundColor: Colors.violet },
  propSelectorLeft: { flex: 1 },
  householdNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  propSelectorName: { ...Typography.label, color: Colors.ink, fontSize: 13 },
  propSelectorBadge: {
    backgroundColor: Colors.line, paddingHorizontal: 6, paddingVertical: 1,
    borderRadius: 6,
  },
  propSelectorBadgeText: {
    ...Typography.captionSmall, color: Colors.textSecondary, fontSize: 10,
  },
  propSelectorMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  propSelectorMeta: { ...Typography.captionSmall, color: Colors.textSecondary },
  roleChip: { borderRadius: 99, paddingHorizontal: 6, paddingVertical: 1 },
  roleChipTenant: { backgroundColor: '#EEF2FF' },
  roleChipLandlord: { backgroundColor: '#ECFDF5' },
  roleChipText: { fontFamily: 'DMSans_700Bold', fontSize: 9 },
  propCheckCircle: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  propCheckEmpty: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1.5, borderColor: Colors.line, flexShrink: 0,
  },
  propSelectorCloseBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.screen, alignItems: 'center', justifyContent: 'center',
  },

  // Payment rows
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
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

  // Pay sheet modal
  paySheetWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '90%' },
  paySheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 24,
    maxHeight: '100%',
  },
  paySheetScroll: {
    gap: 12,
    paddingBottom: 16,
  },
  payHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.line,
    alignSelf: 'center',
    marginBottom: 8,
  },
  paySheetTitle: { ...Typography.title, color: Colors.ink },
  paySheetSub: { ...Typography.caption, color: Colors.textSecondary, marginBottom: 2 },
  payAmountCard: {
    backgroundColor: Colors.mint,
    borderRadius: Radius.card,
    borderWidth: 1.5,
    borderColor: Colors.ink,
    padding: 16,
    gap: 6,
    alignItems: 'center',
  },
  payAmountLabel: { ...Typography.caption, color: Colors.textSecondary },
  payAmountValue: { fontFamily: 'Syne_800ExtraBold', fontSize: 28, color: Colors.ink },
  paySplitPill: {
    backgroundColor: 'rgba(12,24,34,0.08)',
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 2,
  },
  paySplitPillText: { ...Typography.captionSmall, color: Colors.ink, fontFamily: 'DMSans_700Bold' },
  payMethodCard: {
    backgroundColor: Colors.screen,
    borderRadius: Radius.cardSm,
    borderWidth: 1.2,
    borderColor: Colors.line,
    padding: 12,
    gap: 8,
  },
  payMethodTitle: { ...Typography.captionSmall, color: Colors.textMuted, fontFamily: 'Syne_800ExtraBold', textTransform: 'uppercase' },
  payMethodRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  payMethodIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payMethodName: { ...Typography.label, color: Colors.ink },
  payMethodBal: { ...Typography.captionSmall, color: Colors.textSecondary },
  payMethodCheck: { fontSize: 16, color: '#0D8C4B', fontFamily: 'Syne_800ExtraBold' },
  payPayoutCard: {
    backgroundColor: '#F6F8FA',
    borderRadius: Radius.cardSm,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  payPayoutRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  payPayoutText: { ...Typography.captionSmall, color: Colors.textSecondary, flex: 1 },
  paySheetActions: { gap: 8, marginTop: 8 },

  // Additional bills section
  addBillsSection: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    borderWidth: 1.5,
    borderColor: Colors.line,
    padding: 12,
    gap: 8,
  },
  addBillsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 2,
  },
  addBillsSectionTitle: {
    ...Typography.label,
    color: Colors.ink,
    fontSize: 13,
  },
  addBillsSelectAll: {
    ...Typography.captionSmall,
    color: Colors.textSecondary,
    fontFamily: 'DMSans_700Bold',
  },
  addBillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: Radius.cardSm,
    backgroundColor: Colors.screen,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  addBillRowSelected: {
    backgroundColor: Colors.mint,
    borderColor: Colors.green,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.8,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  checkboxActive: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },
  checkmarkText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  addBillInfo: {
    flex: 1,
    gap: 2,
  },
  addBillTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  addBillTitle: {
    ...Typography.label,
    color: Colors.ink,
    fontSize: 13,
  },
  addBillBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 99,
  },
  badgeShared: {
    backgroundColor: '#D9F5E6',
  },
  badgeOneTime: {
    backgroundColor: '#EADFFF',
  },
  badgePrivate: {
    backgroundColor: '#F0F0F0',
  },
  addBillBadgeText: {
    ...Typography.captionSmall,
    fontSize: 9,
    fontFamily: 'DMSans_700Bold',
    color: Colors.ink,
  },
  addBillDueDate: {
    ...Typography.captionSmall,
    color: Colors.textMuted,
    fontSize: 11,
  },
  addBillAmount: {
    ...Typography.label,
    color: Colors.ink,
    fontSize: 13,
  },
  addBillAmountSelected: {
    fontFamily: 'Syne_800ExtraBold',
    color: Colors.ink,
  },

  // Pay success
  paySuccessContainer: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
  },
  paySuccessBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.mint,
    borderWidth: 2,
    borderColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  paySuccessTitle: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 22,
    color: Colors.ink,
    textAlign: 'center',
  },
  paySuccessSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
  payReceiptCard: {
    width: '100%',
    backgroundColor: Colors.screen,
    borderRadius: Radius.card,
    borderWidth: 1.5,
    borderColor: Colors.line,
    padding: 16,
    gap: 10,
  },
  payReceiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payReceiptLabel: { ...Typography.caption, color: Colors.textSecondary },
  payReceiptVal: { fontFamily: 'Syne_800ExtraBold', fontSize: 13, color: Colors.ink },
  payReceiptDivider: { height: 1, backgroundColor: Colors.line, marginVertical: 2 },
  payReceiptSectionTitle: {
    ...Typography.captionSmall,
    color: Colors.textSecondary,
    fontFamily: 'DMSans_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 10,
    marginTop: 2,
  },
  payReceiptItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  payReceiptItemName: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.ink,
  },
  payReceiptItemCat: {
    ...Typography.captionSmall,
    fontSize: 10,
    color: Colors.textMuted,
  },
  payReceiptItemAmount: {
    ...Typography.label,
    fontSize: 13,
    color: Colors.ink,
  },
  payReceiptMono: { letterSpacing: 0.5 },

  // Invite modal
  inviteCodeCard: {
    backgroundColor: Colors.screen,
    borderRadius: Radius.cardSm,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.line,
    marginTop: 6,
  },
  inviteCodeLabel: {
    ...Typography.captionSmall,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inviteCodeVal: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 22,
    color: Colors.ink,
    letterSpacing: 1.5,
  },
  inviteShareBtn: {
    backgroundColor: Colors.mint,
    borderWidth: 1,
    borderColor: Colors.green,
    borderRadius: 99,
    paddingHorizontal: 16,
    paddingVertical: 7,
    marginTop: 6,
  },
  inviteShareBtnText: {
    ...Typography.captionSmall,
    fontFamily: 'DMSans_700Bold',
    color: Colors.ink,
  },
  inviteInputSection: {
    gap: 6,
    marginTop: 6,
    marginBottom: 6,
  },
  inviteInputLabel: {
    ...Typography.captionSmall,
    color: Colors.textSecondary,
  },
  inviteInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  inviteInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderRadius: Radius.cardSm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    ...Typography.body,
    fontSize: 13,
  },
  inviteSendBtn: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.cardSm,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteSendBtnDisabled: {
    opacity: 0.5,
  },
  inviteSendBtnText: {
    ...Typography.captionSmall,
    fontFamily: 'DMSans_700Bold',
    color: Colors.white,
  },
});
