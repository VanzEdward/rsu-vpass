import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, IdCard, Phone, Building } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Account Profile</h1>
        <p className="text-xs text-slate-500 mt-1">View and maintain your university vehicle pass account details.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center text-emerald-700">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">{user?.full_name || 'Juan Dela Cruz'}</h2>
            <p className="text-xs text-slate-500 font-mono">School ID: {user?.school_id || '2026-00001'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block font-semibold">Email Address</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">{user?.email || 'juan.delacruz@rsu.edu.ph'}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block font-semibold">Contact Number</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">+63 912 345 6789</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block font-semibold">Campus</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">RSU Main Campus (Odiongan)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block font-semibold">User Role</span>
            <span className="font-semibold text-emerald-700 mt-0.5 block">Client / Student</span>
          </div>
        </div>
      </div>
    </div>
  );
}
