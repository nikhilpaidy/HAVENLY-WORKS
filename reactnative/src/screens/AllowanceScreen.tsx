import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { mobileApi } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { ListRowSkeleton } from '../components/SkeletonLoader';
import { Header } from '../components/Header';
import { spacing, radii, typography, shadows } from '../theme/tokens';

interface AllowanceScreenProps {
  onOpenNotifications: () => void;
  unreadNotifsCount: number;
  onOpenDrawer?: () => void;
}

export const AllowanceScreen: React.FC<AllowanceScreenProps> = ({
  onOpenNotifications,
  unreadNotifsCount,
  onOpenDrawer
}) => {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();

  const role = user?.role;
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isCoworkingAdmin = role === 'COWORKING_ADMIN';
  const isManagerRole = isSuperAdmin || isCoworkingAdmin;

  const [superAdminAdmins, setSuperAdminAdmins] = useState<any[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<any | null>(null);

  const [adminCompanies, setAdminCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);

  const [current, setCurrent] = useState<any>(null);
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ledgerFilter, setLedgerFilter] = useState<'ALL' | 'DEDUCT' | 'RESERVE' | 'GRANT'>('ALL');

  const loadHierarchyData = async () => {
    try {
      if (isSuperAdmin) {
        const admins = await mobileApi.getSuperAdminAdmins();
        setSuperAdminAdmins(admins || []);
      } else if (isCoworkingAdmin) {
        const comps = await mobileApi.getCompanies();
        setAdminCompanies(comps || []);
      }
    } catch (err) {
      console.warn('Hierarchy load error in quota:', err);
    }
  };

  const fetchAllowance = async (targetCompId?: string) => {
    try {
      setLoading(true);
      const cId = targetCompId || (isManagerRole ? selectedCompany?._id : user?.companyId);
      const [curr, hist] = await Promise.all([
        mobileApi.getCurrentAllowance(cId || undefined),
        mobileApi.getAllowanceHistory(cId || undefined)
      ]);
      setCurrent(curr);
      setLedger(hist?.ledger || []);
    } catch (err) {
      console.warn('Failed to load allowance:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHierarchyData();
  }, [role]);

  useEffect(() => {
    if (!isManagerRole) {
      fetchAllowance();
    } else if (selectedCompany) {
      fetchAllowance(selectedCompany._id);
    } else {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCompany, role]);

  const onRefresh = () => {
    setRefreshing(true);
    if (isManagerRole) {
      loadHierarchyData();
    }
    fetchAllowance();
  };

  const granted = current?.totalGrantedHours ?? current?.grantedHours ?? 240;
  const available = current?.availableHours ?? current?.balanceHours ?? 240;
  const consumed = current?.consumedHours ?? 0;
  const reserved = current?.reservedHours ?? 0;
  const utilizedPercent = Math.min(100, Math.round(((consumed + reserved) / (granted || 1)) * 100));

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recent';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Recent';
      return d.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recent';
    }
  };

  const filteredLedger = ledger.filter((item) => {
    if (ledgerFilter === 'ALL') return true;
    return item.changeType === ledgerFilter;
  });

  const renderQuotaMetrics = () => (
    <View style={styles.metricsContainer}>
      <View style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.heroTop}>
          <View>
            <Text style={[styles.heroPretitle, { color: '#00A859' }]}>
              ALLOWANCE BALANCE
            </Text>
            <View style={styles.availableRow}>
              <Text style={[styles.availableNum, { color: theme.textPrimary }]}>
                {available}
              </Text>
              <Text style={[styles.availableUnit, { color: theme.textSecondary }]}>
                Hours Available
              </Text>
            </View>
          </View>
          <View style={[styles.activeBadge, { backgroundColor: isDark ? 'rgba(0, 168, 89, 0.15)' : '#DCFCE7' }]}>
            <Ionicons name="shield-checkmark" size={13} color="#00A859" style={{ marginRight: 4 }} />
            <Text style={styles.activeBadgeText}>Active Balance</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={[styles.progressBarTrack, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
            <View
              style={[
                styles.progressSegmentConsumed,
                {
                  width: `${Math.min(100, (consumed / (granted || 1)) * 100)}%`,
                  backgroundColor: isDark ? '#475569' : '#334155'
                }
              ]}
            />
            <View
              style={[
                styles.progressSegmentReserved,
                {
                  width: `${Math.min(100, (reserved / (granted || 1)) * 100)}%`,
                  backgroundColor: isDark ? '#64748B' : '#94A3B8'
                }
              ]}
            />
          </View>
          <View style={styles.progressLegendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: isDark ? '#475569' : '#334155' }]} />
              <Text style={[styles.legendText, { color: theme.textSecondary }]}>Consumed ({consumed}h)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: isDark ? '#64748B' : '#94A3B8' }]} />
              <Text style={[styles.legendText, { color: theme.textSecondary }]}>Reserved ({reserved}h)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#00A859' }]} />
              <Text style={[styles.legendText, { color: theme.textSecondary }]}>Available ({available}h)</Text>
            </View>
          </View>
        </View>

        <View style={[styles.breakdownGrid, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
          <View style={styles.breakdownItem}>
            <Text style={[styles.breakdownLabel, { color: theme.textMuted }]}>ANNUAL GRANT</Text>
            <Text style={[styles.breakdownVal, { color: theme.textPrimary }]}>{granted}h</Text>
          </View>
          <View style={[styles.breakdownDivider, { backgroundColor: theme.divider }]} />
          <View style={styles.breakdownItem}>
            <Text style={[styles.breakdownLabel, { color: theme.textMuted }]}>CONSUMED</Text>
            <Text style={[styles.breakdownVal, { color: theme.textPrimary }]}>{consumed}h</Text>
          </View>
          <View style={[styles.breakdownDivider, { backgroundColor: theme.divider }]} />
          <View style={styles.breakdownItem}>
            <Text style={[styles.breakdownLabel, { color: theme.textMuted }]}>RESERVED</Text>
            <Text style={[styles.breakdownVal, { color: theme.textPrimary }]}>{reserved}h</Text>
          </View>
          <View style={[styles.breakdownDivider, { backgroundColor: theme.divider }]} />
          <View style={styles.breakdownItem}>
            <Text style={[styles.breakdownLabel, { color: theme.textMuted }]}>UTILIZED</Text>
            <Text style={[styles.breakdownVal, { color: '#00A859' }]}>{utilizedPercent}%</Text>
          </View>
        </View>
      </View>

      <View style={styles.ledgerHeaderRow}>
        <Text style={[styles.ledgerHeading, { color: theme.textPrimary }]}>
          Quota Transaction Ledger
        </Text>
        <Text style={[styles.ledgerCount, { color: theme.textMuted }]}>
          {filteredLedger.length} entries
        </Text>
      </View>

      <View style={styles.filterPillsRow}>
        {(['ALL', 'RESERVE', 'DEDUCT', 'GRANT'] as const).map((f) => {
          const isActive = ledgerFilter === f;
          return (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterPill,
                {
                  backgroundColor: isActive ? '#00A859' : theme.card,
                  borderColor: isActive ? '#00A859' : theme.cardBorder
                }
              ]}
              onPress={() => setLedgerFilter(f)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterPillText,
                  { color: isActive ? '#FFFFFF' : theme.textSecondary, fontWeight: isActive ? '700' : '500' }
                ]}
              >
                {f === 'ALL' ? 'All Activity' : f === 'RESERVE' ? 'Hold' : f === 'DEDUCT' ? 'Used' : 'Granted'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
          <ListRowSkeleton />
          <ListRowSkeleton />
        </View>
      ) : filteredLedger.length === 0 ? (
        <View style={[styles.emptyLedger, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Ionicons name="time-outline" size={36} color={theme.textMuted} />
          <Text style={[styles.emptyLedgerText, { color: theme.textSecondary }]}>
            No quota deductions recorded for this filter.
          </Text>
        </View>
      ) : (
        <View style={{ gap: spacing.xs, marginTop: spacing.sm }}>
          {filteredLedger.map((item) => {
            const isCredit = item.hours > 0;
            const booking = item.bookingId;
            const label = booking?.bookingNumber
              ? `#${booking.bookingNumber} • ${booking.roomId?.name || 'Workspace'}`
              : item.notes || 'Quota Allocation Adjustment';

            return (
              <View
                key={item._id || Math.random().toString()}
                style={[styles.ledgerCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
              >
                <View
                  style={[
                    styles.ledgerIconBox,
                    {
                      backgroundColor: isCredit
                        ? (isDark ? 'rgba(0, 168, 89, 0.15)' : '#DCFCE7')
                        : (isDark ? 'rgba(148, 163, 184, 0.12)' : '#F1F5F9')
                    }
                  ]}
                >
                  <Ionicons
                    name={isCredit ? 'arrow-down' : item.changeType === 'RESERVE' ? 'time' : 'arrow-up'}
                    size={16}
                    color={isCredit ? '#00A859' : '#64748B'}
                  />
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.ledgerLabel, { color: theme.textPrimary }]} numberOfLines={1}>
                    {label}
                  </Text>
                  <Text style={[styles.ledgerDate, { color: theme.textMuted }]}>
                    {formatDate(item.createdAt)} • Remaining: {item.balanceAfter}h
                  </Text>
                </View>

                <Text
                  style={[
                    styles.hoursChange,
                    {
                      color: isCredit ? '#00A859' : theme.textPrimary
                    }
                  ]}
                >
                  {isCredit ? `+${item.hours}h` : `${item.hours}h`}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );

  const renderSuperAdminHierarchy = () => {
    if (!selectedAdmin) {
      return (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.hierarchyScroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00A859" />}
        >
          <View style={styles.hierarchyHeader}>
            <Ionicons name="file-tray-stacked-outline" size={18} color="#00A859" style={{ marginRight: 6 }} />
            <Text style={[styles.hierarchyHeaderText, { color: theme.textPrimary }]}>
              Coworking Operators ({superAdminAdmins.length})
            </Text>
          </View>

          {superAdminAdmins.map((adm) => (
            <TouchableOpacity
              key={adm._id}
              style={[styles.hierarchyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
              onPress={() => setSelectedAdmin(adm)}
              activeOpacity={0.85}
            >
              <View style={[styles.hierarchyAvatar, { backgroundColor: isDark ? 'rgba(0, 168, 89, 0.15)' : '#DCFCE7' }]}>
                <Ionicons name="business" size={20} color="#00A859" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.hierarchyTitle, { color: theme.textPrimary }]}>{adm.name}</Text>
                <Text style={[styles.hierarchySub, { color: theme.textMuted }]}>{adm.email}</Text>
                <Text style={{ fontSize: 12, color: '#00A859', fontWeight: '700', marginTop: 2 }}>
                  {adm.organizationId?.name || 'Coworking Hub'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      );
    }

    if (!selectedCompany) {
      const companies = selectedAdmin.companies || [];
      return (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.hierarchyScroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00A859" />}
        >
          <TouchableOpacity
            style={styles.breadcrumb}
            onPress={() => setSelectedAdmin(null)}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={16} color="#00A859" style={{ marginRight: 6 }} />
            <Text style={styles.breadcrumbText}>Back to Operators</Text>
          </TouchableOpacity>

          <View style={styles.hierarchyHeader}>
            <Text style={[styles.hierarchyHeaderText, { color: theme.textPrimary }]}>
              {selectedAdmin.name} • Client Companies ({companies.length})
            </Text>
          </View>

          {companies.length === 0 ? (
            <View style={[styles.emptyLedger, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Ionicons name="people-outline" size={36} color={theme.textMuted} />
              <Text style={[styles.emptyLedgerText, { color: theme.textSecondary }]}>
                No client companies onboarded for this operator.
              </Text>
            </View>
          ) : (
            companies.map((comp: any) => (
              <TouchableOpacity
                key={comp._id}
                style={[styles.hierarchyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={() => setSelectedCompany(comp)}
                activeOpacity={0.85}
              >
                <View style={[styles.hierarchyAvatar, { backgroundColor: isDark ? 'rgba(0, 168, 89, 0.15)' : '#DCFCE7' }]}>
                  <Ionicons name="briefcase" size={18} color="#00A859" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.hierarchyTitle, { color: theme.textPrimary }]}>{comp.name}</Text>
                  <Text style={[styles.hierarchySub, { color: theme.textMuted }]}>{comp.billingEmail}</Text>
                  <Text style={{ fontSize: 11, color: '#00A859', fontWeight: '700', marginTop: 2 }}>
                    Annual Quota: {comp.allowanceConfig?.annualFreeHours || 240}h / yr
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      );
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.hierarchyScroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00A859" />}
      >
        <TouchableOpacity
          style={styles.breadcrumb}
          onPress={() => setSelectedCompany(null)}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={16} color="#00A859" style={{ marginRight: 6 }} />
          <Text style={styles.breadcrumbText}>Back to {selectedAdmin.name} Clients</Text>
        </TouchableOpacity>

        <View style={styles.hierarchyHeader}>
          <Text style={[styles.hierarchyHeaderText, { color: theme.textPrimary }]}>
            {selectedCompany.name} Quota Summary
          </Text>
        </View>

        {renderQuotaMetrics()}
      </ScrollView>
    );
  };

  const renderCoworkingAdminHierarchy = () => {
    if (!selectedCompany) {
      return (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.hierarchyScroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00A859" />}
        >
          <View style={styles.hierarchyHeader}>
            <Ionicons name="file-tray-stacked-outline" size={18} color="#00A859" style={{ marginRight: 6 }} />
            <Text style={[styles.hierarchyHeaderText, { color: theme.textPrimary }]}>
              Client Companies ({adminCompanies.length})
            </Text>
          </View>

          {adminCompanies.length === 0 ? (
            <View style={[styles.emptyLedger, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Ionicons name="people-outline" size={36} color={theme.textMuted} />
              <Text style={[styles.emptyLedgerText, { color: theme.textSecondary }]}>
                No client companies onboarded yet.
              </Text>
            </View>
          ) : (
            adminCompanies.map((comp: any) => (
              <TouchableOpacity
                key={comp._id}
                style={[styles.hierarchyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={() => setSelectedCompany(comp)}
                activeOpacity={0.85}
              >
                <View style={[styles.hierarchyAvatar, { backgroundColor: isDark ? 'rgba(0, 168, 89, 0.15)' : '#DCFCE7' }]}>
                  <Ionicons name="briefcase" size={18} color="#00A859" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.hierarchyTitle, { color: theme.textPrimary }]}>{comp.name}</Text>
                  <Text style={[styles.hierarchySub, { color: theme.textMuted }]}>{comp.billingEmail}</Text>
                  <Text style={{ fontSize: 11, color: '#00A859', fontWeight: '700', marginTop: 2 }}>
                    Annual Quota: {comp.allowanceConfig?.annualFreeHours || 240}h / yr
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      );
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.hierarchyScroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00A859" />}
      >
        <TouchableOpacity
          style={styles.breadcrumb}
          onPress={() => setSelectedCompany(null)}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={16} color="#00A859" style={{ marginRight: 6 }} />
          <Text style={styles.breadcrumbText}>Back to Client Companies</Text>
        </TouchableOpacity>

        <View style={styles.hierarchyHeader}>
          <Text style={[styles.hierarchyHeaderText, { color: theme.textPrimary }]}>
            {selectedCompany.name} Quota Summary
          </Text>
        </View>

        {renderQuotaMetrics()}
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title={isSuperAdmin ? 'Platform Quotas' : isCoworkingAdmin ? 'Client Quotas' : 'Workspace Quota'}
        subtitle={isManagerRole ? 'Hierarchy & Allocation' : 'Annual Complimentary Allowance'}
        unreadCount={unreadNotifsCount}
        onPressNotifications={onOpenNotifications}
        onOpenDrawer={onOpenDrawer}
      />

      {isSuperAdmin
        ? renderSuperAdminHierarchy()
        : isCoworkingAdmin
        ? renderCoworkingAdminHierarchy()
        : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentScroll}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00A859" />}
          >
            {renderQuotaMetrics()}
          </ScrollView>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  contentScroll: {
    padding: spacing.screenPadding,
    paddingBottom: 110
  },
  hierarchyScroll: {
    padding: spacing.screenPadding,
    paddingBottom: 110,
    gap: spacing.sm
  },
  metricsContainer: {
    gap: spacing.md
  },
  heroCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadows.subtle
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md
  },
  heroPretitle: {
    ...typography.badge,
    fontSize: 9,
    marginBottom: 4
  },
  availableRow: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  availableNum: {
    fontSize: 32,
    fontWeight: '800'
  },
  availableUnit: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '600'
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.xs
  },
  activeBadgeText: {
    ...typography.badge,
    color: '#00A859',
    fontSize: 9
  },
  progressSection: {
    marginBottom: spacing.md
  },
  progressBarTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 8
  },
  progressSegmentConsumed: {
    height: '100%',
    backgroundColor: '#3B82F6'
  },
  progressSegmentReserved: {
    height: '100%',
    backgroundColor: '#F59E0B'
  },
  progressLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4
  },
  legendText: {
    fontSize: 10,
    fontWeight: '600'
  },
  breakdownGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center'
  },
  breakdownLabel: {
    ...typography.badge,
    fontSize: 8
  },
  breakdownVal: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2
  },
  breakdownDivider: {
    width: 1,
    height: '100%'
  },
  ledgerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs
  },
  ledgerHeading: {
    ...typography.title3,
    fontSize: 14
  },
  ledgerCount: {
    fontSize: 12
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: spacing.xs
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1
  },
  filterPillText: {
    fontSize: 11
  },
  emptyLedger: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginTop: spacing.sm
  },
  emptyLedgerText: {
    ...typography.subtext,
    textAlign: 'center',
    marginTop: spacing.xs
  },
  ledgerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    ...shadows.subtle
  },
  ledgerIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ledgerLabel: {
    fontSize: 12,
    fontWeight: '600'
  },
  ledgerDate: {
    fontSize: 10,
    marginTop: 2
  },
  hoursChange: {
    fontSize: 13,
    fontWeight: '800'
  },
  hierarchyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  hierarchyHeaderText: {
    ...typography.title3,
    fontSize: 14
  },
  hierarchyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    ...shadows.subtle
  },
  hierarchyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  hierarchyTitle: {
    ...typography.title3,
    fontSize: 14
  },
  hierarchySub: {
    ...typography.subtext,
    fontSize: 11,
    marginTop: 1
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: spacing.xs
  },
  breadcrumbText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00A859'
  }
});
