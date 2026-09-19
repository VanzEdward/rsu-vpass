import React, { createContext, useContext, useState, useEffect } from 'react';

const PassContext = createContext(null);

const INITIAL_APPLICATIONS = [
  {
    id: 'APP-2026-0001',
    user_id: 1,
    applicant_name: 'Juan Dela Cruz',
    school_id: '2026-00001',
    classification: 'Student',
    department: 'College of Engineering & Technology',
    contact_number: '+63 912 345 6789',
    applicant_photo: null, // Will use placeholder if null
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
    status: 'APPROVED', // PENDING, APPROVED, REJECTED, PAID, PASS_ISSUED
    rejection_reason: null,
    submittedDate: 'January 10, 2026',
    receipt: {
      orNumber: '2026-98123',
      receiptPhoto: null,
      paidAt: 'January 11, 2026',
    },
    pass: {
      passNumber: 'VP-2026-0001',
      qrData: 'RSU-VPASS:VP-2026-0001:XYZ5678:2026-00001',
      validUntil: 'December 31, 2026',
      status: 'ACTIVE',
    }
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
      }
    ];
  });

  // Auto-saved In-Progress Draft Application
  const [draftApplication, setDraftApplication] = useState(() => {
    const saved = localStorage.getItem('vpass_registration_draft');
    return saved ? JSON.parse(saved) : null;
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
      classification: formData.classification,
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
      }}
    >
      {children}
    </PassContext.Provider>
  );
};

export const usePass = () => useContext(PassContext);
