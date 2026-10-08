import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  Code2,
  Video,
  Sparkles,
  Users,
  ShieldCheck,
  CheckCircle2,
  Play,
  Monitor,
  Terminal,
  Palette,
  Award,
  Zap,
  ArrowRight,
  Star,
  Flame,
  Layers,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated, demoLogin } = useAuth();
  const navigate = useNavigate();

  // Interactive Swap Visualizer State
  const [activePairIndex, setActivePairIndex] = useState(0);
  const demoPairs = [
    {
      userA: { name: 'Abhishek', role: 'Backend Engineer', teaches: 'Java & Algorithms', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', tag: 'Expert' },
      userB: { name: 'Rahul', role: 'Video Creator', teaches: 'DaVinci & Video Editing', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', tag: 'Expert' },
      matchScore: 96,
      reason: 'Bidirectional Swap: Java ⇄ Video Editing'
    },
    {
      userA: { name: 'Alex', role: 'AI Practitioner', teaches: 'Python & PyTorch', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', tag: 'Advanced' },
      userB: { name: 'Elena', role: 'Lead UX Designer', teaches: 'Figma & Design Systems', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', tag: 'Expert' },
      matchScore: 94,
      reason: 'Cross-Discipline: Machine Learning ⇄ Product Design'
    },
    {
      userA: { name: 'Marcus', role: 'Web Architect', teaches: 'React 19 & TypeScript', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', tag: 'Expert' },
      userB: { name: 'Priya', role: 'Growth Strategist', teaches: 'Public Speaking & Growth', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', tag: 'Advanced' },
      matchScore: 91,
      reason: 'Tech & Career: React Architecture ⇄ Executive Presence'
    }
  ];

  const currentPair = demoPairs[activePairIndex];

  const handleQuickDemo = async (username) => {
    try {
      await demoLogin(username);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] radial-glow pointer-events-none" />
      <div className="absolute top-80 -left-48 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-96 -right-48 w-96 h-96 bg-accent-violet/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 md:pt-28 md:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Top Tag */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full glass-card text-xs font-semibold text-brand-300 mb-8 border border-brand-500/30 shadow-lg shadow-brand-500/10 animate-pulse-slow">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>The Next-Gen Peer-to-Peer Learning Economy</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          Don't just learn. <span className="gradient-text">Exchange.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          SkillSwap connects people who want to <span className="text-emerald-400 font-semibold">teach what they know</span> and <span className="text-brand-400 font-semibold">learn what they don't</span>. Real-time video rooms, live collaborative coding, and whiteboard sync.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={isAuthenticated ? "/discover" : "/register"}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-accent-violet hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm shadow-xl shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
          >
            <span>Find My Skill Match</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/discover"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl glass-card text-slate-200 hover:text-white hover:bg-slate-800/80 font-bold text-sm border border-slate-700/80 flex items-center justify-center space-x-2 transition-all"
          >
            <span>Explore 100+ Skills</span>
          </Link>
        </div>

        {/* Quick Demo Credentials Bar */}
        <div className="mt-8 pt-4 max-w-xl mx-auto">
          <p className="text-xs text-slate-400 mb-2.5 font-medium">
            ⚡ Quick Demo Access (Test dual-window peer swap instantly):
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => handleQuickDemo('abhishek')}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Login as Abhishek (Java)</span>
            </button>
            <button
              onClick={() => handleQuickDemo('rahul')}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-brand-400" />
              <span>Login as Rahul (Video)</span>
            </button>
            <button
              onClick={() => handleQuickDemo('elena')}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-pink-400" />
              <span>Login as Elena (UI/UX)</span>
            </button>
          </div>
        </div>

        {/* Animated Skill Exchange Visualizer */}
        <div className="mt-14 max-w-4xl mx-auto">
          <div className="p-1 rounded-3xl bg-gradient-to-r from-brand-500/30 via-accent-violet/30 to-accent-emerald/30 shadow-2xl">
            <div className="glass-panel rounded-[22px] p-6 sm:p-8 border border-slate-800/80">
              
              <div className="flex items-center justify-between pb-6 border-b border-slate-800/80">
                <div className="text-left">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400">Live Simulation</span>
                  <h3 className="text-base font-bold text-white">Mutual Match & Collaborative Exchange</h3>
                </div>
                
                {/* Switcher pills */}
                <div className="flex items-center space-x-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                  {demoPairs.map((pair, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePairIndex(idx)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                        activePairIndex === idx
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Swap #{idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* The Exchange Node Diagram */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                
                {/* User A Card */}
                <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-5 text-left transform transition-all hover:scale-[1.02] shadow-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <img
                      src={currentPair.userA.avatar}
                      alt={currentPair.userA.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/50"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">{currentPair.userA.name}</h4>
                      <p className="text-[11px] text-slate-400">{currentPair.userA.role}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">Teaches</span>
                    <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold text-xs">
                      {currentPair.userA.teaches}
                    </div>
                  </div>
                </div>

                {/* Central Exchange Catalyst */}
                <div className="flex flex-col items-center justify-center py-2 space-y-3">
                  <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-500/15">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{currentPair.matchScore}% Match Score</span>
                  </div>

                  {/* Flow animation representation */}
                  <div className="w-full flex items-center justify-center space-x-2 my-1">
                    <div className="h-0.5 flex-1 bg-gradient-to-r from-emerald-500 via-brand-500 to-indigo-500 rounded" />
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-emerald flex items-center justify-center text-white shadow-lg animate-bounce-soft">
                      <ArrowLeftRight className="w-4 h-4" />
                    </div>
                    <div className="h-0.5 flex-1 bg-gradient-to-r from-indigo-500 via-brand-500 to-emerald-500 rounded" />
                  </div>

                  <p className="text-[11px] text-slate-400 font-medium text-center max-w-[200px]">
                    {currentPair.reason}
                  </p>
                </div>

                {/* User B Card */}
                <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-5 text-left transform transition-all hover:scale-[1.02] shadow-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <img
                      src={currentPair.userB.avatar}
                      alt={currentPair.userB.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-brand-500/50"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">{currentPair.userB.name}</h4>
                      <p className="text-[11px] text-slate-400">{currentPair.userB.role}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-semibold text-brand-400 uppercase tracking-wider block">Teaches</span>
                    <div className="px-2.5 py-1 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-300 font-semibold text-xs">
                      {currentPair.userB.teaches}
                    </div>
                  </div>
                </div>

              </div>

              {/* Learning Room Tools Footnote */}
              <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
                <span className="flex items-center space-x-1.5 text-slate-300">
                  <Video className="w-3.5 h-3.5 text-brand-400" />
                  <span>1-to-1 WebRTC Video</span>
                </span>
                <span className="flex items-center space-x-1.5 text-slate-300">
                  <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Screen Sharing</span>
                </span>
                <span className="flex items-center space-x-1.5 text-slate-300">
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  <span>Monaco Editor Sync</span>
                </span>
                <span className="flex items-center space-x-1.5 text-slate-300">
                  <Palette className="w-3.5 h-3.5 text-pink-400" />
                  <span>Whiteboard Canvas</span>
                </span>
              </div>

            </div>
          </div>
        </div>

      </section>

      {/* Section 1: How SkillSwap Works */}
      <section className="py-20 border-t border-slate-900 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">Simple & Structured</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">How SkillSwap Works</h2>
            <p className="text-sm text-slate-400 mt-2">
              From discovering reciprocal talent to conducting real-time interactive mentoring sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-card p-6 rounded-2xl relative">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 font-bold flex items-center justify-center border border-brand-500/20 mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-white mb-2">Publish Profile</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                List what you can teach with proficiency levels and highlight what you are eager to learn next.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center border border-emerald-500/20 mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-white mb-2">Algorithm Match</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our engine matches mutual availability, complementary skills, languages, and session preferences.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl relative">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center border border-amber-500/20 mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-white mb-2">Learning Contract</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Propose and agree on curriculum goals, session duration, count, and calendar schedule.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl relative">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 font-bold flex items-center justify-center border border-purple-500/20 mb-4">
                04
              </div>
              <h3 className="text-base font-bold text-white mb-2">Live Room & Rate</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Meet in the integrated video room, pair code in Monaco, whiteboard ideas, and build reputation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: The Integrated Learning Room Highlight */}
      <section className="py-20 border-t border-slate-900 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold">
                <Video className="w-3.5 h-3.5" />
                <span>The SkillSwap Crown Jewel</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                An all-in-one room built for serious peer teaching.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Forget switching between Zoom, Google Meet, VS Code, and Miro. SkillSwap unifies every tool teachers and students need in a single responsive interface.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-3 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>1-to-1 WebRTC Video & Audio:</strong> Low latency camera, microphone, and browser window screen sharing.</span>
                </div>
                <div className="flex items-start space-x-3 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Synchronized Monaco Editor:</strong> Multi-language syntax highlighting with real-time peer code sync.</span>
                </div>
                <div className="flex items-start space-x-3 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Collaborative Whiteboard Canvas:</strong> Draw diagrams, shapes, flowcharts, and architecture models together.</span>
                </div>
                <div className="flex items-start space-x-3 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Curriculum Notes & File Sharing:</strong> Check off contract milestones and exchange project PDFs.</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/session/SWAP-DEMO-ROOM"
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Enter Live Demo Learning Room</span>
                </Link>
              </div>
            </div>

            {/* Visual Learning Room Mock */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-700 shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-white">SWAP-DEMO-ROOM (Active)</span>
                </div>
                <span className="text-[11px] text-slate-400">Java ⇄ Video Editing</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400"
                    alt="Abhishek"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur rounded text-[10px] text-white font-medium">
                    Abhishek (Host)
                  </div>
                </div>

                <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400"
                    alt="Rahul"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur rounded text-[10px] text-white font-medium">
                    Rahul (Student)
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-brand-300">
                <p className="text-slate-500">// Collaborative Code Sync Active</p>
                <p><span className="text-purple-400">public class</span> <span className="text-amber-300">Main</span> &#123;</p>
                <p className="pl-4 text-slate-300">System.out.println(<span className="text-emerald-400">"Trading Java for Video Editing"</span>);</p>
                <p>&#125;</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section 3: Reputation & Badges System */}
      <section className="py-20 border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Trust by Design</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">High-Trust Reputation System</h2>
            <p className="text-sm text-slate-400 mt-2">
              No hollow karma points. SkillSwap tracks teaching efficacy, reliability, response rate, and verified reviews.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div className="glass-card p-5 rounded-2xl">
              <Award className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">🏆 Top Mentor</h4>
              <p className="text-[11px] text-slate-400 mt-1">Awarded to instructors with 4.8+ rating and 10+ completed exchanges.</p>
            </div>

            <div className="glass-card p-5 rounded-2xl">
              <Flame className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">🔥 Active Streak</h4>
              <p className="text-[11px] text-slate-400 mt-1">Earned by consistent learners conducting weekly peer sessions.</p>
            </div>

            <div className="glass-card p-5 rounded-2xl">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">🎯 99% Reliability</h4>
              <p className="text-[11px] text-slate-400 mt-1">Recognizes peers with on-time attendance and zero unannounced no-shows.</p>
            </div>

            <div className="glass-card p-5 rounded-2xl">
              <Star className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">⭐ Verified Feedback</h4>
              <p className="text-[11px] text-slate-400 mt-1">Reviews can only be submitted after completing an actual learning room.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Testimonials */}
      <section className="py-20 border-t border-slate-900 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-white">Loved by Builders & Lifelong Learners</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center space-x-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />)}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                "I wanted to learn DaVinci Resolve color grading for my tutorials. In 4 sessions with Rahul, I learned more hands-on tricks than in months of pre-recorded courses, while teaching him Java OOP!"
              </p>
              <div className="flex items-center space-x-3 pt-3 border-t border-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                  alt="Abhishek"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">Abhishek S.</h4>
                  <p className="text-[10px] text-slate-400">Java Mentor & Developer</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center space-x-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />)}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                "The collaborative Monaco editor and whiteboard make peer learning feel effortless. We don't just talk about concepts; we build and debug live code together in real-time."
              </p>
              <div className="flex items-center space-x-3 pt-3 border-t border-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100"
                  alt="Elena"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">Elena R.</h4>
                  <p className="text-[10px] text-slate-400">Product Designer</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center space-x-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />)}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                "The match algorithm is spooky accurate. It paired me with someone whose schedule aligned directly with my weekend mornings and who wanted the exact React patterns I specialize in."
              </p>
              <div className="flex items-center space-x-3 pt-3 border-t border-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"
                  alt="Marcus"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">Marcus V.</h4>
                  <p className="text-[10px] text-slate-400">Frontend Architect</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: High Impact CTA */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-brand-900/60 via-brand-800/40 to-indigo-950/60 border border-brand-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-violet/20 rounded-full blur-3xl pointer-events-none" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Find someone who knows what you want to learn.
            </h2>
            <p className="mt-3 text-slate-300 text-sm max-w-xl mx-auto">
              Join thousands of creators, engineers, designers, and students trading knowledge freely.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={isAuthenticated ? "/discover" : "/register"}
                className="px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm shadow-xl transition-all"
              >
                Start Exchanging Free
              </Link>
              <Link
                to="/discover"
                className="px-8 py-3.5 rounded-2xl glass-panel text-white hover:bg-slate-800/60 font-bold text-sm border border-slate-700 transition-all"
              >
                Browse Matching Peers
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
