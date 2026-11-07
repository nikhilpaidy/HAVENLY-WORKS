import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const PUBLIC_DEV_TUNNEL_URL = 'https://tqsb1xz0-6018.inc1.devtunnels.ms/api/v1';
const LOCALHOST_URL = 'http://localhost:6018/api/v1';

export const API_BASE_URL = PUBLIC_DEV_TUNNEL_URL;

let inMemoryBaseUrl: string | null = null;

export async function getBaseUrl(): Promise<string> {
  if (inMemoryBaseUrl) return inMemoryBaseUrl;

  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (Platform.OS === 'web') {
    const webUrl = envUrl || LOCALHOST_URL;
    inMemoryBaseUrl = webUrl;
    return webUrl;
  }

  if (envUrl && envUrl.trim().length > 0) {
    const cleanEnv = envUrl.trim();
    inMemoryBaseUrl = cleanEnv;
    return cleanEnv;
  }

  inMemoryBaseUrl = PUBLIC_DEV_TUNNEL_URL;
  return PUBLIC_DEV_TUNNEL_URL;
}

export async function setBaseUrl(newUrl: string): Promise<void> {
  let cleanUrl = newUrl.trim();
  if (cleanUrl.endsWith('/')) {
    cleanUrl = cleanUrl.slice(0, -1);
  }
  if (!cleanUrl.endsWith('/api/v1')) {
    cleanUrl = `${cleanUrl}/api/v1`;
  }
  inMemoryBaseUrl = cleanUrl;
  await AsyncStorage.setItem('aura_server_url', cleanUrl);
}

export async function testServerConnection(): Promise<{ ok: boolean; message: string }> {
  const baseUrl = await getBaseUrl();
  const rootHealth = baseUrl.replace('/api/v1', '/api/v1/health');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(rootHealth, { signal: controller.signal });
    const json = await res.json();
    return {
      ok: res.ok,
      message: json.message || `Connected to server (${baseUrl})`
    };
  } catch (err: any) {
    return {
      ok: false,
      message: `Cannot reach server at ${baseUrl}.`
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const [token, baseUrl] = await Promise.all([
    AsyncStorage.getItem('aura_auth_token'),
    getBaseUrl()
  ]);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const primaryUrl = `${baseUrl}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(primaryUrl, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || `Request failed with status ${response.status}`);
    }
    return json.data;
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (baseUrl !== LOCALHOST_URL && Platform.OS === 'web') {
      try {
        const localUrl = `${LOCALHOST_URL}${endpoint}`;
        const localRes = await fetch(localUrl, { ...options, headers });
        if (localRes.ok) {
          const json = await localRes.json();
          inMemoryBaseUrl = LOCALHOST_URL;
          return json.data;
        }
      } catch {}
    }

    if (err.name === 'AbortError') {
      throw new Error('Connection timed out. Please check your network connection.');
    }
    throw new Error(err.message || 'Cannot reach server. Please ensure backend is running.');
  }
}

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    const token = res?.accessToken || res?.token;
    if (!token) {
      throw new Error('Authentication succeeded but authorization token was missing.');
    }
    await AsyncStorage.setItem('aura_auth_token', token);
    return { user: res.user, token };
  },

  getMe: async () => {
    return request<any>('/auth/me');
  },

  logout: async () => {
    try {
      await request<any>('/auth/logout', { method: 'POST' });
    } catch {}
    await AsyncStorage.removeItem('aura_auth_token');
  }
};

export const locationsApi = {
  getNearby: (lat: number = 12.9716, lng: number = 77.5946, radiusKm: number = 2) => {
    return request<{
      userCoordinates: { lat: number; lng: number };
      effectiveRadiusKm: number;
      resultsCount: number;
      locations: any[];
    }>(`/locations/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`);
  },

  getPublic: () => {
    return request<any[]>('/locations/public');
  },

  getPublicById: (id: string) => {
    return request<any>(`/locations/public/${id}`);
  },

  uploadPaymentQr: (locationId: string, imageBase64: string, upiId?: string) => {
    return request<any>(`/locations/${locationId}/upload-qr`, {
      method: 'POST',
      body: JSON.stringify({ imageBase64, upiId })
    });
  }
};

export const roomsApi = {
  getRooms: (locationId?: string) => {
    const q = locationId ? `?locationId=${locationId}` : '';
    return request<any[]>(`/rooms${q}`);
  },

  getPublicRooms: (params: {
    workspaceType?: string;
    locationId?: string;
    maxHourlyRate?: number;
    minRating?: number;
    amenity?: string;
  } = {}) => {
    const q = new URLSearchParams();
    if (params.workspaceType) q.append('workspaceType', params.workspaceType);
    if (params.locationId) q.append('locationId', params.locationId);
    if (params.maxHourlyRate) q.append('maxHourlyRate', params.maxHourlyRate.toString());
    if (params.minRating) q.append('minRating', params.minRating.toString());
    if (params.amenity) q.append('amenity', params.amenity);
    const qs = q.toString();
    return request<any[]>(`/rooms/public${qs ? `?${qs}` : ''}`);
  },

  getPublicRoomById: (id: string) => {
    return request<any>(`/rooms/public/${id}`);
  },

  getRoomById: (id: string) => {
    return request<any>(`/rooms/${id}`);
  },

  checkAvailability: (roomId: string, date: string) => {
    return request<any>(`/availability/room/${roomId}?date=${date}`);
  }
};

export const bookingsApi = {
  getBookings: (params: { myOnly?: boolean; status?: string; companyId?: string; tab?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.myOnly) q.append('myOnly', 'true');
    if (params.status) q.append('status', params.status);
    if (params.companyId) q.append('companyId', params.companyId);
    if (params.tab) q.append('tab', params.tab);
    const qs = q.toString();
    return request<any[]>(`/bookings${qs ? `?${qs}` : ''}`);
  },

  createBooking: (payload: {
    roomId: string;
    title: string;
    startTime: string;
    endTime: string;
    attendeeCount: number;
    purpose?: string;
    companyId?: string;
  }) => {
    return request<any>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  createGuestBooking: (payload: {
    roomId: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    bookingType: 'HOURLY' | 'DAY_PASS';
    startTime: string;
    endTime: string;
    attendeeCount?: number;
    paymentMethod?: string;
    paymentReference?: string;
  }) => {
    return request<any>('/bookings/public/guest', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  confirmGuestBooking: (bookingId: string) => {
    return request<any>(`/bookings/${bookingId}/confirm-guest`, {
      method: 'PATCH'
    });
  },

  cancelBooking: (bookingId: string, reason?: string) => {
    return request<any>(`/bookings/${bookingId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason: reason || 'Cancelled by user' })
    });
  },

  checkInBooking: (bookingId: string) => {
    return request<any>(`/bookings/${bookingId}/check-in`, {
      method: 'POST'
    });
  }
};

export const companiesApi = {
  getCompanies: () => request<any[]>('/companies')
};

export const allowancesApi = {
  getCurrent: (companyId?: string) => {
    const q = companyId ? `?companyId=${companyId}` : '';
    return request<any>(`/allowances/current${q}`);
  },
  getHistory: (companyId?: string) => {
    const q = companyId ? `?companyId=${companyId}` : '';
    return request<any>(`/allowances/history${q}`);
  }
};

export const billingApi = {
  getInvoices: () => request<any[]>('/billing/invoices'),
  getInvoiceById: (id: string) => request<any>(`/billing/${id}`)
};

export const clientPerspectiveApi = {
  getStats: () => request<any>('/reports/company'),
  getAllowance: () => request<any>('/allowances/current'),
  getUpcomingMeetings: () => request<any[]>('/bookings?myOnly=true&status=CONFIRMED')
};

export const adminPerspectiveApi = {
  getHubStats: () => request<any>('/reports/admin'),
  getHubBookings: () => request<any[]>('/bookings'),
  getHubRooms: () => request<any[]>('/rooms')
};

export const ticketsApi = {
  getTickets: (params: { status?: string; category?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.status) q.append('status', params.status);
    if (params.category) q.append('category', params.category);
    const qs = q.toString();
    return request<any[]>(`/tickets${qs ? `?${qs}` : ''}`);
  },
  getTicketById: (id: string) => request<any>(`/tickets/${id}`),
  createTicket: (data: {
    category: string;
    priority: string;
    title: string;
    description: string;
    locationId?: string;
  }) =>
    request<any>('/tickets', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateTicketStatus: (id: string, status: string, resolutionNotes?: string) =>
    request<any>(`/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, resolutionNotes })
    }),
  addComment: (id: string, message: string) =>
    request<any>(`/tickets/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ message })
    })
};

export const overridesApi = {
  getOverrides: (status?: string) => {
    const q = status ? `?status=${status}` : '';
    return request<any[]>(`/overrides${q}`);
  },
  requestOverride: (data: {
    roomId: string;
    requestedStartTime: string;
    requestedEndTime: string;
    urgencyReason: string;
    attendeeCount: number;
  }) =>
    request<any>('/overrides/request', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  reviewOverride: (id: string, decision: 'APPROVE' | 'REJECT', notes?: string) =>
    request<any>(`/overrides/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ decision, notes })
    })
};

export const staffApi = {
  getStaff: () => request<any[]>('/staff'),
  createStaff: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    designation?: string;
    permissions: string[];
  }) =>
    request<any>('/staff', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateStaffPermissions: (id: string, permissions: string[]) =>
    request<any>(`/staff/${id}/permissions`, {
      method: 'PATCH',
      body: JSON.stringify({ permissions })
    }),
  resetClientPassword: (companyId: string, newPassword: string) =>
    request<any>('/staff/client-reset-password', {
      method: 'POST',
      body: JSON.stringify({ companyId, newPassword })
    })
};

export const superAdminPerspectiveApi = {
  getPlatformStats: () => request<any>('/reports/super-admin'),
  getSpacesSummary: () => request<any[]>('/super-admin/spaces-summary'),
  getAllBookings: () => request<any[]>('/bookings'),
  getAllInvoices: () => request<any[]>('/billing/invoices')
};

export const notificationsApi = {
  getNotifications: () => request<any[]>('/notifications'),
  markRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'POST' }),
  markAllRead: () => request<any>('/notifications/read-all', { method: 'POST' }),
  broadcast: (data: { title: string; message: string; roleTarget?: string }) =>
    request<any>('/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(data)
    })
};

export const mobileApi = {
  getServerUrl: getBaseUrl,
  setServerUrl: setBaseUrl,
  testConnection: testServerConnection,

  login: authApi.login,
  getMe: authApi.getMe,
  getProfile: authApi.getMe,
  logout: authApi.logout,

  locations: locationsApi,
  getNearbyLocations: locationsApi.getNearby,
  getPublicLocations: locationsApi.getPublic,
  getPublicLocationById: locationsApi.getPublicById,

  getRooms: roomsApi.getRooms,
  getPublicRooms: roomsApi.getPublicRooms,
  getPublicRoomById: roomsApi.getPublicRoomById,
  getRoomById: roomsApi.getRoomById,
  checkAvailability: roomsApi.checkAvailability,
  getRoomAvailability: roomsApi.checkAvailability,

  getBookings: bookingsApi.getBookings,
  getMyBookings: (scope?: string) => {
    const q = scope ? `?scope=${scope}` : '';
    return request<any[]>(`/bookings${q}`);
  },
  createBooking: bookingsApi.createBooking,
  createGuestBooking: bookingsApi.createGuestBooking,
  confirmGuestBooking: bookingsApi.confirmGuestBooking,
  cancelBooking: bookingsApi.cancelBooking,
  checkInBooking: bookingsApi.checkInBooking,

  getCurrentAllowance: allowancesApi.getCurrent,
  getAllowanceHistory: allowancesApi.getHistory,
  estimateAllowance: (payload: any) =>
    request<any>('/allowances/estimate', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getCompanies: companiesApi.getCompanies,

  getInvoices: billingApi.getInvoices,

  getNotifications: notificationsApi.getNotifications,
  markNotificationRead: notificationsApi.markRead,
  markAllNotificationsRead: notificationsApi.markAllRead,
  broadcastNotification: notificationsApi.broadcast,

  tickets: ticketsApi,
  overrides: overridesApi,
  staff: staffApi,

  client: clientPerspectiveApi,
  admin: adminPerspectiveApi,
  superAdmin: superAdminPerspectiveApi
};
