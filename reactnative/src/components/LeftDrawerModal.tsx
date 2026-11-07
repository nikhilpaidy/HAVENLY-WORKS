import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { SafeImage } from './SafeImage';
import { HavenlyLogo } from './HavenlyLogo';
import { mobileApi } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.80;

interface LeftDrawerModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenExplore: () => void;
  onOpenRooms: () => void;
  onOpenBookings: () => void;
  onOpenQuota: () => void;
  onOpenProfile: () => void;
  onOpenHelpdesk: () => void;
  onOpenStaff: () => void;
  onOpenInvoices: () => void;
  onOpenLegal: () => void;
  onOpenSupport: () => void;
  onSignOut: () => void;
  onSignInRequest: () => void;
}

export const LeftDrawerModal: React.FC<LeftDrawerModalProps> = ({
  visible,
  onClose,
  onOpenExplore,
  onOpenRooms,
  onOpenBookings,
  onOpenQuota,
  onOpenProfile,
  onOpenHelpdesk,
  onOpenStaff,
  onOpenInvoices,
  onOpenLegal,
  onOpenSupport,
  onSignOut,
  onSignInRequest
}) => {
  const { user, isGuest } = useAuth();
  const { theme, isDark, setThemeMode } = useTheme();

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isCoworkingAdmin = user?.role === 'COWORKING_ADMIN';
  const isManagerRole = isSuperAdmin || isCoworkingAdmin;

  const [searchQuery, setSearchQuery] = useState('');

  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [compName, setCompName] = useState('');
  const [compEmail, setCompEmail] = useState('');
  const [compPhone, setCompPhone] = useState('');
  const [compGstin, setCompGstin] = useState('');
  const [compFreeHours, setCompFreeHours] = useState('240');
  const [onboarding, setOnboarding] = useState(false);

  const [showAddHubModal, setShowAddHubModal] = useState(false);
  const [hubName, setHubName] = useState('');
  const [hubStreet, setHubStreet] = useState('');
  const [hubCity, setHubCity] = useState('Hyderabad');
  const [hubManager, setHubManager] = useState('');
  const [hubPhone, setHubPhone] = useState('');
  const [hubUpi, setHubUpi] = useState('');
  const [addingHub, setAddingHub] = useState(false);

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 70,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 220,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [visible]);

  const handleAction = (callback: () => void) => {
    onClose();
    setTimeout(callback, 220);
  };

  const handleOnboardCompany = async () => {
    if (!compName.trim() || !compEmail.trim()) {
      Alert.alert('Validation Error', 'Company name and billing email are required.');
      return;
    }
    setOnboarding(true);
    try {
      await mobileApi.createCompany({
        name: compName.trim(),
        billingEmail: compEmail.trim().toLowerCase(),
        phone: compPhone.trim() || undefined,
        gstin: compGstin.trim() || undefined,
        allowanceConfig: {
          annualFreeHours: parseInt(compFreeHours, 10) || 240
        }
      });
      setShowOnboardModal(false);
      setCompName('');
      setCompEmail('');
      setCompPhone('');
      setCompGstin('');
      Alert.alert('Company Registered', `Client company "${compName.trim()}" onboarded with ${compFreeHours} annual free hours.`);
    } catch (err: any) {
      Alert.alert('Registration Error', err.message || 'Could not onboard company.');
    } finally {
      setOnboarding(false);
    }
  };

  const handleAddHub = async () => {
    if (!hubName.trim() || !hubStreet.trim()) {
      Alert.alert('Validation Error', 'Hub name and street address are required.');
      return;
    }
    setAddingHub(true);
    try {
      await mobileApi.createLocation({
        name: hubName.trim(),
        address: {
          street: hubStreet.trim(),
          city: hubCity.trim() || 'Hyderabad',
          country: 'India'
        },
        timezone: 'Asia/Kolkata',
        managerName: hubManager.trim() || undefined,
        managerPhone: hubPhone.trim() || undefined,
        upiId: hubUpi.trim() || undefined
      });
      setShowAddHubModal(false);
      setHubName('');
      setHubStreet('');
      setHubManager('');
      setHubPhone('');
      setHubUpi('');
      Alert.alert('Coworking Hub Added', `Hub "${hubName.trim()}" published successfully.`);
    } catch (err: any) {
      Alert.alert('Create Error', err.message || 'Could not add coworking hub.');
    } finally {
      setAddingHub(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Deactivate Account',
      'Are you sure you want to deactivate your account? Your coworking access and membership will be suspended immediately.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              await mobileApi.deleteAccount();
              onClose();
              onSignOut();
              Alert.alert('Account Deactivated', 'Your account has been deactivated successfully.');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to deactivate account.');
            }
          }
        }
      ]
    );
  };

  const filterMatches = (title: string) => {
    if (!searchQuery.trim()) return true;
    return title.toLowerCase().includes(searchQuery.toLowerCase().trim());
  };

  const getRoleLabel = () => {
    if (isGuest) return 'Guest';
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'SUPER_ADMIN_STAFF':
        return 'Platform Staff';
      case 'COWORKING_ADMIN':
        return 'Coworking Admin';
      case 'COWORKING_ADMIN_STAFF':
        return 'Hub Staff';
      case 'COMPANY_OWNER':
        return 'Company Owner';
      case 'EMPLOYEE':
        return 'Company Staff';
      default:
        return 'Member';
    }
  };

  const showStaffOption =
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'COWORKING_ADMIN' ||
    user?.role === 'COMPANY_OWNER';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.drawerContent,
            {
              width: DRAWER_WIDTH,
              backgroundColor: isDark ? '#0A0F1D' : '#FFFFFF',
              borderRightColor: isDark ? '#1E293B' : '#E2E8F0',
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <HavenlyLogo variant="icon" size={32} />
              <View style={{ marginLeft: 10 }}>
                <Text style={[styles.brandName, { color: theme.textPrimary }]}>HavenlyWork</Text>
                <Text style={styles.brandTagline}>SPACE FOR TOGETHERNESS</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchBox, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
            <Ionicons name="search-outline" size={17} color={theme.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, { color: theme.textPrimary }]}
              placeholder="Search navigation..."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.menuScroll}
          >
            {filterMatches('Navigation Explore Workspaces Rooms') && (
              <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
                NAVIGATION
              </Text>
            )}

            {filterMatches('Explore Workspaces') && (
              <TouchableOpacity
                style={styles.navItem}
                onPress={() => handleAction(onOpenExplore)}
                activeOpacity={0.7}
              >
                <Ionicons name="compass-outline" size={20} color={isDark ? '#94A3B8' : '#475569'} style={styles.itemIcon} />
                <Text style={[styles.itemLabel, { color: theme.textPrimary }]}>
                  Explore Workspaces
                </Text>
              </TouchableOpacity>
            )}

            {filterMatches('Workspaces Desks Meeting Rooms') && (
              <TouchableOpacity
                style={styles.navItem}
                onPress={() => handleAction(onOpenRooms)}
                activeOpacity={0.7}
              >
                <Ionicons name="grid-outline" size={20} color={isDark ? '#94A3B8' : '#475569'} style={styles.itemIcon} />
                <Text style={[styles.itemLabel, { color: theme.textPrimary }]}>
                  Meeting Rooms & Desks
                </Text>
              </TouchableOpacity>
            )}

            <View style={[styles.divider, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]} />

            {filterMatches('My Workspace Bookings Reservations Quota') && (
              <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
                MY WORKSPACE
              </Text>
            )}

            {filterMatches('Active Reservations Bookings') && (
              <TouchableOpacity
                style={styles.navItem}
                onPress={() => handleAction(onOpenBookings)}
                activeOpacity={0.7}
              >
                <Ionicons name="bookmark-outline" size={20} color={isDark ? '#94A3B8' : '#475569'} style={styles.itemIcon} />
                <Text style={[styles.itemLabel, { color: theme.textPrimary }]}>
                  {isSuperAdmin ? 'Platform Bookings' : isCoworkingAdmin ? 'Hub Bookings' : 'My Reservations'}
                </Text>
              </TouchableOpacity>
            )}

            {filterMatches('Allowance Quota Usage') && (
              <TouchableOpacity
                style={styles.navItem}
                onPress={() => handleAction(onOpenQuota)}
                activeOpacity={0.7}
              >
                <Ionicons name="pie-chart-outline" size={20} color={isDark ? '#94A3B8' : '#475569'} style={styles.itemIcon} />
                <Text style={[styles.itemLabel, { color: theme.textPrimary }]}>
                  {isSuperAdmin ? 'Platform Quotas' : isCoworkingAdmin ? 'Client Quotas' : 'Allowance & Quota'}
                </Text>
              </TouchableOpacity>
            )}

            <View style={[styles.divider, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]} />

            {filterMatches('Operations Helpdesk Staff Invoices Onboard Hub') && (
              <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
                FACILITY OPERATIONS
              </Text>
            )}

            {isManagerRole && filterMatches('Onboard Client Company Registration') && (
              <TouchableOpacity
                style={styles.navItem}
                onPress={() => setShowOnboardModal(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="business-outline" size={20} color="#00A859" style={styles.itemIcon} />
                <Text style={[styles.itemLabel, { color: '#00A859', fontWeight: '700' }]}>
                  + Onboard Client Company
                </Text>
              </TouchableOpacity>
            )}

            {isSuperAdmin && filterMatches('Add Coworking Hub Location') && (
              <TouchableOpacity
                style={styles.navItem}
                onPress={() => setShowAddHubModal(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="map-outline" size={20} color="#0284C7" style={styles.itemIcon} />
                <Text style={[styles.itemLabel, { color: '#0284C7', fontWeight: '700' }]}>
                  + Add Coworking Hub
                </Text>
              </TouchableOpacity>
            )}

            {filterMatches('Helpdesk Complaints Service Tickets') && (
              <TouchableOpacity
                style={styles.navItem}
                onPress={() => handleAction(onOpenHelpdesk)}
                activeOpacity={0.7}
              >
                <Ionicons name="chatbubbles-outline" size={20} color={isDark ? '#94A3B8' : '#475569'} style={styles.itemIcon} />
                <Text style={[styles.itemLabel, { color: theme.textPrimary }]}>
                  Helpdesk & Complaints
                </Text>
              </TouchableOpacity>
            )}

            {showStaffOption && filterMatches('Staff Management') && (
              <TouchableOpacity
                style={styles.navItem}
                onPress={() => handleAction(onOpenStaff)}
                activeOpacity={0.7}
              >
                <Ionicons name="people-outline" size={20} color={isDark ? '#94A3B8' : '#475569'} style={styles.itemIcon} />
                <Text style={[styles.itemLabel, { color: theme.textPrimary }]}>
                  Staff & Permissions
                </Text>
              </TouchableOpacity>
            )}

            {filterMatches('Invoices Billing Receipts') && (
              <TouchableOpacity
                style={styles.navItem}
                onPress={() => handleAction(onOpenInvoices)}
                activeOpacity={0.7}
              >
                <Ionicons name="receipt-outline" size={20} color={isDark ? '#94A3B8' : '#475569'} style={styles.itemIcon} />
                <Text style={[styles.itemLabel, { color: theme.textPrimary }]}>
                  Invoices & Statements
                </Text>
              </TouchableOpacity>
            )}

            <View style={[styles.divider, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]} />

            {filterMatches('Support Legal Terms Theme') && (
              <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
                PREFERENCES & ASSISTANCE
              </Text>
            )}

            {filterMatches('Support Hotline 24/7') && (
              <TouchableOpacity
                style={styles.navItem}
                onPress={() => handleAction(onOpenSupport)}
                activeOpacity={0.7}
              >
                <Ionicons name="call-outline" size={20} color={isDark ? '#94A3B8' : '#475569'} style={styles.itemIcon} />
                <Text style={[styles.itemLabel, { color: theme.textPrimary }]}>
                  Customer Support Helpline
                </Text>
              </TouchableOpacity>
            )}

            {filterMatches('Privacy Policy Terms Legal') && (
              <TouchableOpacity
                style={styles.navItem}
                onPress={() => handleAction(onOpenLegal)}
                activeOpacity={0.7}
              >
                <Ionicons name="document-text-outline" size={20} color={isDark ? '#94A3B8' : '#475569'} style={styles.itemIcon} />
                <Text style={[styles.itemLabel, { color: theme.textPrimary }]}>
                  Privacy & Terms of Service
                </Text>
              </TouchableOpacity>
            )}

            {filterMatches('Dark Light Theme Appearance') && (
              <TouchableOpacity
                style={styles.navItem}
                onPress={() => setThemeMode(isDark ? 'light' : 'dark')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isDark ? 'sunny-outline' : 'moon-outline'}
                  size={20}
                  color={isDark ? '#94A3B8' : '#475569'}
                  style={styles.itemIcon}
                />
                <Text style={[styles.itemLabel, { color: theme.textPrimary }]}>
                  {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                </Text>
              </TouchableOpacity>
            )}

            <View style={[styles.divider, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]} />

            {filterMatches('Account Settings Profile Sign In Out') && (
              <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
                ACCOUNT
              </Text>
            )}

            {filterMatches('Profile Account Details') && (
              <TouchableOpacity
                style={styles.navItem}
                onPress={() => handleAction(onOpenProfile)}
                activeOpacity={0.7}
              >
                <Ionicons name="settings-outline" size={20} color={isDark ? '#94A3B8' : '#475569'} style={styles.itemIcon} />
                <Text style={[styles.itemLabel, { color: theme.textPrimary }]}>
                  Profile & Settings
                </Text>
              </TouchableOpacity>
            )}

            {isGuest ? (
              <TouchableOpacity
                style={styles.signInButton}
                onPress={() => handleAction(onSignInRequest)}
                activeOpacity={0.8}
              >
                <Ionicons name="log-in-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.signInButtonText}>Sign In to Account</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.navItem}
                  onPress={handleDeleteAccount}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" style={styles.itemIcon} />
                  <Text style={[styles.itemLabel, { color: '#EF4444' }]}>
                    Deactivate Account
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.navItem}
                  onPress={() => handleAction(onSignOut)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="log-out-outline" size={20} color={isDark ? '#94A3B8' : '#64748B'} style={styles.itemIcon} />
                  <Text style={[styles.itemLabel, { color: theme.textSecondary }]}>
                    Sign Out
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>

          <View style={[styles.bottomProfileBar, { borderTopColor: isDark ? '#1E293B' : '#E2E8F0', backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
            <View style={styles.avatarBorder}>
              <SafeImage
                uri={
                  (user as any)?.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80'
                }
                style={styles.avatar}
                borderRadius={18}
              />
            </View>
            <View style={styles.profileMeta}>
              <Text style={[styles.profileName, { color: theme.textPrimary }]} numberOfLines={1}>
                {user?.name || (isGuest ? 'Guest Explorer' : 'Member')}
              </Text>
              <Text style={[styles.profileEmail, { color: theme.textMuted }]} numberOfLines={1}>
                {user?.email || 'Tap to sign in and activate'}
              </Text>
            </View>
            <View style={styles.roleTag}>
              <Text style={styles.roleTagText}>{getRoleLabel()}</Text>
            </View>
          </View>
        </Animated.View>
      </View>

      <Modal
        visible={showOnboardModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOnboardModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Onboard Client Company</Text>
                <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
                  Register enterprise office & allocate annual free quota
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowOnboardModal(false)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Company Legal Name</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={compName}
                onChangeText={setCompName}
                placeholder="e.g. Acme Technologies Pvt Ltd"
                placeholderTextColor={theme.textMuted}
              />

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Billing / Admin Email</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={compEmail}
                onChangeText={setCompEmail}
                placeholder="admin@acme.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={theme.textMuted}
              />

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Contact Phone</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={compPhone}
                onChangeText={setCompPhone}
                placeholder="+91 98450 12345"
                keyboardType="phone-pad"
                placeholderTextColor={theme.textMuted}
              />

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>GSTIN (Optional)</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={compGstin}
                onChangeText={setCompGstin}
                placeholder="36AABCB1234F1Z8"
                autoCapitalize="characters"
                placeholderTextColor={theme.textMuted}
              />

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Annual Free Quota (Hours / Year)</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={compFreeHours}
                onChangeText={setCompFreeHours}
                placeholder="240"
                keyboardType="number-pad"
                placeholderTextColor={theme.textMuted}
              />

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleOnboardCompany}
                disabled={onboarding}
                activeOpacity={0.85}
              >
                {onboarding ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>Register & Activate Company</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAddHubModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddHubModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Add Coworking Hub</Text>
                <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
                  Create new facility location & on-site manager profile
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddHubModal(false)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Hub / Facility Name</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={hubName}
                onChangeText={setHubName}
                placeholder="e.g. Madhapur Tech Campus"
                placeholderTextColor={theme.textMuted}
              />

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Street Address & Locality</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={hubStreet}
                onChangeText={setHubStreet}
                placeholder="Plot 45, Cyber Hills, Madhapur"
                placeholderTextColor={theme.textMuted}
              />

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>City</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={hubCity}
                onChangeText={setHubCity}
                placeholder="Hyderabad"
                placeholderTextColor={theme.textMuted}
              />

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>On-Site Manager Name</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={hubManager}
                onChangeText={setHubManager}
                placeholder="Olivia Bennett"
                placeholderTextColor={theme.textMuted}
              />

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Manager Contact Phone</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={hubPhone}
                onChangeText={setHubPhone}
                placeholder="+91 98450 12345"
                keyboardType="phone-pad"
                placeholderTextColor={theme.textMuted}
              />

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>UPI ID for Guest QR Receipts (Optional)</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={hubUpi}
                onChangeText={setHubUpi}
                placeholder="havenlywork@okhdfcbank"
                autoCapitalize="none"
                placeholderTextColor={theme.textMuted}
              />

              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: '#0284C7' }]}
                onPress={handleAddHub}
                disabled={addingHub}
                activeOpacity={0.85}
              >
                {addingHub ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>Publish Coworking Hub</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: 'row'
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  drawerContent: {
    height: '100%',
    borderRightWidth: 1,
    paddingTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 20
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  brandName: {
    fontSize: 17,
    fontWeight: '800'
  },
  brandTagline: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#00A859',
    marginTop: 1
  },
  closeBtn: {
    padding: 6
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 12
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0
  },
  menuScroll: {
    paddingHorizontal: 14,
    paddingBottom: 24
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 6,
    paddingHorizontal: 8
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 2
  },
  itemIcon: {
    marginRight: 14,
    width: 22
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '500'
  },
  divider: {
    height: 1,
    marginVertical: 8,
    marginHorizontal: 6
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00A859',
    height: 44,
    borderRadius: 12,
    marginTop: 10,
    marginHorizontal: 6
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  bottomProfileBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1
  },
  avatarBorder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#00A859',
    padding: 1,
    marginRight: 10
  },
  avatar: {
    width: 34,
    height: 34
  },
  profileMeta: {
    flex: 1
  },
  profileName: {
    fontSize: 14,
    fontWeight: '700'
  },
  profileEmail: {
    fontSize: 11,
    marginTop: 1
  },
  roleTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8
  },
  roleTagText: {
    color: '#00A859',
    fontSize: 10,
    fontWeight: '800'
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end'
  },
  modalCard: {
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
  }
});