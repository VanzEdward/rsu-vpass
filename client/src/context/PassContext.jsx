import React, { createContext, useContext, useState, useEffect } from 'react';

const PassContext = createContext(null);

const INITIAL_APPLICATIONS = [
  {
    id: 'APP-2026-0001',
    user_id: 1,
    applicant_name: 'Prof. Juan Dela Cruz',
    school_id: 'EMP-2026-0812',
    classification: 'Employee',
    department: 'College of Engineering & Technology (Faculty)',
    contact_number: '+63 912 345 6789',
    applicant_photo: null,
    vehicle: {
      make: 'Honda',
      model: 'Click 125',
      year: 2023,
      color: 'Black',
      plateNumber: 'XYZ 5678',
      type: 'Motorcycle',
    },
    documents: {
      driverLicense: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
      orCr: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    },
    status: 'PASS_ISSUED',
    rejection_reason: null,
    submittedDate: 'January 10, 2026',
    receipt: {
      orNumber: '2026-98123',
      receiptPhoto: null,
      paidAt: 'January 11, 2026',
    },
    pass: {
      passNumber: 'VP-2026-0001',
      qrData: 'RSU-VPASS:VP-2026-0001:XYZ5678:EMP-2026-0812',
      validUntil: 'December 31, 2026',
      status: 'ACTIVE',
    }
  },
  {
    id: 'APP-2026-0089',
    user_id: 2,
    applicant_name: 'Chrizhel Anne Cuenco',
    school_id: '2023-00192',
    classification: 'Student',
    department: 'College of Computing, Multimedia Arts & Digital Innovation',
    contact_number: '+63 918 222 3344',
    applicant_photo: null,
    vehicle: {
      make: 'Yamaha',
      model: 'Mio Sporty',
      year: 2024,
      color: 'Matte Blue',
      plateNumber: 'RSU 2026',
      type: 'Motorcycle',
    },
    documents: {
      driverLicense: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
      orCr: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    },
    status: 'PASS_ISSUED',
    rejection_reason: null,
    submittedDate: 'January 12, 2026',
    receipt: {
      orNumber: '2026-98442',
      receiptPhoto: null,
      paidAt: 'January 13, 2026',
    },
    pass: {
      passNumber: 'VP-2026-0089',
      qrData: 'RSU-VPASS:VP-2026-0089:RSU2026:2023-00192',
      validUntil: 'December 31, 2026',
      status: 'ACTIVE',
    }
  }
];

const INITIAL_VISITORS = [
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
    purpose: 'Campus Equipment Delivery',
    validDays: 1,
    validUntil: 'Today • 11:59 PM (1 Day)',
    entryTime: '08:45 AM Today',
    status: 'EXITED',
    exitTime: '10:15 AM Today',
    classification: 'VISITOR',
    qrData: 'RSU-VPASS:TMP-2026-0029:XYZ9921:VISITOR'
  }
];

const INITIAL_LOGS = [
  {
    id: 1,
    passNumber: 'VP-2026-0001',
    plateNumber: 'XYZ 5678',
    owner: 'Prof. Juan Dela Cruz',
    classification: 'EMPLOYEE',
    type: 'ENTRY',
    time: '07:45 AM Today',
    status: 'VALID'
  },
  {
    id: 2,
    passNumber: 'TMP-2026-0042',
    plateNumber: 'NBM 9012',
    owner: 'Dr. Maria Santos',
    classification: 'VISITOR',
    type: 'ENTRY',
    time: '09:30 AM Today',
    status: 'VALID'
  },
  {
    id: 3,
    passNumber: 'TMP-2026-0029',
    plateNumber: 'XYZ 9921',
    owner: 'LBC Express Courier',
    classification: 'VISITOR',
    type: 'EXIT',
    time: '10:15 AM Today',
    status: 'VALID'
  },
  {
    id: 4,
    passNumber: 'VP-2026-0089',
    plateNumber: 'RSU 2026',
    owner: 'Chrizhel Anne Cuenco',
    classification: 'STUDENT',
    type: 'CHECK',
    time: '10:30 AM Today',
    status: 'VALID'
  }
];

export const PassProvider = ({ children }) => {
  const [applications, setApplications] = useState(() => {
    const saved = localStorage.getItem('vpass_applications');
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });

  const [vehicles, setVehicles] = useState(() => {
    const saved = localStorage.getItem('vpass_vehicles');
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        make: 'Honda',
        model: 'Click 125',
        year: 2023,
        color: 'Black',
        plateNumber: 'XYZ 5678',
        type: 'Motorcycle',
        status: 'Active Pass',
      },
      {
        id: 2,
        make: 'Yamaha',
        model: 'Mio Sporty',
        year: 2024,
        color: 'Matte Blue',
        plateNumber: 'RSU 2026',
        type: 'Motorcycle',
        status: 'Active Pass',
      }
    ];
  });

  // Auto-saved In-Progress Draft Application
  const [draftApplication, setDraftApplication] = useState(() => {
    const saved = localStorage.getItem('vpass_registration_draft');
    return saved ? JSON.parse(saved) : null;
  });

  // Persistent Temporary Visitor Passes
  const [visitorPasses, setVisitorPasses] = useState(() => {
    const saved = localStorage.getItem('vpass_visitor_passes');
    return saved ? JSON.parse(saved) : INITIAL_VISITORS;
  });

  // Persistent Gate Audit Logs
  const [gateLogs, setGateLogs] = useState(() => {
    const saved = localStorage.getItem('vpass_gate_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('vpass_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('vpass_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    if (draftApplication) {
      localStorage.setItem('vpass_registration_draft', JSON.stringify(draftApplication));
    } else {
      localStorage.removeItem('vpass_registration_draft');
    }
  }, [draftApplication]);

  useEffect(() => {
    localStorage.setItem('vpass_visitor_passes', JSON.stringify(visitorPasses));
  }, [visitorPasses]);

  useEffect(() => {
    localStorage.setItem('vpass_gate_logs', JSON.stringify(gateLogs));
  }, [gateLogs]);

  // Save/Update Draft
  const saveDraft = (data, step = 1) => {
    const updatedDraft = {
      step,
      data,
      lastSaved: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dateFormatted: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setDraftApplication(updatedDraft);
  };

  // Discard Draft
  const clearDraft = () => {
    setDraftApplication(null);
    localStorage.removeItem('vpass_registration_draft');
  };

  // Submit new registration (Milestone 1)
  const submitApplication = (formData) => {
    const newId = `APP-2026-${String(applications.length + 1).padStart(4, '0')}`;
    const newApp = {
      id: newId,
      user_id: 1,
      applicant_name: formData.applicant_name,
      school_id: formData.school_id,
      classification: formData.classification || 'Student',
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
        driverLicense: formData.driverLicense || 'Uploaded Document',
        orCr: formData.orCr || 'Uploaded Document',
      },
      status: 'PENDING',
      rejection_reason: null,
      submittedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
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
        status: 'Pending Review',
      },
      ...prev,
    ]);

    return newApp;
  };

  // PASO Admin Review (Milestone 2)
  const reviewApplication = (appId, decision, remarks = '') => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          return {
            ...app,
            status: decision,
            rejection_reason: decision === 'REJECTED' ? remarks : null,
          };
        }
        return app;
      })
    );
  };

  // Cashier Payment & Receipt Upload (Milestone 3 -> Milestone 4)
  const submitReceiptPayment = (appId, orNumber, receiptPhoto) => {
    const year = new Date().getFullYear();
    const passNumber = `VP-${year}-${String(Math.floor(1000 + Math.random() * 9000))}`;
    
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          const passInfo = {
            passNumber,
            qrData: `RSU-VPASS:${passNumber}:${app.vehicle.plateNumber}:${app.school_id}`,
            validUntil: `December 31, ${year}`,
            status: 'ACTIVE',
          };

          return {
            ...app,
            status: 'PASS_ISSUED',
            receipt: {
              orNumber,
              receiptPhoto,
              paidAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            },
            pass: passInfo,
          };
        }
        return app;
      })
    );

    // Update vehicle status to Active Pass
    setVehicles((prev) =>
      prev.map((v) => {
        return {
          ...v,
          status: 'Active Pass',
        };
      })
    );
  };

  // Add Gate Log (Records Employee Entry/Exit, Student Spot-Check, or Visitor Event)
  const addGateLog = (logData) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog = {
      id: Date.now(),
      passNumber: logData.passNumber,
      plateNumber: logData.plateNumber,
      owner: logData.owner,
      classification: logData.classification || 'EMPLOYEE',
      type: logData.type || 'ENTRY',
      time: `${timeStr} Today`,
      status: logData.status || 'VALID'
    };
    setGateLogs(prev => [newLog, ...prev]);
    return newLog;
  };

  // Issue New Visitor Pass (1-to-7 days duration)
  const issueVisitorPass = (visitorForm) => {
    const passId = `TMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const days = parseInt(visitorForm.validityDuration, 10) || 1;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (days - 1));
    const expiryStr = days === 1 
      ? 'Today • 11:59 PM (1 Day)' 
      : `${expiryDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} (${days} Days)`;

    const newVisitor = {
      id: passId,
      name: visitorForm.name.trim(),
      contact: visitorForm.contact.trim() || 'N/A',
      idPresented: visitorForm.idPresented || "Driver's License",
      plateNumber: visitorForm.plateNumber.trim().toUpperCase(),
      vehicleType: visitorForm.vehicleType || 'Motorcycle',
      destination: visitorForm.destination,
      purpose: visitorForm.purpose,
      validDays: days,
      validUntil: expiryStr,
      entryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today',
      status: 'INSIDE',
      exitTime: null,
      classification: 'VISITOR',
      qrData: `RSU-VPASS:${passId}:${visitorForm.plateNumber.trim().toUpperCase().replace(/\\s+/g, '')}:VISITOR`
    };

    setVisitorPasses(prev => [newVisitor, ...prev]);

    // Also auto-record initial ENTRY log
    addGateLog({
      passNumber: newVisitor.id,
      plateNumber: newVisitor.plateNumber,
      owner: newVisitor.name,
      classification: 'VISITOR',
      type: 'ENTRY',
      status: 'VALID'
    });

    return newVisitor;
  };

  // Log Visitor Exit (1-tap Departure)
  const logVisitorExit = (idOrPlate) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let visitorFound = null;

    setVisitorPasses(prev => prev.map(v => {
      if (v.id === idOrPlate || v.plateNumber === idOrPlate) {
        visitorFound = v;
        return {
          ...v,
          status: 'EXITED',
          exitTime: `${timeStr} Today`
        };
      }
      return v;
    }));

    if (visitorFound) {
      addGateLog({
        passNumber: visitorFound.id,
        plateNumber: visitorFound.plateNumber,
        owner: visitorFound.name,
        classification: 'VISITOR',
        type: 'EXIT',
        status: 'VALID'
      });
    }
  };

  // Renew Visitor Pass (for returning guests/delegates)
  const renewVisitorPass = (idOrPlate, days = 1) => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (days - 1));
    const expiryStr = days === 1 
      ? 'Today • 11:59 PM (1 Day)' 
      : `${expiryDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} (${days} Days)`;

    let renewedItem = null;

    setVisitorPasses(prev => prev.map(v => {
      if (v.id === idOrPlate || v.plateNumber === idOrPlate) {
        renewedItem = {
          ...v,
          validDays: days,
          validUntil: expiryStr,
          status: 'INSIDE',
          exitTime: null,
          entryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today'
        };
        return renewedItem;
      }
      return v;
    }));

    if (renewedItem) {
      addGateLog({
        passNumber: renewedItem.id,
        plateNumber: renewedItem.plateNumber,
        owner: renewedItem.name,
        classification: 'VISITOR',
        type: 'ENTRY',
        status: 'VALID'
      });
    }

    return renewedItem;
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
        visitorPasses,
        gateLogs,
        addGateLog,
        issueVisitorPass,
        logVisitorExit,
        renewVisitorPass
      }}
    >
      {children}
    </PassContext.Provider>
  );
};

export const usePass = () => useContext(PassContext);
