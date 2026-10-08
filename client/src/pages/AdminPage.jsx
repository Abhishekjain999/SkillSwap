import React, { useState, useEffect } from 'react';
import {
  Users,
  Video,
  Repeat,
  ShieldAlert,
  TrendingUp,
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Check,
  Ban
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AdminPage = () => {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [popularSkills, setPopularSkills] = useState([]);
  const [dailyActivity, setDailyActivity] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'reports'
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, reportsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        adminAPI.getReports()
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
        setPopularSkills(statsRes.data.popularSkills || []);
        setDailyActivity(statsRes.data.dailyActivity || []);
      }
      if (usersRes.data.success) {
        setUsersList(usersRes.data.users);
      }
      if (reportsRes.data.success) {
        setReportsList(reportsRes.data.reports);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await adminAPI.toggleUserStatus(userId, newStatus);
      setUsersList(prev => prev.map(u => u._id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      console.error('Error toggling user status:', err);
    }
  };

  const handleResolveReport = async (reportId, actionTaken) => {
    try {
      await adminAPI.resolveReport(reportId, {
        status: 'RESOLVED',
        resolutionNotes: `Action taken: ${actionTaken}`,
        actionTaken
      });
      fetchAdminData();
    } catch (err) {
      console.error('Error resolving report:', err);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Access Restricted</h2>
        <p className="text-xs text-slate-400 mt-1">Admin privileges required to access moderation portal.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-fadeIn">
      
      {/* Admin Title & Nav Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold mb-2 border border-amber-500/20">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Staff Administration & Moderation</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">SkillSwap Platform Control</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time analytics, user access management, and community safety queue.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 self-start">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Analytics Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'users' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            User Management ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'reports' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Reports Queue ({reportsList.length})
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Total Registered</span>
                <Users className="w-4 h-4 text-brand-400" />
              </div>
              <p className="text-2xl font-extrabold text-white">{stats?.totalUsers || 24}</p>
              <span className="text-[10px] text-emerald-400 font-semibold">{stats?.activeUsers || 22} Active</span>
            </div>

            <div className="glass-card p-5 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Sessions Conducted</span>
                <Video className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-extrabold text-white">{stats?.totalSessions || 48}</p>
              <span className="text-[10px] text-brand-400 font-semibold">{stats?.completedSessions || 38} Finished</span>
            </div>

            <div className="glass-card p-5 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Completion Rate</span>
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-400">{stats?.completionRate || 96}%</p>
              <span className="text-[10px] text-slate-400 font-semibold">High Mutual Trust</span>
            </div>

            <div className="glass-card p-5 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Exchanges Created</span>
                <Repeat className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-extrabold text-white">{stats?.totalExchanges || 32}</p>
              <span className="text-[10px] text-purple-400 font-semibold">{stats?.activeContracts || 8} Active Contracts</span>
            </div>
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Daily Activity Area Chart (2 Spans) */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-brand-400" />
                <span>7-Day Session Activity & Exchange Volume</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyActivity}>
                    <defs>
                      <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExchanges" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                      itemStyle={{ color: '#f8fafc', fontSize: '11px' }}
                    />
                    <Area type="monotone" dataKey="sessions" stroke="#6366f1" fillOpacity={1} fill="url(#colorSessions)" name="Sessions" />
                    <Area type="monotone" dataKey="exchanges" stroke="#10b981" fillOpacity={1} fill="url(#colorExchanges)" name="Exchanges" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Most Exchanged Skills Bar Chart */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Top Exchanged Skills</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={popularSkills}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                      itemStyle={{ color: '#f8fafc', fontSize: '11px' }}
                    />
                    <Bar dataKey="popularity" fill="#818cf8" radius={[6, 6, 0, 0]} name="Swaps" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* USERS MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Registered Platform Members</h3>
            <span className="text-xs text-slate-400">{usersList.length} total users</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Teaching Skills</th>
                  <th className="p-3.5">Rating</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 flex items-center space-x-3">
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-white">{u.name}</p>
                        <p className="text-[10px] text-slate-400">@{u.username} • {u.email}</p>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {u.skillsTeaching?.map((s, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                            {s.skill}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-amber-400">
                      ★ {u.ratings?.teaching || 5.0}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleStatus(u._id, u.status)}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                            u.status === 'ACTIVE'
                              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORTS QUEUE TAB */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reportsList.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl text-center max-w-md mx-auto space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No Open Moderation Reports</h3>
              <p className="text-xs text-slate-400">The platform community is operating safely with no flagged incidents.</p>
            </div>
          ) : (
            reportsList.map((r) => (
              <div key={r._id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                    {r.reason}
                  </span>
                  <span className="text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-slate-300">{r.details}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400">Target User: <strong className="text-white">{r.reportedUser?.name}</strong></span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleResolveReport(r._id, 'WARNED')}
                      className="px-3 py-1 rounded-lg bg-amber-500/15 text-amber-300 font-semibold"
                    >
                      Issue Warning
                    </button>
                    <button
                      onClick={() => handleResolveReport(r._id, 'SUSPENDED')}
                      className="px-3 py-1 rounded-lg bg-red-600 text-white font-semibold"
                    >
                      Suspend User
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
