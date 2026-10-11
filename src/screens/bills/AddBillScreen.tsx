import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

type BillScope = 'shared' | 'one_time' | 'private';

const MOCK_COPARTNERS = [
  { id: 'cp1', name: 'Chisom Obi', share: 50 },
  { id: 'cp2', name: 'Tunde Fashola', share: 50 },
  { id: 'cp3', name: 'Ngozi Eze', share: 0 },
];

const BILL_SCOPES: { id: BillScope; label: string; hint: string }[] = [
  { id: 'shared', label: 'Shared', hint: 'Split across all tenants' },
  { id: 'one_time', label: 'One-time', hint: 'Single charge, not recurring' },
  { id: 'private', label: 'Private', hint: 'One household only' },
];

const BILL_TYPES: { id: BillType; label: string }[] = [
  { id: 'electricity', label: 'Electricity' },
  { id: 'water', label: 'Water' },
  { id: 'service_charge', label: 'Service charge' },
  { id: 'security', label: 'Security' },
  { id: 'waste', label: 'Waste' },
  { id: 'internet', label: 'Internet' },
  { id: 'other', label: 'Other' },
];

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

export function AddBillScreen({ route }: Props) {
  const { billId, isPrivate } = route.params ?? {};
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [scope, setScope] = useState<BillScope>(isPrivate ? 'private' : 'shared');
  const [billType, setBillType] = useState<BillType>('electricity');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shareWithPartners, setShareWithPartners] = useState(false);
  const [selectedPartners, setSelectedPartners] = useState<Set<string>>(new Set(MOCK_COPARTNERS.map(c => c.id)));

  const togglePartner = (id: string) => {
    setSelectedPartners((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { lineItems: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'lineItems' });

  const onSubmit = async (data: FormData) => {
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...data,
        type: billType,
        totalAmount: Math.round(Number(data.totalAmount) * 100),
        lineItems: (data.lineItems ?? []).map((li) => ({
          description: li.description,
          amount: Math.round(Number(li.amount) * 100),
        })),
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

        {/* Scope picker — Shared / One-time / Private */}
        {!billId && (
          <>
            <Text style={styles.label}>Bill scope</Text>
            <View style={styles.scopeRow}>
              {BILL_SCOPES.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.scopeCard, scope === s.id && styles.scopeCardActive]}
                  onPress={() => setScope(s.id)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.scopeLabel, scope === s.id && styles.scopeLabelActive]}>{s.label}</Text>
                  <Text style={styles.scopeHint}>{s.hint}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Co-partner sharing — only for shared scope */}
        {scope === 'shared' && !billId && (
          <>
            <TouchableOpacity
              style={styles.coPartnerToggle}
              onPress={() => setShareWithPartners((v) => !v)}
              activeOpacity={0.8}
            >
              <View style={styles.coPartnerToggleLeft}>
                <Text style={styles.coPartnerToggleLabel}>Share with co-partners</Text>
                <Text style={styles.coPartnerToggleSub}>Split the cost with your co-partners</Text>
              </View>
              <View style={[styles.toggleDot, shareWithPartners && styles.toggleDotOn]}>
                <View style={[styles.toggleThumb, shareWithPartners && styles.toggleThumbOn]} />
              </View>
            </TouchableOpacity>
            {shareWithPartners && (
              <View style={styles.partnerList}>
                {MOCK_COPARTNERS.map((cp) => (
                  <TouchableOpacity
                    key={cp.id}
                    style={styles.partnerRow}
                    onPress={() => togglePartner(cp.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.partnerCheck, selectedPartners.has(cp.id) && styles.partnerCheckOn]}>
                      {selectedPartners.has(cp.id) && <Text style={styles.partnerCheckMark}>✓</Text>}
                    </View>
                    <View style={styles.partnerAvatar}>
                      <Text style={styles.partnerAvatarText}>{cp.name.charAt(0)}</Text>
                    </View>
                    <Text style={styles.partnerName}>{cp.name}</Text>
                    <Text style={styles.partnerShare}>{cp.share > 0 ? `${cp.share}%` : 'Equal'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        {/* Bill type chips — hidden for private scope */}
        {scope !== 'private' && (
          <>
            <Text style={styles.label}>Bill type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={styles.typeRow}>
                {BILL_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.typeChip, billType === t.id && styles.typeChipActive]}
                    onPress={() => setBillType(t.id)}
                    activeOpacity={0.75}
                  >
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
              placeholder="e.g. July EKEDC bill"
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
            <TextInput
              label="Due date"
              placeholder="YYYY-MM-DD"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.dueDate?.message}
            />
          )}
        />

        {/* Line items */}
        <View style={styles.lineSection}>
          <Text style={styles.label}>Line items (optional)</Text>
          {fields.map((field, index) => (
            <View key={field.id} style={styles.lineItemRow}>
              <Controller
                control={control}
                name={`lineItems.${index}.description`}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label=""
                    placeholder="Description"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    containerStyle={{ flex: 1 }}
                  />
                )}
              />
              <Controller
                control={control}
                name={`lineItems.${index}.amount`}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label=""
                    placeholder="₦"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="decimal-pad"
                    containerStyle={{ width: 80 }}
                  />
                )}
              />
              <TouchableOpacity onPress={() => remove(index)} style={styles.removeBtn}>
                <Text style={styles.removeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            onPress={() => append({ description: '', amount: '' })}
            style={styles.addLineBtn}
          >
            <Text style={styles.addLineBtnText}>+ Add line item</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          label={billId ? 'Save changes' : 'Create bill'}
          onPress={handleSubmit(onSubmit)}
          loading={loading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.screen },
  content: { padding: Layout.screenPadding, paddingTop: 24, paddingBottom: Layout.contentBottomPadding, gap: 4 },
  label: { ...Typography.label, color: Colors.ink, marginBottom: 8 },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: Colors.line,
    backgroundColor: Colors.white,
  },
  typeChipActive: { borderColor: Colors.ink, backgroundColor: Colors.mint },
  typeChipText: { ...Typography.captionSmall, color: Colors.textSecondary },
  typeChipTextActive: { color: Colors.ink, fontFamily: 'Syne_800ExtraBold' },
  scopeRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  scopeCard: {
    flex: 1, borderWidth: 1.5, borderColor: Colors.line,
    borderRadius: Radius.cardSm, padding: 10,
    backgroundColor: Colors.white, gap: 3,
  },
  scopeCardActive: { borderColor: Colors.ink, backgroundColor: Colors.mint },
  scopeLabel: { ...Typography.label, color: Colors.textSecondary, fontSize: 12 },
  scopeLabelActive: { color: Colors.ink },
  scopeHint: { ...Typography.captionSmall, color: Colors.textMuted, fontSize: 9 },
  coPartnerToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.white, borderRadius: Radius.cardSm,
    borderWidth: 1.5, borderColor: Colors.line, padding: 12, marginBottom: 4,
  },
  coPartnerToggleLeft: { flex: 1 },
  coPartnerToggleLabel: { ...Typography.label, color: Colors.ink, fontSize: 13 },
  coPartnerToggleSub: { ...Typography.caption, color: Colors.textSecondary, marginTop: 1 },
  toggleDot: {
    width: 40, height: 22, borderRadius: 11,
    backgroundColor: Colors.line, padding: 2, justifyContent: 'center',
  },
  toggleDotOn: { backgroundColor: Colors.green },
  toggleThumb: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.white, alignSelf: 'flex-start',
  },
  toggleThumbOn: { alignSelf: 'flex-end' },
  partnerList: {
    backgroundColor: Colors.white, borderRadius: Radius.cardSm,
    borderWidth: 1.5, borderColor: Colors.line, overflow: 'hidden', marginBottom: 8,
  },
  partnerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderBottomWidth: 1, borderBottomColor: Colors.line,
  },
  partnerCheck: {
    width: 20, height: 20, borderRadius: 4,
    borderWidth: 1.5, borderColor: Colors.line,
    alignItems: 'center', justifyContent: 'center',
  },
  partnerCheckOn: { backgroundColor: Colors.green, borderColor: Colors.ink },
  partnerCheckMark: { fontSize: 11, color: Colors.ink, fontFamily: 'Syne_800ExtraBold' },
  partnerAvatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.mint, borderWidth: 1.5, borderColor: Colors.ink,
    alignItems: 'center', justifyContent: 'center',
  },
  partnerAvatarText: { ...Typography.captionSmall, color: Colors.ink, fontFamily: 'Syne_800ExtraBold' },
  partnerName: { ...Typography.label, color: Colors.ink, flex: 1, fontSize: 13 },
  partnerShare: { ...Typography.caption, color: Colors.textSecondary },
  lineSection: { marginTop: 8, gap: 8 },
  lineItemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  removeBtn: { padding: 8 },
  removeBtnText: { fontSize: 16, color: Colors.overdue },
  addLineBtn: {
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  addLineBtnText: { ...Typography.caption, color: Colors.violet },
  error: { ...Typography.caption, color: Colors.overdue, marginBottom: 8 },
});
