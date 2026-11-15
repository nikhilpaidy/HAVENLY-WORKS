import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { mobileApi } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeImage } from '../components/SafeImage';
import { WorkspaceCardSkeleton } from '../components/SkeletonLoader';
import { WorkspaceDetailModal } from './WorkspaceDetailModal';
import { RadiusSearchModal } from './RadiusSearchModal';
import { BookModal } from './BookModal';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { LocationPickerModal, HYDERABAD_AREAS, LocationArea, USER_DEFAULT_LOCATION } from '../components/LocationPickerModal';
import * as ImagePicker from 'expo-image-picker';

interface RoomsScreenProps {
  onOpenNotifications: () => void;
  unreadNotifsCount: number;
  onOpenDrawer?: () => void;
}

const { width } = Dimensions.get('window');

export const RoomsScreen: React.FC<RoomsScreenProps> = ({
  onOpenNotifications,
  unreadNotifsCount,
  onOpenDrawer
}) => {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();

  const isAdminRole = user?.role === 'SUPER_ADMIN' || user?.role === 'COWORKING_ADMIN';

  const [rooms, setRooms] = useState<any[]>([]);
  const [workspaceTypes, setWorkspaceTypes] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedHubId, setSelectedHubId] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedLocation, setSelectedLocation] = useState<LocationArea>(USER_DEFAULT_LOCATION);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [passType, setPassType] = useState<string>('Day Pass');
  const [showPassPicker, setShowPassPicker] = useState(false);
  const [personCount, setPersonCount] = useState<number | string>(1);
  const [showPersonPicker, setShowPersonPicker] = useState(false);
  const [customPersonInput, setCustomPersonInput] = useState('');
  const [deskType, setDeskType] = useState<string>('Desk');
  const [showDeskPicker, setShowDeskPicker] = useState(false);
  const [nearbyLocations, setNearbyLocations] = useState<any[]>([]);

  const [selectedSpace, setSelectedSpace] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState('HOT_DESK');
  const [roomCapacity, setRoomCapacity] = useState('4');
  const [roomHourlyRate, setRoomHourlyRate] = useState('450');
  const [roomDailyRate, setRoomDailyRate] = useState('1800');
  const [roomFloor, setRoomFloor] = useState('');
  const [roomFloorManagerName, setRoomFloorManagerName] = useState('');
  const [roomFloorManagerPhone, setRoomFloorManagerPhone] = useState('');
  const [roomDesc, setRoomDesc] = useState('');
  const [roomPhotos, setRoomPhotos] = useState<string[]>([]);
  const [creatingRoom, setCreatingRoom] = useState(false);

  const [showEditRoomModal, setShowEditRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any | null>(null);
  const [editRoomName, setEditRoomName] = useState('');
  const [editRoomType, setEditRoomType] = useState('HOT_DESK');
  const [editHubId, setEditHubId] = useState('');
  const [editCapacity, setEditCapacity] = useState('4');
  const [editHourlyRate, setEditHourlyRate] = useState('450');
  const [editDailyRate, setEditDailyRate] = useState('1800');
  const [editFloor, setEditFloor] = useState('');
  const [editFloorManagerName, setEditFloorManagerName] = useState('');
  const [editFloorManagerPhone, setEditFloorManagerPhone] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPhotos, setEditPhotos] = useState<string[]>([]);
  const [updatingRoom, setUpdatingRoom] = useState(false);

  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [typeName, setTypeName] = useState('');
  const [typeCode, setTypeCode] = useState('');
  const [typeCapacity, setTypeCapacity] = useState('6');
  const [typeRate, setTypeRate] = useState('600');
  const [typeDesc, setTypeDesc] = useState('');
  const [creatingType, setCreatingType] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [savedRoomIds, setSavedRoomIds] = useState<string[]>(user?.favoriteRoomIds || []);

  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number | 'ALL'>('ALL');
  const [showRadiusModal, setShowRadiusModal] = useState(false);
  const [quickBookRoom, setQuickBookRoom] = useState<any | null>(null);
  const [showQuickBookModal, setShowQuickBookModal] = useState(false);

  useEffect(() => {
    if (user?.favoriteRoomIds) {
      setSavedRoomIds(user.favoriteRoomIds);
    }
  }, [user?.favoriteRoomIds]);

  const handleToggleBookmark = async (roomId: string) => {
    const isCurrentlySaved = savedRoomIds.includes(roomId);
    const updated = isCurrentlySaved
      ? savedRoomIds.filter((id) => id !== roomId)
      : [...savedRoomIds, roomId];
    setSavedRoomIds(updated);

    try {
      const res = await mobileApi.toggleRoomLike(roomId);
      if (res?.favoriteRoomIds) {
        setSavedRoomIds(res.favoriteRoomIds);
      }
    } catch {
      setSavedRoomIds(savedRoomIds);
    }
  };

  const fetchRooms = async (pageToFetch: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      const radiusKm = typeof selectedRadiusKm === 'number' ? selectedRadiusKm : 2;
      const [data, typesData, locsData, nearbyData] = await Promise.all([
        mobileApi.getPublicRooms({
          workspaceType: selectedCategory !== 'ALL' ? selectedCategory : undefined,
          page: pageToFetch,
          limit: 12
        }),
        pageToFetch === 1 ? mobileApi.getWorkspaceTypes() : Promise.resolve(null),
        pageToFetch === 1 ? mobileApi.getPublicLocations() : Promise.resolve(null),
        pageToFetch === 1 ? mobileApi.getNearbyLocations(selectedLocation.lat, selectedLocation.lng, radiusKm) : Promise.resolve(null)
      ]);
      const items = Array.isArray(data) ? data : [];
      if (append) {
        setRooms((prev) => [...prev, ...items]);
      } else {
        setRooms(items);
      }
      setHasMore(items.length >= 12);
      setPage(pageToFetch);

      if (locsData && Array.isArray(locsData) && locsData.length > 0) {
        setLocations(locsData);
        if (!selectedHubId) {
          setSelectedHubId(locsData[0]._id);
        }
      }
      if (nearbyData?.locations && Array.isArray(nearbyData.locations)) {
        setNearbyLocations(nearbyData.locations);
      }
      if (typesData && Array.isArray(typesData) && typesData.length > 0) {
        setWorkspaceTypes(typesData);
        if (!roomType && typesData[0]?.code) {
          setRoomType(typesData[0].code);
        }
      }
    } catch (err) {
      console.warn('Failed to load rooms:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      fetchRooms(page + 1, true);
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchRooms(1, false);
  }, [selectedCategory]);

  useEffect(() => {
    const radiusKm = typeof selectedRadiusKm === 'number' ? selectedRadiusKm : 2;
    mobileApi.getNearbyLocations(selectedLocation.lat, selectedLocation.lng, radiusKm).then((res) => {
      if (res?.locations) {
        setNearbyLocations(res.locations);
      }
    }).catch(() => {});
  }, [selectedLocation, selectedRadiusKm]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchRooms(1, false);
  };

  const pickImagesForRoom = async (isEdit: boolean = false) => {
    const currentPhotos = isEdit ? editPhotos : roomPhotos;
    if (currentPhotos.length >= 10) {
      Alert.alert('Limit Reached', 'You can upload up to 10 photos per workspace.');
      return;
    }
    const remaining = 10 - currentPhotos.length;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.7,
      base64: true
    });
    if (!result.canceled && result.assets) {
      const newPhotos = result.assets.map((asset) => {
        if (asset.base64) {
          return `data:image/jpeg;base64,${asset.base64}`;
        }
        return asset.uri;
      });
      if (isEdit) {
        setEditPhotos((prev) => [...prev, ...newPhotos].slice(0, 10));
      } else {
        setRoomPhotos((prev) => [...prev, ...newPhotos].slice(0, 10));
      }
    }
  };

  const uploadPhotosIfRequired = async (photoList: string[]): Promise<string[]> => {
    const resultUrls: string[] = [];
    for (const p of photoList) {
      if (p.startsWith('data:image')) {
        try {
          const uploadRes = await mobileApi.uploadRoomPhoto({ image: p });
          if (uploadRes?.url) {
            resultUrls.push(uploadRes.url);
          }
        } catch (e) {
          console.warn('Failed to upload photo:', e);
        }
      } else {
        resultUrls.push(p);
      }
    }
    return resultUrls;
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      Alert.alert('Validation Error', 'Workspace name is required.');
      return;
    }
    setCreatingRoom(true);
    try {
      const uploadedUrls = await uploadPhotosIfRequired(roomPhotos);
      await mobileApi.createRoom({
        name: roomName.trim(),
        workspaceType: roomType || 'HOT_DESK',
        locationId: selectedHubId || undefined,
        capacity: parseInt(roomCapacity, 10) || 1,
        hourlyRate: parseFloat(roomHourlyRate) || 300,
        dailyRate: parseFloat(roomDailyRate) || (parseFloat(roomHourlyRate) || 300) * 5,
        floor: roomFloor.trim() || undefined,
        floorManagerName: roomFloorManagerName.trim() || undefined,
        floorManagerPhone: roomFloorManagerPhone.trim() || undefined,
        description: roomDesc.trim() || undefined,
        photos: uploadedUrls.length > 0 ? uploadedUrls : undefined,
        amenities: ['High-speed Wi-Fi', 'Power Outlets', 'Ergonomic Seating', 'Air Conditioning']
      });
      setShowAddRoomModal(false);
      setRoomName('');
      setRoomFloor('');
      setRoomFloorManagerName('');
      setRoomFloorManagerPhone('');
      setRoomDailyRate('1800');
      setRoomDesc('');
      setRoomPhotos([]);
      Alert.alert('Success', 'Workspace created successfully.');
      fetchRooms();
    } catch (err: any) {
      Alert.alert('Create Error', err.message || 'Could not create workspace.');
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleUpdateRoom = async () => {
    if (!editingRoom?._id || !editRoomName.trim()) {
      Alert.alert('Validation Error', 'Workspace name is required.');
      return;
    }
    setUpdatingRoom(true);
    try {
      const uploadedUrls = await uploadPhotosIfRequired(editPhotos);
      await mobileApi.updateRoom(editingRoom._id, {
        name: editRoomName.trim(),
        workspaceType: editRoomType || 'HOT_DESK',
        locationId: editHubId || undefined,
        capacity: parseInt(editCapacity, 10) || 1,
        hourlyRate: parseFloat(editHourlyRate) || 300,
        dailyRate: parseFloat(editDailyRate) || (parseFloat(editHourlyRate) || 300) * 5,
        floor: editFloor.trim() || undefined,
        floorManagerName: editFloorManagerName.trim() || undefined,
        floorManagerPhone: editFloorManagerPhone.trim() || undefined,
        description: editDesc.trim() || undefined,
        photos: uploadedUrls
      });
      setShowEditRoomModal(false);
      setEditingRoom(null);
      setEditPhotos([]);
      Alert.alert('Success', 'Workspace updated successfully.');
      fetchRooms();
    } catch (err: any) {
      Alert.alert('Update Error', err.message || 'Could not update workspace.');
    } finally {
      setUpdatingRoom(false);
    }
  };

  const handleCreateType = async () => {
    if (!typeName.trim()) {
      Alert.alert('Validation Error', 'Workspace type name is required.');
      return;
    }
    setCreatingType(true);
    try {
      const code = (typeCode || typeName).trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
      await mobileApi.createWorkspaceType({
        name: typeName.trim(),
        code,
        capacityDefault: parseInt(typeCapacity, 10) || 4,
        hourlyRateDefault: parseFloat(typeRate) || 500,
        description: typeDesc.trim() || undefined
      });
      setShowAddTypeModal(false);
      setTypeName('');
      setTypeCode('');
      setTypeDesc('');
      Alert.alert('Success', `Workspace type "${typeName.trim()}" created.`);
      fetchRooms();
    } catch (err: any) {
      Alert.alert('Create Error', err.message || 'Could not create workspace type.');
    } finally {
      setCreatingType(false);
    }
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

  const filtered = rooms.filter((r) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q ||
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.locationId?.name && r.locationId.name.toLowerCase().includes(q)) ||
      (r.locationId?.city && r.locationId.city.toLowerCase().includes(q));

    let matchesRadius = true;
    if (selectedRadiusKm !== 'ALL') {
      const distanceNum = parseFloat(r.locationId?.distanceLabel || '2.0');
      matchesRadius = isNaN(distanceNum) || distanceNum <= selectedRadiusKm;
    }

    return matchesSearch && matchesRadius;
  });

  const dayPassRoom = rooms.find(
    (r) => r.workspaceType === 'DAY_PASS' || r.workspaceType === 'HOT_DESK' || r.workspaceType === 'FLEX_DESK'
  ) || rooms[0];

  const renderCard = ({ item }: { item: any }) => {
    const loc = item.locationId || {};
    const photo = (item.photos && item.photos[0]) || loc.images?.[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80';
    const isSaved = savedRoomIds.includes(item._id);

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
          <SafeImage uri={photo} style={styles.image} borderRadius={18} />
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{item.workspaceType?.replace('_', ' ') || 'DESK'}</Text>
          </View>
          <View style={styles.topRightActions}>
            <TouchableOpacity
              style={[
                styles.bookmarkBtn,
                { backgroundColor: isSaved ? '#00A859' : 'rgba(15, 23, 42, 0.75)' }
              ]}
              onPress={(e) => {
                e.stopPropagation?.();
                handleToggleBookmark(item._id);
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={15}
                color="#FFFFFF"
              />
            </TouchableOpacity>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#F59E0B" style={{ marginRight: 3 }} />
              <Text style={styles.ratingText}>{item.rating || 4.9}</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.rowBetween}>
            <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>
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
              {item.floor ? `${item.floor} • ` : ''}{loc.address?.street || 'Madhapur Main Rd'}, {loc.city || 'Hyderabad'}
            </Text>
          </View>

          <View style={styles.metaFooter}>
            <View style={styles.timeMeta}>
              <Ionicons name="time-outline" size={13} color={theme.textMuted} style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 12, color: theme.textMuted }}>{loc.distanceLabel || '15 Min • 3.0 km'}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.capacityMeta}>
                <Ionicons name="people-outline" size={13} color="#00A859" style={{ marginRight: 4 }} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: theme.textPrimary }}>
                  {item.capacity || 1} Seats
                </Text>
              </View>
              {isAdminRole && (
                <TouchableOpacity
                  style={styles.cardEditBtn}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    setEditingRoom(item);
                    setEditRoomName(item.name || '');
                    setEditRoomType(item.workspaceType || 'HOT_DESK');
                    setEditHubId(item.locationId?._id || item.locationId || (locations[0]?._id || ''));
                    setEditCapacity(String(item.capacity || 4));
                    setEditHourlyRate(String(item.hourlyRate || 450));
                    setEditDailyRate(item.dailyRate ? String(item.dailyRate) : String((item.hourlyRate || 450) * 5));
                    setEditFloor(item.floor || '');
                    setEditFloorManagerName(item.floorManagerName || '');
                    setEditFloorManagerPhone(item.floorManagerPhone || '');
                    setEditDesc(item.description || '');
                    setEditPhotos(Array.isArray(item.photos) ? [...item.photos] : []);
                    setShowEditRoomModal(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="create-outline" size={15} color="#00A859" />
                  <Text style={styles.cardEditText}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const popularWorkspaces = rooms.filter((r) => (r.rating || 0) >= 4.5).length > 0
    ? rooms.filter((r) => (r.rating || 0) >= 4.5).slice(0, 8)
    : rooms.slice(0, 6);

  const renderListHeader = () => {
    return (
      <View>
        {isAdminRole && (
          <View style={styles.adminActionRow}>
            <TouchableOpacity
              style={styles.adminCreateBtn}
              onPress={() => setShowAddRoomModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.adminCreateText}>Add Workspace</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.adminCreateBtn, { backgroundColor: '#0284C7' }]}
              onPress={() => setShowAddTypeModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="pricetag" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.adminCreateText}>Add Type</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.searchSectionCurved}>
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
              onPress={() => {
                if (deskType !== 'Desk') {
                  const match = workspaceTypes.find((t) => t.name.toLowerCase().includes(deskType.toLowerCase()));
                  if (match) {
                    setSelectedCategory(match.code);
                  }
                }
              }}
              activeOpacity={0.88}
            >
              <Text style={styles.findWorkspaceText}>Find Workspace</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c.value}
              style={[
                styles.categoryChip,
                selectedCategory === c.value && styles.categoryChipActive,
                { borderColor: theme.cardBorder }
              ]}
              onPress={() => setSelectedCategory(c.value)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  { color: selectedCategory === c.value ? '#FFFFFF' : theme.textSecondary }
                ]}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Popular Workspaces</Text>
          <TouchableOpacity onPress={() => setSelectedCategory('ALL')}>
            <Text style={styles.seeAllLink}>View All</Text>
          </TouchableOpacity>
        </View>

        {popularWorkspaces.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularCarousel}
            snapToInterval={width * 0.76 + 16}
            decelerationRate="fast"
          >
            {popularWorkspaces.map((item) => {
              const loc = item.locationId || {};
              const photo = (item.photos && item.photos[0]) || loc.images?.[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80';
              const isSaved = savedRoomIds.includes(item._id);
              return (
                <TouchableOpacity
                  key={item._id}
                  style={[styles.popularCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                  onPress={() => {
                    setSelectedSpace(item);
                    setShowDetailModal(true);
                  }}
                  activeOpacity={0.88}
                >
                  <View style={styles.popularImageWrapper}>
                    <SafeImage uri={photo} style={styles.popularImage} borderRadius={18} />
                    <TouchableOpacity
                      style={styles.cardHeartBtn}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        handleToggleBookmark(item._id);
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={isSaved ? 'bookmark' : 'bookmark-outline'}
                        size={17}
                        color={isSaved ? '#00A859' : '#FFFFFF'}
                      />
                    </TouchableOpacity>
                    <View style={styles.ratingBadgePill}>
                      <Ionicons name="star" size={12} color="#F59E0B" />
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

        <View style={[styles.sectionHeader, { marginTop: 22 }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Nearby Spaces ({selectedRadiusKm === 'ALL' ? '2' : selectedRadiusKm}km Radius)
          </Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {[1, 2, 5].map((km) => {
              const isActive = selectedRadiusKm === km || (selectedRadiusKm === 'ALL' && km === 2);
              return (
                <TouchableOpacity
                  key={km}
                  style={[
                    styles.radiusPill,
                    isActive && styles.radiusPillActive,
                    { borderColor: theme.cardBorder }
                  ]}
                  onPress={() => setSelectedRadiusKm(km)}
                >
                  <Text style={[styles.radiusPillText, isActive && { color: '#FFFFFF' }]}>
                    {km}km
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {nearbyLocations.length === 0 ? (
            <Text style={{ color: theme.textMuted, fontSize: 13, marginVertical: 6 }}>
              No nearby hubs within {selectedRadiusKm === 'ALL' ? 2 : selectedRadiusKm}km. Tap 5km to expand radius.
            </Text>
          ) : (
            nearbyLocations.map((loc) => (
              <TouchableOpacity
                key={loc._id}
                style={[styles.nearbyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={() => {
                  setSelectedCategory('ALL');
                  setSearchQuery(loc.name || '');
                }}
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

        <View style={[styles.sectionHeader, { marginTop: 22, marginBottom: 8 }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>All Available Workspaces</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Workspaces"
        locationName={`${selectedLocation.name === 'Current Location' ? 'Madhapur' : selectedLocation.name}, Hyderabad`}
        onPressLocation={() => setShowLocationPicker(true)}
        onOpenDrawer={onOpenDrawer}
        unreadNotifsCount={unreadNotifsCount}
        onOpenNotifications={onOpenNotifications}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={renderCard}
        ListHeaderComponent={renderListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#00A859" style={{ marginVertical: 16 }} /> : undefined}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00A859" />}
        ListEmptyComponent={
          loading ? (
            <View style={{ paddingHorizontal: 20 }}>
              <WorkspaceCardSkeleton />
              <WorkspaceCardSkeleton />
            </View>
          ) : (
            <View style={styles.emptyView}>
              <Ionicons name="search-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No workspaces found matching "{searchQuery}".
              </Text>
            </View>
          )
        }
      />

      <WorkspaceDetailModal
        visible={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        space={selectedSpace}
        currentUser={user}
        onBookSuccess={fetchRooms}
      />

      <RadiusSearchModal
        visible={showRadiusModal}
        currentRadius={typeof selectedRadiusKm === 'number' ? selectedRadiusKm : 2}
        onClose={() => setShowRadiusModal(false)}
        onApply={(filters) => {
          if (filters.workspaceType && filters.workspaceType !== 'ALL') {
            setSelectedCategory(filters.workspaceType);
          }
          if (filters.radiusKm) {
            setSelectedRadiusKm(filters.radiusKm);
          }
        }}
      />

      {quickBookRoom && (
        <BookModal
          visible={showQuickBookModal}
          room={quickBookRoom}
          onClose={() => {
            setShowQuickBookModal(false);
            setQuickBookRoom(null);
          }}
          onSuccess={() => {
            setShowQuickBookModal(false);
            setQuickBookRoom(null);
            fetchRooms(1, false);
            Alert.alert('Booking Confirmed', 'Your workspace pass has been reserved successfully.');
          }}
        />
      )}

      <LocationPickerModal
        visible={showLocationPicker}
        selectedLocation={selectedLocation}
        onClose={() => setShowLocationPicker(false)}
        onSelectLocation={(area) => {
          setSelectedLocation(area);
          setShowLocationPicker(false);
          const radiusKm = typeof selectedRadiusKm === 'number' ? selectedRadiusKm : 2;
          mobileApi.getNearbyLocations(area.lat, area.lng, radiusKm).then((res) => {
            if (res?.locations) setNearbyLocations(res.locations);
          }).catch(() => {});
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

      <Modal
        visible={showAddRoomModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddRoomModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Add Workspace</Text>
                <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
                  Create meeting room or desk for booking
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddRoomModal(false)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 480 }}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Workspace Name</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={roomName}
                onChangeText={setRoomName}
                placeholder="e.g. Executive Boardroom Alpha"
                placeholderTextColor={theme.textMuted}
              />

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Coworking Hub / Facility</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                {locations.map((loc) => {
                  const isSelected = selectedHubId === loc._id;
                  return (
                    <TouchableOpacity
                      key={loc._id}
                      style={[
                        styles.typeOptionChip,
                        isSelected && styles.typeOptionActive,
                        { borderColor: theme.cardBorder }
                      ]}
                      onPress={() => setSelectedHubId(loc._id)}
                    >
                      <Text
                        style={[
                          styles.typeOptionText,
                          { color: isSelected ? '#FFFFFF' : theme.textPrimary }
                        ]}
                      >
                        {loc.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Workspace Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {categories.filter((c) => c.value !== 'ALL').map((c) => (
                  <TouchableOpacity
                    key={c.value}
                    style={[
                      styles.typeOptionChip,
                      roomType === c.value && styles.typeOptionActive,
                      { borderColor: theme.cardBorder }
                    ]}
                    onPress={() => setRoomType(c.value)}
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        { color: roomType === c.value ? '#FFFFFF' : theme.textPrimary }
                      ]}
                    >
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Capacity (Seats)</Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    value={roomCapacity}
                    onChangeText={setRoomCapacity}
                    placeholder="4"
                    keyboardType="number-pad"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Hourly Rate (₹)</Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    value={roomHourlyRate}
                    onChangeText={setRoomHourlyRate}
                    placeholder="450"
                    keyboardType="number-pad"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Floor (e.g. Floor 3)</Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    value={roomFloor}
                    onChangeText={setRoomFloor}
                    placeholder="Floor 3"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Day Pass Rate (₹)</Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    value={roomDailyRate}
                    onChangeText={setRoomDailyRate}
                    placeholder="1800"
                    keyboardType="number-pad"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Floor Manager Name</Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    value={roomFloorManagerName}
                    onChangeText={setRoomFloorManagerName}
                    placeholder="Vikram Rao"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Manager Phone</Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    value={roomFloorManagerPhone}
                    onChangeText={setRoomFloorManagerPhone}
                    placeholder="+91 98450 11223"
                    keyboardType="phone-pad"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 6 }}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary, marginTop: 0 }]}>
                  Workspace Photos ({roomPhotos.length}/10)
                </Text>
                {roomPhotos.length < 10 && (
                  <TouchableOpacity onPress={() => pickImagesForRoom(false)}>
                    <Text style={{ fontSize: 12, color: '#00A859', fontWeight: '700' }}>+ Upload Images</Text>
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {roomPhotos.map((photoUri, index) => (
                  <View key={index} style={styles.photoThumbBox}>
                    <SafeImage uri={photoUri} style={styles.photoThumb} borderRadius={12} />
                    <TouchableOpacity
                      style={styles.photoRemoveBtn}
                      onPress={() => setRoomPhotos((prev) => prev.filter((_, i) => i !== index))}
                    >
                      <Ionicons name="close" size={12} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}
                {roomPhotos.length < 10 && (
                  <TouchableOpacity
                    style={[styles.photoAddBtn, { borderColor: theme.cardBorder, backgroundColor: theme.inputBg }]}
                    onPress={() => pickImagesForRoom(false)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="camera-outline" size={22} color="#00A859" />
                    <Text style={[styles.photoAddBtnText, { color: theme.textSecondary }]}>Add Photo</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Description</Text>
              <TextInput
                style={[styles.inputField, { height: 70, textAlignVertical: 'top', backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={roomDesc}
                onChangeText={setRoomDesc}
                placeholder="Acoustic glass, high-speed Wi-Fi, 4K screen..."
                placeholderTextColor={theme.textMuted}
                multiline
              />

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleCreateRoom}
                disabled={creatingRoom}
                activeOpacity={0.85}
              >
                {creatingRoom ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>Save & Publish Workspace</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showEditRoomModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditRoomModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Edit Workspace</Text>
                <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
                  Update details, pricing, hub and photos
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowEditRoomModal(false)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 480 }}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Workspace Name</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={editRoomName}
                onChangeText={setEditRoomName}
                placeholder="e.g. Executive Boardroom Alpha"
                placeholderTextColor={theme.textMuted}
              />

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Coworking Hub / Facility</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                {locations.map((loc) => {
                  const isSelected = editHubId === loc._id;
                  return (
                    <TouchableOpacity
                      key={loc._id}
                      style={[
                        styles.typeOptionChip,
                        isSelected && styles.typeOptionActive,
                        { borderColor: theme.cardBorder }
                      ]}
                      onPress={() => setEditHubId(loc._id)}
                    >
                      <Text
                        style={[
                          styles.typeOptionText,
                          { color: isSelected ? '#FFFFFF' : theme.textPrimary }
                        ]}
                      >
                        {loc.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Workspace Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {categories.filter((c) => c.value !== 'ALL').map((c) => (
                  <TouchableOpacity
                    key={c.value}
                    style={[
                      styles.typeOptionChip,
                      editRoomType === c.value && styles.typeOptionActive,
                      { borderColor: theme.cardBorder }
                    ]}
                    onPress={() => setEditRoomType(c.value)}
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        { color: editRoomType === c.value ? '#FFFFFF' : theme.textPrimary }
                      ]}
                    >
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Capacity (Seats)</Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    value={editCapacity}
                    onChangeText={setEditCapacity}
                    placeholder="4"
                    keyboardType="number-pad"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Hourly Rate (₹)</Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    value={editHourlyRate}
                    onChangeText={setEditHourlyRate}
                    placeholder="450"
                    keyboardType="number-pad"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Floor (e.g. Floor 3)</Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    value={editFloor}
                    onChangeText={setEditFloor}
                    placeholder="Floor 3"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Day Pass Rate (₹)</Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    value={editDailyRate}
                    onChangeText={setEditDailyRate}
                    placeholder="1800"
                    keyboardType="number-pad"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Floor Manager Name</Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    value={editFloorManagerName}
                    onChangeText={setEditFloorManagerName}
                    placeholder="Vikram Rao"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Manager Phone</Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    value={editFloorManagerPhone}
                    onChangeText={setEditFloorManagerPhone}
                    placeholder="+91 98450 11223"
                    keyboardType="phone-pad"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 6 }}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary, marginTop: 0 }]}>
                  Workspace Photos ({editPhotos.length}/10)
                </Text>
                {editPhotos.length < 10 && (
                  <TouchableOpacity onPress={() => pickImagesForRoom(true)}>
                    <Text style={{ fontSize: 12, color: '#00A859', fontWeight: '700' }}>+ Upload Images</Text>
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {editPhotos.map((photoUri, index) => (
                  <View key={index} style={styles.photoThumbBox}>
                    <SafeImage uri={photoUri} style={styles.photoThumb} borderRadius={12} />
                    <TouchableOpacity
                      style={styles.photoRemoveBtn}
                      onPress={() => setEditPhotos((prev) => prev.filter((_, i) => i !== index))}
                    >
                      <Ionicons name="close" size={12} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}
                {editPhotos.length < 10 && (
                  <TouchableOpacity
                    style={[styles.photoAddBtn, { borderColor: theme.cardBorder, backgroundColor: theme.inputBg }]}
                    onPress={() => pickImagesForRoom(true)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="camera-outline" size={22} color="#00A859" />
                    <Text style={[styles.photoAddBtnText, { color: theme.textSecondary }]}>Add Photo</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Description</Text>
              <TextInput
                style={[styles.inputField, { height: 70, textAlignVertical: 'top', backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={editDesc}
                onChangeText={setEditDesc}
                placeholder="Acoustic glass, high-speed Wi-Fi, 4K screen..."
                placeholderTextColor={theme.textMuted}
                multiline
              />

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleUpdateRoom}
                disabled={updatingRoom}
                activeOpacity={0.85}
              >
                {updatingRoom ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAddTypeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Add Workspace Type</Text>
                <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
                  Register new category like Podcast Room, Studio, etc.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddTypeModal(false)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 440 }}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Type Name</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={typeName}
                onChangeText={setTypeName}
                placeholder="e.g. Podcast Room"
                placeholderTextColor={theme.textMuted}
              />

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Type Code (Auto-generated if empty)</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={typeCode}
                onChangeText={setTypeCode}
                placeholder="PODCAST_ROOM"
                autoCapitalize="characters"
                placeholderTextColor={theme.textMuted}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Default Capacity</Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    value={typeCapacity}
                    onChangeText={setTypeCapacity}
                    placeholder="4"
                    keyboardType="number-pad"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Default Hourly Rate (₹)</Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    value={typeRate}
                    onChangeText={setTypeRate}
                    placeholder="600"
                    keyboardType="number-pad"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
              </View>

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Description</Text>
              <TextInput
                style={[styles.inputField, { height: 60, textAlignVertical: 'top', backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={typeDesc}
                onChangeText={setTypeDesc}
                placeholder="Broadcast equipment, condenser mics..."
                placeholderTextColor={theme.textMuted}
                multiline
              />

              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: '#0284C7' }]}
                onPress={handleCreateType}
                disabled={creatingType}
                activeOpacity={0.85}
              >
                {creatingType ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>Save Workspace Type</Text>
                )}
              </TouchableOpacity>
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
  adminActionRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10
  },
  adminCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A859',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14
  },
  adminCreateText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  searchRow: {
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 8
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12
  },
  searchInput: {
    flex: 1,
    fontSize: 14
  },
  categoryContainer: {
    marginBottom: 10
  },
  categoryList: {
    paddingHorizontal: 20,
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
  categoryText: {
    fontSize: 13,
    fontWeight: '500'
  },
  quickPassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1
  },
  quickPassLeft: {
    flex: 1,
    paddingRight: 10
  },
  quickPassBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  quickPassBadgeText: {
    color: '#00A859',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  quickPassTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2
  },
  quickPassMeta: {
    fontSize: 11,
    lineHeight: 15
  },
  quickPassRight: {
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  quickPassPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00A859',
    marginBottom: 6
  },
  quickBookBtn: {
    backgroundColor: '#00A859',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10
  },
  quickBookBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  radiusBar: {
    paddingHorizontal: 20,
    marginBottom: 12
  },
  radiusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  radiusLabel: {
    fontSize: 12,
    fontWeight: '700'
  },
  radiusPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  radiusPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1
  },
  radiusPillActive: {
    backgroundColor: '#00A859',
    borderColor: '#00A859'
  },
  radiusPillText: {
    fontSize: 11,
    fontWeight: '600'
  },
  filterIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2
  },
  imageBox: {
    height: 160,
    width: '100%',
    position: 'relative'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  typeBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#00A859',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  topRightActions: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  bookmarkBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ratingBadge: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  body: {
    padding: 16
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1
  },
  priceTag: {
    fontSize: 18,
    fontWeight: '800',
    color: '#00A859',
    marginLeft: 8
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  locText: {
    fontSize: 13,
    flex: 1
  },
  metaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
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
    marginTop: 12
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end'
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 22,
    paddingBottom: 40
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800'
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 8
  },
  inputField: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 4
  },
  typeOptionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 8
  },
  typeOptionActive: {
    backgroundColor: '#00A859',
    borderColor: '#00A859'
  },
  typeOptionText: {
    fontSize: 12,
    fontWeight: '600'
  },
  modalSubmitBtn: {
    backgroundColor: '#00A859',
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  cardEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00A859',
    backgroundColor: 'rgba(0, 168, 89, 0.08)',
    marginLeft: 8
  },
  cardEditText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00A859',
    marginLeft: 3
  },
  photoThumbBox: {
    width: 68,
    height: 68,
    borderRadius: 12,
    marginRight: 10,
    overflow: 'hidden',
    position: 'relative'
  },
  photoThumb: {
    width: 68,
    height: 68
  },
  photoRemoveBtn: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center'
  },
  photoAddBtn: {
    width: 68,
    height: 68,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  photoAddBtnText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2
  },
  searchSectionCurved: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4
  },
  searchCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
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
    marginBottom: 10
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
  categoryScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
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
    paddingHorizontal: 16,
    gap: 14
  },
  popularCard: {
    width: width * 0.76,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden'
  },
  popularImageWrapper: {
    height: 150,
    position: 'relative'
  },
  popularImage: {
    width: '100%',
    height: '100%'
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
  ratingBadgePill: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10
  },
  ratingBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 3
  },
  typeBadgePill: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: '#00A859',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  popularCardBody: {
    padding: 12
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4
  },
  cardLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  cardAddress: {
    fontSize: 12,
    flex: 1
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardTime: {
    fontSize: 11
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00A859'
  },

  nearbyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    marginBottom: 10
  },
  nearbyThumb: {
    width: 70,
    height: 70
  },
  nearbyTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3
  },
  nearbyAddress: {
    fontSize: 12,
    marginBottom: 4
  },
  nearbyMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  nearbyPrice: {
    color: '#00A859',
    fontSize: 13,
    fontWeight: '700'
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