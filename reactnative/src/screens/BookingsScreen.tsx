import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Modal,
  ScrollView,
  RefreshControl,
  Alert
} from 'react-native';
import { mobileApi } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { ListRowSkeleton } from '../components/SkeletonLoader';
import { RoomReviewModal } from '../components/RoomReviewModal';
import { Header } from '../components/Header';

interface BookingsScreenProps {
  onOpenNotifications: () => void;
  unreadNotifsCount: number;
  onOpenDrawer?: () => void;
}

export const BookingsScreen: React.FC<BookingsScreenProps> = ({
  onOpenNotifications,
  unreadNotifsCount,
  onOpenDrawer
}) => {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();

  const role = user?.role;
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isCoworkingAdmin = role === 'COWORKING_ADMIN';
  const isManagerRole = isSuperAdmin || isCoworkingAdmin;

  const [viewMode, setViewMode] = useState<'HIERARCHY' | 'ALL_FEED'>('HIERARCHY');
  const [activeTab, setActiveTab] = useState<'ONGOING' | 'COMPLETED' | 'CANCELLED'>('ONGOING');

  const [superAdminAdmins, setSuperAdminAdmins] = useState<any[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<any | null>(null);

  const [adminCompanies, setAdminCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [reminders, setReminders] = useState<Record<string, boolean>>({});

  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewRoomId, setReviewRoomId] = useState('');
  const [reviewRoomName, setReviewRoomName] = useState('');
  const [reviewBookingId, setReviewBookingId] = useState('');

  const loadHierarchyData = async () => {
    try {
      if (isSuperAdmin) {
        const admins = await mobileApi.getSuperAdminAdmins();
        setSuperAdminAdmins(admins || []);
      } else if (isCoworkingAdmin) {
        const comps = await mobileApi.getCompanies();
        setAdminCompanies(comps || []);
      }
    } catch (err) {
      console.warn('Hierarchy load error:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params: any = { tab: activeTab };
      if (isManagerRole && viewMode === 'HIERARCHY' && selectedCompany) {
        params.companyId = selectedCompany._id;
      }
      const data = await mobileApi.getBookings(params);
      setBookings(data || []);
    } catch (err) {
      console.warn('Failed to load bookings:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHierarchyData();
  }, [role]);

  useEffect(() => {
    if (!isManagerRole || viewMode === 'ALL_FEED' || (viewMode === 'HIERARCHY' && selectedCompany)) {
      fetchBookings();
    } else {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, viewMode, selectedCompany]);

  const onRefresh = () => {
    setRefreshing(true);
    if (isManagerRole) {
      loadHierarchyData();
    }
    fetchBookings();
  };

  const toggleReminder = (bookingId: string) => {
    setReminders((prev) => ({
      ...prev,
      [bookingId]: !prev[bookingId]
    }));
  };

  const handleCancelBooking = (booking: any) => {
    Alert.alert(
      'Cancel Reservation',
      `Are you sure you want to cancel booking #${booking.bookingNumber}? Any quota will be restored.`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await mobileApi.cancelBooking(booking._id, 'Cancelled via Mobile App');
              fetchBookings();
            } catch (err: any) {
              Alert.alert('Cancel Error', err.message || 'Could not cancel booking.');
            }
          }
        }
      ]
    );
  };

  const handleConfirmGuest = async (booking: any) => {
    try {
      await mobileApi.confirmGuestBooking(booking._id);
      Alert.alert('Confirmed', `Guest booking #${booking.bookingNumber} confirmed.`);
      fetchBookings();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not confirm booking.');
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Date TBD';
    const d = new Date(isoString);
    const datePart = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${datePart} | ${timePart}`;
  };

  const renderBookingCard = ({ item }: { item: any }) => {
    const room = item.roomId || {};
    const loc = item.locationId || {};
    const company = item.companyId || {};
    const isPending = item.status === 'PENDING_CONFIRMATION';
    const isRemindActive = reminders[item._id] ?? true;

    return (
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.typeBadge, { backgroundColor: isPending ? '#FEF3C7' : '#DCFCE7' }]}>
            <Text style={[styles.typeBadgeText, { color: isPending ? '#B45309' : '#15803D' }]}>
              {item.workspaceType?.replace('_', ' ') || room.workspaceType?.replace('_', ' ') || 'WORKSPACE'}
            </Text>
          </View>
          {isPending && (
            <View style={styles.pendingTag}>
              <Text style={styles.pendingTagText}>Awaiting Call Verification</Text>
            </View>
          )}
        </View>

        {isManagerRole && company.name && (
          <View style={styles.companyBadgeRow}>
            <Ionicons name="business" size={13} color="#00A859" style={{ marginRight: 5 }} />
            <Text style={[styles.companyBadgeText, { color: theme.textSecondary }]}>
              Client: <Text style={{ fontWeight: '700', color: theme.textPrimary }}>{company.name}</Text>
            </Text>
          </View>
        )}

        <Text style={[styles.spaceName, { color: theme.textPrimary }]}>
          {room.name || item.title}
        </Text>
        <Text style={[styles.addressText, { color: theme.textSecondary }]}>
          {loc.address?.street || 'Madhapur Main Rd'}, {loc.city || 'Hyderabad'}
        </Text>

        <View style={styles.timeSection}>
          <Text style={[styles.timeLabel, { color: theme.textMuted }]}>Booking Date & Time</Text>
          <Text style={[styles.timeValue, { color: theme.textPrimary }]}>{formatDate(item.startTime)}</Text>
        </View>

        {isCoworkingAdmin && isPending && (
          <TouchableOpacity
            style={styles.adminConfirmBtn}
            onPress={() => handleConfirmGuest(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.adminConfirmText}>Verify QR & Confirm Booking</Text>
          </TouchableOpacity>
        )}

        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.receiptBtn}
            onPress={() => setSelectedReceipt(item)}
            activeOpacity={0.88}
          >
            <Text style={styles.receiptBtnText}>E-Receipt</Text>
          </TouchableOpacity>

          <View style={styles.remindRow}>
            <Text style={[styles.remindText, { color: theme.textSecondary }]}>Remind me</Text>
            <Switch
              value={isRemindActive}
              onValueChange={() => toggleReminder(item._id)}
              trackColor={{ false: theme.cardBorder, true: '#00A859' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {activeTab === 'COMPLETED' && (
          <TouchableOpacity
            style={styles.rateReviewBtn}
            onPress={() => {
              setReviewRoomId(room._id || item.roomId);
              setReviewRoomName(room.name || item.title || 'Workspace');
              setReviewBookingId(item._id);
              setReviewModalVisible(true);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="star" size={14} color="#F59E0B" style={{ marginRight: 6 }} />
            <Text style={styles.rateReviewBtnText}>Rate & Review Room</Text>
          </TouchableOpacity>
        )}

        {activeTab === 'ONGOING' && (
          <TouchableOpacity
            style={styles.cancelLink}
            onPress={() => handleCancelBooking(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelLinkText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderSuperAdminDrill = () => {
    if (!selectedAdmin) {
      return (
        <ScrollView
          style={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00A859" />}
        >
          <View style={styles.sectionHeaderCard}>
            <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
              Coworking Operators ({superAdminAdmins.length})
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Select an operator to inspect their client companies & reservations
            </Text>
          </View>

          {superAdminAdmins.map((adm) => (
            <TouchableOpacity
              key={adm._id}
              style={[styles.hierarchyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
              onPress={() => setSelectedAdmin(adm)}
              activeOpacity={0.85}
            >
              <View style={styles.hierarchyAvatar}>
                <Ionicons name="business" size={22} color="#00A859" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.hierarchyTitle, { color: theme.textPrimary }]}>{adm.name}</Text>
                <Text style={[styles.hierarchySub, { color: theme.textMuted }]}>{adm.email}</Text>
                <Text style={{ fontSize: 12, color: '#00A859', fontWeight: '700', marginTop: 2 }}>
                  {adm.organizationId?.name || 'Coworking Hub'}
                </Text>
                <View style={styles.miniStatsRow}>
                  <Text style={[styles.miniStatPill, { color: theme.textSecondary }]}>
                    {adm.locations?.length || 0} Hubs
                  </Text>
                  <Text style={[styles.miniStatPill, { color: theme.textSecondary }]}>
                    {adm.companies?.length || 0} Client Companies
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      );
    }

    if (!selectedCompany) {
      const companies = selectedAdmin.companies || [];
      return (
        <ScrollView
          style={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00A859" />}
        >
          <TouchableOpacity
            style={styles.backBreadcrumb}
            onPress={() => setSelectedAdmin(null)}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={16} color="#00A859" style={{ marginRight: 6 }} />
            <Text style={styles.backBreadcrumbText}>Back to All Operators</Text>
          </TouchableOpacity>

          <View style={styles.sectionHeaderCard}>
            <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
              {selectedAdmin.name} - Client Companies ({companies.length})
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Select a client company to view their ongoing, completed & cancelled bookings
            </Text>
          </View>

          {companies.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={44} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No client companies onboarded for this operator.
              </Text>
            </View>
          ) : (
            companies.map((comp: any) => (
              <TouchableOpacity
                key={comp._id}
                style={[styles.hierarchyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={() => setSelectedCompany(comp)}
                activeOpacity={0.85}
              >
                <View style={styles.hierarchyAvatar}>
                  <Ionicons name="briefcase" size={20} color="#00A859" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.hierarchyTitle, { color: theme.textPrimary }]}>{comp.name}</Text>
                  <Text style={[styles.hierarchySub, { color: theme.textMuted }]}>{comp.billingEmail}</Text>
                  <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
                    Hub: {comp.locationId?.name || 'Assigned Location'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={styles.backBreadcrumb}
          onPress={() => setSelectedCompany(null)}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={16} color="#00A859" style={{ marginRight: 6 }} />
          <Text style={styles.backBreadcrumbText}>Back to {selectedAdmin.name} Clients</Text>
        </TouchableOpacity>

        <View style={[styles.tabBar, { borderBottomColor: theme.cardBorder }]}>
          {(['ONGOING', 'COMPLETED', 'CANCELLED'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab ? '#00A859' : theme.textSecondary },
                  activeTab === tab && { fontWeight: '700' }
                ]}
              >
                {tab === 'ONGOING' ? 'Ongoing' : tab === 'COMPLETED' ? 'Completed' : 'Cancelled'}
              </Text>
              {activeTab === tab && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={{ padding: 20 }}>
            <ListRowSkeleton />
            <ListRowSkeleton />
          </View>
        ) : bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={44} color={theme.textMuted} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No {activeTab.toLowerCase()} reservations for {selectedCompany.name}.
            </Text>
          </View>
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item._id}
            renderItem={renderBookingCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00A859" />}
          />
        )}
      </View>
    );
  };

  const renderCoworkingAdminDrill = () => {
    if (!selectedCompany) {
      return (
        <ScrollView
          style={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00A859" />}
        >
          <View style={styles.sectionHeaderCard}>
            <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
              Client Companies ({adminCompanies.length})
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Select a client to inspect their reservations or switch to All Feed
            </Text>
          </View>

          {adminCompanies.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={44} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No client companies registered yet.
              </Text>
            </View>
          ) : (
            adminCompanies.map((comp) => (
              <TouchableOpacity
                key={comp._id}
                style={[styles.hierarchyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={() => setSelectedCompany(comp)}
                activeOpacity={0.85}
              >
                <View style={styles.hierarchyAvatar}>
                  <Ionicons name="business" size={20} color="#00A859" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.hierarchyTitle, { color: theme.textPrimary }]}>{comp.name}</Text>
                  <Text style={[styles.hierarchySub, { color: theme.textMuted }]}>{comp.billingEmail}</Text>
                  <Text style={{ fontSize: 12, color: '#00A859', fontWeight: '700', marginTop: 2 }}>
                    Allowance: {comp.allowanceConfig?.annualFreeHours || 240}h / yr
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={styles.backBreadcrumb}
          onPress={() => setSelectedCompany(null)}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={16} color="#00A859" style={{ marginRight: 6 }} />
          <Text style={styles.backBreadcrumbText}>Back to All Client Companies</Text>
        </TouchableOpacity>

        <View style={[styles.tabBar, { borderBottomColor: theme.cardBorder }]}>
          {(['ONGOING', 'COMPLETED', 'CANCELLED'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab ? '#00A859' : theme.textSecondary },
                  activeTab === tab && { fontWeight: '700' }
                ]}
              >
                {tab === 'ONGOING' ? 'Ongoing' : tab === 'COMPLETED' ? 'Completed' : 'Cancelled'}
              </Text>
              {activeTab === tab && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={{ padding: 20 }}>
            <ListRowSkeleton />
            <ListRowSkeleton />
          </View>
        ) : bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={44} color={theme.textMuted} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No {activeTab.toLowerCase()} reservations for {selectedCompany.name}.
            </Text>
          </View>
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item._id}
            renderItem={renderBookingCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00A859" />}
          />
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title={isSuperAdmin ? 'Platform Bookings' : isCoworkingAdmin ? 'Hub Bookings' : 'My Bookings'}
        subtitle={
          isSuperAdmin
            ? 'Operator & Client Governance'
            : isCoworkingAdmin
            ? 'Client Reservations & Call Verification'
            : 'Reservations & Quota Usage'
        }
        onOpenDrawer={onOpenDrawer}
        unreadNotifsCount={unreadNotifsCount}
        onOpenNotifications={onOpenNotifications}
      />

      {isManagerRole && (
        <View style={styles.modeToggleRow}>
          <TouchableOpacity
            style={[
              styles.modePill,
              viewMode === 'HIERARCHY' && styles.modePillActive,
              { borderColor: theme.cardBorder }
            ]}
            onPress={() => {
              setViewMode('HIERARCHY');
              setSelectedCompany(null);
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name="git-network-outline"
              size={14}
              color={viewMode === 'HIERARCHY' ? '#FFFFFF' : theme.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.modePillText,
                { color: viewMode === 'HIERARCHY' ? '#FFFFFF' : theme.textSecondary }
              ]}
            >
              {isSuperAdmin ? 'Operators Hierarchy' : 'Clients Drilldown'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modePill,
              viewMode === 'ALL_FEED' && styles.modePillActive,
              { borderColor: theme.cardBorder }
            ]}
            onPress={() => setViewMode('ALL_FEED')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="list-outline"
              size={14}
              color={viewMode === 'ALL_FEED' ? '#FFFFFF' : theme.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.modePillText,
                { color: viewMode === 'ALL_FEED' ? '#FFFFFF' : theme.textSecondary }
              ]}
            >
              All Clients Feed
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {isSuperAdmin && viewMode === 'HIERARCHY' ? (
        renderSuperAdminDrill()
      ) : isCoworkingAdmin && viewMode === 'HIERARCHY' ? (
        renderCoworkingAdminDrill()
      ) : (
        <View style={{ flex: 1 }}>
          <View style={[styles.tabBar, { borderBottomColor: theme.cardBorder }]}>
            {(['ONGOING', 'COMPLETED', 'CANCELLED'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: activeTab === tab ? '#00A859' : theme.textSecondary },
                    activeTab === tab && { fontWeight: '700' }
                  ]}
                >
                  {tab === 'ONGOING' ? 'Ongoing' : tab === 'COMPLETED' ? 'Completed' : 'Cancelled'}
                </Text>
                {activeTab === tab && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <View style={{ padding: 20 }}>
              <ListRowSkeleton />
              <ListRowSkeleton />
              <ListRowSkeleton />
            </View>
          ) : bookings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No {activeTab.toLowerCase()} bookings found.
              </Text>
            </View>
          ) : (
            <FlatList
              data={bookings}
              keyExtractor={(item) => item._id}
              renderItem={renderBookingCard}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00A859" />}
            />
          )}
        </View>
      )}

      <Modal
        visible={!!selectedReceipt}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedReceipt(null)}
      >
        <View style={styles.receiptBackdrop}>
          <View style={[styles.receiptCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.receiptHeader}>
              <View>
                <Text style={styles.receiptBadge}>E-RECEIPT</Text>
                <Text style={[styles.receiptTitle, { color: theme.textPrimary }]}>
                  #{selectedReceipt?.bookingNumber}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedReceipt(null)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }}>
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptLabel, { color: theme.textMuted }]}>Workspace</Text>
                <Text style={[styles.receiptValue, { color: theme.textPrimary }]}>
                  {selectedReceipt?.roomId?.name || selectedReceipt?.title}
                </Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={[styles.receiptLabel, { color: theme.textMuted }]}>Type</Text>
                <Text style={[styles.receiptValue, { color: theme.textPrimary }]}>
                  {selectedReceipt?.workspaceType?.replace('_', ' ') || 'DESK'}
                </Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={[styles.receiptLabel, { color: theme.textMuted }]}>Start Time</Text>
                <Text style={[styles.receiptValue, { color: theme.textPrimary }]}>
                  {formatDate(selectedReceipt?.startTime)}
                </Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={[styles.receiptLabel, { color: theme.textMuted }]}>End Time</Text>
                <Text style={[styles.receiptValue, { color: theme.textPrimary }]}>
                  {formatDate(selectedReceipt?.endTime)}
                </Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={[styles.receiptLabel, { color: theme.textMuted }]}>Attendees</Text>
                <Text style={[styles.receiptValue, { color: theme.textPrimary }]}>
                  {selectedReceipt?.attendeeCount || 1} Person
                </Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={[styles.receiptLabel, { color: theme.textMuted }]}>Status</Text>
                <Text style={[styles.receiptValue, { color: '#00A859', fontWeight: '800' }]}>
                  {selectedReceipt?.status}
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.closeReceiptBtn}
              onPress={() => setSelectedReceipt(null)}
              activeOpacity={0.88}
            >
              <Text style={styles.closeReceiptBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <RoomReviewModal
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        roomId={reviewRoomId}
        roomName={reviewRoomName}
        bookingId={reviewBookingId}
        onReviewSubmitted={() => fetchBookings()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  modeToggleRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1
  },
  modePillActive: {
    backgroundColor: '#00A859',
    borderColor: '#00A859'
  },
  modePillText: {
    fontSize: 12,
    fontWeight: '700'
  },
  backBreadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  backBreadcrumbText: {
    color: '#00A859',
    fontSize: 13,
    fontWeight: '700'
  },
  sectionHeaderCard: {
    paddingHorizontal: 20,
    marginBottom: 12
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800'
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2
  },
  hierarchyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1
  },
  hierarchyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,168,89,0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  hierarchyTitle: {
    fontSize: 15,
    fontWeight: '700'
  },
  hierarchySub: {
    fontSize: 12,
    marginTop: 1
  },
  miniStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6
  },
  miniStatPill: {
    fontSize: 11,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1
  },
  tabItem: {
    paddingVertical: 12,
    marginRight: 24,
    position: 'relative'
  },
  tabItemActive: {},
  tabText: {
    fontSize: 14,
    fontWeight: '500'
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#00A859',
    borderRadius: 2
  },
  listContent: {
    padding: 20,
    paddingBottom: 100
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  pendingTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  pendingTagText: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '700'
  },
  companyBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  companyBadgeText: {
    fontSize: 12
  },
  spaceName: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4
  },
  addressText: {
    fontSize: 13,
    marginBottom: 12
  },
  timeSection: {
    marginBottom: 14
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '700'
  },
  adminConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D97706',
    paddingVertical: 9,
    borderRadius: 12,
    marginBottom: 12
  },
  adminConfirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  receiptBtn: {
    backgroundColor: '#00A859',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12
  },
  receiptBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  remindRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  remindText: {
    fontSize: 13,
    fontWeight: '500'
  },
  rateReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingVertical: 9,
    borderRadius: 12,
    marginTop: 12
  },
  rateReviewBtnText: {
    color: '#D97706',
    fontWeight: '700',
    fontSize: 12
  },
  cancelLink: {
    alignSelf: 'center',
    marginTop: 12
  },
  cancelLinkText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center'
  },
  receiptBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20
  },
  receiptCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  receiptBadge: {
    color: '#00A859',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: '800'
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)'
  },
  receiptLabel: {
    fontSize: 13
  },
  receiptValue: {
    fontSize: 13,
    fontWeight: '600'
  },
  closeReceiptBtn: {
    backgroundColor: '#00A859',
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16
  },
  closeReceiptBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  }
});