import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput as RNTextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BillsStackParams } from '@/navigation/types';
import { Colors, Typography, Layout, Radius } from '@/theme';
import { api } from '@/api/client';
import { BillType } from '@/types';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { TextInput } from '@/components/common/TextInput';
import { Button } from '@/components/common/Button';

type Props = NativeStackScreenProps<BillsStackParams, 'AddBill'>;

type BillScope = 'shared' | 'one_time' | 'private' | 'copartner';


const BILL_SCOPES: { id: BillScope; label: string; hint: string }[] = [
  { id: 'shared', label: 'Shared', hint: 'Split across all tenants' },
  { id: 'one_time', label: 'One-time', hint: 'Single charge, not recurring' },
  { id: 'private', label: 'Private', hint: 'One household only' },
  { id: 'copartner', label: 'Co-partner', hint: 'Split between specific tenants' },
];

function ScopeIcon({ type, active, size = 28 }: { type: BillScope; active?: boolean; size?: number }) {
  if (type === 'shared') return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={7} r={3} fill={Colors.violet} stroke={Colors.ink} strokeWidth={1.6} />
      <Circle cx={17} cy={8} r={2.5} fill={Colors.violet} stroke={Colors.ink} strokeWidth={1.4} />
      <Path d="M3 19c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke={Colors.ink} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M17 14c1.657 0 3 1.119 3 3.333" stroke={Colors.ink} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
  if (type === 'one_time') return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={4} width={18} height={16} rx={2} fill={Colors.violet} stroke={Colors.ink} strokeWidth={1.8} />
      <Path d="M7 9h10M7 13h6" stroke="#F4F7F5" strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
  if (type === 'copartner') return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={7} cy={8} r={3} fill={Colors.violet} stroke={Colors.ink} strokeWidth={1.6} />
      <Circle cx={17} cy={8} r={3} fill={Colors.violet} stroke={Colors.ink} strokeWidth={1.6} />
      <Path d="M1 20c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke={Colors.ink} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M17 15c3.314 0 6 1.686 6 5" stroke={Colors.ink} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={5} y={11} width={14} height={10} rx={2} fill={Colors.violet} stroke={Colors.ink} strokeWidth={1.8} />
      <Path d="M8 11V7a4 4 0 018 0v4" stroke={Colors.ink} strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx={12} cy={16} r={1.5} fill={Colors.green} />
    </Svg>
  );
}

const BILL_TYPES: { id: BillType; label: string }[] = [
  { id: 'electricity', label: 'Electricity' },
  { id: 'water', label: 'Water' },
  { id: 'service_charge', label: 'Service charge' },
  { id: 'security', label: 'Security' },
  { id: 'waste', label: 'Waste' },
  { id: 'internet', label: 'Internet' },
  { id: 'other', label: 'Other' },
];

function BillTypeIcon({ type, active }: { type: BillType; active: boolean }) {
  const s = active ? Colors.ink : Colors.textSecondary;
  const f = active ? Colors.violet : Colors.line;
  if (type === 'electricity') return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M13 2L4.5 13.5H12L11 22l8.5-11.5H12.5L13 2Z" fill={f} stroke={s} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
  if (type === 'water') return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3C12 3 5 10.5 5 15a7 7 0 0014 0C19 10.5 12 3 12 3Z" fill={f} stroke={s} strokeWidth={1.6} strokeLinejoin="round" />
    </Svg>
  );
  if (type === 'service_charge') return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M6 20V8l6-4 6 4v12H6z" fill={f} stroke={s} strokeWidth={1.6} strokeLinejoin="round" />
      <Rect x={9} y={13} width={6} height={7} rx={1} fill={active ? Colors.green : Colors.screen} stroke={s} strokeWidth={1.2} />
    </Svg>
  );
  if (type === 'security') return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3L4 7v5c0 4.97 3.47 9.22 8 10 4.53-.78 8-5.03 8-10V7L12 3Z" fill={f} stroke={s} strokeWidth={1.6} strokeLinejoin="round" />
      <Path d="M9 12l2 2 4-4" stroke={active ? Colors.green : s} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
  if (type === 'waste') return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0v13a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" fill={f} stroke={s} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
  if (type === 'internet') return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12.5C7 10 9.3 9 12 9s5 1 7 3.5" stroke={s} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M8.5 16C9.8 14.5 10.8 14 12 14s2.2.5 3.5 2" stroke={s} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M2 9C4.5 6 8 4.5 12 4.5S19.5 6 22 9" stroke={s} strokeWidth={1.6} strokeLinecap="round" />
      <Circle cx={12} cy={19} r={1.2} fill={active ? Colors.green : s} />
    </Svg>
  );
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Circle cx={5} cy={12} r={1.5} fill={s} />
      <Circle cx={12} cy={12} r={1.5} fill={s} />
      <Circle cx={19} cy={12} r={1.5} fill={s} />
    </Svg>
  );
}

const schema = z.object({
  title: z.string().min(2, 'Enter a bill title'),
  totalAmount: z.string().min(1, 'Enter an amount').refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Invalid amount'),
  dueDate: z.string().min(8, 'Enter due date (YYYY-MM-DD)'),
  lineItems: z.array(z.object({
    description: z.string().min(1, 'Enter description'),
    amount: z.string().min(1, 'Enter amount'),
  })).optional(),
});

type FormData = z.infer<typeof schema>;

function CalendarIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={4} width={18} height={18} rx={2} stroke={Colors.ink} strokeWidth={2} />
      <Path d="M16 2v4M8 2v4M3 10h18" stroke={Colors.ink} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={8} cy={14} r={1.2} fill={Colors.ink} />
      <Circle cx={12} cy={14} r={1.2} fill={Colors.ink} />
      <Circle cx={16} cy={14} r={1.2} fill={Colors.ink} />
      <Circle cx={8} cy={18} r={1.2} fill={Colors.ink} />
      <Circle cx={12} cy={18} r={1.2} fill={Colors.ink} />
    </Svg>
  );
}

function DueDateCalendarModal({
  visible,
  currentDate,
  onSelect,
  onClose,
}: {
  visible: boolean;
  currentDate?: string;
  onSelect: (dateStr: string) => void;
  onClose: () => void;
}) {
  const initial = currentDate && !isNaN(Date.parse(currentDate)) ? new Date(currentDate) : new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const startOffset = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const selectDay = (day: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    onSelect(`${viewYear}-${formattedMonth}-${formattedDay}`);
    onClose();
  };

  const applyShortcut = (daysToAdd: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onSelect(`${yr}-${mo}-${day}`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.calModalOverlay}>
        <TouchableOpacity style={styles.calModalBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.calModalSheet}>
          <View style={styles.calModalHeader}>
            <View>
              <Text style={styles.calModalTitle}>Select Due Date</Text>
              <Text style={styles.calModalSub}>Choose when this bill is due</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.calCloseBtn}>
              <Text style={styles.calCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.calNavRow}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.calNavBtn}>
              <Text style={styles.calNavBtnText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.calMonthYearText}>{monthNames[viewMonth]} {viewYear}</Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.calNavBtn}>
              <Text style={styles.calNavBtnText}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.calDaysHeader}>
            {dayNames.map((d) => (
              <Text key={d} style={styles.calDayName}>{d}</Text>
            ))}
          </View>

          <View style={styles.calDaysGrid}>
            {Array.from({ length: startOffset }).map((_, i) => (
              <View key={`empty-${i}`} style={styles.calDayCellEmpty} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = currentDate === dateStr;
              return (
                <TouchableOpacity
                  key={`day-${day}`}
                  style={[styles.calDayCell, isSelected && styles.calDayCellSelected]}
                  onPress={() => selectDay(day)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.calDayText, isSelected && styles.calDayTextSelected]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.calShortcutsRow}>
            <TouchableOpacity style={styles.calShortcutChip} onPress={() => applyShortcut(0)}>
              <Text style={styles.calShortcutText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.calShortcutChip} onPress={() => applyShortcut(7)}>
              <Text style={styles.calShortcutText}>+7 Days</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.calShortcutChip} onPress={() => applyShortcut(14)}>
              <Text style={styles.calShortcutText}>+14 Days</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.calShortcutChip} onPress={() => applyShortcut(30)}>
              <Text style={styles.calShortcutText}>+30 Days</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const UTILITY_PROVIDERS = [
  { id: 'ekedc', name: 'Eko Electricity (EKEDC)', category: 'Electricity', icon: '⚡' },
  { id: 'ikedc', name: 'Ikeja Electric (IKEDC)', category: 'Electricity', icon: '⚡' },
  { id: 'aedc', name: 'Abuja Electricity (AEDC)', category: 'Electricity', icon: '⚡' },
  { id: 'ibedc', name: 'Ibadan Electricity (IBEDC)', category: 'Electricity', icon: '⚡' },
  { id: 'eedc', name: 'Enugu Electricity (EEDC)', category: 'Electricity', icon: '⚡' },
  { id: 'lwc', name: 'Lagos Water Corporation (LWC)', category: 'Water Supply', icon: '💧' },
  { id: 'fct_water', name: 'FCT Water Board', category: 'Water Supply', icon: '💧' },
  { id: 'lawma', name: 'LAWMA Waste Management', category: 'Waste & Sanitation', icon: '🗑️' },
  { id: 'fibre', name: 'Estate Fibre / Wi-Fi Provider', category: 'Internet & Tech', icon: '📡' },
];

const POPULAR_BANKS = [
  'Guaranty Trust Bank (GTBank)',
  'Access Bank',
  'Zenith Bank',
  'First Bank of Nigeria',
  'United Bank for Africa (UBA)',
  'Kuda Bank',
  'OPay',
  'Palmpay',
  'Providus Bank',
  'Stanbic IBTC Bank',
  'Wema Bank / ALAT',
];

function ProviderSelectorModal({
  visible,
  current,
  onSelect,
  onClose,
}: {
  visible: boolean;
  current?: typeof UTILITY_PROVIDERS[0];
  onSelect: (p: typeof UTILITY_PROVIDERS[0]) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.calModalOverlay}>
        <TouchableOpacity style={styles.calModalBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.calModalSheet}>
          <View style={styles.calModalHeader}>
            <View>
              <Text style={styles.calModalTitle}>Select Utility Provider</Text>
              <Text style={styles.calModalSub}>Direct automated settlement</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.calCloseBtn}>
              <Text style={styles.calCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ gap: 8, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
            {UTILITY_PROVIDERS.map((p) => {
              const isSelected = p.id === current?.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.providerRow, isSelected && styles.providerRowActive]}
                  onPress={() => { onSelect(p); onClose(); }}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.providerRowName}>{p.name}</Text>
                    <Text style={styles.providerRowCategory}>{p.category}</Text>
                  </View>
                  {isSelected && <Text style={styles.providerRowCheck}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function AddBillScreen({ route }: Props) {
  const {
    billId,
    isPrivate,
    scope: initialScope,
    title: initialTitle,
    totalAmount: initialAmount,
    dueDate: initialDueDate,
    billType: initialBillType,
  } = (route.params ?? {}) as any;
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [scope, setScope] = useState<BillScope>(
    (initialScope as BillScope) ?? (isPrivate ? 'private' : 'shared')
  );
  const [billType, setBillType] = useState<BillType>(initialBillType ?? 'electricity');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // Co-partner split preference
  const [splitMode, setSplitMode] = useState<'equal' | 'percentage' | 'custom'>('equal');
  const [splitApplyTo, setSplitApplyTo] = useState<Set<string>>(new Set(['shared', 'one_time']));
  const [splitPctA, setSplitPctA] = useState('50');
  const [splitPctB, setSplitPctB] = useState('50');

  const toggleApplyTo = (key: string) => {
    setSplitApplyTo(prev => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); } else { next.add(key); }
      return next;
    });
  };

  // Payout destination state
  const [payoutMethod, setPayoutMethod] = useState<'bank_account' | 'paydorm_direct'>('paydorm_direct');
  const [bankName, setBankName] = useState('Guaranty Trust Bank (GTBank)');
  const [accountNumber, setAccountNumber] = useState('0045678901');
  const [accountName, setAccountName] = useState('ADEWALE OKONKWO');

  const handleAccountNumberChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setAccountNumber(cleaned);
    if (cleaned.length === 10 && !accountName) {
      setAccountName('ADEWALE OKONKWO');
    }
  };

  const [selectedProvider, setSelectedProvider] = useState(UTILITY_PROVIDERS[0]);
  const [meterNumber, setMeterNumber] = useState('01428591823');
  const [meterType, setMeterType] = useState<'prepaid' | 'postpaid'>('prepaid');
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showBankPicker, setShowBankPicker] = useState(false);

  const handleSelectBillType = (type: BillType) => {
    setBillType(type);
    if (type === 'electricity') {
      setSelectedProvider(UTILITY_PROVIDERS[0]);
      setPayoutMethod('paydorm_direct');
    } else if (type === 'water') {
      setSelectedProvider(UTILITY_PROVIDERS[5]);
      setPayoutMethod('paydorm_direct');
    } else if (type === 'waste') {
      setSelectedProvider(UTILITY_PROVIDERS[7]);
      setPayoutMethod('paydorm_direct');
    } else if (type === 'internet') {
      setSelectedProvider(UTILITY_PROVIDERS[8]);
      setPayoutMethod('paydorm_direct');
    } else {
      setPayoutMethod('bank_account');
    }
  };

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialTitle ?? '',
      totalAmount: initialAmount != null ? String(initialAmount) : '',
      dueDate: initialDueDate ?? '',
      lineItems: [],
    },
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...data,
        type: billType,
        totalAmount: Math.round(Number(data.totalAmount) * 100),
        settlementMethod: payoutMethod,
        payoutDetails:
          payoutMethod === 'bank_account'
            ? {
                bankName,
                accountNumber,
                accountName,
              }
            : {
                provider: selectedProvider.name,
                providerId: selectedProvider.id,
                meterNumber,
                meterType,
              },
      };
      if (billId) {
        await api.patch(`/bills/${billId}`, payload);
      } else {
        await api.post('/bills', payload);
      }
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      navigation.goBack();
    } catch (e: any) {
      setError(e.message ?? 'Could not save bill.');
    } finally {
      setLoading(false);
    }
  };

  const screenTitle = billId ? 'Edit bill' : 'Add bill';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={screenTitle} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Bill type chips — hidden for private scope */}
        {scope !== 'private' && (
          <>
            <Text style={styles.pageIntro}>Set up the bill details and assign it to the right tenants.</Text>
            <Text style={styles.label}>Bill type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={styles.typeRow}>
                {BILL_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.typeChip, billType === t.id && styles.typeChipActive]}
                    onPress={() => handleSelectBillType(t.id)}
                    activeOpacity={0.75}
                  >
                    <BillTypeIcon type={t.id} active={billType === t.id} />
                    <Text style={[styles.typeChipText, billType === t.id && styles.typeChipTextActive]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </>
        )}

        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Bill title"
              placeholder="e.g. Electricity EKEDC"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.title?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="totalAmount"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Total amount (₦)"
              placeholder="0.00"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="decimal-pad"
              error={errors.totalAmount?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="dueDate"
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <TextInput
                label="Due date"
                placeholder="YYYY-MM-DD"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                type="date"
                error={errors.dueDate?.message}
                rightIcon={<CalendarIcon />}
                onRightIconPress={() => setShowCalendarModal(true)}
              />
              <DueDateCalendarModal
                visible={showCalendarModal}
                currentDate={value}
                onSelect={(d) => onChange(d)}
                onClose={() => setShowCalendarModal(false)}
              />
            </>
          )}
        />

        {/* Payout destination (Bank account or PayDorm Direct like OPay) */}
        <View style={styles.destinationSection}>
          <Text style={styles.label}>Payout destination</Text>
          <Text style={styles.destinationSub}>
            Where should collected bill funds be paid to?
          </Text>

          {/* Method Selection Cards */}
          <View style={styles.destToggleRow}>
            <TouchableOpacity
              style={[
                styles.destOptionCard,
                payoutMethod === 'paydorm_direct' && styles.destOptionCardActive,
              ]}
              onPress={() => setPayoutMethod('paydorm_direct')}
              activeOpacity={0.8}
            >
              <View style={styles.destOptionIconWrap}>
                <Svg width={26} height={26} viewBox="0 0 56 56">
                  <Rect width={56} height={56} rx={14} fill={Colors.ink} />
                  <Path d="M10 24L28 9L46 24" fill="none" stroke="#FFFFFF" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" />
                  <Circle cx={22} cy={36} r={9.5} fill={Colors.green} />
                  <Circle cx={34} cy={36} r={9.5} fill={Colors.violet} stroke={Colors.ink} strokeWidth={2.6} />
                </Svg>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.destOptionTitle, payoutMethod === 'paydorm_direct' && styles.destOptionTitleActive]}>
                  PayDorm Direct
                </Text>
                <Text style={styles.destOptionHint}>Auto-pay directly to utility provider</Text>
              </View>
              <View style={styles.radioOuter}>
                {payoutMethod === 'paydorm_direct' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.destOptionCard,
                payoutMethod === 'bank_account' && styles.destOptionCardActive,
              ]}
              onPress={() => setPayoutMethod('bank_account')}
              activeOpacity={0.8}
            >
              <View style={styles.destOptionIconWrap}>
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Rect x={2} y={10} width={20} height={11} rx={2} fill={Colors.violet} stroke={Colors.ink} strokeWidth={1.6} />
                  <Path d="M12 2L2 8h20L12 2Z" fill={Colors.violet} stroke={Colors.ink} strokeWidth={1.6} strokeLinejoin="round" />
                  <Path d="M6 14v4M10 14v4M14 14v4M18 14v4" stroke={Colors.ink} strokeWidth={1.4} strokeLinecap="round" />
                </Svg>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.destOptionTitle, payoutMethod === 'bank_account' && styles.destOptionTitleActive]}>
                  Bank Account
                </Text>
                <Text style={styles.destOptionHint}>Disburse to landlord or estate bank</Text>
              </View>
              <View style={styles.radioOuter}>
                {payoutMethod === 'bank_account' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          </View>

          {/* Details based on chosen method */}
          {payoutMethod === 'paydorm_direct' ? (
            <View style={styles.destDetailsBox}>
              <View style={styles.directHeaderRow}>
                <Text style={styles.directTitle}>Service Company Settlement</Text>
              </View>

              {/* Utility Provider selector */}
              <Text style={styles.fieldLabel}>Utility provider</Text>
              <TouchableOpacity
                style={styles.providerSelectorBtn}
                onPress={() => setShowProviderModal(true)}
                activeOpacity={0.8}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.providerName}>{selectedProvider.name}</Text>
                </View>
                <Text style={styles.providerChevron}>›</Text>
              </TouchableOpacity>

              {/* Meter / Customer ID */}
              <View style={{ marginTop: 12 }}>
                <TextInput
                  label="Meter / Customer Account ID"
                  placeholder="e.g. 01428591823"
                  value={meterNumber}
                  onChangeText={setMeterNumber}
                  keyboardType="numeric"
                  rightIcon={<Text style={styles.verifiedMeterText}>Auto-verify ✓</Text>}
                />
              </View>

              {/* Meter Type Toggle */}
              <View style={styles.meterTypeRow}>
                <Text style={styles.fieldLabel}>Meter plan</Text>
                <View style={styles.meterTypeToggles}>
                  <TouchableOpacity
                    style={[styles.meterTypeBtn, meterType === 'prepaid' && styles.meterTypeBtnActive]}
                    onPress={() => setMeterType('prepaid')}
                  >
                    <Text
                      style={[
                        styles.meterTypeText,
                        meterType === 'prepaid' && styles.meterTypeTextActive,
                      ]}
                    >
                      Prepaid
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.meterTypeBtn, meterType === 'postpaid' && styles.meterTypeBtnActive]}
                    onPress={() => setMeterType('postpaid')}
                  >
                    <Text
                      style={[
                        styles.meterTypeText,
                        meterType === 'postpaid' && styles.meterTypeTextActive,
                      ]}
                    >
                      Postpaid
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.directNote}>
                PayDorm settles directly with {selectedProvider.name} on the due date. Tokens and official receipts are automatically issued to all household contributors.
              </Text>
            </View>
          ) : (
            <View style={styles.destDetailsBox}>
              <View style={styles.directHeaderRow}>
                <Text style={styles.directTitle}>Recipient Bank Account</Text>
              </View>

              {/* Bank Name dropdown */}
              <Text style={styles.fieldLabel}>Bank Name</Text>
              <TouchableOpacity
                style={styles.dropdownSelector}
                onPress={() => setShowBankPicker(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.dropdownSelectorText}>{bankName || 'Select bank'}</Text>
                <Text style={styles.providerChevron}>›</Text>
              </TouchableOpacity>

              {/* Bank picker modal */}
              <Modal visible={showBankPicker} transparent animationType="slide" onRequestClose={() => setShowBankPicker(false)}>
                <View style={styles.calModalOverlay}>
                  <TouchableOpacity style={styles.calModalBackdrop} activeOpacity={1} onPress={() => setShowBankPicker(false)} />
                  <View style={styles.calModalSheet}>
                    <View style={styles.calModalHeader}>
                      <Text style={styles.calModalTitle}>Select Bank</Text>
                      <TouchableOpacity onPress={() => setShowBankPicker(false)} style={styles.calCloseBtn}>
                        <Text style={styles.calCloseText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={{ gap: 6, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
                      {POPULAR_BANKS.map((b) => {
                        const isSelected = b === bankName;
                        return (
                          <TouchableOpacity
                            key={b}
                            style={[styles.providerRow, isSelected && styles.providerRowActive]}
                            onPress={() => { setBankName(b); setShowBankPicker(false); }}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.providerRowName}>{b}</Text>
                            {isSelected && <Text style={styles.providerRowCheck}>✓</Text>}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                </View>
              </Modal>

              {/* Account Number */}
              <View style={{ marginTop: 12 }}>
                <TextInput
                  label="Account Number (10-digit NUBAN)"
                  placeholder="e.g. 0123456789"
                  value={accountNumber}
                  onChangeText={handleAccountNumberChange}
                  keyboardType="numeric"
                  maxLength={10}
                  rightIcon={
                    accountNumber.length === 10 ? (
                      <Text style={styles.verifiedMeterText}>Valid ✓</Text>
                    ) : undefined
                  }
                />
              </View>

              {/* Account Name */}
              <View style={{ marginTop: 12 }}>
                <TextInput
                  label="Account / Beneficiary Name"
                  placeholder="e.g. ADEWALE OKONKWO"
                  value={accountName}
                  onChangeText={setAccountName}
                />
              </View>

              <Text style={styles.directNote}>
                Collected bill funds will be paid directly to this bank account upon payment collection.
              </Text>
            </View>
          )}
        </View>

        {/* Co-partner split preference */}
        {scope === 'copartner' && (
          <View style={styles.splitSection}>
            <Text style={styles.label}>Split preference</Text>
            <Text style={styles.splitHint}>Choose how this bill is split with your co-partner. You can change this anytime.</Text>

            {/* Split mode options */}
            <View style={styles.splitModeRow}>
              {([
                { key: 'equal', label: 'Equal', desc: 'Split 50/50 automatically' },
                { key: 'percentage', label: 'Percentage', desc: 'Set a custom % each' },
                { key: 'custom', label: 'Custom', desc: 'Fixed amount per bill' },
              ] as const).map(opt => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.splitModeCard, splitMode === opt.key && styles.splitModeCardActive]}
                  onPress={() => setSplitMode(opt.key)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.splitModeRadio, splitMode === opt.key && styles.splitModeRadioActive]}>
                    {splitMode === opt.key && <View style={styles.splitModeRadioDot} />}
                  </View>
                  <Text style={[styles.splitModeLabel, splitMode === opt.key && styles.splitModeLabelActive]}>{opt.label}</Text>
                  <Text style={styles.splitModeDesc}>{opt.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Percentage inputs */}
            {splitMode === 'percentage' && (
              <View style={styles.splitPctRow}>
                <View style={styles.splitPctField}>
                  <Text style={styles.splitPctLabel}>You</Text>
                  <View style={styles.splitPctInputWrap}>
                    <RNTextInput
                      style={styles.splitPctInput}
                      value={splitPctA}
                      onChangeText={v => { setSplitPctA(v); setSplitPctB(String(100 - (parseInt(v) || 0))); }}
                      keyboardType="numeric"
                      maxLength={3}
                    />
                    <Text style={styles.splitPctSign}>%</Text>
                  </View>
                </View>
                <Text style={styles.splitPctDivider}>+</Text>
                <View style={styles.splitPctField}>
                  <Text style={styles.splitPctLabel}>Co-partner</Text>
                  <View style={styles.splitPctInputWrap}>
                    <RNTextInput
                      style={styles.splitPctInput}
                      value={splitPctB}
                      onChangeText={v => { setSplitPctB(v); setSplitPctA(String(100 - (parseInt(v) || 0))); }}
                      keyboardType="numeric"
                      maxLength={3}
                    />
                    <Text style={styles.splitPctSign}>%</Text>
                  </View>
                </View>
                <View style={styles.splitPctTotal}>
                  <Text style={[styles.splitPctTotalText, (parseInt(splitPctA) || 0) + (parseInt(splitPctB) || 0) !== 100 && { color: '#E8724A' }]}>
                    = {(parseInt(splitPctA) || 0) + (parseInt(splitPctB) || 0)}%
                  </Text>
                </View>
              </View>
            )}

            {/* Apply to */}
            <Text style={[styles.label, { marginTop: 12, marginBottom: 6 }]}>Apply this split to</Text>
            <View style={styles.applyToRow}>
              {([
                { key: 'shared', label: 'Shared bills' },
                { key: 'one_time', label: 'One-time' },
                { key: 'private', label: 'Private (optional)' },
              ]).map(opt => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.applyToChip, splitApplyTo.has(opt.key) && styles.applyToChipActive]}
                  onPress={() => toggleApplyTo(opt.key)}
                  activeOpacity={0.8}
                >
                  {splitApplyTo.has(opt.key) && (
                    <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
                      <Path d="M5 13l4 4L19 7" stroke={Colors.ink} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  )}
                  <Text style={[styles.applyToChipText, splitApplyTo.has(opt.key) && styles.applyToChipTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          label={billId ? 'Save changes' : 'Create bill'}
          onPress={handleSubmit(onSubmit)}
          loading={loading}
        />
      </ScrollView>

      {/* Modals */}
      <ProviderSelectorModal
        visible={showProviderModal}
        current={selectedProvider}
        onSelect={setSelectedProvider}
        onClose={() => setShowProviderModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.screen },
  content: { padding: Layout.screenPadding, paddingTop: 24, paddingBottom: Layout.contentBottomPadding, gap: 4 },
  label: { ...Typography.label, color: Colors.ink, marginBottom: 8 },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: Colors.line,
    backgroundColor: Colors.white,
  },
  typeChipActive: { borderColor: Colors.ink, backgroundColor: Colors.mint },
  typeChipText: { ...Typography.captionSmall, color: Colors.textSecondary },
  typeChipTextActive: { color: Colors.ink, fontFamily: 'Syne_800ExtraBold' },
  scopeRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  scopeCard: {
    flex: 1, borderWidth: 1.5, borderColor: Colors.line,
    borderRadius: Radius.cardSm, padding: 10,
    backgroundColor: Colors.white, gap: 6, alignItems: 'center',
  },
  scopeCardActive: { borderColor: Colors.ink, backgroundColor: Colors.mint },
  scopeLabel: { ...Typography.captionSmall, color: Colors.textSecondary, fontSize: 11, fontFamily: 'Syne_800ExtraBold' },
  scopeLabelActive: { color: Colors.ink },
  scopeHint: { ...Typography.captionSmall, color: Colors.textSecondary, marginBottom: 12 },
  // Calendar Modal styles
  calModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 24, 34, 0.55)',
    justifyContent: 'flex-end',
  },
  calModalBackdrop: {
    flex: 1,
  },
  calModalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    borderWidth: 2,
    borderColor: Colors.ink,
    borderBottomWidth: 0,
  },
  calModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  calModalTitle: {
    ...Typography.title,
    color: Colors.ink,
  },
  calModalSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  calCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calCloseText: {
    fontSize: 14,
    color: Colors.ink,
    fontWeight: '700',
  },
  calNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  calNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.screen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.line,
  },
  calNavBtnText: {
    fontSize: 20,
    color: Colors.ink,
    fontFamily: 'Syne_800ExtraBold',
  },
  calMonthYearText: {
    ...Typography.title,
    color: Colors.ink,
    fontSize: 16,
  },
  calDaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  calDayName: {
    ...Typography.captionSmall,
    color: Colors.textMuted,
    fontFamily: 'Syne_800ExtraBold',
    width: 38,
    textAlign: 'center',
  },
  calDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  calDayCell: {
    width: '13%',
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calDayCellEmpty: {
    width: '13%',
    aspectRatio: 1,
  },
  calDayCellSelected: {
    backgroundColor: Colors.green,
    borderWidth: 1.5,
    borderColor: Colors.ink,
  },
  calDayText: {
    ...Typography.bodySmall,
    fontFamily: 'DMSans_700Bold',
    color: Colors.ink,
  },
  calDayTextSelected: {
    color: Colors.white,
    fontFamily: 'Syne_800ExtraBold',
  },
  calShortcutsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    gap: 8,
  },
  calShortcutChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: Colors.screen,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
  },
  calShortcutText: {
    ...Typography.captionSmall,
    fontFamily: 'DMSans_700Bold',
    color: Colors.ink,
  },
  destinationSection: { marginTop: 14, gap: 8 },
  pageIntro: { ...Typography.body, color: Colors.textSecondary, marginBottom: 12, marginTop: 0, fontSize: 14, fontFamily: 'DMSans_500Medium' },
  destinationSub: { ...Typography.caption, color: Colors.textSecondary, marginTop: -4, marginBottom: 4 },
  destToggleRow: { flexDirection: 'column', gap: 8 },
  destOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderRadius: Radius.card,
    padding: 14,
    position: 'relative',
  },
  destOptionCardActive: { borderColor: Colors.ink, backgroundColor: '#FAFFFD' },
  destOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  destOptionIcon: { fontSize: 22 },
  destOptionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.screen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.line,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.violet,
  },
  destCheckBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destCheckText: { color: Colors.white, fontSize: 11, fontWeight: '800' },
  directPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF08A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#CA8A04',
  },
  directPillText: {
    fontSize: 9,
    fontFamily: 'Syne_800ExtraBold',
    color: '#854D0E',
    letterSpacing: 0.5,
  },
  destOptionTitle: { ...Typography.label, color: Colors.ink, fontSize: 14 },
  destOptionTitleActive: { color: Colors.ink, fontFamily: 'Syne_800ExtraBold' },
  destOptionHint: {
    ...Typography.captionSmall,
    color: Colors.textMuted,
    marginTop: 2,
    fontSize: 11,
    lineHeight: 14,
  },
  destDetailsBox: {
    marginTop: 8,
    padding: 14,
  },
  directHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  directTitle: {
    ...Typography.label,
    color: Colors.ink,
    fontSize: 13,
    fontFamily: 'Syne_800ExtraBold',
  },
  instantTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  instantTagText: { fontSize: 10, fontFamily: 'DMSans_700Bold', color: '#166534' },
  fieldLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontFamily: 'DMSans_700Bold',
  },
  providerSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: Colors.screen,
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderRadius: Radius.button,
    marginBottom: 4,
  },
  providerName: { ...Typography.bodySmall, fontFamily: 'DMSans_700Bold', color: Colors.ink },
  providerCategory: { ...Typography.captionSmall, color: Colors.textMuted },
  providerChevron: { fontSize: 18, color: Colors.textSecondary, fontWeight: '700' },
  verifiedMeterText: { fontSize: 11, color: '#16A34A', fontFamily: 'DMSans_700Bold' },
  meterTypeRow: { marginTop: 10, marginBottom: 10 },
  meterTypeToggles: { flexDirection: 'row', gap: 8 },
  meterTypeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Radius.button,
    borderWidth: 1.5,
    borderColor: Colors.line,
    backgroundColor: Colors.screen,
  },
  meterTypeBtnActive: { borderColor: Colors.ink, backgroundColor: Colors.mint },
  meterTypeText: { ...Typography.caption, color: Colors.textSecondary },
  meterTypeTextActive: { color: Colors.ink, fontFamily: 'Syne_800ExtraBold' },
  directNote: {
    ...Typography.captionSmall,
    color: Colors.textMuted,
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 4,
    lineHeight: 15,
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.cardSm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  dropdownSelectorText: { ...Typography.bodySmall, color: Colors.ink },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: Radius.cardSm,
    borderWidth: 1.5,
    borderColor: Colors.line,
    backgroundColor: Colors.white,
  },
  providerRowActive: { borderColor: Colors.ink, backgroundColor: Colors.mint },
  providerRowName: { ...Typography.bodySmall, fontFamily: 'DMSans_700Bold', color: Colors.ink },
  providerRowCategory: { ...Typography.captionSmall, color: Colors.textMuted },
  providerRowCheck: { fontSize: 16, color: Colors.ink, fontWeight: '800' },
  bankChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: Colors.line,
    backgroundColor: Colors.screen,
  },
  bankChipActive: { borderColor: Colors.ink, backgroundColor: Colors.mint },
  bankChipText: { ...Typography.captionSmall, color: Colors.textSecondary },
  bankChipTextActive: { color: Colors.ink, fontFamily: 'Syne_800ExtraBold' },
  error: { ...Typography.caption, color: Colors.overdue, marginBottom: 8 },

  // Co-partner split preference
  splitSection: {
    borderTopWidth: 1, borderTopColor: Colors.line,
    paddingTop: 16, marginTop: 8, gap: 0,
  },
  splitHint: { ...Typography.captionSmall, color: Colors.textSecondary, marginBottom: 12, fontSize: 12 },
  splitModeRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  splitModeCard: {
    flex: 1, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.line,
    backgroundColor: Colors.white, padding: 10, gap: 4, alignItems: 'center',
  },
  splitModeCardActive: { borderColor: Colors.ink, backgroundColor: Colors.mint },
  splitModeRadio: {
    width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: Colors.line,
    alignItems: 'center', justifyContent: 'center',
  },
  splitModeRadioActive: { borderColor: Colors.ink },
  splitModeRadioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.ink },
  splitModeLabel: { ...Typography.captionSmall, color: Colors.textSecondary, fontFamily: 'Syne_800ExtraBold', fontSize: 11, textAlign: 'center' },
  splitModeLabelActive: { color: Colors.ink },
  splitModeDesc: { ...Typography.captionSmall, color: Colors.textMuted, fontSize: 9, textAlign: 'center' },
  splitPctRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, marginBottom: 4 },
  splitPctField: { flex: 1, gap: 4 },
  splitPctLabel: { ...Typography.captionSmall, color: Colors.textSecondary, fontSize: 11, fontFamily: 'DMSans_700Bold' },
  splitPctInputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.line, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 8, backgroundColor: Colors.white,
  },
  splitPctInput: { flex: 1, fontSize: 16, fontFamily: 'Syne_800ExtraBold', color: Colors.ink },
  splitPctSign: { fontSize: 14, color: Colors.textSecondary, fontFamily: 'Syne_800ExtraBold' },
  splitPctDivider: { fontSize: 16, color: Colors.textMuted, fontFamily: 'Syne_800ExtraBold', paddingTop: 18 },
  splitPctTotal: { paddingTop: 18, minWidth: 36 },
  splitPctTotalText: { fontSize: 13, fontFamily: 'DMSans_700Bold', color: Colors.green },
  applyToRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  applyToChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 99, borderWidth: 1.5, borderColor: Colors.line,
    backgroundColor: Colors.white,
  },
  applyToChipActive: { borderColor: Colors.ink, backgroundColor: Colors.mint },
  applyToChipText: { ...Typography.captionSmall, color: Colors.textSecondary, fontSize: 12 },
  applyToChipTextActive: { color: Colors.ink, fontFamily: 'DMSans_700Bold' },
});
