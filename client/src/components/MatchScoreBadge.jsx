import React, { useState } from 'react';
import { Sparkles, Info, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export const MatchScoreBadge = ({ score = 85, breakdown, reasons = [], size = 'md', showDetails = false }) => {
  const [expanded, setExpanded] = useState(showDetails);

  // Determine badge color gradient based on score
  const getScoreColor = (val) => {
    if (val >= 90) return 'from-emerald-500 to-teal-400 text-emerald-300 border-emerald-500/30 bg-emerald-500/10';
    if (val >= 75) return 'from-indigo-500 to-purple-400 text-indigo-300 border-indigo-500/30 bg-indigo-500/10';
    if (val >= 60) return 'from-blue-500 to-cyan-400 text-blue-300 border-blue-500/30 bg-blue-500/10';
    return 'from-amber-500 to-orange-400 text-amber-300 border-amber-500/30 bg-amber-500/10';
  };

  const badgeColorClass = getScoreColor(score);

  return (
    <div className="relative inline-block">
      <div
        onClick={() => setExpanded(!expanded)}
        className={`cursor-pointer inline-flex items-center space-x-1.5 rounded-full font-bold border transition-all hover:scale-105 select-none ${
          size === 'sm' ? 'px-2 py-0.5 text-[11px]' : size === 'lg' ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'
        } ${badgeColorClass}`}
      >
        <Sparkles className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>{score}% Match</span>
        {reasons.length > 0 && (
          <span className="text-[10px] opacity-70 ml-0.5">
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </span>
        )}
      </div>

      {/* Expandable Breakdown Drawer / Popover */}
      {expanded && (reasons.length > 0 || breakdown) && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 glass-panel rounded-2xl p-3.5 shadow-2xl border border-slate-700/80 z-30 text-left">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold text-white flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Why you matched ({score}%)</span>
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
              className="text-[10px] text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          {/* Breakdown Bars */}
          {breakdown && (
            <div className="mt-2.5 space-y-1.5 text-[11px]">
              {Object.entries(breakdown).map(([key, item]) => (
                <div key={key}>
                  <div className="flex justify-between text-slate-300 text-[10px] mb-0.5">
                    <span>{item.label}</span>
                    <span className="font-semibold text-slate-200">{item.score}/{item.max}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-accent-emerald rounded-full transition-all duration-500"
                      style={{ width: `${(item.score / item.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reasons List */}
          {reasons.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Match Highlights</p>
              {reasons.map((r, i) => (
                <div key={i} className="flex items-start space-x-1.5 text-xs text-slate-300 leading-tight">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
