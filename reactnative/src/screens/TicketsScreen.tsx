import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { mobileApi } from '../services/api';
import { Header } from '../components/Header';

interface TicketComment {
  authorId: string;
  authorName: string;
  authorRole: string;
  message: string;
  createdAt: string;
}

interface TicketItem {
  _id: string;
  ticketNumber: string;
  category: string;
  priority: string;
  title: string;
  description: string;
  status: string;
  resolutionNotes?: string;
  companyId?: { _id: string; name: string };
  raisedByUserId?: { _id: string; name: string; email: string };
  comments?: TicketComment[];
  createdAt: string;
}

const CATEGORIES = [
  { key: 'ALL', label: 'All' },
  { key: 'WIFI_NETWORK', label: 'Wi-Fi & Network', icon: 'wifi-outline' },
  { key: 'AIR_CONDITIONING', label: 'Air Conditioning', icon: 'snow-outline' },
  { key: 'WATER_REFRESHMENTS', label: 'Water & Pantry', icon: 'cafe-outline' },
  { key: 'WASHROOM_HYGIENE', label: 'Washroom Hygiene', icon: 'water-outline' },
  { key: 'DISPLAY_AV', label: 'Display & AV', icon: 'tv-outline' },
  { key: 'POWER_ELECTRICAL', label: 'Power & Sockets', icon: 'flash-outline' },
  { key: 'OTHER', label: 'Other Facilities', icon: 'build-outline' }
];

const PRIORITIES = [
  { key: 'LOW', label: 'Low', color: '#10B981' },
  { key: 'MEDIUM', label: 'Medium', color: '#3B82F6' },
  { key: 'HIGH', label: 'High', color: '#F59E0B' },
  { key: 'URGENT', label: 'Urgent', color: '#EF4444' }
];

export const TicketsScreen: React.FC<{
  onOpenNotifications?: () => void;
  unreadNotifsCount?: number;
}> = ({ onOpenNotifications, unreadNotifsCount = 0 }) => {
  const { user, hasPermission } = useAuth();
  const { theme, isDark } = useTheme();

  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCategory, setNewCategory] = useState('WIFI_NETWORK');
  const [newPriority, setNewPriority] = useState('HIGH');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);

  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolvingTicketId, setResolvingTicketId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const isAdmin =
    user?.role === 'COWORKING_ADMIN' ||
    user?.role === 'COWORKING_ADMIN_STAFF' ||
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'SUPER_ADMIN_STAFF';

  const canRaiseTickets =
    user?.role === 'COMPANY_OWNER' ||
    user?.role === 'COMPANY_BOOKING_MANAGER' ||
    hasPermission('raise_tickets');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      if (selectedCategory !== 'ALL') params.category = selectedCategory;
      const data = await mobileApi.tickets.getTickets(params);
      setTickets(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.warn('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [selectedCategory, selectedStatus]);

  const handleCreateTicket = async () => {
    if (!newTitle.trim() || !newDescription.trim()) {
      Alert.alert('Required Fields', 'Please enter a ticket title and description.');
      return;
    }
    try {
      setSubmitting(true);
      await mobileApi.tickets.createTicket({
        category: newCategory,
        priority: newPriority,
        title: newTitle.trim(),
        description: newDescription.trim()
      });
      setShowCreateModal(false);
      setNewTitle('');
      setNewDescription('');
      setNewPriority('HIGH');
      setNewCategory('WIFI_NETWORK');
      fetchTickets();
      Alert.alert('Ticket Raised', 'Your helpdesk ticket has been submitted to facilities administration.');
    } catch (err: any) {
      Alert.alert('Submission Failed', err.message || 'Unable to submit ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendComment = async (ticketId: string) => {
    if (!replyMessage.trim()) return;
    try {
      setReplying(true);
      const updated = await mobileApi.tickets.addComment(ticketId, replyMessage.trim());
      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? { ...t, comments: updated.comments } : t))
      );
      setReplyMessage('');
    } catch (err: any) {
      Alert.alert('Comment Error', err.message || 'Failed to submit comment');
    } finally {
      setReplying(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: string, notes?: string) => {
    try {
      await mobileApi.tickets.updateTicketStatus(ticketId, status, notes);
      setShowResolveModal(false);
      setResolvingTicketId(null);
      setResolutionNotes('');
      fetchTickets();
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Unable to update status');
    }
  };

  const getPriorityBadge = (p: string) => {
    const item = PRIORITIES.find((x) => x.key === p) || PRIORITIES[1];
    return (
      <View style={[styles.priorityPill, { backgroundColor: `${item.color}20`, borderColor: item.color }]}>
        <Text style={[styles.priorityPillText, { color: item.color }]}>{item.label}</Text>
      </View>
    );
  };

  const getStatusBadge = (s: string) => {
    let color = '#3B82F6';
    if (s === 'OPEN') color = '#F59E0B';
    if (s === 'IN_PROGRESS') color = '#6366F1';
    if (s === 'RESOLVED') color = '#10B981';
    if (s === 'CLOSED') color = '#64748B';

    return (
      <View style={[styles.statusPill, { backgroundColor: `${color}18`, borderColor: color }]}>
        <Text style={[styles.statusPillText, { color }]}>{s.replace('_', ' ')}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Helpdesk & Complaints"
        subtitle={isAdmin ? 'Hub Facilities & Operations Service Desk' : 'Facilities Support & Service Desk'}
        unreadNotifsCount={unreadNotifsCount}
        onOpenNotifications={onOpenNotifications}
      />

      <View style={styles.topActionsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((statusKey) => (
            <TouchableOpacity
              key={statusKey}
              style={[
                styles.filterTab,
                { backgroundColor: selectedStatus === statusKey ? theme.gold : theme.card, borderColor: theme.cardBorder }
              ]}
              onPress={() => setSelectedStatus(statusKey)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  { color: selectedStatus === statusKey ? '#050814' : theme.textSecondary }
                ]}
              >
                {statusKey.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {canRaiseTickets && (
          <TouchableOpacity
            style={[styles.raiseButton, { backgroundColor: theme.gold }]}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={18} color="#050814" />
            <Text style={styles.raiseButtonText}>Raise Ticket</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.categoriesBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.catPill,
                {
                  backgroundColor: selectedCategory === cat.key ? (isDark ? '#1E293B' : '#E2E8F0') : 'transparent',
                  borderColor: selectedCategory === cat.key ? theme.gold : theme.cardBorder
                }
              ]}
              onPress={() => setSelectedCategory(cat.key)}
            >
              <Text
                style={[
                  styles.catPillText,
                  { color: selectedCategory === cat.key ? theme.gold : theme.textMuted }
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={theme.gold} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading service tickets...</Text>
        </View>
      ) : tickets.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="checkmark-done-circle-outline" size={54} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Tickets Found</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            All operational systems and facilities are running seamlessly.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollList} contentContainerStyle={{ paddingBottom: 100 }}>
          {tickets.map((t) => {
            const isExpanded = expandedTicketId === t._id;
            return (
              <View
                key={t._id}
                style={[styles.ticketCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
              >
                <TouchableOpacity
                  onPress={() => setExpandedTicketId(isExpanded ? null : t._id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.ticketNumBox}>
                      <Text style={[styles.ticketNumText, { color: theme.gold }]}>{t.ticketNumber}</Text>
                      {t.companyId?.name && (
                        <Text style={[styles.companyLabel, { color: theme.textMuted }]}>
                          • {t.companyId.name}
                        </Text>
                      )}
                    </View>
                    <View style={styles.badgesRow}>
                      {getPriorityBadge(t.priority)}
                      {getStatusBadge(t.status)}
                    </View>
                  </View>

                  <Text style={[styles.ticketTitle, { color: theme.textPrimary }]}>{t.title}</Text>
                  <Text style={[styles.ticketDesc, { color: theme.textSecondary }]} numberOfLines={isExpanded ? undefined : 2}>
                    {t.description}
                  </Text>

                  <View style={styles.cardFooter}>
                    <Text style={[styles.dateText, { color: theme.textMuted }]}>
                      {new Date(t.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                    <View style={styles.expandRow}>
                      <Ionicons
                        name="chatbox-outline"
                        size={14}
                        color={theme.textMuted}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.commentCount, { color: theme.textMuted }]}>
                        {t.comments?.length || 0}
                      </Text>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={theme.gold}
                        style={{ marginLeft: 8 }}
                      />
                    </View>
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={[styles.expandedContent, { borderTopColor: theme.cardBorder }]}>
                    {t.resolutionNotes && (
                      <View style={[styles.resolutionBox, { backgroundColor: `${theme.success}12`, borderColor: theme.success }]}>
                        <Text style={[styles.resolutionHeader, { color: theme.success }]}>Resolution Summary</Text>
                        <Text style={[styles.resolutionText, { color: theme.textPrimary }]}>
                          {t.resolutionNotes}
                        </Text>
                      </View>
                    )}

                    {isAdmin && t.status !== 'RESOLVED' && t.status !== 'CLOSED' && (
                      <View style={styles.adminActionRow}>
                        {t.status === 'OPEN' && (
                          <TouchableOpacity
                            style={[styles.actionBtn, { borderColor: theme.info, backgroundColor: `${theme.info}18` }]}
                            onPress={() => handleUpdateStatus(t._id, 'IN_PROGRESS')}
                          >
                            <Text style={[styles.actionBtnText, { color: theme.info }]}>Mark In Progress</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          style={[styles.actionBtn, { borderColor: theme.success, backgroundColor: `${theme.success}18` }]}
                          onPress={() => {
                            setResolvingTicketId(t._id);
                            setShowResolveModal(true);
                          }}
                        >
                          <Text style={[styles.actionBtnText, { color: theme.success }]}>Resolve Ticket</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    <Text style={[styles.threadHeader, { color: theme.textSecondary }]}>Conversation Thread</Text>
                    {t.comments && t.comments.length > 0 ? (
                      t.comments.map((c, i) => (
                        <View
                          key={i}
                          style={[
                            styles.commentBubble,
                            {
                              backgroundColor: c.authorRole.includes('ADMIN') ? (isDark ? '#1E293B' : '#E2E8F0') : (isDark ? '#0F172A' : '#F1F5F9'),
                              borderColor: theme.cardBorder
                            }
                          ]}
                        >
                          <View style={styles.commentMeta}>
                            <Text style={[styles.commentAuthor, { color: theme.gold }]}>{c.authorName}</Text>
                            <Text style={[styles.commentRole, { color: theme.textMuted }]}>• {c.authorRole}</Text>
                          </View>
                          <Text style={[styles.commentMsg, { color: theme.textPrimary }]}>{c.message}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={[styles.noCommentsText, { color: theme.textMuted }]}>
                        No replies recorded yet.
                      </Text>
                    )}

                    <View style={styles.replyBox}>
                      <TextInput
                        style={[styles.replyInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                        placeholder="Type reply or update message..."
                        placeholderTextColor={theme.textMuted}
                        value={replyMessage}
                        onChangeText={setReplyMessage}
                      />
                      <TouchableOpacity
                        style={[styles.replySendBtn, { backgroundColor: theme.gold }]}
                        onPress={() => handleSendComment(t._id)}
                        disabled={replying}
                      >
                        {replying ? (
                          <ActivityIndicator size="small" color="#050814" />
                        ) : (
                          <Ionicons name="send" size={16} color="#050814" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* CREATE TICKET MODAL */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Raise Facilities Ticket</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {CATEGORIES.filter((c) => c.key !== 'ALL').map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.modalOptionPill,
                      {
                        backgroundColor: newCategory === cat.key ? theme.gold : theme.card,
                        borderColor: theme.cardBorder
                      }
                    ]}
                    onPress={() => setNewCategory(cat.key)}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        { color: newCategory === cat.key ? '#050814' : theme.textSecondary }
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.label, { color: theme.textSecondary }]}>Urgency Level</Text>
              <View style={styles.priorityRow}>
                {PRIORITIES.map((p) => (
                  <TouchableOpacity
                    key={p.key}
                    style={[
                      styles.modalPriorityPill,
                      {
                        backgroundColor: newPriority === p.key ? p.color : theme.card,
                        borderColor: theme.cardBorder
                      }
                    ]}
                    onPress={() => setNewPriority(p.key)}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        { color: newPriority === p.key ? '#FFFFFF' : theme.textSecondary }
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: theme.textSecondary }]}>Issue Subject</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                placeholder="e.g. WiFi 5GHz connection drop in Boardroom"
                placeholderTextColor={theme.textMuted}
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <Text style={[styles.label, { color: theme.textSecondary }]}>Detailed Description</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                placeholder="Describe the issue, room number, or assistance required..."
                placeholderTextColor={theme.textMuted}
                value={newDescription}
                onChangeText={setNewDescription}
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: theme.gold }]}
                onPress={handleCreateTicket}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#050814" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Facilities Ticket</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* RESOLVE TICKET MODAL */}
      <Modal visible={showResolveModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Resolve Service Ticket</Text>
              <TouchableOpacity onPress={() => setShowResolveModal(false)}>
                <Ionicons name="close" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: theme.textSecondary }]}>Resolution Summary & Actions Taken</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
              placeholder="e.g. Channel reconfigured to 5GHz DFS clean band. Symmetrical speeds verified."
              placeholderTextColor={theme.textMuted}
              value={resolutionNotes}
              onChangeText={setResolutionNotes}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: theme.success }]}
              onPress={() => {
                if (resolvingTicketId) {
                  handleUpdateStatus(resolvingTicketId, 'RESOLVED', resolutionNotes);
                }
              }}
            >
              <Text style={[styles.submitBtnText, { color: '#FFFFFF' }]}>Confirm Resolution</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  topActionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8
  },
  filterScroll: {
    flexDirection: 'row',
    gap: 6
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '700'
  },
  raiseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4
  },
  raiseButtonText: {
    color: '#050814',
    fontSize: 12,
    fontWeight: '700'
  },
  categoriesBar: {
    paddingHorizontal: 16,
    paddingBottom: 8
  },
  catScroll: {
    gap: 6
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1
  },
  catPillText: {
    fontSize: 11,
    fontWeight: '600'
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    fontSize: 13,
    marginTop: 10
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6
  },
  scrollList: {
    flex: 1,
    paddingHorizontal: 16
  },
  ticketCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  ticketNumBox: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  ticketNumText: {
    fontSize: 13,
    fontWeight: '700'
  },
  companyLabel: {
    fontSize: 12,
    marginLeft: 6
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6
  },
  priorityPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1
  },
  priorityPillText: {
    fontSize: 10,
    fontWeight: '700'
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700'
  },
  ticketTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4
  },
  ticketDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dateText: {
    fontSize: 11
  },
  expandRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  commentCount: {
    fontSize: 12,
    fontWeight: '600'
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1
  },
  resolutionBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12
  },
  resolutionHeader: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4
  },
  resolutionText: {
    fontSize: 12,
    lineHeight: 16
  },
  adminActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700'
  },
  threadHeader: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8
  },
  commentBubble: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  commentAuthor: {
    fontSize: 11,
    fontWeight: '700'
  },
  commentRole: {
    fontSize: 10,
    marginLeft: 4
  },
  commentMsg: {
    fontSize: 12,
    lineHeight: 16
  },
  noCommentsText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 8
  },
  replyBox: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6
  },
  replyInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 12
  },
  replySendBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end'
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    padding: 20,
    maxHeight: '85%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700'
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6
  },
  modalOptionPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6
  },
  modalOptionText: {
    fontSize: 12,
    fontWeight: '700'
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12
  },
  modalPriorityPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center'
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    marginBottom: 12
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    height: 80,
    fontSize: 13,
    marginBottom: 16,
    textAlignVertical: 'top'
  },
  submitBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20
  },
  submitBtnText: {
    color: '#050814',
    fontSize: 14,
    fontWeight: '700'
  }
});
