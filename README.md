# SkillSwap — Skill Exchange & Collaborative Learning Platform

> **"Don't just learn. Exchange."**  
> SkillSwap connects people who want to teach what they know and learn what they don't. A high-production peer-to-peer learning platform built with the MERN stack, WebRTC, Socket.IO, Monaco Editor, and Tailwind CSS.

---

## 🌟 The Core Vision

Traditional learning platforms force students to pay for generic video courses or expensive hourly tutors. **SkillSwap** reimagines learning as a reciprocal exchange economy:
- **User A** knows **Java & Algorithms** and wants to learn **Video Editing**.
- **User B** knows **Video Editing** and wants to learn **Java**.
- **SkillSwap's Weighted Matching Engine** pairs them with a high compatibility score, helps them agree on a **Learning Contract**, and provides an integrated, real-time **Learning Room** containing **1-to-1 WebRTC video, screen sharing, collaborative Monaco code editor, whiteboard canvas, notes, and chat**.

---

## 🚀 Key Features

### 1. High-Impact Landing Page
- **Hero Banner:** "Don't just learn. Exchange."
- **Animated Skill Exchange Visualizer:** Live interactive visualizer showing reciprocal skill flow between paired mentors (Java ⇄ Video Editing, Python ⇄ UI/UX, React ⇄ Growth).
- **1-Click Demo Launcher:** Instantly log in as **Abhishek (Java)**, **Rahul (Video)**, or **Elena (UI/UX)** to test peer interactions in seconds.
- **Feature Showcase:** Matching engine preview, integrated learning room tour, trust & reputation metrics, and community testimonials.

### 2. Authentication & 5-Step Onboarding Flow
- **Registration & Login:** JWT tokens with bcrypt password hashing and protected routes.
- **5-Step Onboarding Wizard:**
  1. *Basic Profile:* Name, username, avatar, headline, bio, and location.
  2. *What Can You Teach?:* Add multiple skills with proficiency levels (*Beginner, Intermediate, Advanced, Expert*), years of experience, and curriculum descriptions.
  3. *What Do You Want to Learn?:* Target proficiency levels, priorities (*High, Medium, Low*), and specific project goals.
  4. *Availability Matrix:* Select active days, preferred time slots (*Mornings, Afternoons, Evenings*), and hours per week.
  5. *Learning Preferences:* One-to-one vs. Group, format (*Video, Chat, Project-based*), and session lengths.

### 3. Weighted Skill Matching Engine
Does not display random users. Calculates a weighted compatibility score out of **100%**:
- **Mutual Skill Compatibility (50%):** Direct 2-way skill swap compatibility.
- **Availability Overlap (20%):** Matching days and active time slots.
- **Skill Level Compatibility (10%):** Mentor proficiency relative to target learner level.
- **Language Compatibility (10%):** Shared spoken languages.
- **Session Preferences Overlap (10%):** Session format and pacing alignment.
- **"Why You Matched" Breakdown:** Visual breakdown popover detailing specific match highlights.

### 4. Discover & Advanced Search (`/discover`)
- Search by skill name, username, bio, or city.
- Filter by proficiency, available day, minimum rating (e.g., ★ 4.8+), and **Online Now** status.
- User cards displaying avatars, teaching skills with star ratings, learning goals, match score badges, and direct *"Request Skill Exchange"* triggers.

### 5. Exchange Request & Counter-Offer Workflow (`/exchanges`)
- User proposes: *"I can teach you Java"*, *"I want to learn Video Editing"*, customized message, session count, duration, and milestone goals.
- Receiver actions:
  - **Accept:** Automatically creates a signed **Learning Contract** and schedules the kickoff session room!
  - **Counter Offer:** Adjust number of sessions, duration, suggested schedule, or custom terms.
  - **Decline:** Clean status history recording.

### 6. Mutual Learning Contracts
- Formal learning agreement between both users.
- Tracks completed sessions vs. total agreed sessions.
- Interactive milestones & goal checklist (real-time progress bar updates).

### 7. The Main Learning Room (`/session/:sessionId`)
The centerpiece of SkillSwap:
- **1-to-1 WebRTC Video & Audio Calling:**
  - Direct P2P video stream using `RTCPeerConnection` with STUN servers.
  - Camera on/off toggle and Microphone mute/unmute.
  - Graceful hardware permission fallback with diagnostic status alerts.
- **Screen Sharing:**
  - Powered by `navigator.mediaDevices.getDisplayMedia()`.
  - Share full desktop, window, or specific browser tab.
  - Seamlessly restores camera video stream upon stopping screen share without tearing down the peer connection.
- **Collaborative Monaco Code Editor:**
  - Multi-language support: JavaScript, TypeScript, Python, Java, C++, HTML.
  - Real-time peer code synchronization via Socket.IO.
  - Sandboxed execution runner with built-in output terminal console.
- **Collaborative Whiteboard Canvas:**
  - HTML5 canvas with pencil, eraser, color palette, stroke width, and board clearing.
  - Real-time peer drawing synchronization.
- **Collaborative Session Notes & File Sharing:**
  - Live session notes with instant save to MongoDB.
  - Multer-powered session file uploads (PDFs, docs, code files) with download links.
- **Real-Time Room Chat:**
  - Instant messaging with timestamps and typing indicators.

### 8. Session Completion & High-Trust Reputation
- **Post-Session Modal:** Confetti celebrations, 1-5 star ratings, what was learned, what was taught, and public review submission.
- **Reputation Metrics:** Verified Teaching Rating, Learning Rating, 99% Reliability Score, Response Rate, and Streak Counters.
- **Earned Badges:** 🏆 *Top Mentor*, 🔥 *Active Streak*, 🎯 *Reliable Partner*.

### 9. Admin Control & Moderation (`/admin`)
- Accessible by users with `role: "ADMIN"`.
- Recharts analytics: 7-day session activity, exchange volume, and top traded skills.
- Member management: View user registry and toggle suspensions.
- Safety queue: Review reports and moderate inappropriate behavior.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Socket.IO Client, Monaco Editor (`@monaco-editor/react`), Lucide React, Recharts, Canvas Confetti |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose, Socket.IO, JWT, bcryptjs, Multer, Helmet, CORS, Morgan |
| **Real-Time** | Socket.IO (WebRTC signaling, chat, code sync, whiteboard sync, presence) |
| **Media Stream** | WebSockets for WebRTC signaling; Direct P2P `RTCPeerConnection` for video, audio, and screen sharing |

---

## 📂 Project Structure

```text
SkillSwap/
├── client/
│   ├── src/
│   │   ├── components/       # Navbar, Footer, NotificationDropdown, MatchScoreBadge, Modals...
│   │   ├── pages/            # LandingPage, Discover, Dashboard, LearningRoom, Exchanges, Admin...
│   │   ├── context/          # AuthContext, SocketContext
│   │   ├── services/         # Axios API client (api.js)
│   │   ├── styles/           # Tailwind and custom animations
│   │   ├── App.jsx           # App routing and protected route wrappers
│   │   ├── main.jsx          # React DOM entry point
│   │   └── index.css         # Glassmorphism utilities, dark gradients, typography
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── .env.example
│
├── server/
│   ├── config/               # db.js (MongoDB Mongoose connection)
│   ├── controllers/          # auth, user, matching, exchange, session, contract, admin...
│   ├── middleware/           # auth.js (JWT protect, adminOnly), upload.js (Multer)
│   ├── models/               # User, Skill, ExchangeRequest, LearningContract, Session, Review, Report...
│   ├── routes/               # RESTful API route definitions
│   ├── services/             # matchingService.js (Weighted scoring engine)
│   ├── sockets/              # Socket.IO signaling, chat, whiteboard, code sync
│   ├── scripts/              # seed.js (Rich demo database seeder)
│   ├── uploads/              # Shared session files
│   ├── server.js             # Express app entry & HTTP server
│   ├── package.json
│   └── .env.example
│
├── package.json              # Monorepo root scripts
└── README.md
```

---

## ⚙️ Environment Variables

### Server (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/skillswap
JWT_SECRET=skillswap_super_secret_jwt_key_2026_xyz
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Client (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 💻 Getting Started Locally

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **MongoDB** running locally on port 27017 (`mongodb://127.0.0.1:27017`)

### 2. Installation
From the root directory:
```bash
# Install backend and frontend dependencies
npm run install:all
```

Or individually:
```bash
cd server && npm install
cd ../client && npm install
```

### 3. Seed Realistic Demo Data
Populates skills, realistic user personas, active exchange proposals, contracts, and scheduled learning rooms:
```bash
cd server
npm run seed
```

### 4. Running the Application
Open two terminal tabs:

**Terminal 1 (Backend Server):**
```bash
cd server
npm start
# Server listens on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

Now open **http://localhost:5173** in your browser.

---

## 👥 Demo Profiles for Dual-Browser Testing

SkillSwap features a **1-Click Demo Switcher** in the navigation bar and on the login page:

| User | Credentials | Teaching Focus | Wants to Learn |
|---|---|---|---|
| **Abhishek Sharma** | `abhishek` / `Password123!` | Java (Expert), DSA | Video Editing, Finance |
| **Rahul Verma** | `rahul` / `Password123!` | Video Editing (Expert), DaVinci | Java, DSA |
| **Alex Rivera** | `alex` / `Password123!` | Python, Machine Learning | UI/UX Design, Figma |
| **Elena Rostova** | `elena` / `Password123!` | UI/UX Design, Figma | Python, Machine Learning |
| **Admin Moderator** | `admin` / `Password123!` | Platform Moderator | — |

### Dual-Window Testing Walkthrough
1. Open **Browser Window 1** (e.g., standard Chrome): Log in as **Abhishek**.
2. Open **Browser Window 2** (e.g., Incognito or Firefox): Log in as **Rahul**.
3. In Window 1, navigate to **Dashboard** or **Sessions** and click **"Join Room Now"** (Room: `SWAP-DEMO-ROOM`).
4. In Window 2, navigate to **Sessions** and enter the same room.
5. Watch the **WebRTC video and audio streams** connect directly.
6. Type code in the **Monaco Code Editor** or sketch on the **Whiteboard** — edits synchronize bidirectionally in real-time over Socket.IO!

---

## 🔒 Security & Architecture Standards
- **Zero Plain-Text Passwords:** Hashed with `bcryptjs` salt rounds.
- **Strict JWT Token Verification:** Validates user existence, token expiration, and suspension status on every protected route.
- **Role-Based Access Control:** Separate middleware checks for standard users and administrators.
- **Media Privacy:** Audio and video streams are transmitted **strictly via WebRTC peer connections**; media never touches Socket.IO servers.
- **Hardened HTTP Headers:** Protected with `helmet` and scoped CORS policies.

---

## 📄 License
This project is licensed under the MIT License.
