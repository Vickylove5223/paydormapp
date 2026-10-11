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
import { Colors, Typography, Layout } from '@/theme';
import { useAuthStore } from '@/store/auth';
import { api } from '@/api/client';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { TextInput } from '@/components/common/TextInput';
import { Button } from '@/components/common/Button';

export function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      whatsappNumber: user?.whatsappNumber ?? '',
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const updated = await api.patch<typeof user>('/me', data);
      updateUser(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : 'U';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Profile" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View>
            <Text style={styles.residentLabel}>Resident ID</Text>
            <Text style={styles.residentId}>{user?.residentId ?? '—'}</Text>
          </View>
        </View>

        <Controller
          control={control}
          name="firstName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="First name" value={value} onChangeText={onChange} onBlur={onBlur} />
          )}
        />
        <Controller
          control={control}
          name="lastName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Last name" value={value} onChangeText={onChange} onBlur={onBlur} />
          )}
        />
        <Controller
          control={control}
          name="whatsappNumber"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="WhatsApp number" value={value} onChangeText={onChange} onBlur={onBlur} keyboardType="phone-pad" />
          )}
        />

        <Text style={styles.emailNote}>Email: {user?.email}</Text>

        <Button
          label={saved ? 'Saved ✓' : 'Save changes'}
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          variant={saved ? 'accent' : 'primary'}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.screen },
  content: {
    padding: Layout.screenPadding,
    paddingTop: 24,
    gap: 4,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 28,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.mint,
    borderWidth: 2.5,
    borderColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...Typography.h2, color: Colors.ink, fontSize: 22 },
  residentLabel: { ...Typography.caption, color: Colors.textMuted },
  residentId: { ...Typography.label, color: Colors.ink },
  emailNote: { ...Typography.caption, color: Colors.textMuted, marginBottom: 20, marginTop: -4 },
});
