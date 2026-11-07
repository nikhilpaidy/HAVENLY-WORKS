import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
  Alert,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { SafeImage } from '../components/SafeImage';
import { mobileApi } from '../services/api';

interface WorkspaceDetailModalProps {
  visible: boolean;
  onClose: () => void;
  space: any;
  onBookSuccess?: () => void;
  currentUser?: any;
}

const { width } = Dimensions.get('window');

export const WorkspaceDetailModal: React.FC<WorkspaceDetailModalProps> = ({
  visible,
  onClose,
  space,
  onBookSuccess,
  currentUser
}) => {
  const { theme, isDark } = useTheme();

  const [activeTab, setActiveTab] = useState<'About' | 'Workspace' | 'Gallery' | 'Reviews'>('About');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [readMore, setReadMore] = useState(false);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingMode, setBookingMode] = useState<'HOURLY' | 'DAY_PASS'>('DAY_PASS');
  const [guestName, setGuestName] = useState(currentUser?.name || '');
  const [guestPhone, setGuestPhone] = useState(currentUser?.phone || '');
  const [guestEmail, setGuestEmail] = useState(currentUser?.email || '');
  const [upiRef, setUpiRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoursCount, setHoursCount] = useState(2);

  if (!space) return null;

  const loc = space.locationId || space;
  const managerName = loc.managerName || 'Olivia Bennett';
  const managerPhone = loc.managerPhone || '+91 98450 12345';
  const managerAvatar = loc.managerAvatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80';
  const upiId = loc.upiId || 'cwsone@icici';
  const qrCodeUrl = loc.paymentQrCodeUrl || '/uploads/cws-upi-qr.png';
  const rate = space.hourlyRate || loc.minHourlyRate || 350;
  const dayRate = space.dailyRate || rate * 5;
  const rating = space.rating || loc.rating || 4.9;
  const reviewCount = space.reviewCount || loc.reviewCount || 2500;
  const images = (space.photos && space.photos.length > 0) ? space.photos : (loc.images && loc.images.length > 0 ? loc.images : [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&q=80',
    'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=600&q=80',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80'
  ]);

  const totalAmount = bookingMode === 'DAY_PASS' ? dayRate : rate * hoursCount;

  const handleCallManager = () => {
    Linking.openURL(`tel:${managerPhone}`);
  };

  const handleChatManager = () => {
    Alert.alert(
      `Contact ${managerName}`,
      `Call or WhatsApp Workspace Manager at ${managerPhone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: handleCallManager }
      ]
    );
  };

  const handleConfirmReservation = async () => {
    if (!guestName.trim() || !guestPhone.trim()) {
      Alert.alert('Required Information', 'Please provide your name and phone number so the manager can confirm your seat.');
      return;
    }

    try {
      setIsSubmitting(true);
      const now = new Date();
      const startTime = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
      const dur = bookingMode === 'DAY_PASS' ? 8 : hoursCount;
      const endTime = new Date(new Date(startTime).getTime() + dur * 60 * 60 * 1000).toISOString();

      if (currentUser && currentUser.companyId) {
        await mobileApi.createBooking({
          roomId: space._id,
          title: `${space.name || 'Workspace'} - ${currentUser.name}`,
          startTime,
          endTime,
          attendeeCount: 1,
          purpose: 'Work Reservation'
        });
      } else {
        await mobileApi.createGuestBooking({
          roomId: space._id,
          guestName,
          guestPhone,
          guestEmail: guestEmail || 'guest@havenlywork.com',
          bookingType: bookingMode,
          startTime,
          endTime,
          attendeeCount: 1,
          paymentMethod: 'UPI_QR',
          paymentReference: upiRef
        });
      }

      setShowBookingModal(false);
      Alert.alert(
        'Reservation Received!',
        `Your reservation for ${space.name || loc.name} has been received. The workspace manager will call you to confirm your arrival.`,
        [{ text: 'OK', onPress: () => { onClose(); if (onBookSuccess) onBookSuccess(); } }]
      );
    } catch (err: any) {
      Alert.alert('Reservation Error', err.message || 'Could not complete reservation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.topBar}>
          <TouchableOpacity style={[styles.roundBtn, { backgroundColor: theme.card }]} onPress={onClose}>
            <Ionicons name="chevron-back" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          <View style={styles.topRightBtns}>
            <TouchableOpacity
              style={[styles.roundBtn, { backgroundColor: theme.card }]}
              onPress={() => setIsFavorite(!isFavorite)}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? '#EF4444' : theme.textPrimary}
              />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.roundBtn, { backgroundColor: theme.card, marginLeft: 8 }]}>
              <Ionicons name="share-outline" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
          <View style={styles.galleryContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={({ nativeEvent }) => {
                const slide = Math.round(nativeEvent.contentOffset.x / (width - 40));
                if (slide !== activeImageIndex && slide >= 0 && slide < images.length) {
                  setActiveImageIndex(slide);
                }
              }}
              scrollEventThrottle={16}
            >
              {images.map((img: string, idx: number) => (
                <View key={idx} style={{ width: width - 40, height: 220 }}>
                  <SafeImage uri={img} style={styles.heroPhoto} borderRadius={24} />
                </View>
              ))}
            </ScrollView>

            <View style={styles.badge360}>
              <Ionicons name="scan-outline" size={14} color="#FFFFFF" />
              <Text style={styles.badge360Text}>360°</Text>
            </View>

            {images.length > 1 && (
              <View style={styles.paginationDotsRow}>
                {images.map((_: any, idx: number) => (
                  <View
                    key={idx}
                    style={[
                      styles.paginationDot,
                      activeImageIndex === idx && styles.paginationDotActive
                    ]}
                  />
                ))}
              </View>
            )}

            <View style={styles.thumbRow}>
              {images.slice(0, 4).map((img: string, idx: number) => (
                <TouchableOpacity key={idx} onPress={() => setActiveImageIndex(idx)}>
                  <SafeImage
                    uri={img}
                    style={[
                      styles.thumb,
                      activeImageIndex === idx && { borderWidth: 2, borderColor: '#00A859' }
                    ]}
                    borderRadius={12}
                  />
                </TouchableOpacity>
              ))}
              {images.length > 4 && (
                <View style={[styles.moreThumb, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                  <Text style={styles.moreThumbText}>+{images.length - 4}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.badgeRow}>
              <View style={styles.saveBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#00A859" />
                <Text style={styles.saveBadgeText}>{space.saveBadge || 'Save 10%'}</Text>
              </View>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={15} color="#F59E0B" />
                <Text style={[styles.ratingText, { color: theme.textPrimary }]}>
                  {rating} <Text style={{ color: theme.textMuted }}>({reviewCount})</Text>
                </Text>
              </View>
            </View>

            <Text style={[styles.title, { color: theme.textPrimary }]}>{space.name || loc.name}</Text>

            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color="#00A859" />
              <Text style={[styles.addressText, { color: theme.textSecondary }]} numberOfLines={1}>
                {loc.address?.street || 'Madhapur Main Rd'}, {loc.address?.city || 'Hyderabad'}
              </Text>
            </View>

            <View style={styles.travelRow}>
              <Ionicons name="time-outline" size={14} color={theme.textMuted} />
              <Text style={[styles.travelText, { color: theme.textMuted }]}>
                {loc.distanceLabel || '15 Min • 3.0 km'}
              </Text>
            </View>

            <View style={[styles.tabBar, { borderBottomColor: theme.cardBorder }]}>
              {(['About', 'Workspace', 'Gallery', 'Reviews'] as const).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: activeTab === tab ? '#00A859' : theme.textSecondary },
                      activeTab === tab && { fontWeight: '700' }
                    ]}
                  >
                    {tab}
                  </Text>
                  {activeTab === tab && <View style={styles.activeTabIndicator} />}
                </TouchableOpacity>
              ))}
            </View>

            {activeTab === 'About' && (
              <View style={styles.tabContent}>
                <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>About</Text>
                <Text
                  style={[styles.bodyDescription, { color: theme.textSecondary }]}
                  numberOfLines={readMore ? undefined : 3}
                >
                  {space.description || loc.description || 'Modern coworking hub featuring high-speed fiber internet, ergonomic workstations, private phone booths, and artisanal coffee bar.'}
                </Text>
                <TouchableOpacity onPress={() => setReadMore(!readMore)}>
                  <Text style={styles.readMoreText}>{readMore ? 'Read less' : 'Read more'}</Text>
                </TouchableOpacity>

                <Text style={[styles.sectionHeading, { color: theme.textPrimary, marginTop: 20 }]}>
                  Contact Details
                </Text>
                <View style={[styles.managerCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <SafeImage uri={managerAvatar} style={styles.managerAvatar} borderRadius={24} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.managerName, { color: theme.textPrimary }]}>{managerName}</Text>
                      <Ionicons name="checkmark-circle" size={15} color="#00A859" style={{ marginLeft: 4 }} />
                    </View>
                    <Text style={[styles.managerRole, { color: theme.textMuted }]}>Workspace Manager</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity style={styles.iconCircle} onPress={handleChatManager}>
                      <Ionicons name="chatbubble-ellipses-outline" size={18} color="#00A859" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconCircle} onPress={handleCallManager}>
                      <Ionicons name="call-outline" size={18} color="#00A859" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'Workspace' && (
              <View style={styles.tabContent}>
                <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Amenities Included</Text>
                <View style={styles.amenitiesGrid}>
                  {(space.amenities || loc.amenities || ['High-Speed WiFi', 'Parking', 'Printer', 'Phone Booth', 'Coffee Bar']).map(
                    (am: string, i: number) => (
                      <View
                        key={i}
                        style={[styles.amenityChip, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                      >
                        <Ionicons name="checkmark-outline" size={15} color="#00A859" style={{ marginRight: 6 }} />
                        <Text style={[styles.amenityText, { color: theme.textPrimary }]}>{am}</Text>
                      </View>
                    )
                  )}
                </View>
              </View>
            )}

            {activeTab === 'Gallery' && (
              <View style={styles.tabContent}>
                <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Space Gallery</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
                  {images.map((img: string, i: number) => (
                    <SafeImage key={i} uri={img} style={{ width: (width - 60) / 2, height: 110 }} borderRadius={14} />
                  ))}
                </View>
              </View>
            )}

            {activeTab === 'Reviews' && (
              <View style={styles.tabContent}>
                <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>User Reviews ({reviewCount})</Text>
                <View style={[styles.reviewItem, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <Ionicons name="person-circle" size={32} color="#00A859" />
                    <View style={{ marginLeft: 8 }}>
                      <Text style={[styles.reviewerName, { color: theme.textPrimary }]}>Arjun Patel</Text>
                      <Text style={{ fontSize: 11, color: theme.textMuted }}>Verified Desk Member • Yesterday</Text>
                    </View>
                    <View style={{ marginLeft: 'auto', flexDirection: 'row' }}>
                      {[...Array(5)].map((_, i) => (
                        <Ionicons key={i} name="star" size={13} color="#F59E0B" />
                      ))}
                    </View>
                  </View>
                  <Text style={[styles.reviewText, { color: theme.textSecondary }]}>
                    Amazing ergonomic setup and ultra-fast WiFi. The phone booths are truly soundproof for client calls.
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={[styles.bottomBar, { backgroundColor: theme.card, borderTopColor: theme.cardBorder }]}>
          <View>
            <Text style={[styles.bottomPriceLabel, { color: theme.textMuted }]}>
              {bookingMode === 'DAY_PASS' ? 'Day Pass' : 'From'}
            </Text>
            <Text style={[styles.bottomPrice, { color: theme.textPrimary }]}>
              ₹{bookingMode === 'DAY_PASS' ? dayRate.toLocaleString('en-IN') : rate.toLocaleString('en-IN')}
              <Text style={{ fontSize: 13, fontWeight: '500', color: theme.textMuted }}>
                {bookingMode === 'DAY_PASS' ? ' /day' : ' /hr'}
              </Text>
            </Text>
          </View>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => setShowBookingModal(true)}
            activeOpacity={0.88}
          >
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={showBookingModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowBookingModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.bookingCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <View style={styles.bookingHeader}>
                <Text style={[styles.bookingTitle, { color: theme.textPrimary }]}>Reserve Workspace</Text>
                <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                  <Ionicons name="close" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 480 }}>
                <View style={styles.modeToggleRow}>
                  <TouchableOpacity
                    style={[styles.modeTogglePill, bookingMode === 'DAY_PASS' && styles.modeToggleActive]}
                    onPress={() => setBookingMode('DAY_PASS')}
                  >
                    <Text style={[styles.modeToggleText, bookingMode === 'DAY_PASS' && { color: '#FFFFFF' }]}>
                      Day Pass (₹{dayRate})
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modeTogglePill, bookingMode === 'HOURLY' && styles.modeToggleActive]}
                    onPress={() => setBookingMode('HOURLY')}
                  >
                    <Text style={[styles.modeToggleText, bookingMode === 'HOURLY' && { color: '#FFFFFF' }]}>
                      Hourly (₹{rate}/hr)
                    </Text>
                  </TouchableOpacity>
                </View>

                {bookingMode === 'HOURLY' && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Duration: {hoursCount} Hours</Text>
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                      {[1, 2, 4, 8].map((h) => (
                        <TouchableOpacity
                          key={h}
                          style={[
                            styles.hourPill,
                            hoursCount === h && { backgroundColor: '#00A859', borderColor: '#00A859' },
                            { borderColor: theme.cardBorder }
                          ]}
                          onPress={() => setHoursCount(h)}
                        >
                          <Text style={[styles.hourPillText, hoursCount === h && { color: '#FFFFFF' }]}>{h}h</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.fieldGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Your Name</Text>
                  <TextInput
                    style={[styles.fieldInput, { color: theme.textPrimary, borderColor: theme.cardBorder, backgroundColor: theme.inputBg }]}
                    placeholder="Full Name"
                    placeholderTextColor={theme.textMuted}
                    value={guestName}
                    onChangeText={setGuestName}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Phone Number (For Manager Call)</Text>
                  <TextInput
                    style={[styles.fieldInput, { color: theme.textPrimary, borderColor: theme.cardBorder, backgroundColor: theme.inputBg }]}
                    placeholder="+91 98450 XXXXX"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="phone-pad"
                    value={guestPhone}
                    onChangeText={setGuestPhone}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Email Address</Text>
                  <TextInput
                    style={[styles.fieldInput, { color: theme.textPrimary, borderColor: theme.cardBorder, backgroundColor: theme.inputBg }]}
                    placeholder="email@domain.com"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={guestEmail}
                    onChangeText={setGuestEmail}
                  />
                </View>

                <View style={[styles.paymentQrBox, { backgroundColor: isDark ? '#0A0F1D' : '#F0FDF4', borderColor: '#00A859' }]}>
                  <Text style={styles.qrTitle}>Pay with UPI QR Code</Text>
                  <Text style={styles.qrSubtitle}>Total Payable: ₹{totalAmount.toLocaleString('en-IN')}</Text>

                  <View style={styles.qrImageWrapper}>
                    <SafeImage
                      uri={`https://tqsb1xz0-6018.inc1.devtunnels.ms${qrCodeUrl}`}
                      style={{ width: 140, height: 140 }}
                      borderRadius={12}
                    />
                  </View>
                  <Text style={styles.upiIdText}>UPI ID: {upiId}</Text>
                  <Text style={{ fontSize: 11, color: '#166534', textAlign: 'center', marginTop: 4 }}>
                    Scan with GPay, PhonePe, or Paytm
                  </Text>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>UPI Reference / UTR Number (Optional)</Text>
                  <TextInput
                    style={[styles.fieldInput, { color: theme.textPrimary, borderColor: theme.cardBorder, backgroundColor: theme.inputBg }]}
                    placeholder="e.g. 339482019482"
                    placeholderTextColor={theme.textMuted}
                    value={upiRef}
                    onChangeText={setUpiRef}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitBookBtn, isSubmitting && { opacity: 0.7 }]}
                  onPress={handleConfirmReservation}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.submitBookBtnText}>Confirm Reservation (₹{totalAmount})</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10
  },
  roundBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3
  },
  topRightBtns: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  galleryContainer: {
    paddingHorizontal: 20,
    paddingTop: 64
  },
  heroPhoto: {
    width: '100%',
    height: 240
  },
  badge360: {
    position: 'absolute',
    bottom: 84,
    right: 32,
    backgroundColor: 'rgba(0,0,0,0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16
  },
  badge360Text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4
  },
  thumbRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10
  },
  thumb: {
    flex: 1,
    height: 64
  },
  moreThumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  moreThumbText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15
  },
  paginationDotsRow: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)'
  },
  paginationDotActive: {
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00A859'
  },
  infoSection: {
    paddingHorizontal: 20,
    marginTop: 18
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  saveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14
  },
  saveBadgeText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  addressText: {
    fontSize: 14,
    marginLeft: 6,
    flex: 1
  },
  travelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  travelText: {
    fontSize: 13,
    marginLeft: 6
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 16
  },
  tabItem: {
    paddingVertical: 10,
    marginRight: 24,
    position: 'relative'
  },
  tabItemActive: {},
  tabText: {
    fontSize: 14,
    fontWeight: '500'
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#00A859',
    borderRadius: 2
  },
  tabContent: {
    paddingTop: 4
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10
  },
  bodyDescription: {
    fontSize: 14,
    lineHeight: 22
  },
  readMoreText: {
    color: '#00A859',
    fontWeight: '700',
    fontSize: 13,
    marginTop: 6
  },
  managerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 6
  },
  managerAvatar: {
    width: 48,
    height: 48
  },
  managerName: {
    fontSize: 15,
    fontWeight: '700'
  },
  managerRole: {
    fontSize: 12,
    marginTop: 2
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center'
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1
  },
  amenityText: {
    fontSize: 13,
    fontWeight: '500'
  },
  reviewItem: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '700'
  },
  reviewText: {
    fontSize: 13,
    lineHeight: 19
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  bottomPriceLabel: {
    fontSize: 12,
    fontWeight: '500'
  },
  bottomPrice: {
    fontSize: 22,
    fontWeight: '800'
  },
  bookButton: {
    backgroundColor: '#00A859',
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: '#00A859',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end'
  },
  bookingCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 24,
    paddingBottom: 40
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  bookingTitle: {
    fontSize: 20,
    fontWeight: '800'
  },
  modeToggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16
  },
  modeTogglePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center'
  },
  modeToggleActive: {
    backgroundColor: '#00A859'
  },
  modeToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B'
  },
  hourPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1
  },
  hourPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B'
  },
  fieldGroup: {
    marginBottom: 14
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6
  },
  fieldInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14
  },
  paymentQrBox: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: 14
  },
  qrTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#00A859'
  },
  qrSubtitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#00A859',
    marginTop: 4
  },
  qrImageWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 14,
    marginVertical: 10
  },
  upiIdText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A'
  },
  submitBookBtn: {
    backgroundColor: '#00A859',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#00A859',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4
  },
  submitBookBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  }
});
