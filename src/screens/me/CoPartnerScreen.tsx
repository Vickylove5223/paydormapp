import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput as RNTextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Colors, Typography, Layout, Radius } from '@/theme';
import { useAppStore } from '@/store/app';
import { api } from '@/api/client';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Button } from '@/components/common/Button';

interface CoPartner {
  membershipId: string;
  userId: string;
  name: string;
  share: number;
  shareMode: 'equal' | 'percent' | 'fixed';
  status: 'active' | 'invited';
}

const MOCK_PARTNERS: CoPartner[] = [
  { membershipId: 'cp1', userId: 'u1', name: 'Chisom Obi', share: 50, shareMode: 'percent', status: 'active' },
  { membershipId: 'cp2', userId: 'u2', name: 'Tunde Fashola', share: 50, shareMode: 'percent', status: 'active' },
  { membershipId: 'cp3', userId: 'u3', name: 'Ngozi Eze', share: 0, shareMode: 'equal', status: 'invited' },
];

// ── Invite Modal ──────────────────────────────────────────────────────────────
function InviteModal({
  visible,
  onClose,
  onSend,
}: {
  visible: boolean;
  onClose: () => void;
  onSend: (name: string, contact: string, shareMode: 'equal' | 'percent', percent: string) => void;
}) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [shareMode, setShareMode] = useState<'equal' | 'percent'>('equal');
  const [percent, setPercent] = useState('');
  const [sent, setSent] = useState(false);

  const reset = () => { setName(''); setContact(''); setShareMode('equal'); setPercent(''); setSent(false); };

  const handleSend = () => {
    if (!name.trim() || !contact.trim()) {
      Alert.alert('Please fill in name and phone / email.');
      return;
    }
    if (shareMode === 'percent' && (!percent || isNaN(Number(percent)) || Number(percent) <= 0)) {
      Alert.alert('Enter a valid percentage.');
      return;
    }
    setSent(true);
    onSend(name.trim(), contact.trim(), shareMode, percent);
    setTimeout(() => { reset(); onClose(); }, 1600);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetWrap}>
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          {sent ? (
            <View style={styles.sentState}>
              <Text style={styles.sentIcon}>✓</Text>
              <Text style={styles.sentTitle}>Invite sent!</Text>
              <Text style={styles.sentSub}>They'll get a link to join your compound.</Text>
            </View>
          ) : (
            <>
              <Text style={styles.sheetTitle}>Invite co-partner</Text>
              <Text style={styles.sheetSub}>They'll share bills and manage this compound with you.</Text>

              <Text style={styles.fieldLabel}>Full name</Text>
              <RNTextInput
                style={styles.field}
                placeholder="e.g. Adaeze Eze"
                value={name}
                onChangeText={setName}
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Phone or email</Text>
              <RNTextInput
                style={styles.field}
                placeholder="+234 800 000 0000 or name@email.com"
                value={contact}
                onChangeText={setContact}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Bill split</Text>
              <View style={styles.splitRow}>
                {(['equal', 'percent'] as const).map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.splitChip, shareMode === m && styles.splitChipActive]}
                    onPress={() => setShareMode(m)}
                  >
                    <Text style={[styles.splitChipText, shareMode === m && styles.splitChipTextActive]}>
                      {m === 'equal' ? 'Equal split' : 'Custom %'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {shareMode === 'percent' && (
                <>
                  <Text style={styles.fieldLabel}>Their percentage (%)</Text>
                  <RNTextInput
                    style={styles.field}
                    placeholder="e.g. 30"
                    value={percent}
                    onChangeText={setPercent}
                    keyboardType="numeric"
                    placeholderTextColor={Colors.textMuted}
                  />
                </>
              )}

              <View style={styles.sheetActions}>
                <Button label="Send invite" onPress={handleSend} />
                <Button label="Cancel" variant="ghost" onPress={() => { reset(); onClose(); }} />
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Edit Split Modal ───────────────────────────────────────────────────────────
function EditSplitModal({
  visible,
  partners,
  onClose,
  onSave,
}: {
  visible: boolean;
  partners: CoPartner[];
  onClose: () => void;
  onSave: (shares: Record<string, number>) => void;
}) {
  const active = partners.filter((p) => p.status === 'active');
  const [shares, setShares] = useState<Record<string, string>>(() =>
    Object.fromEntries(active.map((p) => [p.membershipId, String(p.share)]))
  );

  const total = active.reduce((s, p) => s + (Number(shares[p.membershipId]) || 0), 0);

  const handleSave = () => {
    if (Math.round(total) !== 100) {
      Alert.alert('Shares must add up to 100%', `Current total: ${total}%`);
      return;
    }
    onSave(Object.fromEntries(Object.entries(shares).map(([k, v]) => [k, Number(v)])));
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheetWrap}>
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Edit bill split</Text>
          <Text style={styles.sheetSub}>Percentages must add up to 100%.</Text>

          {active.map((p) => (
            <View key={p.membershipId} style={styles.editRow}>
              <View style={styles.editAvatar}>
                <Text style={styles.editAvatarText}>{p.name.charAt(0)}</Text>
              </View>
              <Text style={styles.editName}>{p.name}</Text>
              <View style={styles.editInputWrap}>
                <RNTextInput
                  style={styles.editInput}
                  value={shares[p.membershipId]}
                  onChangeText={(v) => setShares((prev) => ({ ...prev, [p.membershipId]: v }))}
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textMuted}
                />
                <Text style={styles.editPct}>%</Text>
              </View>
            </View>
          ))}

          <View style={[styles.totalRow, Math.round(total) !== 100 && styles.totalRowError]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={[styles.totalValue, Math.round(total) !== 100 && styles.totalValueError]}>
              {total}%
            </Text>
          </View>

          <View style={styles.sheetActions}>
            <Button label="Save split" onPress={handleSave} />
            <Button label="Cancel" variant="ghost" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export function CoPartnerScreen() {
  const { activeHouseholdId, role } = useAppStore();
  const queryClient = useQueryClient();
  const effectiveRole = role ?? 'landlord';
  const canManage = effectiveRole === 'master_tenant' || effectiveRole === 'landlord' || effectiveRole === 'agent';

  const [partners, setPartners] = useState<CoPartner[]>(MOCK_PARTNERS);
  const [showInvite, setShowInvite] = useState(false);
  const [showEditSplit, setShowEditSplit] = useState(false);

  useQuery({
    queryKey: ['copartners', activeHouseholdId],
    queryFn: () => api.get<CoPartner[]>(`/households/${activeHouseholdId}/members`),
    enabled: false,
  });

  const handleRemove = (partner: CoPartner) => {
    Alert.alert(
      `Remove ${partner.name}?`,
      'Choose how their unpaid share is handled.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Split their share', onPress: () => setPartners((p) => p.filter((x) => x.membershipId !== partner.membershipId)) },
        { text: "Don't split", style: 'destructive', onPress: () => setPartners((p) => p.filter((x) => x.membershipId !== partner.membershipId)) },
      ]
    );
  };

  const handleInviteSend = (name: string, _contact: string, shareMode: 'equal' | 'percent', percent: string) => {
    setPartners((prev) => [
      ...prev,
      {
        membershipId: `cp${Date.now()}`,
        userId: `u${Date.now()}`,
        name,
        share: shareMode === 'percent' ? Number(percent) : 0,
        shareMode,
        status: 'invited',
      },
    ]);
  };

  const handleSaveEditSplit = (newShares: Record<string, number>) => {
    setPartners((prev) =>
      prev.map((p) =>
        newShares[p.membershipId] !== undefined
          ? { ...p, share: newShares[p.membershipId], shareMode: 'percent' }
          : p
      )
    );
  };

  const renderPartner = ({ item }: { item: CoPartner }) => (
    <View style={styles.partnerCard}>
      <View style={styles.partnerAvatar}>
        <Text style={styles.partnerAvatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.partnerInfo}>
        <Text style={styles.partnerName}>{item.name}</Text>
        <Text style={styles.partnerShare}>
          {item.shareMode === 'equal' ? 'Equal share' :
           item.shareMode === 'percent' ? `${item.share}% of bills` :
           `₦${(item.share / 100).toFixed(0)} fixed`}
        </Text>
      </View>
      <View style={styles.partnerRight}>
        <View style={[styles.statusBadge, item.status === 'active' ? styles.statusActive : styles.statusInvited]}>
          <Text style={styles.statusText}>{item.status === 'active' ? 'Active' : 'Invited'}</Text>
        </View>
        {canManage && (
          <TouchableOpacity onPress={() => handleRemove(item)} style={styles.removeBtn}>
            <Text style={styles.removeBtnText}>Remove</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Co-partners" />
      <FlatList
        data={partners}
        renderItem={renderPartner}
        keyExtractor={(item) => item.membershipId}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          canManage ? (
            <View style={styles.listHeader}>
              <Button label="Invite" variant="accent" size="md" onPress={() => setShowInvite(true)} />
              <Button label="Edit split" variant="outline" size="md" onPress={() => setShowEditSplit(true)} />
            </View>
          ) : null
        }
      />

      <InviteModal visible={showInvite} onClose={() => setShowInvite(false)} onSend={handleInviteSend} />
      <EditSplitModal
        visible={showEditSplit}
        partners={partners}
        onClose={() => setShowEditSplit(false)}
        onSave={handleSaveEditSplit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.screen },
  list: { padding: Layout.screenPadding, paddingBottom: Layout.contentBottomPadding, gap: 12 },
  listHeader: { flexDirection: 'row', gap: 10, marginBottom: 4 },

  partnerCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: Radius.card,
    borderWidth: 1, borderColor: Colors.line, padding: 14, gap: 12,
  },
  partnerAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.mint, borderWidth: 1.5, borderColor: Colors.ink,
    alignItems: 'center', justifyContent: 'center',
  },
  partnerAvatarText: { ...Typography.label, color: Colors.ink },
  partnerInfo: { flex: 1 },
  partnerName: { ...Typography.label, color: Colors.ink },
  partnerShare: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  partnerRight: { alignItems: 'flex-end', gap: 6 },
  statusBadge: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 },
  statusActive: { backgroundColor: Colors.greenTint },
  statusInvited: { backgroundColor: Colors.violetTint },
  statusText: { ...Typography.captionSmall, color: Colors.ink, fontFamily: 'Syne_800ExtraBold' },
  removeBtn: { padding: 4 },
  removeBtnText: { ...Typography.caption, color: Colors.overdue, fontFamily: 'Syne_800ExtraBold' },

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
    padding: 12, ...Typography.body, color: Colors.ink,
    backgroundColor: Colors.screen,
  },
  splitRow: { flexDirection: 'row', gap: 8 },
  splitChip: {
    flex: 1, paddingVertical: 10, borderRadius: Radius.cardSm,
    borderWidth: 1.5, borderColor: Colors.line, alignItems: 'center',
    backgroundColor: Colors.white,
  },
  splitChipActive: { borderColor: Colors.ink, backgroundColor: Colors.mint },
  splitChipText: { ...Typography.caption, color: Colors.textSecondary },
  splitChipTextActive: { color: Colors.ink, fontFamily: 'Syne_800ExtraBold' },
  sheetActions: { gap: 8, marginTop: 8 },

  // Sent state
  sentState: { alignItems: 'center', gap: 8, paddingVertical: 24 },
  sentIcon: { fontSize: 40, color: Colors.green },
  sentTitle: { ...Typography.title, color: Colors.ink },
  sentSub: { ...Typography.caption, color: Colors.textSecondary, textAlign: 'center' },

  // Edit split
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  editAvatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.mint,
    borderWidth: 1.5, borderColor: Colors.ink, alignItems: 'center', justifyContent: 'center',
  },
  editAvatarText: { ...Typography.captionSmall, color: Colors.ink, fontFamily: 'Syne_800ExtraBold' },
  editName: { ...Typography.label, color: Colors.ink, flex: 1 },
  editInputWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editInput: {
    borderWidth: 1.5, borderColor: Colors.line, borderRadius: Radius.cardSm,
    paddingHorizontal: 10, paddingVertical: 6, width: 64,
    textAlign: 'right', ...Typography.label, color: Colors.ink,
  },
  editPct: { ...Typography.label, color: Colors.textSecondary },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: Colors.line, paddingTop: 12,
  },
  totalRowError: { borderTopColor: Colors.overdue },
  totalLabel: { ...Typography.label, color: Colors.textSecondary },
  totalValue: { ...Typography.label, color: Colors.ink },
  totalValueError: { color: Colors.overdue },
});
