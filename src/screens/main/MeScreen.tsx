import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Ellipse, Line } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Layout, Radius } from '@/theme';
import { useAuthStore } from '@/store/auth';
import { useAppStore } from '@/store/app';

// ── Mascot Avatar ─────────────────────────────────────────────────────────────

function PiggyAvatar({ size = 64 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="15 28 90 75">
      <Path d="M36 58L30 40L48 50Z" fill="#A98BFF" stroke="#0C1822" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M84 58L90 40L72 50Z" fill="#A98BFF" stroke="#0C1822" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={60} cy={38} r={9} fill="#40CE86" stroke="#0C1822" strokeWidth={2} />
      <Path d="M55 36h10M55 40h10" stroke="#0C1822" strokeWidth={1.8} />
      <Ellipse cx={60} cy={78} rx={38} ry={30} fill="#A98BFF" stroke="#0C1822" strokeWidth={2.2} />
      <Path d="M50 50h20" stroke="#0C1822" strokeWidth={3} strokeLinecap="round" />
      <Rect x={37} y={64} width={15} height={10} rx={2.5} fill="#0C1822" />
      <Rect x={64} y={64} width={15} height={10} rx={2.5} fill="#0C1822" />
      <Path d="M52 68H64" stroke="#0C1822" strokeWidth={2} />
      <Ellipse cx={60} cy={88} rx={13} ry={9} fill="#40CE86" stroke="#0C1822" strokeWidth={2.2} />
      <Circle cx={55} cy={88} r={2} fill="#0C1822" />
      <Circle cx={65} cy={88} r={2} fill="#0C1822" />
      <Circle cx={34} cy={82} r={3.6} fill="#40CE86" opacity={0.8} />
      <Circle cx={86} cy={82} r={3.6} fill="#40CE86" opacity={0.8} />
    </Svg>
  );
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────
// Bold two-tone style: solid fills + thick outlines

function GatePassIcon() {
  return (
    <Svg width={30} height={30} viewBox="0 0 32 32" fill="none">
      {/* Ticket body */}
      <Rect x="2" y="9" width="28" height="14" rx="3" fill={Colors.violet} />
      {/* Perforation strip */}
      <Rect x="9" y="9" width="2" height="14" fill="#0C1822" opacity={0.15} />
      {/* Dark outline */}
      <Rect x="2" y="9" width="28" height="14" rx="3" stroke="#0C1822" strokeWidth="2" />
      <Path d="M9 9v14" stroke="#0C1822" strokeWidth="2" strokeLinecap="round" />
      {/* Perforation holes */}
      <Circle cx="9" cy="9" r="2.5" fill="#F4F7F5" stroke="#0C1822" strokeWidth="1.5" />
      <Circle cx="9" cy="23" r="2.5" fill="#F4F7F5" stroke="#0C1822" strokeWidth="1.5" />
      {/* Lines on ticket */}
      <Path d="M14 14h10M14 18h7" stroke="#F4F7F5" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function PaymentsIcon() {
  return (
    <Svg width={30} height={30} viewBox="0 0 32 32" fill="none">
      {/* Receipt body */}
      <Path d="M7 2h18a2 2 0 0 1 2 2v23l-3-2-3 2-3-2-3 2-3-2-3 2V4a2 2 0 0 1 2-2z" fill={Colors.violet} stroke="#0C1822" strokeWidth="2" strokeLinejoin="round" />
      {/* Lines */}
      <Path d="M11 10h10M11 15h10M11 20h6" stroke="#F4F7F5" strokeWidth="2.2" strokeLinecap="round" />
      {/* Green checkmark badge */}
      <Circle cx="24" cy="8" r="5" fill={Colors.green} stroke="#0C1822" strokeWidth="1.8" />
      <Path d="M21.5 8l2 2 3.5-3.5" stroke="#0C1822" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CoPartnerIcon() {
  return (
    <Svg width={30} height={30} viewBox="0 0 32 32" fill="none">
      {/* Back person (green) */}
      <Circle cx="20" cy="10" r="6" fill={Colors.green} stroke="#0C1822" strokeWidth="2" />
      <Path d="M10 30c0-5.5 4.5-10 10-10" stroke="#0C1822" strokeWidth="2" strokeLinecap="round" />
      <Path d="M20 20c5.5 0 10 4.5 10 10H10" fill={Colors.green} stroke="#0C1822" strokeWidth="2" strokeLinejoin="round" />
      {/* Front person (violet) */}
      <Circle cx="12" cy="10" r="6" fill={Colors.violet} stroke="#0C1822" strokeWidth="2" />
      <Path d="M2 30c0-5.5 4.5-10 10-10s10 4.5 10 10H2z" fill={Colors.violet} stroke="#0C1822" strokeWidth="2" strokeLinejoin="round" />
    </Svg>
  );
}

function WalletIcon() {
  return (
    <Svg width={30} height={30} viewBox="0 0 32 32" fill="none">
      {/* Wallet body */}
      <Path d="M3 10a3 3 0 0 1 3-3h20a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V10z" fill={Colors.green} stroke="#0C1822" strokeWidth="2" />
      {/* Top flap */}
      <Path d="M3 13h26" stroke="#0C1822" strokeWidth="2" />
      {/* Coin pocket */}
      <Rect x="18" y="16" width="10" height="7" rx="3" fill={Colors.violet} stroke="#0C1822" strokeWidth="1.8" />
      {/* Coin dot */}
      <Circle cx="23" cy="19.5" r="1.5" fill="#0C1822" />
    </Svg>
  );
}

function PropertiesIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="8" height="8" rx="1.5" fill={Colors.violet} stroke="#0C1822" strokeWidth="1.6" />
      <Rect x="13" y="3" width="8" height="8" rx="1.5" fill={Colors.green} stroke="#0C1822" strokeWidth="1.6" />
      <Rect x="3" y="13" width="8" height="8" rx="1.5" fill={Colors.green} stroke="#0C1822" strokeWidth="1.6" />
      <Rect x="13" y="13" width="8" height="8" rx="1.5" fill={Colors.violet} opacity={0.5} stroke="#0C1822" strokeWidth="1.6" />
    </Svg>
  );
}

function ProfileIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" fill={Colors.violet} stroke="#0C1822" strokeWidth="1.6" />
      <Path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" fill={Colors.mint} stroke="#0C1822" strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}

function PayoutIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="5" width="20" height="14" rx="2" fill={Colors.green} stroke="#0C1822" strokeWidth="1.6" />
      <Path d="M2 10h20" stroke="#0C1822" strokeWidth="1.6" />
      <Path d="M6 15h4" stroke="#0C1822" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

function NotificationsIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M18 10a6 6 0 0 0-12 0c0 3.5-2 5-2 5h16s-2-1.5-2-5z" fill={Colors.violet} stroke="#0C1822" strokeWidth="1.6" strokeLinejoin="round" />
      <Path d="M12 21a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2z" fill={Colors.green} stroke="#0C1822" strokeWidth="1.4" />
    </Svg>
  );
}

function SecurityIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L4 6v5c0 5 3.6 9.3 8 10.3C16.4 20.3 20 16 20 11V6l-8-4z" fill={Colors.green} stroke="#0C1822" strokeWidth="1.6" strokeLinejoin="round" />
      <Path d="M9 12l2 2 4-4" stroke="#0C1822" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function DirectDebitIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M4 12a8 8 0 0 1 14.4-4.8" stroke={Colors.violet} strokeWidth="2" strokeLinecap="round" />
      <Path d="M20 12a8 8 0 0 1-14.4 4.8" stroke={Colors.green} strokeWidth="2" strokeLinecap="round" />
      <Path d="M18 4l.5 3.5L22 8" stroke={Colors.violet} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6 20l-.5-3.5L2 16" stroke={Colors.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function HelpIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" fill={Colors.violet} stroke="#0C1822" strokeWidth="1.6" />
      <Path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2.5-2.5 4.5" stroke="#F4F7F5" strokeWidth="1.8" strokeLinecap="round" />
      <Circle cx="12" cy="17.5" r="0.75" fill="#F4F7F5" />
    </Svg>
  );
}

function LogOutIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={Colors.clay} strokeWidth="2" strokeLinecap="round" />
      <Path d="M16 17l5-5-5-5M21 12H9" stroke={Colors.clay} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

interface ShortcutCard {
  label: string;
  sublabel: string;
  icon: () => React.ReactElement;
  route: string;
}

interface MenuRow {
  label: string;
  icon: () => React.ReactElement;
  route: string;
  destructive?: boolean;
}

const SHORTCUT_CARDS: ShortcutCard[] = [
  { label: 'Gate pass', sublabel: 'Coming soon', icon: GatePassIcon, route: 'GatePass' },
  { label: 'My payments', sublabel: 'History', icon: PaymentsIcon, route: 'MyPayments' },
  { label: 'Co-partner', sublabel: 'Housemates', icon: CoPartnerIcon, route: 'CoPartner' },
  { label: 'Wallet', sublabel: 'Balance & top up', icon: WalletIcon, route: 'Wallet' },
];

const MENU_ROWS: MenuRow[] = [
  { label: 'Properties', icon: PropertiesIcon, route: 'Properties' },
  { label: 'Profile', icon: ProfileIcon, route: 'Profile' },
  { label: 'Payout account', icon: PayoutIcon, route: 'Profile' },
  { label: 'Notifications', icon: NotificationsIcon, route: 'Notifications' },
  { label: 'Security', icon: SecurityIcon, route: 'Security' },
  { label: 'Direct debit', icon: DirectDebitIcon, route: 'Wallet' },
  { label: 'Help & support', icon: HelpIcon, route: 'HelpSupport' },
  { label: 'Log out', icon: LogOutIcon, route: 'logout', destructive: true },
];

// ── Screen ────────────────────────────────────────────────────────────────────

export function MeScreen() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const clearContext = useAppStore((s) => s.clearContext);

  const handleMenuPress = (route: string) => {
    if (route === 'logout') {
      Alert.alert('Log out', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: () => {
            clearAuth();
            clearContext();
          },
        },
      ]);
      return;
    }
    navigation.navigate(route);
  };

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Your name';
  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : 'U';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <PiggyAvatar size={64} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.house}>Lekki Gardens Estate · Flat 4B</Text>
            {user?.residentId && (
              <View style={styles.residentBadge}>
                <Text style={styles.residentId}>{user.residentId}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Shortcut cards 2×2 */}
        <View style={styles.cards}>
          {SHORTCUT_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <TouchableOpacity
                key={card.label}
                style={styles.shortcutCard}
                onPress={() => navigation.navigate(card.route)}
                activeOpacity={0.75}
              >
                <View style={styles.cardIconWrap}>
                  <Icon />
                </View>
                <Text style={styles.cardLabel}>{card.label}</Text>
                <Text style={styles.cardSublabel}>{card.sublabel}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Menu list */}
        <View style={styles.menuCard}>
          {MENU_ROWS.map((row, idx) => {
            const Icon = row.icon;
            return (
              <React.Fragment key={row.label}>
                <TouchableOpacity
                  style={styles.menuRow}
                  onPress={() => handleMenuPress(row.route)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuIconTile}>
                    <Icon />
                  </View>
                  <Text style={[styles.menuLabel, row.destructive && styles.menuLabelDestructive]}>
                    {row.label}
                  </Text>
                  <Text style={styles.menuChevron}>›</Text>
                </TouchableOpacity>
                {idx < MENU_ROWS.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.screen },
  content: {
    padding: Layout.screenPadding,
    paddingBottom: Layout.contentBottomPadding,
    gap: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.ink,
    backgroundColor: Colors.mint,
  },
  profileInfo: { flex: 1, gap: 3 },
  name: { ...Typography.title, color: Colors.ink },
  house: { ...Typography.caption, color: Colors.textSecondary },
  residentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.ink,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginTop: 4,
  },
  residentId: { ...Typography.caption, color: Colors.ink, fontFamily: 'DMSans_700Bold' },
  cards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  shortcutCard: {
    width: '47.5%',
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    borderWidth: 1.5,
    borderColor: Colors.line,
    padding: 14,
    gap: 4,
    minHeight: 96,
  },
  cardIconWrap: { marginBottom: 6 },
  cardLabel: { ...Typography.label, color: Colors.ink },
  cardSublabel: { ...Typography.caption, color: Colors.textSecondary },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.line,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
    minHeight: Layout.minTouchTarget,
  },
  menuIconTile: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.screen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { ...Typography.body, color: Colors.ink, flex: 1 },
  menuLabelDestructive: { color: Colors.overdue },
  menuChevron: { fontSize: 20, color: Colors.textMuted },
  divider: {
    height: 1,
    backgroundColor: Colors.line,
    marginHorizontal: 16,
  },
});
