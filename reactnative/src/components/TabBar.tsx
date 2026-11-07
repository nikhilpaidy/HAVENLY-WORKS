import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

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

interface NavTabItem {
  key: TabKey;
  label: string;
  iconOutline: keyof typeof Ionicons.glyphMap;
  iconFilled: keyof typeof Ionicons.glyphMap;
}

const NAV_TABS: NavTabItem[] = [
  { key: 'dashboard', label: 'Explore', iconOutline: 'home-outline', iconFilled: 'home' },
  { key: 'rooms', label: 'Workspaces', iconOutline: 'grid-outline', iconFilled: 'grid' },
  { key: 'bookings', label: 'Bookings', iconOutline: 'bookmark-outline', iconFilled: 'bookmark' },
  { key: 'allowance', label: 'Quota', iconOutline: 'pie-chart-outline', iconFilled: 'pie-chart' }
];

export const TabBar: React.FC<TabBarProps> = ({ currentTab, onSelectTab }) => {
  const { isDark } = useTheme();

  return (
    <View style={styles.floatingWrapper} pointerEvents="box-none">
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark ? '#111827' : '#FFFFFF',
            borderColor: isDark ? '#1F2937' : '#F1F5F9'
          }
        ]}
      >
        {NAV_TABS.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onSelectTab(tab.key)}
              style={[
                styles.tabItem,
                isActive && [
                  styles.tabItemActive,
                  {
                    backgroundColor: isDark ? 'rgba(0, 168, 89, 0.22)' : '#E8F5E9'
                  }
                ]
              ]}
              activeOpacity={0.75}
            >
              <Ionicons
                name={isActive ? tab.iconFilled : tab.iconOutline}
                size={20}
                color={isActive ? '#00A859' : (isDark ? '#6B7280' : '#94A3B8')}
              />
              {isActive && (
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isDark ? '#34D399' : '#00A859'
                    }
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 380,
    height: 60,
    borderRadius: 30,
    paddingHorizontal: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 22
  },
  tabItemActive: {
    paddingHorizontal: 16,
    paddingVertical: 9
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 7
  }
});
