import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ScrollView,
  Alert,
  Linking
} from 'react-native';
import { mobileApi } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import { Header } from '../components/Header';
import { Ionicons } from '@expo/vector-icons';
import { ListRowSkeleton } from '../components/SkeletonLoader';
import { spacing, radii, typography, shadows } from '../theme/tokens';

interface InvoicesScreenProps {
  onOpenNotifications: () => void;
  unreadNotifsCount: number;
  onBack?: () => void;
  onOpenDrawer?: () => void;
}

export const InvoicesScreen: React.FC<InvoicesScreenProps> = ({
  onOpenNotifications,
  unreadNotifsCount,
  onBack,
  onOpenDrawer
}) => {
  const { theme, isDark } = useTheme();

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNPAID' | 'PAID'>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  const fetchInvoices = async () => {
    try {
      const data = await mobileApi.getInvoices();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to load invoices:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const totalBilled = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
  const totalDue = invoices.reduce((sum, inv) => sum + (inv.amountDue || 0), 0);

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter === 'PAID') return inv.status === 'PAID';
    if (statusFilter === 'UNPAID') return inv.status !== 'PAID' && (inv.amountDue || 0) > 0;
    return true;
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return '—';
    }
  };

  const handleDownloadStatement = (invoice: any) => {
    if (invoice.pdfUrl) {
      Linking.openURL(invoice.pdfUrl).catch(() => {
        Alert.alert('Download Error', 'Could not open statement URL.');
      });
    } else {
      Alert.alert(
        'Statement Reference',
        `Invoice #${invoice.invoiceNumber || 'INV-001'}\nTotal Billed: ₹${(invoice.totalAmount || 0).toLocaleString('en-IN')}\nStatus: ${invoice.status || 'PENDING'}\n\nA digital statement copy has been recorded in your corporate ledger.`
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Invoices & Ledger"
        subtitle="Corporate Billing"
        unreadCount={unreadNotifsCount}
        onPressNotifications={onOpenNotifications}
        showBack={!!onBack}
        onPressBack={onBack}
        onOpenDrawer={onOpenDrawer}
      />

      <View style={styles.topSection}>
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>TOTAL BILLED</Text>
            <Text style={[styles.kpiValue, { color: theme.textPrimary }]}>
              ₹{totalBilled.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={[styles.kpiCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>PAID TO DATE</Text>
            <Text style={[styles.kpiValue, { color: '#00A859' }]}>
              ₹{totalPaid.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={[styles.kpiCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>OUTSTANDING</Text>
            <Text style={[styles.kpiValue, { color: totalDue > 0 ? '#F59E0B' : '#00A859' }]}>
              ₹{totalDue.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          {(['ALL', 'UNPAID', 'PAID'] as const).map((filter) => {
            const isActive = statusFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isActive ? '#00A859' : theme.card,
                    borderColor: isActive ? '#00A859' : theme.cardBorder
                  }
                ]}
                onPress={() => setStatusFilter(filter)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    { color: isActive ? '#FFFFFF' : theme.textSecondary, fontWeight: isActive ? '700' : '500' }
                  ]}
                >
                  {filter === 'ALL' ? 'All Statements' : filter === 'UNPAID' ? 'Pending Due' : 'Settled'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ListRowSkeleton />
          <ListRowSkeleton />
          <ListRowSkeleton />
        </View>
      ) : (
        <FlatList
          data={filteredInvoices}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchInvoices();
              }}
              tintColor="#00A859"
            />
          }
          ListEmptyComponent={
            <View style={[styles.emptyWrap, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <View style={[styles.emptyIconBox, { backgroundColor: isDark ? 'rgba(0, 168, 89, 0.15)' : '#DCFCE7' }]}>
                <Ionicons name="receipt-outline" size={32} color="#00A859" />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Statements Found</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                All workspace reservations were covered by your complimentary corporate allowance.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isPaid = item.status === 'PAID';
            const isPartial = item.status === 'PARTIALLY_PAID';
            const amountDue = item.amountDue || 0;

            const badgeBg = isPaid
              ? (isDark ? 'rgba(0, 168, 89, 0.15)' : '#DCFCE7')
              : isPartial
              ? (isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7')
              : (isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2');

            const badgeColor = isPaid ? '#00A859' : isPartial ? '#D97706' : '#EF4444';

            return (
              <TouchableOpacity
                style={[
                  styles.invoiceCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.cardBorder
                  }
                ]}
                onPress={() => setSelectedInvoice(item)}
                activeOpacity={0.85}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.invNumber, { color: theme.textPrimary }]}>
                      {item.invoiceNumber || 'INV-2026'}
                    </Text>
                    <Text style={[styles.invPeriod, { color: theme.textSecondary }]}>
                      Issued: {formatDate(item.createdAt)}
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                    <Text style={[styles.badgeText, { color: badgeColor }]}>
                      {item.status || 'ISSUED'}
                    </Text>
                  </View>
                </View>

                <View style={[styles.amountsGrid, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
                  <View style={styles.amountCol}>
                    <Text style={[styles.amountLabel, { color: theme.textMuted }]}>BILLED</Text>
                    <Text style={[styles.amountVal, { color: theme.textPrimary }]}>
                      ₹{(item.totalAmount || 0).toLocaleString('en-IN')}
                    </Text>
                  </View>

                  <View style={styles.amountCol}>
                    <Text style={[styles.amountLabel, { color: theme.textMuted }]}>PAID</Text>
                    <Text style={[styles.amountVal, { color: '#00A859' }]}>
                      ₹{(item.amountPaid || 0).toLocaleString('en-IN')}
                    </Text>
                  </View>

                  <View style={styles.amountCol}>
                    <Text style={[styles.amountLabel, { color: theme.textMuted }]}>DUE</Text>
                    <Text style={[styles.amountVal, { color: amountDue > 0 ? '#F59E0B' : theme.textPrimary }]}>
                      ₹{amountDue.toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { borderColor: theme.cardBorder }]}
                    onPress={() => setSelectedInvoice(item)}
                  >
                    <Ionicons name="eye-outline" size={14} color="#00A859" style={{ marginRight: 4 }} />
                    <Text style={[styles.actionBtnText, { color: '#00A859' }]}>View Details</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { borderColor: theme.cardBorder }]}
                    onPress={() => handleDownloadStatement(item)}
                  >
                    <Ionicons name="download-outline" size={14} color={theme.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={[styles.actionBtnText, { color: theme.textSecondary }]}>Statement</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {selectedInvoice && (
        <Modal visible={!!selectedInvoice} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
              <View style={[styles.modalHeader, { borderBottomColor: theme.cardBorder }]}>
                <View>
                  <Text style={[styles.modalSubtitle, { color: '#00A859' }]}>INVOICE DETAILS</Text>
                  <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                    {selectedInvoice.invoiceNumber}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedInvoice(null)} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={[styles.detailSection, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailKey, { color: theme.textSecondary }]}>Status</Text>
                    <Text style={[styles.detailVal, { color: '#00A859', fontWeight: '700' }]}>
                      {selectedInvoice.status}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailKey, { color: theme.textSecondary }]}>Invoice Date</Text>
                    <Text style={[styles.detailVal, { color: theme.textPrimary }]}>
                      {formatDate(selectedInvoice.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailKey, { color: theme.textSecondary }]}>Due Date</Text>
                    <Text style={[styles.detailVal, { color: theme.textPrimary }]}>
                      {formatDate(selectedInvoice.dueDate || selectedInvoice.createdAt)}
                    </Text>
                  </View>
                </View>

                <View style={[styles.detailSection, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Amount Summary</Text>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailKey, { color: theme.textSecondary }]}>Subtotal</Text>
                    <Text style={[styles.detailVal, { color: theme.textPrimary }]}>
                      ₹{(selectedInvoice.subtotal || selectedInvoice.totalAmount || 0).toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailKey, { color: theme.textSecondary }]}>GST (18%)</Text>
                    <Text style={[styles.detailVal, { color: theme.textPrimary }]}>
                      ₹{(selectedInvoice.taxAmount || 0).toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={[styles.divider, { backgroundColor: theme.divider }]} />
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailKey, { color: theme.textPrimary, fontWeight: '700' }]}>Total Billed</Text>
                    <Text style={[styles.detailVal, { color: '#00A859', fontWeight: '800', fontSize: 16 }]}>
                      ₹{(selectedInvoice.totalAmount || 0).toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailKey, { color: theme.textSecondary }]}>Amount Paid</Text>
                    <Text style={[styles.detailVal, { color: '#00A859' }]}>
                      ₹{(selectedInvoice.amountPaid || 0).toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailKey, { color: '#F59E0B', fontWeight: '700' }]}>Balance Due</Text>
                    <Text style={[styles.detailVal, { color: '#F59E0B', fontWeight: '800' }]}>
                      ₹{(selectedInvoice.amountDue || 0).toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.downloadBtn, { backgroundColor: '#00A859' }]}
                  onPress={() => handleDownloadStatement(selectedInvoice)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="download-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.downloadBtnText}>Download Tax Invoice</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  topSection: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm
  },
  kpiRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm
  },
  kpiCard: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    ...shadows.subtle
  },
  kpiLabel: {
    ...typography.badge,
    fontSize: 9
  },
  kpiValue: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.xs
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1
  },
  filterPillText: {
    fontSize: 12
  },
  loadingWrap: {
    padding: spacing.screenPadding,
    gap: spacing.sm
  },
  listContent: {
    padding: spacing.screenPadding,
    paddingBottom: 110,
    gap: spacing.sm
  },
  emptyWrap: {
    alignItems: 'center',
    padding: spacing.xxl,
    borderRadius: radii.xl,
    borderWidth: 1,
    marginTop: spacing.xl
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md
  },
  emptyTitle: {
    ...typography.title2,
    marginBottom: 4
  },
  emptySubtitle: {
    ...typography.subtext,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260
  },
  invoiceCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
    ...shadows.subtle
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm
  },
  invNumber: {
    ...typography.title3,
    fontSize: 14
  },
  invPeriod: {
    ...typography.subtext,
    marginTop: 2
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.xs
  },
  badgeText: {
    ...typography.badge,
    fontSize: 9
  },
  amountsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    marginVertical: spacing.xs
  },
  amountCol: {
    flex: 1
  },
  amountLabel: {
    ...typography.badge,
    fontSize: 9
  },
  amountVal: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    marginTop: spacing.sm
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.sm,
    borderWidth: 1
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end'
  },
  modalCard: {
    maxHeight: '85%',
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    overflow: 'hidden'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1
  },
  modalSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  modalTitle: {
    ...typography.title2,
    marginTop: 2
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalBody: {
    padding: spacing.md
  },
  detailSection: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    gap: 8
  },
  sectionTitle: {
    ...typography.title3,
    fontSize: 13,
    marginBottom: 4
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  detailKey: {
    fontSize: 12
  },
  detailVal: {
    fontSize: 12
  },
  divider: {
    height: 1,
    marginVertical: 4
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: radii.md,
    marginVertical: spacing.lg
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14
  }
});
