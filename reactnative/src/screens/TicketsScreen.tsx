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
  locationId?: { _id: string; name: string; address?: string };
  companyId?: { _id: string; name: string };
  raisedByUserId?: { _id: string; name: string; email: string };
  comments?: TicketComment[];
  createdAt: string;
}

const CATEGORIES = [
  { key: 'ALL', label: 'All' },
  { key: 'WIFI_NETWORK', label: 'Wi-Fi & Network' },
  { key: 'AIR_CONDITIONING', label: 'HVAC & Climate' },
  { key: 'WATER_REFRESHMENTS', label: 'Pantry & Coffee' },
  { key: 'WASHROOM_HYGIENE', label: 'Hygiene & Housekeeping' },
  { key: 'DISPLAY_AV', label: 'Meeting AV & Screens' },
  { key: 'POWER_ELECTRICAL', label: 'Power & Sockets' },
  { key: 'OTHER', label: 'General Facilities' }
];

const PRIORITIES = [
  { key: 'LOW', label: 'Low', color: '#10B981' },
  { key: 'MEDIUM', label: 'Medium', color: '#0284C7' },
  { key: 'HIGH', label: 'High', color: '#F59E0B' },
  { key: 'URGENT', label: 'Urgent', color: '#EF4444' }
];

interface TicketsScreenProps {
  onOpenNotifications?: () => void;
  unreadNotifsCount?: number;
  onBack?: () => void;
  onOpenDrawer?: () => void;
}

export const TicketsScreen: React.FC<TicketsScreenProps> = ({
  onOpenNotifications,
  unreadNotifsCount = 0,
  onBack,
  onOpenDrawer
}) => {
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
    user?.role === 'COMPANY_STAFF' ||
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
      Alert.alert('Required Fields', 'Please enter a ticket subject and description.');
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
      Alert.alert('Ticket Submitted', 'Your ticket has been sent to hub facilities administration.');
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
      Alert.alert('Message Error', err.message || 'Failed to send message');
    } finally {
      setReplying(false);
    }
  };

  const handleClearChat = (ticketId: string, ticketNum: string) => {
    Alert.alert(
      'Clear Entire Chat',
      `This action will permanently delete all messages for ${ticketNum} from the database for both client and facility administrators. Do you want to proceed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All Messages',
          style: 'destructive',
          onPress: async () => {
            try {
              await mobileApi.clearTicketComments(ticketId);
              setTickets((prev) =>
                prev.map((t) => (t._id === ticketId ? { ...t, comments: [] } : t))
              );
              Alert.alert('Chat Cleared', 'Discussion thread deleted completely from database.');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete discussion thread');
            }
          }
        }
      ]
    );
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
    let color = '#0284C7';
    if (s === 'OPEN') color = '#F59E0B';
    if (s === 'IN_PROGRESS') color = '#00A859';
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
        subtitle={isAdmin ? 'Facility Operations Desk' : '24/7 Workplace Support Desk'}
        unreadNotifsCount={unreadNotifsCount}
        onOpenNotifications={onOpenNotifications}
        showBack={!!onBack}
        onPressBack={onBack}
        onOpenDrawer={onOpenDrawer}
      />

      <View style={styles.topActionsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((statusKey) => (
            <TouchableOpacity
              key={statusKey}
              style={[
                styles.filterTab,
                {
                  backgroundColor: selectedStatus === statusKey ? '#00A859' : theme.card,
                  borderColor: theme.cardBorder
                }
              ]}
              onPress={() => setSelectedStatus(statusKey)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  { color: selectedStatus === statusKey ? '#FFFFFF' : theme.textSecondary }
                ]}
              >
                {statusKey === 'ALL' ? 'All Tickets' : statusKey.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {canRaiseTickets && (
          <TouchableOpacity
            style={styles.raiseButton}
            onPress={() => setShowCreateModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.raiseButtonText}>Raise Ticket</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.categoryFilterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: selectedCategory === cat.key ? '#00A859' : theme.surface,
                  borderColor: selectedCategory === cat.key ? '#00A859' : theme.cardBorder
                }
              ]}
              onPress={() => setSelectedCategory(cat.key)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  { color: selectedCategory === cat.key ? '#FFFFFF' : theme.textPrimary }
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
          <ActivityIndicator size="large" color="#00A859" />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading support tickets...</Text>
        </View>
      ) : tickets.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="shield-checkmark-outline" size={54} color="#00A859" />
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Tickets Found</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            All workplace infrastructure and facilities are operating smoothly.
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
                      <Text style={[styles.ticketNumText, { color: '#00A859' }]}>{t.ticketNumber}</Text>
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
                        name="chatbubbles-outline"
                        size={15}
                        color="#00A859"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.commentCount, { color: '#00A859', fontWeight: '700' }]}>
                        {t.comments?.length || 0} messages
                      </Text>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color="#00A859"
                        style={{ marginLeft: 8 }}
                      />
                    </View>
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={[styles.expandedContent, { borderTopColor: theme.cardBorder }]}>
                    <View style={[styles.contextProductCard, { backgroundColor: isDark ? '#0F172A' : '#F0FDF4', borderColor: '#00A859' }]}>
                      <View style={styles.contextHeaderTop}>
                        <View style={styles.contextIconWrap}>
                          <Ionicons name="chatbubbles" size={16} color="#00A859" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                          <Text style={styles.contextSubheader}>DISCUSSION CONTEXT</Text>
                          <Text style={[styles.contextTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                            {t.title}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.clearChatBtn}
                          onPress={() => handleClearChat(t._id, t.ticketNumber)}
                        >
                          <Ionicons name="trash-outline" size={14} color="#DC2626" />
                          <Text style={styles.clearChatBtnText}>Clear Thread</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.contextMetaRow}>
                        <Text style={[styles.contextMetaItem, { color: theme.textMuted }]}>
                          Ref: <Text style={{ color: '#00A859', fontWeight: '700' }}>{t.ticketNumber}</Text>
                        </Text>
                        <Text style={[styles.contextMetaItem, { color: theme.textMuted }]}>
                          • Campus: <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>{t.locationId?.name || 'Madhapur Apex Hub'}</Text>
                        </Text>
                        <Text style={[styles.contextMetaItem, { color: theme.textMuted }]}>
                          • Status: <Text style={{ color: '#00A859', fontWeight: '700' }}>{t.status}</Text>
                        </Text>
                      </View>
                    </View>

                    {t.resolutionNotes && (
                      <View style={[styles.resolutionBox, { backgroundColor: '#ECFDF5', borderColor: '#10B981' }]}>
                        <Text style={[styles.resolutionHeader, { color: '#059669' }]}>Resolution Summary</Text>
                        <Text style={[styles.resolutionText, { color: '#064E3B' }]}>
                          {t.resolutionNotes}
                        </Text>
                      </View>
                    )}

                    {isAdmin && t.status !== 'RESOLVED' && t.status !== 'CLOSED' && (
                      <View style={styles.adminActionRow}>
                        {t.status === 'OPEN' && (
                          <TouchableOpacity
                            style={[styles.actionBtn, { borderColor: '#0284C7', backgroundColor: '#E0F2FE' }]}
                            onPress={() => handleUpdateStatus(t._id, 'IN_PROGRESS')}
                          >
                            <Text style={[styles.actionBtnText, { color: '#0284C7' }]}>Mark In Progress</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          style={[styles.actionBtn, { borderColor: '#00A859', backgroundColor: '#E8F5E9' }]}
                          onPress={() => {
                            setResolvingTicketId(t._id);
                            setShowResolveModal(true);
                          }}
                        >
                          <Text style={[styles.actionBtnText, { color: '#00A859' }]}>Resolve Ticket</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    <Text style={[styles.threadHeader, { color: theme.textSecondary }]}>Conversation Thread</Text>
                    {t.comments && t.comments.length > 0 ? (
                      t.comments.map((c, i) => {
                        const isOwn = c.authorId === user?.id;
                        const isStaff = c.authorRole.includes('ADMIN') || c.authorRole.includes('STAFF');
                        return (
                          <View
                            key={i}
                            style={[
                              styles.commentBubble,
                              isOwn ? styles.commentBubbleRight : styles.commentBubbleLeft,
                              {
                                backgroundColor: isOwn
                                  ? '#00A859'
                                  : isDark
                                  ? '#1E293B'
                                  : '#F1F5F9',
                                borderColor: isOwn ? '#00A859' : theme.cardBorder
                              }
                            ]}
                          >
                            <View style={styles.commentMeta}>
                              <Text
                                style={[
                                  styles.commentAuthor,
                                  { color: isOwn ? '#FFFFFF' : (isStaff ? '#0284C7' : '#00A859') }
                                ]}
                              >
                                {c.authorName}
                              </Text>
                              <Text
                                style={[
                                  styles.commentRole,
                                  { color: isOwn ? 'rgba(255,255,255,0.7)' : theme.textMuted }
                                ]}
                              >
                                {isStaff ? '• Operations Staff' : '• Client'}
                              </Text>
                            </View>
                            <Text
                              style={[
                                styles.commentMsg,
                                { color: isOwn ? '#FFFFFF' : theme.textPrimary }
                              ]}
                            >
                              {c.message}
                            </Text>
                          </View>
                        );
                      })
                    ) : (
                      <View style={styles.noCommentsBox}>
                        <Ionicons name="chatbubble-ellipses-outline" size={28} color={theme.textMuted} />
                        <Text style={[styles.noCommentsText, { color: theme.textMuted }]}>
                          No replies in thread. Post a message to discuss with hub facility staff.
                        </Text>
                      </View>
                    )}

                    <View style={styles.replyBox}>
                      <TextInput
                        style={[
                          styles.replyInput,
                          {
                            backgroundColor: theme.inputBg,
                            borderColor: theme.inputBorder,
                            color: theme.textPrimary
                          }
                        ]}
                        placeholder="Type a message or issue update..."
                        placeholderTextColor={theme.textMuted}
                        value={replyMessage}
                        onChangeText={setReplyMessage}
                      />
                      <TouchableOpacity
                        style={[styles.replySendBtn, { backgroundColor: '#00A859' }]}
                        onPress={() => handleSendComment(t._id)}
                        disabled={replying}
                      >
                        {replying ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Ionicons name="send" size={16} color="#FFFFFF" />
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
                        backgroundColor: newCategory === cat.key ? '#00A859' : theme.card,
                        borderColor: theme.cardBorder
                      }
                    ]}
                    onPress={() => setNewCategory(cat.key)}
                  >
                    <Text
                      style={[
                        styles.modalOptionPillText,
                        { color: newCategory === cat.key ? '#FFFFFF' : theme.textPrimary }
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.label, { color: theme.textSecondary }]}>Priority Level</Text>
              <View style={styles.prioritySelectorRow}>
                {PRIORITIES.map((p) => (
                  <TouchableOpacity
                    key={p.key}
                    style={[
                      styles.prioritySelectorPill,
                      {
                        backgroundColor: newPriority === p.key ? p.color : theme.card,
                        borderColor: theme.cardBorder
                      }
                    ]}
                    onPress={() => setNewPriority(p.key)}
                  >
                    <Text
                      style={[
                        styles.prioritySelectorText,
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
                placeholder="e.g., High-Speed WiFi down in Conference Room A"
                placeholderTextColor={theme.textMuted}
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <Text style={[styles.label, { color: theme.textSecondary }]}>Detailed Description</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }
                ]}
                placeholder="Describe what occurred, impacted rooms, and urgent requirements..."
                placeholderTextColor={theme.textMuted}
                value={newDescription}
                onChangeText={setNewDescription}
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity
                style={[styles.submitButton, submitting && { opacity: 0.7 }]}
                onPress={handleCreateTicket}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Ticket</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showResolveModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Resolve Support Ticket</Text>
              <TouchableOpacity onPress={() => setShowResolveModal(false)}>
                <Ionicons name="close" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: theme.textSecondary }]}>Resolution Summary Notes</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }
              ]}
              placeholder="State the resolution steps taken by the operations team..."
              placeholderTextColor={theme.textMuted}
              value={resolutionNotes}
              onChangeText={setResolutionNotes}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: '#10B981' }]}
              onPress={() => resolvingTicketId && handleUpdateStatus(resolvingTicketId, 'RESOLVED', resolutionNotes)}
            >
              <Text style={styles.submitButtonText}>Confirm Resolution</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  filterScroll: {
    flexDirection: 'row',
    gap: 8
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '700'
  },
  raiseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A859',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    marginLeft: 8
  },
  raiseButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4
  },
  categoryFilterRow: {
    paddingHorizontal: 16,
    marginBottom: 8
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 6
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '600'
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13
  },
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 6
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18
  },
  scrollList: {
    paddingHorizontal: 16
  },
  ticketCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
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
    fontWeight: '800'
  },
  companyLabel: {
    fontSize: 11,
    marginLeft: 6
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6
  },
  priorityPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1
  },
  priorityPillText: {
    fontSize: 10,
    fontWeight: '700'
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
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
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4
  },
  dateText: {
    fontSize: 11
  },
  expandRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  commentCount: {
    fontSize: 11
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1
  },
  contextProductCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
    marginBottom: 12
  },
  contextHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  contextIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  contextSubheader: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#00A859'
  },
  contextTitle: {
    fontSize: 13,
    fontWeight: '700'
  },
  clearChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  clearChatBtnText: {
    fontSize: 10,
    color: '#DC2626',
    fontWeight: '700',
    marginLeft: 3
  },
  contextMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 168, 89, 0.2)'
  },
  contextMetaItem: {
    fontSize: 11
  },
  resolutionBox: {
    padding: 12,
    borderRadius: 12,
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
    gap: 10,
    marginBottom: 12
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center'
  },
  actionBtnText: {
    fontSize: 12,
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
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    marginBottom: 8,
    maxWidth: '85%'
  },
  commentBubbleLeft: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2
  },
  commentBubbleRight: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3
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
    fontSize: 13,
    lineHeight: 18
  },
  noCommentsBox: {
    alignItems: 'center',
    paddingVertical: 14
  },
  noCommentsText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6
  },
  replyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  replyInput: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13
  },
  replySendBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalCard: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 22,
    borderWidth: 1,
    padding: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800'
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6
  },
  modalOptionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8
  },
  modalOptionPillText: {
    fontSize: 11,
    fontWeight: '600'
  },
  prioritySelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14
  },
  prioritySelectorPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center'
  },
  prioritySelectorText: {
    fontSize: 11,
    fontWeight: '700'
  },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    marginBottom: 14
  },
  textArea: {
    height: 90,
    paddingTop: 10,
    textAlignVertical: 'top'
  },
  submitButton: {
    backgroundColor: '#00A859',
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  }
});
