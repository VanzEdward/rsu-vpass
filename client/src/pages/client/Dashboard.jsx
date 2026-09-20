import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Car, 
  Clock, 
  CheckCircle2, 
  QrCode, 
  ArrowUpRight, 
  Bell, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  // Prototype Demonstration Data (from PRD Section 7)
  const stats = {
    myVehicles: 1,
    pendingApplications: 0,
    activePasses: 1,
  };

  const activePass = {
    passNumber: 'VP-2026-0001',
    vehicle: 'Honda Click 125',
    plateNumber: 'XYZ 5678',
    vehicleType: 'Motorcycle',
    validUntil: 'December 31, 2026',
    status: 'ACTIVE',
  };

  const notifications = [
    {
      id: 1,
      title: 'Vehicle Pass Activated',
      desc: 'Your Pass VP-2026-0001 for Honda Click 125 (XYZ 5678) is active for Academic Year 2026.',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      title: 'Cashier Payment Confirmed',
      desc: 'OR #2026-9812 has been recorded by PASO Administration.',
      time: '1 day ago',
      read: true,
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Welcome & Account Summary Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-semibold text-emerald-100 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span>Academic Year 2026 • Registered Client</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {user?.full_name || 'Juan Dela Cruz'}!
            </h1>
            <p className="text-emerald-50 text-sm mt-1 max-w-xl">
              Manage your registered university vehicles, track application status, and view active gate passes issued by PASO.
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-emerald-100/90 font-mono">
              <span>School ID: <strong className="text-white">{user?.school_id || '2026-00001'}</strong></span>
              <span>•</span>
              <span>Campus: <strong className="text-white">Main Campus (Odiongan)</strong></span>
            </div>
          </div>

          {user?.profile_image && (
            <div className="shrink-0 hidden sm:block">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/40 shadow-lg ring-2 ring-emerald-300/40">
                <img src={user.profile_image} alt={user?.full_name || 'User'} className="w-full h-full object-cover" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3 Metric Cards (PRD Section 4.2 & Section 7) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">My Vehicles</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{stats.myVehicles}</p>
            <Link to="/client/my-vehicle" className="inline-flex items-center text-xs font-medium text-emerald-600 hover:text-emerald-700 mt-2">
              View vehicle details <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Car className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Applications</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{stats.pendingApplications}</p>
            <Link to="/client/applications" className="inline-flex items-center text-xs font-medium text-slate-600 hover:text-slate-900 mt-2">
              Track submissions <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Passes</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">{stats.activePasses}</p>
            <Link to="/client/vehicle-pass" className="inline-flex items-center text-xs font-medium text-emerald-600 hover:text-emerald-700 mt-2">
              Open pass credentials <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle Pass Preview (PRD: One Vehicle Pass summary/preview with View All navigation) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Current Vehicle Pass</h2>
              <p className="text-xs text-slate-500">Official RSU issued vehicle clearance</p>
            </div>
            <Link
              to="/client/vehicle-pass"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors"
            >
              <span>View All / Details</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-5 p-5 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/40 via-white to-slate-50/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ACTIVE PASS</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">{activePass.vehicle}</h3>
                <p className="text-xs text-slate-500">Plate: <span className="font-mono font-bold text-slate-800">{activePass.plateNumber}</span> • Type: {activePass.vehicleType}</p>
                <p className="text-xs text-slate-600">Pass No: <strong className="font-mono text-emerald-700">{activePass.passNumber}</strong></p>
                <p className="text-xs text-slate-500">Valid Until: <span className="font-semibold text-slate-700">{activePass.validUntil}</span></p>
              </div>

              {/* QR Preview Widget */}
              <div className="text-center bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center">
                <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-emerald-700" />
                </div>
                <Link
                  to="/client/vehicle-pass"
                  className="mt-2 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Enlarge QR Code
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Column */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Notifications</h2>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Dashboard Feed</span>
          </div>

          <div className="mt-4 space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-emerald-50/40 transition-colors"
              >
                <p className="text-xs font-bold text-slate-800">{notif.title}</p>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.desc}</p>
                <p className="text-[10px] font-medium text-slate-400 mt-1">{notif.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
