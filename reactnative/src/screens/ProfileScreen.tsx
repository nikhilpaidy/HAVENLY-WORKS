import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme, ThemeMode } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { SafeImage } from '../components/SafeImage';
import { Ionicons } from '@expo/vector-icons';
import { mobileApi } from '../services/api';
import { spacing, radii, typography, shadows } from '../theme/tokens';

interface ProfileScreenProps {
  onOpenNotifications: () => void;
  unreadNotifsCount: number;
  onNavigateToStaff?: () => void;
  onNavigateToTickets?: () => void;
  onBack?: () => void;
  onOpenDrawer?: () => void;
  onSignInRequest?: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80'
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onOpenNotifications,
  unreadNotifsCount,
  onNavigateToStaff,
  onNavigateToTickets,
  onBack,
  onOpenDrawer,
  onSignInRequest
}) => {
  const { user, isGuest, logout, refreshProfile } = useAuth();
  const { theme, themeMode, setThemeMode, isDark } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [designation, setDesignation] = useState(user?.designation || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || PRESET_AVATARS[0]);

  const [saving, setSaving] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setDesignation(user.designation || '');
      if (user.avatarUrl) {
        setAvatarUrl(user.avatarUrl);
      }
    }
  }, [user]);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'SUPER_ADMIN_STAFF';
  const isCoworkingAdmin = user?.role === 'COWORKING_ADMIN' || user?.role === 'COWORKING_ADMIN_STAFF';

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your full name');
      return;
    }
    try {
      setSaving(true);
      await mobileApi.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        designation: designation.trim(),
        avatarUrl
      });
      await refreshProfile();
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Unable to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getRoleDisplayName = () => {
    if (!user) return 'Guest Explorer';
    switch (user.role) {
      case 'SUPER_ADMIN':
        return 'Platform Super Admin';
      case 'SUPER_ADMIN_STAFF':
        return 'Super Admin Staff';
      case 'COWORKING_ADMIN':
        return 'Coworking Hub Admin';
      case 'COWORKING_ADMIN_STAFF':
        return 'Coworking Hub Staff';
      case 'COMPANY_OWNER':
        return 'Company Owner';
      case 'COMPANY_STAFF':
        return 'Company Staff';
      default:
        return user.role.replace(/_/g, ' ');
    }
  };

  const getOrganizationName = () => {
    if (user?.company?.name) return user.company.name;
    if (user?.organization?.name) return user.organization.name;
    if (isSuperAdmin) return 'HavenlyWork Platform';
    if (isCoworkingAdmin) return 'HavenlyWork Hub';
    return 'Corporate Member';
  };

  const handleThemeChange = async (mode: ThemeMode) => {
    await setThemeMode(mode);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Deactivate Account',
      'Are you sure you want to deactivate your account? Your access will be suspended immediately.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              await mobileApi.deleteAccount();
              await logout();
              Alert.alert('Account Deactivated', 'Your account has been deactivated.');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to deactivate account.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Settings & Profile"
        subtitle={isGuest ? 'Guest Mode' : 'Account & Preferences'}
        unreadCount={unreadNotifsCount}
        onPressNotifications={onOpenNotifications}
        showBack={!!onBack}
        onPressBack={onBack}
        onOpenDrawer={onOpenDrawer}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isGuest && (
          <View style={[styles.guestCard, { backgroundColor: isDark ? 'rgba(0, 168, 89, 0.12)' : '#DCFCE7', borderColor: '#00A859' }]}>
            <View style={styles.guestHeader}>
              <Ionicons name="sparkles" size={18} color="#00A859" style={{ marginRight: 6 }} />
              <Text style={[styles.guestTitle, { color: theme.textPrimary }]}>Guest Explorer</Text>
            </View>
            <Text style={[styles.guestSubtitle, { color: theme.textSecondary }]}>
              Sign in with your enterprise account to unlock meeting room bookings, complimentary allowance tracking, and statements.
            </Text>
            <TouchableOpacity
              style={[styles.signInBtn, { backgroundColor: '#00A859' }]}
              onPress={onSignInRequest}
              activeOpacity={0.85}
            >
              <Text style={styles.signInBtnText}>Sign In to HavenlyWork</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.heroRow}>
            <TouchableOpacity
              style={styles.avatarWrap}
              onPress={() => setShowAvatarPicker(true)}
              activeOpacity={0.8}
            >
              <SafeImage
                uri={avatarUrl}
                style={styles.avatarImg}
                borderRadius={36}
                fallbackIcon="person-outline"
              />
              <View style={styles.avatarEditPill}>
                <Ionicons name="camera" size={12} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <View style={styles.heroInfo}>
              <Text style={[styles.heroName, { color: theme.textPrimary }]} numberOfLines={1}>
                {user?.name || 'Guest User'}
              </Text>
              <Text style={[styles.heroOrg, { color: theme.textSecondary }]} numberOfLines={1}>
                {getOrganizationName()}
              </Text>

              <View style={[styles.roleBadge, { backgroundColor: isDark ? 'rgba(0, 168, 89, 0.15)' : '#DCFCE7' }]}>
                <Ionicons name="shield-checkmark" size={11} color="#00A859" style={{ marginRight: 4 }} />
                <Text style={styles.roleBadgeText}>{getRoleDisplayName()}</Text>
              </View>
            </View>
          </View>

          {user?.email && (
            <View style={[styles.emailRow, { borderTopColor: theme.cardBorder }]}>
              <Ionicons name="mail-outline" size={14} color={theme.textMuted} style={{ marginRight: 6 }} />
              <Text style={[styles.emailText, { color: theme.textSecondary }]}>{user.email}</Text>
            </View>
          )}
        </View>

        {!isGuest && (
          <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Account Details</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Full Name</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={theme.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Phone Number</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={phone}
                onChangeText={setPhone}
                placeholder="+91 98765 43210"
                keyboardType="phone-pad"
                placeholderTextColor={theme.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Job Title / Designation</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={designation}
                onChangeText={setDesignation}
                placeholder="e.g. Director, Engineer"
                placeholderTextColor={theme.textMuted}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: '#00A859' }, saving && { opacity: 0.6 }]}
              onPress={handleSaveProfile}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>Save Account Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Appearance</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Choose how HavenlyWork renders on your device.
          </Text>

          <View style={[styles.themeSegment, { backgroundColor: theme.inputBg }]}>
            {(['light', 'dark', 'system'] as const).map((mode) => {
              const isSelected = themeMode === mode;
              const iconName = mode === 'light' ? 'sunny-outline' : mode === 'dark' ? 'moon-outline' : 'phone-portrait-outline';
              const label = mode === 'light' ? 'Light' : mode === 'dark' ? 'Dark' : 'System';

              return (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.themeBtn,
                    isSelected && [styles.themeBtnActive, { backgroundColor: theme.card, borderColor: theme.cardBorder }]
                  ]}
                  onPress={() => handleThemeChange(mode)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={iconName}
                    size={16}
                    color={isSelected ? '#00A859' : theme.textSecondary}
                    style={{ marginBottom: 4 }}
                  />
                  <Text
                    style={[
                      styles.themeBtnText,
                      { color: isSelected ? theme.textPrimary : theme.textMuted, fontWeight: isSelected ? '700' : '500' }
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {!isGuest && (
          <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Workspace Shortcuts</Text>

            {onNavigateToTickets && (
              <TouchableOpacity
                style={styles.navRowItem}
                onPress={onNavigateToTickets}
                activeOpacity={0.7}
              >
                <View style={[styles.navIconBox, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                  <Ionicons name="chatbubbles-outline" size={18} color="#00A859" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.navItemTitle, { color: theme.textPrimary }]}>Facilities Helpdesk</Text>
                  <Text style={[styles.navItemSub, { color: theme.textMuted }]}>Manage complaints & inquiries</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
              </TouchableOpacity>
            )}

            {onNavigateToStaff && (
              <TouchableOpacity
                style={styles.navRowItem}
                onPress={onNavigateToStaff}
                activeOpacity={0.7}
              >
                <View style={[styles.navIconBox, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                  <Ionicons name="people-outline" size={18} color="#00A859" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.navItemTitle, { color: theme.textPrimary }]}>Team & Staff</Text>
                  <Text style={[styles.navItemSub, { color: theme.textMuted }]}>Manage team permissions</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Session & Security</Text>

          {!isGuest ? (
            <>
              <TouchableOpacity
                style={[styles.actionRow, { borderColor: theme.cardBorder }]}
                onPress={() => setShowLogoutModal(true)}
                activeOpacity={0.75}
              >
                <Ionicons name="log-out-outline" size={18} color={theme.textPrimary} style={{ marginRight: 10 }} />
                <Text style={[styles.actionRowText, { color: theme.textPrimary }]}>Sign Out of HavenlyWork</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionRow, { borderColor: theme.cardBorder, borderBottomWidth: 0 }]}
                onPress={handleDeleteAccount}
                activeOpacity={0.75}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" style={{ marginRight: 10 }} />
                <Text style={[styles.actionRowText, { color: '#EF4444' }]}>Deactivate Account</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.actionRow, { borderColor: theme.cardBorder, borderBottomWidth: 0 }]}
              onPress={onSignInRequest}
              activeOpacity={0.75}
            >
              <Ionicons name="log-in-outline" size={18} color="#00A859" style={{ marginRight: 10 }} />
              <Text style={[styles.actionRowText, { color: '#00A859', fontWeight: '700' }]}>Sign In to Account</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={[styles.appVersion, { color: theme.textMuted }]}>
          HavenlyWork for Mobile • Version 2.4.0 (Build 2026.11)
        </Text>
      </ScrollView>

      {showAvatarPicker && (
        <Modal visible={showAvatarPicker} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
              <View style={[styles.modalHeader, { borderBottomColor: theme.cardBorder }]}>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Select Profile Avatar</Text>
                <TouchableOpacity onPress={() => setShowAvatarPicker(false)} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>

              <View style={styles.avatarGrid}>
                {PRESET_AVATARS.map((url, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.avatarGridItem,
                      avatarUrl === url && { borderColor: '#00A859', borderWidth: 3 }
                    ]}
                    onPress={() => {
                      setAvatarUrl(url);
                      setShowAvatarPicker(false);
                    }}
                  >
                    <SafeImage uri={url} style={styles.avatarGridImg} borderRadius={36} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      )}

      {showLogoutModal && (
        <Modal visible={showLogoutModal} animationType="fade" transparent>
          <View style={styles.confirmOverlay}>
            <View style={[styles.confirmCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
              <Ionicons name="log-out-outline" size={32} color="#00A859" style={{ marginBottom: 12 }} />
              <Text style={[styles.confirmTitle, { color: theme.textPrimary }]}>Confirm Sign Out</Text>
              <Text style={[styles.confirmSubtitle, { color: theme.textSecondary }]}>
                Are you sure you want to end your current session? You can sign back in at any time.
              </Text>
              <View style={styles.confirmActions}>
                <TouchableOpacity
                  style={[styles.confirmCancel, { borderColor: theme.cardBorder }]}
                  onPress={() => setShowLogoutModal(false)}
                >
                  <Text style={[styles.confirmCancelText, { color: theme.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmProceed, { backgroundColor: '#00A859' }]}
                  onPress={async () => {
                    setShowLogoutModal(false);
                    await logout();
                  }}
                >
                  <Text style={styles.confirmProceedText}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    padding: spacing.screenPadding,
    paddingBottom: 110,
    gap: spacing.md
  },
  guestCard: {
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1
  },
  guestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  guestTitle: {
    ...typography.title3,
    fontWeight: '700'
  },
  guestSubtitle: {
    ...typography.subtext,
    lineHeight: 18,
    marginBottom: 12
  },
  signInBtn: {
    paddingVertical: 10,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  signInBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13
  },
  heroCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadows.subtle
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatarWrap: {
    position: 'relative'
  },
  avatarImg: {
    width: 72,
    height: 72
  },
  avatarEditPill: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00A859',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  heroInfo: {
    flex: 1,
    marginLeft: spacing.md
  },
  heroName: {
    ...typography.title2
  },
  heroOrg: {
    ...typography.subtext,
    marginTop: 2
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.xs,
    marginTop: 6
  },
  roleBadgeText: {
    ...typography.badge,
    color: '#00A859'
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1
  },
  emailText: {
    fontSize: 12
  },
  sectionCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadows.subtle
  },
  sectionTitle: {
    ...typography.title3,
    marginBottom: spacing.xs
  },
  sectionSubtitle: {
    ...typography.subtext,
    marginBottom: spacing.md
  },
  inputGroup: {
    marginBottom: spacing.sm
  },
  inputLabel: {
    ...typography.caption,
    textTransform: 'uppercase',
    marginBottom: 4,
    fontWeight: '700'
  },
  inputField: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    fontSize: 13
  },
  saveBtn: {
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13
  },
  themeSegment: {
    flexDirection: 'row',
    borderRadius: radii.lg,
    padding: 4,
    gap: 4
  },
  themeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: radii.md
  },
  themeBtnActive: {
    borderWidth: 1,
    ...shadows.subtle
  },
  themeBtnText: {
    fontSize: 11
  },
  navRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.15)'
  },
  navIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  navItemTitle: {
    fontSize: 13,
    fontWeight: '600'
  },
  navItemSub: {
    fontSize: 11,
    marginTop: 1
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  actionRowText: {
    fontSize: 13,
    fontWeight: '600'
  },
  appVersion: {
    textAlign: 'center',
    fontSize: 11,
    marginTop: spacing.xs
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end'
  },
  modalCard: {
    maxHeight: '60%',
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.md
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1
  },
  modalTitle: {
    ...typography.title3
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    justifyContent: 'center'
  },
  avatarGridItem: {
    borderRadius: 40,
    padding: 2
  },
  avatarGridImg: {
    width: 72,
    height: 72
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg
  },
  confirmCard: {
    width: '100%',
    padding: spacing.xl,
    borderRadius: radii.xl,
    borderWidth: 1,
    alignItems: 'center'
  },
  confirmTitle: {
    ...typography.title2,
    marginBottom: 6
  },
  confirmSubtitle: {
    ...typography.subtext,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.lg
  },
  confirmActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%'
  },
  confirmCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  confirmCancelText: {
    fontSize: 13,
    fontWeight: '600'
  },
  confirmProceed: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  confirmProceedText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  }
});
