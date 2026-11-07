import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { mobileApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface BookModalProps {
  visible: boolean;
  room: any | null;
  onClose: () => void;
  onSuccess: (booking: any) => void;
}

export const BookModal: React.FC<BookModalProps> = ({
  visible,
  room,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isAdminRole = user?.role === 'SUPER_ADMIN' || user?.role === 'COWORKING_ADMIN';
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(user?.companyId || '');

  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [durationSlots, setDurationSlots] = useState(2);
  const [title, setTitle] = useState('Executive Strategy Review');
  const [attendeeCount, setAttendeeCount] = useState('4');
  const [purpose, setPurpose] = useState('Client presentation');
  const [estimate, setEstimate] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideSlot, setOverrideSlot] = useState<any>(null);
  const [urgencyReason, setUrgencyReason] = useState('');
  const [submittingOverride, setSubmittingOverride] = useState(false);

  useEffect(() => {
    if (visible && isAdminRole) {
      mobileApi
        .getCompanies()
        .then((comps) => {
          if (comps && comps.length > 0) {
            setCompanies(comps);
            if (!selectedCompanyId || !comps.find((c: any) => c._id === selectedCompanyId)) {
              setSelectedCompanyId(comps[0]._id);
            }
          }
        })
        .catch(console.error);
    }
  }, [visible, isAdminRole]);

  useEffect(() => {
    if (visible && room) {
      setSelectedSlotIndex(null);
      setEstimate(null);
      setError(null);
      loadSlots(room._id, selectedDate);
    }
  }, [visible, room, selectedDate]);

  const loadSlots = async (roomId: string, date: string) => {
    try {
      setLoadingSlots(true);
      const res = await mobileApi.getRoomAvailability(roomId, date);
      setSlots(res.slots || []);
    } catch (err: any) {
      setError(err.message || 'Failed to check slot availability');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSelectSlot = async (idx: number, compId?: string) => {
    setSelectedSlotIndex(idx);
    if (!room || !slots[idx]) return;

    const slot = slots[idx];
    const durationHours = (durationSlots * (room.slotIntervalMinutes || 30)) / 60;
    const targetCompId = compId || (isAdminRole ? selectedCompanyId : user?.companyId);

    try {
      const est = await mobileApi.estimateAllowance({
        durationHours,
        startTime: slot.startTime,
        companyId: targetCompId
      });
      setEstimate(est);
    } catch (err) {
      console.warn('Estimate error:', err);
    }
  };

  const handleDurationChange = async (count: number) => {
    setDurationSlots(count);
    if (selectedSlotIndex === null || !room || !slots[selectedSlotIndex]) return;

    const slot = slots[selectedSlotIndex];
    const durationHours = (count * (room.slotIntervalMinutes || 30)) / 60;
    const targetCompId = isAdminRole ? selectedCompanyId : user?.companyId;

    try {
      const est = await mobileApi.estimateAllowance({
        durationHours,
        startTime: slot.startTime,
        companyId: targetCompId
      });
      setEstimate(est);
    } catch (err) {
      console.warn('Estimate error:', err);
    }
  };

  const handleConfirm = async () => {
    if (!room || selectedSlotIndex === null || !slots[selectedSlotIndex]) {
      setError('Please select an available start time.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const startSlot = slots[selectedSlotIndex];
      const slotMinutes = room.slotIntervalMinutes || 30;
      const totalMinutes = durationSlots * slotMinutes;
      const endMs = new Date(startSlot.startTime).getTime() + totalMinutes * 60 * 1000;
      const endTime = new Date(endMs).toISOString();
      const targetCompId = isAdminRole ? selectedCompanyId : user?.companyId;

      const booking = await mobileApi.createBooking({
        roomId: room._id,
        title,
        purpose,
        attendeeCount: parseInt(attendeeCount, 10) || 1,
        startTime: startSlot.startTime,
        endTime,
        companyId: targetCompId
      });

      onSuccess(booking);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Booking conflict: Slot was recently reserved.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestOverride = async () => {
    if (!overrideSlot || !urgencyReason.trim()) {
      Alert.alert('Required Justification', 'Please describe the emergency business justification.');
      return;
    }

    try {
      setSubmittingOverride(true);
      const slotMinutes = room.slotIntervalMinutes || 30;
      const totalMinutes = durationSlots * slotMinutes;
      const endMs = new Date(overrideSlot.startTime).getTime() + totalMinutes * 60 * 1000;
      const requestedEndTime = new Date(endMs).toISOString();

      await mobileApi.overrides.requestOverride({
        roomId: room._id,
        requestedStartTime: overrideSlot.startTime,
        requestedEndTime,
        urgencyReason: urgencyReason.trim(),
        attendeeCount: parseInt(attendeeCount, 10) || 4
      });

      setShowOverrideModal(false);
      setUrgencyReason('');
      setOverrideSlot(null);
      Alert.alert(
        'Emergency Override Submitted',
        'Your urgent room override request has been sent to Coworking Hub Administration for priority arbitration. Both parties will be notified once reviewed.'
      );
      onClose();
    } catch (err: any) {
      Alert.alert('Override Request Failed', err.message || 'Unable to submit emergency override.');
    } finally {
      setSubmittingOverride(false);
    }
  };

  if (!room) return null;

  const hasOccupiedSlots = slots.some((s) => !s.isAvailable);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.cardBorder }]}>
            <View>
              <Text style={[styles.modalSubtitle, { color: theme.gold }]}>RESERVE EXECUTIVE SUITE</Text>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>{room.name}</Text>
              <Text style={[styles.modalSpecs, { color: theme.textSecondary }]}>
                {room.capacity} seats • ₹{room.hourlyRate}/hr rate
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: theme.card }]}>
              <Ionicons name="close" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
            {error && (
              <View style={[styles.errorBox, { backgroundColor: `${theme.danger}15`, borderColor: theme.danger }]}>
                <Ionicons name="alert-circle" size={16} color={theme.danger} />
                <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
              </View>
            )}

            {isAdminRole && companies.length > 0 && (
              <View style={styles.companySelectBox}>
                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                  Target Corporate Account (Required for Admin)
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.companyPillRow}
                >
                  {companies.map((c) => {
                    const isCompSelected = selectedCompanyId === c._id;
                    return (
                      <TouchableOpacity
                        key={c._id}
                        onPress={() => {
                          setSelectedCompanyId(c._id);
                          if (selectedSlotIndex !== null) {
                            handleSelectSlot(selectedSlotIndex, c._id);
                          }
                        }}
                        style={[
                          styles.companyPill,
                          {
                            backgroundColor: isCompSelected ? theme.gold : theme.card,
                            borderColor: isCompSelected ? theme.gold : theme.cardBorder
                          }
                        ]}
                      >
                        <Ionicons
                          name="business"
                          size={13}
                          color={isCompSelected ? '#090D16' : theme.gold}
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={[
                            styles.companyPillText,
                            { color: isCompSelected ? '#090D16' : theme.textPrimary }
                          ]}
                        >
                          {c.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Date: {selectedDate}</Text>
            <View style={styles.dateRow}>
              {[0, 1, 2, 3, 4].map((offset) => {
                const d = new Date();
                d.setDate(d.getDate() + offset);
                const iso = d.toISOString().split('T')[0];
                const isSelected = selectedDate === iso;

                return (
                  <TouchableOpacity
                    key={iso}
                    onPress={() => setSelectedDate(iso)}
                    style={[
                      styles.datePill,
                      {
                        backgroundColor: isSelected ? theme.gold : theme.card,
                        borderColor: isSelected ? theme.gold : theme.cardBorder
                      }
                    ]}
                  >
                    <Text
                      style={[
                        styles.dateDayText,
                        { color: isSelected ? '#050814' : theme.textMuted }
                      ]}
                    >
                      {d.toLocaleDateString(undefined, { weekday: 'short' })}
                    </Text>
                    <Text
                      style={[
                        styles.dateNumText,
                        { color: isSelected ? '#050814' : theme.textPrimary }
                      ]}
                    >
                      {d.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Duration</Text>
            <View style={styles.durationRow}>
              {[
                { label: '30m', slots: 1 },
                { label: '1 hr', slots: 2 },
                { label: '1.5h', slots: 3 },
                { label: '2 hrs', slots: 4 },
                { label: '3 hrs', slots: 6 }
              ].map((item) => (
                <TouchableOpacity
                  key={item.slots}
                  onPress={() => handleDurationChange(item.slots)}
                  style={[
                    styles.durationPill,
                    {
                      backgroundColor: durationSlots === item.slots ? theme.gold : theme.card,
                      borderColor: durationSlots === item.slots ? theme.gold : theme.cardBorder
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.durationText,
                      { color: durationSlots === item.slots ? '#050814' : theme.textPrimary }
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.slotHeaderRow}>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary, marginBottom: 0 }]}>
                Select Start Time
              </Text>
              {hasOccupiedSlots && (
                <Text style={[styles.slotHelpText, { color: theme.textMuted }]}>
                  Red slots are booked (Tap for emergency override)
                </Text>
              )}
            </View>

            {loadingSlots ? (
              <View style={styles.slotsLoading}>
                <ActivityIndicator size="small" color={theme.gold} />
                <Text style={[styles.slotsLoadingText, { color: theme.textSecondary }]}>
                  Checking live availability...
                </Text>
              </View>
            ) : slots.length === 0 ? (
              <Text style={[styles.noSlotsText, { color: theme.textMuted }]}>
                No operating slots available on this date.
              </Text>
            ) : (
              <View style={styles.slotsGrid}>
                {slots.map((s, idx) => {
                  const time = new Date(s.startTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  const isSelected = selectedSlotIndex === idx;

                  if (!s.isAvailable) {
                    return (
                      <TouchableOpacity
                        key={s.startTime}
                        onPress={() => {
                          setOverrideSlot(s);
                          setShowOverrideModal(true);
                        }}
                        style={[
                          styles.slotButton,
                          {
                            backgroundColor: `${theme.danger}12`,
                            borderColor: theme.danger
                          }
                        ]}
                      >
                        <Text style={[styles.slotText, { color: theme.danger }]}>{time}</Text>
                        <Text style={styles.occupiedBadge}>Occupied</Text>
                      </TouchableOpacity>
                    );
                  }

                  return (
                    <TouchableOpacity
                      key={s.startTime}
                      onPress={() => handleSelectSlot(idx)}
                      style={[
                        styles.slotButton,
                        {
                          backgroundColor: isSelected ? theme.gold : theme.card,
                          borderColor: isSelected ? theme.gold : theme.cardBorder
                        }
                      ]}
                    >
                      <Text
                        style={[
                          styles.slotText,
                          { color: isSelected ? '#050814' : theme.textPrimary }
                        ]}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {estimate && (
              <View style={[styles.estimateCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Text style={[styles.estimateHeader, { color: theme.gold }]}>Quota Application:</Text>
                <View style={styles.estimateRow}>
                  <Text style={[styles.estimateLabel, { color: theme.textSecondary }]}>
                    Free Allowance Applied:
                  </Text>
                  <Text style={[styles.estimateFree, { color: theme.success }]}>
                    {estimate.freeHoursToApply || 0} hrs free
                  </Text>
                </View>
                {estimate.chargeableHours > 0 ? (
                  <View style={styles.estimateRow}>
                    <Text style={[styles.estimateLabel, { color: theme.textSecondary }]}>
                      Chargeable Overage:
                    </Text>
                    <Text style={[styles.estimateOverage, { color: theme.warning }]}>
                      +{estimate.chargeableHours} hrs (₹{estimate.estimatedCharge})
                    </Text>
                  </View>
                ) : (
                  <View style={styles.estimateRow}>
                    <Text style={[styles.estimateLabel, { color: theme.textSecondary }]}>Total Due Now:</Text>
                    <Text style={[styles.estimateFree, { color: theme.success }]}>
                      ₹0.00 (100% Free Quota)
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.formSection}>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Meeting Title</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={title}
                onChangeText={setTitle}
                placeholder="Session title"
                placeholderTextColor={theme.textMuted}
              />

              <View style={styles.twoCol}>
                <View style={styles.col}>
                  <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Guests</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    value={attendeeCount}
                    onChangeText={setAttendeeCount}
                    keyboardType="number-pad"
                    placeholder="4"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Purpose</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    value={purpose}
                    onChangeText={setPurpose}
                    placeholder="Planning"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={[styles.modalFooter, { borderTopColor: theme.cardBorder }]}>
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={submitting || selectedSlotIndex === null}
              style={[
                styles.confirmButton,
                { backgroundColor: theme.gold },
                (submitting || selectedSlotIndex === null) && styles.confirmDisabled
              ]}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator color="#090D16" size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>
                  {selectedSlotIndex === null
                    ? 'Select a Start Slot'
                    : 'Confirm & Lock Reservation'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      
      <Modal visible={showOverrideModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.cardBorder }]}>
              <View>
                <Text style={[styles.modalSubtitle, { color: theme.danger }]}>EMERGENCY PROTOCOL</Text>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Request Slot Override</Text>
              </View>
              <TouchableOpacity onPress={() => setShowOverrideModal(false)}>
                <Ionicons name="close" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ padding: 16 }}>
              <View style={[styles.alertBanner, { backgroundColor: `${theme.danger}15`, borderColor: theme.danger }]}>
                <Ionicons name="warning-outline" size={20} color={theme.danger} style={{ marginRight: 8 }} />
                <Text style={[styles.alertBannerText, { color: theme.textPrimary }]}>
                  This slot is occupied. Emergency override requests are forwarded directly to Coworking Hub Administration for priority arbitration.
                </Text>
              </View>

              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Slot Details</Text>
              <Text style={[styles.overrideSlotSummary, { color: theme.gold }]}>
                {room.name} • {overrideSlot && new Date(overrideSlot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({durationSlots * (room.slotIntervalMinutes || 30)} mins)
              </Text>

              <Text style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: 12 }]}>
                Executive Justification *
              </Text>
              <TextInput
                style={[styles.overrideInputArea, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                placeholder="Detail urgent client visit, foreign delegation, or critical investor meeting..."
                placeholderTextColor={theme.textMuted}
                value={urgencyReason}
                onChangeText={setUrgencyReason}
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity
                style={[styles.overrideSubmitBtn, { backgroundColor: theme.danger }]}
                onPress={handleRequestOverride}
                disabled={submittingOverride}
              >
                {submittingOverride ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.overrideSubmitBtnText}>Submit Emergency Override Request</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end'
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    maxHeight: '90%',
    paddingBottom: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1
  },
  modalSubtitle: {
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 4
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800'
  },
  modalSpecs: {
    fontSize: 12,
    marginTop: 2
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalScroll: {
    paddingHorizontal: 20
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 14,
    gap: 8
  },
  errorText: {
    fontSize: 12,
    flex: 1
  },
  companySelectBox: {
    marginTop: 14
  },
  companyPillRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4
  },
  companyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1
  },
  companyPillText: {
    fontSize: 12,
    fontWeight: '700'
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  datePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal: 3
  },
  dateDayText: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2
  },
  dateNumText: {
    fontSize: 14,
    fontWeight: '800'
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8
  },
  durationPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center'
  },
  durationText: {
    fontSize: 12,
    fontWeight: '700'
  },
  slotHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 16,
    marginBottom: 8
  },
  slotHelpText: {
    fontSize: 10,
    fontStyle: 'italic'
  },
  slotsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16
  },
  slotsLoadingText: {
    fontSize: 12
  },
  noSlotsText: {
    fontSize: 12,
    fontStyle: 'italic',
    paddingVertical: 12
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  slotButton: {
    width: '23%',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center'
  },
  slotText: {
    fontSize: 11,
    fontWeight: '700'
  },
  occupiedBadge: {
    fontSize: 8,
    color: '#EF4444',
    fontWeight: '700',
    marginTop: 2
  },
  estimateCard: {
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1
  },
  estimateHeader: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6
  },
  estimateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2
  },
  estimateLabel: {
    fontSize: 12
  },
  estimateFree: {
    fontSize: 12,
    fontWeight: '700'
  },
  estimateOverage: {
    fontSize: 12,
    fontWeight: '700'
  },
  formSection: {
    marginTop: 8,
    marginBottom: 16
  },
  textInput: {
    height: 42,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    marginBottom: 10
  },
  twoCol: {
    flexDirection: 'row',
    gap: 10
  },
  col: {
    flex: 1
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1
  },
  confirmButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  confirmDisabled: {
    opacity: 0.4
  },
  confirmButtonText: {
    color: '#050814',
    fontSize: 14,
    fontWeight: '800'
  },
  alertBanner: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center'
  },
  alertBannerText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1
  },
  overrideSlotSummary: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2
  },
  overrideInputArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    height: 90,
    textAlignVertical: 'top',
    marginBottom: 16
  },
  overrideSubmitBtn: {
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20
  },
  overrideSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  }
});
