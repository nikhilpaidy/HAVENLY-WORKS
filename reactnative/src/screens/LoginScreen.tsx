import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { HavenlyLogo } from '../components/HavenlyLogo';

interface LoginScreenProps {
  onBackToExplore?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onBackToExplore }) => {
  const { login } = useAuth();
  const { theme, isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<'email' | 'password' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(email.trim().toLowerCase(), password);
    } catch (err: any) {
      setError(
        err.message || 'Authentication failed. Please verify your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.ambientGlow} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {onBackToExplore && (
            <TouchableOpacity
              style={[styles.backBtn, { borderColor: theme.cardBorder, backgroundColor: theme.card }]}
              onPress={onBackToExplore}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          )}

          <View style={styles.brandContainer}>
            <HavenlyLogo variant="vertical" size={82} textColor={theme.textPrimary} />
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>ENTERPRISE WORKSPACE SUITE</Text>
            </View>
            <Text style={[styles.brandSubtitle, { color: theme.textSecondary }]}>
              Sign in to manage room bookings, team desks & monthly allowances
            </Text>
          </View>

          {error && (
            <View style={[styles.errorBox, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2' }]}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View
            style={[
              styles.formCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.cardBorder
              }
            ]}
          >
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Email Address</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: focusedInput === 'email' ? '#00A859' : theme.inputBorder
                  }
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={focusedInput === 'email' ? '#00A859' : theme.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="name@company.com"
                  placeholderTextColor={theme.textMuted}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (error) setError(null);
                  }}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: focusedInput === 'password' ? '#00A859' : theme.inputBorder
                  }
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={focusedInput === 'password' ? '#00A859' : theme.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.textMuted}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (error) setError(null);
                  }}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={theme.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && { opacity: 0.7 }
              ]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={styles.submitBtnContent}>
                  <Text style={styles.submitButtonText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {onBackToExplore && (
            <TouchableOpacity
              style={[styles.guestCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
              onPress={onBackToExplore}
              activeOpacity={0.85}
            >
              <View style={styles.guestIconBox}>
                <Ionicons name="compass-outline" size={18} color="#00A859" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.guestCardTitle, { color: theme.textPrimary }]}>Continue as Guest</Text>
                <Text style={[styles.guestCardSub, { color: theme.textMuted }]}>Explore public workspaces and hubs nearby</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          )}

          <Text style={[styles.securityNotice, { color: theme.textMuted }]}>
            Protected by enterprise encryption • HavenlyWork Platform
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  ambientGlow: {
    position: 'absolute',
    top: -100,
    left: '10%',
    width: '80%',
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(0, 168, 89, 0.08)'
  },
  keyboardView: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 36,
    justifyContent: 'center'
  },
  backBtn: {
    alignSelf: 'flex-start',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24
  },
  brandBadge: {
    backgroundColor: 'rgba(0, 168, 89, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 14,
    marginBottom: 6
  },
  brandBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00A859',
    letterSpacing: 1.5
  },
  brandSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    marginBottom: 18
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
    fontWeight: '600'
  },
  formCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3
  },
  inputGroup: {
    marginBottom: 16
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 14
  },
  inputIcon: {
    marginRight: 10
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%'
  },
  eyeIcon: {
    padding: 8
  },
  submitButton: {
    backgroundColor: '#00A859',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#00A859',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4
  },
  submitBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },
  guestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 20
  },
  guestIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 168, 89, 0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  guestCardTitle: {
    fontSize: 14,
    fontWeight: '700'
  },
  guestCardSub: {
    fontSize: 11,
    marginTop: 1
  },
  securityNotice: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 24
  }
});
