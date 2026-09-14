import React, { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';

export default function Payments() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { applications, submitReceiptPayment } = usePass();

  const approvedApps = applications.filter((a) => a.status === 'APPROVED');
  const queryAppId = searchParams.get('appId');

  const [selectedAppId, setSelectedAppId] = useState(queryAppId || (approvedApps[0]?.id || ''));
  const [orNumber, setOrNumber] = useState('');
  const [receiptPhoto, setReceiptPhoto] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedPass, setGeneratedPass] = useState(null);

  useEffect(() => {
    if (queryAppId) {
      setSelectedAppId(queryAppId);
    } else if (approvedApps.length > 0 && !selectedAppId) {
      setSelectedAppId(approvedApps[0].id);
    }
  }, [queryAppId, approvedApps]);

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
          Milestone 3: Upload your official Cashier receipt to automatically generate your active Vehicle Pass and Gate QR code.
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
              Milestone 4 Complete
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-2">Official Vehicle Pass Issued!</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Your Cashier receipt has been recorded. Your unique gate QR code, wearable pass, and vehicle sticker have been automatically generated.
            </p>
          </div>

          <div className="pt-2 flex justify-center space-x-3">
            <Link
              to="/client/vehicle-pass"
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-2 shadow-sm"
            >
              <QrCode className="w-4 h-4 text-emerald-100" />
              <span>View Active Pass & QR Code</span>
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
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Approved Application</label>
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                >
                  {approvedApps.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.id} — {app.vehicle.make} {app.vehicle.model} ({app.vehicle.plateNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Receipt (OR) Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026-98123"
                  value={orNumber}
                  onChange={(e) => setOrNumber(e.target.value)}
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
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Open Camera & Snap Receipt</span>
                        </button>

                        <label className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold flex items-center space-x-1.5 cursor-pointer">
                          <UploadCloud className="w-4 h-4 text-emerald-600" />
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
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
                  <span>Submit Payment & Generate QR Pass</span>
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
