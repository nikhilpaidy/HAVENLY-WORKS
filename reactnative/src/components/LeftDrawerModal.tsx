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
  Alert
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

  const [searchQuery, setSearchQuery] = useState('');

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

  const getRoleLabel = () => {
    if (isGuest || !user) return 'Guest Explorer';
    switch (user.role) {
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'SUPER_ADMIN_STAFF':
        return 'Platform Staff';
      case 'COWORKING_ADMIN':
        return 'Hub Admin';
      case 'COWORKING_ADMIN_STAFF':
        return 'Hub Staff';
      case 'COMPANY_OWNER':
        return 'Company Owner';
      case 'COMPANY_STAFF':
        return 'Company Staff';
      default:
        return 'Member';
    }
  };

  const showStaffOption =
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'COWORKING_ADMIN' ||
    user?.role === 'COMPANY_OWNER';

  const filterMatches = (label: string) => {
    if (!searchQuery.trim()) return true;
    return label.toLowerCase().includes(searchQuery.toLowerCase());
  };

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
              backgroundColor: isDark ? '#0B1120' : '#FFFFFF',
              borderColor: isDark ? '#1E293B' : '#E2E8F0',
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          <View style={styles.brandHeader}>
            <View style={styles.brandRow}>
              <HavenlyLogo width={36} height={36} color="#00A859" />
              <View style={styles.brandTitleWrap}>
                <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>
                  HavenlyWork
                </Text>
                <Text style={styles.brandTagline}>
                  SPACE FOR TOGETHERNESS
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchBox, { backgroundColor: isDark ? '#162032' : '#F8FAFC', borderColor: theme.inputBorder }]}>
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
                <Ionicons name="calendar-outline" size={20} color={isDark ? '#94A3B8' : '#475569'} style={styles.itemIcon} />
                <Text style={[styles.itemLabel, { color: theme.textPrimary }]}>
                  My Reservations
                </Text>
              </TouchableOpacity>
            )}

            {filterMatches('Workspace Quota Allowances') && (
              <TouchableOpacity
                style={styles.navItem}
                onPress={() => handleAction(onOpenQuota)}
                activeOpacity={0.7}
              >
                <Ionicons name="pie-chart-outline" size={20} color={isDark ? '#94A3B8' : '#475569'} style={styles.itemIcon} />
                <Text style={[styles.itemLabel, { color: theme.textPrimary }]}>
                  Allowance & Quota
                </Text>
              </TouchableOpacity>
            )}

            <View style={[styles.divider, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]} />

            {filterMatches('Operations Helpdesk Staff Invoices') && (
              <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
                FACILITY OPERATIONS
              </Text>
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
                  Customer Support Hotline
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
                  <Ionicons name="trash-outline" size={20} color="#DC2626" style={styles.itemIcon} />
                  <Text style={[styles.itemLabel, { color: '#DC2626' }]}>
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
  brandHeader: {
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
  brandTitleWrap: {
    marginLeft: 10
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  brandTagline: {
    fontSize: 8,
    fontWeight: '800',
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
    marginHorizontal: 18,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 13
  },
  menuScroll: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 24
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 6,
    paddingHorizontal: 8
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
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
  }
});
