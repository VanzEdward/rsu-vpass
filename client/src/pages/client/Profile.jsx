import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePass, getUniquePassApplications, isPassExpired } from '../../context/PassContext';
import {
  User,
  ShieldCheck,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Save,
  X,
  Lock,
  Key,
  Copy,
  Check,
  LogOut,
  Car,
  QrCode,
  ShieldAlert,
  HeartPulse,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import SignOutConfirmModal from '../../components/SignOutConfirmModal';
import { apiRequest } from '../../api/client';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const { vehicles = [], applications = [] } = usePass() || {};
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  // Edit Contact Information State
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    contact_number: user?.contact_number || '',
    emergency_name: user?.emergency_name || '',
    emergency_phone: user?.emergency_phone || '',
    emergency_relation: user?.emergency_relation || '',
  });
  const [contactSaving, setContactSaving] = useState(false);
  const [contactError, setContactError] = useState('');

  // Fetch authoritative user profile from backend database on mount
  useEffect(() => {
    let isMounted = true;
    apiRequest('/auth/me')
      .then((freshUser) => {
        if (isMounted && freshUser && freshUser.id) {
          updateUser(freshUser);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (user && !isEditingContact) {
      setContactForm({
        contact_number: user.contact_number || '',
        emergency_name: user.emergency_name || '',
        emergency_phone: user.emergency_phone || '',
        emergency_relation: user.emergency_relation || '',
      });
    }
  }, [user, isEditingContact]);

  const [contactSavedAlert, setContactSavedAlert] = useState(false);

  // Change Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Copy ID State
  const [copiedId, setCopiedId] = useState(false);

  // Calculate Metrics (deduplicated per vehicle)
  const activePassesCount = getUniquePassApplications(applications).filter(
    (app) => app.pass && !isPassExpired(app.pass)
  ).length;
  const activeVehiclesCount = vehicles.filter((v) => v.status === 'Active Pass').length;
  const pendingVehiclesCount = vehicles.filter((v) => v.status !== 'Active Pass').length;
  const totalVehiclesCount = vehicles.length;

  // Handle Copy ID
  const handleCopyId = () => {
    const idToCopy = user?.school_id || '';
    if (!idToCopy) return;
    navigator.clipboard?.writeText(idToCopy);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Save Contact Details (persisted to database via /auth/profile)
  const handleSaveContact = async (e) => {
    e.preventDefault();
    setContactError('');
    setContactSavedAlert(false);

    const payload = {
      contact_number: contactForm.contact_number.trim(),
      emergency_name: contactForm.emergency_name.trim(),
      emergency_phone: contactForm.emergency_phone.trim(),
      emergency_relation: contactForm.emergency_relation.trim(),
    };

    if (!payload.contact_number || !payload.emergency_name || !payload.emergency_phone || !payload.emergency_relation) {
      setContactError('Please complete all contact and emergency details before saving.');
      return;
    }

    setContactSaving(true);
    try {
      const res = await apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      const updatedUser = res?.user ? res.user : payload;
      updateUser(updatedUser);
      setIsEditingContact(false);
      setContactSavedAlert(true);
      setTimeout(() => setContactSavedAlert(false), 3500);
    } catch (err) {
      setContactError(err.message || 'Failed to save changes to the server. Please try again.');
    } finally {
      setContactSaving(false);
    }
  };

  // Handle Change Password Submit (Real Database Connection)
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!passwordForm.currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordSubmitting(true);
    try {
      await apiRequest('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword
        })
      });

      setPasswordSuccess(true);
      setTimeout(() => {
        setPasswordSuccess(false);
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }, 1600);
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password. Please check your current password.');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      {/* Top Banner Alert if contact updated */}
      {contactSavedAlert && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between text-xs shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">Contact and emergency information updated successfully!</span>
          </div>
          <button onClick={() => setContactSavedAlert(false)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Profile Identity Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* University Header Accent */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 p-5 sm:p-7 text-white relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />
          <div className="relative z-10">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 text-[10px] sm:text-[11px] font-bold border border-emerald-400/30 shrink-0">
                  Romblon State University
                </span>
                <span className="text-[11px] text-emerald-200/90 font-medium">
                  • Main Campus (Odiongan)
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-snug">
                Institutional Vehicle Pass Account
              </h1>
            </div>
          </div>
        </div>

        {/* Profile Details Area */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* User Profile Avatar */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-100 border-4 border-white shadow-md ring-2 ring-emerald-500/20 flex items-center justify-center">
                {user?.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt={user.full_name || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center flex flex-col items-center justify-center text-emerald-700">
                    <User className="w-12 h-12 text-emerald-600" />
                  </div>
                )}
              </div>
            </div>

            {/* Core User Identity */}
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-2xl font-black text-slate-900">{user?.full_name || 'User'}</h2>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {user?.classification === 'EMPLOYEE'
                      ? 'RSU Employee'
                      : user?.role === 'PASO_ADMIN'
                      ? 'PASO Administrator'
                      : user?.role === 'GUARD'
                      ? 'Gate Security'
                      : 'RSU Student'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {user?.year_course || user?.department_unit || (user?.classification === 'EMPLOYEE' ? 'RSU Personnel' : 'RSU Student')}
                </p>
              </div>

              {/* School ID Badge with Copy */}
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">University ID:</span>
                <span className="font-mono text-xs font-bold text-slate-800">{user?.school_id || 'N/A'}</span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  title="Copy School ID"
                  className="p-1 text-slate-400 hover:text-emerald-700 rounded-md transition-colors cursor-pointer"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Badges / Metrics Row */}
              <div className="grid grid-cols-2 gap-3 pt-2 max-w-sm w-full mx-auto sm:mx-0">
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center sm:text-left flex flex-col justify-between">
                  <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-emerald-700">
                    <Car className="w-4 h-4 shrink-0" />
                    <span className="text-[11px] font-bold">Total Vehicles</span>
                  </div>
                  <div className="text-xl font-black text-emerald-950 my-1">{totalVehiclesCount}</div>
                  <div className="text-[10px] text-emerald-700 font-semibold truncate">
                    {pendingVehiclesCount > 0 ? (
                      <span>{activeVehiclesCount} Active • {pendingVehiclesCount} Pending</span>
                    ) : (
                      <span>{activeVehiclesCount} Active Pass</span>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-100 text-center sm:text-left flex flex-col justify-between">
                  <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-teal-700">
                    <QrCode className="w-4 h-4 shrink-0" />
                    <span className="text-[11px] font-bold">Active Passes</span>
                  </div>
                  <div className="text-xl font-black text-teal-950 my-1">{activePassesCount}</div>
                  <div className="text-[10px] text-teal-700 font-semibold truncate">
                    Official Gate QR
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Contact & Institutional Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editable Contact & Emergency Details */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Contact & Emergency Details</h3>
                  <p className="text-[11px] text-slate-500">Security contact record in case of vehicle emergencies</p>
                </div>
              </div>

              {!isEditingContact && (
                <button
                  type="button"
                  onClick={() => {
                    setContactError('');
                    setIsEditingContact(true);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {isEditingContact ? (
              <form onSubmit={handleSaveContact} className="mt-4 space-y-4">
                {contactError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{contactError}</span>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Primary Mobile Number</label>
                  <input
                    type="text"
                    value={contactForm.contact_number}
                    onChange={(e) => setContactForm({ ...contactForm, contact_number: e.target.value })}
                    required
                    disabled={contactSaving}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                    placeholder="+63 9XX XXX XXXX"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex items-center space-x-1 text-slate-700 text-xs font-bold">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                    <span>Emergency Contact Person</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={contactForm.emergency_name}
                      onChange={(e) => setContactForm({ ...contactForm, emergency_name: e.target.value })}
                      required
                      disabled={contactSaving}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                      placeholder="e.g. Maria Dela Cruz"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Relationship</label>
                      <input
                        type="text"
                        value={contactForm.emergency_relation}
                        onChange={(e) => setContactForm({ ...contactForm, emergency_relation: e.target.value })}
                        required
                        disabled={contactSaving}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                        placeholder="e.g. Parent / Spouse"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Emergency Phone</label>
                      <input
                        type="text"
                        value={contactForm.emergency_phone}
                        onChange={(e) => setContactForm({ ...contactForm, emergency_phone: e.target.value })}
                        required
                        disabled={contactSaving}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                        placeholder="+63 9XX XXX XXXX"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="submit"
                    disabled={contactSaving}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {contactSaving ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={contactSaving}
                    onClick={() => {
                      setIsEditingContact(false);
                      setContactError('');
                      if (user) {
                        setContactForm({
                          contact_number: user.contact_number || '',
                          emergency_name: user.emergency_name || '',
                          emergency_phone: user.emergency_phone || '',
                          emergency_relation: user.emergency_relation || '',
                        });
                      }
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-4 space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block font-semibold text-[11px]">Primary Contact</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{contactForm.contact_number || 'Not provided'}</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold text-[11px]">Emergency Contact</span>
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                      Emergency Only
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">{contactForm.emergency_name || 'Not provided'}</div>
                  <div className="flex items-center justify-between text-slate-600 text-xs">
                    <span>Relation: <strong className="text-slate-800">{contactForm.emergency_relation || 'Not specified'}</strong></span>
                    <span className="font-mono font-bold text-slate-800">{contactForm.emergency_phone || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Emergency numbers are only shared with campus medical and security staff during on-campus incidents.</span>
          </div>
        </div>

        {/* Institutional & Campus Records (Read-only) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Vehicle Passholder Registration Records</h3>
                <p className="text-[11px] text-slate-500">Official RSU gate pass enrollment information</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block font-semibold text-[11px]">Passholder Classification</span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  {user?.classification === 'EMPLOYEE' ? 'University Employee (Faculty/Staff)' : 'Enrolled Student'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block font-semibold text-[11px]">Identification Card No.</span>
                <span className="font-mono font-bold text-slate-800 mt-0.5 block">
                  {user?.school_id || 'N/A'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 sm:col-span-2">
                <span className="text-slate-400 block font-semibold text-[11px]">
                  {user?.classification === 'EMPLOYEE' ? 'Department / Office Unit' : 'Academic Program & Year Level'}
                </span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {user?.year_course || user?.department_unit || 'None specified'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block font-semibold text-[11px]">Driver's License No.</span>
                <span className="font-mono font-bold text-slate-800 mt-0.5 block uppercase">
                  {user?.drivers_license_no || 'Not provided'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block font-semibold text-[11px]">Age</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {user?.age ? `${user.age} years old` : 'Not specified'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 sm:col-span-2">
                <span className="text-slate-400 block font-semibold text-[11px]">Current Address (Odiongan)</span>
                <span className="font-medium text-slate-800 mt-0.5 block">
                  {user?.current_address || 'Not provided'}
                </span>
              </div>

              {user?.permanent_address && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 sm:col-span-2">
                  <span className="text-slate-400 block font-semibold text-[11px]">Permanent Address</span>
                  <span className="font-medium text-slate-800 mt-0.5 block">
                    {user?.permanent_address}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-start space-x-2 text-[11px] text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Official student/faculty records are synchronized with the university registrar. For official name or program corrections, visit the PASO office.
            </span>
          </div>
        </div>
      </div>

      {/* Security & Authentication Row */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Security & Credentials</h3>
              <p className="text-[11px] text-slate-500">Manage account password and active portal access</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Key className="w-3.5 h-3.5 text-slate-300" />
              <span>Change Password</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSignOutModalOpen(true)}
              className="px-4 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 pt-1">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Current Device: <strong>Web Browser (Active)</strong></span>
          </div>
          <span className="text-[11px]">Last session authenticated: Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>



      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Change Account Password</h3>
                  <p className="text-[11px] text-slate-500">Update your security credentials</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Password updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter current password"
                    required
                    disabled={passwordSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="At least 6 characters"
                    required
                    disabled={passwordSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Repeat new password"
                    required
                    disabled={passwordSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="submit"
                  disabled={passwordSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  {passwordSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save New Password</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={passwordSubmitting}
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError('');
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      <SignOutConfirmModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={logout}
        user={user}
      />

    </div>
  );
}
