import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme, ThemeMode } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { ModalPopup } from '../components/ModalPopup';
import { Ionicons } from '@expo/vector-icons';

interface ProfileScreenProps {
  onOpenNotifications: () => void;
  unreadNotifsCount: number;
  onNavigateToStaff?: () => void;
  onNavigateToTickets?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onOpenNotifications,
  unreadNotifsCount,
  onNavigateToStaff,
  onNavigateToTickets
}) => {
  const { user, logout } = useAuth();
  const { theme, themeMode, setThemeMode, isDark } = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'SUPER_ADMIN_STAFF';
  const isCoworkingAdmin = user?.role === 'COWORKING_ADMIN' || user?.role === 'COWORKING_ADMIN_STAFF';
  const isClient = !isSuperAdmin && !isCoworkingAdmin;

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const getCompanyDisplayName = () => {
    if (user?.company?.name) return user.company.name;
    if (user?.organization?.name) return user.organization.name;
    if (isSuperAdmin) return 'Hubbly Platform Infrastructure';
    if (isCoworkingAdmin) return 'CWS ONE Coworking Space';
    return 'Aptapace Private Limited';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Executive Account"
        subtitle="Identity & Enterprise Preferences"
        unreadNotifsCount={unreadNotifsCount}
        onOpenNotifications={onOpenNotifications}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* IDENTITY CARD */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.avatarRow}>
            <View style={[styles.avatar, { backgroundColor: `${theme.gold}20`, borderColor: theme.gold }]}>
              <Ionicons name="person" size={26} color={theme.gold} />
            </View>
            <View style={styles.avatarMeta}>
              <Text style={[styles.userName, { color: theme.textPrimary }]}>
                {user?.name || 'Authorized Member'}
              </Text>
              <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
                {user?.email || 'user@nikvora.com'}
              </Text>
              {user?.designation ? (
                <Text style={[styles.userDesignation, { color: theme.gold }]}>
                  {user.designation}
                </Text>
              ) : null}
              <View style={[styles.rolePill, { backgroundColor: `${theme.gold}15`, borderColor: theme.gold }]}>
                <Text style={[styles.roleText, { color: theme.gold }]}>
                  {user?.role ? user.role.replace(/_/g, ' ') : 'ENTERPRISE MEMBER'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* THEME & APPEARANCE PREFERENCES */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.cardSectionTitle, { color: theme.textSecondary }]}>
            Appearance & System Theme
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
                      backgroundColor: isSelected ? theme.gold : theme.surface,
                      borderColor: isSelected ? theme.gold : theme.cardBorder
                    }
                  ]}
                  onPress={() => setThemeMode(mode)}
                >
                  <Ionicons
                    name={iconName}
                    size={18}
                    color={isSelected ? '#050814' : theme.textSecondary}
                    style={{ marginBottom: 4 }}
                  />
                  <Text
                    style={[
                      styles.themeButtonText,
                      { color: isSelected ? '#050814' : theme.textPrimary }
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ENTERPRISE MEMBERSHIP DETAILS */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.cardSectionTitle, { color: theme.textSecondary }]}>
            Enterprise Governance
          </Text>

          <View style={[styles.specRow, { borderBottomColor: theme.cardBorder }]}>
            <View style={styles.specLeft}>
              <Ionicons name="business-outline" size={16} color={theme.gold} />
              <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Organization / Company</Text>
            </View>
            <Text style={[styles.specValue, { color: theme.textPrimary }]}>
              {getCompanyDisplayName()}
            </Text>
          </View>

          {isClient && (
            <>
              <View style={[styles.specRow, { borderBottomColor: theme.cardBorder }]}>
                <View style={styles.specLeft}>
                  <Ionicons name="pie-chart-outline" size={16} color={theme.gold} />
                  <Text style={[styles.specLabel, { color: theme.textSecondary }]}>
                    Complimentary Quota
                  </Text>
                </View>
                <Text style={[styles.specValue, { color: theme.textPrimary }]}>
                  {user?.company?.allowanceConfig?.monthlyFreeHours || 20} hrs / month
                </Text>
              </View>

              <View style={[styles.specRow, { borderBottomColor: theme.cardBorder }]}>
                <View style={styles.specLeft}>
                  <Ionicons name="cash-outline" size={16} color={theme.gold} />
                  <Text style={[styles.specLabel, { color: theme.textSecondary }]}>
                    Overdraft Rate
                  </Text>
                </View>
                <Text style={[styles.specValue, { color: theme.textPrimary }]}>
                  ₹{user?.company?.allowanceConfig?.additionalHourlyRate || 800}/hr
                </Text>
              </View>

              <View style={[styles.specRow, { borderBottomColor: theme.cardBorder }]}>
                <View style={styles.specLeft}>
                  <Ionicons name="document-text-outline" size={16} color={theme.gold} />
                  <Text style={[styles.specLabel, { color: theme.textSecondary }]}>GSTIN Compliance</Text>
                </View>
                <Text style={[styles.specValue, { color: theme.textPrimary }]}>
                  {user?.company?.gstin || '29ABCDE1234F1Z5'}
                </Text>
              </View>
            </>
          )}

          <View style={styles.specRow}>
            <View style={styles.specLeft}>
              <Ionicons name="navigate-outline" size={16} color={theme.gold} />
              <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Campus Hub</Text>
            </View>
            <Text style={[styles.specValue, { color: theme.textPrimary }]}>
              {user?.organization?.name || 'CWS ONE Horizon, MG Road'}
            </Text>
          </View>
        </View>

        {/* QUICK SHORTCUTS */}
        {(onNavigateToStaff || onNavigateToTickets) && (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.cardSectionTitle, { color: theme.textSecondary }]}>
              Direct Management
            </Text>

            {onNavigateToStaff && (
              <TouchableOpacity
                style={[styles.menuRow, { borderBottomColor: theme.cardBorder }]}
                onPress={onNavigateToStaff}
              >
                <View style={styles.specLeft}>
                  <Ionicons name="people-outline" size={18} color={theme.gold} />
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
                  <Ionicons name="help-buoy-outline" size={18} color={theme.gold} />
                  <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>
                    Facilities Helpdesk & Tickets
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        )}

        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.logoutButton, { backgroundColor: `${theme.danger}12`, borderColor: theme.danger }]}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={18} color={theme.danger} />
          <Text style={[styles.logoutText, { color: theme.danger }]}>Sign Out of Device</Text>
        </TouchableOpacity>
      </ScrollView>

      <ModalPopup
        visible={showLogoutModal}
        title="Sign Out"
        message="Are you sure you want to end your active session on this device?"
        variant="warning"
        icon="log-out-outline"
        onClose={() => setShowLogoutModal(false)}
        buttons={[
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setShowLogoutModal(false)
          },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: async () => {
              setShowLogoutModal(false);
              await logout();
            }
          }
        ]}
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
    paddingBottom: 100
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14
  },
  avatarMeta: {
    flex: 1
  },
  userName: {
    fontSize: 16,
    fontWeight: '800'
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2
  },
  userDesignation: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2
  },
  rolePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 6
  },
  roleText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  cardSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12
  },
  themeSelectorRow: {
    flexDirection: 'row',
    gap: 10
  },
  themeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  themeButtonText: {
    fontSize: 12,
    fontWeight: '700'
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1
  },
  specLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  specLabel: {
    fontSize: 13
  },
  specValue: {
    fontSize: 13,
    fontWeight: '700'
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  menuLabel: {
    fontSize: 13,
    fontWeight: '600'
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginTop: 8
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700'
  }
});
