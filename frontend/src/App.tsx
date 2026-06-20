import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { RoleBasedRoute } from '@/components/shared/RoleBasedRoute'
import { Role } from '@/types'

import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { ThreatsPage } from '@/pages/threats/ThreatsPage'
import { ThreatDetailPage } from '@/pages/threats/ThreatDetailPage'
import { NewThreatPage } from '@/pages/threats/NewThreatPage'
import { IncidentsPage } from '@/pages/incidents/IncidentsPage'
import { IncidentDetailPage } from '@/pages/incidents/IncidentDetailPage'
import { NewIncidentPage } from '@/pages/incidents/NewIncidentPage'
import { ThreatIntelPage } from '@/pages/threat-intel/ThreatIntelPage'
import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage'
import { UsersPage } from '@/pages/users/UsersPage'
import { AuditLogsPage } from '@/pages/audit-logs/AuditLogsPage'
import { NotificationsPage } from '@/pages/notifications/NotificationsPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
})

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<AuthLayout />}>
                  <Route index element={<Navigate to="/auth/login" replace />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="reset-password" element={<ResetPasswordPage />} />
                </Route>

                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <NotificationProvider>
                        <DashboardLayout />
                      </NotificationProvider>
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="threats" element={<ThreatsPage />} />
                  <Route path="threats/new" element={<NewThreatPage />} />
                  <Route path="threats/:id" element={<ThreatDetailPage />} />
                  <Route path="incidents" element={<IncidentsPage />} />
                  <Route path="incidents/new" element={<NewIncidentPage />} />
                  <Route path="incidents/:id" element={<IncidentDetailPage />} />
                  <Route path="threat-intel" element={<ThreatIntelPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route
                    path="users"
                    element={
                      <RoleBasedRoute allowedRoles={[Role.ADMIN]}>
                        <UsersPage />
                      </RoleBasedRoute>
                    }
                  />
                  <Route
                    path="audit-logs"
                    element={
                      <RoleBasedRoute allowedRoles={[Role.ADMIN]}>
                        <AuditLogsPage />
                      </RoleBasedRoute>
                    }
                  />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Route>

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
