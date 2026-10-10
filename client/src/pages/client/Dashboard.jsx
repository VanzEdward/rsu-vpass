import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { useAuth } from '../../context/AuthContext';
import { usePass } from '../../context/PassContext';
import { 
  Car, 
  Clock, 
  CheckCircle2, 
  QrCode, 
  ArrowUpRight, 
  Bell, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Briefcase,
  Plus,
  FileText,
  CreditCard,
  Maximize2,
  X,
  Sparkles,
  MapPin,
  IdCard,
  AlertCircle
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    applications = [], 
    vehicles = [], 
    draftApplication, 
    notifications = [], 
    markNotificationAsRead,
    markAllNotificationsAsRead,
    gateLogs = [] 
  } = usePass();

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  // Active or approved application with an issued pass
  const activeApp = applications.find(a => a.status === 'PASS_ISSUED' && a.pass) || 
                    applications.find(a => a.pass) || 
                    applications[0];

  const pendingPaymentApp = applications.find(
    a => a.status === 'APPROVED_PENDING_PAYMENT' || a.status === 'PENDING_PAYMENT'
  );

  const hasDraft = draftApplication && (
    draftApplication.make || 
    draftApplication.plateNumber || 
    draftApplication.vehicle_type
  );

  // Pass preview object
  const activePass = activeApp?.pass ? {
    passNumber: activeApp.pass.passNumber,
    vehicle: `${activeApp.vehicle?.make || ''} ${activeApp.vehicle?.model || ''}`.trim() || 'Honda Click 125',
    plateNumber: activeApp.vehicle?.plateNumber || 'XYZ 5678',
    vehicleType: activeApp.vehicle?.type || 'Motorcycle',
    validUntil: activeApp.pass.validUntil || 'December 31, 2026',
    status: activeApp.pass.status || 'ACTIVE',
    qrData: activeApp.pass.qrData || `RSU-VPASS:${activeApp.pass.passNumber}:${activeApp.vehicle?.plateNumber}:${activeApp.school_id || user?.school_id}`,
  } : {
    passNumber: (user?.classification || '').toLowerCase().includes('employee') ? 'E-001' : 'S-001',
    vehicle: 'Honda Click 125',
    plateNumber: 'XYZ 5678',
    vehicleType: 'Motorcycle',
    validUntil: 'December 31, 2026',
    status: 'ACTIVE',
    qrData: `RSU-VPASS:${(user?.classification || '').toLowerCase().includes('employee') ? 'E-001' : 'S-001'}:XYZ 5678:${user?.school_id || '2026-00001'}`,
  };

  // Generate high-resolution scannable QR Code
  useEffect(() => {
    const payload = activePass.qrData;
    QRCode.toDataURL(payload, {
      width: 480,
      margin: 1,
      color: {
        dark: '#064e3b', // Deep emerald
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('Failed to generate dashboard QR:', err));
  }, [activePass.qrData]);

  // Compute live dynamic stats
  const stats = {
    myVehicles: vehicles.length > 0 ? vehicles.length : (activeApp ? 1 : 0),
    pendingApplications: applications.filter(
      a => a.status === 'PENDING' || 
           a.status === 'RECEIPT_SUBMITTED' || 
           a.status === 'UNDER_REVIEW' || 
           a.status === 'APPROVED_PENDING_PAYMENT'
    ).length,
    activePasses: applications.filter(a => a.status === 'PASS_ISSUED').length || (activeApp?.pass ? 1 : 0),
  };

  // User classification
  const isEmployee = (user?.classification || '').toUpperCase() === 'EMPLOYEE';
  const roleLabel = isEmployee ? 'RSU Employee' : 'RSU Student';
  const academicProgram = user?.year_course || 
    user?.department_unit || 
    (isEmployee ? 'Faculty & Administrative Staff' : 'BS Information Technology (CCMADI)');

  // Find recent gate log for this user or plate
  const recentGateLog = gateLogs.find(
    log => (log.plateNumber && log.plateNumber === activePass.plateNumber) ||
           (log.owner && user?.full_name && log.owner.toLowerCase().includes(user.full_name.toLowerCase()))
  );

  const unreadNotifsCount = (notifications || []).filter(n => !n.read).length;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Welcome & Account Summary Banner */}
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden border border-emerald-600/30">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="space-y-3">
            {/* Classification & AY Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-100 shadow-xs">
                {isEmployee ? (
                  <Briefcase className="w-3.5 h-3.5 text-emerald-200" />
                ) : (
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-200" />
                )}
                <span>{roleLabel}</span>
              </span>

              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-400/30 text-xs font-medium text-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>A.Y. 2026–2027</span>
              </span>
            </div>

            {/* Greeting */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Welcome back, {user?.full_name || 'Juan Dela Cruz'}!
              </h1>
              <p className="text-emerald-100/90 text-sm mt-1 max-w-xl leading-relaxed">
                Manage registered university vehicles, track gate pass approvals, and present your digital RFID/QR clearance at university checkpoints.
              </p>
            </div>

            {/* Identity Details Tags (Clean Wrapping, No Trailing Dots) */}
            <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-black/20 border border-white/10 font-mono text-emerald-100">
                <IdCard className="w-3.5 h-3.5 text-emerald-300" />
                <span>ID: <strong className="text-white font-bold">{user?.school_id || '2026-00001'}</strong></span>
              </span>

              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-black/20 border border-white/10 text-emerald-100">
                <span>{isEmployee ? 'Office / Dept:' : 'Program:'}</span>
                <strong className="text-white font-medium">{academicProgram}</strong>
              </span>

              {user?.drivers_license_no && (
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-black/20 border border-white/10 font-mono text-emerald-200">
                  <span>DL:</span>
                  <strong className="text-white font-semibold">{user.drivers_license_no}</strong>
                </span>
              )}

              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600/30 border border-emerald-400/20 text-emerald-200">
                <MapPin className="w-3 h-3 text-emerald-300" />
                <span>Main Campus (Odiongan)</span>
              </span>
            </div>
          </div>

          {user?.profile_image && (
            <div className="shrink-0 hidden sm:block">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/30 shadow-xl ring-4 ring-emerald-400/20">
                <img src={user.profile_image} alt={user?.full_name || 'User'} className="w-full h-full object-cover" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Smart Contextual Alerts (Draft In-Progress or Payment Required) */}
      {hasDraft && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">Vehicle Registration Draft Saved</p>
              <p className="text-xs text-amber-700 mt-0.5">
                You have an unfinished application for <strong className="font-semibold">{draftApplication.year || ''} {draftApplication.make || ''} {draftApplication.model || 'your vehicle'}</strong> ({draftApplication.plateNumber || 'Pending Plate'}).
              </p>
            </div>
          </div>
          <Link
            to="/client/my-vehicle"
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs shrink-0"
          >
            <span>Resume Registration</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {pendingPaymentApp && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-950">Application Approved — Official Receipt Required</p>
              <p className="text-xs text-emerald-800 mt-0.5">
                Your pass for <strong className="font-semibold">{pendingPaymentApp.vehicle?.make} {pendingPaymentApp.vehicle?.model} ({pendingPaymentApp.vehicle?.plateNumber})</strong> is approved. Please pay at the Cashier and submit your OR number.
              </p>
            </div>
          </div>
          <Link
            to="/client/applications"
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs shrink-0"
          >
            <span>Submit Official Receipt</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Quick Action Shortcuts (One-tap on mobile & desktop) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Quick Actions</h2>
          <span className="text-[11px] text-slate-400 font-medium">Common Tasks</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/client/my-vehicle"
            className="group p-4 bg-white hover:bg-emerald-50/40 rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs transition-all flex flex-col items-start justify-between min-h-[92px]"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">Register Vehicle</p>
              <p className="text-[11px] text-slate-500">Apply for gate pass</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setShowQRModal(true)}
            className="group p-4 bg-white hover:bg-emerald-50/40 rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs transition-all flex flex-col items-start justify-between min-h-[92px] text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-100/70 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <p className="text-xs font-bold text-slate-900 group-hover:text-teal-800">Present Gate Pass</p>
              <p className="text-[11px] text-slate-500">Instant guard scan</p>
            </div>
          </button>

          <Link
            to="/client/applications"
            className="group p-4 bg-white hover:bg-emerald-50/40 rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs transition-all flex flex-col items-start justify-between min-h-[92px]"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <p className="text-xs font-bold text-slate-900 group-hover:text-blue-800">Track Submissions</p>
              <p className="text-[11px] text-slate-500">Check review status</p>
            </div>
          </Link>

          <Link
            to="/client/vehicle-pass"
            className="group p-4 bg-white hover:bg-emerald-50/40 rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs transition-all flex flex-col items-start justify-between min-h-[92px]"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100/70 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <p className="text-xs font-bold text-slate-900 group-hover:text-amber-800">Sticker Clearance</p>
              <p className="text-[11px] text-slate-500">Print RFID/Sticker</p>
            </div>
          </Link>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">My Vehicles</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{stats.myVehicles}</p>
            <Link to="/client/my-vehicle" className="inline-flex items-center text-xs font-semibold text-emerald-600 hover:text-emerald-700 mt-2">
              View vehicle fleet <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Car className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Requests</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{stats.pendingApplications}</p>
            <Link to="/client/applications" className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 mt-2">
              Track submissions <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Gate Passes</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">{stats.activePasses}</p>
            <Link to="/client/vehicle-pass" className="inline-flex items-center text-xs font-semibold text-emerald-600 hover:text-emerald-700 mt-2">
              Open pass credentials <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Vehicle Pass Showcase Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Current Gate Pass</h2>
                <p className="text-xs text-slate-500">Official RSU Security & Safety clearance</p>
              </div>
              <Link
                to="/client/vehicle-pass"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors"
              >
                <span>View Full Pass</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Official Pass Container */}
            <div className="mt-5 p-5 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/60 via-white to-slate-50/60 shadow-xs relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="space-y-2.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ACTIVE CLEARANCE</span>
                    </span>

                    <span className="text-[11px] font-medium text-slate-500">
                      Gates 1, 2, 3 & 4
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight truncate" title={activePass.vehicle}>
                      {activePass.vehicle}
                    </h3>
                    <p className="text-xs text-slate-500">Vehicle Type: <span className="font-semibold text-slate-700">{activePass.vehicleType}</span></p>
                  </div>

                  {/* Philippine Style Plate Box */}
                  <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-mono shadow-xs border border-slate-700">
                    <span className="text-[10px] uppercase font-bold text-emerald-400">PLATE</span>
                    <span className="text-sm font-black tracking-widest">{activePass.plateNumber}</span>
                  </div>

                  <div className="space-y-0.5 text-xs text-slate-600 pt-1">
                    <p>Pass Number: <strong className="font-mono text-emerald-700">{activePass.passNumber}</strong></p>
                    <p>Valid Until: <span className="font-semibold text-slate-800">{activePass.validUntil}</span></p>
                  </div>
                </div>

                {/* QR Preview Widget with Tap to Enlarge */}
                <div className="text-center bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center shrink-0 self-center sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setShowQRModal(true)}
                    className="relative group block rounded-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    title="Tap to enlarge for guard scanner"
                  >
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="Vehicle Pass QR"
                        className="w-24 h-24 object-contain group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center">
                        <QrCode className="w-16 h-16 text-emerald-700" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-emerald-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Maximize2 className="w-5 h-5 drop-shadow-md" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowQRModal(true)}
                    className="mt-2 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center space-x-1"
                  >
                    <span>Enlarge QR Code</span>
                    <Maximize2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Gate Activity Log (Student & Employee Entry/Exit) */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2 text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                {recentGateLog ? (
                  <>
                    Last Gate Scan: <strong className="text-slate-800">{recentGateLog.gate}</strong> ({recentGateLog.type}) • {recentGateLog.time}
                  </>
                ) : (
                  <>Security checkpoint verification active across all university gates.</>
                )}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowQRModal(true)}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center space-x-1"
            >
              <span>Present to Guard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Notifications Column */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">Notifications</h2>
                {unreadNotifsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {unreadNotifsCount} new
                  </span>
                )}
              </div>
              {unreadNotifsCount > 0 ? (
                <button
                  type="button"
                  onClick={() => markAllNotificationsAsRead && markAllNotificationsAsRead()}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              ) : (
                <span className="text-[11px] font-semibold text-slate-400">Feed</span>
              )}
            </div>

            <div className={`mt-4 space-y-3 ${showAllNotifications ? 'max-h-[380px] overflow-y-auto pr-1' : ''}`}>
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No notifications right now.
                </div>
              ) : (
                (showAllNotifications ? notifications : notifications.slice(0, 3)).map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (markNotificationAsRead) markNotificationAsRead(notif.id);
                      if (notif.link) navigate(notif.link);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      !notif.read
                        ? 'border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/60'
                        : 'border-slate-100 bg-slate-50/70 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className={`text-xs ${!notif.read ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] font-medium text-slate-400">{notif.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message || notif.desc}</p>
                    {notif.link && (
                      <div className="mt-2 flex items-center text-[10px] font-bold text-emerald-700 space-x-1">
                        <span>View details</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {notifications.length > 3 && (
            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => setShowAllNotifications(!showAllNotifications)}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
              >
                <span>{showAllNotifications ? 'Show fewer (recent 3)' : `View all (${notifications.length}) notifications`}</span>
                {showAllNotifications ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Full-Screen Gate Presentation QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>RSU OFFICIAL GATE PASS</span>
            </div>

            <h3 className="text-lg font-black text-slate-900">
              {activePass.vehicle}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5 font-bold">
              Plate: {activePass.plateNumber}
            </p>

            <div className="mt-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 inline-block shadow-inner">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code"
                  className="w-56 h-56 object-contain mx-auto"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-emerald-600" />
                </div>
              )}
            </div>

            <div className="mt-3 space-y-1">
              <p className="text-xs font-mono font-bold text-emerald-800">
                {activePass.passNumber}
              </p>
              <p className="text-[11px] text-slate-500">
                Hold phone screen near the scanner at Campus Gates 1, 2, 3, or 4.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowQRModal(false)}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <Link
                to="/client/vehicle-pass"
                onClick={() => setShowQRModal(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-1"
              >
                <span>Full Pass</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
