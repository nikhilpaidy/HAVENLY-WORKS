import React, { createContext, useContext, useState, useEffect } from 'react';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SUPER_ADMIN_STAFF = 'SUPER_ADMIN_STAFF',
  COWORKING_ADMIN = 'COWORKING_ADMIN',
  COWORKING_ADMIN_STAFF = 'COWORKING_ADMIN_STAFF',
  COMPANY_OWNER = 'COMPANY_OWNER',
  COMPANY_BOOKING_MANAGER = 'COMPANY_BOOKING_MANAGER',
  COMPANY_STAFF = 'COMPANY_STAFF',
  EMPLOYEE = 'EMPLOYEE'
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  designation?: string;
  permissions?: string[];
  organizationId?: string;
  companyId?: string;
  organization?: {
    name: string;
    slug: string;
    currency: string;
    timezone: string;
  };
  company?: {
    name: string;
    status: string;
    gstin?: string;
    panNumber?: string;
    verificationStatus?: string;
    allowanceConfig?: {
      monthlyFreeHours?: number;
      annualFreeHours?: number;
      allowancePeriodType?: string;
      additionalHourlyRate?: number;
      extraHourRate?: number;
      currency?: string;
    };
  };
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, passwordPlain: string, expectedRole?: UserRole) => Promise<UserProfile>;
  logout: () => void;
  updateUser: (data: Partial<UserProfile>) => void;
  refreshProfile: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('aura_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('aura_auth_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:6018/api/v1';

  // Verify token on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('aura_auth_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`
          }
        });

        if (res.ok) {
          const json = await res.json();
          const u = json.data.user;
          const fetchedUser: UserProfile = {
            id: u._id || u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            phone: u.phone,
            designation: u.designation,
            permissions: u.permissions || [],
            organizationId: u.organizationId,
            companyId: u.companyId,
            organization: json.data.organization,
            company: json.data.company
          };
          setUser(fetchedUser);
          localStorage.setItem('aura_auth_user', JSON.stringify(fetchedUser));
        } else {
          logout();
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [API_URL]);

  const refreshProfile = async () => {
    const storedToken = localStorage.getItem('aura_auth_token');
    if (!storedToken) return;
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      if (res.ok) {
        const json = await res.json();
        const u = json.data.user;
        const updated: UserProfile = {
          id: u._id || u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          phone: u.phone,
          designation: u.designation,
          permissions: u.permissions || [],
          organizationId: u.organizationId,
          companyId: u.companyId,
          organization: json.data.organization,
          company: json.data.company
        };
        setUser(updated);
        localStorage.setItem('aura_auth_user', JSON.stringify(updated));
      }
    } catch {}
  };

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(refreshProfile, 20000);
    return () => clearInterval(interval);
  }, [token]);

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (
      user.role === UserRole.SUPER_ADMIN ||
      user.role === UserRole.COWORKING_ADMIN ||
      user.role === UserRole.COMPANY_OWNER
    ) {
      return true;
    }
    return Array.isArray(user.permissions) && user.permissions.includes(permission);
  };

  const login = async (
    email: string,
    passwordPlain: string,
    expectedRole?: UserRole
  ): Promise<UserProfile> => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: passwordPlain, expectedRole })
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Login failed. Please verify credentials.');
    }

    const { accessToken, refreshToken, user: loggedInUser } = json.data;
    setToken(accessToken);
    setUser(loggedInUser);

    localStorage.setItem('aura_auth_token', accessToken);
    localStorage.setItem('aura_auth_refresh', refreshToken);
    localStorage.setItem('aura_auth_user', JSON.stringify(loggedInUser));

    return loggedInUser;
  };

  const logout = () => {
    const refresh = localStorage.getItem('aura_auth_refresh');
    if (refresh) {
      fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refresh })
      }).catch(() => {});
    }

    setUser(null);
    setToken(null);
    localStorage.removeItem('aura_auth_token');
    localStorage.removeItem('aura_auth_refresh');
    localStorage.removeItem('aura_auth_user');
  };

  const updateUser = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('aura_auth_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        updateUser,
        refreshProfile,
        hasPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
