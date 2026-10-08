import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Star,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowLeftRight,
  Globe,
  Radio,
  SlidersHorizontal
} from 'lucide-react';
import { usersAPI, skillAPI } from '../services/api';
import { MatchScoreBadge } from '../components/MatchScoreBadge';
import { SkillChip } from '../components/SkillChip';
import { RequestExchangeModal } from '../components/RequestExchangeModal';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export const DiscoverPage = () => {
  const { isUserOnline } = useSocket();
  const { isAuthenticated } = useAuth();

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProficiency, setSelectedProficiency] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [minRating, setMinRating] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [sortBy, setSortBy] = useState('match');

  // Selected for Exchange
  const [selectedUserForSwap, setSelectedUserForSwap] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.discover({
        q: searchQuery,
        proficiency: selectedProficiency,
        day: selectedDay,
        minRating: minRating,
        onlineOnly: onlineOnly ? 'true' : 'false',
        sortBy
      });

      if (res.data.success) {
        setUsers(res.data.users);
        setTotal(res.data.total);
      }
    } catch (err) {
      console.error('Error discovering users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, selectedProficiency, selectedDay, minRating, onlineOnly, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-fadeIn">
      
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-semibold mb-2 border border-brand-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover Reciprocal Talent</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Explore Mentors & Learners</h1>
          <p className="text-xs text-slate-400 mt-1">
            Connect with vetted peers ready to swap skills without financial barriers.
          </p>
        </div>

        {/* Global Search Input */}
        <div className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder="Search by skill (Java, Figma...), name, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-2.5 pl-11 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 shadow-lg"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3" />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800/90 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-slate-400 font-semibold flex items-center space-x-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-400" />
            <span>Filter By:</span>
          </span>

          {/* Proficiency filter */}
          <select
            value={selectedProficiency}
            onChange={(e) => setSelectedProficiency(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="">Any Proficiency</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Expert">Expert</option>
          </select>

          {/* Day filter */}
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="">Any Day Availability</option>
            <option value="Monday">Monday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
          </select>

          {/* Minimum Rating */}
          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="">All Ratings</option>
            <option value="4.5">★ 4.5 & up</option>
            <option value="4.8">★ 4.8 & up</option>
          </select>

          {/* Online now toggle */}
          <button
            onClick={() => setOnlineOnly(!onlineOnly)}
            className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 transition-all ${
              onlineOnly
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${onlineOnly ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span>Online Now</span>
          </button>
        </div>

        {/* Sort selector */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 text-[11px]">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-brand-500 text-xs"
          >
            <option value="match">Match Score</option>
            <option value="rating">Highest Rating</option>
            <option value="sessions">Most Sessions</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Showing {users.length} compatible skill swappers</span>
      </div>

      {/* User Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((sk) => (
            <div key={sk} className="h-64 rounded-3xl bg-slate-900/50 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Matching Peers Found</h3>
          <p className="text-xs text-slate-400">
            Try adjusting your search filters or clear the active query to view all available members.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedProficiency('');
              setSelectedDay('');
              setMinRating('');
              setOnlineOnly(false);
            }}
            className="mt-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((u) => {
            const online = isUserOnline(u._id) || u.isOnline;
            return (
              <div
                key={u._id}
                className="glass-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all group"
              >
                <div>
                  {/* Card Header: Avatar, Name, Online indicator, Match score */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-700/80 group-hover:ring-brand-500/50 transition-all"
                        />
                        {online && (
                          <span
                            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-pulse"
                            title="Online Now"
                          />
                        )}
                      </div>
                      <div>
                        <Link
                          to={`/profile/${u.username}`}
                          className="text-sm font-bold text-white hover:text-brand-300 transition-colors flex items-center space-x-1"
                        >
                          <span>{u.name}</span>
                        </Link>
                        <p className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{u.location || 'Remote'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Match Score with weighted breakdown */}
                    <MatchScoreBadge
                      score={u.matchScore || 85}
                      breakdown={u.matchBreakdown}
                      reasons={u.matchReasons}
                      size="sm"
                    />
                  </div>

                  {/* Headline / Bio */}
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
                    {u.headline || u.bio || 'Passionate skill exchanger and collaborative learner.'}
                  </p>

                  {/* Skills Teaches Section */}
                  <div className="mb-3 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                      Teaches:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {u.skillsTeaching?.slice(0, 3).map((st, i) => (
                        <SkillChip
                          key={i}
                          skill={st.skill}
                          proficiency={st.proficiency}
                          rating={st.rating}
                          variant="teaching"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Skills Wanted Section */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 block">
                      Wants to Learn:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {u.skillsLearning?.slice(0, 3).map((sl, i) => (
                        <SkillChip
                          key={i}
                          skill={sl.skill}
                          proficiency={sl.targetProficiency}
                          variant="learning"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-1 text-amber-400 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{u.ratings?.teaching || 4.9}</span>
                    <span className="text-slate-500 text-[10px] font-normal">({u.ratings?.sessionsCompleted || 10} sessions)</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/profile/${u.username}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => setSelectedUserForSwap(u)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-emerald hover:from-brand-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 flex items-center space-x-1 transition-all"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span>Swap</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Exchange Proposal Modal */}
      {selectedUserForSwap && (
        <RequestExchangeModal
          isOpen={!!selectedUserForSwap}
          onClose={() => setSelectedUserForSwap(null)}
          targetUser={selectedUserForSwap}
          onSuccess={() => {
            // refresh or toast
          }}
        />
      )}

    </div>
  );
};
