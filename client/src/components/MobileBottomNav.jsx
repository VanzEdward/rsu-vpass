import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Car, QrCode, FileText, UserCircle } from 'lucide-react';

const mobileNavItems = [
  { name: 'Home', path: '/client/dashboard', icon: LayoutDashboard },
  { name: 'Vehicle', path: '/client/my-vehicle', icon: Car },
  { name: 'My Pass', path: '/client/vehicle-pass', icon: QrCode, isPrimary: true },
  { name: 'Requests', path: '/client/applications', icon: FileText },
  { name: 'Profile', path: '/client/profile', icon: UserCircle },
];

export default function MobileBottomNav() {
  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;

          if (item.isPrimary) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center -mt-5 group focus:outline-none`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-transform duration-200 active:scale-95 ${
                        isActive
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-emerald-600/30'
                          : 'bg-emerald-500 text-white hover:bg-emerald-600 ring-2 ring-white shadow-emerald-500/20'
                      }`}
                    >
                      <Icon className="w-6 h-6 animate-pulse" />
                    </div>
                    <span
                      className={`text-[10px] font-bold mt-1 tracking-tight transition-colors ${
                        isActive ? 'text-emerald-700 font-extrabold' : 'text-slate-600'
                      }`}
                    >
                      {item.name}
                    </span>
                  </>
                )}
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1.5 min-h-[48px] text-xs font-medium transition-colors ${
                  isActive ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div>
                    <Icon className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110 text-emerald-600' : 'text-slate-400'}`} />
                  </div>
                  <span className={`text-[10px] mt-1 ${isActive ? 'font-bold text-emerald-700' : 'font-medium text-slate-500'}`}>
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
