import React, { useState } from 'react';
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
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import FeedPage from '../../pages/feed/FeedPage';
import ExplorePage from '../../pages/explore/ExplorePage';
import ReelsPage from '../../pages/reels/ReelsPage';
import MessagesPage from '../../pages/messages/MessagesPage';
import NotificationsPage from '../../pages/notifications/NotificationsPage';
import ProfilePage from '../../pages/profile/ProfilePage';
import SettingsPage from '../../pages/settings/SettingsPage';
import CreateModal from '../modals/CreateModal';

export default function AppShell() {
  const { user, logout } = useAuth();
  const { unreadNotifications, unreadMessages } = useSocket();
  const [currentView, setCurrentView] = useState('feed'); // 'feed' | 'explore' | 'reels' | 'messages' | 'notifications' | 'profile' | 'settings'
  const [profileUsername, setProfileUsername] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const navigateToProfile = (username = null) => {
    setProfileUsername(username || user?.username);
    setCurrentView('profile');
  };

  const navItems = [
    { id: 'feed', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'reels', label: 'Reels', icon: Film },
    { id: 'messages', label: 'Messages', icon: Send, badge: unreadMessages },
    { id: 'notifications', label: 'Notifications', icon: Heart, badge: unreadNotifications },
    { id: 'create', label: 'Create', icon: PlusSquare, isAction: true },
    { id: 'profile', label: 'Profile', icon: UserIcon, isProfile: true }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row">
      {/* Desktop Left Sidebar (Instagram Style) */}
      <aside className="hidden md:flex flex-col justify-between w-20 lg:w-64 border-r border-neutral-800 bg-neutral-950 p-3 lg:p-5 sticky top-0 h-screen shrink-0 z-40 select-none">
        <div className="space-y-6">
          {/* Logo */}
          <div 
            onClick={() => setCurrentView('feed')} 
            className="flex items-center gap-3 cursor-pointer py-2 px-3 rounded-xl hover:bg-neutral-900 transition"
          >
            <div className="w-8 h-8 rounded-xl insta-story-gradient p-0.5 flex items-center justify-center shadow-lg shadow-pink-500/20 shrink-0">
              <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
                <Instagram className="w-4 h-4 text-pink-500" />
              </div>
            </div>
            <span className="hidden lg:block text-lg font-bold tracking-tight insta-text-gradient">
              Insta
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id && (!item.isProfile || profileUsername === user?.username);

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.isAction) {
                      setIsCreateOpen(true);
                    } else if (item.isProfile) {
                      navigateToProfile(user?.username);
                    } else {
                      setCurrentView(item.id);
                    }
                  }}
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

                    {/* Unread badge */}
                    {item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center shadow">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <span className="hidden lg:block">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom "More" Settings / Logout button */}
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="w-full flex items-center gap-4 px-3.5 py-3 rounded-2xl text-xs font-semibold text-neutral-300 hover:bg-neutral-900/60 hover:text-white transition"
          >
            <Menu className="w-5 h-5" />
            <span className="hidden lg:block">More</span>
          </button>

          {showMoreMenu && (
            <div className="absolute bottom-14 left-0 w-56 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-1.5 z-50 text-xs space-y-1">
              <button
                onClick={() => {
                  setCurrentView('settings');
                  setShowMoreMenu(false);
                }}
                className="w-full px-3 py-2.5 rounded-xl text-left text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center gap-2.5 transition"
              >
                <Settings className="w-4 h-4" />
                <span>Settings & Moderation</span>
              </button>

              <button
                onClick={logout}
                className="w-full px-3 py-2.5 rounded-xl text-left text-red-400 hover:bg-neutral-800 flex items-center gap-2.5 transition border-t border-neutral-800"
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
        <div onClick={() => setCurrentView('feed')} className="flex items-center gap-2">
          <Instagram className="w-5 h-5 text-pink-500" />
          <span className="text-base font-bold insta-text-gradient">Insta</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('notifications')}
            className="relative p-1 text-neutral-300 hover:text-white"
          >
            <Heart className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-pink-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentView('messages')}
            className="relative p-1 text-neutral-300 hover:text-white"
          >
            <Send className="w-5 h-5" />
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-pink-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadMessages}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main View Display */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {currentView === 'feed' && <FeedPage />}
        {currentView === 'explore' && <ExplorePage onSelectUser={(u) => navigateToProfile(u)} />}
        {currentView === 'reels' && <ReelsPage />}
        {currentView === 'messages' && <MessagesPage />}
        {currentView === 'notifications' && <NotificationsPage onSelectUser={(u) => navigateToProfile(u)} />}
        {currentView === 'profile' && (
          <ProfilePage
            username={profileUsername}
            onOpenSettings={() => setCurrentView('settings')}
            onNavigateToMessages={() => setCurrentView('messages')}
          />
        )}
        {currentView === 'settings' && <SettingsPage />}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-neutral-950/95 border-t border-neutral-800 py-2.5 px-6 flex items-center justify-between z-40 backdrop-blur">
        <button
          onClick={() => setCurrentView('feed')}
          className={`p-1.5 transition ${currentView === 'feed' ? 'text-pink-500' : 'text-neutral-400'}`}
        >
          <Home className="w-5 h-5" />
        </button>

        <button
          onClick={() => setCurrentView('explore')}
          className={`p-1.5 transition ${currentView === 'explore' ? 'text-pink-500' : 'text-neutral-400'}`}
        >
          <Compass className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="p-1.5 text-neutral-300 hover:text-white"
        >
          <PlusSquare className="w-6 h-6 text-pink-500" />
        </button>

        <button
          onClick={() => setCurrentView('reels')}
          className={`p-1.5 transition ${currentView === 'reels' ? 'text-pink-500' : 'text-neutral-400'}`}
        >
          <Film className="w-5 h-5" />
        </button>

        <button
          onClick={() => navigateToProfile(user?.username)}
          className={`p-1.5 transition ${currentView === 'profile' ? 'text-pink-500' : 'text-neutral-400'}`}
        >
          {user?.avatarUrl ? (
            <div className="w-5 h-5 rounded-full overflow-hidden border border-neutral-600">
              <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <UserIcon className="w-5 h-5" />
          )}
        </button>
      </nav>

      {/* Global Create Modal */}
      {isCreateOpen && (
        <CreateModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={() => setCurrentView('feed')}
        />
      )}
    </div>
  );
}
