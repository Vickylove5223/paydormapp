import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Layout, Radius } from '@/theme';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { TextInput } from '@/components/common/TextInput';
import { Button } from '@/components/common/Button';
import { BankFavicon } from '@/components/common/BankFavicon';

export interface PayoutAccountDetails {
  bankName: string;
  bankCode?: string;
  accountNumber: string;
  accountName: string;
  verified?: boolean;
}

const NIGERIAN_BANKS = [
  { name: 'Guaranty Trust Bank (GTBank)', code: '058' },
  { name: 'Access Bank', code: '044' },
  { name: 'Zenith Bank', code: '057' },
  { name: 'First Bank of Nigeria', code: '011' },
  { name: 'United Bank for Africa (UBA)', code: '033' },
  { name: 'Kuda Bank', code: '50211' },
  { name: 'OPay', code: '999992' },
  { name: 'Palmpay', code: '999991' },
  { name: 'Providus Bank', code: '101' },
  { name: 'Fidelity Bank', code: '070' },
  { name: 'Stanbic IBTC Bank', code: '221' },
  { name: 'Sterling Bank', code: '232' },
  { name: 'Wema Bank', code: '035' },
];

export function PayoutAccountScreen() {
  const navigation = useNavigation<any>();

  // Current active payout account state
  const [account, setAccount] = useState<PayoutAccountDetails | null>({
    bankName: 'Guaranty Trust Bank (GTBank)',
    bankCode: '058',
    accountNumber: '0045678901',
    accountName: 'ADEWALE OKONKWO',
    verified: true,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [selectedBank, setSelectedBank] = useState(account?.bankName ?? NIGERIAN_BANKS[0].name);
  const [accountNumber, setAccountNumber] = useState(account?.accountNumber ?? '');
  const [accountName, setAccountName] = useState(account?.accountName ?? '');
  const [bankPickerVisible, setBankPickerVisible] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successBanner, setSuccessBanner] = useState(false);
  const [error, setError] = useState('');

  const handleAccountNumChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setAccountNumber(cleaned);
    setError('');

    // Simulate auto-verifying account name once 10 digits are typed
    if (cleaned.length === 10) {
      setVerifying(true);
      setTimeout(() => {
        setAccountName('ADEWALE OKONKWO');
        setVerifying(false);
      }, 700);
    } else {
      setAccountName('');
    }
  };

  const handleSave = () => {
    if (!accountNumber || accountNumber.length !== 10) {
      setError('Please enter a valid 10-digit account number.');
      return;
    }
    if (!accountName) {
      setError('Account name could not be verified yet.');
      return;
    }

    setSaving(true);
    setTimeout(() => {
      setAccount({
        bankName: selectedBank,
        accountNumber,
        accountName,
        verified: true,
      });
      setSaving(false);
      setIsEditing(false);
      setSuccessBanner(true);
      setTimeout(() => setSuccessBanner(false), 3000);
    }, 600);
  };

  const handleRemoveAccount = () => {
    Alert.alert(
      'Remove payout account',
      'Are you sure you want to remove this account? You will need to add an account to withdraw funds from your wallet.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setAccount(null);
            setAccountNumber('');
            setAccountName('');
            setIsEditing(true);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Payout account"
        rightAction={
          account && !isEditing
            ? { label: 'Edit', onPress: () => setIsEditing(true) }
            : undefined
        }
      />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Information badge */}
        <View style={styles.infoBanner}>
          <View style={styles.infoIconWrap}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Circle cx={12} cy={12} r={9} stroke={Colors.ink} strokeWidth={1.8} />
              <Path d="M12 8v4M12 16h.01" stroke={Colors.ink} strokeWidth={2} strokeLinecap="round" />
            </Svg>
          </View>
          <Text style={styles.infoText}>
            This is the bank account where your wallet funds will be sent whenever you withdraw.
          </Text>
        </View>

        {successBanner && (
          <View style={styles.successBanner}>
            <Text style={styles.successBannerText}>✓ Payout account updated successfully!</Text>
          </View>
        )}

        {/* Existing active account view */}
        {account && !isEditing ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <BankFavicon bankName={account.bankName} size={38} />
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>Verified</Text>
              </View>
            </View>

            <View style={styles.detailsGroup}>
              <Text style={styles.bankName}>{account.bankName}</Text>
              <Text style={styles.accountNumber}>{account.accountNumber}</Text>
              <Text style={styles.accountName}>{account.accountName}</Text>
            </View>

            <View style={styles.cardFooter}>
              <TouchableOpacity
                style={styles.changeBtn}
                onPress={() => setIsEditing(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.changeBtnText}>Change account</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={handleRemoveAccount}
                activeOpacity={0.8}
              >
                <Text style={styles.removeBtnText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Add / Edit Form */
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {account ? 'Update payout account' : 'Add payout bank account'}
            </Text>

            {/* Select Bank Picker trigger */}
            <Text style={styles.inputLabel}>Bank name</Text>
            <TouchableOpacity
              style={styles.selectBtn}
              onPress={() => setBankPickerVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.selectBtnText}>{selectedBank}</Text>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M6 9l6 6 6-6" stroke={Colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>

            {/* Account number input */}
            <TextInput
              label="Account number (NUBAN)"
              placeholder="0123456789"
              value={accountNumber}
              onChangeText={handleAccountNumChange}
              keyboardType="number-pad"
              maxLength={10}
            />

            {/* Verified Account Name display */}
            {verifying ? (
              <View style={styles.verifyingBox}>
                <Text style={styles.verifyingText}>Verifying account details…</Text>
              </View>
            ) : accountName ? (
              <View style={styles.verifiedBox}>
                <Text style={styles.verifiedLabel}>Account Name</Text>
                <Text style={styles.verifiedName}>{accountName}</Text>
                <Text style={styles.verifiedMatch}>✓ Match verified with NIBSS</Text>
              </View>
            ) : null}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.formActions}>
              <Button
                label={saving ? 'Saving…' : 'Save payout account'}
                onPress={handleSave}
                loading={saving}
                disabled={accountNumber.length !== 10 || !accountName || saving}
              />
              {account && (
                <Button
                  label="Cancel"
                  variant="ghost"
                  onPress={() => {
                    setIsEditing(false);
                    setError('');
                  }}
                />
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bank Picker Modal */}
      <Modal visible={bankPickerVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select your bank</Text>
              <TouchableOpacity onPress={() => setBankPickerVisible(false)}>
                <Text style={styles.modalClose}>Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.bankList}>
              {NIGERIAN_BANKS.map((b) => (
                <TouchableOpacity
                  key={b.name}
                  style={[styles.bankItem, selectedBank === b.name && styles.bankItemActive]}
                  onPress={() => {
                    setSelectedBank(b.name);
                    setBankPickerVisible(false);
                  }}
                >
                  <View style={styles.bankItemLeft}>
                    <BankFavicon bankName={b.name} size={24} />
                    <Text style={[styles.bankItemText, selectedBank === b.name && styles.bankItemTextActive]}>
                      {b.name}
                    </Text>
                  </View>
                  {selectedBank === b.name && (
                    <Text style={styles.bankCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.screen },
  content: {
    padding: Layout.screenPadding,
    paddingTop: 16,
    paddingBottom: Layout.contentBottomPadding,
    gap: 16,
  },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#E6F8EE',
    padding: 14,
    borderRadius: Radius.cardSm,
    borderWidth: 1.2,
    borderColor: Colors.green,
  },
  infoIconWrap: { flexShrink: 0 },
  infoText: {
    ...Typography.caption,
    color: Colors.ink,
    flex: 1,
    lineHeight: 18,
  },

  successBanner: {
    backgroundColor: Colors.green,
    padding: 12,
    borderRadius: Radius.cardSm,
    alignItems: 'center',
  },
  successBannerText: {
    ...Typography.label,
    color: Colors.ink,
    fontFamily: 'Syne_800ExtraBold',
  },

  // Active Card view
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    padding: 20,
    borderWidth: 1.5,
    borderColor: Colors.line,
    gap: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    backgroundColor: Colors.green,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  statusBadgeText: {
    ...Typography.captionSmall,
    color: Colors.ink,
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 11,
  },

  detailsGroup: {
    gap: 4,
  },
  bankName: {
    ...Typography.title,
    color: Colors.ink,
  },
  accountNumber: {
    ...Typography.amount,
    color: Colors.ink,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  accountName: {
    ...Typography.label,
    color: Colors.textSecondary,
    fontFamily: 'DMSans_700Bold',
    marginTop: 4,
  },

  cardFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
  changeBtn: {
    flex: 1,
    backgroundColor: Colors.ink,
    borderRadius: Radius.cardSm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  changeBtnText: {
    ...Typography.button,
    color: Colors.white,
    fontSize: 13,
  },
  removeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: Radius.cardSm,
    borderWidth: 1.5,
    borderColor: Colors.line,
    alignItems: 'center',
  },
  removeBtnText: {
    ...Typography.label,
    color: '#E8724A',
    fontSize: 13,
  },

  // Form Card
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    padding: 20,
    borderWidth: 1.5,
    borderColor: Colors.line,
    gap: 12,
  },
  formTitle: {
    ...Typography.title,
    color: Colors.ink,
    marginBottom: 4,
  },

  inputLabel: {
    ...Typography.label,
    color: Colors.textPrimary,
    marginBottom: -4,
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderRadius: Radius.cardSm,
    paddingHorizontal: 16,
    minHeight: 54,
    backgroundColor: Colors.white,
    marginBottom: 8,
  },
  selectBtnText: {
    ...Typography.body,
    color: Colors.ink,
  },

  verifyingBox: {
    backgroundColor: Colors.screen,
    padding: 12,
    borderRadius: Radius.cardSm,
    alignItems: 'center',
  },
  verifyingText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },

  verifiedBox: {
    backgroundColor: '#E6F8EE',
    padding: 14,
    borderRadius: Radius.cardSm,
    borderWidth: 1.2,
    borderColor: Colors.green,
    gap: 4,
    marginBottom: 4,
  },
  verifiedLabel: {
    ...Typography.captionSmall,
    color: Colors.textSecondary,
  },
  verifiedName: {
    ...Typography.label,
    color: Colors.ink,
    fontSize: 14,
  },
  verifiedMatch: {
    ...Typography.captionSmall,
    color: '#0D8C4B',
    fontFamily: 'DMSans_700Bold',
    marginTop: 2,
  },

  errorText: {
    ...Typography.caption,
    color: '#E8724A',
  },

  formActions: {
    gap: 8,
    marginTop: 12,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 24, 34, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.card,
    borderTopRightRadius: Radius.card,
    paddingHorizontal: Layout.screenPadding,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    ...Typography.title,
    color: Colors.ink,
  },
  modalClose: {
    ...Typography.button,
    color: Colors.green,
    fontFamily: 'Syne_800ExtraBold',
  },
  bankList: {
    maxHeight: 380,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: Radius.cardSm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  bankItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  bankItemActive: {
    backgroundColor: 'rgba(64, 206, 134, 0.08)',
  },
  bankItemText: {
    ...Typography.body,
    color: Colors.ink,
  },
  bankItemTextActive: {
    fontFamily: 'DMSans_700Bold',
  },
  bankCheck: {
    ...Typography.label,
    color: Colors.green,
    fontFamily: 'Syne_800ExtraBold',
  },
});
