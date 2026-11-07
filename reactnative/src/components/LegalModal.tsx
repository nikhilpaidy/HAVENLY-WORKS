import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { mobileApi } from '../services/api';

interface LegalModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ visible, onClose }) => {
  const { theme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');
  const [legalData, setLegalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadLegalData();
    }
  }, [visible]);

  const loadLegalData = async () => {
    try {
      setLoading(true);
      const data = await mobileApi.getLegal();
      setLegalData(data);
    } catch {
      setLegalData({
        termsOfService: {
          lastUpdated: 'November 2026',
          sections: [
            {
              title: '1. Membership and Access Rights',
              content: 'Membership grants authorized access to assigned coworking hubs, meeting rooms, and shared workspaces subject to space availability and enterprise plan entitlements.'
            },
            {
              title: '2. Code of Workplace Conduct',
              content: 'All occupants must maintain a respectful, safe, and professional environment. Quiet zones and shared breakout lounges must be preserved in accordance with hub guidelines.'
            },
            {
              title: '3. Booking and Cancellation Policy',
              content: 'Room bookings may be cancelled up to 30 minutes prior to scheduled start time without quota deduction. No-show reservations are deducted from annual enterprise allocation.'
            },
            {
              title: '4. Enterprise Account Management',
              content: 'Enterprise staff accounts are issued and provisioned by the parent organization. Personal modification is restricted to profile imagery to ensure corporate compliance.'
            }
          ]
        },
        privacyPolicy: {
          lastUpdated: 'November 2026',
          sections: [
            {
              title: '1. Information We Collect',
              content: 'We collect account credentials, organization affiliation, check-in logs, and helpdesk communications to facilitate coworking access and facility support.'
            },
            {
              title: '2. Data Protection and Deletion',
              content: 'Users maintain the right to deactivate or delete their accounts. Discussion threads cleared via our helpdesk are permanently purged across all databases.'
            },
            {
              title: '3. Security Standards',
              content: 'All communication is encrypted using industry standard TLS protocols with strict role-based access control governing multi-tenant space segregation.'
            }
          ]
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const sections =
    activeTab === 'terms'
      ? legalData?.termsOfService?.sections || []
      : legalData?.privacyPolicy?.sections || [];

  const lastUpdated =
    activeTab === 'terms'
      ? legalData?.termsOfService?.lastUpdated || 'November 2026'
      : legalData?.privacyPolicy?.lastUpdated || 'November 2026';

  return (
    <Modal
      visible={visible}
      animationType="slide"
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
                Legal & Governance
              </Text>
              <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
                Last updated {lastUpdated}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === 'terms' && styles.tabBtnActive,
                { borderColor: theme.cardBorder }
              ]}
              onPress={() => setActiveTab('terms')}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === 'terms' ? '#FFFFFF' : theme.textSecondary }
                ]}
              >
                Terms of Service
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === 'privacy' && styles.tabBtnActive,
                { borderColor: theme.cardBorder }
              ]}
              onPress={() => setActiveTab('privacy')}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === 'privacy' ? '#FFFFFF' : theme.textSecondary }
                ]}
              >
                Privacy Policy
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.centerLoading}>
              <ActivityIndicator size="large" color="#00A859" />
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {sections.map((sec: any, idx: number) => (
                <View key={idx} style={styles.sectionBlock}>
                  <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
                    {sec.title}
                  </Text>
                  <Text style={[styles.sectionBody, { color: theme.textSecondary }]}>
                    {sec.content}
                  </Text>
                </View>
              ))}

              <View style={[styles.verifiedCard, { backgroundColor: isDark ? '#0F172A' : '#F0FDF4' }]}>
                <Ionicons name="shield-checkmark" size={20} color="#00A859" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.verifiedTitle, { color: theme.textPrimary }]}>
                    Enterprise Data Protection
                  </Text>
                  <Text style={[styles.verifiedDesc, { color: theme.textMuted }]}>
                    Compliant with Indian IT Act 2000 & Digital Personal Data Protection (DPDP) Act.
                  </Text>
                </View>
              </View>
            </ScrollView>
          )}

          <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
            <Text style={styles.doneBtnText}>I Understand & Agree</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    height: '84%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 20,
    paddingBottom: 36
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800'
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2
  },
  closeBtn: {
    padding: 4
  },
  tabRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center'
  },
  tabBtnActive: {
    backgroundColor: '#00A859',
    borderColor: '#00A859'
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700'
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  scrollContent: {
    paddingBottom: 20
  },
  sectionBlock: {
    marginBottom: 18
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6
  },
  sectionBody: {
    fontSize: 13,
    lineHeight: 20
  },
  verifiedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginTop: 10
  },
  verifiedTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2
  },
  verifiedDesc: {
    fontSize: 11,
    lineHeight: 16
  },
  doneBtn: {
    backgroundColor: '#00A859',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  }
});
