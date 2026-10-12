import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Platform } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MeStackParams } from '@/navigation/types';
import { Colors, Typography, Layout, Radius, FontFamily } from '@/theme';
import { formatNaira } from '@/utils/money';
import { BankFavicon } from '@/components/common/BankFavicon';
import { PayDormLogo } from '@/components/icons/PayDormLogo';

type Props = NativeStackScreenProps<MeStackParams, 'WalletReceipt'>;

const PURPLE = Colors.violet; // #A98BFF

function ZigzagEdge() {
  const W = 400;
  const H = 28;
  const teeth = 14;
  const tw = W / teeth;
  let d = `M0 ${H} L${W} ${H}`;
  for (let i = teeth - 1; i >= 0; i--) {
    d += ` L${(i + 1) * tw - tw / 2} 0 L${i * tw} ${H}`;
  }
  d += ' Z';
  return (
    <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ marginTop: -1 }}>
      <Path d={d} fill={Colors.white} />
    </Svg>
  );
}

function CheckCircle() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} fill="rgba(255,255,255,0.25)" stroke={Colors.ink} strokeWidth={1.5} />
      <Path d="M8 12l3 3 5-5" stroke={Colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function WalletReceiptScreen({ route, navigation }: Props) {
  const {
    title = 'Transfer submitted!',
    subtitle,
    amount,
    bankName,
    accountNumber,
    accountName,
    txRef,
    status = 'Successful',
    date: rawDate,
    type = 'top_up',
  } = route.params;

  const now = rawDate ? new Date(rawDate) : new Date();
  const dateStr = now.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: true });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `PayDorm Receipt: ${title}\nAmount: ${formatNaira(amount)}\nRef: ${txRef}\nStatus: ${status}`,
      });
    } catch {
      // ignore
    }
  };

  const handleBackToWallet = () => {
    navigation.navigate('Wallet');
  };

  const isWithdrawal = type === 'withdrawal';
  const amountLabel = isWithdrawal ? 'Amount withdrawn' : 'Amount funded';
  const bankLabel = isWithdrawal ? 'Payout bank' : 'Bank';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Purple hero */}
        <View style={styles.hero}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={handleBackToWallet} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M19 12H5M12 5l-7 7 7 7" stroke={Colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.headerIconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" stroke={Colors.ink} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          </View>

          <View style={styles.summary}>
            <Text style={styles.billTitle} numberOfLines={2}>{title}</Text>
            <Text style={styles.amount}>{formatNaira(amount)}</Text>
            <Text style={styles.period}>{dateStr} · {timeStr}</Text>

            {subtitle ? (
              <Text style={styles.summarySub}>{subtitle}</Text>
            ) : null}

            <View style={styles.statusBadge}>
              <CheckCircle />
              <Text style={styles.statusText}>{status}</Text>
            </View>
          </View>
        </View>

        {/* Zigzag + white receipt card */}
        <View style={styles.receiptCard}>
          <ZigzagEdge />
          <View style={styles.receiptInner}>

            {/* PayDorm branding */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Payment received by PayDorm</Text>
              <View style={styles.payoutRow}>
                <PayDormLogo variant="mark" size={44} />
                <View style={styles.payoutInfo}>
                  <Text style={styles.paydormName}>PayDorm</Text>
                  <Text style={styles.payoutBank}>Every Nigerian's favourite bill Payer.</Text>
                </View>
              </View>
              <View style={styles.divider} />
            </View>

            {/* Receipt details */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>RECEIPT DETAILS</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{amountLabel}</Text>
                <Text style={styles.detailValue}>{formatNaira(amount)}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{bankLabel}</Text>
                <View style={styles.bankValueRow}>
                  <BankFavicon bankName={bankName} size={18} />
                  <Text style={styles.detailValue}>{bankName}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Account</Text>
                <Text style={styles.detailValue}>{accountNumber}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Beneficiary</Text>
                <Text style={styles.detailValue}>{accountName}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Reference</Text>
                <Text style={[styles.detailValue, styles.mono]}>{txRef}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{dateStr} · {timeStr}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <View style={styles.statusPill}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusPillText}>{status}</Text>
                </View>
              </View>
            </View>

          </View>
        </View>

        {/* Share / Back to Flex Wallet CTAs */}
        <View style={styles.receiptActions}>
          <TouchableOpacity style={styles.receiptActionBtn} onPress={handleShare}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" stroke={Colors.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.receiptActionText}>Share receipt</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.receiptActionBtn, styles.receiptActionBtnOutline]} onPress={handleBackToWallet}>
            <Text style={[styles.receiptActionText, { color: Colors.ink }]}>Back to Flex Wallet</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Generated by PayDorm</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PURPLE },
  scroll: { flex: 1, backgroundColor: PURPLE },
  scrollContent: { flexGrow: 1, paddingBottom: 40, backgroundColor: PURPLE },

  hero: { backgroundColor: PURPLE },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding, paddingTop: 8, paddingBottom: 4,
  },
  backBtn: { width: 32, height: 32, alignItems: 'flex-start', justifyContent: 'center' },
  headerIconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },

  summary: { paddingHorizontal: Layout.screenPadding, paddingTop: 16, paddingBottom: 32, gap: 4 },
  billTitle: { fontFamily: 'Syne_800ExtraBold', fontSize: 20, color: Colors.ink, marginBottom: 2 },
  amount: { fontFamily: 'Syne_800ExtraBold', fontSize: 36, color: Colors.ink, letterSpacing: -1, marginTop: 4 },
  period: { ...Typography.caption, color: 'rgba(12,24,34,0.65)', fontSize: 13, marginTop: 2 },
  summarySub: {
    ...Typography.bodySmall,
    color: 'rgba(12,24,34,0.75)',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 99,
    paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'flex-start',
  },
  statusText: { fontFamily: 'DMSans_700Bold', fontSize: 13, color: Colors.ink },

  receiptCard: { marginHorizontal: 16, marginBottom: 8, borderRadius: Radius.card, backgroundColor: 'transparent', overflow: 'hidden' },
  receiptInner: { backgroundColor: Colors.white, borderBottomLeftRadius: Radius.card, borderBottomRightRadius: Radius.card, paddingBottom: 8 },

  section: { paddingHorizontal: 16, paddingTop: 16 },
  sectionLabel: {
    ...Typography.captionSmall, color: Colors.textMuted,
    fontFamily: FontFamily.syneBold, fontSize: 10,
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12,
  },
  divider: { height: 1, backgroundColor: Colors.line, marginTop: 16, marginBottom: 0 },

  paydormName: { fontFamily: 'Syne_800ExtraBold', fontSize: 18, color: Colors.ink, letterSpacing: -0.5 },
  payoutRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  payoutInfo: { flex: 1 },
  payoutBank: { ...Typography.captionSmall, color: Colors.textSecondary, marginTop: 2, fontSize: 12 },

  detailRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: Colors.line,
  },
  detailLabel: { ...Typography.captionSmall, color: Colors.textMuted, fontSize: 12 },
  detailValue: { ...Typography.label, color: Colors.ink, fontSize: 13, fontFamily: FontFamily.syneBold, textAlign: 'right' },
  bankValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mono: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', letterSpacing: 0.5 },

  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E6F8EE',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0D8C4B',
  },
  statusPillText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
    color: '#0D8C4B',
  },

  receiptActions: {
    flexDirection: 'row', gap: 10,
    marginHorizontal: 16, marginTop: 8, marginBottom: 8,
  },
  receiptActionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.ink, borderRadius: Radius.cardSm,
    paddingVertical: 14,
  },
  receiptActionBtnOutline: {
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: 'rgba(12,24,34,0.2)',
  },
  receiptActionText: {
    ...Typography.label, color: Colors.white, fontFamily: 'Syne_800ExtraBold', fontSize: 12,
  },
  footer: { textAlign: 'center', fontSize: 11, color: 'rgba(12,24,34,0.4)', marginTop: 12, fontFamily: FontFamily.dmSansRegular },
});
