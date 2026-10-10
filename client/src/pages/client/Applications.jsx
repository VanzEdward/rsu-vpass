import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePass } from '../../context/PassContext';
import ConfirmModal from '../../components/ConfirmModal';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Receipt, 
  QrCode, 
  ShieldCheck, 
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  User,
  FileEdit,
  Trash2,
  Car
} from 'lucide-react';

export default function Applications() {
  const { applications, draftApplication, clearDraft } = usePass();
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Detect if draft is empty or belongs to an already submitted/existing application
  const isDraftEmpty = Boolean(
    draftApplication &&
    draftApplication.step === 1 &&
    !(
      draftApplication.data?.plateNumber?.trim() ||
      draftApplication.data?.brand?.trim() ||
      draftApplication.data?.make?.trim() ||
      draftApplication.data?.model?.trim() ||
      draftApplication.data?.color?.trim() ||
      draftApplication.data?.driverLicense ||
      draftApplication.data?.orCr
    )
  );

  const isDraftDuplicateOfSubmitted = Boolean(
    draftApplication &&
    (applications || []).some((app) => {
      const draftPlate = draftApplication.data?.plateNumber?.replace(/\s+/g, '').toUpperCase();
      const appPlate = app.vehicle?.plateNumber?.replace(/\s+/g, '').toUpperCase();
      return Boolean(draftPlate && appPlate && draftPlate === appPlate);
    })
  );

  React.useEffect(() => {
    if ((isDraftDuplicateOfSubmitted || isDraftEmpty) && clearDraft) {
      clearDraft();
    }
  }, [isDraftDuplicateOfSubmitted, isDraftEmpty, clearDraft]);

  const getStatusBadge = (status, app = null) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200">
            <Clock className="w-3 h-3" />
            <span>PENDING PASO REVIEW</span>
          </span>
        );
      case 'APPROVED':
        if (app?.receiptRejectionRemark) {
          return (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] border border-rose-300">
              <AlertCircle className="w-3 h-3 text-rose-600" />
              <span>RECEIPT DECLINED — RE-UPLOAD REQUIRED</span>
            </span>
          );
        }
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>APPROVED — PAY AT CASHIER</span>
          </span>
        );
      case 'RECEIPT_SUBMITTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-300">
            <Clock className="w-3 h-3 text-amber-700 animate-pulse" />
            <span>RECEIPT SUBMITTED — AWAITING PASO VERIFICATION</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-bold text-[10px] border border-red-200">
            <XCircle className="w-3 h-3 text-red-600" />
            <span>REJECTED BY PASO</span>
          </span>
        );
      case 'PASS_ISSUED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>OFFICIAL PASS ACTIVE</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getMilestoneStep = (status) => {
    switch (status) {
      case 'PENDING':
        return 2;
      case 'APPROVED':
        return 3;
      case 'RECEIPT_SUBMITTED':
        return 4;
      case 'PASS_ISSUED':
        return 5;
      default:
        return 1;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Application Milestones & Status</h1>
        <p className="text-xs text-slate-500 mt-1">
          Track the progress of your vehicle submissions through each university milestone.
        </p>
      </div>

      {/* In-Progress Draft Application Card (Auto-saved) - Hidden if duplicate of submitted application */}
      {draftApplication && !isDraftDuplicateOfSubmitted && (
        <div className="bg-white rounded-3xl border border-emerald-200/90 p-5 sm:p-6 shadow-sm relative overflow-hidden space-y-4 animate-fadeIn">
          {/* Top Decorative Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

          {/* Draft Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200/80 shrink-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                <span className="uppercase tracking-wider">In-Progress Draft</span>
                <span className="text-emerald-300">•</span>
                <span>Step {draftApplication.step} of 4</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Auto-saved at {draftApplication.lastSaved}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowDiscardModal(true)}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Discard Draft</span>
            </button>
          </div>

          {/* Draft Content & Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
                <Car className="w-6 h-6" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 truncate">
                    {draftApplication.data?.brand || draftApplication.data?.make || draftApplication.data?.model 
                      ? `${draftApplication.data?.brand || draftApplication.data?.make || ''} ${draftApplication.data?.model || ''}`.trim()
                      : 'Unfinished Vehicle Registration'}
                  </h3>
                  {draftApplication.data?.plateNumber && (
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 border border-emerald-200 shrink-0">
                      {draftApplication.data.plateNumber}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Your inputs and uploaded files are safely preserved. Pick up exactly where you left off.
                </p>

                {/* Progress bar (out of 4 steps) */}
                <div className="pt-1.5 flex items-center space-x-3">
                  <div className="w-36 sm:w-48 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/80">
                    <div 
                      className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((draftApplication.step / 4) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 whitespace-nowrap">
                    Step {draftApplication.step} of 4
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0 pt-1 sm:pt-0">
              <Link
                to={`/client/my-vehicle?resume=true&from=applications`}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm inline-flex items-center justify-center space-x-2 transition-all active:scale-95 cursor-pointer"
              >
                <FileEdit className="w-4 h-4" />
                <span>Resume Application (Step {draftApplication.step})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {applications.map((app) => {
          const step = getMilestoneStep(app.status);
          const isApproved = app.status === 'APPROVED';
          const isRejected = app.status === 'REJECTED';
          const isPassIssued = app.status === 'PASS_ISSUED';

          return (
            <div key={app.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
              {/* Top Bar: App ID & Current Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                  {app.applicant_photo ? (
                    <img
                      src={app.applicant_photo}
                      alt={app.applicant_name}
                      className="w-11 h-14 rounded-xl object-cover border border-slate-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-11 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-sm text-emerald-700">{app.id}</span>
                      {app.isRenewal && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200">
                          Pass Renewal
                        </span>
                      )}
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">Submitted {app.renewalSubmittedAt || app.submittedDate}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                      {app.vehicle.make} {app.vehicle.model} ({app.vehicle.year}) — <span className="font-mono">{app.vehicle.plateNumber}</span>
                    </h3>
                  </div>
                </div>

                <div>{getStatusBadge(app.status, app)}</div>
              </div>

              {/* Milestone Progress Bar */}
              {!isRejected && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    {/* Milestone 1 */}
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px] mb-1">
                        ✓
                      </div>
                      <span className="font-bold text-slate-800 text-[11px]">1. Form Submitted</span>
                      <span className="text-[10px] text-slate-400 hidden sm:block">Vehicle Info & Docs</span>
                    </div>

                    {/* Milestone 2 */}
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] mb-1 ${
                        step >= 3 ? 'bg-emerald-600 text-white' : step === 2 ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-600' : 'bg-slate-200 text-slate-400'
                      }`}>
                        {step >= 3 ? '✓' : '2'}
                      </div>
                      <span className={`text-[11px] font-bold ${step >= 2 ? 'text-slate-800' : 'text-slate-400'}`}>
                        2. PASO Review
                      </span>
                      <span className="text-[10px] text-slate-400 hidden sm:block">Admin Verification</span>
                    </div>

                    {/* Milestone 3 */}
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] mb-1 ${
                        step >= 4 ? 'bg-emerald-600 text-white' : step === 3 ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-600 animate-pulse' : 'bg-slate-200 text-slate-400'
                      }`}>
                        {step >= 4 ? '✓' : '3'}
                      </div>
                      <span className={`text-[11px] font-bold ${step >= 3 ? 'text-slate-800' : 'text-slate-400'}`}>
                        3. Cashier Payment
                      </span>
                      <span className="text-[10px] text-slate-400 hidden sm:block">
                        {step >= 4 ? 'Receipt Uploaded' : 'Upload Receipt Photo'}
                      </span>
                    </div>

                    {/* Milestone 4 */}
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] mb-1 ${
                        step === 5 
                          ? 'bg-emerald-600 text-white' 
                          : step === 4 
                          ? 'bg-amber-100 text-amber-800 border-2 border-amber-500 animate-pulse' 
                          : 'bg-slate-200 text-slate-400'
                      }`}>
                        {step === 5 ? '✓' : step === 4 ? '⌛' : '4'}
                      </div>
                      <span className={`text-[11px] font-bold ${
                        step === 5 ? 'text-emerald-700' : step === 4 ? 'text-amber-800' : 'text-slate-400'
                      }`}>
                        4. QR Pass Issued
                      </span>
                      <span className="text-[10px] text-slate-400 hidden sm:block">
                        {step === 5 ? 'Ready at Gates' : step === 4 ? 'PASO Generating QR' : 'Requires Payment'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional Action Banner per Milestone */}
              {isApproved && (
                app.receiptRejectionRemark ? (
                  <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5 font-bold text-amber-950">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Cashier Receipt Declined by PASO</span>
                      </div>
                      <p className="text-[11px] text-amber-900 leading-snug">
                        <span className="font-semibold text-amber-800">Admin Remark:</span>{' '}
                        <span className="italic font-bold">"{app.receiptRejectionRemark}"</span>
                      </p>
                      <p className="text-[10px] text-amber-700">
                        Please re-upload a clear photograph of your official Cashier receipt.
                      </p>
                    </div>
                    <Link
                      to={`/client/payments?appId=${app.id}`}
                      className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 shadow-sm transition-all"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>Re-upload Cashier Receipt</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-emerald-950">Application Approved by PASO!</p>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        Proceed to the university Cashier Office to pay your pass sticker fee, then upload your official receipt picture.
                      </p>
                    </div>
                    <Link
                      to={`/client/payments?appId=${app.id}`}
                      className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 shadow-sm"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>Proceed to Milestone 3: Upload Receipt</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )
              )}

              {app.status === 'RECEIPT_SUBMITTED' && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-amber-950 flex items-center space-x-1.5">
                      <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                      <span>Cashier Receipt Uploaded — Awaiting PASO Verification</span>
                    </p>
                    <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                      Official Receipt: <strong className="font-mono text-slate-900">#{app.receipt?.orNumber}</strong> submitted {app.receipt?.submittedAt || 'Today'}. The PASO office is verifying your receipt. Once confirmed, the admin will generate and issue your Gate QR Code.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
                      <span>Verification Pending</span>
                    </span>
                  </div>
                </div>
              )}

              {isRejected && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-red-900">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5 font-bold text-red-950">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>Registration Returned by PASO (Needs Correction):</span>
                    </div>
                    <p className="text-red-800 leading-relaxed pl-5 font-medium">
                      "{app.rejection_reason || 'Incomplete or unreadable documents.'}"
                    </p>
                  </div>
                  <Link
                    to={`/client/my-vehicle?editAppId=${app.id}`}
                    className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shrink-0 shadow-sm transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Correct & Re-submit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
              {isPassIssued && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-emerald-950">Official Vehicle Pass Issued & Activated!</p>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Pass No: <strong className="font-mono">{app.pass?.passNumber}</strong> • Valid until {app.pass?.validUntil}
                    </p>
                  </div>
                  <Link
                    to="/client/vehicle-pass"
                    className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 shadow-sm"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>View Pass & QR Code</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Unified In-App Confirm Discard Dialog */}
      <ConfirmModal
        isOpen={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        onConfirm={clearDraft}
        title="Discard Application Draft?"
        message="Are you sure you want to discard your saved application? All entered vehicle details and uploaded documents will be cleared."
        confirmText="Yes, Discard Draft"
        cancelText="Keep My Draft"
        variant="danger"
      />
    </div>
  );
}
