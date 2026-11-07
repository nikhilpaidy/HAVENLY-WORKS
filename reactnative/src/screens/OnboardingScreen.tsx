import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { SafeImage } from '../components/SafeImage';
import { HavenlyLogo } from '../components/HavenlyLogo';

interface OnboardingScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onExploreNearby: () => void;
}

const { width, height } = Dimensions.get('window');

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onGetStarted,
  onSignIn,
  onExploreNearby
}) => {
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0A0F1D' : '#F7F9FC' }]}>
      <View style={styles.imageContainer}>
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1000&q=80'
          }}
          style={styles.heroImage}
          imageStyle={styles.heroImageRadius}
        >
          <View style={styles.overlay} />

          <View style={styles.tagBadge}>
            <Text style={styles.tagBadgeText}>#Workspace</Text>
          </View>

          <View style={styles.floatingPreviewRow}>
            <SafeImage
              uri="https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&q=80"
              style={styles.thumbImage}
              borderRadius={12}
            />
            <SafeImage
              uri="https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=300&q=80"
              style={styles.thumbImage}
              borderRadius={12}
            />
            <View style={styles.circularBadge}>
              <Ionicons name="sparkles" size={16} color="#FFFFFF" />
              <Text style={styles.circularBadgeText}>BOOK NOW</Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.contentSection}>
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <HavenlyLogo variant="horizontal" size={32} textColor={theme.textPrimary} />
        </View>

        <Text style={[styles.heading, { color: theme.textPrimary }]}>
          SPACE FOR <Text style={{ color: '#00A859' }}>TOGETHERNESS</Text>
        </Text>

        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          COWORK • CONNECT • GROW{'\n'}Discover premium workspaces, private desks & meeting hubs in Madhapur & Hyderabad.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onGetStarted}
          activeOpacity={0.88}
        >
          <Text style={styles.primaryButtonText}>Let's Get Started</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: isDark ? '#1E293B' : '#E2E8F0' }]}
          onPress={onExploreNearby}
          activeOpacity={0.8}
        >
          <Ionicons name="navigate-outline" size={16} color="#00A859" style={{ marginRight: 6 }} />
          <Text style={[styles.secondaryButtonText, { color: theme.textPrimary }]}>
            Explore Nearby Spaces (1km - 5km)
          </Text>
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={onSignIn}>
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between'
  },
  imageContainer: {
    width: width,
    height: height * 0.52,
    paddingHorizontal: 16,
    paddingTop: 10
  },
  heroImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    padding: 16
  },
  heroImageRadius: {
    borderRadius: 28
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 15, 29, 0.25)',
    borderRadius: 28
  },
  tagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#00A859',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    marginLeft: 8
  },
  tagBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.3
  },
  floatingPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(18, 26, 45, 0.75)',
    padding: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)'
  },
  thumbImage: {
    width: 58,
    height: 58
  },
  circularBadge: {
    flex: 1,
    height: 58,
    backgroundColor: '#00A859',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6
  },
  circularBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: 0.5
  },
  contentSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center'
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 36,
    marginBottom: 10
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 8,
    marginBottom: 24
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00A859',
    width: '100%',
    height: 52,
    borderRadius: 26,
    marginBottom: 12,
    shadowColor: '#00A859',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    marginBottom: 20
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600'
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  footerText: {
    fontSize: 14
  },
  signInLink: {
    color: '#00A859',
    fontSize: 14,
    fontWeight: '700'
  }
});
