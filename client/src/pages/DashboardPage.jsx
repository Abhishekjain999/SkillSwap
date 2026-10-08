import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Flame,
  Sparkles,
  Video,
  Repeat,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Award,
  ChevronRight,
  TrendingUp,
  Play
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sessionAPI, exchangeAPI, matchAPI } from '../services/api';
import { MatchScoreBadge } from '../components/MatchScoreBadge';
import { SkillChip } from '../components/SkillChip';
import { RequestExchangeModal } from '../components/RequestExchangeModal';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [recommendedMatches, setRecommendedMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserForSwap, setSelectedUserForSwap] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [sessionsRes, exchangesRes, matchesRes] = await Promise.all([
          sessionAPI.getMySessions({ status: 'SCHEDULED' }),
          exchangeAPI.getMyExchanges({ type: 'received', status: 'PENDING' }),
          matchAPI.getRecommended()
        ]);

        if (sessionsRes.data.success) {
          setUpcomingSessions(sessionsRes.data.sessions.slice(0, 3));
        }
        if (exchangesRes.data.success) {
          setPendingRequests(exchangesRes.data.requests.slice(0, 3));
        }
        if (matchesRes.data.success) {
          setRecommendedMatches(matchesRes.data.matches.slice(0, 4));
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-950 via-slate-900 to-indigo-950/60 border border-brand-500/20 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-brand-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Welcome back, {user?.name?.split(' ')[0]}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to trade skills today?
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            You are actively mentoring in <span className="text-emerald-400 font-semibold">{user?.skillsTeaching?.[0]?.skill || 'Skills'}</span> and mastering <span className="text-brand-400 font-semibold">{user?.skillsLearning?.[0]?.skill || 'New Skills'}</span>.
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center shadow-lg">
            <div className="flex items-center justify-center space-x-1 text-orange-400 font-extrabold text-lg">
              <Flame className="w-5 h-5 fill-orange-400 text-orange-400" />
              <span>{user?.streakDays || 7}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">Day Streak</p>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center shadow-lg">
            <div className="flex items-center justify-center space-x-1 text-emerald-400 font-extrabold text-lg">
              <span>{user?.ratings?.teaching || 4.9}</span>
              <span className="text-xs text-amber-400">★</span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">Mentor Rating</p>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center shadow-lg">
            <div className="flex items-center justify-center space-x-1 text-brand-400 font-extrabold text-lg">
              <span>{user?.ratings?.sessionsCompleted || 12}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">Sessions</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Skills Progress + Right Upcoming Room */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Progress in Teaching & Learning (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Learning Skills with Progress Bars */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Skills You're Learning</h3>
              </div>
              <Link to="/onboarding" className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center space-x-1">
                <span>Manage Wishlist</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mt-4 space-y-4">
              {user?.skillsLearning?.map((sl, i) => {
                const progressVal = i === 0 ? 65 : 40;
                return (
                  <div key={i} className="p-3.5 bg-slate-900/70 border border-slate-800/80 rounded-2xl">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">{sl.skill}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-brand-500/15 text-brand-300 border border-brand-500/30">
                          Target: {sl.targetProficiency}
                        </span>
                      </div>
                      <span className="text-brand-400 font-semibold text-xs">{progressVal}% Mastered</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-600 to-accent-emerald rounded-full"
                        style={{ width: `${progressVal}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skills You're Teaching */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Skills You're Teaching</h3>
              </div>
              <Link to="/onboarding" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1">
                <span>Add Skill</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mt-4 space-y-4">
              {user?.skillsTeaching?.map((st, i) => {
                const teachScore = i === 0 ? 92 : 80;
                return (
                  <div key={i} className="p-3.5 bg-slate-900/70 border border-slate-800/80 rounded-2xl">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">{st.skill}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          {st.proficiency}
                        </span>
                        <span className="text-amber-400 text-xs flex items-center space-x-0.5">
                          <span>⭐</span>
                          <span>{st.rating || 4.9}</span>
                        </span>
                      </div>
                      <span className="text-emerald-400 font-semibold text-xs">{teachScore}% Mentor Efficacy</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                        style={{ width: `${teachScore}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Next Session + Pending Requests */}
        <div className="space-y-6">
          
          {/* Quick Launch Room Card */}
          <div className="glass-panel p-6 rounded-3xl border border-brand-500/30 shadow-2xl relative overflow-hidden bg-gradient-to-b from-slate-900 via-brand-950/30 to-slate-900">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Learning Room Available</span>
            </div>
            <h3 className="text-base font-bold text-white">Java OOP ⇄ Video Editing Swap</h3>
            <p className="text-xs text-slate-400 mt-1">
              Contract Session 2 with Rahul Verma. WebRTC video, screen share, and Monaco editor ready.
            </p>
            <Link
              to="/session/SWAP-DEMO-ROOM"
              className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-emerald hover:from-brand-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Enter Session Room</span>
            </Link>
          </div>

          {/* Pending Exchange Proposals */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-xs font-bold text-white">
                <Repeat className="w-4 h-4 text-brand-400" />
                <span>Pending Proposals ({pendingRequests.length})</span>
              </div>
              <Link to="/exchanges" className="text-[11px] text-brand-400 hover:underline">
                View all
              </Link>
            </div>

            <div className="mt-3 space-y-3">
              {pendingRequests.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No pending proposals right now.</p>
              ) : (
                pendingRequests.map((req) => (
                  <div key={req._id} className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs">
                    <div className="flex items-center space-x-2 mb-1.5">
                      <img
                        src={req.sender?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                        alt={req.sender?.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="font-bold text-white">{req.sender?.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Offers: <span className="text-emerald-400 font-semibold">{req.teachingSkill}</span> ⇄ Wants: <span className="text-brand-400 font-semibold">{req.learningSkill}</span>
                    </p>
                    <Link
                      to="/exchanges"
                      className="mt-2 block text-center py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-brand-300"
                    >
                      Review Proposal
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Recommended Matches Section */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <h3 className="text-base font-bold text-white">Top Recommended Peer Matches</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Ranked by weighted skill compatibility and availability overlap</p>
          </div>
          <Link to="/discover" className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center space-x-1">
            <span>Explore All Peers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendedMatches.map((m) => (
            <div
              key={m.user._id}
              className="bg-slate-900/80 border border-slate-800/80 hover:border-brand-500/40 rounded-2xl p-4 flex flex-col justify-between transition-all hover:shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <img
                    src={m.user.avatar}
                    alt={m.user.name}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-700"
                  />
                  <MatchScoreBadge score={m.matchScore} breakdown={m.breakdown} reasons={m.reasons} size="sm" />
                </div>

                <Link to={`/profile/${m.user.username}`} className="text-sm font-bold text-white hover:text-brand-300 transition-colors">
                  {m.user.name}
                </Link>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{m.user.headline}</p>

                <div className="mt-3 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Teaches:</span>
                  <div className="flex flex-wrap gap-1">
                    {m.user.skillsTeaching?.slice(0, 2).map((s, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                        {s.skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center space-x-2">
                <Link
                  to={`/profile/${m.user.username}`}
                  className="flex-1 text-center py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Profile
                </Link>
                <button
                  onClick={() => setSelectedUserForSwap(m.user)}
                  className="flex-1 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20"
                >
                  Swap
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exchange Proposal Modal */}
      {selectedUserForSwap && (
        <RequestExchangeModal
          isOpen={!!selectedUserForSwap}
          onClose={() => setSelectedUserForSwap(null)}
          targetUser={selectedUserForSwap}
          onSuccess={() => {
            // refresh data or notify
          }}
        />
      )}

    </div>
  );
};
