import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePass } from '../../context/PassContext';
import { useAuth } from '../../context/AuthContext';
import CameraCaptureModal from '../../components/CameraCaptureModal';
import ConfirmModal from '../../components/ConfirmModal';
import { 
  Car, 
  Plus, 
  UploadCloud, 
  Camera, 
  Check, 
  User, 
  FileText, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  RefreshCw,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  FileEdit,
  Trash2,
  Clock,
  Save,
  ChevronDown
} from 'lucide-react';

const VEHICLE_TYPES = [
  { value: 'Motorcycle', label: 'Motorcycle (Standard 2-Wheels)' },
  { value: 'Sedan', label: 'Sedan (4-Wheels)' },
  { value: 'SUV', label: 'SUV (4-Wheels)' },
  { value: 'Pickup', label: 'Pickup Truck' },
  { value: 'Van', label: 'Van / Utility Vehicle' },
  { value: 'Commercial', label: 'Commercial / Truck / Bus' },
  { value: 'Other', label: 'Other' }
];

export default function MyVehicle() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { vehicles, applications = [], submitApplication, resubmitApplication, draftApplication, saveDraft, clearDraft } = usePass();

  const [showWizard, setShowWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const [showStartFreshModal, setShowStartFreshModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [returnTo, setReturnTo] = useState(null);
  const [editingAppId, setEditingAppId] = useState(null);
  const [editingRejectionReason, setEditingRejectionReason] = useState('');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef(null);

  // Click outside listener for custom vehicle type dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setIsTypeDropdownOpen(false);
      }
    }
    if (isTypeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isTypeDropdownOpen]);

  const initialFormState = {
    // Registered client profile automatically loaded
    classification: user?.classification || 'Student',
    applicant_name: user?.full_name || 'Juan Dela Cruz',
    school_id: user?.school_id || '2026-00001',
    department: user?.year_course || user?.department_unit || 'College of Engineering & Technology (CET)',
    contact_number: user?.contact_number || '+63 912 345 6789',
    applicant_photo: user?.profile_image || null, // Base64 data URL from camera

    // Step 1: Vehicle Registration Information
    plateNumber: '',
    make: '',
    brand: '',
    model: '',
    color: '',
    type: 'Motorcycle',
    year: '2026',

    // Step 3: Xerox / Upload Documents
    driverLicense: null,
    orCr: null,
    pledgeAgreed: true,
  };

  // Form State
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  // Check for editAppId (Correcting a rejected application) or resume draft
  // Cleanup any lingering draft that matches an existing submitted application
  useEffect(() => {
    if (draftApplication && applications && applications.length > 0) {
      const draftPlate = draftApplication.data?.plateNumber?.replace(/\s+/g, '').toUpperCase();
      const isDuplicate = applications.some((app) => {
        const appPlate = app.vehicle?.plateNumber?.replace(/\s+/g, '').toUpperCase();
        return Boolean(draftPlate && appPlate && draftPlate === appPlate);
      });
      if (isDuplicate) {
        clearDraft();
      }
    }
  }, [draftApplication, applications, clearDraft]);

  // Check for editAppId (Correcting a rejected application) or resume draft
  useEffect(() => {
    const editId = searchParams.get('editAppId');
    if (editId && (applications || []).length > 0) {
      const appToEdit = applications.find(a => a.id === editId);
      if (appToEdit) {
        setFormData({
          classification: appToEdit.classification || user?.classification || 'Student',
          applicant_name: appToEdit.applicant_name || user?.full_name || '',
          school_id: appToEdit.school_id || user?.school_id || '',
          department: appToEdit.department || '',
          contact_number: appToEdit.contact_number || '',
          applicant_photo: appToEdit.applicant_photo || null,
          plateNumber: appToEdit.vehicle?.plateNumber || '',
          make: appToEdit.vehicle?.make || '',
          brand: appToEdit.vehicle?.make || '',
          model: appToEdit.vehicle?.model || '',
          year: appToEdit.vehicle?.year || '2026',
          color: appToEdit.vehicle?.color || '',
          type: appToEdit.vehicle?.type || 'Motorcycle',
          driverLicense: appToEdit.documents?.driverLicense || null,
          orCr: appToEdit.documents?.orCr || null,
          pledgeAgreed: true,
        });
        setEditingAppId(editId);
        setEditingRejectionReason(appToEdit.rejection_reason || 'Correction requested by PASO');
        setCurrentStep(1);
        setShowWizard(true);
        setSearchParams({}, { replace: true });

        // If a draft exists for this vehicle, clear it so it doesn't appear as a duplicate
        if (draftApplication) {
          const draftPlate = draftApplication.data?.plateNumber?.replace(/\s+/g, '').toUpperCase();
          const appPlate = appToEdit.vehicle?.plateNumber?.replace(/\s+/g, '').toUpperCase();
          if (draftPlate && appPlate && draftPlate === appPlate) {
            clearDraft();
          }
        }
        return;
      }
    }

    if (searchParams.get('resume') === 'true' && draftApplication) {
      const from = searchParams.get('from');
      if (from) {
        setReturnTo(from);
      }
      setFormData(draftApplication.data || initialFormState);
      setCurrentStep(draftApplication.step || 1);
      setShowWizard(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, draftApplication, applications]);

  const showToastNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-save draft on change ONLY for brand new applications (not when editing an existing rejected application)
      if (!editingAppId) {
        saveDraft(updated, currentStep);
      }
      return updated;
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleCloseWizard = () => {
    const wasEditing = Boolean(editingAppId);
    // Auto-save progress before closing ONLY for brand new applications
    if (!editingAppId) {
      saveDraft(formData, currentStep);
    }
    setShowWizard(false);
    if (editingAppId) {
      setEditingAppId(null);
      setEditingRejectionReason('');
    }

    if (returnTo === 'applications') {
      navigate('/client/applications');
    } else if (!wasEditing) {
      showToastNotification('Draft auto-saved! You can resume anytime from Requests or My Vehicle.');
    }
  };

  const handleStartFresh = () => {
    setShowStartFreshModal(true);
  };

  const confirmStartFresh = () => {
    clearDraft();
    setFormData(initialFormState);
    setCurrentStep(1);
    setShowWizard(true);
  };

  const handlePhotoCaptured = (photoDataUrl) => {
    handleFieldChange('applicant_photo', photoDataUrl);
  };

  // Mock file uploads for documents
  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleFieldChange(field, event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Step Validation
  const validateStep = (step) => {
    const newErrors = {};

    // Step 1: Vehicle Registration Information
    if (step === 1) {
      if (!formData.plateNumber.trim()) newErrors.plateNumber = 'Plate Number is required';
      if (!formData.make.trim() && !formData.brand.trim()) newErrors.make = 'Brand is required (e.g. Honda, Yamaha, Toyota)';
      if (!formData.model.trim()) newErrors.model = 'Model is required (e.g. Click 125, Vios)';
      if (!formData.color.trim()) newErrors.color = 'Color is required (e.g. Matte Black, Pearl White)';
    }

    // Step 2: Photo ID Live Camera
    if (step === 2) {
      if (!formData.applicant_photo) {
        newErrors.applicant_photo = 'Please take or upload your identification photo using the camera.';
      }
    }

    // Step 3: Required Xerox/Upload Documents
    if (step === 3) {
      if (!formData.driverLicense) newErrors.driverLicense = "Please upload or attach Driver's License";
      if (!formData.orCr) newErrors.orCr = 'Please upload or attach Official OR/CR';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      const nextStep = Math.min(currentStep + 1, 4);
      setCurrentStep(nextStep);
      if (!editingAppId) {
        saveDraft(formData, nextStep);
      }
    }
  };

  const handlePrev = () => {
    const prevStep = Math.max(currentStep - 1, 1);
    setCurrentStep(prevStep);
    if (!editingAppId) {
      saveDraft(formData, prevStep);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep(1)) {
      setCurrentStep(1);
      return;
    }
    if (!validateStep(2)) {
      setCurrentStep(2);
      return;
    }
    if (!validateStep(3)) {
      setCurrentStep(3);
      return;
    }

    // Submit or Re-submit application
    if (editingAppId && resubmitApplication) {
      resubmitApplication(editingAppId, {
        ...formData,
        make: formData.make || formData.brand,
      });
      setEditingAppId(null);
      setEditingRejectionReason('');
    } else {
      submitApplication({
        ...formData,
        make: formData.make || formData.brand,
      });
    }

    // Clear saved draft once successfully submitted
    clearDraft();

    // Close wizard and redirect to Applications tracker
    setShowWizard(false);
    navigate('/client/applications');
  };

  const stepsList = [
    { number: 1, title: 'Vehicle Info' },
    { number: 2, title: 'Photo ID' },
    { number: 3, title: 'OR/CR & License' },
    { number: 4, title: 'Review & Submit' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Toast Notification (Only shown on base page when modal is closed) */}
      {!showWizard && toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-700 text-white font-semibold text-xs flex items-center justify-between shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage('')}
            className="text-emerald-200 hover:text-white p-1 rounded-md hover:bg-emerald-800 transition-colors cursor-pointer text-xs ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">My Registered Vehicles</h1>
          <p className="text-xs text-slate-500 mt-1">
            Register and manage vehicles cleared by the Physical Assets and Security Office (PASO).
          </p>
        </div>
        <button
          onClick={() => {
            const isDuplicate = Boolean(
              draftApplication &&
              (applications || []).some((app) => {
                const draftPlate = draftApplication.data?.plateNumber?.replace(/\s+/g, '').toUpperCase();
                const appPlate = app.vehicle?.plateNumber?.replace(/\s+/g, '').toUpperCase();
                return Boolean(draftPlate && appPlate && draftPlate === appPlate);
              })
            );

            if (draftApplication && !isDuplicate) {
              setShowResumeModal(true);
            } else {
              if (isDuplicate) clearDraft();
              setFormData(initialFormState);
              setCurrentStep(1);
              setShowWizard(true);
            }
          }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Register New Vehicle</span>
        </button>
      </div>

      {/* Vehicle Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {vehicles.map((v) => (
          <div key={v.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Car className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-slate-900 truncate">{v.make} {v.model} ({v.year})</h3>
                  <p className="text-xs text-slate-500 truncate">{v.type} • {v.color}</p>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                v.status === 'Active Pass'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {v.status}
              </span>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center text-xs gap-2">
              <span className="text-slate-500 shrink-0">Plate Number:</span>
              <span className="font-mono font-black text-slate-900 text-sm tracking-wider truncate">{v.plateNumber}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 5-Step Milestone Registration Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-8 shadow-2xl space-y-5 sm:space-y-6 max-h-[94vh] overflow-y-auto">
            {/* Modal Header with Auto-Save Indicator */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Step-by-Step Registration
                  </span>
                  <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50/80 px-2 py-0.5 rounded-md">
                    <Save className="w-3 h-3 text-emerald-600" />
                    <span>Auto-saving</span>
                  </span>
                  {editingAppId && (
                    <span className="inline-flex items-center space-x-1 text-[10px] text-amber-800 font-bold bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-300">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span>Correction Mode ({editingAppId})</span>
                    </span>
                  )}
                  {draftApplication && currentStep > 1 && !editingAppId && (
                    <span className="inline-flex items-center space-x-1 text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
                      <Check className="w-3 h-3 text-teal-600" />
                      <span>Draft Restored (Step {currentStep})</span>
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {editingAppId ? 'Correct & Re-submit Vehicle Registration' : 'RSU Vehicle Pass Application'}
                </h3>
                {editingAppId && editingRejectionReason && (
                  <div className="mt-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs">
                    <p className="font-bold flex items-center space-x-1.5 text-red-950">
                      <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>PASO Reviewer Remark:</span>
                    </p>
                    <p className="text-[11px] text-red-800 mt-0.5 pl-5">
                      "{editingRejectionReason}"
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={handleCloseWizard}
                title={editingAppId ? "Close Correction Form" : "Save Draft & Close"}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer transition-colors text-base"
              >
                ✕
              </button>
            </div>

            {/* Stepper Indicator */}
            <div className="relative pt-1 pb-1">
              <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
              <div className="flex items-center justify-between relative z-10">
                {stepsList.map((step) => {
                  const isCompleted = currentStep > step.number;
                  const isCurrent = currentStep === step.number;
                  return (
                    <div key={step.number} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isCompleted
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : isCurrent
                            ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-600 ring-4 ring-emerald-50'
                            : 'bg-white border-2 border-slate-200 text-slate-400'
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4" /> : step.number}
                      </div>
                      <span
                        className={`text-[10px] mt-1 font-semibold text-center hidden sm:block ${
                          isCurrent ? 'text-emerald-700 font-bold' : 'text-slate-400'
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step Content */}
            <div className="py-2">
              {/* Step 1: Vehicle Registration Form (Matching Physical Form) */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <Car className="w-5 h-5 text-emerald-600 shrink-0" />
                      <h4 className="text-sm sm:text-base font-black uppercase tracking-tight text-slate-900">
                        Vehicle Registration Information
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 italic leading-relaxed">
                      (Please attach your Xerox copy of vehicle certificate of registration, official receipt and driver's license in step 3)
                    </p>
                  </div>

                  {/* Enrolled Applicant Profile (Responsive Card, No Horizontal Overflow) */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                          Enrolled Applicant Profile
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/60 shrink-0">
                        Verified Account
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Applicant Full Name</span>
                        <span className="font-bold text-slate-900 text-xs block truncate">{formData.applicant_name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Identification Card No.</span>
                        <span className="font-mono font-bold text-emerald-800 text-xs block">{formData.school_id}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Department / Academic Program</span>
                        <span className="font-medium text-slate-700 text-xs block leading-tight">{formData.department}</span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Fields from Physical Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 text-xs">
                    {/* Plate Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Plate Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={10}
                        placeholder="e.g. ABC 1234 or MV File No."
                        value={formData.plateNumber}
                        onChange={(e) => handleFieldChange('plateNumber', e.target.value.toUpperCase().slice(0, 10))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono font-bold uppercase text-slate-900 outline-none transition-all placeholder:font-normal placeholder:normal-case placeholder:text-slate-400"
                      />
                      {errors.plateNumber && <p className="text-rose-600 text-[11px] font-semibold mt-1">{errors.plateNumber}</p>}
                    </div>

                    {/* Vehicle Classification / Type (Custom Contained Dropdown) */}
                    <div className="relative" ref={typeDropdownRef}>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Vehicle Classification / Type <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border bg-white flex items-center justify-between text-left font-semibold text-xs sm:text-sm text-slate-900 outline-none transition-all cursor-pointer shadow-xs ${
                          isTypeDropdownOpen
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                            : 'border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        <span className="truncate">
                          {VEHICLE_TYPES.find((t) => t.value === formData.type)?.label || formData.type || 'Select Vehicle Type'}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform duration-200 ${isTypeDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                      </button>

                      {/* Dropdown Popover (Strictly bounded to input width, never overflows card) */}
                      {isTypeDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto">
                          {VEHICLE_TYPES.map((t) => {
                            const isSelected = formData.type === t.value;
                            return (
                              <button
                                key={t.value}
                                type="button"
                                onClick={() => {
                                  handleFieldChange('type', t.value);
                                  setIsTypeDropdownOpen(false);
                                }}
                                className={`w-full px-3.5 py-2.5 text-left text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-emerald-50 text-emerald-800 font-bold'
                                    : 'text-slate-700 hover:bg-slate-50 font-medium'
                                }`}
                              >
                                <span className="truncate mr-2">{t.label}</span>
                                {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Brand */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Brand <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={25}
                        placeholder="e.g. Honda, Yamaha, Toyota, Suzuki"
                        value={formData.brand || formData.make}
                        onChange={(e) => {
                          const val = e.target.value.slice(0, 25);
                          handleFieldChange('brand', val);
                          handleFieldChange('make', val);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-semibold text-slate-900 outline-none transition-all placeholder:font-normal placeholder:text-slate-400"
                      />
                      {errors.make && <p className="text-rose-600 text-[11px] font-semibold mt-1">{errors.make}</p>}
                    </div>

                    {/* Model */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Model <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={25}
                        placeholder="e.g. Click 125, Vios, Aerox, Wigo"
                        value={formData.model}
                        onChange={(e) => handleFieldChange('model', e.target.value.slice(0, 25))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-semibold text-slate-900 outline-none transition-all placeholder:font-normal placeholder:text-slate-400"
                      />
                      {errors.model && <p className="text-rose-600 text-[11px] font-semibold mt-1">{errors.model}</p>}
                    </div>

                    {/* Color */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Color <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={20}
                        placeholder="e.g. Matte Black, Pearl White, Red"
                        value={formData.color}
                        onChange={(e) => handleFieldChange('color', e.target.value.slice(0, 20))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-semibold text-slate-900 outline-none transition-all placeholder:font-normal placeholder:text-slate-400"
                      />
                      {errors.color && <p className="text-rose-600 text-[11px] font-semibold mt-1">{errors.color}</p>}
                    </div>

                    {/* Year Model */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Year Model
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 2026"
                        min="1970"
                        max="2035"
                        maxLength={4}
                        value={formData.year}
                        onChange={(e) => handleFieldChange('year', e.target.value.slice(0, 4))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-semibold text-slate-900 outline-none transition-all placeholder:font-normal placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Picture Identification Capture (Live Camera) */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Picture Identification</h4>
                    <p className="text-xs text-slate-500">
                      Take a clear live photo using your camera for the official Wearable Vehicle Pass and guard viewfinder verification.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center">
                    {formData.applicant_photo ? (
                      /* Live Captured Preview */
                      <div className="space-y-3 flex flex-col items-center">
                        <div className="w-36 h-44 rounded-2xl overflow-hidden border-3 border-emerald-500 shadow-md relative group">
                          <img
                            src={formData.applicant_photo}
                            alt="Captured ID"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-emerald-600 text-white rounded-full p-1 shadow-xs">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setIsCameraModalOpen(true)}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-white text-xs font-semibold text-slate-700 flex items-center space-x-1 cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Retake Photo</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Empty State: Prompt to Open Camera */
                      <div className="space-y-3 max-w-sm">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-xs">
                          <Camera className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">No Photo Captured Yet</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Click below to open your camera and snap your identification photo.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsCameraModalOpen(true)}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center space-x-2 mx-auto cursor-pointer shadow-sm transition-transform active:scale-95"
                        >
                          <Camera className="w-4 h-4 text-emerald-100" />
                          <span>Open Camera & Take Photo</span>
                        </button>
                      </div>
                    )}

                    {errors.applicant_photo && (
                      <p className="text-red-600 text-xs font-semibold mt-3 flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.applicant_photo}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: OR/CR and Driver's License Uploads */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Upload Required Documents</h4>
                    <p className="text-xs text-slate-500">
                      Upload Xerox copies or clear scans of your Driver's License and Official Vehicle Certificate of Registration (OR/CR).
                    </p>
                  </div>

                  {/* Contextual PASO Rejection Notice during Correction */}
                  {editingAppId && editingRejectionReason && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-rose-950 flex items-center gap-1.5">
                          <span>PASO Reason for Returning Application:</span>
                        </p>
                        <p className="text-rose-800 text-xs font-semibold mt-0.5 leading-relaxed bg-white/70 p-2 rounded-lg border border-rose-200/60">
                          "{editingRejectionReason}"
                        </p>
                        <p className="text-[11px] text-rose-600 mt-1">
                          Please verify and re-upload the requested document(s) below.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Driver's License */}
                    <div className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50 text-center space-y-3 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <p className="font-bold text-slate-900">Driver's License</p>
                        <p className="text-[11px] text-slate-500">Valid Philippine Driver's License</p>
                      </div>

                      {formData.driverLicense ? (
                        <div className="space-y-2.5">
                          {/* Preview container if data URL or image */}
                          {typeof formData.driverLicense === 'string' && (formData.driverLicense.startsWith('data:image') || formData.driverLicense.startsWith('http') || formData.driverLicense.startsWith('/')) ? (
                            <div className="relative group rounded-xl overflow-hidden border border-emerald-300 bg-white max-h-36 flex items-center justify-center p-1.5 shadow-2xs">
                              <img
                                src={formData.driverLicense}
                                alt="Driver's License Preview"
                                className="max-h-28 w-auto object-contain rounded-lg"
                              />
                              <div className="absolute top-2 right-2">
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                                  <Check className="w-3 h-3" />
                                  <span>Attached</span>
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold flex items-center justify-between">
                              <span className="truncate">Driver's License Attached</span>
                              <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-md font-bold shrink-0">✓ Valid</span>
                            </div>
                          )}

                          {/* Action Buttons: Re-upload / Replace & Remove */}
                          <div className="flex items-center justify-center gap-2 pt-1">
                            <label className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-xs cursor-pointer shadow-2xs transition-colors">
                              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Re-upload / Change</span>
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => handleFileChange('driverLicense', e)}
                                className="hidden"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => handleFieldChange('driverLicense', null)}
                              className="inline-flex items-center justify-center p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer shadow-2xs"
                              title="Remove and upload different file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/40 transition-all cursor-pointer group">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-emerald-100 text-slate-500 group-hover:text-emerald-700 flex items-center justify-center transition-colors mb-1.5">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-slate-800 group-hover:text-emerald-800 text-xs">
                            Upload License
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">Scanned copy or photo</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileChange('driverLicense', e)}
                            className="hidden"
                          />
                        </label>
                      )}
                      {errors.driverLicense && <p className="text-rose-600 font-semibold text-[11px]">{errors.driverLicense}</p>}
                    </div>

                    {/* Official OR/CR */}
                    <div className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50 text-center space-y-3 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <p className="font-bold text-slate-900">Official OR / CR</p>
                        <p className="text-[11px] text-slate-500">Official Receipt & Cert. of Registration</p>
                      </div>

                      {formData.orCr ? (
                        <div className="space-y-2.5">
                          {/* Preview container if data URL or image */}
                          {typeof formData.orCr === 'string' && (formData.orCr.startsWith('data:image') || formData.orCr.startsWith('http') || formData.orCr.startsWith('/')) ? (
                            <div className="relative group rounded-xl overflow-hidden border border-emerald-300 bg-white max-h-36 flex items-center justify-center p-1.5 shadow-2xs">
                              <img
                                src={formData.orCr}
                                alt="Official OR/CR Preview"
                                className="max-h-28 w-auto object-contain rounded-lg"
                              />
                              <div className="absolute top-2 right-2">
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                                  <Check className="w-3 h-3" />
                                  <span>Attached</span>
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold flex items-center justify-between">
                              <span className="truncate">Official OR/CR Attached</span>
                              <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-md font-bold shrink-0">✓ Valid</span>
                            </div>
                          )}

                          {/* Action Buttons: Re-upload / Replace & Remove */}
                          <div className="flex items-center justify-center gap-2 pt-1">
                            <label className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-xs cursor-pointer shadow-2xs transition-colors">
                              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Re-upload / Change</span>
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => handleFileChange('orCr', e)}
                                className="hidden"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => handleFieldChange('orCr', null)}
                              className="inline-flex items-center justify-center p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer shadow-2xs"
                              title="Remove and upload different file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/40 transition-all cursor-pointer group">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-emerald-100 text-slate-500 group-hover:text-emerald-700 flex items-center justify-center transition-colors mb-1.5">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-slate-800 group-hover:text-emerald-800 text-xs">
                            Upload OR / CR
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">Scanned copy or photo</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileChange('orCr', e)}
                            className="hidden"
                          />
                        </label>
                      )}
                      {errors.orCr && <p className="text-rose-600 font-semibold text-[11px]">{errors.orCr}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review & Submit Request with Official Campus Pledge */}
              {currentStep === 4 && (
                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Review Application & Institutional Pledge</h4>
                    <p className="text-xs text-slate-500">
                      Confirm your vehicle pass information before submitting to the Physical Assets and Security Office (PASO).
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center space-x-4 pb-3 border-b border-slate-200">
                      {formData.applicant_photo ? (
                        <img
                          src={formData.applicant_photo}
                          alt="Applicant"
                          className="w-14 h-18 rounded-xl object-cover border-2 border-emerald-500"
                        />
                      ) : (
                        <div className="w-14 h-18 rounded-xl bg-slate-200 flex items-center justify-center">
                          <User className="w-6 h-6 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {formData.classification}
                        </span>
                        <h5 className="text-sm font-bold text-slate-900 mt-1">{formData.applicant_name}</h5>
                        <p className="text-slate-500 font-mono">ID: {formData.school_id}</p>
                        <p className="text-slate-500">{formData.department}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 block font-semibold">Plate Number:</span>
                        <span className="font-mono font-black text-emerald-700 text-sm">{formData.plateNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Brand & Model:</span>
                        <span className="font-bold text-slate-800">{formData.brand || formData.make} {formData.model}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Classification & Color:</span>
                        <span className="text-slate-700">{formData.type} • {formData.color} ({formData.year})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Required Xerox Documents:</span>
                        <span className="text-emerald-700 font-medium">✓ License & OR/CR Attached</span>
                      </div>
                    </div>
                  </div>

                  {/* Official University Pledge from Physical Form */}
                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-slate-800 space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-900 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>University Safety & Traffic Pledge</span>
                    </div>
                    <p className="text-xs italic leading-relaxed text-slate-700 bg-white/70 p-3 rounded-xl border border-emerald-100">
                      "I hereby pledge to obey and abide by the Romblon State University Rules and Policies inside the campus."
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-600">
                      <span>Applicant Signature: <strong className="text-slate-900">{formData.applicant_name}</strong></span>
                      <span className="font-mono text-emerald-800 font-semibold">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stepper Footer Controls (Balanced Button Sizing & Guaranteed Spacing) */}
            <div className="border-t border-slate-100 pt-4 flex items-center justify-between gap-3">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCloseWizard}
                  className="px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-semibold cursor-pointer shrink-0"
                >
                  Save Draft & Exit
                </button>
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-sm shrink-0"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md transition-all active:scale-95 shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>{editingAppId ? 'Re-submit Application' : 'Submit to PASO'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resume Draft or Start Fresh Dialog */}
      {showResumeModal && draftApplication && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center shadow-xs">
              <FileEdit className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Unfinished Registration Found</h3>
              <p className="text-xs text-slate-500 mt-1">
                You have a saved draft on <strong>Step {draftApplication.step} of 4</strong>
                {draftApplication.data?.make || draftApplication.data?.brand ? ` for ${draftApplication.data.brand || draftApplication.data.make} ${draftApplication.data.model || ''}` : ''}.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowResumeModal(false);
                  setFormData(draftApplication.data || initialFormState);
                  setCurrentStep(draftApplication.step || 1);
                  setShowWizard(true);
                }}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
              >
                <FileEdit className="w-4 h-4" />
                <span>Resume Draft (Step {draftApplication.step})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowResumeModal(false);
                  setShowStartFreshModal(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs cursor-pointer"
              >
                Discard & Start Fresh
              </button>

              <button
                type="button"
                onClick={() => setShowResumeModal(false)}
                className="w-full py-2 text-slate-400 hover:text-slate-600 font-medium text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified In-App Confirm Discard / Start Fresh Dialog */}
      <ConfirmModal
        isOpen={showStartFreshModal}
        onClose={() => setShowStartFreshModal(false)}
        onConfirm={confirmStartFresh}
        title="Discard Draft & Start Fresh?"
        message="Are you sure you want to discard your saved application? All entered vehicle details and uploaded documents will be cleared."
        confirmText="Yes, Discard Draft"
        cancelText="Keep My Draft"
        variant="danger"
      />

      {/* Live Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handlePhotoCaptured}
        title="Student / Employee ID Photo"
      />
    </div>
  );
}
