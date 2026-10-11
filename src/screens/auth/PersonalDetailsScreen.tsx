import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthStackParams } from '@/navigation/types';
import { Colors, Typography, Layout } from '@/theme';
import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/TextInput';
import { AuthHeader } from '@/components/common/AuthHeader';

type Props = NativeStackScreenProps<AuthStackParams, 'PersonalDetails'>;

const schema = z.object({
  firstName: z.string().min(2, 'Enter your first name'),
  lastName: z.string().min(2, 'Enter your last name'),
  whatsappNumber: z
    .string()
    .regex(/^(\+234|0)[789]\d{9}$/, 'Enter a valid Nigerian mobile number'),
});

type FormData = z.infer<typeof schema>;

export function PersonalDetailsScreen({ route, navigation }: Props) {
  const { email } = route.params;
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    navigation.navigate('RoleProperty', {
      email,
      firstName: data.firstName,
      lastName: data.lastName,
      whatsappNumber: data.whatsappNumber,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeader backgroundColor={Colors.mint} />
        <Text style={styles.heading}>Tell us about yourself</Text>
        <Text style={styles.subtitle}>
          This is how your housemates will see you.
        </Text>

        <View style={styles.form}>
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="First name"
                placeholder="Chukwuemeka"
                autoCapitalize="words"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.firstName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Last name"
                placeholder="Okafor"
                autoCapitalize="words"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.lastName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="whatsappNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="WhatsApp number"
                placeholder="080 0000 0000"
                keyboardType="phone-pad"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.whatsappNumber?.message}
              />
            )}
          />

          <Text style={styles.hint}>
            Your WhatsApp number is used to send receipts and alerts.
          </Text>

          <Button
            label="Continue"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.mint },
  content: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Layout.screenPadding,
    flexGrow: 1,
  },
  heading: {
    ...Typography.h2,
    color: Colors.ink,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  form: { flex: 1 },
  hint: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 24,
    marginTop: -8,
  },
  submitBtn: { marginTop: 8 },
});
