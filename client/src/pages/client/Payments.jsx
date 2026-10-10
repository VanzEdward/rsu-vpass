import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { usePass } from '../../context/PassContext';
import CameraCaptureModal from '../../components/CameraCaptureModal';
import { 
  Receipt, 
  Info, 
  CheckCircle2, 
  Camera, 
  UploadCloud, 
  QrCode, 
  ArrowRight,
  ShieldCheck, 
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  Check,
  Car
} from 'lucide-react';

export default function Payments() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { applications, submitReceiptPayment } = usePass();

  const approvedApps = applications.filter((a) => a.status === 'APPROVED' || a.receiptRejectionRemark);
  const queryAppId = searchParams.get('appId');

  // If a specific application was targeted (e.g. clicked "Upload Receipt" on Euro Step by Step),
  // strictly isolate to that specific application so no other vehicle is shown or mixed in!
  const targetApps = queryAppId
    ? applications.filter((a) => a.id === queryAppId)
    : approvedApps;

  const [selectedAppId, setSelectedAppId] = useState(queryAppId || (approvedApps[0]?.id || ''));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Click outside to close custom dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const [orNumber, setOrNumber] = useState('');
  const [receiptPhoto, setReceiptPhoto] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedPass, setGeneratedPass] = useState(null);

  const selectedApp = applications.find((a) => a.id === selectedAppId);

  useEffect(() => {
    if (queryAppId) {
      setSelectedAppId(queryAppId);
    } else if (targetApps.length > 0 && !selectedAppId) {
      setSelectedAppId(targetApps[0].id);
    }
  }, [queryAppId, targetApps, selectedAppId]);

  useEffect(() => {
    if (selectedApp?.receipt?.orNumber && !orNumber) {
      setOrNumber(selectedApp.receipt.orNumber);
    }
  }, [selectedAppId, selectedApp]);

  const handleReceiptPhotoCaptured = (photoDataUrl) => {
    setReceiptPhoto(photoDataUrl);
    setError('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setReceiptPhoto(event.target.result);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedAppId) {
      setError('Please select an approved application.');
      return;
    }
    if (!orNumber.trim()) {
      setError('Please enter the Official Receipt (OR) Number.');
      return;
    }
    if (!receiptPhoto) {
      setError('Please take a photo or upload an image of your physical Cashier receipt.');
      return;
    }

    // Submit to store -> Automatically generates QR code & pass!
    submitReceiptPayment(selectedAppId, orNumber.trim(), receiptPhoto);
    setIsSuccess(true);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Cashier Payment & Receipt Submission</h1>
        <p className="text-xs text-slate-500 mt-1">
          Milestone 3: Upload your official Cashier receipt. Once submitted, PASO admin will verify your payment and generate your Gate QR Code.
        </p>
      </div>

      {/* University Cashier Policy Info */}
      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-slate-800 flex items-start space-x-3">
        <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-emerald-950">Milestone Instructions</p>
          <p className="leading-relaxed text-slate-600">
            Once your vehicle registration application has been reviewed and approved by PASO, pay the pass fee at the university Cashier window. Enter the OR number and snap a clear photo of the physical receipt below.
          </p>
        </div>
      </div>

      {/* Success State */}
      {isSuccess ? (
        <div className="bg-white rounded-3xl border-2 border-emerald-500 p-8 shadow-md text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
              Milestone 3 Complete: Receipt Uploaded
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-2">Cashier Receipt Submitted for Verification!</h2>
            <p className="text-xs text-slate-600 mt-1.5 max-w-md mx-auto leading-relaxed">
              Your official receipt (OR <strong className="font-mono text-slate-900">#{orNumber}</strong>) and payment photo have been transmitted to the PASO Administration Office.
            </p>
          </div>

          {/* Verification Protocol Notice */}
          <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
            <p className="font-bold text-slate-800 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Next Steps in PASO Protocol:</span>
            </p>
            <ol className="list-decimal pl-4 space-y-1 text-slate-600 text-[11px] leading-relaxed">
              <li>PASO Admin reviews and validates your official Cashier receipt.</li>
              <li>Once verified, PASO generates and certifies your unique Gate QR Pass.</li>
              <li>Your QR code and vehicle credentials will automatically unlock under <strong>My Pass</strong>.</li>
            </ol>
          </div>

          <div className="pt-2 flex justify-center space-x-3">
            <Link
              to="/client/applications"
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-2 shadow-sm"
            >
              <span>Track Application in Milestones</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Form State */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900">Record Cashier Payment Proof</h2>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {approvedApps.length === 0 ? (
            applications.some(a => a.status === 'RECEIPT_SUBMITTED') ? (
              <div className="p-8 text-center bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-amber-600 mx-auto" />
                <p className="text-xs font-bold text-amber-900">Cashier Receipt Already Submitted & Pending PASO Verification</p>
                <p className="text-[11px] text-amber-700 max-w-md mx-auto">
                  Your payment receipt proof has been submitted and is currently being evaluated by the PASO admin. Once verified, PASO will release your official QR Code.
                </p>
                <Link
                  to="/client/applications"
                  className="inline-flex items-center space-x-1.5 mt-2 text-xs font-bold text-amber-900 hover:underline"
                >
                  <span>Track Application Milestones</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No Approved Applications Awaiting Payment</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Your application must first be approved by PASO in Milestone 2 before you can submit a Cashier receipt.
                </p>
                <Link
                  to="/client/applications"
                  className="inline-block mt-2 text-xs font-semibold text-emerald-600 hover:underline"
                >
                  Check Application Tracker ➔
                </Link>
              </div>
            )
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* Receipt Rejection Banner with PASO Note */}
              {selectedApp?.receiptRejectionRemark && (
                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 flex items-start gap-3 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200/80 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <span className="font-bold text-amber-950 text-xs sm:text-sm">
                        Cashier Receipt Declined by PASO Admin
                      </span>
                      <span className="inline-flex items-center text-[10px] bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 whitespace-nowrap border border-amber-300/80 self-start sm:self-auto">
                        Action Needed: Re-upload Proof
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200 text-amber-900">
                      <p className="font-bold text-[11px] text-amber-800">Reason / Note from PASO:</p>
                      <p className="font-medium text-xs mt-0.5 italic break-words">&ldquo;{selectedApp.receiptRejectionRemark}&rdquo;</p>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      You do not need to restart your vehicle registration. Simply correct the mistake (e.g., retake a clearer photo of the official receipt or check the OR number) and re-submit below for PASO verification.
                    </p>
                  </div>
                </div>
              )}

              {/* Renewal Guidance Banner */}
              {selectedApp?.isRenewal && (
                <div className="p-4 rounded-2xl bg-purple-50/90 border border-purple-200 text-purple-950 flex items-start gap-3 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200/80 mt-0.5">
                    <RefreshCw className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-purple-950 text-xs sm:text-sm block">
                      Annual Vehicle Pass Renewal Fee
                    </span>
                    <p className="text-[11px] text-purple-800 leading-relaxed">
                      You are submitting Cashier proof for <strong>{selectedApp.vehicle?.make} {selectedApp.vehicle?.model} ({selectedApp.vehicle?.plateNumber})</strong>. 
                      Your existing Pass Number (<strong>{selectedApp.pass?.passNumber || selectedApp.assignedPassNumber}</strong>) and physical QR sticker remain active upon verification.
                    </p>
                  </div>
                </div>
              )}

              {/* Select Approved Application (Custom Styled Dropdown strictly bounded to system design) */}
              <div className="relative" ref={dropdownRef}>
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <label className="font-bold text-slate-800 text-xs flex items-center gap-1">
                    <span>Approved Vehicle Registration</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  {queryAppId && (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0 whitespace-nowrap shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      <span>Targeted Vehicle Only</span>
                    </span>
                  )}
                </div>

                {/* Custom Styled Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    if (targetApps.length > 1) {
                      setIsDropdownOpen(!isDropdownOpen);
                    }
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white flex items-center justify-between text-left transition-all shadow-xs ${
                    targetApps.length > 1 ? 'cursor-pointer hover:border-slate-400' : 'cursor-default'
                  } ${
                    isDropdownOpen
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1 pr-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                      <Car className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5">
                        <span className="font-mono text-xs font-bold text-emerald-800 shrink-0">
                          {selectedApp?.id || 'Select Application'}
                        </span>
                        <span className="text-slate-300 text-xs hidden sm:inline">•</span>
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {selectedApp?.vehicle?.make} {selectedApp?.vehicle?.model}
                        </span>
                        <span className="font-mono text-[11px] font-semibold text-slate-600 shrink-0">
                          ({selectedApp?.vehicle?.plateNumber})
                        </span>
                      </div>
                    </div>
                  </div>

                  {targetApps.length > 1 && (
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform duration-200 ${
                        isDropdownOpen ? 'rotate-180 text-emerald-600' : ''
                      }`}
                    />
                  )}
                </button>

                {/* Custom Popover Options List */}
                {isDropdownOpen && targetApps.length > 1 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto">
                    {targetApps.map((app) => {
                      const isSelected = selectedAppId === app.id;
                      return (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => {
                            setSelectedAppId(app.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-900 font-bold'
                              : 'text-slate-700 hover:bg-slate-50 font-medium'
                          }`}
                        >
                          <div className="flex items-center space-x-2 min-w-0 pr-2 truncate">
                            <span className="font-mono text-[11px] font-bold text-emerald-700 shrink-0">
                              {app.id}
                            </span>
                            <span className="truncate">
                              {app.vehicle?.make} {app.vehicle?.model} ({app.vehicle?.plateNumber})
                            </span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Receipt (OR) Number</label>
                <input
                  type="text"
                  required
                  maxLength={20}
                  placeholder="e.g. 2026-98123"
                  value={orNumber}
                  onChange={(e) => setOrNumber(e.target.value.slice(0, 20))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              {/* Receipt Picture Capture / Upload */}
              <div className="space-y-2">
                <label className="block font-semibold text-slate-700">
                  Cashier Receipt Picture Proof
                </label>

                <div className="p-5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center">
                  {receiptPhoto ? (
                    <div className="space-y-3 flex flex-col items-center">
                      <div className="w-48 h-48 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-sm relative">
                        <img
                          src={receiptPhoto}
                          alt="Cashier Receipt"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-emerald-600 text-white rounded-full p-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCameraOpen(true)}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-white text-xs font-semibold text-slate-700 flex items-center space-x-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Retake Receipt Photo</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                        <Receipt className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">Snap Photo of Cashier Receipt</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Make sure the OR number and date on the paper receipt are visible.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsCameraOpen(true)}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center space-x-2 cursor-pointer shadow-xs transition-colors"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Open Camera & Snap Receipt</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-200" />
                  <span>Submit Cashier Receipt for PASO Verification</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Camera Capture Modal for Receipt */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleReceiptPhotoCaptured}
        title="Snap Cashier Receipt"
      />
    </div>
  );
}
