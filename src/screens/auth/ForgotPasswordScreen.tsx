import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput as RNTextInput,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthStackParams } from '@/navigation/types';
import { Colors, Typography, Layout } from '@/theme';
import { AuthHeader } from '@/components/common/AuthHeader';
import { TextInput } from '@/components/common/TextInput';
import { Button } from '@/components/common/Button';
import { EyeIcon } from '@/components/icons/EyeIcon';

type Props = NativeStackScreenProps<AuthStackParams, 'ForgotPassword'>;

type Step = 'email' | 'otp' | 'newPassword';

const emailSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});
const newPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type EmailForm = z.infer<typeof emailSchema>;
type NewPasswordForm = z.infer<typeof newPasswordSchema>;

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

function RefreshIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M1 4v6h6M23 20v-6h-6" stroke={Colors.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke={Colors.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ClockIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={Colors.textMuted} strokeWidth="2" />
      <Path d="M12 6v6l4 2" stroke={Colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ForgotPasswordScreen({ navigation }: Props) {
  const [step, setStep] = useState<Step>('email');
  const [sentEmail, setSentEmail] = useState('');
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [otpError, setOtpError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(RNTextInput | null)[]>([]);

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
  const passwordForm = useForm<NewPasswordForm>({ resolver: zodResolver(newPasswordSchema) });

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const onSendOtp = async (data: EmailForm) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSentEmail(data.email);
    setStep('otp');
    setCountdown(RESEND_COOLDOWN);
  };

  const onVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      setOtpError('Enter the 6-digit code from your email');
      return;
    }
    setOtpError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setStep('newPassword');
  };

  const onSetPassword = async (_data: NewPasswordForm) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    navigation.navigate('SignIn');
  };

  const handleOtpChange = (val: string, idx: number) => {
    const digit = val.replace(/[^0-9]/g, '').slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < OTP_LENGTH - 1) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (countdown > 0) return;
    emailForm.handleSubmit(onSendOtp)({ email: sentEmail } as any);
  };

  const handleBack = () => {
    if (step === 'otp') { setStep('email'); setOtp(Array(OTP_LENGTH).fill('')); setOtpError(''); }
    else if (step === 'newPassword') { setStep('otp'); }
    else { navigation.goBack(); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AuthHeader backgroundColor={Colors.mint} onBack={handleBack} />

        {step === 'email' && (
          <>
            <Text style={styles.heading}>Forgot password?</Text>
            <Text style={styles.subtext}>
              Enter your email and we'll send you a reset code.
            </Text>
            <Controller
              control={emailForm.control}
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
                  error={emailForm.formState.errors.email?.message}
                />
              )}
            />
            <Button
              label="Send reset code"
              onPress={emailForm.handleSubmit(onSendOtp)}
              loading={loading}
              style={styles.btn}
            />
          </>
        )}

        {step === 'otp' && (
          <>
            <Text style={styles.heading}>Enter the code</Text>
            <Text style={styles.subtext}>
              We sent a 6-digit code to{' '}
              <Text style={styles.emailHighlight}>{sentEmail}</Text>
            </Text>

            <View style={styles.otpRow}>
              {otp.map((digit, idx) => (
                <RNTextInput
                  key={idx}
                  ref={(r) => { otpRefs.current[idx] = r; }}
                  style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                  value={digit}
                  onChangeText={(v) => handleOtpChange(v, idx)}
                  onKeyPress={(e) => handleOtpKeyPress(e, idx)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

            <Button
              label="Verify code"
              variant="accent"
              onPress={onVerifyOtp}
              loading={loading}
              disabled={otp.some((d) => !d)}
              style={styles.btn}
            />

            <TouchableOpacity
              onPress={handleResend}
              disabled={countdown > 0}
              style={styles.resend}
              activeOpacity={0.7}
            >
              {countdown > 0 ? (
                <View style={styles.resendRow}>
                  <ClockIcon />
                  <Text style={styles.resendCountdown}>Resend in {countdown}s</Text>
                </View>
              ) : (
                <View style={styles.resendRow}>
                  <RefreshIcon />
                  <Text style={styles.resendLink}>Resend code</Text>
                </View>
              )}
            </TouchableOpacity>
          </>
        )}

        {step === 'newPassword' && (
          <>
            <Text style={styles.heading}>Set new password</Text>
            <Text style={styles.subtext}>
              Choose a strong password for your account.
            </Text>

            <Controller
              control={passwordForm.control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="New password"
                  placeholder="At least 8 characters"
                  secureTextEntry={!showPassword}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={passwordForm.formState.errors.password?.message}
                  rightIcon={<EyeIcon visible={showPassword} size={20} />}
                  onRightIconPress={() => setShowPassword((v) => !v)}
                />
              )}
            />

            <Controller
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Confirm password"
                  placeholder="Re-enter your password"
                  secureTextEntry={!showConfirm}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={passwordForm.formState.errors.confirmPassword?.message}
                  rightIcon={<EyeIcon visible={showConfirm} size={20} />}
                  onRightIconPress={() => setShowConfirm((v) => !v)}
                />
              )}
            />

            <Button
              label="Set new password"
              onPress={passwordForm.handleSubmit(onSetPassword)}
              loading={loading}
              style={styles.btn}
            />
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.mint },
  content: { paddingHorizontal: Layout.screenPadding, paddingBottom: Layout.screenPadding, flexGrow: 1 },
  heading: { ...Typography.h2, color: Colors.ink, marginBottom: 6 },
  subtext: { ...Typography.body, color: Colors.textSecondary, marginBottom: 28 },
  emailHighlight: { color: Colors.ink, fontFamily: 'DMSans_700Bold' },
  btn: { marginTop: 8 },
  errorText: { ...Typography.caption, color: Colors.error, marginBottom: 12 },
  otpRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    alignSelf: 'stretch',
  },
  otpBox: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    height: 56,
    borderWidth: 1.5,
    borderColor: Colors.ink,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'DMSans_700Bold',
    color: Colors.ink,
    backgroundColor: Colors.white,
    outlineStyle: 'none',
  } as any,
  otpBoxFilled: {
    borderColor: Colors.ink,
    backgroundColor: Colors.white,
  },
  resend: {
    alignSelf: 'center',
    padding: 8,
    marginTop: 12,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resendCountdown: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  resendLink: {
    ...Typography.body,
    color: Colors.ink,
    fontFamily: 'Syne_800ExtraBold',
  },
});
