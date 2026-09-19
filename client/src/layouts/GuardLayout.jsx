import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ShieldCheck, MapPin, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function GuardLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      {/* Light Navbar */}
      <Navbar />

      {/* Guard Duty Quick Status Bar (Mobile-First) */}
      <div className="bg-slate-800/90 backdrop-blur-md border-b border-slate-700/80 px-4 py-2.5 text-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="flex items-center space-x-1.5 font-medium text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Gate 1 • Odiongan Main Campus</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[11px] font-mono text-emerald-400 bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-700">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">OFFICER:</span>
            <span className="font-bold text-white">{user?.full_name || 'Officer Santos'}</span>
          </div>
        </div>
      </div>

      {/* Main Guard App Screen */}
      <main className="flex-1 max-w-xl md:max-w-3xl w-full mx-auto p-3 sm:p-6 pb-12">
        <Outlet />
      </main>
    </div>
  );
}
