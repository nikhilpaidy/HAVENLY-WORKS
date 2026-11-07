import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export type TabKey =
  | 'dashboard'
  | 'rooms'
  | 'bookings'
  | 'allowance'
  | 'tickets'
  | 'staff'
  | 'invoices'
  | 'profile';

interface TabBarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ currentTab, onSelectTab }) => {
  const { user, hasPermission } = useAuth();
  const { theme, isDark } = useTheme();
  const role = user?.role;

  let tabs: Array<{ key: TabKey; label: string; icon: any; iconActive: any }> = [];

  if (role === 'SUPER_ADMIN') {
    tabs = [
      { key: 'dashboard', label: 'Platform', icon: 'shield-checkmark-outline', iconActive: 'shield-checkmark' },
      { key: 'rooms', label: 'Hubs', icon: 'business-outline', iconActive: 'business' },
      { key: 'staff', label: 'Staff', icon: 'people-outline', iconActive: 'people' },
      { key: 'invoices', label: 'Billing', icon: 'receipt-outline', iconActive: 'receipt' },
      { key: 'profile', label: 'Admin', icon: 'person-outline', iconActive: 'person' }
    ];
  } else if (role === 'SUPER_ADMIN_STAFF') {
    tabs = [
      { key: 'dashboard', label: 'Platform', icon: 'shield-checkmark-outline', iconActive: 'shield-checkmark' },
      ...(hasPermission('view_spaces')
        ? [{ key: 'rooms' as TabKey, label: 'Hubs', icon: 'business-outline', iconActive: 'business' }]
        : []),
      { key: 'profile', label: 'Profile', icon: 'person-outline', iconActive: 'person' }
    ];
  } else if (role === 'COWORKING_ADMIN') {
    tabs = [
      { key: 'dashboard', label: 'Hub Ops', icon: 'grid-outline', iconActive: 'grid' },
      { key: 'rooms', label: 'Rooms', icon: 'business-outline', iconActive: 'business' },
      { key: 'bookings', label: 'Bookings', icon: 'calendar-outline', iconActive: 'calendar' },
      { key: 'tickets', label: 'Helpdesk', icon: 'help-buoy-outline', iconActive: 'help-buoy' },
      { key: 'staff', label: 'Staff', icon: 'people-outline', iconActive: 'people' },
      { key: 'profile', label: 'Profile', icon: 'person-outline', iconActive: 'person' }
    ];
  } else if (role === 'COWORKING_ADMIN_STAFF') {
    tabs = [
      { key: 'dashboard', label: 'Hub Ops', icon: 'grid-outline', iconActive: 'grid' },
      ...(hasPermission('manage_rooms')
        ? [{ key: 'rooms' as TabKey, label: 'Rooms', icon: 'business-outline', iconActive: 'business' }]
        : []),
      ...(hasPermission('manage_bookings')
        ? [{ key: 'bookings' as TabKey, label: 'Bookings', icon: 'calendar-outline', iconActive: 'calendar' }]
        : []),
      ...(hasPermission('manage_tickets')
        ? [{ key: 'tickets' as TabKey, label: 'Helpdesk', icon: 'help-buoy-outline', iconActive: 'help-buoy' }]
        : []),
      { key: 'profile', label: 'Profile', icon: 'person-outline', iconActive: 'person' }
    ];
  } else if (role === 'COMPANY_OWNER') {
    tabs = [
      { key: 'dashboard', label: 'Explore', icon: 'compass-outline', iconActive: 'compass' },
      { key: 'rooms', label: 'Rooms', icon: 'business-outline', iconActive: 'business' },
      { key: 'bookings', label: 'Bookings', icon: 'calendar-outline', iconActive: 'calendar' },
      { key: 'allowance', label: 'Quota', icon: 'pie-chart-outline', iconActive: 'pie-chart' },
      { key: 'tickets', label: 'Helpdesk', icon: 'help-buoy-outline', iconActive: 'help-buoy' },
      { key: 'staff', label: 'Staff', icon: 'people-outline', iconActive: 'people' },
      { key: 'profile', label: 'Profile', icon: 'person-outline', iconActive: 'person' }
    ];
  } else {
    // Guest or Employee
    tabs = [
      { key: 'dashboard', label: 'Explore', icon: 'compass-outline', iconActive: 'compass' },
      { key: 'rooms', label: 'Workspaces', icon: 'business-outline', iconActive: 'business' },
      { key: 'bookings', label: 'Bookings', icon: 'calendar-outline', iconActive: 'calendar' },
      { key: 'profile', label: 'Account', icon: 'person-outline', iconActive: 'person' }
    ];
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#0A0F1D' : '#FFFFFF',
          borderTopColor: theme.cardBorder
        }
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollRow}
      >
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onSelectTab(tab.key)}
              style={[
                styles.tabButton,
                isActive && styles.tabButtonActive
              ]}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isActive ? tab.iconActive : tab.icon}
                size={20}
                color={isActive ? '#FFFFFF' : theme.textMuted}
              />
              <Text
                style={[
                  styles.label,
                  { color: isActive ? '#FFFFFF' : theme.textMuted },
                  isActive && styles.labelActive
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 14
  },
  scrollRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    minWidth: '100%',
    paddingHorizontal: 8
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16
  },
  tabButtonActive: {
    backgroundColor: '#00A859'
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2
  },
  labelActive: {
    fontWeight: '800'
  }
});
