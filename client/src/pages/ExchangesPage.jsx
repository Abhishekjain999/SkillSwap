import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftRight,
  Clock,
  Check,
  X,
  RefreshCw,
  FileText,
  Calendar,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { exchangeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CounterOfferModal } from '../components/CounterOfferModal';
import { LearningContractModal } from '../components/LearningContractModal';
import confetti from 'canvas-confetti';

export const ExchangesPage = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('received'); // 'received' | 'sent'
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [counterModalRequest, setCounterModalRequest] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);

  const fetchExchanges = async () => {
    setLoading(true);
    try {
      const res = await exchangeAPI.getMyExchanges({ type: tab });
      if (res.data.success) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      console.error('Error fetching exchanges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchanges();
  }, [tab]);

  const handleUpdateStatus = async (requestId, status, note = '') => {
    try {
      const res = await exchangeAPI.updateStatus(requestId, status, note);
      if (res.data.success) {
        if (status === 'ACCEPTED') {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        }
        fetchExchanges();
      }
    } catch (err) {
      console.error('Error updating exchange status:', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Pending Response</span>;
      case 'ACCEPTED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Accepted & Active</span>;
      case 'COUNTERED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">Counter Offered</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30">Declined</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-fadeIn">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Skill Exchange Proposals</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage incoming proposals, counter-offers, and active peer contracts.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 self-start">
          <button
            onClick={() => setTab('received')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'received'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Received Proposals
          </button>
          <button
            onClick={() => setTab('sent')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'sent'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sent Proposals
          </button>
        </div>
      </div>

      {/* List of Requests */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-44 glass-panel rounded-3xl animate-pulse" />)}
        </div>
      ) : requests.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No {tab} proposals found</h3>
          <p className="text-xs text-slate-400">
            {tab === 'received'
              ? 'When other members propose a swap with your skills, they will appear here.'
              : 'Browse mentors on Discover to initiate your first reciprocal skill exchange!'}
          </p>
          <Link to="/discover" className="mt-3 inline-block px-5 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold">
            Explore Mentors
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const otherParty = tab === 'received' ? req.sender : req.receiver;
            const isPendingReceiver = tab === 'received' && (req.status === 'PENDING' || req.status === 'COUNTERED');

            return (
              <div
                key={req._id}
                className="glass-card rounded-3xl p-5 sm:p-6 border border-slate-800/90 hover:border-slate-700/80 transition-all space-y-4"
              >
                {/* Header Row: Partner, Status, Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center space-x-3">
                    <img
                      src={otherParty?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={otherParty?.name}
                      className="w-10 h-10 rounded-2xl object-cover ring-2 ring-slate-700"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <Link to={`/profile/${otherParty?.username}`} className="font-bold text-sm text-white hover:text-brand-300">
                          {otherParty?.name}
                        </Link>
                        <span className="text-[10px] text-slate-400 font-mono">@{otherParty?.username}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{otherParty?.headline || 'SkillSwap Member'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {getStatusBadge(req.status)}
                    <span className="text-[11px] text-slate-500">
                      {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Exchange Pair Visual Banner */}
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">Offer to Teach:</span>
                    <span className="font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      {req.teachingSkill}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-brand-300 font-bold text-[11px]">
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span>Reciprocal Exchange</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">Aiming to Learn:</span>
                    <span className="font-bold text-brand-400 px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">
                      {req.learningSkill}
                    </span>
                  </div>
                </div>

                {/* Message Body */}
                <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Proposal Message:
                  </span>
                  <p>{req.message}</p>
                </div>

                {/* Counter Offer Box (If Countered) */}
                {req.counterOffer && (
                  <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-1">
                    <div className="flex items-center space-x-1.5 text-amber-300 font-bold">
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Adjusted Counter-Offer Terms:</span>
                    </div>
                    <p className="text-slate-300">
                      {req.counterOffer.sessions} sessions ({req.counterOffer.durationMinutes} mins) • Schedule: {req.counterOffer.schedule || 'Flexible'}
                    </p>
                    <p className="text-slate-400 italic">"{req.counterOffer.message}"</p>
                  </div>
                )}

                {/* Goals & Session count */}
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{req.proposedSessions} Sessions</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{req.proposedDurationMinutes} min / session</span>
                    </span>
                  </div>

                  {/* Actions for Receiver (Accept / Reject / Counter) */}
                  <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                    {req.status === 'ACCEPTED' && req.createdContract && (
                      <button
                        onClick={() => setSelectedContract(req.createdContract)}
                        className="px-3.5 py-1.5 rounded-xl bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 font-semibold text-xs flex items-center space-x-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Learning Contract</span>
                      </button>
                    )}

                    {isPendingReceiver && (
                      <>
                        <button
                          onClick={() => setCounterModalRequest(req)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center space-x-1"
                        >
                          <RefreshCw className="w-3 h-3 text-amber-400" />
                          <span>Counter Offer</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(req._id, 'REJECTED')}
                          className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-xs flex items-center space-x-1"
                        >
                          <X className="w-3 h-3" />
                          <span>Decline</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(req._id, 'ACCEPTED')}
                          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept & Sign Contract</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Counter Offer Modal */}
      {counterModalRequest && (
        <CounterOfferModal
          isOpen={!!counterModalRequest}
          onClose={() => setCounterModalRequest(null)}
          request={counterModalRequest}
          onSuccess={() => fetchExchanges()}
        />
      )}

      {/* Learning Contract Modal */}
      {selectedContract && (
        <LearningContractModal
          isOpen={!!selectedContract}
          onClose={() => setSelectedContract(null)}
          contract={selectedContract}
          onUpdate={() => fetchExchanges()}
        />
      )}

    </div>
  );
};
