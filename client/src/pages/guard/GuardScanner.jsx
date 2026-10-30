import React, { useState, useRef, useEffect } from "react";
import jsQR from "jsqr";
import QRCode from "qrcode";
import { usePass, isPassExpired } from "../../context/PassContext";
import { apiRequest } from "../../api/client";
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
  Volume2,
  VolumeX,
  User,
  QrCode,
  PlusCircle,
  RefreshCw,
  X,
  Copy,
  Check,
  Users,
  SwitchCamera,
  ZoomIn,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ArrowRight,
  Zap,
  ZapOff,
} from "lucide-react";

export const PHILIPPINE_VALID_IDS = [
  "Driver's License (LTO)",
  "Philippine National ID (PhilID / ePhilID)",
  "Philippine Passport (DFA)",
  "UMID (Unified Multi-Purpose ID)",
  "SSS ID (Social Security System)",
  "GSIS eCard",
  "PRC ID (Professional Regulation Commission)",
  "Postal ID (PHLPost)",
  "Voter's ID / Certification (COMELEC)",
  "TIN Card (BIR)",
  "PhilHealth ID",
  "Senior Citizen ID",
  "PWD ID (Persons with Disability)",
  "Barangay ID / Clearance",
  "Company / Employee ID",
  "Student ID / School ID",
  "Other (Please specify)",
];

export const VEHICLE_TYPE_CHOICES = [
  "Motorcycle",
  "Sedan / Hatchback",
  "SUV / AUV",
  "Pickup Truck",
  "Van",
  "Tricycle",
  "Electric Vehicle (E-Bike / E-Trike)",
  "Delivery Truck / Utility Vehicle",
  "Other Vehicle",
];

export const PASS_DURATION_CHOICES = [
  { value: "1", label: "1 Day (Today Until 11:59 PM)" },
  { value: "2", label: "2 Days (Multi-Day Business)" },
  { value: "3", label: "3 Days (Conference / Event)" },
  { value: "7", label: "7 Days (Official Contractor)" },
];

/**
 * Custom dropdown component for Guard Portal to replace native OS select dialogs
 * with a responsive dark-themed floating card matching the application UI.
 */
function GuardCustomDropdown({
  label,
  required,
  value,
  onChange,
  options,
  placeholder = "Select option...",
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) =>
    typeof opt === "object" ? opt.value === value : opt === value
  );
  const hasSelected = Boolean(selectedOption && value);
  const displayLabel = hasSelected
    ? typeof selectedOption === "object"
      ? selectedOption.label
      : selectedOption
    : placeholder;

  return (
    <div className={`relative ${isOpen ? "z-30" : "z-10"}`} ref={dropdownRef}>
      {label && (
        <label className="block text-slate-300 font-bold mb-1">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-left flex items-center justify-between transition-all cursor-pointer bg-slate-950 ${
          isOpen
            ? "border-emerald-500 ring-2 ring-emerald-500/30 text-white"
            : "border-slate-800 text-slate-200 hover:border-slate-700"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span
          className={`truncate pr-2 ${
            hasSelected ? "font-bold text-white" : "font-normal text-slate-500"
          }`}
        >
          {displayLabel}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-emerald-400" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl py-1 max-h-56 overflow-y-auto divide-y divide-slate-800/50 animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt) => {
            const optVal = typeof opt === "object" ? opt.value : opt;
            const optLabel = typeof opt === "object" ? opt.label : opt;
            const isSelected = optVal === value;

            return (
              <button
                key={optVal}
                type="button"
                onClick={() => {
                  onChange(optVal);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "bg-emerald-500/15 text-emerald-300 font-bold border-l-2 border-emerald-500"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium"
                }`}
              >
                <span className="truncate pr-2">{optLabel}</span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function GuardScanner() {
  const {
    applications,
    visitorPasses: visitors,
    gateLogs: logs,
    activeGate,
    addGateLog,
    issueVisitorPass,
    logVisitorExit,
    extendVisitorPass,
  } = usePass();

  // Navigation Hub: 'scan' (Scanner + Quick Search) | 'visitor' (Visitor Desk) | 'logs' (Gate History)
  const [activeTab, setActiveTab] = useState("scan");

  // Quick Search state (integrated into main scanner)
  const [quickSearchQuery, setQuickSearchQuery] = useState("");

  // Verification Modal State
  const [verifiedPass, setVerifiedPass] = useState(null);
  const [isPhotoExpanded, setIsPhotoExpanded] = useState(false);
  const [invalidScanAlert, setInvalidScanAlert] = useState(null);

  // Scanner Engine & Audio State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [logSuccessMessage, setLogSuccessMessage] = useState("");
  const [logFilter, setLogFilter] = useState("ALL"); // 'ALL' | 'ENTRY' | 'EXIT'
  const [facingMode, setFacingMode] = useState("environment"); // 'environment' | 'user'
  const [scanSuccessFlash, setScanSuccessFlash] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);

  // Simulator drawer toggle (keeps main screen 100% clean for guards)
  const [showDemoSimulator, setShowDemoSimulator] = useState(false);

  // Visitor Hub State
  const [visitorSubTab, setVisitorSubTab] = useState("active"); // 'active' | 'new' | 'past'
  const [selectedVisitorModal, setSelectedVisitorModal] = useState(null);
  const [visitorQrUrl, setVisitorQrUrl] = useState("");
  const [copiedPassId, setCopiedPassId] = useState(false);
  const [visitorSearchQuery, setVisitorSearchQuery] = useState("");

  // Generate real scannable QR Code for temporary visitor digital card
  useEffect(() => {
    if (selectedVisitorModal) {
      const payload =
        selectedVisitorModal.qrData ||
        `RSU-VPASS:${selectedVisitorModal.id}:${(selectedVisitorModal.plateNumber || "").replace(/\s+/g, "")}:VISITOR`;
      QRCode.toDataURL(payload, {
        width: 320,
        margin: 1,
        color: { dark: "#0f172a", light: "#ffffff" },
      })
        .then((url) => setVisitorQrUrl(url))
        .catch(() => setVisitorQrUrl(""));
    } else {
      setVisitorQrUrl("");
    }
  }, [selectedVisitorModal]);

  // New Visitor Form State (Empty defaults with Philippine ID choices)
  const [visitorForm, setVisitorForm] = useState({
    name: "",
    contact: "",
    idPresented: "Driver's License (LTO)",
    otherId: "",
    plateNumber: "",
    vehicleType: "",
    destination: "",
    purpose: "",
    validityDuration: "1",
  });
  const [visitorFormError, setVisitorFormError] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const scanLoopRef = useRef(null);
  const lastScanTimestampRef = useRef(0);
  const cooldownUntilRef = useRef(0);

  // Audio feedback beep
  const playBeep = (isSuccess = true) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isSuccess) {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(
          1760,
          ctx.currentTime + 0.12,
        );
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.12);
      } else {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(180, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // Audio context fallback
    }
  };

  // Vibration feedback
  const triggerHaptic = (isSuccess = true) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      if (isSuccess) {
        navigator.vibrate([40, 30, 40]);
      } else {
        navigator.vibrate([150, 80, 150]);
      }
    }
  };

  // Camera Management
  const startCamera = async (mode = facingMode) => {
    setCameraError("");
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      await new Promise((resolve) => setTimeout(resolve, 80));

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported by your browser.");
      }

      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (err1) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: mode } },
            audio: false,
          });
        } catch (err2) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }

      streamRef.current = stream;
      try {
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          const capabilities = videoTrack.getCapabilities ? videoTrack.getCapabilities() : {};
          setHasTorch(Boolean(capabilities && capabilities.torch));
        }
      } catch {
        setHasTorch(false);
      }
      setIsTorchOn(false);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
      setFacingMode(mode);
    } catch (err) {
      setCameraActive(false);
    setIsTorchOn(false);
    setHasTorch(false);
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      const nextTorch = !isTorchOn;
      await track.applyConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setIsTorchOn(nextTorch);
    } catch (err) {
      console.warn("Torch toggle error:", err);
    }
      if (err.name === "NotAllowedError") {
        setCameraError(
          "Camera access denied. Please grant permission in your browser.",
        );
      } else if (err.name === "NotFoundError") {
        setCameraError("No camera found on this device.");
      } else {
        setCameraError(
          `Camera error: ${err.message || "Unable to start camera"}`,
        );
      }
    }
  };

  const stopCamera = () => {
    if (scanLoopRef.current) {
      cancelAnimationFrame(scanLoopRef.current);
      scanLoopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setIsTorchOn(false);
    setHasTorch(false);
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      const nextTorch = !isTorchOn;
      await track.applyConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setIsTorchOn(nextTorch);
    } catch (err) {
      console.warn("Torch toggle error:", err);
    }
  };

  const toggleCamera = () => {
    if (cameraActive) {
      stopCamera();
    } else {
      startCamera(facingMode);
    }
  };

  const flipCamera = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    startCamera(nextMode);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Simulator / Demo presets handler
  const handleSimulatePass = (passType) => {
    if (passType === "VALID_EMPLOYEE") {
      triggerHaptic(true);
      setVerifiedPass({
        passNumber: "E-081",
        client: "Prof. Juan Dela Cruz",
        schoolId: "2019-00124",
        classification: "EMPLOYEE",
        vehicle: "Honda Click 125i",
        plateNumber: "XYZ 5678",
        vehicleType: "Motorcycle",
        color: "Matte Black",
        validUntil: "June 30, 2026",
        status: "ACTIVE",
        isValid: true,
        department: "College of Engineering & Technology (Faculty)",
        yearCourse: "",
        photo:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      });
    } else if (passType === "VALID_STUDENT") {
      triggerHaptic(true);
      setVerifiedPass({
        passNumber: "S-396",
        client: "Althea Marie Cuenco",
        schoolId: "2023-10492",
        classification: "STUDENT",
        vehicle: "Yamaha Aerox 155",
        plateNumber: "RSU 2026",
        vehicleType: "Motorcycle",
        color: "Racing Blue",
        validUntil: "July 15, 2026",
        status: "ACTIVE",
        isValid: true,
        department: "College of Engineering and Technology",
        yearCourse: "4th Year • BS Information Technology",
        photo:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
      });
    } else if (passType === "VISITOR_PASS") {
      triggerHaptic(true);
      setVerifiedPass({
        passNumber: "TMP-2026-0042",
        client: "Dr. Maria Santos",
        schoolId: "VISITOR (PRC #0129841)",
        classification: "VISITOR",
        vehicle: "Toyota Vios",
        plateNumber: "NBM 9012",
        vehicleType: "Sedan",
        color: "Silver",
        validUntil: "Today • 11:59 PM (1 Day)",
        status: "INSIDE",
        isValid: true,
        department: "Destination: Office of the President",
        yearCourse: "",
        photo:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      });
    } else if (passType === "TROLL_QR") {
      playBeep(false);
      triggerHaptic(false);
      setVerifiedPass(null);
      setInvalidScanAlert({
        rawText: "https://www.youtube.com/watch?v=dQw4w9WgXcQ (Rickroll Meme Video)",
        reason: "External Media / Meme QR Detected (Troll Code)",
        details: "The scanned QR code links to an external image, video, or social media page instead of a verified campus vehicle pass.",
        isTroll: true,
        isUrl: true,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    } else {
      playBeep(false);
      triggerHaptic(false);
      setVerifiedPass({
        passNumber: "VP-2025-0819",
        client: "Pedro Penduko",
        schoolId: "2023-99999",
        classification: "STUDENT",
        vehicle: "Yamaha Mio",
        plateNumber: "ABC 1234",
        vehicleType: "Motorcycle",
        color: "Red",
        validUntil: "August 15, 2025",
        status: "EXPIRED",
        isValid: false,
        department: "Expired Pass Clearance",
        yearCourse: "3rd Year • BS Criminology",
        photo:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
      });
    }
  };

  // Manual search lookup (Unified under Scanner)
  const handleManualSearch = async (query) => {
    const q = (query || quickSearchQuery).trim().toLowerCase();
    if (!q) return;

    const qNoSpace = q.replace(/\s+/g, "");

    // Search in registered student/employee passes
    const matchingApp = (applications || []).find((a) => {
      const plate = (a.vehicle?.plateNumber || "").toLowerCase();
      const plateNoSpace = plate.replace(/\s+/g, "");
      const matchPlate = plate.includes(q) || (qNoSpace && plateNoSpace.includes(qNoSpace));
      const matchName = (a.applicant_name || "").toLowerCase().includes(q);
      const matchId = (a.school_id || "").toLowerCase().includes(q);
      const passNum = (a.pass?.passNumber || "").toLowerCase();
      const passNumNoSpace = passNum.replace(/[^a-z0-9]/g, "");
      const matchPass = passNum.includes(q) || (qNoSpace && passNumNoSpace.includes(qNoSpace));
      return matchPlate || matchName || matchId || matchPass;
    });

    if (matchingApp && matchingApp.pass) {
      const isExpired = matchingApp.pass.status === "EXPIRED" || matchingApp.pass.status === "REVOKED" || isPassExpired(matchingApp.pass);
      if (isExpired) {
        playBeep(false);
        triggerHaptic(false);
      } else {
        triggerHaptic(true);
      }
      const isStudent = (matchingApp.classification || "").toLowerCase().includes("student");
      const isEmployee = !isStudent;
      setVerifiedPass({
        passNumber: matchingApp.pass.passNumber,
        client: matchingApp.applicant_name,
        schoolId: matchingApp.school_id,
        classification: isStudent ? "STUDENT" : "EMPLOYEE",
        vehicle: `${matchingApp.vehicle?.make || ''} ${matchingApp.vehicle?.model || ''}`.trim() || 'Registered Vehicle',
        plateNumber: matchingApp.vehicle?.plateNumber || matchingApp.plate_number || 'N/A',
        vehicleType: matchingApp.vehicle?.type || matchingApp.vehicle_type || 'Vehicle',
        color: matchingApp.vehicle?.color || 'N/A',
        validUntil: matchingApp.pass.validUntil,
        status: isExpired ? "EXPIRED" : matchingApp.pass.status,
        isValid: !isExpired && matchingApp.pass.status === "ACTIVE",
        department:
          matchingApp.department ||
          (isEmployee
            ? "RSU University Personnel"
            : "College of Engineering and Technology"),
        yearCourse:
          matchingApp.year_course ||
          matchingApp.department ||
          (isEmployee ? "" : "BS Information Technology"),
        photo: matchingApp.applicant_photo || null,
      });
      return;
    }

    // Search in temporary visitor passes
    const matchingVisitor = (visitors || []).find((v) => {
      const plate = (v.plateNumber || "").toLowerCase();
      const plateNoSpace = plate.replace(/\s+/g, "");
      const matchPlate = plate.includes(q) || (qNoSpace && plateNoSpace.includes(qNoSpace));
      const matchName = (v.name || "").toLowerCase().includes(q);
      const matchId = (v.id || "").toLowerCase().includes(q);
      return matchPlate || matchName || matchId;
    });

    if (matchingVisitor) {
      const isExpired = matchingVisitor.status === "EXITED";
      if (isExpired) {
        playBeep(false);
        triggerHaptic(false);
      } else {
        triggerHaptic(true);
      }
      setVerifiedPass({
        passNumber: matchingVisitor.id,
        client: matchingVisitor.name,
        schoolId: `VISITOR (${matchingVisitor.idPresented})`,
        classification: "VISITOR",
        vehicle: matchingVisitor.vehicleType,
        plateNumber: matchingVisitor.plateNumber,
        vehicleType: matchingVisitor.vehicleType,
        color: "N/A",
        validUntil: matchingVisitor.validUntil,
        status: matchingVisitor.status === "INSIDE" ? "INSIDE" : "EXITED",
        isValid: true,
        department: `Destination: ${matchingVisitor.destination}`,
      });
      return;
    }

    // Authoritative Cloud Database Search
    try {
      const cloudResults = await apiRequest(`/guard/search?query=${encodeURIComponent(q)}`);
      if (Array.isArray(cloudResults) && cloudResults.length > 0) {
        const found = cloudResults[0];
        const isExpired = found.status === "EXPIRED" || found.status === "REVOKED" || (found.valid_until && new Date(found.valid_until) < new Date());
        if (isExpired) {
          playBeep(false);
          triggerHaptic(false);
        } else {
          triggerHaptic(true);
        }
        const isStudent = (found.classification || "").toUpperCase() === "STUDENT";
        const isVisitor = (found.classification || "").toUpperCase() === "VISITOR";
        const isEmployee = !isStudent && !isVisitor;
        setVerifiedPass({
          passNumber: found.pass_number,
          client: found.full_name,
          schoolId: found.school_id,
          classification: isVisitor ? "VISITOR" : (isStudent ? "STUDENT" : "EMPLOYEE"),
          vehicle: `${found.make || ""} ${found.model || ""}`.trim() || found.vehicle_type || "Vehicle",
          plateNumber: found.plate_number,
          vehicleType: found.vehicle_type || "Vehicle",
          color: found.color || "N/A",
          validUntil: found.valid_until ? new Date(found.valid_until).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Active Clearance",
          status: isExpired ? "EXPIRED" : (found.status || "ACTIVE"),
          isValid: !isExpired && (found.status || "ACTIVE") === "ACTIVE",
          department: found.department_unit || found.destination || (isStudent ? "College of Engineering and Technology" : "RSU University Personnel"),
          yearCourse: found.year_course || "",
          photo: found.client_photo || null,
        });
        return;
      }
    } catch (err) {
      console.warn("Backend manual search error:", err);
    }

    // Fallback demo matching
    if (
      q.includes("nbm") ||
      q.includes("santos") ||
      q.includes("visitor") ||
      q.includes("tmp")
    ) {
      handleSimulatePass("VISITOR_PASS");
    } else if (q.includes("xyz") || q.includes("juan") || q.includes("emp")) {
      handleSimulatePass("VALID_EMPLOYEE");
    } else if (q.includes("rsu") || q.includes("cuenco")) {
      handleSimulatePass("VALID_STUDENT");
    } else {
      playBeep(false);
      triggerHaptic(false);
      setInvalidScanAlert({
        rawText: query || quickSearchQuery,
        reason: "No Pass Found in Database",
        details: `No active student, employee, or visitor pass found matching "${query || quickSearchQuery}".`,
        isManualSearch: true,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    }
  };

  // Decode scanned QR text
  const handleScannedData = async (rawText) => {
    if (!rawText) return;
    const text = String(rawText).trim();
    if (!text) return;

    setScanSuccessFlash(true);
    setTimeout(() => setScanSuccessFlash(false), 800);

    let extractedPass = "";
    let extractedPlate = "";
    let extractedId = "";

    if (text.startsWith("RSU-VPASS:")) {
      const parts = text.split(":");
      extractedPass = (parts[1] || "").trim();
      extractedPlate = (parts[2] || "").trim().replace(/\s+/g, "");
      extractedId = (parts[3] || "").trim();
    } else {
      extractedPass = text;
    }

    const cleanInput = text.toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanPass = extractedPass.toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanPlate = extractedPlate.toLowerCase();

    // 1. Registered Passes (Local sync)
    const matchApp = (applications || []).find((a) => {
      if (!a.pass) return false;
      const appPassNum = (a.pass.passNumber || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      const appPlate = (a.vehicle?.plateNumber || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      const appQr = (a.pass.qrData || "").toLowerCase();
      const appSchoolId = (a.school_id || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

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
      const isExpired = matchApp.pass.status === "EXPIRED" || matchApp.pass.status === "REVOKED" || isPassExpired(matchApp.pass);
      if (isExpired) {
        playBeep(false);
        triggerHaptic(false);
      } else {
        triggerHaptic(true);
      }
      const isStudent =
        (matchApp.classification || "").toLowerCase().includes("student");
      const isEmployee = !isStudent;
      setVerifiedPass({
        passNumber: matchApp.pass.passNumber,
        client: matchApp.applicant_name,
        schoolId: matchApp.school_id,
        classification: isStudent ? "STUDENT" : "EMPLOYEE",
        vehicle:
          `${matchApp.vehicle?.make || ""} ${matchApp.vehicle?.model || ""}`.trim() ||
          "Vehicle",
        plateNumber: matchApp.vehicle?.plateNumber || "N/A",
        vehicleType: matchApp.vehicle?.type || "Vehicle",
        color: matchApp.vehicle?.color || "N/A",
        validUntil: matchApp.pass.validUntil || "Active Clearance",
        status: isExpired ? "EXPIRED" : (matchApp.pass.status || "ACTIVE"),
        isValid: !isExpired && matchApp.pass.status === "ACTIVE",
        department:
          matchApp.department ||
          (isEmployee
            ? "RSU University Personnel"
            : "College of Engineering and Technology"),
        yearCourse:
          matchApp.year_course ||
          matchApp.department ||
          (isEmployee ? "" : "BS Information Technology"),
        photo: matchApp.applicant_photo || null,
      });
      return;
    }

    // 2. Temporary Visitor Passes (Local sync)
    const matchVisitor = (visitors || []).find((v) => {
      const vId = (v.id || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const vPlate = (v.plateNumber || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      const vQr = (v.qrData || "").toLowerCase();

      return (
        (cleanPass && vId === cleanPass) ||
        (cleanPlate && vPlate === cleanPlate) ||
        (cleanInput && vId === cleanInput) ||
        (cleanInput && vPlate === cleanInput) ||
        (text && vQr === text.toLowerCase())
      );
    });

    if (matchVisitor) {
      const isExpired = matchVisitor.status === "EXITED";
      if (isExpired) {
        playBeep(false);
        triggerHaptic(false);
      } else {
        triggerHaptic(true);
      }
      setVerifiedPass({
        passNumber: matchVisitor.id,
        client: matchVisitor.name,
        schoolId: `VISITOR (${matchVisitor.idPresented})`,
        classification: "VISITOR",
        vehicle: matchVisitor.vehicleType,
        plateNumber: matchVisitor.plateNumber,
        vehicleType: matchVisitor.vehicleType,
        color: "N/A",
        validUntil: matchVisitor.validUntil,
        status: matchVisitor.status === "INSIDE" ? "INSIDE" : "EXITED",
        isValid: true,
        department: `Destination: ${matchVisitor.destination}`,
      });
      return;
    }

    // 3. Authoritative Online Cloud Backend Verification
    try {
      const verifyRes = await apiRequest("/guard/verify", {
        method: "POST",
        body: JSON.stringify({ code: text }),
      });
      if (verifyRes && verifyRes.found && verifyRes.pass) {
        const p = verifyRes.pass;
        const isExpired = verifyRes.status === "EXPIRED" || !verifyRes.isValid;
        if (isExpired) {
          playBeep(false);
          triggerHaptic(false);
        } else {
          triggerHaptic(true);
        }
        const isStudent = (p.classification || "").toUpperCase() === "STUDENT";
        const isVisitor = verifyRes.type === "TEMPORARY" || (p.classification || "").toUpperCase() === "VISITOR";
        const isEmployee = !isStudent && !isVisitor;
        setVerifiedPass({
          passNumber: p.pass_number,
          client: p.full_name || p.visitor_name,
          schoolId: p.school_id || `VISITOR (${p.id_presented || "ID"})`,
          classification: isVisitor ? "VISITOR" : (isStudent ? "STUDENT" : "EMPLOYEE"),
          vehicle: `${p.make || ""} ${p.model || ""}`.trim() || p.vehicle_type || p.vehicle_description || "Vehicle",
          plateNumber: p.plate_number,
          vehicleType: p.vehicle_type || p.vehicle_description || "Vehicle",
          color: p.color || "N/A",
          validUntil: p.valid_until ? new Date(p.valid_until).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : (p.valid_to ? new Date(p.valid_to).toLocaleDateString() : "Active Clearance"),
          status: verifyRes.status || "ACTIVE",
          isValid: verifyRes.isValid,
          department: p.department_unit || p.destination || (isStudent ? "College of Engineering and Technology" : "RSU University Personnel"),
          yearCourse: p.year_course || "",
          photo: p.client_photo || null,
        });
        return;
      }
    } catch (err) {
      console.warn("Backend QR verify check failed:", err);
    }

    // 4. UNRECOGNIZED / TROLL / INVALID QR CODE INTERCEPTOR
    playBeep(false);
    triggerHaptic(false);

    const isUrl = /^https?:\/\//i.test(text) || text.includes("www.") || text.includes(".com") || text.includes(".ph") || text.includes(".org");
    const isMemeOrMedia = /\.(jpg|jpeg|png|gif|webp|mp4|webm|avi)/i.test(text) || text.includes("youtube.com") || text.includes("youtu.be") || text.includes("tiktok.com");
    const isForgedRsu = text.startsWith("RSU-VPASS:");

    let reason = "Unrecognized QR Code (Not in System)";
    let details = "This QR code does not belong to any authorized university vehicle or visitor.";

    if (isMemeOrMedia) {
      reason = "External Media / Meme QR Detected (Troll Code)";
      details = "The scanned QR code links to an external image, video, or social media page instead of a verified campus vehicle pass.";
    } else if (isUrl) {
      reason = "External Website URL Detected";
      details = "The scanned code points to an external web page. For security, non-university links are blocked from campus access.";
    } else if (isForgedRsu) {
      reason = "Counterfeit / Unregistered RSU Format";
      details = "The QR code mimics an RSU Pass format, but this pass ID or vehicle is NOT registered in the official database.";
    }

    setVerifiedPass(null);
    setInvalidScanAlert({
      rawText: text,
      reason,
      details,
      isTroll: isMemeOrMedia,
      isUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
  };

  // Video QR scan frame loop
  useEffect(() => {
    if (!cameraActive) {
      if (scanLoopRef.current) {
        cancelAnimationFrame(scanLoopRef.current);
        scanLoopRef.current = null;
      }
      return;
    }

    let isMounted = true;
    const hasBarcodeDetector =
      typeof window !== "undefined" && "BarcodeDetector" in window;
    let barcodeDetector = null;
    if (hasBarcodeDetector) {
      try {
        barcodeDetector = new window.BarcodeDetector({ formats: ["qr_code"] });
      } catch {
        barcodeDetector = null;
      }
    }

    const scanFrame = async (timestamp) => {
      if (!isMounted) return;

      const video = videoRef.current;
      const now = Date.now();

      if (
        video &&
        video.readyState >= 2 &&
        now > cooldownUntilRef.current &&
        timestamp - lastScanTimestampRef.current > 100
      ) {
        lastScanTimestampRef.current = timestamp;

        try {
          let detected = null;

          if (barcodeDetector) {
            try {
              const barcodes = await barcodeDetector.detect(video);
              if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                detected = barcodes[0].rawValue;
              }
            } catch {
              // fallback
            }
          }

          if (!detected && video.videoWidth && video.videoHeight) {
            if (!canvasRef.current) {
              canvasRef.current = document.createElement("canvas");
            }
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });

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
              inversionAttempts: "dontInvert",
            });

            if (qrCode && qrCode.data) {
              detected = qrCode.data;
            }
          }

          if (detected) {
            cooldownUntilRef.current = now + 3500;
            handleScannedData(detected);
          }
        } catch {
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

  // Gate presence logging
  const handleLogEvent = (type) => {
    if (!verifiedPass) return;
    triggerHaptic(true);
    playBeep(true);

    if (verifiedPass.classification === "VISITOR" && type === "EXIT") {
      logVisitorExit(verifiedPass.passNumber || verifiedPass.plateNumber);
    } else {
      addGateLog({
        passNumber: verifiedPass.passNumber,
        plateNumber: verifiedPass.plateNumber,
        owner: verifiedPass.client,
        classification: verifiedPass.classification || "STUDENT",
        type,
        gate: activeGate || "Gate 1",
        status: verifiedPass.isValid ? "VALID" : "INVALID",
      });
    }

    setLogSuccessMessage(
      `${type} recorded at ${activeGate || "Gate 1"} for ${verifiedPass.plateNumber}!`,
    );
    setTimeout(() => setLogSuccessMessage(""), 3500);
    setVerifiedPass(null);
  };

  // Issue new visitor pass
  const handleIssueVisitorPass = async (e) => {
    e.preventDefault();
    setVisitorFormError("");

    if (!visitorForm.name.trim()) {
      setVisitorFormError("Please enter the visitor's full name.");
      return;
    }
    if (!visitorForm.plateNumber.trim()) {
      setVisitorFormError("Please enter the vehicle plate number.");
      return;
    }
    if (!visitorForm.vehicleType || visitorForm.vehicleType === "") {
      setVisitorFormError("Please select a vehicle type.");
      return;
    }
    if (!visitorForm.idPresented) {
      setVisitorFormError("Please select a valid ID presented.");
      return;
    }
    if (
      visitorForm.idPresented === "Other (Please specify)" &&
      !(visitorForm.otherId || "").trim()
    ) {
      setVisitorFormError("Please specify the valid ID presented.");
      return;
    }
    if (!visitorForm.contact.trim()) {
      setVisitorFormError("Please enter a visitor contact number.");
      return;
    }
    if (!visitorForm.destination.trim()) {
      setVisitorFormError("Please enter the destination office or building.");
      return;
    }
    if (!visitorForm.purpose.trim()) {
      setVisitorFormError("Please enter the purpose of the visit.");
      return;
    }

    const finalId =
      visitorForm.idPresented === "Other (Please specify)"
        ? (visitorForm.otherId || "").trim()
        : visitorForm.idPresented;

    try {
      const newVisitor = await issueVisitorPass({
        ...visitorForm,
        idPresented: finalId,
        gate: activeGate || "Gate 1",
      });

      playBeep(true);
      triggerHaptic(true);

      setSelectedVisitorModal(newVisitor);
      setLogSuccessMessage(
        `Visitor Pass ${newVisitor.id} issued & ENTRY logged for ${newVisitor.plateNumber}!`,
      );
      setTimeout(() => setLogSuccessMessage(""), 3500);

      setVisitorForm({
        name: "",
        contact: "",
        idPresented: "Driver's License (LTO)",
        otherId: "",
        plateNumber: "",
        vehicleType: "",
        destination: "",
        purpose: "",
        validityDuration: "1",
      });

      setVisitorSubTab("active");
    } catch (err) {
      console.error("Error issuing visitor pass:", err);
      setVisitorFormError("Failed to issue visitor pass. Please try again.");
    }
  };

  // Pre-fill form to register a new entry for a returning visitor
  const handleStartNewEntryForVisitor = (visitor) => {
    const isStandardId = PHILIPPINE_VALID_IDS.includes(visitor.idPresented);
    setVisitorForm({
      name: visitor.name || "",
      contact: visitor.contact !== "N/A" ? visitor.contact || "" : "",
      idPresented: isStandardId ? visitor.idPresented : "Other (Please specify)",
      otherId: isStandardId ? "" : visitor.idPresented || "",
      plateNumber: visitor.plateNumber || "",
      vehicleType: visitor.vehicleType || "",
      destination: visitor.destination || "",
      purpose: visitor.purpose || "",
      validityDuration: String(visitor.validDays || "1"),
    });
    setVisitorFormError("");
    setVisitorSubTab("new");
  };

  // Extend stay directly from scan result modal
  const handleExtendFromScanner = (pass) => {
    if (!pass) return;
    const targetId = pass.passNumber || pass.plateNumber || pass.id;
    const updated = extendVisitorPass(targetId, 1);
    playBeep(true);
    triggerHaptic(true);
    setLogSuccessMessage(
      `Stay extended (+1 Day) for ${pass.plateNumber}!`,
    );
    setTimeout(() => setLogSuccessMessage(""), 4000);

    const fullVisitor = visitors.find(
      (v) => v.id === targetId || v.plateNumber === pass.plateNumber,
    );
    setVerifiedPass(null);
    setSelectedVisitorModal(
      updated ||
        fullVisitor || {
          id: pass.passNumber || pass.id,
          plateNumber: pass.plateNumber,
          name: pass.client || pass.name,
          vehicleType: pass.vehicleType || "Vehicle",
          destination: pass.department
            ? pass.department.replace("Destination: ", "")
            : pass.destination || "Administration Building",
          purpose: pass.purpose || "Official Business / Visit Extension",
          validUntil: "Tomorrow • 11:59 PM (Extended)",
          status: "INSIDE",
        },
    );
  };

  // Quick 1-tap exit for visitor
  const handleVisitorQuickExit = (visitorId) => {
    logVisitorExit(visitorId);
    playBeep(true);
    triggerHaptic(true);
    setLogSuccessMessage(`EXIT logged for Visitor Pass ${visitorId}!`);
    setTimeout(() => setLogSuccessMessage(""), 3500);
  };

  const handleCopyPass = (text) => {
    navigator.clipboard?.writeText(text);
    setCopiedPassId(true);
    setTimeout(() => setCopiedPassId(false), 2000);
  };

  // Metrics
  const totalEntries = logs.filter((l) => l.type === "ENTRY").length;
  const totalExits = logs.filter((l) => l.type === "EXIT").length;
  const activeVisitorsInside = visitors.filter((v) => v.status === "INSIDE");

  const pastVisitorMatch =
    visitorForm.plateNumber.trim().length >= 3
      ? visitors.find(
          (v) =>
            v.plateNumber.replace(/\s+/g, "").toUpperCase() ===
            visitorForm.plateNumber.replace(/\s+/g, "").toUpperCase(),
        )
      : null;

  const filteredLogs = logs.filter((log) => {
    if (logFilter === "ALL") return true;
    return log.type === logFilter;
  });

  return (
    <div className="space-y-3 max-w-xl mx-auto pb-12">
      {/* Top Security Status Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl px-3.5 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-black text-white tracking-wide">
            {activeGate || "Gate 1 Outpost"}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase">
            Online
          </span>
        </div>

        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center space-x-1 cursor-pointer transition-colors"
          title={soundEnabled ? "Mute audio beep" : "Enable audio beep"}
        >
          {soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-slate-500" />
          )}
          <span className="text-[10px] font-semibold">
            {soundEnabled ? "Sound" : "Muted"}
          </span>
        </button>
      </div>

      {/* Main Guard Hub Navigation (3 Clean Tabs) */}
      <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-md">
        <button
          type="button"
          onClick={() => setActiveTab("scan")}
          className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            activeTab === "scan"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Camera className="w-4 h-4 shrink-0" />
          <span>Scanner</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("visitor")}
          className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 relative cursor-pointer ${
            activeTab === "visitor"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>Visitors</span>
          {activeVisitorsInside.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
              {activeVisitorsInside.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("logs")}
          className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            activeTab === "logs"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <History className="w-4 h-4 shrink-0" />
          <span>Logs ({logs.length})</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {logSuccessMessage && (
        <div className="p-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-100 shrink-0" />
            <span className="truncate">{logSuccessMessage}</span>
          </div>
          <span className="text-[10px] bg-emerald-800 px-2 py-0.5 rounded-full font-semibold shrink-0">
            SAVED
          </span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. UNIFIED SCANNER & QUICK LOOKUP HUB                   */}
      {/* ======================================================== */}
      {activeTab === "scan" && (
        <div className="space-y-3">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4 shadow-xl space-y-3.5">
            {/* Camera Viewfinder */}
            <div
              className={`w-full max-w-[390px] aspect-4/3 sm:aspect-square mx-auto rounded-3xl bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden border-2 transition-all duration-300 shadow-2xl ${
                scanSuccessFlash
                  ? "border-emerald-400 ring-4 ring-emerald-400/60 shadow-[0_0_35px_rgba(52,211,153,0.5)]"
                  : cameraActive
                    ? "border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.25)]"
                    : "border-slate-800"
              }`}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={
                  cameraActive
                    ? `w-full h-full object-cover transition-transform duration-200 ${
                        facingMode === "user" ? "-scale-x-100" : "scale-x-100"
                      }`
                    : "hidden"
                }
              />

              {/* Inactive State: Modern Scanner Graphic */}
              {!cameraActive && (
                <div className="text-center p-6 space-y-3 z-10">
                  <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-700/80 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-950/40 relative">
                    <QrCode className="w-8 h-8" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-slate-500 rounded-full border-2 border-slate-950" />
                  </div>
                  <div>
                    <p className="text-sm text-white font-extrabold">
                      Gate QR Scanner Inactive
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-[220px] mx-auto mt-1 leading-relaxed">
                      Tap the green button below to start real-time QR camera scanning for vehicle passes
                    </p>
                  </div>
                </div>
              )}

              {/* Active Scanner Mode: Authentic Scanner App UI */}
              {cameraActive && (
                <>
                  {/* Surrounding Darkened Mask */}
                  <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />

                  {/* Top Floating Glassmorphic Toolbar */}
                  <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-auto">
                    {/* Status Badge */}
                    <div className="px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-emerald-500/40 text-[10px] font-extrabold text-emerald-300 flex items-center space-x-1.5 shadow-md">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>SCANNER READY</span>
                    </div>

                    {/* Quick Action Icons */}
                    <div className="flex items-center space-x-1.5">
                      {/* Torch Flashlight Toggle */}
                      {hasTorch && (
                        <button
                          type="button"
                          onClick={toggleTorch}
                          title={isTorchOn ? "Turn Flashlight Off" : "Turn Flashlight On"}
                          className={`p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer shadow-md ${
                            isTorchOn
                              ? "bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/60"
                              : "bg-slate-950/80 text-slate-300 border-slate-700 hover:bg-slate-800"
                          }`}
                        >
                          {isTorchOn ? <Zap className="w-4 h-4 fill-current" /> : <ZapOff className="w-4 h-4" />}
                        </button>
                      )}

                      {/* Sound Toggle */}
                      <button
                        type="button"
                        onClick={() => setSoundEnabled((prev) => !prev)}
                        title={soundEnabled ? "Mute scan sound" : "Unmute scan sound"}
                        className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 backdrop-blur-md border border-slate-700 text-slate-300 shadow-md cursor-pointer transition-colors"
                      >
                        {soundEnabled ? (
                          <Volume2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-slate-500" />
                        )}
                      </button>

                      {/* Switch Camera */}
                      <button
                        type="button"
                        onClick={flipCamera}
                        title="Switch Camera (Rear / Front)"
                        className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 backdrop-blur-md border border-slate-700 text-slate-300 shadow-md cursor-pointer transition-colors"
                      >
                        <SwitchCamera className="w-4 h-4 text-emerald-400" />
                      </button>
                    </div>
                  </div>

                  {/* High-Precision Central Viewfinder Target Box */}
                  <div className="relative z-10 w-52 h-52 sm:w-60 sm:h-60 rounded-3xl border border-emerald-400/40 pointer-events-none shadow-[0_0_25px_rgba(52,211,153,0.3)] flex items-center justify-center">
                    {/* 4 Precision Glowing Corner Brackets */}
                    <div className="absolute -top-1 -left-1 w-7 h-7 border-t-3 border-l-3 border-emerald-400 rounded-tl-2xl shadow-[0_0_10px_#34d399]" />
                    <div className="absolute -top-1 -right-1 w-7 h-7 border-t-3 border-r-3 border-emerald-400 rounded-tr-2xl shadow-[0_0_10px_#34d399]" />
                    <div className="absolute -bottom-1 -left-1 w-7 h-7 border-b-3 border-l-3 border-emerald-400 rounded-bl-2xl shadow-[0_0_10px_#34d399]" />
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 border-b-3 border-r-3 border-emerald-400 rounded-br-2xl shadow-[0_0_10px_#34d399]" />

                    {/* Subtle Crosshair Reticle */}
                    <div className="w-5 h-[1px] bg-emerald-400/40 absolute" />
                    <div className="h-5 w-[1px] bg-emerald-400/40 absolute" />

                    {/* Animated Scanning Laser Line */}
                    <div className="qr-laser-line" />

                    {/* Verified Detection Burst */}
                    {scanSuccessFlash && (
                      <div className="absolute inset-0 bg-emerald-500/25 rounded-3xl flex items-center justify-center backdrop-blur-2xs animate-in zoom-in-75 duration-150">
                        <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                          <Check className="w-7 h-7 stroke-[3]" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Guidance Pill */}
                  <div className="absolute bottom-3 inset-x-3 flex justify-center z-20 pointer-events-none">
                    <span className="px-3.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md text-[11px] font-bold text-emerald-200 border border-emerald-500/30 shadow-lg flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Point camera at Vehicle Gate Pass QR</span>
                    </span>
                  </div>
                </>
              )}

              {/* Error Display */}
              {cameraError && (
                <div className="absolute inset-0 bg-slate-950/95 p-5 flex flex-col items-center justify-center text-center z-30">
                  <AlertTriangle className="w-9 h-9 text-amber-400 mb-2" />
                  <p className="text-xs text-slate-200 max-w-xs leading-relaxed">
                    {cameraError}
                  </p>
                  <button
                    type="button"
                    onClick={() => setCameraError("")}
                    className="mt-3.5 px-4 py-1.5 bg-slate-800 text-slate-200 rounded-xl text-xs font-bold hover:text-white border border-slate-700 cursor-pointer shadow-sm"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>

            {/* Main Scanner Toggle Power Button */}
            <button
              type="button"
              onClick={toggleCamera}
              className={`w-full py-3.5 rounded-2xl font-black text-xs flex items-center justify-center space-x-2.5 transition-all cursor-pointer shadow-xl active:scale-98 ${
                cameraActive
                  ? "bg-rose-500/15 text-rose-300 border border-rose-500/40 hover:bg-rose-500/25"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50"
              }`}
            >
              {cameraActive ? (
                <>
                  <VideoOff className="w-4 h-4 text-rose-400" />
                  <span>Stop Camera Scanner</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 text-white" />
                  <span>Start Live QR Camera Scanner</span>
                </>
              )}
            </button>

            {/* Integrated Direct Plate / ID Lookup (No tab switching needed) */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Manual License Plate / ID Verification
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={quickSearchQuery}
                    onChange={(e) => setQuickSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                    placeholder="e.g. XYZ 5678, NBM 9012, or Student ID"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleManualSearch()}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 font-bold text-xs flex items-center space-x-1 cursor-pointer transition-colors shrink-0"
                >
                  <span>Verify</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Discreet Collapsible Test / Simulation Bar */}
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowDemoSimulator(!showDemoSimulator)}
              className="w-full px-3.5 py-2 flex items-center justify-between text-slate-400 hover:text-slate-200 text-xs font-semibold cursor-pointer"
            >
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick Test Simulator</span>
              </div>
              {showDemoSimulator ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showDemoSimulator && (
              <div className="p-3 pt-0 border-t border-slate-800/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleSimulatePass("VALID_EMPLOYEE")}
                  className="py-2 px-2.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 font-bold text-center cursor-pointer transition-colors"
                >
                  Employee (XYZ 5678)
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulatePass("VALID_STUDENT")}
                  className="py-2 px-2.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 font-bold text-center cursor-pointer transition-colors"
                >
                  Student (RSU 2026)
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulatePass("VISITOR_PASS")}
                  className="py-2 px-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-center cursor-pointer transition-colors"
                >
                  Visitor (NBM 9012)
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulatePass("EXPIRED")}
                  className="py-2 px-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-center cursor-pointer transition-colors"
                >
                  Expired (ABC 1234)
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulatePass("TROLL_QR")}
                  className="col-span-2 sm:col-span-4 py-2 px-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 font-bold text-center cursor-pointer transition-colors flex items-center justify-center space-x-1.5"
                >
                  <span>🎭 Test Fake / Meme Troll QR</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. STREAMLINED VISITOR MANAGEMENT DESK                   */}
      {/* ======================================================== */}
      {activeTab === "visitor" && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4 sm:p-5 shadow-xl space-y-3.5">
          {/* Sub-Switch: Active on Campus vs + Issue New Pass */}
          <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setVisitorSubTab("active")}
              className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                visitorSubTab === "active"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>On Campus</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-amber-300 text-[10px] font-black">
                {activeVisitorsInside.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setVisitorSubTab("new")}
              className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                visitorSubTab === "new"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Issue New Pass</span>
            </button>
          </div>

          {/* Sub-View A: Active Visitors on Campus */}
          {visitorSubTab === "active" && (
            <div className="space-y-3">
              {/* Visitor Quick Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={visitorSearchQuery}
                  onChange={(e) => setVisitorSearchQuery(e.target.value)}
                  placeholder="Search visitor plate, name, or pass #..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {visitors.filter((v) => {
                if (visitorSearchQuery.trim()) {
                  const q = visitorSearchQuery.toLowerCase();
                  return (
                    (v.plateNumber || "").toLowerCase().includes(q) ||
                    (v.name || "").toLowerCase().includes(q) ||
                    (v.id || "").toLowerCase().includes(q)
                  );
                }
                return true;
              }).length === 0 ? (
                <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
                  <Users className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-300 font-bold">
                    No Visitors Found
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Tap "Issue New Pass" to register an incoming vehicle.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {visitors
                    .filter((v) => {
                      if (visitorSearchQuery.trim()) {
                        const q = visitorSearchQuery.toLowerCase();
                        return (
                          (v.plateNumber || "").toLowerCase().includes(q) ||
                          (v.name || "").toLowerCase().includes(q) ||
                          (v.id || "").toLowerCase().includes(q)
                        );
                      }
                      return true;
                    })
                    .map((v) => {
                      const isInside = v.status === "INSIDE";
                      return (
                        <div
                          key={v.id}
                          className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-base font-black text-white whitespace-nowrap">
                                  {v.plateNumber}
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                                  ({v.id})
                                </span>
                              </div>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-200 mt-0.5 truncate">
                                {v.name}
                              </h4>
                              <p className="text-[11px] text-slate-400 truncate">
                                {v.vehicleType} • {v.destination}
                              </p>
                            </div>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                                isInside
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : "bg-slate-800 text-slate-400 border border-slate-700"
                              }`}
                            >
                              {isInside ? "INSIDE" : "DEPARTED"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-2">
                            <span
                              className={`text-[11px] truncate ${isInside ? "text-amber-300 font-medium" : "text-slate-400"}`}
                            >
                              {isInside
                                ? `Valid: ${v.validUntil}`
                                : `Status: Departed (${v.exitTime || "Exited"})`}
                            </span>

                            <div className="flex items-center space-x-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => setSelectedVisitorModal(v)}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-1 cursor-pointer transition-colors"
                              >
                                <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Pass</span>
                              </button>

                              {isInside && (
                                <button
                                  type="button"
                                  onClick={() => handleVisitorQuickExit(v.id)}
                                  className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center space-x-1 cursor-pointer transition-colors"
                                >
                                  <LogOut className="w-3.5 h-3.5 text-rose-300" />
                                  <span>Exit</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* Sub-View B: Rapid Visitor Issuance Form */}
          {visitorSubTab === "new" && (
            <form onSubmit={handleIssueVisitorPass} className="space-y-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                ⚡ <strong>Quick Visitor Registration:</strong> Issues a
                temporary digital pass with QR code and logs gate ENTRY
                immediately.
              </div>

              {visitorFormError && (
                <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-200 font-bold flex items-center space-x-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{visitorFormError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Visitor Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={visitorForm.name}
                    onChange={(e) =>
                      setVisitorForm({ ...visitorForm, name: e.target.value })
                    }
                    placeholder="e.g. Engr. Robert Tan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Vehicle Plate Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={visitorForm.plateNumber}
                    onChange={(e) =>
                      setVisitorForm({
                        ...visitorForm,
                        plateNumber: e.target.value,
                      })
                    }
                    placeholder="e.g. NBM 9012"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  {pastVisitorMatch &&
                    pastVisitorMatch.name !== visitorForm.name && (
                      <div className="mt-1.5 p-2 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-between text-[11px] text-blue-200">
                        <span className="truncate">
                          Returning visitor: <strong>{pastVisitorMatch.name}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleStartNewEntryForVisitor(pastVisitorMatch)
                          }
                          className="ml-2 px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] cursor-pointer shrink-0"
                        >
                          Auto-fill
                        </button>
                      </div>
                    )}
                </div>

                <GuardCustomDropdown
                  label="Vehicle Type"
                  required
                  value={visitorForm.vehicleType}
                  onChange={(v) =>
                    setVisitorForm({
                      ...visitorForm,
                      vehicleType: v,
                    })
                  }
                  options={VEHICLE_TYPE_CHOICES}
                  placeholder="PLEASE SELECT VEHICLE"
                />

                <div>
                  <GuardCustomDropdown
                    label="Valid ID Presented"
                    required
                    value={visitorForm.idPresented}
                    onChange={(v) =>
                      setVisitorForm({
                        ...visitorForm,
                        idPresented: v,
                      })
                    }
                    options={PHILIPPINE_VALID_IDS}
                    placeholder="PLEASE SELECT VALID ID"
                  />

                  {visitorForm.idPresented === "Other (Please specify)" && (
                    <div className="mt-2">
                      <input
                        type="text"
                        required
                        value={visitorForm.otherId || ""}
                        onChange={(e) =>
                          setVisitorForm({
                            ...visitorForm,
                            otherId: e.target.value,
                          })
                        }
                        placeholder="Type ID presented (e.g. NBI Clearance)..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-emerald-500/50 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none animate-in fade-in"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={visitorForm.contact}
                    onChange={(e) =>
                      setVisitorForm({
                        ...visitorForm,
                        contact: e.target.value,
                      })
                    }
                    placeholder="+63 9XX XXX XXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <GuardCustomDropdown
                  label="Pass Duration"
                  required
                  value={visitorForm.validityDuration}
                  onChange={(v) =>
                    setVisitorForm({
                      ...visitorForm,
                      validityDuration: v,
                    })
                  }
                  options={PASS_DURATION_CHOICES}
                  placeholder="Select Duration"
                />

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">
                    Destination Office / Building *
                  </label>
                  <input
                    type="text"
                    required
                    value={visitorForm.destination}
                    onChange={(e) =>
                      setVisitorForm({
                        ...visitorForm,
                        destination: e.target.value,
                      })
                    }
                    placeholder="e.g. Administration Building, CET, Registrar, or Gymnasium"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">
                    Purpose of Visit *
                  </label>
                  <input
                    type="text"
                    required
                    value={visitorForm.purpose}
                    onChange={(e) =>
                      setVisitorForm({
                        ...visitorForm,
                        purpose: e.target.value,
                      })
                    }
                    placeholder="e.g. Official Business, Document Submission, Meeting with Dean"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/40 active:scale-98 transition-all cursor-pointer mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Issue Visitor Pass & Log Entry</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. GATE LOGS & COUNTERS                                 */}
      {/* ======================================================== */}
      {activeTab === "logs" && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4 sm:p-5 shadow-xl space-y-4">
          {/* Quick Counter Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Total Entries
                </span>
                <span className="text-2xl font-black text-emerald-400">
                  {totalEntries}
                </span>
              </div>
              <LogIn className="w-6 h-6 text-emerald-400" />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Total Exits
                </span>
                <span className="text-2xl font-black text-blue-400">
                  {totalExits}
                </span>
              </div>
              <LogOut className="w-6 h-6 text-blue-400" />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setLogFilter("ALL")}
              className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                logFilter === "ALL"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/60"
              }`}
            >
              <span>ALL</span>
              <span className="text-[10px] opacity-75 font-mono font-normal">({logs.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setLogFilter("ENTRY")}
              className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                logFilter === "ENTRY"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/60"
              }`}
            >
              <LogIn className="w-3.5 h-3.5 mr-0.5" />
              <span>ENTRY</span>
              <span className="text-[10px] opacity-75 font-mono font-normal">({totalEntries})</span>
            </button>
            <button
              type="button"
              onClick={() => setLogFilter("EXIT")}
              className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                logFilter === "EXIT"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-950/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/60"
              }`}
            >
              <LogOut className="w-3.5 h-3.5 mr-0.5" />
              <span>EXIT</span>
              <span className="text-[10px] opacity-75 font-mono font-normal">({totalExits})</span>
            </button>
          </div>

          {/* Activity Log List */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {filteredLogs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                No gate logs recorded yet.
              </p>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="py-2.5 px-3 rounded-2xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700/80 transition-all flex items-center justify-between gap-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="font-bold text-white text-xs sm:text-sm font-mono tracking-wide shrink-0">
                        {log.plateNumber}
                      </span>
                      <span className="text-[11px] text-slate-300 truncate">
                        • {log.owner}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-mono mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
                      <span className="text-slate-300 font-semibold shrink-0">{log.passNumber}</span>
                      <span className="text-slate-600">•</span>
                      <span className="shrink-0">{log.gate || "Gate 1"}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400 truncate">{log.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    {log.classification && (
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0 ${
                          log.classification === "EMPLOYEE"
                            ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                            : log.classification === "STUDENT"
                              ? "bg-pink-500/15 text-pink-300 border border-pink-500/30"
                              : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {log.classification}
                      </span>
                    )}

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider shrink-0 flex items-center space-x-1 ${
                        log.type === "ENTRY"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      }`}
                    >
                      {log.type === "ENTRY" ? (
                        <LogIn className="w-3 h-3 mr-0.5" />
                      ) : (
                        <LogOut className="w-3 h-3 mr-0.5" />
                      )}
                      <span>{log.type}</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. VERIFIED PASS CLEARANCE MODAL (HIGH VISIBILITY OVERLAY) */}
      {/* ======================================================== */}
      {verifiedPass && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div
            className={`max-w-md w-full rounded-3xl border-2 p-5 sm:p-6 shadow-2xl relative space-y-4 my-auto animate-in zoom-in-95 duration-200 text-white ${
              verifiedPass.isValid
                ? "bg-slate-900 border-emerald-500 shadow-emerald-950/50"
                : "bg-slate-900 border-rose-500 shadow-rose-950/50"
            }`}
          >
            {/* Clearance Header */}
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
                  <span
                    className={`text-xs sm:text-sm font-black tracking-tight block ${
                      verifiedPass.isValid
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {verifiedPass.isValid
                      ? "VALID PASS • ACCESS GRANTED"
                      : "ACCESS DENIED • EXPIRED"}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {verifiedPass.passNumber}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setVerifiedPass(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Driver Identity + Registration Photo */}
            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center gap-3.5">
              <button
                type="button"
                onClick={() => verifiedPass.photo && setIsPhotoExpanded(true)}
                title={
                  verifiedPass.photo
                    ? "Tap to expand driver selfie"
                    : "No photo"
                }
                className={`w-20 h-24 rounded-xl overflow-hidden bg-slate-800 border-2 shrink-0 flex items-center justify-center relative group transition-all ${
                  verifiedPass.photo
                    ? "cursor-pointer hover:border-emerald-400 border-slate-700 active:scale-95"
                    : "border-slate-700 cursor-default"
                }`}
              >
                {verifiedPass.photo ? (
                  <>
                    <img
                      src={verifiedPass.photo}
                      alt={verifiedPass.client}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <ZoomIn className="w-5 h-5 text-emerald-300" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500 p-2 text-center">
                    <User className="w-8 h-8 text-slate-400 mb-1" />
                    <span className="text-[9px] font-semibold text-slate-400">
                      No Photo
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-slate-950/85 text-[8px] font-bold text-center py-0.5 text-slate-300 tracking-wider">
                  SELFIE
                </div>
              </button>

              <div className="flex-1 min-w-0 space-y-1">
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center space-x-1 ${
                    verifiedPass.classification === "EMPLOYEE"
                      ? "bg-red-500/20 text-red-300 border border-red-500/40"
                      : verifiedPass.classification === "VISITOR"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-pink-500/20 text-pink-300 border border-pink-500/40"
                  }`}
                >
                  <span>
                    {verifiedPass.classification === "EMPLOYEE"
                      ? "● E • RSU Employee"
                      : verifiedPass.classification === "VISITOR"
                        ? "● Visitor Pass"
                        : "● S • RSU Student"}
                  </span>
                </span>

                <h4 className="text-sm sm:text-base font-black text-white leading-tight truncate">
                  {verifiedPass.client}
                </h4>

                <div className="text-[11px] font-mono text-emerald-400 font-semibold truncate">
                  <span className="text-slate-400">ID: </span>
                  <span className="text-white">{verifiedPass.schoolId}</span>
                </div>

                <p className="text-[11px] text-slate-400 leading-snug truncate">
                  {verifiedPass.classification === "STUDENT"
                    ? verifiedPass.yearCourse ||
                      verifiedPass.department ||
                      "Student"
                    : verifiedPass.department || "University Personnel"}
                </p>
              </div>
            </div>

            {/* Giant Registered Plate Callout */}
            <div className="bg-slate-950 rounded-2xl p-3.5 border border-slate-800 text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                Authorized License Plate
              </span>
              <span className="text-3xl font-black text-white font-mono tracking-wider block mt-0.5">
                {verifiedPass.plateNumber}
              </span>
              <span className="text-xs text-emerald-400 font-semibold mt-0.5 block truncate">
                {verifiedPass.vehicle} ({verifiedPass.vehicleType})
                {verifiedPass.color && verifiedPass.color !== "N/A"
                  ? ` • ${verifiedPass.color}`
                  : ""}
              </span>
            </div>

            {/* Pass Validity Record */}
            <div className="flex items-center justify-between text-[11px] px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400">
              <span>Clearance Validity:</span>
              <span className={`font-bold ${verifiedPass.status === 'EXPIRED' ? 'text-rose-400' : 'text-slate-200'}`}>
                {verifiedPass.validUntil}
              </span>
            </div>

            {/* Expired Pass Warning for Guard */}
            {verifiedPass.status === "EXPIRED" && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs space-y-1">
                <div className="flex items-center space-x-2 font-black text-rose-200">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>PASS EXPIRED — 1-YEAR VALIDITY LAPSED</span>
                </div>
                <p className="text-[11px] text-rose-300/90 leading-relaxed pl-6">
                  This pass expired on <strong>{verifiedPass.validUntil}</strong>. Entry is restricted. Advise applicant to renew their vehicle pass at the PASO Administration Office.
                </p>
              </div>
            )}

            {/* Unambiguous Role-Based Clearance Actions */}
            {verifiedPass.classification === "VISITOR" ? (
              <div className="space-y-2.5 pt-1">
                {verifiedPass.status !== "EXITED" ? (
                  <>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleExtendFromScanner(verifiedPass)}
                        className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg cursor-pointer transition-all"
                      >
                        <RefreshCw className="w-4 h-4 shrink-0" />
                        <span>Extend (+1 Day)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLogEvent("EXIT")}
                        className="h-12 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 shadow-lg cursor-pointer transition-all"
                      >
                        <LogOut className="w-4 h-4 text-slate-950 shrink-0" />
                        <span>LOG EXIT</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setVerifiedPass(null)}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs cursor-pointer"
                    >
                      Scan Next Vehicle
                    </button>
                  </>
                ) : (
                  <>
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                      <p className="text-xs text-rose-400 font-bold">
                        Visitor Already Departed
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
            ) : verifiedPass.classification === "EMPLOYEE" ? (
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleLogEvent("ENTRY")}
                    className="h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg cursor-pointer transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>LOG ENTRY</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLogEvent("EXIT")}
                    className="h-12 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg cursor-pointer transition-all"
                  >
                    <LogOut className="w-4 h-4 text-slate-300" />
                    <span>LOG EXIT</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setVerifiedPass(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs cursor-pointer mt-1"
                >
                  Scan Next Vehicle
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 pt-1">
                {/* Student: Verification clearance confirmation only (No Entry/Exit) */}
                <button
                  type="button"
                  onClick={() => {
                    setVerifiedPass(null);
                    setIsPhotoExpanded(false);
                  }}
                  className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg cursor-pointer transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Student Cleared • Next Scan</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4.1 SECURITY ALERT: INVALID / TROLL / FAKE QR MODAL      */}
      {/* ======================================================== */}
      {invalidScanAlert && (
        <div
          onClick={() => setInvalidScanAlert(null)}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl p-5 space-y-4 my-auto border-2 border-rose-500 shadow-2xl bg-slate-900 shadow-rose-950/50 animate-in zoom-in-95 duration-200 relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-black tracking-tight text-rose-400 block uppercase">
                    Access Denied • Invalid QR
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    Security Clearance Blocked
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInvalidScanAlert(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
                title="Close Alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Alert Category Callout */}
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/40 space-y-1">
              <div className="flex items-center space-x-1.5 text-rose-300 font-bold text-xs">
                <span>⚠️</span>
                <span>{invalidScanAlert.reason}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {invalidScanAlert.details}
              </p>
            </div>


            {/* Guard Instructions */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-0.5">
              <p className="font-bold text-white">Security Protocol:</p>
              <p className="text-slate-400">
                Do not clear gate. Advise the driver to present an authorized RSU Vehicle Pass or register as a legitimate visitor.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setInvalidScanAlert(null)}
                className="w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg cursor-pointer transition-all"
              >
                <XCircle className="w-4 h-4" />
                <span>Deny Entry • Next Scan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. DRIVER PHOTO EXPANDED LIGHTBOX                        */}
      {/* ======================================================== */}
      {isPhotoExpanded && verifiedPass?.photo && (
        <div
          onClick={() => setIsPhotoExpanded(false)}
          className="fixed inset-0 z-60 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl overflow-hidden bg-slate-900 border-2 border-emerald-500 shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col"
          >
            <div className="aspect-3/4 max-h-[58vh] w-full bg-black flex items-center justify-center overflow-hidden">
              <img
                src={verifiedPass.photo}
                alt={verifiedPass.client}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-1">
              <h3 className="text-base font-black text-white truncate">
                {verifiedPass.client}
              </h3>
              <p className="text-xs text-slate-400 truncate">
                {verifiedPass.schoolId} • {verifiedPass.plateNumber}
              </p>

              <button
                type="button"
                onClick={() => setIsPhotoExpanded(false)}
                className="w-full mt-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 font-bold text-xs flex items-center justify-center space-x-1.5 border border-slate-700 cursor-pointer"
              >
                <span>Return to Verification Card</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. TEMPORARY VISITOR PASS DIGITAL CARD                   */}
      {/* ======================================================== */}
      {selectedVisitorModal && (
        <div
          onClick={() => setSelectedVisitorModal(null)}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-emerald-500 shadow-2xl p-5 space-y-3.5 my-auto animate-in zoom-in-95 duration-200 relative"
          >
            <button
              type="button"
              onClick={() => setSelectedVisitorModal(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center border-b border-slate-800 pb-2.5">
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

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-700 text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                Authorized Vehicle Plate
              </span>
              <span className="text-3xl font-black font-mono text-white tracking-widest block mt-0.5">
                {selectedVisitorModal.plateNumber}
              </span>
              <span className="text-xs text-slate-300 font-semibold mt-0.5 block">
                {selectedVisitorModal.vehicleType}
              </span>
            </div>

            <div className="p-3 bg-white rounded-2xl flex flex-col items-center justify-center shadow-md">
              {visitorQrUrl ? (
                <img
                  src={visitorQrUrl}
                  alt={`QR Code ${selectedVisitorModal.id}`}
                  className="w-36 h-36 object-contain"
                />
              ) : (
                <QrCode className="w-36 h-36 text-slate-900" />
              )}
              <span className="text-[9px] font-mono text-slate-700 mt-1 font-bold">
                {selectedVisitorModal.id}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Visitor:</span>
                <strong className="text-white">
                  {selectedVisitorModal.name}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Destination:</span>
                <strong className="text-emerald-400">
                  {selectedVisitorModal.destination}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pass Validity:</span>
                <strong className="text-amber-300">
                  {selectedVisitorModal.validUntil}
                </strong>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center text-[11px] text-amber-200">
              📸 <strong>Visitor:</strong> Take a photo/screenshot of this
              screen to present upon gate exit.
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleCopyPass(selectedVisitorModal.id)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center space-x-1 cursor-pointer border border-slate-700"
                >
                  {copiedPassId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedPassId ? "Copied!" : "Copy Pass #"}</span>
                </button>

                {selectedVisitorModal.status === "INSIDE" && (
                  <button
                    type="button"
                    onClick={() =>
                      handleExtendFromScanner(selectedVisitorModal)
                    }
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
                Done / Close Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
