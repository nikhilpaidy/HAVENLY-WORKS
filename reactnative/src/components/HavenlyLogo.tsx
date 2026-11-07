import React from 'react';
import { View, Image, StyleSheet, ImageStyle, StyleProp } from 'react-native';

const appLogoVertical = require('../../assets/brand/app-logo-vertical.png');
const logoLight = require('../../assets/brand/logo-light.png');
const logoDark = require('../../assets/brand/logo-dark.png');
const appIcon = require('../../assets/brand/app-icon.png');

interface LogoProps {
  size?: number;
  width?: number;
  height?: number;
  variant?: 'horizontal' | 'vertical' | 'mark' | 'icon';
  theme?: 'dark' | 'light';
  style?: StyleProp<ImageStyle>;
  color?: string;
  leafColor?: string;
  textColor?: string;
  taglineColor?: string;
  withText?: boolean;
  withTagline?: boolean;
  horizontal?: boolean;
}

export const HavenlyLogoMark: React.FC<{
  size?: number;
  style?: StyleProp<ImageStyle>;
  color?: string;
  leafColor?: string;
}> = ({
  size = 48,
  style
}) => {
  return (
    <Image
      source={appIcon}
      style={[{ width: size, height: size, borderRadius: size * 0.22 }, style]}
      resizeMode="contain"
    />
  );
};

export const HavenlyLogo: React.FC<LogoProps> = ({
  size = 120,
  width,
  height,
  variant = 'horizontal',
  theme = 'light',
  horizontal = false,
  style
}) => {
  const isHorizontal = horizontal || variant === 'horizontal';
  const isMark = variant === 'mark' || variant === 'icon';

  if (isMark) {
    return <HavenlyLogoMark size={size} style={style} />;
  }

  if (variant === 'vertical') {
    const targetWidth = width || size * 1.5;
    const targetHeight = height || Math.round(targetWidth * (294 / 433));
    return (
      <View style={styles.centerContainer}>
        <Image
          source={appLogoVertical}
          style={[{ width: targetWidth, height: targetHeight }, style]}
          resizeMode="contain"
        />
      </View>
    );
  }

  const targetHeight = height || Math.round(size * 0.32);
  const targetWidth = width || Math.round(targetHeight * (541 / 104));

  return (
    <View style={styles.rowContainer}>
      <Image
        source={theme === 'dark' ? logoDark : logoLight}
        style={[{ width: targetWidth, height: targetHeight }, style]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  }
});
