import React from 'react';
import { Star } from 'lucide-react';

const PROFICIENCY_COLORS = {
  Beginner: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  Intermediate: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  Advanced: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  Expert: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
};

export const SkillChip = ({ skill, proficiency, rating, years, variant = 'teaching' }) => {
  const badgeStyle = PROFICIENCY_COLORS[proficiency] || 'bg-slate-800 text-slate-300 border-slate-700';

  return (
    <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
      variant === 'teaching' ? 'bg-slate-900/70 border-slate-700/60 text-slate-200' : 'bg-brand-950/40 border-brand-800/40 text-brand-200'
    }`}>
      <span className="font-semibold">{skill}</span>
      {proficiency && (
        <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${badgeStyle}`}>
          {proficiency}
        </span>
      )}
      {rating && (
        <span className="flex items-center space-x-0.5 text-amber-400 text-[10px] ml-0.5">
          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
          <span>{rating}</span>
        </span>
      )}
      {years && (
        <span className="text-[10px] text-slate-400">({years}y)</span>
      )}
    </div>
  );
};
