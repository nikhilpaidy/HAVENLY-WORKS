import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { mobileApi } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { ListRowSkeleton } from '../components/SkeletonLoader';

interface NotificationsScreenProps {
  onBack: () => void;
  onRefreshBadge: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBack,
  onRefreshBadge
}) => {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isCoworkingAdmin = user?.role === 'COWORKING_ADMIN';
  const canBroadcast = isSuperAdmin || isCoworkingAdmin;

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const fetchNotifs = async () => {
    try {
      const data = await mobileApi.getNotifications();
      setNotifications(data || []);
      onRefreshBadge();
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const markRead = async (id: string) => {
    try {
      await mobileApi.markNotificationRead(id);
      fetchNotifs();
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await mobileApi.markAllNotificationsRead();
      fetchNotifs();
    } catch {}
  };

  const handleSendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      Alert.alert('Required', 'Please fill in both title and message.');
      return;
    }

    try {
      setIsBroadcasting(true);
      await mobileApi.broadcastNotification({
        title: broadcastTitle.trim(),
        message: broadcastMessage.trim()
      });
      setShowBroadcastModal(false);
      setBroadcastTitle('');
      setBroadcastMessage('');
      Alert.alert('Broadcast Sent', 'Your notification has been dispatched to all workspace members.');
      fetchNotifs();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not send broadcast.');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'FESTIVAL_GREETING':
        return { name: 'ribbon' as const, color: '#D97706', bg: '#FEF3C7' };
      case 'GUEST_INQUIRY':
        return { name: 'call' as const, color: '#00A859', bg: '#DCFCE7' };
      case 'BOOKING_CONFIRMED':
        return { name: 'checkmark-circle' as const, color: '#00A859', bg: '#DCFCE7' };
      case 'BOOKING_CANCELLED':
        return { name: 'close-circle' as const, color: '#EF4444', bg: '#FEE2E2' };
      default:
        return { name: 'notifications' as const, color: '#00A859', bg: '#DCFCE7' };
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const iconMeta = getIconForType(item.type);
    const dateFormatted = new Date(item.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <TouchableOpacity
        style={[
          styles.notifCard,
          { backgroundColor: theme.card, borderColor: theme.cardBorder },
          !item.isRead && styles.unreadCard
        ]}
        onPress={() => !item.isRead && markRead(item._id)}
        activeOpacity={0.8}
      >
        <View style={[styles.iconCircle, { backgroundColor: iconMeta.bg }]}>
          <Ionicons name={iconMeta.name} size={18} color={iconMeta.color} />
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[styles.notifTitle, { color: theme.textPrimary }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={{ fontSize: 11, color: theme.textMuted }}>{dateFormatted}</Text>
          </View>
          <Text style={[styles.notifMessage, { color: theme.textSecondary }]}>{item.message}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="chevron-back" size={22} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Notifications</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {canBroadcast && (
            <TouchableOpacity
              style={styles.broadcastBtn}
              onPress={() => setShowBroadcastModal(true)}
            >
              <Ionicons name="megaphone-outline" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.broadcastBtnText}>Broadcast</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark read</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={{ padding: 20 }}>
          <ListRowSkeleton />
          <ListRowSkeleton />
          <ListRowSkeleton />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyView}>
          <Ionicons name="notifications-off-outline" size={48} color={theme.textMuted} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No notifications yet.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchNotifs} tintColor="#00A859" />}
        />
      )}

      <Modal
        visible={showBroadcastModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBroadcastModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Send Announcement</Text>
              <TouchableOpacity onPress={() => setShowBroadcastModal(false)}>
                <Ionicons name="close" size={22} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Announcement Title</Text>
              <TextInput
                style={[styles.textInput, { color: theme.textPrimary, borderColor: theme.cardBorder, backgroundColor: theme.inputBg }]}
                placeholder="e.g. Diwali & New Year Weekend Offers!"
                placeholderTextColor={theme.textMuted}
                value={broadcastTitle}
                onChangeText={setBroadcastTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Message</Text>
              <TextInput
                style={[styles.textArea, { color: theme.textPrimary, borderColor: theme.cardBorder, backgroundColor: theme.inputBg }]}
                placeholder="Type your message for all members..."
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={4}
                value={broadcastMessage}
                onChangeText={setBroadcastMessage}
              />
            </View>

            <TouchableOpacity
              style={[styles.sendBtn, isBroadcasting && { opacity: 0.7 }]}
              onPress={handleSendBroadcast}
              disabled={isBroadcasting}
            >
              {isBroadcasting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.sendBtnText}>Dispatch to All Members</Text>
              )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    flex: 1,
    marginLeft: 8
  },
  broadcastBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A859',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  broadcastBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  markAllBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8
  },
  markAllText: {
    color: '#00A859',
    fontSize: 13,
    fontWeight: '600'
  },
  listContent: {
    padding: 20,
    paddingBottom: 90
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#00A859'
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginRight: 6
  },
  notifMessage: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18
  },
  emptyView: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80
  },
  emptyText: {
    fontSize: 14,
    marginTop: 10
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end'
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 24,
    paddingBottom: 40
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800'
  },
  inputGroup: {
    marginBottom: 14
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6
  },
  textInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14
  },
  textArea: {
    height: 90,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top'
  },
  sendBtn: {
    backgroundColor: '#00A859',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  }
});
