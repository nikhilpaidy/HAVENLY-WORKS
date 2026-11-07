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
import { SafeImage } from '../components/SafeImage';
import { ListRowSkeleton } from '../components/SkeletonLoader';

interface BookingsScreenProps {
  onOpenNotifications: () => void;
  unreadNotifsCount: number;
}

export const BookingsScreen: React.FC<BookingsScreenProps> = ({
  onOpenNotifications,
  unreadNotifsCount
}) => {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();

  const isCoworkingAdmin = user?.role === 'COWORKING_ADMIN';

  const [activeTab, setActiveTab] = useState<'ONGOING' | 'COMPLETED' | 'CANCELLED'>('ONGOING');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [reminders, setReminders] = useState<Record<string, boolean>>({});

  const fetchBookings = async () => {
    try {
      const data = await mobileApi.getBookings({ tab: activeTab });
      setBookings(data || []);
    } catch (err) {
      console.warn('Failed to load bookings:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const onRefresh = () => {
    setRefreshing(true);
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

        <Text style={[styles.spaceName, { color: theme.textPrimary }]}>
          {room.name || item.title}
        </Text>
        <Text style={[styles.addressText, { color: theme.textSecondary }]}>
          {loc.address?.street || '789 Park Avenue'}, {loc.city || 'Bangalore'}
        </Text>

        <View style={styles.timeSection}>
          <Text style={[styles.timeLabel, { color: theme.textMuted }]}>Booking Date & Time</Text>
          <Text style={[styles.timeValue, { color: theme.textPrimary }]}>{formatDate(item.startTime)}</Text>
        </View>

        {isCoworkingAdmin && isPending && (
          <TouchableOpacity
            style={styles.adminConfirmBtn}
            onPress={() => handleConfirmGuest(item)}
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

        {activeTab === 'ONGOING' && (
          <TouchableOpacity
            style={styles.cancelLink}
            onPress={() => handleCancelBooking(item)}
          >
            <Text style={styles.cancelLinkText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>My Bookings</Text>
        <TouchableOpacity style={styles.notifBtn} onPress={onOpenNotifications}>
          <Ionicons name="notifications-outline" size={20} color={theme.textPrimary} />
          {unreadNotifsCount > 0 && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      </View>

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
                <Text style={[styles.receiptLabel, { color: theme.textMuted }]}>Date & Time</Text>
                <Text style={[styles.receiptValue, { color: theme.textPrimary }]}>
                  {formatDate(selectedReceipt?.startTime)}
                </Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={[styles.receiptLabel, { color: theme.textMuted }]}>Status</Text>
                <Text style={{ fontWeight: '700', color: selectedReceipt?.status === 'CANCELLED' ? '#EF4444' : '#00A859' }}>
                  {selectedReceipt?.status}
                </Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={[styles.receiptLabel, { color: theme.textMuted }]}>Payment Method</Text>
                <Text style={[styles.receiptValue, { color: theme.textPrimary }]}>
                  {selectedReceipt?.paymentMethod || 'UPI QR Code'}
                </Text>
              </View>

              <View style={[styles.receiptTotalBox, { backgroundColor: isDark ? '#0A0F1D' : '#F0FDF4' }]}>
                <Text style={{ fontSize: 13, color: '#166534', fontWeight: '600' }}>Amount Paid / Quota</Text>
                <Text style={styles.receiptTotalAmount}>
                  ₹{(selectedReceipt?.pricingSnapshot?.totalAmount || 0).toLocaleString('en-IN')}
                </Text>
              </View>

              <Text style={{ fontSize: 11, color: theme.textMuted, textAlign: 'center', marginTop: 14 }}>
                Show this digital receipt upon entry at the reception desk.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800'
  },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center'
  },
  unreadDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444'
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
    fontWeight: '600'
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
    paddingBottom: 90
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
    marginBottom: 10
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '700'
  },
  pendingTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  pendingTagText: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '600'
  },
  spaceName: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4
  },
  addressText: {
    fontSize: 13,
    marginBottom: 14
  },
  timeSection: {
    marginBottom: 16
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '500'
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  receiptBtn: {
    backgroundColor: '#00A859',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20
  },
  receiptBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  remindRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  remindText: {
    fontSize: 13,
    fontWeight: '500',
    marginRight: 8
  },
  cancelLink: {
    alignSelf: 'center',
    marginTop: 12
  },
  cancelLinkText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600'
  },
  adminConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 12
  },
  adminConfirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 14,
    marginTop: 10
  },
  receiptBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end'
  },
  receiptCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 24,
    paddingBottom: 40
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  receiptBadge: {
    color: '#00A859',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: '800'
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)'
  },
  receiptLabel: {
    fontSize: 13
  },
  receiptValue: {
    fontSize: 13,
    fontWeight: '600'
  },
  receiptTotalBox: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16
  },
  receiptTotalAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#00A859',
    marginTop: 4
  }
});
