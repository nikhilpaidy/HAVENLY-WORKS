import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mobileApi } from '../services/api';

export interface MobileUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  designation?: string;
  avatarUrl?: string;
  favoriteRoomIds?: string[];
  permissions: string[];
  parentUserId?: string;
  organizationId?: string;
  companyId?: string;
  company?: {
    name: string;
    gstin?: string;
    panNumber?: string;
    verificationStatus?: string;
    allowanceConfig?: {
      monthlyFreeHours: number;
      annualFreeHours?: number;
      allowancePeriodType?: string;
      extraHourRate?: number;
      additionalHourlyRate?: number;
      currency: string;
    };
  };
  organization?: {
    name: string;
  };
}

interface AuthContextType {
  user: MobileUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const normalizeUser = (raw: any): MobileUser | null => {
  if (!raw) return null;
  const u = raw.user || raw;
  const perms = Array.isArray(u.permissions)
    ? u.permissions
    : Array.isArray(raw.permissions)
    ? raw.permissions
    : [];

  return {
    id: u.id || u._id || raw.id || raw._id || '',
    name: u.name || raw.name || '',
    email: u.email || raw.email || '',
    phone: u.phone || raw.phone || '',
    role: u.role || raw.role || '',
    designation: u.designation || raw.designation || '',
    avatarUrl: u.avatarUrl || raw.avatarUrl || '',
    favoriteRoomIds: u.favoriteRoomIds || raw.favoriteRoomIds || [],
    permissions: perms,
    parentUserId: u.parentUserId || raw.parentUserId,
    organizationId: u.organizationId || raw.organizationId,
    companyId: u.companyId || raw.companyId,
    organization: u.organization || raw.organization,
    company: u.company || raw.company
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MobileUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateUser = async (raw: any) => {
    const norm = normalizeUser(raw);
    setUser(norm);
    if (norm) {
      try {
        await AsyncStorage.setItem('aura_cached_user', JSON.stringify(norm));
      } catch {}
    } else {
      try {
        await AsyncStorage.removeItem('aura_cached_user');
      } catch {}
    }
  };

  const initAuth = async () => {
    try {
      const [storedToken, cachedUser] = await Promise.all([
        AsyncStorage.getItem('aura_auth_token'),
        AsyncStorage.getItem('aura_cached_user')
      ]);

      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch {}
      }

      if (storedToken) {
        setToken(storedToken);
        try {
          const profile = await mobileApi.getProfile();
          await updateUser(profile);
        } catch {}
      }
    } catch {
      await AsyncStorage.removeItem('aura_auth_token');
      await AsyncStorage.removeItem('aura_cached_user');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await mobileApi.login(email, password);
    setToken(res.token);
    await updateUser(res.user);
  };

  const logout = async () => {
    await mobileApi.logout();
    await AsyncStorage.removeItem('aura_cached_user');
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const profile = await mobileApi.getProfile();
      await updateUser(profile);
    } catch {}
  };

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      refreshProfile();
    }, 15000);
    return () => clearInterval(interval);
  }, [token]);

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (
      user.role === 'SUPER_ADMIN' ||
      user.role === 'COWORKING_ADMIN' ||
      user.role === 'COMPANY_OWNER'
    ) {
      return true;
    }
    return Array.isArray(user.permissions) && user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        isGuest: !token || !user,
        login,
        logout,
        refreshProfile,
        hasPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
