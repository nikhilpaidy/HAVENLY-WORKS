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
  ScrollView,
  SafeAreaView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('aptapace@gmail.com');
  const [password, setPassword] = useState('Apta@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please provide your corporate email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(email.trim(), password);
    } catch (err: any) {
      setError(
        err.message ||
          'Authentication failed. Please verify your corporate credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const setTestAccount = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Ionicons name="business" size={28} color={colors.brassLight} />
            </View>
            <Text style={styles.brandTitle}>AURA</Text>
            <Text style={styles.brandSubtitle}>EXECUTIVE COWORKING PLATFORM</Text>
            <Text style={styles.tagline}>
              Mobile Client Portal • Meeting Room Reservations & Quotas
            </Text>
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            </View>
          )}

          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Corporate Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@company.com"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••••••"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#090D16" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In to Workspace</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>QUICK FILL PRODUCTION ACCOUNTS</Text>

            <TouchableOpacity
              onPress={() => setTestAccount('aptapace@gmail.com', 'Apta@2026')}
              style={[
                styles.demoButton,
                email === 'aptapace@gmail.com' && styles.demoButtonActive
              ]}
            >
              <View style={styles.demoRow}>
                <View style={styles.demoDotClient} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.demoName}>Client Owner (Aptapace Private Limited)</Text>
                  <Text style={styles.demoEmail}>aptapace@gmail.com • 20h Monthly Allowance</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={colors.brassLight} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setTestAccount('client@aptapace.com', 'Client@123')}
              style={[
                styles.demoButton,
                email === 'client@aptapace.com' && styles.demoButtonActive
              ]}
            >
              <View style={styles.demoRow}>
                <View style={styles.demoDotClient} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.demoName}>Client Member (Aptapace Team)</Text>
                  <Text style={styles.demoEmail}>client@aptapace.com • Booking Manager</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={colors.brassLight} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setTestAccount('support@cwsone.com', 'Cws@2026')}
              style={[
                styles.demoButton,
                email === 'support@cwsone.com' && styles.demoButtonActive
              ]}
            >
              <View style={styles.demoRow}>
                <View style={styles.demoDotAdmin} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.demoName}>Coworking Admin (CWS ONE)</Text>
                  <Text style={styles.demoEmail}>support@cwsone.com • Facility Hub Director</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={colors.brassLight} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setTestAccount('paidynikhil@gmail.com', 'Nikhil@123')}
              style={[
                styles.demoButton,
                email === 'paidynikhil@gmail.com' && styles.demoButtonActive
              ]}
            >
              <View style={styles.demoRow}>
                <View style={styles.demoDotSuper} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.demoName}>Platform Super Admin (Nikhil Paidy)</Text>
                  <Text style={styles.demoEmail}>paidynikhil@gmail.com • Global Governance</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={colors.brassLight} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.footerNote}>
            <Text style={styles.footerText}>CWS ONE Workspace Ecosystem • Powered by Aura OS</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  keyboardView: {
    flex: 1
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%'
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 32
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.brassLight,
    letterSpacing: 4
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 2,
    marginTop: 4
  },
  tagline: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center'
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    padding: 14,
    marginBottom: 20
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
    lineHeight: 18
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
    marginBottom: 24
  },
  inputGroup: {
    marginBottom: 18
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: 12,
    height: 48
  },
  inputIcon: {
    marginRight: 10
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14
  },
  eyeButton: {
    padding: 6
  },
  loginButton: {
    backgroundColor: colors.brassLight,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8
  },
  loginButtonDisabled: {
    opacity: 0.6
  },
  loginButtonText: {
    color: '#090D16',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  demoSection: {
    marginBottom: 24
  },
  demoTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.textMuted,
    marginBottom: 12,
    textAlign: 'center'
  },
  demoButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    marginBottom: 8
  },
  demoButtonActive: {
    borderColor: colors.brass,
    backgroundColor: 'rgba(217, 168, 92, 0.08)'
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  demoDotClient: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 10
  },
  demoDotAdmin: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brassLight,
    marginRight: 10
  },
  demoDotSuper: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
    marginRight: 10
  },
  demoName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary
  },
  demoEmail: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2
  },
  footerNote: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24
  },
  footerText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center'
  }
});
