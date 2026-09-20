import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePass } from '../../context/PassContext';
import { useAuth } from '../../context/AuthContext';
import CameraCaptureModal from '../../components/CameraCaptureModal';
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
  FileEdit,
  Trash2,
  Clock,
  Save
} from 'lucide-react';

export default function MyVehicle() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { vehicles, submitApplication, draftApplication, saveDraft, clearDraft } = usePass();

  const [showWizard, setShowWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [returnTo, setReturnTo] = useState(null);

  const initialFormState = {
    classification: 'Student', // 'Student' | 'Employee'
    applicant_name: user?.full_name || 'Juan Dela Cruz',
    school_id: user?.school_id || '2026-00001',
    department: 'College of Engineering & Technology (CET)',
    contact_number: '+63 912 345 6789',
    applicant_photo: null, // Base64 data URL from camera
    plateNumber: '',
    type: 'Motorcycle',
    make: '',
    model: '',
    color: '',
    year: '2024',
    driverLicense: null,
    orCr: null,
  };

  // Form State
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  // Auto-resume draft if navigated with ?resume=true or if draft exists
  useEffect(() => {
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
  }, [searchParams, draftApplication]);

  const showToastNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-save draft on change
      saveDraft(updated, currentStep);
      return updated;
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleCloseWizard = () => {
    // Auto-save progress before closing
    saveDraft(formData, currentStep);
    setShowWizard(false);

    if (returnTo === 'applications') {
      navigate('/client/applications');
    } else {
      showToastNotification('Draft auto-saved! You can resume anytime from Requests or My Vehicle.');
    }
  };

  const handleStartFresh = () => {
    if (window.confirm('Discard the current draft and start a new vehicle application?')) {
      clearDraft();
      setFormData(initialFormState);
      setCurrentStep(1);
      setShowWizard(true);
    }
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

    if (step === 1) {
      if (!formData.applicant_name.trim()) newErrors.applicant_name = 'Name is required';
      if (!formData.school_id.trim()) newErrors.school_id = 'ID number is required';
      if (!formData.department.trim()) newErrors.department = 'Department is required';
    }

    if (step === 2) {
      if (!formData.applicant_photo) {
        newErrors.applicant_photo = 'Please take or upload your identification photo using the camera.';
      }
    }

    if (step === 3) {
      if (!formData.plateNumber.trim()) newErrors.plateNumber = 'Plate number is required';
      if (!formData.make.trim()) newErrors.make = 'Make is required (e.g. Honda)';
      if (!formData.model.trim()) newErrors.model = 'Model is required (e.g. Click 125)';
      if (!formData.color.trim()) newErrors.color = 'Color is required';
    }

    if (step === 4) {
      if (!formData.driverLicense) newErrors.driverLicense = "Please upload or attach Driver's License";
      if (!formData.orCr) newErrors.orCr = 'Please upload or attach Official OR/CR';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      const nextStep = Math.min(currentStep + 1, 5);
      setCurrentStep(nextStep);
      saveDraft(formData, nextStep);
    }
  };

  const handlePrev = () => {
    const prevStep = Math.max(currentStep - 1, 1);
    setCurrentStep(prevStep);
    saveDraft(formData, prevStep);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep(4)) {
      setCurrentStep(4);
      return;
    }

    // Submit to store
    submitApplication(formData);

    // Clear saved draft once successfully submitted
    clearDraft();

    // Close wizard and redirect to Applications tracker
    setShowWizard(false);
    navigate('/client/applications');
  };

  const stepsList = [
    { number: 1, title: 'Classification' },
    { number: 2, title: 'Photo ID' },
    { number: 3, title: 'Vehicle' },
    { number: 4, title: 'OR/CR & License' },
    { number: 5, title: 'Review & Submit' },
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
            if (draftApplication) {
              setShowResumeModal(true);
            } else {
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
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{v.make} {v.model} ({v.year})</h3>
                  <p className="text-xs text-slate-500">{v.type} • {v.color}</p>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                v.status === 'Active Pass'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {v.status}
              </span>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-500">Plate Number:</span>
              <span className="font-mono font-black text-slate-900 text-sm tracking-wider">{v.plateNumber}</span>
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
                  {draftApplication && currentStep > 1 && (
                    <span className="inline-flex items-center space-x-1 text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
                      <Check className="w-3 h-3 text-teal-600" />
                      <span>Draft Restored (Step {currentStep})</span>
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">RSU Vehicle Pass Application</h3>
              </div>
              <button
                onClick={handleCloseWizard}
                title="Save Draft & Close"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer transition-colors text-base"
              >
                ✕
              </button>
            </div>

            {/* Stepper Indicator */}
            <div className="relative">
              <div className="flex items-center justify-between">
                {stepsList.map((step) => {
                  const isCompleted = currentStep > step.number;
                  const isCurrent = currentStep === step.number;
                  return (
                    <div key={step.number} className="flex flex-col items-center relative z-10 flex-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isCompleted
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : isCurrent
                            ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-600 ring-4 ring-emerald-50'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4" /> : step.number}
                      </div>
                      <span
                        className={`text-[10px] mt-1 font-semibold text-center hidden sm:block ${
                          isCurrent ? 'text-emerald-700' : 'text-slate-400'
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
              {/* Step 1: Classification & Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Applicant Classification</h4>
                    <p className="text-xs text-slate-500">Are you registering as a university student or an employee?</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleFieldChange('classification', 'Student')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        formData.classification === 'Student'
                          ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block text-xs font-bold text-slate-900">University Student</span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">Undergraduate / Graduate</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFieldChange('classification', 'Employee')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        formData.classification === 'Employee'
                          ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block text-xs font-bold text-slate-900">Faculty / Employee</span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">Teaching or Non-teaching staff</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={formData.applicant_name}
                        onChange={(e) => handleFieldChange('applicant_name', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                      />
                      {errors.applicant_name && <p className="text-red-500 text-[11px] mt-0.5">{errors.applicant_name}</p>}
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {formData.classification === 'Student' ? 'School ID Number' : 'Employee ID Number'}
                      </label>
                      <input
                        type="text"
                        value={formData.school_id}
                        onChange={(e) => handleFieldChange('school_id', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                      {errors.school_id && <p className="text-red-500 text-[11px] mt-0.5">{errors.school_id}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">College / Department</label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => handleFieldChange('department', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                      />
                      {errors.department && <p className="text-red-500 text-[11px] mt-0.5">{errors.department}</p>}
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Contact Number</label>
                      <input
                        type="text"
                        value={formData.contact_number}
                        onChange={(e) => handleFieldChange('contact_number', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
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
                      Take a clear live photo using your phone or computer camera for the official Wearable Vehicle Pass.
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

              {/* Step 3: Vehicle Information */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Vehicle Details</h4>
                    <p className="text-xs text-slate-500">Provide the exact specifications of the vehicle.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Plate Number</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ABC 1234 or XYZ 5678"
                        value={formData.plateNumber}
                        onChange={(e) => handleFieldChange('plateNumber', e.target.value.toUpperCase())}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                      />
                      {errors.plateNumber && <p className="text-red-500 text-[11px] mt-0.5">{errors.plateNumber}</p>}
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Vehicle Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => handleFieldChange('type', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                      >
                        <option>Motorcycle</option>
                        <option>Sedan</option>
                        <option>SUV</option>
                        <option>Van</option>
                        <option>Pickup</option>
                        <option>Truck</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Make / Brand</label>
                      <input
                        type="text"
                        placeholder="e.g. Honda, Toyota"
                        value={formData.make}
                        onChange={(e) => handleFieldChange('make', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                      />
                      {errors.make && <p className="text-red-500 text-[11px] mt-0.5">{errors.make}</p>}
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Model</label>
                      <input
                        type="text"
                        placeholder="e.g. Click 125, Vios"
                        value={formData.model}
                        onChange={(e) => handleFieldChange('model', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                      />
                      {errors.model && <p className="text-red-500 text-[11px] mt-0.5">{errors.model}</p>}
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Color & Year</label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Color"
                          value={formData.color}
                          onChange={(e) => handleFieldChange('color', e.target.value)}
                          className="w-1/2 p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                        />
                        <input
                          type="number"
                          placeholder="Year"
                          value={formData.year}
                          onChange={(e) => handleFieldChange('year', e.target.value)}
                          className="w-1/2 p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      {errors.color && <p className="text-red-500 text-[11px] mt-0.5">{errors.color}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: OR/CR and Driver's License Uploads */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Upload Required Documents</h4>
                    <p className="text-xs text-slate-500">
                      Upload clear photos or scans of your Driver's License and Vehicle OR/CR.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Driver's License */}
                    <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Driver's License</p>
                        <p className="text-[11px] text-slate-500">Valid Philippine Driver's License</p>
                      </div>

                      {formData.driverLicense ? (
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold flex items-center justify-center space-x-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>License Attached</span>
                        </div>
                      ) : (
                        <label className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer">
                          <UploadCloud className="w-4 h-4 text-emerald-600" />
                          <span>Upload / Camera</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange('driverLicense', e)}
                            className="hidden"
                          />
                        </label>
                      )}
                      {errors.driverLicense && <p className="text-red-500 text-[11px]">{errors.driverLicense}</p>}
                    </div>

                    {/* Official OR/CR */}
                    <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Official OR / CR</p>
                        <p className="text-[11px] text-slate-500">Official Receipt & Cert. of Registration</p>
                      </div>

                      {formData.orCr ? (
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold flex items-center justify-center space-x-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>OR/CR Attached</span>
                        </div>
                      ) : (
                        <label className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer">
                          <UploadCloud className="w-4 h-4 text-emerald-600" />
                          <span>Upload / Camera</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange('orCr', e)}
                            className="hidden"
                          />
                        </label>
                      )}
                      {errors.orCr && <p className="text-red-500 text-[11px]">{errors.orCr}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Review & Submit Request to PASO */}
              {currentStep === 5 && (
                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Review Application Summary</h4>
                    <p className="text-xs text-slate-500">
                      Please check the information before submitting to the Physical Assets and Security Office (PASO).
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
                        <span className="text-slate-400 block font-semibold">Vehicle:</span>
                        <span className="font-bold text-slate-800">{formData.make} {formData.model} ({formData.year})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Plate Number:</span>
                        <span className="font-mono font-black text-emerald-700">{formData.plateNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Type & Color:</span>
                        <span className="text-slate-700">{formData.type} • {formData.color}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Documents:</span>
                        <span className="text-emerald-700 font-medium">✓ License & OR/CR Attached</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-slate-700 flex items-start space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed text-[11px]">
                      By submitting this registration, you certify that all information is truthful. PASO will review your submission. Once approved, you will proceed to the Cashier Payment & Receipt upload milestone.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Stepper Footer Controls */}
            <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCloseWizard}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Save Draft & Exit
                </button>
              )}

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Submit Request to PASO</span>
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
                You have a saved draft on <strong>Step {draftApplication.step} of 5</strong>
                {draftApplication.data?.make ? ` for ${draftApplication.data.make} ${draftApplication.data.model || ''}` : ''}.
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
                  clearDraft();
                  setFormData(initialFormState);
                  setCurrentStep(1);
                  setShowWizard(true);
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
