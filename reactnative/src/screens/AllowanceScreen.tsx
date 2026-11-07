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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recent';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Recent';
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  const renderLedgerItem = ({ item }: { item: any }) => {
    const isCredit = item.hours > 0;
    const booking = item.bookingId;
    const label = booking?.bookingNumber ? `#${booking.bookingNumber}` : item.notes || 'Quota Adjustment';

    return (
      <View style={[styles.ledgerRow, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View
          style={[
            styles.typeIconBox,
            { backgroundColor: isCredit ? '#DCFCE7' : item.changeType === 'RESERVE' ? '#FEF3C7' : '#F1F5F9' }
          ]}
        >
          <Ionicons
            name={isCredit ? 'arrow-down' : item.changeType === 'RESERVE' ? 'time' : 'arrow-up'}
            size={18}
            color={isCredit ? '#15803D' : item.changeType === 'RESERVE' ? '#B45309' : '#475569'}
          />
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.ledgerNotes, { color: theme.textPrimary }]} numberOfLines={1}>
            {label}
          </Text>
          <Text style={[styles.ledgerDate, { color: theme.textMuted }]}>
            {formatDate(item.createdAt)} • Balance after: {item.balanceAfter}h
          </Text>
        </View>

        <Text
          style={[
            styles.hoursDiff,
            { color: isCredit ? '#00A859' : item.changeType === 'RESERVE' ? '#D97706' : '#EF4444' }
          ]}
        >
          {isCredit ? `+${item.hours}h` : `${item.hours}h`}
        </Text>
      </View>
    );
  };

  const renderQuotaMetrics = () => (
    <>
      <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <View>
            <Text style={styles.summaryLabel}>ANNUAL COMPLIMENTARY ALLOWANCE</Text>
            <Text style={styles.summaryValue}>{available} <Text style={{ fontSize: 18 }}>Hours</Text></Text>
          </View>
          <View style={styles.activePill}>
            <Ionicons name="shield-checkmark" size={14} color="#00A859" style={{ marginRight: 4 }} />
            <Text style={styles.activePillText}>Active Quota</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${Math.min(100, Math.max(0, (available / (granted || 1)) * 100))}%` }
            ]}
          />
        </View>

        <View style={styles.statGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{granted}h</Text>
            <Text style={styles.statLabel}>Annual Grant</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{consumed}h</Text>
            <Text style={styles.statLabel}>Consumed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{reserved}h</Text>
            <Text style={styles.statLabel}>Reserved</Text>
          </View>
        </View>
      </View>

      <View style={[styles.infoBanner, { backgroundColor: isDark ? '#111827' : '#F0FDF4', borderColor: isDark ? '#1F2937' : '#DCFCE7' }]}>
        <Ionicons name="information-circle" size={20} color="#00A859" style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.infoTitle, { color: theme.textPrimary }]}>Annual Complimentary Policy</Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Complimentary room hours are allocated annually and remain valid throughout your active enterprise term without arbitrary monthly forfeiture.
          </Text>
        </View>
      </View>

      <View style={styles.ledgerHeader}>
        <Text style={[styles.ledgerTitle, { color: theme.textPrimary }]}>Quota Transaction Ledger</Text>
        <Text style={{ fontSize: 12, color: theme.textMuted }}>{ledger.length} entries</Text>
      </View>

      {loading ? (
        <View style={{ paddingHorizontal: 20 }}>
          <ListRowSkeleton />
          <ListRowSkeleton />
        </View>
      ) : ledger.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={40} color={theme.textMuted} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No quota deductions recorded yet.
          </Text>
        </View>
      ) : (
        <View style={{ paddingHorizontal: 20 }}>
          {ledger.map((item) => (
            <View key={item._id || Math.random().toString()}>
              {renderLedgerItem({ item })}
            </View>
          ))}
        </View>
      )}
    </>
  );

  const renderSuperAdminView = () => {
    if (!selectedAdmin) {
      return (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00A859" />}
        >
          <View style={styles.sectionHeaderCard}>
            <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
              Coworking Operators ({superAdminAdmins.length})
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Select an operator to inspect their client company allowances
            </Text>
          </View>

          {superAdminAdmins.map((adm) => (
            <TouchableOpacity
              key={adm._id}
              style={[styles.hierarchyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
              onPress={() => setSelectedAdmin(adm)}
              activeOpacity={0.85}
            >
              <View style={styles.hierarchyAvatar}>
                <Ionicons name="pie-chart" size={22} color="#00A859" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.hierarchyTitle, { color: theme.textPrimary }]}>{adm.name}</Text>
                <Text style={[styles.hierarchySub, { color: theme.textMuted }]}>{adm.email}</Text>
                <Text style={{ fontSize: 12, color: '#00A859', fontWeight: '700', marginTop: 2 }}>
                  {adm.organizationId?.name || 'Coworking Hub'}
                </Text>
                <View style={styles.miniStatsRow}>
                  <Text style={[styles.miniStatPill, { color: theme.textSecondary }]}>
                    {adm.companies?.length || 0} Client Companies
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
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
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00A859" />}
        >
          <TouchableOpacity
            style={styles.backBreadcrumb}
            onPress={() => setSelectedAdmin(null)}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={16} color="#00A859" style={{ marginRight: 6 }} />
            <Text style={styles.backBreadcrumbText}>Back to Operators</Text>
          </TouchableOpacity>

          <View style={styles.sectionHeaderCard}>
            <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
              {selectedAdmin.name} - Client Quotas ({companies.length})
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Select a client to view annual complimentary quota and usage ledger
            </Text>
          </View>

          {companies.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={44} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
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
                <View style={styles.hierarchyAvatar}>
                  <Ionicons name="business" size={20} color="#00A859" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.hierarchyTitle, { color: theme.textPrimary }]}>{comp.name}</Text>
                  <Text style={[styles.hierarchySub, { color: theme.textMuted }]}>{comp.billingEmail}</Text>
                  <Text style={{ fontSize: 12, color: '#00A859', fontWeight: '700', marginTop: 2 }}>
                    Annual Allowance: {comp.allowanceConfig?.annualFreeHours || 240}h / yr
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      );
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00A859" />}
      >
        <TouchableOpacity
          style={styles.backBreadcrumb}
          onPress={() => setSelectedCompany(null)}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={16} color="#00A859" style={{ marginRight: 6 }} />
          <Text style={styles.backBreadcrumbText}>Back to {selectedAdmin.name} Clients</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeaderCard}>
          <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
            {selectedCompany.name} Quota Details
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Annual meeting room hours allocation and consumption history
          </Text>
        </View>

        {renderQuotaMetrics()}
      </ScrollView>
    );
  };

  const renderCoworkingAdminView = () => {
    if (!selectedCompany) {
      return (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00A859" />}
        >
          <View style={styles.sectionHeaderCard}>
            <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
              Client Companies Quotas ({adminCompanies.length})
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Select a client to monitor their annual allowance usage and ledger
            </Text>
          </View>

          {adminCompanies.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={44} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No client companies registered yet.
              </Text>
            </View>
          ) : (
            adminCompanies.map((comp) => (
              <TouchableOpacity
                key={comp._id}
                style={[styles.hierarchyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={() => setSelectedCompany(comp)}
                activeOpacity={0.85}
              >
                <View style={styles.hierarchyAvatar}>
                  <Ionicons name="business" size={20} color="#00A859" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.hierarchyTitle, { color: theme.textPrimary }]}>{comp.name}</Text>
                  <Text style={[styles.hierarchySub, { color: theme.textMuted }]}>{comp.billingEmail}</Text>
                  <Text style={{ fontSize: 12, color: '#00A859', fontWeight: '700', marginTop: 2 }}>
                    Annual Free Hours: {comp.allowanceConfig?.annualFreeHours || 240}h / yr
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      );
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00A859" />}
      >
        <TouchableOpacity
          style={styles.backBreadcrumb}
          onPress={() => setSelectedCompany(null)}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={16} color="#00A859" style={{ marginRight: 6 }} />
          <Text style={styles.backBreadcrumbText}>Back to All Client Quotas</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeaderCard}>
          <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
            {selectedCompany.name} Quota Details
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Complimentary allowance usage and transaction history
          </Text>
        </View>

        {renderQuotaMetrics()}
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title={isSuperAdmin ? 'Platform Quota' : isCoworkingAdmin ? 'Client Quotas' : 'Workspace Quota'}
        subtitle={
          isSuperAdmin
            ? 'Operator & Corporate Allowances'
            : isCoworkingAdmin
            ? 'Client Annual Complimentary Hours'
            : 'Annual Enterprise Allowances'
        }
        onOpenDrawer={onOpenDrawer}
        unreadNotifsCount={unreadNotifsCount}
        onOpenNotifications={onOpenNotifications}
      />

      {isSuperAdmin ? (
        renderSuperAdminView()
      ) : isCoworkingAdmin ? (
        renderCoworkingAdminView()
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
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
  sectionHeaderCard: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 12
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800'
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2
  },
  backBreadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  backBreadcrumbText: {
    color: '#00A859',
    fontSize: 13,
    fontWeight: '700'
  },
  hierarchyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1
  },
  hierarchyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,168,89,0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  hierarchyTitle: {
    fontSize: 15,
    fontWeight: '700'
  },
  hierarchySub: {
    fontSize: 12,
    marginTop: 1
  },
  miniStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6
  },
  miniStatPill: {
    fontSize: 11,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  summaryCard: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 24,
    padding: 20,
    backgroundColor: '#0F172A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,168,89,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  activePillText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700'
  },
  progressContainer: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00A859',
    borderRadius: 4
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)'
  },
  statItem: {
    alignItems: 'center',
    flex: 1
  },
  statNum: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800'
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 2
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2
  },
  infoText: {
    fontSize: 12,
    lineHeight: 16
  },
  ledgerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12
  },
  ledgerTitle: {
    fontSize: 16,
    fontWeight: '800'
  },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10
  },
  typeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ledgerNotes: {
    fontSize: 14,
    fontWeight: '700'
  },
  ledgerDate: {
    fontSize: 11,
    marginTop: 2
  },
  hoursDiff: {
    fontSize: 15,
    fontWeight: '800'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40
  },
  emptyText: {
    fontSize: 13,
    marginTop: 8
  }
});