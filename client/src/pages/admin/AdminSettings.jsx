import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Save, 
  Check, 
  RotateCcw,
  User,
  Mail,
  Phone,
  Building,
  Key,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  IdCard,
  AlertTriangle
} from 'lucide-react';

import { usePass, DEFAULT_SETTINGS } from '../../context/PassContext';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../api/client';

const DEFAULT_ADMIN_INFO = {
  full_name: 'PASO Administrator',
  school_id: 'PASO-ADMIN-01',
  email: 'paso@rsu.edu.ph',
  contact_number: '+63 917 111 2222',
  department_unit: 'Physical Assets and Security Office (PASO)',
};

export default function AdminSettings() {
  const { systemSettings, updateSystemSettings } = usePass();
  const { user, updateUser } = useAuth();

  // Settings State: Kept focused exclusively on Academic Year & Pass Expiration Policy
  const [settings, setSettings] = useState(systemSettings || DEFAULT_SETTINGS);

  // Admin Information State
  const [adminForm, setAdminForm] = useState({
    full_name: user?.full_name || DEFAULT_ADMIN_INFO.full_name,
    school_id: user?.school_id || DEFAULT_ADMIN_INFO.school_id,
    email: user?.email || DEFAULT_ADMIN_INFO.email,
    contact_number: user?.contact_number || DEFAULT_ADMIN_INFO.contact_number,
    department_unit: user?.department_unit || DEFAULT_ADMIN_INFO.department_unit,
    newPassword: '',
    confirmPassword: '',
  });

  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    if (systemSettings) {
      setSettings(systemSettings);
    }
  }, [systemSettings]);

  useEffect(() => {
    if (user) {
      setAdminForm((prev) => ({
        ...prev,
        full_name: user.full_name || DEFAULT_ADMIN_INFO.full_name,
        school_id: user.school_id || DEFAULT_ADMIN_INFO.school_id,
        email: user.email || DEFAULT_ADMIN_INFO.email,
        contact_number: user.contact_number || DEFAULT_ADMIN_INFO.contact_number,
        department_unit: user.department_unit || DEFAULT_ADMIN_INFO.department_unit,
      }));
    }
  }, [user]);

  const handleSettingsFieldChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleAdminFieldChange = (key, value) => {
    setAdminForm((prev) => ({ ...prev, [key]: value }));
  };

  // Save Settings & Admin Information
  const handleSaveAll = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSavedSuccessMsg('');

    // Password validation if entered
    if (adminForm.newPassword) {
      if (adminForm.newPassword.length < 6) {
        setErrorMsg('New password must be at least 6 characters.');
        return;
      }
      if (adminForm.newPassword !== adminForm.confirmPassword) {
        setErrorMsg('New password and confirmation do not match.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // 1. Update Academic Year & Expiration Settings in PassContext
      updateSystemSettings(settings);

      // 2. Update Admin Profile & Credentials
      const profilePayload = {
        full_name: adminForm.full_name.trim(),
        school_id: adminForm.school_id.trim(),
        email: adminForm.email.trim(),
        contact_number: adminForm.contact_number.trim(),
        department_unit: adminForm.department_unit.trim(),
        ...(adminForm.newPassword ? { password: adminForm.newPassword } : {}),
      };

      try {
        const res = await apiRequest('/auth/profile', {
          method: 'PUT',
          body: JSON.stringify(profilePayload),
        });
        if (res && res.user) {
          updateUser(res.user);
        } else {
          updateUser(profilePayload);
        }
      } catch (err) {
        // Fallback update to AuthContext / local state if backend is offline
        updateUser(profilePayload);
      }

      setAdminForm((prev) => ({
        ...prev,
        newPassword: '',
        confirmPassword: '',
      }));

      setSavedSuccessMsg('Academic Year settings and Administrator information successfully updated!');
      setTimeout(() => setSavedSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset Admin Information back to official default values
  const handleConfirmResetAdmin = async () => {
    setShowResetModal(false);
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      try {
        const res = await apiRequest('/auth/reset-admin', {
          method: 'POST',
        });
        if (res && res.user) {
          updateUser(res.user);
        } else {
          updateUser(DEFAULT_ADMIN_INFO);
        }
      } catch (err) {
        // Fallback update
        updateUser(DEFAULT_ADMIN_INFO);
      }

      setAdminForm({
        ...DEFAULT_ADMIN_INFO,
        newPassword: '',
        confirmPassword: '',
      });

      setSavedSuccessMsg('Administrator information and credentials successfully reset to default university values!');
      setTimeout(() => setSavedSuccessMsg(''), 4500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset admin information.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure university academic year pass expiration policies and manage official PASO administrator credentials.
        </p>
      </div>

      {/* Success Banner */}
      {savedSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center space-x-2 text-xs font-bold text-emerald-800 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center space-x-2 text-xs font-bold text-rose-800 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* ======================================================== */}
        {/* SECTION 1: ACADEMIC YEAR & PASS EXPIRATION POLICY         */}
        {/* ======================================================== */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Academic Year & Pass Expiration Policy</h2>
              <p className="text-xs text-slate-500">Defines validity bounds for printable gate pass stickers and annual pass renewals</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                <span>Current Academic Year</span>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-mono">Live</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 2026-2027"
                value={settings.academicYear || '2026-2027'}
                onChange={(e) => handleSettingsFieldChange('academicYear', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
              />
              <p className="text-[11px] text-slate-400">Institutional year displayed across client and admin passes</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Pass Validity Duration</label>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Exactly 1 Year from Issue Date</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  365 Days
                </span>
              </div>
              <p className="text-[11px] text-slate-400">e.g. Issued today ➔ Valid for exactly 365 days</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Advance Renewal Notice Window</label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.renewalWindowDays || '30'}
                  onChange={(e) => handleSettingsFieldChange('renewalWindowDays', e.target.value)}
                  className="w-full pr-12 pl-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">days</span>
              </div>
              <p className="text-[11px] text-slate-400">Shows renewal prompt on specific vehicle before expiry</p>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 2: PASO ADMINISTRATOR INFORMATION & RESET        */}
        {/* ======================================================== */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Administrator Information & Credentials</h2>
                <p className="text-xs text-slate-500">Official PASO administrative identity, contact details, and account credentials</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold tracking-wide border border-emerald-200 hidden sm:inline-block">
              PASO_ADMIN • Superuser
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Administrator Full Name</span>
              </label>
              <input
                type="text"
                placeholder="e.g. PASO Administrator"
                value={adminForm.full_name}
                onChange={(e) => handleAdminFieldChange('full_name', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
              <p className="text-[11px] text-slate-400">Name displayed in verified passes and receipt audits</p>
            </div>

            {/* Admin School ID / Badge */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <IdCard className="w-3.5 h-3.5 text-slate-400" />
                <span>Admin Identifier / Login ID</span>
              </label>
              <input
                type="text"
                placeholder="e.g. PASO-ADMIN-01"
                value={adminForm.school_id}
                onChange={(e) => handleAdminFieldChange('school_id', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
              <p className="text-[11px] text-slate-400">Primary login identifier for the administrator portal</p>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Official Email Address</span>
              </label>
              <input
                type="email"
                placeholder="e.g. paso@rsu.edu.ph"
                value={adminForm.email}
                onChange={(e) => handleAdminFieldChange('email', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
              <p className="text-[11px] text-slate-400">Institutional correspondence address</p>
            </div>

            {/* Contact Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Contact Phone Number</span>
              </label>
              <input
                type="text"
                placeholder="e.g. +63 917 111 2222"
                value={adminForm.contact_number}
                onChange={(e) => handleAdminFieldChange('contact_number', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <p className="text-[11px] text-slate-400">Direct hotline or office mobile contact</p>
            </div>

            {/* Department / Unit */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>Department / University Unit</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Physical Assets and Security Office (PASO)"
                value={adminForm.department_unit}
                onChange={(e) => handleAdminFieldChange('department_unit', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Change Password Sub-section */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center space-x-1.5">
              <Key className="w-3.5 h-3.5 text-slate-500" />
              <span>Change Admin Account Password</span>
              <span className="text-[10px] text-slate-400 font-normal">(Leave blank to keep current password)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">New Password</label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Enter new secure password"
                    value={adminForm.newPassword}
                    onChange={(e) => handleAdminFieldChange('newPassword', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Confirm New Password</label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={adminForm.confirmPassword}
                    onChange={(e) => handleAdminFieldChange('confirmPassword', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reset Admin Information Danger Zone Card */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1.5 text-amber-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Reset Administrator Information</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Reset your administrator name, login ID (<strong>PASO-ADMIN-01</strong>), contact information, and default password back to factory university defaults.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-amber-300 hover:bg-amber-100/60 text-amber-900 text-xs font-bold cursor-pointer transition-colors shrink-0 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
              <span>Reset Admin Info</span>
            </button>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-sm flex items-center space-x-2 transition-all active:scale-95 disabled:opacity-60"
          >
            <Save className="w-4 h-4 text-emerald-100" />
            <span>{isSubmitting ? 'Saving Configuration...' : 'Save System Settings & Admin Profile'}</span>
          </button>
        </div>
      </form>

      {/* Confirmation Modal for Reset Admin Information */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Reset Administrator Information?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This will reset the administrator profile back to:
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Name:</span>
                <span className="font-bold text-slate-900">PASO Administrator</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Login ID:</span>
                <span className="font-bold text-emerald-700">PASO-ADMIN-01</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-bold text-slate-900">paso@rsu.edu.ph</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-bold text-slate-900">+63 917 111 2222</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Password:</span>
                <span className="font-bold text-slate-900">admin (Default)</span>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResetAdmin}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer shadow-sm transition-all"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
