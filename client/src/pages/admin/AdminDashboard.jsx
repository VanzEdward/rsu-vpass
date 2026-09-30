import React from 'react';
import { Link } from 'react-router-dom';
import { usePass } from '../../context/PassContext';
import { 
  Users, 
  Layers, 
  Clock, 
  ShieldCheck, 
  FileCheck, 
  BarChart3, 
  Sliders, 
  ArrowRight, 
  CheckCircle, 
  LogIn, 
  LogOut, 
  Eye, 
  Car,
  QrCode
} from 'lucide-react';

export default function AdminDashboard() {
  const { applications, vehicles, visitorPasses, gateLogs } = usePass();

  const pendingApps = (applications || []).filter((a) => a.status === 'PENDING');
  const activePasses = (applications || []).filter((a) => a.status === 'PASS_ISSUED' || a.pass);
  const activeVisitors = (visitorPasses || []).filter((v) => v.status === 'INSIDE');
  const recentLogs = (gateLogs || []).slice(0, 5);

  const stats = [
    { label: 'Pending Reviews', count: pendingApps.length, icon: Clock, color: 'text-amber-700 bg-amber-50', link: '/admin/applications' },
    { label: 'Active Passes Issued', count: activePasses.length, icon: Layers, color: 'text-emerald-700 bg-emerald-50', link: '/admin/passes' },
    { label: 'Visitors on Campus', count: activeVisitors.length, icon: Users, color: 'text-blue-700 bg-blue-50', link: '/admin/reports' },
    { label: 'Total Gate Logs', count: (gateLogs || []).length, icon: ShieldCheck, color: 'text-indigo-700 bg-indigo-50', link: '/admin/reports' },
  ];

  const motorcyclesCount = (vehicles || []).filter(v => (v.type || '').toLowerCase().includes('motorcycle')).length;
  const fourWheelsCount = (vehicles || []).length - motorcyclesCount;

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold mb-1 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Executive Command Center</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Romblon State University Physical Assets and Security Office (PASO) operational control panel.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/admin/applications"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            <span>Review Applications</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <Link
              key={idx}
              to={s.link}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex items-center justify-between group"
            >
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-700 transition-colors">
                  {s.label}
                </p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{s.count}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Grid: Pending Action Alert & Quick Navigator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Pending Review Notice */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Pending Vehicle Clearance Requests</h2>
              <p className="text-xs text-slate-500">Applicant live photo and OR/CR documents awaiting inspection</p>
            </div>
            <Link
              to="/admin/applications"
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center space-x-1"
            >
              <span>View All ({pendingApps.length})</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {pendingApps.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-slate-800">All Submitted Applications Reviewed!</p>
              <p className="text-[11px] text-slate-500">
                There are no pending registrations waiting in the queue right now.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingApps.slice(0, 3).map((app) => (
                <div key={app.id} className="py-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs text-emerald-700">{app.id}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {app.classification || 'Student'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900">{app.applicant_name} ({app.school_id})</p>
                    <p className="text-[11px] text-slate-500">
                      {app.vehicle?.make} {app.vehicle?.model} • Plate: <span className="font-mono font-bold text-slate-800">{app.vehicle?.plateNumber}</span>
                    </p>
                  </div>

                  <Link
                    to="/admin/applications"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Portal Fast-Nav */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            Administrative Modules
          </h2>
          
          <div className="space-y-2.5">
            <Link
              to="/admin/applications"
              className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">Application Reviews</p>
                  <p className="text-[11px] text-slate-400">Evaluate identity & OR/CR scans</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600" />
            </Link>

            <Link
              to="/admin/passes"
              className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-blue-800">Pass Management</p>
                  <p className="text-[11px] text-slate-400">View active student & employee passes</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
            </Link>

            <Link
              to="/admin/reports"
              className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-purple-800">Reports & Gate Logs</p>
                  <p className="text-[11px] text-slate-400">Entry/exit logs and visitor monitor</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600" />
            </Link>

            <Link
              to="/admin/settings"
              className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-slate-800">System Settings</p>
                  <p className="text-[11px] text-slate-400">Fee schedules & gate check policies</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Gate Activity Preview */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Campus Gate Verifications</h2>
            <p className="text-xs text-slate-500">Live timestamped access records logged by gate security personnel</p>
          </div>
          <Link
            to="/admin/reports"
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center space-x-1"
          >
            <span>Full Audit Trail</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <th className="py-2.5 px-3 font-bold">Action</th>
                <th className="py-2.5 px-3 font-bold">Plate Number</th>
                <th className="py-2.5 px-3 font-bold">Owner / Driver</th>
                <th className="py-2.5 px-3 font-bold">Classification</th>
                <th className="py-2.5 px-3 font-bold">Timestamp</th>
                <th className="py-2.5 px-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentLogs.map((log) => (
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
      </div>
    </div>
  );
}
