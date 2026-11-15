import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface AuthRequiredModalProps {
  visible: boolean;
  featureName?: string;
  onClose: () => void;
  onSignIn: () => void;
}

export const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({
  visible,
  featureName = 'this feature',
  onClose,
  onSignIn
}) => {
  const { theme, isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
              borderColor: isDark ? '#1E293B' : '#E2E8F0'
            }
          ]}
        >
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Sign In Required
          </Text>

          <Text style={[styles.description, { color: theme.textSecondary }]}>
            Please sign in with your enterprise credentials to access {featureName}.
          </Text>

          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => {
              onClose();
              onSignIn();
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.signInBtnText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={[styles.cancelBtnText, { color: theme.textMuted }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center'
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 20
  },
  signInBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00A859',
    width: '100%',
    height: 46,
    borderRadius: 14,
    marginBottom: 10
  },
  signInBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  cancelBtn: {
    paddingVertical: 8
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600'
  }
});
