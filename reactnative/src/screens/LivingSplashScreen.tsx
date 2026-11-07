import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Dimensions,
  Easing,
  TouchableOpacity
} from 'react-native';
import { HavenlyLogoMark } from '../components/HavenlyLogo';
import { useTheme } from '../theme/ThemeContext';

interface LivingSplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('window');

export const LivingSplashScreen: React.FC<LivingSplashScreenProps> = ({ onFinish }) => {
  const { isDark } = useTheme();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const exitScale = useRef(new Animated.Value(1)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -14,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(floatAnim, {
          toValue: 6,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.98,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(rotateAnim, {
          toValue: -1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ])
    ).start();

    Animated.loop(
      Animated.stagger(600, [
        Animated.sequence([
          Animated.timing(ripple1, {
            toValue: 1,
            duration: 1800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(ripple1, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true
          })
        ]),
        Animated.sequence([
          Animated.timing(ripple2, {
            toValue: 1,
            duration: 1800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(ripple2, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true
          })
        ])
      ])
    ).start();

    Animated.timing(textFade, {
      toValue: 1,
      duration: 800,
      delay: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true
    }).start();

    const timer = setTimeout(() => {
      triggerExit();
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  const triggerExit = () => {
    Animated.parallel([
      Animated.timing(exitScale, {
        toValue: 1.25,
        duration: 450,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true
      }),
      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: 450,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true
      })
    ]).start(() => onFinish());
  };

  const spin = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-3deg', '3deg']
  });

  const rippleScale1 = ripple1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 2.2]
  });
  const rippleOpacity1 = ripple1.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.4, 0.25, 0]
  });

  const rippleScale2 = ripple2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 2.4]
  });
  const rippleOpacity2 = ripple2.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.35, 0.2, 0]
  });

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={triggerExit}
      style={[
        styles.container,
        { backgroundColor: isDark ? '#0A0F1D' : '#F7F9FC' }
      ]}
    >
      <Animated.View
        style={[
          styles.animatedContent,
          {
            opacity: exitOpacity,
            transform: [{ scale: exitScale }]
          }
        ]}
      >
        {/* Living Ripple 1 */}
        <Animated.View
          style={[
            styles.ripple,
            {
              transform: [{ scale: rippleScale1 }],
              opacity: rippleOpacity1
            }
          ]}
        />

        {/* Living Ripple 2 */}
        <Animated.View
          style={[
            styles.ripple,
            styles.rippleSecondary,
            {
              transform: [{ scale: rippleScale2 }],
              opacity: rippleOpacity2
            }
          ]}
        />

        {/* Floating, Breathing Living Logo */}
        <Animated.View
          style={{
            transform: [
              { translateY: floatAnim },
              { scale: pulseAnim },
              { rotate: spin }
            ]
          }}
        >
          <View style={styles.markGlowWrapper}>
            <HavenlyLogoMark size={110} color="#00A859" leafColor="#00C261" />
          </View>
        </Animated.View>

        {/* Title & Tagline with Living Stagger */}
        <Animated.View style={[styles.textWrapper, { opacity: textFade }]}>
          <Text style={[styles.brandTitle, { color: isDark ? '#FFFFFF' : '#0A3826' }]}>
            Havenly<Text style={{ color: '#00A859' }}>Work</Text>
          </Text>

          <View style={styles.taglineBox}>
            <View style={styles.dot} />
            <Text style={styles.taglineText}>SPACE FOR TOGETHERNESS</Text>
            <View style={styles.dot} />
          </View>
          <Text style={styles.subTagline}>COWORK • CONNECT • GROW</Text>
        </Animated.View>
      </Animated.View>

      <View style={styles.bottomPill}>
        <View style={styles.livingIndicator}>
          <View style={styles.livingDotInner} />
        </View>
        <Text style={styles.bottomHint}>Hyderabad • Madhapur Hub</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  animatedContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width,
    height: height * 0.65
  },
  ripple: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#00A859'
  },
  rippleSecondary: {
    backgroundColor: '#00C261'
  },
  markGlowWrapper: {
    shadowColor: '#00A859',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 8
  },
  textWrapper: {
    alignItems: 'center',
    marginTop: 24
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.8
  },
  taglineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00A859'
  },
  taglineText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#00A859'
  },
  subTagline: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: '#94A3B8',
    marginTop: 4
  },
  bottomPill: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 168, 89, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20
  },
  livingIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0, 168, 89, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  livingDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00A859'
  },
  bottomHint: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00A859'
  }
});
