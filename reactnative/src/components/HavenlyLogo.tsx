import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Circle,
  G,
  Text as SvgText,
  Line,
  Defs,
  LinearGradient,
  Stop
} from 'react-native-svg';

interface LogoProps {
  size?: number;
  color?: string;
  leafColor?: string;
  textColor?: string;
  taglineColor?: string;
  withText?: boolean;
  withTagline?: boolean;
  horizontal?: boolean;
  variant?: 'horizontal' | 'vertical';
}

export const HavenlyLogoMark: React.FC<{ size?: number; color?: string; leafColor?: string }> = ({
  size = 64,
  color = '#00A859',
  leafColor = '#00C261'
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <Defs>
        <LinearGradient id="havenlyStemGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#00C261" />
          <Stop offset="100%" stopColor="#008C4A" />
        </LinearGradient>
        <LinearGradient id="havenlyArchGrad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#00A859" />
          <Stop offset="100%" stopColor="#34D399" />
        </LinearGradient>
      </Defs>

      {/* Ground arc */}
      <Path
        d="M 12 98 Q 60 88 108 98"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Left pillar of H with rounded top */}
      <Path
        d="M 28 32 C 28 20 40 20 40 32 L 40 92 L 28 92 Z"
        fill="url(#havenlyStemGrad)"
      />

      {/* Right pillar of H with rounded top */}
      <Path
        d="M 80 32 C 80 20 92 20 92 32 L 92 92 L 80 92 Z"
        fill="url(#havenlyStemGrad)"
      />

      {/* Swooping Vine Arch Bridge */}
      <Path
        d="M 28 58 Q 50 38 88 44 Q 96 45 106 36 C 104 46 95 54 86 52 Q 54 48 30 70 Z"
        fill="url(#havenlyArchGrad)"
      />

      {/* Leaf pointing outwards */}
      <Path
        d="M 88 44 C 98 42 108 32 108 32 C 108 32 104 46 92 50 Z"
        fill={leafColor}
      />
      <Path
        d="M 90 44 Q 98 38 106 34"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Under Arch Interior: Cozy Coworking Space Table, Chairs & Lamp */}
      {/* Hanging Pendant Lamp cord & shade */}
      <Line x1="60" y1="44" x2="60" y2="52" stroke={color} strokeWidth="1.5" />
      <Path d="M 54 55 Q 60 50 66 55 Z" fill={color} />
      <Circle cx="60" cy="56" r="1.5" fill="#FBBF24" />

      {/* Plant on table */}
      <Path d="M 58 64 Q 57 60 55 60 C 56 62 58 64 58 64 Z" fill="#00C261" />
      <Path d="M 62 64 Q 63 60 65 60 C 64 62 62 64 62 64 Z" fill="#00C261" />
      <Path d="M 58 64 L 62 64 L 61 67 L 59 67 Z" fill={color} />

      {/* Table */}
      <Path d="M 51 68 L 69 68 L 68 70 L 52 70 Z" fill={color} />
      <Line x1="60" y1="70" x2="60" y2="88" stroke={color} strokeWidth="2" />
      <Line x1="54" y1="88" x2="66" y2="88" stroke={color} strokeWidth="2.5" strokeLinecap="round" />

      {/* Left Chair */}
      <Path d="M 46 66 Q 44 74 46 78 L 51 78" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      <Line x1="47" y1="78" x2="45" y2="88" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="50" y1="78" x2="51" y2="88" stroke={color} strokeWidth="2" strokeLinecap="round" />

      {/* Right Chair */}
      <Path d="M 74 66 Q 76 74 74 78 L 69 78" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      <Line x1="73" y1="78" x2="75" y2="88" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="70" y1="78" x2="69" y2="88" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
};

export const HavenlyLogo: React.FC<LogoProps> = ({
  size = 140,
  color = '#00A859',
  leafColor = '#00C261',
  textColor = '#0A3826',
  taglineColor = '#64748B',
  withText = true,
  withTagline = true,
  horizontal = false,
  variant
}) => {
  const isHorizontal = horizontal || variant === 'horizontal';
  if (isHorizontal) {
    const markSize = Math.round(size * 0.38);
    return (
      <View style={styles.horizontalContainer}>
        <HavenlyLogoMark size={markSize} color={color} leafColor={leafColor} />
        {withText && (
          <View style={styles.horizontalTextWrapper}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Svg height={Math.round(markSize * 0.6)} width={180} viewBox="0 0 200 40">
                <SvgText
                  x="0"
                  y="30"
                  fill={textColor}
                  fontSize="28"
                  fontWeight="900"
                  fontFamily="System"
                  letterSpacing="-0.5"
                >
                  Havenly<SvgText fill="#00A859">Work</SvgText>
                </SvgText>
              </Svg>
            </View>
            {withTagline && (
              <View style={styles.taglineRow}>
                <View style={[styles.taglineDash, { backgroundColor: taglineColor }]} />
                <Svg height={16} width={170} viewBox="0 0 180 16">
                  <SvgText
                    x="90"
                    y="12"
                    textAnchor="middle"
                    fill={taglineColor}
                    fontSize="9.5"
                    fontWeight="800"
                    letterSpacing="1.2"
                  >
                    COWORK • CONNECT • GROW
                  </SvgText>
                </Svg>
                <View style={[styles.taglineDash, { backgroundColor: taglineColor }]} />
              </View>
            )}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.verticalContainer}>
      <HavenlyLogoMark size={size} color={color} leafColor={leafColor} />
      {withText && (
        <View style={styles.verticalTextWrapper}>
          <Svg height={42} width={240} viewBox="0 0 240 40">
            <SvgText
              x="120"
              y="30"
              textAnchor="middle"
              fill={textColor}
              fontSize="30"
              fontWeight="900"
              fontFamily="System"
              letterSpacing="-0.5"
            >
              Havenly<SvgText fill="#00A859">Work</SvgText>
            </SvgText>
          </Svg>

          {withTagline && (
            <View style={styles.taglineRowCenter}>
              <View style={[styles.taglineDash, { backgroundColor: taglineColor }]} />
              <Svg height={16} width={180} viewBox="0 0 180 16">
                <SvgText
                  x="90"
                  y="12"
                  textAnchor="middle"
                  fill={taglineColor}
                  fontSize="9.5"
                  fontWeight="800"
                  letterSpacing="1.4"
                >
                  SPACE FOR TOGETHERNESS
                </SvgText>
              </Svg>
              <View style={[styles.taglineDash, { backgroundColor: taglineColor }]} />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  horizontalTextWrapper: {
    marginLeft: 10,
    justifyContent: 'center'
  },
  verticalContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  verticalTextWrapper: {
    alignItems: 'center',
    marginTop: 8
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2
  },
  taglineRowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4
  },
  taglineDash: {
    width: 14,
    height: 1.5,
    opacity: 0.6
  }
});
