import React, { useState } from 'react';
import { 
  Camera, 
  Search, 
  CheckCircle2, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  History 
} from 'lucide-react';

export default function GuardScanner() {
  const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'search' | 'logs'
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedPass, setVerifiedPass] = useState(null);
  const [logs, setLogs] = useState([
    {
      id: 1,
      passNumber: 'VP-2026-0001',
      plateNumber: 'XYZ 5678',
      owner: 'Juan Dela Cruz',
      type: 'ENTRY',
      time: '10:45 AM Today',
      status: 'VALID'
    }
  ]);

  // Simulate scanning the demo pass
  const handleSimulateScan = () => {
    setVerifiedPass({
      passNumber: 'VP-2026-0001',
      client: 'Juan Dela Cruz',
      schoolId: '2026-00001',
      vehicle: 'Honda Click 125',
      plateNumber: 'XYZ 5678',
      vehicleType: 'Motorcycle',
      validUntil: 'December 31, 2026',
      status: 'ACTIVE',
      isValid: true,
    });
  };

  const handleLogEvent = (type) => {
    if (!verifiedPass) return;
    const newLog = {
      id: Date.now(),
      passNumber: verifiedPass.passNumber,
      plateNumber: verifiedPass.plateNumber,
      owner: verifiedPass.client,
      type,
      time: 'Just now',
      status: 'VALID'
    };
    setLogs([newLog, ...logs]);
    alert(`${type} logged for ${verifiedPass.client} (${verifiedPass.plateNumber})`);
    setVerifiedPass(null);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>RSU Gate Security Module</span>
        </span>
        <h1 className="text-2xl font-black text-slate-900">Pass Verification & Gate Logging</h1>
        <p className="text-xs text-slate-500 mt-0.5">Scan gate passes or perform manual vehicle search fallback.</p>
      </div>

      {/* Mode Switcher */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('scan')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            activeTab === 'scan' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>QR Scanner</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('search')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            activeTab === 'search' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Manual Search</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            activeTab === 'logs' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Entry/Exit Logs</span>
        </button>
      </div>

      {/* 1. Scanner Tab */}
      {activeTab === 'scan' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs text-center space-y-4">
          <div className="aspect-square max-w-xs mx-auto rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center relative overflow-hidden border-4 border-emerald-600">
            {/* Viewfinder simulation */}
            <div className="w-48 h-48 border-2 border-emerald-400 rounded-xl flex items-center justify-center animate-pulse">
              <Camera className="w-12 h-12 text-emerald-400/70" />
            </div>
            <p className="absolute bottom-3 text-[11px] text-slate-300">Align QR code inside frame</p>
          </div>

          <p className="text-xs text-slate-500">Camera scanning active using HTML5 camera stream.</p>

          <button
            type="button"
            onClick={handleSimulateScan}
            className="px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs cursor-pointer transition-colors"
          >
            Simulate Scan of Demo Pass (Juan Dela Cruz)
          </button>
        </div>
      )}

      {/* 2. Manual Search Fallback Tab (PRD Section 4.9) */}
      {activeTab === 'search' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Manual Vehicle Search Fallback</label>
            <p className="text-xs text-slate-500 mb-3">Search by owner name, School ID, plate number, or pass number.</p>
            <div className="flex space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. XYZ 5678, Juan Dela Cruz, or 2026-00001"
                className="flex-1 p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleSimulateScan}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Entry/Exit Logs Tab (PRD Section 4.10) */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Recent Verification Events</h3>
          <div className="divide-y divide-slate-100 text-xs">
            {logs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">{log.owner} ({log.plateNumber})</p>
                  <p className="text-[11px] text-slate-400">Pass: {log.passNumber} • {log.time}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  log.type === 'ENTRY' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {log.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verification Result Card (PRD Section 4.8) */}
      {verifiedPass && (
        <div className="p-5 rounded-2xl bg-white border-2 border-emerald-500 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <div>
                <h3 className="text-sm font-black text-slate-900">PASS VALID & ACTIVE</h3>
                <p className="text-[11px] text-slate-500 font-mono">{verifiedPass.passNumber}</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-200">
              AUTHORIZED
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 text-xs grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Registered Owner</span>
              <span className="font-bold text-slate-800">{verifiedPass.client}</span>
              <span className="text-slate-500 block text-[11px]">ID: {verifiedPass.schoolId}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Vehicle Info</span>
              <span className="font-bold text-slate-800">{verifiedPass.vehicle}</span>
              <span className="font-mono font-bold text-emerald-700 block text-[11px]">Plate: {verifiedPass.plateNumber}</span>
            </div>
          </div>

          {/* Gate Verification Logging Buttons (PRD Section 4.10) */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleLogEvent('ENTRY')}
              className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <LogIn className="w-4 h-4 text-emerald-100" />
              <span>Log Entry</span>
            </button>
            <button
              type="button"
              onClick={() => handleLogEvent('EXIT')}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <LogOut className="w-4 h-4 text-slate-300" />
              <span>Log Exit</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
