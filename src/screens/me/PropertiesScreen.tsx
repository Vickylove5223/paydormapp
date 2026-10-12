import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors, Typography, Layout, Radius, FontFamily } from '@/theme';
import { api } from '@/api/client';
import { ScreenHeader } from '@/components/common/ScreenHeader';

interface HouseholdSummary {
  id: string;
  name: string;
  floorOrBlock?: string;
  code: string;
  tenantCount?: number;
}

interface TenantSummary {
  id: string;
  name: string;
  householdName: string;
  floorOrBlock?: string;
  phone: string;
  email?: string;
  role: 'Master Tenant' | 'Co-Tenant' | 'Tenant';
  joinedDate: string;
  status: 'active' | 'pending';
}

interface PropertySummary {
  id: string;
  name: string;
  role: string;
  city: string;
  householdCount: number;
  dueThisMonth: number;
  households: HouseholdSummary[];
  tenants: TenantSummary[];
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
      { id: 'h1', name: 'Flat 1A', floorOrBlock: 'Block A', code: 'LGE-1A-7823', tenantCount: 2 },
      { id: 'h2', name: 'Flat 2A', floorOrBlock: 'Block A', code: 'LGE-2A-4491', tenantCount: 1 },
      { id: 'h3', name: 'Flat 3B', floorOrBlock: 'Block B', code: 'LGE-3B-2067', tenantCount: 3 },
      { id: 'h4', name: 'Flat 4C', floorOrBlock: 'Block C', code: 'LGE-4C-9134', tenantCount: 0 },
    ],
    tenants: [
      { id: 't1', name: 'Tolu Adeyemi', householdName: 'Flat 1A', floorOrBlock: 'Block A', phone: '+234 802 345 6789', email: 'tolu@example.com', role: 'Master Tenant', joinedDate: '12 Sep 2026', status: 'active' },
      { id: 't2', name: 'Amara Nwosu', householdName: 'Flat 1A', floorOrBlock: 'Block A', phone: '+234 813 456 7890', email: 'amara@example.com', role: 'Co-Tenant', joinedDate: '01 Oct 2026', status: 'active' },
      { id: 't3', name: 'Kemi Okafor', householdName: 'Flat 2A', floorOrBlock: 'Block A', phone: '+234 809 112 3344', email: 'kemi@example.com', role: 'Tenant', joinedDate: '24 Aug 2026', status: 'active' },
      { id: 't4', name: 'Femi Adekunle', householdName: 'Flat 3B', floorOrBlock: 'Block B', phone: '+234 816 789 0123', email: 'femi@example.com', role: 'Master Tenant', joinedDate: '18 Jul 2026', status: 'active' },
      { id: 't5', name: 'Chidi Obi', householdName: 'Flat 3B', floorOrBlock: 'Block B', phone: '+234 805 223 3445', email: 'chidi@example.com', role: 'Co-Tenant', joinedDate: '15 Aug 2026', status: 'active' },
      { id: 't6', name: 'Ngozi Eze', householdName: 'Flat 3B', floorOrBlock: 'Block B', phone: '+234 818 998 8776', email: 'ngozi@example.com', role: 'Co-Tenant', joinedDate: '04 Oct 2026', status: 'active' },
    ],
  },
];

function Chevron({ open }: { open: boolean }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d={open ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'}
        stroke={Colors.textSecondary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function MoreDotsIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={5} r={1.6} fill={Colors.textSecondary} />
      <Circle cx={12} cy={12} r={1.6} fill={Colors.textSecondary} />
      <Circle cx={12} cy={19} r={1.6} fill={Colors.textSecondary} />
    </Svg>
  );
}

function UsersIcon({ color = Colors.textSecondary, size = 13 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={7} r={3} stroke={color} strokeWidth={1.8} />
      <Path d="M3 18c0-2.8 2.7-4.5 6-4.5s6 1.7 6 4.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M16 8a2.5 2.5 0 010 5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M18 17c1.8-.4 3-1.6 3-3.2 0-1.8-1.5-2.8-3.5-3" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function EditIcon({ color = Colors.textSecondary, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function TrashIcon({ color = '#E8724A', size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function PropertiesScreen() {
  const navigation = useNavigation<any>();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [propertiesList, setPropertiesList] = useState<PropertySummary[]>(MOCK_PROPERTIES);

  // 3-dots action menu state
  const [menuHousehold, setMenuHousehold] = useState<{ propId: string; household: HouseholdSummary } | null>(null);

  // Edit modal state
  const [editTarget, setEditTarget] = useState<{ propId: string; household: HouseholdSummary } | null>(null);
  const [editName, setEditName] = useState('');
  const [editFloor, setEditFloor] = useState('');

  // Segmented tab state per property: 'households' | 'tenants'
  const [propertyTab, setPropertyTab] = useState<Record<string, 'households' | 'tenants'>>({});
  const getTab = (propId: string) => propertyTab[propId] ?? 'households';

  const { data: apiProperties, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['properties'],
    queryFn: () => api.get<PropertySummary[]>('/properties'),
    enabled: false,
  });

  const properties = apiProperties ?? propertiesList;

  const handleCopyCode = (code: string) => {
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    // Web clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    Alert.alert('Residence code copied', `Share "${code}" with your tenant so they can join this household.`);
  };

  const handleDeleteHousehold = (propId: string, householdId: string, householdName: string) => {
    Alert.alert(
      'Delete household',
      `Are you sure you want to delete ${householdName}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPropertiesList((prev) =>
              prev.map((p) =>
                p.id === propId
                  ? {
                      ...p,
                      households: p.households.filter((h) => h.id !== householdId),
                      householdCount: Math.max(0, p.householdCount - 1),
                    }
                  : p
              )
            );
          },
        },
      ]
    );
  };

  const handleSaveEdit = () => {
    if (!editTarget || !editName.trim()) return;
    setPropertiesList((prev) =>
      prev.map((p) =>
        p.id === editTarget.propId
          ? {
              ...p,
              households: p.households.map((h) =>
                h.id === editTarget.household.id
                  ? {
                      ...h,
                      name: editName.trim(),
                      floorOrBlock: editFloor.trim() || undefined,
                    }
                  : h
              ),
            }
          : p
      )
    );
    setEditTarget(null);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Properties"
        rightAction={
          <TouchableOpacity
            style={styles.headerAddBtn}
            onPress={() => navigation.navigate('AddProperty')}
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
            <Text style={styles.headerAddText}>Add property</Text>
          </TouchableOpacity>
        }
      />
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
              <Chevron open={expandedId === prop.id} />
            </TouchableOpacity>

            {expandedId === prop.id && (
              <View style={styles.householdsSection}>
                {/* Segmented Tabs: Households vs Tenants */}
                <View style={styles.tabContainer}>
                  <TouchableOpacity
                    style={[styles.tabBtn, getTab(prop.id) === 'households' && styles.tabBtnActive]}
                    onPress={() => setPropertyTab((prev) => ({ ...prev, [prop.id]: 'households' }))}
                    activeOpacity={0.8}
                  >
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                        stroke={getTab(prop.id) === 'households' ? Colors.ink : Colors.textSecondary}
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                    <Text style={[styles.tabText, getTab(prop.id) === 'households' && styles.tabTextActive]}>
                      Households
                    </Text>
                    <View style={[styles.tabBadge, getTab(prop.id) === 'households' && styles.tabBadgeActive]}>
                      <Text style={styles.tabBadgeText}>{prop.households.length}</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.tabBtn, getTab(prop.id) === 'tenants' && styles.tabBtnActive]}
                    onPress={() => setPropertyTab((prev) => ({ ...prev, [prop.id]: 'tenants' }))}
                    activeOpacity={0.8}
                  >
                    <UsersIcon color={getTab(prop.id) === 'tenants' ? Colors.ink : Colors.textSecondary} size={14} />
                    <Text style={[styles.tabText, getTab(prop.id) === 'tenants' && styles.tabTextActive]}>
                      Tenants
                    </Text>
                    <View style={[styles.tabBadge, getTab(prop.id) === 'tenants' && styles.tabBadgeActive]}>
                      <Text style={styles.tabBadgeText}>{prop.tenants?.length ?? 0}</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {getTab(prop.id) === 'households' ? (
                  <>
                    {prop.households.map((h) => (
                      <View key={h.id} style={styles.householdCard}>
                        {/* Top Row: Household name, Floor/Block, and 3-dots button */}
                        <View style={styles.householdTopRow}>
                          <View style={styles.householdTitleGroup}>
                            <Text style={styles.householdName}>{h.name}</Text>
                            {h.floorOrBlock ? (
                              <View style={styles.blockBadge}>
                                <Text style={styles.blockBadgeText}>{h.floorOrBlock}</Text>
                              </View>
                            ) : null}
                          </View>
                          <TouchableOpacity
                            style={styles.moreBtn}
                            onPress={() => setMenuHousehold({ propId: prop.id, household: h })}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            accessibilityLabel="Household options"
                          >
                            <MoreDotsIcon />
                          </TouchableOpacity>
                        </View>

                        {/* Meta Row: Tenants count & Residence Code */}
                        <View style={styles.householdMetaRow}>
                          <View style={styles.tenantBadge}>
                            <UsersIcon color={Colors.textSecondary} size={13} />
                            <Text style={styles.tenantBadgeText}>
                              {h.tenantCount ?? 0} {h.tenantCount === 1 ? 'tenant' : 'tenants'}
                            </Text>
                          </View>

                          <View style={styles.residenceCodeBadge}>
                            <Text style={styles.codeLabel}>Code</Text>
                            <Text style={styles.codeValue}>{h.code}</Text>
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
                      </View>
                    ))}

                    <TouchableOpacity
                      style={styles.addHouseholdBtn}
                      onPress={() => navigation.navigate('AddHousehold', { propertyId: prop.id })}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.addHouseholdText}>+ Add household</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    {(prop.tenants ?? []).map((t) => (
                      <View key={t.id} style={styles.tenantCard}>
                        <View style={styles.tenantTopRow}>
                          <View style={styles.tenantAvatar}>
                            <Text style={styles.tenantAvatarText}>
                              {t.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </Text>
                          </View>

                          <View style={styles.tenantInfo}>
                            <View style={styles.tenantNameRow}>
                              <Text style={styles.tenantName}>{t.name}</Text>
                              <View
                                style={[
                                  styles.roleBadge,
                                  t.role === 'Master Tenant' && styles.roleBadgeMaster,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.roleBadgeText,
                                    t.role === 'Master Tenant' && styles.roleBadgeTextMaster,
                                  ]}
                                >
                                  {t.role}
                                </Text>
                              </View>
                            </View>
                            <Text style={styles.tenantSub}>
                              {t.householdName}
                              {t.floorOrBlock ? ` · ${t.floorOrBlock}` : ''}
                            </Text>
                          </View>

                          <View style={styles.tenantStatusBadge}>
                            <View style={styles.activeDot} />
                            <Text style={styles.tenantStatusText}>Active</Text>
                          </View>
                        </View>

                        <View style={styles.tenantDivider} />

                        <View style={styles.tenantMetaRow}>
                          <View style={styles.tenantMetaItem}>
                            <Text style={styles.tenantMetaLabel}>Phone</Text>
                            <Text style={styles.tenantMetaVal}>{t.phone}</Text>
                          </View>
                          <View style={styles.tenantMetaItem}>
                            <Text style={styles.tenantMetaLabel}>Onboarded</Text>
                            <Text style={styles.tenantMetaVal}>{t.joinedDate}</Text>
                          </View>
                          <TouchableOpacity
                            style={styles.contactBtn}
                            onPress={() =>
                              Alert.alert('Contact Tenant', `Call or message ${t.name} at ${t.phone}`)
                            }
                            activeOpacity={0.75}
                          >
                            <Text style={styles.contactBtnText}>Contact</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}

                    <TouchableOpacity
                      style={styles.addHouseholdBtn}
                      onPress={() =>
                        Alert.alert(
                          'Invite Tenant',
                          'Share a household code (e.g. LGE-1A-7823) with your tenant to invite them to this property.'
                        )
                      }
                      activeOpacity={0.75}
                    >
                      <Text style={styles.addHouseholdText}>+ Invite tenant</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* 3-dots Action Menu Modal */}
      <Modal
        visible={menuHousehold !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuHousehold(null)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setMenuHousehold(null)}>
          <View style={styles.menuBox}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuHeaderTitle} numberOfLines={1}>
                {menuHousehold?.household.name}
              </Text>
              {menuHousehold?.household.floorOrBlock && (
                <Text style={styles.menuHeaderSub}>
                  {menuHousehold.household.floorOrBlock}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                if (menuHousehold) {
                  setEditName(menuHousehold.household.name);
                  setEditFloor(menuHousehold.household.floorOrBlock ?? '');
                  setEditTarget(menuHousehold);
                  setMenuHousehold(null);
                }
              }}
            >
              <EditIcon />
              <Text style={styles.menuItemText}>Edit household</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                if (menuHousehold) {
                  const { propId, household } = menuHousehold;
                  setMenuHousehold(null);
                  handleDeleteHousehold(propId, household.id, household.name);
                }
              }}
            >
              <TrashIcon />
              <Text style={[styles.menuItemText, { color: '#E8724A' }]}>
                Delete household
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Edit Household Modal */}
      <Modal
        visible={editTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditTarget(null)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setEditTarget(null)}>
          <Pressable style={styles.editModalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.editModalTitle}>Edit Household</Text>
            <Text style={styles.editModalSubtitle}>
              Update the unit name or block details.
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Household / Unit name</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="e.g. Flat 1A"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Floor / Block (optional)</Text>
              <TextInput
                style={styles.textInput}
                value={editFloor}
                onChangeText={setEditFloor}
                placeholder="e.g. Block A"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditTarget(null)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveBtnText}>Save changes</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.screen },
  content: { padding: Layout.screenPadding, paddingBottom: Layout.contentBottomPadding, gap: 12 },
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

  // Household listing
  householdsSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    padding: 12,
    gap: 10,
    backgroundColor: '#FAFBFB',
  },

  // Segmented Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEF2F6',
    borderRadius: 99,
    padding: 3,
    gap: 4,
    marginBottom: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    ...Typography.captionSmall,
    color: Colors.textSecondary,
    fontFamily: FontFamily.dmSansBold,
    fontSize: 12,
  },
  tabTextActive: {
    color: Colors.ink,
    fontFamily: FontFamily.syneBold,
  },
  tabBadge: {
    backgroundColor: 'rgba(12,24,34,0.06)',
    borderRadius: 99,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tabBadgeActive: {
    backgroundColor: Colors.mint,
  },
  tabBadgeText: {
    fontSize: 10,
    fontFamily: FontFamily.syneBold,
    color: Colors.ink,
  },

  // Tenant Cards
  tenantCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.cardSm,
    borderWidth: 1.5,
    borderColor: Colors.line,
    padding: 12,
    gap: 8,
  },
  tenantTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tenantAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.mint,
    borderWidth: 1.5,
    borderColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tenantAvatarText: {
    fontFamily: FontFamily.syneBold,
    fontSize: 13,
    color: Colors.ink,
  },
  tenantInfo: {
    flex: 1,
    gap: 2,
  },
  tenantNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  tenantName: {
    ...Typography.title,
    fontSize: 14,
    color: Colors.ink,
  },
  roleBadge: {
    backgroundColor: Colors.screen,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  roleBadgeMaster: {
    backgroundColor: '#FFF4D9',
    borderColor: '#E6B800',
  },
  roleBadgeText: {
    ...Typography.captionSmall,
    fontSize: 10,
    fontFamily: FontFamily.dmSansMedium,
    color: Colors.textSecondary,
  },
  roleBadgeTextMaster: {
    color: '#8A5800',
    fontFamily: FontFamily.dmSansBold,
  },
  tenantSub: {
    ...Typography.captionSmall,
    color: Colors.textSecondary,
  },
  tenantStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E6F8EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#40CE86',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0D8C4B',
  },
  tenantStatusText: {
    ...Typography.captionSmall,
    color: '#0D8C4B',
    fontFamily: FontFamily.dmSansBold,
    fontSize: 10,
  },
  tenantDivider: {
    height: 1,
    backgroundColor: Colors.line,
  },
  tenantMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  tenantMetaItem: {
    gap: 1,
  },
  tenantMetaLabel: {
    ...Typography.captionSmall,
    color: Colors.textMuted,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  tenantMetaVal: {
    ...Typography.caption,
    color: Colors.ink,
    fontFamily: FontFamily.dmSansMedium,
    fontSize: 12,
  },
  contactBtn: {
    backgroundColor: Colors.white,
    borderWidth: 1.2,
    borderColor: Colors.ink,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  contactBtnText: {
    ...Typography.captionSmall,
    color: Colors.ink,
    fontFamily: FontFamily.dmSansBold,
    fontSize: 11,
  },
  householdCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.cardSm,
    borderWidth: 1.5,
    borderColor: Colors.line,
    padding: 12,
    gap: 10,
  },
  householdTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  householdTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  householdName: {
    ...Typography.title,
    fontSize: 15,
    color: Colors.ink,
  },
  blockBadge: {
    backgroundColor: Colors.screen,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  blockBadgeText: {
    ...Typography.captionSmall,
    color: Colors.textSecondary,
    fontFamily: FontFamily.dmSansMedium,
  },
  moreBtn: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  householdMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  tenantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.mint,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 99,
  },
  tenantBadgeText: {
    ...Typography.captionSmall,
    fontFamily: FontFamily.dmSansBold,
    color: Colors.ink,
  },
  residenceCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.screen,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: Colors.line,
    paddingLeft: 9,
    paddingRight: 3,
    paddingVertical: 3,
  },
  codeLabel: {
    ...Typography.captionSmall,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 10,
  },
  codeValue: {
    ...Typography.caption,
    color: Colors.ink,
    fontFamily: FontFamily.syneBold,
    letterSpacing: 0.5,
  },
  copyCodeBtn: {
    backgroundColor: Colors.sky,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: Colors.ink,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  copyCodeBtnDone: {
    backgroundColor: Colors.green,
  },
  copyCodeText: {
    ...Typography.captionSmall,
    color: Colors.ink,
    fontFamily: FontFamily.syneBold,
    fontSize: 10,
  },

  addHouseholdBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: Radius.cardSm,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.green,
    backgroundColor: Colors.mint,
    marginTop: 2,
  },
  addHouseholdText: {
    ...Typography.label,
    color: Colors.ink,
    fontFamily: FontFamily.syneBold,
    fontSize: 13,
  },

  // Header button
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  headerAddText: {
    ...Typography.caption,
    fontFamily: FontFamily.dmSansBold,
    color: Colors.ink,
  },

  // 3-dots Menu styles
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  menuBox: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    width: 200,
    borderWidth: 1.5,
    borderColor: Colors.line,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    overflow: 'hidden',
  },
  menuHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    backgroundColor: Colors.screen,
  },
  menuHeaderTitle: {
    ...Typography.label,
    color: Colors.ink,
  },
  menuHeaderSub: {
    ...Typography.captionSmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  menuItemText: {
    ...Typography.label,
    color: Colors.ink,
    fontSize: 13,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.line,
  },

  // Edit Modal styles
  editModalCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    width: '100%',
    maxWidth: 380,
    padding: 20,
    borderWidth: 1.5,
    borderColor: Colors.ink,
    gap: 14,
  },
  editModalTitle: {
    ...Typography.title,
    color: Colors.ink,
  },
  editModalSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: -8,
  },
  formGroup: {
    gap: 6,
  },
  inputLabel: {
    ...Typography.captionSmall,
    color: Colors.textSecondary,
    fontFamily: FontFamily.dmSansMedium,
  },
  textInput: {
    backgroundColor: Colors.screen,
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderRadius: Radius.cardSm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: FontFamily.dmSansRegular,
    color: Colors.ink,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.cardSm,
  },
  cancelBtnText: {
    ...Typography.caption,
    fontFamily: FontFamily.dmSansBold,
    color: Colors.textSecondary,
  },
  saveBtn: {
    backgroundColor: Colors.green,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: Radius.cardSm,
    borderWidth: 1.5,
    borderColor: Colors.ink,
  },
  saveBtnText: {
    ...Typography.caption,
    fontFamily: FontFamily.dmSansBold,
    color: Colors.ink,
  },
});
