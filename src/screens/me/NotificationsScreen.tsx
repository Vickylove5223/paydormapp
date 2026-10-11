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
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Layout, Radius } from '@/theme';
import { timeAgo } from '@/utils/date';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { useAppStore } from '@/store/app';

interface MockNotif {
  id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  readAt?: string | null;
}

const MOCK_NOTIFICATIONS: MockNotif[] = [
  {
    id: 'n1', type: 'payment_received', title: 'Payment received',
    body: 'Tolu Adeyemi paid ₦12,000 for August EKEDC.',
    createdAt: '2026-10-11T08:22:00Z', readAt: null,
  },
  {
    id: 'n2', type: 'bill_due_today', title: 'Bill due today',
    body: 'October Service Charge (₦5,000) is due today. Remind your tenants.',
    createdAt: '2026-10-11T07:00:00Z', readAt: null,
  },
  {
    id: 'n3', type: 'payment_received', title: 'Payment received',
    body: 'Kemi Okafor paid ₦5,000 for October Service Charge.',
    createdAt: '2026-10-10T16:45:00Z', readAt: '2026-10-10T17:00:00Z',
  },
  {
    id: 'n4', type: 'copartner_invited', title: 'Co-partner invite sent',
    body: 'Ngozi Eze has been invited to co-manage Lekki Gardens Estate.',
    createdAt: '2026-10-10T12:00:00Z', readAt: '2026-10-10T12:05:00Z',
  },
  {
    id: 'n5', type: 'wallet_topup', title: 'Wallet funded',
    body: 'Your wallet has been credited with ₦5,000 via Providus Bank.',
    createdAt: '2026-10-10T14:00:00Z', readAt: '2026-10-10T14:01:00Z',
  },
  {
    id: 'n6', type: 'bill_due_soon', title: 'Bill due in 3 days',
    body: 'Water Supply (₦3,500) is due on 15 Oct. 8 of 12 households have not paid.',
    createdAt: '2026-10-08T09:00:00Z', readAt: '2026-10-08T09:30:00Z',
  },
  {
    id: 'n7', type: 'payment_received', title: 'Payment received',
    body: 'Femi Adekunle paid ₦12,000 for August EKEDC.',
    createdAt: '2026-10-07T11:30:00Z', readAt: '2026-10-07T12:00:00Z',
  },
  {
    id: 'n8', type: 'new_bill_added', title: 'New bill created',
    body: 'You added October Service Charge for all 12 households.',
    createdAt: '2026-10-05T10:00:00Z', readAt: '2026-10-05T10:00:00Z',
  },
];

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

  const today = new Date().toDateString();
  const todayNotifs = MOCK_NOTIFICATIONS.filter((n) => new Date(n.createdAt).toDateString() === today);
  const earlierNotifs = MOCK_NOTIFICATIONS.filter((n) => new Date(n.createdAt).toDateString() !== today);

  const renderNotif = (item: MockNotif) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.notifRow, !item.readAt && styles.notifUnread]}
      onPress={() => {}}
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
      <ScreenHeader title="Notifications" />
      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={
          <>
            {todayNotifs.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Today</Text>
                {todayNotifs.map(renderNotif)}
              </>
            )}
            {earlierNotifs.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Earlier</Text>
                {earlierNotifs.map(renderNotif)}
              </>
            )}
          </>
        }
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.screen },
  list: { padding: Layout.screenPadding, paddingBottom: Layout.contentBottomPadding },
  sectionLabel: {
    ...Typography.captionSmall, color: Colors.textMuted,
    fontFamily: 'Syne_800ExtraBold', textTransform: 'uppercase',
    letterSpacing: 0.5, marginBottom: 8, marginTop: 8,
  },
  notifRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: Colors.white, borderRadius: Radius.cardSm,
    padding: 14, marginBottom: 8, gap: 12,
    borderWidth: 1, borderColor: Colors.line,
  },
  notifUnread: { borderColor: Colors.green, backgroundColor: Colors.mint },
  notifIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: Colors.screen, alignItems: 'center', justifyContent: 'center',
  },
  notifIconText: { fontSize: 20 },
  notifContent: { flex: 1, gap: 2 },
  notifTitle: { ...Typography.label, color: Colors.ink },
  notifBody: { ...Typography.caption, color: Colors.textSecondary, lineHeight: 18 },
  notifTime: { ...Typography.caption, color: Colors.textMuted, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.green, marginTop: 4 },
});
