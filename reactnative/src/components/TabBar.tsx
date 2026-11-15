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
import { radii, shadows } from '../theme/tokens';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type TabKey =
  | 'rooms'
  | 'bookings'
  | 'saved'
  | 'allowance'
  | 'profile'
  | 'tickets'
  | 'staff'
  | 'invoices';

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
  { key: 'rooms', label: 'Workspaces', iconOutline: 'business-outline', iconFilled: 'business' },
  { key: 'bookings', label: 'Bookings', iconOutline: 'calendar-outline', iconFilled: 'calendar' },
  { key: 'saved', label: 'Saved', iconOutline: 'bookmark-outline', iconFilled: 'bookmark' },
  { key: 'allowance', label: 'Quota', iconOutline: 'pie-chart-outline', iconFilled: 'pie-chart' },
  { key: 'profile', label: 'Settings', iconOutline: 'person-outline', iconFilled: 'person' }
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
            backgroundColor: isDark ? '#121722' : '#FFFFFF',
            borderColor: isDark ? '#1E293B' : '#E2E8F0'
          }
        ]}
      >
        {NAV_TABS.map((tab) => {
          const isActive = currentTab === tab.key;
          const iconColor = isActive
            ? '#00A859'
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
                    backgroundColor: isDark ? 'rgba(0, 168, 89, 0.15)' : '#ECFDF5'
                  }
                ]
              ]}
              activeOpacity={0.75}
            >
              <Ionicons
                name={isActive ? tab.iconFilled : tab.iconOutline}
                size={18}
                color={iconColor}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? '#00A859' : (isDark ? '#94A3B8' : '#64748B'),
                    fontWeight: isActive ? '700' : '500'
                  }
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
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
    zIndex: 99
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    width: '94%',
    maxWidth: 420,
    ...shadows.elevated
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: radii.full
  },
  tabItemActive: {
    transform: [{ scale: 1.02 }]
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2
  }
});
