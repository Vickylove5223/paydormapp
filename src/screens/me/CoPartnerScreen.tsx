import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors, Typography, Layout, Radius } from '@/theme';
import { useAppStore } from '@/store/app';
import { api } from '@/api/client';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Button } from '@/components/common/Button';
import { CardSkeleton } from '@/components/common/SkeletonLoader';
import { EmptyState } from '@/components/common/EmptyState';

interface CoPartner {
  membershipId: string;
  userId: string;
  name: string;
  share: number; // percentage or fixed amount
  shareMode: 'equal' | 'percent' | 'fixed';
  status: 'active' | 'invited';
}

export function CoPartnerScreen() {
  const { activeHouseholdId, role } = useAppStore();
  const queryClient = useQueryClient();
  const canManage = role === 'master_tenant' || role === 'landlord' || role === 'agent';

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['copartners', activeHouseholdId],
    queryFn: () => api.get<CoPartner[]>(`/households/${activeHouseholdId}/members`),
    enabled: !!activeHouseholdId,
  });

  const handleRemove = (partner: CoPartner) => {
    Alert.alert(
      `Remove ${partner.name}?`,
      'Choose how their unpaid share is handled.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: "Split their share",
          onPress: () => removeMember(partner.membershipId, 'split'),
        },
        {
          text: "Don't split",
          style: 'destructive',
          onPress: () => removeMember(partner.membershipId, 'no_split'),
        },
      ]
    );
  };

  const removeMember = async (membershipId: string, treatment: 'split' | 'no_split') => {
    try {
      await api.delete(`/households/${activeHouseholdId}/members/${membershipId}`, { treatment });
      queryClient.invalidateQueries({ queryKey: ['copartners', activeHouseholdId] });
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not remove member.');
    }
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
           item.shareMode === 'percent' ? `${item.share}%` :
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
      {isLoading ? (
        <View style={{ padding: Layout.screenPadding, gap: 12 }}>
          {[1, 2].map((i) => <CardSkeleton key={i} />)}
        </View>
      ) : !partners.length ? (
        <EmptyState
          title="No co-partners yet"
          subtitle="Invite housemates to split bills together."
          actionLabel={canManage ? 'Invite co-partner' : undefined}
          onAction={canManage ? () => {} : undefined}
        />
      ) : (
        <FlatList
          data={partners}
          renderItem={renderPartner}
          keyExtractor={(item) => item.membershipId}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            canManage ? (
              <View style={styles.listHeader}>
                <Button label="Invite co-partner" variant="accent" size="md" onPress={() => {}} />
                <Button label="Edit split" variant="outline" size="md" onPress={() => {}} />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.screen },
  list: {
    padding: Layout.screenPadding,
    paddingBottom: Layout.contentBottomPadding,
    gap: 12,
  },
  listHeader: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  partnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 14,
    gap: 12,
  },
  partnerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.mint,
    borderWidth: 1.5,
    borderColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerAvatarText: { ...Typography.label, color: Colors.ink },
  partnerInfo: { flex: 1 },
  partnerName: { ...Typography.label, color: Colors.ink },
  partnerShare: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  partnerRight: { alignItems: 'flex-end', gap: 6 },
  statusBadge: {
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusActive: { backgroundColor: Colors.greenTint },
  statusInvited: { backgroundColor: Colors.violetTint },
  statusText: { ...Typography.captionSmall, color: Colors.ink, fontFamily: 'Syne_800ExtraBold' },
  removeBtn: { padding: 4 },
  removeBtnText: { ...Typography.caption, color: Colors.overdue, fontFamily: 'Syne_800ExtraBold' },
});
