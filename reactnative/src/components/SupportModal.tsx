import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

interface SupportModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenTickets: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({
  visible,
  onClose,
  onOpenTickets
}) => {
  const { theme, isDark } = useTheme();

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/[^0-9+]/g, '')}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}?subject=HavenlyWork Support Request`);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: isDark ? '#0A0F1D' : '#FFFFFF',
              borderColor: isDark ? '#1E293B' : '#E2E8F0'
            }
          ]}
        >
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                Customer Support
              </Text>
              <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
                24/7 Workspace & Emergency Assistance
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={[styles.card, { backgroundColor: isDark ? '#0F172A' : '#F0FDF4', borderColor: '#00A859' }]}>
              <View style={styles.badgeRow}>
                <Ionicons name="flash" size={16} color="#00A859" />
                <Text style={styles.badgeText}>FACILITY EMERGENCY HOTLINE</Text>
              </View>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                Immediate On-Campus Assistance
              </Text>
              <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                For electrical outages, access card failures, or air conditioning emergencies.
              </Text>
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => handleCall('+919849012345')}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.callBtnText}>Call Emergency: +91 98490 12345</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <View style={styles.badgeRow}>
                <Ionicons name="headset" size={16} color="#0284C7" />
                <Text style={[styles.badgeText, { color: '#0284C7' }]}>HELPDESK TICKETS</Text>
              </View>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                File or Track Service Ticket
              </Text>
              <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                Two-way discussion thread with hub management and facility technicians.
              </Text>
              <TouchableOpacity
                style={[styles.callBtn, { backgroundColor: '#0284C7' }]}
                onPress={() => {
                  onClose();
                  onOpenTickets();
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="chatbubbles" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.callBtnText}>Open Helpdesk Chat</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <View style={styles.badgeRow}>
                <Ionicons name="mail" size={16} color="#7C3AED" />
                <Text style={[styles.badgeText, { color: '#7C3AED' }]}>EMAIL & BILLING</Text>
              </View>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                support@havenlywork.com
              </Text>
              <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                Corporate billing inquiries, contract extensions, and invoice reconciliations.
              </Text>
              <TouchableOpacity
                style={[styles.callBtn, { backgroundColor: '#7C3AED' }]}
                onPress={() => handleEmail('support@havenlywork.com')}
                activeOpacity={0.8}
              >
                <Ionicons name="mail-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.callBtnText}>Send Email Support</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800'
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 2
  },
  closeBtn: {
    padding: 4
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#00A859',
    marginLeft: 6
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00A859',
    height: 42,
    borderRadius: 12
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  }
});
