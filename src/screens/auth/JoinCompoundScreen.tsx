import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput as RNTextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Svg, { Rect, Circle, Path, Ellipse, G } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParams } from '@/navigation/types';
import { Colors, Typography } from '@/theme';
import { AuthHeader } from '@/components/common/AuthHeader';
import { Button } from '@/components/common/Button';
import { api } from '@/api/client';
import { useAuthStore } from '@/store/auth';

const CODE_LENGTH = 6;

type Props = NativeStackScreenProps<AuthStackParams, 'JoinCompound'>;

interface PropertyPreview {
  propertyName: string;
  householdName: string;
  role: string;
  city: string;
}

function FlexMascot() {
  return (
    <Svg width={100} height={120} viewBox="14 26 92 100">
      {/* receipt on top */}
      <Rect x="44" y="26" width="32" height="22" rx="3" fill="#FFFFFF" stroke="#0C1822" strokeWidth="2" />
      <Path d="M52 34h16M52 40h16" stroke="#0C1822" strokeWidth="2" />
      {/* left arm */}
      <Path d="M30 66Q16 72 14 88" fill="none" stroke="#0C1822" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M30 66Q16 72 14 88" fill="none" stroke="#40CE86" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      {/* right arm — waving up */}
      <Path d="M90 66Q104 60 106 44" fill="none" stroke="#0C1822" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M90 66Q104 60 106 44" fill="none" stroke="#40CE86" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      {/* legs */}
      <Path d="M48 104V118" fill="none" stroke="#0C1822" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M48 104V118" fill="none" stroke="#40CE86" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M72 104V118" fill="none" stroke="#0C1822" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M72 104V118" fill="none" stroke="#40CE86" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      {/* feet */}
      <Ellipse cx="47" cy="121" rx="9" ry="5" fill="#40CE86" stroke="#0C1822" strokeWidth="2" />
      <Ellipse cx="73" cy="121" rx="9" ry="5" fill="#40CE86" stroke="#0C1822" strokeWidth="2" />
      {/* body */}
      <Rect x="30" y="42" width="60" height="62" rx="14" fill="#40CE86" stroke="#0C1822" strokeWidth="2.2" />
      {/* purple hat */}
      <Path d="M30 58a16 16 0 0 1 16-16H74a16 16 0 0 1 16 16Z" fill="#A98BFF" stroke="#0C1822" strokeWidth="2.2" />
      {/* ear badge */}
      <Rect x="80" y="70" width="18" height="13" rx="6.5" fill="#A98BFF" stroke="#0C1822" strokeWidth="2.2" />
      <Circle cx="89" cy="76.5" r="2" fill="#0C1822" />
      {/* eyes */}
      <Rect x="37" y="66" width="15" height="10" rx="2.5" fill="#0C1822" />
      <Rect x="58" y="66" width="15" height="10" rx="2.5" fill="#0C1822" />
      <Path d="M52 70H58" stroke="#0C1822" strokeWidth="2" />
      {/* smile */}
      <Path d="M46 88q9 8 18 0" fill="none" stroke="#0C1822" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* cheeks */}
      <Circle cx="38" cy="90" r="3.6" fill="#A98BFF" opacity={0.8} />
      <Circle cx="70" cy="90" r="3.6" fill="#A98BFF" opacity={0.8} />
    </Svg>
  );
}

function ChatBubbleLeft({ children, variant = 'white' }: { children: React.ReactNode; variant?: 'green' | 'white' }) {
  return (
    <View style={[styles.bubbleLeft, variant === 'green' ? styles.bubbleGreen : styles.bubbleWhite]}>
      {children}
    </View>
  );
}

function ChatBubbleRight({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bubbleRight}>
      {children}
    </View>
  );
}

export function JoinCompoundScreen({ route, navigation }: Props) {
  const initialCode = (route.params?.code ?? '').replace('-', '').toUpperCase().split('');
  const [chars, setChars] = useState<string[]>(
    Array(CODE_LENGTH).fill('').map((_, i) => initialCode[i] ?? '')
  );
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<PropertyPreview | null>(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const boxRefs = useRef<(RNTextInput | null)[]>([]);

  const code = chars.join('');
  const formattedCode = code;

  const handleCharChange = (val: string, idx: number) => {
    const char = val.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(-1);
    const next = [...chars];
    next[idx] = char;
    setChars(next);
    if (char && idx < CODE_LENGTH - 1) boxRefs.current[idx + 1]?.focus();
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !chars[idx] && idx > 0) {
      boxRefs.current[idx - 1]?.focus();
    }
  };

  const lookupCode = async () => {
    const full = formattedCode;
    if (full.replace('-', '').length < CODE_LENGTH) return;
    setError('');
    setLoading(true);
    try {
      const data = await api.post<PropertyPreview>('/properties/join/preview', { code: full });
      setPreview(data);
    } catch (e: any) {
      setError(e.message ?? 'Invalid code. Check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const confirmJoin = async () => {
    if (!preview) return;
    if (!isAuthenticated) {
      navigation.navigate('SignUp');
      return;
    }
    setJoining(true);
    try {
      await api.post('/properties/join', { code: formattedCode });
    } catch (e: any) {
      setError(e.message ?? 'Could not join. Try again.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthHeader backgroundColor={Colors.mint} onBack={() => navigation.goBack()} />

          {/* Mascot */}
          <View style={styles.mascotWrap}>
            <FlexMascot />
          </View>

          {/* Chat thread */}
          <View style={styles.thread}>
            <ChatBubbleLeft variant="green">
              <Text style={styles.bubbleGreenText}>Oya, who's this? 👀</Text>
            </ChatBubbleLeft>

            <ChatBubbleRight>
              <Text style={styles.bubbleRightText}>It's me!</Text>
            </ChatBubbleRight>

            <ChatBubbleLeft variant="green">
              <Text style={styles.bubbleGreenText}>Drop your house code to join your compound. 🔑</Text>
            </ChatBubbleLeft>

            {/* Preview result bubble */}
            {preview && (
              <ChatBubbleLeft variant="white">
                <Text style={styles.previewLabel}>You're joining:</Text>
                <Text style={styles.previewName}>{preview.propertyName}</Text>
                <Text style={styles.previewUnit}>{preview.householdName} · {preview.city}</Text>
                <View style={styles.rolePill}>
                  <Text style={styles.rolePillText}>{preview.role}</Text>
                </View>
              </ChatBubbleLeft>
            )}

            {error ? (
              <ChatBubbleLeft variant="white">
                <Text style={styles.errorText}>{error}</Text>
              </ChatBubbleLeft>
            ) : null}
          </View>

          {/* Input + CTA */}
          <View style={styles.inputCard}>
            <View style={styles.codeRow}>
              {chars.map((ch, i) => (
                <RNTextInput
                  key={i}
                  ref={(r) => { boxRefs.current[i] = r; }}
                  style={[styles.codeBox, ch ? styles.codeBoxFilled : null, preview ? styles.codeBoxDisabled : null]}
                  value={ch}
                  onChangeText={(v) => handleCharChange(v, i)}
                  onKeyPress={(e) => handleKeyPress(e, i)}
                  maxLength={1}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  selectTextOnFocus
                  editable={!preview}
                />
              ))}
            </View>

            {!preview ? (
              <Button
                label="Join Now"
                onPress={lookupCode}
                loading={loading}
                disabled={code.length < CODE_LENGTH}
              />
            ) : (
              <View style={styles.previewActions}>
                <Button
                  label="Confirm and join"
                  onPress={confirmJoin}
                  loading={joining}
                />
                <TouchableOpacity
                  onPress={() => { setPreview(null); setChars(Array(CODE_LENGTH).fill('')); setError(''); }}
                  style={styles.retryLink}
                >
                  <Text style={styles.retryLinkText}>Try a different code</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.mint },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },

  mascotWrap: {
    alignItems: 'center',
    marginBottom: 8,
  },

  // ── Chat bubbles ──────────────────────────────────────────────────────────
  thread: { gap: 10, marginBottom: 24 },

  bubbleLeft: {
    alignSelf: 'flex-start',
    maxWidth: '78%',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleGreen: {
    backgroundColor: Colors.green,
    borderWidth: 1.5,
    borderColor: Colors.ink,
  },
  bubbleWhite: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.ink,
  },
  bubbleRight: {
    alignSelf: 'flex-end',
    maxWidth: '78%',
    backgroundColor: Colors.violet,
    borderWidth: 1.5,
    borderColor: Colors.ink,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  bubbleGreenText: {
    ...Typography.body,
    color: Colors.ink,
    fontFamily: 'DMSans_700Bold',
  },
  bubbleWhiteText: {
    ...Typography.body,
    color: Colors.ink,
  },
  bubbleRightText: {
    ...Typography.body,
    color: Colors.ink,
    fontFamily: 'DMSans_700Bold',
  },

  // Preview content inside white bubble
  previewLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontFamily: 'Syne_800ExtraBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  previewName: { ...Typography.title, color: Colors.ink, marginBottom: 2 },
  previewUnit: { ...Typography.body, color: Colors.textSecondary, marginBottom: 8 },
  rolePill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.mint,
    borderWidth: 1.5,
    borderColor: Colors.ink,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  rolePillText: {
    ...Typography.captionSmall,
    color: Colors.ink,
    fontFamily: 'Syne_800ExtraBold',
  },

  errorText: { ...Typography.body, color: Colors.overdue },

  // ── Input area ────────────────────────────────────────────────────────────
  inputCard: {
    backgroundColor: 'transparent',
    gap: 12,
    marginBottom: 20,
    alignSelf: 'stretch',
  },
  codeLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontFamily: 'DMSans_700Bold',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 8,
  },
  codeBox: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
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
    minWidth: 0,
  } as any,
  codeBoxFilled: {
    borderColor: Colors.ink,
    backgroundColor: Colors.white,
  },
  codeBoxDisabled: {
    backgroundColor: Colors.screen,
    borderColor: Colors.border,
  },
  codeSep: {
    ...Typography.h2,
    color: Colors.textMuted,
    marginHorizontal: 2,
  },
  previewActions: { gap: 10 },
  retryLink: { alignItems: 'center', paddingVertical: 8 },
  retryLinkText: { ...Typography.caption, color: Colors.textSecondary, fontFamily: 'DMSans_700Bold' },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: { ...Typography.caption, color: Colors.textSecondary },
  footerLink: {
    ...Typography.caption,
    color: Colors.ink,
    fontFamily: 'Syne_800ExtraBold',
  },
});
