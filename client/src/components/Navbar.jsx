import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeftRight,
  Compass,
  Repeat,
  Video,
  LayoutDashboard,
  ShieldAlert,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout, demoLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDemoSwitch = async (username) => {
    try {
      await demoLogin(username);
      setDemoMenuOpen(false);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const navLinks = [
    { name: 'Discover', path: '/discover', icon: Compass },
    { name: 'Exchanges', path: '/exchanges', icon: Repeat, authOnly: true },
    { name: 'Sessions', path: '/sessions', icon: Video, authOnly: true },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, authOnly: true },
  ];

  if (isAdmin) {
    navLinks.push({ name: 'Admin', path: '/admin', icon: ShieldAlert, authOnly: true });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-violet flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <ArrowLeftRight className="w-5 h-5 text-white transform group-hover:rotate-180 transition-transform duration-500" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xl font-extrabold tracking-tight text-white">Skill<span className="text-brand-400">Swap</span></span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 rounded border border-brand-500/30">
                Peer P2P
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block -mt-1">Trade skills. Grow together.</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((link) => {
            if (link.authOnly && !isAuthenticated) return null;
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-brand-400' : 'text-slate-400'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Quick Demo Switcher Button (Great for 2-user & review testing!) */}
          <div className="relative">
            <button
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800/70 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-brand-500/40 transition-all"
              title="Switch demo profile for 2-browser testing"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Demo Switcher</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {demoMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl shadow-2xl border border-slate-700/70 p-2 z-50">
                <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Persona (1-Click)
                </div>
                <button
                  onClick={() => handleDemoSwitch('abhishek')}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-brand-500/20 text-slate-200 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-white">Abhishek Sharma</p>
                    <p className="text-[10px] text-brand-300">Teaches Java ⇄ Wants Video</p>
                  </div>
                  {user?.username === 'abhishek' && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                </button>
                <button
                  onClick={() => handleDemoSwitch('rahul')}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-brand-500/20 text-slate-200 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-white">Rahul Verma</p>
                    <p className="text-[10px] text-brand-300">Teaches Video ⇄ Wants Java</p>
                  </div>
                  {user?.username === 'rahul' && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                </button>
                <button
                  onClick={() => handleDemoSwitch('elena')}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-brand-500/20 text-slate-200 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-white">Elena Rostova</p>
                    <p className="text-[10px] text-brand-300">Teaches UI/UX ⇄ Wants Python</p>
                  </div>
                  {user?.username === 'elena' && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                </button>
                <button
                  onClick={() => handleDemoSwitch('admin')}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-brand-500/20 text-slate-200 transition-colors border-t border-slate-800/80 mt-1 pt-1.5"
                >
                  <div>
                    <p className="font-semibold text-amber-300">Admin Account</p>
                    <p className="text-[10px] text-slate-400">View Platform Moderation</p>
                  </div>
                  {user?.role === 'ADMIN' && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                </button>
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <>
              {/* Notification dropdown */}
              <NotificationDropdown />

              {/* User Avatar Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 transition-all"
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={user?.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-brand-500/40"
                  />
                  <span className="text-xs font-semibold text-slate-200 hidden lg:inline max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl shadow-2xl border border-slate-700/70 p-1.5 z-50">
                    <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                      <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">@{user?.username}</p>
                    </div>
                    <Link
                      to={`/profile/${user?.username}`}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/onboarding"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                      <span>Edit Skills & Bio</span>
                    </Link>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-xl transition-colors mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 rounded-xl shadow-lg shadow-brand-500/25 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            if (link.authOnly && !isAuthenticated) return null;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800/60"
              >
                <Icon className="w-4 h-4 text-brand-400" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
