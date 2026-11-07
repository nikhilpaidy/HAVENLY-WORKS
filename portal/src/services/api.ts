const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:6018/api/v1';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('aura_auth_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || `Request failed with status ${res.status}`);
  }

  return json.data;
}

// ----------------- SUPER ADMIN APIS -----------------
export const superAdminApi = {
  getStats: () => request<any>('/reports/super-admin'),
  getAdmins: () => request<any[]>('/super-admin/admins'),
  createAdmin: (data: any) =>
    request<any>('/super-admin/admins', { method: 'POST', body: JSON.stringify(data) }),
  updateAdmin: (id: string, data: any) =>
    request<any>(`/super-admin/admins/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleUserStatus: (userId: string) =>
    request<any>(`/super-admin/users/${userId}/toggle-status`, { method: 'PATCH' }),
  getOrganizations: () => request<any[]>('/organizations'),
  createOrganization: (data: any) =>
    request<any>('/organizations', { method: 'POST', body: JSON.stringify(data) }),
  updateOrganization: (id: string, data: any) =>
    request<any>(`/organizations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getAuditLogs: (params?: { action?: string; limit?: number }) => {
    const q = new URLSearchParams(params as any);
    return request<any[]>(`/super-admin/audit-logs?${q.toString()}`);
  },
  getBlogs: () => request<any[]>('/blogs/admin'),
  uploadBlogImage: (image: string, filename?: string) =>
    request<{ url: string; filename: string }>('/blogs/admin/upload', {
      method: 'POST',
      body: JSON.stringify({ image, filename })
    }),
  createBlog: (data: any) =>
    request<any>('/blogs/admin', { method: 'POST', body: JSON.stringify(data) }),
  updateBlog: (id: string, data: any) =>
    request<any>(`/blogs/admin/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBlog: (id: string) =>
    request<any>(`/blogs/admin/${id}`, { method: 'DELETE' }),
  getSpacesSummary: () => request<any[]>('/super-admin/spaces-summary')
};

// ----------------- COWORKING ADMIN APIS -----------------
export const adminApi = {
  getStats: (orgId?: string) =>
    request<any>(`/reports/admin${orgId ? `?organizationId=${orgId}` : ''}`),
  getLocations: () => request<any[]>('/locations'),
  createLocation: (data: any) =>
    request<any>('/locations', { method: 'POST', body: JSON.stringify(data) }),
  updateLocation: (id: string, data: any) =>
    request<any>(`/locations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getRooms: (params?: any) => {
    const q = new URLSearchParams(params || {});
    return request<any[]>(`/rooms?${q.toString()}`);
  },
  createRoom: (data: any) =>
    request<any>('/rooms', { method: 'POST', body: JSON.stringify(data) }),
  updateRoom: (id: string, data: any) =>
    request<any>(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  addMaintenanceBlock: (roomId: string, data: any) =>
    request<any>(`/rooms/${roomId}/maintenance`, { method: 'POST', body: JSON.stringify(data) }),
  getCompanies: () => request<any[]>('/companies'),
  createCompany: (data: any) =>
    request<any>('/companies', { method: 'POST', body: JSON.stringify(data) }),
  updateCompany: (id: string, data: any) =>
    request<any>(`/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getCompanyMembers: (companyId: string) =>
    request<any[]>(`/companies/${companyId}/members`),
  addCompanyMember: (companyId: string, data: any) =>
    request<any>(`/companies/${companyId}/members`, { method: 'POST', body: JSON.stringify(data) }),
  adjustCompanyAllowance: (data: { companyId: string; hours: number; notes: string }) =>
    request<any>('/allowances/adjust', { method: 'POST', body: JSON.stringify(data) }),
  getBookings: (params?: any) => {
    const q = new URLSearchParams(params || {});
    return request<any[]>(`/bookings?${q.toString()}`);
  },
  createBooking: (data: any) =>
    request<any>('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  cancelBooking: (id: string, reason?: string) =>
    request<any>(`/bookings/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),
  checkInBooking: (id: string) =>
    request<any>(`/bookings/${id}/check-in`, { method: 'POST' }),
  getInvoices: (params?: any) => {
    const q = new URLSearchParams(params || {});
    return request<any[]>(`/billing?${q.toString()}`);
  },
  generateInvoice: (data: any) =>
    request<any>('/billing/generate', { method: 'POST', body: JSON.stringify(data) }),
  recordPayment: (data: any) =>
    request<any>('/payments/record', { method: 'POST', body: JSON.stringify(data) }),
  verifyPayment: (paymentId: string) =>
    request<any>(`/payments/${paymentId}/verify`, { method: 'POST' }),
  getPayments: (params?: any) => {
    const q = new URLSearchParams(params || {});
    return request<any[]>(`/payments?${q.toString()}`);
  },
  getWorkspaceTypes: () => request<any[]>('/workspace-types'),
  createWorkspaceType: (data: any) =>
    request<any>('/workspace-types', { method: 'POST', body: JSON.stringify(data) }),
  updateWorkspaceType: (id: string, data: any) =>
    request<any>(`/workspace-types/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWorkspaceType: (id: string) =>
    request<any>(`/workspace-types/${id}`, { method: 'DELETE' })
};

// ----------------- CLIENT PORTAL APIS -----------------
export const clientApi = {
  getWorkspaceTypes: () => request<any[]>('/workspace-types'),
  getLocations: () => request<any[]>('/locations'),
  getRooms: (params?: any) => {
    const q = new URLSearchParams(params || {});
    return request<any[]>(`/rooms?${q.toString()}`);
  },
  getRoomAvailability: (roomId: string, date: string) =>
    request<any>(`/availability/${roomId}?date=${date}`),
  estimateAllowance: (data: { durationHours: number; startTime?: string }) =>
    request<any>('/allowances/estimate', { method: 'POST', body: JSON.stringify(data) }),
  createBooking: (data: {
    roomId: string;
    title: string;
    purpose?: string;
    attendeeCount: number;
    startTime: string;
    endTime: string;
  }) => request<any>('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  getMyBookings: (scope?: 'upcoming' | 'past') =>
    request<any[]>(`/bookings${scope ? `?scope=${scope}` : ''}`),
  cancelBooking: (id: string, reason?: string) =>
    request<any>(`/bookings/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),
  getCurrentAllowance: () => request<any>('/allowances/current'),
  getAllowanceHistory: () => request<any>('/allowances/history'),
  getInvoices: () => request<any[]>('/billing'),
  getNotifications: () => request<any[]>('/notifications'),
  markNotificationRead: (id: string) =>
    request<any>(`/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsRead: () =>
    request<any>('/notifications/read-all', { method: 'POST' }),
  getUsageStats: () => request<any>('/reports/company')
};

// ----------------- TICKETS & HELPDESK APIS -----------------
export const ticketsApi = {
  getTickets: (params?: { status?: string; category?: string }) => {
    const q = new URLSearchParams(params as any || {});
    return request<any[]>(`/tickets?${q.toString()}`);
  },
  getTicketById: (id: string) => request<any>(`/tickets/${id}`),
  createTicket: (data: {
    category: string;
    priority: string;
    title: string;
    description: string;
    locationId?: string;
  }) => request<any>('/tickets', { method: 'POST', body: JSON.stringify(data) }),
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

// ----------------- EMERGENCY OVERRIDES APIS -----------------
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
  }) => request<any>('/overrides/request', { method: 'POST', body: JSON.stringify(data) }),
  reviewOverride: (id: string, decision: 'APPROVE' | 'REJECT', notes?: string) =>
    request<any>(`/overrides/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ decision, notes })
    })
};

// ----------------- STAFF & PERMISSIONS APIS -----------------
export const staffApi = {
  getStaff: () => request<any[]>('/staff'),
  createStaff: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    designation?: string;
    permissions: string[];
  }) => request<any>('/staff', { method: 'POST', body: JSON.stringify(data) }),
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
