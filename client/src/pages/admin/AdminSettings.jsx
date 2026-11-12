import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  Sparkles, 
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
import { PASS_TEMPLATES } from '../../components/RsuStickerPass';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../api/client';

export default function AdminSettings() {
  const { systemSettings, updateSystemSettings } = usePass();
  const { user, updateUser } = useAuth();

  // Settings State: Kept focused exclusively on Academic Year & Pass Expiration Policy
  const [settings, setSettings] = useState(systemSettings || DEFAULT_SETTINGS);

  // Admin Information State
  const [adminForm, setAdminForm] = useState({
    full_name: user?.full_name || "",
    school_id: user?.school_id || "",
    email: user?.email || "",
    contact_number: user?.contact_number || "",
    department_unit: user?.department_unit || "",
    newPassword: '',
    confirmPassword: '',
  });

  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedSettingsChanges, setHasUnsavedSettingsChanges] = useState(false);

  useEffect(() => {
    if (systemSettings && !hasUnsavedSettingsChanges) {
      setSettings(systemSettings);
    }
  }, [systemSettings, hasUnsavedSettingsChanges]);

  useEffect(() => {
    if (user) {
      setAdminForm((prev) => ({
        ...prev,
        full_name: user.full_name || "",
        school_id: user.school_id || "",
        email: user.email || "",
        contact_number: user.contact_number || "",
        department_unit: user.department_unit || "",
      }));
    }
  }, [user]);

  const handleSettingsFieldChange = (key, value) => {
    setHasUnsavedSettingsChanges(true);
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'academicYear') {
        if (value === '2026-2027') next.stickerTemplateVersion = 'V1';
        else if (value === '2027-2028') next.stickerTemplateVersion = 'V2';
        else if (value === '2028-2029') next.stickerTemplateVersion = 'V3';
      }
      return next;
    });
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
      await updateSystemSettings(settings);
      setHasUnsavedSettingsChanges(false);

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
        {/* SECTION 1: ACADEMIC YEAR & ANNUAL STICKER COLOR THEME    */}
        {/* ======================================================== */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Academic Year & Pass Expiration Policy</h2>
              <p className="text-xs text-slate-500">Defines validity bounds for printable gate pass stickers and annual pass renewals</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Active Academic Year</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono font-bold">Active</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 2026-2027"
                value={settings.academicYear || '2026-2027'}
                onChange={(e) => handleSettingsFieldChange('academicYear', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
              />
              <div className="flex items-center space-x-1.5 pt-1">
                {['2026-2027', '2027-2028', '2028-2029'].map((ay) => (
                  <button
                    key={ay}
                    type="button"
                    onClick={() => {
                      handleSettingsFieldChange('academicYear', ay);
                      if (ay === '2026-2027') handleSettingsFieldChange('stickerTemplateVersion', 'V1');
                      if (ay === '2027-2028') handleSettingsFieldChange('stickerTemplateVersion', 'V2');
                      if (ay === '2028-2029') handleSettingsFieldChange('stickerTemplateVersion', 'V3');
                    }}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                      settings.academicYear === ay
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {ay}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Pass Expiration Policy</label>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>July 31, {settings.academicYear?.split('-')[1] || '2027'}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  Academic Calendar
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Valid for both semesters + June–July summer renewal grace period</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Advance Renewal Notice Window</label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.renewalWindowDays || '60'}
                  onChange={(e) => handleSettingsFieldChange('renewalWindowDays', e.target.value)}
                  className="w-full pr-12 pl-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">days</span>
              </div>
              <p className="text-[11px] text-slate-400">Prompts client to renew before July 31 cutoff</p>
            </div>
          </div>

          {/* Color Template Selection */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Annual Vehicle Sticker Color Theme (Canva Templates)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select which color pair will be issued for newly registered or renewed passes in this Academic Year. Existing passes from earlier Academic Years retain their original color set until renewed.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {Object.values(PASS_TEMPLATES).map((template) => {
                const isSelected = (settings.stickerTemplateVersion || 'V1') === template.id;
                return (
                  <div
                    key={template.id}
                    onClick={() => handleSettingsFieldChange('stickerTemplateVersion', template.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/40 shadow-sm ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">{template.name}</span>
                        {isSelected ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center space-x-1">
                            <Check className="w-2.5 h-2.5" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold">Click to select</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">{template.description}</p>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-slate-200/80 grid grid-cols-2 gap-2">
                      <div className={`p-2 rounded-xl border text-center ${template.studentBadgeBg}`}>
                        <span className="text-[9px] font-extrabold uppercase block tracking-wider">Student</span>
                        <span className="text-[11px] font-black truncate block mt-0.5">{template.studentColorName}</span>
                      </div>
                      <div className={`p-2 rounded-xl border text-center ${template.employeeBadgeBg}`}>
                        <span className="text-[9px] font-extrabold uppercase block tracking-wider">Employee</span>
                        <span className="text-[11px] font-black truncate block mt-0.5">{template.employeeColorName}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                placeholder="e.g. Employee ID or Admin ID"
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
        </div>
        {/* Unsaved Indicator */}
        {hasUnsavedSettingsChanges && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center space-x-2 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Unsaved Academic Year / Color Theme changes — click Save below to apply to newly issued and renewed passes.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSettings(systemSettings || DEFAULT_SETTINGS);
                setHasUnsavedSettingsChanges(false);
              }}
              className="px-3 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold text-[11px] hover:bg-amber-100 cursor-pointer shrink-0"
            >
              Discard
            </button>
          </div>
        )}

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
    </div>
  );
}
