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
import { HavenlyLogo } from '../components/HavenlyLogo';

interface LivingSplashScreenProps {
  onFinish: () => void;
}

const { width } = Dimensions.get('window');
const SCENE_DURATION = 3500;

export const LivingSplashScreen: React.FC<LivingSplashScreenProps> = ({ onFinish }) => {
  const { isDark } = useTheme();

  const [sceneIndex, setSceneIndex] = useState(0);
  const [currentFloorText, setCurrentFloorText] = useState('G');

  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  const walkLeg1 = useRef(new Animated.Value(0)).current;
  const walkLeg2 = useRef(new Animated.Value(0)).current;
  const walkArm1 = useRef(new Animated.Value(0)).current;
  const walkArm2 = useRef(new Animated.Value(0)).current;
  const walkBob = useRef(new Animated.Value(0)).current;
  const walkPathMove = useRef(new Animated.Value(0)).current;
  const glassDoorLeft = useRef(new Animated.Value(0)).current;
  const glassDoorRight = useRef(new Animated.Value(0)).current;

  const liftDoorsSlide = useRef(new Animated.Value(0)).current;
  const liftCabinY = useRef(new Animated.Value(20)).current;
  const liftIndicatorPulse = useRef(new Animated.Value(1)).current;
  const chimePulse = useRef(new Animated.Value(0)).current;
  const workspaceRevealOpacity = useRef(new Animated.Value(0)).current;

  const deskChairSlide = useRef(new Animated.Value(30)).current;
  const deskChairOpacity = useRef(new Animated.Value(0)).current;
  const laptopLidAngle = useRef(new Animated.Value(0)).current;
  const laptopScreenGlow = useRef(new Animated.Value(0)).current;
  const coffeeSteam = useRef(new Animated.Value(0)).current;
  const deskPassCardScale = useRef(new Animated.Value(0.8)).current;
  const deskPassCardOpacity = useRef(new Animated.Value(0)).current;

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
      glassDoorLeft.setValue(0);
      glassDoorRight.setValue(0);
      Animated.sequence([
        Animated.delay(1200),
        Animated.parallel([
          Animated.timing(glassDoorLeft, {
            toValue: -36,
            duration: 1200,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true
          }),
          Animated.timing(glassDoorRight, {
            toValue: 36,
            duration: 1200,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true
          })
        ])
      ]).start();
    } else if (idx === 1) {
      liftDoorsSlide.setValue(0);
      liftCabinY.setValue(20);
      chimePulse.setValue(0);
      workspaceRevealOpacity.setValue(0);
      setCurrentFloorText('G');

      setTimeout(() => setCurrentFloorText('1'), 600);
      setTimeout(() => setCurrentFloorText('2'), 1200);
      setTimeout(() => setCurrentFloorText('3'), 1800);
      setTimeout(() => setCurrentFloorText('Floor 4'), 2400);

      Animated.sequence([
        Animated.parallel([
          Animated.timing(liftCabinY, {
            toValue: 0,
            duration: 2200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true
          }),
          Animated.sequence([
            Animated.delay(2300),
            Animated.timing(chimePulse, {
              toValue: 1,
              duration: 400,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true
            })
          ])
        ]),
        Animated.parallel([
          Animated.timing(liftDoorsSlide, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true
          }),
          Animated.timing(workspaceRevealOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true
          })
        ])
      ]).start();
    } else if (idx === 2) {
      deskChairSlide.setValue(30);
      deskChairOpacity.setValue(0);
      laptopLidAngle.setValue(0);
      laptopScreenGlow.setValue(0);
      deskPassCardScale.setValue(0.8);
      deskPassCardOpacity.setValue(0);

      Animated.sequence([
        Animated.parallel([
          Animated.spring(deskChairSlide, {
            toValue: 0,
            friction: 6,
            tension: 50,
            useNativeDriver: true
          }),
          Animated.timing(deskChairOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true
          })
        ]),
        Animated.parallel([
          Animated.timing(laptopLidAngle, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true
          }),
          Animated.timing(laptopScreenGlow, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
          })
        ]),
        Animated.parallel([
          Animated.spring(deskPassCardScale, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true
          }),
          Animated.timing(deskPassCardOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true
          })
        ])
      ]).start();
    }
  };

  useEffect(() => {
    const walkCycle = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(walkLeg1, {
            toValue: 20,
            duration: 260,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          }),
          Animated.timing(walkLeg2, {
            toValue: -20,
            duration: 260,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          }),
          Animated.timing(walkArm1, {
            toValue: -15,
            duration: 260,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          }),
          Animated.timing(walkArm2, {
            toValue: 15,
            duration: 260,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          }),
          Animated.sequence([
            Animated.timing(walkBob, {
              toValue: -4,
              duration: 130,
              useNativeDriver: true
            }),
            Animated.timing(walkBob, {
              toValue: 0,
              duration: 130,
              useNativeDriver: true
            })
          ])
        ]),
        Animated.parallel([
          Animated.timing(walkLeg1, {
            toValue: -20,
            duration: 260,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          }),
          Animated.timing(walkLeg2, {
            toValue: 20,
            duration: 260,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          }),
          Animated.timing(walkArm1, {
            toValue: 15,
            duration: 260,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          }),
          Animated.timing(walkArm2, {
            toValue: -15,
            duration: 260,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          }),
          Animated.sequence([
            Animated.timing(walkBob, {
              toValue: -4,
              duration: 130,
              useNativeDriver: true
            }),
            Animated.timing(walkBob, {
              toValue: 0,
              duration: 130,
              useNativeDriver: true
            })
          ])
        ])
      ])
    );
    walkCycle.start();

    const pathCycle = Animated.loop(
      Animated.timing(walkPathMove, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true
      })
    );
    pathCycle.start();

    const steamCycle = Animated.loop(
      Animated.sequence([
        Animated.timing(coffeeSteam, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(coffeeSteam, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ])
    );
    steamCycle.start();

    const indicatorCycle = Animated.loop(
      Animated.sequence([
        Animated.timing(liftIndicatorPulse, {
          toValue: 1.25,
          duration: 400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(liftIndicatorPulse, {
          toValue: 1,
          duration: 400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ])
    );
    indicatorCycle.start();

    startSceneLoop(0);

    return () => {
      walkCycle.stop();
      pathCycle.stop();
      steamCycle.stop();
      indicatorCycle.stop();
      if (progressAnimationRef.current) {
        progressAnimationRef.current.stop();
      }
    };
  }, []);

  const handleNext = (targetIdx: number) => {
    if (targetIdx > 2) {
      triggerExit();
      return;
    }
    setSceneIndex(targetIdx);
    startSceneLoop(targetIdx);
  };

  const triggerExit = () => {
    if (progressAnimationRef.current) {
      progressAnimationRef.current.stop();
    }
    Animated.parallel([
      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true
      }),
      Animated.timing(exitScale, {
        toValue: 0.96,
        duration: 350,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true
      })
    ]).start(() => {
      onFinish();
    });
  };

  const scenes = [
    {
      step: 'STEP 1 OF 3 • ARRIVAL',
      title: 'Walking into HavenlyWork',
      subtitle: 'Arriving at the premium coworking & private office tower in Madhapur'
    },
    {
      step: 'STEP 2 OF 3 • ASCENDING',
      title: 'Taking the High-Speed Lift',
      subtitle: 'Ascending to Floor 4 executive workspace & private cabin deck'
    },
    {
      step: 'STEP 3 OF 3 • PRODUCTIVITY',
      title: 'Settled In & Ready to Build',
      subtitle: 'Your reserved desk is prepped with 500 Mbps WiFi and artisan coffee'
    }
  ];

  const currentScene = scenes[sceneIndex];

  return (
    <Animated.View
      style={[
        styles.fullScreen,
        {
          backgroundColor: isDark ? '#060A14' : '#F8FAFC',
          opacity: exitOpacity,
          transform: [{ scale: exitScale }]
        }
      ]}
    >
      <View style={styles.topProgressRow}>
        {[0, 1, 2].map((idx) => {
          let fillWidth: any = '0%';
          if (idx < sceneIndex) {
            fillWidth = '100%';
          } else if (idx === sceneIndex) {
            fillWidth = progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%']
            });
          }
          return (
            <View
              key={idx}
              style={[
                styles.progressTrack,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' }
              ]}
            >
              <Animated.View
                style={[
                  styles.progressBarFill,
                  { width: fillWidth, backgroundColor: '#00A859' }
                ]}
              />
            </View>
          );
        })}
      </View>

      <View style={styles.headerBar}>
        <HavenlyLogo variant="horizontal" size={26} textColor={isDark ? '#FFFFFF' : '#0F172A'} />
        <TouchableOpacity style={styles.skipButton} onPress={triggerExit} activeOpacity={0.7}>
          <Text style={[styles.skipButtonText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
            Skip
          </Text>
          <Ionicons name="chevron-forward" size={14} color={isDark ? '#94A3B8' : '#64748B'} />
        </TouchableOpacity>
      </View>

      <View style={styles.canvasContainer}>
        {sceneIndex === 0 && (
          <View style={styles.sceneCanvas}>
            <View style={styles.buildingFacade}>
              <View style={[styles.buildingRoof, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
                <View style={styles.hubSignBadge}>
                  <Text style={styles.hubSignText}>HAVENLYWORK TOWER</Text>
                </View>
              </View>
              <View style={styles.buildingGlassWall}>
                <View style={[styles.glassPane, { backgroundColor: isDark ? 'rgba(0,168,89,0.08)' : 'rgba(0,168,89,0.12)' }]} />
                <View style={[styles.glassPane, { backgroundColor: isDark ? 'rgba(0,168,89,0.08)' : 'rgba(0,168,89,0.12)' }]} />
                <View style={[styles.glassPane, { backgroundColor: isDark ? 'rgba(0,168,89,0.08)' : 'rgba(0,168,89,0.12)' }]} />
              </View>
              <View style={styles.lobbyEntranceFrame}>
                <Animated.View
                  style={[
                    styles.slidingDoor,
                    styles.doorLeft,
                    { transform: [{ translateX: glassDoorLeft }] }
                  ]}
                />
                <Animated.View
                  style={[
                    styles.slidingDoor,
                    styles.doorRight,
                    { transform: [{ translateX: glassDoorRight }] }
                  ]}
                />
                <View style={styles.lobbyInterior}>
                  <Ionicons name="business" size={28} color="#00A859" />
                  <Text style={styles.lobbyWelcome}>Main Lobby</Text>
                </View>
              </View>
            </View>

            <View style={styles.walkwayContainer}>
              <Animated.View
                style={[
                  styles.walkingCharacterWrap,
                  {
                    transform: [{ translateY: walkBob }]
                  }
                ]}
              >
                <View style={styles.charHead} />
                <View style={styles.charTorso}>
                  <Animated.View
                    style={[
                      styles.charArm,
                      {
                        transform: [
                          { rotate: walkArm1.interpolate({ inputRange: [-20, 20], outputRange: ['-20deg', '20deg'] }) }
                        ]
                      }
                    ]}
                  />
                  <View style={styles.charBriefcase} />
                  <Animated.View
                    style={[
                      styles.charArm,
                      {
                        transform: [
                          { rotate: walkArm2.interpolate({ inputRange: [-20, 20], outputRange: ['20deg', '-20deg'] }) }
                        ]
                      }
                    ]}
                  />
                </View>
                <View style={styles.charLegsRow}>
                  <Animated.View
                    style={[
                      styles.charLeg,
                      {
                        transform: [
                          { rotate: walkLeg1.interpolate({ inputRange: [-20, 20], outputRange: ['-20deg', '20deg'] }) }
                        ]
                      }
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.charLeg,
                      {
                        transform: [
                          { rotate: walkLeg2.interpolate({ inputRange: [-20, 20], outputRange: ['20deg', '-20deg'] }) }
                        ]
                      }
                    ]}
                  />
                </View>
                <View style={styles.charShadow} />
              </Animated.View>

              <View style={styles.pathLinesWrap}>
                <View style={[styles.pathLine, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
                <View style={[styles.pathLine, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
              </View>
            </View>
          </View>
        )}

        {sceneIndex === 1 && (
          <View style={styles.sceneCanvas}>
            <View style={styles.liftHousing}>
              <View style={styles.liftHeaderDisplay}>
                <Animated.View
                  style={{
                    transform: [{ scale: liftIndicatorPulse }]
                  }}
                >
                  <Ionicons name="caret-up" size={16} color="#00A859" />
                </Animated.View>
                <View style={styles.liftFloorBadge}>
                  <Text style={styles.liftFloorText}>{currentFloorText}</Text>
                </View>
                <Ionicons name="notifications" size={14} color="#F59E0B" />
              </View>

              <View style={styles.liftShaftFrame}>
                <Animated.View
                  style={[
                    styles.liftInteriorWorkspaceReveal,
                    { opacity: workspaceRevealOpacity }
                  ]}
                >
                  <View style={styles.revealDeskRow}>
                    <Ionicons name="desktop-outline" size={24} color="#00A859" />
                    <Ionicons name="cafe-outline" size={20} color="#F59E0B" />
                    <Ionicons name="wifi" size={20} color="#00A859" />
                  </View>
                  <Text style={styles.revealDeckTitle}>Floor 4 Executive Deck</Text>
                  <Text style={styles.revealDeckSub}>Workspace reserved and ready</Text>
                </Animated.View>

                <Animated.View
                  style={[
                    styles.liftSlidingDoorLeft,
                    {
                      transform: [
                        {
                          translateX: liftDoorsSlide.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -80]
                          })
                        }
                      ]
                    }
                  ]}
                >
                  <View style={styles.liftDoorHandle} />
                </Animated.View>

                <Animated.View
                  style={[
                    styles.liftSlidingDoorRight,
                    {
                      transform: [
                        {
                          translateX: liftDoorsSlide.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 80]
                          })
                        }
                      ]
                    }
                  ]}
                >
                  <View style={styles.liftDoorHandle} />
                </Animated.View>

                <Animated.View
                  style={[
                    styles.chimeRing,
                    {
                      opacity: chimePulse.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 0.8, 0]
                      }),
                      transform: [
                        {
                          scale: chimePulse.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1.4]
                          })
                        }
                      ]
                    }
                  ]}
                />
              </View>

              <View style={styles.liftCallPill}>
                <Ionicons name="speedometer-outline" size={13} color="#00A859" style={{ marginRight: 4 }} />
                <Text style={styles.liftCallPillText}>High-Speed Smart Elevator</Text>
              </View>
            </View>
          </View>
        )}

        {sceneIndex === 2 && (
          <View style={styles.sceneCanvas}>
            <Animated.View
              style={[
                styles.workstationArea,
                {
                  opacity: deskChairOpacity,
                  transform: [{ translateY: deskChairSlide }]
                }
              ]}
            >
              <View style={styles.workstationLampCone} />

              <View style={styles.chairAndCharGroup}>
                <View style={styles.seatedWorkerHead} />
                <View style={styles.seatedWorkerTorso}>
                  <View style={styles.seatedWorkerArms} />
                </View>
                <View style={styles.ergonomicChairBack} />
              </View>

              <View style={styles.modernDeskSurface}>
                <View style={styles.deskLamp}>
                  <Ionicons name="sunny" size={14} color="#F59E0B" />
                </View>

                <Animated.View
                  style={[
                    styles.laptopUnit,
                    {
                      transform: [
                        {
                          rotateX: laptopLidAngle.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['80deg', '0deg']
                          })
                        }
                      ]
                    }
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.laptopDisplayScreen,
                      {
                        borderColor: laptopScreenGlow.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['#334155', '#00A859']
                        })
                      }
                    ]}
                  >
                    <Ionicons name="code-slash" size={12} color="#00A859" />
                  </Animated.View>
                  <View style={styles.laptopKeyboardBase} />
                </Animated.View>

                <View style={styles.coffeeCupUnit}>
                  <Animated.View
                    style={[
                      styles.coffeeSteamWrap,
                      {
                        transform: [
                          {
                            translateY: coffeeSteam.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, -6]
                            })
                          }
                        ],
                        opacity: coffeeSteam.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0.3, 0.9, 0.3]
                        })
                      }
                    ]}
                  >
                    <Ionicons name="cloud" size={10} color="#94A3B8" />
                  </Animated.View>
                  <View style={styles.coffeeMugBody}>
                    <View style={styles.coffeeMugHandle} />
                  </View>
                </View>
              </View>

              <View style={styles.deskLegsRow}>
                <View style={styles.deskLeg} />
                <View style={styles.deskLeg} />
              </View>
            </Animated.View>

            <Animated.View
              style={[
                styles.confirmedPassBadge,
                {
                  opacity: deskPassCardOpacity,
                  transform: [{ scale: deskPassCardScale }],
                  backgroundColor: isDark ? '#0F1E17' : '#ECFDF5',
                  borderColor: isDark ? '#065F46' : '#A7F3D0'
                }
              ]}
            >
              <View style={styles.passIconCircle}>
                <Ionicons name="checkmark-sharp" size={16} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.passDeskName}>Dedicated Desk #04 Confirmed</Text>
                <Text style={styles.passDeskAmenities}>500 Mbps WiFi • Power Pod • Unlimited Coffee</Text>
              </View>
            </Animated.View>
          </View>
        )}
      </View>

      <View style={styles.narrativeBox}>
        <View style={styles.stepPill}>
          <Text style={styles.stepPillText}>{currentScene.step}</Text>
        </View>
        <Text style={[styles.sceneTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
          {currentScene.title}
        </Text>
        <Text style={[styles.sceneSubtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
          {currentScene.subtitle}
        </Text>
      </View>

      <View style={styles.bottomControlsBar}>
        <View style={styles.dotsRow}>
          {[0, 1, 2].map((idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handleNext(idx)}
              style={[
                styles.dotIndicator,
                sceneIndex === idx
                  ? [styles.dotActive, { backgroundColor: '#00A859' }]
                  : [styles.dotInactive, { backgroundColor: isDark ? '#334155' : '#CBD5E1' }]
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={() => handleNext(sceneIndex + 1)}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryActionButtonText}>
            {sceneIndex === 2 ? 'Get Started' : 'Next Step'}
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    paddingTop: 18,
    paddingBottom: 24,
    justifyContent: 'space-between'
  },
  topProgressRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginTop: 8
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    marginTop: 14
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10
  },
  skipButtonText: {
    fontSize: 13,
    fontWeight: '700',
    marginRight: 2
  },
  canvasContainer: {
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10
  },
  sceneCanvas: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buildingFacade: {
    width: width * 0.72,
    height: 120,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#00A859',
    backgroundColor: 'rgba(0,168,89,0.05)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  buildingRoof: {
    width: '100%',
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,168,89,0.3)'
  },
  hubSignBadge: {
    backgroundColor: '#00A859',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8
  },
  hubSignText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1
  },
  buildingGlassWall: {
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-between',
    height: 40
  },
  glassPane: {
    flex: 1,
    marginHorizontal: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,168,89,0.25)'
  },
  lobbyEntranceFrame: {
    width: 110,
    height: 48,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: '#0F172A',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center'
  },
  slidingDoor: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 55,
    backgroundColor: 'rgba(0,168,89,0.4)',
    borderWidth: 1,
    borderColor: '#00A859',
    zIndex: 2
  },
  doorLeft: {
    left: 0
  },
  doorRight: {
    right: 0
  },
  lobbyInterior: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1
  },
  lobbyWelcome: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1
  },
  walkwayContainer: {
    alignItems: 'center',
    marginTop: 12
  },
  walkingCharacterWrap: {
    alignItems: 'center',
    zIndex: 3
  },
  charHead: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F59E0B'
  },
  charTorso: {
    width: 24,
    height: 28,
    backgroundColor: '#00A859',
    borderRadius: 6,
    marginTop: 2,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center'
  },
  charArm: {
    position: 'absolute',
    width: 5,
    height: 20,
    backgroundColor: '#00A859',
    borderRadius: 3,
    top: 4
  },
  charBriefcase: {
    width: 12,
    height: 9,
    borderRadius: 2,
    backgroundColor: '#78350F',
    position: 'absolute',
    bottom: 2,
    right: -6
  },
  charLegsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2
  },
  charLeg: {
    width: 5,
    height: 22,
    backgroundColor: '#1E293B',
    borderRadius: 3
  },
  charShadow: {
    width: 32,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.18)',
    marginTop: 2
  },
  pathLinesWrap: {
    flexDirection: 'row',
    width: 80,
    justifyContent: 'space-between',
    marginTop: -8,
    zIndex: 1
  },
  pathLine: {
    width: 1,
    height: 36,
    borderStyle: 'dashed',
    borderWidth: 1
  },
  liftHousing: {
    width: width * 0.72,
    height: 210,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#00A859',
    backgroundColor: 'rgba(0,168,89,0.04)',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12
  },
  liftHeaderDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#0F172A'
  },
  liftFloorBadge: {
    backgroundColor: '#00A859',
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 8
  },
  liftFloorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  liftShaftFrame: {
    width: 180,
    height: 120,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#334155',
    backgroundColor: '#0B1120',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center'
  },
  liftInteriorWorkspaceReveal: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1
  },
  revealDeskRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 6
  },
  revealDeckTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  revealDeckSub: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2
  },
  liftSlidingDoorLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 90,
    backgroundColor: '#1E293B',
    borderRightWidth: 1,
    borderRightColor: '#475569',
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 6
  },
  liftSlidingDoorRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 90,
    backgroundColor: '#1E293B',
    borderLeftWidth: 1,
    borderLeftColor: '#475569',
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 6
  },
  liftDoorHandle: {
    width: 3,
    height: 24,
    borderRadius: 1.5,
    backgroundColor: '#00A859'
  },
  chimeRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#00A859',
    zIndex: 3
  },
  liftCallPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(0,168,89,0.1)'
  },
  liftCallPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00A859'
  },
  workstationArea: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
    width: '100%',
    position: 'relative'
  },
  workstationLampCone: {
    position: 'absolute',
    top: -10,
    width: 90,
    height: 70,
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderBottomLeftRadius: 45,
    borderBottomRightRadius: 45
  },
  chairAndCharGroup: {
    alignItems: 'center',
    marginBottom: -16,
    zIndex: 1
  },
  seatedWorkerHead: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F59E0B'
  },
  seatedWorkerTorso: {
    width: 26,
    height: 26,
    backgroundColor: '#00A859',
    borderRadius: 6,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  seatedWorkerArms: {
    width: 32,
    height: 5,
    backgroundColor: '#00A859',
    borderRadius: 2.5
  },
  ergonomicChairBack: {
    position: 'absolute',
    width: 36,
    height: 38,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#475569',
    top: 4,
    zIndex: -1
  },
  modernDeskSurface: {
    width: 200,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#92400E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 2
  },
  deskLamp: {
    marginTop: -16
  },
  laptopUnit: {
    alignItems: 'center',
    marginTop: -18
  },
  laptopDisplayScreen: {
    width: 38,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  laptopKeyboardBase: {
    width: 42,
    height: 3,
    backgroundColor: '#64748B',
    borderRadius: 1.5
  },
  coffeeCupUnit: {
    alignItems: 'center',
    marginTop: -14
  },
  coffeeSteamWrap: {
    marginBottom: -2
  },
  coffeeMugBody: {
    width: 12,
    height: 13,
    backgroundColor: '#00A859',
    borderRadius: 3,
    position: 'relative'
  },
  coffeeMugHandle: {
    position: 'absolute',
    right: -4,
    top: 2,
    width: 4,
    height: 7,
    borderWidth: 1,
    borderColor: '#00A859',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3
  },
  deskLegsRow: {
    flexDirection: 'row',
    width: 170,
    justifyContent: 'space-between',
    zIndex: 1
  },
  deskLeg: {
    width: 4,
    height: 28,
    backgroundColor: '#1E293B',
    borderRadius: 2
  },
  confirmedPassBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width * 0.84,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    marginTop: 16
  },
  passIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#00A859',
    alignItems: 'center',
    justifyContent: 'center'
  },
  passDeskName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#00A859'
  },
  passDeskAmenities: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  },
  narrativeBox: {
    alignItems: 'center',
    paddingHorizontal: 24
  },
  stepPill: {
    backgroundColor: 'rgba(0,168,89,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8
  },
  stepPillText: {
    color: '#00A859',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1
  },
  sceneTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: 6
  },
  sceneSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    maxWidth: 320
  },
  bottomControlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 8
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  dotIndicator: {
    height: 6,
    borderRadius: 3
  },
  dotActive: {
    width: 22
  },
  dotInactive: {
    width: 6
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A859',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 18,
    shadowColor: '#00A859',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3
  },
  primaryActionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  }
});
