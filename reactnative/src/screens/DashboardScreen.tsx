import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { mobileApi } from '../services/api';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Ionicons } from '@expo/vector-icons';
import { TabKey } from '../components/TabBar';
import { ExecutiveLineChart, ExecutiveBarChart, QuotaRing } from '../components/Charts';

interface DashboardScreenProps {
  onNavigate: (tab: TabKey) => void;
  onOpenNotifications: () => void;
  unreadNotifsCount: number;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigate,
  onOpenNotifications,
  unreadNotifsCount
}) => {
  const { user } = useAuth();
  const role = user?.role;
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isCoworkingAdmin = role === 'COWORKING_ADMIN';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [allowance, setAllowance] = useState<any>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [roomsCount, setRoomsCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalDue, setTotalDue] = useState(0);

  const [clientWeeklyData, setClientWeeklyData] = useState([
    { label: 'Mon', value: 2 },
    { label: 'Tue', value: 0 },
    { label: 'Wed', value: 1 },
    { label: 'Thu', value: 2 },
    { label: 'Fri', value: 0 },
    { label: 'Sat', value: 0 },
    { label: 'Sun', value: 0 }
  ]);

  const [adminHourlyData, setAdminHourlyData] = useState([
    { label: '9 AM', value: 20 },
    { label: '11 AM', value: 85 },
    { label: '1 PM', value: 40 },
    { label: '3 PM', value: 90 },
    { label: '5 PM', value: 65 },
    { label: '7 PM', value: 15 }
  ]);

  const [superAdminRevenueTrend, setSuperAdminRevenueTrend] = useState([
    { label: 'May', value: 28 },
    { label: 'Jun', value: 45 },
    { label: 'Jul', value: 62 },
    { label: 'Aug', value: 84 },
    { label: 'Sep', value: 110 },
    { label: 'Oct', value: 124 }
  ]);

  const [roomPopularity, setRoomPopularity] = useState([
    { label: 'Sovereign', value: 12, highlight: true },
    { label: 'Horizon', value: 8 },
    { label: 'Vanguard', value: 6 },
    { label: 'Apex', value: 4 }
  ]);

  const loadData = async () => {
    try {
      if (isSuperAdmin) {
        const [statsRes, bookingsRes, roomsRes] = await Promise.all([
          mobileApi.superAdmin.getPlatformStats().catch(() => null),
          mobileApi.getBookings({}).catch(() => []),
          mobileApi.getRooms().catch(() => [])
        ]);

        if (statsRes?.financials) {
          setTotalRevenue(statsRes.financials.totalBilled || 0);
          setTotalDue(statsRes.financials.totalOutstanding || 0);
        }
        setRoomsCount(roomsRes.length || 6);
        setUpcomingBookings(bookingsRes || []);
      } else if (isCoworkingAdmin) {
        const [adminStats, bookingsRes, roomsRes, invoicesRes] = await Promise.all([
          mobileApi.admin.getHubStats().catch(() => null),
          mobileApi.getBookings({}).catch(() => []),
          mobileApi.getRooms().catch(() => []),
          mobileApi.getInvoices().catch(() => [])
        ]);

        if (adminStats?.financials) {
          setTotalDue(adminStats.financials.totalDue || 0);
          setTotalRevenue(adminStats.financials.totalBilled || 0);
        } else if (invoicesRes.length > 0) {
          const due = invoicesRes.reduce((acc: number, cur: any) => acc + (cur.amountDue || 0), 0);
          setTotalDue(due);
        }

        setRoomsCount(roomsRes.length || 6);
        setUpcomingBookings(bookingsRes || []);
      } else {
        const [allowanceRes, bookingsRes, invoicesRes] = await Promise.all([
          mobileApi.getCurrentAllowance().catch(() => null),
          mobileApi.getBookings({ myOnly: true }).catch(() => []),
          mobileApi.getInvoices().catch(() => [])
        ]);

        if (allowanceRes) {
          setAllowance(allowanceRes);
        }

        const due = (invoicesRes || []).reduce(
          (acc: number, cur: any) => acc + (cur.amountDue || 0),
          0
        );
        setTotalDue(due);
        setUpcomingBookings(bookingsRes || []);
      }
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brassLight} />
        <Text style={styles.loadingText}>Synchronizing Executive Workspace...</Text>
      </View>
    );
  }

  const grantedHours = allowance?.totalGrantedHours || allowance?.grantedHours || 20;
  const availableHours = allowance?.availableHours || allowance?.balanceHours || 16;
  const reservedHours = allowance?.reservedHours || 2;
  const consumedHours = allowance?.consumedHours || 2;

  return (
    <View style={styles.container}>
      <Header
        title={
          isSuperAdmin
            ? 'Executive Platform'
            : isCoworkingAdmin
            ? 'CWS ONE Command Hub'
            : user?.name || 'Workspace Member'
        }
        subtitle={
          isSuperAdmin
            ? 'Platform Governance • Nikhil Paidy'
            : isCoworkingAdmin
            ? 'CWS ONE Horizon, MG Road'
            : user?.company?.name || 'Aptapace Private Limited'
        }
        unreadCount={unreadNotifsCount}
        onPressNotifications={onOpenNotifications}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brassLight}
          />
        }
      >
        {isSuperAdmin && (
          <View style={styles.roleSection}>
            <View style={styles.kpiGrid}>
              <View style={styles.kpiCard}>
                <Ionicons name="business" size={20} color={colors.brassLight} />
                <Text style={styles.kpiValue}>1</Text>
                <Text style={styles.kpiLabel}>ORGANIZATION</Text>
              </View>
              <View style={styles.kpiCard}>
                <Ionicons name="location" size={20} color={colors.info} />
                <Text style={styles.kpiValue}>3</Text>
                <Text style={styles.kpiLabel}>METRO HUBS</Text>
              </View>
              <View style={styles.kpiCard}>
                <Ionicons name="cube" size={20} color={colors.warning} />
                <Text style={styles.kpiValue}>{roomsCount}</Text>
                <Text style={styles.kpiLabel}>MEETING SUITES</Text>
              </View>
              <View style={styles.kpiCard}>
                <Ionicons name="cash" size={20} color={colors.success} />
                <Text style={styles.kpiValue}>₹{totalRevenue.toLocaleString('en-IN')}</Text>
                <Text style={styles.kpiLabel}>TOTAL INVOICED</Text>
              </View>
            </View>

            <ExecutiveLineChart
              title="Platform Gross Volume (6 Months)"
              subtitle="Consolidated enterprise revenue across hubs"
              data={superAdminRevenueTrend}
              unit="k ₹"
              height={140}
              color={colors.brassLight}
            />

            <ExecutiveBarChart
              title="Metro Hub Room Capacity"
              subtitle="Active meeting rooms by campus"
              data={[
                { label: 'MG Road', value: 6, highlight: true },
                { label: 'Indiranagar', value: 4 },
                { label: 'BKC Mumbai', value: 4 },
                { label: 'Hitec City', value: 4 }
              ]}
              unit=" rms"
              height={130}
            />
          </View>
        )}

        {isCoworkingAdmin && (
          <View style={styles.roleSection}>
            <View style={styles.kpiGrid}>
              <View style={styles.kpiCard}>
                <Ionicons name="cube" size={20} color={colors.brassLight} />
                <Text style={styles.kpiValue}>{roomsCount}</Text>
                <Text style={styles.kpiLabel}>CAMPUS ROOMS</Text>
              </View>
              <View style={styles.kpiCard}>
                <Ionicons name="people" size={20} color={colors.info} />
                <Text style={styles.kpiValue}>1</Text>
                <Text style={styles.kpiLabel}>ENTERPRISE CLIENTS</Text>
              </View>
              <View style={styles.kpiCard}>
                <Ionicons name="pie-chart" size={20} color={colors.warning} />
                <Text style={styles.kpiValue}>20h</Text>
                <Text style={styles.kpiLabel}>MONTHLY POOL</Text>
              </View>
              <View style={styles.kpiCard}>
                <Ionicons name="wallet" size={20} color={colors.success} />
                <Text style={styles.kpiValue}>₹{totalDue.toLocaleString('en-IN')}</Text>
                <Text style={styles.kpiLabel}>RECEIVABLE DUE</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => onNavigate('rooms')}
              style={styles.bookButton}
              activeOpacity={0.8}
            >
              <View style={styles.bookButtonLeft}>
                <View style={styles.bookIconWrap}>
                  <Ionicons name="calendar" size={20} color="#090D16" />
                </View>
                <View>
                  <Text style={styles.bookButtonTitle}>Book on Behalf of Company</Text>
                  <Text style={styles.bookButtonSubtitle}>Select client company & reserve executive suite</Text>
                </View>
              </View>
              <Ionicons name="arrow-forward" size={18} color="#090D16" />
            </TouchableOpacity>

            <ExecutiveLineChart
              title="Today's Hub Occupancy Curve"
              subtitle="Live meeting room utilization rate"
              data={adminHourlyData}
              unit="%"
              height={135}
              color={colors.info}
            />

            <ExecutiveBarChart
              title="Room Booking Demand"
              subtitle="Monthly reservations count by suite"
              data={roomPopularity}
              unit=" bkgs"
              height={130}
            />
          </View>
        )}

        {!isSuperAdmin && !isCoworkingAdmin && (
          <View style={styles.roleSection}>
            <QuotaRing
              granted={grantedHours}
              available={availableHours}
              reserved={reservedHours}
              consumed={consumedHours}
              onPressBook={() => onNavigate('rooms')}
            />

            <ExecutiveLineChart
              title="Weekly Meeting Hours Used"
              subtitle="Current week consumption by your team"
              data={clientWeeklyData}
              unit="h"
              height={135}
              color={colors.success}
            />

            <ExecutiveBarChart
              title="Quarterly Usage History"
              subtitle="Meeting hours consumed by Aptapace"
              data={[
                { label: 'Aug', value: 8 },
                { label: 'Sep', value: 14 },
                { label: 'Oct', value: 5, highlight: true }
              ]}
              unit="h"
              height={125}
            />

            <TouchableOpacity
              onPress={() => onNavigate('rooms')}
              style={styles.bookButton}
              activeOpacity={0.8}
            >
              <View style={styles.bookButtonLeft}>
                <View style={styles.bookIconWrap}>
                  <Ionicons name="sparkles" size={20} color="#090D16" />
                </View>
                <View>
                  <Text style={styles.bookButtonTitle}>Reserve Meeting Room</Text>
                  <Text style={styles.bookButtonSubtitle}>
                    Apply {availableHours} free allowance hours instantly
                  </Text>
                </View>
              </View>
              <Ionicons name="arrow-forward" size={18} color="#090D16" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {isSuperAdmin
              ? 'Platform Recent Reservations'
              : isCoworkingAdmin
              ? 'Campus Live Reservations'
              : 'Your Scheduled Meetings'}
          </Text>
          <TouchableOpacity onPress={() => onNavigate('bookings')}>
            <Text style={styles.sectionLink}>View All ({upcomingBookings.length})</Text>
          </TouchableOpacity>
        </View>

        {upcomingBookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={32} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No reservations recorded</Text>
            <Text style={styles.emptyText}>
              Scheduled executive boardroom sessions will appear here in real-time.
            </Text>
          </View>
        ) : (
          upcomingBookings.slice(0, 4).map((b) => {
            const roomName =
              typeof b.roomId === 'object' && b.roomId !== null ? b.roomId.name : 'Executive Suite';
            const roomPhoto =
              typeof b.roomId === 'object' && b.roomId?.photos?.[0]
                ? b.roomId.photos[0]
                : 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80';
            const companyName =
              typeof b.companyId === 'object' && b.companyId !== null
                ? b.companyId.name
                : 'Aptapace Private Limited';
            const start = new Date(b.startTime);
            const isConfirmed = b.status === 'CONFIRMED';
            const isCompleted = b.status === 'COMPLETED';
            const isCancelled = b.status === 'CANCELLED';

            return (
              <View key={b._id} style={styles.bookingCard}>
                <View style={styles.bookingPhotoWrap}>
                  <Image source={{ uri: roomPhoto }} style={styles.bookingPhoto} />
                  <View
                    style={[
                      styles.statusBadgeOverlay,
                      isConfirmed
                        ? styles.badgeConfirmed
                        : isCompleted
                        ? styles.badgeCompleted
                        : isCancelled
                        ? styles.badgeCancelled
                        : styles.badgeExpired
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        isConfirmed
                          ? styles.statusTextConfirmed
                          : isCompleted
                          ? styles.statusTextCompleted
                          : isCancelled
                          ? styles.statusTextCancelled
                          : styles.statusTextExpired
                      ]}
                    >
                      {b.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.bookingContent}>
                  <View style={styles.bookingTopRow}>
                    <Text style={styles.bookingNumber}>{b.bookingNumber}</Text>
                    <Text style={styles.durationTag}>{b.durationHours} hr session</Text>
                  </View>

                  <Text style={styles.bookingTitle}>{b.title}</Text>

                  {(isSuperAdmin || isCoworkingAdmin) && (
                    <View style={styles.companyRow}>
                      <Ionicons name="business" size={12} color={colors.brassLight} />
                      <Text style={styles.companyNameText}>{companyName}</Text>
                    </View>
                  )}

                  <View style={styles.bookingMetaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="location-outline" size={14} color={colors.brassLight} />
                      <Text style={styles.metaText}>{roomName}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                      <Text style={styles.metaText}>
                        {start.toLocaleDateString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                          month: 'short',
                          day: 'numeric'
                        })}{' '}
                        •{' '}
                        {start.toLocaleTimeString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.bookingFooter}>
                    <Text style={styles.allowanceAppliedText}>
                      {b.pricingSnapshot?.freeHoursApplied > 0
                        ? `✓ ${b.pricingSnapshot.freeHoursApplied}h complimentary quota applied`
                        : 'Standard reservation slot'}
                    </Text>
                    {b.pricingSnapshot?.chargeableHours > 0 && (
                      <Text style={styles.overageText}>
                        +{b.pricingSnapshot.chargeableHours}h (₹
                        {b.pricingSnapshot.totalAmount || 0})
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    marginTop: 12,
    color: colors.textMuted,
    fontSize: 13
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32
  },
  roleSection: {
    marginBottom: 8
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16
  },
  kpiCard: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 8
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 2,
    letterSpacing: 0.5
  },
  bookButton: {
    backgroundColor: colors.brassLight,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  bookButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  bookIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(9, 13, 22, 0.15)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bookButtonTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#090D16'
  },
  bookButtonSubtitle: {
    fontSize: 11,
    color: 'rgba(9, 13, 22, 0.8)',
    marginTop: 2
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 0.5
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brassLight
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 32,
    alignItems: 'center'
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 12
  },
  emptyText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6
  },
  bookingCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    marginBottom: 14
  },
  bookingPhotoWrap: {
    height: 110,
    width: '100%',
    position: 'relative'
  },
  bookingPhoto: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.inputBg
  },
  statusBadgeOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8
  },
  bookingContent: {
    padding: 14
  },
  bookingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  bookingNumber: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: colors.brassLight,
    fontWeight: '700'
  },
  durationTag: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600'
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8
  },
  companyNameText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.brassLight
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  badgeConfirmed: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 1)'
  },
  badgeCompleted: {
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 1)'
  },
  badgeCancelled: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 1)'
  },
  badgeExpired: {
    backgroundColor: 'rgba(148, 163, 184, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 1)'
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  statusTextConfirmed: {
    color: '#FFFFFF'
  },
  statusTextCompleted: {
    color: '#FFFFFF'
  },
  statusTextCancelled: {
    color: '#FFFFFF'
  },
  statusTextExpired: {
    color: '#FFFFFF'
  },
  bookingTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6
  },
  bookingMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 10
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.inputBg
  },
  allowanceAppliedText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.success
  },
  overageText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.warning
  }
});
