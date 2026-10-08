import React, { useState } from 'react';
import { X, CheckCircle2, Circle, Calendar, Clock, Award, ShieldCheck, ArrowLeftRight } from 'lucide-react';
import { contractAPI } from '../services/api';

export const LearningContractModal = ({ isOpen, onClose, contract, onUpdate }) => {
  if (!isOpen || !contract) return null;

  const [currentContract, setCurrentContract] = useState(contract);
  const [togglingId, setTogglingId] = useState(null);

  const handleToggleGoal = async (goalId) => {
    try {
      setTogglingId(goalId);
      const res = await contractAPI.toggleGoal(currentContract._id, goalId);
      if (res.data.success) {
        setCurrentContract(res.data.contract);
        if (onUpdate) onUpdate(res.data.contract);
      }
    } catch (err) {
      console.error('Failed to toggle goal:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const completedGoalsCount = currentContract.goals?.filter(g => g.completed).length || 0;
  const totalGoals = currentContract.goals?.length || 1;
  const progressPercent = Math.round((completedGoalsCount / totalGoals) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/80 max-h-[92vh] overflow-y-auto">
        
        {/* Certificate Style Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-emerald flex items-center justify-center shadow-lg shadow-brand-500/25">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-extrabold text-white">SkillSwap Learning Contract</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {currentContract.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">Mutual Educational Agreement & Milestone Tracker</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Exchange Parties Banner */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <img
              src={currentContract.userA?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
              alt={currentContract.userA?.name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-brand-500/50"
            />
            <div>
              <p className="text-xs font-semibold text-white">{currentContract.userA?.name}</p>
              <p className="text-[11px] text-emerald-400 font-medium">Teaches: {currentContract.skillA}</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-brand-300 font-semibold">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Mutual Swap</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-xs font-semibold text-white">{currentContract.userB?.name}</p>
              <p className="text-[11px] text-brand-400 font-medium">Teaches: {currentContract.skillB}</p>
            </div>
            <img
              src={currentContract.userB?.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100'}
              alt={currentContract.userB?.name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-brand-500/50"
            />
          </div>
        </div>

        {/* Contract Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
              <Calendar className="w-3.5 h-3.5" />
              <span>Total Sessions</span>
            </div>
            <p className="text-sm font-bold text-white mt-1">
              {currentContract.completedSessions} / {currentContract.totalSessions} Done
            </p>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
              <Clock className="w-3.5 h-3.5" />
              <span>Duration</span>
            </div>
            <p className="text-sm font-bold text-white mt-1">
              {currentContract.sessionDurationMinutes} min / session
            </p>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
              <Award className="w-3.5 h-3.5" />
              <span>Curriculum Goals</span>
            </div>
            <p className="text-sm font-bold text-white mt-1">
              {completedGoalsCount} of {totalGoals} Met
            </p>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Progress</span>
            </div>
            <p className="text-sm font-bold text-emerald-400 mt-1">
              {progressPercent}% Complete
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Agreed Learning Goals Checklist */}
        <div className="mt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center justify-between">
            <span>Contract Milestones & Learning Objectives</span>
            <span className="text-[11px] text-slate-400 lowercase font-normal">(click to mark completed)</span>
          </h4>
          <div className="space-y-2">
            {currentContract.goals?.map((goal, index) => (
              <div
                key={goal._id || index}
                onClick={() => handleToggleGoal(goal._id)}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                  goal.completed
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : 'bg-slate-900/50 border-slate-800/80 text-slate-300 hover:border-slate-700'
                } ${togglingId === goal._id ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  {goal.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                  <span className={`text-xs font-medium ${goal.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                    {goal.title}
                  </span>
                </div>
                {goal.completed && (
                  <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10">
                    Achieved
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Terms footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
          <p className="italic">"{currentContract.agreementTerms}"</p>
        </div>
      </div>
    </div>
  );
};
