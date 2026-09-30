import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ShieldCheck, MapPin, Radio, ChevronDown, Check, X, Building, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePass, CAMPUS_GATES } from '../context/PassContext';

export default function GuardLayout() {
  const { user } = useAuth();
  const { activeGate, setActiveGate } = usePass();
  const [showGateModal, setShowGateModal] = useState(false);

  const currentGateObj = (CAMPUS_GATES || []).find((g) => g.id === activeGate) || (CAMPUS_GATES || [])[0];

  const handleSelectGate = (gateId) => {
    setActiveGate(gateId);
    setShowGateModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      {/* Light Navbar */}
      <Navbar />

      {/* Guard Duty Quick Status Bar (Mobile-First with Interactive Gate Switcher) */}
      <div className="bg-slate-800/90 backdrop-blur-md border-b border-slate-700/80 px-4 py-2.5 text-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          {/* Active Gate Indicator (Click to Switch Gate) */}
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>

            <button
              type="button"
              onClick={() => setShowGateModal(true)}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-emerald-400 font-bold border border-slate-600 transition-colors cursor-pointer group"
              title="Click to Switch Gate Station"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-white group-hover:text-emerald-300 transition-colors">
                {currentGateObj?.name || 'Gate 1'}
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">• {currentGateObj?.description.split('/')[0]}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white transition-transform" />
            </button>
          </div>

          {/* Officer Callout */}
          <div className="flex items-center space-x-2 text-[11px] font-mono text-emerald-400 bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-700">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">OFFICER:</span>
            <span className="font-bold text-white">{user?.full_name || 'Officer Santos'}</span>
          </div>
        </div>
      </div>

      {/* Main Guard App Screen */}
      <main className="flex-1 max-w-xl md:max-w-3xl w-full mx-auto p-3 sm:p-6 pb-12">
        <Outlet />
      </main>

      {/* GATE POST SELECTION MODAL (SHIFTING POSTS: GATE 1, GATE 2, GATE 3, GATE 4) */}
      {showGateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowGateModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 rounded-full cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Select Active Gate Post</h3>
                <p className="text-xs text-slate-400">Choose your assigned gate for this active shift.</p>
              </div>
            </div>

            <div className="p-3 mb-4 rounded-xl bg-slate-900/70 border border-slate-700 text-xs text-slate-300">
              <span className="font-bold text-emerald-400">Gate Audit Tracking:</span> All vehicle entries and exits you log will be stamped under this gate station so the administration knows exactly which gate was used.
            </div>

            {/* List of 4 Campus Gates */}
            <div className="space-y-2.5">
              {(CAMPUS_GATES || []).map((gate) => {
                const isSelected = activeGate === gate.id;
                return (
                  <button
                    key={gate.id}
                    type="button"
                    onClick={() => handleSelectGate(gate.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600/20 border-emerald-500 text-white ring-1 ring-emerald-500/50 shadow-md'
                        : 'bg-slate-900/40 border-slate-700 text-slate-300 hover:bg-slate-700/50 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {gate.name.replace('Gate ', 'G')}
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                          {gate.name}
                        </p>
                        <p className="text-[11px] text-slate-400">{gate.description}</p>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>ACTIVE</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => setShowGateModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Confirm Gate Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
