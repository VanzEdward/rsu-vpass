import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { LayoutDashboard, FileCheck, Layers, BarChart3 } from 'lucide-react';

export default function AdminLayout() {
  const navs = [
    { name: 'Dashboard Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Application Reviews', path: '/admin/applications', icon: FileCheck },
    { name: 'Pass Management', path: '/admin/passes', icon: Layers },
    { name: 'Reports & Logs', path: '/admin/reports', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="px-3 py-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                PASO Admin Portal
              </p>
            </div>
            <nav className="space-y-1.5">
              {navs.map((item) => {
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
        </aside>
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
