import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './features/auth/hooks/useAuth.js';
import LoginPage from './features/auth/pages/LoginPage.jsx';
import RegisterPage from './features/auth/pages/RegisterPage.jsx';
import VerifyEmailPage from './features/auth/pages/VerifyEmailPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import { AnimatePresence, motion } from 'framer-motion';

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers.jsx'));
const AdminRules = lazy(() => import('./pages/admin/AdminRules.jsx'));
const AdminExpenses = lazy(() => import('./pages/admin/AdminExpenses.jsx'));
const AdminCompany = lazy(() => import('./pages/admin/AdminCompany.jsx'));

const LoadingScreen = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to={user.role?.toLowerCase() === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
};

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth Routes */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/verify-email" element={<PublicRoute><VerifyEmailPage /></PublicRoute>} />

        {/* Employee & Manager Integrated Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

        {/* Refined Admin Routes */}
        <Route path="/admin" element={<AdminRoute><Suspense fallback={<LoadingScreen />}><AdminDashboard /></Suspense></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><Suspense fallback={null}><AdminUsers /></Suspense></AdminRoute>} />
        <Route path="/admin/rules" element={<AdminRoute><Suspense fallback={null}><AdminRules /></Suspense></AdminRoute>} />
        <Route path="/admin/expenses" element={<AdminRoute><Suspense fallback={null}><AdminExpenses /></Suspense></AdminRoute>} />
        <Route path="/admin/company" element={<AdminRoute><Suspense fallback={null}><AdminCompany /></Suspense></AdminRoute>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;