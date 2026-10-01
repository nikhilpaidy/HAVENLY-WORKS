import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  title: string;
  subtitle?: string;
  unreadCount?: number;
  unreadNotifsCount?: number;
  onPressNotifications?: () => void;
  onOpenNotifications?: () => void;
  showBack?: boolean;
  onPressBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  unreadCount,
  unreadNotifsCount,
  onPressNotifications,
  onOpenNotifications,
  showBack,
  onPressBack
}) => {
  const { theme } = useTheme();
  const effectiveCount = unreadNotifsCount ?? unreadCount ?? 0;
  const handleNotifPress = onOpenNotifications || onPressNotifications;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          borderBottomColor: theme.cardBorder
        }
      ]}
    >
      <View style={styles.leftRow}>
        {showBack && (
          <TouchableOpacity onPress={onPressBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={theme.textPrimary} />
          </TouchableOpacity>
        )}
        <View>
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.gold }]}>
              {subtitle.toUpperCase()}
            </Text>
          )}
          <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
        </View>
      </View>

      {handleNotifPress && (
        <TouchableOpacity
          onPress={handleNotifPress}
          style={[
            styles.notifButton,
            {
              backgroundColor: theme.card,
              borderColor: theme.cardBorder
            }
          ]}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={20} color={theme.gold} />
          {effectiveCount > 0 && (
            <View style={[styles.badge, { backgroundColor: theme.danger }]}>
              <Text style={styles.badgeText}>
                {effectiveCount > 9 ? '9+' : effectiveCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  backButton: {
    marginRight: 12,
    padding: 4
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 2
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  notifButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800'
  }
});
