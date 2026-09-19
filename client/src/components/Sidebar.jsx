import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  QrCode, 
  FileText, 
  Receipt, 
  UserCircle,
  HelpCircle
} from 'lucide-react';

const clientNavItems = [
  { name: 'Dashboard', path: '/client/dashboard', icon: LayoutDashboard },
  { name: 'My Vehicle', path: '/client/my-vehicle', icon: Car },
  { name: 'Vehicle Pass', path: '/client/vehicle-pass', icon: QrCode },
  { name: 'Applications', path: '/client/applications', icon: FileText },
  { name: 'Payments', path: '/client/payments', icon: Receipt },
  { name: 'Profile', path: '/client/profile', icon: UserCircle },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex-col justify-between shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Client Portal
          </p>
        </div>
        <nav className="space-y-1.5">
          {clientNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-600'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* University PASO Support Card */}
      <div className="mt-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
        <div className="flex items-center space-x-2 text-emerald-700 font-semibold mb-1">
          <HelpCircle className="w-4 h-4" />
          <span>PASO Helpdesk</span>
        </div>
        <p className="text-slate-500">Physical Assets & Security Office</p>
        <p className="text-slate-700 mt-1.5 font-mono text-[11px] bg-white p-1 rounded border border-slate-200 text-center">
          paso@rsu.edu.ph
        </p>
      </div>
    </aside>
  );
}
