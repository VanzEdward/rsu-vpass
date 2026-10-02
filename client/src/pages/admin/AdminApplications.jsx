import React, { useState } from 'react';
import { usePass } from '../../context/PassContext';
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

export default function AdminApplications() {
  const { applications, reviewApplication, verifyReceiptAndIssuePass, rejectReceipt } = usePass();

  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'RECEIPT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'PASS_ISSUED' | 'REJECTED'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  
  // Registration Form Rejection State
  const [rejectModalApp, setRejectModalApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Receipt Verification & QR Generation Modal State
  const [qrModalApp, setQrModalApp] = useState(null);
  const [generatedPassNum, setGeneratedPassNum] = useState('');
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Receipt Rejection State
  const [receiptRejectModalApp, setReceiptRejectModalApp] = useState(null);
  const [receiptRejectReason, setReceiptRejectReason] = useState('');

  // Full-size Receipt Image Preview
  const [zoomReceiptPhoto, setZoomReceiptPhoto] = useState(null);

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

  const handleApprove = (appId) => {
    reviewApplication(appId, 'APPROVED');
    setSelectedApp(null);
    alert('Application Approved! The applicant can now proceed to Milestone 3 (Cashier Payment & Official Receipt Upload).');
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a specific reason for rejection.');
      return;
    }
    reviewApplication(rejectModalApp.id, 'REJECTED', rejectionReason.trim());
    setRejectModalApp(null);
    setSelectedApp(null);
    setRejectionReason('');
    alert('Application rejected with stated reason.');
  };

  // Open the QR Generation & Confirmation Modal
  const handleOpenQrModal = (app) => {
    const year = new Date().getFullYear();
    const passNum = `VP-${year}-${String(Math.floor(1000 + Math.random() * 9000))}`;
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
    alert(`Official Pass ${issuedPass} successfully generated and granted to ${issuedName}! The QR code is now live and active on the client side.`);
  };

  // Reject Receipt (returns application back to APPROVED so applicant can re-upload)
  const handleRejectReceipt = () => {
    if (!receiptRejectReason.trim()) {
      alert('Please state why the receipt was rejected (e.g. blurry photo, unreadable OR number).');
      return;
    }
    rejectReceipt(receiptRejectModalApp.id, receiptRejectReason.trim());
    setReceiptRejectModalApp(null);
    setSelectedApp(null);
    setReceiptRejectReason('');
    alert('Receipt rejected. The applicant has been notified to re-upload a valid Cashier receipt.');
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
                <div className="flex items-start space-x-3.5">
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

                  <div className="space-y-1">
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
                          : app.status}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-900">
                      {app.applicant_name} <span className="font-normal text-xs text-slate-500">({app.school_id})</span>
                    </p>
                    <p className="text-xs text-slate-600">
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
                        onClick={() => handleApprove(app.id)}
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
              <div className="w-28 h-36 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-sm shrink-0">
                {selectedApp.applicant_photo ? (
                  <img
                    src={selectedApp.applicant_photo}
                    alt="Live ID"
                    className="w-full h-full object-cover"
                  />
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
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
                  <p className="font-semibold text-slate-800 mb-2">Driver's License</p>
                  {selectedApp.documents?.driverLicense && selectedApp.documents.driverLicense.startsWith('data:image') ? (
                    <img
                      src={selectedApp.documents.driverLicense}
                      alt="License"
                      className="w-full h-32 object-cover rounded-lg border border-slate-200"
                    />
                  ) : (
                    <div className="h-28 rounded-lg bg-emerald-50 text-emerald-700 flex flex-col items-center justify-center font-semibold text-[11px]">
                      <FileText className="w-6 h-6 mb-1" />
                      <span>Valid Driver's License Attached</span>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
                  <p className="font-semibold text-slate-800 mb-2">Official OR / CR</p>
                  {selectedApp.documents?.orCr && selectedApp.documents.orCr.startsWith('data:image') ? (
                    <img
                      src={selectedApp.documents.orCr}
                      alt="OR/CR"
                      className="w-full h-32 object-cover rounded-lg border border-slate-200"
                    />
                  ) : (
                    <div className="h-28 rounded-lg bg-emerald-50 text-emerald-700 flex flex-col items-center justify-center font-semibold text-[11px]">
                      <FileText className="w-6 h-6 mb-1" />
                      <span>Official OR/CR Attached</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Uploaded Cashier Official Receipt (Milestone 3 Proof) */}
            {(selectedApp.receipt || selectedApp.status === 'RECEIPT_SUBMITTED') && (
              <div className="text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 flex items-center space-x-1.5">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span>Cashier Official Receipt (Payment Proof)</span>
                  </h4>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    selectedApp.status === 'PASS_ISSUED' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {selectedApp.status === 'PASS_ISSUED' ? 'Verified by PASO' : 'Awaiting PASO Verification'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
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
                      <span className="font-bold text-emerald-700">
                        {selectedApp.status === 'PASS_ISSUED' ? 'Payment Verified' : 'Needs Verification'}
                      </span>
                    </div>
                  </div>

                  {selectedApp.receipt?.receiptPhoto ? (
                    <div className="pt-2 border-t border-amber-200">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[11px] font-bold text-slate-700">Attached Cashier Receipt Photo:</p>
                        <button
                          type="button"
                          onClick={() => setZoomReceiptPhoto(selectedApp.receipt.receiptPhoto)}
                          className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View Full Photo</span>
                        </button>
                      </div>
                      <div 
                        onClick={() => setZoomReceiptPhoto(selectedApp.receipt.receiptPhoto)}
                        className="max-w-md mx-auto rounded-xl overflow-hidden border-2 border-amber-300 shadow-sm bg-white cursor-pointer group"
                      >
                        <img
                          src={selectedApp.receipt.receiptPhoto}
                          alt="Receipt Photo"
                          className="w-full max-h-52 object-contain group-hover:scale-102 transition-transform"
                        />
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
                    onClick={() => handleApprove(selectedApp.id)}
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

            {/* Generated Pass Preview Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800 space-y-4 text-center">
              {/* Badge top */}
              <div className="flex items-center justify-between text-[10px] border-b border-slate-800 pb-2">
                <span className="font-bold tracking-widest text-emerald-400 uppercase">
                  RSU PHYSICAL ASSETS & SECURITY OFFICE
                </span>
                <span className="font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                  ACTIVE 2026
                </span>
              </div>

              {/* Vehicle & Plate Callout */}
              <div>
                <p className="text-xs text-slate-400">Registered Vehicle</p>
                <p className="text-base font-bold text-white">{qrModalApp.vehicle?.make} {qrModalApp.vehicle?.model} ({qrModalApp.vehicle?.year})</p>
                <p className="text-xl font-black font-mono tracking-widest text-emerald-400 mt-0.5">
                  {qrModalApp.vehicle?.plateNumber}
                </p>
              </div>

              {/* THE QR CODE DISPLAY */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="p-3 bg-white rounded-2xl shadow-md border-2 border-emerald-400">
                  {/* Clean, high-contrast SVG representation of the QR code */}
                  <svg className="w-44 h-44" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="120" height="120" fill="white" />
                    {/* Corner 1 */}
                    <rect x="10" y="10" width="30" height="30" rx="4" stroke="#0f172a" strokeWidth="6" fill="white" />
                    <rect x="20" y="20" width="10" height="10" fill="#047857" />
                    {/* Corner 2 */}
                    <rect x="80" y="10" width="30" height="30" rx="4" stroke="#0f172a" strokeWidth="6" fill="white" />
                    <rect x="90" y="20" width="10" height="10" fill="#047857" />
                    {/* Corner 3 */}
                    <rect x="10" y="80" width="30" height="30" rx="4" stroke="#0f172a" strokeWidth="6" fill="white" />
                    <rect x="20" y="90" width="10" height="10" fill="#047857" />
                    {/* Pattern Dots */}
                    <rect x="48" y="14" width="6" height="6" fill="#0f172a" />
                    <rect x="62" y="14" width="6" height="6" fill="#0f172a" />
                    <rect x="48" y="28" width="6" height="6" fill="#0f172a" />
                    <rect x="62" y="28" width="6" height="6" fill="#0f172a" />
                    <rect x="14" y="48" width="6" height="6" fill="#0f172a" />
                    <rect x="28" y="48" width="6" height="6" fill="#0f172a" />
                    <rect x="14" y="62" width="6" height="6" fill="#0f172a" />
                    <rect x="28" y="62" width="6" height="6" fill="#0f172a" />
                    <rect x="48" y="48" width="24" height="24" rx="2" fill="#047857" />
                    <rect x="54" y="54" width="12" height="12" fill="white" />
                    <rect x="80" y="48" width="8" height="8" fill="#0f172a" />
                    <rect x="96" y="48" width="8" height="8" fill="#0f172a" />
                    <rect x="80" y="64" width="8" height="8" fill="#0f172a" />
                    <rect x="96" y="64" width="8" height="8" fill="#0f172a" />
                    <rect x="48" y="80" width="8" height="8" fill="#0f172a" />
                    <rect x="64" y="80" width="8" height="8" fill="#0f172a" />
                    <rect x="48" y="96" width="8" height="8" fill="#0f172a" />
                    <rect x="64" y="96" width="8" height="8" fill="#0f172a" />
                    <rect x="80" y="80" width="30" height="30" rx="3" fill="#0f172a" />
                    <rect x="86" y="86" width="18" height="18" fill="white" />
                    <rect x="92" y="92" width="6" height="6" fill="#047857" />
                  </svg>
                </div>
              </div>

              {/* Pass Number and Security specs */}
              <div className="pt-2 border-t border-slate-800 text-xs flex justify-between items-center text-slate-300">
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 block">Official Pass No:</span>
                  <span className="font-mono font-bold text-white text-sm">{generatedPassNum}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Authorized Gates:</span>
                  <span className="font-bold text-emerald-400 text-xs">Gate 1 - 4</span>
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
              value={receiptRejectReason}
              onChange={(e) => setReceiptRejectReason(e.target.value)}
              placeholder="e.g. Unreadable receipt photo, missing official seal, or incorrect payment amount..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setReceiptRejectModalApp(null)}
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
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Expired Driver's License or unreadable OR/CR photo..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalApp(null)}
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

      {/* Full-size Receipt Photo Zoom Modal */}
      {zoomReceiptPhoto && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setZoomReceiptPhoto(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900">Official Cashier Receipt Photo</h3>
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-black/5 max-h-[75vh] flex items-center justify-center">
              <img
                src={zoomReceiptPhoto}
                alt="Enlarged Cashier Receipt"
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setZoomReceiptPhoto(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Close Fullscreen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
