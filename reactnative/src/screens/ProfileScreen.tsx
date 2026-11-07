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
import { ModalPopup } from '../components/ModalPopup';
import { SafeImage } from '../components/SafeImage';
import { Ionicons } from '@expo/vector-icons';
import { mobileApi } from '../services/api';

interface ProfileScreenProps {
  onOpenNotifications: () => void;
  unreadNotifsCount: number;
  onNavigateToStaff?: () => void;
  onNavigateToTickets?: () => void;
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
  onNavigateToTickets
}) => {
  const { user, logout, refreshProfile } = useAuth();
  const { theme, themeMode, setThemeMode } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [designation, setDesignation] = useState(user?.designation || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || PRESET_AVATARS[0]);

  const [saving, setSaving] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [customAvatarInput, setCustomAvatarInput] = useState('');
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

  const isRestrictedStaff =
    user?.role === 'COMPANY_STAFF' ||
    user?.role === 'COWORKING_ADMIN_STAFF';

  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'SUPER_ADMIN_STAFF';
  const isCoworkingAdmin = user?.role === 'COWORKING_ADMIN' || user?.role === 'COWORKING_ADMIN_STAFF';
  const isClient = !isSuperAdmin && !isCoworkingAdmin;

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      if (isRestrictedStaff) {
        await mobileApi.updateProfile({ avatarUrl });
      } else {
        if (!name.trim()) {
          Alert.alert('Required', 'Please enter your full name');
          return;
        }
        await mobileApi.updateProfile({
          name: name.trim(),
          phone: phone.trim(),
          designation: designation.trim(),
          avatarUrl
        });
      }
      await refreshProfile();
      Alert.alert('Success', 'Profile has been updated successfully.');
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
        return 'Company Owner (Client)';
      case 'COMPANY_STAFF':
        return 'Company Staff';
      default:
        return user.role.replace(/_/g, ' ');
    }
  };

  const getCompanyDisplayName = () => {
    if (user?.company?.name) return user.company.name;
    if (user?.organization?.name) return user.organization.name;
    if (isSuperAdmin) return 'HavenlyWork Global Platform';
    if (isCoworkingAdmin) return 'HavenlyWork Madhapur Hub';
    return 'Aptapace Technologies';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Executive Account"
        subtitle="Identity & Role Governance"
        unreadNotifsCount={unreadNotifsCount}
        onOpenNotifications={onOpenNotifications}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarBorder}>
              <SafeImage
                uri={avatarUrl}
                style={styles.avatarImage}
                borderRadius={40}
              />
              <TouchableOpacity
                style={styles.avatarEditBadge}
                onPress={() => setShowAvatarPicker(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.avatarMeta}>
              <Text style={[styles.profileTitle, { color: theme.textPrimary }]}>
                {user?.name || 'Member Account'}
              </Text>
              <Text style={[styles.profileEmail, { color: theme.textMuted }]}>
                {user?.email || 'user@havenlywork.com'}
              </Text>
              <View style={styles.roleBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#00A859" style={{ marginRight: 4 }} />
                <Text style={styles.roleBadgeText}>{getRoleDisplayName()}</Text>
              </View>
            </View>
          </View>

          {isRestrictedStaff && (
            <View style={styles.restrictedNotice}>
              <Ionicons name="lock-closed" size={16} color="#0284C7" style={{ marginRight: 8 }} />
              <Text style={styles.restrictedText}>
                Enterprise Staff: Details are managed by your administrator. You can update your profile photo freely.
              </Text>
            </View>
          )}

          <View style={styles.formContainer}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Full Name</Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isRestrictedStaff ? theme.background : theme.inputBg,
                  borderColor: theme.inputBorder
                }
              ]}
            >
              <TextInput
                style={[styles.textInput, { color: theme.textPrimary }]}
                value={name}
                onChangeText={setName}
                editable={!isRestrictedStaff}
                placeholder="Your full name"
                placeholderTextColor={theme.textMuted}
              />
              {isRestrictedStaff && <Ionicons name="lock-closed-outline" size={16} color={theme.textMuted} />}
            </View>

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Phone Number</Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isRestrictedStaff ? theme.background : theme.inputBg,
                  borderColor: theme.inputBorder
                }
              ]}
            >
              <TextInput
                style={[styles.textInput, { color: theme.textPrimary }]}
                value={phone}
                onChangeText={setPhone}
                editable={!isRestrictedStaff}
                placeholder="+91 98490 00000"
                placeholderTextColor={theme.textMuted}
                keyboardType="phone-pad"
              />
              {isRestrictedStaff && <Ionicons name="lock-closed-outline" size={16} color={theme.textMuted} />}
            </View>

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Designation / Department</Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isRestrictedStaff ? theme.background : theme.inputBg,
                  borderColor: theme.inputBorder
                }
              ]}
            >
              <TextInput
                style={[styles.textInput, { color: theme.textPrimary }]}
                value={designation}
                onChangeText={setDesignation}
                editable={!isRestrictedStaff}
                placeholder="Product Operations"
                placeholderTextColor={theme.textMuted}
              />
              {isRestrictedStaff && <Ionicons name="lock-closed-outline" size={16} color={theme.textMuted} />}
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              onPress={handleSaveProfile}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.saveBtnText}>
                    {isRestrictedStaff ? 'Update Profile Photo' : 'Save Changes'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.cardSectionTitle, { color: theme.textSecondary }]}>
            Enterprise Governance
          </Text>

          <View style={[styles.specRow, { borderBottomColor: theme.cardBorder }]}>
            <View style={styles.specLeft}>
              <Ionicons name="business-outline" size={16} color="#00A859" />
              <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Organization</Text>
            </View>
            <Text style={[styles.specValue, { color: theme.textPrimary }]}>
              {getCompanyDisplayName()}
            </Text>
          </View>

          {isClient && (
            <>
              <View style={[styles.specRow, { borderBottomColor: theme.cardBorder }]}>
                <View style={styles.specLeft}>
                  <Ionicons name="pie-chart-outline" size={16} color="#00A859" />
                  <Text style={[styles.specLabel, { color: theme.textSecondary }]}>
                    Complimentary Quota
                  </Text>
                </View>
                <Text style={[styles.specValue, { color: theme.textPrimary }]}>
                  {user?.company?.allowanceConfig?.annualFreeHours || 240} hrs / year
                </Text>
              </View>

              <View style={[styles.specRow, { borderBottomColor: theme.cardBorder }]}>
                <View style={styles.specLeft}>
                  <Ionicons name="document-text-outline" size={16} color="#00A859" />
                  <Text style={[styles.specLabel, { color: theme.textSecondary }]}>GSTIN</Text>
                </View>
                <Text style={[styles.specValue, { color: theme.textPrimary }]}>
                  {user?.company?.gstin || '36AABCU9603R1ZM'}
                </Text>
              </View>
            </>
          )}

          <View style={styles.specRow}>
            <View style={styles.specLeft}>
              <Ionicons name="navigate-outline" size={16} color="#00A859" />
              <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Campus Hub</Text>
            </View>
            <Text style={[styles.specValue, { color: theme.textPrimary }]}>
              Madhapur Apex Hub, Hyderabad
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.cardSectionTitle, { color: theme.textSecondary }]}>
            Theme & Display
          </Text>

          <View style={styles.themeSelectorRow}>
            {(['dark', 'light', 'system'] as ThemeMode[]).map((mode) => {
              const isSelected = themeMode === mode;
              const iconName =
                mode === 'dark' ? 'moon-outline' : mode === 'light' ? 'sunny-outline' : 'phone-portrait-outline';
              const label = mode === 'dark' ? 'Dark' : mode === 'light' ? 'Light' : 'System';

              return (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.themeButton,
                    {
                      backgroundColor: isSelected ? '#00A859' : theme.inputBg,
                      borderColor: isSelected ? '#00A859' : theme.cardBorder
                    }
                  ]}
                  onPress={() => setThemeMode(mode)}
                >
                  <Ionicons
                    name={iconName}
                    size={18}
                    color={isSelected ? '#FFFFFF' : theme.textSecondary}
                    style={{ marginBottom: 4 }}
                  />
                  <Text
                    style={[
                      styles.themeButtonText,
                      { color: isSelected ? '#FFFFFF' : theme.textPrimary }
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {(onNavigateToStaff || onNavigateToTickets) && (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.cardSectionTitle, { color: theme.textSecondary }]}>
              Workspace Shortcuts
            </Text>

            {onNavigateToStaff && (
              <TouchableOpacity
                style={[styles.menuRow, { borderBottomColor: theme.cardBorder }]}
                onPress={onNavigateToStaff}
              >
                <View style={styles.specLeft}>
                  <Ionicons name="people-outline" size={18} color="#00A859" />
                  <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>
                    Staff & Granular Permissions
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            )}

            {onNavigateToTickets && (
              <TouchableOpacity style={styles.menuRow} onPress={onNavigateToTickets}>
                <View style={styles.specLeft}>
                  <Ionicons name="chatbubbles-outline" size={18} color="#00A859" />
                  <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>
                    Facilities Helpdesk & Chat
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setShowLogoutModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#DC2626" style={{ marginRight: 8 }} />
          <Text style={styles.logoutButtonText}>Sign Out of HavenlyWork</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showAvatarPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAvatarPicker(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.avatarModalBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.avatarModalHeader}>
              <Text style={[styles.avatarModalTitle, { color: theme.textPrimary }]}>
                Choose Profile Photo
              </Text>
              <TouchableOpacity onPress={() => setShowAvatarPicker(false)}>
                <Ionicons name="close" size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.avatarModalSubtitle, { color: theme.textSecondary }]}>
              Select a preset avatar or paste an image URL:
            </Text>

            <View style={styles.presetGrid}>
              {PRESET_AVATARS.map((url, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    setAvatarUrl(url);
                    setShowAvatarPicker(false);
                  }}
                  style={[
                    styles.presetItem,
                    avatarUrl === url && { borderColor: '#00A859', borderWidth: 3 }
                  ]}
                >
                  <SafeImage uri={url} style={styles.presetImage} borderRadius={26} />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.customUrlLabel, { color: theme.textSecondary }]}>Or Custom Image URL</Text>
            <View style={[styles.customUrlWrapper, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
              <TextInput
                style={[styles.customUrlInput, { color: theme.textPrimary }]}
                placeholder="https://..."
                placeholderTextColor={theme.textMuted}
                value={customAvatarInput}
                onChangeText={setCustomAvatarInput}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.applyUrlBtn}
                onPress={() => {
                  if (customAvatarInput.trim().startsWith('http')) {
                    setAvatarUrl(customAvatarInput.trim());
                    setShowAvatarPicker(false);
                    setCustomAvatarInput('');
                  } else {
                    Alert.alert('Invalid URL', 'Please enter a valid HTTP/HTTPS image URL');
                  }
                }}
              >
                <Text style={styles.applyUrlBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ModalPopup
        visible={showLogoutModal}
        variant="warning"
        title="Sign Out"
        message="Are you sure you want to log out of HavenlyWork?"
        confirmText="Sign Out"
        cancelText="Cancel"
        onConfirm={async () => {
          setShowLogoutModal(false);
          await logout();
        }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  avatarBorder: {
    position: 'relative',
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: '#00A859',
    padding: 2,
    marginRight: 16
  },
  avatarImage: {
    width: 76,
    height: 76
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#00A859',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarMeta: {
    flex: 1
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2
  },
  profileEmail: {
    fontSize: 12,
    marginBottom: 6
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00A859'
  },
  restrictedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 10,
    borderRadius: 12,
    marginBottom: 14
  },
  restrictedText: {
    flex: 1,
    fontSize: 11,
    color: '#0369A1',
    lineHeight: 16
  },
  formContainer: {
    marginTop: 4
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12
  },
  textInput: {
    flex: 1,
    fontSize: 14
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00A859',
    height: 46,
    borderRadius: 14,
    marginTop: 18
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  cardSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 14
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1
  },
  specLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  specLabel: {
    fontSize: 13,
    marginLeft: 8
  },
  specValue: {
    fontSize: 13,
    fontWeight: '600'
  },
  themeSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10
  },
  themeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1
  },
  themeButtonText: {
    fontSize: 12,
    fontWeight: '600'
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  menuLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 10
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
    marginTop: 8
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626'
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  avatarModalBox: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 18
  },
  avatarModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  avatarModalTitle: {
    fontSize: 16,
    fontWeight: '700'
  },
  avatarModalSubtitle: {
    fontSize: 12,
    marginBottom: 16
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 16
  },
  presetItem: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden'
  },
  presetImage: {
    width: 52,
    height: 52
  },
  customUrlLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6
  },
  customUrlWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingLeft: 10,
    height: 42
  },
  customUrlInput: {
    flex: 1,
    fontSize: 13
  },
  applyUrlBtn: {
    backgroundColor: '#00A859',
    height: '100%',
    paddingHorizontal: 16,
    borderTopRightRadius: 11,
    borderBottomRightRadius: 11,
    justifyContent: 'center'
  },
  applyUrlBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12
  }
});
