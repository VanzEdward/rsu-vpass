import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Search, 
  CheckCircle2, 
  XCircle, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  History, 
  Video, 
  VideoOff, 
  Sparkles, 
  RotateCcw,
  Volume2,
  VolumeX,
  User,
  Car,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export default function GuardScanner() {
  const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'search' | 'logs'
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedPass, setVerifiedPass] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [logSuccessMessage, setLogSuccessMessage] = useState('');
  const [logFilter, setLogFilter] = useState('ALL'); // 'ALL' | 'ENTRY' | 'EXIT'

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Initial demonstration logs
  const [logs, setLogs] = useState([
    {
      id: 1,
      passNumber: 'VP-2026-0001',
      plateNumber: 'XYZ 5678',
      owner: 'Juan Dela Cruz',
      type: 'ENTRY',
      time: '10:45 AM',
      status: 'VALID'
    },
    {
      id: 2,
      passNumber: 'TMP-2026-0042',
      plateNumber: 'NBM 9012',
      owner: 'Dr. Maria Santos (Visitor)',
      type: 'ENTRY',
      time: '09:30 AM',
      status: 'VALID'
    },
    {
      id: 3,
      passNumber: 'VP-2026-0001',
      plateNumber: 'XYZ 5678',
      owner: 'Juan Dela Cruz',
      type: 'EXIT',
      time: '08:15 AM',
      status: 'VALID'
    }
  ]);

  // Web Audio API beep feedback
  const playBeep = (isSuccess = true) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (isSuccess) {
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else {
        osc.frequency.setValueAtTime(300, ctx.currentTime); // Low warning buzz
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      // Audio context might be restricted before gesture
    }
  };

  // Haptic feedback (vibrate)
  const triggerHaptic = (success = true) => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      if (success) {
        window.navigator.vibrate([60, 40, 60]);
      } else {
        window.navigator.vibrate([150, 80, 150]);
      }
    }
  };

  // Toggle Live Phone Camera
  const toggleCamera = async () => {
    if (cameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setCameraActive(false);
      return;
    }

    setCameraError('');
    try {
      const constraints = {
        video: { facingMode: { ideal: 'environment' } }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      setCameraError('Camera access denied or unavailable. Using simulated scanner.');
      setCameraActive(false);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Demo pass scanner simulator
  const handleScanPass = (passType = 'VALID') => {
    if (passType === 'VALID') {
      playBeep(true);
      triggerHaptic(true);
      setVerifiedPass({
        passNumber: 'VP-2026-0001',
        client: 'Juan Dela Cruz',
        schoolId: '2026-00001',
        vehicle: 'Honda Click 125',
        plateNumber: 'XYZ 5678',
        vehicleType: 'Motorcycle',
        color: 'Black',
        validUntil: 'December 31, 2026',
        status: 'ACTIVE',
        isValid: true,
        department: 'College of Arts & Sciences'
      });
    } else {
      playBeep(false);
      triggerHaptic(false);
      setVerifiedPass({
        passNumber: 'VP-2025-0819',
        client: 'Pedro Penduko',
        schoolId: '2023-99999',
        vehicle: 'Yamaha Mio',
        plateNumber: 'ABC 1234',
        vehicleType: 'Motorcycle',
        color: 'Red',
        validUntil: 'August 15, 2025',
        status: 'EXPIRED',
        isValid: false,
        department: 'Expired Pass Clearance'
      });
    }
  };

  const handleManualSearch = (query) => {
    const q = (query || searchQuery).trim().toLowerCase();
    if (!q) return;

    if (q.includes('xyz') || q.includes('juan') || q.includes('2026-00001') || q.includes('vp-2026')) {
      handleScanPass('VALID');
    } else {
      handleScanPass('EXPIRED');
    }
  };

  const handleLogEvent = (type) => {
    if (!verifiedPass) return;
    triggerHaptic(true);
    playBeep(true);

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog = {
      id: Date.now(),
      passNumber: verifiedPass.passNumber,
      plateNumber: verifiedPass.plateNumber,
      owner: verifiedPass.client,
      type,
      time: `${timeStr} Today`,
      status: verifiedPass.isValid ? 'VALID' : 'INVALID'
    };

    setLogs([newLog, ...logs]);
    setLogSuccessMessage(`${type} recorded for ${verifiedPass.plateNumber}!`);
    setTimeout(() => setLogSuccessMessage(''), 3000);
    setVerifiedPass(null);
  };

  // Metrics
  const totalEntries = logs.filter(l => l.type === 'ENTRY').length;
  const totalExits = logs.filter(l => l.type === 'EXIT').length;

  const filteredLogs = logs.filter(log => {
    if (logFilter === 'ALL') return true;
    return log.type === logFilter;
  });

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      {/* Interactive Sound & Flash Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-300">GATE SCANNER</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span className="text-[11px] text-emerald-400 font-mono">ONLINE</span>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center space-x-1"
          title={soundEnabled ? "Mute audio beep" : "Enable audio beep"}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          <span className="text-[10px] hidden sm:inline">{soundEnabled ? 'Beep ON' : 'Muted'}</span>
        </button>
      </div>

      {/* Mode Switcher Tabs (Thumb-Friendly, Large Tap Targets) */}
      <div className="grid grid-cols-3 gap-1.5 bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700 shadow-md">
        <button
          type="button"
          onClick={() => setActiveTab('scan')}
          className={`py-3 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 cursor-pointer ${
            activeTab === 'scan'
              ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-500'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>QR Scanner</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('search')}
          className={`py-3 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 cursor-pointer ${
            activeTab === 'search'
              ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-500'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Manual Search</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`py-3 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-500'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Gate Logs ({logs.length})</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {logSuccessMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500 text-white font-bold text-xs flex items-center justify-between shadow-lg animate-bounce">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{logSuccessMessage}</span>
          </div>
          <span className="text-[10px] bg-emerald-700/50 px-2 py-0.5 rounded-full">SAVED</span>
        </div>
      )}

      {/* 1. QR SCANNER VIEWPORT */}
      {activeTab === 'scan' && (
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-3xl border border-slate-700 p-4 sm:p-6 shadow-xl relative overflow-hidden">
            {/* Viewfinder Frame */}
            <div className="aspect-square max-w-[280px] sm:max-w-xs mx-auto rounded-2xl bg-black flex flex-col items-center justify-center relative overflow-hidden border-2 border-slate-700 shadow-inner">
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-900 to-slate-950">
                  {/* Holographic Laser Scan Line */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse shadow-[0_0_12px_#34d399]" />
                  <Camera className="w-14 h-14 text-emerald-500/40 mb-2" />
                  <p className="text-xs text-slate-400 font-mono text-center">Point camera at pass QR code</p>
                </div>
              )}

              {/* Viewfinder Target Corners */}
              <div className="absolute top-4 left-4 w-7 h-7 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-7 h-7 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-7 h-7 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-7 h-7 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
            </div>

            {cameraError && (
              <p className="text-[11px] text-amber-400 text-center mt-2">{cameraError}</p>
            )}

            {/* Camera Controls */}
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={toggleCamera}
                className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer ${
                  cameraActive 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                }`}
              >
                {cameraActive ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4 text-emerald-400" />}
                <span>{cameraActive ? 'Stop Camera' : 'Use Phone Camera'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleScanPass('VALID')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Simulate Scan Pass (XYZ 5678)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MANUAL VEHICLE SEARCH */}
      {activeTab === 'search' && (
        <div className="bg-slate-800 rounded-3xl border border-slate-700 p-5 shadow-xl space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">Vehicle License Plate or Student ID</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                placeholder="e.g. XYZ 5678, Juan, or 2026-00001"
                className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => handleManualSearch()}
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-md cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Verify</span>
              </button>
            </div>
          </div>

          {/* Quick preset chips for rapid testing on phone */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Quick Test Vehicles:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => { setSearchQuery('XYZ 5678'); handleManualSearch('XYZ 5678'); }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 border border-slate-700 text-emerald-400 text-xs font-mono font-bold cursor-pointer"
              >
                XYZ 5678 (Client Pass)
              </button>
              <button
                type="button"
                onClick={() => { setSearchQuery('ABC 1234'); handleManualSearch('ABC 1234'); }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 border border-slate-700 text-rose-400 text-xs font-mono font-bold cursor-pointer"
              >
                ABC 1234 (Expired Demo)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. GATE ENTRY / EXIT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-slate-800 rounded-3xl border border-slate-700 p-4 sm:p-5 shadow-xl space-y-4">
          {/* Quick Counters */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total In (Entry)</span>
                <span className="text-xl font-black text-emerald-400">{totalEntries}</span>
              </div>
              <LogIn className="w-6 h-6 text-emerald-400" />
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Out (Exit)</span>
                <span className="text-xl font-black text-blue-400">{totalExits}</span>
              </div>
              <LogOut className="w-6 h-6 text-blue-400" />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-700">
            {['ALL', 'ENTRY', 'EXIT'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setLogFilter(filter)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  logFilter === filter ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Log list */}
          <div className="divide-y divide-slate-700 max-h-80 overflow-y-auto pr-1">
            {filteredLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">{log.plateNumber}</span>
                    <span className="text-xs text-slate-300">• {log.owner}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{log.passNumber} • {log.time}</p>
                </div>

                <span className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] ${
                  log.type === 'ENTRY'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                }`}>
                  {log.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VERIFICATION RESULT CARD (HIGH VISIBILITY / SUNLIGHT READABLE) */}
      {verifiedPass && (
        <div className={`p-5 sm:p-6 rounded-3xl border-2 shadow-2xl transition-all space-y-4 ${
          verifiedPass.isValid
            ? 'bg-slate-800 border-emerald-500 shadow-emerald-950/50 ring-4 ring-emerald-500/20'
            : 'bg-slate-800 border-rose-500 shadow-rose-950/50 ring-4 ring-rose-500/20'
        }`}>
          {/* Status Banner */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              {verifiedPass.isValid ? (
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <span className={`text-sm font-black tracking-tight block ${
                  verifiedPass.isValid ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {verifiedPass.isValid ? 'VALID PASS • ACCESS GRANTED' : 'ACCESS DENIED • EXPIRED'}
                </span>
                <span className="text-xs text-slate-400 font-mono">{verifiedPass.passNumber}</span>
              </div>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider ${
              verifiedPass.isValid ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
            }`}>
              {verifiedPass.status}
            </span>
          </div>

          {/* Huge License Plate Callout */}
          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-700 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Registered License Plate</span>
            <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-wider block mt-1">
              {verifiedPass.plateNumber}
            </span>
            <span className="text-xs text-emerald-400 font-semibold mt-1 block">
              {verifiedPass.vehicle} ({verifiedPass.color} {verifiedPass.vehicleType})
            </span>
          </div>

          {/* Driver & Details Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80">
              <span className="text-slate-400 text-[10px] font-bold uppercase block">Driver / Owner</span>
              <span className="font-bold text-white block mt-0.5">{verifiedPass.client}</span>
              <span className="text-[11px] text-slate-400 font-mono">ID: {verifiedPass.schoolId}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80">
              <span className="text-slate-400 text-[10px] font-bold uppercase block">Clearance Validity</span>
              <span className="font-bold text-white block mt-0.5">{verifiedPass.validUntil}</span>
              <span className="text-[11px] text-slate-400">{verifiedPass.department}</span>
            </div>
          </div>

          {/* Big Action Touch Buttons (Thumb-Zone, Minimum 56px height) */}
          <div className="pt-2 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleLogEvent('ENTRY')}
              className="h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/25 cursor-pointer transition-all"
            >
              <LogIn className="w-5 h-5" />
              <span>LOG ENTRY</span>
            </button>

            <button
              type="button"
              onClick={() => handleLogEvent('EXIT')}
              className="h-14 rounded-2xl bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-black text-sm flex items-center justify-center space-x-2 shadow-lg shadow-slate-900/40 cursor-pointer transition-all"
            >
              <LogOut className="w-5 h-5 text-slate-300" />
              <span>LOG EXIT</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setVerifiedPass(null)}
            className="w-full py-2 text-center text-xs text-slate-400 hover:text-white font-bold cursor-pointer"
          >
            Clear / Scan Next Vehicle
          </button>
        </div>
      )}
    </div>
  );
}
