import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Dimensions,
  Easing,
  TouchableOpacity,
  PanResponder
} from 'react-native';
import { HavenlyLogoMark } from '../components/HavenlyLogo';
import { useTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface LivingSplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    tag: 'SMART WORKSPACES',
    title: 'Space for Togetherness',
    subtitle: 'Book boardrooms, focus desks, and collaborative cabins across prime hubs with live instant confirmation.',
    accent: '#00A859',
    iconName: 'business-outline' as const,
    badge: 'Real-Time Inventory'
  },
  {
    tag: 'QUOTA GOVERNANCE',
    title: 'Transparent Company Hours',
    subtitle: 'Monitor annual complimentary allowances, instant slot deductions, and clear audit transaction ledgers.',
    accent: '#00C261',
    iconName: 'hourglass-outline' as const,
    badge: 'Live Quota Balances'
  },
  {
    tag: 'FACILITY CONCIERGE',
    title: 'Direct Hub Coordination',
    subtitle: 'Connect with dedicated hub managers, raise facilities tickets, and enjoy smooth workspace check-ins.',
    accent: '#00A859',
    iconName: 'shield-checkmark-outline' as const,
    badge: 'Concierge Operations'
  }
];

export const LivingSplashScreen: React.FC<LivingSplashScreenProps> = ({ onFinish }) => {
  const { isDark } = useTheme();

  const [currentIndex, setCurrentIndex] = useState(0);

  const touchX = useRef(new Animated.Value(0)).current;
  const touchY = useRef(new Animated.Value(0)).current;

  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const slideFade = useRef(new Animated.Value(1)).current;
  const exitScale = useRef(new Animated.Value(1)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        touchX.setValue(gestureState.dx * 0.35);
        touchY.setValue(gestureState.dy * 0.35);
      },
      onPanResponderRelease: (evt, gestureState) => {
        Animated.parallel([
          Animated.spring(touchX, {
            toValue: 0,
            friction: 5,
            tension: 40,
            useNativeDriver: true
          }),
          Animated.spring(touchY, {
            toValue: 0,
            friction: 5,
            tension: 40,
            useNativeDriver: true
          })
        ]).start();

        if (gestureState.dx < -50 && currentIndex < SLIDES.length - 1) {
          goToSlide(currentIndex + 1);
        } else if (gestureState.dx > 50 && currentIndex > 0) {
          goToSlide(currentIndex - 1);
        }
      }
    })
  ).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -16,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(floatAnim, {
          toValue: 10,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ).start();

    Animated.loop(
      Animated.stagger(700, [
        Animated.sequence([
          Animated.timing(ring1, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(ring1, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true
          })
        ]),
        Animated.sequence([
          Animated.timing(ring2, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(ring2, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true
          })
        ])
      ])
    ).start();
  }, []);

  const goToSlide = (nextIndex: number) => {
    Animated.sequence([
      Animated.timing(slideFade, {
        toValue: 0,
        duration: 140,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true
      }),
      Animated.timing(slideFade, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true
      })
    ]).start();
    setCurrentIndex(nextIndex);
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      goToSlide(currentIndex + 1);
    } else {
      triggerExit();
    }
  };

  const triggerExit = () => {
    Animated.parallel([
      Animated.timing(exitScale, {
        toValue: 1.15,
        duration: 350,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true
      }),
      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true
      })
    ]).start(() => onFinish());
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const ringScale1 = ring1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 2.3]
  });
  const ringOpacity1 = ring1.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.45, 0.25, 0]
  });

  const ringScale2 = ring2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 2.5]
  });
  const ringOpacity2 = ring2.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.4, 0.2, 0]
  });

  const currentSlide = SLIDES[currentIndex];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#070C18' : '#F6FAF7' }
      ]}
      {...panResponder.panHandlers}
    >
      <View style={styles.topBar}>
        <View style={styles.topBadge}>
          <Text style={styles.topBadgeText}>{currentSlide.badge}</Text>
        </View>
        <TouchableOpacity onPress={triggerExit} style={styles.skipBtn} activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.mainStage,
          {
            opacity: exitOpacity,
            transform: [{ scale: exitScale }]
          }
        ]}
      >
        <View style={styles.livingCanvas}>
          <Animated.View
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: ringScale1 }],
                opacity: ringOpacity1
              }
            ]}
          />
          <Animated.View
            style={[
              styles.pulseRing,
              styles.pulseRingSecondary,
              {
                transform: [{ scale: ringScale2 }],
                opacity: ringOpacity2
              }
            ]}
          />

          <Animated.View
            style={[
              styles.orbitRing,
              {
                borderColor: isDark ? 'rgba(0, 168, 89, 0.2)' : 'rgba(0, 168, 89, 0.15)',
                transform: [
                  { translateX: touchX },
                  { translateY: touchY },
                  { rotate: spin }
                ]
              }
            ]}
          >
            <View style={styles.satelliteNode} />
            <View style={styles.satelliteNodeOpposite} />
          </Animated.View>

          <Animated.View
            style={[
              styles.livingObject,
              {
                transform: [
                  { translateX: touchX },
                  { translateY: Animated.add(floatAnim, touchY) },
                  { scale: pulseAnim }
                ]
              }
            ]}
          >
            <View style={styles.logoMarkContainer}>
              <HavenlyLogoMark size={106} color="#00A859" leafColor="#00C261" />
            </View>
            <View style={styles.movingBeaconCore} />
          </Animated.View>
        </View>

        <Animated.View style={[styles.copyContainer, { opacity: slideFade }]}>
          <View style={styles.taglineBox}>
            <View style={styles.tagDot} />
            <Text style={styles.tagText}>{currentSlide.tag}</Text>
            <View style={styles.tagDot} />
          </View>

          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#0B1E14' }]}>
            {currentSlide.title}
          </Text>

          <Text style={[styles.subtitle, { color: isDark ? '#94A3B8' : '#475569' }]}>
            {currentSlide.subtitle}
          </Text>
        </Animated.View>
      </Animated.View>

      <View style={styles.bottomBar}>
        <View style={styles.paginationRow}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => goToSlide(i)}
              activeOpacity={0.8}
              style={[
                styles.dot,
                currentIndex === i ? styles.dotActive : styles.dotInactive,
                currentIndex === i && { backgroundColor: '#00A859' }
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.actionBtnText}>
            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons
            name={currentIndex === SLIDES.length - 1 ? 'checkmark' : 'arrow-forward'}
            size={18}
            color="#FFFFFF"
            style={{ marginLeft: 6 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 50
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  topBadge: {
    backgroundColor: 'rgba(0, 168, 89, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14
  },
  topBadgeText: {
    color: '#00A859',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  skipText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600'
  },
  mainStage: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  livingCanvas: {
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  pulseRing: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(0, 168, 89, 0.35)'
  },
  pulseRingSecondary: {
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(0, 194, 97, 0.25)'
  },
  orbitRing: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center'
  },
  satelliteNode: {
    position: 'absolute',
    top: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00A859'
  },
  satelliteNodeOpposite: {
    position: 'absolute',
    bottom: -5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00C261'
  },
  livingObject: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoMarkContainer: {
    shadowColor: '#00A859',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 8
  },
  movingBeaconCore: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    top: 52
  },
  copyContainer: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 8
  },
  taglineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  tagDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00A859'
  },
  tagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00A859',
    letterSpacing: 2
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 10
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 320
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 10
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  dot: {
    height: 8,
    borderRadius: 4
  },
  dotActive: {
    width: 24
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(100, 116, 139, 0.3)'
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A859',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 18,
    shadowColor: '#00A859',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  }
});
