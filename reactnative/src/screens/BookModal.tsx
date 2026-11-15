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
import { spacing, radii, typography, shadows } from '../theme/tokens';

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
  const { theme, isDark } = useTheme();
  const isAdminRole = user?.role === 'SUPER_ADMIN' || user?.role === 'COWORKING_ADMIN';

  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(user?.companyId || '');

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [bookingMode, setBookingMode] = useState<'HOURLY' | 'DAY_PASS'>('HOURLY');
  const [slots, setSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [startSlotIndex, setStartSlotIndex] = useState<number | null>(null);
  const [endSlotIndex, setEndSlotIndex] = useState<number | null>(null);

  const [title, setTitle] = useState('');
  const [attendeeCount, setAttendeeCount] = useState('1');
  const [purpose, setPurpose] = useState('');
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
      setStartSlotIndex(null);
      setEndSlotIndex(null);
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

  const hasAnyBookingOnDate = slots.some((s) => !s.isAvailable && s.reason === 'RESERVED');

  const handleSelectStartTime = (index: number) => {
    setStartSlotIndex(index);
    const nextEndIndex = index + 1 < slots.length ? index + 1 : index;
    setEndSlotIndex(nextEndIndex);
    calculateEstimate(index, nextEndIndex);
  };

  const handleSelectEndTime = (index: number) => {
    if (startSlotIndex === null) return;
    if (index <= startSlotIndex) return;
    setEndSlotIndex(index);
    calculateEstimate(startSlotIndex, index);
  };

  const isRangeAvailable = (): boolean => {
    if (startSlotIndex === null || endSlotIndex === null) return false;
    for (let i = startSlotIndex; i < endSlotIndex; i++) {
      if (!slots[i] || !slots[i].isAvailable) {
        return false;
      }
    }
    return true;
  };

  const calculateEstimate = async (startIdx: number, endIdx: number) => {
    if (!room || startIdx === null || endIdx === null || startIdx >= endIdx) return;
    const startSlot = slots[startIdx];
    if (!startSlot) return;

    const intervalMinutes = room.slotIntervalMinutes || 30;
    const durationHours = ((endIdx - startIdx) * intervalMinutes) / 60;
    const targetCompId = isAdminRole ? selectedCompanyId : user?.companyId;

    try {
      const est = await mobileApi.estimateAllowance({
        durationHours,
        startTime: startSlot.startTime,
        companyId: targetCompId
      });
      setEstimate(est);
    } catch (err) {
      console.warn('Estimate error:', err);
    }
  };

  const handleDayPassSelect = async () => {
    if (hasAnyBookingOnDate) {
      Alert.alert(
        'Day Pass Unavailable',
        'A full-day pass is unavailable because partial-day bookings already exist for this room on this date. Please select available hourly time slots instead.'
      );
      return;
    }

    setBookingMode('DAY_PASS');
    if (slots.length > 0) {
      setStartSlotIndex(0);
      setEndSlotIndex(slots.length);
      calculateEstimate(0, slots.length);
    }
  };

  const handleHourlySelect = () => {
    setBookingMode('HOURLY');
    setStartSlotIndex(null);
    setEndSlotIndex(null);
    setEstimate(null);
  };

  const handleConfirm = async () => {
    if (!room) return;

    if (bookingMode === 'DAY_PASS') {
      if (hasAnyBookingOnDate) {
        setError('Cannot book Day Pass: partial bookings exist on this date.');
        return;
      }
      if (slots.length === 0) {
        setError('No operating slots available on this date.');
        return;
      }
    } else {
      if (startSlotIndex === null || endSlotIndex === null || startSlotIndex >= endSlotIndex) {
        setError('Please select both a Start Time and an End Time.');
        return;
      }
      if (!isRangeAvailable()) {
        setError('Selected time range contains unavailable or booked slots.');
        return;
      }
    }

    if (!title.trim()) {
      setError('Please provide a meeting title.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const firstSlot = slots[startSlotIndex || 0];
      const lastSlot = slots[(endSlotIndex || slots.length) - 1];
      const targetCompId = isAdminRole ? selectedCompanyId : user?.companyId;

      const booking = await mobileApi.createBooking({
        roomId: room._id,
        title: title.trim(),
        purpose: purpose.trim() || undefined,
        attendeeCount: parseInt(attendeeCount, 10) || 1,
        startTime: firstSlot.startTime,
        endTime: lastSlot.endTime,
        bookingType: bookingMode === 'DAY_PASS' ? 'DAY_PASS' : 'HOURLY',
        workspaceType: room.workspaceType,
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
      await mobileApi.overrides.requestOverride({
        roomId: room._id,
        requestedStartTime: overrideSlot.startTime,
        requestedEndTime: overrideSlot.endTime,
        urgencyReason: urgencyReason.trim(),
        attendeeCount: parseInt(attendeeCount, 10) || 1
      });

      setShowOverrideModal(false);
      setUrgencyReason('');
      setOverrideSlot(null);
      Alert.alert(
        'Emergency Override Submitted',
        'Your urgent room override request has been sent to Coworking Hub Administration for priority review.'
      );
      onClose();
    } catch (err: any) {
      Alert.alert('Override Request Failed', err.message || 'Unable to submit emergency override.');
    } finally {
      setSubmittingOverride(false);
    }
  };

  if (!room) return null;

  const validRange = startSlotIndex !== null && endSlotIndex !== null && startSlotIndex < endSlotIndex;
  const rangeOk = validRange && isRangeAvailable();
  const rangeHours = validRange ? (((endSlotIndex! - startSlotIndex!) * (room.slotIntervalMinutes || 30)) / 60).toFixed(1) : '0';

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.cardBorder }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.modalSubtitle, { color: '#00A859' }]}>RESERVE WORKSPACE</Text>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                {room.name}
              </Text>
              <Text style={[styles.modalSpecs, { color: theme.textSecondary }]}>
                {room.capacity} seats • ₹{room.hourlyRate}/hr
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: theme.card }]}>
              <Ionicons name="close" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {error && (
              <View style={[styles.errorBox, { backgroundColor: `${theme.danger}15`, borderColor: theme.danger }]}>
                <Ionicons name="alert-circle" size={16} color={theme.danger} />
                <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
              </View>
            )}

            {isAdminRole && companies.length > 0 && (
              <View style={styles.companySelectBox}>
                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                  Client Account (Corporate Quota)
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
                        onPress={() => setSelectedCompanyId(c._id)}
                        style={[
                          styles.companyPill,
                          {
                            backgroundColor: isCompSelected ? '#00A859' : theme.card,
                            borderColor: isCompSelected ? '#00A859' : theme.cardBorder
                          }
                        ]}
                      >
                        <Ionicons
                          name="business"
                          size={13}
                          color={isCompSelected ? '#FFFFFF' : '#00A859'}
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={[
                            styles.companyPillText,
                            { color: isCompSelected ? '#FFFFFF' : theme.textPrimary }
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

            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Reservation Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
              {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
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
                        backgroundColor: isSelected ? '#00A859' : theme.card,
                        borderColor: isSelected ? '#00A859' : theme.cardBorder
                      }
                    ]}
                  >
                    <Text
                      style={[
                        styles.dateDayText,
                        { color: isSelected ? '#FFFFFF' : theme.textMuted }
                      ]}
                    >
                      {d.toLocaleDateString('en-US', { weekday: 'short' })}
                    </Text>
                    <Text
                      style={[
                        styles.dateNumText,
                        { color: isSelected ? '#FFFFFF' : theme.textPrimary }
                      ]}
                    >
                      {d.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Reservation Type</Text>
            <View style={styles.modeRow}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  bookingMode === 'HOURLY' && styles.modeButtonActive,
                  {
                    backgroundColor: bookingMode === 'HOURLY' ? '#00A859' : theme.card,
                    borderColor: bookingMode === 'HOURLY' ? '#00A859' : theme.cardBorder
                  }
                ]}
                onPress={handleHourlySelect}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={bookingMode === 'HOURLY' ? '#FFFFFF' : theme.textPrimary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.modeButtonText,
                    { color: bookingMode === 'HOURLY' ? '#FFFFFF' : theme.textPrimary }
                  ]}
                >
                  Hourly / Custom Range
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modeButton,
                  bookingMode === 'DAY_PASS' && styles.modeButtonActive,
                  hasAnyBookingOnDate && styles.modeButtonDisabled,
                  {
                    backgroundColor: bookingMode === 'DAY_PASS' ? '#00A859' : theme.card,
                    borderColor: hasAnyBookingOnDate
                      ? (isDark ? '#334155' : '#CBD5E1')
                      : bookingMode === 'DAY_PASS'
                      ? '#00A859'
                      : theme.cardBorder
                  }
                ]}
                onPress={handleDayPassSelect}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="sunny-outline"
                  size={16}
                  color={hasAnyBookingOnDate ? theme.textMuted : bookingMode === 'DAY_PASS' ? '#FFFFFF' : theme.textPrimary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.modeButtonText,
                    {
                      color: hasAnyBookingOnDate
                        ? theme.textMuted
                        : bookingMode === 'DAY_PASS'
                        ? '#FFFFFF'
                        : theme.textPrimary
                    }
                  ]}
                >
                  Full Day Pass
                </Text>
              </TouchableOpacity>
            </View>

            {hasAnyBookingOnDate && (
              <View style={[styles.dayPassNotice, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : '#FEF3C7', borderColor: '#F59E0B' }]}>
                <Ionicons name="information-circle-outline" size={16} color="#D97706" style={{ marginRight: 6 }} />
                <Text style={[styles.dayPassNoticeText, { color: isDark ? '#FCD34D' : '#92400E' }]}>
                  Day Pass is unavailable for this date because partial-day bookings already exist for this room.
                </Text>
              </View>
            )}

            {bookingMode === 'HOURLY' && (
              <>
                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                  1. Select Start Time (From)
                </Text>
                {loadingSlots ? (
                  <View style={styles.slotsLoading}>
                    <ActivityIndicator size="small" color="#00A859" />
                    <Text style={[styles.slotsLoadingText, { color: theme.textSecondary }]}>
                      Loading live slot availability...
                    </Text>
                  </View>
                ) : slots.length === 0 ? (
                  <Text style={[styles.noSlotsText, { color: theme.textMuted }]}>
                    No operating slots available on this date.
                  </Text>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slotsRow}>
                    {slots.map((s, idx) => {
                      const timeStr = new Date(s.startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                      const isSelected = startSlotIndex === idx;

                      if (!s.isAvailable) {
                        return (
                          <TouchableOpacity
                            key={s.startTime}
                            onPress={() => {
                              setOverrideSlot(s);
                              setShowOverrideModal(true);
                            }}
                            style={[
                              styles.slotChip,
                              { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEE2E2', borderColor: '#EF4444' }
                            ]}
                          >
                            <Text style={[styles.slotChipText, { color: '#EF4444' }]}>{timeStr}</Text>
                            <Text style={styles.occupiedTag}>Booked</Text>
                          </TouchableOpacity>
                        );
                      }

                      return (
                        <TouchableOpacity
                          key={s.startTime}
                          onPress={() => handleSelectStartTime(idx)}
                          style={[
                            styles.slotChip,
                            {
                              backgroundColor: isSelected ? '#00A859' : theme.card,
                              borderColor: isSelected ? '#00A859' : theme.cardBorder
                            }
                          ]}
                        >
                          <Text
                            style={[
                              styles.slotChipText,
                              { color: isSelected ? '#FFFFFF' : theme.textPrimary }
                            ]}
                          >
                            {timeStr}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}

                {startSlotIndex !== null && (
                  <>
                    <Text style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: spacing.md }]}>
                      2. Select End Time (To)
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slotsRow}>
                      {slots.slice(startSlotIndex + 1).map((s, sliceIdx) => {
                        const actualIdx = startSlotIndex + 1 + sliceIdx;
                        const timeStr = new Date(s.endTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                        const isSelected = endSlotIndex === actualIdx;
                        const durationMins = (actualIdx - startSlotIndex) * (room.slotIntervalMinutes || 30);
                        const durationText = `${durationMins / 60}h`;

                        return (
                          <TouchableOpacity
                            key={s.endTime}
                            onPress={() => handleSelectEndTime(actualIdx)}
                            style={[
                              styles.slotChip,
                              {
                                backgroundColor: isSelected ? '#00A859' : theme.card,
                                borderColor: isSelected ? '#00A859' : theme.cardBorder
                              }
                            ]}
                          >
                            <Text
                              style={[
                                styles.slotChipText,
                                { color: isSelected ? '#FFFFFF' : theme.textPrimary }
                              ]}
                            >
                              {timeStr}
                            </Text>
                            <Text style={[styles.durationSub, { color: isSelected ? '#FFFFFF' : theme.textMuted }]}>
                              {durationText}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </>
                )}

                {validRange && (
                  <View
                    style={[
                      styles.rangeStatusCard,
                      {
                        backgroundColor: rangeOk
                          ? (isDark ? 'rgba(0, 168, 89, 0.12)' : '#DCFCE7')
                          : (isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEE2E2'),
                        borderColor: rangeOk ? '#00A859' : '#EF4444'
                      }
                    ]}
                  >
                    <Ionicons
                      name={rangeOk ? 'checkmark-circle' : 'alert-circle'}
                      size={18}
                      color={rangeOk ? '#00A859' : '#EF4444'}
                      style={{ marginRight: 8 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.rangeStatusTitle,
                          { color: rangeOk ? '#00A859' : '#EF4444' }
                        ]}
                      >
                        {rangeOk ? 'All Slots Available' : 'Time Range Conflict'}
                      </Text>
                      <Text style={[styles.rangeStatusSub, { color: theme.textSecondary }]}>
                        {rangeOk
                          ? `${rangeHours} hrs reserved • From ${new Date(slots[startSlotIndex!].startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to ${new Date(slots[endSlotIndex! - 1].endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          : 'Selected range overlaps with an existing reservation. Please adjust From or To.'}
                      </Text>
                    </View>
                  </View>
                )}
              </>
            )}

            {estimate && (
              <View style={[styles.estimateCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Text style={[styles.estimateHeader, { color: '#00A859' }]}>Allowance & Rate Breakdown</Text>
                <View style={styles.estimateRow}>
                  <Text style={[styles.estimateLabel, { color: theme.textSecondary }]}>
                    Complimentary Quota:
                  </Text>
                  <Text style={[styles.estimateFree, { color: '#00A859' }]}>
                    {estimate.freeHoursToApply || 0} hrs applied
                  </Text>
                </View>
                {estimate.chargeableHours > 0 ? (
                  <View style={styles.estimateRow}>
                    <Text style={[styles.estimateLabel, { color: theme.textSecondary }]}>
                      Chargeable Extra Hours:
                    </Text>
                    <Text style={[styles.estimateOverage, { color: '#F59E0B' }]}>
                      +{estimate.chargeableHours} hrs (₹{estimate.estimatedCharge})
                    </Text>
                  </View>
                ) : (
                  <View style={styles.estimateRow}>
                    <Text style={[styles.estimateLabel, { color: theme.textSecondary }]}>Estimated Total:</Text>
                    <Text style={[styles.estimateFree, { color: '#00A859' }]}>
                      ₹0 (Covered by Allowance)
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.formSection}>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Reservation Title *</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Executive Strategy Review, Deep Focus Session"
                placeholderTextColor={theme.textMuted}
              />

              <View style={styles.twoCol}>
                <View style={styles.col}>
                  <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Attendees</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    value={attendeeCount}
                    onChangeText={setAttendeeCount}
                    keyboardType="number-pad"
                    placeholder="1"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Purpose</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    value={purpose}
                    onChangeText={setPurpose}
                    placeholder="e.g. Client meeting"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                { backgroundColor: '#00A859' },
                ((bookingMode === 'HOURLY' && !rangeOk) || (bookingMode === 'DAY_PASS' && hasAnyBookingOnDate) || submitting) && styles.confirmButtonDisabled
              ]}
              onPress={handleConfirm}
              disabled={(bookingMode === 'HOURLY' && !rangeOk) || (bookingMode === 'DAY_PASS' && hasAnyBookingOnDate) || submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm Reservation</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>

        {showOverrideModal && (
          <Modal visible={showOverrideModal} animationType="fade" transparent>
            <View style={styles.overrideOverlay}>
              <View style={[styles.overrideCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                <View style={styles.overrideHeader}>
                  <Ionicons name="flash" size={20} color="#F59E0B" />
                  <Text style={[styles.overrideTitle, { color: theme.textPrimary }]}>
                    Emergency Slot Override Request
                  </Text>
                </View>
                <Text style={[styles.overrideSubtitle, { color: theme.textSecondary }]}>
                  This room is currently occupied for this slot. Submit an executive urgency reason for Hub Administrator review.
                </Text>
                <TextInput
                  style={[styles.overrideInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                  multiline
                  numberOfLines={4}
                  value={urgencyReason}
                  onChangeText={setUrgencyReason}
                  placeholder="Provide urgent business justification..."
                  placeholderTextColor={theme.textMuted}
                />
                <View style={styles.overrideActions}>
                  <TouchableOpacity
                    style={[styles.overrideCancel, { borderColor: theme.cardBorder }]}
                    onPress={() => setShowOverrideModal(false)}
                  >
                    <Text style={[styles.overrideCancelText, { color: theme.textSecondary }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.overrideSubmit, { backgroundColor: '#00A859' }]}
                    onPress={handleRequestOverride}
                    disabled={submittingOverride}
                  >
                    {submittingOverride ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.overrideSubmitText}>Submit Request</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end'
  },
  modalCard: {
    maxHeight: '92%',
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    overflow: 'hidden'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1
  },
  modalSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  modalTitle: {
    ...typography.title2,
    marginTop: 2
  },
  modalSpecs: {
    ...typography.subtext,
    marginTop: 2
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalScroll: {
    padding: spacing.md
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.md
  },
  errorText: {
    ...typography.subtextMedium,
    marginLeft: 6,
    flex: 1
  },
  companySelectBox: {
    marginBottom: spacing.md
  },
  companyPillRow: {
    gap: spacing.xs,
    paddingVertical: 4
  },
  companyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1
  },
  companyPillText: {
    fontSize: 12,
    fontWeight: '600'
  },
  sectionLabel: {
    ...typography.caption,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
    fontWeight: '700'
  },
  dateRow: {
    gap: spacing.xs,
    paddingBottom: spacing.md
  },
  datePill: {
    width: 52,
    height: 62,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dateDayText: {
    fontSize: 11,
    fontWeight: '600'
  },
  dateNumText: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: radii.md,
    borderWidth: 1
  },
  modeButtonActive: {
    borderColor: '#00A859'
  },
  modeButtonDisabled: {
    opacity: 0.5
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: '700'
  },
  dayPassNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.md
  },
  dayPassNoticeText: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
    fontWeight: '600'
  },
  slotsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md
  },
  slotsLoadingText: {
    ...typography.subtext,
    marginLeft: 8
  },
  noSlotsText: {
    ...typography.subtext,
    paddingVertical: spacing.md
  },
  slotsRow: {
    gap: spacing.xs,
    paddingVertical: 4
  },
  slotChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72
  },
  slotChipText: {
    fontSize: 12,
    fontWeight: '700'
  },
  occupiedTag: {
    fontSize: 9,
    color: '#EF4444',
    fontWeight: '700',
    marginTop: 2
  },
  durationSub: {
    fontSize: 9,
    marginTop: 2
  },
  rangeStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: spacing.md
  },
  rangeStatusTitle: {
    fontSize: 12,
    fontWeight: '700'
  },
  rangeStatusSub: {
    fontSize: 11,
    marginTop: 2
  },
  estimateCard: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: spacing.md,
    gap: 6
  },
  estimateHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  estimateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
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
    marginTop: spacing.md,
    gap: spacing.sm
  },
  textInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    fontSize: 13
  },
  twoCol: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  col: {
    flex: 1
  },
  confirmButton: {
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xxl
  },
  confirmButtonDisabled: {
    opacity: 0.4
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  overrideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg
  },
  overrideCard: {
    width: '100%',
    padding: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: 1
  },
  overrideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: 6
  },
  overrideTitle: {
    ...typography.title3,
    flex: 1
  },
  overrideSubtitle: {
    ...typography.subtext,
    lineHeight: 18,
    marginBottom: spacing.md
  },
  overrideInput: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 12,
    fontSize: 12,
    height: 90,
    textAlignVertical: 'top',
    marginBottom: spacing.md
  },
  overrideActions: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  overrideCancel: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  overrideCancelText: {
    fontSize: 12,
    fontWeight: '600'
  },
  overrideSubmit: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  overrideSubmitText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  }
});
