import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  LayoutAnimation,
  UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
  { key: 'dashboard', label: 'Home', iconOutline: 'home-outline', iconFilled: 'home' },
  { key: 'rooms', label: 'Workspaces', iconOutline: 'grid-outline', iconFilled: 'grid' },
  { key: 'bookings', label: 'Bookings', iconOutline: 'bag-handle-outline', iconFilled: 'bag-handle' },
  { key: 'allowance', label: 'Quota', iconOutline: 'bookmark-outline', iconFilled: 'bookmark' },
  { key: 'profile', label: 'Profile', iconOutline: 'person-outline', iconFilled: 'person' }
];

export const TabBar: React.FC<TabBarProps> = ({ currentTab, onSelectTab }) => {
  const { isDark } = useTheme();

  const handlePress = (tabKey: TabKey) => {
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch {}
    onSelectTab(tabKey);
  };

  return (
    <View style={styles.floatingWrapper} pointerEvents="box-none">
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark ? '#18181B' : '#FFFFFF',
            borderColor: isDark ? '#27272A' : '#E2E8F0'
          }
        ]}
      >
        {NAV_TABS.map((tab) => {
          const isActive = currentTab === tab.key;
          const iconColor = isActive
            ? (isDark ? '#34D399' : '#0F172A')
            : (isDark ? '#94A3B8' : '#64748B');

          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => handlePress(tab.key)}
              style={[
                styles.tabItem,
                isActive && [
                  styles.tabItemActive,
                  {
                    backgroundColor: isDark ? '#27272A' : '#EEF2F6'
                  }
                ]
              ]}
              activeOpacity={0.75}
            >
              <Ionicons
                name={isActive ? tab.iconFilled : tab.iconOutline}
                size={isActive ? 19 : 21}
                color={iconColor}
              />
              {isActive && (
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isDark ? '#FFFFFF' : '#0F172A'
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
    paddingHorizontal: 16
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 400,
    height: 62,
    borderRadius: 36,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 24
  },
  tabItemActive: {
    paddingHorizontal: 16,
    paddingVertical: 9
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6
  }
});