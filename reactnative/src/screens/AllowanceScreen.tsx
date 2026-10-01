import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { mobileApi } from '../services/api';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface AllowanceScreenProps {
  onOpenNotifications: () => void;
  unreadNotifsCount: number;
}

export const AllowanceScreen: React.FC<AllowanceScreenProps> = ({
  onOpenNotifications,
  unreadNotifsCount
}) => {
  const { user } = useAuth();
  const isAdminRole = user?.role === 'SUPER_ADMIN' || user?.role === 'COWORKING_ADMIN';
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(user?.companyId || '');

  const [current, setCurrent] = useState<any>(null);
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllowance = async (overrideCompId?: string) => {
    try {
      const cId = overrideCompId !== undefined ? overrideCompId : (isAdminRole ? selectedCompanyId : user?.companyId);
      const [curr, hist] = await Promise.all([
        mobileApi.getCurrentAllowance(cId || undefined),
        mobileApi.getAllowanceHistory(cId || undefined)
      ]);
      setCurrent(curr);
      setLedger(hist?.ledger || []);
    } catch (err) {
      console.error('Failed to load allowance:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdminRole) {
      mobileApi
        .getCompanies()
        .then((comps) => {
          if (comps && comps.length > 0) {
            setCompanies(comps);
            const initialId = comps[0]._id;
            setSelectedCompanyId(initialId);
            fetchAllowance(initialId);
          } else {
            fetchAllowance();
          }
        })
        .catch(() => fetchAllowance());
    } else {
      fetchAllowance();
    }
  }, [isAdminRole]);

  const handleSelectCompany = (cId: string) => {
    setSelectedCompanyId(cId);
    fetchAllowance(cId);
  };

  const totalGranted = current?.grantedHours ?? current?.totalGrantedHours ?? 20;
  const availableHours = current?.balanceHours ?? current?.availableHours ?? 20;
  const consumedHours = current?.consumedHours || 0;
  const reservedHours = current?.reservedHours || 0;
  const usedHours = consumedHours + reservedHours;
  const rawPct = Math.round((usedHours / (totalGranted || 1)) * 100);
  const percentUsed = isNaN(rawPct) ? 0 : Math.max(0, Math.min(100, rawPct));

  return (
    <View style={styles.container}>
      <Header
        title="Quota & Ledger"
        subtitle="Allowance Accounting"
        unreadCount={unreadNotifsCount}
        onPressNotifications={onOpenNotifications}
      />

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.brassLight} />
        </View>
      ) : (
        <FlatList
          data={ledger}
          keyExtractor={(item, idx) => item._id || item.id || `ledger-${idx}`}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchAllowance();
              }}
              tintColor={colors.brassLight}
            />
          }
          ListHeaderComponent={
            <View style={styles.headerWrap}>
              {}
              {isAdminRole && companies.length > 0 && (
                <View style={styles.adminSelectorWrap}>
                  <Text style={styles.adminSelectorLabel}>INSPECT CORPORATE ACCOUNT</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.companyPillRow}
                  >
                    {companies.map((c) => {
                      const isSel = selectedCompanyId === c._id;
                      return (
                        <TouchableOpacity
                          key={c._id}
                          onPress={() => handleSelectCompany(c._id)}
                          style={[
                            styles.companyPill,
                            isSel && styles.companyPillActive
                          ]}
                        >
                          <Ionicons
                            name="business"
                            size={12}
                            color={isSel ? '#090D16' : colors.brassLight}
                            style={{ marginRight: 6 }}
                          />
                          <Text
                            style={[
                              styles.companyPillText,
                              isSel && styles.companyPillTextActive
                            ]}
                          >
                            {c.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {}
              <View style={styles.summaryCard}>
                <Text style={styles.summarySubtitle}>ACTIVE BILLING PERIOD</Text>
                <Text style={styles.summaryTitle}>Monthly Complimentary Pool</Text>

                <View style={styles.balanceRow}>
                  <Text style={styles.balanceBig}>{availableHours}h</Text>
                  <Text style={styles.balanceLabel}>available now</Text>
                </View>

                {}
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${percentUsed}%` }]} />
                </View>
                <Text style={styles.progressText}>
                  {usedHours} of {totalGranted} hours used ({percentUsed}%)
                </Text>

                <View style={styles.pillsRow}>
                  <View style={styles.pill}>
                    <Text style={styles.pillLabel}>GRANTED</Text>
                    <Text style={styles.pillVal}>{totalGranted}h</Text>
                  </View>
                  <View style={styles.pill}>
                    <Text style={styles.pillLabel}>RESERVED</Text>
                    <Text style={[styles.pillVal, { color: colors.info }]}>{reservedHours}h</Text>
                  </View>
                  <View style={styles.pill}>
                    <Text style={styles.pillLabel}>CONSUMED</Text>
                    <Text style={[styles.pillVal, { color: colors.warning }]}>
                      {consumedHours}h
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.ledgerSectionTitle}>Allowance Transaction History</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No allowance ledger entries recorded yet.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const changeType = String(item.changeType || item.type || 'GRANT').toUpperCase();
            const isDeduction = changeType.includes('RESERV') || changeType.includes('CONSUM') || Number(item.hours) < 0;
            const absHours = Math.abs(Number(item.hours) || 0);
            const isPositive = !isDeduction;
            const displayHours = isDeduction ? `-${absHours}` : `+${absHours}`;
            const dateStr = item.createdAt
              ? new Date(item.createdAt).toLocaleDateString('en-IN', {
                  timeZone: 'Asia/Kolkata',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : '—';
            const description = item.notes || item.description || 'Allowance transaction';

            return (
              <View style={styles.ledgerCard}>
                <View style={styles.ledgerTop}>
                  <View
                    style={[
                      styles.typeBadge,
                      changeType === 'GRANT'
                        ? styles.badgeGrant
                        : changeType === 'RESERVE' || changeType === 'RESERVATION'
                        ? styles.badgeReservation
                        : changeType === 'RELEASE'
                        ? styles.badgeRelease
                        : styles.badgeConsumption
                    ]}
                  >
                    <Text style={styles.typeText}>{changeType.replace(/_/g, ' ')}</Text>
                  </View>
                  <Text style={styles.dateText}>{dateStr}</Text>
                </View>

                <View style={styles.deltaRow}>
                  <Text style={styles.descText}>{description}</Text>
                  <Text
                    style={[
                      styles.deltaText,
                      isPositive ? styles.deltaPositive : styles.deltaNegative
                    ]}
                  >
                    {displayHours}h
                  </Text>
                </View>

                <View style={styles.balanceAfterRow}>
                  <Text style={styles.balanceAfterLabel}>Balance After Transaction:</Text>
                  <Text style={styles.balanceAfterVal}>{item.balanceAfter ?? '—'} hrs</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  listContent: {
    padding: 20
  },
  headerWrap: {
    marginBottom: 16
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
    marginBottom: 20
  },
  summarySubtitle: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.brass,
    letterSpacing: 1.5
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
    marginBottom: 14
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12
  },
  balanceBig: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.textPrimary
  },
  balanceLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 8
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.inputBg,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brassLight,
    borderRadius: 4
  },
  progressText: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 16
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8
  },
  pill: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center'
  },
  pillLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1
  },
  pillVal: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2
  },
  ledgerSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center'
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 12
  },
  ledgerCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    marginBottom: 10
  },
  ledgerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6
  },
  badgeGrant: {
    backgroundColor: colors.successBg
  },
  badgeReservation: {
    backgroundColor: colors.infoBg
  },
  badgeRelease: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)'
  },
  badgeConsumption: {
    backgroundColor: colors.warningBg
  },
  typeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textPrimary
  },
  dateText: {
    fontSize: 10,
    color: colors.textMuted
  },
  deltaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  descText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    flex: 1,
    marginRight: 12
  },
  deltaText: {
    fontSize: 15,
    fontWeight: '800'
  },
  deltaPositive: {
    color: colors.success
  },
  deltaNegative: {
    color: colors.warning
  },
  balanceAfterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 6
  },
  balanceAfterLabel: {
    fontSize: 10,
    color: colors.textMuted
  },
  balanceAfterVal: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary
  },
  adminSelectorWrap: {
    marginBottom: 16
  },
  adminSelectorLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.brassLight,
    marginBottom: 8
  },
  companyPillRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2
  },
  companyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  companyPillActive: {
    backgroundColor: colors.brassLight,
    borderColor: colors.brassLight
  },
  companyPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary
  },
  companyPillTextActive: {
    color: '#090D16',
    fontWeight: '700'
  }
});
