import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileBottomNav from '../components/MobileBottomNav';

export default function ClientLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      <Navbar />
      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 pb-24 md:pb-8 overflow-y-auto w-full max-w-full">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
