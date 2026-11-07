import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput
} from 'react-native';
import { mobileApi } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeImage } from '../components/SafeImage';
import { WorkspaceCardSkeleton } from '../components/SkeletonLoader';
import { WorkspaceDetailModal } from './WorkspaceDetailModal';
import { useAuth } from '../context/AuthContext';

interface RoomsScreenProps {
  onOpenNotifications: () => void;
  unreadNotifsCount: number;
}

export const RoomsScreen: React.FC<RoomsScreenProps> = ({
  onOpenNotifications,
  unreadNotifsCount
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();

  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedSpace, setSelectedSpace] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchRooms = async () => {
    try {
      const data = await mobileApi.getPublicRooms({
        workspaceType: selectedCategory !== 'ALL' ? selectedCategory : undefined
      });
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to load rooms:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [selectedCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRooms();
  };

  const categories = [
    { label: 'All', value: 'ALL' },
    { label: 'Hot Desk', value: 'HOT_DESK' },
    { label: 'Dedicated Desk', value: 'DEDICATED_DESK' },
    { label: 'Private Office', value: 'PRIVATE_OFFICE' },
    { label: 'Conference', value: 'MEETING_ROOM' },
    { label: 'Boardroom', value: 'BOARDROOM' },
    { label: 'Day Pass', value: 'DAY_PASS' }
  ];

  const filtered = rooms.filter((r) => {
    if (!searchQuery.trim()) return true;
    const nameMatch = r.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const locMatch = (r.locationId?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || locMatch;
  });

  const renderCard = ({ item }: { item: any }) => {
    const loc = item.locationId || {};
    const photo = (item.photos && item.photos[0]) || loc.images?.[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80';

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        onPress={() => {
          setSelectedSpace(item);
          setShowDetailModal(true);
        }}
        activeOpacity={0.88}
      >
        <View style={styles.imageBox}>
          <SafeImage uri={photo} style={styles.cardImage} borderRadius={18} />
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={13} color="#F59E0B" />
            <Text style={styles.ratingText}>{item.rating || 4.9}</Text>
          </View>
          <View style={styles.saveBadge}>
            <Text style={styles.saveBadgeText}>{item.saveBadge || 'Save 10%'}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.titleRow}>
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.priceTag}>
              ₹{item.hourlyRate || 350}
              <Text style={{ fontSize: 11, fontWeight: '500', color: theme.textMuted }}>/hr</Text>
            </Text>
          </View>

          <View style={styles.locRow}>
            <Ionicons name="location-outline" size={14} color="#00A859" style={{ marginRight: 4 }} />
            <Text style={[styles.locText, { color: theme.textSecondary }]} numberOfLines={1}>
              {loc.address?.street || '789 Park Avenue'}, {loc.city || 'Bangalore'}
            </Text>
          </View>

          <View style={styles.metaFooter}>
            <View style={styles.timeMeta}>
              <Ionicons name="time-outline" size={13} color={theme.textMuted} style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 12, color: theme.textMuted }}>{loc.distanceLabel || '15 Min • 3.0 km'}</Text>
            </View>
            <View style={styles.capacityMeta}>
              <Ionicons name="people-outline" size={13} color="#00A859" style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 12, color: theme.textPrimary, fontWeight: '600' }}>
                {item.capacity} {item.capacity === 1 ? 'Desk' : 'Seats'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Explore Workspaces</Text>
        <TouchableOpacity style={styles.notifBtn} onPress={onOpenNotifications}>
          <Ionicons name="notifications-outline" size={20} color={theme.textPrimary} />
          {unreadNotifsCount > 0 && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      </View>

      <View style={[styles.searchBox, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
        <Ionicons name="search-outline" size={18} color={theme.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: theme.textPrimary }]}
          placeholder="Search desks, private offices, boardrooms..."
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={{ marginBottom: 12 }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item.value && styles.categoryChipActive,
                { borderColor: theme.cardBorder }
              ]}
              onPress={() => setSelectedCategory(item.value)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  { color: selectedCategory === item.value ? '#FFFFFF' : theme.textSecondary }
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View style={{ paddingHorizontal: 20 }}>
          <WorkspaceCardSkeleton />
          <WorkspaceCardSkeleton />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyView}>
          <Ionicons name="search-outline" size={48} color={theme.textMuted} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No workspaces found matching "{searchQuery}".
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={renderCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00A859" />}
        />
      )}

      <WorkspaceDetailModal
        visible={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        space={selectedSpace}
        currentUser={user}
        onBookSuccess={fetchRooms}
      />
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
    paddingBottom: 8
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 16,
    borderWidth: 1
  },
  searchInput: {
    flex: 1,
    fontSize: 14
  },
  categoryList: {
    paddingHorizontal: 20,
    gap: 8,
    paddingVertical: 4
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 90
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  imageBox: {
    height: 180,
    position: 'relative'
  },
  cardImage: {
    width: '100%',
    height: '100%'
  },
  ratingBadge: {
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
  ratingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4
  },
  saveBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#00A859',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10
  },
  saveBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  cardBody: {
    padding: 16
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    marginRight: 10
  },
  priceTag: {
    fontSize: 17,
    fontWeight: '800',
    color: '#00A859'
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  locText: {
    fontSize: 13,
    flex: 1
  },
  metaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)'
  },
  timeMeta: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  capacityMeta: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  emptyView: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 14,
    marginTop: 10
  }
});
