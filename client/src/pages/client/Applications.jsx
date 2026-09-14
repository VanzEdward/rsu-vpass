import React from 'react';
import { Link } from 'react-router-dom';
import { usePass } from '../../context/PassContext';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Receipt, 
  QrCode, 
  ShieldCheck, 
  AlertCircle,
  User
} from 'lucide-react';

export default function Applications() {
  const { applications } = usePass();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200">
            <Clock className="w-3 h-3" />
            <span>PENDING PASO REVIEW</span>
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>APPROVED — PAY AT CASHIER</span>
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
      case 'PASS_ISSUED':
        return 4;
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
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-sm text-emerald-700">{app.id}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">Submitted {app.submittedDate}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                      {app.vehicle.make} {app.vehicle.model} ({app.vehicle.year}) — <span className="font-mono">{app.vehicle.plateNumber}</span>
                    </h3>
                  </div>
                </div>

                <div>{getStatusBadge(app.status)}</div>
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
                      <span className="text-[10px] text-slate-400 hidden sm:block">Classification & Photo ID</span>
                    </div>

                    {/* Milestone 2 */}
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] mb-1 ${
                        step >= 2 ? (step > 2 ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800 border-2 border-emerald-600') : 'bg-slate-200 text-slate-400'
                      }`}>
                        {step > 2 ? '✓' : '2'}
                      </div>
                      <span className={`text-[11px] font-bold ${step >= 2 ? 'text-slate-800' : 'text-slate-400'}`}>
                        2. PASO Review
                      </span>
                      <span className="text-[10px] text-slate-400 hidden sm:block">Admin Verification</span>
                    </div>

                    {/* Milestone 3 */}
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] mb-1 ${
                        step >= 3 ? (step > 3 ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800 border-2 border-emerald-600 animate-pulse') : 'bg-slate-200 text-slate-400'
                      }`}>
                        {step > 3 ? '✓' : '3'}
                      </div>
                      <span className={`text-[11px] font-bold ${step >= 3 ? 'text-slate-800' : 'text-slate-400'}`}>
                        3. Cashier Payment
                      </span>
                      <span className="text-[10px] text-slate-400 hidden sm:block">Upload Receipt Photo</span>
                    </div>

                    {/* Milestone 4 */}
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] mb-1 ${
                        step === 4 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'
                      }`}>
                        {step === 4 ? '✓' : '4'}
                      </div>
                      <span className={`text-[11px] font-bold ${step === 4 ? 'text-emerald-700' : 'text-slate-400'}`}>
                        4. QR Pass Issued
                      </span>
                      <span className="text-[10px] text-slate-400 hidden sm:block">Ready at Gates</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional Action Banner per Milestone */}
              {isApproved && (
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
              )}

              {isRejected && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-red-950">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>PASO Rejection Remark:</span>
                  </div>
                  <p className="text-red-800 leading-relaxed pl-5 font-medium">
                    "{app.rejection_reason || 'Incomplete or unreadable documents.'}"
                  </p>
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
    </div>
  );
}
