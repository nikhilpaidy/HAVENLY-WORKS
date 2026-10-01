import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export interface ModalButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface ModalPopupProps {
  visible: boolean;
  title: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  buttons?: ModalButton[];
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  loading?: boolean;
}

export const ModalPopup: React.FC<ModalPopupProps> = ({
  visible,
  title,
  message,
  icon,
  variant = 'info',
  buttons,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  onClose,
  loading = false
}) => {
  if (!visible) return null;

  const resolvedButtons: ModalButton[] = buttons || (() => {
    const list: ModalButton[] = [];
    if (cancelText || onCancel) {
      list.push({
        text: cancelText || 'Cancel',
        onPress: onCancel || onClose || (() => {}),
        style: 'cancel'
      });
    }
    list.push({
      text: confirmText || 'OK',
      onPress: onConfirm || onClose || (() => {}),
      style: variant === 'danger' ? 'destructive' : 'default'
    });
    return list;
  })();

  const getIconConfig = () => {
    switch (variant) {
      case 'danger':
        return { name: icon || 'alert-circle', color: colors.danger, bg: colors.dangerBg };
      case 'warning':
        return { name: icon || 'warning', color: colors.warning, bg: colors.warningBg };
      case 'success':
        return { name: icon || 'checkmark-circle', color: colors.success, bg: colors.successBg };
      case 'info':
      default:
        return { name: icon || 'information-circle', color: colors.primary, bg: colors.primaryGlow };
    }
  };

  const iconConfig = getIconConfig();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={[styles.iconContainer, { backgroundColor: iconConfig.bg }]}>
            <Ionicons name={iconConfig.name as any} size={28} color={iconConfig.color} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : (
            <View style={styles.buttonRow}>
              {resolvedButtons.map((btn, index) => {
                const isDestructive = btn.style === 'destructive';
                const isCancel = btn.style === 'cancel';

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={btn.onPress}
                    style={[
                      styles.button,
                      isCancel && styles.cancelButton,
                      isDestructive && styles.destructiveButton,
                      !isCancel && !isDestructive && styles.primaryButton
                    ]}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        isCancel && styles.cancelButtonText,
                        isDestructive && styles.destructiveButtonText,
                        !isCancel && !isDestructive && styles.primaryButtonText
                      ]}
                    >
                      {btn.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8
  },
  message: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24
  },
  loadingContainer: {
    paddingVertical: 16
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    gap: 10
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryButton: {
    backgroundColor: colors.primary
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.divider
  },
  destructiveButton: {
    backgroundColor: colors.danger
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '700'
  },
  primaryButtonText: {
    color: '#FFFFFF'
  },
  cancelButtonText: {
    color: colors.textSecondary
  },
  destructiveButtonText: {
    color: '#FFFFFF'
  }
});
