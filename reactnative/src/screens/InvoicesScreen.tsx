import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { mobileApi } from '../services/api';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Ionicons } from '@expo/vector-icons';

interface InvoicesScreenProps {
  onOpenNotifications: () => void;
  unreadNotifsCount: number;
}

export const InvoicesScreen: React.FC<InvoicesScreenProps> = ({
  onOpenNotifications,
  unreadNotifsCount
}) => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInvoices = async () => {
    try {
      const data = await mobileApi.getInvoices();
      setInvoices(data || []);
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <View style={styles.container}>
      <Header
        title="Invoices & Billing"
        subtitle="Corporate Accounts"
        unreadCount={unreadNotifsCount}
        onPressNotifications={onOpenNotifications}
      />

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.brassLight} />
        </View>
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchInvoices();
              }}
              tintColor={colors.brassLight}
            />
          }
          ListHeaderComponent={
            <View style={styles.banner}>
              <View style={styles.bannerHeader}>
                <Ionicons name="information-circle-outline" size={18} color={colors.brassLight} />
                <Text style={styles.bannerTitle}>Enterprise Remittance Notice</Text>
              </View>
              <Text style={styles.bannerText}>
                Overage invoices are billed per contracted company rates. Remit via ACH wire transfer
                or physical reception terminal. Payments are audited and logged to your corporate record.
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={36} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No statements issued</Text>
              <Text style={styles.emptySub}>
                All room bookings this period were covered by your complimentary quota.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isPaid = item.status === 'PAID';
            const isPartial = item.status === 'PARTIALLY_PAID';
            const rawStart = item.billingPeriodStart || item.periodStart || item.createdAt;
            const rawEnd = item.billingPeriodEnd || item.periodEnd || item.dueDate || item.createdAt;
            const pStart = rawStart && !isNaN(new Date(rawStart).getTime())
              ? new Date(rawStart).toLocaleDateString('en-IN', {
                  timeZone: 'Asia/Kolkata',
                  month: 'short',
                  day: 'numeric'
                })
              : 'Oct 01';
            const pEnd = rawEnd && !isNaN(new Date(rawEnd).getTime())
              ? new Date(rawEnd).toLocaleDateString('en-IN', {
                  timeZone: 'Asia/Kolkata',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })
              : 'Oct 31, 2026';

            return (
              <View style={styles.invoiceCard}>
                <View style={styles.cardTop}>
                  <Text style={styles.invNumber}>{item.invoiceNumber}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      isPaid
                        ? styles.badgePaid
                        : isPartial
                        ? styles.badgePartial
                        : styles.badgeUnpaid
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        isPaid
                          ? styles.textPaid
                          : isPartial
                          ? styles.textPartial
                          : styles.textUnpaid
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.periodText}>
                  Period: {pStart} - {pEnd}
                </Text>

                <View style={styles.amountsRow}>
                  <View>
                    <Text style={styles.amountLabel}>TOTAL BILLED</Text>
                    <Text style={styles.amountVal}>₹{(item.totalAmount || 0).toLocaleString('en-IN')}</Text>
                  </View>
                  <View>
                    <Text style={styles.amountLabel}>PAID TO DATE</Text>
                    <Text style={[styles.amountVal, { color: colors.success }]}>
                      ₹{(item.amountPaid || 0).toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.amountLabel}>BALANCE DUE</Text>
                    <Text style={[styles.amountVal, { color: colors.warning }]}>
                      ₹{(item.amountDue || 0).toLocaleString('en-IN')}
                    </Text>
                  </View>
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
  banner: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    marginBottom: 20
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brassLight,
    marginLeft: 6
  },
  bannerText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 36,
    alignItems: 'center'
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 12
  },
  emptySub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4
  },
  invoiceCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    marginBottom: 12
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  invNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.brassLight
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  badgePaid: {
    backgroundColor: colors.successBg
  },
  badgePartial: {
    backgroundColor: colors.infoBg
  },
  badgeUnpaid: {
    backgroundColor: colors.warningBg
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800'
  },
  textPaid: {
    color: colors.success
  },
  textPartial: {
    color: colors.info
  },
  textUnpaid: {
    color: colors.warning
  },
  periodText: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 12
  },
  amountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    padding: 12
  },
  amountLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8
  },
  amountVal: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2
  }
});
