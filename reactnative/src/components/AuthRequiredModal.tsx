import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { HavenlyLogo } from './HavenlyLogo';

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
          <View style={styles.topIcon}>
            <HavenlyLogo width={48} height={48} color="#00A859" />
          </View>

          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Sign In Required
          </Text>

          <Text style={[styles.description, { color: theme.textSecondary }]}>
            Access to {featureName} requires an active HavenlyWork account. Please sign in or register to reserve rooms, track corporate allowances, and file helpdesk tickets.
          </Text>

          <View style={[styles.infoPill, { backgroundColor: isDark ? '#1E293B' : '#F0FDF4' }]}>
            <Ionicons name="compass-outline" size={16} color="#00A859" style={{ marginRight: 6 }} />
            <Text style={[styles.infoPillText, { color: isDark ? '#34D399' : '#00A859' }]}>
              Guest mode allows exploring and searching workspaces freely.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => {
              onClose();
              onSignIn();
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="log-in-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.signInBtnText}>Sign In / Register</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={[styles.cancelBtnText, { color: theme.textMuted }]}>
              Continue Exploring as Guest
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
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center'
  },
  topIcon: {
    marginBottom: 14
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center'
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 16
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 20
  },
  infoPillText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1
  },
  signInBtn: {
    flexDirection: 'row',
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
    paddingVertical: 10
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600'
  }
});
