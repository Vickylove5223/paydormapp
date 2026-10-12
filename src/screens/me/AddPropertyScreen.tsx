import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { Colors, Typography, Layout, Radius, Spacing } from '@/theme';
import { api } from '@/api/client';
import { PropertyType } from '@/types';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { TextInput } from '@/components/common/TextInput';
import { Button } from '@/components/common/Button';
import { NIGERIAN_STATES } from '@/constants/states';

const PROPERTY_TYPES: { id: PropertyType; label: string; emoji: string }[] = [
  { id: 'estate', label: 'Estate', emoji: '🏘️' },
  { id: 'compound', label: 'Compound', emoji: '🏚️' },
  { id: 'block', label: 'Block', emoji: '🏢' },
  { id: 'building', label: 'Building', emoji: '🏠' },
];

function ChevronDown() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9l6 6 6-6" stroke={Colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const schema = z.object({
  name: z.string().min(2, 'Enter the property name'),
  address: z.string().min(5, 'Enter the full address'),
  state: z.string().min(1, 'Select a state'),
  city: z.string().min(2, 'Enter the city'),
});

type FormData = z.infer<typeof schema>;

export function AddPropertyScreen() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [propertyType, setPropertyType] = useState<PropertyType>('compound');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stateModalOpen, setStateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const selectedState = watch('state');

  const filteredStates = NIGERIAN_STATES.filter((s) =>
    s.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        {/* State selection */}
        <Controller
          control={control}
          name="state"
          render={({ field: { value } }) => (
            <View style={styles.stateWrapper}>
              <Text style={styles.fieldLabel}>State</Text>
              <TouchableOpacity
                style={[styles.pickerRow, errors.state ? styles.pickerRowError : null]}
                activeOpacity={0.75}
                onPress={() => {
                  setSearchQuery('');
                  setStateModalOpen(true);
                }}
              >
                <Text style={[styles.pickerText, !value && styles.pickerPlaceholder]}>
                  {value || 'Select state'}
                </Text>
                <ChevronDown />
              </TouchableOpacity>
              {errors.state?.message ? (
                <Text style={styles.fieldError}>{errors.state.message}</Text>
              ) : null}
            </View>
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

      {/* State Picker Modal */}
      <Modal
        visible={stateModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setStateModalOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setStateModalOpen(false)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeaderRow}>
            <Text style={styles.modalTitle}>Select state</Text>
            <TouchableOpacity onPress={() => setStateModalOpen(false)} hitSlop={8}>
              <Text style={styles.modalCloseText}>Done</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Search state..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchContainer}
          />

          <FlatList
            data={filteredStates}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected = selectedState === item;
              return (
                <TouchableOpacity
                  style={styles.stateRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    setValue('state', item, { shouldValidate: true });
                    setStateModalOpen(false);
                  }}
                >
                  <Text style={[styles.stateText, isSelected && styles.stateTextActive]}>
                    {item}
                  </Text>
                  {isSelected && (
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M5 12l5 5L20 7"
                        stroke={Colors.green}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  )}
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => <View style={styles.stateDivider} />}
          />
        </View>
      </Modal>
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
  stateWrapper: {
    marginBottom: Spacing.base,
  },
  fieldLabel: {
    ...Typography.label,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: Radius.cardSm,
    borderWidth: 1.5,
    borderColor: Colors.line,
    paddingHorizontal: 16,
    minHeight: 54,
  },
  pickerRowError: {
    borderColor: Colors.overdue,
  },
  pickerText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  pickerPlaceholder: {
    color: Colors.textMuted,
  },
  fieldError: {
    ...Typography.caption,
    color: Colors.overdue,
    marginTop: 4,
  },
  error: { ...Typography.caption, color: Colors.overdue, marginBottom: 8 },
  searchContainer: {
    marginBottom: 8,
  },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(12,24,34,0.4)' },
  modalSheet: {
    backgroundColor: Colors.screen,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: 40,
    maxHeight: '75%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.line,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: { ...Typography.title, color: Colors.ink },
  modalCloseText: { ...Typography.body, fontFamily: 'DMSans_700Bold', color: Colors.ink },
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  stateText: { ...Typography.body, color: Colors.ink },
  stateTextActive: { fontFamily: 'DMSans_700Bold' },
  stateDivider: { height: 1, backgroundColor: Colors.line },
});
