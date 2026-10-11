import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Layout, Radius } from '@/theme';
import { api } from '@/api/client';
import { AppNotification } from '@/types';
import { timeAgo, relativeDate } from '@/utils/date';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { CardSkeleton } from '@/components/common/SkeletonLoader';
import { EmptyState } from '@/components/common/EmptyState';
import { useAppStore } from '@/store/app';

const NOTIF_ICONS: Record<string, string> = {
  bill_due_soon: '🔔',
  bill_due_today: '⚡',
  payment_received: '✅',
  payment_success: '✅',
  payment_failed: '❌',
  new_bill_added: '📋',
  copartner_invited: '🤝',
  copartner_removed: '👋',
  removal_needs_decision: '⚠️',
  wallet_topup: '💰',
  wallet_withdrawal: '💸',
  direct_debit_result: '🏦',
};

export function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const clearUnread = useAppStore((s) => s.clearUnread);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<{ notifications: AppNotification[] }>('/notifications'),
  });

  const markAllRead = async () => {
    await api.post('/notifications/read-all', {});
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    clearUnread();
  };

  const markOneRead = async (id: string) => {
    await api.post(`/notifications/${id}/read`, {});
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const today = new Date().toDateString();
  const notifications = data?.notifications ?? [];
  const todayNotifs = notifications.filter(
    (n) => new Date(n.createdAt).toDateString() === today
  );
  const earlierNotifs = notifications.filter(
    (n) => new Date(n.createdAt).toDateString() !== today
  );

  const renderNotif = ({ item }: { item: AppNotification }) => (
    <TouchableOpacity
      style={[styles.notifRow, !item.readAt && styles.notifUnread]}
      onPress={() => {
        markOneRead(item.id);
        // Navigate to linked screen based on data
      }}
      activeOpacity={0.8}
    >
      <View style={styles.notifIcon}>
        <Text style={styles.notifIconText}>{NOTIF_ICONS[item.type] ?? '📩'}</Text>
      </View>
      <View style={styles.notifContent}>
        <Text style={styles.notifTitle}>{item.title}</Text>
        <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.notifTime}>{timeAgo(item.createdAt)}</Text>
      </View>
      {!item.readAt && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Notifications"
        rightAction={
          notifications.some((n) => !n.readAt) ? (
            <TouchableOpacity onPress={markAllRead}>
              <Text style={styles.markAll}>Mark all</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />
      {isLoading ? (
        <View style={{ padding: Layout.screenPadding, gap: 12 }}>
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </View>
      ) : notifications.length === 0 ? (
        <EmptyState
          title="You're all caught up"
          subtitle="Notifications about bills, payments and housemates show up here."
        />
      ) : (
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={
            <>
              {todayNotifs.length > 0 && (
                <>
                  <Text style={styles.sectionLabel}>Today</Text>
                  {todayNotifs.map((n) => renderNotif({ item: n }))}
                </>
              )}
              {earlierNotifs.length > 0 && (
                <>
                  <Text style={styles.sectionLabel}>Earlier</Text>
                  {earlierNotifs.map((n) => renderNotif({ item: n }))}
                </>
              )}
            </>
          }
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.green} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.screen },
  markAll: { ...Typography.captionSmall, color: Colors.ink, fontFamily: 'Syne_800ExtraBold' },
  list: {
    padding: Layout.screenPadding,
    paddingBottom: Layout.contentBottomPadding,
  },
  sectionLabel: {
    ...Typography.captionSmall,
    color: Colors.textMuted,
    fontFamily: 'Syne_800ExtraBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 8,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: Radius.cardSm,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  notifUnread: {
    borderColor: Colors.green,
    backgroundColor: Colors.mint,
  },
  notifIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.screen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifIconText: { fontSize: 20 },
  notifContent: { flex: 1, gap: 2 },
  notifTitle: { ...Typography.label, color: Colors.ink },
  notifBody: { ...Typography.caption, color: Colors.textSecondary, lineHeight: 18 },
  notifTime: { ...Typography.caption, color: Colors.textMuted, marginTop: 4 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.green,
    marginTop: 4,
  },
});
