import React from 'react';
import { ArrowLeftRight, Heart, Shield, Sparkles, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/80 pt-12 pb-8 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-accent-violet flex items-center justify-center shadow-md">
                <ArrowLeftRight className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Skill<span className="text-brand-400">Swap</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The collaborative skill exchange platform. Trade knowledge, grow together with integrated WebRTC video, shared code execution, and whiteboards.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Signaling & P2P Mesh Active</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/discover" className="hover:text-brand-300 transition-colors">Discover Mentors</Link></li>
              <li><Link to="/exchanges" className="hover:text-brand-300 transition-colors">Exchange Proposals</Link></li>
              <li><Link to="/sessions" className="hover:text-brand-300 transition-colors">Learning Rooms</Link></li>
              <li><Link to="/dashboard" className="hover:text-brand-300 transition-colors">Learner Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Features</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="text-slate-300">Matching Engine (Weighted Compatibility)</span></li>
              <li><span className="text-slate-300">1-to-1 WebRTC Video & Audio</span></li>
              <li><span className="text-slate-300">Monaco Code Editor Sync</span></li>
              <li><span className="text-slate-300">Collaborative Canvas Whiteboard</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Trust & Safety</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="text-slate-400">Verified Peer Reputation</span></li>
              <li><span className="text-slate-400">Mutual Learning Contracts</span></li>
              <li><span className="text-slate-400">End-to-End Media Stream</span></li>
              <li><Link to="/admin" className="text-brand-400 hover:text-brand-300 transition-colors">Admin Portal</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SkillSwap Inc. Trade skills. Grow together.</p>
          <p className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Built for high-production peer learning</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
