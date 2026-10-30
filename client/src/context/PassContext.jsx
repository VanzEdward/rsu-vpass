import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiRequest } from "../api/client";
import { useAuth } from "./AuthContext";
import { formatNotificationTime, getFullNotificationTimestamp } from "../utils/dateUtils";

const PassContext = createContext(null);

const INITIAL_APPLICATIONS = [];

export const CAMPUS_GATES = [
  { id: "Gate 1", name: "Gate 1" },
  { id: "Gate 2", name: "Gate 2" },
  { id: "Gate 3", name: "Gate 3" },
  { id: "Gate 4", name: "Gate 4" },
];

export const DEFAULT_SETTINGS = {
  academicYear: "2026-2027",
  passValidityType: "ACADEMIC_YEAR", // Academic Calendar (Expires July 31)
  stickerTemplateVersion: "V1", // "V1" (Pink/Red) | "V2" (Green/Blue) | "V3" (Gold/Maroon)
  renewalWindowDays: "60",
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
export const calculateAcademicYearExpiry = (academicYear = "2026-2027") => {
  const parts = String(academicYear).split("-");
  let endYear = 2027;
  if (parts.length >= 2 && !isNaN(parseInt(parts[1], 10))) {
    const raw = parseInt(parts[1], 10);
    endYear = raw < 100 ? 2000 + raw : raw;
  } else if (!isNaN(parseInt(parts[0], 10))) {
    endYear = parseInt(parts[0], 10) + 1;
  }

  // Expires July 31 at 23:59:59 (covering full academic year + summer enrollment grace period)
  const exp = new Date(endYear, 6, 31, 23, 59, 59);
  const formatted = `July 31, ${endYear}`;
  return {
    expiresAt: exp.toISOString(),
    validUntil: formatted,
    academicYear,
  };
};

export const calculateOneYearExpiry = (startDate = new Date(), academicYear = "2026-2027") => {
  return calculateAcademicYearExpiry(academicYear);
};

const INITIAL_NOTIFICATIONS = [];
const INITIAL_VISITORS = [];
const INITIAL_LOGS = [];

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

// One-time safe purge to ensure clean state without deleting active user data
const purgeLegacyDummyDataOnce = () => {
  try {
    if (localStorage.getItem("vpass_clean_storage_v3")) return;
    const vList = localStorage.getItem("vpass_vehicles") || "";
    // Only remove obsolete mock demo plate if still present from old code
    if (vList.includes("XYZ 5678")) {
      localStorage.removeItem("vpass_vehicles");
    }
    // Clean out any bloated or corrupted applications cache from earlier unsanitized uploads
    const rawApps = localStorage.getItem("vpass_applications") || "";
    if (rawApps.length > 50000) {
      localStorage.removeItem("vpass_applications");
    }
    localStorage.setItem("vpass_clean_storage_v3", "true");
  } catch (e) {
    try {
      localStorage.removeItem("vpass_applications");
    } catch (_) {}
  }
};

purgeLegacyDummyDataOnce();

// Persistent read notification ID tracker & cutoff timestamp helpers to ensure read status permanently survives server restarts
const getReadNotifIds = (userId) => {
  try {
    const userKey = userId ? `vpass_read_notifs_${userId}` : null;
    const userSaved = userKey ? localStorage.getItem(userKey) : null;
    const globalSaved = localStorage.getItem("vpass_read_notifs");
    const userList = userSaved ? JSON.parse(userSaved) : [];
    const globalList = globalSaved ? JSON.parse(globalSaved) : [];
    return Array.from(new Set([...userList, ...globalList]));
  } catch (e) {
    return [];
  }
};

const getReadCutoffTime = (userId) => {
  try {
    const userKey = userId ? `vpass_read_cutoff_${userId}` : null;
    const userVal = userKey ? localStorage.getItem(userKey) : null;
    const globalVal = localStorage.getItem("vpass_read_cutoff");
    const t = Number(userVal || globalVal || 0);
    return isNaN(t) ? 0 : t;
  } catch (e) {
    return 0;
  }
};

const setReadCutoffTime = (userId, timestamp = Date.now()) => {
  try {
    localStorage.setItem("vpass_read_cutoff", String(timestamp));
    if (userId) {
      localStorage.setItem(`vpass_read_cutoff_${userId}`, String(timestamp));
    }
  } catch (e) {}
};

const isNotifMarkedRead = (notif, userId) => {
  if (!notif) return true;
  if (notif.read === true) return true;
  const readIds = getReadNotifIds(userId);
  if (notif.id && readIds.includes(String(notif.id))) return true;
  if (notif.appId && notif.type && readIds.includes(`app-${notif.appId}-${notif.type}`)) return true;
  const cutoff = getReadCutoffTime(userId);
  if (cutoff > 0 && notif.date) {
    const notifTime = new Date(notif.date).getTime();
    if (!isNaN(notifTime) && notifTime <= cutoff) return true;
  }
  return false;
};

const persistReadNotifId = (id, userId, notif = null) => {
  try {
    if (!id && !notif) return;
    const idsToAdd = [];
    if (id) idsToAdd.push(String(id));
    if (notif?.id) idsToAdd.push(String(notif.id));
    if (notif?.appId && notif?.type) {
      idsToAdd.push(`app-${notif.appId}-${notif.type}`);
      idsToAdd.push(`notif-${String(notif.type).toLowerCase().replace(/_/g, '-')}-${notif.appId}`);
    }

    const globalRaw = localStorage.getItem("vpass_read_notifs");
    const globalList = globalRaw ? JSON.parse(globalRaw) : [];
    const mergedGlobal = Array.from(new Set([...globalList, ...idsToAdd]));
    localStorage.setItem("vpass_read_notifs", JSON.stringify(mergedGlobal));

    if (userId) {
      const userKey = `vpass_read_notifs_${userId}`;
      const userRaw = localStorage.getItem(userKey);
      const userList = userRaw ? JSON.parse(userRaw) : [];
      const mergedUser = Array.from(new Set([...userList, ...idsToAdd]));
      localStorage.setItem(userKey, JSON.stringify(mergedUser));
    }
  } catch (e) {}
};

const persistAllReadNotifIds = (ids, userId) => {
  try {
    setReadCutoffTime(userId, Date.now());
    if (!ids || ids.length === 0) return;
    const globalRaw = localStorage.getItem("vpass_read_notifs");
    const globalList = globalRaw ? JSON.parse(globalRaw) : [];
    const mergedGlobal = Array.from(new Set([...globalList, ...ids.map(String)]));
    localStorage.setItem("vpass_read_notifs", JSON.stringify(mergedGlobal));

    if (userId) {
      const userKey = `vpass_read_notifs_${userId}`;
      const userRaw = localStorage.getItem(userKey);
      const userList = userRaw ? JSON.parse(userRaw) : [];
      const mergedUser = Array.from(new Set([...userList, ...ids.map(String)]));
      localStorage.setItem(userKey, JSON.stringify(mergedUser));
    }
  } catch (e) {}
};

export const PassProvider = ({ children }) => {
  const sanitizeApp = (app) => {
    if (!app || typeof app !== "object") return app;
    if (!app.vehicle || typeof app.vehicle !== "object") {
      return {
        ...app,
        vehicle: {
          id: app.vehicle_id || app.vehicleId || null,
          make: app.make || "Registered",
          model: app.model || "Vehicle",
          year: String(app.year || "2026"),
          color: app.color || "N/A",
          plateNumber: app.plateNumber || app.plate_number || "N/A",
          type: app.vehicleType || app.vehicle_type || "Motorcycle",
        },
      };
    }
    return app;
  };

  const [applications, setApplications] = useState(() => {
    try {
      const saved = localStorage.getItem("vpass_applications");
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.map(sanitizeApp) : [];
    } catch (e) {
      try { localStorage.removeItem("vpass_applications"); } catch (_) {}
      return [];
    }
  });

  const [vehicles, setVehicles] = useState(() => {
    try {
      const saved = localStorage.getItem("vpass_vehicles");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Auto-saved In-Progress Draft Application
  const [draftApplication, setDraftApplication] = useState(() => {
    try {
      const saved = localStorage.getItem("vpass_registration_draft");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Persistent Temporary Visitor Passes
  const [visitorPasses, setVisitorPasses] = useState(() => {
    try {
      const saved = localStorage.getItem("vpass_visitor_passes");
      return saved ? JSON.parse(saved) : INITIAL_VISITORS;
    } catch (e) {
      return INITIAL_VISITORS;
    }
  });

  // Persistent Gate Audit Logs
  const [gateLogs, setGateLogs] = useState(() => {
    try {
      const saved = localStorage.getItem("vpass_gate_logs");
      return saved ? JSON.parse(saved) : INITIAL_LOGS;
    } catch (e) {
      return INITIAL_LOGS;
    }
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

  const { user, token } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  // Real-time synchronization with Aiven Cloud Database
  const fetchCloudData = useCallback(async () => {
    if (!token || !user) return;
    try {
      setIsSyncing(true);
      if (user.role === "PASO_ADMIN") {
        const [appsRes, logsRes, visRes] = await Promise.allSettled([
          apiRequest("/paso/applications"),
          apiRequest("/guard/logs"),
          apiRequest("/guard/visitors"),
        ]);
        if (appsRes.status === "fulfilled" && Array.isArray(appsRes.value)) {
          setApplications((appsRes.value || []).map(sanitizeApp));
        }
        if (logsRes.status === "fulfilled" && Array.isArray(logsRes.value)) {
          setGateLogs(logsRes.value);
        }
        if (visRes.status === "fulfilled" && Array.isArray(visRes.value)) {
          setVisitorPasses(visRes.value);
        }
      } else if (user.role === "CLIENT") {
        const [appsRes, vehsRes] = await Promise.allSettled([
          apiRequest("/vehicles/my-applications"),
          apiRequest("/vehicles/my-vehicles"),
        ]);
        if (appsRes.status === "fulfilled" && Array.isArray(appsRes.value)) {
          setApplications(appsRes.value);
        }
        if (vehsRes.status === "fulfilled" && Array.isArray(vehsRes.value)) {
          const vList = vehsRes.value.map((v) => ({
            id: v.id,
            make: v.make,
            model: v.model,
            year: String(v.year_model || "2026"),
            color: v.color,
            plateNumber: v.plate_number,
            type: v.vehicle_type,
            status: "Active Pass",
          }));
          if (vList.length > 0) {
            setVehicles(vList);
          }
        }
      } else if (user.role === "GUARD") {
        const [appsRes, logsRes, visRes] = await Promise.allSettled([
          apiRequest("/guard/passes"),
          apiRequest("/guard/logs"),
          apiRequest("/guard/visitors"),
        ]);
        if (appsRes.status === "fulfilled" && Array.isArray(appsRes.value)) {
          setApplications(appsRes.value);
        }
        if (logsRes.status === "fulfilled" && Array.isArray(logsRes.value)) {
          setGateLogs(logsRes.value);
        }
        if (visRes.status === "fulfilled" && Array.isArray(visRes.value)) {
          setVisitorPasses(visRes.value);
        }
      }
    } catch (err) {
      console.warn("[PassContext Cloud Sync Warning]:", err);
    } finally {
      setIsSyncing(false);
    }
  }, [user, token]);

  // Initial fetch and on auth change
  useEffect(() => {
    if (user && token) {
      fetchCloudData();
    }
  }, [user?.id, user?.role, token, fetchCloudData]);

  // Window focus and active polling (every 6 seconds) for seamless multi-device sync
  useEffect(() => {
    if (!user || !token) return;

    const handleSyncTrigger = () => {
      if (document.visibilityState === "visible") {
        fetchCloudData();
      }
    };

    window.addEventListener("focus", handleSyncTrigger);
    document.addEventListener("visibilitychange", handleSyncTrigger);

    const pollInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchCloudData();
      }
    }, 6000);

    return () => {
      window.removeEventListener("focus", handleSyncTrigger);
      document.removeEventListener("visibilitychange", handleSyncTrigger);
      clearInterval(pollInterval);
    };
  }, [user, token, fetchCloudData]);

  // Sync to localStorage safely (strips out heavy Base64 image data to prevent Safari QuotaExceededError crashes)
  useEffect(() => {
    try {
      if (!applications || applications.length === 0) {
        localStorage.setItem("vpass_applications", JSON.stringify([]));
        return;
      }

      const lightweightApps = applications.map((app) => ({
        ...app,
        applicant_photo: app.applicant_photo && app.applicant_photo.length > 500 ? "[IN_CLOUD_STORAGE]" : app.applicant_photo,
        documents: {
          driverLicense: app.documents?.driverLicense && app.documents.driverLicense.length > 500 ? "[IN_CLOUD_STORAGE]" : app.documents?.driverLicense,
          orCr: app.documents?.orCr && app.documents.orCr.length > 500 ? "[IN_CLOUD_STORAGE]" : app.documents?.orCr,
        },
        receipt: app.receipt ? {
          ...app.receipt,
          receiptPhoto: app.receipt.receiptPhoto && app.receipt.receiptPhoto.length > 500 ? "[IN_CLOUD_STORAGE]" : app.receipt.receiptPhoto,
        } : null,
      }));

      localStorage.setItem("vpass_applications", JSON.stringify(lightweightApps));
    } catch (err) {
      console.warn("[PassContext] LocalStorage quota reached for applications; clearing local cache:", err);
      try {
        localStorage.removeItem("vpass_applications");
      } catch (_) {}
    }
  }, [applications]);

  useEffect(() => {
    try {
      localStorage.setItem("vpass_vehicles", JSON.stringify(vehicles));
    } catch (err) {
      console.warn("[PassContext] LocalStorage setItem error for vehicles:", err);
    }
  }, [vehicles]);

  useEffect(() => {
    try {
      if (draftApplication) {
        localStorage.setItem(
          "vpass_registration_draft",
          JSON.stringify(draftApplication),
        );
      } else {
        localStorage.removeItem("vpass_registration_draft");
      }
    } catch (err) {
      console.warn("[PassContext] LocalStorage setItem error for draftApplication:", err);
    }
  }, [draftApplication]);

  useEffect(() => {
    try {
      localStorage.setItem("vpass_visitor_passes", JSON.stringify(visitorPasses));
    } catch (err) {
      console.warn("[PassContext] LocalStorage setItem error for visitorPasses:", err);
    }
  }, [visitorPasses]);

  // Persistent Notifications with Read State Retention
  const [notifications, setNotifications] = useState(() => {
    try {
      const savedUser = user?.id ? localStorage.getItem(`vpass_notifications_${user.id}`) : null;
      const savedGlobal = localStorage.getItem("vpass_notifications");
      const raw = savedUser || savedGlobal;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map((n) => ({
            ...n,
            time: formatNotificationTime(n.date, n.time),
            read: isNotifMarkedRead(n, user?.id)
          }));
        }
      }
    } catch (e) {}
    return INITIAL_NOTIFICATIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem("vpass_notifications", JSON.stringify(notifications));
      if (user?.id) {
        localStorage.setItem(`vpass_notifications_${user.id}`, JSON.stringify(notifications));
      }
    } catch (e) {}
  }, [notifications, user?.id]);

  // When active user switches, re-hydrate notifications and read state for that user
  useEffect(() => {
    if (!user?.id) return;
    try {
      const userSaved = localStorage.getItem(`vpass_notifications_${user.id}`);
      if (userSaved) {
        const parsed = JSON.parse(userSaved);
        const readIds = getReadNotifIds(user.id);
        setNotifications(
          parsed.map((n) => ({
            ...n,
            time: formatNotificationTime(n.date, n.time),
            read: readIds.includes(n.id) || isNotifMarkedRead(n, user.id)
          }))
        );
      }
    } catch (e) {}
  }, [user?.id]);

  // Helper to add a notification
  const addNotification = ({ id, type, title, message, link, appId, date, time }) => {
    const notifId =
      id ||
      (appId && type
        ? `notif-${type.toLowerCase().replace(/_/g, "-")}-${appId}`
        : `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`);

    const readIds = getReadNotifIds(user?.id);
    const isAlreadyRead = readIds.includes(notifId);

    const newNotif = {
      id: notifId,
      type,
      title,
      message,
      link: link || "/client/applications",
      appId,
      date: date || new Date().toISOString(),
      time: time || formatNotificationTime(date || new Date().toISOString()),

      read: isAlreadyRead,
    };

    setNotifications((prev) => {
      const existingIdx = prev.findIndex(
        (n) => n.id === notifId || (appId && n.appId === appId && n.type === type)
      );
      if (existingIdx !== -1) {
        const existing = prev[existingIdx];
        const updated = [...prev];
        updated[existingIdx] = {
          ...newNotif,
          date: date || existing.date || newNotif.date,
          time: formatNotificationTime(date || existing.date || newNotif.date),
          read: existing.read || isAlreadyRead,
        };
        return updated;
      }
      return [newNotif, ...prev];
    });

    return newNotif;
  };

  // Helper to trigger Brevo email notifications via backend API (non-blocking)
  const triggerEmailNotification = (payload) => {
    apiRequest("/paso/notifications/send-email", {
      method: "POST",
      body: JSON.stringify(payload),
    }).catch((err) => {
      console.log("[Brevo Email Notification Dispatch]:", err?.message || err);
    });
  };

  const markNotificationAsRead = (id) => {
    setNotifications((prev) => {
      const target = prev.find((n) => n.id === id);
      persistReadNotifId(id, user?.id, target);
      return prev.map((n) => (n.id === id ? { ...n, read: true } : n));
    });
  };

  const markAllNotificationsAsRead = () => {
    const now = Date.now();
    setReadCutoffTime(user?.id, now);
    setNotifications((prev) => {
      const ids = prev.map((n) => n.id);
      persistAllReadNotifIds(ids, user?.id);
      return prev.map((n) => ({ ...n, read: true }));
    });
  };

  useEffect(() => {
    try {
      localStorage.setItem("vpass_gate_logs", JSON.stringify(gateLogs));
    } catch (err) {
      console.warn("[PassContext] LocalStorage setItem error for gateLogs:", err);
    }
  }, [gateLogs]);

  // Multi-tab storage synchronization so actions taken in Admin or Client tabs sync in real time
  useEffect(() => {
    const handleStorageChange = (e) => {
      try {
        if (e.key === "vpass_notifications" && e.newValue) {
          setNotifications(JSON.parse(e.newValue));
        }
        if (e.key === "vpass_applications" && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          // Preserve in-memory full photos if incoming storage items are sanitized
          if (Array.isArray(parsed)) {
            setApplications((prev) => {
              return parsed.map((item) => {
                const existing = prev.find((p) => p.id === item.id);
                if (existing) {
                  return {
                    ...item,
                    applicant_photo: item.applicant_photo === "[IN_CLOUD_STORAGE]" ? existing.applicant_photo : item.applicant_photo,
                    documents: {
                      driverLicense: item.documents?.driverLicense === "[IN_CLOUD_STORAGE]" ? existing.documents?.driverLicense : item.documents?.driverLicense,
                      orCr: item.documents?.orCr === "[IN_CLOUD_STORAGE]" ? existing.documents?.orCr : item.documents?.orCr,
                    },
                    receipt: item.receipt ? {
                      ...item.receipt,
                      receiptPhoto: item.receipt.receiptPhoto === "[IN_CLOUD_STORAGE]" ? existing.receipt?.receiptPhoto : item.receipt.receiptPhoto,
                    } : null,
                  };
                }
                return item;
              });
            });
          }
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

  // Self-healing synchronization: guarantee notifications for any issued passes or status changes with robust deduplication & persistent read status
  useEffect(() => {
    if (!applications || applications.length === 0) return;

    setNotifications((prev) => {
      let changed = false;
      const nextNotifs = [...prev];

      const syncNotifDateAndTime = (notif, authoritativeDate) => {
        let updated = false;
        if (authoritativeDate && (!notif.date || notif.date !== authoritativeDate)) {
          notif.date = authoritativeDate;
          updated = true;
        }
        const formatted = formatNotificationTime(notif.date, notif.time);
        if (notif.time !== formatted) {
          notif.time = formatted;
          updated = true;
        }
        return updated;
      };

      applications.forEach((app) => {
        const appRef = app.app_ref_number || app.id;
        const appDbId = app.db_id || app.id;

        const matchesApp = (n, targetType) => {
          if (n.type !== targetType) return false;
          if (n.appId && (n.appId == app.id || n.appId == appDbId || n.appId == appRef)) return true;
          if (n.id && (n.id.includes(String(app.id)) || (appDbId && n.id.includes(String(appDbId))) || (appRef && n.id.includes(String(appRef))))) return true;
          return false;
        };

        // 1. Pass Issued Notification
        if (app.status === "PASS_ISSUED" && app.pass) {
          const passNum = app.pass.passNumber || app.assignedPassNumber;
          const notifId = `notif-issued-${appRef}`;
          const existing = nextNotifs.find((n) => matchesApp(n, "PASS_ISSUED"));
          const authoritativeDate = app.pass.issuedAt || app.updated_at || app.created_at;

          if (!existing) {
            changed = true;
            const notifDate = authoritativeDate || new Date().toISOString();
            const tempNotif = {
              id: notifId,
              type: "PASS_ISSUED",
              appId: appRef,
              date: notifDate,
            };
            const isRead = isNotifMarkedRead(tempNotif, user?.id);
            nextNotifs.unshift({
              ...tempNotif,
              title: "Official Gate QR Pass Issued!",
              message: `Your Cashier receipt has been verified! Gate Pass ${passNum || "Activated"} for ${app.vehicle?.make || "Vehicle"} (${app.vehicle?.plateNumber}) is now active for Academic Year ${systemSettings?.academicYear || "2026-2027"}.`,
              link: "/client/vehicle-pass",
              time: formatNotificationTime(notifDate),
              read: isRead,
            });
          } else {
            const shouldBeRead = existing.read || isNotifMarkedRead(existing, user?.id);
            if (existing.read !== shouldBeRead) {
              existing.read = shouldBeRead;
              changed = true;
            }
            if (syncNotifDateAndTime(existing, authoritativeDate)) {
              changed = true;
            }
          }
        }

        // 2. Registration Approved Notification (Ready for Cashier Payment)
        if (app.status === "APPROVED") {
          const notifId = `notif-approved-${appRef}`;
          const existing = nextNotifs.find((n) => matchesApp(n, "REGISTRATION_APPROVED"));
          const authoritativeDate = app.updated_at || app.created_at;

          if (!existing) {
            changed = true;
            const notifDate = authoritativeDate || new Date().toISOString();
            const tempNotif = {
              id: notifId,
              type: "REGISTRATION_APPROVED",
              appId: appRef,
              date: notifDate,
            };
            const isRead = isNotifMarkedRead(tempNotif, user?.id);
            nextNotifs.unshift({
              ...tempNotif,
              title: "Vehicle Registration Approved!",
              message: `Your registration for ${app.vehicle?.make || "Vehicle"} ${app.vehicle?.model || ""} (${app.vehicle?.plateNumber}) was approved by PASO. You may now pay at the Cashier window and upload your receipt.`,
              link: `/client/payments?appId=${appRef}`,
              time: formatNotificationTime(notifDate),
              read: isRead,
            });
          } else {
            const shouldBeRead = existing.read || isNotifMarkedRead(existing, user?.id);
            if (existing.read !== shouldBeRead) {
              existing.read = shouldBeRead;
              changed = true;
            }
            if (syncNotifDateAndTime(existing, authoritativeDate)) {
              changed = true;
            }
          }
        }

        // 3. Receipt Rejected Notification
        if (
          app.receiptRejectionRemark ||
          app.receipt?.status === "REJECTED" ||
          (app.receipt?.rejectionRemark && app.status !== "PASS_ISSUED")
        ) {
          const notifId = `notif-receipt-declined-${appRef}`;
          const remark =
            app.receiptRejectionRemark ||
            app.receipt?.rejectionRemark ||
            "Cashier receipt image is unreadable or invalid.";
          const existing = nextNotifs.find((n) => matchesApp(n, "RECEIPT_REJECTED"));
          const authoritativeDate = app.updated_at || app.created_at;

          if (!existing) {
            changed = true;
            const notifDate = authoritativeDate || new Date().toISOString();
            const tempNotif = {
              id: notifId,
              type: "RECEIPT_REJECTED",
              appId: appRef,
              date: notifDate,
            };
            const isRead = isNotifMarkedRead(tempNotif, user?.id);
            nextNotifs.unshift({
              ...tempNotif,
              title: "Cashier Receipt Declined",
              message: `Cashier receipt for ${app.vehicle?.make || "Vehicle"} (${app.vehicle?.plateNumber}) was declined by PASO. Note: "${remark}". Please re-upload your valid receipt.`,
              link: `/client/payments?appId=${appRef}`,
              time: formatNotificationTime(notifDate),
              read: isRead,
            });
          } else {
            const shouldBeRead = existing.read || isNotifMarkedRead(existing, user?.id);
            if (existing.read !== shouldBeRead) {
              existing.read = shouldBeRead;
              changed = true;
            }
            if (syncNotifDateAndTime(existing, authoritativeDate)) {
              changed = true;
            }
          }
        }

        // 4. Registration Rejected Notification
        if (app.status === "REJECTED" && app.rejection_reason) {
          const notifId = `notif-rejected-${appRef}`;
          const existing = nextNotifs.find((n) => matchesApp(n, "REGISTRATION_REJECTED"));
          const authoritativeDate = app.updated_at || app.created_at;

          if (!existing) {
            changed = true;
            const notifDate = authoritativeDate || new Date().toISOString();
            const tempNotif = {
              id: notifId,
              type: "REGISTRATION_REJECTED",
              appId: appRef,
              date: notifDate,
            };
            const isRead = isNotifMarkedRead(tempNotif, user?.id);
            nextNotifs.unshift({
              ...tempNotif,
              title: "Registration Form Needs Correction",
              message: `PASO returned your application for ${app.vehicle?.make || "Vehicle"} (${app.vehicle?.plateNumber}). Note: "${app.rejection_reason}". Click to correct mistakes and re-submit.`,
              link: "/client/applications",
              time: formatNotificationTime(notifDate),
              read: isRead,
            });
          } else {
            const shouldBeRead = existing.read || isNotifMarkedRead(existing, user?.id);
            if (existing.read !== shouldBeRead) {
              existing.read = shouldBeRead;
              changed = true;
            }
            if (syncNotifDateAndTime(existing, authoritativeDate)) {
              changed = true;
            }
          }
        }
      });

      if (changed) {
        nextNotifs.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
        return nextNotifs;
      }
      return prev;
    });
  }, [applications, systemSettings?.academicYear, user?.id]);

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
      user_id: user?.id || 1,
      applicant_name: formData.applicant_name || user?.full_name || "",
      school_id: formData.school_id || user?.school_id || "",
      classification: formData.classification || user?.classification || "Student",
      department: formData.department || user?.year_course || user?.department_unit || "",
      contact_number: formData.contact_number || user?.contact_number || "",
      applicant_photo: formData.applicant_photo, // Live captured image
      vehicle: {
        make: formData.make || formData.brand || "",
        model: formData.model || "",
        year: formData.year || "2026",
        color: formData.color || "",
        plateNumber: (formData.plateNumber || "").trim().toUpperCase(),
        type: formData.type || formData.vehicleType || "Motorcycle",
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

    // Also register into vehicles list optimistically
    setVehicles((prev) => [
      {
        id: Date.now(),
        appId: newApp.id,
        make: formData.make || formData.brand || "",
        model: formData.model || "",
        year: formData.year || "2026",
        color: formData.color || "",
        plateNumber: (formData.plateNumber || "").trim().toUpperCase(),
        type: formData.type || formData.vehicleType || "Motorcycle",
        status: "Pending Review",
      },
      ...prev,
    ]);

    // Connect transaction to Aiven Cloud MySQL
    apiRequest("/vehicles/register", {
      method: "POST",
      body: JSON.stringify({
        plateNumber: (formData.plateNumber || "").trim().toUpperCase(),
        vehicleType: formData.type || formData.vehicleType || "Motorcycle",
        make: formData.make || formData.brand || "",
        model: formData.model || "",
        color: formData.color || "",
        year: formData.year || "2026",
        applicant_photo: formData.applicant_photo,
        driverLicense: formData.driverLicense,
        orCr: formData.orCr,
      }),
    })
      .then(() => {
        fetchCloudData();
      })
      .catch((err) => {
        console.error("[Aiven Cloud Sync] Vehicle registration error:", err);
      });

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

    // Auto-notify the client of registration decision (In-App + Brevo Email)
    if (targetApp) {
      const applicantEmail =
        targetApp.email ||
        `${(targetApp.school_id || "student").toLowerCase().replace(/[^a-z0-9]/g, "")}@rsu.edu.ph`;
      const vehicleDesc =
        `${targetApp.vehicle?.make || ""} ${targetApp.vehicle?.model || ""}`.trim() ||
        targetApp.vehicle?.type ||
        "Vehicle";

      if (decision === "APPROVED") {
        addNotification({
          type: "REGISTRATION_APPROVED",
          title: "Vehicle Registration Approved!",
          message: `Your registration for ${targetApp.vehicle?.make || "Vehicle"} ${targetApp.vehicle?.model || ""} (${targetApp.vehicle?.plateNumber}) was approved by PASO. You may now pay at the Cashier window and upload your receipt.`,
          link: `/client/payments?appId=${appId}`,
          appId,
        });

        triggerEmailNotification({
          type: "REGISTRATION_APPROVED",
          toEmail: applicantEmail,
          recipientName: targetApp.applicant_name,
          vehicle: vehicleDesc,
          plateNumber: targetApp.vehicle?.plateNumber,
        });
      } else if (decision === "REJECTED") {
        addNotification({
          type: "REGISTRATION_REJECTED",
          title: "Registration Form Needs Correction",
          message: `PASO returned your application for ${targetApp.vehicle?.make || "Vehicle"} (${targetApp.vehicle?.plateNumber}). Note: "${remarks}". Click to correct mistakes and re-submit.`,
          link: `/client/applications`,
          appId,
        });

        triggerEmailNotification({
          type: "REGISTRATION_REJECTED",
          toEmail: applicantEmail,
          recipientName: targetApp.applicant_name,
          vehicle: vehicleDesc,
          plateNumber: targetApp.vehicle?.plateNumber,
          reason: remarks,
        });
      }
    }

    // Connect review transaction to Aiven Cloud MySQL
    apiRequest(`/paso/applications/${encodeURIComponent(appId)}/review`, {
      method: "PATCH",
      body: JSON.stringify({
        status: decision,
        rejection_reason: decision === "REJECTED" ? remarks : null,
      }),
    })
      .then(() => {
        fetchCloudData();
      })
      .catch((err) => {
        console.error("[Aiven Cloud Sync] Admin review error:", err);
      });
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

    // Connect transaction to Aiven Cloud MySQL
    apiRequest(`/vehicles/applications/${encodeURIComponent(appId)}/submit-receipt`, {
      method: "POST",
      body: JSON.stringify({
        orNumber,
        receiptPhoto,
      }),
    })
      .then(() => {
        fetchCloudData();
      })
      .catch((err) => {
        console.error("[Aiven Cloud Sync] Cashier receipt upload error:", err);
      });
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
    const acadYear = systemSettings?.academicYear || "2026-2027";
    const acadExpiry = calculateAcademicYearExpiry(acadYear);
    const activeTemplateVersion = systemSettings?.stickerTemplateVersion || "V1";
    const oneYear = acadExpiry;
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
            validUntil: customDetails.validUntil || acadExpiry.validUntil,
            expiresAt: customDetails.expiresAt || acadExpiry.expiresAt,
            academicYear: acadYear,
            templateVersion: customDetails.templateVersion || activeTemplateVersion,
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

    // Auto-notify client of active QR Pass release (In-App + Brevo Email)
    addNotification({
      type: "PASS_ISSUED",
      title: "Official Gate QR Pass Issued!",
      message: `Your Cashier receipt has been verified! Gate Pass ${generatedPassNum} for ${targetApp.vehicle?.make || "Vehicle"} (${targetApp.vehicle?.plateNumber}) is now active for Academic Year ${acadYear}.`,
      link: "/client/vehicle-pass",
      appId,
    });

    const applicantEmail =
      targetApp.email ||
      `${(targetApp.school_id || "student").toLowerCase().replace(/[^a-z0-9]/g, "")}@rsu.edu.ph`;
    const vehicleDesc =
      `${targetApp.vehicle?.make || ""} ${targetApp.vehicle?.model || ""}`.trim() ||
      targetApp.vehicle?.type ||
      "Vehicle";

    triggerEmailNotification({
      type: "PASS_ISSUED",
      toEmail: applicantEmail,
      recipientName: targetApp.applicant_name,
      vehicle: vehicleDesc,
      plateNumber: targetApp.vehicle?.plateNumber,
      passNumber: generatedPassNum,
      validUntil: customDetails.validUntil || oneYear.validUntil,
      academicYear: acadYear,
    });

    // Connect transaction to Aiven Cloud MySQL
    apiRequest(`/paso/applications/${encodeURIComponent(appId)}/issue-pass`, {
      method: "POST",
      body: JSON.stringify({
        passNumber: generatedPassNum,
        validUntil: customDetails.expiresAt || oneYear.expiresAt,
        orNumber: targetApp.receipt?.orNumber,
        amount: (targetApp.vehicle?.type || "").toLowerCase().includes("4-wheel") ? 300 : 150,
      }),
    })
      .then(() => {
        fetchCloudData();
      })
      .catch((err) => {
        console.error("[Aiven Cloud Sync] Issue pass error:", err);
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

    // Auto-notify client that receipt was declined with reason (In-App + Brevo Email)
    if (targetApp) {
      addNotification({
        type: "RECEIPT_REJECTED",
        title: "Cashier Receipt Declined",
        message: `Cashier receipt for ${targetApp.vehicle?.make || "Vehicle"} (${targetApp.vehicle?.plateNumber}) was declined by PASO. Note: "${remarks}". Please re-upload your valid receipt.`,
        link: `/client/payments?appId=${appId}`,
        appId,
      });

      const applicantEmail =
        targetApp.email ||
        `${(targetApp.school_id || "student").toLowerCase().replace(/[^a-z0-9]/g, "")}@rsu.edu.ph`;
      const vehicleDesc =
        `${targetApp.vehicle?.make || ""} ${targetApp.vehicle?.model || ""}`.trim() ||
        targetApp.vehicle?.type ||
        "Vehicle";

      triggerEmailNotification({
        type: "RECEIPT_REJECTED",
        toEmail: applicantEmail,
        recipientName: targetApp.applicant_name,
        vehicle: vehicleDesc,
        plateNumber: targetApp.vehicle?.plateNumber,
        orNumber: targetApp.receipt?.orNumber || "N/A",
        reason: remarks,
      });
    }

    // Connect transaction to Aiven Cloud MySQL
    apiRequest(`/paso/applications/${encodeURIComponent(appId)}/reject-receipt`, {
      method: "POST",
      body: JSON.stringify({
        remarks: remarks || "Cashier receipt image is unreadable or invalid.",
      }),
    })
      .then(() => {
        fetchCloudData();
      })
      .catch((err) => {
        console.error("[Aiven Cloud Sync] Reject receipt error:", err);
      });
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

    // Connect transaction to Aiven Cloud MySQL
    apiRequest(`/vehicles/applications/${encodeURIComponent(appId)}/resubmit`, {
      method: "PUT",
      body: JSON.stringify({
        plateNumber: updatedData.plateNumber,
        vehicleType: updatedData.type,
        make: updatedData.make,
        model: updatedData.model,
        color: updatedData.color,
        year: updatedData.year,
        driverLicense: updatedData.driverLicense,
        orCr: updatedData.orCr,
        applicant_photo: updatedData.applicant_photo,
      }),
    })
      .then(() => {
        fetchCloudData();
      })
      .catch((err) => {
        console.error("[Aiven Cloud Sync] Resubmit application error:", err);
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

    // Connect transaction to Aiven Cloud MySQL
    apiRequest(`/vehicles/applications/${encodeURIComponent(appId)}/resubmit`, {
      method: "PUT",
      body: JSON.stringify({
        plateNumber: renewalData.plateNumber,
        vehicleType: renewalData.type,
        make: renewalData.make,
        model: renewalData.model,
        color: renewalData.color,
        year: renewalData.year,
        driverLicense: renewalData.driverLicense,
        orCr: renewalData.orCr,
        applicant_photo: renewalData.applicant_photo,
      }),
    })
      .then(() => {
        fetchCloudData();
      })
      .catch((err) => {
        console.error("[Aiven Cloud Sync] Renewal application error:", err);
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

    // Connect transaction to Aiven Cloud MySQL
    apiRequest("/guard/log", {
      method: "POST",
      body: JSON.stringify({
        passNumber: logData.passNumber,
        plateNumber: logData.plateNumber,
        owner: logData.owner,
        classification: logData.classification || "EMPLOYEE",
        type: logData.type || "ENTRY",
        gate: gateStation,
        status: logData.status || "VALID",
      }),
    }).catch((err) => {
      console.warn("[Aiven Cloud Sync] Gate verification log warning:", err);
    });

    return newLog;
  };

  // Issue New Visitor Pass (1-to-7 days duration)
  const issueVisitorPass = async (visitorForm) => {
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
    const cleanPlate = visitorForm.plateNumber.trim().toUpperCase();

    const newVisitor = {
      id: passId,
      name: visitorForm.name.trim(),
      contact: visitorForm.contact ? visitorForm.contact.trim() : "N/A",
      idPresented: visitorForm.idPresented || "Driver's License",
      plateNumber: cleanPlate,
      vehicleType: visitorForm.vehicleType || "Motorcycle",
      destination: visitorForm.destination ? visitorForm.destination.trim() : "Administration Building",
      purpose: visitorForm.purpose ? visitorForm.purpose.trim() : "Official Business",
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
      qrData: `RSU-VPASS:${passId}:${cleanPlate.replace(/\s+/g, "")}:VISITOR`,
    };

    setVisitorPasses((prev) => [newVisitor, ...prev]);

    // Local state log for instant UI rendering (server will insert single authoritative log)
    const initialEntryLog = {
      id: Date.now(),
      passNumber: newVisitor.id,
      plateNumber: newVisitor.plateNumber,
      owner: newVisitor.name,
      classification: "VISITOR",
      type: "ENTRY",
      gate: currentPost,
      time: `${timeStr} Today`,
      date: dateStr,
      status: "VALID",
    };
    setGateLogs((prev) => [initialEntryLog, ...prev]);

    // Connect transaction to Aiven Cloud MySQL with matching passNumber
    try {
      await apiRequest("/guard/visitor-pass", {
        method: "POST",
        body: JSON.stringify({
          pass_number: passId,
          passNumber: passId,
          name: visitorForm.name.trim(),
          contact: visitorForm.contact ? visitorForm.contact.trim() : "N/A",
          idPresented: visitorForm.idPresented || "Driver's License",
          plateNumber: cleanPlate,
          vehicleType: visitorForm.vehicleType || "Motorcycle",
          destination: visitorForm.destination ? visitorForm.destination.trim() : "Administration Building",
          purpose: visitorForm.purpose ? visitorForm.purpose.trim() : "Official Business",
          validityDuration: days,
          gate: currentPost,
        }),
      });
      fetchCloudData();
    } catch (err) {
      console.error("[Aiven Cloud Sync] Issue visitor pass error:", err);
    }

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
        const cleanVPlate = (v.plateNumber || "").replace(/\s+/g, "").toUpperCase();
        const cleanTarget = String(idOrPlate || "").replace(/\s+/g, "").toUpperCase();
        if (v.id === idOrPlate || cleanVPlate === cleanTarget || v.plateNumber === idOrPlate) {
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
      const exitLog = {
        id: Date.now(),
        passNumber: visitorFound.id,
        plateNumber: visitorFound.plateNumber,
        owner: visitorFound.name,
        classification: "VISITOR",
        type: "EXIT",
        gate: currentPost,
        time: `${timeStr} Today`,
        date: dateStr,
        status: "VALID",
      };
      setGateLogs((prev) => [exitLog, ...prev]);
    }

    // Connect transaction to Aiven Cloud MySQL
    apiRequest(`/guard/visitors/${encodeURIComponent(idOrPlate)}/exit`, {
      method: "PUT",
      body: JSON.stringify({ gate: currentPost, exit_gate: currentPost }),
    })
      .then(() => {
        fetchCloudData();
      })
      .catch((err) => {
        console.error("[Aiven Cloud Sync] Log visitor exit error:", err);
      });
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

    // Connect transaction to Aiven Cloud MySQL
    apiRequest(`/guard/visitors/${encodeURIComponent(idOrPlate)}/renew`, {
      method: "PUT",
      body: JSON.stringify({ duration_days: additionalDays }),
    })
      .then(() => {
        fetchCloudData();
      })
      .catch((err) => {
        console.error("[Aiven Cloud Sync] Extend visitor pass error:", err);
      });

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
        calculateAcademicYearExpiry,
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
        refreshCloudData: fetchCloudData,
        isSyncing,
      }}
    >
      {children}
    </PassContext.Provider>
  );
};

export const usePass = () => useContext(PassContext);
