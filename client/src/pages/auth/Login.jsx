import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../api/client';
import { ShieldCheck, ArrowRight, UserCheck, ShieldAlert, KeyRound, UserPlus, MapPin, Lock, Check, X } from 'lucide-react';
import { usePass, CAMPUS_GATES } from '../../context/PassContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { setActiveGate } = usePass();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [guardPendingAuth, setGuardPendingAuth] = useState(null); // { user, token }

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
      setIdentifier('2026-00001');
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
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

          {/* Quick Demo Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Quick Switch Role (Prototype Demo):
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => quickSwitch('CLIENT')}
                className="px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-[11px] font-semibold text-slate-700 flex flex-col items-center cursor-pointer transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600 mb-0.5" />
                <span>Client</span>
              </button>
              <button
                type="button"
                onClick={() => quickSwitch('ADMIN')}
                className="px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-[11px] font-semibold text-slate-700 flex flex-col items-center cursor-pointer transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5 text-emerald-600 mb-0.5" />
                <span>PASO Admin</span>
              </button>
              <button
                type="button"
                onClick={() => quickSwitch('GUARD')}
                className="px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-[11px] font-semibold text-slate-700 flex flex-col items-center cursor-pointer transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-slate-600 mb-0.5" />
                <span>Gate Guard</span>
              </button>
            </div>
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
    </div>
  );
}
