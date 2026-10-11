import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Colors, Typography, Layout, Radius } from '@/theme';
import { api } from '@/api/client';
import { formatNaira } from '@/utils/money';
import { ScreenHeader } from '@/components/common/ScreenHeader';

interface HouseholdSummary {
  id: string;
  name: string;
  floorOrBlock?: string;
  code: string;
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

const MOCK_PROPERTIES: PropertySummary[] = [
  {
    id: 'prop1',
    name: 'Lekki Gardens Estate',
    role: 'Landlord',
    city: 'Lagos',
    householdCount: 12,
    dueThisMonth: 4500000,
    households: [
      { id: 'h1', name: 'Flat 1A', floorOrBlock: 'Block A', code: 'LGE-1A-7823' },
      { id: 'h2', name: 'Flat 2A', floorOrBlock: 'Block A', code: 'LGE-2A-4491' },
      { id: 'h3', name: 'Flat 3B', floorOrBlock: 'Block B', code: 'LGE-3B-2067' },
      { id: 'h4', name: 'Flat 4C', floorOrBlock: 'Block C', code: 'LGE-4C-9134' },
    ],
  },
];

export function PropertiesScreen() {
  const navigation = useNavigation<any>();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: apiProperties, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['properties'],
    queryFn: () => api.get<PropertySummary[]>('/properties'),
    enabled: false,
  });

  const properties = apiProperties ?? MOCK_PROPERTIES;

  const handleCopyCode = (code: string) => {
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    // Web clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    Alert.alert('Residence code copied', `Share "${code}" with your tenant so they can join this household.`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Properties" />
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
                  <View key={h.id} style={styles.householdBlock}>
                    <View style={styles.householdRow}>
                      <Text style={styles.householdName}>{h.name}</Text>
                      {h.floorOrBlock && (
                        <Text style={styles.householdFloor}>{h.floorOrBlock}</Text>
                      )}
                    </View>
                    <View style={styles.codeRow}>
                      <View style={styles.codeBadge}>
                        <Text style={styles.codeLabel}>Residence code</Text>
                        <Text style={styles.codeValue}>{h.code}</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.copyCodeBtn, copiedCode === h.code && styles.copyCodeBtnDone]}
                        onPress={() => handleCopyCode(h.code)}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.copyCodeText}>
                          {copiedCode === h.code ? 'Copied!' : 'Share'}
                        </Text>
                      </TouchableOpacity>
                    </View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.screen },
  content: { padding: Layout.screenPadding, paddingBottom: Layout.contentBottomPadding, gap: 12 },
  propertyCard: {
    backgroundColor: Colors.white, borderRadius: Radius.card,
    borderWidth: 1.5, borderColor: Colors.line, overflow: 'hidden',
  },
  propertyHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  propLeft: { flex: 1 },
  propName: { ...Typography.title, color: Colors.ink },
  propMeta: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  propRight: { alignItems: 'flex-end', gap: 2 },
  propDue: { ...Typography.label, color: Colors.ink },
  propDueLabel: { ...Typography.caption, color: Colors.textMuted },
  propChevron: { fontSize: 16, color: Colors.textSecondary, marginTop: 4 },
  householdsSection: { borderTopWidth: 1, borderTopColor: Colors.line, padding: 14, gap: 10 },
  householdBlock: { gap: 6 },
  householdRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  householdName: { ...Typography.body, color: Colors.ink },
  householdFloor: { ...Typography.caption, color: Colors.textMuted },

  // Residence code
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  codeBadge: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.screen, borderRadius: Radius.cardSm,
    borderWidth: 1, borderColor: Colors.line, paddingHorizontal: 10, paddingVertical: 6,
  },
  codeLabel: { ...Typography.captionSmall, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  codeValue: { ...Typography.label, color: Colors.ink, fontFamily: 'Syne_800ExtraBold', letterSpacing: 1 },
  copyCodeBtn: {
    backgroundColor: Colors.sky, borderRadius: 99, borderWidth: 1.5,
    borderColor: Colors.ink, paddingHorizontal: 12, paddingVertical: 5,
  },
  copyCodeBtnDone: { backgroundColor: Colors.green },
  copyCodeText: { ...Typography.captionSmall, color: Colors.ink, fontFamily: 'Syne_800ExtraBold' },

  addHouseholdBtn: { paddingVertical: 4, marginTop: 4 },
  addHouseholdText: { ...Typography.caption, color: Colors.green, fontFamily: 'Syne_800ExtraBold' },
  addPropertyCard: {
    borderWidth: 2, borderColor: Colors.line, borderStyle: 'dashed',
    borderRadius: Radius.card, padding: 20, alignItems: 'center', gap: 4,
  },
  addPropertyIcon: { fontSize: 24, color: Colors.textMuted },
  addPropertyLabel: { ...Typography.label, color: Colors.textSecondary },
  addPropertyHint: { ...Typography.caption, color: Colors.textMuted },
});
