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
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
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
              style={styles.adminEditLink}
              onPress={() => setShowEditForm(!showEditForm)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showEditForm ? 'close-circle-outline' : 'create-outline'}
                size={15}
                color="#00A859"
                style={{ marginRight: 5 }}
              />
              <Text style={styles.adminEditText}>
                {showEditForm ? 'Cancel Edit' : 'Edit Hotline Details'}
              </Text>
            </TouchableOpacity>
          )}

          {loading ? (
            <View style={styles.centerLoading}>
              <ActivityIndicator size="large" color="#00A859" />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {showEditForm ? (
                <View style={styles.formContainer}>
                  <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
                    Update Support Hotline Information
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
                  <View style={styles.sectionBlock}>
                    <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
                      1. General Support Hotline
                    </Text>
                    <Text style={[styles.sectionBody, { color: theme.textSecondary }]}>
                      Central hotline for platform inquiries, reservation assistance, and corporate onboarding.
                    </Text>
                    <TouchableOpacity
                      style={styles.contactActionRow}
                      onPress={() => handleCall(hotline)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="call-outline" size={17} color="#00A859" style={{ marginRight: 8 }} />
                      <Text style={styles.contactActionText}>{hotline}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.sectionBlock}>
                    <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
                      2. Emergency Assistance
                    </Text>
                    <Text style={[styles.sectionBody, { color: theme.textSecondary }]}>
                      Immediate response for access card lockouts, electrical outages, or facility emergencies.
                    </Text>
                    <TouchableOpacity
                      style={styles.contactActionRow}
                      onPress={() => handleCall(emergency)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="alert-circle-outline" size={17} color="#00A859" style={{ marginRight: 8 }} />
                      <Text style={styles.contactActionText}>{emergency}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.sectionBlock}>
                    <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
                      3. WhatsApp Assistance
                    </Text>
                    <Text style={[styles.sectionBody, { color: theme.textSecondary }]}>
                      Direct messaging support for hub directions, invoice receipts, and workspace entry.
                    </Text>
                    <TouchableOpacity
                      style={styles.contactActionRow}
                      onPress={() => handleWhatsApp(whatsapp)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="logo-whatsapp" size={17} color="#00A859" style={{ marginRight: 8 }} />
                      <Text style={styles.contactActionText}>Chat via WhatsApp: {whatsapp}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.sectionBlock}>
                    <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
                      4. Formal Email Support
                    </Text>
                    <Text style={[styles.sectionBody, { color: theme.textSecondary }]}>
                      Corporate partnership proposals, enterprise agreements, and billing inquiries.
                    </Text>
                    <TouchableOpacity
                      style={styles.contactActionRow}
                      onPress={() => handleEmail(email)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="mail-outline" size={17} color="#00A859" style={{ marginRight: 8 }} />
                      <Text style={styles.contactActionText}>{email}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.sectionBlock}>
                    <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
                      5. Facilities Helpdesk & Complaints
                    </Text>
                    <Text style={[styles.sectionBody, { color: theme.textSecondary }]}>
                      Tickets and maintenance requests are addressed directly by your assigned Coworking Hub Admin.
                    </Text>
                    <TouchableOpacity
                      style={styles.contactActionRow}
                      onPress={() => {
                        onClose();
                        onOpenTickets();
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="chatbubbles-outline" size={17} color="#00A859" style={{ marginRight: 8 }} />
                      <Text style={styles.contactActionText}>Open Facilities Helpdesk</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.verifiedCard, { backgroundColor: isDark ? '#0F172A' : '#F0FDF4' }]}>
                    <Ionicons name="shield-checkmark" size={20} color="#00A859" />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.verifiedTitle, { color: theme.textPrimary }]}>
                        Enterprise Support Standard
                      </Text>
                      <Text style={[styles.verifiedDesc, { color: theme.textMuted }]}>
                        Guaranteed on-site concierge dispatch and response time under 15 minutes.
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          )}

          <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>Close</Text>
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
    fontSize: 18,
    fontWeight: '800'
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2
  },
  closeBtn: {
    padding: 4
  },
  adminEditLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14
  },
  adminEditText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00A859'
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollContent: {
    paddingBottom: 24
  },
  sectionBlock: {
    marginBottom: 20
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 5
  },
  sectionBody: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 8
  },
  contactActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4
  },
  contactActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00A859'
  },
  verifiedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginTop: 10,
    marginBottom: 10
  },
  verifiedTitle: {
    fontSize: 13,
    fontWeight: '700'
  },
  verifiedDesc: {
    fontSize: 11.5,
    marginTop: 2
  },
  doneBtn: {
    backgroundColor: '#00A859',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  },
  formContainer: {
    paddingBottom: 16
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 10
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
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  }
});