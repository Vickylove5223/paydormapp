import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParams } from '@/navigation/types';
import { Colors, Typography, Layout, Radius } from '@/theme';
import { Button } from '@/components/common/Button';
import { AuthHeader } from '@/components/common/AuthHeader';
import { LockoMascot } from '@/components/icons/LockoMascot';
import { api } from '@/api/client';

type Props = NativeStackScreenProps<AuthStackParams, 'VerifyEmail'>;

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 30;

function RefreshIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M1 4v6h6M23 20v-6h-6"
        stroke={Colors.ink}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"
        stroke={Colors.ink}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ClockIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={Colors.textMuted} strokeWidth="2" />
      <Path
        d="M12 6v6l4 2"
        stroke={Colors.textMuted}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function VerifyEmailScreen({ route, navigation }: Props) {
  const { email } = route.params;
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const inputs = useRef<TextInput[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (text: string, index: number) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 1);
    const newCode = [...code];
    newCode[index] = cleaned;
    setCode(newCode);

    if (cleaned && index < CODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }

    if (newCode.every((c) => c) && newCode.length === CODE_LENGTH) {
      submitCode(newCode.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const submitCode = async (fullCode: string) => {
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/verify-email', { email, code: fullCode });
      navigation.navigate('PersonalDetails', { email });
    } catch (e: any) {
      setError(e.message ?? 'Invalid code. Try again.');
      setCode(Array(CODE_LENGTH).fill(''));
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    await api.post('/auth/resend-code', { email });
    setCountdown(RESEND_COOLDOWN);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthHeader backgroundColor={Colors.mint} />
        <View style={styles.content}>
          <View style={styles.mascotWrap}>
            <LockoMascot width={90} height={108} />
          </View>
          <Text style={styles.heading}>Check your inbox</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.email}>{email}</Text>
          </Text>

          <View style={styles.codeRow}>
            {code.map((digit, i) => (
              <TextInput
                key={i}
                ref={(r) => { if (r) inputs.current[i] = r; }}
                style={[styles.codeBox, digit && styles.codeBoxFilled]}
                value={digit}
                onChangeText={(t) => handleChange(t, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                accessibilityLabel={`Digit ${i + 1}`}
              />
            ))}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            label="Verify"
            variant="accent"
            onPress={() => submitCode(code.join(''))}
            loading={loading}
            disabled={code.some((c) => !c)}
            style={styles.verifyBtn}
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.mint },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Layout.screenPadding,
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  mascotWrap: { marginBottom: 20 },
  heading: {
    ...Typography.h2,
    color: Colors.ink,
    marginBottom: 12,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 40,
    lineHeight: 24,
  },
  email: {
    color: Colors.ink,
    fontFamily: 'DMSans_700Bold',
  },
  codeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
    alignSelf: 'stretch',
  },
  codeBox: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    height: 58,
    borderWidth: 1.5,
    borderColor: Colors.ink,
    borderRadius: Radius.cardSm,
    textAlign: 'center',
    fontSize: 24,
    fontFamily: 'Syne_800ExtraBold',
    color: Colors.ink,
    backgroundColor: Colors.white,
    outlineStyle: 'none',
  } as any,
  codeBoxFilled: {
    borderColor: Colors.ink,
    backgroundColor: Colors.mint,
  },
  error: {
    ...Typography.caption,
    color: Colors.error,
    marginBottom: 16,
  },
  verifyBtn: {
    width: '100%',
    marginBottom: 20,
  },
  resend: {
    alignSelf: 'center',
    padding: 8,
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
