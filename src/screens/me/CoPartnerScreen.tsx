import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput as RNTextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Colors, Typography, Layout, Radius, FontFamily } from '@/theme';
import Svg, { Path, Rect, Circle, Ellipse } from 'react-native-svg';
import { useAppStore } from '@/store/app';
import { api } from '@/api/client';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Button } from '@/components/common/Button';

function DefaultAvatarIcon({ size = 44 }: { size?: number }) {
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

interface CoPartner {
  membershipId: string;
  userId: string;
  name: string;
  share: number;
  shareMode: 'equal' | 'percent' | 'fixed';
  status: 'active' | 'invited';
  onboardedAt?: string;
}

const MOCK_PARTNERS: CoPartner[] = [
  { membershipId: 'cp1', userId: 'u1', name: 'Chisom Obi', share: 50, shareMode: 'percent', status: 'active', onboardedAt: '10 Oct 2026, 2:30 PM' },
  { membershipId: 'cp2', userId: 'u2', name: 'Tunde Fashola', share: 50, shareMode: 'percent', status: 'active', onboardedAt: '8 Oct 2026, 11:15 AM' },
  { membershipId: 'cp3', userId: 'u3', name: 'Ngozi Eze', share: 0, shareMode: 'equal', status: 'invited', onboardedAt: '11 Oct 2026, 9:45 AM' },
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
  const [copied, setCopied] = useState(false);

  const inviteLink = 'https://paydorm.app/join?code=LGE-3B-COPARTNER';

  const reset = () => { setName(''); setContact(''); setShareMode('equal'); setPercent(''); setSent(false); setCopied(false); };

  const handleCopyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(inviteLink).catch(() => {});
    }
    Alert.alert('Invite link copied!', 'You can now paste and send this link to your co-partner via WhatsApp, SMS, or message.');
  };

  const handleShareLink = async () => {
    try {
      await Share.share({
        message: `Join me as a co-partner on PayDorm to split and manage our bills together: ${inviteLink}`,
        url: inviteLink,
        title: 'PayDorm Co-Partner Invite',
      });
    } catch {
      handleCopyLink();
    }
  };

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
    setTimeout(() => { reset(); onClose(); }, 1800);
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
              <Text style={styles.sentSub}>They will get an invitation to join your compound as a co-partner.</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.sheetTitle}>Invite co-partner</Text>
              <Text style={styles.sheetSub}>Share your invite link or send directly to split bills together.</Text>

              {/* Copyable Link Box */}
              <View style={styles.inviteLinkCard}>
                <Text style={styles.inviteLinkLabel}>SHAREABLE INVITE LINK</Text>
                <View style={styles.inviteLinkRow}>
                  <Text style={styles.inviteLinkText} numberOfLines={1}>
                    {inviteLink}
                  </Text>
                  <TouchableOpacity
                    style={[styles.copyLinkBtn, copied && styles.copyLinkBtnSuccess]}
                    onPress={handleCopyLink}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.copyLinkText, copied && styles.copyLinkTextSuccess]}>
                      {copied ? 'Copied ✓' : 'Copy'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.shareLinkBtn}
                  onPress={handleShareLink}
                  activeOpacity={0.8}
                >
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      stroke={Colors.ink}
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                  <Text style={styles.shareLinkBtnText}>Share via WhatsApp / App</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.orDividerRow}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>OR INVITE VIA CONTACT</Text>
                <View style={styles.orLine} />
              </View>

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
                <Button label="Send direct invite" onPress={handleSend} />
                <Button label="Cancel" variant="ghost" onPress={() => { reset(); onClose(); }} />
              </View>
            </ScrollView>
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
                <DefaultAvatarIcon size={36} />
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
        <DefaultAvatarIcon size={44} />
      </View>
      <View style={styles.partnerInfo}>
        <View style={styles.partnerNameRow}>
          <Text style={styles.partnerName}>{item.name}</Text>
          <View style={[styles.statusTag, item.status === 'active' ? styles.statusTagActive : styles.statusTagInvited]}>
            <Text style={[styles.statusTagText, item.status === 'active' ? styles.statusTagTextActive : styles.statusTagTextInvited]}>
              {item.status === 'active' ? 'Active' : 'Pending invite'}
            </Text>
          </View>
        </View>
        <Text style={styles.partnerShare}>
          {item.status === 'invited'
            ? `Invited: ${item.onboardedAt ?? '11 Oct 2026, 9:45 AM'}`
            : `Onboarded: ${item.onboardedAt ?? '10 Oct 2026, 2:30 PM'}`}
        </Text>
      </View>
      <View style={styles.partnerRight}>
        {canManage && (
          <TouchableOpacity
            onPress={() => handleRemove(item)}
            style={styles.removeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={`Remove ${item.name}`}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"
                stroke={Colors.overdue}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M10 11v6M14 11v6"
                stroke={Colors.overdue}
                strokeWidth={1.8}
                strokeLinecap="round"
              />
            </Svg>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Co-partners"
        align="left"
        rightAction={
          canManage ? (
            <TouchableOpacity
              style={styles.headerInviteBtn}
              onPress={() => setShowInvite(true)}
              activeOpacity={0.7}
            >
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 5v14M5 12h14"
                  stroke={Colors.ink}
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.headerInviteText}>Invite</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />
      <FlatList
        data={partners}
        renderItem={renderPartner}
        keyExtractor={(item) => item.membershipId}
        contentContainerStyle={styles.list}
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
  headerInviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  headerInviteText: {
    ...Typography.caption,
    fontFamily: FontFamily.dmSansBold,
    color: Colors.ink,
  },

  partnerCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: Radius.card,
    borderWidth: 1, borderColor: Colors.line, padding: 14, gap: 12,
  },
  partnerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  partnerInfo: { flex: 1 },
  partnerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  partnerName: { ...Typography.label, color: Colors.ink },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusTagActive: {
    backgroundColor: '#E6F8EE',
  },
  statusTagInvited: {
    backgroundColor: 'rgba(169, 139, 255, 0.18)',
  },
  statusTagText: {
    ...Typography.captionSmall,
    fontSize: 11,
    fontFamily: 'DMSans_700Bold',
  },
  statusTagTextActive: {
    color: '#0D8C4B',
  },
  statusTagTextInvited: {
    color: '#6035D0',
  },
  partnerShare: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  partnerRight: { alignItems: 'flex-end', justifyContent: 'center' },
  removeBtn: {
    padding: 6,
    borderRadius: Radius.cardSm,
    alignItems: 'center',
    justifyContent: 'center',
  },

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
  // Invite link card styles
  inviteLinkCard: {
    backgroundColor: '#F7FAF8',
    borderRadius: Radius.cardSm,
    borderWidth: 1.5,
    borderColor: Colors.line,
    padding: 14,
    gap: 10,
    marginTop: 10,
    marginBottom: 6,
  },
  inviteLinkLabel: {
    ...Typography.captionSmall,
    color: Colors.textSecondary,
    fontSize: 10,
    letterSpacing: 0.8,
    fontFamily: 'DMSans_700Bold',
  },
  inviteLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1.2,
    borderColor: Colors.line,
    borderRadius: Radius.cardSm,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    gap: 8,
  },
  inviteLinkText: {
    ...Typography.caption,
    color: Colors.ink,
    flex: 1,
    fontFamily: 'DMSans_500Medium',
  },
  copyLinkBtn: {
    backgroundColor: Colors.ink,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  copyLinkBtnSuccess: {
    backgroundColor: Colors.green,
  },
  copyLinkText: {
    ...Typography.captionSmall,
    color: Colors.white,
    fontFamily: 'Syne_800ExtraBold',
  },
  copyLinkTextSuccess: {
    color: Colors.ink,
  },
  shareLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.mint,
    borderWidth: 1.2,
    borderColor: Colors.ink,
    borderRadius: 10,
    paddingVertical: 10,
  },
  shareLinkBtnText: {
    ...Typography.captionSmall,
    color: Colors.ink,
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 12,
  },
  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.line,
  },
  orText: {
    ...Typography.captionSmall,
    color: Colors.textMuted,
    fontSize: 10,
    letterSpacing: 0.8,
    fontFamily: 'DMSans_700Bold',
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
  sheetActions: { gap: 8, marginTop: 12 },

  // Sent state
  sentState: { alignItems: 'center', gap: 8, paddingVertical: 24 },
  sentIcon: { fontSize: 40, color: Colors.green },
  sentTitle: { ...Typography.title, color: Colors.ink },
  sentSub: { ...Typography.caption, color: Colors.textSecondary, textAlign: 'center' },

  // Edit split
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  editAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
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
