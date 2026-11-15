import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Dimensions,
  Easing,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

interface LivingSplashScreenProps {
  onFinish: () => void;
}

const { width } = Dimensions.get('window');
const SCENE_DURATION = 3600;

export const LivingSplashScreen: React.FC<LivingSplashScreenProps> = ({ onFinish }) => {
  const { isDark } = useTheme();

  const [sceneIndex, setSceneIndex] = useState(0);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  const walkLeg1 = useRef(new Animated.Value(0)).current;
  const walkLeg2 = useRef(new Animated.Value(0)).current;
  const walkArm = useRef(new Animated.Value(0)).current;
  const walkPos = useRef(new Animated.Value(-50)).current;
  const doorSlide = useRef(new Animated.Value(0)).current;

  const deskSelectScale = useRef(new Animated.Value(1)).current;
  const deskPointerY = useRef(new Animated.Value(-15)).current;
  const deskPulseRing = useRef(new Animated.Value(0)).current;
  const timeBadgeSlide = useRef(new Animated.Value(20)).current;
  const timeBadgeOpacity = useRef(new Animated.Value(0)).current;

  const seatedPassScale = useRef(new Animated.Value(0.7)).current;
  const seatedPassOpacity = useRef(new Animated.Value(0)).current;
  const laptopGlow = useRef(new Animated.Value(0.85)).current;
  const coffeeSteam = useRef(new Animated.Value(0)).current;

  const exitOpacity = useRef(new Animated.Value(1)).current;
  const exitScale = useRef(new Animated.Value(1)).current;

  const startSceneLoop = (idx: number) => {
    progressAnim.setValue(0);

    if (progressAnimationRef.current) {
      progressAnimationRef.current.stop();
    }

    const anim = Animated.timing(progressAnim, {
      toValue: 1,
      duration: SCENE_DURATION,
      easing: Easing.linear,
      useNativeDriver: false
    });
    progressAnimationRef.current = anim;

    anim.start(({ finished }) => {
      if (finished) {
        if (idx < 2) {
          handleNext(idx + 1);
        } else {
          triggerExit();
        }
      }
    });

    if (idx === 0) {
      walkPos.setValue(-50);
      doorSlide.setValue(0);

      Animated.parallel([
        Animated.timing(walkPos, {
          toValue: 24,
          duration: SCENE_DURATION * 0.9,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true
        }),
        Animated.timing(doorSlide, {
          toValue: 1,
          duration: 1600,
          delay: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        })
      ]).start();
    } else if (idx === 1) {
      deskSelectScale.setValue(1);
      deskPulseRing.setValue(0);
      timeBadgeSlide.setValue(20);
      timeBadgeOpacity.setValue(0);

      Animated.sequence([
        Animated.delay(400),
        Animated.parallel([
          Animated.spring(deskSelectScale, {
            toValue: 1.08,
            friction: 4,
            useNativeDriver: true
          }),
          Animated.timing(deskPulseRing, {
            toValue: 1,
            duration: 1200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(timeBadgeSlide, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true
          }),
          Animated.timing(timeBadgeOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true
          })
        ])
      ]).start();
    } else if (idx === 2) {
      seatedPassScale.setValue(0.7);
      seatedPassOpacity.setValue(0);

      Animated.sequence([
        Animated.delay(300),
        Animated.parallel([
          Animated.spring(seatedPassScale, {
            toValue: 1,
            friction: 5,
            tension: 50,
            useNativeDriver: true
          }),
          Animated.timing(seatedPassOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true
          })
        ])
      ]).start();
    }
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(walkLeg1, {
          toValue: 18,
          duration: 260,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(walkLeg1, {
          toValue: -18,
          duration: 260,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(walkLeg2, {
          toValue: -18,
          duration: 260,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(walkLeg2, {
          toValue: 18,
          duration: 260,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(walkArm, {
          toValue: -14,
          duration: 260,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(walkArm, {
          toValue: 14,
          duration: 260,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(deskPointerY, {
          toValue: -6,
          duration: 500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(deskPointerY, {
          toValue: -16,
          duration: 500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(laptopGlow, {
          toValue: 1.15,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(laptopGlow, {
          toValue: 0.85,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(coffeeSteam, {
          toValue: -10,
          duration: 1200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true
        }),
        Animated.timing(coffeeSteam, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true
        })
      ])
    ).start();

    startSceneLoop(0);

    return () => {
      if (progressAnimationRef.current) {
        progressAnimationRef.current.stop();
      }
    };
  }, []);

  const handleNext = (nextIndex: number) => {
    setSceneIndex(nextIndex);
    startSceneLoop(nextIndex);
  };

  const triggerExit = () => {
    if (progressAnimationRef.current) {
      progressAnimationRef.current.stop();
    }
    Animated.parallel([
      Animated.timing(exitScale, {
        toValue: 1.1,
        duration: 320,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true
      }),
      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true
      })
    ]).start(() => onFinish());
  };

  const leg1Rotate = walkLeg1.interpolate({
    inputRange: [-18, 18],
    outputRange: ['-22deg', '22deg']
  });

  const leg2Rotate = walkLeg2.interpolate({
    inputRange: [-18, 18],
    outputRange: ['-22deg', '22deg']
  });

  const armRotate = walkArm.interpolate({
    inputRange: [-14, 14],
    outputRange: ['-20deg', '20deg']
  });

  const doorLeftTranslate = doorSlide.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -42]
  });

  const doorRightTranslate = doorSlide.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 42]
  });

  const pulseScale = deskPulseRing.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2]
  });

  const pulseOpacity = deskPulseRing.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.6, 0.3, 0]
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#060A14' : '#F7FAF8' }
      ]}
    >
      <View style={styles.topProgressRow}>
        {[0, 1, 2].map((i) => {
          const isDone = i < sceneIndex;
          const isCurrent = i === sceneIndex;

          return (
            <View
              key={i}
              style={[
                styles.progressBarTrack,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' }
              ]}
            >
              {isDone ? (
                <View style={[styles.progressBarFill, { width: '100%', backgroundColor: '#00A859' }]} />
              ) : isCurrent ? (
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: progressWidth,
                      backgroundColor: '#00A859'
                    }
                  ]}
                />
              ) : null}
            </View>
          );
        })}
      </View>

      <View style={styles.headerRow}>
        <View style={styles.brandRow}>
          <View style={styles.brandDot} />
          <Text style={[styles.brandWordmark, { color: isDark ? '#FFFFFF' : '#0B1E14' }]}>
            Havenly<Text style={{ color: '#00A859' }}>Work</Text>
          </Text>
        </View>

        <TouchableOpacity onPress={triggerExit} style={styles.skipPill} activeOpacity={0.75}>
          <Text style={styles.skipPillText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.stageContainer,
          {
            opacity: exitOpacity,
            transform: [{ scale: exitScale }]
          }
        ]}
      >
        {sceneIndex === 0 && (
          <View style={styles.sceneCanvas}>
            <View style={styles.entranceFrame}>
              <View style={[styles.doorLintel, { backgroundColor: isDark ? '#1E293B' : '#CBD5E1' }]}>
                <Ionicons name="business" size={13} color="#00A859" style={{ marginRight: 4 }} />
                <Text style={styles.doorLintelText}>HAVENLY HUB • ENTRANCE</Text>
              </View>

              <View style={styles.doorsContainer}>
                <Animated.View
                  style={[
                    styles.glassDoor,
                    styles.glassDoorLeft,
                    {
                      backgroundColor: isDark ? 'rgba(30, 41, 59, 0.65)' : 'rgba(226, 232, 240, 0.75)',
                      transform: [{ translateX: doorLeftTranslate }]
                    }
                  ]}
                >
                  <View style={styles.doorHandleLeft} />
                </Animated.View>
                <Animated.View
                  style={[
                    styles.glassDoor,
                    styles.glassDoorRight,
                    {
                      backgroundColor: isDark ? 'rgba(30, 41, 59, 0.65)' : 'rgba(226, 232, 240, 0.75)',
                      transform: [{ translateX: doorRightTranslate }]
                    }
                  ]}
                >
                  <View style={styles.doorHandleRight} />
                </Animated.View>
              </View>
              <View style={[styles.floorLine, { backgroundColor: isDark ? '#334155' : '#94A3B8' }]} />
            </View>

            <Animated.View
              style={[
                styles.walkerFigure,
                {
                  transform: [{ translateX: walkPos }]
                }
              ]}
            >
              <View style={styles.walkerHead}>
                <View style={styles.hairCap} />
              </View>

              <View style={styles.walkerTorso}>
                <View style={styles.walkerCollar} />
              </View>

              <Animated.View
                style={[
                  styles.walkerArm,
                  {
                    transform: [{ rotate: armRotate }]
                  }
                ]}
              >
                <View style={styles.briefcaseBox}>
                  <View style={styles.briefcaseHandle} />
                </View>
              </Animated.View>

              <View style={styles.legsRow}>
                <Animated.View
                  style={[
                    styles.walkerLeg,
                    {
                      transform: [{ rotate: leg1Rotate }]
                    }
                  ]}
                >
                  <View style={styles.walkerShoe} />
                </Animated.View>
                <Animated.View
                  style={[
                    styles.walkerLeg,
                    {
                      transform: [{ rotate: leg2Rotate }]
                    }
                  ]}
                >
                  <View style={styles.walkerShoe} />
                </Animated.View>
              </View>
            </Animated.View>
          </View>
        )}

        {sceneIndex === 1 && (
          <View style={styles.sceneCanvas}>
            <Animated.View
              style={[
                styles.pointerHand,
                {
                  transform: [{ translateY: deskPointerY }]
                }
              ]}
            >
              <Ionicons name="finger-print" size={26} color="#00A859" />
            </Animated.View>

            <View style={styles.deskRow}>
              <View style={[styles.deskCardSmall, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0', opacity: 0.65 }]}>
                <Ionicons name="desktop-outline" size={20} color={isDark ? '#64748B' : '#94A3B8'} />
                <Text style={styles.deskOccupiedText}>Occupied</Text>
              </View>

              <Animated.View
                style={[
                  styles.deskCardHero,
                  {
                    backgroundColor: isDark ? '#0F1E19' : '#DCFCE7',
                    borderColor: '#00A859',
                    transform: [{ scale: deskSelectScale }]
                  }
                ]}
              >
                <Animated.View
                  style={[
                    styles.deskPulseRingView,
                    {
                      transform: [{ scale: pulseScale }],
                      opacity: pulseOpacity
                    }
                  ]}
                />
                <View style={styles.deskHeroBadge}>
                  <Text style={styles.deskHeroBadgeText}>RESERVING</Text>
                </View>
                <Ionicons name="desktop" size={28} color="#00A859" />
                <Text style={styles.deskHeroTitle}>Executive Desk 08</Text>
                <Text style={styles.deskHeroPrice}>₹350 / hr</Text>
              </Animated.View>

              <View style={[styles.deskCardSmall, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0', opacity: 0.65 }]}>
                <Ionicons name="desktop-outline" size={20} color={isDark ? '#64748B' : '#94A3B8'} />
                <Text style={styles.deskOccupiedText}>Occupied</Text>
              </View>
            </View>

            <Animated.View
              style={[
                styles.timeSlotBadge,
                {
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderColor: isDark ? '#334155' : '#CBD5E1',
                  opacity: timeBadgeOpacity,
                  transform: [{ translateY: timeBadgeSlide }]
                }
              ]}
            >
              <Ionicons name="time" size={14} color="#00A859" style={{ marginRight: 6 }} />
              <Text style={[styles.timeSlotText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                Today • 09:30 AM — 06:30 PM (Selected)
              </Text>
            </Animated.View>
          </View>
        )}

        {sceneIndex === 2 && (
          <View style={styles.sceneCanvas}>
            <View style={styles.seatedWorkstation}>
              <View style={styles.seatedCharacter}>
                <View style={styles.seatedHead} />
                <View style={styles.seatedTorso} />
                <View style={styles.seatedArms} />
              </View>

              <View style={[styles.workstationDesk, { backgroundColor: isDark ? '#1E293B' : '#CBD5E1' }]}>
                <Animated.View
                  style={[
                    styles.laptopBase,
                    {
                      transform: [{ scale: laptopGlow }]
                    }
                  ]}
                >
                  <View style={styles.laptopScreen}>
                    <Ionicons name="code-slash" size={12} color="#00A859" />
                  </View>
                </Animated.View>

                <View style={styles.coffeeCupWrap}>
                  <Animated.View
                    style={[
                      styles.coffeeSteamVapor,
                      {
                        transform: [{ translateY: coffeeSteam }]
                      }
                    ]}
                  >
                    <Ionicons name="cloud" size={10} color="rgba(0,168,89,0.5)" />
                  </Animated.View>
                  <Ionicons name="cafe" size={16} color="#00A859" />
                </View>
              </View>
              <View style={[styles.floorLine, { backgroundColor: isDark ? '#334155' : '#94A3B8' }]} />
            </View>

            <Animated.View
              style={[
                styles.digitalPassCard,
                {
                  backgroundColor: isDark ? '#0E1726' : '#FFFFFF',
                  borderColor: '#00A859',
                  opacity: seatedPassOpacity,
                  transform: [{ scale: seatedPassScale }]
                }
              ]}
            >
              <View style={styles.passHeader}>
                <View style={styles.passCheckBadge}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.passTitle}>Seat Confirmed & Active</Text>
                  <Text style={styles.passMeta}>Pass #HW-2026 • Desk 08 • Madhapur</Text>
                </View>
              </View>
              <View style={styles.passAmenitiesRow}>
                <Text style={styles.passAmenityPill}>High-Speed WiFi</Text>
                <Text style={styles.passAmenityPill}>Unlimited Beverages</Text>
                <Text style={styles.passAmenityPill}>AC Lounge</Text>
              </View>
            </Animated.View>
          </View>
        )}

        <View style={styles.narrativeBox}>
          <View style={styles.scenePill}>
            <Text style={styles.scenePillText}>
              {sceneIndex === 0
                ? 'STEP 1 • ARRIVAL'
                : sceneIndex === 1
                ? 'STEP 2 • LIVE SELECTION'
                : 'STEP 3 • READY TO WORK'}
            </Text>
          </View>

          <Text style={[styles.sceneTitle, { color: isDark ? '#FFFFFF' : '#0B1E14' }]}>
            {sceneIndex === 0
              ? 'Walk In & Explore Prime Hubs'
              : sceneIndex === 1
              ? 'Select Your Seat in Seconds'
              : 'Confirmed, Seated & Ready'}
          </Text>

          <Text style={[styles.sceneDescription, { color: isDark ? '#94A3B8' : '#475569' }]}>
            {sceneIndex === 0
              ? 'Locate nearby coworking hubs, review real-time availability, and step into premium collaborative workspaces.'
              : sceneIndex === 1
              ? 'Choose ergonomic hot desks, focus pods, or full team meeting rooms with clear slot pricing.'
              : 'Instant digital check-in, high-speed enterprise WiFi, and complimentary beverage access ready.'}
          </Text>
        </View>
      </Animated.View>

      <View style={styles.bottomControls}>
        <View style={styles.paginationIndicators}>
          {[0, 1, 2].map((i) => (
            <TouchableOpacity
              key={i}
              onPress={() => handleNext(i)}
              activeOpacity={0.8}
              style={[
                styles.navDot,
                sceneIndex === i ? styles.navDotActive : styles.navDotInactive,
                sceneIndex === i && { backgroundColor: '#00A859' }
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.nextActionBtn}
          onPress={() => {
            if (sceneIndex < 2) {
              handleNext(sceneIndex + 1);
            } else {
              triggerExit();
            }
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.nextActionBtnText}>
            {sceneIndex === 2 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons
            name={sceneIndex === 2 ? 'checkmark-circle' : 'arrow-forward'}
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
    paddingHorizontal: 22,
    paddingTop: 54,
    paddingBottom: 38,
    justifyContent: 'space-between'
  },
  topProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '100%',
    marginBottom: 16
  },
  progressBarTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00A859'
  },
  brandWordmark: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4
  },
  skipPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 168, 89, 0.08)'
  },
  skipPillText: {
    color: '#00A859',
    fontSize: 13,
    fontWeight: '700'
  },
  stageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10
  },
  sceneCanvas: {
    width: '100%',
    height: 230,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  entranceFrame: {
    width: 220,
    height: 180,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  doorLintel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6
  },
  doorLintelText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00A859',
    letterSpacing: 1
  },
  doorsContainer: {
    width: 200,
    height: 130,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative'
  },
  glassDoor: {
    flex: 1,
    height: '100%',
    borderWidth: 1.5,
    borderColor: '#00A859',
    borderRadius: 4
  },
  glassDoorLeft: {
    marginRight: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 6
  },
  glassDoorRight: {
    marginLeft: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 6
  },
  doorHandleLeft: {
    width: 3,
    height: 24,
    borderRadius: 1.5,
    backgroundColor: '#00A859'
  },
  doorHandleRight: {
    width: 3,
    height: 24,
    borderRadius: 1.5,
    backgroundColor: '#00A859'
  },
  floorLine: {
    width: width * 0.8,
    height: 2,
    borderRadius: 1,
    marginTop: 4
  },
  walkerFigure: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 8
  },
  walkerHead: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F3D2B8',
    alignItems: 'center',
    overflow: 'hidden'
  },
  hairCap: {
    width: 20,
    height: 8,
    backgroundColor: '#1E293B',
    position: 'absolute',
    top: 0
  },
  walkerTorso: {
    width: 26,
    height: 38,
    backgroundColor: '#00A859',
    borderRadius: 6,
    marginTop: 2,
    alignItems: 'center'
  },
  walkerCollar: {
    width: 10,
    height: 6,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3
  },
  walkerArm: {
    position: 'absolute',
    top: 24,
    right: -14,
    alignItems: 'center'
  },
  briefcaseBox: {
    width: 18,
    height: 14,
    borderRadius: 3,
    backgroundColor: '#78350F',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  briefcaseHandle: {
    width: 8,
    height: 3,
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderBottomWidth: 0,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    marginTop: -2
  },
  legsRow: {
    flexDirection: 'row',
    width: 24,
    justifyContent: 'space-between',
    marginTop: -2
  },
  walkerLeg: {
    width: 6,
    height: 28,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  walkerShoe: {
    width: 10,
    height: 4,
    backgroundColor: '#000000',
    borderRadius: 2,
    marginBottom: -1
  },
  pointerHand: {
    position: 'absolute',
    top: 4,
    zIndex: 10
  },
  deskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    paddingHorizontal: 8
  },
  deskCardSmall: {
    width: 78,
    height: 96,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8
  },
  deskOccupiedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 6
  },
  deskCardHero: {
    width: 140,
    height: 130,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    position: 'relative'
  },
  deskPulseRingView: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#00A859'
  },
  deskHeroBadge: {
    backgroundColor: '#00A859',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6
  },
  deskHeroBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  deskHeroTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00A859',
    marginTop: 4
  },
  deskHeroPrice: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2
  },
  timeSlotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 14
  },
  timeSlotText: {
    fontSize: 11,
    fontWeight: '700'
  },
  seatedWorkstation: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 130,
    width: '100%'
  },
  seatedCharacter: {
    alignItems: 'center',
    marginBottom: -18,
    zIndex: 1
  },
  seatedHead: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F3D2B8'
  },
  seatedTorso: {
    width: 28,
    height: 28,
    backgroundColor: '#00A859',
    borderRadius: 6,
    marginTop: 2
  },
  seatedArms: {
    width: 36,
    height: 6,
    backgroundColor: '#00A859',
    borderRadius: 3,
    marginTop: -8
  },
  workstationDesk: {
    width: 180,
    height: 14,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 2
  },
  laptopBase: {
    alignItems: 'center',
    marginTop: -16
  },
  laptopScreen: {
    width: 38,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#00A859',
    alignItems: 'center',
    justifyContent: 'center'
  },
  coffeeCupWrap: {
    alignItems: 'center',
    marginTop: -12
  },
  coffeeSteamVapor: {
    marginBottom: -2
  },
  digitalPassCard: {
    width: '90%',
    maxWidth: 320,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 12,
    marginTop: 14
  },
  passHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  passCheckBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00A859',
    alignItems: 'center',
    justifyContent: 'center'
  },
  passTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#00A859'
  },
  passMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1
  },
  passAmenitiesRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8
  },
  passAmenityPill: {
    fontSize: 10,
    fontWeight: '600',
    color: '#00A859',
    backgroundColor: 'rgba(0,168,89,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  narrativeBox: {
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 14
  },
  scenePill: {
    backgroundColor: 'rgba(0, 168, 89, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8
  },
  scenePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00A859',
    letterSpacing: 1
  },
  sceneTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 6
  },
  sceneDescription: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 320
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 8
  },
  paginationIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  navDot: {
    height: 7,
    borderRadius: 3.5
  },
  navDotActive: {
    width: 20
  },
  navDotInactive: {
    width: 7,
    backgroundColor: 'rgba(100, 116, 139, 0.25)'
  },
  nextActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A859',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#00A859',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3
  },
  nextActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  }
});
