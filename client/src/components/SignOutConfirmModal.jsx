import React, { useEffect } from 'react';
import { LogOut, X, User, AlertTriangle } from 'lucide-react';

/**
 * SignOutConfirmModal
 * Confirmation dialog shown before signing out in Client, Admin, and Guard portals
 * to prevent accidental misclicks.
 */
export default function SignOutConfirmModal({ isOpen, onClose, onConfirm, user }) {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const roleLabel =
    user?.role === 'PASO_ADMIN'
      ? 'PASO Administrator'
      : user?.role === 'GUARD'
      ? 'Gate Security Personnel'
      : 'Client / Student';

  const roleBadgeStyle =
    user?.role === 'PASO_ADMIN'
      ? 'bg-purple-100 text-purple-800 border-purple-200'
      : user?.role === 'GUARD'
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : 'bg-emerald-100 text-emerald-800 border-emerald-200';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sign-out-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      {/* Modal Card */}
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95 duration-150 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close X Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Visual Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
          <LogOut className="w-7 h-7" />
        </div>

        {/* Title & Prompt */}
        <h3 id="sign-out-modal-title" className="text-lg font-black text-slate-900 mt-4 tracking-tight">
          Confirm Sign Out
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
          Are you sure you want to sign out of your RSU VPASS session?
        </p>

        {/* Active Account Identity Card */}
        {user && (
          <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/90 text-left flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-700 font-bold shrink-0 shadow-xs overflow-hidden">
              {user.profile_image ? (
                <img src={user.profile_image} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-slate-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">
                {user.full_name || 'Active User'}
              </p>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="text-[10px] font-semibold text-slate-500 truncate">
                  {user.school_id || user.email || 'Current Account'}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border uppercase ${roleBadgeStyle}`}>
                  {user.role === 'PASO_ADMIN' ? 'Admin' : user.role === 'GUARD' ? 'Security' : 'Client'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Guard Station Specific Advisory */}
        {user?.role === 'GUARD' && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-left flex items-start space-x-2 text-[11px] text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Station Shift Note:</strong> Signing out will close your active gate post station. Make sure incoming security personnel take over.
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onConfirm();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 shadow-md shadow-rose-600/20 active:scale-98 transition-all cursor-pointer focus:outline-none"
          >
            <LogOut className="w-4 h-4" />
            <span>Yes, Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
