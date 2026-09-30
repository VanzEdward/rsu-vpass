import React, { useState } from 'react';
import { usePass } from '../../context/PassContext';
import { 
  BarChart3, 
  LogIn, 
  LogOut, 
  Eye, 
  CheckCircle, 
  Users, 
  Search, 
  Printer, 
  Download,
  Calendar,
  Building,
  ShieldCheck,
  Clock
} from 'lucide-react';

export default function AdminReports() {
  const { gateLogs, visitorPasses } = usePass();

  const [activeTab, setActiveTab] = useState('logs'); // 'logs' | 'visitors'
  const [logFilter, setLogFilter] = useState('ALL'); // 'ALL' | 'ENTRY' | 'EXIT' | 'CHECK'
  const [searchQuery, setSearchQuery] = useState('');

  const activeVisitors = (visitorPasses || []).filter((v) => v.status === 'INSIDE');

  const filteredLogs = (gateLogs || []).filter((log) => {
    if (logFilter !== 'ALL' && log.type !== logFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPlate = log.plateNumber?.toLowerCase().includes(q);
      const matchOwner = log.owner?.toLowerCase().includes(q);
      const matchPass = log.passNumber?.toLowerCase().includes(q);
      return matchPlate || matchOwner || matchPass;
    }
    return true;
  });

  const filteredVisitors = (visitorPasses || []).filter((v) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPlate = v.plateNumber?.toLowerCase().includes(q);
      const matchName = v.name?.toLowerCase().includes(q);
      const matchDest = v.destination?.toLowerCase().includes(q);
      return matchPlate || matchName || matchDest;
    }
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold mb-1 border border-emerald-200">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Security Logs & Audit Trail</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reports & Gate Access Logs</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time campus access records from mobile guard scanners, employee entry/exit tracking, and campus visitor presence monitoring.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-xs cursor-pointer"
        >
          <Printer className="w-4 h-4 text-emerald-600" />
          <span>Print / Export Audit</span>
        </button>
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
          <div className="flex items-center space-x-1.5 w-full sm:w-auto">
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

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter records..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>

      {/* Content View 1: Gate Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Security Gate Access Feed</h2>
              <p className="text-xs text-slate-500">Live timestamped log entries recorded by on-duty gate guards</p>
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
                    <th className="py-2.5 px-3 font-bold">Plate Number</th>
                    <th className="py-2.5 px-3 font-bold">Driver / Registered Owner</th>
                    <th className="py-2.5 px-3 font-bold">Classification</th>
                    <th className="py-2.5 px-3 font-bold">Pass Reference</th>
                    <th className="py-2.5 px-3 font-bold">Timestamp</th>
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
                      <td className="py-3 px-3 text-slate-500 font-medium">
                        {log.time}
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
              <p className="text-xs text-slate-500">Guests, couriers, and event delegates inside Romblon State University</p>
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
                  <th className="py-2.5 px-3 font-bold">Validity Duration</th>
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
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {v.validUntil}
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
