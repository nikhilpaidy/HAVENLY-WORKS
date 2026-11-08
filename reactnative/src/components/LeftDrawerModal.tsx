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
  onOpenNotifications?: () => void;
  unreadNotifsCount?: number;
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
  onOpenNotifications,
  unreadNotifsCount = 0,
  onSignOut,
  onSignInRequest
}) => {
  const { user, isGuest } = useAuth();
  const { theme, isDark, setThemeMode } = useTheme();

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isCoworkingAdmin = user?.role === 'COWORKING_ADMIN';
  const isManagerRole = isSuperAdmin || isCoworkingAdmin;

  const [searchQuery, setSearchQuery] = useState('');
  const [workspacesExpanded, setWorkspacesExpanded] = useState(true);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const [locations, setLocations] = useState<any[]>([]);
  const [selectedHubId, setSelectedHubId] = useState('');
  const [hubSearchQuery, setHubSearchQuery] = useState('');

  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [compName, setCompName] = useState('');
  const [compDomain, setCompDomain] = useState('');
  const [compOwnerName, setCompOwnerName] = useState('');
  const [compEmail, setCompEmail] = useState('');
  const [compPhone, setCompPhone] = useState('');
  const [compGstin, setCompGstin] = useState('');
  const [compPan, setCompPan] = useState('');
  const [compFreeHours, setCompFreeHours] = useState('240');
  const [onboarding, setOnboarding] = useState(false);

  const [showAddHubModal, setShowAddHubModal] = useState(false);
  const [hubName, setHubName] = useState('');
  const [hubStreet, setHubStreet] = useState('');
  const [hubCity, setHubCity] = useState('Hyderabad');
  const [hubState, setHubState] = useState('Telangana');
  const [hubPostalCode, setHubPostalCode] = useState('500081');
  const [hubCountry, setHubCountry] = useState('India');
  const [hubManager, setHubManager] = useState('');
  const [hubPhone, setHubPhone] = useState('');
  const [hubUpi, setHubUpi] = useState('');
  const [addingHub, setAddingHub] = useState(false);

  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [typeName, setTypeName] = useState('');
  const [typeCode, setTypeCode] = useState('');
  const [typeCapacity, setTypeCapacity] = useState('4');
  const [typeRate, setTypeRate] = useState('450');
  const [typeDesc, setTypeDesc] = useState('');
  const [addingType, setAddingType] = useState(false);

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && isManagerRole) {
      mobileApi.getPublicLocations().then((locs) => {
        if (Array.isArray(locs) && locs.length > 0) {
          setLocations(locs);
          if (!selectedHubId) {
            setSelectedHubId(locs[0]._id);
          }
        }
      }).catch(() => {});
    }
  }, [visible, isManagerRole]);

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
        domain: compDomain.trim().toLowerCase() || undefined,
        billingEmail: compEmail.trim().toLowerCase(),
        ownerName: compOwnerName.trim() || undefined,
        ownerEmail: compEmail.trim().toLowerCase(),
        phone: compPhone.trim() || undefined,
        locationId: selectedHubId || undefined,
        gstin: compGstin.trim() || undefined,
        pan: compPan.trim() || undefined,
        allowanceConfig: {
          annualFreeHours: parseInt(compFreeHours, 10) || 240
        }
      });
      setShowOnboardModal(false);
      setCompName('');
      setCompDomain('');
      setCompOwnerName('');
      setCompEmail('');
      setCompPhone('');
      setCompGstin('');
      setCompPan('');
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
          state: hubState.trim() || 'Telangana',
          postalCode: hubPostalCode.trim() || '500081',
          country: hubCountry.trim() || 'India'
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

  const handleCreateType = async () => {
    if (!typeName.trim()) {
      Alert.alert('Validation Error', 'Workspace type name is required.');
      return;
    }
    setAddingType(true);
    try {
      const code = (typeCode || typeName).trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
      await mobileApi.createWorkspaceType({
        name: typeName.trim(),
        code,
        capacityDefault: parseInt(typeCapacity, 10) || 4,
        hourlyRateDefault: parseFloat(typeRate) || 450,
        description: typeDesc.trim() || undefined
      });
      setShowAddTypeModal(false);
      setTypeName('');
      setTypeCode('');
      setTypeDesc('');
      Alert.alert('Workspace Type Created', `Type "${typeName.trim()}" published successfully.`);
    } catch (err: any) {
      Alert.alert('Create Error', err.message || 'Could not add workspace type.');
    } finally {
      setAddingType(false);
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
              setShowAccountMenu(false);
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
              backgroundColor: isDark ? '#121214' : '#FFFFFF',
              borderRightColor: isDark ? '#27272A' : '#E2E8F0',
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <View style={[styles.brandIconBox, { backgroundColor: '#00A859' }]}>
                <Ionicons name="business" size={18} color="#FFFFFF" />
              </View>
              <Text style={[styles.brandName, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                HavenlyWork
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchBox, { backgroundColor: isDark ? '#1C1C1E' : '#F4F5F7', borderColor: isDark ? '#2E2E32' : '#E5E7EB' }]}>
            <TextInput
              style={[styles.searchInput, { color: theme.textPrimary }]}
              placeholder="Search"
              placeholderTextColor={isDark ? '#71717A' : '#9CA3AF'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={isDark ? '#71717A' : '#9CA3AF'} />
              </TouchableOpacity>
            ) : (
              <Ionicons name="search-outline" size={16} color={isDark ? '#71717A' : '#9CA3AF'} />
            )}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.menuScroll}
          >
            {filterMatches('Due List Reservations Bookings') && (
              <TouchableOpacity
                style={styles.navRow}
                onPress={() => handleAction(onOpenBookings)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="document-text-outline"
                  size={19}
                  color={isDark ? '#A1A1AA' : '#64748B'}
                  style={styles.rowIcon}
                />
                <Text style={[styles.rowLabel, { color: isDark ? '#F4F4F5' : '#1E293B' }]}>
                  Due List
                </Text>
              </TouchableOpacity>
            )}

            {filterMatches('Notifications Alerts') && (
              <TouchableOpacity
                style={styles.navRow}
                onPress={() => handleAction(onOpenNotifications ? onOpenNotifications : onOpenExplore)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="notifications-outline"
                  size={19}
                  color={isDark ? '#A1A1AA' : '#64748B'}
                  style={styles.rowIcon}
                />
                <Text style={[styles.rowLabel, { color: isDark ? '#F4F4F5' : '#1E293B' }]}>
                  Notifications
                </Text>
                {unreadNotifsCount > 0 && (
                  <View style={styles.badgePill}>
                    <Text style={styles.badgePillText}>{unreadNotifsCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            <View style={styles.sectionSpacer} />

            {filterMatches('Navigation Dashboard Explore') && (
              <>
                <Text style={[styles.sectionHeading, { color: isDark ? '#71717A' : '#94A3B8' }]}>
                  Navigation
                </Text>
                <TouchableOpacity
                  style={styles.navRow}
                  onPress={() => handleAction(onOpenExplore)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="grid-outline"
                    size={19}
                    color={isDark ? '#A1A1AA' : '#64748B'}
                    style={styles.rowIcon}
                  />
                  <Text style={[styles.rowLabel, { color: isDark ? '#F4F4F5' : '#1E293B' }]}>
                    Dashboard
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.sectionSpacer} />

            {filterMatches('My tasks Workspaces Desks Meeting Rooms Reservations Quota') && (
              <>
                <Text style={[styles.sectionHeading, { color: isDark ? '#71717A' : '#94A3B8' }]}>
                  My tasks
                </Text>

                <TouchableOpacity
                  style={styles.navRow}
                  onPress={() => setWorkspacesExpanded(!workspacesExpanded)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={19}
                    color={isDark ? '#A1A1AA' : '#64748B'}
                    style={styles.rowIcon}
                  />
                  <Text style={[styles.rowLabel, { color: isDark ? '#F4F4F5' : '#1E293B' }]}>
                    Workspaces & Desks
                  </Text>
                  <Ionicons
                    name={workspacesExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={isDark ? '#71717A' : '#94A3B8'}
                  />
                </TouchableOpacity>

                {workspacesExpanded && (
                  <View style={styles.nestedContainer}>
                    <View style={[styles.verticalTreeLine, { backgroundColor: isDark ? '#27272A' : '#E2E8F0' }]} />
                    <View style={styles.nestedItemsColumn}>
                      <TouchableOpacity
                        style={styles.nestedRow}
                        onPress={() => handleAction(onOpenRooms)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.nestedLabel, { color: isDark ? '#D4D4D8' : '#475569' }]}>
                          Meeting Rooms
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.nestedRow}
                        onPress={() => handleAction(onOpenRooms)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.nestedLabel, { color: isDark ? '#D4D4D8' : '#475569' }]}>
                          Flex Desks
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.nestedRow}
                        onPress={() => handleAction(onOpenRooms)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.nestedLabel, { color: isDark ? '#D4D4D8' : '#475569' }]}>
                          Private Cabins
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {filterMatches('Reservations Bookings') && (
                  <TouchableOpacity
                    style={styles.navRow}
                    onPress={() => handleAction(onOpenBookings)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="bookmark-outline"
                      size={19}
                      color={isDark ? '#A1A1AA' : '#64748B'}
                      style={styles.rowIcon}
                    />
                    <Text style={[styles.rowLabel, { color: isDark ? '#F4F4F5' : '#1E293B' }]}>
                      {isSuperAdmin ? 'Platform Bookings' : isCoworkingAdmin ? 'Hub Bookings' : 'Reservations'}
                    </Text>
                  </TouchableOpacity>
                )}

                {filterMatches('Quota Allowance') && (
                  <TouchableOpacity
                    style={styles.navRow}
                    onPress={() => handleAction(onOpenQuota)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="layers-outline"
                      size={19}
                      color={isDark ? '#A1A1AA' : '#64748B'}
                      style={styles.rowIcon}
                    />
                    <Text style={[styles.rowLabel, { color: isDark ? '#F4F4F5' : '#1E293B' }]}>
                      {isSuperAdmin ? 'Platform Quotas' : isCoworkingAdmin ? 'Client Quotas' : 'Quota & Allowance'}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            <View style={styles.sectionSpacer} />

            {filterMatches('Operations Helpdesk Staff Invoices Onboard Hub Type') && (
              <>
                <Text style={[styles.sectionHeading, { color: isDark ? '#71717A' : '#94A3B8' }]}>
                  My Customers
                </Text>

                {filterMatches('Helpdesk Complaints') && (
                  <TouchableOpacity
                    style={styles.navRow}
                    onPress={() => handleAction(onOpenHelpdesk)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="chatbubbles-outline"
                      size={19}
                      color={isDark ? '#A1A1AA' : '#64748B'}
                      style={styles.rowIcon}
                    />
                    <Text style={[styles.rowLabel, { color: isDark ? '#F4F4F5' : '#1E293B' }]}>
                      Helpdesk & Complaints
                    </Text>
                  </TouchableOpacity>
                )}

                {showStaffOption && filterMatches('Staff Management') && (
                  <TouchableOpacity
                    style={styles.navRow}
                    onPress={() => handleAction(onOpenStaff)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="people-outline"
                      size={19}
                      color={isDark ? '#A1A1AA' : '#64748B'}
                      style={styles.rowIcon}
                    />
                    <Text style={[styles.rowLabel, { color: isDark ? '#F4F4F5' : '#1E293B' }]}>
                      Staff & Permissions
                    </Text>
                  </TouchableOpacity>
                )}

                {filterMatches('Invoices Billing') && (
                  <TouchableOpacity
                    style={styles.navRow}
                    onPress={() => handleAction(onOpenInvoices)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="receipt-outline"
                      size={19}
                      color={isDark ? '#A1A1AA' : '#64748B'}
                      style={styles.rowIcon}
                    />
                    <Text style={[styles.rowLabel, { color: isDark ? '#F4F4F5' : '#1E293B' }]}>
                      Invoices & Statements
                    </Text>
                  </TouchableOpacity>
                )}

                {isManagerRole && filterMatches('Onboard Client Company') && (
                  <TouchableOpacity
                    style={styles.navRow}
                    onPress={() => setShowOnboardModal(true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="business-outline"
                      size={19}
                      color="#00A859"
                      style={styles.rowIcon}
                    />
                    <Text style={[styles.rowLabel, { color: '#00A859', fontWeight: '700' }]}>
                      Onboard Client Company
                    </Text>
                  </TouchableOpacity>
                )}

                {isSuperAdmin && filterMatches('Add Coworking Hub') && (
                  <TouchableOpacity
                    style={styles.navRow}
                    onPress={() => setShowAddHubModal(true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="map-outline"
                      size={19}
                      color="#0284C7"
                      style={styles.rowIcon}
                    />
                    <Text style={[styles.rowLabel, { color: '#0284C7', fontWeight: '700' }]}>
                      Add Coworking Hub
                    </Text>
                  </TouchableOpacity>
                )}

                {isManagerRole && filterMatches('Add Workspace Type') && (
                  <TouchableOpacity
                    style={styles.navRow}
                    onPress={() => setShowAddTypeModal(true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="pricetags-outline"
                      size={19}
                      color="#8B5CF6"
                      style={styles.rowIcon}
                    />
                    <Text style={[styles.rowLabel, { color: '#8B5CF6', fontWeight: '700' }]}>
                      Add Workspace Type
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            <View style={styles.sectionSpacer} />

            {filterMatches('Account Settings Support Legal Theme') && (
              <>
                <Text style={[styles.sectionHeading, { color: isDark ? '#71717A' : '#94A3B8' }]}>
                  Account
                </Text>

                {filterMatches('Settings Profile') && (
                  <TouchableOpacity
                    style={styles.navRow}
                    onPress={() => handleAction(onOpenProfile)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="settings-outline"
                      size={19}
                      color={isDark ? '#A1A1AA' : '#64748B'}
                      style={styles.rowIcon}
                    />
                    <Text style={[styles.rowLabel, { color: isDark ? '#F4F4F5' : '#1E293B' }]}>
                      Settings
                    </Text>
                  </TouchableOpacity>
                )}

                {filterMatches('Help Support') && (
                  <TouchableOpacity
                    style={styles.navRow}
                    onPress={() => handleAction(onOpenSupport)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="help-circle-outline"
                      size={19}
                      color={isDark ? '#A1A1AA' : '#64748B'}
                      style={styles.rowIcon}
                    />
                    <Text style={[styles.rowLabel, { color: isDark ? '#F4F4F5' : '#1E293B' }]}>
                      Help
                    </Text>
                  </TouchableOpacity>
                )}

                {filterMatches('Privacy Terms Legal') && (
                  <TouchableOpacity
                    style={styles.navRow}
                    onPress={() => handleAction(onOpenLegal)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="document-outline"
                      size={19}
                      color={isDark ? '#A1A1AA' : '#64748B'}
                      style={styles.rowIcon}
                    />
                    <Text style={[styles.rowLabel, { color: isDark ? '#F4F4F5' : '#1E293B' }]}>
                      Privacy & Policy
                    </Text>
                  </TouchableOpacity>
                )}

                {filterMatches('Theme Appearance') && (
                  <TouchableOpacity
                    style={styles.navRow}
                    onPress={() => setThemeMode(isDark ? 'light' : 'dark')}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isDark ? 'sunny-outline' : 'moon-outline'}
                      size={19}
                      color={isDark ? '#A1A1AA' : '#64748B'}
                      style={styles.rowIcon}
                    />
                    <Text style={[styles.rowLabel, { color: isDark ? '#F4F4F5' : '#1E293B' }]}>
                      {isDark ? 'Light Appearance' : 'Dark Appearance'}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.userCard,
              {
                backgroundColor: isDark ? '#1C1C1E' : '#F8FAFC',
                borderTopColor: isDark ? '#27272A' : '#E2E8F0'
              }
            ]}
            onPress={() => setShowAccountMenu(true)}
            activeOpacity={0.85}
          >
            <SafeImage
              uri={
                (user as any)?.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80'
              }
              style={styles.userAvatar}
              borderRadius={18}
            />
            <View style={styles.userInfoCol}>
              <Text style={[styles.userName, { color: isDark ? '#F4F4F5' : '#0F172A' }]} numberOfLines={1}>
                {user?.name || (isGuest ? 'Guest Explorer' : 'Colton Shierdan')}
              </Text>
              <Text style={[styles.userEmail, { color: isDark ? '#71717A' : '#64748B' }]} numberOfLines={1}>
                {user?.email || (isGuest ? 'Tap to sign in' : 'colton@unimatrixui.com')}
              </Text>
            </View>
            <Ionicons name="ellipsis-horizontal" size={18} color={isDark ? '#71717A' : '#94A3B8'} />
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Modal
        visible={showAccountMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAccountMenu(false)}
      >
        <TouchableOpacity
          style={styles.menuBackdrop}
          activeOpacity={1}
          onPress={() => setShowAccountMenu(false)}
        >
          <View
            style={[
              styles.accountMenuCard,
              {
                backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                borderColor: isDark ? '#2E2E32' : '#E2E8F0'
              }
            ]}
          >
            <View style={styles.menuHeaderRow}>
              <Text style={[styles.menuTitle, { color: theme.textPrimary }]}>Account Actions</Text>
              <TouchableOpacity onPress={() => setShowAccountMenu(false)}>
                <Ionicons name="close" size={18} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            {isGuest ? (
              <TouchableOpacity
                style={[styles.accountOptionBtn, { backgroundColor: '#00A859' }]}
                onPress={() => {
                  setShowAccountMenu(false);
                  handleAction(onSignInRequest);
                }}
              >
                <Ionicons name="log-in-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={[styles.accountOptionText, { color: '#FFFFFF' }]}>Sign In to Account</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.accountOptionRow}
                  onPress={() => {
                    setShowAccountMenu(false);
                    handleAction(onOpenProfile);
                  }}
                >
                  <Ionicons name="person-outline" size={18} color={theme.textPrimary} style={{ marginRight: 10 }} />
                  <Text style={[styles.accountOptionRowText, { color: theme.textPrimary }]}>Edit Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.accountOptionRow}
                  onPress={() => {
                    setShowAccountMenu(false);
                    handleDeleteAccount();
                  }}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" style={{ marginRight: 10 }} />
                  <Text style={[styles.accountOptionRowText, { color: '#EF4444' }]}>Deactivate Account</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.accountOptionRow}
                  onPress={() => {
                    setShowAccountMenu(false);
                    handleAction(onSignOut);
                  }}
                >
                  <Ionicons name="log-out-outline" size={18} color={theme.textMuted} style={{ marginRight: 10 }} />
                  <Text style={[styles.accountOptionRowText, { color: theme.textSecondary }]}>Sign Out</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

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

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 460 }}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Assigned Coworking Hub</Text>
              <View style={[styles.hubSearchRow, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
                <Ionicons name="search" size={15} color={theme.textMuted} style={{ marginRight: 6 }} />
                <TextInput
                  style={[styles.hubSearchInput, { color: theme.textPrimary }]}
                  placeholder="Search hub by name or area..."
                  placeholderTextColor={theme.textMuted}
                  value={hubSearchQuery}
                  onChangeText={setHubSearchQuery}
                />
                {hubSearchQuery ? (
                  <TouchableOpacity onPress={() => setHubSearchQuery('')}>
                    <Ionicons name="close-circle" size={16} color={theme.textMuted} />
                  </TouchableOpacity>
                ) : null}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {locations
                  .filter((loc) => {
                    if (!hubSearchQuery.trim()) return true;
                    const q = hubSearchQuery.toLowerCase();
                    return (
                      loc.name?.toLowerCase().includes(q) ||
                      loc.address?.city?.toLowerCase().includes(q) ||
                      loc.address?.street?.toLowerCase().includes(q)
                    );
                  })
                  .map((loc) => {
                    const isSelected = selectedHubId === loc._id;
                    return (
                      <TouchableOpacity
                        key={loc._id}
                        style={[
                          styles.hubOptionChip,
                          isSelected && styles.hubOptionActive,
                          { borderColor: theme.cardBorder }
                        ]}
                        onPress={() => setSelectedHubId(loc._id)}
                      >
                        <Text
                          style={[
                            styles.hubOptionText,
                            { color: isSelected ? '#FFFFFF' : theme.textPrimary }
                          ]}
                        >
                          {loc.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
              </ScrollView>

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Company Legal Name</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={compName}
                onChangeText={setCompName}
                placeholder="e.g. Acme Technologies Pvt Ltd"
                placeholderTextColor={theme.textMuted}
              />

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Company Domain (Optional)</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={compDomain}
                onChangeText={setCompDomain}
                placeholder="acme.com"
                autoCapitalize="none"
                placeholderTextColor={theme.textMuted}
              />

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Primary Owner / Contact Name</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={compOwnerName}
                onChangeText={setCompOwnerName}
                placeholder="Colton Shierdan"
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

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>GSTIN (Optional)</Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    value={compGstin}
                    onChangeText={setCompGstin}
                    placeholder="36AABCB1234F1Z8"
                    autoCapitalize="characters"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>PAN Number (Optional)</Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    value={compPan}
                    onChangeText={setCompPan}
                    placeholder="AABCB1234F"
                    autoCapitalize="characters"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
              </View>

              <Text style={[styles.fieldLabel, { color: theme.textSecondary, marginTop: 10 }]}>
                Annual Complimentary Free Hours
              </Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={compFreeHours}
                onChangeText={setCompFreeHours}
                placeholder="240"
                keyboardType="numeric"
                placeholderTextColor={theme.textMuted}
              />

              <TouchableOpacity
                style={[styles.modalSubmitBtn, onboarding && { opacity: 0.7 }]}
                onPress={handleOnboardCompany}
                disabled={onboarding}
              >
                {onboarding ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalSubmitText}>Complete Company Registration</Text>
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
                  Create and publish a new coworking location
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddHubModal(false)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 460 }}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Hub / Facility Name</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={hubName}
                onChangeText={setHubName}
                placeholder="e.g. Havenly Hitech City Center"
                placeholderTextColor={theme.textMuted}
              />

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Street Address</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={hubStreet}
                onChangeText={setHubStreet}
                placeholder="e.g. Plot 42, Mindspace Circle, Madhapur"
                placeholderTextColor={theme.textMuted}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>City</Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    value={hubCity}
                    onChangeText={setHubCity}
                    placeholder="Hyderabad"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>State</Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    value={hubState}
                    onChangeText={setHubState}
                    placeholder="Telangana"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Postal Code</Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    value={hubPostalCode}
                    onChangeText={setHubPostalCode}
                    placeholder="500081"
                    keyboardType="numeric"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Country</Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    value={hubCountry}
                    onChangeText={setHubCountry}
                    placeholder="India"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
              </View>

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Hub General Manager Name</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={hubManager}
                onChangeText={setHubManager}
                placeholder="Manager Name"
                placeholderTextColor={theme.textMuted}
              />

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Manager Contact Phone</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={hubPhone}
                onChangeText={setHubPhone}
                placeholder="+91 98450 XXXXX"
                keyboardType="phone-pad"
                placeholderTextColor={theme.textMuted}
              />

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>UPI Payment ID</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={hubUpi}
                onChangeText={setHubUpi}
                placeholder="hub@upi"
                autoCapitalize="none"
                placeholderTextColor={theme.textMuted}
              />

              <TouchableOpacity
                style={[styles.modalSubmitBtn, addingHub && { opacity: 0.7 }]}
                onPress={handleAddHub}
                disabled={addingHub}
              >
                {addingHub ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalSubmitText}>Publish Coworking Hub</Text>
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
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Add Workspace Type</Text>
                <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
                  Define global workspace categories
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddTypeModal(false)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 460 }}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Type Display Name</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={typeName}
                onChangeText={setTypeName}
                placeholder="e.g. Soundproof Podcast Studio"
                placeholderTextColor={theme.textMuted}
              />

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Unique Code (Optional)</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={typeCode}
                onChangeText={setTypeCode}
                placeholder="e.g. PODCAST_STUDIO"
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
                    keyboardType="numeric"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Default Rate (₹/hr)</Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    value={typeRate}
                    onChangeText={setTypeRate}
                    placeholder="450"
                    keyboardType="numeric"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
              </View>

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Description</Text>
              <TextInput
                style={[styles.inputField, { height: 80, textAlignVertical: 'top', backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={typeDesc}
                onChangeText={setTypeDesc}
                placeholder="Features, acoustics, equipment included..."
                multiline
                numberOfLines={3}
                placeholderTextColor={theme.textMuted}
              />

              <TouchableOpacity
                style={[styles.modalSubmitBtn, addingType && { opacity: 0.7 }]}
                onPress={handleCreateType}
                disabled={addingType}
              >
                {addingType ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalSubmitText}>Publish Workspace Type</Text>
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
    paddingTop: 52,
    flexDirection: 'column'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  brandIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  brandName: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3
  },
  closeBtn: {
    padding: 6
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 16
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 4
  },
  menuScroll: {
    paddingHorizontal: 16,
    paddingBottom: 24
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8
  },
  rowIcon: {
    marginRight: 12
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500'
  },
  badgePill: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10
  },
  badgePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  sectionSpacer: {
    height: 12
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 6,
    marginLeft: 8,
    letterSpacing: 0.3
  },
  nestedContainer: {
    flexDirection: 'row',
    marginLeft: 17,
    paddingLeft: 12,
    marginTop: 2,
    marginBottom: 6
  },
  verticalTreeLine: {
    width: 1.5,
    borderRadius: 1
  },
  nestedItemsColumn: {
    flex: 1,
    paddingLeft: 14
  },
  nestedRow: {
    paddingVertical: 7
  },
  nestedLabel: {
    fontSize: 13,
    fontWeight: '500'
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1
  },
  userAvatar: {
    width: 36,
    height: 36,
    marginRight: 10
  },
  userInfoCol: {
    flex: 1
  },
  userName: {
    fontSize: 13.5,
    fontWeight: '700'
  },
  userEmail: {
    fontSize: 11.5,
    marginTop: 1
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 16,
    paddingBottom: 36
  },
  accountMenuCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8
  },
  menuHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700'
  },
  accountOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4
  },
  accountOptionText: {
    fontSize: 13,
    fontWeight: '700'
  },
  accountOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0'
  },
  accountOptionRowText: {
    fontSize: 14,
    fontWeight: '600'
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
  },
  hubOptionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8
  },
  hubOptionActive: {
    backgroundColor: '#00A859',
    borderColor: '#00A859'
  },
  hubOptionText: {
    fontSize: 12,
    fontWeight: '600'
  },
  hubSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 8
  },
  hubSearchInput: {
    flex: 1,
    fontSize: 12,
    paddingVertical: 4
  }
});