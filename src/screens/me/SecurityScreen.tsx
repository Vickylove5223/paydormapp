import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Layout, Radius, Spacing } from '@/theme';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { TextInput } from '@/components/common/TextInput';
import { Button } from '@/components/common/Button';
import { useSecurityStore } from '@/store/security';

export function SecurityScreen() {
  const {
    biometricsEnabled,
    pinEnabled,
    pinCode,
    setBiometricsEnabled,
    setPin,
    removePin,
  } = useSecurityStore();

  // PIN modal state
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinStep, setPinStep] = useState<'create' | 'confirm'>('create');
  const [tempPin, setTempPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Manage PIN modal (when PIN already active)
  const [showManagePinModal, setShowManagePinModal] = useState(false);

  // Change password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Success toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ── Biometrics ─────────────────────────────────────────────────────────────
  const handleToggleBiometrics = (val: boolean) => {
    setBiometricsEnabled(val);
    if (val) {
      showToast('Biometric lock enabled! Face ID / Fingerprint is now active.');
    } else {
      showToast('Biometric lock disabled.');
    }
  };

  // ── PIN Setup / Flow ────────────────────────────────────────────────────────
  const openPinSetup = () => {
    setPinStep('create');
    setTempPin('');
    setConfirmPin('');
    setPinError('');
    setShowPinModal(true);
  };

  const handlePinPress = (digit: string) => {
    setPinError('');
    if (pinStep === 'create') {
      if (tempPin.length < 6) {
        const next = tempPin + digit;
        setTempPin(next);
        if (next.length === 6) {
          setTimeout(() => {
            setPinStep('confirm');
          }, 200);
        }
      }
    } else {
      if (confirmPin.length < 6) {
        const next = confirmPin + digit;
        setConfirmPin(next);
        if (next.length === 6) {
          if (next === tempPin) {
            setPin(next);
            setTimeout(() => {
              setShowPinModal(false);
              showToast('6-digit PIN successfully configured! ✓');
            }, 250);
          } else {
            setPinError('PINs do not match. Please try again.');
            setTimeout(() => {
              setConfirmPin('');
              setPinStep('create');
              setTempPin('');
            }, 1000);
          }
        }
      }
    }
  };

  const handlePinBackspace = () => {
    setPinError('');
    if (pinStep === 'create') {
      setTempPin((prev) => prev.slice(0, -1));
    } else {
      setConfirmPin((prev) => prev.slice(0, -1));
    }
  };

  const handleRowPinClick = () => {
    if (pinEnabled && pinCode) {
      setShowManagePinModal(true);
    } else {
      openPinSetup();
    }
  };

  const handleRemovePin = () => {
    removePin();
    setShowManagePinModal(false);
    showToast('PIN lock disabled.');
  };

  // ── Change Password ────────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    setPasswordError('');
    if (!currentPassword) {
      setPasswordError('Please enter your current password');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      // Simulate API call
      await new Promise((r) => setTimeout(r, 800));
      setPasswordSuccess(true);
      setTimeout(() => {
        setPasswordSuccess(false);
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showToast('Password updated successfully! ✓');
      }, 1200);
    } catch {
      setPasswordError('Failed to change password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const currentPinInput = pinStep === 'create' ? tempPin : confirmPin;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Security" />

      {/* Toast Notification */}
      {toastMessage && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        {/* Main Security Settings Card */}
        <View style={styles.card}>
          {/* Biometrics */}
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Biometric lock</Text>
              <Text style={styles.rowSubtitle}>
                {biometricsEnabled
                  ? 'Face ID / Fingerprint lock is active'
                  : 'Use Face ID or fingerprint to open the app'}
              </Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={handleToggleBiometrics}
              trackColor={{ false: Colors.line, true: Colors.green }}
              thumbColor={Colors.white}
            />
          </View>

          <View style={styles.divider} />

          {/* PIN Lock */}
          <TouchableOpacity
            style={styles.row}
            onPress={handleRowPinClick}
            activeOpacity={0.7}
          >
            <View style={styles.rowText}>
              <View style={styles.titleRow}>
                <Text style={styles.rowTitle}>PIN lock</Text>
                {pinEnabled && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>ACTIVE</Text>
                  </View>
                )}
              </View>
              <Text style={styles.rowSubtitle}>
                {pinEnabled
                  ? '6-digit PIN configured (••••••) — Tap to manage'
                  : 'Set a 6-digit PIN'}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Password Card */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => {
              setPasswordError('');
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setShowPasswordModal(true);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Change password</Text>
              <Text style={styles.rowSubtitle}>Update your login password regularly</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Manage Existing PIN Modal ────────────────────────────────────── */}
      <Modal
        visible={showManagePinModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowManagePinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowManagePinModal(false)}
          />
          <View style={styles.manageSheet}>
            <Text style={styles.modalSheetTitle}>PIN Lock Options</Text>
            <Text style={styles.modalSheetSubtitle}>
              Your 6-digit PIN lock is currently active.
            </Text>

            <View style={styles.manageActions}>
              <TouchableOpacity
                style={styles.manageBtnPrimary}
                onPress={() => {
                  setShowManagePinModal(false);
                  openPinSetup();
                }}
              >
                <Text style={styles.manageBtnPrimaryText}>Change 6-digit PIN</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.manageBtnDanger}
                onPress={handleRemovePin}
              >
                <Text style={styles.manageBtnDangerText}>Disable PIN lock</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.manageBtnCancel}
                onPress={() => setShowManagePinModal(false)}
              >
                <Text style={styles.manageBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Set PIN Modal ────────────────────────────────────────────────── */}
      <Modal
        visible={showPinModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowPinModal(false)}
          />
          <View style={styles.pinSheet}>
            {/* Modal Close */}
            <View style={styles.pinHeader}>
              <Text style={styles.pinHeaderTitle}>
                {pinStep === 'create' ? 'Set 6-digit PIN' : 'Confirm 6-digit PIN'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowPinModal(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.pinInstruction}>
              {pinStep === 'create'
                ? 'Choose a 6-digit PIN you will remember'
                : 'Re-enter your 6-digit PIN to confirm'}
            </Text>

            {/* 6 Dots */}
            <View style={styles.dotsRow}>
              {[0, 1, 2, 3, 4, 5].map((idx) => {
                const isFilled = currentPinInput.length > idx;
                return (
                  <View
                    key={idx}
                    style={[
                      styles.pinDot,
                      isFilled && styles.pinDotFilled,
                      pinError ? styles.pinDotError : null,
                    ]}
                  />
                );
              })}
            </View>

            {pinError ? (
              <Text style={styles.pinErrorText}>{pinError}</Text>
            ) : (
              <View style={{ height: 20 }} />
            )}

            {/* Keypad */}
            <View style={styles.keypad}>
              {[
                ['1', '2', '3'],
                ['4', '5', '6'],
                ['7', '8', '9'],
                ['', '0', '⌫'],
              ].map((row, rIdx) => (
                <View key={rIdx} style={styles.keypadRow}>
                  {row.map((k, cIdx) => {
                    if (k === '') {
                      return <View key={cIdx} style={styles.keyEmpty} />;
                    }
                    if (k === '⌫') {
                      return (
                        <TouchableOpacity
                          key={cIdx}
                          style={styles.keyBtn}
                          onPress={handlePinBackspace}
                          activeOpacity={0.6}
                        >
                          <Text style={styles.backspaceKey}>⌫</Text>
                        </TouchableOpacity>
                      );
                    }
                    return (
                      <TouchableOpacity
                        key={cIdx}
                        style={styles.keyBtn}
                        onPress={() => handlePinPress(k)}
                        activeOpacity={0.6}
                      >
                        <Text style={styles.keyDigit}>{k}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Change Password Modal ────────────────────────────────────────── */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowPasswordModal(false)}
          />
          <View style={styles.passwordSheet}>
            <View style={styles.passwordHeader}>
              <View>
                <Text style={styles.modalSheetTitle}>Change Password</Text>
                <Text style={styles.modalSheetSubtitle}>
                  Enter your current and new password
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowPasswordModal(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.passwordFormContent}
              keyboardShouldPersistTaps="handled"
            >
              {passwordError ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{passwordError}</Text>
                </View>
              ) : null}

              {passwordSuccess ? (
                <View style={styles.successBanner}>
                  <Text style={styles.successBannerText}>
                    Password updated successfully! ✓
                  </Text>
                </View>
              ) : null}

              <TextInput
                label="Current password"
                placeholder="Enter current password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrentPass}
                rightIcon={
                  <Text style={styles.eyeIcon}>
                    {showCurrentPass ? '🙈' : '👁️'}
                  </Text>
                }
                onRightIconPress={() => setShowCurrentPass(!showCurrentPass)}
              />

              <TextInput
                label="New password"
                placeholder="At least 8 characters"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPass}
                rightIcon={
                  <Text style={styles.eyeIcon}>
                    {showNewPass ? '🙈' : '👁️'}
                  </Text>
                }
                onRightIconPress={() => setShowNewPass(!showNewPass)}
              />

              <TextInput
                label="Confirm new password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPass}
                rightIcon={
                  <Text style={styles.eyeIcon}>
                    {showConfirmPass ? '🙈' : '👁️'}
                  </Text>
                }
                onRightIconPress={() => setShowConfirmPass(!showConfirmPass)}
              />

              <Button
                label={passwordSuccess ? 'Updated ✓' : 'Update password'}
                onPress={handleChangePassword}
                loading={passwordLoading}
                variant={passwordSuccess ? 'accent' : 'primary'}
                style={{ marginTop: 8 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.screen },
  content: { padding: Layout.screenPadding, gap: 16 },
  toast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: Colors.ink,
    borderRadius: Radius.cardSm,
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 999,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    ...Typography.bodySmall,
    color: Colors.white,
    fontFamily: 'DMSans_500Medium',
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.line,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  rowText: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowTitle: { ...Typography.label, color: Colors.ink },
  activeBadge: {
    backgroundColor: Colors.greenTint,
    borderRadius: Radius.chip,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.green,
  },
  activeBadgeText: {
    fontSize: 9,
    fontFamily: 'Syne_800ExtraBold',
    color: Colors.ink,
  },
  rowSubtitle: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  chevron: { fontSize: 20, color: Colors.textMuted },
  divider: { height: 1, backgroundColor: Colors.line, marginHorizontal: 16 },

  // Modals generic
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 24, 34, 0.55)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    color: Colors.ink,
    fontWeight: '700',
  },
  modalSheetTitle: {
    ...Typography.title,
    color: Colors.ink,
  },
  modalSheetSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Manage PIN sheet
  manageSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderWidth: 2,
    borderColor: Colors.ink,
    borderBottomWidth: 0,
    gap: 8,
  },
  manageActions: {
    marginTop: 16,
    gap: 10,
  },
  manageBtnPrimary: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.button,
    paddingVertical: 14,
    alignItems: 'center',
  },
  manageBtnPrimaryText: {
    ...Typography.button,
    color: Colors.white,
  },
  manageBtnDanger: {
    backgroundColor: Colors.peachTint,
    borderRadius: Radius.button,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.overdue,
  },
  manageBtnDangerText: {
    ...Typography.button,
    color: Colors.overdue,
  },
  manageBtnCancel: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  manageBtnCancelText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontFamily: 'DMSans_700Bold',
  },

  // Set PIN Sheet
  pinSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    borderWidth: 2,
    borderColor: Colors.ink,
    borderBottomWidth: 0,
    alignItems: 'center',
  },
  pinHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pinHeaderTitle: {
    ...Typography.title,
    color: Colors.ink,
  },
  pinInstruction: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  pinDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.line,
    backgroundColor: Colors.screen,
  },
  pinDotFilled: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
    transform: [{ scale: 1.15 }],
  },
  pinDotError: {
    borderColor: Colors.overdue,
    backgroundColor: Colors.peachTint,
  },
  pinErrorText: {
    ...Typography.caption,
    color: Colors.overdue,
    fontFamily: 'DMSans_700Bold',
    height: 20,
    marginBottom: 4,
  },

  // Keypad
  keypad: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
    marginTop: 8,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  keyBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.screen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.line,
  },
  keyEmpty: {
    width: 68,
    height: 68,
  },
  keyDigit: {
    ...Typography.title,
    fontSize: 24,
    fontFamily: 'Syne_800ExtraBold',
    color: Colors.ink,
  },
  backspaceKey: {
    fontSize: 22,
    color: Colors.ink,
    fontWeight: '700',
  },

  // Password Sheet
  passwordSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    borderWidth: 2,
    borderColor: Colors.ink,
    borderBottomWidth: 0,
    maxHeight: '88%',
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  passwordFormContent: {
    paddingBottom: 16,
    gap: 4,
  },
  eyeIcon: {
    fontSize: 16,
  },
  errorBanner: {
    backgroundColor: Colors.peachTint,
    borderRadius: Radius.cardSm,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.overdue,
    marginBottom: 12,
  },
  errorBannerText: {
    ...Typography.caption,
    color: Colors.overdue,
    fontFamily: 'DMSans_700Bold',
  },
  successBanner: {
    backgroundColor: Colors.greenTint,
    borderRadius: Radius.cardSm,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.green,
    marginBottom: 12,
  },
  successBannerText: {
    ...Typography.caption,
    color: Colors.ink,
    fontFamily: 'DMSans_700Bold',
  },
});
