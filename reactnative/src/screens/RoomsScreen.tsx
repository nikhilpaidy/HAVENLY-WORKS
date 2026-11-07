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
  ActivityIndicator
} from 'react-native';
import { mobileApi } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeImage } from '../components/SafeImage';
import { WorkspaceCardSkeleton } from '../components/SkeletonLoader';
import { WorkspaceDetailModal } from './WorkspaceDetailModal';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';

interface RoomsScreenProps {
  onOpenNotifications: () => void;
  unreadNotifsCount: number;
  onOpenDrawer?: () => void;
}

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

  const [selectedSpace, setSelectedSpace] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState('HOT_DESK');
  const [roomCapacity, setRoomCapacity] = useState('4');
  const [roomHourlyRate, setRoomHourlyRate] = useState('450');
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

  const fetchRooms = async () => {
    try {
      const [data, typesData, locsData] = await Promise.all([
        mobileApi.getPublicRooms({
          workspaceType: selectedCategory !== 'ALL' ? selectedCategory : undefined
        }),
        mobileApi.getWorkspaceTypes(),
        mobileApi.getPublicLocations()
      ]);
      setRooms(Array.isArray(data) ? data : []);
      if (Array.isArray(locsData) && locsData.length > 0) {
        setLocations(locsData);
        if (!selectedHubId) {
          setSelectedHubId(locsData[0]._id);
        }
      }
      if (Array.isArray(typesData) && typesData.length > 0) {
        setWorkspaceTypes(typesData);
        if (!roomType && typesData[0]?.code) {
          setRoomType(typesData[0].code);
        }
      }
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
        description: roomDesc.trim() || undefined,
        photos: uploadedUrls.length > 0 ? uploadedUrls : undefined,
        amenities: ['High-speed Wi-Fi', 'Power Outlets', 'Ergonomic Seating', 'Air Conditioning']
      });
      setShowAddRoomModal(false);
      setRoomName('');
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
          <SafeImage uri={photo} style={styles.image} borderRadius={18} />
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{item.workspaceType?.replace('_', ' ') || 'DESK'}</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#F59E0B" style={{ marginRight: 3 }} />
            <Text style={styles.ratingText}>{item.rating || 4.9}</Text>
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
              {loc.address?.street || 'Madhapur Main Rd'}, {loc.city || 'Hyderabad'}
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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Workspaces"
        subtitle="Reserve Dedicated Desks & Meeting Rooms"
        onOpenDrawer={onOpenDrawer}
        unreadNotifsCount={unreadNotifsCount}
        onOpenNotifications={onOpenNotifications}
      />

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

      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
          <Ionicons name="search-outline" size={18} color={theme.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Search workspaces by name or area..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.categoryContainer}>
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
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: selectedCategory === item.value ? '#FFFFFF' : theme.textSecondary },
                  selectedCategory === item.value && { fontWeight: '700' }
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
  }
});