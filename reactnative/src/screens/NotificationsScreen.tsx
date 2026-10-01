import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { mobileApi } from '../services/api';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Ionicons } from '@expo/vector-icons';

interface NotificationsScreenProps {
  onBack: () => void;
  onRefreshBadge: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBack,
  onRefreshBadge
}) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifs = async () => {
    try {
      const data = await mobileApi.getNotifications();
      setNotifications(data || []);
      onRefreshBadge();
    } catch (err) {
      console.error('Failed to load notifications:', err);
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
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await mobileApi.markAllNotificationsRead();
      fetchNotifs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Activity Alerts"
        subtitle="In-App Notifications"
        showBack
        onPressBack={onBack}
      />

      <View style={styles.actionsBar}>
        <Text style={styles.alertCount}>
          {notifications.filter((n) => !n.isRead).length} unread alerts
        </Text>
        <TouchableOpacity onPress={markAllRead} style={styles.markAllButton}>
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.brassLight} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchNotifs();
              }}
              tintColor={colors.brassLight}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons name="notifications-outline" size={36} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptySub}>
                Reservation confirmations and quota notices will appear here.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <TouchableOpacity
                onPress={() => markRead(item._id)}
                activeOpacity={0.8}
                style={[styles.notifCard, !item.isRead && styles.notifUnread]}
              >
                <View style={styles.iconWrap}>
                  <Ionicons
                    name={item.isRead ? 'mail-open-outline' : 'mail-unread'}
                    size={20}
                    color={item.isRead ? colors.textMuted : colors.brassLight}
                  />
                </View>

                <View style={styles.contentWrap}>
                  <View style={styles.topRow}>
                    <Text style={[styles.notifTitle, !item.isRead && styles.titleUnread]}>
                      {item.title}
                    </Text>
                    <Text style={styles.notifDate}>{dateStr}</Text>
                  </View>
                  <Text style={styles.notifMessage}>{item.message}</Text>
                </View>
              </TouchableOpacity>
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
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder
  },
  alertCount: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary
  },
  markAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8
  },
  markAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.brassLight
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  listContent: {
    padding: 20
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
  notifCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    marginBottom: 10
  },
  notifUnread: {
    borderColor: colors.brassLight,
    backgroundColor: '#151D2E'
  },
  iconWrap: {
    marginRight: 12,
    marginTop: 2
  },
  contentWrap: {
    flex: 1
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    flex: 1,
    marginRight: 8
  },
  titleUnread: {
    fontWeight: '800',
    color: colors.textPrimary
  },
  notifDate: {
    fontSize: 10,
    color: colors.textMuted
  },
  notifMessage: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16
  }
});
