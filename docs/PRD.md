# StudySync — Product Requirements Document (PRD)

**Document status:** MVP specification (lightweight scope)
**Product:** StudySync
**Version:** 1.2
**Source:** Business Plan & MVP Specification: StudySync, plus product-owner answers to the Stitch design questions (Section 15)
**Target MVP deadline:** Wednesday, 25 November 2026, 15:30 SAST

**Changes in v1.2:** to keep the MVP deliverable by the deadline, four feature areas from v1.1 are **deferred to v2** (Section 3.3): camera enforcement and participant removal, room moderators with scheduled sessions and automatic expiry, forum file attachments, and dark mode. Requirements changed by this are marked **[v1.2]**. All other v1.1 decisions stand.

---

## 1. Product overview

StudySync is a study-accountability platform for university and distance-learning students. It pairs students taking the same modules in silent, camera-on live study rooms of up to 20 participants. Each room provides a synchronized focus timer, shared session checklist, and live study-status tags. Module forums provide a persistent place to coordinate schedules, publish announcements, and share study information.

The MVP is intended to reduce the isolation and inconsistency experienced by distance-learning, commuter, and other students without a reliable on-campus study network.

## 2. Problem statement

The target students often study without a dependable peer network. They spend time looking for suitable study partners and current session information across scattered messaging groups. Distractions and inconsistent study routines can reduce productive study time and make assignment and examination periods harder to manage.

The business specification identifies the following costs and pain points:

- Re-registering for a failed South African university module may cost approximately R2,000–R5,500 or more, excluding additional data, transport, and delayed graduation costs.
- Students may lose two to three hours in an evening to procrastination, distractions, and searching for study partners or updated session times.
- Existing group chats can become noisy, while general-purpose meeting tools require manual coordination and may introduce unnecessary audio interruptions and bandwidth demands.

## 3. Product goals

### 3.1 MVP goals

1. Allow students to register, sign in, reset a forgotten password, and use the platform according to their assigned role.
2. Let students select an institution and active module codes, and request modules missing from the catalogue.
3. Help students discover study rooms associated with their modules.
4. Provide silent, video-only study rooms with a hard maximum capacity of 20 participants, created and closed by admins. **[v1.2]**
5. Keep the Pomodoro timer and session checklist synchronized for room participants.
6. Let students and admins coordinate schedules and share information in text-based module forums. **[v1.2]**
7. Provide admins with catalogue management, room management, timer control, and forum moderation capabilities.

### 3.2 Out of scope for the MVP

- Paid subscriptions, payment processing, and billing.
- Institutional cohort licensing, institutional branding, and cohort reporting.
- Advanced study analytics, streak dashboards, and exam countdown dashboards.
- Priority buddy matching and complete automated matching beyond module-based discovery.
- Voice chat or microphone-enabled rooms.
- In-room text chat, screen sharing, reactions, recording, and private messaging.
- A mobile-native application.
- AI tutoring, automated note generation, or automated assessment.
- Social login, phone login, and passwordless login.

### 3.3 Deferred to v2 **[v1.2]**

The product owner has decided these will be handled in v2. They are not part of the MVP and should not be built, designed, or tested now. The v1.1 decisions that applied to them are kept in Section 15 for reference.

| Deferred area | What it covered | Interim MVP behaviour |
|---|---|---|
| Camera enforcement and participant removal | Camera mandatory during focus blocks, camera exceptions, reporting a technical issue, removing (kicking) a participant | Rooms are video-only and participants are expected to join with their camera on, but this is not enforced. A participant whose camera is denied or unavailable sees a clear message and appears as a placeholder tile. Admins cannot remove participants in the MVP. |
| Room moderators, scheduling, and expiry | Students nominated as room moderators (max two), scheduled sessions, automatic expiry when everyone leaves | Rooms are created and closed only by admins. Rooms stay open until an admin closes them. Only admins control the timer. |
| Forum file attachments | Attaching study notes/files to posts, file storage | Forum posts are text-only. Students can share links or information in post text. |
| Dark mode | Light and dark themes | A single theme, as defined in the approved Stitch style guide. |

## 4. Users and roles

### 4.1 Student (`student`)

A student is an undergraduate or postgraduate learner, including distance-learning and commuter students.

Students need to be able to:

- Create an account, sign in, and reset their password using email.
- Select an institution and active modules, and request a module missing from the catalogue.
- Discover module study rooms.
- Join an available room, subject to the 20-person capacity limit.
- Participate in silent video study sessions.
- View and update their own study-status tag.
- View and interact with the shared room checklist and see the synchronized timer.
- Read and contribute to module forums (text posts) and edit their own posts.

### 4.2 Admin (`admin`)

An admin may be a class representative, peer tutor, student lead, moderator, or platform administrator. All admin types share the single `admin` role in the MVP.

Admins can:

- Create, edit, verify, and archive/delete institution and module records.
- Review and approve or reject student module requests.
- Create and close study rooms **[v1.2]**.
- Control room timers (start, pause, reset, advance) **[v1.2]**.
- Moderate module forums: pin announcements and remove any post.

## 5. Success metrics

| Metric | Definition / target |
|---|---|
| Weekly active study minutes per student | Target of at least 180 minutes per active user per week |
| Session completion rate | Percentage of joined study sessions completed through the end of the Pomodoro block |
| 7-day retention | Students returning to a module room at least three times per week |
| 30-day retention | Students returning to a module room at least three times per week |
| Group coordination velocity | Schedule updates and resource threads resolved in the module forum without switching to an external app |

Analytics instrumentation and calculation windows remain to be finalized during implementation.

## 6. Functional requirements

Priority labels: **P0** = required for the stated MVP; **P1** = useful follow-up.

### 6.1 Authentication and role-based access

**Priority:** P0

- FR-AUTH-01: The system shall allow a user to create an account using email and password through Supabase Auth.
- FR-AUTH-02: The system shall allow a registered user to sign in.
- FR-AUTH-03: The system shall support the `student` and `admin` roles.
- FR-AUTH-04: The backend shall enforce role restrictions through Express middleware.
- FR-AUTH-05: Supabase Row-Level Security (RLS) policies shall enforce access restrictions at the database layer.
- FR-AUTH-06: A user shall not gain admin privileges merely by changing client-side state or submitting a role value from the browser.
- FR-AUTH-07: The system shall provide a password reset flow through Supabase Auth: a request screen that sends a reset email, and a screen to set a new password from the emailed link.
- FR-AUTH-08: After successful authentication the system shall load the user's profile (`role`, `institution_id`, modules) and route as defined in Section 8.4.

**Acceptance criteria**

- A valid user can register and sign in.
- An unauthenticated request to a protected endpoint is rejected.
- A student cannot access an admin-only endpoint.
- Database policies prevent unauthorized reads and writes even if a client attempts to bypass the UI.
- A user can request a reset email and set a new password using the emailed link; the reset request does not reveal whether an email is registered.
- Role assignment and admin provisioning follow a controlled process (exact process remains open, Section 14).

### 6.2 Module profile, module requests, and discovery

**Priority:** P0

- FR-MOD-01: A student shall be able to select an institution.
- FR-MOD-02: A student shall be able to select one or more active modules.
- FR-MOD-03: The system shall use institution and module selections to filter relevant rooms.
- FR-MOD-04: Students shall be able to discover rooms associated with the modules they study.
- FR-MOD-05: Admins shall be able to create/add, edit/update, verify, and archive/delete institution and module records.
- FR-MOD-06: The institution catalogue shall be seeded with all South African universities and colleges currently registered with the Department of Higher Education and Training (DHET).
- FR-MOD-07: A student shall be able to request a module missing from the catalogue using an inline form on the module profile screen (no modal), submitting institution, module code, and an optional title into `module_requests` with `status = 'pending'`.
- FR-MOD-08: Admins shall review pending requests in the admin catalogue view and choose **Approve & Add** (inserts into `modules` and marks the request `approved`) or **Reject** (marks it `rejected`).
- FR-MOD-09: Only admins can add or verify catalogue modules; students can only create module requests. Enforced by backend middleware and RLS.

**Acceptance criteria**

- A student can save institution and module selections.
- Room discovery returns rooms associated with the selected module(s) and not unrelated rooms.
- Module codes such as `MAT2611`, `COS1511`, and `ECS1501` can be represented.
- A student can submit a module request and sees it as pending; an admin can approve (module appears in the catalogue) or reject it.
- A student cannot insert into `modules` or change a request's status.

### 6.3 Silent live study rooms

**Priority:** P0

- FR-ROOM-01: Students shall be able to enter a study room associated with a module.
- FR-ROOM-02: The backend shall enforce a maximum of 20 participants per room.
- FR-ROOM-03: A room at capacity shall reject additional participants.
- FR-ROOM-04: Room audio shall be disabled; the video experience shall be silent and video-only. Participants are expected to join with their camera on; camera-on enforcement is deferred to v2. **[v1.2]**
- FR-ROOM-05: Video tiles shall be configured for low-bandwidth use, targeting 240p/360p.
- FR-ROOM-06: Participants shall be able to see other room participants' video tiles.
- FR-ROOM-07: Participants shall be able to set a short study-status tag, for example, "Chapter 1 – Differential Equations".
- FR-ROOM-08: Room presence shall update for participants in real time.
- FR-ROOM-09: Rooms shall be created by an `admin` only. **[v1.2]**
- FR-ROOM-10: A room shall remain open until an `admin` closes it. Rooms are not scheduled and do not expire automatically in the MVP. **[v1.2]**
- FR-ROOM-11: An admin shall be able to close an active room. Closing requires confirmation. A closed room is removed from discovery and cannot be joined. **[v1.2]**
- FR-ROOM-12: If a participant's camera is denied or unavailable, the room shall show an understandable message and a placeholder tile for that participant. **[v1.2]**

**Acceptance criteria**

- The room never has more than 20 active participants according to the authoritative backend state.
- Two users attempting to take the final available seat concurrently cannot both exceed the limit.
- A participant cannot enable microphone audio through the room UI or room configuration.
- The room provides video-only participation.
- Participant presence and status changes become visible to other participants without a page refresh.
- A non-admin cannot create or close a room.
- Closing a room removes it from discovery and prevents new joins.
- A participant with a denied or unavailable camera can see the message and is shown as a placeholder tile.

### 6.4 Synchronized Pomodoro timer

**Priority:** P0

- FR-TIMER-01: Each room shall provide a shared focus/break timer.
- FR-TIMER-02: The default timer cycle shall be 50 minutes of focus followed by a 10-minute break.
- FR-TIMER-03: Participants in the same room shall see a synchronized timer state.
- FR-TIMER-04: Timer state shall remain consistent when a participant joins after the timer has started.
- FR-TIMER-05: Timer controls (start, pause, reset, advance) shall be available only to the `admin`. Participants see the timer read-only. **[v1.2]**

**Acceptance criteria**

- A newly joined participant sees the current room timer state rather than a local timer.
- Participants see the same focus/break phase and remaining time, subject to normal latency.
- The default cycle is 50/10.
- A non-admin cannot start, pause, reset, or advance the timer through the UI or API.

### 6.5 Live study-status tags

**Priority:** P0

- FR-STATUS-01: A participant shall be able to publish a short current-study status in the room.
- FR-STATUS-02: Room participants shall be able to see each other's status tags.
- FR-STATUS-03: Status changes shall propagate in real time.

**Acceptance criteria**

- A participant can set and update their own status tag; others see it without refreshing.
- The status is associated with the correct participant and room; no impersonation.

Maximum tag length and allowed characters remain to be decided during implementation.

### 6.6 Shared session checklist

**Priority:** P0

- FR-CHECK-01: Each study room shall provide a shared checklist for session milestones.
- FR-CHECK-02: Participants shall be able to add checklist items.
- FR-CHECK-03: Participants shall be able to mark checklist items as complete or incomplete.
- FR-CHECK-04: Checklist changes shall synchronize in real time for all room participants.
- FR-CHECK-05: Checklist items shall persist with the room for shared progress tracking.
- FR-CHECK-06: A participant can edit and delete their own checklist items; an `admin` can edit and delete any item. **[v1.2]**

**Acceptance criteria**

- A participant can add a milestone and mark it complete/incomplete; others see changes without refreshing.
- Items remain associated with the correct room and are still present when the room is revisited.
- A participant cannot edit or delete another participant's item; an admin can.

Ordering of items remains to be decided (default: creation order).

### 6.7 Module group forum

**Priority:** P0

- FR-FORUM-01: Each supported module shall have a persistent forum or noticeboard.
- FR-FORUM-02: Students and admins shall be able to post module-related text updates and information. **[v1.2]**
- FR-FORUM-03: Forum posts shall support schedule updates, including changes to session times.
- FR-FORUM-04: Admins shall be able to pin announcements.
- FR-FORUM-05: Forum updates shall be available to relevant module members.
- FR-FORUM-06: Forum updates shall be reflected in real time where supported by Supabase Realtime.
- FR-FORUM-07: Every user can edit their own forum post.
- FR-FORUM-08: Admins can remove any post (for example spam or off-topic content), in addition to pinning announcements. Removal requires confirmation. **[v1.2]**

**Acceptance criteria**

- A student can view the forum for a selected module and an authorized user can create a text post.
- A schedule change can be communicated through a forum post.
- An admin can pin an announcement, which is visibly distinguished from ordinary posts.
- A user can edit their own post but not another user's post.
- An admin can remove any post; a student cannot remove other users' posts.
- Unauthorized users cannot perform admin-only moderation actions.

## 7. Non-functional requirements

### 7.1 Security and privacy

- Enforce authorization in both the Express API and Supabase RLS; do not rely on frontend-only role checks.
- Protect live-room access through backend-generated provider tokens.
- Do not expose privileged Supabase service credentials in frontend code.
- Validate and authorize all writes to rooms, checklists, status tags, forums, module requests, and catalogue records.
- Define how users report abuse before a public launch (a full reporting workflow remains open).

### 7.2 Performance and realtime behaviour

- Enforce room capacity on the server, including concurrent join attempts.
- Use Supabase Realtime for checklist, room-presence, timer, and forum updates.
- Configure video tiles for low-bandwidth use, targeting 240p/360p.
- Keep timer state authoritative and synchronized rather than relying on independent client countdowns.

No numeric latency, uptime, or realtime SLOs are specified.

### 7.3 Compatibility and responsiveness

- The web application shall provide responsive mobile and desktop layouts, with a breakpoint at 1024px (`lg`) between mobile and desktop navigation.
- The UI shall follow the approved Google Stitch designs and style guide, using a single theme. **[v1.2]**
- The frontend shall use Lucide Icons (`lucide-react`) exclusively; no emojis.

### 7.4 Maintainability and quality

- Use TypeScript for the React frontend and Node.js/Express backend.
- Run linting, type checking, automated tests, and production builds through GitHub Actions on every pull request.
- Maintain unit and integration tests for core business rules and protected workflows.

## 8. UI/UX screen and interaction specification

### 8.1 Screen and dialog inventory

| ID | Screen | Primary role | Purpose | Supporting requirements |
|---|---|---|---|---|
| S01 | Authentication — Sign up / Log in | Student and admin | Create an account or sign in; entry to password reset | FR-AUTH-01, 02, 07 |
| S08 | Password reset — Request / Set new password | Student and admin | Request a reset email; set a new password from the emailed link | FR-AUTH-07 |
| S02 | Student module profile | Student | Select institution and active modules; submit module requests inline | FR-MOD-01, 02, 07 |
| S03 | Module room discovery | Student | Discover rooms for selected modules and see availability against the 20-person limit | FR-MOD-03, 04, FR-ROOM-02, 03 |
| S04 | Silent study room | Student (timer and close-room controls for admin) | Video-only study with synchronized timer, status tags, shared checklist | FR-ROOM-01–12, FR-TIMER-01–05, FR-STATUS-01–03, FR-CHECK-01–06 |
| S05 | Module forum / noticeboard | Student and admin | View and create text posts; edit own posts | FR-FORUM-01–03, 05–07 |
| S06 | Admin module catalogue management | Admin | Create, edit, verify, archive/delete institution and module records; review module requests; create and close rooms | FR-MOD-05–09, FR-ROOM-09, 11 |
| S07 | Admin forum moderation | Admin | Pin announcements and remove posts | FR-FORUM-04, 08 |
| Profile / Role | Profile view | Student and admin | View/edit profile and active modules, role badge, sign out | FR-MOD-01, 02 |

**Confirmation dialogs:** Confirmation prompts are required for high-impact or destructive actions only. In the MVP these are three **[v1.2]**:

1. Deleting/removing a forum post.
2. Deleting/removing a catalogue record (institution or module).
3. Closing an active room.

No other dialogs are committed. Module requests use an inline form, not a modal. (The remove-participant dialog is deferred to v2.)

### 8.2 Screen specifications

All screens are designed responsively for mobile and desktop in a single theme and show the six states: Normal, Empty, Loading, Error, Offline, and Success. State wording follows Section 8.5.

#### S01 — Authentication: Sign up / Log in

- Present the StudySync name and a Sign up / Log in mode switch; each mode has Email and Password fields and a primary action (Sign up / Log in).
- A "Forgot password?" link in Log in mode leads to S08.
- No social login, phone login, passwordless login, or extra profile fields.
- Empty: fields empty, primary action visible. Loading: submit button in-progress, duplicate submissions prevented. Error: inline message, form stays editable. Offline: network-required message, entered values kept, no implied success. Success: brief confirmation, then redirect per Section 8.4.

#### S08 — Password reset

- **Request mode:** Email field and a primary "Send reset link" action; a back-to-log-in link.
- **Set-new-password mode** (reached from the emailed link): New password field (and confirmation) and a primary "Save new password" action.
- Success (request): neutral confirmation that, if the email is registered, a reset link has been sent. Success (set password): confirmation, then route to Log in.
- Error: neutral retryable message, including an invalid/expired link case. Loading, Empty, and Offline follow S01.
- Reuses shared form fields, buttons, and state feedback; no new components.

#### S02 — Student module profile

- Institution selection (catalogue seeded from DHET-registered South African universities and colleges) and Active modules selection (one or more codes, e.g. `MAT2611`, `COS1511`, `ECS1501`); primary action "Save selections".
- Inline "Request a module" form (not a modal): institution, module code, optional title; submit creates a pending request. Show the student's own requests with status (pending / approved / rejected).
- No degree programme, year of study, campus, timetable, or other profile fields.
- Empty, Loading, Error, Offline, Success per Section 8.5. First-time or incomplete profiles land here (Section 8.4) and are routed to `/discover` after saving.

#### S03 — Module room discovery

- Shows selected module codes as context; open rooms filtered by those modules.
- Each result shows module identifier, participant occupancy out of 20, and Join room when a seat is available. Rooms are open or full; there is no scheduled state in the MVP. **[v1.2]**
- A 20/20 room is visibly unavailable; no waitlist or alternative-room recommendation.
- Room rules (silent, video only) are shown before joining.
- Empty message when no rooms exist; no create-room action for students. Loading placeholders; Error; Offline (occupancy marked as last-known); Success transitions into S04 after the backend confirms the join.

#### S04 — Silent study room

- Module identifier and occupancy (n/20); responsive video-tile grid of at most 20 tiles; no microphone controls; low-bandwidth 240p/360p.
- Prominent synchronized timer with phase (Focus/Break) and remaining time; default 50/10. Timer controls (start, pause, reset, advance) appear only for admins; participants see it read-only. **[v1.2]**
- Study-status tags on tiles; a participant edits their own status.
- Shared checklist with item text, complete/incomplete control, and composer. Edit/delete controls appear on a participant's own items; admins see them on all items. **[v1.2]**
- Camera-denied/unavailable state: understandable message and a placeholder tile. No reporting action and no camera toggle policy in the MVP. **[v1.2]**
- Admin controls: timer controls and Close room (confirmation dialog). No remove-participant action. **[v1.2]**
- Layout details in Section 8.3.
- Empty, Loading, Error (join failure, video failure, loading failure, rejected capacity request, room closed), Offline ("Connection lost…"; no queued offline edits), Success, and Full-room (20/20, no join action, no waitlist) states.

#### S05 — Module forum / noticeboard

- Module identifier; list of posts with author, text content, edited indicator where applicable, and pinned distinction.
- Composer with post body and Publish action. Posts are text-only. **[v1.2]**
- Every user can edit their own post. Students cannot remove others' posts.
- No comments, reactions, direct messages, polls, or attachments.
- Empty, Loading, Error, Offline (new posts not confirmed and not queued), Success (published post and real-time pin updates).
- When shown inside the room (desktop right drawer / mobile segmented switch), it is the same module forum, not an in-room chat.

#### S06 — Admin module catalogue management

- Clearly identified admin area with three sections: Catalogue, Module requests, and Rooms.
- Catalogue: institution and module records with create/add, edit/update, verify, and archive/delete (delete requires confirmation).
- Module requests: pending requests with **Approve & Add** and **Reject**.
- Rooms **[v1.2]**: create a room for a module and close an active room (confirmation). No scheduling and no moderator nomination.
- No bulk import, external integrations, or audit dashboards.
- Empty, Loading, Error, Offline, Success (shown only after backend confirmation), and a denied-access state: "You don't have permission to access this page."

#### S07 — Admin forum moderation

- Admin moderation context and module identifier; forum posts with pinned announcements visibly distinguished.
- Actions: pin/unpin announcement and **remove any post** (confirmation dialog).
- No report queues, user bans, moderation analytics, or escalation tooling.
- Empty, Loading, Error, Offline, Success (pinned state reflected in S05; removed post disappears), and denied-access state for non-admins.

### 8.3 Navigation

| Destination | Icon (Lucide) | Route | Visibility |
|---|---|---|---|
| Discover / Match | `LayoutGrid` or `Users` | `/discover` | All authenticated users |
| Silent Room | `Video` or `Eye` | `/room/:id` | All authenticated users |
| Group Forum | `MessageSquare` | `/forum` | All authenticated users |
| Admin Console | `ShieldCheck` | `/admin` | `role === 'admin'` only |
| Profile / Role | `User` | `/profile` | All authenticated users |

**Desktop (≥ 1024px / `lg`)**

- Persistent left sidebar (240px fixed or collapsible rail): brand mark and student/module quick context at top; vertical primary nav with Lucide icons (18–20px) and text labels, active state via fill/border token, and a capacity badge (e.g., `12/20`) on Silent Room; bottom utility cluster with current user name, role indicator, and `LogOut`.
- Top header bar (56–64px): current view title on the left; module filter/search or synced Pomodoro status pill when in a session on the right.
- Inside the Silent Room: primary stage (~70–75% width) with the camera grid, per-tile status tag, and a top/floating Pomodoro bar; collapsible right drawer (~25–30%) with tabbed or stacked Shared Checklist and Quick Forum.

**Mobile (< 1024px)**

- Top app bar (56px): active screen/module/room title on the left; compact timer pill (in a room) or `User` profile button on the right.
- Fixed bottom navigation (64px, safe-area padded): 4–5 equal-width icon + one-word label tabs (Match, Room, Forum, plus Admin for admins).
- Inside the Silent Room: compact camera grid, synced timer, and status selector at the top; a segmented switch below toggles Checklist and Forum.

**Implementation rules**

- One `NAV_ITEMS` TypeScript config array (`id`, `label`, `path`, `icon: LucideIcon`, `requiresAdmin?: boolean`) rendered by both `<DesktopSidebar/>` and `<MobileBottomNav/>`.
- Defense in depth: hide `/admin` links and guard `/admin` routes on the frontend for non-admins, while enforcing `role = 'admin'` in Express and Supabase RLS.

### 8.4 Post-login routing

After authentication succeeds, fetch the user's profile (`role`, `institution_id`, modules) and redirect:

1. Missing institution or active modules → `/profile` (S02); after saving, route to `/discover`.
2. `role === 'admin'` → `/admin/catalogue` (S06), or a unified `/admin` hub containing S06 and S07.
3. `role === 'student'` → `/discover` (S03).

Admins can still navigate to `/discover`, `/room/:id`, and `/forum`. If a student opens S06 or S07 directly, render the denied-access state ("You don't have permission to access this page.") and block writes through RLS.

### 8.5 System messages

Keep wording consistent across screens:

- **Empty:** clear, short labels (for example no rooms, posts, or checklist items yet).
- **Error:** neutral, retryable messages that never expose provider-specific diagnostics.
- **Offline:** "You're offline…" for screens that rely on a connection; "Connection lost…" inside a live room.
- **Success:** concise confirmation shown only after the backend confirms the action.

### 8.6 Shared UI components

| Component | Purpose | Required content / behaviour | Used on |
|---|---|---|---|
| StudySync brand/header area | Identify the product and screen context | StudySync name and wordmark only; no logo or tagline | S01–S08 |
| Form field | Collect email/password, selections, request details | Clear label, input/select area, validation/error presentation | S01, S02, S08 |
| Primary action button | Main screen action | Normal, loading, disabled, success feedback | All |
| Secondary action button | Secondary action | Lower emphasis | As needed |
| Module identifier | Institution/module context | Module codes such as `MAT2611` | S02–S07 |
| Room result item | Discoverable study room | Module, occupancy / 20, join availability | S03 |
| Participant video tile | Live participant | Video area (or placeholder if camera unavailable), identity label if available, status tag; no audio control | S04 |
| Participant status tag | Current study focus | Live update | S04 |
| Pomodoro timer | Shared focus/break state | Phase, remaining time, 50/10 default; controls for admin only | S04 |
| Shared checklist item | Session milestone | Text, complete/incomplete control, owner/admin edit and delete | S04 |
| Checklist composer | Add milestone | Text entry and add action | S04 |
| Forum post item | Module post | Author, text content, edited indicator, pinned distinction | S05, S07 |
| Forum composer | Create a post | Text entry and publish action | S05 |
| Pinned announcement marker | Distinguish pinned content | Clear visual treatment | S05, S07 |
| Module request form (inline) | Request a missing module | Institution, module code, optional title; no modal | S02 |
| Module request row | Review a request | Details plus Approve & Add / Reject | S06 |
| Admin room controls | Room management | Create room, close room, timer controls | S04, S06 |
| Confirmation dialog | Confirm destructive actions | Used only for the three actions in Section 8.1 | S05/S07, S06, S04 |
| Navigation (sidebar / bottom nav) | Move between destinations | Driven by `NAV_ITEMS`; admin item gated | All authenticated |
| State feedback | Loading, empty, error, offline, success | Consistent placement and styling | All |
| Icon | Actions and navigation | `lucide-react` only; no emojis | All |

**Component consistency rules**

- Reuse the same component shapes, control treatments, and state feedback patterns across all screens.
- Every visible control must correspond to a requirement or confirmed decision.
- No microphone controls in study rooms; never more than 20 participant tiles.
- Sample data in mock-ups is limited to examples listed in this PRD and marked as illustrative.

## 9. Design values and visual constraints

### 9.1 Confirmed design values

| Value | Confirmed requirement |
|---|---|
| Product name | StudySync |
| Target experience | Responsive web application for mobile and desktop |
| Icon library | Lucide Icons via `lucide-react` exclusively; zero emojis |
| Study-room mode | Silent, video-only (camera-on expected, not enforced in the MVP) |
| Microphone | Disabled at room level (`audioSource: false`); no microphone controls |
| Video quality target | Low-bandwidth 240p/360p |
| Room capacity | Maximum 20 participants |
| Timer | Shared Pomodoro; 50-minute focus / 10-minute break default |
| Collaboration | Shared checklist with real-time updates |
| Presence | Participant presence and status tags update in real time |
| Status-tag example | "Chapter 1 – Differential Equations" |
| Module-code examples | `MAT2611`, `COS1511`, `ECS1501` |
| Schedule-update example | "Session moved from 16:00 to 18:00" |
| Backend/data context | Hosted Supabase, Auth, PostgreSQL, Realtime |
| Frontend context | React + TypeScript |

### 9.2 Visual decisions resolved

| Decision | Resolution |
|---|---|
| Colour palette and semantic colours | The palette used in the approved Stitch style guide |
| Theme | A single theme as defined in the style guide; light/dark support deferred to v2 **[v1.2]** |
| Font family and typography scale | Follow the style guide |
| Spacing, border, radius, elevation, shadow | Follow the style guide |
| Logo / brand mark | No logo for now; use the StudySync name as text only |
| Mobile and desktop navigation | As defined in Section 8.3 |
| Exact system-message copy | Principles in Section 8.5; provisional strings from the Stitch prompts |

### 9.3 Design values still to be finalized

- Motion and animation rules.
- Tagline and illustration/photography direction (none unless later approved).

The style guide's tokens should be exported into `docs/designs/` so implementation can reference one source of truth.

## 10. Technical architecture

| Layer | Required technology / responsibility |
|---|---|
| Frontend | React + TypeScript; responsive UI; Lucide Icons; shared `NAV_ITEMS` navigation config |
| Backend | Node.js + Express + TypeScript; validation, authorization, capacity enforcement, video-token generation |
| Database | Hosted Supabase PostgreSQL |
| Authentication | Supabase Auth (email/password, password reset) |
| Database authorization | Supabase Row-Level Security |
| Realtime | Supabase Realtime for checklists, room presence, timer state, and forum updates |
| Video | WebRTC SDK; Daily.co or LiveKit, to be chosen by the product owner |
| CI | GitHub Actions: lint, typecheck, test, build |

### 10.1 Architectural principles

1. The backend is authoritative for room capacity and protected operations.
2. Database RLS is a second authorization boundary, not a replacement for API authorization.
3. Realtime updates are used for collaborative state; persistent records remain in the database.
4. Video access is granted through backend-generated tokens.
5. The video provider is abstracted where practical.

## 11. High-level data entities

These are logical entities, not a finalized schema.

| Entity | Purpose | Likely relationships |
|---|---|---|
| User profile | Application profile and role | Belongs to a Supabase user |
| Institution | University or college (seeded from DHET register) | Has modules |
| Module | Module code and catalogue entry; supports archive | Belongs to an institution |
| Module request | Student request for a missing module (`pending` / `approved` / `rejected`, optional title) | Links student, institution; approval creates a Module |
| Student module enrolment | Active module for a student | Links profile and module |
| Study room | Module room with open/closed state, created by an admin | Belongs to a module |
| Room participant / presence | Current participation | Links user and room |
| Study status | Participant's current status tag | Links participant and room |
| Timer state | Authoritative focus/break state | Belongs to a room |
| Checklist item | Milestone, completion state, creator (for edit/delete rules) | Belongs to a room; persists with the room |
| Forum post | Text discussion, schedule update, or notice; edited timestamp | Belongs to a module and author |
| Announcement pin | Pinned post state | Links an admin action to a post |

Final columns, constraints, indexes, retention rules, and RLS policies must be designed before migrations are complete.

## 12. UX and interface requirements

- Use the approved Stitch designs as the visual source of truth.
- Provide responsive layouts in the single approved theme.
- Use Lucide Icons only; do not use emoji iconography.
- Make room capacity and full-room states clear to students.
- Make the silent/video-only nature of study rooms clear before joining.
- Display timer phase and remaining time prominently.
- Make checklist changes and pinned forum announcements easy to identify.
- Use confirmation dialogs only for the three destructive actions in Section 8.1.
- Provide loading, empty, error, and offline/network-disconnected states for core flows with consistent wording (Section 8.5).

## 13. Release acceptance checklist

The MVP is ready for release when:

- [ ] Email/password registration, login, and password reset work through Supabase Auth.
- [ ] `student` and `admin` roles are enforced by Express middleware and RLS.
- [ ] Post-login routing follows Section 8.4.
- [ ] Students can save an institution and active modules; the institution catalogue is seeded from the DHET-registered list.
- [ ] Students can submit module requests; admins can approve or reject them.
- [ ] Admins can create, edit, verify, and archive/delete catalogue records.
- [ ] Admins can create and close rooms; students can discover open module-specific rooms.
- [ ] The backend enforces the 20-participant limit, including concurrent joins.
- [ ] Study rooms operate in silent, video-only mode; a participant with an unavailable camera sees a clear message.
- [ ] Video tiles are configured for the intended low-bandwidth quality.
- [ ] Room presence and participant status tags update in real time.
- [ ] The 50/10 timer is synchronized; only admins can control it.
- [ ] Shared checklist additions and completion changes synchronize in real time, persist with the room, and follow ownership/admin edit rules.
- [ ] Module forums support text posts, schedule updates, and editing of own posts.
- [ ] Admins can pin announcements and remove any post.
- [ ] Confirmation dialogs appear for post removal, catalogue record deletion, and room closure.
- [ ] Core unit and integration tests pass.
- [ ] Lint, typecheck, test, and production build pass in GitHub Actions.
- [ ] Frontend and backend are deployed and connected to hosted Supabase.
- [ ] Mobile and desktop layouts have been checked against Stitch designs.
- [ ] README includes live URL, Stitch link, student/admin test logins, screenshots, and document links.
- [ ] A five-minute-or-less investor pitch and live-demo recording are prepared before the deadline.

## 14. Open decisions and unresolved requirements

1. **Video provider:** The product owner will choose Daily.co or LiveKit (needed before Phase 3 video work).
2. **Room join concurrency:** Exact transaction/locking approach for the 20-seat limit.
3. **Admin provisioning:** Who can grant or revoke the `admin` role, and how.
4. **Timer operation with admin-only controls:** With only admins controlling the timer, a room has no running timer unless an admin is present. This is accepted for the MVP; consider an auto-start cycle in v2.
5. **Room closure:** Whether closing a room deletes its checklist or archives it (the checklist persists with the room in the meantime).
6. **Checklist details:** Item ordering, and handling of items created by participants who have since left.
7. **Status tags:** Length limits and validation rules.
8. **DHET catalogue source:** The exact source and format of the DHET registered-institution list, and refresh process.
9. **Abuse reporting:** User reporting and escalation workflows beyond admin moderation.
10. **Analytics:** Event tracking and calculation rules for retention and study-minute metrics.
11. **Deployment providers:** Frontend/backend hosting.
12. **Test accounts:** Safe process for creating student and admin demo accounts.

**Deferred to v2 (decisions to revisit then):** how camera-on is detected and enforced and how issues are reported; room-moderator nomination and revocation; scheduled rooms and session expiry; attachment file types and size limits; dark mode.

## 15. Decision log

| # | Decision | Resolution |
|---|---|---|
| 1 | Colour palette | Use the Stitch style guide palette |
| 2 | Light/dark mode | Both (v1.1); **single theme in the MVP, light/dark deferred to v2 (v1.2)** |
| 3 | Typography | Follow the style guide |
| 4 | Spacing, radius, shadow | Follow the style guide |
| 5 | Logo | None for now; text wordmark only |
| 6–7 | Mobile and desktop navigation | Section 8.3 |
| 8 | Post-login landing | Section 8.4 |
| 9 | Password reset | Added (S08, FR-AUTH-07) |
| 10 | Institutions | All South African universities and colleges currently registered with DHET |
| 11 | Missing modules | Inline request on S02; admin approves/rejects in S06 |
| 12 | Admin catalogue actions | Create/add, edit/update, verify, archive/delete |
| 13 | Room creation | Admin or admin-nominated student (v1.1); **admin only in the MVP; moderators deferred to v2 (v1.2)** |
| 14 | Room lifecycle | Scheduled and active sessions with expiry (v1.1); **rooms stay open until an admin closes them; scheduling and expiry deferred to v2 (v1.2)** |
| 15 | Timer controls | Admin plus up to two room moderators (v1.1); **admin only in the MVP (v1.2)** |
| 16 | Camera rules | Mandatory during focus blocks with exceptions (v1.1); **expected but not enforced; enforcement deferred to v2 (v1.2)** |
| 17 | Camera denied/lost | Report to admin/moderator, possible removal (v1.1); **clear message and placeholder tile only; reporting and removal deferred to v2 (v1.2)** |
| 18 | Checklist persistence | Persists with room; edit/delete by creator, or admin (v1.2 wording) |
| 19 | Forum attachments | Included (v1.1); **text-only in the MVP, attachments deferred to v2 (v1.2)** |
| 20 | Post editing | Everyone can edit their own post |
| 21 | Post removal | Admins can remove any post, in addition to pinning |
| 22 | System messages | Consistent wording principles (Section 8.5) |
| 23 | Confirmation dialogs | Remove post, delete catalogue record, close active room; **remove-participant dialog deferred with kicking (v1.2)** |

## 16. Source alignment

This PRD is based on the supplied **Business Plan & MVP Specification: StudySync** and the product owner's answers to the Stitch design questions. Business scope, users, metrics, Day 1 feature groups, stack, and milestone dates come from the source. Items marked **[v1.2]** reflect the product owner's decision to defer four feature areas to v2 and keep the MVP lightweight. Logical data entities, acceptance criteria, and open questions are structured elaborations to make the product implementable.
