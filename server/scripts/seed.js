import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Skill } from '../models/Skill.js';
import { ExchangeRequest } from '../models/ExchangeRequest.js';
import { LearningContract } from '../models/LearningContract.js';
import { Session } from '../models/Session.js';
import { Notification } from '../models/Notification.js';
import { Review } from '../models/Review.js';

dotenv.config();

const seed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillswap';
    console.log(`Connecting to MongoDB at: ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Skill.deleteMany({}),
      ExchangeRequest.deleteMany({}),
      LearningContract.deleteMany({}),
      Session.deleteMany({}),
      Notification.deleteMany({}),
      Review.deleteMany({})
    ]);

    console.log('Seeding Skills...');
    const skillsList = [
      { name: 'Java', category: 'Software & Tech', icon: 'Code', color: 'orange', popularity: 45 },
      { name: 'DSA', category: 'Software & Tech', icon: 'Binary', color: 'blue', popularity: 40 },
      { name: 'Video Editing', category: 'Video & Animation', icon: 'Video', color: 'purple', popularity: 48 },
      { name: 'Python', category: 'Software & Tech', icon: 'Terminal', color: 'emerald', popularity: 50 },
      { name: 'Machine Learning', category: 'Data & AI', icon: 'BrainCircuit', color: 'violet', popularity: 42 },
      { name: 'UI/UX Design', category: 'Design & Creative', icon: 'Palette', color: 'pink', popularity: 46 },
      { name: 'Figma', category: 'Design & Creative', icon: 'Layout', color: 'rose', popularity: 38 },
      { name: 'React', category: 'Software & Tech', icon: 'Atom', color: 'cyan', popularity: 55 },
      { name: 'TypeScript', category: 'Software & Tech', icon: 'FileCode', color: 'indigo', popularity: 39 },
      { name: 'Finance', category: 'Business & Finance', icon: 'TrendingUp', color: 'emerald', popularity: 28 },
      { name: 'Public Speaking', category: 'Personal Development', icon: 'Mic', color: 'amber', popularity: 25 },
      { name: 'Music Production', category: 'Music & Audio', icon: 'Headphones', color: 'purple', popularity: 22 }
    ];
    await Skill.insertMany(skillsList);

    console.log('Seeding Users...');
    // Create users individually to trigger password hashing pre-save hooks
    const userAbhishek = await User.create({
      name: 'Abhishek Sharma',
      username: 'abhishek',
      email: 'abhishek@example.com',
      password: 'Password123!',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      headline: 'Senior Backend Engineer • Java & Algorithms Specialist',
      bio: 'Staff engineer with 6+ years in distributed systems and JVM performance tuning. Passionate about teaching clean code architecture and mastering data structures.',
      location: 'Bengaluru, India',
      timezone: 'UTC+05:30',
      skillsTeaching: [
        {
          skill: 'Java',
          proficiency: 'Expert',
          yearsExperience: 6,
          description: 'Core Java, Multithreading, Memory Model, Spring Boot, Performance Optimization',
          rating: 4.9
        },
        {
          skill: 'DSA',
          proficiency: 'Expert',
          yearsExperience: 5,
          description: 'Graphs, Dynamic Programming, Trees, Binary Search, Big-O analysis',
          rating: 4.8
        }
      ],
      skillsLearning: [
        {
          skill: 'Video Editing',
          targetProficiency: 'Intermediate',
          priority: 'High',
          notes: 'Want to produce high-production YouTube tutorials using Premiere Pro/DaVinci Resolve.'
        },
        {
          skill: 'Finance',
          targetProficiency: 'Beginner',
          priority: 'Medium',
          notes: 'Portfolio theory and equity valuation fundamentals.'
        }
      ],
      availability: {
        days: ['Monday', 'Wednesday', 'Saturday', 'Sunday'],
        timeSlots: ['Evenings (6 PM - 9 PM)', 'Weekends Flexible'],
        hoursPerWeek: 6,
        timezone: 'UTC+05:30'
      },
      preferences: {
        sessionType: ['One-to-one'],
        format: ['Video', 'Project-based'],
        pacing: 'Project-based',
        sessionLength: '60 minutes',
        languages: ['English', 'Hindi']
      },
      ratings: {
        teaching: 4.9,
        learning: 4.8,
        reliability: 99,
        responseRate: 98,
        sessionsCompleted: 24,
        reviewsCount: 18
      },
      streakDays: 7,
      badges: [
        { id: 'top-mentor', name: 'Top Mentor', icon: '🏆', description: 'Over 20+ sessions rated 4.9+ in Java' },
        { id: 'streak-7', name: '7-Day Streak', icon: '🔥', description: 'Consistent learner for 7 straight days' },
        { id: 'reliable', name: 'Reliable Partner', icon: '🎯', description: '99% on-time attendance score' }
      ],
      role: 'USER',
      onboardingCompleted: true,
      isOnline: true
    });

    const userRahul = await User.create({
      name: 'Rahul Verma',
      username: 'rahul',
      email: 'rahul@example.com',
      password: 'Password123!',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
      headline: 'Commercial Video Editor & YouTube Strategist',
      bio: 'Full-time creative editor with 4+ years editing for top creators. Excited to trade video storytelling & DaVinci Resolve skills to learn Java backend fundamentals!',
      location: 'Mumbai, India',
      timezone: 'UTC+05:30',
      skillsTeaching: [
        {
          skill: 'Video Editing',
          proficiency: 'Expert',
          yearsExperience: 4,
          description: 'Pacing, color grading, sound design, DaVinci Resolve, Premiere Pro workflow',
          rating: 4.9
        }
      ],
      skillsLearning: [
        {
          skill: 'Java',
          targetProficiency: 'Intermediate',
          priority: 'High',
          notes: 'Want to build enterprise backends and solve coding interview questions.'
        },
        {
          skill: 'DSA',
          targetProficiency: 'Beginner',
          priority: 'High',
          notes: 'Master recursion and array algorithms.'
        }
      ],
      availability: {
        days: ['Monday', 'Wednesday', 'Saturday'],
        timeSlots: ['Evenings (6 PM - 9 PM)'],
        hoursPerWeek: 5,
        timezone: 'UTC+05:30'
      },
      preferences: {
        sessionType: ['One-to-one'],
        format: ['Video', 'Project-based'],
        pacing: 'Project-based',
        sessionLength: '60 minutes',
        languages: ['English', 'Hindi']
      },
      ratings: {
        teaching: 4.9,
        learning: 4.7,
        reliability: 98,
        responseRate: 95,
        sessionsCompleted: 19,
        reviewsCount: 14
      },
      streakDays: 5,
      badges: [
        { id: 'creative-star', name: 'Creative Star', icon: '✨', description: 'Crafted 10+ polished editing exchanges' },
        { id: 'fast-responder', name: 'Fast Responder', icon: '⚡', description: 'Replies within 15 minutes' }
      ],
      role: 'USER',
      onboardingCompleted: true,
      isOnline: true
    });

    const userAlex = await User.create({
      name: 'Alex Rivera',
      username: 'alex',
      email: 'alex@example.com',
      password: 'Password123!',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      headline: 'ML Engineer • Python Data Scientist',
      bio: 'Machine learning practitioner specializing in NLP and PyTorch. Looking to trade ML/Python knowledge for top-tier UI/UX and product design skills.',
      location: 'San Francisco, USA',
      timezone: 'UTC-07:00',
      skillsTeaching: [
        {
          skill: 'Python',
          proficiency: 'Expert',
          yearsExperience: 5,
          description: 'Pythonic patterns, NumPy, Pandas, FastAPIs',
          rating: 4.8
        },
        {
          skill: 'Machine Learning',
          proficiency: 'Advanced',
          yearsExperience: 3,
          description: 'Supervised/Unsupervised models, Neural networks, PyTorch, Hugging Face',
          rating: 4.7
        }
      ],
      skillsLearning: [
        {
          skill: 'UI/UX Design',
          targetProficiency: 'Intermediate',
          priority: 'High',
          notes: 'Need to design intuitive SaaS interfaces for AI tools.'
        },
        {
          skill: 'Figma',
          targetProficiency: 'Intermediate',
          priority: 'High',
          notes: 'Design systems, auto-layout, interactive prototypes.'
        }
      ],
      availability: {
        days: ['Tuesday', 'Thursday', 'Saturday'],
        timeSlots: ['Mornings (9 AM - 12 PM)', 'Evenings (6 PM - 9 PM)'],
        hoursPerWeek: 4,
        timezone: 'UTC-07:00'
      },
      preferences: {
        sessionType: ['One-to-one'],
        format: ['Video', 'Chat'],
        pacing: 'Project-based',
        sessionLength: '60 minutes',
        languages: ['English']
      },
      ratings: {
        teaching: 4.8,
        learning: 4.9,
        reliability: 97,
        responseRate: 94,
        sessionsCompleted: 15,
        reviewsCount: 11
      },
      streakDays: 4,
      badges: [
        { id: 'ai-pioneer', name: 'AI Pioneer', icon: '🧠', description: 'Conducted 10+ hands-on ML workshops' }
      ],
      role: 'USER',
      onboardingCompleted: true,
      isOnline: false
    });

    const userElena = await User.create({
      name: 'Elena Rostova',
      username: 'elena',
      email: 'elena@example.com',
      password: 'Password123!',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      headline: 'Product Designer & Design Systems Lead',
      bio: 'Lead UX designer with 6 years experience crafting web and mobile interfaces. Eager to master Python & Machine learning to design AI-driven products.',
      location: 'Berlin, Germany',
      timezone: 'UTC+02:00',
      skillsTeaching: [
        {
          skill: 'UI/UX Design',
          proficiency: 'Expert',
          yearsExperience: 6,
          description: 'Design thinking, heuristics, wireframing, UX research, typography',
          rating: 5.0
        },
        {
          skill: 'Figma',
          proficiency: 'Expert',
          yearsExperience: 5,
          description: 'Variables, Auto-layout, Design tokens, Interactive component variants',
          rating: 4.9
        }
      ],
      skillsLearning: [
        {
          skill: 'Python',
          targetProficiency: 'Intermediate',
          priority: 'High',
          notes: 'Want to code prototype scripts and automate design workflows.'
        },
        {
          skill: 'Machine Learning',
          targetProficiency: 'Beginner',
          priority: 'Medium',
          notes: 'Understand foundational AI concepts for product roadmapping.'
        }
      ],
      availability: {
        days: ['Tuesday', 'Thursday', 'Saturday'],
        timeSlots: ['Evenings (6 PM - 9 PM)'],
        hoursPerWeek: 5,
        timezone: 'UTC+02:00'
      },
      preferences: {
        sessionType: ['One-to-one'],
        format: ['Video', 'Project-based'],
        pacing: 'Project-based',
        sessionLength: '60 minutes',
        languages: ['English', 'German']
      },
      ratings: {
        teaching: 4.95,
        learning: 4.85,
        reliability: 100,
        responseRate: 99,
        sessionsCompleted: 22,
        reviewsCount: 17
      },
      streakDays: 9,
      badges: [
        { id: 'top-mentor', name: 'Top Mentor', icon: '🏆', description: 'Ranked in top 1% design mentors' },
        { id: 'perfect-score', name: '5-Star Guide', icon: '⭐', description: 'Over 15 five-star reviews' }
      ],
      role: 'USER',
      onboardingCompleted: true,
      isOnline: true
    });

    const userMarcus = await User.create({
      name: 'Marcus Vance',
      username: 'marcus',
      email: 'marcus@example.com',
      password: 'Password123!',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      headline: 'Full-Stack React & Node Architect',
      bio: 'Frontend enthusiast focused on web animations, Next.js, and Tailwind CSS. Trading modern web dev knowledge for Cloud and DevOps architecture.',
      location: 'London, UK',
      timezone: 'UTC+01:00',
      skillsTeaching: [
        {
          skill: 'React',
          proficiency: 'Expert',
          yearsExperience: 5,
          description: 'React 19, hooks, custom state management, performance rendering',
          rating: 4.9
        },
        {
          skill: 'TypeScript',
          proficiency: 'Advanced',
          yearsExperience: 4,
          description: 'Generics, utility types, strict typing best practices',
          rating: 4.8
        }
      ],
      skillsLearning: [
        {
          skill: 'Java',
          targetProficiency: 'Intermediate',
          priority: 'Medium',
          notes: 'Spring framework microservices'
        }
      ],
      availability: {
        days: ['Monday', 'Wednesday', 'Friday'],
        timeSlots: ['Mornings (9 AM - 12 PM)'],
        hoursPerWeek: 4,
        timezone: 'UTC+01:00'
      },
      preferences: {
        sessionType: ['One-to-one'],
        format: ['Video', 'Project-based'],
        languages: ['English']
      },
      ratings: {
        teaching: 4.8,
        learning: 4.7,
        reliability: 96,
        responseRate: 92,
        sessionsCompleted: 12,
        reviewsCount: 9
      },
      role: 'USER',
      onboardingCompleted: true,
      isOnline: false
    });

    const userAdmin = await User.create({
      name: 'Admin Moderator',
      username: 'admin',
      email: 'admin@skillswap.com',
      password: 'Password123!',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      headline: 'SkillSwap Platform Administrator',
      bio: 'Managing community trust, peer safety, and platform health.',
      location: 'SkillSwap HQ',
      timezone: 'UTC',
      skillsTeaching: [],
      skillsLearning: [],
      role: 'ADMIN',
      onboardingCompleted: true,
      isOnline: true
    });

    console.log('Seeding Exchange Requests & Learning Contract...');
    // Create an active Exchange between Abhishek and Rahul
    const exchangeAR = await ExchangeRequest.create({
      sender: userAbhishek._id,
      receiver: userRahul._id,
      teachingSkill: 'Java',
      learningSkill: 'Video Editing',
      message: 'Hey Rahul! I saw your stunning video editing showcase. I can guide you through Java OOP & algorithms in exchange for hands-on DaVinci Resolve color grading & pacing.',
      proposedSessions: 6,
      proposedDurationMinutes: 60,
      learningGoals: [
        'Java fundamentals & OOP architecture',
        'DaVinci Resolve timeline workflow & cuts',
        'Java Collections Framework & Memory model',
        'Color grading, LUTs, and audio mixing',
        'Collaborative mini-project build & review'
      ],
      status: 'ACCEPTED',
      statusHistory: [
        { status: 'PENDING', changedBy: userAbhishek._id, note: 'Initial proposal' },
        { status: 'ACCEPTED', changedBy: userRahul._id, note: 'Accepted! Excited to swap!' }
      ]
    });

    const contractAR = await LearningContract.create({
      exchangeRequest: exchangeAR._id,
      userA: userAbhishek._id,
      userB: userRahul._id,
      skillA: 'Java',
      skillB: 'Video Editing',
      totalSessions: 6,
      completedSessions: 1,
      sessionDurationMinutes: 60,
      goals: [
        { title: 'Master Java OOP & Polymorphism', completed: true, completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { title: 'Video Editing Pacing & B-roll Storytelling', completed: true, completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { title: 'Collections & Stream API in Java', completed: false },
        { title: 'Color Grading & Sound Design in Resolve', completed: false },
        { title: 'Build Full Stack Project & Final Showcase Video', completed: false }
      ],
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE'
    });

    exchangeAR.createdContract = contractAR._id;
    await exchangeAR.save();

    // Create a ready-to-test Session between Abhishek and Rahul
    const liveSessionRoomCode = 'SWAP-DEMO-ROOM';
    const scheduledTime = new Date(Date.now() - 10 * 60 * 1000); // Started 10 mins ago (active)
    const endTime = new Date(Date.now() + 50 * 60 * 1000);

    const activeSession = await Session.create({
      title: 'Java OOP Patterns ⇄ Video Editing Color Theory Swap',
      description: 'Session 2 of 6: Diving into Java Collections and hands-on video color grading',
      contract: contractAR._id,
      participants: [userAbhishek._id, userRahul._id],
      host: userAbhishek._id,
      skillTaught: 'Java',
      scheduledStartTime: scheduledTime,
      scheduledEndTime: endTime,
      actualStartTime: scheduledTime,
      durationMinutes: 60,
      status: 'ACTIVE',
      roomCode: liveSessionRoomCode,
      notes: `# Live Exchange Notes

### Today's Goals:
- [x] Java Polymorphism recap
- [ ] Review HashMap internal hashing implementation
- [ ] DaVinci Resolve 3-way color balance walkthrough

### Java Code snippet to review:
\`\`\`java
Map<String, Integer> map = new HashMap<>();
map.put("key", 42);
\`\`\`
`,
      codeEditorState: {
        language: 'java',
        code: `// SkillSwap Java ⇄ Video Editing Exchange Session
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from SkillSwap Room!");
        System.out.println("Trading Java for Video Editing skills.");
    }
}
`
      }
    });

    // Create an upcoming session for tomorrow
    await Session.create({
      title: 'DaVinci Resolve Node Graph Deep Dive',
      description: 'Session 3 of 6: Rahul leads video color grading nodes',
      contract: contractAR._id,
      participants: [userAbhishek._id, userRahul._id],
      host: userRahul._id,
      skillTaught: 'Video Editing',
      scheduledStartTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      scheduledEndTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
      durationMinutes: 60,
      status: 'SCHEDULED',
      roomCode: 'SWAP-NEXT-SESSION'
    });

    // Create a pending exchange between Alex and Elena
    await ExchangeRequest.create({
      sender: userAlex._id,
      receiver: userElena._id,
      teachingSkill: 'Python',
      learningSkill: 'UI/UX Design',
      message: 'Hi Elena! I love your portfolio designs. I can teach you Python automation & AI integration in exchange for a masterclass on Figma Design Systems.',
      proposedSessions: 4,
      proposedDurationMinutes: 60,
      learningGoals: [
        'Figma auto-layout & design tokens',
        'Python scripts for design data automation',
        'Prototyping AI features with clean UX'
      ],
      status: 'PENDING'
    });

    // Create a previous review
    await Review.create({
      contract: contractAR._id,
      reviewer: userRahul._id,
      reviewee: userAbhishek._id,
      role: 'STUDENT',
      skill: 'Java',
      rating: 5,
      feedback: 'Abhishek is an outstanding mentor! He explained Java memory allocation and polymorphic dispatch with visual diagrams that made it click immediately.',
      communicationScore: 5,
      reliabilityScore: 5
    });

    await Review.create({
      contract: contractAR._id,
      reviewer: userAbhishek._id,
      reviewee: userRahul._id,
      role: 'STUDENT',
      skill: 'Video Editing',
      rating: 5,
      feedback: 'Rahul gave incredible actionable feedback on video pacing and audio levels. In one hour, my tutorial editing quality skyrocketed!',
      communicationScore: 5,
      reliabilityScore: 5
    });

    // Create some initial notifications
    await Notification.create({
      recipient: userAbhishek._id,
      sender: userRahul._id,
      type: 'SESSION_STARTED',
      title: 'Live Session in Progress 🟢',
      message: 'Your collaborative learning room "Java OOP Patterns ⇄ Video Editing" is active now!',
      link: `/session/${liveSessionRoomCode}`
    });

    await Notification.create({
      recipient: userRahul._id,
      sender: userAbhishek._id,
      type: 'SESSION_STARTED',
      title: 'Live Session in Progress 🟢',
      message: 'Abhishek has entered the learning room. Click to join video call!',
      link: `/session/${liveSessionRoomCode}`
    });

    console.log('--- SEED DATA SUMMARY ---');
    console.log(`Demo Users Created:`);
    console.log(`  1. Abhishek Sharma (abhishek / Password123!) -> Java, DSA <-> Wants Video Editing`);
    console.log(`  2. Rahul Verma (rahul / Password123!) -> Video Editing <-> Wants Java`);
    console.log(`  3. Alex Rivera (alex / Password123!) -> Python, ML <-> Wants UI/UX`);
    console.log(`  4. Elena Rostova (elena / Password123!) -> UI/UX, Figma <-> Wants Python`);
    console.log(`  5. Admin Moderator (admin@skillswap.com / Password123!)`);
    console.log(`Live Session Room Code: ${liveSessionRoomCode}`);
    console.log('Seeding finished successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seed();
