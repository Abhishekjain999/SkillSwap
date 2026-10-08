import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftRight, LogIn, Lock, Mail, Zap, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrUsername || !password) {
      setError('Please provide your username/email and password.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await login(emailOrUsername, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (username) => {
    setLoading(true);
    setError('');
    try {
      await demoLogin(username);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2.5 group mb-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-violet flex items-center justify-center shadow-lg shadow-brand-500/25">
              <ArrowLeftRight className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-white">Skill<span className="text-brand-400">Swap</span></span>
          </Link>
          <h2 className="text-xl font-bold text-white">Welcome back</h2>
          <p className="text-xs text-slate-400 mt-1">Sign in to resume trading skills and learning</p>
        </div>

        {/* 1-Click Demo Profiles Card */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-xl">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 mb-2">
            <Zap className="w-4 h-4" />
            <span>1-Click Instant Demo Login (Recommended)</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Switch identities to test 2-window WebRTC calls & peer matching:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('abhishek')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-all"
            >
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-white">Abhishek</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Teaches Java ⇄ Wants Video</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('rahul')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-all"
            >
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-brand-400" />
                <span className="text-xs font-bold text-white">Rahul</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Teaches Video ⇄ Wants Java</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('elena')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-all"
            >
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-pink-400" />
                <span className="text-xs font-bold text-white">Elena</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Teaches UI/UX ⇄ Wants Python</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-all"
            >
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-xs font-bold text-amber-300">Admin</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Moderator Portal</p>
            </button>
          </div>
        </div>

        {/* Credentials Login Box */}
        <div className="glass-panel rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-800">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="abhishek or abhishek@example.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-brand-600 to-accent-violet hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In with Credentials'}</span>
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold">
              Create account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
