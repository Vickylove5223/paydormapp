import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthStackParams } from '@/navigation/types';
import { Colors, Typography, Spacing, Layout } from '@/theme';
import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/TextInput';
import { AuthHeader } from '@/components/common/AuthHeader';
import { EyeIcon } from '@/components/icons/EyeIcon';
import { FlexMascot } from '@/components/icons/FlexMascot';
import { api } from '@/api/client';

type Props = NativeStackScreenProps<AuthStackParams, 'SignUp'>;

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[0-9]/, 'Must include a number'),
});

type FormData = z.infer<typeof schema>;

export function SignUpScreen({ navigation }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setApiError('');
    setLoading(true);
    try {
      await api.post('/auth/signup', { email: data.email, password: data.password });
      navigation.navigate('VerifyEmail', { email: data.email });
    } catch (e: any) {
      setApiError(e.message ?? 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeader backgroundColor={Colors.mint} />
        <View style={styles.mascotWrap}>
          <FlexMascot width={80} height={96} />
        </View>
        <Text style={styles.heading}>Sign up with your email</Text>
        <Text style={styles.subtext}>Join your compound and split bills with ease.</Text>

        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Email address"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Password"
                placeholder="At least 8 characters"
                secureTextEntry={!showPassword}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                rightIcon={
                  <EyeIcon visible={showPassword} size={20} />
                }
                onRightIconPress={() => setShowPassword((v) => !v)}
              />
            )}
          />

          {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}

          <Button
            label="Continue"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            style={styles.submitBtn}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
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
  mascotWrap: { marginTop: 16, marginBottom: 12 },
  eyebrow: {
    ...Typography.captionSmall,
    color: Colors.green,
    fontFamily: 'Syne_800ExtraBold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heading: {
    ...Typography.h2,
    color: Colors.ink,
    marginBottom: 6,
  },
  subtext: { ...Typography.body, color: Colors.textSecondary, marginBottom: 28 },
  form: {
    flex: 1,
  },
  showHide: {
    ...Typography.captionSmall,
    color: Colors.textSecondary,
    fontFamily: 'Syne_800ExtraBold',
  },
  apiError: {
    ...Typography.caption,
    color: Colors.error,
    marginBottom: 16,
  },
  submitBtn: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  footerText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  footerLink: {
    ...Typography.body,
    color: Colors.ink,
    fontFamily: 'Syne_800ExtraBold',
  },
});
