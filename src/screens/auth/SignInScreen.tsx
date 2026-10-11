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
import { Colors, Typography, Layout } from '@/theme';
import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/TextInput';
import { AuthHeader } from '@/components/common/AuthHeader';
import { EyeIcon } from '@/components/icons/EyeIcon';
import { FlexMascot } from '@/components/icons/FlexMascot';
import { useAuthStore } from '@/store/auth';
import { api } from '@/api/client';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
});

type FormData = z.infer<typeof schema>;
type Props = NativeStackScreenProps<AuthStackParams, 'SignIn'>;

export function SignInScreen({ navigation }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setApiError('');
    setLoading(true);
    try {
      const res = await api.post<{ user: any; accessToken: string; refreshToken: string }>(
        '/auth/login',
        data
      );
      setAuth(res.user, res.accessToken, res.refreshToken);
    } catch (e: any) {
      setApiError(e.message ?? 'Incorrect email or password');
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
        <AuthHeader backgroundColor={Colors.violet} />
        <View style={styles.mascotWrap}>
          <FlexMascot width={80} height={96} />
        </View>
        <Text style={styles.heading}>Welcome back</Text>
        <Text style={styles.subtext}>Sign in to manage your compound bills.</Text>

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
                placeholder="Your password"
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

          <TouchableOpacity style={styles.forgotRow} onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}

          <Button
            label="Sign in"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            style={styles.submitBtn}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.footerLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.violet },
  content: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Layout.screenPadding,
    flexGrow: 1,
  },
  mascotWrap: { marginTop: 16, marginBottom: 12 },
  heading: { ...Typography.h2, color: Colors.ink, marginBottom: 6 },
  subtext: { ...Typography.body, color: Colors.textSecondary, marginBottom: 28 },
  form: { flex: 1 },
  showHide: {
    ...Typography.captionSmall,
    color: Colors.textSecondary,
    fontFamily: 'Syne_800ExtraBold',
  },
  forgotRow: { alignSelf: 'flex-end', marginTop: -4, marginBottom: 24 },
  forgotText: { ...Typography.caption, color: Colors.ink, fontFamily: 'Syne_800ExtraBold' },
  apiError: { ...Typography.caption, color: Colors.error, marginBottom: 16 },
  submitBtn: { marginTop: 8 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  footerText: { ...Typography.body, color: Colors.textSecondary },
  footerLink: { ...Typography.body, color: Colors.ink, fontFamily: 'Syne_800ExtraBold' },
});
