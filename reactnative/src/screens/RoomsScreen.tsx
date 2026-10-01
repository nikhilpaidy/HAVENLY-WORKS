import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { mobileApi } from '../services/api';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { BookModal } from './BookModal';
import { Ionicons } from '@expo/vector-icons';

interface RoomsScreenProps {
  onOpenNotifications: () => void;
  unreadNotifsCount: number;
}

export const RoomsScreen: React.FC<RoomsScreenProps> = ({
  onOpenNotifications,
  unreadNotifsCount
}) => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [bookModalVisible, setBookModalVisible] = useState(false);
  const [lastSuccessBooking, setLastSuccessBooking] = useState<any | null>(null);

  const fetchRooms = async () => {
    try {
      const data = await mobileApi.getRooms();
      setRooms(Array.isArray(data) ? data.filter((r: any) => r.isActive) : []);
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openBookModal = (room: any) => {
    setSelectedRoom(room);
    setBookModalVisible(true);
  };

  const handleBookingSuccess = (booking: any) => {
    setLastSuccessBooking(booking);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Meeting Rooms"
        subtitle="Executive Inventory"
        unreadCount={unreadNotifsCount}
        onPressNotifications={onOpenNotifications}
      />

      {lastSuccessBooking && (
        <View style={styles.successBanner}>
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
          <View style={styles.successTextWrap}>
            <Text style={styles.successTitle}>
              Booked! Ref: {lastSuccessBooking.bookingNumber}
            </Text>
            <Text style={styles.successSub}>
              {lastSuccessBooking.freeHoursDeducted || 0} free hours applied.
            </Text>
          </View>
          <TouchableOpacity onPress={() => setLastSuccessBooking(null)}>
            <Ionicons name="close" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.brassLight} />
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchRooms();
              }}
              tintColor={colors.brassLight}
            />
          }
          renderItem={({ item }) => {
            const locName =
              typeof item.locationId === 'object' && item.locationId !== null
                ? item.locationId.name
                : 'Primary Campus';

            return (
              <View style={styles.roomCard}>
                <View style={styles.cardTop}>
                  <Text style={styles.locationText}>{locName}</Text>
                  <View style={styles.activePill}>
                    <Text style={styles.activeText}>Available</Text>
                  </View>
                </View>

                <Text style={styles.roomTitle}>{item.name}</Text>
                {item.description ? (
                  <Text style={styles.roomDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}

                {}
                <View style={styles.specsRow}>
                  <View style={styles.specBadge}>
                    <Ionicons name="people-outline" size={13} color={colors.textMuted} />
                    <Text style={styles.specText}>{item.capacity} seats</Text>
                  </View>
                  <View style={styles.specBadge}>
                    <Ionicons name="time-outline" size={13} color={colors.textMuted} />
                    <Text style={styles.specText}>{item.slotIntervalMinutes || 30}m slots</Text>
                  </View>
                  <View style={styles.specBadge}>
                    <Ionicons name="cash-outline" size={13} color={colors.brassLight} />
                    <Text style={styles.specText}>₹{item.hourlyRate}/hr</Text>
                  </View>
                </View>

                {}
                {item.amenities && item.amenities.length > 0 && (
                  <View style={styles.amenitiesRow}>
                    {item.amenities.map((a: string, idx: number) => (
                      <View key={idx} style={styles.amenityPill}>
                        <Text style={styles.amenityText}>{a}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => openBookModal(item)}
                  style={styles.scheduleButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.scheduleText}>Select & Check Slots</Text>
                  <Ionicons name="calendar-outline" size={14} color="#090D16" />
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      {}
      <BookModal
        visible={bookModalVisible}
        room={selectedRoom}
        onClose={() => setBookModalVisible(false)}
        onSuccess={handleBookingSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  listContent: {
    padding: 20
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successBg,
    borderWidth: 1,
    borderColor: colors.success,
    padding: 12,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 14
  },
  successTextWrap: {
    flex: 1,
    marginLeft: 8
  },
  successTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success
  },
  successSub: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1
  },
  roomCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 18,
    marginBottom: 16
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  locationText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.brass
  },
  activePill: {
    backgroundColor: colors.successBg,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  activeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.success
  },
  roomTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4
  },
  roomDesc: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
    marginBottom: 12
  },
  specsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  specBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5
  },
  specText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 4,
    fontWeight: '600'
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16
  },
  amenityPill: {
    backgroundColor: colors.cardBorder,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3
  },
  amenityText: {
    fontSize: 9,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  scheduleButton: {
    backgroundColor: colors.brassLight,
    borderRadius: 14,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  scheduleText: {
    color: '#090D16',
    fontSize: 12,
    fontWeight: '800'
  }
});
