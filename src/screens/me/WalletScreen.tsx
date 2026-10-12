import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput as RNTextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Layout, Radius } from '@/theme';
import { formatNaira } from '@/utils/money';
import { formatFullDateTime } from '@/utils/date';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Button } from '@/components/common/Button';
import { BankFavicon } from '@/components/common/BankFavicon';
import Svg, { Path } from 'react-native-svg';

interface LocalTransaction {
  id: string;
  title?: string;
  type: 'top_up' | 'payment' | 'refund' | 'withdrawal';
  amount: number;
  createdAt: string;
}

const MOCK_TRANSACTIONS: LocalTransaction[] = [
  { id: 't1', title: 'Wallet funded', type: 'top_up', amount: 5000000, createdAt: '2026-10-11T14:00:00Z' },
  { id: 't2', title: 'Withdrawal', type: 'withdrawal', amount: 1500000, createdAt: '2026-10-10T11:20:00Z' },
  { id: 't3', title: 'Shared Bill Payment', type: 'payment', amount: 2500000, createdAt: '2026-10-09T08:22:00Z' },
  { id: 't4', title: 'Borehole fixing payment', type: 'payment', amount: 850000, createdAt: '2026-10-05T16:30:00Z' },
  { id: 't5', title: 'Private Bill Payment', type: 'payment', amount: 1200000, createdAt: '2026-09-29T10:00:00Z' },
];

const VIRTUAL_ACCOUNT = {
  bankName: 'Providus Bank',
  accountNumber: '9921004872',
  accountName: 'PAYDORM / ADEWALE OKONKWO',
};

const PAYOUT_ACCOUNT = {
  bankName: 'GTBank',
  accountNumber: '0045678901',
  accountName: 'ADEWALE OKONKWO',
};

const TOPUP_DURATION = 15 * 60;

// ── Top up modal (2-step) ─────────────────────────────────────────────────────
function TopUpModal({
  visible,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amount, setAmount] = useState('');
  const [seconds, setSeconds] = useState(TOPUP_DURATION);
  const [txRef, setTxRef] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (step === 2 && visible) {
      setSeconds(TOPUP_DURATION);
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) { if (timerRef.current) clearInterval(timerRef.current); return 0; }
          return s - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step, visible]);

  const handleClose = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStep(1); setAmount(''); setSeconds(TOPUP_DURATION); setTxRef('');
    onClose();
  };

  const handleContinue = () => {
    const n = Number(amount.replace(/,/g, ''));
    if (!n || n <= 0) return;
    setStep(2);
  };

  const handleDone = () => {
    const n = Number(amount.replace(/,/g, ''));
    if (timerRef.current) clearInterval(timerRef.current);
    const ref = `PD-${Math.floor(10000000 + Math.random() * 90000000)}`;
    setTxRef(ref);
    onConfirm(n * 100);
    setStep(3);
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const presets = [1000, 5000, 10000, 20000];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetWrap}>
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          {step === 1 ? (
            <>
              <Text style={styles.sheetTitle}>Fund wallet</Text>
              <Text style={styles.sheetSub}>Choose or enter an amount to add to your wallet.</Text>
              <View style={styles.presetRow}>
                {presets.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.presetChip, amount === String(p) && styles.presetChipActive]}
                    onPress={() => setAmount(String(p))}
                  >
                    <Text style={[styles.presetText, amount === String(p) && styles.presetTextActive]}>
                      ₦{p.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.fieldLabel}>Or enter amount (₦)</Text>
              <RNTextInput
                style={styles.field}
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholderTextColor={Colors.textMuted}
              />
              <View style={styles.sheetActions}>
                <Button label="Continue" onPress={handleContinue} />
                <Button label="Cancel" variant="ghost" onPress={handleClose} />
              </View>
            </>
          ) : step === 2 ? (
            <>
              <Text style={styles.sheetTitle}>Transfer ₦{Number(amount).toLocaleString()}</Text>
              <Text style={styles.sheetSub}>Make a bank transfer below. Funds appear automatically.</Text>

              <View style={styles.transferCard}>
                <View style={styles.transferBankRow}>
                  <BankFavicon bankName={VIRTUAL_ACCOUNT.bankName} size={28} />
                  <Text style={styles.transferBank}>{VIRTUAL_ACCOUNT.bankName}</Text>
                </View>
                <Text style={styles.transferAccountNum}>{VIRTUAL_ACCOUNT.accountNumber}</Text>
                <Text style={styles.transferName}>{VIRTUAL_ACCOUNT.accountName}</Text>
                <View style={styles.transferAmountRow}>
                  <Text style={styles.transferAmountLabel}>Amount to transfer</Text>
                  <Text style={styles.transferAmount}>₦{Number(amount).toLocaleString()}</Text>
                </View>
              </View>

              <View style={styles.timerRow}>
                <Text style={styles.timerLabel}>Session expires in</Text>
                <Text style={[styles.timer, seconds < 60 && styles.timerUrgent]}>{formatTime(seconds)}</Text>
              </View>

              <View style={styles.sheetActions}>
                <Button label="I've made the transfer" onPress={handleDone} />
                <Button label="Cancel" variant="ghost" onPress={handleClose} />
              </View>
            </>
          ) : (
            <View style={styles.successContainer}>
              <View style={styles.successIconBadge}>
                <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M5 13l4 4L19 7"
                    stroke={Colors.ink}
                    strokeWidth={2.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>

              <Text style={styles.successTitle}>Transfer submitted!</Text>
              <Text style={styles.successSub}>
                Your payment of ₦{Number(amount).toLocaleString()} has been received. Your wallet will update immediately.
              </Text>

              <View style={styles.successReceiptCard}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Amount funded</Text>
                  <Text style={styles.receiptAmount}>₦{Number(amount).toLocaleString()}</Text>
                </View>
                <View style={styles.receiptDivider} />
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Bank</Text>
                  <View style={styles.receiptBankRow}>
                    <BankFavicon bankName={VIRTUAL_ACCOUNT.bankName} size={18} />
                    <Text style={styles.receiptVal}>{VIRTUAL_ACCOUNT.bankName}</Text>
                  </View>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Account</Text>
                  <Text style={styles.receiptVal}>{VIRTUAL_ACCOUNT.accountNumber}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Beneficiary</Text>
                  <Text style={styles.receiptVal}>{VIRTUAL_ACCOUNT.accountName}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Reference</Text>
                  <Text style={[styles.receiptVal, styles.receiptMono]}>{txRef}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Status</Text>
                  <View style={styles.statusSuccessPill}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusSuccessText}>Successful</Text>
                  </View>
                </View>
              </View>

              <View style={styles.sheetActions}>
                <Button label="Back to Flex Wallet" onPress={handleClose} />
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Withdraw modal (2-step) ───────────────────────────────────────────────────
function WithdrawModal({
  visible,
  onClose,
  onConfirm,
  currentBalance,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  currentBalance: number;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [txRef, setTxRef] = useState('');

  const handleClose = () => { setStep(1); setAmount(''); setError(''); setTxRef(''); onClose(); };

  const handleContinue = () => {
    const n = Number(amount.replace(/,/g, ''));
    if (!n || n <= 0) { setError('Enter a valid amount.'); return; }
    if (n * 100 > currentBalance) { setError(`Not enough balance. You have ${formatNaira(currentBalance)}.`); return; }
    setError('');
    setStep(2);
  };

  const handleConfirm = () => {
    const n = Number(amount.replace(/,/g, ''));
    const ref = `PD-WD-${Math.floor(10000000 + Math.random() * 90000000)}`;
    setTxRef(ref);
    onConfirm(n * 100);
    setStep(3);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetWrap}>
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          {step === 1 ? (
            <>
              <Text style={styles.sheetTitle}>Withdraw funds</Text>
              <Text style={styles.sheetSub}>Available: {formatNaira(currentBalance)}</Text>
              <Text style={styles.fieldLabel}>Amount (₦)</Text>
              <RNTextInput
                style={styles.field}
                placeholder="0.00"
                value={amount}
                onChangeText={(v) => { setAmount(v); setError(''); }}
                keyboardType="numeric"
                placeholderTextColor={Colors.textMuted}
              />
              {error ? <Text style={styles.fieldError}>{error}</Text> : null}
              <View style={styles.sheetActions}>
                <Button label="Continue" onPress={handleContinue} />
                <Button label="Cancel" variant="ghost" onPress={handleClose} />
              </View>
            </>
          ) : step === 2 ? (
            <>
              <Text style={styles.sheetTitle}>Confirm withdrawal</Text>
              <Text style={styles.sheetSub}>₦{Number(amount).toLocaleString()} will be sent to your payout account:</Text>

              <View style={styles.transferCard}>
                <View style={styles.transferBankRow}>
                  <BankFavicon bankName={PAYOUT_ACCOUNT.bankName} size={28} />
                  <Text style={styles.transferBank}>{PAYOUT_ACCOUNT.bankName}</Text>
                </View>
                <Text style={styles.transferAccountNum}>{PAYOUT_ACCOUNT.accountNumber}</Text>
                <Text style={styles.transferName}>{PAYOUT_ACCOUNT.accountName}</Text>
                <View style={styles.transferAmountRow}>
                  <Text style={styles.transferAmountLabel}>Withdrawal amount</Text>
                  <Text style={styles.transferAmount}>₦{Number(amount).toLocaleString()}</Text>
                </View>
              </View>

              <Text style={styles.payoutHint}>
                Wrong account? Go to Profile → Payout account to update it.
              </Text>

              <View style={styles.sheetActions}>
                <Button label="Confirm withdrawal" onPress={handleConfirm} />
                <Button label="Back" variant="ghost" onPress={() => setStep(1)} />
              </View>
            </>
          ) : (
            <View style={styles.successContainer}>
              <View style={styles.successIconBadge}>
                <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M5 13l4 4L19 7"
                    stroke={Colors.ink}
                    strokeWidth={2.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>

              <Text style={styles.successTitle}>Withdrawal submitted!</Text>
              <Text style={styles.successSub}>
                ₦{Number(amount).toLocaleString()} is on its way to your {PAYOUT_ACCOUNT.bankName} account.
              </Text>

              <View style={styles.successReceiptCard}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Amount withdrawn</Text>
                  <Text style={styles.receiptAmount}>₦{Number(amount).toLocaleString()}</Text>
                </View>
                <View style={styles.receiptDivider} />
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Payout bank</Text>
                  <View style={styles.receiptBankRow}>
                    <BankFavicon bankName={PAYOUT_ACCOUNT.bankName} size={18} />
                    <Text style={styles.receiptVal}>{PAYOUT_ACCOUNT.bankName}</Text>
                  </View>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Account</Text>
                  <Text style={styles.receiptVal}>{PAYOUT_ACCOUNT.accountNumber}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Beneficiary</Text>
                  <Text style={styles.receiptVal}>{PAYOUT_ACCOUNT.accountName}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Reference</Text>
                  <Text style={[styles.receiptVal, styles.receiptMono]}>{txRef}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Status</Text>
                  <View style={styles.statusSuccessPill}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusSuccessText}>Processing</Text>
                  </View>
                </View>
              </View>

              <View style={styles.sheetActions}>
                <Button label="Back to Flex Wallet" onPress={handleClose} />
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────
export function WalletScreen() {
  const [balance, setBalance] = useState(345000);
  const [transactions, setTransactions] = useState<LocalTransaction[]>(MOCK_TRANSACTIONS);
  const [directDebit, setDirectDebit] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const handleTopUp = (amountKobo: number) => {
    setBalance((b) => b + amountKobo);
    setTransactions((prev) => [
      { id: `t${Date.now()}`, title: 'Wallet funded', type: 'top_up', amount: amountKobo, createdAt: new Date().toISOString() },
      ...prev,
    ]);
  };

  const handleWithdraw = (amountKobo: number) => {
    setBalance((b) => b - amountKobo);
    setTransactions((prev) => [
      { id: `t${Date.now()}`, title: 'Withdrawal', type: 'withdrawal', amount: amountKobo, createdAt: new Date().toISOString() },
      ...prev,
    ]);
  };

  const txTypeLabel: Record<string, string> = {
    top_up: 'Wallet funded', payment: 'Bill payment', refund: 'Refund', withdrawal: 'Withdrawal',
  };
  const txSign: Record<string, string> = { top_up: '+', refund: '+', payment: '-', withdrawal: '-' };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Flex Wallet" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Balance card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available balance</Text>
          <Text style={styles.balance}>{formatNaira(balance)}</Text>
          <View style={styles.balanceActions}>
            <Button
              label="Fund wallet"
              variant="accent"
              size="sm"
              onPress={() => setShowTopUp(true)}
              style={styles.balanceBtn}
              textStyle={styles.balanceBtnText}
            />
            <Button
              label="Withdraw"
              variant="outline"
              size="sm"
              onPress={() => setShowWithdraw(true)}
              style={styles.balanceBtn}
              textStyle={styles.balanceBtnText}
            />
          </View>
        </View>

        {/* Direct debit */}
        <View style={styles.debitCard}>
          <View style={styles.debitRow}>
            <View style={styles.debitText}>
              <Text style={styles.debitTitle}>Direct debit</Text>
              <Text style={styles.debitSubtitle}>Auto-pay bills on their due date from your bank account.</Text>
            </View>
            <Switch
              value={directDebit}
              onValueChange={setDirectDebit}
              trackColor={{ false: Colors.line, true: Colors.green }}
              thumbColor={Colors.white}
              ios_backgroundColor={Colors.line}
            />
          </View>
        </View>

        {/* Transactions */}
        <View style={styles.txSection}>
          <Text style={styles.txTitle}>Transactions</Text>
          {transactions.map((tx, i) => (
            <React.Fragment key={tx.id}>
              {i > 0 && <View style={styles.txDivider} />}
              <View style={styles.txRow}>
                <View style={styles.txInfo}>
                  <Text style={styles.txType}>{tx.title ?? txTypeLabel[tx.type] ?? tx.type}</Text>
                  <Text style={styles.txDate}>{formatFullDateTime(tx.createdAt)}</Text>
                </View>
                <Text style={[styles.txAmount, tx.type === 'top_up' || tx.type === 'refund' ? styles.txPositive : styles.txNegative]}>
                  {txSign[tx.type]}{formatNaira(tx.amount)}
                </Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </ScrollView>

      <TopUpModal visible={showTopUp} onClose={() => setShowTopUp(false)} onConfirm={handleTopUp} />
      <WithdrawModal visible={showWithdraw} onClose={() => setShowWithdraw(false)} onConfirm={handleWithdraw} currentBalance={balance} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.screen },
  content: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: 0,
    paddingBottom: Layout.contentBottomPadding,
    gap: 16,
  },
  balanceCard: { backgroundColor: Colors.ink, borderRadius: Radius.card, padding: 20, gap: 8 },
  balanceLabel: { ...Typography.caption, color: 'rgba(255,255,255,0.7)' },
  balance: { ...Typography.amountLarge, fontSize: 18, lineHeight: 22, color: Colors.white, marginBottom: 6 },
  balanceActions: { flexDirection: 'row', gap: 10 },
  balanceBtn: { flex: 1 },
  balanceBtnText: { fontSize: 11, lineHeight: 15 },

  debitCard: {
    backgroundColor: Colors.white, borderRadius: Radius.card,
    borderWidth: 1, borderColor: Colors.line, padding: 16,
  },
  debitRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  debitText: { flex: 1 },
  debitTitle: { ...Typography.label, color: Colors.ink },
  debitSubtitle: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  txSection: {
    backgroundColor: Colors.white, borderRadius: Radius.card,
    borderWidth: 1, borderColor: Colors.line, padding: 16, gap: 12,
  },
  txTitle: { ...Typography.label, color: Colors.ink },
  txRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  txDivider: { height: 1, backgroundColor: Colors.line },
  txInfo: { gap: 2 },
  txType: { ...Typography.label, color: Colors.ink },
  txDate: { ...Typography.caption, color: Colors.textMuted },
  txAmount: { ...Typography.label },
  txPositive: { color: Colors.paid },
  txNegative: { color: Colors.textPrimary },

  // Modal
  backdrop: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(12,24,34,0.55)' },
  sheetWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  sheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40, gap: 12,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.line,
    alignSelf: 'center', marginBottom: 8,
  },
  sheetTitle: { ...Typography.title, color: Colors.ink },
  sheetSub: { ...Typography.caption, color: Colors.textSecondary, marginBottom: 4 },
  fieldLabel: { ...Typography.label, color: Colors.textSecondary, fontSize: 12 },
  field: {
    borderWidth: 1.5, borderColor: Colors.line, borderRadius: Radius.cardSm,
    padding: 12, ...Typography.body, color: Colors.ink, backgroundColor: Colors.screen,
  },
  fieldError: { ...Typography.caption, color: Colors.overdue },
  presetRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  presetChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99,
    borderWidth: 1.5, borderColor: Colors.line, backgroundColor: Colors.white,
  },
  presetChipActive: { borderColor: Colors.ink, backgroundColor: Colors.mint },
  presetText: { ...Typography.caption, color: Colors.textSecondary },
  presetTextActive: { color: Colors.ink, fontFamily: 'Syne_800ExtraBold' },
  sheetActions: { gap: 8, marginTop: 8 },

  // Transfer / payout card
  transferCard: {
    backgroundColor: Colors.mint, borderRadius: Radius.card,
    borderWidth: 1.5, borderColor: Colors.ink, padding: 16, gap: 4,
  },
  transferBankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  transferBank: { ...Typography.caption, color: Colors.ink, fontFamily: 'Syne_800ExtraBold', fontSize: 13 },
  transferAccountNum: { fontFamily: 'Syne_800ExtraBold', fontSize: 22, color: Colors.ink, letterSpacing: 1 },
  transferName: { ...Typography.caption, color: Colors.textSecondary },
  transferAmountRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.line,
  },
  transferAmountLabel: { ...Typography.caption, color: Colors.textSecondary },
  transferAmount: { ...Typography.label, color: Colors.ink },

  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.screen,
    borderRadius: Radius.cardSm,
    padding: 12,
  },
  timerLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  timer: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 20,
    color: Colors.ink,
  },
  timerUrgent: {
    color: Colors.overdue,
  },
  payoutHint: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  
  // Success page
  successContainer: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
  },
  successIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.mint,
    borderWidth: 2,
    borderColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  successTitle: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 22,
    color: Colors.ink,
    textAlign: 'center',
  },
  successSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
  successReceiptCard: {
    width: '100%',
    backgroundColor: Colors.screen,
    borderRadius: Radius.card,
    borderWidth: 1.5,
    borderColor: Colors.line,
    padding: 16,
    gap: 10,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  receiptAmount: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 18,
    color: Colors.ink,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: Colors.line,
    marginVertical: 2,
  },
  receiptBankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  receiptVal: {
    ...Typography.label,
    color: Colors.ink,
    fontSize: 13,
  },
  receiptMono: {
    fontFamily: 'Syne_800ExtraBold',
    letterSpacing: 0.5,
  },
  statusSuccessPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E6F8EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#40CE86',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0D8C4B',
  },
  statusSuccessText: {
    ...Typography.captionSmall,
    color: '#0D8C4B',
    fontFamily: 'DMSans_700Bold',
  },
});
