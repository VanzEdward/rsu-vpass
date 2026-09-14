import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, ArrowRight, UserCheck, ShieldAlert, KeyRound } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('2026-00001');
  const [password, setPassword] = useState('client123');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // Instant demo login logic for structure demonstration
    if (identifier.includes('admin') || identifier.includes('PASO')) {
      login(
        { id: 2, school_id: 'PASO-ADMIN-01', full_name: 'PASO Administrator', role: 'PASO_ADMIN', email: 'paso@rsu.edu.ph' },
        'demo_admin_jwt_token'
      );
      navigate('/admin/dashboard');
    } else if (identifier.includes('guard') || identifier.includes('GUARD')) {
      login(
        { id: 3, school_id: 'GUARD-GATE-01', full_name: 'Officer Santos', role: 'GUARD', email: 'guard@rsu.edu.ph' },
        'demo_guard_jwt_token'
      );
      navigate('/guard/scanner');
    } else {
      // Default Client (Juan Dela Cruz)
      login(
        { id: 1, school_id: '2026-00001', full_name: 'Juan Dela Cruz', role: 'CLIENT', email: 'juan.delacruz@rsu.edu.ph' },
        'demo_client_jwt_token'
      );
      navigate('/client/dashboard');
    }
  };

  const quickSwitch = (role) => {
    if (role === 'CLIENT') {
      setIdentifier('2026-00001');
      setPassword('client123');
    } else if (role === 'ADMIN') {
      setIdentifier('PASO-ADMIN-01');
      setPassword('admin123');
    } else {
      setIdentifier('GUARD-GATE-01');
      setPassword('guard123');
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
    </div>
  );
}
