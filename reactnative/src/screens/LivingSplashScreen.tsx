import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Dimensions,
  Easing,
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HavenlyLogo } from '../components/HavenlyLogo';
import { SafeImage } from '../components/SafeImage';

interface LivingSplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('window');
const SLIDE_DURATION = 3200;

interface SlideItem {
  id: string;
  tag: string;
  title: string;
  highlight: string;
  description: string;
  imageUrl: string;
  locationBadge: string;
  features: string[];
}

const SLIDES: SlideItem[] = [
  {
    id: 'slide-1',
    tag: 'HYDERABAD HUBS',
    title: 'World-Class Spaces in',
    highlight: 'Prime Locations',
    description: 'Executive boardrooms, private studios and flexible desks across Madhapur, Hitec City, and Gachibowli.',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&q=80',
    locationBadge: 'Madhapur • Hitec City • Gachibowli',
    features: ['5 Prime Hubs', 'Acoustic Glass', '24/7 Power']
  },
  {
    id: 'slide-2',
    tag: 'INSTANT BOOKING',
    title: 'Live Slots & Full Day',
    highlight: 'Passes On-Demand',
    description: 'Select start to end times with real-time seat availability and seamless instant day passes.',
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1000&q=80',
    locationBadge: 'From ₹120/hr • Day Passes Available',
    features: ['Real-Time Slots', 'Strict Day Pass Rules', 'Instant QR']
  },
  {
    id: 'slide-3',
    tag: 'ENTERPRISE READY',
    title: 'Corporate Quotas &',
    highlight: 'Central Billing',
    description: 'Annual 50-hour team allowances, multi-hub access for employees, and unified corporate invoicing.',
    imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1000&q=80',
    locationBadge: '50h Annual Team Quota',
    features: ['Multi-Tenant Access', 'Unified Invoicing', 'Zero Overage']
  }
];

export const LivingSplashScreen: React.FC<LivingSplashScreenProps> = ({ onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;
  const exitScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 2400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    ).start();
  }, [pulseAnim]);

  const startProgress = (targetIndex: number) => {
    progressAnim.setValue(0);
    if (progressAnimRef.current) {
      progressAnimRef.current.stop();
    }

    const anim = Animated.timing(progressAnim, {
      toValue: 1,
      duration: SLIDE_DURATION,
      easing: Easing.linear,
      useNativeDriver: false
    });
    progressAnimRef.current = anim;

    anim.start(({ finished }) => {
      if (finished) {
        if (targetIndex < SLIDES.length - 1) {
          goToSlide(targetIndex + 1);
        } else {
          handleFinish();
        }
      }
    });
  };

  const goToSlide = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= SLIDES.length) return;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: nextIndex > currentIndex ? -20 : 20,
        duration: 180,
        useNativeDriver: true
      })
    ]).start(() => {
      setCurrentIndex(nextIndex);
      slideAnim.setValue(nextIndex > currentIndex ? 20 : -20);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true
        })
      ]).start();
      startProgress(nextIndex);
    });
  };

  useEffect(() => {
    startProgress(0);
    return () => {
      if (progressAnimRef.current) {
        progressAnimRef.current.stop();
      }
    };
  }, []);

  const handleFinish = () => {
    if (progressAnimRef.current) {
      progressAnimRef.current.stop();
    }
    Animated.parallel([
      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: 320,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true
      }),
      Animated.timing(exitScale, {
        toValue: 1.05,
        duration: 320,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true
      })
    ]).start(() => {
      onFinish();
    });
  };

  const currentSlide = SLIDES[currentIndex];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: exitOpacity,
          transform: [{ scale: exitScale }]
        }
      ]}
    >
      <StatusBar barStyle="light-content" />

      <Animated.View
        style={[
          styles.ambientGlow,
          {
            transform: [{ scale: pulseAnim }]
          }
        ]}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topProgressRow}>
          {SLIDES.map((slide, index) => {
            let widthPercent: any = '0%';
            if (index < currentIndex) {
              widthPercent = '100%';
            } else if (index === currentIndex) {
              widthPercent = progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              });
            }
            return (
              <View key={slide.id} style={styles.progressBarTrack}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: widthPercent
                    }
                  ]}
                />
              </View>
            );
          })}
        </View>

        <View style={styles.navHeader}>
          <View style={styles.logoBadgeContainer}>
            <HavenlyLogo variant="horizontal" theme="dark" size={105} />
          </View>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleFinish}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
            <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[
            styles.cardContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.heroCard}>
            <SafeImage
              uri={currentSlide.imageUrl}
              style={styles.heroImage}
              borderRadius={24}
            />
            <View style={styles.heroCardOverlay} />

            <View style={styles.floatingLocationBadge}>
              <Ionicons name="location" size={12} color="#00A859" style={{ marginRight: 4 }} />
              <Text style={styles.floatingLocationText} numberOfLines={1}>
                {currentSlide.locationBadge}
              </Text>
            </View>

            <View style={styles.featureChipsRow}>
              {currentSlide.features.map((feat, idx) => (
                <View key={`feat-${currentSlide.id}-${idx}`} style={styles.featureChip}>
                  <Ionicons name="checkmark-circle" size={11} color="#00A859" style={{ marginRight: 4 }} />
                  <Text style={styles.featureChipText}>{feat}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.contentSection}>
            <View style={styles.tagPill}>
              <Text style={styles.tagPillText}>{currentSlide.tag}</Text>
            </View>

            <Text style={styles.headline}>
              {currentSlide.title}{' '}
              <Text style={styles.headlineHighlight}>{currentSlide.highlight}</Text>
            </Text>

            <Text style={styles.bodyDescription}>
              {currentSlide.description}
            </Text>
          </View>
        </Animated.View>

        <View style={styles.bottomBar}>
          <View style={styles.dotsRow}>
            {SLIDES.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <TouchableOpacity
                  key={`dot-${slide.id}`}
                  onPress={() => goToSlide(idx)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.dot,
                      isActive ? styles.dotActive : styles.dotInactive
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              if (currentIndex < SLIDES.length - 1) {
                goToSlide(currentIndex + 1);
              } else {
                handleFinish();
              }
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>
              {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons
              name={currentIndex === SLIDES.length - 1 ? 'arrow-forward' : 'chevron-forward'}
              size={18}
              color="#FFFFFF"
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A12',
    position: 'relative',
    overflow: 'hidden'
  },
  ambientGlow: {
    position: 'absolute',
    top: -80,
    alignSelf: 'center',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: (width * 0.9) / 2,
    backgroundColor: 'rgba(0, 168, 89, 0.12)',
    zIndex: 0
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
    justifyContent: 'space-between',
    paddingBottom: 16
  },
  topProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 8,
    marginTop: 10,
    marginBottom: 8
  },
  progressBarTrack: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00A859',
    borderRadius: 2
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8
  },
  logoBadgeContainer: {
    justifyContent: 'center'
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14
  },
  skipButtonText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 2
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  heroCard: {
    width: '100%',
    height: height * 0.38,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 8
  },
  heroImage: {
    width: '100%',
    height: '100%'
  },
  heroCardOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(7, 10, 18, 0.32)'
  },
  floatingLocationBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(7, 10, 18, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12
  },
  floatingLocationText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '600'
  },
  featureChipsRow: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(7, 10, 18, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 89, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  featureChipText: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '700'
  },
  contentSection: {
    marginTop: 22,
    paddingHorizontal: 4
  },
  tagPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 168, 89, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 89, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 10
  },
  tagPillText: {
    color: '#00A859',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
    lineHeight: 31,
    marginBottom: 8
  },
  headlineHighlight: {
    color: '#00A859'
  },
  bodyDescription: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 20
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  dot: {
    height: 6,
    borderRadius: 3
  },
  dotActive: {
    width: 24,
    backgroundColor: '#00A859'
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A859',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 18,
    shadowColor: '#00A859',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  }
});
