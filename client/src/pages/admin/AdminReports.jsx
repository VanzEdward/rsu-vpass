import React, { useState, useRef, useEffect } from 'react';
import { usePass } from '../../context/PassContext';
import {
  LogIn,
  LogOut,
  Eye,
  CheckCircle,
  Users,
  Search,
  Download,
  ChevronDown,
  FileSpreadsheet,
  ShieldCheck,
  Clock,
  MapPin,
  RefreshCw,
  CheckCircle2,
  X
} from 'lucide-react';
import { formatLogTimestamp, formatExactDateTime } from '../../utils/dateUtils';
import { apiRequest } from '../../api/client';
import { downloadExcelWorkbook } from '../../utils/excelExport';

export default function AdminReports() {
  const { gateLogs, visitorPasses } = usePass();

  const [activeTab, setActiveTab] = useState('logs'); // 'logs' | 'visitors'
  const [logFilter, setLogFilter] = useState('ALL'); // 'ALL' | 'ENTRY' | 'EXIT' | 'CHECK'
  const [gateFilter, setGateFilter] = useState('ALL'); // 'ALL' | 'Gate 1' | 'Gate 2' | 'Gate 3' | 'Gate 4'
  const [searchQuery, setSearchQuery] = useState('');
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [downloadingType, setDownloadingType] = useState(null);
  const [downloadBanner, setDownloadBanner] = useState('');
  const downloadMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target)) {
        setIsDownloadOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsDownloadOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const activeVisitors = (visitorPasses || []).filter((v) => v.status === 'INSIDE');

  const filteredLogs = (gateLogs || []).filter((log) => {
    if (logFilter !== 'ALL' && log.type !== logFilter) return false;
    if (gateFilter !== 'ALL' && log.gate !== gateFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPlate = log.plateNumber?.toLowerCase().includes(q);
      const matchOwner = log.owner?.toLowerCase().includes(q);
      const matchPass = log.passNumber?.toLowerCase().includes(q);
      const matchGate = log.gate?.toLowerCase().includes(q);
      return matchPlate || matchOwner || matchPass || matchGate;
    }
    return true;
  });

  const filteredVisitors = (visitorPasses || []).filter((v) => {
    if (gateFilter !== 'ALL' && v.entryGate !== gateFilter && v.exitGate !== gateFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPlate = v.plateNumber?.toLowerCase().includes(q);
      const matchName = v.name?.toLowerCase().includes(q);
      const matchDest = v.destination?.toLowerCase().includes(q);
      const matchGate = (v.entryGate || '').toLowerCase().includes(q) || (v.exitGate || '').toLowerCase().includes(q);
      return matchPlate || matchName || matchDest || matchGate;
    }
    return true;
  });

  const parseDateValue = (primaryTs, fallbackDate, fallbackTime) => {
    if (primaryTs) {
      const d = new Date(primaryTs);
      if (!isNaN(d.getTime())) return d;
    }
    if (fallbackDate) {
      const cleanedDate = String(fallbackDate).replace(/Today|Yesterday/gi, '').trim();
      const cleanedTime = String(fallbackTime || '').replace(/Today|Yesterday/gi, '').trim();
      const combined = cleanedDate && cleanedTime ? `${cleanedDate} ${cleanedTime}` : cleanedDate;
      const d = new Date(combined);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  };

  const formatCleanDate = (dateObj, fallback = 'N/A') => {
    if (!dateObj || isNaN(dateObj.getTime())) return fallback;
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCleanTime = (dateObj, fallback = 'N/A') => {
    if (!dateObj || isNaN(dateObj.getTime())) return fallback;
    return dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatClassificationLabel = (raw) => {
    const val = String(raw || '').toUpperCase();
    if (val === 'VISITOR') return 'Visitor';
    if (val.includes('EMPLOYEE') || val.includes('FACULTY') || val.includes('STAFF')) return 'Employee';
    return 'Student';
  };

  const formatMethodLabel = (raw) => {
    const val = String(raw || '').toUpperCase();
    if (val === 'MANUAL_SEARCH') return 'Manual Search';
    if (val === 'QR_SCAN') return 'QR Scan';
    return raw || 'QR Scan';
  };

  const handleDownloadReport = async (reportChoice) => {
    setIsDownloadOpen(false);
    setDownloadingType(reportChoice);

    const now = new Date();
    const todaySlug = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    try {
      if (reportChoice === 'logs') {
        let allLogs = Array.isArray(gateLogs) ? gateLogs : [];
        try {
          const freshLogs = await apiRequest('/guard/logs?all=true');
          if (Array.isArray(freshLogs)) {
            allLogs = freshLogs;
          }
        } catch {
          // Fallback to currently loaded context records if offline
        }

        const headers = [
          'No.',
          'Date',
          'Time',
          'Action',
          'Gate Station',
          'User Category',
          'Classification',
          'Client / Visitor Name',
          'Plate Number',
          'Pass Reference',
          'Verification Method',
          'Security Status',
          'Verified By Guard',
        ];

        const rows = allLogs.map((log, idx) => {
          const dateObj = parseDateValue(log.timestamp, log.date, log.time);
          const clsLabel = formatClassificationLabel(log.classification || 'STUDENT');
          const userCategory = clsLabel === 'Visitor' ? 'Visitor' : 'Client';
          const rawType = String(log.type || 'ENTRY').toUpperCase();
          const actionLabel = rawType === 'CHECK' ? 'SPOT-CHECK' : rawType;

          return [
            idx + 1,
            formatCleanDate(dateObj, log.date || 'N/A'),
            formatCleanTime(dateObj, log.time || 'N/A'),
            actionLabel,
            log.gate || log.gate_station || 'Gate 1',
            userCategory,
            clsLabel,
            log.owner || log.owner_name || 'Registered Motorist',
            log.plateNumber || log.plate_number || 'N/A',
            log.passNumber || log.pass_number || 'N/A',
            formatMethodLabel(log.method || log.verification_method),
            log.status || log.verification_status || 'VALID',
            log.guard_name || 'Gate Security',
          ];
        });

        const filename = `RSU_VPASS_Gate_Access_Audit_Logs_${todaySlug}.xlsx`;
        downloadExcelWorkbook({
          filename,
          sheetName: 'Gate Access Audit Logs',
          headers,
          rows,
        });

        setDownloadBanner(`Downloaded ${rows.length} Gate Access Audit Log record${rows.length === 1 ? '' : 's'} (${filename}).`);
      } else {
        let allVisitors = Array.isArray(visitorPasses) ? visitorPasses : [];
        try {
          const freshVisitors = await apiRequest('/guard/visitors?all=true');
          if (Array.isArray(freshVisitors)) {
            allVisitors = freshVisitors;
          }
        } catch {
          // Fallback to currently loaded context records if offline
        }

        const headers = [
          'No.',
          'Pass ID',
          'Visitor Name',
          'Contact Number',
          'ID Presented',
          'Plate Number',
          'Vehicle Type',
          'Destination',
          'Purpose',
          'Entry Gate',
          'Entry Date',
          'Entry Time',
          'Valid Days',
          'Valid Until',
          'Exit Gate',
          'Exit Date & Time',
          'Current Status',
          'Issued By Guard',
        ];

        const rows = allVisitors.map((v, idx) => {
          const entryObj = parseDateValue(v.timestamp || v.created_at || v.valid_from, v.entryDate, v.entryTime);
          const validToObj = v.valid_to ? new Date(v.valid_to) : null;
          const exitObj = v.exitTimestamp ? new Date(v.exitTimestamp) : null;

          const validUntilClean =
            validToObj && !isNaN(validToObj.getTime())
              ? formatCleanDate(validToObj)
              : (v.validUntil || 'N/A');

          const isDeparted = v.status === 'EXITED' || Boolean(v.exitGate);
          const exitGateClean = v.exitGate || (isDeparted ? 'Gate Recorded' : 'Still on Campus');
          const exitDateTimeClean =
            exitObj && !isNaN(exitObj.getTime())
              ? `${formatCleanDate(exitObj)} ${formatCleanTime(exitObj)}`
              : isDeparted
              ? (v.exitDate && v.exitTime ? `${v.exitDate} ${v.exitTime}` : 'Exited')
              : 'Still on Campus';

          const statusLabel =
            v.status === 'INSIDE'
              ? 'INSIDE CAMPUS'
              : v.status === 'EXPIRED'
              ? 'EXPIRED'
              : 'DEPARTED';

          return [
            idx + 1,
            v.id || v.pass_number || 'N/A',
            v.name || v.visitor_name || 'N/A',
            v.contact || 'N/A',
            v.idPresented || v.id_presented || "Driver's License",
            v.plateNumber || v.plate_number || 'N/A',
            v.vehicleType || 'Motorcycle',
            v.destination || 'Administration Building',
            v.purpose || 'Official Business',
            v.entryGate || 'Gate 1',
            formatCleanDate(entryObj, v.entryDate || 'N/A'),
            formatCleanTime(entryObj, v.entryTime || 'N/A'),
            Number(v.validDays) || 1,
            validUntilClean,
            exitGateClean,
            exitDateTimeClean,
            statusLabel,
            v.issued_by_guard || 'Gate Security',
          ];
        });

        const filename = `RSU_VPASS_Campus_Visitor_Passes_${todaySlug}.xlsx`;
        downloadExcelWorkbook({
          filename,
          sheetName: 'Campus Visitor Passes',
          headers,
          rows,
        });

        setDownloadBanner(`Downloaded ${rows.length} Campus Visitor Pass record${rows.length === 1 ? '' : 's'} (${filename}).`);
      }

      setTimeout(() => setDownloadBanner(''), 4500);
    } finally {
      setDownloadingType(null);
    }
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {downloadBanner && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl flex items-center justify-between text-xs shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{downloadBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setDownloadBanner('')}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reports & Gate Access Logs</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time campus access records from mobile guard scanners, employee entry/exit tracking, and campus visitor presence monitoring.
          </p>
        </div>

        <div className="relative self-start sm:self-auto" ref={downloadMenuRef}>
          <button
            type="button"
            disabled={downloadingType !== null}
            onClick={() => setIsDownloadOpen((prev) => !prev)}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-xs cursor-pointer disabled:opacity-60"
          >
            {downloadingType ? (
              <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-emerald-600" />
            )}
            <span>{downloadingType ? 'Preparing Excel...' : 'Download'}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isDownloadOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDownloadOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-40 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3.5 py-1.5 border-b border-slate-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Choose Data to Download (.xlsx)
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleDownloadReport('logs')}
                className="w-full px-3.5 py-2.5 text-left hover:bg-slate-50 transition-colors flex items-start space-x-3 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">Gate Access Audit Logs</p>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    All entry, exit &amp; spot-check logs for clients &amp; visitors
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadReport('visitors')}
                className="w-full px-3.5 py-2.5 text-left hover:bg-slate-50 transition-colors flex items-start space-x-3 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Users className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">Campus Visitor Passes</p>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    All issued &amp; historical temporary visitor pass records
                  </p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 space-x-4">
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 px-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'logs'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Gate Access Audit Logs ({(gateLogs || []).length})
        </button>
        <button
          onClick={() => setActiveTab('visitors')}
          className={`pb-3 px-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'visitors'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Campus Visitor Passes ({activeVisitors.length} Active Inside)
        </button>
      </div>

        {/* Controls Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {activeTab === 'logs' ? (
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {['ALL', 'ENTRY', 'EXIT', 'CHECK'].map((f) => (
              <button
                key={f}
                onClick={() => setLogFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  logFilter === f
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {f === 'CHECK' ? 'Spot-Checks' : f}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-xs font-bold text-slate-700">
            Displaying all single-day and multi-day temporary visitor passes
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
          {/* Gate Station Filter Dropdown */}
          <div className="flex items-center space-x-1.5 w-full sm:w-auto">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden md:inline">Gate:</span>
            <select
              value={gateFilter}
              onChange={(e) => setGateFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
            >
              <option value="ALL">All Gates (1 - 4)</option>
              <option value="Gate 1">Gate 1</option>
              <option value="Gate 2">Gate 2</option>
              <option value="Gate 3">Gate 3</option>
              <option value="Gate 4">Gate 4</option>
            </select>
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plate, owner, gate..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Content View 1: Gate Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Security Gate Access Feed</h2>
              <p className="text-xs text-slate-500">Live timestamped log entries recorded by on-duty gate guards with gate station</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {filteredLogs.length} Events
            </span>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-800">No gate logs found.</p>
              <p className="text-xs text-slate-500">Logs will appear as security guards verify passes at the campus gates.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="py-2.5 px-3 font-bold">Action</th>
                    <th className="py-2.5 px-3 font-bold">Gate Station</th>
                    <th className="py-2.5 px-3 font-bold">Plate Number</th>
                    <th className="py-2.5 px-3 font-bold">Driver / Registered Owner</th>
                    <th className="py-2.5 px-3 font-bold">Classification</th>
                    <th className="py-2.5 px-3 font-bold">Pass Reference</th>
                    <th className="py-2.5 px-3 font-bold">Date & Time</th>
                    <th className="py-2.5 px-3 font-bold">Security Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          log.type === 'ENTRY'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.type === 'EXIT'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {log.type === 'ENTRY' && <LogIn className="w-3 h-3 mr-0.5" />}
                          {log.type === 'EXIT' && <LogOut className="w-3 h-3 mr-0.5" />}
                          {log.type === 'CHECK' && <Eye className="w-3 h-3 mr-0.5" />}
                          <span>{log.type}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 font-bold font-mono text-[11px]">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          <span>{log.gate || 'Gate 1'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-black text-slate-900">
                        {log.plateNumber}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {log.owner}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                          log.classification === 'EMPLOYEE'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : log.classification === 'VISITOR'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {log.classification}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">
                        {log.passNumber}
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-medium whitespace-nowrap">
                        <div 
                          className="flex items-center space-x-1.5 font-mono text-xs text-slate-800"
                          title={formatExactDateTime(log.timestamp, log.date, log.time)}
                        >
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{formatLogTimestamp(log.timestamp, log.date, log.time)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-bold text-emerald-700 flex items-center space-x-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{log.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Content View 2: Visitor Passes */}
      {activeTab === 'visitors' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Digital Temporary Visitor Passes</h2>
              <p className="text-xs text-slate-500">Visitor entry and exit gate tracking with exact timestamps</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {activeVisitors.length} Active Inside Campus
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="py-2.5 px-3 font-bold">Pass ID</th>
                  <th className="py-2.5 px-3 font-bold">Visitor Details</th>
                  <th className="py-2.5 px-3 font-bold">Vehicle Info</th>
                  <th className="py-2.5 px-3 font-bold">Destination & Purpose</th>
                  <th className="py-2.5 px-3 font-bold">Entry (Gate & Time)</th>
                  <th className="py-2.5 px-3 font-bold">Exit (Gate & Time)</th>
                  <th className="py-2.5 px-3 font-bold">Current Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredVisitors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 font-mono font-bold text-blue-700">
                      {v.id}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{v.name}</div>
                      <div className="text-[10px] text-slate-400">{v.idPresented} • {v.contact}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-mono font-black text-slate-900">{v.plateNumber}</div>
                      <div className="text-[10px] text-slate-500">{v.vehicleType}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{v.destination}</div>
                      <div className="text-[10px] text-slate-400">{v.purpose}</div>
                    </td>
                    {/* Entry Gate & Time */}
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-1 font-bold text-slate-900">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>{v.entryGate || 'Gate 1'}</span>
                      </div>
                      <div 
                        className="text-[10px] text-slate-500 mt-0.5 flex items-center space-x-1 font-mono"
                        title={formatExactDateTime(v.timestamp || v.created_at, v.entryDate, v.entryTime)}
                      >
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{formatLogTimestamp(v.timestamp || v.created_at, v.entryDate, v.entryTime)}</span>
                      </div>
                    </td>
                    {/* Exit Gate & Time */}
                    <td className="py-3 px-3">
                      {v.exitGate ? (
                        <>
                          <div className="flex items-center space-x-1 font-bold text-slate-900">
                            <MapPin className="w-3 h-3 text-rose-500" />
                            <span>{v.exitGate}</span>
                          </div>
                          <div 
                            className="text-[10px] text-slate-500 mt-0.5 flex items-center space-x-1 font-mono"
                            title={formatExactDateTime(v.exitTimestamp, v.exitDate, v.exitTime)}
                          >
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{formatLogTimestamp(v.exitTimestamp, v.exitDate, v.exitTime)}</span>
                          </div>
                        </>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Still on Campus</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        v.status === 'INSIDE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {v.status === 'INSIDE' ? 'INSIDE CAMPUS' : 'DEPARTED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
