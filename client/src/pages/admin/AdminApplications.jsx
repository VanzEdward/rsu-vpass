import React, { useState } from 'react';
import { usePass, getSequentialPassNumber } from '../../context/PassContext';
import { 
  FileCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  Eye, 
  User, 
  Car, 
  FileText, 
  AlertCircle,
  Filter,
  QrCode,
  Receipt,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  X,
  ExternalLink
} from 'lucide-react';
import RsuStickerPass from '../../components/RsuStickerPass';

export default function AdminApplications() {
  const { applications, reviewApplication, verifyReceiptAndIssuePass, rejectReceipt } = usePass();

  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'RECEIPT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'PASS_ISSUED' | 'REJECTED'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  
  // Registration Form Rejection State
  const [rejectModalApp, setRejectModalApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  // Receipt Verification & QR Generation Modal State
  const [qrModalApp, setQrModalApp] = useState(null);
  const [generatedPassNum, setGeneratedPassNum] = useState('');
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Receipt Rejection State
  const [receiptRejectModalApp, setReceiptRejectModalApp] = useState(null);
  const [receiptRejectReason, setReceiptRejectReason] = useState('');
  const [receiptRejectError, setReceiptRejectError] = useState('');

  // Full-size Document & Receipt Inspector Modal State
  const [previewDocument, setPreviewDocument] = useState(null); // { title: string, subtitle?: string, src: string }
  const [zoomReceiptPhoto, setZoomReceiptPhoto] = useState(null);

  // In-App Approval Confirmation Modal State (replaces native alert)
  const [approveConfirmApp, setApproveConfirmApp] = useState(null);

  // In-App Confirmation / Result Dialog State (replaces native alert popup)
  const [inAppConfirmModal, setInAppConfirmModal] = useState(null); // { title: string, message: string, type: 'success' | 'warning' | 'error' }

  const filteredApps = (applications || []).filter((app) => {
    // Status filter
    if (filterStatus !== 'ALL') {
      if (filterStatus === 'RECEIPT_SUBMITTED' && app.status !== 'RECEIPT_SUBMITTED') return false;
      if (filterStatus === 'PENDING' && app.status !== 'PENDING') return false;
      if (filterStatus === 'APPROVED' && app.status !== 'APPROVED') return false;
      if (filterStatus === 'PASS_ISSUED' && app.status !== 'PASS_ISSUED') return false;
      if (filterStatus === 'REJECTED' && app.status !== 'REJECTED') return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = app.applicant_name?.toLowerCase().includes(q);
      const matchId = app.school_id?.toLowerCase().includes(q);
      const matchPlate = app.vehicle?.plateNumber?.toLowerCase().includes(q);
      const matchAppId = app.id?.toLowerCase().includes(q);
      const matchOr = app.receipt?.orNumber?.toLowerCase().includes(q);
      return matchName || matchId || matchPlate || matchAppId || matchOr;
    }

    return true;
  });

  const handleOpenApproveConfirm = (app) => {
    setApproveConfirmApp(app);
  };

  const handleConfirmApprove = () => {
    if (!approveConfirmApp) return;
    const appId = approveConfirmApp.id;
    reviewApplication(appId, 'APPROVED');
    setApproveConfirmApp(null);
    setSelectedApp(null);
    setInAppConfirmModal({
      title: 'Application Approved!',
      message: 'The applicant can now proceed to Milestone 3 (Cashier Payment & Official Receipt Upload).',
      type: 'success'
    });
  };

  const handleApprove = (appId) => {
    const target = (applications || []).find((a) => a.id === appId);
    if (target) {
      setApproveConfirmApp(target);
    } else {
      reviewApplication(appId, 'APPROVED');
      setSelectedApp(null);
      setInAppConfirmModal({
        title: 'Application Approved!',
        message: 'The applicant can now proceed to Milestone 3 (Cashier Payment & Official Receipt Upload).',
        type: 'success'
      });
    }
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      setRejectError('Please provide a specific reason for rejection.');
      return;
    }
    reviewApplication(rejectModalApp.id, 'REJECTED', rejectionReason.trim());
    setRejectModalApp(null);
    setSelectedApp(null);
    setRejectionReason('');
    setRejectError('');
    setInAppConfirmModal({
      title: 'Application Returned for Correction',
      message: 'The application was returned with the stated remark and the applicant has been notified.',
      type: 'warning'
    });
  };

  // Open the QR Generation & Confirmation Modal (Consistent Sequential Database Numbering: S-001, S-002, E-001, E-002)
  const handleOpenQrModal = (app) => {
    const passNum =
      app.pass?.passNumber ||
      app.assignedPassNumber ||
      getSequentialPassNumber(app, applications);
    setGeneratedPassNum(passNum);
    setCopiedPayload(false);
    setQrModalApp(app);
  };

  // Confirm and Release the Generated QR Code to Client
  const handleConfirmIssuePass = () => {
    if (!qrModalApp) return;
    const year = new Date().getFullYear();
    const qrData = `RSU-VPASS:${generatedPassNum}:${qrModalApp.vehicle?.plateNumber || ''}:${qrModalApp.school_id || ''}`;

    verifyReceiptAndIssuePass(qrModalApp.id, {
      passNumber: generatedPassNum,
      qrData,
      validUntil: `December 31, ${year}`
    });

    const issuedName = qrModalApp.applicant_name;
    const issuedPass = generatedPassNum;
    setQrModalApp(null);
    if (selectedApp?.id === qrModalApp.id) {
      setSelectedApp(null);
    }
    setInAppConfirmModal({
      title: 'Official Gate QR Pass Issued!',
      message: `Pass ${issuedPass} successfully generated and granted to ${issuedName}! The QR code is now live and active on the client side.`,
      type: 'success'
    });
  };

  // Reject Receipt (returns application back to APPROVED so applicant can re-upload)
  const handleRejectReceipt = () => {
    if (!receiptRejectReason.trim()) {
      setReceiptRejectError('Please state why the receipt was rejected (e.g. blurry photo, unreadable OR number).');
      return;
    }
    rejectReceipt(receiptRejectModalApp.id, receiptRejectReason.trim());
    setReceiptRejectModalApp(null);
    setSelectedApp(null);
    setReceiptRejectReason('');
    setReceiptRejectError('');
    setInAppConfirmModal({
      title: 'Receipt Returned',
      message: 'The cashier receipt was declined and returned to the applicant to re-upload a valid photo.',
      type: 'warning'
    });
  };

  const countByStatus = (status) => {
    if (status === 'ALL') return (applications || []).length;
    return (applications || []).filter(a => a.status === status).length;
  };

  const pendingReceiptsCount = countByStatus('RECEIPT_SUBMITTED');

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold mb-1 border border-emerald-200">
          <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>PASO Administrative Evaluation & QR Release</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Application & Receipt Verifications</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Examine submitted registrations, verify cashier official receipts, and generate active Gate QR Code passes.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Records', count: countByStatus('ALL') },
            { id: 'RECEIPT_SUBMITTED', label: 'Receipt Verification', count: pendingReceiptsCount, isHighlight: pendingReceiptsCount > 0 },
            { id: 'PENDING', label: 'Pending Forms', count: countByStatus('PENDING') },
            { id: 'APPROVED', label: 'Awaiting Payment', count: countByStatus('APPROVED') },
            { id: 'PASS_ISSUED', label: 'Pass Issued', count: countByStatus('PASS_ISSUED') },
            { id: 'REJECTED', label: 'Rejected', count: countByStatus('REJECTED') },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
                filterStatus === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : tab.isHighlight
                  ? 'bg-amber-100/90 text-amber-900 border border-amber-300 hover:bg-amber-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filterStatus === tab.id
                  ? 'bg-emerald-700/60 text-white'
                  : tab.isHighlight
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, ID, plate, or OR #..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900">Registration & Verification Records</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {filteredApps.length} Results
            </span>
          </div>
        </div>

        {filteredApps.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
            <p className="text-sm font-bold text-slate-800">No applications match your filter.</p>
            <p className="text-xs text-slate-500">
              Try switching your status filter or clearing your search term.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredApps.map((app) => (
              <div key={app.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                  {/* Photo Preview */}
                  {app.applicant_photo ? (
                    <img
                      src={app.applicant_photo}
                      alt={app.applicant_name}
                      className="w-12 h-16 rounded-xl object-cover border border-emerald-300 shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                      <User className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono font-bold text-xs text-emerald-700">{app.id}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        (app.classification || '').toLowerCase() === 'employee'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {app.classification || 'Student'}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        app.status === 'PASS_ISSUED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'RECEIPT_SUBMITTED'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : app.receiptRejectionRemark && app.status === 'APPROVED'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : app.status === 'APPROVED'
                          ? 'bg-blue-100 text-blue-800'
                          : app.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {app.status === 'PASS_ISSUED' 
                          ? 'PASS ISSUED' 
                          : app.status === 'RECEIPT_SUBMITTED' 
                          ? 'RECEIPT SUBMITTED' 
                          : app.receiptRejectionRemark && app.status === 'APPROVED'
                          ? 'RECEIPT DECLINED'
                          : app.status}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-900 truncate" title={app.applicant_name}>
                      {app.applicant_name} <span className="font-normal text-xs text-slate-500">({app.school_id})</span>
                    </p>
                    <p className="text-xs text-slate-600 truncate">
                      {app.vehicle?.make} {app.vehicle?.model} ({app.vehicle?.year}) • Plate:{' '}
                      <span className="font-mono font-bold text-slate-900">{app.vehicle?.plateNumber}</span>
                    </p>

                    {/* Receipt Indicator if submitted */}
                    {app.status === 'RECEIPT_SUBMITTED' && app.receipt && (
                      <p className="text-[11px] font-semibold text-amber-800 flex items-center space-x-1.5 mt-0.5">
                        <Receipt className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Cashier OR: <strong className="font-mono text-slate-900 font-bold">#{app.receipt.orNumber}</strong> • Submitted {app.receipt.submittedAt || 'Today'}</span>
                      </p>
                    )}

                    {/* Notice if Cashier Receipt / Payment Proof was Rejected */}
                    {app.receiptRejectionRemark && (
                      <div className="mt-2.5 p-3 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 flex items-start space-x-2.5 text-xs shadow-xs">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <span className="font-bold text-amber-950">Cashier Payment Proof Rejected</span>
                            <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200">
                              Awaiting Re-upload
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-900 leading-snug">
                            <span className="font-semibold text-amber-800">Rejection Note:</span>{' '}
                            <span className="italic font-medium text-slate-900 bg-white/80 px-1.5 py-0.5 rounded border border-amber-200 inline-block">
                              "{app.receiptRejectionRemark}"
                            </span>
                          </p>
                          {app.receipt?.orNumber && (
                            <p className="text-[10px] text-slate-500 font-mono">
                              Declined OR Ref: #{app.receipt.orNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedApp(app)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Review Documents</span>
                  </button>

                  {/* Quick Action: Receipt Submitted -> Verify & Generate QR or Reject Receipt */}
                  {app.status === 'RECEIPT_SUBMITTED' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenQrModal(app)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all animate-pulse"
                      >
                        <QrCode className="w-3.5 h-3.5 text-emerald-100" />
                        <span>Verify & Generate QR</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setReceiptRejectModalApp(app)}
                        className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold cursor-pointer"
                      >
                        Reject Receipt
                      </button>
                    </>
                  )}

                  {/* Quick Action: Initial Pending -> Approve or Reject */}
                  {app.status === 'PENDING' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenApproveConfirm(app)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectModalApp(app)}
                        className="px-3.5 py-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold cursor-pointer"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comprehensive Application & Receipt Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Application Review
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  {selectedApp.applicant_name} ({selectedApp.id})
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Applicant & Live ID Photo */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-5">
              <div 
                onClick={() => {
                  if (selectedApp.applicant_photo) {
                    setPreviewDocument({
                      title: `${selectedApp.classification} ID Photo`,
                      subtitle: `${selectedApp.applicant_name} • ID: ${selectedApp.school_id}`,
                      src: selectedApp.applicant_photo
                    });
                  }
                }}
                className={`w-28 h-36 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-sm shrink-0 relative bg-slate-100 ${
                  selectedApp.applicant_photo ? 'cursor-pointer group hover:ring-4 hover:ring-emerald-400/40 transition-all' : ''
                }`}
                title={selectedApp.applicant_photo ? 'Click to inspect full photo' : ''}
              >
                {selectedApp.applicant_photo ? (
                  <>
                    <img
                      src={selectedApp.applicant_photo}
                      alt="Live ID"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-1 text-center">
                      <Eye className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-bold">Inspect</span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                    <User className="w-8 h-8" />
                  </div>
                )}
              </div>

              <div className="text-xs space-y-1 w-full">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  {selectedApp.classification} ID Photo Verified
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1">{selectedApp.applicant_name}</h4>
                <p className="text-slate-600 font-mono">ID Number: {selectedApp.school_id}</p>
                <p className="text-slate-600">Department: {selectedApp.department || 'N/A'}</p>
                <p className="text-slate-600">Contact: {selectedApp.contact_number}</p>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="text-xs space-y-2">
              <h4 className="font-bold text-slate-900">Vehicle Specifications</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-semibold">Plate Number</span>
                  <span className="font-mono font-black text-emerald-700 text-sm">{selectedApp.vehicle?.plateNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Make & Model</span>
                  <span className="font-bold text-slate-800">{selectedApp.vehicle?.make} {selectedApp.vehicle?.model}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Vehicle Type</span>
                  <span className="font-semibold text-slate-700">{selectedApp.vehicle?.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Color & Year</span>
                  <span className="text-slate-700">{selectedApp.vehicle?.color} / {selectedApp.vehicle?.year}</span>
                </div>
              </div>
            </div>

            {/* Uploaded Documents */}
            <div className="text-xs space-y-2">
              <h4 className="font-bold text-slate-900">Uploaded Official Documents</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-center flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-slate-800 text-xs">Driver's License</p>
                    {selectedApp.documents?.driverLicense && (
                      <button
                        type="button"
                        onClick={() => setPreviewDocument({
                          title: "Driver's License",
                          subtitle: `${selectedApp.applicant_name} • ID: ${selectedApp.school_id}`,
                          src: selectedApp.documents.driverLicense
                        })}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    )}
                  </div>
                  {selectedApp.documents?.driverLicense ? (
                    <div
                      onClick={() => setPreviewDocument({
                        title: "Driver's License",
                        subtitle: `${selectedApp.applicant_name} • ID: ${selectedApp.school_id}`,
                        src: selectedApp.documents.driverLicense
                      })}
                      className="rounded-xl overflow-hidden border border-slate-200 cursor-pointer group relative bg-white shadow-xs"
                    >
                      <img
                        src={selectedApp.documents.driverLicense}
                        alt="License"
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold space-x-1.5 backdrop-blur-[1px]">
                        <Eye className="w-4 h-4" />
                        <span>Click to Inspect Full Photo</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 rounded-xl bg-emerald-50 text-emerald-700 flex flex-col items-center justify-center font-semibold text-[11px] border border-dashed border-emerald-300">
                      <FileText className="w-6 h-6 mb-1" />
                      <span>Valid Driver's License Attached</span>
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-center flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-slate-800 text-xs">Official OR / CR</p>
                    {selectedApp.documents?.orCr && (
                      <button
                        type="button"
                        onClick={() => setPreviewDocument({
                          title: "Official Vehicle OR / CR",
                          subtitle: `${selectedApp.vehicle?.make} ${selectedApp.vehicle?.model} (${selectedApp.vehicle?.plateNumber})`,
                          src: selectedApp.documents.orCr
                        })}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    )}
                  </div>
                  {selectedApp.documents?.orCr ? (
                    <div
                      onClick={() => setPreviewDocument({
                        title: "Official Vehicle OR / CR",
                        subtitle: `${selectedApp.vehicle?.make} ${selectedApp.vehicle?.model} (${selectedApp.vehicle?.plateNumber})`,
                        src: selectedApp.documents.orCr
                      })}
                      className="rounded-xl overflow-hidden border border-slate-200 cursor-pointer group relative bg-white shadow-xs"
                    >
                      <img
                        src={selectedApp.documents.orCr}
                        alt="OR/CR"
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold space-x-1.5 backdrop-blur-[1px]">
                        <Eye className="w-4 h-4" />
                        <span>Click to Inspect Full Photo</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 rounded-xl bg-emerald-50 text-emerald-700 flex flex-col items-center justify-center font-semibold text-[11px] border border-dashed border-emerald-300">
                      <FileText className="w-6 h-6 mb-1" />
                      <span>Official OR/CR Attached</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Uploaded Cashier Official Receipt (Milestone 3 Proof) */}
            {(selectedApp.receipt || selectedApp.status === 'RECEIPT_SUBMITTED' || selectedApp.receiptRejectionRemark) && (
              <div className="text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 flex items-center space-x-1.5">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span>Cashier Official Receipt (Payment Proof)</span>
                  </h4>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    selectedApp.status === 'PASS_ISSUED' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : selectedApp.receiptRejectionRemark
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {selectedApp.status === 'PASS_ISSUED' 
                      ? 'Verified by PASO' 
                      : selectedApp.receiptRejectionRemark
                      ? 'Receipt Declined by PASO'
                      : 'Awaiting PASO Verification'}
                  </span>
                </div>

                <div className={`p-4 rounded-2xl ${
                  selectedApp.receiptRejectionRemark 
                    ? 'bg-rose-50/70 border border-rose-200' 
                    : 'bg-amber-50/60 border border-amber-200'
                } space-y-3`}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-slate-400 block font-semibold text-[11px]">Official Receipt (OR) #</span>
                      <span className="font-mono font-black text-slate-900 text-sm">{selectedApp.receipt?.orNumber || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold text-[11px]">Payment Submission Date</span>
                      <span className="font-bold text-slate-800">{selectedApp.receipt?.submittedAt || selectedApp.receipt?.paidAt || 'Today'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold text-[11px]">Verification Status</span>
                      <span className={`font-bold ${
                        selectedApp.status === 'PASS_ISSUED' 
                          ? 'text-emerald-700' 
                          : selectedApp.receiptRejectionRemark 
                          ? 'text-rose-700' 
                          : 'text-amber-700'
                      }`}>
                        {selectedApp.status === 'PASS_ISSUED' 
                          ? 'Payment Verified' 
                          : selectedApp.receiptRejectionRemark 
                          ? 'Declined / Needs Re-upload' 
                          : 'Needs Verification'}
                      </span>
                    </div>
                  </div>

                  {/* Cashier Payment Rejection Notice in Modal */}
                  {selectedApp.receiptRejectionRemark && (
                    <div className="p-3 bg-white rounded-xl border border-rose-200 text-rose-900 flex items-start space-x-2 text-xs shadow-2xs">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-rose-900">Cashier Payment Proof Declined</p>
                        <p className="text-[11px] text-rose-800 mt-0.5">
                          <span className="font-semibold text-rose-900">Rejection Note:</span>{' '}
                          <span className="italic font-medium">"{selectedApp.receiptRejectionRemark}"</span>
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Applicant was notified and instructed to re-upload a clear photograph of their receipt.
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedApp.receipt?.receiptPhoto ? (
                    <div className="pt-2 border-t border-amber-200">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[11px] font-bold text-slate-700">Attached Cashier Receipt Photo:</p>
                        <button
                          type="button"
                          onClick={() => setPreviewDocument({
                            title: `Official Cashier Receipt — OR #${selectedApp.receipt?.orNumber || 'N/A'}`,
                            subtitle: `${selectedApp.applicant_name} • Paid: ${selectedApp.receipt?.paidAt || 'Recently'}`,
                            src: selectedApp.receipt.receiptPhoto
                          })}
                          className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Full Receipt</span>
                        </button>
                      </div>
                      <div 
                        onClick={() => setPreviewDocument({
                          title: `Official Cashier Receipt — OR #${selectedApp.receipt?.orNumber || 'N/A'}`,
                          subtitle: `${selectedApp.applicant_name} • Paid: ${selectedApp.receipt?.paidAt || 'Recently'}`,
                          src: selectedApp.receipt.receiptPhoto
                        })}
                        className="max-w-md mx-auto rounded-xl overflow-hidden border-2 border-amber-300 shadow-sm bg-white cursor-pointer group relative"
                      >
                        <img
                          src={selectedApp.receipt.receiptPhoto}
                          alt="Receipt Photo"
                          className="w-full max-h-52 object-contain group-hover:scale-102 transition-transform"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold space-x-1.5 backdrop-blur-[1px]">
                          <Eye className="w-4 h-4" />
                          <span>Click to Inspect Full Receipt</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-white rounded-xl border border-amber-200 text-center text-slate-500 text-[11px]">
                      Physical receipt verified through cashier desk logs.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Decision Footer */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              {/* If Receipt was submitted: Verify & Generate QR */}
              {selectedApp.status === 'RECEIPT_SUBMITTED' && (
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setReceiptRejectModalApp(selectedApp)}
                    className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold border border-red-200 cursor-pointer"
                  >
                    Reject Receipt
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenQrModal(selectedApp)}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-sm flex items-center space-x-2"
                  >
                    <QrCode className="w-4 h-4 text-emerald-100" />
                    <span>Verify Receipt & Generate QR Pass</span>
                  </button>
                </div>
              )}

              {/* If Initial Pending Form */}
              {selectedApp.status === 'PENDING' && (
                <>
                  <button
                    type="button"
                    onClick={() => setRejectModalApp(selectedApp)}
                    className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold border border-red-200 cursor-pointer"
                  >
                    Reject Application
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenApproveConfirm(selectedApp)}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-sm"
                  >
                    Approve & Unlock Payment Milestone
                  </button>
                </>
              )}

              {selectedApp.status !== 'PENDING' && selectedApp.status !== 'RECEIPT_SUBMITTED' && (
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Close Viewer
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PASO QR CODE GENERATION & CONFIRMATION MODAL (CORE FEATURE) */}
      {/* ========================================================================= */}
      {qrModalApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 space-y-4 max-h-[94vh] overflow-y-auto">
            <button
              onClick={() => setQrModalApp(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center space-x-3 pb-2 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Generate & Confirm QR Pass</h3>
                <p className="text-xs text-slate-500">
                  Officer verification for <strong className="text-slate-800">{qrModalApp.applicant_name}</strong>
                </p>
              </div>
            </div>

            {/* Receipt Verification Confirmation Box */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-950 block">Cashier Receipt Validated</span>
                  <span className="text-[11px] text-emerald-800 font-mono">
                    OR #{qrModalApp.receipt?.orNumber || '2026-98123'} • Date: {qrModalApp.receipt?.submittedAt || 'Today'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                PASS READY
              </span>
            </div>

            {/* Authentic RSU Vehicle Pass Sticker (Student Pink or Employee Red Canva Template with Live QR) */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col items-center">
              {/* Template Category Header */}
              <div className="w-full max-w-[340px] flex items-center justify-between gap-2 mb-3.5 px-0.5">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0 shadow-2xs whitespace-nowrap ${
                  (qrModalApp.classification || '').toLowerCase().includes('employee')
                    ? 'bg-red-100 text-red-900 border-red-200'
                    : 'bg-pink-100 text-pink-900 border-pink-200'
                }`}>
                  <span>
                    {(qrModalApp.classification || '').toLowerCase().includes('employee')
                      ? '💼 Official Employee Vehicle Pass'
                      : '🎓 Official Student Vehicle Pass'}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-white text-slate-700 border border-slate-200 shrink-0 whitespace-nowrap shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Gates 1 – 4 Clearance</span>
                </span>
              </div>

              {/* RSU Sticker Pass Rendering with Actual Template & Live Stamped QR */}
              <RsuStickerPass
                classification={qrModalApp.classification || 'STUDENT'}
                passNumber={generatedPassNum}
                plateNumber={qrModalApp.vehicle?.plateNumber || 'RSU 2026'}
                qrPayload={`RSU-VPASS:${generatedPassNum}:${qrModalApp.vehicle?.plateNumber || ''}:${qrModalApp.school_id || ''}`}
                showDownloadButton={false}
              />

              {/* Vehicle Specifications Summary under Sticker */}
              <div className="mt-4 w-full max-w-[340px] p-3 rounded-2xl bg-white border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Vehicle:</span>
                  <span className="font-bold text-slate-900">{qrModalApp.vehicle?.make} {qrModalApp.vehicle?.model} ({qrModalApp.vehicle?.year})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Plate Number:</span>
                  <span className="font-mono font-black text-emerald-700">{qrModalApp.vehicle?.plateNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Assigned Pass No:</span>
                  <span className="font-mono font-bold text-slate-800">{generatedPassNum}</span>
                </div>
              </div>
            </div>

            {/* Instant sync notice */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">Automatic Client-Side Release:</span>
                <p className="mt-0.5 leading-relaxed">
                  Upon confirmation, this official QR Pass will automatically appear in <strong>{qrModalApp.applicant_name}'s</strong> account under <em>My Pass</em> and <em>Vehicle Pass</em>. Gate security guards can scan it immediately.
                </p>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setQrModalApp(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmIssuePass}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-md flex items-center space-x-2 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-100" />
                <span>Confirm & Release QR Code to Client</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Receipt Modal */}
      {receiptRejectModalApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Reject Cashier Receipt</h3>
            <p className="text-xs text-slate-500">
              Explain why the receipt for <strong>{receiptRejectModalApp.applicant_name}</strong> ({receiptRejectModalApp.id}) is being rejected. The applicant will be instructed to re-upload.
            </p>
            <textarea
              required
              rows={3}
              maxLength={300}
              value={receiptRejectReason}
              onChange={(e) => setReceiptRejectReason(e.target.value.slice(0, 300))}
              placeholder="e.g. Unreadable receipt photo, missing official seal, or incorrect payment amount..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            {receiptRejectError && (
              <p className="text-rose-600 text-xs font-semibold mt-1">{receiptRejectError}</p>
            )}
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setReceiptRejectModalApp(null);
                  setReceiptRejectError('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectReceipt}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 cursor-pointer"
              >
                Return for Re-upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Rejection Reason Modal (for Initial Registration) */}
      {rejectModalApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Provide Rejection Reason</h3>
            <p className="text-xs text-slate-500">
              Per university policy, a specific remark must be provided to <strong>{rejectModalApp.applicant_name}</strong> ({rejectModalApp.id}).
            </p>
            <textarea
              required
              rows={3}
              maxLength={300}
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value.slice(0, 300));
                if (rejectError) setRejectError('');
              }}
              placeholder="e.g. Expired Driver's License or unreadable OR/CR photo..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            {rejectError && (
              <p className="text-rose-600 text-xs font-semibold mt-1">{rejectError}</p>
            )}
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRejectModalApp(null);
                  setRejectError('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Document & Receipt Full-Size Inspector Modal */}
      {(previewDocument || zoomReceiptPhoto) && (
        <div 
          onClick={() => {
            setPreviewDocument(null);
            setZoomReceiptPhoto(null);
          }}
          className="fixed inset-0 z-[80] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-4xl max-h-[92vh] w-full p-5 sm:p-6 shadow-2xl relative flex flex-col cursor-default border border-slate-100 animate-in zoom-in-95 duration-150 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                    {previewDocument?.title || 'Official Cashier Receipt'}
                  </h3>
                  {previewDocument?.subtitle && (
                    <p className="text-xs text-slate-500 font-medium">
                      {previewDocument.subtitle}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreviewDocument(null);
                  setZoomReceiptPhoto(null);
                }}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                title="Close Inspector"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dynamic Sized Image Viewer */}
            <div className="my-3 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center p-2 flex-1 min-h-[220px] max-h-[70vh]">
              <img
                src={previewDocument?.src || zoomReceiptPhoto}
                alt={previewDocument?.title || 'Document Inspection Preview'}
                className="max-h-[66vh] max-w-full w-auto h-auto object-contain rounded-lg shadow-xl select-none"
              />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 shrink-0">
              <span className="text-[11px] text-slate-400 font-medium">
                High-resolution snapshot verification • Click outside or Esc to close
              </span>
              <button
                type="button"
                onClick={() => {
                  setPreviewDocument(null);
                  setZoomReceiptPhoto(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* IN-APP APPROVAL CONFIRMATION MODAL (Replaces localhost alert) */}
      {/* ========================================================================= */}
      {approveConfirmApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative space-y-4 border border-slate-100 animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setApproveConfirmApp(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {approveConfirmApp.id}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">Approve Vehicle Registration?</h3>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
              <p className="text-slate-700">
                <span className="font-semibold text-slate-500">Applicant:</span>{' '}
                <strong className="text-slate-900">{approveConfirmApp.applicant_name}</strong> ({approveConfirmApp.school_id})
              </p>
              <p className="text-slate-700">
                <span className="font-semibold text-slate-500">Vehicle:</span>{' '}
                <strong className="text-slate-900">{approveConfirmApp.vehicle?.make} {approveConfirmApp.vehicle?.model}</strong> • Plate:{' '}
                <span className="font-mono font-bold text-slate-900">{approveConfirmApp.vehicle?.plateNumber}</span>
              </p>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Approving this application completes Milestone 2 (PASO Review). The applicant will be notified to proceed to <strong>Milestone 3 (Cashier Payment & Official Receipt Upload)</strong>.
            </p>

            <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setApproveConfirmApp(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApprove}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center space-x-1.5 cursor-pointer transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Approve</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* IN-APP SUCCESS / CONFIRMATION RESULT MODAL (Replaces localhost alert) */}
      {/* ========================================================================= */}
      {inAppConfirmModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4 border border-slate-100 animate-in zoom-in-95 duration-150 relative">
            <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center shadow-xs ${
              inAppConfirmModal.type === 'warning'
                ? 'bg-amber-100 text-amber-700 ring-8 ring-amber-50'
                : inAppConfirmModal.type === 'error'
                ? 'bg-rose-100 text-rose-700 ring-8 ring-rose-50'
                : 'bg-emerald-100 text-emerald-700 ring-8 ring-emerald-50'
            }`}>
              {inAppConfirmModal.type === 'warning' ? (
                <AlertCircle className="w-7 h-7" />
              ) : inAppConfirmModal.type === 'error' ? (
                <XCircle className="w-7 h-7" />
              ) : (
                <CheckCircle2 className="w-7 h-7" />
              )}
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                {inAppConfirmModal.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                {inAppConfirmModal.message}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setInAppConfirmModal(null)}
                className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-sm cursor-pointer transition-colors ${
                  inAppConfirmModal.type === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : inAppConfirmModal.type === 'error'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
