import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { mobileApi } from '../services/api';

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
  const { user } = useAuth();

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isCoworkingAdmin = user?.role === 'COWORKING_ADMIN';
  const canManageHotline = isSuperAdmin || isCoworkingAdmin;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const [hotline, setHotline] = useState('+91 (040) 4892-7100');
  const [email, setEmail] = useState('support@havenlywork.com');
  const [emergency, setEmergency] = useState('+91 98490 12345');
  const [whatsapp, setWhatsapp] = useState('+91 98490 12345');
  const [hours, setHours] = useState('24/7 Helpline & On-Site Concierge');

  const [editHotline, setEditHotline] = useState(hotline);
  const [editEmail, setEditEmail] = useState(email);
  const [editEmergency, setEditEmergency] = useState(emergency);
  const [editWhatsapp, setEditWhatsapp] = useState(whatsapp);
  const [editHours, setEditHours] = useState(hours);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      mobileApi
        .getSupportContact()
        .then((res) => {
          if (res) {
            setHotline(res.supportHotline || hotline);
            setEmail(res.supportEmail || email);
            setEmergency(res.emergencyContact || emergency);
            setWhatsapp(res.whatsappNumber || whatsapp);
            setHours(res.operatingHours || hours);

            setEditHotline(res.supportHotline || hotline);
            setEditEmail(res.supportEmail || email);
            setEditEmergency(res.emergencyContact || emergency);
            setEditWhatsapp(res.whatsappNumber || whatsapp);
            setEditHours(res.operatingHours || hours);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [visible]);

  const handleSaveHelpline = async () => {
    setSaving(true);
    try {
      const updated = await mobileApi.updateSupportContact({
        supportHotline: editHotline,
        supportEmail: editEmail,
        emergencyContact: editEmergency,
        whatsappNumber: editWhatsapp,
        operatingHours: editHours
      });
      if (updated) {
        setHotline(updated.supportHotline || editHotline);
        setEmail(updated.supportEmail || editEmail);
        setEmergency(updated.emergencyContact || editEmergency);
        setWhatsapp(updated.whatsappNumber || editWhatsapp);
        setHours(updated.operatingHours || editHours);
      }
      setShowEditForm(false);
      Alert.alert('Saved', 'Support helpline details updated successfully.');
    } catch (err: any) {
      Alert.alert('Update Error', err.message || 'Could not update support details.');
    } finally {
      setSaving(false);
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/[^0-9+]/g, '')}`);
  };

  const handleEmail = (targetEmail: string) => {
    Linking.openURL(`mailto:${targetEmail}?subject=HavenlyWork Support Request`);
  };

  const handleWhatsApp = (targetPhone: string) => {
    const cleanNum = targetPhone.replace(/[^0-9]/g, '');
    Linking.openURL(`https://wa.me/${cleanNum}?text=Hello%20HavenlyWork%20Support`);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
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
                Customer Support Helpline
              </Text>
              <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
                {hours}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          {canManageHotline && (
            <TouchableOpacity
              style={[
                styles.adminToggleBtn,
                { backgroundColor: showEditForm ? '#EF4444' : '#00A859' }
              ]}
              onPress={() => setShowEditForm(!showEditForm)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={showEditForm ? 'close-circle' : 'create-outline'}
                size={16}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.adminToggleText}>
                {showEditForm ? 'Cancel Edit' : 'Add / Update Hotline Details'}
              </Text>
            </TouchableOpacity>
          )}

          <ScrollView showsVerticalScrollIndicator={false}>
            {showEditForm ? (
              <View style={[styles.editCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Text style={[styles.editTitle, { color: theme.textPrimary }]}>
                  Manage Customer Support Helpline
                </Text>

                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Support Hotline Phone</Text>
                <TextInput
                  style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                  value={editHotline}
                  onChangeText={setEditHotline}
                  placeholder="+91 (040) 4892-7100"
                  placeholderTextColor={theme.textMuted}
                />

                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Emergency Contact Phone</Text>
                <TextInput
                  style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                  value={editEmergency}
                  onChangeText={setEditEmergency}
                  placeholder="+91 98490 12345"
                  placeholderTextColor={theme.textMuted}
                />

                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>WhatsApp Helpline</Text>
                <TextInput
                  style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                  value={editWhatsapp}
                  onChangeText={setEditWhatsapp}
                  placeholder="+91 98490 12345"
                  placeholderTextColor={theme.textMuted}
                />

                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Support Email Address</Text>
                <TextInput
                  style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="support@havenlywork.com"
                  placeholderTextColor={theme.textMuted}
                  autoCapitalize="none"
                />

                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Operating Hours & Concierge Note</Text>
                <TextInput
                  style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                  value={editHours}
                  onChangeText={setEditHours}
                  placeholder="24/7 Helpline & On-Site Concierge"
                  placeholderTextColor={theme.textMuted}
                />

                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSaveHelpline}
                  disabled={saving}
                  activeOpacity={0.8}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Hotline Details</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={[styles.card, { backgroundColor: isDark ? '#0F172A' : '#F0FDF4', borderColor: '#00A859' }]}>
                  <View style={styles.badgeRow}>
                    <Ionicons name="call" size={16} color="#00A859" />
                    <Text style={styles.badgeText}>CUSTOMER SUPPORT HELPLINE</Text>
                  </View>
                  <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                    {hotline}
                  </Text>
                  <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                    Central hotline managed by Super Admin for platform inquiries, reservation escalations, and onboarding.
                  </Text>
                  <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() => handleCall(hotline)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="call" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.callBtnText}>Call Hotline: {hotline}</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <View style={styles.badgeRow}>
                    <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
                    <Text style={[styles.badgeText, { color: '#25D366' }]}>WHATSAPP ASSISTANCE</Text>
                  </View>
                  <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                    Chat on WhatsApp
                  </Text>
                  <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                    Instant messaging assistance for directions, invoice receipts, and workspace passes.
                  </Text>
                  <TouchableOpacity
                    style={[styles.callBtn, { backgroundColor: '#25D366' }]}
                    onPress={() => handleWhatsApp(whatsapp)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.callBtnText}>Chat: {whatsapp}</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.card, { backgroundColor: isDark ? '#1F1E2E' : '#FEF3C7', borderColor: '#F59E0B' }]}>
                  <View style={styles.badgeRow}>
                    <Ionicons name="alert-circle" size={16} color="#D97706" />
                    <Text style={[styles.badgeText, { color: '#D97706' }]}>EMERGENCY HOTLINE</Text>
                  </View>
                  <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                    {emergency}
                  </Text>
                  <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                    Immediate assistance for access card lockouts, electrical outages, or facility emergencies.
                  </Text>
                  <TouchableOpacity
                    style={[styles.callBtn, { backgroundColor: '#D97706' }]}
                    onPress={() => handleCall(emergency)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="call" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.callBtnText}>Call Emergency: {emergency}</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <View style={styles.badgeRow}>
                    <Ionicons name="chatbubbles" size={16} color="#0284C7" />
                    <Text style={[styles.badgeText, { color: '#0284C7' }]}>HUB HELPDESK & COMPLAINTS</Text>
                  </View>
                  <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                    Coworking Admin Helpdesk
                  </Text>
                  <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                    Complaints are addressed directly by your registered Coworking Hub Admin profile and on-site facility team.
                  </Text>
                  <TouchableOpacity
                    style={[styles.callBtn, { backgroundColor: '#0284C7' }]}
                    onPress={() => {
                      onClose();
                      onOpenTickets();
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="chatbubble-ellipses" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.callBtnText}>Open Helpdesk & Complaints</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <View style={styles.badgeRow}>
                    <Ionicons name="mail" size={16} color="#7C3AED" />
                    <Text style={[styles.badgeText, { color: '#7C3AED' }]}>EMAIL SUPPORT</Text>
                  </View>
                  <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                    {email}
                  </Text>
                  <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                    Formal corporate inquiries, partnership proposals, and contract extensions.
                  </Text>
                  <TouchableOpacity
                    style={[styles.callBtn, { backgroundColor: '#7C3AED' }]}
                    onPress={() => handleEmail(email)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="mail-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.callBtnText}>Send Email Support</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalContent: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
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
  adminToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 14
  },
  adminToggleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  editCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14
  },
  editTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 8
  },
  inputField: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13
  },
  saveBtn: {
    backgroundColor: '#00A859',
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12
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