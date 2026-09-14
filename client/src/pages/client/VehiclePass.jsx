import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePass } from '../../context/PassContext';
import { 
  QrCode, 
  Maximize2, 
  RefreshCw, 
  ShieldCheck, 
  X, 
  User, 
  FileBadge, 
  Printer, 
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function VehiclePass() {
  const { applications } = usePass();
  const [showQRModal, setShowQRModal] = useState(false);

  // Find the first issued pass or approved demo
  const issuedApp = applications.find((a) => a.status === 'PASS_ISSUED') || applications.find((a) => a.pass);

  const handlePrint = () => {
    window.print();
  };

  if (!issuedApp || !issuedApp.pass) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Official Vehicle Pass</h1>
          <p className="text-xs text-slate-500 mt-1">
            Physical Assets and Security Office (PASO) issued credentials & vehicle clearance.
          </p>
        </div>

        <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
            <QrCode className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Active Vehicle Pass Generated Yet</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your gate QR code and official vehicle pass will automatically generate once your registration is approved by PASO and you upload your Cashier receipt proof in Milestone 3.
            </p>
          </div>
          <div className="pt-2 flex justify-center space-x-3">
            <Link
              to="/client/my-vehicle"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm inline-flex items-center space-x-1.5"
            >
              <span>Register Vehicle</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { pass, vehicle, applicant_name, school_id, classification, applicant_photo } = issuedApp;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold mb-1 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Milestone 4: QR Pass Active</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Official Vehicle Pass</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Physical Assets and Security Office (PASO) issued credentials & vehicle clearance.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowQRModal(true)}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Maximize2 className="w-4 h-4 text-emerald-600" />
            <span>Show QR Only</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-100" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Grid containing both passes: 1. Wearable Pass, 2. Vehicle Pass Sticker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. Official Wearable Pass Card */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <FileBadge className="w-4 h-4 text-emerald-600" />
              <span>Official Wearable ID Pass</span>
            </h2>
            <span className="text-[11px] text-slate-400">Issued to Driver/Owner</span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-md max-w-sm mx-auto">
            {/* Pass Header */}
            <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
              <div>
                <span className="text-base font-black tracking-wider text-white">RSU VPASS</span>
                <p className="text-[10px] uppercase tracking-wider text-emerald-100 font-semibold">Romblon State University</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold tracking-wide border border-white/30">
                ACTIVE PASS
              </span>
            </div>

            {/* Pass Body */}
            <div className="p-5 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-24 rounded-2xl overflow-hidden bg-slate-50 border-2 border-emerald-400 shadow-xs flex flex-col items-center justify-center text-slate-400 shrink-0">
                  {applicant_photo ? (
                    <img
                      src={applicant_photo}
                      alt="Applicant Identification"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <User className="w-8 h-8 text-slate-300" />
                      <span className="text-[9px] mt-1">Photo</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Registered To</p>
                  <p className="text-sm font-black text-slate-900 leading-tight">{applicant_name}</p>
                  <p className="text-xs font-mono text-slate-600">ID: {school_id}</p>
                  <p className="text-[11px] text-emerald-700 font-semibold">{classification} • {vehicle.type}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Vehicle:</span>
                  <span className="font-semibold text-slate-800">{vehicle.make} {vehicle.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Plate Number:</span>
                  <span className="font-mono font-bold text-slate-900">{vehicle.plateNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pass Number:</span>
                  <span className="font-mono font-bold text-emerald-700">{pass.passNumber}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Valid Until:</span>
                  <span className="font-bold text-slate-900">{pass.validUntil}</span>
                </div>
              </div>

              {/* QR Section */}
              <div className="flex items-center justify-center p-3 bg-white rounded-2xl border border-slate-200">
                <div 
                  onClick={() => setShowQRModal(true)} 
                  className="cursor-pointer flex flex-col items-center group"
                >
                  <QrCode className="w-24 h-24 text-emerald-700 group-hover:scale-105 transition-transform" />
                  <span className="text-[10px] font-semibold text-slate-400 group-hover:text-emerald-700 mt-1">
                    Click to enlarge QR
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Vehicle Pass Sticker */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>Vehicle Pass Sticker</span>
            </h2>
            <span className="text-[11px] text-slate-400">Attached to Vehicle Windshield / Bumper</span>
          </div>

          <div className="bg-white rounded-3xl border-2 border-emerald-500 p-5 shadow-xs max-w-sm mx-auto">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-black text-slate-900 text-sm">
                  RSU <span className="text-emerald-600">VPASS</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                  Vehicle Sticker
                </span>
              </div>

              <div className="py-1">
                <p className="text-xs text-slate-500">Vehicle Description</p>
                <p className="text-base font-bold text-slate-900">{vehicle.make} {vehicle.model}</p>
                <p className="text-xl font-black font-mono tracking-widest text-emerald-700 mt-1">{vehicle.plateNumber}</p>
              </div>

              <div className="flex items-center justify-center py-2">
                <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <QrCode className="w-20 h-20 text-slate-800" />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-xs flex justify-between items-center">
                <span className="font-mono font-bold text-slate-700">{pass.passNumber}</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold">ACTIVE</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center mt-3">
              Must be clearly placed on front windshield or motorcycle chassis.
            </p>
          </div>

          {/* Annual Renewal Module */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 max-w-sm mx-auto mt-4">
            <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              <span>Annual Pass Renewal</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Passes are valid for the current academic year. You can request renewal 30 days before expiration.
            </p>
            <button
              type="button"
              className="mt-3 w-full py-2 px-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
            >
              Request Annual Renewal
            </button>
          </div>
        </div>
      </div>

      {/* QR Enlarged Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black text-slate-900">Enlarged Gate QR</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">{pass.passNumber}</p>
            <div className="mt-6 flex justify-center">
              <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-md">
                <QrCode className="w-56 h-56 text-emerald-700" />
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-700 mt-4">{vehicle.make} {vehicle.model} • {vehicle.plateNumber}</p>
            <p className="text-[11px] text-slate-400 mt-1">Present this QR code to the gate security officer scanner.</p>
            <button
              onClick={() => setShowQRModal(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
