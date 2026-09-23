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
  ArrowRight,
  QrCode,
  Clock,
  PlusCircle,
  RefreshCw,
  X,
  Copy,
  Check,
  Calendar,
  Building,
  Phone,
  FileText,
  Users,
  AlertCircle
} from 'lucide-react';

export default function GuardScanner() {
  const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'search' | 'visitor' | 'logs'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchClassification, setSearchClassification] = useState('ALL'); // 'ALL' | 'STUDENT' | 'EMPLOYEE' | 'VISITOR'
  const [verifiedPass, setVerifiedPass] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [logSuccessMessage, setLogSuccessMessage] = useState('');
  const [logFilter, setLogFilter] = useState('ALL'); // 'ALL' | 'ENTRY' | 'EXIT'

  // Visitor Sub-tab state
  const [visitorSubTab, setVisitorSubTab] = useState('active'); // 'new' | 'active' | 'history'
  const [selectedVisitorModal, setSelectedVisitorModal] = useState(null);
  const [copiedPassId, setCopiedPassId] = useState(false);

  // New Visitor Form State
  const [visitorForm, setVisitorForm] = useState({
    name: '',
    contact: '',
    idPresented: "Driver's License",
    plateNumber: '',
    vehicleType: 'Motorcycle',
    destination: 'Administration Building',
    purpose: 'Official Business / Inquiry',
    validityDuration: '1' // '1' | '2' | '3' | '5' | '7'
  });

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Active and past visitors repository
  const [visitors, setVisitors] = useState([
    {
      id: 'TMP-2026-0042',
      name: 'Dr. Maria Santos',
      contact: '+63 917 888 1234',
      idPresented: 'PRC License #0129841',
      plateNumber: 'NBM 9012',
      vehicleType: 'Sedan (Silver Vios)',
      destination: 'Office of the President (Admin Bldg)',
      purpose: 'Guest Lecturer / Meeting',
      validDays: 1,
      validUntil: 'Today • 11:59 PM (1 Day)',
      entryTime: '09:30 AM Today',
      status: 'INSIDE', // 'INSIDE' | 'EXITED'
      exitTime: null,
      classification: 'VISITOR',
      qrData: 'RSU-VPASS:TMP-2026-0042:NBM9012:VISITOR'
    },
    {
      id: 'TMP-2026-0038',
      name: 'Engr. Carlos Mendoza (Delegate)',
      contact: '+63 919 555 4321',
      idPresented: "Driver's License #N02-18-99999",
      plateNumber: 'ABC 5678',
      vehicleType: 'SUV (White Fortuner)',
      destination: 'College of Engineering & Technology (CET)',
      purpose: 'Regional IT Conference Delegate',
      validDays: 3,
      validUntil: 'Sept 26, 2026 • 11:59 PM (3 Days)',
      entryTime: 'Yesterday • 08:15 AM',
      status: 'INSIDE',
      exitTime: null,
      classification: 'VISITOR',
      qrData: 'RSU-VPASS:TMP-2026-0038:ABC5678:VISITOR'
    },
    {
      id: 'TMP-2026-0029',
      name: 'LBC Express Courier (Delivery)',
      contact: '+63 920 111 2233',
      idPresented: 'Company ID #LBC-8891',
      plateNumber: 'XYZ 9921',
      vehicleType: 'Delivery Van',
      destination: 'Supply & Property Office',
      purpose: 'Parcel / Document Delivery',
      validDays: 1,
      validUntil: 'Expired (Yesterday)',
      entryTime: 'Yesterday • 02:10 PM',
      status: 'EXITED',
      exitTime: 'Yesterday • 02:45 PM',
      classification: 'VISITOR',
      qrData: 'RSU-VPASS:TMP-2026-0029:XYZ9921:VISITOR'
    }
  ]);

  // Initial demonstration gate logs
  const [logs, setLogs] = useState([
    {
      id: 1,
      passNumber: 'VP-2026-0001',
      plateNumber: 'XYZ 5678',
      owner: 'Prof. Juan Dela Cruz',
      classification: 'EMPLOYEE',
      type: 'ENTRY',
      time: '10:45 AM Today',
      status: 'VALID'
    },
    {
      id: 2,
      passNumber: 'TMP-2026-0042',
      plateNumber: 'NBM 9012',
      owner: 'Dr. Maria Santos (Visitor)',
      classification: 'VISITOR',
      type: 'ENTRY',
      time: '09:30 AM Today',
      status: 'VALID'
    },
    {
      id: 3,
      passNumber: 'VP-2026-0001',
      plateNumber: 'XYZ 5678',
      owner: 'Prof. Juan Dela Cruz',
      classification: 'EMPLOYEE',
      type: 'EXIT',
      time: '08:15 AM Today',
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

  // Camera stream controls
  const toggleCamera = async () => {
    if (cameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
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
  const handleScanPass = (passType = 'VALID_EMPLOYEE') => {
    if (passType === 'VALID_EMPLOYEE') {
      playBeep(true);
      triggerHaptic(true);
      setVerifiedPass({
        passNumber: 'VP-2026-0001',
        client: 'Prof. Juan Dela Cruz',
        schoolId: 'EMP-2026-0001',
        classification: 'EMPLOYEE',
        vehicle: 'Honda Click 125',
        plateNumber: 'XYZ 5678',
        vehicleType: 'Motorcycle',
        color: 'Black',
        validUntil: 'December 31, 2026',
        status: 'ACTIVE',
        isValid: true,
        department: 'College of Computing & Arts'
      });
    } else if (passType === 'VALID_STUDENT') {
      playBeep(true);
      triggerHaptic(true);
      setVerifiedPass({
        passNumber: 'VP-2026-0182',
        client: 'Chrizhel Anne Cuenco',
        schoolId: '2026-00182',
        classification: 'STUDENT',
        vehicle: 'Yamaha Fazzio',
        plateNumber: 'RSU 2026',
        vehicleType: 'Motorcycle',
        color: 'Cyan Blue',
        validUntil: 'December 31, 2026',
        status: 'ACTIVE',
        isValid: true,
        department: 'College of Computing & Multimedia'
      });
    } else if (passType === 'VISITOR_PASS') {
      playBeep(true);
      triggerHaptic(true);
      setVerifiedPass({
        passNumber: 'TMP-2026-0042',
        client: 'Dr. Maria Santos',
        schoolId: 'VISITOR (PRC #0129841)',
        classification: 'VISITOR',
        vehicle: 'Toyota Vios',
        plateNumber: 'NBM 9012',
        vehicleType: 'Sedan',
        color: 'Silver',
        validUntil: 'Today • 11:59 PM (1 Day)',
        status: 'INSIDE',
        isValid: true,
        department: 'Destination: Office of the President'
      });
    } else {
      playBeep(false);
      triggerHaptic(false);
      setVerifiedPass({
        passNumber: 'VP-2025-0819',
        client: 'Pedro Penduko',
        schoolId: '2023-99999',
        classification: 'STUDENT',
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

  // Manual vehicle / pass lookup
  const handleManualSearch = (query) => {
    const q = (query || searchQuery).trim().toLowerCase();
    if (!q) return;

    if (q.includes('nbm') || q.includes('santos') || q.includes('visitor') || q.includes('tmp')) {
      handleScanPass('VISITOR_PASS');
    } else if (q.includes('xyz') || q.includes('juan') || q.includes('emp')) {
      handleScanPass('VALID_EMPLOYEE');
    } else if (q.includes('rsu') || q.includes('cuenco')) {
      handleScanPass('VALID_STUDENT');
    } else {
      handleScanPass('EXPIRED');
    }
  };

  // Log ENTRY / EXIT event
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
      classification: verifiedPass.classification || 'EMPLOYEE',
      type,
      time: `${timeStr} Today`,
      status: verifiedPass.isValid ? 'VALID' : 'INVALID'
    };

    setLogs([newLog, ...logs]);

    // If it's a visitor, update their campus status
    if (verifiedPass.classification === 'VISITOR') {
      setVisitors(prev => prev.map(v => {
        if (v.plateNumber === verifiedPass.plateNumber || v.id === verifiedPass.passNumber) {
          return {
            ...v,
            status: type === 'ENTRY' ? 'INSIDE' : 'EXITED',
            exitTime: type === 'EXIT' ? `${timeStr} Today` : v.exitTime
          };
        }
        return v;
      }));
    }

    setLogSuccessMessage(`${type} recorded for ${verifiedPass.plateNumber} (${verifiedPass.client})!`);
    setTimeout(() => setLogSuccessMessage(''), 3500);
    setVerifiedPass(null);
  };

  // Issue New Visitor Pass
  const handleIssueVisitorPass = (e) => {
    e.preventDefault();
    if (!visitorForm.name.trim() || !visitorForm.plateNumber.trim()) {
      alert('Please enter visitor name and vehicle plate number.');
      return;
    }

    const passId = `TMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const days = parseInt(visitorForm.validityDuration, 10) || 1;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (days - 1));
    const expiryStr = days === 1 
      ? 'Today • 11:59 PM (1 Day)' 
      : `${expiryDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} (${days} Days)`;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedPlate = visitorForm.plateNumber.toUpperCase().trim();

    const newVisitor = {
      id: passId,
      name: visitorForm.name.trim(),
      contact: visitorForm.contact.trim() || 'N/A',
      idPresented: visitorForm.idPresented || "Valid Government ID",
      plateNumber: formattedPlate,
      vehicleType: visitorForm.vehicleType,
      destination: visitorForm.destination,
      purpose: visitorForm.purpose,
      validDays: days,
      validUntil: expiryStr,
      entryTime: `${timeStr} Today`,
      status: 'INSIDE',
      exitTime: null,
      classification: 'VISITOR',
      qrData: `RSU-VPASS:${passId}:${formattedPlate}:VISITOR`
    };

    setVisitors([newVisitor, ...visitors]);

    // Automatically log ENTRY in gate logs
    const newLog = {
      id: Date.now(),
      passNumber: passId,
      plateNumber: formattedPlate,
      owner: `${newVisitor.name} (Visitor)`,
      classification: 'VISITOR',
      type: 'ENTRY',
      time: `${timeStr} Today`,
      status: 'VALID'
    };
    setLogs([newLog, ...logs]);

    playBeep(true);
    triggerHaptic(true);

    // Open Digital Pass Card Modal for screenshotting
    setSelectedVisitorModal(newVisitor);

    setLogSuccessMessage(`Visitor Pass ${passId} issued & ENTRY logged for ${formattedPlate}!`);
    setTimeout(() => setLogSuccessMessage(''), 3500);

    // Reset Form
    setVisitorForm({
      name: '',
      contact: '',
      idPresented: "Driver's License",
      plateNumber: '',
      vehicleType: 'Motorcycle',
      destination: 'Administration Building',
      purpose: 'Official Business / Inquiry',
      validityDuration: '1'
    });

    setVisitorSubTab('active');
  };

  // Quick-Renew a past/expired visitor pass
  const handleStartRenewVisitor = (visitor) => {
    setVisitorForm({
      name: visitor.name,
      contact: visitor.contact !== 'N/A' ? visitor.contact : '',
      idPresented: visitor.idPresented,
      plateNumber: visitor.plateNumber,
      vehicleType: visitor.vehicleType,
      destination: visitor.destination,
      purpose: visitor.purpose,
      validityDuration: '1'
    });
    setVisitorSubTab('new');
  };

  // Quick 1-tap exit for active visitor
  const handleVisitorQuickExit = (visitorId) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let exitedVisitor = null;

    setVisitors(prev => prev.map(v => {
      if (v.id === visitorId) {
        exitedVisitor = v;
        return { ...v, status: 'EXITED', exitTime: `${timeStr} Today` };
      }
      return v;
    }));

    if (exitedVisitor) {
      const exitLog = {
        id: Date.now(),
        passNumber: exitedVisitor.id,
        plateNumber: exitedVisitor.plateNumber,
        owner: `${exitedVisitor.name} (Visitor)`,
        classification: 'VISITOR',
        type: 'EXIT',
        time: `${timeStr} Today`,
        status: 'VALID'
      };
      setLogs([exitLog, ...logs]);

      playBeep(true);
      triggerHaptic(true);
      setLogSuccessMessage(`EXIT logged for Visitor ${exitedVisitor.plateNumber} (${exitedVisitor.name})!`);
      setTimeout(() => setLogSuccessMessage(''), 3500);
    }
  };

  // Copy Pass text
  const handleCopyPass = (text) => {
    navigator.clipboard?.writeText(text);
    setCopiedPassId(true);
    setTimeout(() => setCopiedPassId(false), 2000);
  };

  // Metrics
  const totalEntries = logs.filter(l => l.type === 'ENTRY').length;
  const totalExits = logs.filter(l => l.type === 'EXIT').length;
  const activeVisitorsInside = visitors.filter(v => v.status === 'INSIDE');

  const filteredLogs = logs.filter(log => {
    if (logFilter === 'ALL') return true;
    return log.type === logFilter;
  });

  return (
    <div className="space-y-4 max-w-xl mx-auto pb-12">
      {/* Interactive Status Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-300">GATE SECURITY SCANNER</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[11px] text-emerald-400 font-mono">ONLINE</span>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center space-x-1 cursor-pointer"
          title={soundEnabled ? "Mute audio beep" : "Enable audio beep"}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          <span className="text-[10px] hidden sm:inline">{soundEnabled ? 'Audio ON' : 'Muted'}</span>
        </button>
      </div>

      {/* Mode Switcher Tabs (4 Primary Modes) */}
      <div className="grid grid-cols-4 gap-1 bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700 shadow-md">
        <button
          type="button"
          onClick={() => setActiveTab('scan')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center space-y-0.5 cursor-pointer ${
            activeTab === 'scan'
              ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-500'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span className="text-[11px]">QR Scan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('search')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center space-y-0.5 cursor-pointer ${
            activeTab === 'search'
              ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-500'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Search className="w-4 h-4" />
          <span className="text-[11px]">Search</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('visitor')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center space-y-0.5 relative cursor-pointer ${
            activeTab === 'visitor'
              ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-500'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[11px]">Visitor Pass</span>
          {activeVisitorsInside.length > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black text-[9px] rounded-full">
              {activeVisitorsInside.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center space-y-0.5 cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-500'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <History className="w-4 h-4" />
          <span className="text-[11px]">Logs ({logs.length})</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {logSuccessMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-100" />
            <span>{logSuccessMessage}</span>
          </div>
          <span className="text-[10px] bg-emerald-800 px-2.5 py-0.5 rounded-full font-semibold">SAVED</span>
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
                <div className="text-center p-6 space-y-2">
                  <Camera className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
                  <p className="text-xs text-slate-400 font-semibold">Camera is idle</p>
                  <p className="text-[11px] text-slate-500">Tap below to activate phone camera or use quick presets</p>
                </div>
              )}

              {/* Viewfinder Reticle Overlay */}
              <div className="absolute inset-8 border-2 border-emerald-400/70 rounded-2xl pointer-events-none flex items-center justify-center">
                <div className="w-full h-0.5 bg-emerald-400/40 animate-pulse"></div>
              </div>

              {cameraError && (
                <div className="absolute inset-0 bg-slate-900/90 p-4 flex flex-col items-center justify-center text-center">
                  <AlertTriangle className="w-8 h-8 text-amber-400 mb-2" />
                  <p className="text-xs text-slate-200">{cameraError}</p>
                </div>
              )}
            </div>

            {/* Camera Controls & Quick Preset Simulators */}
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

              <div className="flex flex-wrap gap-1.5 justify-center w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleScanPass('VALID_EMPLOYEE')}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Scan Employee</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleScanPass('VALID_STUDENT')}
                  className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                >
                  <span>Student Pass</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleScanPass('VISITOR_PASS')}
                  className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                >
                  <span>Visitor Pass</span>
                </button>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 text-center mt-3">
              Note: Students with visible gate stickers pass smoothly. Guards scan when verification is needed or suspicious.
            </p>
          </div>
        </div>
      )}

      {/* 2. MANUAL VEHICLE & PASS SEARCH */}
      {activeTab === 'search' && (
        <div className="bg-slate-800 rounded-3xl border border-slate-700 p-5 shadow-xl space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">Search License Plate, Name, or Pass #</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                placeholder="e.g. XYZ 5678, NBM 9012, or Juan"
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

          {/* Quick preset chips */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Preset Quick Tests:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => { setSearchQuery('XYZ 5678'); handleManualSearch('XYZ 5678'); }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 border border-slate-700 text-emerald-400 text-xs font-mono font-bold cursor-pointer"
              >
                XYZ 5678 (Employee)
              </button>
              <button
                type="button"
                onClick={() => { setSearchQuery('RSU 2026'); handleManualSearch('RSU 2026'); }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 border border-slate-700 text-teal-400 text-xs font-mono font-bold cursor-pointer"
              >
                RSU 2026 (Student)
              </button>
              <button
                type="button"
                onClick={() => { setSearchQuery('NBM 9012'); handleManualSearch('NBM 9012'); }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 border border-slate-700 text-amber-400 text-xs font-mono font-bold cursor-pointer"
              >
                NBM 9012 (Visitor)
              </button>
              <button
                type="button"
                onClick={() => { setSearchQuery('ABC 1234'); handleManualSearch('ABC 1234'); }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 border border-slate-700 text-rose-400 text-xs font-mono font-bold cursor-pointer"
              >
                ABC 1234 (Expired)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. VISITOR MANAGEMENT TAB */}
      {activeTab === 'visitor' && (
        <div className="bg-slate-800 rounded-3xl border border-slate-700 p-4 sm:p-5 shadow-xl space-y-4">
          {/* Sub-Tabs: Active Visitors vs Issue New Pass vs History */}
          <div className="flex space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setVisitorSubTab('active')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                visitorSubTab === 'active' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Inside Campus</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-[10px] text-amber-300 font-black">
                {activeVisitorsInside.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setVisitorSubTab('new')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                visitorSubTab === 'new' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Issue New Pass</span>
            </button>

            <button
              type="button"
              onClick={() => setVisitorSubTab('history')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                visitorSubTab === 'history' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Past & Renew</span>
            </button>
          </div>

          {/* Sub-view A: Active Visitors Currently Inside Campus */}
          {visitorSubTab === 'active' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Visitors with Active Gate Entry</span>
                <span className="text-[11px] text-emerald-400 font-semibold">{activeVisitorsInside.length} on campus</span>
              </div>

              {activeVisitorsInside.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-700/60 space-y-2">
                  <Users className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-300 font-bold">No Visitors Currently on Campus</p>
                  <p className="text-[11px] text-slate-500">Tap "Issue New Pass" to register an incoming visitor vehicle.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeVisitorsInside.map((v) => (
                    <div key={v.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-base font-black text-white">{v.plateNumber}</span>
                            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                              VISITOR
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-200 mt-0.5">{v.name}</h4>
                          <p className="text-[11px] text-slate-400">{v.vehicleType} • {v.contact}</p>
                        </div>

                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          INSIDE
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] space-y-1">
                        <div className="text-slate-300">Destination: <strong>{v.destination}</strong></div>
                        <div className="text-slate-400">Purpose: {v.purpose}</div>
                        <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800">
                          <span>Entered: <strong className="text-slate-200">{v.entryTime}</strong></span>
                          <span className="text-amber-300 font-medium">Valid: {v.validUntil}</span>
                        </div>
                      </div>

                      {/* Action buttons: Show QR & 1-Tap Log Exit */}
                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedVisitorModal(v)}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Show QR / Screenshot</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleVisitorQuickExit(v.id)}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md cursor-pointer transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-300" />
                          <span>LOG EXIT</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub-view B: Issue New Visitor Pass Form */}
          {visitorSubTab === 'new' && (
            <form onSubmit={handleIssueVisitorPass} className="space-y-3.5">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  No physical sticker required for visitors. The guard issues a digital temporary pass; the visitor captures a photo/screenshot on their phone.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Visitor Full Name *</label>
                  <input
                    type="text"
                    required
                    value={visitorForm.name}
                    onChange={(e) => setVisitorForm({ ...visitorForm, name: e.target.value })}
                    placeholder="e.g. Engr. Robert Tan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Number</label>
                  <input
                    type="text"
                    value={visitorForm.contact}
                    onChange={(e) => setVisitorForm({ ...visitorForm, contact: e.target.value })}
                    placeholder="+63 9XX XXX XXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Valid ID Presented *</label>
                  <input
                    type="text"
                    required
                    value={visitorForm.idPresented}
                    onChange={(e) => setVisitorForm({ ...visitorForm, idPresented: e.target.value })}
                    placeholder="e.g. Driver's License #N02-..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Vehicle Plate Number *</label>
                  <input
                    type="text"
                    required
                    value={visitorForm.plateNumber}
                    onChange={(e) => setVisitorForm({ ...visitorForm, plateNumber: e.target.value })}
                    placeholder="e.g. NBM 9012"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Vehicle Type</label>
                  <select
                    value={visitorForm.vehicleType}
                    onChange={(e) => setVisitorForm({ ...visitorForm, vehicleType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Sedan / Car">Sedan / Car</option>
                    <option value="SUV / AUV">SUV / AUV</option>
                    <option value="Van">Van</option>
                    <option value="Delivery Truck">Delivery Truck</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Pass Validity Duration *
                  </label>
                  <select
                    value={visitorForm.validityDuration}
                    onChange={(e) => setVisitorForm({ ...visitorForm, validityDuration: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/80 text-emerald-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="1">1 Day (Today Only - Standard)</option>
                    <option value="2">2 Days (Overnight Stay / Meeting)</option>
                    <option value="3">3 Days (Weekend / Conference)</option>
                    <option value="5">5 Days (School Event / Delegates)</option>
                    <option value="7">7 Days (1 Week - Contractor)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Destination Office / Venue</label>
                  <input
                    type="text"
                    value={visitorForm.destination}
                    onChange={(e) => setVisitorForm({ ...visitorForm, destination: e.target.value })}
                    placeholder="e.g. Administration Building, CET, or Gymnasium"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Purpose of Visit</label>
                  <input
                    type="text"
                    value={visitorForm.purpose}
                    onChange={(e) => setVisitorForm({ ...visitorForm, purpose: e.target.value })}
                    placeholder="e.g. Registrar Inquiry, Delivery, Event Delegate"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Issue Visitor Pass & Log Entry</span>
              </button>
            </form>
          )}

          {/* Sub-view C: Past / Expired Visitors with Quick Renewal */}
          {visitorSubTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Past & Expired Visitor Records</span>
                <span className="text-[11px] text-slate-500">Tap "Renew" for quick re-issuance</span>
              </div>

              <div className="space-y-2.5">
                {visitors.filter(v => v.status !== 'INSIDE').map((v) => (
                  <div key={v.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-white text-sm">{v.plateNumber}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({v.id})</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200">{v.name}</h4>
                      <p className="text-[11px] text-slate-400">{v.vehicleType} • {v.destination}</p>
                      <p className="text-[10px] text-rose-400 mt-0.5">Status: Departed ({v.exitTime || 'Exited'})</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStartRenewVisitor(v)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Renew Pass</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. GATE ENTRY / EXIT LOGS */}
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
                    <span className="font-bold text-white text-sm font-mono">{log.plateNumber}</span>
                    <span className="text-xs text-slate-300">• {log.owner}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono mt-0.5">
                    <span>{log.passNumber}</span>
                    <span>•</span>
                    <span>{log.time}</span>
                    {log.classification && (
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        log.classification === 'EMPLOYEE' ? 'bg-blue-900/60 text-blue-300' : 'bg-amber-900/60 text-amber-300'
                      }`}>
                        {log.classification}
                      </span>
                    )}
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider ${
                  log.type === 'ENTRY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {log.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VERIFIED PASS RESULT POPUP (Appears when Scanned or Searched) */}
      {verifiedPass && (
        <div className={`p-4 sm:p-5 rounded-3xl border-2 space-y-4 animate-in zoom-in-95 duration-200 shadow-2xl ${
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
              {verifiedPass.vehicle} ({verifiedPass.color || ''} {verifiedPass.vehicleType})
            </span>
          </div>

          {/* Driver & Details Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80">
              <span className="text-slate-400 text-[10px] font-bold uppercase block">Owner / Classification</span>
              <span className="font-bold text-white block mt-0.5">{verifiedPass.client}</span>
              <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                {verifiedPass.classification || 'STUDENT'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80">
              <span className="text-slate-400 text-[10px] font-bold uppercase block">Clearance Validity</span>
              <span className="font-bold text-white block mt-0.5">{verifiedPass.validUntil}</span>
              <span className="text-[11px] text-slate-400">{verifiedPass.department}</span>
            </div>
          </div>

          {/* Action Buttons according to classification */}
          {verifiedPass.classification === 'EMPLOYEE' || verifiedPass.classification === 'VISITOR' ? (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>{verifiedPass.classification === 'EMPLOYEE' ? 'University Employee Gate Presence' : 'Visitor Gate Clearance'}</span>
                <span className="text-emerald-400 font-semibold">Required Log</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleLogEvent('ENTRY')}
                  className="h-13 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/25 cursor-pointer transition-all"
                >
                  <LogIn className="w-5 h-5" />
                  <span>LOG ENTRY</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLogEvent('EXIT')}
                  className="h-13 rounded-2xl bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-slate-900/40 cursor-pointer transition-all"
                >
                  <LogOut className="w-5 h-5 text-slate-300" />
                  <span>LOG EXIT</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-center">
              <p className="text-xs text-emerald-400 font-semibold flex items-center justify-center space-x-1">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Student Clearance Verified • Access Cleared</span>
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Spot-check complete. No highway queue delay.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setVerifiedPass(null)}
            className="w-full py-2 text-center text-xs text-slate-400 hover:text-white font-bold cursor-pointer"
          >
            Clear / Scan Next Vehicle
          </button>
        </div>
      )}

      {/* DIGITAL VISITOR PASS CARD MODAL (Optimized for Visitor Phone Screenshot) */}
      {selectedVisitorModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl border-2 border-emerald-500 max-w-sm w-full p-5 shadow-2xl relative space-y-4 text-white">
            {/* Close Button */}
            <button
              onClick={() => setSelectedVisitorModal(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* University & Pass Header */}
            <div className="text-center border-b border-slate-800 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                Romblon State University • PASO
              </span>
              <h3 className="text-base font-black text-white mt-0.5">
                TEMPORARY VISITOR VEHICLE PASS
              </h3>
              <div className="mt-1 flex items-center justify-center space-x-2">
                <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {selectedVisitorModal.id}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                  ENTRY CLEARED
                </span>
              </div>
            </div>

            {/* Giant License Plate Display */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-700 text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Authorized Vehicle Plate</span>
              <span className="text-3xl font-black font-mono text-white tracking-widest block mt-0.5">
                {selectedVisitorModal.plateNumber}
              </span>
              <span className="text-xs text-slate-300 font-semibold mt-0.5 block">
                {selectedVisitorModal.vehicleType}
              </span>
            </div>

            {/* QR Code Frame */}
            <div className="p-4 bg-white rounded-2xl flex flex-col items-center justify-center shadow-md">
              <QrCode className="w-36 h-36 text-slate-900" />
              <span className="text-[9px] font-mono text-slate-600 mt-1 font-bold">
                {selectedVisitorModal.id}
              </span>
            </div>

            {/* Visitor Details */}
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Visitor:</span>
                <strong className="text-white">{selectedVisitorModal.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Destination:</span>
                <strong className="text-emerald-400">{selectedVisitorModal.destination}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Purpose:</span>
                <span className="text-slate-300">{selectedVisitorModal.purpose}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800 text-[11px]">
                <span className="text-slate-400">Pass Validity:</span>
                <strong className="text-amber-300">{selectedVisitorModal.validUntil}</strong>
              </div>
            </div>

            {/* Screenshot Callout Notice */}
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center text-[11px] text-amber-200">
              📸 <strong>Visitor:</strong> Please take a screenshot or photo of this screen. Present it to campus security when exiting or if requested by marshals.
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-2 pt-1">
              <button
                type="button"
                onClick={() => handleCopyPass(selectedVisitorModal.id)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center space-x-1 cursor-pointer"
              >
                {copiedPassId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPassId ? 'Copied!' : 'Copy Pass #'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedVisitorModal(null)}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white cursor-pointer shadow-md"
              >
                Done / Gate Open
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
