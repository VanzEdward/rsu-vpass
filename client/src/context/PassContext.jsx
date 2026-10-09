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
      passNumber: "VP-2026-0001",
      qrData: "RSU-VPASS:VP-2026-0001:XYZ5678:EMP-2026-0812",
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
      passNumber: "VP-2026-0089",
      qrData: "RSU-VPASS:VP-2026-0089:RSU2026:2023-00192",
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

const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    type: "PASS_ISSUED",
    title: "Vehicle Pass Activated",
    message:
      "Your Pass VP-2026-0001 for Honda Click 125 (XYZ 5678) is active for Academic Year 2026.",
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
    passNumber: "VP-2026-0001",
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
    passNumber: "VP-2026-0089",
    plateNumber: "RSU 2026",
    owner: "Chrizhel Anne Cuenco",
    classification: "STUDENT",
    type: "ENTRY",
    gate: "Gate 2",
    time: "10:30 AM Today",
    status: "VALID",
  },
];

export const PassProvider = ({ children }) => {
  const [applications, setApplications] = useState(() => {
    const saved = localStorage.getItem("vpass_applications");
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
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
    let affectedApp = null;
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          affectedApp = app;
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
    if (affectedApp) {
      if (decision === "APPROVED") {
        addNotification({
          type: "REGISTRATION_APPROVED",
          title: "Vehicle Registration Approved!",
          message: `Your registration for ${affectedApp.vehicle?.make || "Vehicle"} ${affectedApp.vehicle?.model || ""} (${affectedApp.vehicle?.plateNumber}) was approved by PASO. You may now pay at the Cashier window and upload your receipt.`,
          link: `/client/payments?appId=${appId}`,
          appId,
        });
      } else if (decision === "REJECTED") {
        addNotification({
          type: "REGISTRATION_REJECTED",
          title: "Registration Form Needs Correction",
          message: `PASO returned your application for ${affectedApp.vehicle?.make || "Vehicle"} (${affectedApp.vehicle?.plateNumber}). Note: "${remarks}". Click to correct mistakes and re-submit.`,
          link: `/client/applications`,
          appId,
        });
      }
    }
  };

  // Cashier Payment & Receipt Upload (Milestone 3: Client uploads receipt -> Awaiting PASO Verification)
  const submitReceiptPayment = (appId, orNumber, receiptPhoto) => {
    const submittedAt = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    let targetedVehiclePlate = null;

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          targetedVehiclePlate = app.vehicle?.plateNumber;
          return {
            ...app,
            status: "RECEIPT_SUBMITTED",
            rejection_reason: null,
            receiptRejectionRemark: null,
            receipt: {
              orNumber,
              receiptPhoto,
              submittedAt,
              status: "PENDING_VERIFICATION",
            },
          };
        }
        return app;
      }),
    );

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

  // PASO Admin Verifies Cashier Receipt & Generates Official Gate QR Pass (Milestone 4)
  const verifyReceiptAndIssuePass = (appId, customDetails = {}) => {
    const year = new Date().getFullYear();
    const generatedPassNum =
      customDetails.passNumber ||
      `VP-${year}-${String(Math.floor(1000 + Math.random() * 9000))}`;
    let targetedVehiclePlate = null;
    let affectedApp = null;

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          affectedApp = app;
          targetedVehiclePlate = app.vehicle?.plateNumber;
          const passInfo = {
            passNumber: generatedPassNum,
            qrData:
              customDetails.qrData ||
              `RSU-VPASS:${generatedPassNum}:${app.vehicle.plateNumber}:${app.school_id}`,
            validUntil: customDetails.validUntil || `December 31, ${year}`,
            status: "ACTIVE",
            issuedAt: new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            verifiedBy: "PASO Administration Officer",
          };

          return {
            ...app,
            status: "PASS_ISSUED",
            receipt: {
              ...(app.receipt || {}),
              verifiedAt: new Date().toLocaleDateString("en-US", {
                month: "short",
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
        if (targetedVehiclePlate && v.plateNumber === targetedVehiclePlate) {
          return {
            ...v,
            status: "Active Pass",
          };
        }
        return v;
      }),
    );

    // Auto-notify client of active QR Pass release
    if (affectedApp) {
      addNotification({
        type: "PASS_ISSUED",
        title: "Official Gate QR Pass Issued!",
        message: `Your Cashier receipt has been verified! Gate Pass ${generatedPassNum} for ${affectedApp.vehicle?.make || "Vehicle"} (${affectedApp.vehicle?.plateNumber}) is now active for Academic Year ${year}.`,
        link: "/client/vehicle-pass",
        appId,
      });
    }
  };

  // Reject Receipt (e.g. unreadable photo or mismatched payment amount)
  const rejectReceipt = (appId, remarks) => {
    let affectedApp = null;
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          affectedApp = app;
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
    if (affectedApp) {
      addNotification({
        type: "RECEIPT_REJECTED",
        title: "Cashier Receipt Declined",
        message: `Cashier receipt for ${affectedApp.vehicle?.make || "Vehicle"} (${affectedApp.vehicle?.plateNumber}) was declined by PASO. Note: "${remarks}". Please re-upload your valid receipt.`,
        link: `/client/payments?appId=${appId}`,
        appId,
      });
    }
  };

  // Re-submit an application that was previously returned/rejected by PASO
  const resubmitApplication = (appId, updatedData) => {
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
              make: updatedData.make || app.vehicle.make,
              model: updatedData.model || app.vehicle.model,
              year: updatedData.year || app.vehicle.year,
              color: updatedData.color || app.vehicle.color,
              plateNumber: updatedData.plateNumber || app.vehicle.plateNumber,
              type: updatedData.type || app.vehicle.type,
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

    // Update vehicle status back to Pending Review
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.plateNumber === updatedData.plateNumber) {
          return {
            ...v,
            make: updatedData.make || v.make,
            model: updatedData.model || v.model,
            status: "Pending Review",
          };
        }
        return v;
      }),
    );

    addNotification({
      type: "APPLICATION_RESUBMITTED",
      title: "Registration Corrected & Re-submitted",
      message: `Your corrected vehicle registration for ${updatedData.make} ${updatedData.model} (${updatedData.plateNumber}) has been sent to PASO for re-evaluation.`,
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

  // Renew Visitor Pass (for returning guests/delegates)
  const renewVisitorPass = (idOrPlate, days = 1) => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (days - 1));
    const expiryStr =
      days === 1
        ? "Today • 11:59 PM (1 Day)"
        : `${expiryDate.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })} (${days} Days)`;

    let renewedItem = null;
    const currentPost = activeGate || "Gate 1";

    setVisitorPasses((prev) =>
      prev.map((v) => {
        if (v.id === idOrPlate || v.plateNumber === idOrPlate) {
          renewedItem = {
            ...v,
            validDays: days,
            validUntil: expiryStr,
            status: "INSIDE",
            exitGate: null,
            exitTime: null,
            entryGate: currentPost,
            entryTime:
              new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }) + " Today",
          };
          return renewedItem;
        }
        return v;
      }),
    );

    if (renewedItem) {
      addGateLog({
        passNumber: renewedItem.id,
        plateNumber: renewedItem.plateNumber,
        owner: renewedItem.name,
        classification: "VISITOR",
        type: "ENTRY",
        gate: currentPost,
        status: "VALID",
      });
    }

    return renewedItem;
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
        renewVisitorPass,
        extendVisitorPass,
      }}
    >
      {children}
    </PassContext.Provider>
  );
};

export const usePass = () => useContext(PassContext);
