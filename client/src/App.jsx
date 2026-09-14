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

function AppRoutes() {
  return (
    <Routes>
      {/* Public / Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Client Portal */}
      <Route path="/client" element={<ClientLayout />}>
        <Route index element={<Navigate to="/client/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="my-vehicle" element={<MyVehicle />} />
        <Route path="vehicle-pass" element={<VehiclePass />} />
        <Route path="applications" element={<Applications />} />
        <Route path="payments" element={<Payments />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* PASO Admin Portal */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="applications" element={<AdminDashboard />} />
        <Route path="passes" element={<AdminDashboard />} />
        <Route path="reports" element={<AdminDashboard />} />
      </Route>

      {/* Guard Security Gate Portal */}
      <Route path="/guard" element={<GuardLayout />}>
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
