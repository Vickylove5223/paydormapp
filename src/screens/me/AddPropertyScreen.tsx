import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { Colors, Typography, Layout, Radius } from '@/theme';
import { api } from '@/api/client';
import { PropertyType } from '@/types';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { TextInput } from '@/components/common/TextInput';
import { Button } from '@/components/common/Button';

const PROPERTY_TYPES: { id: PropertyType; label: string; emoji: string }[] = [
  { id: 'estate', label: 'Estate', emoji: '🏘️' },
  { id: 'compound', label: 'Compound', emoji: '🏚️' },
  { id: 'block', label: 'Block', emoji: '🏢' },
  { id: 'building', label: 'Building', emoji: '🏠' },
];

const schema = z.object({
  name: z.string().min(2, 'Enter the property name'),
  address: z.string().min(5, 'Enter the full address'),
  city: z.string().min(2, 'Enter the city'),
});

type FormData = z.infer<typeof schema>;

export function AddPropertyScreen() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [propertyType, setPropertyType] = useState<PropertyType>('compound');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    setLoading(true);
    try {
      const property = await api.post<{ id: string }>('/properties', {
        ...data,
        type: propertyType,
      });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      navigation.navigate('AddHousehold', { propertyId: property.id });
    } catch (e: any) {
      setError(e.message ?? 'Could not create property.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Add property" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Tell us about the property</Text>

        <Text style={styles.typeLabel}>Property type</Text>
        <View style={styles.typeRow}>
          {PROPERTY_TYPES.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.typeCard, propertyType === t.id && styles.typeCardSelected]}
              onPress={() => setPropertyType(t.id)}
              activeOpacity={0.75}
            >
              <Text style={styles.typeEmoji}>{t.emoji}</Text>
              <Text style={styles.typeText}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Property name"
              placeholder="e.g. Lekki Gardens Estate"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="address"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Address"
              placeholder="Street address"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.address?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="city"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="City"
              placeholder="Lagos"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.city?.message}
            />
          )}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button label="Continue to add household" onPress={handleSubmit(onSubmit)} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  content: { padding: Layout.screenPadding, paddingTop: 24, gap: 4 },
  heading: { ...Typography.h2, color: Colors.ink, marginBottom: 20 },
  typeLabel: { ...Typography.label, color: Colors.ink, marginBottom: 8 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: Colors.line,
    backgroundColor: Colors.white,
  },
  typeCardSelected: { borderColor: Colors.ink, backgroundColor: Colors.mint },
  typeEmoji: { fontSize: 16 },
  typeText: { ...Typography.captionSmall, color: Colors.ink, fontFamily: 'Syne_800ExtraBold' },
  error: { ...Typography.caption, color: Colors.overdue, marginBottom: 8 },
});
