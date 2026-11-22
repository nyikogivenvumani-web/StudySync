# Business Plan & MVP Specification: StudySync

## 1. One-Sentence Solution
**StudySync** pairs university and distance-learning students taking the same modules into silent, camera-on live study rooms (up to 20 seats) with synced focus timers, shared checklists, and a schedule coordination forum so isolated learners finish their coursework on time.

---

## 2. The Problem
* **Who Has It:** Distance-learning students (e.g., UNISA and online learners), off-campus commuter students, and first-generation university students studying without an on-campus peer network.
* **How Often:** Daily during the semester and acutely during assignment deadlines and exam periods (4–6 days per week).
* **What It Costs Them Today:**
  * **Financial Cost:** Failing and repeating a single university module in South Africa costs roughly **R2,000–R5,500+ in re-registration fees**, plus extra months of data, transport, and delayed graduation/earnings.
  * **Time & Emotional Cost:** Students lose 2–3 hours per evening to procrastination, distractions, and searching scattered WhatsApp or Telegram groups for reliable study partners or updated session times.

---

## 3. The Customer
* **Who Uses It (`student` and `admin` roles):**
  * **End Users (`student`):** Undergraduate and postgraduate distance-learning or commuter students enrolled in structured modules (e.g., `MAT2611`, `COS1511`, `ECS1501`) who need daily body-doubling accountability and reliable module peers.
  * **Moderators / Student Leads (`admin`):** Class representatives, peer tutors, and platform administrators who verify module catalogs, moderate forums, and keep rooms active and safe.
* **Who Pays:**
  * **Direct Consumer (B2C):** Students (or parents/sponsors funding their studies) who pay for private study groups, extended focus analytics, and custom session tools once they experience improved daily consistency.
  * **Institutional Buyers (B2B):** Universities, student resident networks, bursary programs (e.g., NSFAS-aligned student support units, corporate bursary administrators), and private colleges that pay per cohort to improve module pass rates and reduce student dropout.

---

## 4. Impact & How We Measure It
* **What Changes When We Succeed:** Students who previously studied alone in isolation gain an on-demand, distraction-free study table with peers taking the exact same exam—turning inconsistent solo cramming into structured daily study habits and higher pass rates.
* **Key Success Metrics:**
  1. **Weekly Active Study Minutes per Student** (target: $\ge 180\text{ minutes/week}$ per active user).
  2. **Session Completion Rate** (percentage of joined study sessions completed through the end of the Pomodoro block).
  3. **7-Day & 30-Day Retention Rate** (students returning to a module room at least 3 times per week).
  4. **Group Coordination Velocity** (schedule updates and resource threads resolved in the module forum without external app switching).

---

## 5. Business Model & Pricing (How We Make Money)
* **Freemium Student Subscription (B2C):**
  * **Free Tier (R0/month):** Join public module study rooms (up to 20 participants), use standard 50/10 Pomodoro timers, collaborate on shared session checklists, and post in module forums.
  * **StudySync Pro (R59/month or R499/year):** Create private invite-only study groups (up to 20 seats), customize focus/break timer intervals, unlock weekly study-streak analytics and exam countdown dashboards, and get priority module buddy matching.
* **Institutional Cohort Licensing (B2B):**
  * **Campus / Bursary Plan (R15 per student/month, billed per semester):** Branded module rooms, verified tutor/admin moderation controls, and anonymized cohort engagement reports for universities, student housing providers, and bursary sponsors.

---

## 6. Go-To-Market: Getting Our First 100 Customers
1. **Hyper-Targeted Module Seeding (Users 1–30):** Launch with 3–5 high-enrollment, high-failure-rate first- and second-year modules (such as Calculus, Programming, and Economics). Recruit 30 students directly from existing campus study groups and peer-tutoring circles to run nightly 18:00–21:00 silent study sprints.
2. **Peer Lead & Class Rep Partnerships (Users 31–70):** Onboard 5–10 module class representatives and peer tutors as `admin` leads who host recurring evening study rooms and post timetable updates exclusively inside StudySync's module forum.
3. **Built-In Group Invite Loop (Users 71–100):** Every silent study room holds up to 20 seats and includes a one-click room invite link; students naturally invite 2–3 classmates from their module group chats so they can study together on camera without voice distractions.

---

## 7. Competition & Why We Win
| Alternative | How Students Use It Today | Why It Falls Short | Why StudySync Wins |
| :--- | :--- | :--- | :--- |
| **WhatsApp / Telegram Groups** | Finding study partners and posting schedule updates | Noisy, endless off-topic chat, buried schedule changes, zero live accountability | Dedicated module forum for clean schedule updates + instant transition into a live silent room |
| **Zoom / Google Meet / Discord** | DIY group study calls | Requires manual link sharing, awkward mic interruptions, high bandwidth HD video | One-click module lobbies, **mics locked off by default**, and bandwidth-capped video tiles |
| **Focusmate / Forest / Solo Timers** | Personal Pomodoro timers or random 1-on-1 pairing | Pairs you with strangers doing unrelated work or leaves you completely alone | Pairs you specifically with **peers taking your exact module** in a 20-seat quiet library grid |

---

## 8. The App: Must-Have Day-One Features
To launch a real, investor-ready full-stack product by **Wednesday, 25 November 2026 at 15:30 SAST**, Day 1 focuses strictly on five core features backed by real hosted data:

1. **Authentication & Two Role-Based Accounts (`student` & `admin`):**
   * Email/password sign-up and login via Supabase Auth.
   * Backend Row-Level Security (RLS) and Express middleware enforcing strict separation between `student` actions and `admin` moderation/management controls.
2. **Module Profile & Peer/Room Discovery:**
   * Students select their institution and active module codes (e.g., `MAT2611`, `COS1511`) to filter live rooms and match with classmates studying the same subject.
3. **20-Person Silent Live Study Rooms:**
   * Hard backend-enforced capacity limit of **20 participants** per room.
   * **Quiet Mode:** Microphones disabled at the room level (`audioSource: false`) with low-bandwidth camera tiles (`240p`/`360p`) so 20 feeds run smoothly even on mobile/home data.
   * **Synced Pomodoro Timer & Live Status Tags:** Shared focus/break timer plus per-student status tags (e.g., *"Chapter 1 – Differential Equations"*).
4. **Real-Time Shared Session Checklist:**
   * Inside each study room, participants add and check off session milestones in real time so everyone sees progress during the focus block.
5. **Module Group Forum (Schedule & Resource Noticeboard):**
   * Persistent module threads where students and admins post session time changes (e.g., moving a 16:00 session to 18:00), pin announcements, and share study notes.

---

## 9. Technical Architecture & Stack
* **Frontend:** React + TypeScript, responsive mobile and desktop UI matching Stitch designs, using **Lucide Icons** (`lucide-react`) exclusively for all iconography (zero emojis).
* **Backend API:** Node.js + Express (TypeScript) enforcing room capacity rules (`<= 20`), role-protected endpoints, validation, and live video room token generation.
* **Database, Auth & Realtime:** Hosted **Supabase** (PostgreSQL with backend RLS policies, Supabase Auth, and Supabase Realtime subscriptions for checklists, room presence, and forum updates).
* **Live Video Transport:** WebRTC SDK (Daily.co or LiveKit) configured for silent video-only study grids.
* **Testing & CI:** Automated unit and integration test suite running alongside lint, typecheck, and production build in GitHub Actions on every PR.

---

## 10. Phased Implementation Plan (Deadline: Wednesday, 25 Nov 2026 at 15:30 SAST)
* **Phase 1 — Foundation, Designs & CI (Sunday, 22 Nov):**
  * Complete `BUSINESS.md`, `docs/PRD.md`, Stitch designs (`docs/designs/`), and `IMPLEMENTATION_PLAN.md`.
  * Set up React (TypeScript), Node.js/Express (TypeScript), Supabase schema + RLS policies, and GitHub Actions CI (`lint`, `typecheck`, `test`, `build`).
* **Phase 2 — Auth, Roles (`student` & `admin`), Forum & Room Shell (Monday, 23 Nov):**
  * Implement authentication, `student` and `admin` role enforcement (RLS + Express middleware), module discovery, room creation (`<= 20` cap), shared checklist, and module forum.
* **Phase 3 — Silent Live Video Rooms & TDD Suite (Tuesday, 24 Nov):**
  * Integrate silent WebRTC study rooms (mics off, synced Pomodoro timer, live status tags), complete automated tests, and deploy live frontend + backend connected to hosted Supabase.
* **Phase 4 — Polish, README & Loom Freeze (Wednesday, 25 Nov by 13:30 SAST):**
  * Verify mobile and desktop responsiveness against Stitch designs, finalize `README.md` (with live URL, Stitch link, `student` & `admin` test logins, screenshots, and doc links), and record the $\le 5$-minute investor pitch + live demo Loom before the **15:30 SAST** deadline.