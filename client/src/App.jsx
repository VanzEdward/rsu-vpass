import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PassProvider } from './context/PassContext';

// Layouts
import ClientLayout from './layouts/ClientLayout';
import AdminLayout from './layouts/AdminLayout';
import GuardLayout from './layouts/GuardLayout';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/client/Dashboard';
import MyVehicle from './pages/client/MyVehicle';
import VehiclePass from './pages/client/VehiclePass';
import Applications from './pages/client/Applications';
import Payments from './pages/client/Payments';
import Profile from './pages/client/Profile';

import AdminDashboard from './pages/admin/AdminDashboard';
import GuardScanner from './pages/guard/GuardScanner';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If logged in as another role, redirect to their home
    if (user.role === 'PASO_ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'GUARD') return <Navigate to="/guard/scanner" replace />;
    return <Navigate to="/client/dashboard" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public / Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Client Portal */}
      <Route
        path="/client"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <ClientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/client/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="my-vehicle" element={<MyVehicle />} />
        <Route path="vehicle-pass" element={<VehiclePass />} />
        <Route path="applications" element={<Applications />} />
        <Route path="payments" element={<Payments />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* PASO Admin Portal */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['PASO_ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="applications" element={<AdminDashboard />} />
        <Route path="passes" element={<AdminDashboard />} />
        <Route path="reports" element={<AdminDashboard />} />
      </Route>

      {/* Guard Security Gate Portal */}
      <Route
        path="/guard"
        element={
          <ProtectedRoute allowedRoles={['GUARD']}>
            <GuardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/guard/scanner" replace />} />
        <Route path="scanner" element={<GuardScanner />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PassProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </PassProvider>
    </AuthProvider>
  );
}
