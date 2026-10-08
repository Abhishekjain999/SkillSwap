import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Clock,
  Globe,
  Sliders
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const OnboardingPage = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Basic Profile
  const [profile, setProfile] = useState({
    name: user?.name || '',
    headline: user?.headline || 'Passionate Skill Exchanger',
    bio: user?.bio || '',
    location: user?.location || 'Remote / Global',
    timezone: user?.timezone || 'UTC+05:30',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  });

  // Step 2: What can you teach?
  const [skillsTeaching, setSkillsTeaching] = useState(
    user?.skillsTeaching?.length > 0
      ? user.skillsTeaching
      : [
          {
            skill: 'Java',
            proficiency: 'Expert',
            yearsExperience: 4,
            description: 'Core syntax, OOP, Streams, and algorithms.',
          },
        ]
  );
  const [newTeach, setNewTeach] = useState({
    skill: '',
    proficiency: 'Intermediate',
    yearsExperience: 2,
    description: '',
  });

  // Step 3: What do you want to learn?
  const [skillsLearning, setSkillsLearning] = useState(
    user?.skillsLearning?.length > 0
      ? user.skillsLearning
      : [
          {
            skill: 'Video Editing',
            targetProficiency: 'Intermediate',
            priority: 'High',
            notes: 'DaVinci Resolve & Premiere workflow',
          },
        ]
  );
  const [newLearn, setNewLearn] = useState({
    skill: '',
    targetProficiency: 'Intermediate',
    priority: 'High',
    notes: '',
  });

  // Step 4: Availability
  const [availability, setAvailability] = useState({
    days: user?.availability?.days?.length > 0 ? user.availability.days : ['Monday', 'Wednesday', 'Saturday'],
    timeSlots: user?.availability?.timeSlots?.length > 0 ? user.availability.timeSlots : ['Evenings (6 PM - 9 PM)'],
    hoursPerWeek: user?.availability?.hoursPerWeek || 5,
    timezone: user?.availability?.timezone || 'UTC+05:30',
  });

  // Step 5: Learning Preferences
  const [preferences, setPreferences] = useState({
    sessionType: user?.preferences?.sessionType || ['One-to-one'],
    format: user?.preferences?.format || ['Video', 'Project-based'],
    pacing: user?.preferences?.pacing || 'Project-based',
    sessionLength: user?.preferences?.sessionLength || '60 minutes',
    languages: user?.preferences?.languages || ['English'],
  });

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name || prev.name,
        headline: user.headline || prev.headline,
        bio: user.bio || prev.bio,
        location: user.location || prev.location,
        avatar: user.avatar || prev.avatar,
      }));
    }
  }, [user]);

  // Handlers for Teaching Skills
  const handleAddTeachingSkill = () => {
    if (newTeach.skill.trim()) {
      setSkillsTeaching([...skillsTeaching, { ...newTeach, yearsExperience: Number(newTeach.yearsExperience) }]);
      setNewTeach({ skill: '', proficiency: 'Intermediate', yearsExperience: 2, description: '' });
    }
  };

  const handleRemoveTeachingSkill = (idx) => {
    setSkillsTeaching(skillsTeaching.filter((_, i) => i !== idx));
  };

  // Handlers for Learning Skills
  const handleAddLearningSkill = () => {
    if (newLearn.skill.trim()) {
      setSkillsLearning([...skillsLearning, { ...newLearn }]);
      setNewLearn({ skill: '', targetProficiency: 'Intermediate', priority: 'High', notes: '' });
    }
  };

  const handleRemoveLearningSkill = (idx) => {
    setSkillsLearning(skillsLearning.filter((_, i) => i !== idx));
  };

  // Toggle Day helper
  const toggleDay = (day) => {
    if (availability.days.includes(day)) {
      setAvailability({ ...availability, days: availability.days.filter(d => d !== day) });
    } else {
      setAvailability({ ...availability, days: [...availability.days, day] });
    }
  };

  // Toggle Preference Array helper
  const togglePref = (category, value) => {
    const list = preferences[category] || [];
    if (list.includes(value)) {
      setPreferences({ ...preferences, [category]: list.filter(v => v !== value) });
    } else {
      setPreferences({ ...preferences, [category]: [...list, value] });
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await updateProfile({
        ...profile,
        skillsTeaching,
        skillsLearning,
        availability,
        preferences,
        onboardingCompleted: true,
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const allTimeSlots = ['Mornings (9 AM - 12 PM)', 'Afternoons (1 PM - 5 PM)', 'Evenings (6 PM - 9 PM)', 'Late Night (9 PM+)'];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      
      {/* Step Progress Tracker */}
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-extrabold text-white">Setup Your Skill Profile</h2>
        <p className="text-xs text-slate-400 mt-1">Step {step} of 5 to unlock high-accuracy peer matches</p>

        <div className="flex items-center justify-center space-x-2 mt-6">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-10 bg-brand-500'
                  : s < step
                  ? 'w-6 bg-emerald-500'
                  : 'w-6 bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800">
        
        {/* STEP 1: Basic Profile */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Basic Profile & Avatar</h3>
                <p className="text-xs text-slate-400">Tell other members who you are</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Location (City, Country)</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Headline</label>
              <input
                type="text"
                value={profile.headline}
                onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                placeholder="e.g. Senior Java Engineer • Passionate Mentor"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Bio / Background</label>
              <textarea
                rows={3}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Share your experience, favorite topics, and what drives you to swap skills..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Profile Avatar URL</label>
              <input
                type="text"
                value={profile.avatar}
                onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        )}

        {/* STEP 2: What can you teach? */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">What can you teach?</h3>
                <p className="text-xs text-slate-400">Add the skills you are ready to share with peers</p>
              </div>
            </div>

            {/* List of currently added teaching skills */}
            <div className="space-y-2">
              {skillsTeaching.map((st, i) => (
                <div key={i} className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-xs">{st.skill}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {st.proficiency}
                      </span>
                      <span className="text-[11px] text-slate-400">({st.yearsExperience} yrs exp)</span>
                    </div>
                    {st.description && <p className="text-[11px] text-slate-400 mt-0.5">{st.description}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTeachingSkill(i)}
                    className="text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Form to add a new teaching skill */}
            <div className="p-4 bg-slate-900/50 border border-dashed border-slate-700 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-slate-300">Add a Teaching Skill</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Skill name (e.g. Java, Python)"
                  value={newTeach.skill}
                  onChange={(e) => setNewTeach({ ...newTeach, skill: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
                <select
                  value={newTeach.proficiency}
                  onChange={(e) => setNewTeach({ ...newTeach, proficiency: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
                <input
                  type="number"
                  min="1"
                  max="30"
                  placeholder="Years exp"
                  value={newTeach.yearsExperience}
                  onChange={(e) => setNewTeach({ ...newTeach, yearsExperience: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
              <input
                type="text"
                placeholder="Short description of what you'll cover..."
                value={newTeach.description}
                onChange={(e) => setNewTeach({ ...newTeach, description: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
              />
              <button
                type="button"
                onClick={handleAddTeachingSkill}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Teaching Skill</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: What do you want to learn? */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">What do you want to learn?</h3>
                <p className="text-xs text-slate-400">Specify skills on your wishlist to pair with instructors</p>
              </div>
            </div>

            <div className="space-y-2">
              {skillsLearning.map((sl, i) => (
                <div key={i} className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-xs">{sl.skill}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-brand-500/20 text-brand-300 border border-brand-500/30">
                        Aim: {sl.targetProficiency}
                      </span>
                      <span className="text-[10px] text-amber-400 uppercase font-semibold">({sl.priority} Priority)</span>
                    </div>
                    {sl.notes && <p className="text-[11px] text-slate-400 mt-0.5">{sl.notes}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveLearningSkill(i)}
                    className="text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-900/50 border border-dashed border-slate-700 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-slate-300">Add a Desired Skill</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="e.g. Video Editing, UI/UX"
                  value={newLearn.skill}
                  onChange={(e) => setNewLearn({ ...newLearn, skill: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
                <select
                  value={newLearn.targetProficiency}
                  onChange={(e) => setNewLearn({ ...newLearn, targetProficiency: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                >
                  <option value="Beginner">Goal: Beginner</option>
                  <option value="Intermediate">Goal: Intermediate</option>
                  <option value="Advanced">Goal: Advanced</option>
                  <option value="Expert">Goal: Expert</option>
                </select>
                <select
                  value={newLearn.priority}
                  onChange={(e) => setNewLearn({ ...newLearn, priority: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="What specific project or goal do you want to achieve?"
                value={newLearn.notes}
                onChange={(e) => setNewLearn({ ...newLearn, notes: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
              />
              <button
                type="button"
                onClick={handleAddLearningSkill}
                className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Desired Skill</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Availability */}
        {step === 4 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Your Availability</h3>
                <p className="text-xs text-slate-400">Define available days and times for collaborative sessions</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Available Days</label>
              <div className="flex flex-wrap gap-2">
                {allDays.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      availability.days.includes(d)
                        ? 'bg-brand-600 border-brand-500 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Preferred Time Slots</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allTimeSlots.map((slot) => {
                  const selected = availability.timeSlots.includes(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => {
                        if (selected) {
                          setAvailability({ ...availability, timeSlots: availability.timeSlots.filter(s => s !== slot) });
                        } else {
                          setAvailability({ ...availability, timeSlots: [...availability.timeSlots, slot] });
                        }
                      }}
                      className={`p-2.5 rounded-xl text-xs font-medium text-left border transition-all ${
                        selected
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Hours per week committed: <span className="text-brand-400 font-bold">{availability.hoursPerWeek} hrs</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={availability.hoursPerWeek}
                onChange={(e) => setAvailability({ ...availability, hoursPerWeek: Number(e.target.value) })}
                className="w-full accent-brand-500"
              />
            </div>
          </div>
        )}

        {/* STEP 5: Learning Preferences */}
        {step === 5 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Learning Preferences</h3>
                <p className="text-xs text-slate-400">Tailor how you prefer to conduct meetings and projects</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Session Type</label>
              <div className="flex gap-3">
                {['One-to-one', 'Group'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => togglePref('sessionType', t)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border ${
                      preferences.sessionType.includes(t)
                        ? 'bg-brand-600 border-brand-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Format</label>
              <div className="flex flex-wrap gap-2">
                {['Video', 'Chat', 'Project-based'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => togglePref('format', f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${
                      preferences.format.includes(f)
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Session Length</label>
              <div className="flex gap-3">
                {['Short (30-45 min)', '60 minutes', 'Long (90 min)'].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, sessionLength: l })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${
                      preferences.sessionLength === l
                        ? 'bg-amber-600 border-amber-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Step Buttons */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
          ) : <div />}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white shadow-lg shadow-brand-500/20 flex items-center space-x-1.5 ml-auto"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleComplete}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 flex items-center space-x-2 ml-auto disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Saving Profile...' : 'Complete Onboarding & Enter'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
