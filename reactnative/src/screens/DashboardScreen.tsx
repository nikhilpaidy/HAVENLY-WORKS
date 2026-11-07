import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Dimensions,
  Alert,
  Modal
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { mobileApi } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { TabKey } from '../components/TabBar';
import { SafeImage } from '../components/SafeImage';
import { WorkspaceCardSkeleton, ListRowSkeleton } from '../components/SkeletonLoader';
import { WorkspaceDetailModal } from './WorkspaceDetailModal';
import { RadiusSearchModal } from './RadiusSearchModal';
import { ExecutiveLineChart, QuotaRing } from '../components/Charts';
import { LocationPickerModal, HYDERABAD_AREAS, LocationArea } from '../components/LocationPickerModal';

interface DashboardScreenProps {
  onNavigate: (tab: TabKey) => void;
  onOpenNotifications: () => void;
  unreadNotifsCount: number;
  onOpenDrawer?: () => void;
}

const { width } = Dimensions.get('window');

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigate,
  onOpenNotifications,
  unreadNotifsCount,
  onOpenDrawer
}) => {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();

  const role = user?.role;
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isCoworkingAdmin = role === 'COWORKING_ADMIN';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState<LocationArea>(HYDERABAD_AREAS[0]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [passType, setPassType] = useState<string>('Day Pass');
  const [showPassPicker, setShowPassPicker] = useState(false);

  const [personCount, setPersonCount] = useState<number | string>(1);
  const [showPersonPicker, setShowPersonPicker] = useState(false);
  const [customPersonInput, setCustomPersonInput] = useState('');

  const [deskType, setDeskType] = useState<string>('Desk');
  const [showDeskPicker, setShowDeskPicker] = useState(false);

  const [spaceTypeFilter, setSpaceTypeFilter] = useState('ALL');
  const [selectedRadiusKm, setSelectedRadiusKm] = useState(2);

  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [workspaceTypes, setWorkspaceTypes] = useState<any[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(user?.favoriteRoomIds || []);
  const [nearbyLocations, setNearbyLocations] = useState<any[]>([]);
  const [allowance, setAllowance] = useState<any>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [pendingGuestCount, setPendingGuestCount] = useState(0);

  const [superAdminAdmins, setSuperAdminAdmins] = useState<any[]>([]);
  const [expandedAdminId, setExpandedAdminId] = useState<string | null>(null);

  const [displayLimit, setDisplayLimit] = useState(20);

  const [selectedSpace, setSelectedSpace] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const handleToggleRoomLike = async (roomId: string) => {
    try {
      const res = await mobileApi.toggleRoomLike(roomId);
      setFavoriteIds(res.favoriteRoomIds || []);
    } catch {
      setFavoriteIds((prev) =>
        prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
      );
    }
  };

  const loadData = async () => {
    try {
      const [roomsData, nearbyData, typesData] = await Promise.all([
        mobileApi.getPublicRooms({ workspaceType: spaceTypeFilter !== 'ALL' ? spaceTypeFilter : undefined }),
        mobileApi.getNearbyLocations(selectedLocation.lat, selectedLocation.lng, selectedRadiusKm),
        mobileApi.getWorkspaceTypes()
      ]);

      setWorkspaces(roomsData || []);
      setNearbyLocations(nearbyData?.locations || []);
      if (Array.isArray(typesData) && typesData.length > 0) {
        setWorkspaceTypes(typesData);
      }

      if (user) {
        if (isSuperAdmin) {
          try {
            const adminsData = await mobileApi.getSuperAdminAdmins();
            setSuperAdminAdmins(adminsData || []);
          } catch (e) {
            console.warn('Failed to load super admin admins:', e);
          }
        }

        if (!isSuperAdmin && !isCoworkingAdmin) {
          try {
            const [allowanceData, myBookings] = await Promise.all([
              mobileApi.getCurrentAllowance(),
              mobileApi.getBookings({ myOnly: true, tab: 'ONGOING' })
            ]);
            setAllowance(allowanceData);
            setUpcomingBookings(myBookings || []);
          } catch {}
        }

        if (isCoworkingAdmin) {
          try {
            const allBookings = await mobileApi.getBookings();
            const pending = (allBookings || []).filter(
              (b: any) => b.isGuestBooking && b.status === 'PENDING_CONFIRMATION'
            ).length;
            setPendingGuestCount(pending);
          } catch {}
        }
      }
    } catch (err) {
      console.warn('Dashboard load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedLocation, spaceTypeFilter, selectedRadiusKm]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleOpenSpace = (spaceItem: any) => {
    setSelectedSpace(spaceItem);
    setShowDetailModal(true);
  };

  const categories = workspaceTypes.length > 0
    ? [{ label: 'All', value: 'ALL' }, ...workspaceTypes.map((t) => ({ label: t.name, value: t.code }))]
    : [
        { label: 'All', value: 'ALL' },
        { label: 'Hot Desk', value: 'HOT_DESK' },
        { label: 'Dedicated Desk', value: 'DEDICATED_DESK' },
        { label: 'Private Office', value: 'PRIVATE_OFFICE' },
        { label: 'Conference', value: 'MEETING_ROOM' },
        { label: 'Boardroom', value: 'BOARDROOM' },
        { label: 'Day Pass', value: 'DAY_PASS' }
      ];

  const filteredWorkspaces = workspaces.filter((w) => {
    if (!searchQuery.trim()) return true;
    const nameMatch = w.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const locMatch = (w.locationId?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || locMatch;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.headerBanner, { backgroundColor: '#00A859' }]}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerProfileRow}>
            <TouchableOpacity
              style={styles.avatarBorder}
              onPress={onOpenDrawer}
              activeOpacity={0.8}
            >
              <SafeImage
                uri={(user as any)?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80'}
                style={styles.avatarImage}
                borderRadius={20}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowLocationPicker(true)}
              style={styles.locationPill}
              activeOpacity={0.8}
            >
              <Text style={styles.locationLabel}>Location</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="location-sharp" size={14} color="#FFFFFF" style={{ marginRight: 3 }} />
                <Text style={styles.locationValue}>{selectedLocation.name}, Hyderabad</Text>
                <Ionicons name="chevron-down" size={14} color="#FFFFFF" style={{ marginLeft: 3 }} />
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.notifBtn} onPress={onOpenNotifications}>
            <Ionicons name="notifications" size={20} color="#FFFFFF" />
            {unreadNotifsCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.searchCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.searchCardTitle, { color: theme.textPrimary }]}>
            Where do you <Text style={{ color: '#00A859' }}>want to work?</Text>
          </Text>

          <View style={[styles.searchInputWrapper, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
            <Ionicons name="search-outline" size={18} color={theme.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, { color: theme.textPrimary }]}
              placeholder="Search Workspace by name or area.."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <TouchableOpacity
            style={[styles.fullWidthOptionPill, { borderColor: theme.inputBorder, backgroundColor: theme.inputBg }]}
            onPress={() => setShowPassPicker(true)}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="calendar-outline" size={15} color="#00A859" style={{ marginRight: 8 }} />
              <Text style={[styles.optionPillText, { color: theme.textPrimary, fontSize: 13 }]}>
                {passType}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={14} color={theme.textMuted} />
          </TouchableOpacity>

          <View style={styles.searchOptionRow}>
            <TouchableOpacity
              style={[styles.optionPill, { borderColor: theme.inputBorder, backgroundColor: theme.inputBg }]}
              onPress={() => setShowPersonPicker(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="person-outline" size={15} color="#00A859" style={{ marginRight: 6 }} />
              <Text style={[styles.optionPillText, { color: theme.textPrimary }]}>
                {personCount} {typeof personCount === 'number' && personCount === 1 ? 'Person' : 'People'}
              </Text>
              <Ionicons name="chevron-down" size={12} color={theme.textMuted} style={{ marginLeft: 4 }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionPill, { borderColor: theme.inputBorder, backgroundColor: theme.inputBg }]}
              onPress={() => setShowDeskPicker(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="briefcase-outline" size={15} color="#00A859" style={{ marginRight: 6 }} />
              <Text style={[styles.optionPillText, { color: theme.textPrimary }]} numberOfLines={1}>
                {deskType}
              </Text>
              <Ionicons name="chevron-down" size={12} color={theme.textMuted} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.findWorkspaceBtn}
            onPress={() => setShowFilterModal(true)}
            activeOpacity={0.88}
          >
            <Text style={styles.findWorkspaceText}>Find Workspace</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00A859" />}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 100 }}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 200) {
            if (displayLimit < filteredWorkspaces.length) {
              setDisplayLimit((prev) => prev + 20);
            }
          }
        }}
        scrollEventThrottle={300}
      >
        {isCoworkingAdmin && pendingGuestCount > 0 && (
          <View style={styles.adminAlertCard}>
            <Ionicons name="call" size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.adminAlertTitle}>Pending Guest Bookings ({pendingGuestCount})</Text>
              <Text style={styles.adminAlertSubtitle}>Call guests & verify QR payment receipt.</Text>
            </View>
            <TouchableOpacity
              style={styles.adminAlertAction}
              onPress={() => onNavigate('bookings')}
            >
              <Text style={styles.adminAlertActionText}>Review</Text>
            </TouchableOpacity>
          </View>
        )}

        {isSuperAdmin && superAdminAdmins.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <View style={[styles.sectionHeader, { paddingHorizontal: 0, marginTop: 4 }]}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Coworking Operators ({superAdminAdmins.length})
              </Text>
            </View>
            {superAdminAdmins.map((adm) => {
              const isExpanded = expandedAdminId === adm._id;
              return (
                <View
                  key={adm._id}
                  style={[styles.adminOperatorCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                >
                  <TouchableOpacity
                    style={styles.adminOperatorHeader}
                    onPress={() => setExpandedAdminId(isExpanded ? null : adm._id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.adminOperatorAvatar}>
                      <Ionicons name="business" size={20} color="#00A859" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.adminOperatorName, { color: theme.textPrimary }]}>{adm.name}</Text>
                      <Text style={[styles.adminOperatorEmail, { color: theme.textMuted }]}>{adm.email}</Text>
                      <Text style={[styles.adminOperatorOrg, { color: '#00A859' }]}>
                        {adm.organizationId?.name || 'HavenlyWork Coworking'}
                      </Text>
                    </View>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={theme.textMuted}
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={[styles.adminOperatorExpanded, { borderTopColor: theme.cardBorder }]}>
                      <Text style={[styles.expandedSubtitle, { color: theme.textPrimary }]}>
                        Managed Hubs ({adm.locations?.length || 0})
                      </Text>
                      {adm.locations?.map((loc: any) => (
                        <View key={loc._id} style={styles.miniLocationRow}>
                          <Ionicons name="location" size={14} color="#00A859" style={{ marginRight: 6 }} />
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.miniLocationName, { color: theme.textPrimary }]}>{loc.name}</Text>
                            <Text style={[styles.miniLocationAddr, { color: theme.textMuted }]}>
                              {loc.address?.street}, {loc.address?.city}
                            </Text>
                          </View>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#00A859' }}>
                            ★ {loc.rating || 4.9}
                          </Text>
                        </View>
                      ))}

                      <Text style={[styles.expandedSubtitle, { color: theme.textPrimary, marginTop: 12 }]}>
                        Client Companies ({adm.companies?.length || 0})
                      </Text>
                      {adm.companies?.map((comp: any) => (
                        <View key={comp._id} style={styles.miniCompanyRow}>
                          <Ionicons name="people" size={14} color="#00A859" style={{ marginRight: 6 }} />
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.miniLocationName, { color: theme.textPrimary }]}>{comp.name}</Text>
                            <Text style={[styles.miniLocationAddr, { color: theme.textMuted }]}>
                              Assigned Hub: {comp.locationId?.name || 'Madhapur Hub'} • {comp.billingEmail}
                            </Text>
                          </View>
                          <View style={styles.miniQuotaPill}>
                            <Text style={styles.miniQuotaText}>
                              {comp.allowanceConfig?.annualFreeHours || 240}h / yr
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c.value}
              style={[
                styles.categoryChip,
                spaceTypeFilter === c.value && styles.categoryChipActive,
                { borderColor: theme.cardBorder }
              ]}
              onPress={() => setSpaceTypeFilter(c.value)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  { color: spaceTypeFilter === c.value ? '#FFFFFF' : theme.textSecondary }
                ]}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Popular Workspaces</Text>
          <TouchableOpacity onPress={() => onNavigate('rooms')}>
            <Text style={styles.seeAllLink}>See All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ paddingHorizontal: 20 }}>
            <WorkspaceCardSkeleton />
            <WorkspaceCardSkeleton />
          </View>
        ) : filteredWorkspaces.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="business-outline" size={44} color={theme.textMuted} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No workspaces match your selection.
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularCarousel}
            snapToInterval={width * 0.78 + 16}
            decelerationRate="fast"
          >
            {filteredWorkspaces.map((item) => {
              const loc = item.locationId || {};
              const photo = (item.photos && item.photos[0]) || loc.images?.[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80';
              return (
                <TouchableOpacity
                  key={item._id}
                  style={[styles.popularCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                  onPress={() => handleOpenSpace(item)}
                  activeOpacity={0.88}
                >
                  <View style={styles.popularImageWrapper}>
                    <SafeImage uri={photo} style={styles.popularImage} borderRadius={18} />
                    <TouchableOpacity
                      style={styles.cardHeartBtn}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        handleToggleRoomLike(item._id);
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={favoriteIds.includes(item._id) ? 'heart' : 'heart-outline'}
                        size={18}
                        color={favoriteIds.includes(item._id) ? '#EF4444' : '#FFFFFF'}
                      />
                    </TouchableOpacity>
                    <View style={styles.ratingBadgePill}>
                      <Ionicons name="star" size={13} color="#F59E0B" />
                      <Text style={styles.ratingBadgeText}>{item.rating || 4.9}</Text>
                    </View>
                    <View style={styles.typeBadgePill}>
                      <Text style={styles.typeBadgeText}>{item.workspaceType?.replace('_', ' ') || 'DESK'}</Text>
                    </View>
                  </View>

                  <View style={styles.popularCardBody}>
                    <Text style={[styles.cardTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View style={styles.cardLocationRow}>
                      <Ionicons name="location-outline" size={14} color="#00A859" style={{ marginRight: 4 }} />
                      <Text style={[styles.cardAddress, { color: theme.textSecondary }]} numberOfLines={1}>
                        {loc.address?.street || 'Madhapur Main Rd'}, {loc.city || 'Hyderabad'}
                      </Text>
                    </View>

                    <View style={styles.cardFooter}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="time-outline" size={13} color={theme.textMuted} style={{ marginRight: 4 }} />
                        <Text style={[styles.cardTime, { color: theme.textMuted }]}>
                          {loc.distanceLabel || '15 Min • 3.0 km'}
                        </Text>
                      </View>
                      <Text style={styles.cardPrice}>
                        ₹{item.hourlyRate || 350}
                        <Text style={{ fontSize: 11, fontWeight: '500', color: theme.textMuted }}>/hr</Text>
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Nearby Spaces ({selectedRadiusKm}km Radius)
          </Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {[1, 2, 5].map((km) => (
              <TouchableOpacity
                key={km}
                style={[
                  styles.radiusPill,
                  selectedRadiusKm === km && styles.radiusPillActive,
                  { borderColor: theme.cardBorder }
                ]}
                onPress={() => setSelectedRadiusKm(km)}
              >
                <Text style={[styles.radiusPillText, selectedRadiusKm === km && { color: '#FFFFFF' }]}>
                  {km}km
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {loading ? (
            <>
              <ListRowSkeleton />
              <ListRowSkeleton />
            </>
          ) : nearbyLocations.length === 0 ? (
            <Text style={{ color: theme.textMuted, fontSize: 13, marginVertical: 10 }}>
              No locations within {selectedRadiusKm}km. Tap 5km to expand radius.
            </Text>
          ) : (
            nearbyLocations.map((loc) => (
              <TouchableOpacity
                key={loc._id}
                style={[styles.nearbyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={() => handleOpenSpace(loc)}
                activeOpacity={0.88}
              >
                <SafeImage
                  uri={loc.images?.[0] || 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=300&q=80'}
                  style={styles.nearbyThumb}
                  borderRadius={14}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.nearbyTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                    {loc.name}
                  </Text>
                  <Text style={[styles.nearbyAddress, { color: theme.textSecondary }]} numberOfLines={1}>
                    {loc.address?.street}, {loc.address?.city}
                  </Text>
                  <View style={styles.nearbyMetaRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="navigate-outline" size={13} color="#00A859" style={{ marginRight: 4 }} />
                      <Text style={{ fontSize: 12, color: theme.textMuted }}>{loc.distanceLabel}</Text>
                    </View>
                    <Text style={styles.nearbyPrice}>From ₹{loc.minHourlyRate || 250}/hr</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {user && !isSuperAdmin && !isCoworkingAdmin && allowance && (
          <View style={[styles.quotaWidget, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.quotaWidgetTitle, { color: theme.textPrimary }]}>Company Workspace Quota</Text>
              <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 4 }}>
                {allowance.availableHours ?? allowance.balanceHours} hrs available out of {allowance.totalGrantedHours ?? allowance.grantedHours} hrs granted.
              </Text>
              <Text style={{ fontSize: 11, color: '#00A859', marginTop: 4 }}>
                Quota stays active until consumed. Overdraft billed at month-end.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.quotaPillBtn}
              onPress={() => onNavigate('allowance')}
            >
              <Text style={styles.quotaPillBtnText}>View Quota</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <WorkspaceDetailModal
        visible={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        space={selectedSpace}
        currentUser={user}
        onBookSuccess={() => {
          loadData();
          onNavigate('bookings');
        }}
      />

      <RadiusSearchModal
        visible={showFilterModal}
        currentRadius={selectedRadiusKm}
        onClose={() => setShowFilterModal(false)}
        onApply={(filters) => {
          if (filters.workspaceType) setSpaceTypeFilter(filters.workspaceType);
          if (filters.radiusKm) setSelectedRadiusKm(filters.radiusKm);
        }}
      />

      <LocationPickerModal
        visible={showLocationPicker}
        selectedLocation={selectedLocation}
        onClose={() => setShowLocationPicker(false)}
        onSelectLocation={(area) => {
          setSelectedLocation(area);
          setShowLocationPicker(false);
        }}
      />

      <Modal visible={showPassPicker} transparent animationType="fade" onRequestClose={() => setShowPassPicker(false)}>
        <TouchableOpacity
          style={styles.pickerBackdrop}
          activeOpacity={1}
          onPress={() => setShowPassPicker(false)}
        >
          <View style={[styles.pickerSheet, { backgroundColor: theme.card }]}>
            <Text style={[styles.pickerTitle, { color: theme.textPrimary }]}>Select Pass Type</Text>
            {['Hourly', 'Day Pass', 'Week Pass', 'Monthly Pass'].map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.pickerOptionRow}
                onPress={() => {
                  setPassType(opt);
                  setShowPassPicker(false);
                }}
              >
                <Text style={[styles.pickerOptionText, { color: passType === opt ? '#00A859' : theme.textPrimary }]}>
                  {opt}
                </Text>
                {passType === opt && <Ionicons name="checkmark-circle" size={18} color="#00A859" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showPersonPicker} transparent animationType="fade" onRequestClose={() => setShowPersonPicker(false)}>
        <TouchableOpacity
          style={styles.pickerBackdrop}
          activeOpacity={1}
          onPress={() => setShowPersonPicker(false)}
        >
          <View style={[styles.pickerSheet, { backgroundColor: theme.card }]}>
            <Text style={[styles.pickerTitle, { color: theme.textPrimary }]}>Select Number of People</Text>
            {[1, 2, 4, 6, 8, 12, 16].map((num) => (
              <TouchableOpacity
                key={num}
                style={styles.pickerOptionRow}
                onPress={() => {
                  setPersonCount(num);
                  setShowPersonPicker(false);
                }}
              >
                <Text style={[styles.pickerOptionText, { color: personCount === num ? '#00A859' : theme.textPrimary }]}>
                  {num} {num === 1 ? 'Person' : 'People'}
                </Text>
                {personCount === num && <Ionicons name="checkmark-circle" size={18} color="#00A859" />}
              </TouchableOpacity>
            ))}

            <View style={styles.customInputRow}>
              <TextInput
                style={[styles.customInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                placeholder="Or custom count (e.g. 25)"
                placeholderTextColor={theme.textMuted}
                keyboardType="number-pad"
                value={customPersonInput}
                onChangeText={setCustomPersonInput}
              />
              <TouchableOpacity
                style={styles.customInputBtn}
                onPress={() => {
                  const val = parseInt(customPersonInput, 10);
                  if (val && val > 0) {
                    setPersonCount(val);
                    setCustomPersonInput('');
                    setShowPersonPicker(false);
                  }
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>Set</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showDeskPicker} transparent animationType="fade" onRequestClose={() => setShowDeskPicker(false)}>
        <TouchableOpacity
          style={styles.pickerBackdrop}
          activeOpacity={1}
          onPress={() => setShowDeskPicker(false)}
        >
          <View style={[styles.pickerSheet, { backgroundColor: theme.card }]}>
            <Text style={[styles.pickerTitle, { color: theme.textPrimary }]}>Select Workspace Type</Text>
            {[
              'Desk',
              'Flex Desk',
              'Fixed Desk',
              'Meeting Room',
              'Boardroom',
              'Private Office',
              'Day Pass',
              'Podcast Studio'
            ].map((d) => (
              <TouchableOpacity
                key={d}
                style={styles.pickerOptionRow}
                onPress={() => {
                  setDeskType(d);
                  setShowDeskPicker(false);
                }}
              >
                <Text style={[styles.pickerOptionText, { color: deskType === d ? '#00A859' : theme.textPrimary }]}>
                  {d}
                </Text>
                {deskType === d && <Ionicons name="checkmark-circle" size={18} color="#00A859" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  headerBanner: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  headerProfileRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatarBorder: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden'
  },
  avatarImage: {
    width: 40,
    height: 40
  },
  locationPill: {
    marginLeft: 12
  },
  locationLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '500'
  },
  locationValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  unreadBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  },
  searchCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3
  },
  searchCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    height: 46,
    paddingHorizontal: 12,
    marginBottom: 12
  },
  searchInput: {
    flex: 1,
    fontSize: 14
  },
  searchOptionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12
  },
  optionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10
  },
  optionPillText: {
    fontSize: 13,
    fontWeight: '600'
  },
  findWorkspaceBtn: {
    backgroundColor: '#00A859',
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center'
  },
  findWorkspaceText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  },
  adminAlertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D97706',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 14,
    borderRadius: 16
  },
  adminAlertTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  adminAlertSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12
  },
  adminAlertAction: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10
  },
  adminAlertActionText: {
    color: '#D97706',
    fontWeight: '700',
    fontSize: 12
  },
  categoryScroll: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1
  },
  categoryChipActive: {
    backgroundColor: '#00A859',
    borderColor: '#00A859'
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800'
  },
  seeAllLink: {
    color: '#00A859',
    fontSize: 13,
    fontWeight: '700'
  },
  popularCarousel: {
    paddingHorizontal: 20,
    gap: 16
  },
  popularCard: {
    width: width * 0.76,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden'
  },
  popularImageWrapper: {
    height: 160,
    position: 'relative'
  },
  cardHeartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10
  },
  popularImage: {
    width: '100%',
    height: '100%'
  },
  ratingBadgePill: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  ratingBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4
  },
  typeBadgePill: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#00A859',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  popularCardBody: {
    padding: 14
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6
  },
  cardLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  cardAddress: {
    fontSize: 13,
    flex: 1
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardTime: {
    fontSize: 12
  },
  cardPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: '#00A859'
  },
  radiusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1
  },
  radiusPillActive: {
    backgroundColor: '#00A859',
    borderColor: '#00A859'
  },
  radiusPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B'
  },
  nearbyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12
  },
  nearbyThumb: {
    width: 76,
    height: 76
  },
  nearbyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4
  },
  nearbyAddress: {
    fontSize: 13,
    marginBottom: 6
  },
  nearbyMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  nearbyPrice: {
    color: '#00A859',
    fontSize: 14,
    fontWeight: '700'
  },
  quotaWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1
  },
  quotaWidgetTitle: {
    fontSize: 15,
    fontWeight: '700'
  },
  quotaPillBtn: {
    backgroundColor: '#00A859',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    marginLeft: 10
  },
  quotaPillBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8
  },
  fullWidthOptionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 10
  },
  adminOperatorCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1
  },
  adminOperatorHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  adminOperatorAvatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center'
  },
  adminOperatorName: {
    fontSize: 14,
    fontWeight: '700'
  },
  adminOperatorEmail: {
    fontSize: 12,
    marginTop: 1
  },
  adminOperatorOrg: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2
  },
  adminOperatorExpanded: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1
  },
  expandedSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8
  },
  miniLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)'
  },
  miniLocationName: {
    fontSize: 12,
    fontWeight: '600'
  },
  miniLocationAddr: {
    fontSize: 11,
    marginTop: 1
  },
  miniCompanyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)'
  },
  miniQuotaPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#DCFCE7'
  },
  miniQuotaText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00A859'
  },
  pickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  pickerSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: 460
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center'
  },
  pickerOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)'
  },
  pickerOptionText: {
    fontSize: 14,
    fontWeight: '600'
  },
  customInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    alignItems: 'center'
  },
  customInput: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14
  },
  customInputBtn: {
    backgroundColor: '#00A859',
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
