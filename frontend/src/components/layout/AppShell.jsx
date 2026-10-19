import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Instagram, 
  Home, 
  Compass, 
  Film, 
  Send, 
  Heart, 
  PlusSquare, 
  Menu, 
  LogOut, 
  Settings, 
  User as UserIcon,
  Search,
  ShieldCheck,
  Bookmark,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import CreateModal from '../modals/CreateModal';

export default function AppShell() {
  const { user, logout } = useAuth();
  const { unreadNotifications, unreadMessages } = useSocket();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { to: '/home', label: 'Home', icon: Home },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/explore', label: 'Explore', icon: Compass },
    { to: '/reels', label: 'Reels', icon: Film },
    { to: '/direct', label: 'Messages', icon: Send, badge: unreadMessages },
    { to: '/notifications', label: 'Notifications', icon: Heart, badge: unreadNotifications },
    { label: 'Create', icon: PlusSquare, isAction: true },
    { to: `/users/${user?.username || ''}`, label: 'Profile', icon: UserIcon, isProfile: true }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row selection:bg-pink-500/30">
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-20 lg:w-64 border-r border-neutral-800 bg-neutral-950 p-3 lg:p-5 sticky top-0 h-screen shrink-0 z-40 select-none">
        <div className="space-y-6">
          {/* Logo */}
          <Link 
            to="/home" 
            className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-neutral-900 transition group"
          >
            <div className="w-8 h-8 rounded-xl insta-story-gradient p-0.5 flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-105 transition shrink-0">
              <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
                <Instagram className="w-4 h-4 text-pink-500" />
              </div>
            </div>
            <span className="hidden lg:block text-lg font-bold tracking-tight insta-text-gradient">
              Insta
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;

              if (item.isAction) {
                return (
                  <button
                    key="action-create"
                    onClick={() => setIsCreateOpen(true)}
                    className="w-full flex items-center gap-4 px-3.5 py-3 rounded-2xl text-xs font-semibold text-neutral-300 hover:bg-neutral-900/60 hover:text-white transition group"
                  >
                    <Icon className="w-5 h-5 stroke-[1.8] group-hover:scale-110 transition shrink-0" />
                    <span className="hidden lg:block">{item.label}</span>
                  </button>
                );
              }

              const isActive = location.pathname === item.to || (item.isProfile && location.pathname.startsWith(`/users/${user?.username}`));

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`w-full flex items-center gap-4 px-3.5 py-3 rounded-2xl text-xs font-semibold transition group relative ${
                    isActive
                      ? 'bg-neutral-900 text-white font-bold'
                      : 'text-neutral-300 hover:bg-neutral-900/60 hover:text-white'
                  }`}
                >
                  <div className="relative shrink-0">
                    {item.isProfile && user?.avatarUrl ? (
                      <div className={`w-6 h-6 rounded-full overflow-hidden border ${isActive ? 'border-pink-500' : 'border-neutral-700'}`}>
                        <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8] group-hover:scale-110 transition'}`} />
                    )}

                    {item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center shadow">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom "More" Settings / Admin button */}
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="w-full flex items-center gap-4 px-3.5 py-3 rounded-2xl text-xs font-semibold text-neutral-300 hover:bg-neutral-900/60 hover:text-white transition"
          >
            <Menu className="w-5 h-5 shrink-0" />
            <span className="hidden lg:block">More</span>
          </button>

          {showMoreMenu && (
            <div className="absolute bottom-14 left-0 w-60 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-1.5 z-50 text-xs space-y-1">
              <Link
                to="/settings"
                onClick={() => setShowMoreMenu(false)}
                className="w-full px-3 py-2.5 rounded-xl text-left text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center gap-2.5 transition"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>

              <Link
                to="/feed/saved"
                onClick={() => setShowMoreMenu(false)}
                className="w-full px-3 py-2.5 rounded-xl text-left text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center gap-2.5 transition"
              >
                <Bookmark className="w-4 h-4" />
                <span>Saved & Collections</span>
              </Link>

              <Link
                to="/safety"
                onClick={() => setShowMoreMenu(false)}
                className="w-full px-3 py-2.5 rounded-xl text-left text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center gap-2.5 transition"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Safety Center</span>
              </Link>

              <Link
                to="/help"
                onClick={() => setShowMoreMenu(false)}
                className="w-full px-3 py-2.5 rounded-xl text-left text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center gap-2.5 transition"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Help & Support</span>
              </Link>

              {(user?.role === 'admin' || user?.role === 'moderator') && (
                <Link
                  to="/admin"
                  onClick={() => setShowMoreMenu(false)}
                  className="w-full px-3 py-2.5 rounded-xl text-left text-pink-400 hover:bg-neutral-800 flex items-center gap-2.5 transition border-t border-neutral-800/80"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Console</span>
                </Link>
              )}

              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  logout();
                }}
                className="w-full px-3 py-2.5 rounded-xl text-left text-red-400 hover:bg-neutral-800 flex items-center gap-2.5 transition border-t border-neutral-800/80"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out (@{user?.username})</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Top Navigation */}
      <header className="md:hidden sticky top-0 z-40 bg-neutral-950/90 border-b border-neutral-800 px-4 py-3 flex items-center justify-between backdrop-blur">
        <Link to="/home" className="flex items-center gap-2">
          <Instagram className="w-5 h-5 text-pink-500" />
          <span className="text-base font-bold insta-text-gradient">Insta</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/notifications"
            className="relative p-1 text-neutral-300 hover:text-white"
          >
            <Heart className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-pink-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </Link>

          <Link
            to="/direct"
            className="relative p-1 text-neutral-300 hover:text-white"
          >
            <Send className="w-5 h-5" />
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-pink-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadMessages}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Main Routed Content Area */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-neutral-950/95 border-t border-neutral-800 py-2.5 px-6 flex items-center justify-between z-40 backdrop-blur">
        <Link
          to="/home"
          className={`p-1.5 transition ${location.pathname === '/home' ? 'text-pink-500' : 'text-neutral-400'}`}
        >
          <Home className="w-5 h-5" />
        </Link>

        <Link
          to="/explore"
          className={`p-1.5 transition ${location.pathname.startsWith('/explore') ? 'text-pink-500' : 'text-neutral-400'}`}
        >
          <Compass className="w-5 h-5" />
        </Link>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="p-1.5 text-neutral-300 hover:text-white"
        >
          <PlusSquare className="w-6 h-6 text-pink-500" />
        </button>

        <Link
          to="/reels"
          className={`p-1.5 transition ${location.pathname.startsWith('/reels') ? 'text-pink-500' : 'text-neutral-400'}`}
        >
          <Film className="w-5 h-5" />
        </Link>

        <Link
          to={`/users/${user?.username || ''}`}
          className={`p-1.5 transition ${location.pathname.startsWith('/users') ? 'text-pink-500' : 'text-neutral-400'}`}
        >
          {user?.avatarUrl ? (
            <div className="w-5 h-5 rounded-full overflow-hidden border border-neutral-600">
              <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <UserIcon className="w-5 h-5" />
          )}
        </Link>
      </nav>

      {/* Global Create Modal */}
      {isCreateOpen && (
        <CreateModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={() => navigate('/home')}
        />
      )}
    </div>
  );
}
