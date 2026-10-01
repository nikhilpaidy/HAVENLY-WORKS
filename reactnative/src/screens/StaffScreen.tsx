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

interface StaffItem {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  designation?: string;
  permissions: string[];
  companyId?: { _id: string; name: string };
  isActive: boolean;
  createdAt: string;
}

const SUPER_ADMIN_PERMISSIONS = [
  { key: 'view_spaces', label: 'View Hub Spaces', desc: 'Browse regional coworking areas and capacity' },
  { key: 'view_analytics', label: 'Platform Analytics', desc: 'Monitor national platform metrics and telemetry' },
  { key: 'manage_blogs', label: 'Publish Insights & Blogs', desc: 'Author and distribute educational articles' }
];

const COWORKING_ADMIN_PERMISSIONS = [
  { key: 'manage_bookings', label: 'Book & Cancel Reservations', desc: 'Schedule rooms for corporate clients and manage cancellations' },
  { key: 'manage_tickets', label: 'Resolve Facilities Tickets', desc: 'Arbitrate complaints, WiFi, AC, and pantry requests' },
  { key: 'view_clients', label: 'Manage Corporate Tenants', desc: 'Review GSTIN, PAN, and tenant credentials' },
  { key: 'manage_rooms', label: 'Room Rates & Capacities', desc: 'Adjust hourly pricing and seating allocations' }
];

const COMPANY_STAFF_PERMISSIONS = [
  { key: 'book_rooms', label: 'Reserve Meeting Rooms', desc: 'Book executive boardrooms and pods using corporate quota' },
  { key: 'view_allowance', label: 'Inspect Quota Ledgers', desc: 'Review monthly complimentary balance and statements' },
  { key: 'raise_tickets', label: 'Raise Facilities Helpdesk', desc: 'Submit complaints and request on-site amenities' }
];

export const StaffScreen: React.FC<{
  onOpenNotifications?: () => void;
  unreadNotifsCount?: number;
}> = ({ onOpenNotifications, unreadNotifsCount = 0 }) => {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();

  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [editStaff, setEditStaff] = useState<StaffItem | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [updatingPerms, setUpdatingPerms] = useState(false);

  const [showResetModal, setShowResetModal] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [newClientPassword, setNewClientPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isCoworkingAdmin = user?.role === 'COWORKING_ADMIN';
  const isCompanyOwner = user?.role === 'COMPANY_OWNER';
  const canManageStaff = isSuperAdmin || isCoworkingAdmin || isCompanyOwner;

  const availablePermissions = isSuperAdmin
    ? SUPER_ADMIN_PERMISSIONS
    : isCoworkingAdmin
    ? COWORKING_ADMIN_PERMISSIONS
    : COMPANY_STAFF_PERMISSIONS;

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await mobileApi.staff.getStaff();
      setStaffList(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.warn('Failed to load staff list:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    if (isCoworkingAdmin) {
      try {
        const comps = await mobileApi.getCompanies();
        setCompanies(Array.isArray(comps) ? comps : []);
        if (comps.length > 0) setSelectedCompanyId(comps[0]._id);
      } catch {}
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchCompanies();
  }, []);

  const handleCreateStaff = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please fill in Name, Email, and Temporary Password.');
      return;
    }
    try {
      setSubmitting(true);
      await mobileApi.staff.createStaff({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        phone: phone.trim() || undefined,
        designation: designation.trim() || undefined,
        permissions: selectedPermissions
      });
      setShowAddModal(false);
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setDesignation('');
      setSelectedPermissions([]);
      fetchStaff();
      Alert.alert('Staff Member Added', 'Account created with designated access permissions.');
    } catch (err: any) {
      Alert.alert('Failed to Create Staff', err.message || 'Error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSavePermissions = async () => {
    if (!editStaff) return;
    try {
      setUpdatingPerms(true);
      await mobileApi.staff.updateStaffPermissions(editStaff._id, editPermissions);
      setEditStaff(null);
      fetchStaff();
      Alert.alert('Permissions Updated', 'Permissions updated and reflected immediately in active sessions.');
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update permissions');
    } finally {
      setUpdatingPerms(false);
    }
  };

  const handleResetClientPassword = async () => {
    if (!selectedCompanyId || !newClientPassword.trim()) {
      Alert.alert('Required Fields', 'Please select a company and enter the new password.');
      return;
    }
    try {
      setResettingPassword(true);
      await mobileApi.staff.resetClientPassword(selectedCompanyId, newClientPassword.trim());
      setShowResetModal(false);
      setNewClientPassword('');
      Alert.alert('Password Reset', 'Client company primary owner password has been successfully reset.');
    } catch (err: any) {
      Alert.alert('Reset Failed', err.message || 'Could not reset client password');
    } finally {
      setResettingPassword(false);
    }
  };

  const togglePermission = (permKey: string, isEditing: boolean = false) => {
    if (isEditing) {
      setEditPermissions((prev) =>
        prev.includes(permKey) ? prev.filter((k) => k !== permKey) : [...prev, permKey]
      );
    } else {
      setSelectedPermissions((prev) =>
        prev.includes(permKey) ? prev.filter((k) => k !== permKey) : [...prev, permKey]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Staff & Permissions"
        subtitle={
          isSuperAdmin
            ? 'Super Admin Regional & Ops Staff'
            : isCoworkingAdmin
            ? 'Hub Front Desk & Facilities Staff'
            : 'Corporate Company Team & Delegates'
        }
        unreadNotifsCount={unreadNotifsCount}
        onOpenNotifications={onOpenNotifications}
      />

      {canManageStaff && (
        <View style={styles.topActionsBar}>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.gold }]}
            onPress={() => {
              setSelectedPermissions(availablePermissions.map((p) => p.key));
              setShowAddModal(true);
            }}
          >
            <Ionicons name="person-add-outline" size={16} color="#050814" />
            <Text style={styles.addBtnText}>Add Staff Member</Text>
          </TouchableOpacity>

          {isCoworkingAdmin && (
            <TouchableOpacity
              style={[styles.secBtn, { borderColor: theme.gold, backgroundColor: `${theme.gold}15` }]}
              onPress={() => setShowResetModal(true)}
            >
              <Ionicons name="key-outline" size={16} color={theme.gold} />
              <Text style={[styles.secBtnText, { color: theme.gold }]}>Reset Client Password</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={theme.gold} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading staff hierarchy...</Text>
        </View>
      ) : staffList.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="people-outline" size={54} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Staff Delegated</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            {canManageStaff
              ? 'Delegate operational responsibilities by adding staff members with customized privileges.'
              : 'You have direct executive administration privileges.'}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollList} contentContainerStyle={{ paddingBottom: 100 }}>
          {staffList.map((staff) => (
            <View
              key={staff._id}
              style={[styles.staffCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            >
              <View style={styles.staffHeader}>
                <View style={styles.staffMeta}>
                  <Text style={[styles.staffName, { color: theme.textPrimary }]}>{staff.name}</Text>
                  {staff.designation && (
                    <Text style={[styles.staffDesignation, { color: theme.gold }]}>{staff.designation}</Text>
                  )}
                  <Text style={[styles.staffEmail, { color: theme.textSecondary }]}>{staff.email}</Text>
                </View>

                {canManageStaff && (
                  <TouchableOpacity
                    style={[styles.editPermsBtn, { borderColor: theme.cardBorder, backgroundColor: theme.surface }]}
                    onPress={() => {
                      setEditStaff(staff);
                      setEditPermissions(staff.permissions || []);
                    }}
                  >
                    <Ionicons name="shield-outline" size={14} color={theme.gold} />
                    <Text style={[styles.editPermsBtnText, { color: theme.gold }]}>Permissions</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.permsContainer}>
                <Text style={[styles.permsLabel, { color: theme.textMuted }]}>Assigned Privileges:</Text>
                <View style={styles.permsChipsRow}>
                  {staff.permissions && staff.permissions.length > 0 ? (
                    staff.permissions.map((pKey) => {
                      const match = availablePermissions.find((x) => x.key === pKey);
                      return (
                        <View
                          key={pKey}
                          style={[styles.permChip, { backgroundColor: `${theme.gold}18`, borderColor: theme.gold }]}
                        >
                          <Ionicons name="checkmark-circle" size={12} color={theme.gold} style={{ marginRight: 4 }} />
                          <Text style={[styles.permChipText, { color: theme.gold }]}>
                            {match ? match.label : pKey.replace('_', ' ')}
                          </Text>
                        </View>
                      );
                    })
                  ) : (
                    <Text style={[styles.noPermsText, { color: theme.textMuted }]}>
                      No specific privileges granted yet.
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ADD STAFF MODAL */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Delegate New Staff</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Full Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                placeholder="e.g. Priya Sharma"
                placeholderTextColor={theme.textMuted}
                value={name}
                onChangeText={setName}
              />

              <Text style={[styles.label, { color: theme.textSecondary }]}>Official Email *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                placeholder="staff@domain.com"
                placeholderTextColor={theme.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={[styles.label, { color: theme.textSecondary }]}>Temporary Access Password *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                placeholder="Initial secure password"
                placeholderTextColor={theme.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <Text style={[styles.label, { color: theme.textSecondary }]}>Phone Number</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                placeholder="+91 98450 00000"
                placeholderTextColor={theme.textMuted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <Text style={[styles.label, { color: theme.textSecondary }]}>Designation / Role Title</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                placeholder="e.g. Front Desk Lead or People Operations"
                placeholderTextColor={theme.textMuted}
                value={designation}
                onChangeText={setDesignation}
              />

              <Text style={[styles.label, { color: theme.textSecondary, marginTop: 4 }]}>Access Privileges</Text>
              {availablePermissions.map((perm) => {
                const isSelected = selectedPermissions.includes(perm.key);
                return (
                  <TouchableOpacity
                    key={perm.key}
                    style={[
                      styles.permSelectCard,
                      {
                        backgroundColor: isSelected ? `${theme.gold}14` : theme.card,
                        borderColor: isSelected ? theme.gold : theme.cardBorder
                      }
                    ]}
                    onPress={() => togglePermission(perm.key, false)}
                  >
                    <Ionicons
                      name={isSelected ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={isSelected ? theme.gold : theme.textMuted}
                    />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.permSelectTitle, { color: theme.textPrimary }]}>{perm.label}</Text>
                      <Text style={[styles.permSelectDesc, { color: theme.textSecondary }]}>{perm.desc}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: theme.gold }]}
                onPress={handleCreateStaff}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#050814" />
                ) : (
                  <Text style={styles.submitBtnText}>Create Staff Account</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* EDIT PERMISSIONS MODAL */}
      <Modal visible={!!editStaff} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Edit Staff Privileges</Text>
                <Text style={[styles.modalSubtitle, { color: theme.gold }]}>{editStaff?.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setEditStaff(null)}>
                <Ionicons name="close" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.liveSyncNote, { color: theme.textSecondary }]}>
                Changes apply instantly in active mobile and web sessions without requiring logout.
              </Text>

              {availablePermissions.map((perm) => {
                const isSelected = editPermissions.includes(perm.key);
                return (
                  <TouchableOpacity
                    key={perm.key}
                    style={[
                      styles.permSelectCard,
                      {
                        backgroundColor: isSelected ? `${theme.gold}14` : theme.card,
                        borderColor: isSelected ? theme.gold : theme.cardBorder
                      }
                    ]}
                    onPress={() => togglePermission(perm.key, true)}
                  >
                    <Ionicons
                      name={isSelected ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={isSelected ? theme.gold : theme.textMuted}
                    />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.permSelectTitle, { color: theme.textPrimary }]}>{perm.label}</Text>
                      <Text style={[styles.permSelectDesc, { color: theme.textSecondary }]}>{perm.desc}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: theme.gold }]}
                onPress={handleSavePermissions}
                disabled={updatingPerms}
              >
                {updatingPerms ? (
                  <ActivityIndicator color="#050814" />
                ) : (
                  <Text style={styles.submitBtnText}>Save Privileges</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* RESET CLIENT PASSWORD MODAL (COWORKING ADMIN ONLY) */}
      <Modal visible={showResetModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Reset Client Company Password</Text>
              <TouchableOpacity onPress={() => setShowResetModal(false)}>
                <Ionicons name="close" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: theme.textSecondary }]}>Select Client Company</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {companies.map((c) => (
                <TouchableOpacity
                  key={c._id}
                  style={[
                    styles.companySelectPill,
                    {
                      backgroundColor: selectedCompanyId === c._id ? theme.gold : theme.card,
                      borderColor: theme.cardBorder
                    }
                  ]}
                  onPress={() => setSelectedCompanyId(c._id)}
                >
                  <Text
                    style={[
                      styles.companySelectText,
                      { color: selectedCompanyId === c._id ? '#050814' : theme.textPrimary }
                    ]}
                  >
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.label, { color: theme.textSecondary }]}>New Temporary Password</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
              placeholder="e.g. Corporate@2026"
              placeholderTextColor={theme.textMuted}
              value={newClientPassword}
              onChangeText={setNewClientPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: theme.gold }]}
              onPress={handleResetClientPassword}
              disabled={resettingPassword}
            >
              {resettingPassword ? (
                <ActivityIndicator color="#050814" />
              ) : (
                <Text style={styles.submitBtnText}>Confirm Password Reset</Text>
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
  topActionsBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6
  },
  addBtnText: {
    color: '#050814',
    fontSize: 12,
    fontWeight: '700'
  },
  secBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6
  },
  secBtnText: {
    fontSize: 12,
    fontWeight: '700'
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
  staffCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12
  },
  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  staffMeta: {
    flex: 1
  },
  staffName: {
    fontSize: 15,
    fontWeight: '700'
  },
  staffDesignation: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2
  },
  staffEmail: {
    fontSize: 12,
    marginTop: 2
  },
  editPermsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4
  },
  editPermsBtnText: {
    fontSize: 11,
    fontWeight: '700'
  },
  permsContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 10
  },
  permsLabel: {
    fontSize: 11,
    marginBottom: 6
  },
  permsChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  permChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1
  },
  permChipText: {
    fontSize: 11,
    fontWeight: '600'
  },
  noPermsText: {
    fontSize: 11,
    fontStyle: 'italic'
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
  modalSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2
  },
  liveSyncNote: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 14
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    marginBottom: 12
  },
  permSelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8
  },
  permSelectTitle: {
    fontSize: 13,
    fontWeight: '700'
  },
  permSelectDesc: {
    fontSize: 11,
    marginTop: 2
  },
  submitBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24
  },
  submitBtnText: {
    color: '#050814',
    fontSize: 14,
    fontWeight: '700'
  },
  companySelectPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6
  },
  companySelectText: {
    fontSize: 12,
    fontWeight: '700'
  }
});
