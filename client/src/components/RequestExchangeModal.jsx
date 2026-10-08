import React, { useState } from 'react';
import { X, ArrowLeftRight, Check, Send, Sparkles, Plus, Trash2 } from 'lucide-react';
import { exchangeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export const RequestExchangeModal = ({ isOpen, onClose, targetUser, onSuccess }) => {
  const { user } = useAuth();
  if (!isOpen || !targetUser) return null;

  const myTeachingSkills = user?.skillsTeaching?.map(s => s.skill) || ['Java'];
  const theirTeachingSkills = targetUser?.skillsTeaching?.map(s => s.skill) || ['Skill'];

  const [teachingSkill, setTeachingSkill] = useState(myTeachingSkills[0] || '');
  const [learningSkill, setLearningSkill] = useState(theirTeachingSkills[0] || '');
  const [message, setMessage] = useState(
    `Hey ${targetUser.name.split(' ')[0]}! I noticed your expertise in ${theirTeachingSkills[0] || 'your skill'}. I'd love to swap my knowledge in ${myTeachingSkills[0] || 'my skill'} for your insights!`
  );
  const [proposedSessions, setProposedSessions] = useState(4);
  const [proposedDurationMinutes, setProposedDurationMinutes] = useState(60);
  const [goals, setGoals] = useState([
    `Core fundamentals & architecture`,
    `Hands-on project review`,
    `Advanced patterns & workflows`
  ]);
  const [newGoalText, setNewGoalText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddGoal = () => {
    if (newGoalText.trim()) {
      setGoals([...goals, newGoalText.trim()]);
      setNewGoalText('');
    }
  };

  const handleRemoveGoal = (index) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teachingSkill || !learningSkill || !message.trim()) {
      setError('Please fill in what you teach, what you want to learn, and your proposal message.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await exchangeAPI.create({
        receiverId: targetUser._id,
        teachingSkill,
        learningSkill,
        message,
        proposedSessions: Number(proposedSessions),
        proposedDurationMinutes: Number(proposedDurationMinutes),
        learningGoals: goals
      });

      if (res.data.success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        if (onSuccess) onSuccess(res.data.request);
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Failed to submit exchange proposal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl glass-panel rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-700/80 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-emerald flex items-center justify-center shadow-lg shadow-brand-500/20">
              <ArrowLeftRight className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Propose Skill Exchange</h3>
              <p className="text-xs text-slate-400">Collaborate with {targetUser.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Skill Swap Pair Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1.5">
                I can teach you:
              </label>
              <select
                value={teachingSkill}
                onChange={(e) => setTeachingSkill(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {myTeachingSkills.length > 0 ? (
                  myTeachingSkills.map(s => <option key={s} value={s}>{s}</option>)
                ) : (
                  <option value="General Mentorship">General Mentorship</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-400 mb-1.5">
                I want to learn:
              </label>
              <select
                value={learningSkill}
                onChange={(e) => setLearningSkill(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                {theirTeachingSkills.length > 0 ? (
                  theirTeachingSkills.map(s => <option key={s} value={s}>{s}</option>)
                ) : (
                  <option value="Any Skill">Any Skill</option>
                )}
              </select>
            </div>
          </div>

          {/* Proposal Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Personalized Proposal Message
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain why this exchange is a great mutual fit..."
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 leading-relaxed"
            />
          </div>

          {/* Session Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Planned Sessions
              </label>
              <select
                value={proposedSessions}
                onChange={(e) => setProposedSessions(Number(e.target.value))}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value={2}>2 Sessions</option>
                <option value={4}>4 Sessions (Recommended)</option>
                <option value={6}>6 Sessions</option>
                <option value={8}>8 Sessions</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Duration per Session
              </label>
              <select
                value={proposedDurationMinutes}
                onChange={(e) => setProposedDurationMinutes(Number(e.target.value))}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes (Standard)</option>
                <option value={90}>90 Minutes (Deep Dive)</option>
              </select>
            </div>
          </div>

          {/* Collaborative Goals Checklist */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Proposed Milestones / Goals</span>
              <span className="text-[10px] text-slate-500">{goals.length} defined</span>
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {goals.map((g, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-900/70 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-200">
                  <span>{idx + 1}. {g}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveGoal(idx)}
                    className="text-slate-500 hover:text-red-400 ml-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2 mt-2">
              <input
                type="text"
                placeholder="Add another goal (e.g., Code a real project)..."
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddGoal(); } }}
                className="flex-1 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
              <button
                type="button"
                onClick={handleAddGoal}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-accent-emerald hover:from-brand-500 hover:to-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-500/25 flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Sending Proposal...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Skill Exchange Proposal</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
