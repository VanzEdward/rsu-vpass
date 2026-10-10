import React, { createContext, useContext, useState, useEffect } from "react";

const PassContext = createContext(null);

const INITIAL_APPLICATIONS = [
  {
    id: "APP-2026-0001",
    user_id: 1,
    applicant_name: "Prof. Juan Dela Cruz",
    school_id: "EMP-2026-0812",
    classification: "Employee",
    department: "College of Engineering & Technology (Faculty)",
    contact_number: "+63 912 345 6789",
    applicant_photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    vehicle: {
      make: "Honda",
      model: "Click 125",
      year: 2023,
      color: "Black",
      plateNumber: "XYZ 5678",
      type: "Motorcycle",
    },
    documents: {
      driverLicense:
        "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80",
      orCr: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
    },
    status: "PASS_ISSUED",
    rejection_reason: null,
    submittedDate: "January 10, 2026",
    receipt: {
      orNumber: "2026-98123",
      receiptPhoto: null,
      paidAt: "January 11, 2026",
    },
    pass: {
      passNumber: "E-001",
      qrData: "RSU-VPASS:E-001:XYZ 5678:EMP-2026-0812",
      validUntil: "December 31, 2026",
      status: "ACTIVE",
    },
  },
  {
    id: "APP-2026-0089",
    user_id: 2,
    applicant_name: "Chrizhel Anne Cuenco",
    school_id: "2023-00192",
    classification: "Student",
    department: "College of Engineering and Technology",
    year_course: "4th Year • BS Information Technology",
    contact_number: "+63 918 222 3344",
    applicant_photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
    vehicle: {
      make: "Yamaha",
      model: "Mio Sporty",
      year: 2024,
      color: "Matte Blue",
      plateNumber: "RSU 2026",
      type: "Motorcycle",
    },
    documents: {
      driverLicense:
        "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80",
      orCr: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
    },
    status: "PASS_ISSUED",
    rejection_reason: null,
    submittedDate: "January 12, 2026",
    receipt: {
      orNumber: "2026-98442",
      receiptPhoto: null,
      paidAt: "January 13, 2026",
    },
    pass: {
      passNumber: "S-001",
      qrData: "RSU-VPASS:S-001:RSU 2026:2023-00192",
      validUntil: "December 31, 2026",
      status: "ACTIVE",
    },
  },
];

export const CAMPUS_GATES = [
  { id: "Gate 1", name: "Gate 1" },
  { id: "Gate 2", name: "Gate 2" },
  { id: "Gate 3", name: "Gate 3" },
  { id: "Gate 4", name: "Gate 4" },
];

export const DEFAULT_SETTINGS = {
  academicYear: "2026-2027",
  passValidityType: "ONE_YEAR", // Exactly 1 year from issuance
  renewalWindowDays: "30",
  motorcycleFee: "150",
  fourWheelFee: "300",
  commercialFee: "500",
  studentScanPolicy: "SPOT_CHECK", // 'SPOT_CHECK' | 'STRICT_SCAN'
  employeeLoggingEnforced: true,
  defaultVisitorStayDays: "1",
  maxVisitorStayDays: "7",
  scannerAudioEnabled: true,
  campusName: "Romblon State University • Odiongan Main Campus",
  primaryGate: "Gate 1",
};

/**
 * Checks whether a vehicle pass has expired
 * Checks both status === 'EXPIRED' and date bounds (expiresAt / validUntil)
 */
export const isPassExpired = (pass) => {
  if (!pass) return false;
  if (pass.status === "EXPIRED" || pass.status === "REVOKED") return true;
  if (pass.expiresAt) {
    return new Date(pass.expiresAt).getTime() < Date.now();
  }
  if (pass.validUntil) {
    const d = new Date(pass.validUntil);
    if (!isNaN(d.getTime())) {
      d.setHours(23, 59, 59, 999);
      return d.getTime() < Date.now();
    }
  }
  return false;
};

/**
 * Calculates exactly 1 year of validity from a given date
 * (e.g. Oct 10, 2026 -> Oct 10, 2027)
 */
export const calculateOneYearExpiry = (startDate = new Date()) => {
  const d = new Date(startDate);
  const exp = new Date(d);
  exp.setFullYear(exp.getFullYear() + 1);
  const formatted = exp.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return {
    expiresAt: exp.toISOString(),
    validUntil: formatted,
  };
};

const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    type: "PASS_ISSUED",
    title: "Vehicle Pass Activated",
    message:
      "Your Pass E-001 for Honda Click 125 (XYZ 5678) is active for Academic Year 2026.",
    time: "2 hours ago",
    date: new Date().toISOString(),
    read: false,
    link: "/client/vehicle-pass",
    appId: "APP-2026-0001",
  },
  {
    id: "notif-2",
    type: "RECEIPT_VERIFIED",
    title: "Cashier Payment Confirmed",
    message:
      "OR #2026-98123 has been recorded and verified by PASO Administration.",
    time: "1 day ago",
    date: new Date(Date.now() - 86400000).toISOString(),
    read: true,
    link: "/client/vehicle-pass",
    appId: "APP-2026-0001",
  },
];

const INITIAL_VISITORS = [
  {
    id: "TMP-2026-0042",
    name: "Dr. Maria Santos",
    contact: "+63 917 888 1234",
    idPresented: "PRC License #0129841",
    plateNumber: "NBM 9012",
    vehicleType: "Sedan (Silver Vios)",
    destination: "Office of the President (Admin Bldg)",
    purpose: "Guest Lecturer / Meeting",
    validDays: 1,
    validUntil: "Today • 11:59 PM (1 Day)",
    entryGate: "Gate 1",
    entryTime: "09:30 AM Today",
    status: "INSIDE", // 'INSIDE' | 'EXITED'
    exitGate: null,
    exitTime: null,
    classification: "VISITOR",
    qrData: "RSU-VPASS:TMP-2026-0042:NBM9012:VISITOR",
  },
  {
    id: "TMP-2026-0038",
    name: "Engr. Carlos Mendoza (Delegate)",
    contact: "+63 919 555 4321",
    idPresented: "Driver's License #N02-18-99999",
    plateNumber: "ABC 5678",
    vehicleType: "SUV (White Fortuner)",
    destination: "College of Engineering & Technology (CET)",
    purpose: "Regional IT Conference Delegate",
    validDays: 3,
    validUntil: "Sept 26, 2026 • 11:59 PM (3 Days)",
    entryGate: "Gate 2",
    entryTime: "Yesterday • 08:15 AM",
    status: "INSIDE",
    exitGate: null,
    exitTime: null,
    classification: "VISITOR",
    qrData: "RSU-VPASS:TMP-2026-0038:ABC5678:VISITOR",
  },
  {
    id: "TMP-2026-0029",
    name: "LBC Express Courier (Delivery)",
    contact: "+63 920 111 2233",
    idPresented: "Company ID #LBC-8891",
    plateNumber: "XYZ 9921",
    vehicleType: "Delivery Van",
    destination: "Supply & Property Office",
    purpose: "Campus Equipment Delivery",
    validDays: 1,
    validUntil: "Today • 11:59 PM (1 Day)",
    entryGate: "Gate 1",
    entryTime: "08:45 AM Today",
    status: "EXITED",
    exitGate: "Gate 3",
    exitTime: "10:15 AM Today",
    classification: "VISITOR",
    qrData: "RSU-VPASS:TMP-2026-0029:XYZ9921:VISITOR",
  },
];

const INITIAL_LOGS = [
  {
    id: 1,
    passNumber: "E-001",
    plateNumber: "XYZ 5678",
    owner: "Prof. Juan Dela Cruz",
    classification: "EMPLOYEE",
    type: "ENTRY",
    gate: "Gate 1",
    time: "07:45 AM Today",
    status: "VALID",
  },
  {
    id: 2,
    passNumber: "TMP-2026-0042",
    plateNumber: "NBM 9012",
    owner: "Dr. Maria Santos",
    classification: "VISITOR",
    type: "ENTRY",
    gate: "Gate 1",
    time: "09:30 AM Today",
    status: "VALID",
  },
  {
    id: 3,
    passNumber: "TMP-2026-0029",
    plateNumber: "XYZ 9921",
    owner: "LBC Express Courier",
    classification: "VISITOR",
    type: "EXIT",
    gate: "Gate 3",
    time: "10:15 AM Today",
    status: "VALID",
  },
  {
    id: 4,
    passNumber: "S-001",
    plateNumber: "RSU 2026",
    owner: "Chrizhel Anne Cuenco",
    classification: "STUDENT",
    type: "ENTRY",
    gate: "Gate 2",
    time: "10:30 AM Today",
    status: "VALID",
  },
];

/**
 * Determines the consistent, database-backed sequential pass number (e.g. S-001, S-002, E-001, E-002).
 * Sequence order is strictly determined by:
 * 1. Already issued pass number (app.pass?.passNumber)
 * 2. Already assigned pass number upon compliance (app.assignedPassNumber)
 * 3. Compliance order (who complied first by submitting cashier receipt)
 * 4. Application registration / database order
 */
export const getSequentialPassNumber = (targetApp, allApplications = []) => {
  if (!targetApp) return "S-001";

  const isStudent = (targetApp.classification || "").toLowerCase().includes("student");
  const prefix = isStudent ? "S" : "E";

  // 1. If this application already has an issued pass number, preserve it consistently
  if (targetApp.pass?.passNumber) {
    const raw = String(targetApp.pass.passNumber).trim().toUpperCase();
    const matchSE = raw.match(/^([SE])-?(\d+)$/);
    if (matchSE) {
      return `${matchSE[1]}-${String(parseInt(matchSE[2], 10)).padStart(3, "0")}`;
    }
    const matchNum = raw.match(/(\d+)$/);
    if (matchNum && parseInt(matchNum[1], 10) < 1000) {
      return `${prefix}-${String(parseInt(matchNum[1], 10)).padStart(3, "0")}`;
    }
  }

  // 2. If this application already has an assigned sequential pass number, preserve it
  if (targetApp.assignedPassNumber) {
    const raw = String(targetApp.assignedPassNumber).trim().toUpperCase();
    const matchSE = raw.match(/^([SE])-?(\d+)$/);
    if (matchSE) {
      return `${matchSE[1]}-${String(parseInt(matchSE[2], 10)).padStart(3, "0")}`;
    }
  }

  // 3. Filter applications belonging to the same classification (Student vs Employee)
  const sameCategoryApps = (allApplications || []).filter((a) => {
    const aIsStudent = (a.classification || "").toLowerCase().includes("student");
    return aIsStudent === isStudent;
  });

  // Collect all already issued / locked pass sequence numbers (< 1000 to ignore legacy Math.random numbers)
  const issuedSeqNumbers = new Set();
  sameCategoryApps.forEach((a) => {
    if (a.id === targetApp.id) return;
    const existing = a.pass?.passNumber || a.assignedPassNumber;
    if (existing) {
      const m = String(existing).match(/(\d+)$/);
      if (m) {
        const val = parseInt(m[1], 10);
        if (val > 0 && val < 1000) {
          issuedSeqNumbers.add(val);
        }
      }
    }
  });

  // Helper to extract compliance timestamp
  const getComplianceTime = (app) => {
    if (app.receipt?.compliedAt) {
      const t = new Date(app.receipt.compliedAt).getTime();
      if (!isNaN(t)) return t;
    }
    if (app.receipt?.submittedAt) {
      const t = new Date(app.receipt.submittedAt).getTime();
      if (!isNaN(t)) return t;
    }
    if (app.submittedDate) {
      const t = new Date(app.submittedDate).getTime();
      if (!isNaN(t)) return t;
    }
    return 9999999999999;
  };

  // Find next available sequential number starting from 1
  let nextSeq = 1;
  while (issuedSeqNumbers.has(nextSeq)) {
    nextSeq++;
  }

  // Among pending complying applications without an assigned pass number,
  // order them by compliance time to see which slot this application takes
  const pendingComplyingApps = sameCategoryApps
    .filter((a) => {
      if (a.pass?.passNumber) return false;
      if (a.assignedPassNumber) return false;
      return !!(a.receipt?.receiptPhoto || a.receipt?.orNumber || a.status === "RECEIPT_SUBMITTED");
    })
    .sort((a, b) => {
      const timeA = getComplianceTime(a);
      const timeB = getComplianceTime(b);
      if (timeA !== timeB) return timeA - timeB;
      return String(a.id).localeCompare(String(b.id));
    });

  const appIndex = pendingComplyingApps.findIndex((a) => a.id === targetApp.id);
  if (appIndex > 0) {
    let count = 0;
    while (count < appIndex) {
      nextSeq++;
      if (!issuedSeqNumbers.has(nextSeq)) {
        count++;
      }
    }
  }

  return `${prefix}-${String(nextSeq).padStart(3, "0")}`;
};

export const PassProvider = ({ children }) => {
  const [applications, setApplications] = useState(() => {
    const saved = localStorage.getItem("vpass_applications");
    const rawList = saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
    // Normalize legacy pass numbers
    return rawList.map((app) => {
      if (app.pass?.passNumber) {
        const isStudent = (app.classification || "").toLowerCase().includes("student");
        const prefix = isStudent ? "S" : "E";
        const clean = String(app.pass.passNumber).trim().toUpperCase();
        if (clean.startsWith("VP-") || (/^\d+$/.test(clean) && parseInt(clean, 10) >= 1000)) {
          let seqNum = 1;
          if (app.id === "APP-2026-0089") seqNum = 1;
          else if (app.id === "APP-2026-0001") seqNum = 1;
          else {
            const m = clean.match(/(\d+)$/);
            const val = m ? parseInt(m[1], 10) : 1;
            seqNum = val < 1000 ? val : 1;
          }
          const normPass = `${prefix}-${String(seqNum).padStart(3, "0")}`;
          return {
            ...app,
            pass: {
              ...app.pass,
              passNumber: normPass,
              qrData: `RSU-VPASS:${normPass}:${app.vehicle?.plateNumber || ""}:${app.school_id || ""}`,
            },
          };
        }
      }
      // Clean up legacy random assignedPassNumber
      if (
        app.assignedPassNumber &&
        (!/^[SE]-\d{3}$/i.test(app.assignedPassNumber) ||
          parseInt(app.assignedPassNumber.slice(2), 10) >= 1000)
      ) {
        const { assignedPassNumber, ...rest } = app;
        return rest;
      }
      return app;
    });
  });

  const [vehicles, setVehicles] = useState(() => {
    const saved = localStorage.getItem("vpass_vehicles");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            make: "Honda",
            model: "Click 125",
            year: 2023,
            color: "Black",
            plateNumber: "XYZ 5678",
            type: "Motorcycle",
            status: "Active Pass",
          },
          {
            id: 2,
            make: "Yamaha",
            model: "Mio Sporty",
            year: 2024,
            color: "Matte Blue",
            plateNumber: "RSU 2026",
            type: "Motorcycle",
            status: "Active Pass",
          },
        ];
  });

  // Auto-saved In-Progress Draft Application
  const [draftApplication, setDraftApplication] = useState(() => {
    const saved = localStorage.getItem("vpass_registration_draft");
    return saved ? JSON.parse(saved) : null;
  });

  // Persistent Temporary Visitor Passes
  const [visitorPasses, setVisitorPasses] = useState(() => {
    const saved = localStorage.getItem("vpass_visitor_passes");
    return saved ? JSON.parse(saved) : INITIAL_VISITORS;
  });

  // Persistent Gate Audit Logs
  const [gateLogs, setGateLogs] = useState(() => {
    const saved = localStorage.getItem("vpass_gate_logs");
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  // Guard Active Gate Shift Post (Gate 1, Gate 2, Gate 3, Gate 4)
  const [activeGate, setActiveGateState] = useState(() => {
    return localStorage.getItem("vpass_active_gate") || "Gate 1";
  });

  const setActiveGate = (gate) => {
    setActiveGateState(gate);
    localStorage.setItem("vpass_active_gate", gate);
  };

  // Persistent System Settings (Academic Year, Sticker Fees, Expiration Rules)
  const [systemSettings, setSystemSettings] = useState(() => {
    const saved = localStorage.getItem("vpass_admin_settings");
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  const updateSystemSettings = (newSettings) => {
    setSystemSettings((prev) => {
      const updated = typeof newSettings === "function" ? newSettings(prev) : { ...prev, ...newSettings };
      localStorage.setItem("vpass_admin_settings", JSON.stringify(updated));
      return updated;
    });
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("vpass_applications", JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem("vpass_vehicles", JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    if (draftApplication) {
      localStorage.setItem(
        "vpass_registration_draft",
        JSON.stringify(draftApplication),
      );
    } else {
      localStorage.removeItem("vpass_registration_draft");
    }
  }, [draftApplication]);

  useEffect(() => {
    localStorage.setItem("vpass_visitor_passes", JSON.stringify(visitorPasses));
  }, [visitorPasses]);

  // Persistent Notifications
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("vpass_notifications");
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  useEffect(() => {
    localStorage.setItem("vpass_notifications", JSON.stringify(notifications));
  }, [notifications]);

  // Helper to add a notification
  const addNotification = ({ type, title, message, link, appId }) => {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      title,
      message,
      link: link || "/client/applications",
      appId,
      time: "Just now",
      date: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    return newNotif;
  };

  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  useEffect(() => {
    localStorage.setItem("vpass_gate_logs", JSON.stringify(gateLogs));
  }, [gateLogs]);

  // Multi-tab storage synchronization so actions taken in Admin or Client tabs sync in real time
  useEffect(() => {
    const handleStorageChange = (e) => {
      try {
        if (e.key === "vpass_notifications" && e.newValue) {
          setNotifications(JSON.parse(e.newValue));
        }
        if (e.key === "vpass_applications" && e.newValue) {
          setApplications(JSON.parse(e.newValue));
        }
        if (e.key === "vpass_vehicles" && e.newValue) {
          setVehicles(JSON.parse(e.newValue));
        }
      } catch (err) {
        console.error("Storage sync parse error:", err);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Self-healing synchronization: keep `vehicles` aligned with `applications`
  useEffect(() => {
    if (!applications || applications.length === 0) return;

    setVehicles((prev) => {
      let changed = false;
      let nextVehicles = [...prev];

      applications.forEach((app) => {
        if (!app.vehicle?.plateNumber) return;
        const appPlateClean = app.vehicle.plateNumber.replace(/\s+/g, "").toUpperCase();

        const expectedStatus =
          app.status === "PASS_ISSUED" && app.pass
            ? "Active Pass"
            : app.status === "RECEIPT_SUBMITTED"
            ? "Receipt Under Verification"
            : app.status === "APPROVED"
            ? "Payment Pending"
            : app.status === "REJECTED"
            ? "Correction Required"
            : "Pending Review";

        // Check if there is an exact match by appId or plateNumber
        const existingIdx = nextVehicles.findIndex(
          (v) =>
            (v.appId && v.appId === app.id) ||
            (v.plateNumber && v.plateNumber.replace(/\s+/g, "").toUpperCase() === appPlateClean)
        );

        if (existingIdx !== -1) {
          const current = nextVehicles[existingIdx];
          if (
            current.plateNumber !== app.vehicle.plateNumber ||
            current.status !== expectedStatus ||
            current.make !== app.vehicle.make ||
            current.model !== app.vehicle.model ||
            current.year !== app.vehicle.year ||
            current.color !== app.vehicle.color ||
            current.type !== app.vehicle.type ||
            current.appId !== app.id
          ) {
            changed = true;
            nextVehicles[existingIdx] = {
              ...current,
              appId: app.id,
              make: app.vehicle.make || current.make,
              model: app.vehicle.model || current.model,
              year: app.vehicle.year || current.year,
              color: app.vehicle.color || current.color,
              type: app.vehicle.type || current.type,
              plateNumber: app.vehicle.plateNumber,
              status: expectedStatus,
            };
          }
        } else {
          // If no exact match: check if there's an orphaned vehicle (e.g. from a pre-edit plate change like '123 QWE' -> '123 ZTE')
          const orphanIdx = nextVehicles.findIndex(
            (v) =>
              !applications.some(
                (a) =>
                  (a.vehicle?.plateNumber || "").replace(/\s+/g, "").toUpperCase() ===
                  (v.plateNumber || "").replace(/\s+/g, "").toUpperCase()
              ) &&
              (v.make?.toLowerCase() === app.vehicle.make?.toLowerCase() ||
               (v.id && Date.now() - v.id < 86400000 * 7))
          );

          if (orphanIdx !== -1) {
            changed = true;
            nextVehicles[orphanIdx] = {
              ...nextVehicles[orphanIdx],
              appId: app.id,
              make: app.vehicle.make,
              model: app.vehicle.model,
              year: app.vehicle.year,
              color: app.vehicle.color,
              type: app.vehicle.type,
              plateNumber: app.vehicle.plateNumber,
              status: expectedStatus,
            };
          } else {
            changed = true;
            nextVehicles.push({
              id: Date.now() + Math.random(),
              appId: app.id,
              make: app.vehicle.make,
              model: app.vehicle.model,
              year: app.vehicle.year,
              color: app.vehicle.color,
              plateNumber: app.vehicle.plateNumber,
              type: app.vehicle.type,
              status: expectedStatus,
            });
          }
        }
      });

      return changed ? nextVehicles : prev;
    });
  }, [applications]);

  // Self-healing synchronization: guarantee notifications for any issued passes
  useEffect(() => {
    if (!applications || applications.length === 0) return;

    setNotifications((prev) => {
      let changed = false;
      const nextNotifs = [...prev];

      applications.forEach((app) => {
        if (app.status === "PASS_ISSUED" && app.pass) {
          const passNum = app.pass.passNumber || app.assignedPassNumber;
          const alreadyNotified = nextNotifs.some(
            (n) =>
              (n.appId && n.appId === app.id && n.type === "PASS_ISSUED") ||
              (n.message && passNum && n.message.includes(passNum))
          );

          if (!alreadyNotified) {
            changed = true;
            nextNotifs.unshift({
              id: `notif-issued-${app.id}`,
              type: "PASS_ISSUED",
              title: "Official Gate QR Pass Issued!",
              message: `Your Cashier receipt has been verified! Gate Pass ${passNum || "Activated"} for ${app.vehicle?.make || "Vehicle"} (${app.vehicle?.plateNumber}) is now active for Academic Year ${systemSettings?.academicYear || "2026-2027"}.`,
              link: "/client/vehicle-pass",
              appId: app.id,
              time: "Just now",
              date: new Date().toISOString(),
              read: false,
            });
          }
        }
      });

      return changed ? nextNotifs : prev;
    });
  }, [applications, systemSettings?.academicYear]);

  // Save/Update Draft
  const saveDraft = (data, step = 1) => {
    const updatedDraft = {
      step,
      data,
      lastSaved: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      dateFormatted: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
    setDraftApplication(updatedDraft);
  };

  // Discard Draft
  const clearDraft = () => {
    setDraftApplication(null);
    localStorage.removeItem("vpass_registration_draft");
  };

  // Submit new registration (Milestone 1)
  const submitApplication = (formData) => {
    const newId = `APP-2026-${String(applications.length + 1).padStart(4, "0")}`;
    const newApp = {
      id: newId,
      user_id: 1,
      applicant_name: formData.applicant_name,
      school_id: formData.school_id,
      classification: formData.classification || "Student",
      department: formData.department,
      contact_number: formData.contact_number,
      applicant_photo: formData.applicant_photo, // Live captured image
      vehicle: {
        make: formData.make,
        model: formData.model,
        year: formData.year,
        color: formData.color,
        plateNumber: formData.plateNumber,
        type: formData.type,
      },
      documents: {
        driverLicense: formData.driverLicense || "Uploaded Document",
        orCr: formData.orCr || "Uploaded Document",
      },
      status: "PENDING",
      rejection_reason: null,
      submittedDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      receipt: null,
      pass: null,
    };

    setApplications((prev) => [newApp, ...prev]);

    // Also register into vehicles list
    setVehicles((prev) => [
      {
        id: Date.now(),
        appId: newApp.id,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        color: formData.color,
        plateNumber: formData.plateNumber,
        type: formData.type,
        status: "Pending Review",
      },
      ...prev,
    ]);

    return newApp;
  };

  // PASO Admin Review (Milestone 2)
  const reviewApplication = (appId, decision, remarks = "") => {
    const targetApp = (applications || []).find((a) => a.id === appId);

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          return {
            ...app,
            status: decision,
            rejection_reason: decision === "REJECTED" ? remarks : null,
          };
        }
        return app;
      }),
    );

    // Auto-notify the client of registration decision
    if (targetApp) {
      if (decision === "APPROVED") {
        addNotification({
          type: "REGISTRATION_APPROVED",
          title: "Vehicle Registration Approved!",
          message: `Your registration for ${targetApp.vehicle?.make || "Vehicle"} ${targetApp.vehicle?.model || ""} (${targetApp.vehicle?.plateNumber}) was approved by PASO. You may now pay at the Cashier window and upload your receipt.`,
          link: `/client/payments?appId=${appId}`,
          appId,
        });
      } else if (decision === "REJECTED") {
        addNotification({
          type: "REGISTRATION_REJECTED",
          title: "Registration Form Needs Correction",
          message: `PASO returned your application for ${targetApp.vehicle?.make || "Vehicle"} (${targetApp.vehicle?.plateNumber}). Note: "${remarks}". Click to correct mistakes and re-submit.`,
          link: `/client/applications`,
          appId,
        });
      }
    }
  };

  // Cashier Payment & Receipt Upload (Milestone 3: Client uploads receipt -> Awaiting PASO Verification)
  const submitReceiptPayment = (appId, orNumber, receiptPhoto) => {
    const now = new Date();
    const submittedAt = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const compliedAt = now.toISOString();
    let targetedVehiclePlate = null;

    setApplications((prev) => {
      const target = prev.find((a) => a.id === appId);
      const assignedPassNum = target
        ? getSequentialPassNumber(target, prev)
        : null;

      return prev.map((app) => {
        if (app.id === appId) {
          targetedVehiclePlate = app.vehicle?.plateNumber;
          return {
            ...app,
            status: "RECEIPT_SUBMITTED",
            rejection_reason: null,
            receiptRejectionRemark: null,
            assignedPassNumber: app.assignedPassNumber || assignedPassNum,
            receipt: {
              orNumber,
              receiptPhoto,
              submittedAt,
              compliedAt,
              status: "PENDING_VERIFICATION",
            },
          };
        }
        return app;
      });
    });

    // Update vehicle status to Receipt Under Verification
    setVehicles((prev) =>
      prev.map((v) => {
        if (targetedVehiclePlate && v.plateNumber === targetedVehiclePlate) {
          return {
            ...v,
            status: "Receipt Under Verification",
          };
        }
        return v;
      }),
    );
  };

  // PASO Admin Verifies Cashier Receipt & Generates Official Gate QR Pass (Milestone 4 - Exactly 1 Year Validity)
  const verifyReceiptAndIssuePass = (appId, customDetails = {}) => {
    const targetApp = (applications || []).find((a) => a.id === appId);
    if (!targetApp) return;

    const generatedPassNum =
      customDetails.passNumber ||
      targetApp.pass?.passNumber ||
      targetApp.assignedPassNumber ||
      getSequentialPassNumber(targetApp, applications);

    const now = new Date();
    const oneYear = calculateOneYearExpiry(now);
    const acadYear = systemSettings?.academicYear || "2026-2027";
    const vehiclePlate = targetApp.vehicle?.plateNumber;

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          const passInfo = {
            passNumber: generatedPassNum,
            qrData:
              customDetails.qrData ||
              targetApp.pass?.qrData ||
              `RSU-VPASS:${generatedPassNum}:${app.vehicle?.plateNumber || ""}:${app.school_id || ""}`,
            validUntil: customDetails.validUntil || oneYear.validUntil,
            expiresAt: customDetails.expiresAt || oneYear.expiresAt,
            academicYear: acadYear,
            status: "ACTIVE",
            issuedAt: now.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            }),
            verifiedBy: "PASO Administration Officer",
          };

          return {
            ...app,
            status: "PASS_ISSUED",
            assignedPassNumber: generatedPassNum,
            isRenewal: false,
            renewalPending: false,
            receipt: {
              ...(app.receipt || {}),
              verifiedAt: now.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              }),
              status: "VERIFIED",
            },
            pass: passInfo,
          };
        }
        return app;
      }),
    );

    // Update vehicle status to Active Pass
    setVehicles((prev) =>
      prev.map((v) => {
        const cleanV = (v.plateNumber || "").replace(/\s+/g, "").toUpperCase();
        const cleanTarget = (vehiclePlate || "").replace(/\s+/g, "").toUpperCase();
        if (cleanV === cleanTarget || (v.appId && v.appId === appId)) {
          return {
            ...v,
            appId,
            status: "Active Pass",
          };
        }
        return v;
      }),
    );

    // Auto-notify client of active QR Pass release
    addNotification({
      type: "PASS_ISSUED",
      title: "Official Gate QR Pass Issued!",
      message: `Your Cashier receipt has been verified! Gate Pass ${generatedPassNum} for ${targetApp.vehicle?.make || "Vehicle"} (${targetApp.vehicle?.plateNumber}) is now active for Academic Year ${acadYear}.`,
      link: "/client/vehicle-pass",
      appId,
    });
  };

  // Reject Receipt (e.g. unreadable photo or mismatched payment amount)
  const rejectReceipt = (appId, remarks) => {
    const targetApp = (applications || []).find((a) => a.id === appId);

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          return {
            ...app,
            status: "APPROVED", // Return to approved payment step so client can re-upload
            receiptRejectionRemark:
              remarks || "Cashier receipt image is unreadable or invalid.",
            receipt: {
              ...(app.receipt || {}),
              status: "REJECTED",
              rejectionRemark: remarks,
            },
          };
        }
        return app;
      }),
    );

    // Auto-notify client that receipt was declined with reason
    if (targetApp) {
      addNotification({
        type: "RECEIPT_REJECTED",
        title: "Cashier Receipt Declined",
        message: `Cashier receipt for ${targetApp.vehicle?.make || "Vehicle"} (${targetApp.vehicle?.plateNumber}) was declined by PASO. Note: "${remarks}". Please re-upload your valid receipt.`,
        link: `/client/payments?appId=${appId}`,
        appId,
      });
    }
  };

  // Re-submit an application that was previously returned/rejected by PASO
  const resubmitApplication = (appId, updatedData) => {
    const targetApp = (applications || []).find((a) => a.id === appId);
    const oldPlateNumber = targetApp?.vehicle?.plateNumber;

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          return {
            ...app,
            applicant_name: updatedData.applicant_name || app.applicant_name,
            school_id: updatedData.school_id || app.school_id,
            classification: updatedData.classification || app.classification,
            department: updatedData.department || app.department,
            contact_number: updatedData.contact_number || app.contact_number,
            applicant_photo: updatedData.applicant_photo || app.applicant_photo,
            vehicle: {
              make: updatedData.make || app.vehicle?.make,
              model: updatedData.model || app.vehicle?.model,
              year: updatedData.year || app.vehicle?.year,
              color: updatedData.color || app.vehicle?.color,
              plateNumber: updatedData.plateNumber || app.vehicle?.plateNumber,
              type: updatedData.type || app.vehicle?.type,
            },
            documents: {
              driverLicense:
                updatedData.driverLicense || app.documents?.driverLicense,
              orCr: updatedData.orCr || app.documents?.orCr,
            },
            status: "PENDING", // Returns back to Milestone 2 queue
            rejection_reason: null,
            resubmittedDate: new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          };
        }
        return app;
      }),
    );

    // Update vehicle status back to Pending Review and sync specs/plate
    setVehicles((prev) => {
      const cleanOld = (oldPlateNumber || "").replace(/\s+/g, "").toUpperCase();
      const cleanNew = (updatedData.plateNumber || "").replace(/\s+/g, "").toUpperCase();

      let matched = false;
      const updatedList = prev.map((v) => {
        const cleanV = (v.plateNumber || "").replace(/\s+/g, "").toUpperCase();
        if ((v.appId && v.appId === appId) || cleanV === cleanOld || cleanV === cleanNew) {
          matched = true;
          return {
            ...v,
            appId,
            make: updatedData.make || v.make,
            model: updatedData.model || v.model,
            year: updatedData.year || v.year,
            color: updatedData.color || v.color,
            type: updatedData.type || v.type,
            plateNumber: updatedData.plateNumber || v.plateNumber,
            status: "Pending Review",
          };
        }
        return v;
      });

      if (!matched) {
        return [
          {
            id: Date.now(),
            appId,
            make: updatedData.make,
            model: updatedData.model,
            year: updatedData.year,
            color: updatedData.color,
            plateNumber: updatedData.plateNumber,
            type: updatedData.type,
            status: "Pending Review",
          },
          ...updatedList,
        ];
      }
      return updatedList;
    });

    addNotification({
      type: "APPLICATION_RESUBMITTED",
      title: "Registration Corrected & Re-submitted",
      message: `Your corrected vehicle registration for ${updatedData.make} ${updatedData.model} (${updatedData.plateNumber}) has been sent to PASO for re-evaluation.`,
      link: "/client/applications",
      appId,
    });
  };

  // Submit Pass Renewal Application (Pre-filled vehicle data, FRESH LIVE SELFIE REQUIRED, preserves S-number & QR code)
  const submitRenewalApplication = (appId, renewalData) => {
    let preservedPassNumber = null;
    let preservedQrData = null;

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          preservedPassNumber =
            app.pass?.passNumber ||
            app.assignedPassNumber ||
            `S-${systemSettings.academicYear?.split("-")[0] || "2026"}-0001`;

          preservedQrData =
            app.pass?.qrData ||
            `RSU-VPASS:${preservedPassNumber}:${renewalData.plateNumber || app.vehicle?.plateNumber || ""}:${renewalData.school_id || app.school_id || ""}`;

          return {
            ...app,
            isRenewal: true,
            renewalPending: true,
            applicant_name: renewalData.applicant_name || app.applicant_name,
            school_id: renewalData.school_id || app.school_id,
            classification: renewalData.classification || app.classification,
            department: renewalData.department || app.department,
            contact_number: renewalData.contact_number || app.contact_number,
            applicant_photo: renewalData.applicant_photo, // REQUIRED: Fresh live selfie from student
            vehicle: {
              ...(app.vehicle || {}),
              make: renewalData.make || app.vehicle?.make,
              model: renewalData.model || app.vehicle?.model,
              year: renewalData.year || app.vehicle?.year,
              color: renewalData.color || app.vehicle?.color,
              plateNumber: renewalData.plateNumber || app.vehicle?.plateNumber,
              type: renewalData.type || app.vehicle?.type,
            },
            documents: {
              driverLicense: renewalData.driverLicense || app.documents?.driverLicense,
              orCr: renewalData.orCr || app.documents?.orCr,
            },
            assignedPassNumber: preservedPassNumber,
            pass: app.pass
              ? {
                  ...app.pass,
                  passNumber: preservedPassNumber,
                  qrData: preservedQrData,
                  status: "EXPIRED", // Remains expired until cashier payment & admin verification
                }
              : null,
            status: "PENDING", // Sent to PASO Admin for Renewal Evaluation
            rejection_reason: null,
            receipt: null, // Reset for new cashier renewal receipt upload
            receiptRejectionRemark: null,
            renewalSubmittedAt: new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          };
        }
        return app;
      })
    );

    setVehicles((prev) =>
      prev.map((v) => {
        const vPlate = (v.plateNumber || "").replace(/\s+/g, "").toUpperCase();
        const targetPlate = (renewalData.plateNumber || "").replace(/\s+/g, "").toUpperCase();
        if (vPlate === targetPlate) {
          return {
            ...v,
            status: "Renewal Pending Review",
          };
        }
        return v;
      })
    );

    addNotification({
      type: "RENEWAL_SUBMITTED",
      title: "Pass Renewal Application Submitted",
      message: `Your annual renewal application for ${renewalData.make || "Vehicle"} (${renewalData.plateNumber}) with updated photo verification was submitted to PASO.`,
      link: "/client/applications",
      appId,
    });
  };

  // Add Gate Log (Records Employee Entry/Exit, Student Spot-Check, or Visitor Event)
  const addGateLog = (logData) => {
    const timeStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dateStr = new Date().toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const gateStation = logData.gate || activeGate || "Gate 1";

    const newLog = {
      id: Date.now(),
      passNumber: logData.passNumber,
      plateNumber: logData.plateNumber,
      owner: logData.owner,
      classification: logData.classification || "EMPLOYEE",
      type: logData.type || "ENTRY",
      gate: gateStation,
      time: `${timeStr} Today`,
      date: dateStr,
      status: logData.status || "VALID",
    };
    setGateLogs((prev) => [newLog, ...prev]);
    return newLog;
  };

  // Issue New Visitor Pass (1-to-7 days duration)
  const issueVisitorPass = (visitorForm) => {
    const passId = `TMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const days = parseInt(visitorForm.validityDuration, 10) || 1;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (days - 1));
    const expiryStr =
      days === 1
        ? "Today • 11:59 PM (1 Day)"
        : `${expiryDate.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })} (${days} Days)`;

    const timeStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dateStr = new Date().toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const currentPost = visitorForm.gate || activeGate || "Gate 1";

    const newVisitor = {
      id: passId,
      name: visitorForm.name.trim(),
      contact: visitorForm.contact.trim() || "N/A",
      idPresented: visitorForm.idPresented || "Driver's License",
      plateNumber: visitorForm.plateNumber.trim().toUpperCase(),
      vehicleType: visitorForm.vehicleType || "Motorcycle",
      destination: visitorForm.destination,
      purpose: visitorForm.purpose,
      validDays: days,
      validUntil: expiryStr,
      entryGate: currentPost,
      entryTime: `${timeStr} Today`,
      entryDate: dateStr,
      status: "INSIDE",
      exitGate: null,
      exitTime: null,
      exitDate: null,
      classification: "VISITOR",
      qrData: `RSU-VPASS:${passId}:${visitorForm.plateNumber.trim().toUpperCase().replace(/\\s+/g, "")}:VISITOR`,
    };

    setVisitorPasses((prev) => [newVisitor, ...prev]);

    // Also auto-record initial ENTRY log with active gate
    addGateLog({
      passNumber: newVisitor.id,
      plateNumber: newVisitor.plateNumber,
      owner: newVisitor.name,
      classification: "VISITOR",
      type: "ENTRY",
      gate: currentPost,
      status: "VALID",
    });

    return newVisitor;
  };

  // Log Visitor Exit (1-tap Departure)
  const logVisitorExit = (idOrPlate) => {
    const timeStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dateStr = new Date().toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const currentPost = activeGate || "Gate 1";
    let visitorFound = null;

    setVisitorPasses((prev) =>
      prev.map((v) => {
        if (v.id === idOrPlate || v.plateNumber === idOrPlate) {
          visitorFound = v;
          return {
            ...v,
            status: "EXITED",
            exitGate: currentPost,
            exitTime: `${timeStr} Today`,
            exitDate: dateStr,
          };
        }
        return v;
      }),
    );

    if (visitorFound) {
      addGateLog({
        passNumber: visitorFound.id,
        plateNumber: visitorFound.plateNumber,
        owner: visitorFound.name,
        classification: "VISITOR",
        type: "EXIT",
        gate: currentPost,
        status: "VALID",
      });
    }
  };


  // Extend Visitor Stay (Adds days for visitor already INSIDE campus, WITHOUT duplicate ENTRY log)
  const extendVisitorPass = (idOrPlate, additionalDays = 1) => {
    let extendedItem = null;

    setVisitorPasses((prev) =>
      prev.map((v) => {
        if (v.id === idOrPlate || v.plateNumber === idOrPlate) {
          const currentDays = parseInt(v.validDays, 10) || 1;
          const newDays = currentDays + additionalDays;
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + additionalDays);
          const expiryStr = `${expiryDate.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })} (${newDays} Days Extended)`;

          extendedItem = {
            ...v,
            validDays: newDays,
            validUntil: expiryStr,
            status: "INSIDE", // Stays inside campus
          };
          return extendedItem;
        }
        return v;
      }),
    );

    return extendedItem;
  };

  // Automatic / Manual Pass Renewal for a Specific Registered Vehicle
  const initiatePassRenewal = (plateNumber) => {
    const cleanPlate = (plateNumber || "").replace(/\s+/g, "").toUpperCase();
    let renewedApp = null;
    setApplications((prev) =>
      prev.map((app) => {
        const appPlate = (app.vehicle?.plateNumber || "").replace(/\s+/g, "").toUpperCase();
        if (appPlate === cleanPlate) {
          renewedApp = app;
          return {
            ...app,
            status: "APPROVED", // Directly unlocks Milestone 3 Cashier payment for renewed period
            renewalPending: true,
            receiptRejectionRemark: null,
            pass: {
              ...(app.pass || {}),
              status: "EXPIRED",
            },
          };
        }
        return app;
      })
    );

    setVehicles((prev) =>
      prev.map((v) => {
        const vPlate = (v.plateNumber || "").replace(/\s+/g, "").toUpperCase();
        if (vPlate === cleanPlate) {
          return {
            ...v,
            status: "Renewal Awaiting Payment",
          };
        }
        return v;
      })
    );

    if (renewedApp) {
      addNotification({
        type: "RENEWAL_OPEN",
        title: "Vehicle Pass Renewal Unlocked",
        message: `Pass renewal for ${renewedApp.vehicle?.make || "Vehicle"} (${renewedApp.vehicle?.plateNumber}) is ready for Academic Year ${systemSettings.academicYear}. Pay the fee at the Cashier window and upload your new receipt.`,
        link: `/client/payments?appId=${renewedApp.id}`,
        appId: renewedApp.id,
      });
    }
  };

  return (
    <PassContext.Provider
      value={{
        applications,
        vehicles,
        draftApplication,
        saveDraft,
        clearDraft,
        submitApplication,
        reviewApplication,
        submitReceiptPayment,
        verifyReceiptAndIssuePass,
        rejectReceipt,
        resubmitApplication,
        submitRenewalApplication,
        initiatePassRenewal,
        systemSettings,
        updateSystemSettings,
        isPassExpired,
        calculateOneYearExpiry,
        notifications,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        visitorPasses,
        gateLogs,
        activeGate,
        setActiveGate,
        CAMPUS_GATES,
        addGateLog,
        issueVisitorPass,
        logVisitorExit,
        extendVisitorPass,
        getSequentialPassNumber,
      }}
    >
      {children}
    </PassContext.Provider>
  );
};

export const usePass = () => useContext(PassContext);
