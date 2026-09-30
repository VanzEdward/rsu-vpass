import React, { useState } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Car, 
  Calendar, 
  Sliders, 
  Save, 
  Check, 
  RotateCcw,
  Building,
  Volume2,
  AlertTriangle,
  Receipt
} from 'lucide-react';

const DEFAULT_SETTINGS = {
  academicYear: '2026-2027',
  passExpiryDate: '2026-12-31',
  renewalWindowDays: '30',
  motorcycleFee: '150',
  fourWheelFee: '300',
  commercialFee: '500',
  studentScanPolicy: 'SPOT_CHECK', // 'SPOT_CHECK' | 'STRICT_SCAN'
  employeeLoggingEnforced: true,
  defaultVisitorStayDays: '1',
  maxVisitorStayDays: '7',
  scannerAudioEnabled: true,
  campusName: 'Romblon State University • Odiongan Main Campus',
  primaryGate: 'Gate 1 - National Highway Entrance'
};

export default function AdminSettings() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('vpass_admin_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleFieldChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('vpass_admin_settings', JSON.stringify(settings));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all PASO system settings to default university values?')) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.setItem('vpass_admin_settings', JSON.stringify(DEFAULT_SETTINGS));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold mb-1 border border-emerald-200">
            <Sliders className="w-3.5 h-3.5 text-emerald-600" />
            <span>PASO Policy Configuration</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure official university parking sticker fees, academic year pass expirations, gate security spot-checking policies, and visitor pass parameters.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSaveSettings}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-sm"
          >
            <Save className="w-4 h-4 text-emerald-100" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center space-x-2 text-xs font-bold text-emerald-800 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>PASO System Settings successfully saved and applied across all client and guard modules!</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Official Sticker & Parking Fee Schedule */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Official Sticker & Parking Fee Schedule</h2>
              <p className="text-xs text-slate-500">Preset university cashier parking sticker fees applied at Milestone 3</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Motorcycle Sticker Fee (₱)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₱</span>
                <input
                  type="number"
                  value={settings.motorcycleFee}
                  onChange={(e) => handleFieldChange('motorcycleFee', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400">Standard two-wheeled motor vehicles</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">4-Wheels Pass Fee (₱)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₱</span>
                <input
                  type="number"
                  value={settings.fourWheelFee}
                  onChange={(e) => handleFieldChange('fourWheelFee', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400">Sedans, SUVs, Pickups, and Vans</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Commercial / Heavy Vehicle Fee (₱)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₱</span>
                <input
                  type="number"
                  value={settings.commercialFee}
                  onChange={(e) => handleFieldChange('commercialFee', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400">Delivery trucks, contractors, buses</p>
            </div>
          </div>
        </div>

        {/* Section 2: Academic Year & Expiration Rules */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Academic Year & Pass Expiration Policy</h2>
              <p className="text-xs text-slate-500">Defines validity bounds for printable gate pass stickers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Current Academic Year</label>
              <input
                type="text"
                value={settings.academicYear}
                onChange={(e) => handleFieldChange('academicYear', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <p className="text-[11px] text-slate-400">Institutional school year label</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Annual Pass Expiry Date</label>
              <input
                type="date"
                value={settings.passExpiryDate}
                onChange={(e) => handleFieldChange('passExpiryDate', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <p className="text-[11px] text-slate-400">Date when current stickers expire</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Renewal Window (Days)</label>
              <input
                type="number"
                value={settings.renewalWindowDays}
                onChange={(e) => handleFieldChange('renewalWindowDays', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <p className="text-[11px] text-slate-400">Advance days renewal request opens</p>
            </div>
          </div>
        </div>

        {/* Section 3: Gate Security & Scanning Protocols */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Gate Security & Traffic Protocols</h2>
              <p className="text-xs text-slate-500">Operational policies configured for on-duty security guard viewfinders</p>
            </div>
          </div>

          {/* Student Gate Check Mode */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Student Gate Check Inspection Mode</h4>
                <p className="text-[11px] text-slate-500">Controls how guards process high-volume student traffic at peak morning hours</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Active Protocol
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label 
                className={`p-3 rounded-xl border flex items-start space-x-3 cursor-pointer transition-all ${
                  settings.studentScanPolicy === 'SPOT_CHECK'
                    ? 'border-emerald-600 bg-white shadow-xs ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-white/50 text-slate-500'
                }`}
              >
                <input
                  type="radio"
                  name="studentScanPolicy"
                  value="SPOT_CHECK"
                  checked={settings.studentScanPolicy === 'SPOT_CHECK'}
                  onChange={() => handleFieldChange('studentScanPolicy', 'SPOT_CHECK')}
                  className="mt-0.5"
                />
                <div>
                  <span className="text-xs font-bold block text-slate-900">
                    Visual Pass Inspection & Spot-Checking (Recommended)
                  </span>
                  <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                    Vehicles bearing valid stickers pass through smoothly to prevent national highway traffic bottlenecks. Guards only scan for spot-checks or suspicious vehicles.
                  </span>
                </div>
              </label>

              <label 
                className={`p-3 rounded-xl border flex items-start space-x-3 cursor-pointer transition-all ${
                  settings.studentScanPolicy === 'STRICT_SCAN'
                    ? 'border-emerald-600 bg-white shadow-xs ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-white/50 text-slate-500'
                }`}
              >
                <input
                  type="radio"
                  name="studentScanPolicy"
                  value="STRICT_SCAN"
                  checked={settings.studentScanPolicy === 'STRICT_SCAN'}
                  onChange={() => handleFieldChange('studentScanPolicy', 'STRICT_SCAN')}
                  className="mt-0.5"
                />
                <div>
                  <span className="text-xs font-bold block text-slate-900">
                    Strict 100% QR Scan on Every Vehicle
                  </span>
                  <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                    Guards must physically stop and scan every single student vehicle before opening gate barriers.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="divide-y divide-slate-100">
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">Enforce Employee Entry & Exit Gate Logging</p>
                <p className="text-[11px] text-slate-500">Provide guards with dedicated LOG ENTRY and LOG EXIT actions when scanning university personnel.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.employeeLoggingEnforced}
                onChange={(e) => handleFieldChange('employeeLoggingEnforced', e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">Guard Mobile Scanner Beep & Vibration Feedback</p>
                <p className="text-[11px] text-slate-500">Triggers Web Audio API confirmation tone and haptic pulse upon scanning valid vehicle QR codes.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.scannerAudioEnabled}
                onChange={(e) => handleFieldChange('scannerAudioEnabled', e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Visitor Pass Rules */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 mb-2">Temporary Visitor Pass Policy</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Default Casual Visitor Stay</label>
                <select
                  value={settings.defaultVisitorStayDays}
                  onChange={(e) => handleFieldChange('defaultVisitorStayDays', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="1">1 Day (Expires 11:59 PM today)</option>
                  <option value="2">2 Days Stay</option>
                  <option value="3">3 Days Stay</option>
                </select>
                <p className="text-[11px] text-slate-400">Applied automatically when issuing new guest passes</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Max Multi-Day Event Stay (Delegates)</label>
                <select
                  value={settings.maxVisitorStayDays}
                  onChange={(e) => handleFieldChange('maxVisitorStayDays', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="5">5 Days (Workshops & Seminars)</option>
                  <option value="7">7 Days / 1 Week (Conferences & Sports Meets)</option>
                  <option value="14">14 Days (Accreditation Teams)</option>
                </select>
                <p className="text-[11px] text-slate-400">Maximum validity period selectable by guards at the gate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Campus & Gate Assignment */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Campus & Gate Deployment</h2>
              <p className="text-xs text-slate-500">Active university campus unit and security post assignments</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Assigned University Campus</label>
              <input
                type="text"
                value={settings.campusName}
                onChange={(e) => handleFieldChange('campusName', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Primary Gate Duty Post</label>
              <input
                type="text"
                value={settings.primaryGate}
                onChange={(e) => handleFieldChange('primaryGate', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-sm flex items-center space-x-2"
          >
            <Save className="w-4 h-4 text-emerald-100" />
            <span>Save PASO Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
