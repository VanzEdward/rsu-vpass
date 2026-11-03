import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../api/client';
import { ShieldCheck, ArrowRight, ShieldAlert, KeyRound, UserPlus, MapPin, Lock, Check, X, CheckCircle2, Eye, EyeOff, Mail, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { usePass, CAMPUS_GATES } from '../../context/PassContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { setActiveGate } = usePass();
  const [identifier, setIdentifier] = useState(() => location.state?.registeredId || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState(() => location.state?.successMessage || '');
  const [submitting, setSubmitting] = useState(false);
  const [guardPendingAuth, setGuardPendingAuth] = useState(null); // { user, token }

  // Forgot Password Modal State (Students & Employees ONLY)
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = Request PIN, 2 = Verify & Reset
  const [forgotSchoolId, setForgotSchoolId] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotMaskedEmail, setForgotMaskedEmail] = useState('');
  const [forgotDemoOtp, setForgotDemoOtp] = useState('');

  const openForgotPasswordModal = () => {
    setForgotError('');
    setForgotStep(1);
    setForgotOtp('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setForgotDemoOtp('');
    // Pre-fill if user already typed in identifier
    if (identifier.includes('@')) {
      setForgotEmail(identifier.trim());
      setForgotSchoolId('');
    } else if (identifier.trim()) {
      setForgotSchoolId(identifier.trim());
      setForgotEmail('');
    } else {
      setForgotSchoolId('');
      setForgotEmail('');
    }
    setShowForgotModal(true);
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSubmitting(true);

    try {
      const res = await apiRequest('/auth/forgot-password/request', {
        method: 'POST',
        body: JSON.stringify({
          school_id: forgotSchoolId.trim(),
          email: forgotEmail.trim()
        })
      });

      setForgotMaskedEmail(res.emailMasked || forgotEmail.trim());
      if (res.demoOtp) {
        setForgotDemoOtp(res.demoOtp);
      }
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.message || 'Account not found. Please verify your School ID and registered Email.');
    } finally {
      setForgotSubmitting(false);
    }
  };

  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    setForgotError('');

    if (forgotNewPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('New password and confirmation do not match.');
      return;
    }

    setForgotSubmitting(true);

    try {
      const res = await apiRequest('/auth/forgot-password/reset', {
        method: 'POST',
        body: JSON.stringify({
          school_id: forgotSchoolId.trim(),
          email: forgotEmail.trim(),
          otp: forgotOtp.trim(),
          newPassword: forgotNewPassword,
          confirmPassword: forgotConfirmPassword
        })
      });

      setShowForgotModal(false);
      setSuccessInfo(res.message || 'Password successfully reset! Please sign in with your new credentials.');
      setIdentifier(forgotSchoolId.trim());
      setPassword('');
      setError('');
    } catch (err) {
      setForgotError(err.message || 'Failed to reset password. Please check the One-Time PIN.');
    } finally {
      setForgotSubmitting(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password })
      });

      if (res.user.role === 'PASO_ADMIN') {
        login(res.user, res.token);
        navigate('/admin/dashboard');
      } else if (res.user.role === 'GUARD') {
        // Intercept guard login to prompt for gate selection
        setGuardPendingAuth({ user: res.user, token: res.token });
      } else {
        login(res.user, res.token);
        navigate('/client/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmGuardGate = (gateId) => {
    if (!guardPendingAuth) return;
    setActiveGate(gateId);
    login(guardPendingAuth.user, guardPendingAuth.token);
    navigate('/guard/scanner');
  };

  const quickSwitch = (role) => {
    if (role === 'CLIENT') {
      setIdentifier('');
      setPassword('');
    } else if (role === 'ADMIN') {
      setIdentifier('PASO-ADMIN-01');
      setPassword('');
    } else {
      setIdentifier('GUARD-GATE-01');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Brand Card */}
        <div className="text-center mb-6">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-emerald-600 items-center justify-center text-white shadow-md ring-4 ring-emerald-100 mb-3">
            <ShieldCheck className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            RSU <span className="text-emerald-600">VPASS</span>
          </h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-0.5">
            Romblon State University
          </p>
          <p className="text-xs text-slate-500 mt-1">Vehicle Registration & Pass Management System</p>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-7">
          <h2 className="text-lg font-bold text-slate-900">Account Sign In</h2>
          <p className="text-xs text-slate-500 mt-0.5">Use your University ID or Email to access your vehicle passes.</p>

          {successInfo && (
            <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 text-emerald-900 text-xs border border-emerald-200/90 flex items-start space-x-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-emerald-950">Registration Complete!</span>
                <span className="text-[11px] text-emerald-800 leading-relaxed block mt-0.5">{successInfo}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                School ID or Email
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                placeholder="e.g. 2026-00001 or juan@rsu.edu.ph"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={openForgotPasswordModal}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 focus:outline-none cursor-pointer transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Sign In to VPASS</span>
              <ArrowRight className="w-4 h-4 text-emerald-200" />
            </button>
          </form>

          {/* New Account Registration Callout */}
          <div className="mt-5 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-center space-y-1">
            <p className="text-xs text-slate-700 font-medium">
              Student or University Employee?
            </p>
            <Link
              to="/register"
              className="mt-1 inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span>Fill Out Vehicle Gate Pass Registration Form</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <p className="text-[10px] text-slate-400 pt-1 border-t border-emerald-100">
              Note: Security Guard credentials are provisioned exclusively by PASO Admin.
            </p>
          </div>
        </div>
      </div>

      {/* GUARD STATION SELECTION MODAL UPON SIGN-IN */}
      {guardPendingAuth && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setGuardPendingAuth(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
              title="Cancel"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Select Shift Gate Post</h3>
                <p className="text-xs text-slate-500">
                  Officer <span className="font-bold text-slate-800">{guardPendingAuth.user.full_name}</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Please choose which campus gate you are guarding for this active shift. All scan entries and exits will be stamped under this gate.
            </p>

            {/* List of 4 Campus Gates */}
            <div className="space-y-2.5">
              {(CAMPUS_GATES || []).map((gate) => (
                <button
                  key={gate.id}
                  type="button"
                  onClick={() => handleConfirmGuardGate(gate.id)}
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-emerald-50/80 hover:border-emerald-300 text-left flex items-center justify-between transition-all cursor-pointer group shadow-xs hover:shadow-sm"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                      {gate.name.replace('Gate ', 'G')}
                    </div>
                    <span className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {gate.name}
                    </span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                </button>
              ))}
            </div>

            {/* Locked for shift notice */}
            <div className="mt-5 p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 flex items-start space-x-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Locked for Shift Policy:</span>
                <p className="text-[10px] text-amber-800 mt-0.5">
                  Once chosen, your gate assignment cannot be changed during duty. To switch to another gate, you must <strong>Sign Out</strong> and re-authenticate.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* FORGOT PASSWORD MODAL (Students & Employees ONLY)        */}
      {/* ======================================================== */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 relative animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start space-x-3.5 pb-2 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 mb-1">
                  Students & Employees
                </span>
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  {forgotStep === 1 ? 'Recover Account Password' : 'Set New Password'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                  {forgotStep === 1
                    ? 'Verify your identity using your School ID and registered Email.'
                    : 'Enter your single-use 6-digit One-Time PIN (OTP).'}
                </p>
              </div>
            </div>

            {/* Error Banner */}
            {forgotError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs border border-rose-200 flex items-start space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-semibold">{forgotError}</span>
              </div>
            )}

            {/* STEP 1: Verify School ID & Email */}
            {forgotStep === 1 && (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    School / University ID Number
                  </label>
                  <input
                    type="text"
                    value={forgotSchoolId}
                    onChange={(e) => setForgotSchoolId(e.target.value)}
                    required
                    placeholder="e.g. 2026-00001 or 2023-10492"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      placeholder="e.g. juan@rsu.edu.ph"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Role Guard Notice */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start space-x-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Motorist Accounts Only:</strong> This self-service recovery is exclusively for <strong>Students</strong> and <strong>University Employees</strong>. PASO Admins and Security Guards must contact the PASO Chief.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer transition-all"
                  >
                    {forgotSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending One-Time PIN...</span>
                      </>
                    ) : (
                      <>
                        <span>Send One-Time PIN</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Enter One-Time PIN (OTP) & New Password */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyAndReset} className="space-y-4">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs">
                  <p className="font-semibold">
                    We sent a single-use 6-digit One-Time PIN to <strong>{forgotMaskedEmail}</strong>.
                  </p>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Valid for 15 minutes • Single-use only.
                  </p>
                </div>

                {/* Dev Simulation Banner (Assists testing when Brevo API key is not configured) */}
                {forgotDemoOtp && (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold block flex items-center space-x-1 text-amber-900">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Demo Mode PIN:</span>
                      </span>
                      <span className="font-mono font-black text-lg tracking-widest text-amber-900">
                        {forgotDemoOtp}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForgotOtp(forgotDemoOtp)}
                      className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-[11px] cursor-pointer"
                    >
                      Auto-fill
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    6-Digit One-Time PIN (OTP)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    placeholder="• • • • • •"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-center text-xl font-mono font-black tracking-[0.4em] text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent uppercase placeholder:tracking-normal placeholder:font-normal placeholder:text-sm"
                    autoFocus
                  />
                  <span className="text-[10px] text-slate-400 block mt-1 text-center">
                    This PIN can only be used once and expires automatically.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showForgotNewPassword ? 'text' : 'password'}
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      required
                      placeholder="Minimum 6 characters"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      {showForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showForgotConfirmPassword ? 'text' : 'password'}
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      required
                      placeholder="Re-type new password"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      {showForgotConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep(1);
                      setForgotError('');
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    ← Resend PIN / Back
                  </button>

                  <button
                    type="submit"
                    disabled={forgotSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer transition-all"
                  >
                    {forgotSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Set New Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
