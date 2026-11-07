import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { SafeImage } from './SafeImage';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  unreadCount?: number;
  unreadNotifsCount?: number;
  onPressNotifications?: () => void;
  onOpenNotifications?: () => void;
  showBack?: boolean;
  onPressBack?: () => void;
  onOpenDrawer?: () => void;
  locationName?: string;
  onPressLocation?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  unreadCount,
  unreadNotifsCount,
  onPressNotifications,
  onOpenNotifications,
  showBack,
  onPressBack,
  onOpenDrawer,
  locationName,
  onPressLocation
}) => {
  const { theme, isDark } = useTheme();
  const { user, isGuest } = useAuth();

  const effectiveCount = unreadNotifsCount ?? unreadCount ?? 0;
  const handleNotifPress = onOpenNotifications || onPressNotifications;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#0A0F1D' : '#FFFFFF',
          borderBottomColor: isDark ? '#1E293B' : '#F1F5F9'
        }
      ]}
    >
      <View style={styles.leftRow}>
        {showBack && (
          <TouchableOpacity onPress={onPressBack} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={theme.textPrimary} />
          </TouchableOpacity>
        )}

        {onOpenDrawer && (
          <TouchableOpacity onPress={onOpenDrawer} style={styles.avatarBorder} activeOpacity={0.8}>
            <SafeImage
              uri={
                (user as any)?.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80'
              }
              style={styles.avatarImage}
              borderRadius={17}
            />
            <View style={styles.menuBadge}>
              <Ionicons name="menu" size={9} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}

        {locationName && onPressLocation ? (
          <TouchableOpacity onPress={onPressLocation} style={[styles.locationPill, { backgroundColor: isDark ? '#162032' : '#F1F5F9' }]} activeOpacity={0.8}>
            <Ionicons name="location-sharp" size={13} color="#00A859" style={{ marginRight: 3 }} />
            <Text style={[styles.locationText, { color: theme.textPrimary }]} numberOfLines={1}>
              {locationName}
            </Text>
            <Ionicons name="chevron-down" size={13} color={theme.textMuted} style={{ marginLeft: 3 }} />
          </TouchableOpacity>
        ) : (
          <View style={styles.titleWrap}>
            {subtitle && (
              <Text style={styles.subtitle}>
                {subtitle.toUpperCase()}
              </Text>
            )}
            {title && (
              <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>
                {title}
              </Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.rightRow}>
        {handleNotifPress && (
          <TouchableOpacity
            onPress={handleNotifPress}
            style={[
              styles.notifButton,
              {
                backgroundColor: isDark ? '#162032' : '#F8FAFC',
                borderColor: isDark ? '#1F2937' : '#E2E8F0'
              }
            ]}
            activeOpacity={0.75}
          >
            <Ionicons name="notifications-outline" size={19} color={theme.textPrimary} />
            {effectiveCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {effectiveCount > 9 ? '9+' : effectiveCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  backButton: {
    marginRight: 10,
    padding: 6
  },
  avatarBorder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: '#00A859',
    padding: 1,
    marginRight: 10,
    position: 'relative'
  },
  avatarImage: {
    width: 32,
    height: 32
  },
  menuBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00A859',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF'
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16
  },
  locationText: {
    fontSize: 12,
    fontWeight: '700'
  },
  titleWrap: {
    justifyContent: 'center'
  },
  subtitle: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#00A859',
    marginBottom: 2
  },
  title: {
    fontSize: 18,
    fontWeight: '800'
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  notifButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative'
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800'
  }
});
