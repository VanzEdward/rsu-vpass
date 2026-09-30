import React, { useState } from 'react';
import { usePass } from '../../context/PassContext';
import { 
  Layers, 
  Search, 
  QrCode, 
  Eye, 
  ShieldCheck, 
  User, 
  Car, 
  CheckCircle, 
  AlertTriangle,
  X,
  Printer,
  Ban
} from 'lucide-react';

export default function AdminPasses() {
  const { applications } = usePass();

  const [classificationFilter, setClassificationFilter] = useState('ALL'); // 'ALL' | 'STUDENT' | 'EMPLOYEE'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPassModal, setSelectedPassModal] = useState(null);

  // Active or approved applications with passes
  const passesList = (applications || []).filter((a) => a.status === 'PASS_ISSUED' || a.pass);

  const filteredPasses = passesList.filter((app) => {
    // Classification filter
    if (classificationFilter !== 'ALL') {
      const cls = (app.classification || '').toUpperCase();
      if (classificationFilter === 'STUDENT' && cls !== 'STUDENT') return false;
      if (classificationFilter === 'EMPLOYEE' && cls !== 'EMPLOYEE') return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPlate = app.vehicle?.plateNumber?.toLowerCase().includes(q);
      const matchName = app.applicant_name?.toLowerCase().includes(q);
      const matchId = app.school_id?.toLowerCase().includes(q);
      const matchPass = app.pass?.passNumber?.toLowerCase().includes(q);
      return matchPlate || matchName || matchId || matchPass;
    }

    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold mb-1 border border-emerald-200">
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          <span>Vehicle Credentials & Clearance</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pass Management</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Monitor approved vehicle gate pass stickers, verify student and employee classifications, inspect encrypted QR payloads, and manage validity periods.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Classification Tabs */}
        <div className="flex items-center space-x-1.5 w-full sm:w-auto">
          {[
            { id: 'ALL', label: `All Passes (${passesList.length})` },
            { id: 'STUDENT', label: `Student Vehicles (${passesList.filter(p => (p.classification || '').toLowerCase() === 'student').length})` },
            { id: 'EMPLOYEE', label: `Employee Vehicles (${passesList.filter(p => (p.classification || '').toLowerCase() === 'employee').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setClassificationFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                classificationFilter === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
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
            placeholder="Search plate, owner, or pass #..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>

      {/* Passes Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Active Gate Clearances</h2>
            <p className="text-xs text-slate-500">Official gate pass stickers equipped with encrypted database verification tokens</p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {filteredPasses.length} Total Passes
          </span>
        </div>

        {filteredPasses.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <Layers className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-800">No vehicle passes match your criteria.</p>
            <p className="text-xs text-slate-500">
              Clear your search term or review pending applications to issue new passes.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="py-2.5 px-3 font-bold">Pass Number</th>
                  <th className="py-2.5 px-3 font-bold">Registered Owner</th>
                  <th className="py-2.5 px-3 font-bold">Classification</th>
                  <th className="py-2.5 px-3 font-bold">Plate Number</th>
                  <th className="py-2.5 px-3 font-bold">Vehicle Specs</th>
                  <th className="py-2.5 px-3 font-bold">Valid Until</th>
                  <th className="py-2.5 px-3 font-bold">Status</th>
                  <th className="py-2.5 px-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPasses.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                      {app.pass?.passNumber}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{app.applicant_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {app.school_id}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                        (app.classification || '').toLowerCase() === 'employee'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {app.classification || 'Student'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-black text-slate-900">
                      {app.vehicle?.plateNumber}
                    </td>
                    <td className="py-3 px-3">
                      {app.vehicle?.make} {app.vehicle?.model} ({app.vehicle?.color})
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {app.pass?.validUntil || 'Dec 31, 2026'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        ACTIVE
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedPassModal(app)}
                        className="inline-flex items-center space-x-1 px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Inspect Pass</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Pass & Sticker Modal */}
      {selectedPassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Official Gate Sticker
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  {selectedPassModal.pass?.passNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPassModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Sticker Graphic Preview */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-3 border-2 border-emerald-500 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <span className="font-black text-sm tracking-wider">
                  RSU <span className="text-emerald-400">VPASS</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">
                  {selectedPassModal.classification || 'Vehicle Sticker'}
                </span>
              </div>

              <div>
                <p className="text-[11px] text-slate-400">Owner: {selectedPassModal.applicant_name}</p>
                <p className="text-2xl font-black font-mono tracking-widest text-emerald-400 mt-0.5">
                  {selectedPassModal.vehicle?.plateNumber}
                </p>
                <p className="text-xs text-slate-300">
                  {selectedPassModal.vehicle?.make} {selectedPassModal.vehicle?.model} ({selectedPassModal.vehicle?.color})
                </p>
              </div>

              <div className="flex justify-center py-1">
                <div className="p-2 bg-white rounded-xl shadow-xs">
                  <QrCode className="w-24 h-24 text-slate-900" />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700 text-[11px] flex justify-between items-center text-slate-300">
                <span className="font-mono">{selectedPassModal.pass?.passNumber}</span>
                <span className="text-emerald-400 font-bold">VALID: {selectedPassModal.pass?.validUntil}</span>
              </div>
            </div>

            {/* Encrypted QR Payload Callout */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Encrypted Database QR Token</p>
              <p className="font-mono text-[11px] text-slate-700 break-all bg-white p-2 rounded-lg border border-slate-200">
                {selectedPassModal.pass?.qrData || `RSU-VPASS:${selectedPassModal.pass?.passNumber}:${selectedPassModal.vehicle?.plateNumber}:${selectedPassModal.school_id}`}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedPassModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
