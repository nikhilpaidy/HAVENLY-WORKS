import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

interface RadiusSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: {
    workspaceType: string;
    amenities: string[];
    minRating: number;
    radiusKm: number;
    maxPrice: number;
  }) => void;
  currentRadius: number;
}

export const RadiusSearchModal: React.FC<RadiusSearchModalProps> = ({
  visible,
  onClose,
  onApply,
  currentRadius
}) => {
  const { theme, isDark } = useTheme();

  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(4.0);
  const [radiusKm, setRadiusKm] = useState(currentRadius || 2);
  const [maxPrice, setMaxPrice] = useState(2000);

  const toggleAmenity = (item: string) => {
    if (selectedAmenities.includes(item)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== item));
    } else {
      setSelectedAmenities([...selectedAmenities, item]);
    }
  };

  const handleApply = () => {
    onApply({
      workspaceType: selectedType,
      amenities: selectedAmenities,
      minRating,
      radiusKm,
      maxPrice
    });
    onClose();
  };

  const workspaceTypes = [
    { label: 'All Types', value: 'ALL' },
    { label: 'Flex Desk', value: 'FLEX_DESK' },
    { label: 'Fixed Desk', value: 'FIXED_DESK' },
    { label: 'Hot Desk', value: 'HOT_DESK' },
    { label: 'Dedicated Desk', value: 'DEDICATED_DESK' },
    { label: 'Private Office', value: 'PRIVATE_OFFICE' },
    { label: 'Meeting Room', value: 'MEETING_ROOM' },
    { label: 'Boardroom', value: 'BOARDROOM' },
    { label: 'Day Pass', value: 'DAY_PASS' },
    { label: 'Podcast Studio', value: 'PODCAST_STUDIO' }
  ];

  const amenitiesList = [
    'High-Speed WiFi',
    'Parking',
    'Printer',
    'Phone Booth',
    'Artisanal Coffee',
    '24/7 Access',
    'Video Conferencing',
    'Podcast Studio'
  ];

  const ratingOptions = [
    { label: '4.5 and above', val: 4.5 },
    { label: '4.0 - 4.5', val: 4.0 },
    { label: '3.5 - 4.0', val: 3.5 }
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Filter Workspaces</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 520 }}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Search Radius ({radiusKm} km)
              </Text>
              <View style={styles.chipRow}>
                {[1, 2, 3, 5].map((km) => (
                  <TouchableOpacity
                    key={km}
                    style={[
                      styles.chip,
                      radiusKm === km && styles.chipActive,
                      { borderColor: theme.cardBorder }
                    ]}
                    onPress={() => setRadiusKm(km)}
                  >
                    <Ionicons
                      name="navigate-outline"
                      size={14}
                      color={radiusKm === km ? '#FFFFFF' : '#00A859'}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.chipText, radiusKm === km && { color: '#FFFFFF' }]}>
                      {km} km
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Workspace Type</Text>
              <View style={styles.chipRow}>
                {workspaceTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.chip,
                      selectedType === type.value && styles.chipActive,
                      { borderColor: theme.cardBorder }
                    ]}
                    onPress={() => setSelectedType(type.value)}
                  >
                    <Text style={[styles.chipText, selectedType === type.value && { color: '#FFFFFF' }]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Amenities</Text>
              <View style={styles.chipRow}>
                {amenitiesList.map((am) => {
                  const isSelected = selectedAmenities.includes(am);
                  return (
                    <TouchableOpacity
                      key={am}
                      style={[
                        styles.chip,
                        isSelected && styles.chipActive,
                        { borderColor: theme.cardBorder }
                      ]}
                      onPress={() => toggleAmenity(am)}
                    >
                      <Ionicons
                        name={isSelected ? 'checkmark' : 'add'}
                        size={14}
                        color={isSelected ? '#FFFFFF' : theme.textSecondary}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.chipText, isSelected && { color: '#FFFFFF' }]}>{am}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Rating</Text>
              {ratingOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.val}
                  style={styles.ratingRow}
                  onPress={() => setMinRating(opt.val)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="star" size={16} color="#F59E0B" style={{ marginRight: 6 }} />
                    <Text style={[styles.ratingLabel, { color: theme.textPrimary }]}>{opt.label}</Text>
                  </View>
                  <View
                    style={[
                      styles.radioCircle,
                      minRating === opt.val && { borderColor: '#00A859' }
                    ]}
                  >
                    {minRating === opt.val && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Max Budget: ₹{maxPrice.toLocaleString('en-IN')}/hr
              </Text>
              <View style={styles.chipRow}>
                {[500, 1500, 3000, 7500, 15000, 25000].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.chip,
                      maxPrice === p && styles.chipActive,
                      { borderColor: theme.cardBorder }
                    ]}
                    onPress={() => setMaxPrice(p)}
                  >
                    <Text style={[styles.chipText, maxPrice === p && { color: '#FFFFFF' }]}>
                      Up to ₹{p.toLocaleString('en-IN')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.88}>
            <Text style={styles.applyBtnText}>Apply</Text>
          </TouchableOpacity>
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
    paddingBottom: 36
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18
  },
  title: {
    fontSize: 20,
    fontWeight: '800'
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1
  },
  chipActive: {
    backgroundColor: '#00A859',
    borderColor: '#00A859'
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600'
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '500'
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00A859'
  },
  applyBtn: {
    backgroundColor: '#00A859',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    shadowColor: '#00A859',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  }
});
