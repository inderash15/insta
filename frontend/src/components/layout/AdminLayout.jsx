import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Users, 
  AlertTriangle, 
  FileText, 
  ArrowLeft, 
  Activity, 
  Instagram,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const adminNav = [
    { to: '/admin', end: true, label: 'Overview', icon: ShieldCheck },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/reports', label: 'Moderation Queue', icon: AlertTriangle },
    { to: '/admin/audit', label: 'Audit Trail', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row selection:bg-pink-500/30">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-neutral-800 bg-neutral-950/95 p-4 flex flex-col justify-between shrink-0 sticky top-0 h-auto md:h-screen z-40 backdrop-blur">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link to="/home" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-500">
                <Instagram className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-white block">Insta Admin</span>
                <span className="text-[10px] text-pink-400 font-mono uppercase tracking-wider">Moderation Console</span>
              </div>
            </Link>

            <Link
              to="/home"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition"
              title="Return to App"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-neutral-800 text-white shadow-sm'
                        : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Admin Footer Badge */}
        <div className="pt-4 border-t border-neutral-800/80 mt-4 md:mt-0 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="truncate">
              <p className="font-medium text-white truncate">{user?.fullName}</p>
              <p className="text-[10px] text-neutral-500 font-mono">@{user?.username} ({user?.role})</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-900 transition"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-6xl">
        <Outlet />
      </main>
    </div>
  );
}
