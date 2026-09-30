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
  Filter
} from 'lucide-react';

export default function AdminApplications() {
  const { applications, reviewApplication } = usePass();

  const [filterStatus, setFilterStatus] = useState('PENDING'); // 'ALL' | 'PENDING' | 'APPROVED' | 'PASS_ISSUED' | 'REJECTED'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [rejectModalApp, setRejectModalApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const filteredApps = (applications || []).filter((app) => {
    // Status filter
    if (filterStatus !== 'ALL') {
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
      return matchName || matchId || matchPlate || matchAppId;
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

  const countByStatus = (status) => {
    if (status === 'ALL') return (applications || []).length;
    return (applications || []).filter(a => a.status === status).length;
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold mb-1 border border-emerald-200">
          <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Milestone 2: Administrative Review</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Application Reviews</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Examine submitted student and employee vehicle registrations, verify live camera identity photos, and inspect official Driver's License and OR/CR documents.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'PENDING', label: 'Pending Decisions' },
            { id: 'APPROVED', label: 'Approved (Awaiting Payment)' },
            { id: 'PASS_ISSUED', label: 'Pass Issued' },
            { id: 'REJECTED', label: 'Rejected' },
            { id: 'ALL', label: 'All Records' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label} ({countByStatus(tab.id)})
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
            placeholder="Search name, ID, or plate..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900">Registration Records</h2>
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
                    <div className="flex items-center space-x-2">
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
                          : app.status === 'APPROVED'
                          ? 'bg-blue-100 text-blue-800'
                          : app.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {app.status === 'PASS_ISSUED' ? 'PASS ISSUED' : app.status}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-900">
                      {app.applicant_name} <span className="font-normal text-xs text-slate-500">({app.school_id})</span>
                    </p>
                    <p className="text-xs text-slate-600">
                      {app.vehicle?.make} {app.vehicle?.model} ({app.vehicle?.year}) • Plate:{' '}
                      <span className="font-mono font-bold text-slate-900">{app.vehicle?.plateNumber}</span>
                    </p>
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

      {/* Comprehensive Application Review Modal */}
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

            {/* Decision Footer */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
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
              {selectedApp.status !== 'PENDING' && (
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

      {/* Mandatory Rejection Reason Modal */}
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
    </div>
  );
}
