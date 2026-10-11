import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import Svg, { Path, Rect, Circle, Ellipse } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Colors, Typography, Layout, Radius } from '@/theme';
import { useAppStore } from '@/store/app';
import { api } from '@/api/client';
import { Bill } from '@/types';
import { formatNaira } from '@/utils/money';
import { formatDueDate } from '@/utils/date';
import { Chip, billStateTone, billTypeLabel, billTypeTone } from '@/components/common/Chip';
import { CardSkeleton } from '@/components/common/SkeletonLoader';
import { EmptyState } from '@/components/common/EmptyState';

// ── Mock data ──────────────────────────────────────────────────────────────────

type BillWithTenant = Bill & { tenantName: string; household: string; isOwn?: boolean };

const MOCK_SHARED: BillWithTenant[] = [
  { id: 'b1', type: 'electricity', title: 'August EKEDC', totalAmount: 1200000, dueDate: '2026-10-05', state: 'overdue', period: '2026-10', tenantName: 'Tolu Adeyemi', household: 'Flat 3B' },
  { id: 'b2', type: 'service_charge', title: 'October Service Charge', totalAmount: 500000, dueDate: '2026-10-15', state: 'due', period: '2026-10', tenantName: 'Kemi Okafor', household: 'Flat 2A' },
  { id: 'b3', type: 'water', title: 'Water Supply — Q4', totalAmount: 350000, dueDate: '2026-10-30', state: 'upcoming', period: '2026-10', tenantName: 'Femi Adekunle', household: 'Flat 4C' },
  { id: 'b4', type: 'security', title: 'Security Charge', totalAmount: 200000, dueDate: '2026-10-20', state: 'upcoming', period: '2026-10', tenantName: 'Amara Nwosu', household: 'Flat 1A' },
  { id: 'b5', type: 'internet', title: 'Estate Wi-Fi', totalAmount: 150000, dueDate: '2026-10-01', state: 'paid', period: '2026-10', tenantName: 'Chidi Obi', household: 'Flat 5D' },
  { id: 'b6', type: 'electricity', title: 'September EKEDC', totalAmount: 1100000, dueDate: '2026-09-05', state: 'paid', period: '2026-09', tenantName: 'Tolu Adeyemi', household: 'Flat 3B' },
  { id: 'b7', type: 'water', title: 'Water Supply — Q3', totalAmount: 350000, dueDate: '2026-09-30', state: 'paid', period: '2026-09', tenantName: 'Kemi Okafor', household: 'Flat 2A' },
  { id: 'b8', type: 'electricity', title: 'August EKEDC', totalAmount: 1050000, dueDate: '2026-08-05', state: 'paid', period: '2026-08', tenantName: 'Femi Adekunle', household: 'Flat 4C' },
];

const MOCK_ONE_TIME: BillWithTenant[] = [
  { id: 'ot1', type: 'other', title: 'Flat 3B — Plumbing repair', totalAmount: 180000, dueDate: '2026-10-18', state: 'due', period: '2026-10', tenantName: 'Femi Adekunle', household: 'Flat 3B' },
  { id: 'ot2', type: 'other', title: 'Window replacement', totalAmount: 95000, dueDate: '2026-09-30', state: 'paid', period: '2026-09', tenantName: 'Amara Nwosu', household: 'Flat 1A' },
];

const MOCK_PRIVATE: BillWithTenant[] = [
  { id: 'pb1', type: 'other', title: 'Netflix subscription', totalAmount: 45000, dueDate: '2026-10-25', state: 'upcoming', period: '2026-10', tenantName: 'Chidi Obi', household: 'Flat 5D' },
  { id: 'pb2', type: 'internet', title: 'Personal fibre — Q4', totalAmount: 120000, dueDate: '2026-10-01', state: 'paid', period: '2026-10', tenantName: 'Ngozi Eze', household: 'Flat 6E' },
  { id: 'pb3', type: 'other', title: 'Amazon Prime', totalAmount: 35000, dueDate: '2026-09-20', state: 'paid', period: '2026-09', tenantName: 'Chidi Obi', household: 'Flat 5D' },
];

const MOCK_COPARTNER: BillWithTenant[] = [
  { id: 'cp0', type: 'other', title: 'Joint streaming plan', totalAmount: 60000, dueDate: '2026-10-20', state: 'paid', period: '2026-10', tenantName: 'Femi Adekunle', household: 'Flat 4C', isOwn: true },
  { id: 'cp1', type: 'other', title: 'Joint streaming plan', totalAmount: 60000, dueDate: '2026-10-20', state: 'paid', period: '2026-10', tenantName: 'Tolu Adeyemi', household: 'Flat 3B' },
  { id: 'cp2', type: 'internet', title: 'Shared broadband', totalAmount: 90000, dueDate: '2026-10-15', state: 'due', period: '2026-10', tenantName: 'Kemi Okafor', household: 'Flat 2A' },
  { id: 'cp3', type: 'other', title: 'Joint streaming plan', totalAmount: 60000, dueDate: '2026-09-20', state: 'paid', period: '2026-09', tenantName: 'Tolu Adeyemi', household: 'Flat 3B' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtPeriod(period: string) {
  const [y, m] = period.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' });
}

function allMonths(bills: Bill[]): string[] {
  const set = new Set(bills.map(b => b.period ?? ''));
  set.delete('');
  return [...set].sort((a, b) => b.localeCompare(a));
}

function billsForMonth<T extends Bill>(bills: T[], month: string): T[] {
  return bills.filter(b => b.period === month);
}

function stateLabel(state: string) {
  if (state === 'paid') return 'Paid';
  if (state === 'overdue') return 'Overdue';
  if (state === 'due') return 'Due soon';
  return 'Upcoming';
}

// ── Icons ──────────────────────────────────────────────────────────────────────

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



function BuildingIconSm() {
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

function OneTimeBillIcon() {
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

function CopartnerIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="7" r="3" fill={Colors.violet} stroke="#0C1822" strokeWidth="1.6" />
      <Circle cx="17" cy="8" r="2.5" fill={Colors.violet} stroke="#0C1822" strokeWidth="1.4" />
      <Path d="M3 19c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="#0C1822" strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M17 14c1.657 0 3 1.119 3 3.333" stroke="#0C1822" strokeWidth="1.6" strokeLinecap="round" />
      <Circle cx="9" cy="19" r="1" fill="#40CE86" />
    </Svg>
  );
}

function CalendarIcon({ active }: { active: boolean }) {
  const color = active ? Colors.white : Colors.ink;
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="17" rx="2" stroke={color} strokeWidth="1.8" />
      <Path d="M3 9h18" stroke={color} strokeWidth="1.8" />
      <Path d="M8 2v4M16 2v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Circle cx="8" cy="14" r="1.2" fill={color} />
      <Circle cx="12" cy="14" r="1.2" fill={color} />
      <Circle cx="16" cy="14" r="1.2" fill={color} />
    </Svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d={open ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'}
        stroke="#4A6070"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Bill row (payment record style) ───────────────────────────────────────────

const STATE_DOT: Record<string, string> = {
  paid: Colors.green,
  overdue: '#E8724A',
  due: '#F0A060',
  upcoming: Colors.textMuted,
};

function BillRow({ item, onPress }: { item: BillWithTenant; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.billCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.billAvatar}>
        <DefaultAvatarIcon size={40} />
      </View>
      <View style={styles.billInfo}>
        <View style={styles.billNameRow}>
          <Text style={styles.billName}>{item.tenantName}</Text>
          {item.isOwn && (
            <View style={styles.youTag}><Text style={styles.youTagText}>You</Text></View>
          )}
        </View>
        <Text style={styles.billSub}>
          {item.state === 'paid' ? `Received ${item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) : ''}` : formatDueDate(item.dueDate)}
        </Text>
      </View>
      <View style={styles.billRight}>
        <Text style={styles.billAmount}>{formatNaira(item.totalAmount)}</Text>
        <View style={styles.billStatusRow}>
          <View style={[styles.billDot, { backgroundColor: STATE_DOT[item.state] ?? Colors.textMuted }]} />
          <Text style={styles.billDue}>{stateLabel(item.state)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Private bill row (with avatar icon like BillRow) ──────────────────────────

function PrivateBillRow({ item, onPress }: { item: BillWithTenant; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.billCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.billAvatar}>
        <DefaultAvatarIcon size={40} />
      </View>
      <View style={styles.billInfo}>
        <Text style={styles.billName}>{item.title}</Text>
        <Text style={styles.billSub}>{formatDueDate(item.dueDate)}</Text>
      </View>
      <View style={styles.billRight}>
        <Text style={styles.billAmount}>{formatNaira(item.totalAmount)}</Text>
        <View style={styles.billStatusRow}>
          <View style={[styles.billDot, { backgroundColor: STATE_DOT[item.state] ?? Colors.textMuted }]} />
          <Text style={styles.billDue}>{stateLabel(item.state)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Summary card (compound / one-time / private) ───────────────────────────────

interface SummaryCardProps {
  title: string;
  total: number;
  paidCount: number;
  totalCount: number;
  bg: string;
  textColor: string;
  subColor: string;
  icon: React.ReactNode;
  iconBg: string;
  expanded: boolean;
  onToggle: () => void;
  onHeaderPress?: () => void;
}

function SummaryCard({ title, total, paidCount, totalCount, bg, textColor, subColor, icon, iconBg, expanded, onToggle, onHeaderPress }: SummaryCardProps) {
  return (
    <TouchableOpacity style={[styles.summaryCard, expanded && { backgroundColor: '#E6F8EE' }]} activeOpacity={0.85} onPress={onHeaderPress ?? onToggle}>
      <View style={[styles.summaryIconWrap, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={styles.summaryInfo}>
        <Text style={styles.summaryTitle}>{title}</Text>
        <Text style={styles.summaryPaid}>{paidCount} of {totalCount} paid</Text>
      </View>
      <View style={styles.summaryRight}>
        <Text style={styles.summaryTotal}>{formatNaira(total)}</Text>
        <Chevron open={expanded} />
      </View>
    </TouchableOpacity>
  );
}

// ── Month calendar picker ──────────────────────────────────────────────────────

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function MonthCalendar({
  availableMonths,
  selectedMonth,
  onSelect,
  onClear,
}: {
  availableMonths: string[];
  selectedMonth: string | null;
  onSelect: (m: string) => void;
  onClear: () => void;
}) {
  const currentYear = new Date().getFullYear();
  const initialYear = selectedMonth ? Number(selectedMonth.split('-')[0]) : currentYear;
  const [year, setYear] = useState(initialYear);

  const yearsWithBills = new Set(availableMonths.map(m => Number(m.split('-')[0])));

  return (
    <View style={styles.calendarDropdown}>
      {/* Year navigation */}
      <View style={styles.calYearRow}>
        <TouchableOpacity
          style={[styles.calYearBtn, !yearsWithBills.has(year - 1) && { opacity: 0.3 }]}
          onPress={() => setYear(y => y - 1)}
          disabled={!yearsWithBills.has(year - 1)}
        >
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke={Colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.calYearText}>{year}</Text>
        <TouchableOpacity
          style={[styles.calYearBtn, !yearsWithBills.has(year + 1) && { opacity: 0.3 }]}
          onPress={() => setYear(y => y + 1)}
          disabled={!yearsWithBills.has(year + 1)}
        >
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M9 18l6-6-6-6" stroke={Colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
      </View>

      {/* Month grid 4×3 */}
      <View style={styles.calGrid}>
        {MONTH_ABBR.map((abbr, i) => {
          const monthStr = `${year}-${String(i + 1).padStart(2, '0')}`;
          const hasData = availableMonths.includes(monthStr);
          const isSelected = selectedMonth === monthStr;
          return (
            <TouchableOpacity
              key={abbr}
              style={[styles.calCell, isSelected && styles.calCellSelected, !hasData && styles.calCellDisabled]}
              onPress={() => hasData && onSelect(monthStr)}
              activeOpacity={hasData ? 0.7 : 1}
            >
              <Text style={[styles.calCellText, isSelected && styles.calCellTextSelected, !hasData && styles.calCellTextDisabled]}>
                {abbr}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Clear */}
      <TouchableOpacity style={styles.calClearRow} onPress={onClear}>
        <Text style={styles.calClearText}>{selectedMonth ? 'Clear filter' : 'All months (no filter)'}</Text>
        {!selectedMonth && <Text style={styles.pickerCheck}>✓</Text>}
      </TouchableOpacity>
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────

export function BillsScreen() {
  const navigation = useNavigation<any>();
  const { activePropertyId, role } = useAppStore();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const effectiveRole = role ?? 'master_tenant';
  const isTenant = effectiveRole === 'tenant' || effectiveRole === 'master_tenant';

  const { data: apiBills = [], isRefetching, refetch } = useQuery({
    queryKey: ['bills', activePropertyId],
    queryFn: () => api.get<Bill[]>(`/bills?propertyId=${activePropertyId ?? ''}`),
    enabled: false,
  });

  const sharedBills: BillWithTenant[] = apiBills.length > 0 ? (apiBills as unknown as BillWithTenant[]) : MOCK_SHARED;

  const toggle = (key: string) => setExpanded(prev => {
    const isOpening = !prev[key];
    return isOpening ? { [key]: true } : { ...prev, [key]: false };
  });

  // All months across all bill types
  const allBills = [...sharedBills, ...MOCK_ONE_TIME, ...MOCK_PRIVATE, ...MOCK_COPARTNER];
  const allAvailableMonths = isTenant ? allMonths(allBills) : allMonths(sharedBills);
  const months = selectedMonth ? [selectedMonth] : allAvailableMonths;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bills</Text>
        <TouchableOpacity
          style={[styles.calBtn, (selectedMonth || pickerOpen) && styles.calBtnActive]}
          onPress={() => setPickerOpen(p => !p)}
          activeOpacity={0.8}
        >
          <CalendarIcon active={!!selectedMonth || pickerOpen} />
          {selectedMonth && (
            <Text style={styles.calBtnLabel}>{fmtPeriod(selectedMonth).split(' ')[0]}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Month picker calendar */}
      {pickerOpen && (
        <MonthCalendar
          availableMonths={allAvailableMonths}
          selectedMonth={selectedMonth}
          onSelect={(m) => { setSelectedMonth(m); setPickerOpen(false); }}
          onClear={() => { setSelectedMonth(null); setPickerOpen(false); }}
        />
      )}

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.green} />}
      >
        {months.map((month) => {
          const shared = billsForMonth(sharedBills, month);
          const oneTime = billsForMonth(MOCK_ONE_TIME, month);
          const priv = billsForMonth(MOCK_PRIVATE, month);
          const copartner = billsForMonth(MOCK_COPARTNER, month);

          const sharedKey = `shared-${month}`;
          const oneTimeKey = `onetime-${month}`;
          const privKey = `private-${month}`;
          const copartnerKey = `copartner-${month}`;

          const sharedTotal = shared.reduce((s, b) => s + b.totalAmount, 0);
          const sharedPaid = shared.filter(b => b.state === 'paid').length;
          const oneTimeTotal = oneTime.reduce((s, b) => s + b.totalAmount, 0);
          const oneTimePaid = oneTime.filter(b => b.state === 'paid').length;
          const privTotal = priv.reduce((s, b) => s + b.totalAmount, 0);
          const privPaid = priv.filter(b => b.state === 'paid').length;
          const copartnerTotal = copartner.reduce((s, b) => s + b.totalAmount, 0);
          const copartnerPaid = copartner.filter(b => b.state === 'paid').length;

          return (
            <View key={month} style={styles.monthGroup}>
              {/* Month header */}
              <View style={styles.monthHeader}>
                <View style={styles.monthDivider} />
                <Text style={styles.monthLabel}>{fmtPeriod(month)}</Text>
                <View style={styles.monthDivider} />
              </View>

              {/* Shared compound card */}
              {shared.length > 0 && (
                <View style={[styles.cardWrapper, !!expanded[sharedKey] && { backgroundColor: '#E6F8EE', borderColor: '#E6F8EE' }]}>
                  <SummaryCard
                    title="Shared Compound Bills"
                    total={sharedTotal}
                    paidCount={sharedPaid}
                    totalCount={shared.length}
                    bg={Colors.green}
                    textColor={Colors.ink}
                    subColor="rgba(12,24,34,0.6)"
                    icon={<BuildingIconSm />}
                    iconBg={Colors.screen}
                    expanded={!!expanded[sharedKey]}
                    onToggle={() => toggle(sharedKey)}
                  />
                  {expanded[sharedKey] && shared.map(item => (
                    <View key={item.id}>
                      <View style={styles.rowDivider} />
                      <BillRow item={item} onPress={() => navigation.navigate('BillDetail', { billId: item.id })} />
                    </View>
                  ))}
                </View>
              )}

              {/* One-time bills — tenant view only */}
              {isTenant && oneTime.length > 0 && (
                <View style={[styles.cardWrapper, !!expanded[oneTimeKey] && { backgroundColor: '#E6F8EE', borderColor: '#E6F8EE' }]}>
                  <SummaryCard
                    title="One-time Bills"
                    total={oneTimeTotal}
                    paidCount={oneTimePaid}
                    totalCount={oneTime.length}
                    bg={Colors.white}
                    textColor={Colors.ink}
                    subColor="rgba(12,24,34,0.55)"
                    icon={<OneTimeBillIcon />}
                    iconBg={Colors.screen}
                    expanded={!!expanded[oneTimeKey]}
                    onToggle={() => toggle(oneTimeKey)}
                  />
                  {expanded[oneTimeKey] && oneTime.map(item => (
                    <View key={item.id}>
                      <View style={styles.rowDivider} />
                      <BillRow item={item} onPress={() => navigation.navigate('BillDetail', { billId: item.id })} />
                    </View>
                  ))}
                </View>
              )}

              {/* Private bills — tenant view only */}
              {isTenant && priv.length > 0 && (
                <View style={[styles.cardWrapper, !!expanded[privKey] && { backgroundColor: '#E6F8EE', borderColor: '#E6F8EE' }]}>
                  <SummaryCard
                    title="Private Bills"
                    total={privTotal}
                    paidCount={privPaid}
                    totalCount={priv.length}
                    bg={Colors.ink}
                    textColor={Colors.white}
                    subColor="rgba(255,255,255,0.6)"
                    icon={<LockIcon />}
                    iconBg={Colors.screen}
                    expanded={!!expanded[privKey]}
                    onToggle={() => toggle(privKey)}
                  />
                  {expanded[privKey] && priv.map(item => (
                    <View key={item.id}>
                      <View style={styles.rowDivider} />
                      <PrivateBillRow item={item} onPress={() => navigation.navigate('BillDetail', { billId: 'private-all' })} />
                    </View>
                  ))}
                </View>
              )}

              {/* Co-partners bills — tenant view only */}
              {isTenant && copartner.length > 0 && (
                <View style={[styles.cardWrapper, !!expanded[copartnerKey] && { backgroundColor: '#E6F8EE', borderColor: '#E6F8EE' }]}>
                  <SummaryCard
                    title="Co-partners Bills"
                    total={copartnerTotal}
                    paidCount={copartnerPaid}
                    totalCount={copartner.length}
                    bg={Colors.white}
                    textColor={Colors.ink}
                    subColor="rgba(12,24,34,0.55)"
                    icon={<CopartnerIcon />}
                    iconBg={Colors.screen}
                    expanded={!!expanded[copartnerKey]}
                    onToggle={() => toggle(copartnerKey)}
                  />
                  {expanded[copartnerKey] && copartner.map(item => (
                    <View key={item.id}>
                      <View style={styles.rowDivider} />
                      <BillRow item={item} onPress={() => navigation.navigate('BillDetail', { billId: item.id })} />
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {months.length === 0 && (
          <EmptyState
            title="No bills yet"
            subtitle="No bills have been added yet."
          />
        )}
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
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: 16,
  },
  headerTitle: { ...Typography.h2, color: Colors.ink },
  addBtn: { backgroundColor: Colors.ink, borderRadius: 99, paddingHorizontal: 16, paddingVertical: 8 },
  addBtnText: { ...Typography.buttonSmall, color: Colors.green },
  calBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.white, borderRadius: 99,
    borderWidth: 1.5, borderColor: Colors.ink,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  calBtnActive: { backgroundColor: Colors.ink },
  calBtnLabel: { ...Typography.captionSmall, color: Colors.white, fontFamily: 'Syne_800ExtraBold' },

  pickerCheck: { ...Typography.label, color: Colors.green },

  calendarDropdown: {
    position: 'absolute', top: 62, right: Layout.screenPadding,
    backgroundColor: Colors.white, borderRadius: Radius.card,
    borderWidth: 1.5, borderColor: Colors.line,
    zIndex: 100, width: 220,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.10, shadowRadius: 16,
    elevation: 10, padding: 12,
  },
  calYearRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 10,
  },
  calYearBtn: { padding: 4 },
  calYearText: { ...Typography.label, color: Colors.ink, fontFamily: 'Syne_800ExtraBold' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  calCell: {
    width: '30%', aspectRatio: 2,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 8, borderWidth: 1, borderColor: Colors.line,
    backgroundColor: Colors.screen,
  },
  calCellSelected: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  calCellDisabled: { opacity: 0.3 },
  calCellText: { ...Typography.captionSmall, color: Colors.ink, fontFamily: 'DMSans_700Bold' },
  calCellTextSelected: { color: Colors.green },
  calCellTextDisabled: { color: Colors.textMuted },
  calClearRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: Colors.line,
    marginTop: 10, paddingTop: 10,
  },
  calClearText: { ...Typography.captionSmall, color: Colors.textSecondary },

  list: { padding: Layout.screenPadding, paddingBottom: Layout.contentBottomPadding, gap: 0 },

  monthGroup: { gap: 10, marginBottom: 24 },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  monthDivider: { flex: 1, height: 1, backgroundColor: Colors.line },
  monthLabel: {
    ...Typography.captionSmall,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: 'DMSans_700Bold',
  },

  cardWrapper: {
    backgroundColor: Colors.white,
    borderRadius: Radius.cardSm,
    borderWidth: 1,
    borderColor: Colors.line,
    overflow: 'hidden',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  summaryIconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  summaryInfo: { flex: 1 },
  summaryTitle: { ...Typography.label, color: Colors.ink },
  summaryPaid: { ...Typography.captionSmall, color: Colors.textSecondary, marginTop: 2 },
  summaryRight: { alignItems: 'flex-end', gap: 4 },
  summaryTotal: { ...Typography.label, color: Colors.ink },
  rowDivider: { height: 1, backgroundColor: Colors.line, marginHorizontal: 14 },

  billCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  billAvatar: {
    width: 40, height: 40, borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5, borderColor: Colors.line,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  billInfo: { flex: 1 },
  billNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  billName: { ...Typography.label, color: Colors.ink },
  youTag: { backgroundColor: Colors.green, borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2 },
  youTagText: { ...Typography.captionSmall, color: Colors.ink, fontFamily: 'DMSans_700Bold', fontSize: 10 },
  billSub: { ...Typography.captionSmall, color: Colors.textSecondary, marginTop: 2 },
  billRight: { alignItems: 'flex-end', gap: 4 },
  billAmount: { ...Typography.label, color: Colors.ink },
  billStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  billDot: { width: 6, height: 6, borderRadius: 3 },
  billDue: { ...Typography.captionSmall, color: Colors.textMuted },
});
