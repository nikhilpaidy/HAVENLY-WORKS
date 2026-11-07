import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonBox: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style
}) => {
  const { isDark } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true
        })
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  const baseBg = isDark ? '#1E293B' : '#E2E8F0';

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: baseBg,
          opacity
        },
        style
      ]}
    />
  );
};

export const WorkspaceCardSkeleton: React.FC = () => {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <SkeletonBox width="100%" height={160} borderRadius={16} />
      <View style={{ padding: 14 }}>
        <SkeletonBox width="60%" height={18} style={{ marginBottom: 8 }} />
        <SkeletonBox width="85%" height={14} style={{ marginBottom: 12 }} />
        <View style={styles.rowBetween}>
          <SkeletonBox width="35%" height={14} />
          <SkeletonBox width="25%" height={18} borderRadius={12} />
        </View>
      </View>
    </View>
  );
};

export const ListRowSkeleton: React.FC = () => {
  const { theme } = useTheme();
  return (
    <View style={[styles.listRow, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <SkeletonBox width={72} height={72} borderRadius={12} />
      <View style={{ flex: 1, marginLeft: 12, justifyContent: 'center' }}>
        <SkeletonBox width="70%" height={16} style={{ marginBottom: 6 }} />
        <SkeletonBox width="90%" height={13} style={{ marginBottom: 6 }} />
        <SkeletonBox width="40%" height={13} />
      </View>
    </View>
  );
};

export const DetailSkeleton: React.FC = () => {
  const { theme } = useTheme();
  return (
    <View style={{ padding: 20 }}>
      <SkeletonBox width="100%" height={240} borderRadius={20} style={{ marginBottom: 16 }} />
      <SkeletonBox width="70%" height={24} style={{ marginBottom: 10 }} />
      <SkeletonBox width="90%" height={16} style={{ marginBottom: 20 }} />
      <View style={[styles.rowBetween, { marginBottom: 20 }]}>
        <SkeletonBox width="45%" height={40} borderRadius={20} />
        <SkeletonBox width="45%" height={40} borderRadius={20} />
      </View>
      <SkeletonBox width="100%" height={80} borderRadius={16} style={{ marginBottom: 20 }} />
      <SkeletonBox width="100%" height={52} borderRadius={26} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16
  },
  listRow: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center'
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});
