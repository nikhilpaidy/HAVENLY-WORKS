import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export interface LocationArea {
  id: string;
  name: string;
  sublabel: string;
  city: string;
  lat: number;
  lng: number;
  isPopular?: boolean;
}

export const HYDERABAD_AREAS: LocationArea[] = [
  {
    id: 'hyd-madhapur',
    name: 'Madhapur',
    sublabel: 'Cyber Towers • Mindspace Junction (Your Hub)',
    city: 'Hyderabad',
    lat: 17.4483,
    lng: 78.3915,
    isPopular: true
  },
  {
    id: 'hyd-hitec-city',
    name: 'Hitec City',
    sublabel: 'Knowledge City • Cyber Gateway',
    city: 'Hyderabad',
    lat: 17.4435,
    lng: 78.3772,
    isPopular: true
  },
  {
    id: 'hyd-gachibowli',
    name: 'Gachibowli',
    sublabel: 'Financial District • DLF Cybercity',
    city: 'Hyderabad',
    lat: 17.4401,
    lng: 78.3489,
    isPopular: true
  },
  {
    id: 'hyd-jubilee-hills',
    name: 'Jubilee Hills',
    sublabel: 'Road No. 36 • Metro Corridor',
    city: 'Hyderabad',
    lat: 17.4319,
    lng: 78.4073,
    isPopular: true
  },
  {
    id: 'hyd-kondapur',
    name: 'Kondapur',
    sublabel: 'Kothaguda Junction • Botanical Garden',
    city: 'Hyderabad',
    lat: 17.4699,
    lng: 78.3578
  }
];

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedLocation: LocationArea;
  onSelectLocation: (area: LocationArea) => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  visible,
  onClose,
  selectedLocation,
  onSelectLocation
}) => {
  const { theme, isDark } = useTheme();
  const [search, setSearch] = useState('');
  const [detecting, setDetecting] = useState(false);

  const filteredAreas = HYDERABAD_AREAS.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.sublabel.toLowerCase().includes(search.toLowerCase())
  );

  const handleDetectGPS = () => {
    setDetecting(true);
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDetecting(false);
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          const detected: LocationArea = {
            id: 'current-gps',
            name: 'Current Location',
            sublabel: 'Madhapur / Hitec City Corridor',
            city: 'Hyderabad',
            lat: userLat,
            lng: userLng
          };
          onSelectLocation(detected);
          onClose();
        },
        () => {
          setDetecting(false);
          onSelectLocation(HYDERABAD_AREAS[0]);
          onClose();
        },
        { timeout: 5000 }
      );
    } else {
      setTimeout(() => {
        setDetecting(false);
        onSelectLocation(HYDERABAD_AREAS[0]);
        onClose();
      }, 400);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: theme.textPrimary }]}>Select Location</Text>
              <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 2 }}>
                Hyderabad Coworking Hubs
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchBox, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
            <Ionicons name="search-outline" size={18} color={theme.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, { color: theme.textPrimary }]}
              placeholder="Search Madhapur, Hitec City, Gachibowli..."
              placeholderTextColor={theme.textMuted}
              value={search}
              onChangeText={setSearchQuery => setSearch(setSearchQuery)}
            />
          </View>

          <TouchableOpacity
            style={[styles.gpsButton, { borderColor: '#00A859', backgroundColor: isDark ? 'rgba(0,168,89,0.12)' : '#DCFCE7' }]}
            onPress={handleDetectGPS}
            disabled={detecting}
          >
            {detecting ? (
              <ActivityIndicator size="small" color="#00A859" style={{ marginRight: 8 }} />
            ) : (
              <Ionicons name="navigate-circle" size={22} color="#00A859" style={{ marginRight: 8 }} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.gpsTitle}>Use Current GPS Location</Text>
              <Text style={styles.gpsSubtitle}>Auto-scans 1km - 5km radius around you in Hyderabad</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#00A859" />
          </TouchableOpacity>

          <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>
            POPULAR HYDERABAD AREAS
          </Text>

          <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
            {filteredAreas.map((area) => {
              const isSelected = selectedLocation.id === area.id || selectedLocation.name === area.name;
              return (
                <TouchableOpacity
                  key={area.id}
                  style={[
                    styles.areaRow,
                    { borderBottomColor: theme.cardBorder },
                    isSelected && { backgroundColor: isDark ? 'rgba(0,168,89,0.1)' : '#F0FDF4' }
                  ]}
                  onPress={() => {
                    onSelectLocation(area);
                    onClose();
                  }}
                >
                  <View style={[styles.areaIcon, { backgroundColor: isSelected ? '#00A859' : isDark ? '#1E293B' : '#E2E8F0' }]}>
                    <Ionicons
                      name="location-sharp"
                      size={18}
                      color={isSelected ? '#FFFFFF' : theme.textMuted}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.areaName, { color: theme.textPrimary }]}>{area.name}</Text>
                      {area.isPopular && (
                        <View style={styles.hubBadge}>
                          <Text style={styles.hubBadgeText}>Active Hub</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.areaSub, { color: theme.textSecondary }]}>{area.sublabel}</Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={22} color="#00A859" />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end'
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 24,
    paddingBottom: 40
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 20,
    fontWeight: '800'
  },
  closeBtn: {
    padding: 4
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: 14
  },
  searchInput: {
    flex: 1,
    fontSize: 14
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 18
  },
  gpsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00A859'
  },
  gpsSubtitle: {
    fontSize: 11,
    color: '#166534',
    marginTop: 2
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10
  },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderBottomWidth: 1
  },
  areaIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  areaName: {
    fontSize: 15,
    fontWeight: '700'
  },
  hubBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8
  },
  hubBadgeText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '700'
  },
  areaSub: {
    fontSize: 12,
    marginTop: 2
  }
});
