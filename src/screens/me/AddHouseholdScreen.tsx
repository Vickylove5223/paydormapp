import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MeStackParams } from '@/navigation/types';
import { Colors, Typography, Layout } from '@/theme';
import { api } from '@/api/client';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { TextInput } from '@/components/common/TextInput';
import { Button } from '@/components/common/Button';

type Props = NativeStackScreenProps<MeStackParams, 'AddHousehold'>;

const schema = z.object({
  name: z.string().min(2, 'Enter the unit name'),
  floorOrBlock: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function AddHouseholdScreen({ route }: Props) {
  const { propertyId } = route.params;
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    setLoading(true);
    try {
      await api.post(`/properties/${propertyId}/households`, data);
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      navigation.navigate('Properties');
    } catch (e: any) {
      setError(e.message ?? 'Could not add household.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Add household" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Add the first household</Text>
        <Text style={styles.subtitle}>A household is a flat or unit within the property.</Text>

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Unit name"
              placeholder="e.g. Flat 4B or Ground floor"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="floorOrBlock"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Floor or block (optional)"
              placeholder="e.g. Block A, 2nd floor"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button label="Save household" onPress={handleSubmit(onSubmit)} loading={loading} />
        <Button
          label="Skip for now"
          onPress={() => navigation.navigate('Properties')}
          variant="ghost"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  content: { padding: Layout.screenPadding, paddingTop: 24, gap: 4 },
  heading: { ...Typography.h2, color: Colors.ink, marginBottom: 8 },
  subtitle: { ...Typography.body, color: Colors.textSecondary, marginBottom: 24 },
  error: { ...Typography.caption, color: Colors.overdue, marginBottom: 8 },
});
