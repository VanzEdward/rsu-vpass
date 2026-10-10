import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePass } from '../context/PassContext';
import { 
  ShieldCheck, 
  LogOut, 
  User, 
  Bell, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  QrCode, 
  Receipt, 
  RotateCcw,
  Check,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { 
    notifications = [], 
    markNotificationAsRead, 
    markAllNotificationsAsRead 
  } = usePass() || {};

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notif) => {
    if (markNotificationAsRead) {
      markNotificationAsRead(notif.id);
    }
    setIsNotifOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'REGISTRATION_APPROVED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'REGISTRATION_REJECTED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'PASS_ISSUED':
      case 'PASS_ACTIVATED':
        return <QrCode className="w-4 h-4 text-emerald-600" />;
      case 'RECEIPT_REJECTED':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'RECEIPT_VERIFIED':
        return <Receipt className="w-4 h-4 text-blue-600" />;
      case 'APPLICATION_RESUBMITTED':
        return <RotateCcw className="w-4 h-4 text-teal-600" />;
      default:
        return <Bell className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'PASO_ADMIN':
        return <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">PASO Admin</span>;
      case 'GUARD':
        return <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300">Gate Security</span>;
      default:
        return <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Client / Student</span>;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-100 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                RSU <span className="text-emerald-600">VPASS</span>
              </span>
              <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                PASO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">Romblon State University • Vehicle Pass System</p>
          </div>
        </Link>

        {/* User Info & Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {user ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* User text callout (desktop) */}
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-slate-800 leading-tight">{user.full_name || 'Juan Dela Cruz'}</p>
                <div className="mt-0.5">{getRoleBadge(user.role)}</div>
              </div>

              {/* NOTIFICATION FEATURE: Positioned on the HEADER to the LEFT of the profile icon (Client side only) */}
              {user.role === 'CLIENT' && (
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    title="Notifications"
                    className="relative p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 active:scale-95"
                    aria-label="View notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white shadow-xs">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown Panel */}
                  {isNotifOpen && (
                    <>
                      {/* Mobile backdrop for focus and click-outside dismissal */}
                      <div 
                        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 sm:hidden"
                        onClick={() => setIsNotifOpen(false)}
                      />

                      <div className="fixed left-3 right-3 top-[68px] sm:absolute sm:top-full sm:left-auto sm:right-0 sm:mt-2 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200/90 py-3 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
                        {/* Dropdown Header */}
                        <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-extrabold text-sm text-slate-900">Notifications</h3>
                            {unreadCount > 0 ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                {unreadCount} unread
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
                                All caught up
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-3">
                            {unreadCount > 0 && (
                              <button
                                type="button"
                                onClick={markAllNotificationsAsRead}
                                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer flex items-center space-x-1"
                              >
                                <Check className="w-3 h-3" />
                                <span>Mark all read</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setIsNotifOpen(false)}
                              className="sm:hidden text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
                              aria-label="Close notifications"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Notification Items */}
                        <div className="max-h-[380px] sm:max-h-[400px] overflow-y-auto divide-y divide-slate-100 flex-1">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 space-y-1">
                            <Bell className="w-8 h-8 mx-auto text-slate-300" />
                            <p className="text-xs font-bold text-slate-700">No Notifications</p>
                            <p className="text-[11px]">Updates from PASO will automatically appear here.</p>
                          </div>
                        ) : (
                          notifications.map((notif) => {
                            const isUnread = !notif.read;
                            return (
                              <div
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif)}
                                className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start space-x-3 text-left ${
                                  isUnread ? 'bg-emerald-50/40' : ''
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                  notif.type === 'REGISTRATION_REJECTED' || notif.type === 'RECEIPT_REJECTED'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                  {getNotifIcon(notif.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className={`text-xs truncate ${isUnread ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                                      {notif.title}
                                    </p>
                                    <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                                      {notif.time || 'Just now'}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed line-clamp-2">
                                    {notif.message}
                                  </p>
                                  {notif.link && (
                                    <span className="text-[10px] font-bold text-emerald-700 mt-1 inline-flex items-center space-x-0.5">
                                      <span>Tap to view & action</span>
                                      <ChevronRight className="w-3 h-3" />
                                    </span>
                                  )}
                                </div>

                                {isUnread && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Dropdown Footer */}
                      <div className="pt-2 px-3 border-t border-slate-100 text-center">
                        <Link
                          to="/client/applications"
                          onClick={() => setIsNotifOpen(false)}
                          className="text-[11px] font-bold text-slate-600 hover:text-emerald-700 py-1 block"
                        >
                          View Application Milestones Tracker ➔
                        </Link>
                      </div>
                    </div>
                  </>
                )}
                </div>
              )}

              {/* Profile Avatar Icon */}
              <Link
                to={user.role === 'PASO_ADMIN' ? '/admin/dashboard' : '/client/profile'}
                title="View Profile"
                className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 overflow-hidden shrink-0 hover:ring-2 hover:ring-emerald-400 transition-all cursor-pointer"
              >
                {user.profile_image ? (
                  <img src={user.profile_image} alt={user.full_name || 'Profile'} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </Link>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
