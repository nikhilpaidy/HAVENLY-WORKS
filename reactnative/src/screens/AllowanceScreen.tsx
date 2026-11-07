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

interface AllowanceScreenProps {
  onOpenNotifications: () => void;
  unreadNotifsCount: number;
}

export const AllowanceScreen: React.FC<AllowanceScreenProps> = ({
  onOpenNotifications,
  unreadNotifsCount
}) => {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();

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
      console.warn('Failed to load allowance:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdminRole) {
      mobileApi.getCompanies().then((comps) => {
        if (comps && comps.length > 0) {
          setCompanies(comps);
          if (!selectedCompanyId) {
            setSelectedCompanyId(comps[0]._id);
            fetchAllowance(comps[0]._id);
            return;
          }
        }
        fetchAllowance();
      }).catch(() => fetchAllowance());
    } else {
      fetchAllowance();
    }
  }, [selectedCompanyId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllowance();
  };

  const granted = current?.totalGrantedHours ?? current?.grantedHours ?? 20;
  const available = current?.availableHours ?? current?.balanceHours ?? 18;
  const consumed = current?.consumedHours ?? 2;
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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Workspace Quota</Text>
        <TouchableOpacity style={styles.notifBtn} onPress={onOpenNotifications}>
          <Ionicons name="notifications-outline" size={20} color={theme.textPrimary} />
          {unreadNotifsCount > 0 && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00A859" />}
      >
        {isAdminRole && companies.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.companySelector}
          >
            {companies.map((c) => (
              <TouchableOpacity
                key={c._id}
                style={[
                  styles.compPill,
                  selectedCompanyId === c._id && styles.compPillActive,
                  { borderColor: theme.cardBorder }
                ]}
                onPress={() => setSelectedCompanyId(c._id)}
              >
                <Text
                  style={[
                    styles.compPillText,
                    selectedCompanyId === c._id && { color: '#FFFFFF', fontWeight: '700' }
                  ]}
                >
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryLabel}>AVAILABLE ALLOWANCE</Text>
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
              <Text style={styles.statLabel}>Granted</Text>
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

        <View style={[styles.policyNotice, { backgroundColor: isDark ? '#121A2D' : '#F0FDF4', borderColor: '#BBF7D0' }]}>
          <Ionicons name="information-circle" size={20} color="#00A859" style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.policyNoticeTitle, { color: theme.textPrimary }]}>No Monthly Reset Policy</Text>
            <Text style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 18, marginTop: 2 }}>
              Your granted allowance remains active until fully utilized. When completed, additional bookings are tracked and billed automatically in Indian Rupees (₹) at the end of each month via email invoice.
            </Text>
          </View>
        </View>

        <View style={styles.historySection}>
          <Text style={[styles.historyTitle, { color: theme.textPrimary }]}>Quota Transaction History</Text>
          {loading ? (
            <View style={{ marginTop: 10 }}>
              <ListRowSkeleton />
              <ListRowSkeleton />
            </View>
          ) : ledger.length === 0 ? (
            <Text style={{ color: theme.textMuted, fontSize: 13, marginTop: 12 }}>
              No transactions recorded yet.
            </Text>
          ) : (
            ledger.map((item) => (
              <View key={item._id} style={{ marginTop: 10 }}>
                {renderLedgerItem({ item })}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800'
  },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center'
  },
  unreadDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444'
  },
  companySelector: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8
  },
  compPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1
  },
  compPillActive: {
    backgroundColor: '#00A859',
    borderColor: '#00A859'
  },
  compPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B'
  },
  summaryCard: {
    backgroundColor: '#0A3826',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 22,
    marginTop: 10,
    shadowColor: '#00A859',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
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
    color: '#BBF7D0',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    marginTop: 4
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12
  },
  activePillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  progressContainer: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 18
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00C261',
    borderRadius: 4
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  statItem: {
    alignItems: 'center'
  },
  statNum: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800'
  },
  statLabel: {
    color: '#A7F3D0',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.15)'
  },
  policyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1
  },
  policyNoticeTitle: {
    fontSize: 14,
    fontWeight: '700'
  },
  historySection: {
    paddingHorizontal: 20,
    marginTop: 24
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6
  },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1
  },
  typeIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ledgerNotes: {
    fontSize: 14,
    fontWeight: '600'
  },
  ledgerDate: {
    fontSize: 12,
    marginTop: 2
  },
  hoursDiff: {
    fontSize: 16,
    fontWeight: '800'
  }
});
