import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import RoleRoute from './RoleRoute';
import { ROLES } from '../constants/roles';
import BrandedLoader from '../components/ui/BrandedLoader';

const HomePage = lazy(() => import('../pages/Home/HomePage'));
const AuthPage = lazy(() => import('../pages/Auth/AuthPage'));
const LoginPage = lazy(() => import('../pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/Auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/Auth/ForgotPasswordPage'));
const DonorPage = lazy(() => import('../pages/Donor/DonorPage'));
const DonorDashboard = lazy(() => import('../pages/Donor/Dashboard'));
const DonateFood = lazy(() => import('../pages/Donor/DonateFood'));
const MyDonations = lazy(() => import('../pages/Donor/MyDonations'));
const DonationDetails = lazy(() => import('../pages/Donor/DonationDetails'));
const FoodRequests = lazy(() => import('../pages/Donor/FoodRequests'));
const NotificationsPage = lazy(() => import('../pages/Donor/Notifications'));
const ProfilePage = lazy(() => import('../pages/Donor/Profile'));
const NGOPage = lazy(() => import('../pages/NGO/NGOPage'));
const NGODashboard = lazy(() => import('../pages/NGO/Dashboard'));
const NGONearbyFood = lazy(() => import('../pages/NGO/NearbyFood'));
const NGOFoodDetails = lazy(() => import('../pages/NGO/FoodDetails'));
const NGORequestFood = lazy(() => import('../pages/NGO/RequestFood'));
const NGOMyRequests = lazy(() => import('../pages/NGO/MyRequests'));
const NGORequestHistory = lazy(() => import('../pages/NGO/RequestHistory'));
const NGONotifications = lazy(() => import('../pages/NGO/Notifications'));
const NGOProfile = lazy(() => import('../pages/NGO/Profile'));
const AdminPage = lazy(() => import('../pages/Admin/AdminPage'));
const AdminDashboard = lazy(() => import('../pages/Admin/Dashboard'));
const AdminUsers = lazy(() => import('../pages/Admin/Users'));
const AdminNGOVerification = lazy(() => import('../pages/Admin/NGOVerification'));
const AdminDonations = lazy(() => import('../pages/Admin/Donations'));
const AdminRequests = lazy(() => import('../pages/Admin/Requests'));
const AdminReports = lazy(() => import('../pages/Admin/Reports'));
const AdminAnalytics = lazy(() => import('../pages/Admin/Analytics'));
const AdminAuditLogs = lazy(() => import('../pages/Admin/AuditLogs'));
const AdminNotifications = lazy(() => import('../pages/Admin/Notifications'));
const AdminProfile = lazy(() => import('../pages/Admin/Profile'));
const NotFoundPage = lazy(() => import('../pages/Error/NotFoundPage'));
const InternalErrorPage = lazy(() => import('../pages/Error/InternalErrorPage'));
const UnauthorizedPage = lazy(() => import('../pages/Error/UnauthorizedPage'));
const ForbiddenPage = lazy(() => import('../pages/Error/ForbiddenPage'));
const OfflinePage = lazy(() => import('../pages/Error/OfflinePage'));
const ProfileView = lazy(() => import('../pages/Profile/ProfileView'));
const EditProfile = lazy(() => import('../pages/Profile/EditProfile'));
const ChangePassword = lazy(() => import('../pages/Profile/ChangePassword'));
const Settings = lazy(() => import('../pages/Profile/Settings'));

const LoadingFallback = <BrandedLoader message="Loading page..." />;

const AppRoutes = () => (
  <Suspense fallback={LoadingFallback}>
    <Routes>
      {/* PUBLIC & MARKETING ROUTES WRAPPED IN MAINLAYOUT */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />

        <Route path="/login" element={<Navigate replace to="/auth/login" />} />
        <Route path="/register" element={<Navigate replace to="/auth/register" />} />
        <Route path="/forgot-password" element={<Navigate replace to="/auth/forgot-password" />} />

        <Route
          path="/auth"
          element={
            <PublicRoute>
              <AuthLayout>
                <AuthPage />
              </AuthLayout>
            </PublicRoute>
          }
        >
          <Route index element={<Navigate replace to="login" />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="/500" element={<InternalErrorPage />} />
        <Route path="/401" element={<UnauthorizedPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/offline" element={<OfflinePage />} />
      </Route>

      {/* AUTHENTICATED DASHBOARD ROUTES WRAPPED IN DASHBOARDLAYOUT (NO MAINLAYOUT) */}
      <Route
        path="/donor/*"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={[ROLES.USER, ROLES.DONOR, ROLES.PARTNER, 'user', 'partner']}>
              <DashboardLayout
                portalName="Donor Portal"
                sidebarItems={[
                  { to: '/donor/dashboard', label: 'Dashboard' },
                  { to: '/donor/donate', label: 'Donate Food' },
                  { to: '/donor/my-donations', label: 'My Donations' },
                  { to: '/donor/requests', label: 'Requests' },
                  { to: '/donor/notifications', label: 'Notifications' },
                  { to: '/donor/profile', label: 'Profile' }
                ]}
              >
                <DonorPage />
              </DashboardLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate replace to="dashboard" />} />
        <Route path="dashboard" element={<DonorDashboard />} />
        <Route path="donate" element={<DonateFood />} />
        <Route path="my-donations" element={<MyDonations />} />
        <Route path="donations/:id" element={<DonationDetails />} />
        <Route path="requests" element={<FoodRequests />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route
        path="/ngo/*"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={[ROLES.NGO]}>
              <DashboardLayout
                portalName="NGO Portal"
                sidebarItems={[
                  { to: '/ngo/dashboard', label: 'Dashboard' },
                  { to: '/ngo/nearby', label: 'Nearby Food' },
                  { to: '/ngo/my-requests', label: 'My Requests' },
                  { to: '/ngo/history', label: 'Request History' },
                  { to: '/ngo/notifications', label: 'Notifications' },
                  { to: '/ngo/profile', label: 'Profile' }
                ]}
              >
                <NGOPage />
              </DashboardLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate replace to="dashboard" />} />
        <Route path="dashboard" element={<NGODashboard />} />
        <Route path="nearby" element={<NGONearbyFood />} />
        <Route path="nearby-food" element={<NGONearbyFood />} />
        <Route path="food/:id" element={<NGOFoodDetails />} />
        <Route path="food/:id/request" element={<NGORequestFood />} />
        <Route path="request/:id" element={<NGORequestFood />} />
        <Route path="request-food" element={<NGORequestFood />} />
        <Route path="request-food/:donationId" element={<NGORequestFood />} />
        <Route path="my-requests" element={<NGOMyRequests />} />
        <Route path="history" element={<NGORequestHistory />} />
        <Route path="request-history" element={<NGORequestHistory />} />
        <Route path="notifications" element={<NGONotifications />} />
        <Route path="profile" element={<NGOProfile />} />
      </Route>
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <DashboardLayout
                portalName="Admin Portal"
                sidebarItems={[
                  { to: '/admin/dashboard', label: 'Dashboard' },
                  { to: '/admin/users', label: 'Users' },
                  { to: '/admin/ngo-verification', label: 'NGO Verification' },
                  { to: '/admin/donations', label: 'Donations' },
                  { to: '/admin/requests', label: 'Requests' },
                  { to: '/admin/reports', label: 'Reports' },
                  { to: '/admin/analytics', label: 'Analytics' },
                  { to: '/admin/audit-logs', label: 'Audit Logs' },
                  { to: '/admin/notifications', label: 'Notifications' },
                  { to: '/admin/profile', label: 'Profile' }
                ]}
              >
                <AdminPage />
              </DashboardLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate replace to="dashboard" />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="ngo-verification" element={<AdminNGOVerification />} />
        <Route path="donations" element={<AdminDonations />} />
        <Route path="requests" element={<AdminRequests />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      {/* PROFILE & SETTINGS WRAPPED IN DASHBOARDLAYOUT */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout portalName="User Profile">
              <ProfileView />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <DashboardLayout portalName="User Profile">
              <EditProfile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/change-password"
        element={
          <ProtectedRoute>
            <DashboardLayout portalName="User Settings">
              <ChangePassword />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout portalName="User Settings">
              <Settings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate replace to="/404" />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
