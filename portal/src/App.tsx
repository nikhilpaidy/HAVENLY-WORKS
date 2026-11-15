import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, UserRole, useAuth } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { DashboardLayout } from './layouts/DashboardLayout.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';

import { SuperAdminLoginPage } from './pages/auth/SuperAdminLoginPage.js';
import { AdminLoginPage } from './pages/auth/AdminLoginPage.js';
import { ClientLoginPage } from './pages/auth/ClientLoginPage.js';

import { SuperAdminDashboardPage } from './pages/super-admin/SuperAdminDashboardPage.js';
import { SuperAdminAdminsPage } from './pages/super-admin/SuperAdminAdminsPage.js';
import { SuperAdminOrganizationsPage } from './pages/super-admin/SuperAdminOrganizationsPage.js';
import { SuperAdminReportsPage } from './pages/super-admin/SuperAdminReportsPage.js';
import { SuperAdminBlogCMSPage } from './pages/super-admin/SuperAdminBlogCMSPage.js';
import { SuperAdminAuditLogsPage } from './pages/super-admin/SuperAdminAuditLogsPage.js';
import { SuperAdminStaffPage } from './pages/super-admin/SuperAdminStaffPage.js';
import { SuperAdminMonitoringPage } from './pages/super-admin/SuperAdminMonitoringPage.js';

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.js';
import { AdminLocationsPage } from './pages/admin/AdminLocationsPage.js';
import { AdminRoomsPage } from './pages/admin/AdminRoomsPage.js';
import { AdminWorkspaceTypesPage } from './pages/admin/AdminWorkspaceTypesPage.js';
import { AdminCompaniesPage } from './pages/admin/AdminCompaniesPage.js';
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage.js';
import { AdminBillingPage } from './pages/admin/AdminBillingPage.js';
import { AdminReportsPage } from './pages/admin/AdminReportsPage.js';
import { AdminTicketsPage } from './pages/admin/AdminTicketsPage.js';
import { AdminStaffPage } from './pages/admin/AdminStaffPage.js';

import { ClientDashboardPage } from './pages/client/ClientDashboardPage.js';
import { ClientRoomsPage } from './pages/client/ClientRoomsPage.js';
import { ClientBookingsPage } from './pages/client/ClientBookingsPage.js';
import { ClientAllowancePage } from './pages/client/ClientAllowancePage.js';
import { ClientInvoicesPage } from './pages/client/ClientInvoicesPage.js';
import { ClientProfilePage } from './pages/client/ClientProfilePage.js';
import { ClientTicketsPage } from './pages/client/ClientTicketsPage.js';
import { ClientStaffPage } from './pages/client/ClientStaffPage.js';

import { UnauthorizedPage } from './pages/UnauthorizedPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';

const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400 text-xs">
        Loading...
      </div>
    );
  }
  if (isAuthenticated && user) {
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.SUPER_ADMIN_STAFF) {
      return <Navigate to="/super-admin/dashboard" replace />;
    }
    if (user.role === UserRole.COWORKING_ADMIN || user.role === UserRole.COWORKING_ADMIN_STAFF) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/client/dashboard" replace />;
  }
  return <Navigate to="/admin/login" replace />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<RootRedirect />} />

            <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/client/login" element={<ClientLoginPage />} />

            <Route
              path="/super-admin"
              element={
                <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.SUPER_ADMIN_STAFF]}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
              <Route path="dashboard" element={<SuperAdminDashboardPage />} />
              <Route path="admins" element={<SuperAdminAdminsPage />} />
              <Route path="organizations" element={<SuperAdminOrganizationsPage />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
              <Route path="workspace-types" element={<AdminWorkspaceTypesPage />} />
              <Route path="staff" element={<SuperAdminStaffPage />} />
              <Route path="reports" element={<SuperAdminReportsPage />} />
              <Route path="blogs" element={<SuperAdminBlogCMSPage />} />
              <Route path="audit-logs" element={<SuperAdminAuditLogsPage />} />
              <Route path="monitoring" element={<SuperAdminMonitoringPage />} />
            </Route>

            <Route
              path="/admin"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    UserRole.SUPER_ADMIN,
                    UserRole.COWORKING_ADMIN,
                    UserRole.COWORKING_ADMIN_STAFF
                  ]}
                >
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="locations" element={<AdminLocationsPage />} />
              <Route path="rooms" element={<AdminRoomsPage />} />
              <Route path="workspace-types" element={<AdminWorkspaceTypesPage />} />
              <Route path="companies" element={<AdminCompaniesPage />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
              <Route path="tickets" element={<AdminTicketsPage />} />
              <Route path="overrides" element={<AdminTicketsPage />} />
              <Route path="staff" element={<AdminStaffPage />} />
              <Route path="billing" element={<AdminBillingPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
            </Route>

            <Route
              path="/client"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    UserRole.COMPANY_OWNER,
                    UserRole.COMPANY_BOOKING_MANAGER,
                    UserRole.COMPANY_STAFF,
                    UserRole.EMPLOYEE
                  ]}
                >
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/client/dashboard" replace />} />
              <Route path="dashboard" element={<ClientDashboardPage />} />
              <Route path="rooms" element={<ClientRoomsPage />} />
              <Route path="bookings" element={<ClientBookingsPage />} />
              <Route path="allowance" element={<ClientAllowancePage />} />
              <Route path="tickets" element={<ClientTicketsPage />} />
              <Route path="staff" element={<ClientStaffPage />} />
              <Route path="invoices" element={<ClientInvoicesPage />} />
              <Route path="profile" element={<ClientProfilePage />} />
            </Route>

            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
