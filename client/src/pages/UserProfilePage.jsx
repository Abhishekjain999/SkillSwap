import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  MapPin,
  Clock,
  Award,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Calendar,
  MessageSquare,
  ArrowLeftRight,
  ExternalLink,
  Briefcase,
  Sparkles,
  Zap
} from 'lucide-react';
import { usersAPI } from '../services/api';
import { MatchScoreBadge } from '../components/MatchScoreBadge';
import { SkillChip } from '../components/SkillChip';
import { RequestExchangeModal } from '../components/RequestExchangeModal';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export const UserProfilePage = () => {
  const { identifier } = useParams();
  const { user: currentUser } = useAuth();
  const { isUserOnline } = useSocket();

  const [profileUser, setProfileUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await usersAPI.getProfile(identifier);
        if (res.data.success) {
          setProfileUser(res.data.user);
          setReviews(res.data.reviews || []);
          setMatchData(res.data.matchData || null);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [identifier]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="h-64 glass-panel rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <h2 className="text-xl font-bold text-white">User not found</h2>
        <Link to="/discover" className="mt-4 inline-block text-brand-400 text-xs font-semibold">
          Return to Discover
        </Link>
      </div>
    );
  }

  const isMe = currentUser?._id === profileUser._id;
  const isOnline = isUserOnline(profileUser._id) || profileUser.isOnline;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Profile Banner & Hero Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
            <div className="relative">
              <img
                src={profileUser.avatar}
                alt={profileUser.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-slate-800 shadow-2xl"
              />
              {isOnline && (
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-slate-950 animate-pulse" />
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{profileUser.name}</h1>
                <span className="text-xs text-slate-400 font-mono">@{profileUser.username}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Verified Peer
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl font-medium">
                {profileUser.headline || 'Passionate Skill Exchanger'}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2.5">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{profileUser.location || 'Remote'}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{profileUser.timezone || 'UTC+05:30'}</span>
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{profileUser.streakDays || 5} Day Streak</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Button & Match Score */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end space-y-3 shrink-0">
            {matchData && !isMe && (
              <MatchScoreBadge
                score={matchData.score}
                breakdown={matchData.breakdown}
                reasons={matchData.reasons}
                size="lg"
              />
            )}

            {!isMe ? (
              <button
                onClick={() => setExchangeModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-brand-600 to-accent-emerald hover:from-brand-500 hover:to-emerald-500 text-white font-bold text-xs rounded-2xl shadow-xl shadow-brand-500/25 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>Request Skill Exchange</span>
              </button>
            ) : (
              <Link
                to="/onboarding"
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-2xl border border-slate-700 transition-colors"
              >
                Edit My Profile & Skills
              </Link>
            )}
          </div>
        </div>

        {/* Bio */}
        {profileUser.bio && (
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p>{profileUser.bio}</p>
          </div>
        )}
      </div>

      {/* Reputation Metrics Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl text-center">
          <div className="text-amber-400 font-extrabold text-xl flex items-center justify-center space-x-1">
            <Star className="w-5 h-5 fill-amber-400" />
            <span>{profileUser.ratings?.teaching || 4.9}</span>
          </div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mt-1">Teaching Rating</p>
        </div>

        <div className="glass-card p-4 rounded-2xl text-center">
          <div className="text-brand-400 font-extrabold text-xl">
            {profileUser.ratings?.learning || 4.8}
          </div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mt-1">Learner Rating</p>
        </div>

        <div className="glass-card p-4 rounded-2xl text-center">
          <div className="text-emerald-400 font-extrabold text-xl">
            {profileUser.ratings?.reliability || 98}%
          </div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mt-1">Reliability Score</p>
        </div>

        <div className="glass-card p-4 rounded-2xl text-center">
          <div className="text-purple-400 font-extrabold text-xl">
            {profileUser.ratings?.sessionsCompleted || 18}
          </div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mt-1">Sessions Completed</p>
        </div>
      </div>

      {/* Split Grid: Left Skills & Availability, Right Reviews & Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 spans): Skills Teaching & Learning */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Skills Taught */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400 mb-4 flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>Skills Taught by {profileUser.name.split(' ')[0]}</span>
            </h3>

            <div className="space-y-3">
              {profileUser.skillsTeaching?.map((st, i) => (
                <div key={i} className="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-white">{st.skill}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                        {st.proficiency}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">({st.yearsExperience} yrs exp)</span>
                    </div>
                    <div className="flex items-center space-x-1 text-amber-400 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{st.rating || 4.9}</span>
                    </div>
                  </div>
                  {st.description && (
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{st.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Skills Wanted */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl">
            <h3 className="text-sm font-bold text-brand-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>Skills Desired to Learn</span>
            </h3>

            <div className="space-y-3">
              {profileUser.skillsLearning?.map((sl, i) => (
                <div key={i} className="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-white">{sl.skill}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-brand-500/20 text-brand-300 border border-brand-500/30 font-semibold">
                        Goal: {sl.targetProficiency}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-amber-400">{sl.priority} Priority</span>
                  </div>
                  {sl.notes && (
                    <p className="text-xs text-slate-400 mt-1">{sl.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Reviews & Feedback History */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-brand-400" />
              <span>Peer Reviews & Ratings ({reviews.length})</span>
            </h3>

            <div className="space-y-3">
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No public reviews submitted yet.</p>
              ) : (
                reviews.map((r) => (
                  <div key={r._id} className="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={r.reviewer?.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100'}
                          alt={r.reviewer?.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <span className="font-bold text-white">{r.reviewer?.name}</span>
                          <span className="text-[10px] text-slate-400 ml-2">Learned: {r.skill}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{r.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{r.feedback}</p>
                    <span className="text-[10px] text-slate-500 block">
                      {new Date(r.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Badges & Availability Schedule Matrix */}
        <div className="space-y-6">
          
          {/* Earned Badges */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Verified Badges</span>
            </h4>
            <div className="space-y-2">
              {profileUser.badges?.map((b, i) => (
                <div key={i} className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center space-x-3">
                  <span className="text-2xl">{b.icon || '🏆'}</span>
                  <div>
                    <h5 className="text-xs font-bold text-white">{b.name}</h5>
                    <p className="text-[10px] text-slate-400">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Availability Schedule Matrix */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-brand-400" />
              <span>Availability Schedule</span>
            </h4>
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block mb-1">Open Days:</span>
                <div className="flex flex-wrap gap-1.5">
                  {profileUser.availability?.days?.map((d, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-200 text-[11px] font-medium border border-slate-700">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold block mb-1">Preferred Time Slots:</span>
                <div className="space-y-1">
                  {profileUser.availability?.timeSlots?.map((s, i) => (
                    <div key={i} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-emerald-300">
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold block mb-1">Weekly Commitment:</span>
                <p className="text-xs font-bold text-white">{profileUser.availability?.hoursPerWeek || 4} hours / week</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Request Exchange Modal */}
      {exchangeModalOpen && (
        <RequestExchangeModal
          isOpen={exchangeModalOpen}
          onClose={() => setExchangeModalOpen(false)}
          targetUser={profileUser}
          onSuccess={() => {}}
        />
      )}

    </div>
  );
};
