import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { TabBar, TabKey } from './src/components/TabBar';
import { mobileApi } from './src/services/api';

import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { RoomsScreen } from './src/screens/RoomsScreen';
import { BookingsScreen } from './src/screens/BookingsScreen';
import { AllowanceScreen } from './src/screens/AllowanceScreen';
import { InvoicesScreen } from './src/screens/InvoicesScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { TicketsScreen } from './src/screens/TicketsScreen';
import { StaffScreen } from './src/screens/StaffScreen';

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme, isDark } = useTheme();
  const [currentTab, setCurrentTab] = useState<TabKey>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const notifs = await mobileApi.getNotifications();
      const unread = notifs.filter((n: any) => !n.isRead).length;
      setUnreadCount(unread);
    } catch {}
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 25000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <View style={[styles.splashContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.gold} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  if (showNotifications) {
    return (
      <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
        <NotificationsScreen
          onBack={() => setShowNotifications(false)}
          onRefreshBadge={fetchUnreadCount}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.content}>
        {currentTab === 'dashboard' && (
          <DashboardScreen
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenNotifications={() => setShowNotifications(true)}
            unreadNotifsCount={unreadCount}
          />
        )}
        {currentTab === 'rooms' && (
          <RoomsScreen
            onOpenNotifications={() => setShowNotifications(true)}
            unreadNotifsCount={unreadCount}
          />
        )}
        {currentTab === 'bookings' && (
          <BookingsScreen
            onOpenNotifications={() => setShowNotifications(true)}
            unreadNotifsCount={unreadCount}
          />
        )}
        {currentTab === 'allowance' && (
          <AllowanceScreen
            onOpenNotifications={() => setShowNotifications(true)}
            unreadNotifsCount={unreadCount}
          />
        )}
        {currentTab === 'tickets' && (
          <TicketsScreen
            onOpenNotifications={() => setShowNotifications(true)}
            unreadNotifsCount={unreadCount}
          />
        )}
        {currentTab === 'staff' && (
          <StaffScreen
            onOpenNotifications={() => setShowNotifications(true)}
            unreadNotifsCount={unreadCount}
          />
        )}
        {currentTab === 'invoices' && (
          <InvoicesScreen
            onOpenNotifications={() => setShowNotifications(true)}
            unreadNotifsCount={unreadCount}
          />
        )}
        {currentTab === 'profile' && (
          <ProfileScreen
            onOpenNotifications={() => setShowNotifications(true)}
            unreadNotifsCount={unreadCount}
            onNavigateToStaff={() => setCurrentTab('staff')}
            onNavigateToTickets={() => setCurrentTab('tickets')}
          />
        )}
      </View>

      <TabBar currentTab={currentTab} onSelectTab={(tab) => setCurrentTab(tab)} />
    </SafeAreaView>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('App Crash Caught by ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.errorContainer}>
          <View style={styles.errorBox}>
            <View style={styles.errorIcon}>
              <Text style={{ fontSize: 32 }}>⚠️</Text>
            </View>
            <Text style={styles.errorTitle}>Application Notice</Text>
            <Text style={styles.errorMessage}>
              {this.state.error?.message || 'An unexpected render error occurred.'}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => this.setState({ hasError: false, error: null })}
            >
              <Text style={styles.retryButtonText}>Reload Application</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <AuthProvider>
            <MainApp />
          </AuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1
  },
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    flex: 1
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#090D16',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  errorBox: {
    width: '100%',
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#141A29',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center'
  },
  errorIcon: {
    marginBottom: 12
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8
  },
  errorMessage: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20
  },
  retryButton: {
    backgroundColor: '#C5A880',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12
  },
  retryButtonText: {
    color: '#090D16',
    fontSize: 13,
    fontWeight: '700'
  }
});
