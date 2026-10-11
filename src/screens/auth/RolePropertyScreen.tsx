import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParams } from '@/navigation/types';
import { Colors, Typography, Layout, Radius } from '@/theme';
import { Button } from '@/components/common/Button';
import { AuthHeader } from '@/components/common/AuthHeader';
import { FlexMascot } from '@/components/icons/FlexMascot';
import { LockoMascot } from '@/components/icons/LockoMascot';
import { DripMascot } from '@/components/icons/DripMascot';
import { GenMascot } from '@/components/icons/GenMascot';
import { WiFiWizMascot } from '@/components/icons/WiFiWizMascot';
import { useAuthStore } from '@/store/auth';
import { api } from '@/api/client';
import { UserRole } from '@/types';

type Props = NativeStackScreenProps<AuthStackParams, 'RoleProperty'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDE_PEEK = 28;
const CARD_WIDTH = SCREEN_WIDTH - SIDE_PEEK * 2;
const SNAP_INTERVAL = CARD_WIDTH;

function CheckIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20">
      <Circle cx="10" cy="10" r="10" fill={Colors.green} />
      <Path d="M6 10l3 3 5-5" stroke={Colors.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function XIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20">
      <Circle cx="10" cy="10" r="10" fill={Colors.error} />
      <Path d="M7 13l6-6M13 13L7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

type RoleData = {
  id: UserRole;
  label: string;
  tagline: string;
  cardColor: string;
  Mascot: React.ComponentType<{ width?: number; height?: number }>;
  features: string[];
  limitations: string[];
};

const ROLES: RoleData[] = [
  {
    id: 'tenant',
    label: 'Tenant',
    tagline: 'Lives in the compound',
    cardColor: Colors.green,
    Mascot: FlexMascot,
    features: [
      'Pay your compound bills here',
      'Add and pay your own private bills',
      'Invite your co-partners to share your household bills',
    ],
    limitations: [
      'Invite other tenants',
      'Create compound bills',
      'Share bills with anyone',
    ],
  },
  {
    id: 'master_tenant',
    label: 'Chief Tenant',
    tagline: 'Leads the household',
    cardColor: '#B5DEFF',
    Mascot: WiFiWizMascot,
    features: [
      'Everything a tenant can do',
      'Invite, edit and remove tenants',
      'Setup compound bills and account to pay bills to',
    ],
    limitations: [
      'Be the landlord that owns the building',
    ],
  },
  {
    id: 'landlord',
    label: 'Landlord',
    tagline: 'Owns the property',
    cardColor: Colors.violet,
    Mascot: DripMascot,
    features: [
      'Everything a Chief Tenant can do',
      'Add more than one property',
      'Don\'t necessarily have to share in paying compound bills',
    ],
    limitations: [],
  },
  {
    id: 'agent',
    label: 'Estate manager',
    tagline: 'Runs the show for everyone',
    cardColor: '#FFB547',
    Mascot: GenMascot,
    features: [
      'Everything a Chief Tenant can do',
      'Add more than one property',
      'Don\'t necessarily have to share in paying compound bills',
    ],
    limitations: [
      'Invite your co-partners to share your household bills',
    ],
  },
];

function RoleCard({ role }: { role: RoleData }) {
  const { Mascot } = role;
  return (
    <View style={[styles.card, { backgroundColor: role.cardColor, width: CARD_WIDTH }]}>
      <View style={styles.cardTop}>
        <Mascot width={90} height={108} />
        <Text style={styles.cardTitle}>{role.label}</Text>
        <Text style={styles.cardTagline}>{role.tagline}</Text>
      </View>
      <View style={styles.featureBox}>
        <Text style={styles.featureLabel}>You get to:</Text>
        {role.features.map((feat, i) => (
          <View key={`can-${i}`} style={styles.featureRow}>
            <CheckIcon />
            <Text style={styles.featureText}>{feat}</Text>
          </View>
        ))}
        {role.limitations.length > 0 && (
          <>
            <View style={styles.divider} />
            <Text style={styles.limitLabel}>You can't:</Text>
            {role.limitations.map((limit, i) => (
              <View key={`cant-${i}`} style={styles.featureRow}>
                <XIcon />
                <Text style={styles.limitText}>{limit}</Text>
              </View>
            ))}
          </>
        )}
      </View>
    </View>
  );
}

export function RolePropertyScreen({ route, navigation }: Props) {
  const { email, firstName, lastName, whatsappNumber } = route.params;
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setAuth = useAuthStore((s) => s.setAuth);
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.x;
    const nearest = Math.round(offset / SNAP_INTERVAL);
    const clamped = Math.max(0, Math.min(nearest, ROLES.length - 1));
    setActiveIndex(clamped);
  }, []);

  const selectedRole = ROLES[activeIndex];

  const handleContinue = async () => {
    setError('');
    const role = selectedRole.id;

    if (role === 'tenant' || role === 'landlord' || role === 'agent') {
      navigation.navigate('PropertySetup', { email, firstName, lastName, whatsappNumber, role });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post<{ user: any; accessToken: string; refreshToken: string }>(
        '/auth/complete-onboarding',
        { email, firstName, lastName, whatsappNumber, role }
      );
      setAuth(res.user, res.accessToken, res.refreshToken);
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Vertical scroll — header + title + cards all move together */}
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.screenContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeader backgroundColor={Colors.mint} />

        <View style={styles.headingWrap}>
          <Text style={styles.heading}>What's your role?</Text>
          <Text style={styles.subtitle}>Swipe to see what each role can do</Text>
        </View>

        {/* Horizontal card swiper — full bleed, no paddingHorizontal on container */}
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={SNAP_INTERVAL}
          snapToAlignment="start"
          disableIntervalMomentum
          contentContainerStyle={styles.carousel}
          onScroll={onScroll}
          scrollEventThrottle={16}
          style={[styles.cardScroll, { scrollSnapType: 'x mandatory' } as any]}
          bounces={false}
        >
          {ROLES.map((role) => (
            <View key={role.id} style={[styles.cardWrap, { scrollSnapAlign: 'start' } as any]}>
              <RoleCard role={role} />
            </View>
          ))}
        </ScrollView>

        {/* Dot indicators */}
        <View style={styles.dots}>
          {ROLES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>

        {/* CTA scrolls with content */}
        <View style={styles.footer}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button
            label={`I'm a ${selectedRole.label}`}
            onPress={handleContinue}
            loading={loading}
            style={styles.btn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.mint },

  screen: { flex: 1 },
  screenContent: { paddingBottom: 8 },

  headingWrap: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: 8,
    marginBottom: 20,
  },
  heading: { ...Typography.h2, color: Colors.ink, marginBottom: 4 },
  subtitle: { ...Typography.body, color: Colors.textSecondary },

  cardScroll: {},
  carousel: {
    paddingHorizontal: SIDE_PEEK,
    paddingBottom: 4,
  },
  cardWrap: {},
  card: {
    borderRadius: Radius.card,
    overflow: 'hidden',
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cardTop: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 22,
    color: Colors.ink,
    marginTop: 14,
    marginBottom: 4,
  },
  cardTagline: {
    ...Typography.body,
    color: Colors.ink,
    opacity: 0.75,
    textAlign: 'center',
  },
  featureBox: {
    backgroundColor: Colors.white,
    borderRadius: Radius.cardSm,
    padding: 16,
    gap: 12,
  },
  featureLabel: {
    ...Typography.caption,
    fontFamily: 'DMSans_700Bold',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.line,
    marginVertical: 4,
  },
  limitLabel: {
    ...Typography.caption,
    fontFamily: 'DMSans_700Bold',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  limitText: {
    ...Typography.body,
    color: Colors.textMuted,
    flex: 1,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    ...Typography.body,
    color: Colors.ink,
    flex: 1,
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.line,
  },
  dotActive: {
    width: 18,
    backgroundColor: Colors.ink,
  },

  footer: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: 16,
    paddingBottom: 32,
  },
  error: {
    ...Typography.caption,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 8,
  },
  btn: { width: '100%' },
});
