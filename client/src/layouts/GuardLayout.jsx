import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function GuardLayout() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}
