import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const nav = [
  { to: '/',         label: 'Dashboard', icon: '📊' },
  { to: '/feedback', label: 'Feedback',  icon: '💬' },
  { to: '/issues',   label: 'Issues',    icon: '🚨' },
  { to: '/reports',  label: 'Reports',   icon: '📄' },
];

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-full">
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`w-60 shrink-0 border-r border-slate-200 bg-white flex flex-col
                   fixed md:static inset-y-0 left-0 z-40 transition-transform
                   ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="px-5 py-5 border-b border-slate-200">
          <div className="text-lg font-bold text-brand-700">InsightFlow</div>
          <div className="text-xs text-slate-500">Customer Feedback Intelligence</div>
        </div>
        <nav className="p-3 flex-1">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-1 transition ${
                  isActive ? 'bg-brand-50 text-brand-700 font-medium' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <span>{n.icon}</span>
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-3 text-xs text-slate-400 border-t border-slate-200">
          Build Battle 2026
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 border-b border-slate-200 bg-white flex items-center px-4 md:px-6 gap-3">
          <button
            className="md:hidden btn-ghost"
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <div className="text-sm text-slate-500 truncate">
            AI-powered insights for your customer feedback
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
