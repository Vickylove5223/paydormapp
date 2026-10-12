import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import Svg, { Path, Rect, Circle, Ellipse } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Layout, Radius, FontFamily } from '@/theme';
import { useAppStore } from '@/store/app';
import { Bill } from '@/types';
import { formatNaira } from '@/utils/money';
import { formatDueDate, formatRecurringDay } from '@/utils/date';
import { BankFavicon } from '@/components/common/BankFavicon';
import { billStateTone, billStateLabel } from '@/components/common/Chip';

type BillCategory = 'all' | 'shared' | 'one_time' | 'private' | 'copartner';

interface CopartnerShare {
  id: string;
  name: string;
  household?: string;
  amount: number;
  sharePercent?: number;
  paid: boolean;
  dueDate?: string;
  isOwn?: boolean;
}

interface ManagedBill extends Bill {
  category: 'shared' | 'one_time' | 'private' | 'copartner';
  tenantName?: string;
  household?: string;
  propertyLabel?: string;
  payoutBank?: string;
  payoutAcct?: string;
  accountName?: string;
  payoutPersonName?: string;
  copartners?: CopartnerShare[];
  splitType?: 'equal' | 'percentage' | 'custom';
  pendingShare?: boolean;
}

const ALL_BILLS: ManagedBill[] = [
  // Shared
  {
    id: 'b1',
    type: 'electricity',
    title: 'Electricity EKEDC',
    totalAmount: 1200000,
    dueDate: '2026-10-05',
    state: 'overdue',
    period: '2026-10',
    category: 'shared',
    tenantName: 'All tenants',
    propertyLabel: 'Lekki Gardens Estate',
    payoutBank: 'GTBank',
    payoutAcct: '0045678901',
    accountName: 'ADEWALE OKONKWO',
    payoutPersonName: 'Adewale Okonkwo (Landlord)',
    copartners: [
      { id: 't1a', name: 'Femi Adekunle', household: 'Flat 3B', amount: 200000, paid: false },
      { id: 't1b', name: 'Amara Nwosu', household: 'Flat 1A', amount: 200000, paid: false },
      { id: 't1c', name: 'Kemi Okafor', household: 'Flat 2A', amount: 200000, paid: false },
      { id: 't1d', name: 'Tolu Adeyemi', household: 'Flat 4C', amount: 200000, paid: false },
      { id: 't1e', name: 'Ngozi Eze', household: 'Flat 6E', amount: 200000, paid: false },
      { id: 't1f', name: 'Chisom Obi', household: 'Flat 5D', amount: 200000, paid: false },
    ],
  },
  {
    id: 'b2',
    type: 'service_charge',
    title: 'Service Fee',
    totalAmount: 500000,
    dueDate: '2026-10-15',
    state: 'due',
    period: '2026-10',
    category: 'shared',
    tenantName: 'All tenants',
    propertyLabel: 'Lekki Gardens Estate',
    payoutBank: 'GTBank',
    payoutAcct: '0123456789',
    accountName: 'LEKKI GARDENS ESTATE MGT',
    payoutPersonName: 'Adekunle Shittu (Estate Manager)',
    copartners: [
      { id: 't2a', name: 'Femi Adekunle', household: 'Flat 3B', amount: 83333, paid: true },
      { id: 't2b', name: 'Amara Nwosu', household: 'Flat 1A', amount: 83333, paid: false },
      { id: 't2c', name: 'Kemi Okafor', household: 'Flat 2A', amount: 83333, paid: true },
      { id: 't2d', name: 'Tolu Adeyemi', household: 'Flat 4C', amount: 83333, paid: false },
      { id: 't2e', name: 'Ngozi Eze', household: 'Flat 6E', amount: 83334, paid: false },
      { id: 't2f', name: 'Chisom Obi', household: 'Flat 5D', amount: 83334, paid: false },
    ],
  },
  {
    id: 'b3',
    type: 'water',
    title: 'Water Supply',
    totalAmount: 350000,
    dueDate: '2026-10-30',
    state: 'upcoming',
    period: '2026-10',
    category: 'shared',
    tenantName: 'All tenants',
    propertyLabel: 'Lekki Gardens Estate',
    payoutBank: 'Access Bank',
    payoutAcct: '0987654321',
    accountName: 'PUREFLOW WATER SERVICES',
    payoutPersonName: 'Engr. Musa Bello',
    copartners: [
      { id: 't3a', name: 'Femi Adekunle', household: 'Flat 3B', amount: 58333, paid: false },
      { id: 't3b', name: 'Amara Nwosu', household: 'Flat 1A', amount: 58333, paid: false },
      { id: 't3c', name: 'Kemi Okafor', household: 'Flat 2A', amount: 58333, paid: false },
      { id: 't3d', name: 'Tolu Adeyemi', household: 'Flat 4C', amount: 58333, paid: false },
      { id: 't3e', name: 'Ngozi Eze', household: 'Flat 6E', amount: 58334, paid: false },
      { id: 't3f', name: 'Chisom Obi', household: 'Flat 5D', amount: 58334, paid: false },
    ],
  },
  {
    id: 'b4',
    type: 'security',
    title: 'Security Charge',
    totalAmount: 200000,
    dueDate: '2026-10-20',
    state: 'upcoming',
    period: '2026-10',
    category: 'shared',
    tenantName: 'All tenants',
    propertyLabel: 'Lekki Gardens Estate',
    payoutBank: 'GTBank',
    payoutAcct: '0045678901',
    accountName: 'ADEWALE OKONKWO',
    payoutPersonName: 'Adewale Okonkwo',
    copartners: [
      { id: 't4a', name: 'Femi Adekunle', household: 'Flat 3B', amount: 33333, paid: false },
      { id: 't4b', name: 'Amara Nwosu', household: 'Flat 1A', amount: 33333, paid: false },
      { id: 't4c', name: 'Kemi Okafor', household: 'Flat 2A', amount: 33333, paid: false },
      { id: 't4d', name: 'Tolu Adeyemi', household: 'Flat 4C', amount: 33333, paid: false },
      { id: 't4e', name: 'Ngozi Eze', household: 'Flat 6E', amount: 33334, paid: false },
      { id: 't4f', name: 'Chisom Obi', household: 'Flat 5D', amount: 33334, paid: false },
    ],
  },
  {
    id: 'b5',
    type: 'internet',
    title: 'Estate Wi-Fi',
    totalAmount: 150000,
    dueDate: '2026-10-01',
    state: 'paid',
    period: '2026-10',
    category: 'shared',
    tenantName: 'All tenants',
    propertyLabel: 'Lekki Gardens Estate',
    payoutBank: 'Zenith Bank',
    payoutAcct: '1023456789',
    accountName: 'SPEEDNET SOLUTIONS LTD',
    payoutPersonName: 'Chima Nwosu',
    copartners: [
      { id: 't5a', name: 'Femi Adekunle', household: 'Flat 3B', amount: 25000, paid: true },
      { id: 't5b', name: 'Amara Nwosu', household: 'Flat 1A', amount: 25000, paid: true },
      { id: 't5c', name: 'Kemi Okafor', household: 'Flat 2A', amount: 25000, paid: true },
      { id: 't5d', name: 'Tolu Adeyemi', household: 'Flat 4C', amount: 25000, paid: true },
      { id: 't5e', name: 'Ngozi Eze', household: 'Flat 6E', amount: 25000, paid: true },
      { id: 't5f', name: 'Chisom Obi', household: 'Flat 5D', amount: 25000, paid: true },
    ],
  },
  // One-time
  {
    id: 'ot1',
    type: 'other',
    title: 'Flat 3B — Plumbing repair',
    totalAmount: 180000,
    dueDate: '2026-10-18',
    state: 'due',
    period: '2026-10',
    category: 'one_time',
    propertyLabel: 'Lekki Gardens Estate',
    tenantName: 'Femi Adekunle',
    household: 'Flat 3B',
    payoutBank: 'Kuda Bank',
    payoutAcct: '2034918234',
    accountName: 'EMMANUEL PLUMBING',
    payoutPersonName: 'Emmanuel Eze',
    copartners: [
      { id: 'ot1a', name: 'Femi Adekunle', household: 'Flat 3B', amount: 30000, paid: false },
      { id: 'ot1b', name: 'Amara Nwosu',   household: 'Flat 1A', amount: 30000, paid: true  },
      { id: 'ot1c', name: 'Kemi Okafor',   household: 'Flat 2A', amount: 30000, paid: true  },
      { id: 'ot1d', name: 'Tolu Adeyemi',  household: 'Flat 4C', amount: 30000, paid: false },
      { id: 'ot1e', name: 'Ngozi Eze',     household: 'Flat 6E', amount: 30000, paid: false },
      { id: 'ot1f', name: 'Chisom Obi',    household: 'Flat 5D', amount: 30000, paid: true  },
    ],
  },
  {
    id: 'ot2',
    type: 'other',
    title: 'Window replacement',
    totalAmount: 95000,
    dueDate: '2026-09-30',
    state: 'paid',
    period: '2026-09',
    category: 'one_time',
    propertyLabel: 'Lekki Gardens Estate',
    tenantName: 'Amara Nwosu',
    household: 'Flat 1A',
    payoutBank: 'Access Bank',
    payoutAcct: '0145892301',
    accountName: 'ALHAJI KASIM ALUMINIUM',
    payoutPersonName: 'Alhaji Kasim',
    copartners: [
      { id: 'ot2a', name: 'Femi Adekunle', household: 'Flat 3B', amount: 15833, paid: true  },
      { id: 'ot2b', name: 'Amara Nwosu',   household: 'Flat 1A', amount: 15833, paid: true  },
      { id: 'ot2c', name: 'Kemi Okafor',   household: 'Flat 2A', amount: 15833, paid: true  },
      { id: 'ot2d', name: 'Tolu Adeyemi',  household: 'Flat 4C', amount: 15834, paid: true  },
      { id: 'ot2e', name: 'Ngozi Eze',     household: 'Flat 6E', amount: 15834, paid: true  },
      { id: 'ot2f', name: 'Chisom Obi',    household: 'Flat 5D', amount: 15833, paid: true  },
    ],
  },
  // Private
  {
    id: 'pb1',
    type: 'other',
    title: 'Netflix subscription',
    totalAmount: 45000,
    dueDate: '2026-10-25',
    state: 'upcoming',
    period: '2026-10',
    category: 'private',
    payoutBank: 'OPay',
    payoutAcct: '9012345678',
    accountName: 'CHISOM OBI',
    payoutPersonName: 'Chisom Obi',
  },
  {
    id: 'pb2',
    type: 'internet',
    title: 'Personal Fibre',
    totalAmount: 120000,
    dueDate: '2026-10-01',
    state: 'paid',
    period: '2026-10',
    category: 'private',
    payoutBank: 'Zenith Bank',
    payoutAcct: '1023456789',
    accountName: 'SPEEDNET SOLUTIONS LTD',
    payoutPersonName: 'Chima Nwosu',
  },
  {
    id: 'pb3',
    type: 'other',
    title: 'Amazon Prime',
    totalAmount: 35000,
    dueDate: '2026-09-20',
    state: 'paid',
    period: '2026-09',
    category: 'private',
    payoutBank: 'OPay',
    payoutAcct: '9012345678',
    accountName: 'CHISOM OBI',
    payoutPersonName: 'Chisom Obi',
  },
  // Co-partner
  {
    id: 'cp0',
    type: 'other',
    title: 'Joint streaming plan',
    totalAmount: 60000,
    dueDate: '2026-10-20',
    state: 'paid',
    period: '2026-10',
    category: 'copartner',
    splitType: 'equal',
    tenantName: 'Femi Adekunle + 1',
    payoutBank: 'GTBank',
    payoutAcct: '0045678901',
    accountName: 'ADEWALE OKONKWO',
    payoutPersonName: 'Adewale Okonkwo',
    copartners: [
      { id: 'ca1', name: 'Femi Adekunle', household: 'Flat 4C', amount: 30000, sharePercent: 50, paid: true, isOwn: true },
      { id: 'ca2', name: 'Tolu Adeyemi', household: 'Flat 3B', amount: 30000, sharePercent: 50, paid: true },
    ],
  },
  {
    id: 'cp2',
    type: 'internet',
    title: 'Shared broadband',
    totalAmount: 90000,
    dueDate: '2026-10-15',
    state: 'due',
    period: '2026-10',
    category: 'copartner',
    splitType: 'percentage',
    tenantName: 'Kemi Okafor + 1',
    payoutBank: 'Access Bank',
    payoutAcct: '0987654321',
    accountName: 'PUREFLOW BROADBAND',
    payoutPersonName: 'Kemi Okafor',
    copartners: [
      { id: 'ca3', name: 'Kemi Okafor', household: 'Flat 2A', amount: 60000, sharePercent: 67, paid: true, isOwn: true },
      { id: 'ca4', name: 'Ngozi Eze', household: 'Flat 6E', amount: 30000, sharePercent: 33, paid: false },
    ],
  },
  {
    id: 'cp3',
    type: 'other',
    title: 'Joint streaming plan',
    totalAmount: 60000,
    dueDate: '2026-09-20',
    state: 'paid',
    period: '2026-09',
    category: 'copartner',
    splitType: 'custom',
    tenantName: 'Tolu Adeyemi + 1',
    payoutBank: 'GTBank',
    payoutAcct: '0045678901',
    accountName: 'ADEWALE OKONKWO',
    payoutPersonName: 'Adewale Okonkwo',
    copartners: [
      { id: 'ca5', name: 'Tolu Adeyemi', household: 'Flat 3B', amount: 40000, paid: true },
      { id: 'ca6', name: 'Amara Nwosu', household: 'Flat 1A', amount: 20000, paid: true, isOwn: true },
    ],
  },
  {
    id: 'cp4',
    type: 'electricity',
    title: 'Electricity sub-meter',
    totalAmount: 55000,
    dueDate: '2026-10-25',
    state: 'upcoming',
    period: '2026-10',
    category: 'copartner',
    pendingShare: true,
    tenantName: 'Femi Adekunle + 1',
    payoutBank: 'GTBank',
    payoutAcct: '0045678901',
    accountName: 'ADEWALE OKONKWO',
    payoutPersonName: 'Adewale Okonkwo',
    copartners: [
      { id: 'ca7', name: 'Femi Adekunle', household: 'Flat 4C', amount: 27500, paid: false, isOwn: true },
      { id: 'ca8', name: 'Tolu Adeyemi', household: 'Flat 3B', amount: 27500, paid: false },
    ],
  },
];

const CATEGORY_META: Record<string, { label: string; icon: () => React.ReactElement; iconBg: string }> = {
  shared: { label: 'Shared', icon: BuildingIcon, iconBg: Colors.mint },
  one_time: { label: 'One-time', icon: BuildingIcon, iconBg: Colors.mint },
  private: { label: 'Private', icon: BuildingIcon, iconBg: Colors.mint },
  copartner: { label: 'Co-partner', icon: BuildingIcon, iconBg: Colors.mint },
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

function ElectricityIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path d="M13 2L4.5 13.5H12L11 22l8.5-11.5H12.5L13 2Z" fill="#A98BFF" stroke="#0C1822" strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
}

function WaterIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3C12 3 5 10.5 5 15a7 7 0 0014 0C19 10.5 12 3 12 3Z" fill="#A98BFF" stroke="#0C1822" strokeWidth={1.6} strokeLinejoin="round" />
    </Svg>
  );
}

function WifiIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12.5C7 10 9.3 9 12 9s5 1 7 3.5" stroke="#0C1822" strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M8.5 16C9.8 14.5 10.8 14 12 14s2.2.5 3.5 2" stroke="#0C1822" strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M2 9C4.5 6 8 4.5 12 4.5S19.5 6 22 9" stroke="#0C1822" strokeWidth={1.6} strokeLinecap="round" />
      <Circle cx={12} cy={19} r={1.2} fill="#40CE86" />
    </Svg>
  );
}

function SecurityIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3L4 7v5c0 4.97 3.47 9.22 8 10 4.53-.78 8-5.03 8-10V7L12 3Z" fill="#A98BFF" stroke="#0C1822" strokeWidth={1.6} strokeLinejoin="round" />
      <Path d="M9 12l2 2 4-4" stroke="#40CE86" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ServiceIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path d="M6 20V8l6-4 6 4v12H6z" fill="#A98BFF" stroke="#0C1822" strokeWidth={1.6} strokeLinejoin="round" />
      <Rect x={9} y={13} width={6} height={7} rx={1} fill="#40CE86" stroke="#0C1822" strokeWidth={1.2} />
    </Svg>
  );
}

function StreamingIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Rect x={2} y={5} width={20} height={14} rx={2.5} fill="#A98BFF" stroke="#0C1822" strokeWidth={1.5} />
      <Path d="M10 9l6 3-6 3V9z" fill="#FFF" />
    </Svg>
  );
}

const TYPE_ICON: Record<string, { icon: () => React.ReactElement; iconBg: string }> = {
  electricity: { icon: ElectricityIcon, iconBg: '#FFF3CC' },
  water:       { icon: WaterIcon,       iconBg: '#E0F0FF' },
  internet:    { icon: WifiIcon,        iconBg: '#EEE8FF' },
  security:    { icon: SecurityIcon,    iconBg: Colors.mint },
  service_charge: { icon: ServiceIcon,  iconBg: '#F0EDFF' },
  streaming:   { icon: StreamingIcon,   iconBg: '#FFE8E8' },
  other:       { icon: BuildingIcon,    iconBg: Colors.mint },
};

function getBillIcon(type: string) {
  return TYPE_ICON[type] ?? TYPE_ICON.other;
}

function EditIcon({ size = 18, color = Colors.textSecondary }: { size?: number; color?: string } = {}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function TrashIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="#E8724A" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function DefaultAvatarIcon({ size = 34 }: { size?: number }) {
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
    </Svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d={open ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'}
        stroke={Colors.textSecondary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── Bill row ───────────────────────────────────────────────────────────────────

function BillRow({
  item,
  onEdit,
  onDelete,
}: {
  item: ManagedBill;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const navigation = useNavigation<any>();
  const [copartnersOpen, setCopartnersOpen] = useState(true);
  const meta = CATEGORY_META[item.category];
  const typeIcon = getBillIcon(item.type);

  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.88}
      onPress={() => navigation.navigate('ChargesDetail', { billId: item.id, billData: item })}
    >
      <View style={styles.rowTop}>
        <View style={[styles.iconBox, { backgroundColor: typeIcon.iconBg }]}>
          <typeIcon.icon />
        </View>
        <View style={styles.rowInfo}>
          <View style={styles.rowTitleRow}>
            <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.rowAmount}>{formatNaira(item.totalAmount)}</Text>
          </View>
          <Text style={styles.rowDue}>
            {item.category === 'one_time' ? formatDueDate(item.dueDate) : formatRecurringDay(item.dueDate)}
          </Text>
          {item.category !== 'copartner' && (
            item.payoutBank ? (
              <View style={styles.payoutInfo}>
                <BankFavicon bankName={item.payoutBank} size={28} />
                <View style={styles.payoutInfoText}>
                  {item.payoutPersonName ? (
                    <Text style={styles.payoutInfoName} numberOfLines={1}>
                      {item.payoutPersonName.split(' (')[0]}
                    </Text>
                  ) : null}
                  <Text style={styles.payoutInfoBank} numberOfLines={1}>
                    {item.payoutBank} · ···{item.payoutAcct?.slice(-4)}
                  </Text>
                </View>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M9 18l6-6-6-6" stroke={Colors.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
            ) : (
              <View style={styles.chevronAlone}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M9 18l6-6-6-6" stroke={Colors.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
            )
          )}
        </View>
      </View>

      {/* Co-partner sharing section */}
      {item.category === 'copartner' && item.copartners && item.copartners.length > 0 && (
        <View style={styles.copartnerSection}>
          <View style={styles.copartnerSectionDivider} />

          {/* Pending share notification banner */}
          {item.pendingShare && (
            <TouchableOpacity
              style={styles.pendingShareBanner}
              activeOpacity={0.8}
              onPress={(e: any) => { e?.stopPropagation?.(); navigation.navigate('CoPartner'); }}
            >
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path d="M12 9v4M12 17h.01" stroke="#92400E" strokeWidth={2} strokeLinecap="round" />
                <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#92400E" strokeWidth={1.8} strokeLinejoin="round" />
              </Svg>
              <Text style={styles.pendingShareText}>New bill — set your split preference</Text>
              <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                <Path d="M9 18l6-6-6-6" stroke="#92400E" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.copartnerSectionHeader}
            onPress={(e: any) => { e?.stopPropagation?.(); setCopartnersOpen((prev) => !prev); }}
            activeOpacity={0.7}
          >
            <Text style={styles.copartnerSectionTitle}>
              Co-partners Split ({item.copartners.length})
            </Text>
            <Chevron open={copartnersOpen} />
          </TouchableOpacity>

          {copartnersOpen && (
            <View style={styles.copartnerList}>
              {item.copartners.map((cp, idx) => (
                <View key={cp.id}>
                  {idx > 0 && <View style={styles.copartnerRowDivider} />}
                  <View style={styles.copartnerRow}>
                    <View style={styles.copartnerAvatar}>
                      <DefaultAvatarIcon size={32} />
                    </View>
                    <View style={styles.copartnerInfo}>
                      <View style={styles.copartnerNameRow}>
                        <Text style={styles.copartnerName}>{cp.name}</Text>
                        {cp.isOwn && (
                          <View style={styles.youTag}>
                            <Text style={styles.youTagText}>You</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.copartnerMeta}>
                        {item.splitType === 'percentage' && cp.sharePercent ? `${cp.sharePercent}% share` : item.splitType === 'equal' ? 'Equal split' : item.pendingShare ? 'Split not set' : formatNaira(cp.amount)}
                      </Text>
                    </View>
                    <View style={styles.copartnerRight}>
                      <Text style={styles.copartnerAmount}>
                        {formatNaira(cp.amount)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
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
  { id: 'shared', label: 'Shared' },
  { id: 'one_time', label: 'One-time' },
  { id: 'private', label: 'Private' },
  { id: 'copartner', label: 'Co-partner' },
];

const BILL_TYPE_OPTIONS: { scope: BillCategory; label: string; sub: string; icon: () => React.ReactElement; iconBg: string }[] = [
  {
    scope: 'shared',
    label: 'Shared bill',
    sub: 'Split equally across all tenants',
    icon: PeopleIcon,
    iconBg: Colors.violetTint,
  },
  {
    scope: 'one_time',
    label: 'One-time bill',
    sub: 'Single charge for a specific tenant',
    icon: DocumentIcon,
    iconBg: Colors.violetTint,
  },
  {
    scope: 'private',
    label: 'Private bill',
    sub: 'Assigned to one household only',
    icon: LockIcon,
    iconBg: Colors.screen,
  },
  {
    scope: 'copartner',
    label: 'Co-partner bill',
    sub: 'Shared between selected tenants',
    icon: CoPartnerIcon,
    iconBg: Colors.violetTint,
  },
];

function CoPartnerIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={7} cy={8} r={3} fill={Colors.violet} stroke={Colors.ink} strokeWidth={1.6} />
      <Circle cx={17} cy={8} r={3} fill={Colors.violet} stroke={Colors.ink} strokeWidth={1.6} />
      <Path d="M1 20c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke={Colors.ink} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M17 15c3.314 0 6 1.686 6 5" stroke={Colors.ink} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function LeviesScreen() {
  const navigation = useNavigation<any>();
  const { role } = useAppStore();
  const effectiveRole = role ?? 'master_tenant';
  const canManage = effectiveRole === 'master_tenant' || effectiveRole === 'landlord' || effectiveRole === 'agent';

  const [filter, setFilter] = useState<BillCategory>('shared');
  const [bills, setBills] = useState<ManagedBill[]>(ALL_BILLS);
  const [showAddDrawer, setShowAddDrawer] = useState(false);

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
        onEdit={() => {
          navigation.navigate('AddBill', {
            billId: item.bill.id,
            scope: item.bill.category,
            title: item.bill.title,
            totalAmount: item.bill.totalAmount ? String(item.bill.totalAmount / 100) : '',
            dueDate: item.bill.dueDate,
            billType: item.bill.type,
          });
        }}
        onDelete={() => handleDelete(item.bill.id)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Charges</Text>
        </View>
        {canManage && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddDrawer(true)}>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path d="M12 5v14M5 12h14" stroke={Colors.ink} strokeWidth={2.5} strokeLinecap="round" />
            </Svg>
            <Text style={styles.addBtnText}>Add bill</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.id}
              style={[styles.chip, filter === f.id && styles.chipActive]}
              onPress={() => setFilter(f.id)}
            >
              <Text style={[styles.chipText, filter === f.id && styles.chipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={item => item.key}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Add bill bottom drawer */}
      <Modal visible={showAddDrawer} transparent animationType="slide" onRequestClose={() => setShowAddDrawer(false)}>
        <Pressable style={styles.drawerOverlay} onPress={() => setShowAddDrawer(false)}>
          <View style={styles.drawerSheet}>
            <View style={styles.drawerHandle} />
            <Text style={styles.drawerTitle}>What type of bill?</Text>
            <Text style={styles.drawerSub}>Choose how this bill will be assigned</Text>
            <View style={styles.drawerList}>
              {BILL_TYPE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.scope}
                  style={styles.drawerRow}
                  activeOpacity={0.75}
                  onPress={() => {
                    setShowAddDrawer(false);
                    navigation.navigate('AddBill', { scope: opt.scope });
                  }}
                >
                  <View style={[styles.drawerRowIcon, { backgroundColor: opt.iconBg }]}>
                    <opt.icon />
                  </View>
                  <View style={styles.drawerRowInfo}>
                    <Text style={styles.drawerRowLabel}>{opt.label}</Text>
                    <Text style={styles.drawerRowSub}>{opt.sub}</Text>
                  </View>
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path d="M9 18l6-6-6-6" stroke={Colors.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.screen },

  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding, paddingTop: 16, paddingBottom: 8,
  },
  headerTitle: { ...Typography.h2, color: Colors.ink },
  headerSub: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 },
  addBtnText: { ...Typography.label, color: Colors.ink, fontSize: 13 },

  summaryCard: {
    marginHorizontal: Layout.screenPadding, marginBottom: 12,
    backgroundColor: Colors.ink, borderRadius: Radius.card, padding: 16,
  },
  summaryLabel: { ...Typography.caption, color: 'rgba(255,255,255,0.65)', marginBottom: 4 },
  summaryAmount: { ...Typography.amount, color: Colors.white },
  summaryMeta: { ...Typography.captionSmall, color: 'rgba(255,255,255,0.5)', marginTop: 4 },

  filterWrapper: { flexShrink: 0, marginTop: 12, marginBottom: 8 },
  filterRow: { paddingHorizontal: Layout.screenPadding, gap: 8, alignItems: 'center' },
  chip: {
    borderWidth: 1.5, borderColor: Colors.ink, borderRadius: 99,
    paddingHorizontal: 14, paddingVertical: 6, backgroundColor: Colors.white,
  },
  chipActive: { backgroundColor: Colors.green },
  chipText: { ...Typography.captionSmall, color: Colors.ink, fontFamily: 'Syne_800ExtraBold' },
  chipTextActive: { color: Colors.ink },

  list: { paddingHorizontal: Layout.screenPadding, paddingTop: 8, paddingBottom: Layout.contentBottomPadding, gap: 8 },

  catHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 6, marginTop: 4,
  },
  catLabel: { ...Typography.label, color: Colors.ink, fontFamily: 'Syne_800ExtraBold' },
  catMeta: { ...Typography.captionSmall, color: Colors.textMuted },

  row: {
    backgroundColor: Colors.white, borderRadius: Radius.cardSm,
    borderWidth: 1, borderColor: Colors.line, padding: 12,
  },
  rowTop: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
  },
  iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  rowInfo: { flex: 1, gap: 3 },
  rowTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  rowTitle: { ...Typography.label, color: Colors.ink, flex: 1 },
  rowMeta: { flexDirection: 'row', alignItems: 'center' },
  rowDue: { ...Typography.captionSmall, color: Colors.textSecondary, marginBottom: 2 },
  payoutInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6,
  },
  chevronAlone: { alignItems: 'flex-end', marginTop: 4 },
  payoutInfoText: { flex: 1 },
  payoutInfoName: {
    ...Typography.captionSmall, color: Colors.ink,
    fontFamily: FontFamily.dmSansMedium, fontSize: 12,
  },
  payoutInfoBank: {
    ...Typography.captionSmall, color: Colors.textSecondary,
    fontSize: 11, marginTop: 1,
  },
  rowTenant: { ...Typography.captionSmall, color: Colors.textMuted, flexShrink: 1 },
  rowAmount: { ...Typography.label, color: Colors.ink, flexShrink: 0 },
  rowStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  rowState: { ...Typography.captionSmall, color: Colors.textMuted },

  // Copartners list inside copartner bill
  copartnerSection: {
    marginTop: 8,
  },
  pendingShareBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FEF3C7', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 7,
    marginBottom: 8,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  pendingShareText: {
    flex: 1, fontSize: 11, fontFamily: 'DMSans_700Bold',
    color: '#92400E',
  },
  splitTypeChip: {
    borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 1,
  },
  splitTypeChipEqual: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  splitTypeChipPct: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  splitTypeChipCustom: { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' },
  splitTypeChipText: { fontSize: 10, fontFamily: 'DMSans_700Bold' },
  copartnerSectionDivider: {
    height: 1,
    backgroundColor: Colors.line,
    marginBottom: 8,
  },
  copartnerSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
    marginBottom: 4,
  },
  copartnerHeaderLeft: {
    gap: 2,
    flex: 1,
  },
  copartnerHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  copartnerEditSplitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.screen,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.chip,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  copartnerEditSplitText: {
    ...Typography.captionSmall,
    fontSize: 11,
    color: Colors.ink,
    fontFamily: FontFamily.syneBold,
  },
  copartnerSectionTitle: {
    ...Typography.label,
    fontSize: 14,
    color: Colors.ink,
    fontFamily: 'Syne_800ExtraBold',
  },
  copartnerSectionSub: {
    ...Typography.captionSmall,
    color: Colors.textMuted,
    fontSize: 11,
  },
  copartnerList: {
    gap: 6,
    marginTop: 4,
  },
  copartnerRowDivider: {
    height: 1,
    backgroundColor: 'rgba(223, 230, 226, 0.6)',
    marginVertical: 2,
  },
  copartnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  copartnerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: Colors.screen,
  },
  copartnerInfo: {
    flex: 1,
    gap: 2,
  },
  copartnerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  copartnerName: {
    ...Typography.label,
    fontSize: 13,
    color: Colors.ink,
  },
  youTag: {
    backgroundColor: Colors.mint,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  youTagText: {
    ...Typography.captionSmall,
    fontSize: 9,
    fontFamily: FontFamily.dmSansBold,
    color: Colors.ink,
  },
  copartnerMeta: {
    ...Typography.captionSmall,
    color: Colors.textSecondary,
    fontSize: 11,
  },
  copartnerRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  copartnerAmount: {
    ...Typography.label,
    fontSize: 13,
    color: Colors.ink,
  },
  copartnerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copartnerStatusText: {
    ...Typography.captionSmall,
    fontSize: 10,
    color: Colors.textMuted,
    fontFamily: FontFamily.dmSansMedium,
  },
  copartnerStatusTextPaid: {
    color: '#0D8C4B',
  },
  actionBtn: { padding: 4 },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' },
  menuBox: {
    backgroundColor: Colors.white, borderRadius: 14, width: 180,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    overflow: 'hidden',
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
  menuItemText: { ...Typography.label, color: Colors.ink, fontSize: 14 },
  menuDivider: { height: 1, backgroundColor: Colors.line },

  drawerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  drawerSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: Layout.screenPadding,
    paddingTop: 12, paddingBottom: 32,
  },
  drawerHandle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.line,
    alignSelf: 'center', marginBottom: 20,
  },
  drawerTitle: { ...Typography.h2, color: Colors.ink, marginBottom: 4 },
  drawerSub: { ...Typography.caption, color: Colors.textSecondary, marginBottom: 20 },
  drawerList: { gap: 10 },
  drawerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.screen, borderRadius: Radius.cardSm,
    borderWidth: 1, borderColor: Colors.line, padding: 14,
  },
  drawerRowIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  drawerRowInfo: { flex: 1 },
  drawerRowLabel: { ...Typography.label, color: Colors.ink, marginBottom: 2 },
  drawerRowSub: { ...Typography.captionSmall, color: Colors.textSecondary },
});
