import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
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
  icon: any;
  iconActive: any;
}

const NAV_TABS: NavTabItem[] = [
  { key: 'dashboard', label: 'Explore', icon: 'compass-outline', iconActive: 'compass' },
  { key: 'rooms', label: 'Rooms', icon: 'business-outline', iconActive: 'business' },
  { key: 'bookings', label: 'Bookings', icon: 'calendar-outline', iconActive: 'calendar' },
  { key: 'allowance', label: 'Quota', icon: 'pie-chart-outline', iconActive: 'pie-chart' }
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BAR_HORIZONTAL_PADDING = 16;
const AVAILABLE_WIDTH = SCREEN_WIDTH - BAR_HORIZONTAL_PADDING * 2;
const TAB_WIDTH = AVAILABLE_WIDTH / NAV_TABS.length;

export const TabBar: React.FC<TabBarProps> = ({ currentTab, onSelectTab }) => {
  const { theme, isDark } = useTheme();

  const activeIndex = NAV_TABS.findIndex((t) => t.key === currentTab);
  const safeIndex = activeIndex >= 0 ? activeIndex : 0;

  const slideAnim = useRef(new Animated.Value(safeIndex * TAB_WIDTH)).current;
  const scaleAnims = useRef(NAV_TABS.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: safeIndex * TAB_WIDTH,
      useNativeDriver: true,
      friction: 7,
      tension: 65
    }).start();
  }, [safeIndex]);

  const handleTabPress = (tab: NavTabItem, index: number) => {
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.88,
        duration: 80,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true
      })
    ]).start();

    onSelectTab(tab.key);
  };

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: isDark ? '#0A0F1D' : '#FFFFFF',
          borderTopColor: isDark ? '#1E293B' : '#E2E8F0'
        }
      ]}
    >
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.activePillIndicator,
            {
              width: TAB_WIDTH - 8,
              transform: [{ translateX: slideAnim }]
            }
          ]}
        />

        {NAV_TABS.map((tab, idx) => {
          const isActive = currentTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => handleTabPress(tab, idx)}
              style={styles.tabItem}
              activeOpacity={0.8}
            >
              <Animated.View
                style={[
                  styles.tabInner,
                  { transform: [{ scale: scaleAnims[idx] }] }
                ]}
              >
                <Ionicons
                  name={isActive ? tab.iconActive : tab.icon}
                  size={20}
                  color={isActive ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B')}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isActive
                        ? '#FFFFFF'
                        : isDark
                        ? '#94A3B8'
                        : '#64748B',
                      fontWeight: isActive ? '700' : '500'
                    }
                  ]}
                >
                  {tab.label}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: BAR_HORIZONTAL_PADDING
  },
  container: {
    flexDirection: 'row',
    position: 'relative',
    alignItems: 'center',
    height: 52
  },
  activePillIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00A859',
    shadowColor: '#00A859',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5
  },
  tabItem: {
    width: TAB_WIDTH,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 3
  }
});
