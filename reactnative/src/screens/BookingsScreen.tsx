import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform
} from 'react-native';
import { mobileApi } from '../services/api';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { ModalPopup } from '../components/ModalPopup';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

interface BookingsScreenProps {
  onOpenNotifications: () => void;
  unreadNotifsCount: number;
}

export const BookingsScreen: React.FC<BookingsScreenProps> = ({
  onOpenNotifications,
  unreadNotifsCount
}) => {
  const { user } = useAuth();
  const isAdminRole = user?.role === 'SUPER_ADMIN' || user?.role === 'COWORKING_ADMIN';

  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [targetCancelBooking, setTargetCancelBooking] = useState<any | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const scopeParam = activeFilter === 'upcoming' ? 'upcoming' : activeFilter === 'completed' ? 'past' : undefined;
      const data = await mobileApi.getMyBookings(scopeParam);
      setBookings(data || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeFilter]);

  const confirmCancelBooking = (booking: any) => {
    setTargetCancelBooking(booking);
  };

  const executeCancelBooking = async () => {
    if (!targetCancelBooking) return;
    try {
      setCancellingId(targetCancelBooking._id);
      await mobileApi.cancelBooking(targetCancelBooking._id, 'Client mobile app cancellation');
      setTargetCancelBooking(null);
      fetchBookings();
    } catch (err: any) {
      setTargetCancelBooking(null);
      setModalError(err.message || 'Failed to cancel reservation');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'upcoming') return b.status === 'CONFIRMED' || b.status === 'CHECKED_IN';
    if (activeFilter === 'completed') return b.status === 'COMPLETED';
    if (activeFilter === 'cancelled') return b.status === 'CANCELLED' || b.status === 'EXPIRED';
    return true;
  });

  return (
    <View style={styles.container}>
      <Header
        title={isAdminRole ? 'All Reservations' : 'My Reservations'}
        subtitle={isAdminRole ? 'Campus Facility Bookings' : 'Schedule & History'}
        unreadCount={unreadNotifsCount}
        onPressNotifications={onOpenNotifications}
      />

      <View style={styles.scopeRow}>
        <TouchableOpacity
          onPress={() => setActiveFilter('all')}
          style={[styles.scopePill, activeFilter === 'all' && styles.scopePillActive]}
        >
          <Text style={[styles.scopeText, activeFilter === 'all' && styles.scopeTextActive]}>
            All ({bookings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveFilter('upcoming')}
          style={[styles.scopePill, activeFilter === 'upcoming' && styles.scopePillActive]}
        >
          <Text style={[styles.scopeText, activeFilter === 'upcoming' && styles.scopeTextActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveFilter('completed')}
          style={[styles.scopePill, activeFilter === 'completed' && styles.scopePillActive]}
        >
          <Text style={[styles.scopeText, activeFilter === 'completed' && styles.scopeTextActive]}>
            Completed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveFilter('cancelled')}
          style={[styles.scopePill, activeFilter === 'cancelled' && styles.scopePillActive]}
        >
          <Text style={[styles.scopeText, activeFilter === 'cancelled' && styles.scopeTextActive]}>
            Cancelled
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.brassLight} />
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchBookings();
              }}
              tintColor={colors.brassLight}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={36} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No reservations found</Text>
              <Text style={styles.emptySub}>
                {activeFilter === 'upcoming'
                  ? 'No scheduled bookings found in this view.'
                  : activeFilter === 'cancelled'
                  ? 'No cancelled or expired booking records.'
                  : 'No reservations available.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const roomName =
              typeof item.roomId === 'object' && item.roomId !== null
                ? item.roomId.name
                : 'Meeting Room';
            const companyName =
              typeof item.companyId === 'object' && item.companyId !== null
                ? item.companyId.name
                : 'Aptapace Private Limited';
            const start = new Date(item.startTime);
            const end = new Date(item.endTime);
            const isConfirmed = item.status === 'CONFIRMED';
            const isCompleted = item.status === 'COMPLETED';
            const isCancelled = item.status === 'CANCELLED';
            const isExpired = item.status === 'EXPIRED';
            const isCancelling = cancellingId === item._id;

            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.refText}>{item.bookingNumber}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      isConfirmed
                        ? styles.statusConfirmed
                        : isCompleted
                        ? styles.statusCompleted
                        : isCancelled
                        ? styles.statusCancelled
                        : styles.statusExpired
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        isConfirmed
                          ? styles.statusConfirmedText
                          : isCompleted
                          ? styles.statusCompletedText
                          : isCancelled
                          ? styles.statusCancelledText
                          : styles.statusExpiredText
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardTitle}>{item.title}</Text>

                {isAdminRole && (
                  <View style={styles.companyRow}>
                    <Ionicons name="business" size={12} color={colors.brassLight} />
                    <Text style={styles.companyNameText}>{companyName}</Text>
                  </View>
                )}

                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={14} color={colors.brassLight} />
                  <Text style={styles.metaText}>{roomName}</Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Ionicons name="people-outline" size={14} color={colors.textMuted} />
                  <Text style={styles.metaText}>{item.attendeeCount} guests</Text>
                </View>

                <View style={styles.metaRow}>
                  <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                  <Text style={styles.metaText}>
                    {start.toLocaleDateString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}{' '}
                    •{' '}
                    {start.toLocaleTimeString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}{' '}
                    -{' '}
                    {end.toLocaleTimeString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </Text>
                </View>

                {item.cancellationReason && (
                  <View style={styles.reasonBox}>
                    <Ionicons name="information-circle" size={14} color={colors.danger} />
                    <Text style={styles.reasonText}>{item.cancellationReason}</Text>
                  </View>
                )}

                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.quotaText}>
                      {item.pricingSnapshot?.freeHoursApplied > 0
                        ? `✓ ${item.pricingSnapshot.freeHoursApplied} free hrs applied`
                        : 'Complimentary Quota'}
                    </Text>
                    {item.pricingSnapshot?.chargeableHours > 0 && (
                      <Text style={styles.overageText}>
                        +{item.pricingSnapshot.chargeableHours}h (₹
                        {item.pricingSnapshot.totalAmount || 0})
                      </Text>
                    )}
                  </View>

                  {isConfirmed && (
                    <TouchableOpacity
                      onPress={() => confirmCancelBooking(item)}
                      disabled={isCancelling}
                      style={styles.cancelButton}
                    >
                      {isCancelling ? (
                        <ActivityIndicator size="small" color={colors.danger} />
                      ) : (
                        <Text style={styles.cancelText}>Cancel</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}

      <ModalPopup
        visible={!!targetCancelBooking}
        title="Cancel Reservation?"
        message={`Are you sure you want to cancel "${targetCancelBooking?.title || 'this reservation'}"? Free allowance hours applied will be immediately refunded to your corporate balance.`}
        variant="danger"
        confirmText="Yes, Cancel Booking"
        cancelText="Keep Booking"
        onConfirm={executeCancelBooking}
        onCancel={() => setTargetCancelBooking(null)}
      />

      <ModalPopup
        visible={!!modalError}
        title="Notice"
        message={modalError || ''}
        variant="info"
        confirmText="OK"
        onConfirm={() => setModalError(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scopeRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6
  },
  scopePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center'
  },
  scopePillActive: {
    backgroundColor: colors.brassLight,
    borderColor: colors.brassLight
  },
  scopeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted
  },
  scopeTextActive: {
    color: '#090D16'
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
    paddingBottom: 32
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 32,
    alignItems: 'center',
    marginTop: 20
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 12
  },
  emptySub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    marginBottom: 12
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  refText: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: colors.brassLight,
    fontWeight: '700'
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  statusConfirmed: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)'
  },
  statusCompleted: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)'
  },
  statusCancelled: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)'
  },
  statusExpired: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)'
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800'
  },
  statusConfirmedText: {
    color: colors.success
  },
  statusCompletedText: {
    color: colors.info
  },
  statusCancelledText: {
    color: colors.danger
  },
  statusExpiredText: {
    color: colors.textMuted
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6
  },
  companyNameText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.brassLight
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted
  },
  metaDot: {
    color: colors.textMuted,
    marginHorizontal: 2
  },
  reasonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    padding: 8,
    borderRadius: 8,
    marginTop: 6
  },
  reasonText: {
    fontSize: 11,
    color: colors.danger,
    flex: 1
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.inputBg
  },
  quotaText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.success
  },
  overageText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.warning
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)'
  },
  cancelText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.danger
  }
});
