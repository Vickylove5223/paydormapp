import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Colors, Typography, Layout, Radius } from '@/theme';
import { api } from '@/api/client';
import { formatNaira } from '@/utils/money';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { CardSkeleton } from '@/components/common/SkeletonLoader';
import { EmptyState } from '@/components/common/EmptyState';

interface HouseholdSummary {
  id: string;
  name: string;
  floorOrBlock?: string;
}

interface PropertySummary {
  id: string;
  name: string;
  role: string;
  city: string;
  householdCount: number;
  dueThisMonth: number;
  households: HouseholdSummary[];
}

export function PropertiesScreen() {
  const navigation = useNavigation<any>();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: properties = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['properties'],
    queryFn: () => api.get<PropertySummary[]>('/properties'),
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Properties" />
      {isLoading ? (
        <View style={{ padding: Layout.screenPadding, gap: 12 }}>
          {[1, 2].map((i) => <CardSkeleton key={i} />)}
        </View>
      ) : properties.length === 0 ? (
        <EmptyState
          title="No properties yet"
          subtitle="Add your property to start managing bills."
          actionLabel="Add property"
          onAction={() => navigation.navigate('AddProperty')}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.green} />
          }
        >
          {properties.map((prop) => (
            <View key={prop.id} style={styles.propertyCard}>
              <TouchableOpacity
                onPress={() => setExpandedId(expandedId === prop.id ? null : prop.id)}
                activeOpacity={0.8}
                style={styles.propertyHeader}
              >
                <View style={styles.propLeft}>
                  <Text style={styles.propName}>{prop.name}</Text>
                  <Text style={styles.propMeta}>{prop.city} · {prop.role}</Text>
                </View>
                <View style={styles.propRight}>
                  <Text style={styles.propDue}>{formatNaira(prop.dueThisMonth)}</Text>
                  <Text style={styles.propDueLabel}>due</Text>
                  <Text style={styles.propChevron}>{expandedId === prop.id ? '↑' : '↓'}</Text>
                </View>
              </TouchableOpacity>

              {expandedId === prop.id && (
                <View style={styles.householdsSection}>
                  {prop.households.map((h) => (
                    <View key={h.id} style={styles.householdRow}>
                      <Text style={styles.householdName}>{h.name}</Text>
                      {h.floorOrBlock && (
                        <Text style={styles.householdFloor}>{h.floorOrBlock}</Text>
                      )}
                    </View>
                  ))}
                  <TouchableOpacity
                    style={styles.addHouseholdBtn}
                    onPress={() => navigation.navigate('AddHousehold', { propertyId: prop.id })}
                  >
                    <Text style={styles.addHouseholdText}>+ Add household</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}

          {/* Dashed add card */}
          <TouchableOpacity
            style={styles.addPropertyCard}
            onPress={() => navigation.navigate('AddProperty')}
            activeOpacity={0.75}
          >
            <Text style={styles.addPropertyIcon}>+</Text>
            <Text style={styles.addPropertyLabel}>Add property</Text>
            <Text style={styles.addPropertyHint}>Join with a code or create new</Text>
          </TouchableOpacity>
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
    gap: 12,
  },
  propertyCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    borderWidth: 1.5,
    borderColor: Colors.line,
    overflow: 'hidden',
  },
  propertyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  propLeft: { flex: 1 },
  propName: { ...Typography.title, color: Colors.ink },
  propMeta: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  propRight: { alignItems: 'flex-end', gap: 2 },
  propDue: { ...Typography.label, color: Colors.ink },
  propDueLabel: { ...Typography.caption, color: Colors.textMuted },
  propChevron: { fontSize: 16, color: Colors.textSecondary, marginTop: 4 },
  householdsSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    padding: 14,
    gap: 8,
  },
  householdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  householdName: { ...Typography.body, color: Colors.ink },
  householdFloor: { ...Typography.caption, color: Colors.textMuted },
  addHouseholdBtn: { paddingVertical: 4 },
  addHouseholdText: { ...Typography.caption, color: Colors.green, fontFamily: 'Syne_800ExtraBold' },
  addPropertyCard: {
    borderWidth: 2,
    borderColor: Colors.line,
    borderStyle: 'dashed',
    borderRadius: Radius.card,
    padding: 20,
    alignItems: 'center',
    gap: 4,
  },
  addPropertyIcon: { fontSize: 24, color: Colors.textMuted },
  addPropertyLabel: { ...Typography.label, color: Colors.textSecondary },
  addPropertyHint: { ...Typography.caption, color: Colors.textMuted },
});
