import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePass } from '../../context/PassContext';
import CameraCaptureModal from '../../components/CameraCaptureModal';
import ConfirmModal from '../../components/ConfirmModal';
import {
  User,
  Camera,
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
  Sparkles,
  Award
} from 'lucide-react';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const { vehicles = [], applications = [] } = usePass() || {};

  // Live Selfie Modal State
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showRemovePhotoModal, setShowRemovePhotoModal] = useState(false);

  // Edit Contact Information State
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    contact_number: user?.contact_number || '+63 912 345 6789',
    emergency_name: user?.emergency_name || 'Maria Dela Cruz',
    emergency_phone: user?.emergency_phone || '+63 918 765 4321',
    emergency_relation: user?.emergency_relation || 'Mother / Guardian',
  });
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

  // Copy ID State
  const [copiedId, setCopiedId] = useState(false);

  // Calculate Metrics
  const activePassesCount = applications.filter((app) => app.pass?.status === 'ACTIVE').length;
  const registeredVehiclesCount = vehicles.length;

  // Handle Copy ID
  const handleCopyId = () => {
    const idToCopy = user?.school_id || '2026-00001';
    navigator.clipboard?.writeText(idToCopy);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Handle Live Selfie Capture
  const handleCaptureSelfie = (photoDataUrl) => {
    updateUser({
      profile_image: photoDataUrl,
      profile_verified_at: new Date().toLocaleDateString(),
    });
    setShowCameraModal(false);
  };

  // Remove Photo
  const handleRemovePhoto = () => {
    setShowRemovePhotoModal(true);
  };

  // Save Contact Details
  const handleSaveContact = (e) => {
    e.preventDefault();
    updateUser({
      contact_number: contactForm.contact_number,
      emergency_name: contactForm.emergency_name,
      emergency_phone: contactForm.emergency_phone,
      emergency_relation: contactForm.emergency_relation,
    });
    setIsEditingContact(false);
    setContactSavedAlert(true);
    setTimeout(() => setContactSavedAlert(false), 3500);
  };

  // Handle Change Password Submit
  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordError('');

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

    // Success simulation
    setPasswordSuccess(true);
    setTimeout(() => {
      setPasswordSuccess(false);
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }, 1500);
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
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 px-6 py-6 text-white relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />
          <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 text-[11px] font-semibold border border-emerald-400/30">
                  Romblon State University
                </span>
                <span className="text-[11px] text-emerald-200">Main Campus (Odiongan)</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1">Institutional Vehicle Pass Account</h1>
            </div>

            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-emerald-100 border border-white/20">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Good Standing • Gate Cleared</span>
              </span>
            </div>
          </div>
        </div>

        {/* Profile Details Area */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Live Selfie Avatar */}
            <div className="flex flex-col items-center shrink-0">
              <div className="relative group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-slate-100 border-4 border-white shadow-lg ring-2 ring-emerald-500/30 flex items-center justify-center">
                  {user?.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={user.full_name || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-3 text-slate-400 flex flex-col items-center justify-center">
                      <User className="w-12 h-12 text-slate-300 mb-1" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">No Live Selfie</span>
                    </div>
                  )}
                </div>

                {/* Floating Camera Button */}
                <button
                  type="button"
                  onClick={() => setShowCameraModal(true)}
                  title="Take Live Selfie"
                  className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-md ring-4 ring-white transition-transform active:scale-95 cursor-pointer"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              {/* Action Links under photo */}
              <div className="mt-3 flex items-center space-x-2 text-center">
                <button
                  type="button"
                  onClick={() => setShowCameraModal(true)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{user?.profile_image ? 'Retake Live Selfie' : 'Take Live Selfie'}</span>
                </button>
                {user?.profile_image && (
                  <>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-xs text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>

              <div className="mt-1 flex items-center space-x-1 text-[10px] text-slate-400">
                <Lock className="w-2.5 h-2.5" />
                <span>Camera Only (Uploads Disabled)</span>
              </div>
            </div>

            {/* Core User Identity */}
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-2xl font-black text-slate-900">{user?.full_name || 'Juan Dela Cruz'}</h2>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {user?.role === 'PASO_ADMIN'
                      ? 'PASO Administrator'
                      : user?.role === 'GUARD'
                      ? 'Gate Security'
                      : 'Client / Student'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">College of Engineering and Technology • BS Information Technology</p>
              </div>

              {/* School ID Badge with Copy */}
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">University ID:</span>
                <span className="font-mono text-xs font-bold text-slate-800">{user?.school_id || '2026-00001'}</span>
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
              <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg">
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-emerald-700">
                    <Car className="w-4 h-4 shrink-0" />
                    <span className="text-[11px] font-bold">Vehicles</span>
                  </div>
                  <div className="text-lg font-black text-emerald-950 mt-1">{registeredVehiclesCount}</div>
                  <div className="text-[10px] text-emerald-700 font-medium">Registered</div>
                </div>

                <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-100 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-teal-700">
                    <QrCode className="w-4 h-4 shrink-0" />
                    <span className="text-[11px] font-bold">Passes</span>
                  </div>
                  <div className="text-lg font-black text-teal-950 mt-1">{activePassesCount}</div>
                  <div className="text-[10px] text-teal-700 font-medium">Active Passes</div>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-blue-700">
                    <Award className="w-4 h-4 shrink-0" />
                    <span className="text-[11px] font-bold">Record</span>
                  </div>
                  <div className="text-lg font-black text-blue-950 mt-1">Clean</div>
                  <div className="text-[10px] text-blue-700 font-medium">0 Violations</div>
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
                  onClick={() => setIsEditingContact(true)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {isEditingContact ? (
              <form onSubmit={handleSaveContact} className="mt-4 space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Primary Mobile Number</label>
                  <input
                    type="text"
                    value={contactForm.contact_number}
                    onChange={(e) => setContactForm({ ...contactForm, contact_number: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="+63 9XX XXX XXXX"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingContact(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
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
                    <span className="font-bold text-slate-800 mt-0.5 block">{contactForm.contact_number}</span>
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
                  <div className="font-bold text-slate-900 text-sm">{contactForm.emergency_name}</div>
                  <div className="flex items-center justify-between text-slate-600 text-xs">
                    <span>Relation: <strong className="text-slate-800">{contactForm.emergency_relation}</strong></span>
                    <span className="font-mono font-bold text-slate-800">{contactForm.emergency_phone}</span>
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
                <h3 className="text-sm font-bold text-slate-900">Institutional Records</h3>
                <p className="text-[11px] text-slate-500">Official RSU academic and administrative affiliation</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block font-semibold text-[11px]">University Email</span>
                <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                  {user?.email || 'juan.delacruz@rsu.edu.ph'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block font-semibold text-[11px]">School ID</span>
                <span className="font-mono font-semibold text-slate-800 mt-0.5 block">
                  {user?.school_id || '2026-00001'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 sm:col-span-2">
                <span className="text-slate-400 block font-semibold text-[11px]">College / Division</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  College of Engineering and Technology (CET)
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 sm:col-span-2">
                <span className="text-slate-400 block font-semibold text-[11px]">Designated Campus</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  RSU Main Campus • Liwanag, Odiongan, Romblon
                </span>
              </div>
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
              onClick={logout}
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

      {/* Live Selfie Camera Modal (Upload disabled, live webcam only) */}
      <CameraCaptureModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCapture={handleCaptureSelfie}
        title="Take Live ID Verification Selfie"
        selfieOnly={true}
      />

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

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="At least 6 characters"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Repeat new password"
                  required
                />
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  Save New Password
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unified In-App Confirm Remove Photo Dialog */}
      <ConfirmModal
        isOpen={showRemovePhotoModal}
        onClose={() => setShowRemovePhotoModal(false)}
        onConfirm={() => updateUser({ profile_image: null })}
        title="Remove Profile Selfie?"
        message="Are you sure you want to remove your verification photo? You will need to take a new live selfie for gate identification."
        confirmText="Yes, Remove Photo"
        cancelText="Keep Photo"
        variant="danger"
      />
    </div>
  );
}
