import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { SafeImage } from './SafeImage';
import { mobileApi } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.60;

interface LeftDrawerModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenProfile: () => void;
  onOpenHelpdesk: () => void;
  onOpenStaff: () => void;
  onOpenInvoices: () => void;
  onOpenQuota: () => void;
  onOpenLegal: () => void;
  onOpenSupport: () => void;
}

export const LeftDrawerModal: React.FC<LeftDrawerModalProps> = ({
  visible,
  onClose,
  onOpenProfile,
  onOpenHelpdesk,
  onOpenStaff,
  onOpenInvoices,
  onOpenQuota,
  onOpenLegal,
  onOpenSupport
}) => {
  const { user, logout, isGuest } = useAuth();
  const { theme, isDark, setThemeMode } = useTheme();

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

  const getRoleLabel = () => {
    if (!user) return 'Guest Explorer';
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
              await logout();
              Alert.alert('Account Deactivated', 'Your account has been deactivated successfully.');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to deactivate account.');
            }
          }
        }
      ]
    );
  };

  const handleAction = (callback: () => void) => {
    onClose();
    setTimeout(callback, 260);
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
              borderColor: isDark ? '#1E293B' : '#E2E8F0',
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          <View style={styles.drawerHeader}>
            <View style={styles.avatarRow}>
              <View style={styles.avatarBorder}>
                <SafeImage
                  uri={
                    (user as any)?.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80'
                  }
                  style={styles.avatar}
                  borderRadius={22}
                />
              </View>
              <View style={styles.headerInfo}>
                <Text
                  style={[styles.userName, { color: theme.textPrimary }]}
                  numberOfLines={1}
                >
                  {user?.name || (isGuest ? 'Guest Explorer' : 'Member')}
                </Text>
                <Text
                  style={[styles.userEmail, { color: theme.textMuted }]}
                  numberOfLines={1}
                >
                  {user?.email || 'guest@havenlywork.com'}
                </Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>{getRoleLabel()}</Text>
                </View>
              </View>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.menuScroll}
          >
            <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
              WORKPLACE & ACCOUNT
            </Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleAction(onOpenProfile)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="person-outline" size={18} color="#00A859" />
              </View>
              <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>
                Profile & Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleAction(onOpenHelpdesk)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="chatbubbles-outline" size={18} color="#0284C7" />
              </View>
              <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>
                Helpdesk & Chat
              </Text>
            </TouchableOpacity>

            {showStaffOption && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleAction(onOpenStaff)}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconBg, { backgroundColor: '#EDE9FE' }]}>
                  <Ionicons name="people-outline" size={18} color="#7C3AED" />
                </View>
                <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>
                  Staff Management
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleAction(onOpenInvoices)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="receipt-outline" size={18} color="#D97706" />
              </View>
              <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>
                Invoices & Receipts
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleAction(onOpenQuota)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: '#FCE7F3' }]}>
                <Ionicons name="pie-chart-outline" size={18} color="#DB2777" />
              </View>
              <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>
                Workspace Quota
              </Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]} />

            <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
              PREFERENCES & ASSISTANCE
            </Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleAction(onOpenSupport)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="call-outline" size={18} color="#16A34A" />
              </View>
              <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>
                Support & Hotline
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleAction(onOpenLegal)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: '#F1F5F9' }]}>
                <Ionicons name="document-text-outline" size={18} color="#475569" />
              </View>
              <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>
                Privacy & Policy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setThemeMode(isDark ? 'light' : 'dark')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                <Ionicons
                  name={isDark ? 'sunny-outline' : 'moon-outline'}
                  size={18}
                  color={isDark ? '#F59E0B' : '#334155'}
                />
              </View>
              <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>
                {isDark ? 'Light Theme' : 'Dark Theme'}
              </Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDeleteAccount}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="trash-outline" size={18} color="#DC2626" />
              </View>
              <Text style={[styles.menuLabel, { color: '#DC2626', fontWeight: '600' }]}>
                Delete Account
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onClose();
                logout();
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: '#F1F5F9' }]}>
                <Ionicons name="log-out-outline" size={18} color="#64748B" />
              </View>
              <Text style={[styles.menuLabel, { color: theme.textSecondary }]}>
                Sign Out
              </Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={[styles.drawerFooter, { borderTopColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
            <Text style={[styles.footerText, { color: theme.textMuted }]}>
              HavenlyWork v2.4.0
            </Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.45)'
  },
  drawerContent: {
    height: '100%',
    borderRightWidth: 1,
    paddingTop: 54,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 16
  },
  drawerHeader: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 168, 89, 0.15)'
  },
  avatarRow: {
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  avatarBorder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#00A859',
    padding: 2,
    marginBottom: 8
  },
  avatar: {
    width: 40,
    height: 40
  },
  headerInfo: {
    width: '100%'
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2
  },
  userEmail: {
    fontSize: 11,
    marginBottom: 6
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00A859'
  },
  menuScroll: {
    paddingHorizontal: 12,
    paddingVertical: 14
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 6,
    paddingHorizontal: 4
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: 10,
    marginBottom: 2
  },
  menuIconBg: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  menuLabel: {
    fontSize: 13,
    fontWeight: '500'
  },
  divider: {
    height: 1,
    marginVertical: 10
  },
  drawerFooter: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    alignItems: 'center'
  },
  footerText: {
    fontSize: 10,
    fontWeight: '600'
  }
});
