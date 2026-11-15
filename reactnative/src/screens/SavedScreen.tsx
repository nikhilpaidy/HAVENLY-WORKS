import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mobileApi } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { SafeImage } from '../components/SafeImage';
import { WorkspaceCardSkeleton } from '../components/SkeletonLoader';
import { WorkspaceDetailModal } from './WorkspaceDetailModal';
import { spacing, radii, typography, shadows } from '../theme/tokens';

interface SavedScreenProps {
  onOpenNotifications: () => void;
  unreadNotifsCount: number;
  onOpenDrawer?: () => void;
  onNavigateToRooms: () => void;
}

export const SavedScreen: React.FC<SavedScreenProps> = ({
  onOpenNotifications,
  unreadNotifsCount,
  onOpenDrawer,
  onNavigateToRooms
}) => {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();

  const [savedRooms, setSavedRooms] = useState<any[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(user?.favoriteRoomIds || []);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchSavedRooms = async () => {
    try {
      const allRooms = await mobileApi.getPublicRooms();
      const currentFavs = user?.favoriteRoomIds || favoriteIds;
      if (Array.isArray(allRooms)) {
        const filtered = allRooms.filter((r: any) => currentFavs.includes(r._id));
        setSavedRooms(filtered);
      }
    } catch (err) {
      console.warn('Failed to load saved workspaces:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSavedRooms();
  }, [user?.favoriteRoomIds]);

  const handleToggleLike = async (roomId: string) => {
    try {
      const res = await mobileApi.toggleRoomLike(roomId);
      const nextIds = res.favoriteRoomIds || [];
      setFavoriteIds(nextIds);
      setSavedRooms((prev) => prev.filter((r) => nextIds.includes(r._id)));
    } catch {
      setFavoriteIds((prev) => prev.filter((id) => id !== roomId));
      setSavedRooms((prev) => prev.filter((r) => r._id !== roomId));
    }
  };

  const handleCardPress = (room: any) => {
    setSelectedSpace(room);
    setShowDetailModal(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Saved Workspaces"
        subtitle="Bookmarked Spaces"
        unreadCount={unreadNotifsCount}
        onPressNotifications={onOpenNotifications}
        onOpenDrawer={onOpenDrawer}
      />

      {loading ? (
        <View style={styles.loadingWrap}>
          <WorkspaceCardSkeleton />
          <WorkspaceCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={savedRooms}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchSavedRooms();
              }}
              tintColor="#00A859"
            />
          }
          ListEmptyComponent={
            <View style={[styles.emptyWrap, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <View style={[styles.emptyIconBox, { backgroundColor: isDark ? 'rgba(0, 168, 89, 0.15)' : '#DCFCE7' }]}>
                <Ionicons name="bookmark" size={32} color="#00A859" />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Saved Workspaces</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Bookmark executive rooms, focus desks, or private cabins to reserve them quickly later.
              </Text>
              <TouchableOpacity
                style={[styles.exploreBtn, { backgroundColor: '#00A859' }]}
                onPress={onNavigateToRooms}
                activeOpacity={0.85}
              >
                <Ionicons name="grid-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.exploreBtnText}>Browse Workspaces</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => {
            const locName = typeof item.locationId === 'object' && item.locationId !== null
              ? item.locationId.name
              : 'Coworking Hub';

            return (
              <TouchableOpacity
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.cardBorder
                  }
                ]}
                onPress={() => handleCardPress(item)}
                activeOpacity={0.9}
              >
                <View style={styles.imageBox}>
                  <SafeImage
                    uri={item.photoUrl || (item.photos && item.photos[0])}
                    style={styles.cardImg}
                    fallbackIcon="business-outline"
                    borderRadius={14}
                  />
                  <TouchableOpacity
                    style={styles.favBadge}
                    onPress={() => handleToggleLike(item._id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="bookmark" size={18} color="#00A859" />
                  </TouchableOpacity>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>
                      {item.workspaceType ? item.workspaceType.replace(/_/g, ' ') : 'WORKSPACE'}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardInfo}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.cardTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>

                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={13} color="#00A859" style={{ marginRight: 4 }} />
                    <Text style={[styles.locationText, { color: theme.textSecondary }]} numberOfLines={1}>
                      {locName}
                    </Text>
                  </View>

                  <View style={[styles.divider, { backgroundColor: theme.divider }]} />

                  <View style={styles.metaRow}>
                    <View style={styles.specItem}>
                      <Ionicons name="people-outline" size={14} color={theme.textMuted} style={{ marginRight: 4 }} />
                      <Text style={[styles.specText, { color: theme.textSecondary }]}>
                        {item.capacity} {item.capacity === 1 ? 'seat' : 'seats'}
                      </Text>
                    </View>

                    <View style={styles.rateBox}>
                      <Text style={[styles.rateVal, { color: '#00A859' }]}>
                        ₹{item.hourlyRate || 0}
                      </Text>
                      <Text style={[styles.ratePeriod, { color: theme.textMuted }]}>/hr</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {selectedSpace && (
        <WorkspaceDetailModal
          visible={showDetailModal}
          space={selectedSpace}
          currentUser={user}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedSpace(null);
          }}
          onBookSuccess={() => {
            setShowDetailModal(false);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loadingWrap: {
    padding: spacing.screenPadding,
    gap: spacing.md
  },
  listContent: {
    padding: spacing.screenPadding,
    paddingBottom: 110
  },
  emptyWrap: {
    alignItems: 'center',
    padding: spacing.xxl,
    borderRadius: radii.xl,
    borderWidth: 1,
    marginTop: spacing.xl
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md
  },
  emptyTitle: {
    ...typography.title2,
    marginBottom: spacing.xs
  },
  emptySubtitle: {
    ...typography.subtext,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.lg,
    maxWidth: 260
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.md
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13
  },
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.subtle
  },
  imageBox: {
    height: 160,
    width: '100%',
    position: 'relative'
  },
  cardImg: {
    width: '100%',
    height: '100%'
  },
  favBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.subtle
  },
  typeBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.xs,
    backgroundColor: 'rgba(15, 23, 42, 0.85)'
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  cardInfo: {
    padding: spacing.md
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  cardTitle: {
    ...typography.title3,
    flex: 1
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  locationText: {
    ...typography.subtext,
    flex: 1
  },
  divider: {
    height: 1,
    marginVertical: spacing.xs
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  specText: {
    ...typography.subtextMedium
  },
  rateBox: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  rateVal: {
    fontSize: 16,
    fontWeight: '800'
  },
  ratePeriod: {
    fontSize: 11,
    marginLeft: 2
  }
});
