import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, AlertTriangle, Map, BookOpen, FileText, Users,
  MessageSquare, Lightbulb, Trophy, User, Settings,
  Bell, Menu, X, LogOut, Shield, ChevronRight, Zap
} from 'lucide-react';
import { useAuthStore, useUIStore, useNotifStore } from '../../store';
import api from '../../services/api';

const navItems = [
  { path: '/', icon: Home, label: 'Accueil', public: true },
  { path: '/signalements', icon: AlertTriangle, label: 'Signalements', public: true },
  { path: '/carte', icon: Map, label: 'Carte interactive', public: true },
  { path: '/publications', icon: BookOpen, label: 'Publications', public: true },
  { path: '/petitions', icon: FileText, label: 'Pétitions', public: true },
  { path: '/campagnes', icon: Users, label: 'Campagnes', public: true },
  { path: '/chat', icon: MessageSquare, label: 'Chat', auth: true },
  { path: '/innovations', icon: Lightbulb, label: 'Innovations', public: true },
  { path: '/leaderboard', icon: Trophy, label: 'Classement', public: true },
];

const adminNav = [
  { path: '/admin/dashboard', icon: Shield, label: 'Dashboard Admin' },
  { path: '/admin/signalements', icon: AlertTriangle, label: 'Modération' },
  { path: '/admin/users', icon: Users, label: 'Utilisateurs' },
  { path: '/admin/provinces', icon: Map, label: 'Provinces' },
];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, hasRole } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { notifications, unreadCount, setNotifications } = useNotifStore();
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/notifications').then(r => setNotifications(r.data.notifications)).catch(() => {});
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch (_) {}
    logout();
    navigate('/');
  };

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const isAdmin = hasRole('moderator', 'admin', 'superadmin');

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--dark-900)' }}>
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-16'} flex-shrink-0 transition-all duration-300 flex flex-col`}
        style={{ background: 'var(--dark-800)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', minHeight: '64px' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--rdc-rouge), #8b0a1a)' }}>
            <span className="text-white font-bold text-xs">🇨🇩</span>
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <div className="text-white font-bold text-sm leading-tight">Dynamique</div>
              <div className="text-xs" style={{ color: 'var(--rdc-jaune)' }}>Israël Mutombo</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <div className="space-y-0.5">
            {navItems.map(item => {
              if (item.auth && !isAuthenticated) return null;
              const active = isActive(item.path);
              return (
                <Link key={item.path} to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${active ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  style={active ? { background: 'rgba(206,17,38,0.15)', color: 'white', borderLeft: '3px solid var(--rdc-rouge)' } : {}}
                  title={!sidebarOpen ? item.label : ''}
                >
                  <item.icon size={18} className={active ? 'text-red-400' : 'group-hover:text-red-400'} />
                  {sidebarOpen && <span className="text-sm font-medium truncate">{item.label}</span>}
                  {sidebarOpen && active && <ChevronRight size={14} className="ml-auto text-red-400" />}
                </Link>
              );
            })}
          </div>

          {/* Admin section */}
          {isAdmin && (
            <div className="mt-4">
              {sidebarOpen && (
                <div className="px-3 py-1 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--rdc-jaune)' }}>
                    Administration
                  </span>
                </div>
              )}
              <div className="space-y-0.5">
                {adminNav.map(item => {
                  const active = isActive(item.path);
                  return (
                    <Link key={item.path} to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${active ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                      style={active ? { background: 'rgba(247,214,24,0.1)', borderLeft: '3px solid var(--rdc-jaune)' } : {}}
                      title={!sidebarOpen ? item.label : ''}
                    >
                      <item.icon size={18} className={active ? 'text-yellow-400' : ''} />
                      {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* User bottom */}
        {sidebarOpen && isAuthenticated && user && (
          <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <Link to="/profil" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: 'var(--rdc-rouge)' }}>
                {user.nom?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{user.nom}</div>
                <div className="text-xs text-slate-400 capitalize">{user.role}</div>
              </div>
            </Link>
            <button onClick={handleLogout}
              className="w-full flex items-center gap-2 px-2 py-1.5 mt-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-colors text-sm">
              <LogOut size={14} />
              <span>Déconnexion</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 flex-shrink-0"
          style={{ background: 'var(--dark-800)', borderBottom: '1px solid rgba(255,255,255,0.06)', height: '64px' }}>
          <div className="flex items-center gap-3">
            <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
              <Menu size={18} />
            </button>
            <div className="text-sm text-slate-400 hidden md:block">
              🇨🇩 <span className="font-semibold text-white">Unité · Résistance · Discipline · Loyauté · Engagement</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            {isAuthenticated && (
              <div className="relative">
                <button onClick={() => setShowNotifs(!showNotifs)}
                  className="relative p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                      style={{ background: 'var(--rdc-rouge)' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-2xl z-50 border overflow-hidden"
                    style={{ background: 'var(--dark-700)', borderColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="p-3 border-b font-semibold text-sm text-white" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      Notifications {unreadCount > 0 && <span className="ml-1 badge badge-rouge">{unreadCount}</span>}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 text-sm">Aucune notification</div>
                      ) : (
                        notifications.slice(0, 10).map(n => (
                          <div key={n._id} className={`p-3 border-b text-sm hover:bg-white/5 cursor-pointer transition-colors ${!n.lue ? 'bg-red-500/5' : ''}`}
                            style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                            <div className="font-medium text-white">{n.titre}</div>
                            <div className="text-slate-400 text-xs mt-0.5">{n.message}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isAuthenticated ? (
              <Link to="/profil" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'var(--rdc-rouge)' }}>
                  {user?.nom?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-white hidden md:block">{user?.nom}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-xs px-3 py-1.5">Connexion</Link>
                <Link to="/register" className="btn-primary text-xs px-3 py-1.5">S'inscrire</Link>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 page-enter">
          {children}
        </main>
      </div>

      {/* Click outside pour notifs */}
      {showNotifs && <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />}
    </div>
  );
}
