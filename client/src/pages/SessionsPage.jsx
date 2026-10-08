import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Video,
  Calendar,
  Clock,
  Play,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Plus,
  ArrowRight
} from 'lucide-react';
import { sessionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const SessionsPage = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await sessionAPI.getMySessions();
      if (res.data.success) {
        setSessions(res.data.sessions);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter(s => {
    if (filterStatus === 'ALL') return true;
    return s.status === filterStatus;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-fadeIn">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Collaborative Sessions</h1>
          <p className="text-xs text-slate-400 mt-1">
            Access your active learning rooms, scheduled classes, and exchange history.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 self-start">
          {['ALL', 'ACTIVE', 'SCHEDULED', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === st
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions Grid / List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-40 glass-panel rounded-3xl animate-pulse" />)}
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Video className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No {filterStatus.toLowerCase()} sessions found</h3>
          <p className="text-xs text-slate-400">
            Accept an exchange proposal or browse matching peers to schedule your next collaborative room.
          </p>
          <Link to="/discover" className="mt-2 inline-block px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold">
            Find Skill Match
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => {
            const partner = session.participants?.find(p => p._id !== user?._id);
            const isActive = session.status === 'ACTIVE';

            return (
              <div
                key={session._id}
                className={`glass-card rounded-3xl p-5 sm:p-6 border transition-all ${
                  isActive
                    ? 'border-emerald-500/40 bg-gradient-to-r from-slate-900 via-emerald-950/20 to-slate-900 shadow-xl shadow-emerald-500/10'
                    : 'border-slate-800/90'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2.5">
                      {isActive && (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                      <h3 className="text-base font-bold text-white">{session.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : session.status === 'COMPLETED'
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                      }`}>
                        {session.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                      {session.description || 'Interactive collaborative learning room'}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                      <div className="flex items-center space-x-1.5 text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(session.scheduledStartTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(session.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({session.durationMinutes} min)</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                        <span>Focus: {session.skillTaught}</span>
                      </div>
                    </div>
                  </div>

                  {/* Partner Preview & Action Button */}
                  <div className="flex items-center space-x-4 shrink-0">
                    {partner && (
                      <div className="flex items-center space-x-2 text-right">
                        <div>
                          <p className="text-xs font-bold text-white">{partner.name}</p>
                          <p className="text-[10px] text-slate-400">Exchange Partner</p>
                        </div>
                        <img
                          src={partner.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt={partner.name}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-700"
                        />
                      </div>
                    )}

                    <Link
                      to={`/session/${session.roomCode}`}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all shadow-lg ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-500/25'
                          : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/25'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>{isActive ? 'Join Room Now' : 'Enter Room'}</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
