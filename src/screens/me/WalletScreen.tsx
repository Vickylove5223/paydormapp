import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Colors, Typography, Layout, Radius } from '@/theme';
import { api } from '@/api/client';
import { Wallet, VirtualAccount, WalletTransaction } from '@/types';
import { formatNaira } from '@/utils/money';
import { relativeDate, timeAgo } from '@/utils/date';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { CardSkeleton } from '@/components/common/SkeletonLoader';
import { Button } from '@/components/common/Button';

export function WalletScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: () =>
      api.get<{
        wallet: Wallet;
        virtualAccount: VirtualAccount | null;
        transactions: WalletTransaction[];
        directDebitActive: boolean;
      }>('/wallet'),
  });

  const txTypeLabel: Record<string, string> = {
    top_up: 'Top up',
    payment: 'Payment',
    refund: 'Refund',
    withdrawal: 'Withdrawal',
  };

  const txSign: Record<string, string> = {
    top_up: '+',
    refund: '+',
    payment: '-',
    withdrawal: '-',
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Flex Wallet" />
      {isLoading ? (
        <View style={{ padding: Layout.screenPadding, gap: 12 }}>
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Balance card */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available balance</Text>
            <Text style={styles.balance}>{formatNaira(data?.wallet.balance ?? 0)}</Text>
            <View style={styles.balanceActions}>
              <Button label="Top up" variant="accent" size="md" onPress={() => {}} style={styles.balanceBtn} />
              <Button label="Withdraw" variant="outline" size="md" onPress={() => {}} style={styles.balanceBtn} />
            </View>
          </View>

          {/* Virtual account */}
          {data?.virtualAccount && (
            <View style={styles.accountCard}>
              <Text style={styles.accountTitle}>Bank transfer to top up</Text>
              <Text style={styles.accountBank}>{data.virtualAccount.bankName}</Text>
              <View style={styles.accountRow}>
                <Text style={styles.accountNumber}>{data.virtualAccount.accountNumber}</Text>
                <TouchableOpacity style={styles.copyBtn}>
                  <Text style={styles.copyBtnText}>Copy</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.accountName}>{data.virtualAccount.accountName}</Text>
              <Text style={styles.accountHint}>Transfers appear in your wallet automatically.</Text>
            </View>
          )}

          {/* Direct debit toggle */}
          <View style={styles.debitCard}>
            <View style={styles.debitRow}>
              <View style={styles.debitText}>
                <Text style={styles.debitTitle}>Direct debit</Text>
                <Text style={styles.debitSubtitle}>
                  Auto-pay bills on their due date from your bank account.
                </Text>
              </View>
              <Switch
                value={data?.directDebitActive ?? false}
                onValueChange={() => {}}
                trackColor={{ false: Colors.line, true: Colors.green }}
                thumbColor={Colors.white}
                ios_backgroundColor={Colors.line}
              />
            </View>
          </View>

          {/* Transactions */}
          <View style={styles.txSection}>
            <Text style={styles.txTitle}>Transactions</Text>
            {data?.transactions.length === 0 ? (
              <Text style={styles.txEmpty}>No transactions yet.</Text>
            ) : (
              data?.transactions.map((tx) => (
                <View key={tx.id} style={styles.txRow}>
                  <View style={styles.txInfo}>
                    <Text style={styles.txType}>{txTypeLabel[tx.type] ?? tx.type}</Text>
                    <Text style={styles.txDate}>{timeAgo(tx.createdAt)}</Text>
                  </View>
                  <Text
                    style={[
                      styles.txAmount,
                      tx.type === 'top_up' || tx.type === 'refund'
                        ? styles.txPositive
                        : styles.txNegative,
                    ]}
                  >
                    {txSign[tx.type]}{formatNaira(tx.amount)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
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
  balanceCard: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.card,
    padding: 20,
    gap: 8,
  },
  balanceLabel: { ...Typography.caption, color: 'rgba(255,255,255,0.7)' },
  balance: { ...Typography.amountLarge, color: Colors.white, marginBottom: 8 },
  balanceActions: { flexDirection: 'row', gap: 10 },
  balanceBtn: { flex: 1 },
  accountCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 16,
    gap: 6,
  },
  accountTitle: { ...Typography.captionSmall, color: Colors.textMuted, fontFamily: 'Syne_800ExtraBold', textTransform: 'uppercase', letterSpacing: 0.5 },
  accountBank: { ...Typography.label, color: Colors.textSecondary },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  accountNumber: { ...Typography.amount, color: Colors.ink, fontSize: 22 },
  copyBtn: {
    backgroundColor: Colors.green,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: Colors.ink,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  copyBtnText: { ...Typography.captionSmall, color: Colors.ink, fontFamily: 'Syne_800ExtraBold' },
  accountName: { ...Typography.caption, color: Colors.textSecondary },
  accountHint: { ...Typography.caption, color: Colors.textMuted, marginTop: 4 },
  debitCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 16,
  },
  debitRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  debitText: { flex: 1 },
  debitTitle: { ...Typography.label, color: Colors.ink },
  debitSubtitle: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  txSection: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 16,
    gap: 12,
  },
  txTitle: { ...Typography.label, color: Colors.ink },
  txEmpty: { ...Typography.body, color: Colors.textMuted },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  txInfo: { gap: 2 },
  txType: { ...Typography.label, color: Colors.ink },
  txDate: { ...Typography.caption, color: Colors.textMuted },
  txAmount: { ...Typography.label },
  txPositive: { color: Colors.paid },
  txNegative: { color: Colors.textPrimary },
});
