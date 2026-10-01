import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../theme/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;

export interface LineDataPoint {
  label: string;
  value: number;
}

export interface BarDataPoint {
  label: string;
  value: number;
  highlight?: boolean;
}

export interface ExecutiveLineChartProps {
  title: string;
  subtitle?: string;
  data: LineDataPoint[];
  unit?: string;
  height?: number;
  color?: string;
}

export const ExecutiveLineChart: React.FC<ExecutiveLineChartProps> = ({
  title,
  subtitle,
  data,
  unit = 'h',
  height = 140,
  color = colors.brassLight
}) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const chartWidth = SCREEN_WIDTH - 64;
  const pointWidth = chartWidth / data.length;

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <View>
          <Text style={styles.chartTitle}>{title}</Text>
          {subtitle && <Text style={styles.chartSubtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.unitBadge}>
          <Text style={styles.unitBadgeText}>
            Max {maxValue}
            {unit}
          </Text>
        </View>
      </View>

      <View style={[styles.plotArea, { height }]}>
        <View style={[styles.gridLine, { top: '0%' }]} />
        <View style={[styles.gridLine, { top: '50%' }]} />
        <View style={[styles.gridLine, { top: '100%' }]} />

        <View style={styles.barsOverlay}>
          {data.map((item, index) => {
            const barHeight = Math.max((item.value / maxValue) * (height - 24), 4);
            const isPeak = item.value === maxValue && item.value > 0;

            return (
              <View
                key={index}
                style={[styles.colContainer, { width: pointWidth }]}
              >
                {item.value > 0 && (
                  <Text
                    style={[
                      styles.floatingValue,
                      isPeak && styles.floatingValuePeak
                    ]}
                  >
                    {item.value}
                    {unit}
                  </Text>
                )}
                <View style={styles.colTrack}>
                  <View
                    style={[
                      styles.chartColumn,
                      {
                        height: barHeight,
                        backgroundColor: isPeak ? colors.brassLight : color,
                        opacity: item.value === 0 ? 0.2 : 0.85
                      }
                    ]}
                  >
                    <View style={styles.columnCap} />
                  </View>
                </View>
                <Text
                  style={[
                    styles.axisLabel,
                    isPeak && styles.axisLabelHighlight
                  ]}
                >
                  {item.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export interface ExecutiveBarChartProps {
  title: string;
  subtitle?: string;
  data: BarDataPoint[];
  unit?: string;
  height?: number;
}

export const ExecutiveBarChart: React.FC<ExecutiveBarChartProps> = ({
  title,
  subtitle,
  data,
  unit = '',
  height = 140
}) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const chartWidth = SCREEN_WIDTH - 64;
  const barWidth = chartWidth / data.length;

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <View>
          <Text style={styles.chartTitle}>{title}</Text>
          {subtitle && <Text style={styles.chartSubtitle}>{subtitle}</Text>}
        </View>
      </View>

      <View style={[styles.plotArea, { height }]}>
        <View style={[styles.gridLine, { top: '0%' }]} />
        <View style={[styles.gridLine, { top: '50%' }]} />
        <View style={[styles.gridLine, { top: '100%' }]} />

        <View style={styles.barsOverlay}>
          {data.map((item, index) => {
            const barH = Math.max((item.value / maxValue) * (height - 30), 4);
            const isHighlight = item.highlight || item.value === maxValue;

            return (
              <View
                key={index}
                style={[styles.colContainer, { width: barWidth }]}
              >
                <Text
                  style={[
                    styles.barTopValue,
                    isHighlight && { color: colors.brassLight, fontWeight: '800' }
                  ]}
                  numberOfLines={1}
                >
                  {item.value}
                  {unit}
                </Text>

                <View style={styles.colTrack}>
                  <View
                    style={[
                      styles.solidBar,
                      {
                        height: barH,
                        backgroundColor: isHighlight
                          ? colors.brassLight
                          : 'rgba(217, 168, 92, 0.45)',
                        borderColor: isHighlight
                          ? colors.brass
                          : 'rgba(217, 168, 92, 0.2)'
                      }
                    ]}
                  />
                </View>

                <Text
                  style={[
                    styles.axisLabel,
                    isHighlight && styles.axisLabelHighlight
                  ]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export interface QuotaSegment {
  label: string;
  hours: number;
  color: string;
}

export interface QuotaRingProps {
  granted: number;
  available: number;
  reserved: number;
  consumed: number;
  onPressBook?: () => void;
}

export const QuotaRing: React.FC<QuotaRingProps> = ({
  granted,
  available,
  reserved,
  consumed
}) => {
  const safeGranted = granted > 0 ? granted : 20;
  const availPct = Math.round((available / safeGranted) * 100);
  const resPct = Math.round((reserved / safeGranted) * 100);
  const conPct = Math.round((consumed / safeGranted) * 100);

  return (
    <View style={styles.quotaContainer}>
      <View style={styles.gaugeHeader}>
        <View>
          <Text style={styles.quotaHeaderTitle}>MONTHLY ALLOWANCE QUOTA</Text>
          <Text style={styles.quotaAvailableText}>
            {available}
            <Text style={styles.quotaAvailableUnit}> hrs available</Text>
          </Text>
        </View>
        <View style={styles.poolBadge}>
          <Text style={styles.poolBadgeText}>{granted}h Tier Pool</Text>
        </View>
      </View>

      <View style={styles.segmentedTrack}>
        {available > 0 && (
          <View
            style={[
              styles.segment,
              { flex: availPct, backgroundColor: colors.success }
            ]}
          />
        )}
        {reserved > 0 && (
          <View
            style={[
              styles.segment,
              { flex: resPct, backgroundColor: colors.warning }
            ]}
          />
        )}
        {consumed > 0 && (
          <View
            style={[
              styles.segment,
              { flex: conPct, backgroundColor: colors.info }
            ]}
          />
        )}
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
          <Text style={styles.legendLabel}>Available: {available}h</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
          <Text style={styles.legendLabel}>Reserved: {reserved}h</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.info }]} />
          <Text style={styles.legendLabel}>Consumed: {consumed}h</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 18,
    marginBottom: 16
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 0.5
  },
  chartSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2
  },
  unitBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(217, 168, 92, 0.12)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(217, 168, 92, 0.25)'
  },
  unitBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.brassLight
  },
  plotArea: {
    width: '100%',
    position: 'relative',
    justifyContent: 'flex-end'
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)'
  },
  barsOverlay: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    width: '100%'
  },
  colContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%'
  },
  colTrack: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center'
  },
  chartColumn: {
    width: '50%',
    maxWidth: 18,
    minWidth: 8,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    position: 'relative'
  },
  columnCap: {
    height: 3,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    opacity: 0.8
  },
  solidBar: {
    width: '58%',
    maxWidth: 22,
    minWidth: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    borderBottomWidth: 0
  },
  floatingValue: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 4
  },
  floatingValuePeak: {
    color: colors.brassLight,
    fontWeight: '800'
  },
  barTopValue: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 4
  },
  axisLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 6,
    fontWeight: '600'
  },
  axisLabelHighlight: {
    color: colors.brassLight,
    fontWeight: '800'
  },
  quotaContainer: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 18,
    marginBottom: 16
  },
  gaugeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14
  },
  quotaHeaderTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.brassLight,
    marginBottom: 2
  },
  quotaAvailableText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary
  },
  quotaAvailableUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted
  },
  poolBadge: {
    backgroundColor: 'rgba(217, 168, 92, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.brass
  },
  poolBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.brassLight
  },
  segmentedTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 12,
    gap: 2
  },
  segment: {
    height: '100%',
    borderRadius: 2
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted
  }
});
