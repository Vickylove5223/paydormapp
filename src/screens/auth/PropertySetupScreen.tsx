import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthStackParams } from '@/navigation/types';
import { Colors, Typography, Layout, Radius } from '@/theme';
import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/TextInput';
import { AuthHeader } from '@/components/common/AuthHeader';
import { useAuthStore } from '@/store/auth';
import { api } from '@/api/client';

type Props = NativeStackScreenProps<AuthStackParams, 'PropertySetup'>;
type PropertyType = 'estate' | 'compound' | 'block' | 'single_building';
type Household = { name: string; floorOrBlock: string };

import { NIGERIAN_STATES } from '@/constants/states';


const schema = z.object({
  propertyName: z.string().min(2, 'Enter the property name'),
  address: z.string().min(5, 'Enter the address'),
  city: z.string().min(2, 'Enter the city'),
});
type FormData = z.infer<typeof schema>;

// ── Illustration-style property type icons ────────────────────────────────
function IconEstate({ active }: { active: boolean }) {
  const s = active ? Colors.white : Colors.ink;
  return (
    <Svg width={22} height={22} viewBox="0 0 28 28">
      {/* back house */}
      <Path d="M11 14l5.5-6 5.5 6v7.5H11V14z" fill={active ? 'rgba(255,255,255,0.25)' : Colors.violet} stroke={s} strokeWidth="1.8" strokeLinejoin="round" />
      <Rect x="14" y="17" width="2.5" height="4.5" rx="0.5" fill={s} />
      {/* front house */}
      <Path d="M2 16l6-7.5 6 7.5v6.5H2V16z" fill={active ? 'rgba(255,255,255,0.35)' : Colors.green} stroke={s} strokeWidth="1.8" strokeLinejoin="round" />
      <Rect x="5.5" y="18.5" width="2.5" height="4" rx="0.5" fill={s} />
      {/* window */}
      <Rect x="9" y="17" width="2" height="2" rx="0.5" fill={s} />
    </Svg>
  );
}

function IconCompound({ active }: { active: boolean }) {
  const s = active ? Colors.white : Colors.ink;
  return (
    <Svg width={22} height={22} viewBox="0 0 28 28">
      {/* roof */}
      <Path d="M4 13l10-9 10 9" fill={active ? 'rgba(255,255,255,0.35)' : Colors.green} stroke={s} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      {/* body */}
      <Rect x="6" y="13" width="16" height="11" rx="1" fill={active ? 'rgba(255,255,255,0.2)' : Colors.white} stroke={s} strokeWidth="1.8" />
      {/* door */}
      <Rect x="11" y="18" width="4" height="6" rx="1" fill={s} />
      {/* windows */}
      <Rect x="7.5" y="15.5" width="3" height="2.5" rx="0.5" fill={s} />
      <Rect x="17.5" y="15.5" width="3" height="2.5" rx="0.5" fill={s} />
    </Svg>
  );
}

function IconBlock({ active }: { active: boolean }) {
  const s = active ? Colors.white : Colors.ink;
  return (
    <Svg width={22} height={22} viewBox="0 0 28 28">
      {/* building body */}
      <Rect x="5" y="6" width="18" height="18" rx="1.5" fill={active ? 'rgba(255,255,255,0.25)' : Colors.violet} stroke={s} strokeWidth="1.8" />
      {/* windows row 1 */}
      <Rect x="8" y="9" width="3" height="3" rx="0.5" fill={s} />
      <Rect x="13" y="9" width="3" height="3" rx="0.5" fill={s} />
      <Rect x="18" y="9" width="2" height="3" rx="0.5" fill={s} />
      {/* windows row 2 */}
      <Rect x="8" y="14" width="3" height="3" rx="0.5" fill={s} />
      <Rect x="13" y="14" width="3" height="3" rx="0.5" fill={s} />
      <Rect x="18" y="14" width="2" height="3" rx="0.5" fill={s} />
      {/* door */}
      <Rect x="11" y="19.5" width="4" height="4.5" rx="0.5" fill={s} />
    </Svg>
  );
}

function IconSingleBuilding({ active }: { active: boolean }) {
  const s = active ? Colors.white : Colors.ink;
  return (
    <Svg width={22} height={22} viewBox="0 0 28 28">
      {/* flat roof overhang */}
      <Rect x="3" y="9" width="22" height="3" rx="1" fill={active ? 'rgba(255,255,255,0.35)' : Colors.green} stroke={s} strokeWidth="1.8" />
      {/* columns */}
      <Rect x="6" y="12" width="2.5" height="12" rx="0.5" fill={active ? 'rgba(255,255,255,0.25)' : Colors.white} stroke={s} strokeWidth="1.5" />
      <Rect x="12.75" y="12" width="2.5" height="12" rx="0.5" fill={active ? 'rgba(255,255,255,0.25)' : Colors.white} stroke={s} strokeWidth="1.5" />
      <Rect x="19.5" y="12" width="2.5" height="12" rx="0.5" fill={active ? 'rgba(255,255,255,0.25)' : Colors.white} stroke={s} strokeWidth="1.5" />
      {/* base step */}
      <Rect x="3" y="22" width="22" height="2.5" rx="0.5" fill={active ? 'rgba(255,255,255,0.35)' : Colors.green} stroke={s} strokeWidth="1.8" />
    </Svg>
  );
}

type PropTypeOption = {
  value: PropertyType;
  label: string;
  Icon: React.ComponentType<{ active: boolean }>;
};

const PROPERTY_TYPES: PropTypeOption[] = [
  { value: 'estate', label: 'Estate', Icon: IconEstate },
  { value: 'compound', label: 'Compound', Icon: IconCompound },
  { value: 'block', label: 'Block', Icon: IconBlock },
  { value: 'single_building', label: 'Single building', Icon: IconSingleBuilding },
];

function ChevronDown() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9l6 6 6-6" stroke={Colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function PropertySetupScreen({ route }: Props) {
  const { email, firstName, lastName, whatsappNumber, role } = route.params;
  const [propertyType, setPropertyType] = useState<PropertyType | null>(null);
  const [typeError, setTypeError] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [stateError, setStateError] = useState('');
  const [stateModalOpen, setStateModalOpen] = useState(false);
  const [households, setHouseholds] = useState<Household[]>([{ name: '', floorOrBlock: '' }]);
  const [householdErrors, setHouseholdErrors] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const setAuth = useAuthStore((s) => s.setAuth);

  const updateHousehold = (index: number, field: keyof Household, value: string) => {
    setHouseholds((prev) => prev.map((h, i) => i === index ? { ...h, [field]: value } : h));
    if (field === 'name') {
      setHouseholdErrors((prev) => prev.map((e, i) => i === index ? '' : e));
    }
  };

  const addHousehold = () => {
    setHouseholds((prev) => [...prev, { name: '', floorOrBlock: '' }]);
    setHouseholdErrors((prev) => [...prev, '']);
  };

  const removeHousehold = (index: number) => {
    setHouseholds((prev) => prev.filter((_, i) => i !== index));
    setHouseholdErrors((prev) => prev.filter((_, i) => i !== index));
  };

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    let valid = true;
    if (!propertyType) { setTypeError('Choose a property type'); valid = false; }
    if (!selectedState) { setStateError('Select a state'); valid = false; }
    const hErrs = households.map((h) => h.name.trim() ? '' : 'Enter a unit name');
    setHouseholdErrors(hErrs);
    if (hErrs.some(Boolean)) valid = false;
    if (!valid) return;

    setTypeError('');
    setStateError('');
    setApiError('');
    setLoading(true);
    try {
      const res = await api.post<{ user: any; accessToken: string; refreshToken: string }>(
        '/auth/complete-onboarding',
        {
          email, firstName, lastName, whatsappNumber, role,
          property: {
            name: data.propertyName,
            address: data.address,
            state: selectedState,
            city: data.city,
            type: propertyType,
            households: households.map((h) => ({
              name: h.name.trim(),
              floorOrBlock: h.floorOrBlock.trim() || undefined,
            })),
          },
        }
      );
      setAuth(res.user, res.accessToken, res.refreshToken);
    } catch (e: any) {
      setApiError(e.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthHeader backgroundColor={Colors.mint} />

        <Text style={styles.heading}>Set up your property</Text>
        <Text style={styles.subtitle}>Tell us about the place you manage.</Text>

        {/* ── Property fields ───────────────────────────────────────── */}
        <View style={styles.section}>
          <Controller control={control} name="propertyName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput label="Property name" placeholder="Adaeze Court" autoCapitalize="words"
                value={value} onChangeText={onChange} onBlur={onBlur} error={errors.propertyName?.message} />
            )}
          />
          <Controller control={control} name="address"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput label="Address" placeholder="12 Bode Thomas Street"
                value={value} onChangeText={onChange} onBlur={onBlur} error={errors.address?.message} />
            )}
          />

          {/* State picker */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldInputLabel}>State</Text>
            <TouchableOpacity
              style={[styles.pickerRow, stateError ? styles.pickerRowError : null]}
              activeOpacity={0.75}
              onPress={() => setStateModalOpen(true)}
            >
              <Text style={[styles.pickerText, !selectedState && styles.pickerPlaceholder]}>
                {selectedState || 'Select state'}
              </Text>
              <ChevronDown />
            </TouchableOpacity>
            {stateError ? <Text style={styles.fieldError}>{stateError}</Text> : null}
          </View>

          <Controller control={control} name="city"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput label="City" placeholder="Lagos" autoCapitalize="words"
                value={value} onChangeText={onChange} onBlur={onBlur} error={errors.city?.message} />
            )}
          />

          {/* Property type */}
          <Text style={styles.fieldLabel}>Property type</Text>
          <View style={styles.typeGrid}>
            {PROPERTY_TYPES.map(({ value, label, Icon }) => {
              const active = propertyType === value;
              return (
                <TouchableOpacity
                  key={value}
                  style={[styles.typeChip, active && styles.typeChipActive]}
                  activeOpacity={0.75}
                  onPress={() => { setPropertyType(value); setTypeError(''); }}
                >
                  <Icon active={active} />
                  <Text style={[styles.typeLabel, active && styles.typeLabelActive]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {typeError ? <Text style={styles.fieldError}>{typeError}</Text> : null}
        </View>

        {/* ── Households ────────────────────────────────────────────── */}
        <View style={styles.section}>
          {households.map((h, idx) => (
            <View key={idx} style={styles.householdBlock}>
              {idx > 0 && (
                <View style={styles.householdHeader}>
                  <Text style={styles.householdNum}>Household {idx + 1}</Text>
                  <TouchableOpacity onPress={() => removeHousehold(idx)} hitSlop={8}>
                    <Text style={styles.removeLink}>Remove</Text>
                  </TouchableOpacity>
                </View>
              )}
              <TextInput label="Unit name" placeholder="e.g. Flat 4B" autoCapitalize="characters"
                value={h.name} onChangeText={(v) => updateHousehold(idx, 'name', v)} error={householdErrors[idx]} />
              <TextInput label="Floor or block (optional)" placeholder="e.g. Block C, 2nd floor" autoCapitalize="words"
                value={h.floorOrBlock} onChangeText={(v) => updateHousehold(idx, 'floorOrBlock', v)} />
            </View>
          ))}
          <TouchableOpacity style={styles.addHouseholdBtn} onPress={addHousehold} activeOpacity={0.7}>
            <Text style={styles.addHouseholdText}>+ Add another household</Text>
          </TouchableOpacity>
        </View>

        {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}

        <Button label="Set up my compound" onPress={handleSubmit(onSubmit)} loading={loading} style={styles.submitBtn} />
      </ScrollView>

      {/* ── State picker modal ────────────────────────────────────── */}
      <Modal visible={stateModalOpen} animationType="slide" transparent onRequestClose={() => setStateModalOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setStateModalOpen(false)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Select state</Text>
          <FlatList
            data={NIGERIAN_STATES}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.stateRow}
                activeOpacity={0.7}
                onPress={() => { setSelectedState(item); setStateError(''); setStateModalOpen(false); }}
              >
                <Text style={[styles.stateText, selectedState === item && styles.stateTextActive]}>{item}</Text>
                {selectedState === item && (
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path d="M5 12l5 5L20 7" stroke={Colors.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                )}
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.stateDivider} />}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.mint },
  content: { paddingHorizontal: Layout.screenPadding, paddingBottom: 40, flexGrow: 1 },
  heading: { ...Typography.h2, color: Colors.ink, marginBottom: 8 },
  subtitle: { ...Typography.body, color: Colors.textSecondary, marginBottom: 28 },
  section: { marginBottom: 16, gap: 4 },

  fieldWrap: { marginBottom: 4 },
  fieldInputLabel: { ...Typography.body, fontFamily: 'DMSans_700Bold', color: Colors.ink, marginBottom: 6 },
  pickerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.white, borderRadius: Radius.cardSm,
    borderWidth: 1.5, borderColor: Colors.line, paddingHorizontal: 14, minHeight: 52,
  },
  pickerRowError: { borderColor: Colors.error },
  pickerText: { ...Typography.body, color: Colors.ink },
  pickerPlaceholder: { color: Colors.textMuted },

  fieldLabel: { ...Typography.body, fontFamily: 'DMSans_700Bold', color: Colors.ink, marginTop: 8, marginBottom: 8 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: Radius.chip, borderWidth: 1.5,
    borderColor: Colors.line, backgroundColor: Colors.surfaceCard,
  },
  typeChipActive: { borderColor: Colors.ink, backgroundColor: Colors.ink },
  typeLabel: { ...Typography.body, color: Colors.textSecondary },
  typeLabelActive: { color: Colors.white, fontFamily: 'DMSans_700Bold' },

  fieldError: { ...Typography.caption, color: Colors.error, marginTop: 4 },
  apiError: { ...Typography.caption, color: Colors.error, textAlign: 'center', marginBottom: 12 },
  submitBtn: { marginTop: 8 },

  householdBlock: { marginBottom: 8 },
  householdHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  householdNum: { ...Typography.caption, fontFamily: 'DMSans_700Bold', color: Colors.textSecondary },
  removeLink: { ...Typography.caption, color: Colors.error },
  addHouseholdBtn: { marginTop: 4, alignSelf: 'flex-start' },
  addHouseholdText: { ...Typography.body, color: Colors.ink, fontFamily: 'DMSans_700Bold' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(12,24,34,0.4)' },
  modalSheet: {
    backgroundColor: Colors.screen,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 12, paddingHorizontal: Layout.screenPadding,
    paddingBottom: 40, maxHeight: '70%',
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.line, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { ...Typography.title, color: Colors.ink, marginBottom: 12 },
  stateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  stateText: { ...Typography.body, color: Colors.ink },
  stateTextActive: { fontFamily: 'DMSans_700Bold' },
  stateDivider: { height: 1, backgroundColor: Colors.line },
});
