import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
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

export const USER_DEFAULT_LOCATION: LocationArea = {
  id: 'user-current-location',
  name: 'Current Location',
  sublabel: 'Madhapur, Hyderabad',
  city: 'Hyderabad',
  lat: 17.4483,
  lng: 78.3915
};

export const HYDERABAD_AREAS: LocationArea[] = [USER_DEFAULT_LOCATION];

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
  const [customInput, setCustomInput] = useState('');
  const [detecting, setDetecting] = useState(false);

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
            sublabel: 'Detected GPS Coordinates',
            city: 'Hyderabad',
            lat: userLat,
            lng: userLng
          };
          onSelectLocation(detected);
          onClose();
        },
        () => {
          setDetecting(false);
          onSelectLocation(USER_DEFAULT_LOCATION);
          onClose();
        },
        { timeout: 5000 }
      );
    } else {
      setTimeout(() => {
        setDetecting(false);
        onSelectLocation(USER_DEFAULT_LOCATION);
        onClose();
      }, 300);
    }
  };

  const handleApplyCustomLocation = () => {
    if (!customInput.trim()) return;
    const customArea: LocationArea = {
      id: `custom-${Date.now()}`,
      name: customInput.trim(),
      sublabel: 'User Specified Location',
      city: 'Hyderabad',
      lat: 17.4483,
      lng: 78.3915
    };
    onSelectLocation(customArea);
    setCustomInput('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: theme.textPrimary }]}>Your Location</Text>
              <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 2 }}>
                Set or detect your current workspace location
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.gpsButton,
              {
                borderColor: '#00A859',
                backgroundColor: isDark ? 'rgba(0,168,89,0.12)' : '#DCFCE7'
              }
            ]}
            onPress={handleDetectGPS}
            disabled={detecting}
            activeOpacity={0.8}
          >
            {detecting ? (
              <ActivityIndicator size="small" color="#00A859" style={{ marginRight: 10 }} />
            ) : (
              <Ionicons name="navigate-circle" size={24} color="#00A859" style={{ marginRight: 10 }} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.gpsTitle}>Detect Current GPS Location</Text>
              <Text style={styles.gpsSubtitle}>
                Auto-locates your device coordinates
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#00A859" />
          </TouchableOpacity>

          <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>
            OR ENTER YOUR CURRENT AREA
          </Text>

          <View style={[styles.inputRow, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
            <Ionicons name="location-outline" size={18} color={theme.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.textInput, { color: theme.textPrimary }]}
              placeholder="Enter your locality or landmark..."
              placeholderTextColor={theme.textMuted}
              value={customInput}
              onChangeText={setCustomInput}
            />
            {customInput.trim().length > 0 && (
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={handleApplyCustomLocation}
                activeOpacity={0.8}
              >
                <Text style={styles.applyBtnText}>Set</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.currentCard, { backgroundColor: isDark ? '#1F2937' : '#F8FAFC', borderColor: theme.cardBorder }]}>
            <Ionicons name="pin" size={20} color="#00A859" style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.currentLabel, { color: theme.textMuted }]}>Selected Location</Text>
              <Text style={[styles.currentName, { color: theme.textPrimary }]}>{selectedLocation.name}</Text>
              <Text style={[styles.currentCoords, { color: theme.textSecondary }]}>
                {selectedLocation.sublabel} • {selectedLocation.city}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmBtnText}>Confirm</Text>
            </TouchableOpacity>
          </View>
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
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 18
  },
  gpsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#00A859'
  },
  gpsSubtitle: {
    fontSize: 12,
    color: '#166534',
    marginTop: 2
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 16
  },
  textInput: {
    flex: 1,
    fontSize: 14
  },
  applyBtn: {
    backgroundColor: '#00A859',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  currentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 4
  },
  currentLabel: {
    fontSize: 11,
    fontWeight: '600'
  },
  currentName: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2
  },
  currentCoords: {
    fontSize: 12,
    marginTop: 2
  },
  confirmBtn: {
    backgroundColor: '#00A859',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  }
});