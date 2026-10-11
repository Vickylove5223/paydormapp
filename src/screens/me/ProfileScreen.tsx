import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { Colors, Typography, Layout, Radius } from '@/theme';
import { useAuthStore } from '@/store/auth';
import { api } from '@/api/client';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { TextInput } from '@/components/common/TextInput';
import { Button } from '@/components/common/Button';
import { UserAvatar, MASCOT_LIBRARY } from '@/components/common/UserAvatar';

export function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      whatsappNumber: user?.whatsappNumber ?? '',
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const updated = await api.patch<typeof user>('/me', data);
      updateUser(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const handleUploadPhoto = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            if (result) {
              updateUser({ avatarUrl: result });
              setShowAvatarModal(false);
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      Alert.alert('Upload Photo', 'Please select a mascot from our library or upload via web browser.');
    }
  };

  const handleSelectMascot = (mascotId: string) => {
    updateUser({ avatarUrl: mascotId });
  };

  const currentAvatar = user?.avatarUrl || 'mascot:piggy';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Profile" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Avatar Section */}
        <View style={styles.avatarRow}>
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={() => setShowAvatarModal(true)}
            activeOpacity={0.8}
          >
            <UserAvatar size={76} avatarUrl={user?.avatarUrl} />
            <View style={styles.cameraBadge}>
              <Text style={styles.cameraBadgeIcon}>📷</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.avatarMeta}>
            <Text style={styles.residentLabel}>Resident ID</Text>
            <Text style={styles.residentId}>{user?.residentId ?? '—'}</Text>
            <TouchableOpacity
              onPress={() => setShowAvatarModal(true)}
              style={styles.changeAvatarBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.changeAvatarText}>Change avatar ›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Controller
          control={control}
          name="firstName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="First name" value={value} onChangeText={onChange} onBlur={onBlur} />
          )}
        />
        <Controller
          control={control}
          name="lastName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Last name" value={value} onChangeText={onChange} onBlur={onBlur} />
          )}
        />
        <Controller
          control={control}
          name="whatsappNumber"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="WhatsApp number" value={value} onChangeText={onChange} onBlur={onBlur} keyboardType="phone-pad" />
          )}
        />

        <TextInput
          label="Email address"
          value={user?.email ?? ''}
          editable={false}
          rightIcon={<Text style={styles.lockIcon}>🔒</Text>}
          containerStyle={styles.emailWrapper}
        />

        <Button
          label={saved ? 'Saved ✓' : 'Save changes'}
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          variant={saved ? 'accent' : 'primary'}
        />
      </ScrollView>

      {/* Avatar Picker Modal */}
      <Modal
        visible={showAvatarModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowAvatarModal(false)}
          />
          <View style={styles.modalSheet}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Choose Avatar</Text>
                <Text style={styles.modalSubtitle}>Upload a custom photo or choose a mascot</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowAvatarModal(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Upload Image Option */}
              <TouchableOpacity
                style={styles.uploadCard}
                onPress={handleUploadPhoto}
                activeOpacity={0.8}
              >
                <View style={styles.uploadIconWrap}>
                  <Text style={styles.uploadIcon}>📷</Text>
                </View>
                <View style={styles.uploadMeta}>
                  <Text style={styles.uploadTitle}>Upload custom photo</Text>
                  <Text style={styles.uploadDesc}>Select an image or selfie from your device</Text>
                </View>
                <View style={styles.uploadArrow}>
                  <Text style={styles.uploadArrowText}>↑</Text>
                </View>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR PICK FROM MASCOT LIBRARY</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Mascot Grid */}
              <View style={styles.mascotGrid}>
                {MASCOT_LIBRARY.map((m) => {
                  const isSelected = currentAvatar === m.id;
                  return (
                    <TouchableOpacity
                      key={m.id}
                      style={[
                        styles.mascotCard,
                        isSelected && styles.mascotCardSelected,
                      ]}
                      onPress={() => handleSelectMascot(m.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.mascotAvatarHolder}>
                        <UserAvatar size={54} avatarUrl={m.id} />
                        {isSelected && (
                          <View style={styles.selectedBadge}>
                            <Text style={styles.selectedBadgeText}>✓</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.mascotName}>{m.name}</Text>
                      <Text style={styles.mascotRole} numberOfLines={1}>{m.subtitle}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Done button */}
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => setShowAvatarModal(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
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
    paddingTop: 24,
    gap: 4,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 28,
  },
  avatarWrap: {
    position: 'relative',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.screen,
  },
  cameraBadgeIcon: {
    fontSize: 12,
  },
  avatarMeta: {
    flex: 1,
    gap: 2,
  },
  residentLabel: { ...Typography.caption, color: Colors.textMuted },
  residentId: { ...Typography.label, color: Colors.ink },
  changeAvatarBtn: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  changeAvatarText: {
    ...Typography.caption,
    color: Colors.green,
    fontFamily: 'DMSans_700Bold',
  },
  emailWrapper: {
    marginBottom: 20,
  },
  lockIcon: {
    fontSize: 14,
    opacity: 0.6,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 24, 34, 0.55)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    borderWidth: 2,
    borderColor: Colors.ink,
    borderBottomWidth: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    ...Typography.title,
    color: Colors.ink,
  },
  modalSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
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
  modalScrollContent: {
    paddingBottom: 16,
    gap: 16,
  },
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: Colors.greenTint,
    borderRadius: Radius.card,
    borderWidth: 2,
    borderColor: Colors.ink,
    gap: 12,
  },
  uploadIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.mint,
    borderWidth: 1.5,
    borderColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIcon: {
    fontSize: 20,
  },
  uploadMeta: {
    flex: 1,
  },
  uploadTitle: {
    ...Typography.label,
    color: Colors.ink,
  },
  uploadDesc: {
    ...Typography.captionSmall,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  uploadArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadArrowText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 14,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...Typography.captionSmall,
    color: Colors.textMuted,
    fontFamily: 'Syne_700Bold',
    letterSpacing: 0.5,
  },
  mascotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  mascotCard: {
    width: '31%',
    backgroundColor: Colors.screen,
    borderRadius: Radius.cardSm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mascotCardSelected: {
    borderColor: Colors.ink,
    borderWidth: 2,
    backgroundColor: Colors.greenTint,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  mascotAvatarHolder: {
    position: 'relative',
    marginBottom: 6,
  },
  selectedBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.ink,
  },
  selectedBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  mascotName: {
    ...Typography.caption,
    fontFamily: 'Syne_800ExtraBold',
    color: Colors.ink,
    textAlign: 'center',
  },
  mascotRole: {
    ...Typography.captionSmall,
    color: Colors.textMuted,
    textAlign: 'center',
    fontSize: 9,
    marginTop: 1,
  },
  doneBtn: {
    backgroundColor: Colors.ink,
    borderRadius: 99,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  doneBtnText: {
    ...Typography.button,
    color: Colors.white,
  },
});
