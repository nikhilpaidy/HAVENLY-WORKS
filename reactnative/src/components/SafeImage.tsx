import React, { useState } from 'react';
import { View, Image, StyleSheet, ImageProps, ImageStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { resolveImageUrl } from '../services/api';

interface SafeImageProps extends Omit<ImageProps, 'source'> {
  uri?: string;
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ImageStyle>;
  borderRadius?: number;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  uri,
  fallbackIcon = 'business-outline',
  style,
  borderRadius = 12,
  ...props
}) => {
  const { theme, isDark } = useTheme();
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const finalUri = resolveImageUrl(uri);
  const placeholderBg = isDark ? '#1E293B' : '#E2E8F0';

  if (!finalUri || hasError) {
    return (
      <View
        style={[
          styles.placeholder,
          { backgroundColor: placeholderBg, borderRadius },
          style as any
        ]}
      >
        <Ionicons name={fallbackIcon} size={28} color={theme.textMuted} />
      </View>
    );
  }

  return (
    <View style={[{ borderRadius, overflow: 'hidden' }, style as any]}>
      {isLoading && (
        <View
          style={[
            StyleSheet.absoluteFill,
            styles.placeholder,
            { backgroundColor: placeholderBg }
          ]}
        >
          <Ionicons name={fallbackIcon} size={24} color={theme.textMuted} />
        </View>
      )}
      <Image
        source={{ uri: finalUri }}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        style={[style, { borderRadius }]}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center'
  }
});
