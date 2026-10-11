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

const BILL_TYPES: { id: BillType; label: string }[] = [
  { id: 'electricity', label: 'Electricity' },
  { id: 'water', label: 'Water' },
  { id: 'service_charge', label: 'Service charge' },
  { id: 'security', label: 'Security' },
  { id: 'waste', label: 'Waste' },
  { id: 'internet', label: 'Internet' },
  { id: 'private', label: 'Private' },
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
  const [billType, setBillType] = useState<BillType>(isPrivate ? 'private' : 'electricity');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={billId ? 'Edit bill' : isPrivate ? 'Add private bill' : 'Add bill'} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Type picker */}
        {!isPrivate && (
          <>
            <Text style={styles.label}>Bill type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={styles.typeRow}>
                {BILL_TYPES.filter((t) => t.id !== 'private').map((t) => (
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
