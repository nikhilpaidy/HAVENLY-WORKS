import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { mobileApi } from '../services/api';

interface RoomReviewModalProps {
  visible: boolean;
  roomId: string;
  roomName: string;
  bookingId?: string;
  onClose: () => void;
  onReviewSubmitted?: (rating: number, reviewCount: number) => void;
}

export const RoomReviewModal: React.FC<RoomReviewModalProps> = ({
  visible,
  roomId,
  roomName,
  bookingId,
  onClose,
  onReviewSubmitted
}) => {
  const { theme, isDark } = useTheme();
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert('Required', 'Please write a brief review of your experience.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await mobileApi.addRoomReview(roomId, rating, comment.trim(), bookingId);
      Alert.alert('Review Submitted', 'Thank you for rating this workspace!');
      if (onReviewSubmitted) {
        onReviewSubmitted(res.rating, res.reviewCount);
      }
      setComment('');
      setRating(5);
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: isDark ? '#0A0F1D' : '#FFFFFF',
              borderColor: isDark ? '#1E293B' : '#E2E8F0'
            }
          ]}
        >
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                Rate & Review Workspace
              </Text>
              <Text style={[styles.subtitle, { color: theme.textMuted }]} numberOfLines={1}>
                {roomName}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.starPrompt, { color: theme.textSecondary }]}>
            How was your workspace experience?
          </Text>

          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starBtn}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={32}
                  color={star <= rating ? '#F59E0B' : (isDark ? '#334155' : '#CBD5E1')}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.ratingLabel, { color: '#F59E0B' }]}>
            {rating === 5 && 'Excellent - Highly Recommended'}
            {rating === 4 && 'Very Good - Met Expectations'}
            {rating === 3 && 'Average - Decent Experience'}
            {rating === 2 && 'Below Average - Needs Improvement'}
            {rating === 1 && 'Poor - Unsatisfactory'}
          </Text>

          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
            Your Feedback & Comments
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.textPrimary
              }
            ]}
            placeholder="Share details about amenities, internet speed, quietness..."
            placeholderTextColor={theme.textMuted}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Review</Text>
            )}
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalCard: {
    width: '100%',
    borderRadius: 22,
    borderWidth: 1,
    padding: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 17,
    fontWeight: '800'
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2
  },
  closeBtn: {
    padding: 4
  },
  starPrompt: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 10
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8
  },
  starBtn: {
    padding: 4
  },
  ratingLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6
  },
  input: {
    height: 90,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    textAlignVertical: 'top',
    marginBottom: 16
  },
  submitBtn: {
    backgroundColor: '#00A859',
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  }
});
