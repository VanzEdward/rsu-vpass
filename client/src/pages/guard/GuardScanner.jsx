import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { usePass } from '../../context/PassContext';
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
  AlertCircle,
  SwitchCamera,
  ArrowLeft,
  ZoomIn
} from 'lucide-react';

export default function GuardScanner() {
  const { 
    applications, 
    visitorPasses: visitors, 
    gateLogs: logs, 
    activeGate,
    addGateLog, 
    issueVisitorPass, 
    logVisitorExit, 
    renewVisitorPass,
    extendVisitorPass 
  } = usePass();

  const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'search' | 'visitor' | 'logs'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchClassification, setSearchClassification] = useState('ALL'); // 'ALL' | 'STUDENT' | 'EMPLOYEE' | 'VISITOR'
  const [verifiedPass, setVerifiedPass] = useState(null);
  const [isPhotoExpanded, setIsPhotoExpanded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [logSuccessMessage, setLogSuccessMessage] = useState('');
  const [logFilter, setLogFilter] = useState('ALL'); // 'ALL' | 'ENTRY' | 'EXIT'
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'
  const [scanSuccessFlash, setScanSuccessFlash] = useState(false);

  // Visitor Sub-tab state
  const [visitorSubTab, setVisitorSubTab] = useState('active'); // 'new' | 'active' | 'history'
  const [selectedVisitorModal, setSelectedVisitorModal] = useState(null);
  const [copiedPassId, setCopiedPassId] = useState(false);
  const [renewSearchQuery, setRenewSearchQuery] = useState('');

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
  const canvasRef = useRef(null);
  const scanLoopRef = useRef(null);
  const lastScanTimestampRef = useRef(0);
  const cooldownUntilRef = useRef(0);

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
  const startCamera = async (mode = facingMode) => {
    setCameraError('');
    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError('Camera API is not supported in this browser or requires a secure HTTPS/localhost connection.');
      return;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        // Fallback without strict constraints if exact resolution or facingMode fails
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play().catch((err) => console.warn('Video play warning:', err));
      }
      setCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      let msg = 'Camera access denied or unavailable.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera device found on this system.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = 'Camera is already in use by another app or browser tab.';
      }
      setCameraError(msg);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (scanLoopRef.current) {
      cancelAnimationFrame(scanLoopRef.current);
      scanLoopRef.current = null;
    }
    setCameraActive(false);
  };

  const toggleCamera = () => {
    if (cameraActive) {
      stopCamera();
    } else {
      startCamera(facingMode);
    }
  };

  const flipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (cameraActive) {
      startCamera(nextMode);
    }
  };

  // Ensure camera streams when video mounts or cameraActive changes
  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch((err) => console.warn('Video play warning:', err));
    }
  }, [cameraActive]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (scanLoopRef.current) {
        cancelAnimationFrame(scanLoopRef.current);
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
        schoolId: 'EMP-2026-0812',
        classification: 'EMPLOYEE',
        vehicle: 'Honda Click 125',
        plateNumber: 'XYZ 5678',
        vehicleType: 'Motorcycle',
        color: 'Black',
        validUntil: 'December 31, 2026',
        status: 'ACTIVE',
        isValid: true,
        department: 'College of Engineering & Technology (Faculty)',
        yearCourse: '',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
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
        department: 'College of Engineering and Technology',
        yearCourse: '4th Year • BS Information Technology',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80'
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
        department: 'Destination: Office of the President',
        yearCourse: '',
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
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
        department: 'Expired Pass Clearance',
        yearCourse: '3rd Year • BS Criminology',
        photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80'
      });
    }
  };

  // Manual vehicle / pass lookup
  const handleManualSearch = (query) => {
    const q = (query || searchQuery).trim().toLowerCase();
    if (!q) return;

    // 1. Search in registered applications (passes)
    const matchingApp = (applications || []).find(a => {
      const matchPlate = a.vehicle?.plateNumber?.toLowerCase().includes(q);
      const matchName = a.applicant_name?.toLowerCase().includes(q);
      const matchId = a.school_id?.toLowerCase().includes(q);
      const matchPass = a.pass?.passNumber?.toLowerCase().includes(q);
      return matchPlate || matchName || matchId || matchPass;
    });

    // 2. Search in temporary visitor passes
    const matchingVisitor = (visitors || []).find(v => {
      const matchPlate = v.plateNumber?.toLowerCase().includes(q);
      const matchName = v.name?.toLowerCase().includes(q);
      const matchId = v.id?.toLowerCase().includes(q);
      return matchPlate || matchName || matchId;
    });

    if (matchingApp && matchingApp.pass) {
      const isEmployee = (matchingApp.classification || '').toUpperCase() === 'EMPLOYEE';
      playBeep(true);
      triggerHaptic(true);
      setVerifiedPass({
        passNumber: matchingApp.pass.passNumber,
        client: matchingApp.applicant_name,
        schoolId: matchingApp.school_id,
        classification: isEmployee ? 'EMPLOYEE' : 'STUDENT',
        vehicle: `${matchingApp.vehicle.make} ${matchingApp.vehicle.model}`,
        plateNumber: matchingApp.vehicle.plateNumber,
        vehicleType: matchingApp.vehicle.type,
        color: matchingApp.vehicle.color,
        validUntil: matchingApp.pass.validUntil,
        status: matchingApp.pass.status,
        isValid: matchingApp.pass.status === 'ACTIVE',
        department: matchingApp.department || (isEmployee ? 'RSU University Personnel' : 'College of Engineering and Technology'),
        yearCourse: matchingApp.year_course || matchingApp.department || (isEmployee ? '' : 'BS Information Technology'),
        photo: matchingApp.applicant_photo || null
      });
      return;
    }

    if (matchingVisitor) {
      playBeep(true);
      triggerHaptic(true);
      setVerifiedPass({
        passNumber: matchingVisitor.id,
        client: matchingVisitor.name,
        schoolId: `VISITOR (${matchingVisitor.idPresented})`,
        classification: 'VISITOR',
        vehicle: matchingVisitor.vehicleType,
        plateNumber: matchingVisitor.plateNumber,
        vehicleType: matchingVisitor.vehicleType,
        color: 'N/A',
        validUntil: matchingVisitor.validUntil,
        status: matchingVisitor.status === 'INSIDE' ? 'INSIDE' : 'EXITED',
        isValid: true,
        department: `Destination: ${matchingVisitor.destination}`
      });
      return;
    }

    // Fallback demo matching
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

  // Process scanned QR payload (from Live Camera, Uploaded Photo, or QR Scanner)
  const handleScannedData = (rawText) => {
    if (!rawText) return;
    const text = String(rawText).trim();
    if (!text) return;

    // Trigger visual viewfinder glow
    setScanSuccessFlash(true);
    setTimeout(() => setScanSuccessFlash(false), 800);

    // Extract parts if formatted as RSU-VPASS:passNumber:plateNumber:schoolId
    let extractedPass = '';
    let extractedPlate = '';
    let extractedId = '';

    if (text.startsWith('RSU-VPASS:')) {
      const parts = text.split(':');
      extractedPass = (parts[1] || '').trim();
      extractedPlate = (parts[2] || '').trim().replace(/\s+/g, '');
      extractedId = (parts[3] || '').trim();
    } else {
      extractedPass = text;
    }

    const cleanInput = text.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanPass = extractedPass.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanPlate = extractedPlate.toLowerCase();

    // 1. Search in registered applications (issued passes)
    const matchApp = (applications || []).find((a) => {
      if (!a.pass) return false;
      const appPassNum = (a.pass.passNumber || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const appPlate = (a.vehicle?.plateNumber || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const appQr = (a.pass.qrData || '').toLowerCase();
      const appSchoolId = (a.school_id || '').toLowerCase().replace(/[^a-z0-9]/g, '');

      return (
        (cleanPass && appPassNum === cleanPass) ||
        (cleanPlate && appPlate === cleanPlate) ||
        (cleanInput && appPassNum === cleanInput) ||
        (cleanInput && appPlate === cleanInput) ||
        (cleanInput && appSchoolId && appSchoolId === cleanInput) ||
        (text && appQr === text.toLowerCase())
      );
    });

    if (matchApp && matchApp.pass) {
      playBeep(true);
      triggerHaptic(true);
      const isEmployee = (matchApp.classification || '').toUpperCase() === 'EMPLOYEE';
      setVerifiedPass({
        passNumber: matchApp.pass.passNumber,
        client: matchApp.applicant_name,
        schoolId: matchApp.school_id,
        classification: isEmployee ? 'EMPLOYEE' : 'STUDENT',
        vehicle: `${matchApp.vehicle?.make || ''} ${matchApp.vehicle?.model || ''}`.trim() || 'Vehicle',
        plateNumber: matchApp.vehicle?.plateNumber || 'N/A',
        vehicleType: matchApp.vehicle?.type || 'Vehicle',
        color: matchApp.vehicle?.color || 'N/A',
        validUntil: matchApp.pass.validUntil || 'Active Clearance',
        status: matchApp.pass.status || 'ACTIVE',
        isValid: matchApp.pass.status === 'ACTIVE',
        department: matchApp.department || (isEmployee ? 'RSU University Personnel' : 'College of Engineering and Technology'),
        yearCourse: matchApp.year_course || matchApp.department || (isEmployee ? '' : 'BS Information Technology'),
        photo: matchApp.applicant_photo || null
      });
      return;
    }

    // 2. Search in temporary visitor passes
    const matchVisitor = (visitors || []).find((v) => {
      const vId = (v.id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const vPlate = (v.plateNumber || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const vQr = (v.qrData || '').toLowerCase();

      return (
        (cleanPass && vId === cleanPass) ||
        (cleanPlate && vPlate === cleanPlate) ||
        (cleanInput && vId === cleanInput) ||
        (cleanInput && vPlate === cleanInput) ||
        (text && vQr === text.toLowerCase())
      );
    });

    if (matchVisitor) {
      playBeep(true);
      triggerHaptic(true);
      setVerifiedPass({
        passNumber: matchVisitor.id,
        client: matchVisitor.name,
        schoolId: `VISITOR (${matchVisitor.idPresented})`,
        classification: 'VISITOR',
        vehicle: matchVisitor.vehicleType,
        plateNumber: matchVisitor.plateNumber,
        vehicleType: matchVisitor.vehicleType,
        color: 'N/A',
        validUntil: matchVisitor.validUntil,
        status: matchVisitor.status === 'INSIDE' ? 'INSIDE' : 'EXITED',
        isValid: true,
        department: `Destination: ${matchVisitor.destination}`
      });
      return;
    }

    // Fallback search
    handleManualSearch(text);
  };

  // Live video frame QR scanner loop
  useEffect(() => {
    if (!cameraActive) {
      if (scanLoopRef.current) {
        cancelAnimationFrame(scanLoopRef.current);
        scanLoopRef.current = null;
      }
      return;
    }

    let isMounted = true;
    const hasBarcodeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;
    let barcodeDetector = null;
    if (hasBarcodeDetector) {
      try {
        barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
      } catch {
        barcodeDetector = null;
      }
    }

    const scanFrame = async (timestamp) => {
      if (!isMounted) return;

      const video = videoRef.current;
      const now = Date.now();

      // Check if video is loaded and ready
      if (
        video &&
        video.readyState >= 2 &&
        now > cooldownUntilRef.current &&
        timestamp - lastScanTimestampRef.current > 100
      ) {
        lastScanTimestampRef.current = timestamp;

        try {
          let detected = null;

          // 1. Hardware accelerated BarcodeDetector if available
          if (barcodeDetector) {
            try {
              const barcodes = await barcodeDetector.detect(video);
              if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                detected = barcodes[0].rawValue;
              }
            } catch {
              // fallback to jsQR
            }
          }

          // 2. Pure JS jsQR scanner
          if (!detected && video.videoWidth && video.videoHeight) {
            if (!canvasRef.current) {
              canvasRef.current = document.createElement('canvas');
            }
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });

            const maxDim = 640;
            let w = video.videoWidth;
            let h = video.videoHeight;
            if (w > maxDim || h > maxDim) {
              const ratio = Math.min(maxDim / w, maxDim / h);
              w = Math.round(w * ratio);
              h = Math.round(h * ratio);
            }

            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(video, 0, 0, w, h);

            const imgData = ctx.getImageData(0, 0, w, h);
            const qrCode = jsQR(imgData.data, imgData.width, imgData.height, {
              inversionAttempts: 'dontInvert',
            });

            if (qrCode && qrCode.data) {
              detected = qrCode.data;
            }
          }

          if (detected) {
            cooldownUntilRef.current = now + 2500;
            handleScannedData(detected);
          }
        } catch (err) {
          // ignore transient frame read errors
        }
      }

      if (isMounted && cameraActive) {
        scanLoopRef.current = requestAnimationFrame(scanFrame);
      }
    };

    scanLoopRef.current = requestAnimationFrame(scanFrame);

    return () => {
      isMounted = false;
      if (scanLoopRef.current) {
        cancelAnimationFrame(scanLoopRef.current);
        scanLoopRef.current = null;
      }
    };
  }, [cameraActive, applications, visitors]);

  // Log ENTRY / EXIT event
  const handleLogEvent = (type) => {
    if (!verifiedPass) return;
    triggerHaptic(true);
    playBeep(true);

    addGateLog({
      passNumber: verifiedPass.passNumber,
      plateNumber: verifiedPass.plateNumber,
      owner: verifiedPass.client,
      classification: verifiedPass.classification || 'EMPLOYEE',
      type,
      gate: activeGate || 'Gate 1',
      status: verifiedPass.isValid ? 'VALID' : 'INVALID'
    });

    if (verifiedPass.classification === 'VISITOR' && type === 'EXIT') {
      logVisitorExit(verifiedPass.passNumber || verifiedPass.plateNumber);
    }

    setLogSuccessMessage(`${type} recorded at ${activeGate || 'Gate 1'} for ${verifiedPass.plateNumber} (${verifiedPass.client})!`);
    setTimeout(() => setLogSuccessMessage(''), 3500);
    setVerifiedPass(null);
  };

  // Issue New Visitor Pass
  const handleIssueVisitorPass = (e) => {
    e.preventDefault();
    if (!visitorForm.name.trim() || !visitorForm.plateNumber.trim()) {
      setLogSuccessMessage('Please enter visitor name and vehicle plate number.');
      setTimeout(() => setLogSuccessMessage(''), 3500);
      return;
    }

    const newVisitor = issueVisitorPass(visitorForm);
    playBeep(true);
    triggerHaptic(true);

    // Open Digital Pass Card Modal for screenshotting
    setSelectedVisitorModal(newVisitor);

    setLogSuccessMessage(`Visitor Pass ${newVisitor.id} issued & ENTRY logged for ${newVisitor.plateNumber}!`);
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
      validityDuration: String(visitor.validDays || '1')
    });
    setVisitorSubTab('new');
  };

  // Handle pass renewal from the "Past & Renew" section
  const handleRenewVisitor = (visitor) => {
    if (visitor.status === 'INSIDE') {
      // Visitor extends their stay! Renew pass duration WITHOUT duplicate ENTRY log
      const updated = extendVisitorPass(visitor.id, 1);
      playBeep(true);
      triggerHaptic(true);
      setLogSuccessMessage(`Pass renewed (+1 Day) for ${visitor.plateNumber}! Stay extended (No duplicate ENTRY logged).`);
      setTimeout(() => setLogSuccessMessage(''), 4000);
      setSelectedVisitorModal(updated || {
        ...visitor,
        validDays: (visitor.validDays || 1) + 1,
        validUntil: 'Today • 11:59 PM (1 Day Extended)'
      });
    } else {
      // Departed visitor returning; pre-fill new pass issuance form
      handleStartRenewVisitor(visitor);
    }
  };

  // Extend stay directly when scanning visitor QR code with camera or from modal
  const handleExtendFromScanner = (pass) => {
    if (!pass) return;
    const targetId = pass.passNumber || pass.plateNumber || pass.id;
    const updated = extendVisitorPass(targetId, 1);
    playBeep(true);
    triggerHaptic(true);
    setLogSuccessMessage(`Stay extended (+1 Day) for ${pass.plateNumber}! Pass renewed.`);
    setTimeout(() => setLogSuccessMessage(''), 4000);

    const fullVisitor = visitors.find(v => v.id === targetId || v.plateNumber === pass.plateNumber);
    setVerifiedPass(null);
    setSelectedVisitorModal(updated || fullVisitor || {
      id: pass.passNumber || pass.id,
      plateNumber: pass.plateNumber,
      name: pass.client || pass.name,
      vehicleType: pass.vehicleType || 'Vehicle',
      destination: pass.department ? pass.department.replace('Destination: ', '') : (pass.destination || 'Administration Building'),
      purpose: pass.purpose || 'Official Business / Visit Extension',
      validUntil: 'Tomorrow • 11:59 PM (Extended)',
      status: 'INSIDE'
    });
  };

  // Quick 1-tap exit for active visitor
  const handleVisitorQuickExit = (visitorId) => {
    logVisitorExit(visitorId);
    playBeep(true);
    triggerHaptic(true);
    setLogSuccessMessage(`EXIT logged for Visitor Pass ${visitorId}!`);
    setTimeout(() => setLogSuccessMessage(''), 3500);
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

  // Check if plate matches any previously registered visitor for quick auto-fill
  const pastVisitorMatch = visitorForm.plateNumber.trim().length >= 3
    ? visitors.find(v => v.plateNumber.replace(/\s+/g, '').toUpperCase() === visitorForm.plateNumber.replace(/\s+/g, '').toUpperCase())
    : null;

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
            <div className={`aspect-square max-w-[280px] sm:max-w-xs mx-auto rounded-2xl bg-black flex flex-col items-center justify-center relative overflow-hidden border-2 shadow-inner transition-all duration-300 ${
              scanSuccessFlash 
                ? 'border-emerald-400 ring-4 ring-emerald-500/40 shadow-emerald-500/30' 
                : cameraActive
                ? 'border-emerald-500/60 shadow-emerald-950/40'
                : 'border-slate-700'
            }`}>
              {/* Video Element: Kept in DOM so videoRef is always attached immediately */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={cameraActive ? 'w-full h-full object-cover' : 'hidden'}
              />

              {/* Idle Placeholder when camera is inactive */}
              {!cameraActive && (
                <div className="text-center p-6 space-y-2">
                  <Camera className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
                  <p className="text-xs text-slate-400 font-semibold">Camera is idle</p>
                  <p className="text-[11px] text-slate-500">Tap below to activate phone camera or use quick presets</p>
                </div>
              )}

              {/* Target Framing Overlay with dynamic glow when camera is active */}
              <div className="absolute inset-8 pointer-events-none">
                <div className={`absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 rounded-tl-xl transition-colors duration-200 ${
                  cameraActive ? 'border-emerald-400 shadow-[0_0_8px_#34d399]' : 'border-slate-600'
                }`} />
                <div className={`absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 rounded-tr-xl transition-colors duration-200 ${
                  cameraActive ? 'border-emerald-400 shadow-[0_0_8px_#34d399]' : 'border-slate-600'
                }`} />
                <div className={`absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 rounded-bl-xl transition-colors duration-200 ${
                  cameraActive ? 'border-emerald-400 shadow-[0_0_8px_#34d399]' : 'border-slate-600'
                }`} />
                <div className={`absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 rounded-br-xl transition-colors duration-200 ${
                  cameraActive ? 'border-emerald-400 shadow-[0_0_8px_#34d399]' : 'border-slate-600'
                }`} />
              </div>

              {/* Active Scanner Laser Sweep Line */}
              {cameraActive && <div className="qr-laser-line" />}

              {/* Switch Camera Button (Front / Rear Camera) */}
              {cameraActive && (
                <button
                  type="button"
                  onClick={flipCamera}
                  title="Switch Camera (Front / Rear)"
                  className="absolute top-3 right-3 z-20 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 shadow-md transition-colors cursor-pointer"
                >
                  <SwitchCamera className="w-4 h-4 text-emerald-400" />
                </button>
              )}

              {/* Live Scanner Guide Pill */}
              {cameraActive && (
                <div className="absolute bottom-3 inset-x-0 flex justify-center z-20 pointer-events-none">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-950/85 backdrop-blur-xs text-[10px] font-bold text-emerald-300 border border-emerald-500/30 flex items-center space-x-1.5 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Position QR Code inside box</span>
                  </span>
                </div>
              )}

              {cameraError && (
                <div className="absolute inset-0 bg-slate-900/95 p-4 flex flex-col items-center justify-center text-center z-30">
                  <AlertTriangle className="w-8 h-8 text-amber-400 mb-2" />
                  <p className="text-xs text-slate-200 max-w-xs">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => setCameraError('')}
                    className="mt-3 px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs hover:text-white border border-slate-700 cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>

            {/* Camera Controls & Quick Preset Simulators */}
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={toggleCamera}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md ${
                  cameraActive 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                }`}
              >
                {cameraActive ? <VideoOff className="w-4 h-4 text-rose-400" /> : <Video className="w-4 h-4 text-emerald-100" />}
                <span>{cameraActive ? 'Stop Camera' : 'Use Phone Camera'}</span>
              </button>

              <div className="flex flex-wrap gap-1.5 justify-center w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleScanPass('VALID_EMPLOYEE')}
                  className="px-3 py-2 rounded-xl bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Scan Employee</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleScanPass('VALID_STUDENT')}
                  className="px-3 py-2 rounded-xl bg-teal-600/80 hover:bg-teal-500 text-white font-bold text-[11px] flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <span>Student Pass</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleScanPass('VISITOR_PASS')}
                  className="px-3 py-2 rounded-xl bg-amber-600/80 hover:bg-amber-500 text-white font-bold text-[11px] flex items-center space-x-1 cursor-pointer transition-colors"
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
          <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-700">
            <button
              type="button"
              onClick={() => setVisitorSubTab('active')}
              className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer text-center ${
                visitorSubTab === 'active' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="whitespace-nowrap">Inside</span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-950 text-[10px] text-amber-300 font-black leading-none shrink-0">
                {activeVisitorsInside.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setVisitorSubTab('new')}
              className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer text-center ${
                visitorSubTab === 'new' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">Issue Pass</span>
            </button>

            <button
              type="button"
              onClick={() => setVisitorSubTab('history')}
              className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer text-center ${
                visitorSubTab === 'history' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">Past & Renew</span>
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
                  {pastVisitorMatch && pastVisitorMatch.name !== visitorForm.name && (
                    <div className="mt-1.5 p-2 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-between text-[11px] text-blue-200">
                      <span className="truncate">
                        Past visitor: <strong>{pastVisitorMatch.name}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStartRenewVisitor(pastVisitorMatch)}
                        className="ml-2 px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] cursor-pointer shrink-0 transition-colors"
                      >
                        Auto-fill
                      </button>
                    </div>
                  )}
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
                <span className="text-[11px] text-slate-500">Tap "Renew Pass" to extend or re-issue</span>
              </div>

              {/* Quick Search in Past & Renew */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={renewSearchQuery}
                  onChange={(e) => setRenewSearchQuery(e.target.value)}
                  placeholder="Search plate, visitor name, or pass # to renew..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-2.5">
                {visitors
                  .filter((v) => {
                    const isDeparted = v.status !== 'INSIDE';
                    const isExpired = v.validUntil && (v.validUntil.toLowerCase().includes('expired') || v.validUntil.includes('Sept 26'));

                    if (renewSearchQuery.trim()) {
                      const q = renewSearchQuery.trim().toLowerCase();
                      return (
                        (v.plateNumber || '').toLowerCase().includes(q) ||
                        (v.name || '').toLowerCase().includes(q) ||
                        (v.id || '').toLowerCase().includes(q)
                      );
                    }
                    return true;
                  })
                  .map((v) => {
                    const isInside = v.status === 'INSIDE';
                    return (
                      <div key={v.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-base font-black text-white whitespace-nowrap tracking-wide">
                                {v.plateNumber}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                                ({v.id})
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-200 mt-1 truncate">{v.name}</h4>
                            <p className="text-[11px] text-slate-400 truncate">{v.vehicleType} • {v.destination}</p>
                          </div>

                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 uppercase tracking-wider ${
                            isInside 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {isInside ? 'INSIDE' : 'DEPARTED'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 gap-2">
                          <span className={`text-[11px] truncate ${isInside ? 'text-amber-300 font-medium' : 'text-slate-400'}`}>
                            {isInside ? `Valid: ${v.validUntil}` : `Status: Departed (${v.exitTime || 'Exited'})`}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleRenewVisitor(v)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer transition-all active:scale-95 shrink-0"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>{isInside ? 'Extend Pass' : 'Renew Pass'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
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

      {/* VERIFIED PASS RESULT INSTANT MODAL (Appears directly over screen on Scan / Search - No Scrolling Needed) */}
      {verifiedPass && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className={`max-w-md w-full rounded-3xl border-2 p-5 sm:p-6 shadow-2xl relative space-y-4 my-auto animate-in zoom-in-95 duration-200 text-white ${
            verifiedPass.isValid 
              ? 'bg-slate-900 border-emerald-500 shadow-emerald-950/50 ring-4 ring-emerald-500/20' 
              : 'bg-slate-900 border-rose-500 shadow-rose-950/50 ring-4 ring-rose-500/20'
          }`}>
            {/* Top Status Banner with Dismiss Button */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                {verifiedPass.isValid ? (
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                    <XCircle className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <span className={`text-xs sm:text-sm font-black tracking-tight block ${
                    verifiedPass.isValid ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {verifiedPass.isValid ? 'VALID PASS • ACCESS GRANTED' : 'ACCESS DENIED • EXPIRED / INVALID'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{verifiedPass.passNumber}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black tracking-wider ${
                  verifiedPass.isValid ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                }`}>
                  {verifiedPass.status}
                </span>
                <button
                  type="button"
                  onClick={() => setVerifiedPass(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Close and scan next"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Driver Identity Card: Registration Selfie Photo + Academic/Unit Info */}
            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center gap-3.5">
              {/* Actual Selfie Photo Captured in Registration (Clickable to Expand) */}
              <button
                type="button"
                onClick={() => verifiedPass.photo && setIsPhotoExpanded(true)}
                title={verifiedPass.photo ? "Tap to expand and zoom photo" : "No photo available"}
                className={`w-20 h-24 sm:w-22 sm:h-26 rounded-xl overflow-hidden bg-slate-800 border-2 shrink-0 flex items-center justify-center relative group transition-all ${
                  verifiedPass.photo 
                    ? 'cursor-pointer hover:border-emerald-400 hover:ring-2 hover:ring-emerald-400/40 border-slate-700 active:scale-95' 
                    : 'border-slate-700 cursor-default'
                }`}
              >
                {verifiedPass.photo ? (
                  <>
                    <img
                      src={verifiedPass.photo}
                      alt={verifiedPass.client}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <ZoomIn className="w-5 h-5 text-emerald-300 drop-shadow-md" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500 p-2 text-center">
                    <User className="w-8 h-8 text-slate-400 mb-1" />
                    <span className="text-[9px] font-semibold text-slate-400">No Photo</span>
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-slate-950/85 text-[8px] font-bold text-center py-0.5 text-slate-300 tracking-wider flex items-center justify-center space-x-1">
                  <span>DRIVER SELFIE</span>
                  {verifiedPass.photo && <ZoomIn className="w-2.5 h-2.5 text-emerald-400" />}
                </div>
              </button>

              {/* Driver Details */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    verifiedPass.classification === 'EMPLOYEE'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : verifiedPass.classification === 'VISITOR'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {verifiedPass.classification === 'EMPLOYEE'
                      ? 'RSU Employee'
                      : verifiedPass.classification === 'VISITOR'
                      ? 'Temporary Visitor'
                      : 'RSU Student'}
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-black text-white leading-tight truncate">
                  {verifiedPass.client}
                </h4>

                <div className="text-[11px] font-mono text-emerald-400 font-semibold truncate">
                  {verifiedPass.classification === 'EMPLOYEE' ? 'Employee ID: ' : verifiedPass.classification === 'VISITOR' ? 'Visitor ID: ' : 'Student ID: '}
                  <span className="text-white">{verifiedPass.schoolId}</span>
                </div>

                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                  {verifiedPass.classification === 'STUDENT'
                    ? (verifiedPass.yearCourse || verifiedPass.department || 'College Student')
                    : (verifiedPass.department || 'University Personnel')}
                </p>
              </div>
            </div>

            {/* Giant Registered License Plate Callout */}
            <div className="bg-slate-950 rounded-2xl p-3.5 border border-slate-800 text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                Registered License Plate
              </span>
              <span className="text-3xl font-black text-white font-mono tracking-wider block mt-0.5">
                {verifiedPass.plateNumber}
              </span>
              <span className="text-xs text-emerald-400 font-semibold mt-0.5 block truncate">
                {verifiedPass.vehicle} {verifiedPass.color && verifiedPass.color !== 'N/A' ? `• ${verifiedPass.color}` : ''} ({verifiedPass.vehicleType})
              </span>
            </div>

            {/* Pass Validity Record */}
            <div className="flex items-center justify-between text-[11px] px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400">
              <span>Pass Clearance:</span>
              <span className="font-bold text-slate-200">{verifiedPass.validUntil}</span>
            </div>

            {/* Action Buttons: Visitor vs Employee vs Student */}
            {verifiedPass.classification === 'VISITOR' ? (
              <div className="space-y-2.5 pt-1">
                {verifiedPass.status !== 'EXITED' ? (
                  <>
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1">
                      <div className="flex items-center justify-center space-x-1.5 text-amber-400 font-bold text-xs">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Visitor Campus Clearance</span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Choose action: extend stay validity or confirm vehicle gate departure.
                      </p>
                    </div>

                    {/* Dual Action Buttons: Extend Stay (+1 Day) & Log Exit */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleExtendFromScanner(verifiedPass)}
                        className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-600/25 cursor-pointer transition-all"
                      >
                        <RefreshCw className="w-4 h-4 shrink-0" />
                        <span>Extend (+1 Day)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLogEvent('EXIT')}
                        className="h-12 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center space-x-1.5 shadow-lg shadow-amber-500/25 cursor-pointer transition-all"
                      >
                        <LogOut className="w-4 h-4 text-slate-950 shrink-0" />
                        <span>LOG EXIT</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setVerifiedPass(null)}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-colors cursor-pointer mt-1"
                    >
                      Scan Next Vehicle
                    </button>
                  </>
                ) : (
                  <>
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
                      <p className="text-xs text-rose-400 font-bold">Visitor Already Logged Departed</p>
                      <p className="text-[10px] text-slate-400">
                        This visitor pass has completed its campus clearance and exited.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVerifiedPass(null)}
                      className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
                    >
                      Scan Next Vehicle
                    </button>
                  </>
                )}
              </div>
            ) : verifiedPass.classification === 'EMPLOYEE' ? (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>Employee Gate Presence Record</span>
                  <span className="text-emerald-400 font-semibold">Required Log</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleLogEvent('ENTRY')}
                    className="h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/25 cursor-pointer transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>LOG ENTRY</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLogEvent('EXIT')}
                    className="h-12 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-slate-900/40 cursor-pointer transition-all"
                  >
                    <LogOut className="w-4 h-4 text-slate-300" />
                    <span>LOG EXIT</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setVerifiedPass(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-colors cursor-pointer mt-1"
                >
                  Scan Next Vehicle
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 pt-1">
                {/* Student: NO Log Entry / Log Exit. Direct Clearance Confirmation & Giant Scan Next Button */}
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                  <p className="text-xs text-emerald-400 font-bold flex items-center justify-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Student Clearance Verified • Gate Cleared</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Gate sticker verified. No highway queue logging delay for students.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => { setVerifiedPass(null); setIsPhotoExpanded(false); }}
                  className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/30 cursor-pointer transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Scan Next Vehicle</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EXPANDED DRIVER SELFIE FULL LIGHTBOX MODAL */}
      {isPhotoExpanded && verifiedPass?.photo && (
        <div 
          onClick={() => setIsPhotoExpanded(false)}
          className="fixed inset-0 z-60 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
        >

          {/* High-Resolution Expanded Photo Card */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl overflow-hidden bg-slate-900 border-2 border-emerald-500 shadow-2xl shadow-emerald-950/60 relative animate-in zoom-in-95 duration-200 flex flex-col"
          >
            <div className="aspect-3/4 max-h-[58vh] w-full bg-black flex items-center justify-center overflow-hidden relative">
              <img
                src={verifiedPass.photo}
                alt={verifiedPass.client}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Driver identification footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                  verifiedPass.classification === 'EMPLOYEE'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : verifiedPass.classification === 'VISITOR'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {verifiedPass.classification === 'EMPLOYEE'
                    ? 'RSU Employee'
                    : verifiedPass.classification === 'VISITOR'
                    ? 'Temporary Visitor'
                    : 'RSU Student'}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {verifiedPass.schoolId}
                </span>
              </div>

              <h3 className="text-base font-black text-white truncate">
                {verifiedPass.client}
              </h3>

              <p className="text-xs text-slate-400 truncate">
                {verifiedPass.classification === 'STUDENT'
                  ? (verifiedPass.yearCourse || verifiedPass.department)
                  : verifiedPass.department}
              </p>

              {/* Bottom Return Button */}
              <button
                type="button"
                onClick={() => setIsPhotoExpanded(false)}
                className="w-full mt-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 font-bold text-xs flex items-center justify-center space-x-1.5 border border-slate-700 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Verification Card</span>
              </button>
            </div>
          </div>
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
            <div className="space-y-2 pt-1">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleCopyPass(selectedVisitorModal.id)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center space-x-1 cursor-pointer border border-slate-700"
                >
                  {copiedPassId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPassId ? 'Copied!' : 'Copy Pass #'}</span>
                </button>

                {selectedVisitorModal.status === 'INSIDE' && (
                  <button
                    type="button"
                    onClick={() => handleExtendFromScanner(selectedVisitorModal)}
                    className="py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
                    title="Prolong pass duration by +1 Day"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>+1 Day Stay</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedVisitorModal(null)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white cursor-pointer shadow-md"
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
