import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LeviesStackParams } from '@/navigation/types';
import { Colors, Typography, Layout, Radius, FontFamily } from '@/theme';
import { formatNaira } from '@/utils/money';

type Props = NativeStackScreenProps<LeviesStackParams, 'TransactionHistory'>;

const MOCK_TRANSACTIONS = [
  { id: 'tx1', month: 'September 2026', date: '2026-09-05T09:14:00', amount: 1200000, status: 'paid', paidBy: 5, total: 6 },
  { id: 'tx2', month: 'August 2026',    date: '2026-08-05T11:32:00', amount: 1200000, status: 'paid', paidBy: 6, total: 6 },
  { id: 'tx3', month: 'July 2026',      date: '2026-07-05T08:05:00', amount: 1200000, status: 'paid', paidBy: 4, total: 6 },
  { id: 'tx4', month: 'June 2026',      date: '2026-06-05T14:47:00', amount: 1200000, status: 'paid', paidBy: 6, total: 6 },
  { id: 'tx5', month: 'May 2026',       date: '2026-05-05T10:20:00', amount: 1050000, status: 'paid', paidBy: 6, total: 6 },
];

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function downloadReceipt(tx: typeof MOCK_TRANSACTIONS[0], item: any) {
  if (Platform.OS !== 'web') return;
  const date = new Date(tx.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
  const time = formatTime(tx.date);
  const amtFormatted = formatNaira(tx.amount);

  // Zigzag SVG teeth
  const W = 400; const teeth = 14; const tw = W / teeth; const H = 28;
  let zd = `M0 ${H} L${W} ${H}`;
  for (let i = teeth - 1; i >= 0; i--) zd += ` L${(i + 1) * tw - tw / 2} 0 L${i * tw} ${H}`;
  zd += ' Z';

  const payoutHtml = item.payoutBank ? `
    <div class="section-label">PAYOUT DESTINATION</div>
    <div class="payout-row">
      <div class="payout-initial" style="background:${hashBg(item.payoutBank)}">${initials(item.payoutBank)}</div>
      <div class="payout-info">
        <div class="payout-name">${item.accountName ?? ''}</div>
        <div class="payout-bank">${item.payoutBank} · ${item.payoutAcct ?? ''}</div>
        ${item.payoutPersonName ? `<div class="payout-person">${item.payoutPersonName}</div>` : ''}
      </div>
    </div>
    <div class="divider"></div>` : '';

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Receipt – ${tx.month}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#40CE86;min-height:100vh;padding:0}
.hero{background:#40CE86;padding:24px 20px 36px}
.hero-eyebrow{font-size:11px;font-weight:700;color:rgba(12,24,34,0.5);letter-spacing:1px;text-transform:uppercase;margin-bottom:8px}
.hero-title{font-size:22px;font-weight:800;color:#0C1822;margin-bottom:4px}
.hero-amount{font-size:36px;font-weight:800;color:#0C1822;letter-spacing:-1px;margin:8px 0 4px}
.hero-sub{font-size:13px;color:rgba(12,24,34,0.55);margin-bottom:12px}
.badge{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.35);border-radius:99px;padding:4px 12px;font-size:12px;font-weight:700;color:#0C1822}
.zigzag{display:block;width:100%;height:28px;margin-top:-1px}
.card{background:#fff;border-radius:0 0 16px 16px;padding:0 0 24px;margin:0 16px 24px;box-shadow:0 4px 20px rgba(0,0,0,0.08)}
.section-label{font-size:10px;font-weight:700;color:#8FA4B0;letter-spacing:1px;text-transform:uppercase;padding:16px 16px 10px}
.payout-row{display:flex;align-items:center;gap:12px;padding:0 16px 4px}
.payout-initial{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:#fff;flex-shrink:0}
.payout-info{flex:1}
.payout-name{font-size:13px;font-weight:700;color:#0C1822}
.payout-bank{font-size:12px;color:#4A6070;margin-top:2px}
.payout-person{font-size:11px;color:#8FA4B0;margin-top:2px}
.divider{height:1px;background:#F0EEF7;margin:14px 16px 0}
.rows{padding:0 16px}
.row{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #F4F7F5}
.row:last-child{border-bottom:none}
.row-label{font-size:12px;color:#8FA4B0;font-weight:600;letter-spacing:0.3px}
.row-value{font-size:13px;color:#0C1822;font-weight:700;text-align:right}
.status-badge{background:#E6F8EE;color:#40CE86;border-radius:99px;padding:3px 12px;font-size:11px;font-weight:700;border:1px solid #A7F3D0}
.footer{text-align:center;font-size:11px;color:rgba(12,24,34,0.35);padding:8px 20px 24px}
</style></head><body>
<div class="hero">
  <div class="hero-eyebrow">PayDorm · Receipt</div>
  <div class="hero-title">${item.title}</div>
  <div class="hero-amount">${amtFormatted}</div>
  <div class="hero-sub">${tx.month}</div>
  <span class="badge">✓ Collected</span>
</div>
<svg class="zigzag" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
  <path d="${zd}" fill="#fff"/>
</svg>
<div class="card">
  ${payoutHtml}
  <div class="rows">
    <div class="row"><span class="row-label">Date</span><span class="row-value">${date}</span></div>
    <div class="row"><span class="row-label">Time</span><span class="row-value">${time}</span></div>
    <div class="row"><span class="row-label">Period</span><span class="row-value">${tx.month}</span></div>
    <div class="row"><span class="row-label">Amount</span><span class="row-value">${amtFormatted}</span></div>
    <div class="row"><span class="row-label">Status</span><span class="row-value"><span class="status-badge">Collected</span></span></div>
  </div>
</div>
<div class="footer">Generated by PayDorm · ${date}</div>
</body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? '').join('');
}

function hashBg(name: string) {
  const colors = ['#002D62','#D12026','#40196D','#13B87D','#DD4F05','#2D0845','#0056A2','#1A1A2E'];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return colors[Math.abs(h) % colors.length];
}

const STATUS_COLOR: Record<string, string> = {
  paid: Colors.green,
  partial: '#F5A623',
  unpaid: '#E8724A',
};

export function TransactionHistoryScreen({ route, navigation }: Props) {
  const { billData: item } = route.params;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M19 12H5M12 5l-7 7 7 7" stroke={Colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction History</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Bill info strip */}
        <View style={styles.billStrip}>
          <Text style={styles.billStripTitle}>{item.title}</Text>
          <Text style={styles.billStripAmount}>{formatNaira(item.totalAmount)} / month</Text>
        </View>

        {/* Transactions */}
        <View style={styles.listCard}>
          {MOCK_TRANSACTIONS.map((tx, i) => (
            <View key={tx.id}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.txRow}>
                {/* Receipt icon in app icon style */}
                <View style={styles.receiptIcon}>
                  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                    <Rect x="3" y="2" width="14" height="18" rx="2" fill={Colors.violet} stroke={Colors.ink} strokeWidth={1.8} />
                    <Path d="M7 7h10M7 11h6" stroke={Colors.white} strokeWidth={1.6} strokeLinecap="round" />
                    <Path d="M14 17l2 2 3-4" stroke="#40CE86" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txMonth}>{tx.month}</Text>
                  <Text style={styles.txSub}>{formatTime(tx.date)}</Text>
                </View>
                <View style={styles.txRight}>
                  <Text style={styles.txAmount}>{formatNaira(tx.amount)}</Text>
                  <TouchableOpacity
                    style={styles.receiptBtn}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('Receipt', { billData: item, txDate: tx.date, txAmount: tx.amount, txMonth: tx.month })}
                  >
                    <Text style={styles.receiptBtnText}>Receipt</Text>
                    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                      <Path d="M9 18l6-6-6-6" stroke={Colors.green} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.screen },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding, paddingTop: 8, paddingBottom: 12,
  },
  backBtn: { width: 32, height: 32, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: { fontFamily: FontFamily.syneBold, fontSize: 16, color: Colors.ink },

  billStrip: {
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: Colors.violet + '18',
    borderRadius: Radius.cardSm, padding: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  billStripTitle: { ...Typography.label, color: Colors.ink, fontFamily: FontFamily.syneBold },
  billStripAmount: { ...Typography.label, color: Colors.violet, fontFamily: FontFamily.syneBold },

  listCard: {
    marginHorizontal: 16, backgroundColor: Colors.white,
    borderRadius: Radius.card, overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: Colors.line },

  txRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  receiptIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.violetTint, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  txInfo: { flex: 1 },
  txMonth: { ...Typography.label, color: Colors.ink, fontSize: 15, fontFamily: 'DMSans_700Bold' },
  txSub: { ...Typography.captionSmall, color: Colors.textSecondary, marginTop: 2 },
  txRight: { alignItems: 'flex-end', gap: 4 },
  txAmount: { ...Typography.label, color: Colors.ink, fontFamily: 'DMSans_700Bold', fontSize: 14 },
  receiptBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
  },
  receiptBtnText: { fontFamily: 'DMSans_700Bold', fontSize: 11, color: Colors.green },
});
