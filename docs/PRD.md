# StudySync --- Product Requirements Document (PRD)

**Document status:** MVP specification\
**Product:** StudySync\
**Version:** 1.0\
**Source:** Business Plan & MVP Specification: StudySync\
**Target MVP deadline:** Wednesday, 25 November 2026, 15:30 SAST

------------------------------------------------------------------------

## 1. Product overview

StudySync is a study-accountability platform for university and
distance-learning students. It pairs students taking the same modules in
silent, camera-on live study rooms of up to 20 participants. Each room
provides a synchronized focus timer, shared session checklist, and live
study-status tags. Module forums provide a persistent place to
coordinate schedules, publish announcements, and share study resources.

The MVP is intended to reduce the isolation and inconsistency
experienced by distance-learning, commuter, and other students without a
reliable on-campus study network.

## 2. Problem statement

The target students often study without a dependable peer network. They
spend time looking for suitable study partners and current session
information across scattered messaging groups. Distractions and
inconsistent study routines can reduce productive study time and make
assignment and examination periods harder to manage.

The business specification identifies the following costs and pain
points:

-   Re-registering for a failed South African university module may cost
    approximately R2,000--R5,500 or more, excluding additional data,
    transport, and delayed graduation costs.
-   Students may lose two to three hours in an evening to
    procrastination, distractions, and searching for study partners or
    updated session times.
-   Existing group chats can become noisy, while general-purpose meeting
    tools require manual coordination and may introduce unnecessary
    audio interruptions and bandwidth demands.

## 3. Product goals

### 3.1 MVP goals

1.  Allow students to register, sign in, and use the platform according
    to their assigned role.
2.  Let students select an institution and active module codes.
3.  Help students discover study rooms associated with their modules.
4.  Provide silent, video-only study rooms with a hard maximum capacity
    of 20 participants.
5.  Keep the Pomodoro timer and session checklist synchronized for room
    participants.
6.  Let students and admins coordinate schedules and share resources in
    module forums.
7.  Provide admins with role-appropriate module-management and
    moderation capabilities.

### 3.2 Out of scope for the MVP

The source specification does not define the following as Day 1
requirements. They should not be treated as committed MVP scope without
a later product decision:

-   Paid subscriptions, payment processing, and billing.
-   Institutional cohort licensing, institutional branding, and cohort
    reporting.
-   Advanced study analytics, streak dashboards, and exam countdown
    dashboards.
-   Priority buddy matching.
-   A complete automated matching algorithm beyond module-based
    discovery.
-   Voice chat or microphone-enabled rooms.
-   A mobile-native application.
-   AI tutoring, automated note generation, or automated assessment.

These items may be considered in later releases, but the MVP must
prioritize the five Day 1 feature groups in Section 6.

## 4. Users and roles

### 4.1 Student (`student`)

A student is an undergraduate or postgraduate learner, including
distance-learning and commuter students.

Students need to be able to:

-   Create an account and sign in using email and password.
-   Select an institution and active modules.
-   Discover module study rooms.
-   Join an available room, subject to the 20-person capacity limit.
-   Participate in silent video study sessions.
-   View and update their own study-status tag.
-   View and interact with the shared room checklist.
-   Use the synchronized focus/break timer.
-   Read and contribute to module forums, subject to the permissions
    defined for the forum.

### 4.2 Admin (`admin`)

An admin may be a class representative, peer tutor, student lead,
moderator, or platform administrator.

Admins need role-protected capabilities to:

-   Manage or verify module-catalog information.
-   Moderate module forums.
-   Publish and pin announcements.
-   Help keep study rooms active and safe.

The exact admin permission matrix and whether all admin types have
identical privileges are not specified in the source. This must be
confirmed before implementation of sensitive administrative actions.

## 5. Success metrics

The product should measure the following:

  -----------------------------------------------------------------------
  Metric                              Definition / target
  ----------------------------------- -----------------------------------
  Weekly active study minutes per     Target of at least 180 minutes per
  student                             active user per week

  Session completion rate             Percentage of joined study sessions
                                      completed through the end of the
                                      Pomodoro block

  7-day retention                     Students returning to a module room
                                      at least three times per week

  30-day retention                    Students returning to a module room
                                      at least three times per week

  Group coordination velocity         Schedule updates and resource
                                      threads resolved in the module
                                      forum without switching to an
                                      external app
  -----------------------------------------------------------------------

The source does not prescribe analytics instrumentation or calculation
windows beyond the metric descriptions above. Those details should be
finalized during implementation.

## 6. Functional requirements

Priority labels: **P0** = required for the stated MVP; **P1** = useful
follow-up or clarification required.

### 6.1 Authentication and role-based access

**Priority:** P0

-   FR-AUTH-01: The system shall allow a user to create an account using
    email and password through Supabase Auth.
-   FR-AUTH-02: The system shall allow a registered user to sign in.
-   FR-AUTH-03: The system shall support the `student` and `admin`
    roles.
-   FR-AUTH-04: The backend shall enforce role restrictions through
    Express middleware.
-   FR-AUTH-05: Supabase Row-Level Security (RLS) policies shall enforce
    access restrictions at the database layer.
-   FR-AUTH-06: A user shall not gain admin privileges merely by
    changing client-side state or submitting a role value from the
    browser.

**Acceptance criteria**

-   A valid user can register and sign in.
-   An unauthenticated request to a protected endpoint is rejected.
-   A student cannot access an admin-only endpoint.
-   Database policies prevent unauthorized reads and writes even if a
    client attempts to bypass the UI.
-   Role assignment and admin provisioning follow a controlled process.
    The exact provisioning process remains an open decision.

### 6.2 Module profile and discovery

**Priority:** P0

-   FR-MOD-01: A student shall be able to select an institution.
-   FR-MOD-02: A student shall be able to select one or more active
    modules.
-   FR-MOD-03: The system shall use institution and module selections to
    filter relevant rooms.
-   FR-MOD-04: Students shall be able to discover rooms associated with
    the modules they study.
-   FR-MOD-05: Admins shall have a way to verify or manage
    module-catalog information.

**Acceptance criteria**

-   A student can save institution and module selections.
-   Room discovery returns rooms associated with the selected module(s).
-   A student does not see unrelated rooms presented as matches for
    their selected modules.
-   Module codes such as `MAT2611` and `COS1511` can be represented.

The source does not specify the initial institution/module catalogue,
whether students can request a missing module, or the approval workflow
for catalogue changes.

### 6.3 Silent live study rooms

**Priority:** P0

-   FR-ROOM-01: Students shall be able to enter a study room associated
    with a module.
-   FR-ROOM-02: The backend shall enforce a maximum of 20 participants
    per room.
-   FR-ROOM-03: A room at capacity shall reject additional participants.
-   FR-ROOM-04: Room audio shall be disabled; the video experience shall
    be camera-on and silent.
-   FR-ROOM-05: Video tiles shall be configured for low-bandwidth use,
    targeting 240p/360p.
-   FR-ROOM-06: Participants shall be able to see other room
    participants' video tiles.
-   FR-ROOM-07: Participants shall be able to set a short study-status
    tag, for example, "Chapter 1 -- Differential Equations".
-   FR-ROOM-08: Room presence shall update for participants in real
    time.

**Acceptance criteria**

-   The room never has more than 20 active participants according to the
    authoritative backend state.
-   Two users attempting to take the final available seat concurrently
    cannot both exceed the limit.
-   A participant cannot enable microphone audio through the room UI or
    room configuration.
-   The room provides video-only participation.
-   Participant presence and status changes become visible to other
    participants without requiring a page refresh.

**Implementation note:** The source names Daily.co or LiveKit as
candidate WebRTC providers, but does not select one. Provider selection,
SDK configuration, token generation, and any provider-specific limits
must be confirmed before integration.

### 6.4 Synchronized Pomodoro timer

**Priority:** P0

-   FR-TIMER-01: Each room shall provide a shared focus/break timer.
-   FR-TIMER-02: The default timer cycle shall be 50 minutes of focus
    followed by a 10-minute break.
-   FR-TIMER-03: Participants in the same room shall see a synchronized
    timer state.
-   FR-TIMER-04: Timer state shall remain consistent when a participant
    joins after the timer has started.

**Acceptance criteria**

-   A newly joined participant sees the current room timer state rather
    than starting an unrelated local timer.
-   Participants see the same focus/break phase and remaining time,
    subject to normal network and display latency.
-   The default cycle is 50/10.

The source does not define who may start, pause, reset, or advance the
timer, nor how timer state behaves when everyone leaves. These are open
product decisions.

### 6.5 Live study-status tags

**Priority:** P0

-   FR-STATUS-01: A participant shall be able to publish a short
    current-study status in the room.
-   FR-STATUS-02: Room participants shall be able to see each other's
    status tags.
-   FR-STATUS-03: Status changes shall propagate in real time.

**Acceptance criteria**

-   A participant can set and update a status tag.
-   Other participants see the updated tag without refreshing.
-   The status is associated with the correct participant and room.

Maximum tag length and allowed characters are not defined in the source
and must be decided during implementation.

### 6.6 Shared session checklist

**Priority:** P0

-   FR-CHECK-01: Each study room shall provide a shared checklist for
    session milestones.
-   FR-CHECK-02: Participants shall be able to add checklist items.
-   FR-CHECK-03: Participants shall be able to mark checklist items as
    complete or incomplete.
-   FR-CHECK-04: Checklist changes shall synchronize in real time for
    all room participants.

**Acceptance criteria**

-   A participant can add a milestone to the current room checklist.
-   A participant can mark a milestone complete or incomplete.
-   Other participants see changes without refreshing.
-   Checklist items remain associated with the correct room.

The source does not define checklist ownership, deletion permissions,
ordering, or whether a checklist persists after a room session ends.
Confirm these behaviours before finalizing the data model.

### 6.7 Module group forum

**Priority:** P0

-   FR-FORUM-01: Each supported module shall have a persistent forum or
    noticeboard.
-   FR-FORUM-02: Students and admins shall be able to post
    module-related updates and resources.
-   FR-FORUM-03: Forum posts shall support schedule updates, including
    changes to session times.
-   FR-FORUM-04: Admins shall be able to pin announcements.
-   FR-FORUM-05: Forum updates shall be available to relevant module
    members.
-   FR-FORUM-06: Forum updates shall be reflected in real time where
    supported by Supabase Realtime.

**Acceptance criteria**

-   A student can view the forum for a selected module.
-   An authorized user can create a post.
-   A schedule change can be communicated through a forum post.
-   An admin can pin an announcement.
-   A pinned announcement is visibly distinguished from ordinary posts.
-   Unauthorized users cannot perform admin-only moderation actions.

The source mentions sharing study notes but does not specify attachment
formats, file-size limits, storage rules, or content moderation
workflow. These need explicit decisions.

## 7. Non-functional requirements

### 7.1 Security and privacy

-   Enforce authorization in both the Express API and Supabase RLS.
-   Do not rely on frontend-only role checks.
-   Protect live-room access through backend-generated provider tokens.
-   Do not expose privileged Supabase service credentials in frontend
    code.
-   Validate and authorize all writes to rooms, checklists, status tags,
    and forums.
-   Define how users report abuse and how admins moderate it before a
    public launch; the source establishes a safety/moderation role but
    does not define a reporting workflow.

### 7.2 Performance and realtime behaviour

-   Enforce room capacity on the server, including concurrent join
    attempts.
-   Use Supabase Realtime for checklist, room-presence, and forum
    updates.
-   Configure video tiles for low-bandwidth use, targeting 240p/360p.
-   Keep timer state authoritative and synchronized rather than relying
    on independent client countdowns.

The source does not specify numeric API latency, uptime, or realtime
delivery service-level objectives.

### 7.3 Compatibility and responsiveness

-   The web application shall provide responsive mobile and desktop
    layouts.
-   The UI shall follow the approved Google Stitch designs.
-   The frontend shall use Lucide Icons (`lucide-react`) exclusively for
    iconography; the source explicitly specifies no emojis.

### 7.4 Maintainability and quality

-   Use TypeScript for the React frontend and Node.js/Express backend.
-   Run linting, type checking, automated tests, and production builds
    through GitHub Actions on every pull request.
-   Maintain unit and integration tests for core business rules and
    protected workflows.

## 8. UI/UX screen and interaction specification

This section translates the confirmed MVP functionality into a screen inventory and screen-level requirements for design in Google Stitch. It does not introduce additional product features. Where the PRD does not define a visual or interaction detail, that detail is recorded as an open question in Section 14 rather than silently decided.

### 8.1 Screen and pop-up inventory

The following screens are directly supported by the MVP requirements.

| ID | Screen | Primary role | Purpose | Supporting requirements |
|---|---|---|---|---|
| S01 | Authentication — Sign up / Log in | Student and admin | Create an account or sign in using email and password | FR-AUTH-01, FR-AUTH-02 |
| S02 | Student module profile | Student | Select an institution and one or more active modules | FR-MOD-01, FR-MOD-02 |
| S03 | Module room discovery | Student | Discover rooms associated with the student's selected modules and see availability against the 20-person limit | FR-MOD-03, FR-MOD-04, FR-ROOM-02, FR-ROOM-03 |
| S04 | Silent study room | Student | Participate in video-only study with synchronized timer, participant status tags, and shared checklist | FR-ROOM-01–08, FR-TIMER-01–04, FR-STATUS-01–03, FR-CHECK-01–04 |
| S05 | Module forum / noticeboard | Student and admin | View and create module updates, schedule changes, and resource notices | FR-FORUM-01–03, FR-FORUM-05–06 |
| S06 | Admin module catalogue management | Admin | Manage or verify institution/module catalogue information | FR-MOD-05 |
| S07 | Admin forum moderation | Admin | Moderate module forum content and pin announcements | FR-FORUM-04; admin role requirements in Section 4.2 |

**Pop-ups and dialogs:** The source PRD does not explicitly define any named pop-up, modal, confirmation dialog, or overlay. Therefore, no separate pop-up is included in the confirmed screen inventory. Whether the design needs a sign-out confirmation, room-full dialog, camera-permission explanation, or other dialog remains an open question; do not invent these as committed requirements.

**Navigation:** The source does not prescribe a navigation model, global sidebar, bottom navigation, header layout, or route structure. Google Stitch should keep navigation visually restrained and limited to the controls necessary to move between the listed screens. The exact navigation pattern requires confirmation.

### 8.2 Screen specifications

All screens must be designed responsively for mobile and desktop. Each screen prompt must show the five required UI states: Normal, Empty, Loading, Error, Offline, and Success. The state descriptions below define only the behaviour supported by this PRD. Where a specific error message or empty-state action is not specified, use a neutral state treatment and raise the exact wording/action as an open question.

#### S01 — Authentication: Sign up / Log in

**Purpose:** Allow users to create an account or sign in with email and password through Supabase Auth.

**Normal state**
- Present the StudySync product name.
- Present a clear Sign up and Log in mode.
- Sign up form contains an Email field and Password field.
- Log in form contains an Email field and Password field.
- Primary actions are labelled Sign up and Log in respectively.
- Do not add social login, phone login, profile fields, passwordless login, or unconfirmed authentication options.

**Empty state**
- Show the relevant form with fields empty.
- Keep the primary action visible.
- Do not show fabricated account data.

**Loading state**
- Show the active submit action in a loading state while authentication is processing.
- Prevent duplicate submissions while the request is in progress.

**Error state**
- Show an inline authentication error when sign-up or login fails.
- Do not invent a specific backend error message; use a neutral placeholder such as “Unable to authenticate. Please try again.” until exact copy is approved.

**Offline state**
- Indicate that authentication requires a network connection and cannot currently be completed.
- Keep entered form values visible where safe; do not imply the account has been created or the user signed in.

**Success state**
- After successful sign-up or login, show a brief confirmation and proceed to the appropriate next authenticated experience.
- The destination differs by role and setup completion; exact routing is not defined in the source and remains an open question.

#### S02 — Student module profile

**Purpose:** Let a student select their institution and active module codes.

**Normal state**
- Show an Institution selection control.
- Show an Active modules selection area.
- Support module-code examples `MAT2611` and `COS1511`.
- Provide a clear action to save the selected institution and modules.
- Do not add degree programmes, year of study, campus, timetable, or other profile fields; these are not in the PRD.

**Empty state**
- Show no institution selected and no active modules selected.
- Make the unselected state clear without inventing a catalogue or default institution.

**Loading state**
- Show loading treatment while institution/module catalogue data is being retrieved or profile selections are being saved.

**Error state**
- Show a neutral error if catalogue data cannot be loaded or profile selections cannot be saved.
- Do not fabricate catalogue contents or a detailed cause.

**Offline state**
- Indicate that institution/module catalogue retrieval or saving cannot be completed without a connection.
- Do not claim selections have been saved when the backend has not confirmed them.

**Success state**
- Show the saved institution and selected active module codes.
- Confirm that the profile selections were saved.
- The exact success message is not prescribed.

#### S03 — Module room discovery

**Purpose:** Help students discover study rooms associated with their selected institution and modules.

**Normal state**
- Show the student's selected module codes as the context for discovery.
- Present rooms filtered by those modules.
- Each room result must identify its module and show participant occupancy in relation to the 20-person maximum.
- Provide a Join room action for a room with an available seat.
- Do not invent room names, schedules, host names, ratings, or participant profiles.

**Empty state**
- Show when no rooms are currently available for the selected module(s).
- Explain that no matching rooms are currently available.
- Do not invent a create-room action because room creation permissions and lifecycle are unresolved.

**Loading state**
- Show loading placeholders while module-specific rooms are being retrieved.

**Error state**
- Show a neutral message if room discovery fails.
- Provide a retry affordance only if retry is supported by the implementation.

**Offline state**
- Indicate that live room availability cannot be refreshed while offline.
- Do not present stale occupancy as current unless it is explicitly marked as last-known information; the PRD does not define stale-data behaviour.

**Success state**
- Show the returned module-specific rooms and their current occupancy.
- After a successful join operation, transition to the study room screen.

**Full-room condition**
- A room with 20 participants must be visibly unavailable for joining.
- The PRD requires the backend to reject an additional participant. Exact UI copy for the full-room condition is not specified.

#### S04 — Silent study room

**Purpose:** Provide a silent video-only room for up to 20 students studying the same module, with synchronized focus/break timer, status tags, and shared checklist.

**Normal state — layout**
- Identify the module associated with the room.
- Show participant video tiles in a responsive grid.
- Design for a maximum of 20 participants.
- Make it clear that the room is silent and microphones are disabled.
- Target low-bandwidth video tiles at 240p/360p.
- Show the shared Pomodoro timer prominently, with the current phase and remaining time.
- Use the default 50-minute focus / 10-minute break cycle.
- Show participant study-status tags, including the supported example “Chapter 1 – Differential Equations”.
- Show a shared session checklist within the room experience.
- Provide an input/action to add a checklist milestone.
- Allow participants to mark checklist items complete or incomplete.
- Do not add chat, voice controls, screen sharing, reactions, recording, private messaging, or other meeting features not specified in the PRD.

**Empty state**
- If no checklist items exist, show an empty checklist state.
- If no other participants are present, show the current user's room presence without fabricating other participants.
- The source does not define whether a room can exist with zero participants or the exact first-user message; ask for confirmation.

**Loading state**
- Show a room-loading state while room membership, video connection, timer state, participant presence, and checklist data initialize.
- Distinguish loading from a successfully joined room.

**Error state**
- Provide visible error treatment for room join failure, video connection failure, timer/checklist loading failure, or a rejected room-capacity request.
- Do not invent technical diagnostics or provider-specific wording.

**Offline state**
- Show that the connection has been lost and that live video, participant presence, timer synchronization, and checklist updates may not be current.
- Do not imply offline checklist changes are queued or synchronized later; offline write behaviour is not specified.

**Success state**
- Show the user as joined.
- Show current participant occupancy.
- Show live video tiles with audio disabled.
- Show the current synchronized timer phase and remaining time.
- Show participant status tags.
- Show the shared checklist with real-time updates.
- Reflect successful checklist creation or completion changes to all participants.

**Room-capacity state**
- Maximum occupancy is 20.
- If the room is full, do not allow entry and clearly communicate that the room has reached capacity.
- Do not create a waitlist or automatic alternative-room recommendation; neither is specified.

**Important unresolved interactions**
- Who starts, pauses, resets, or advances the timer is not specified.
- Room creation, scheduling, and closure rules are not specified.
- Checklist deletion, ordering, persistence, and ownership rules are not specified.
- Camera permission and camera-off behaviour are not fully specified, even though the experience is described as camera-on.

#### S05 — Module forum / noticeboard

**Purpose:** Provide persistent module threads for schedule coordination, announcements, and study-resource notices.

**Normal state**
- Identify the module whose forum is being viewed.
- Show forum posts in a readable chronological or otherwise clearly organized list; exact ordering is not specified.
- Each post should identify its author and content.
- Support schedule-update content, for example: “Session moved from 16:00 to 18:00.”
- Support resource-notice content and study-note sharing.
- Provide a post composer for an authorized student or admin.
- Do not invent comments, reactions, direct messages, polls, or attachment controls.

**Empty state**
- Show when the module has no forum posts.
- Explain that no posts are available yet.
- Do not invent seeded announcements.

**Loading state**
- Show loading placeholders while forum posts are retrieved.

**Error state**
- Show a neutral error when forum content cannot be loaded or a post cannot be submitted.

**Offline state**
- Indicate that forum content may not be current and new posts cannot be confirmed while offline.
- Do not imply offline posts are queued for later delivery.

**Success state**
- Show the published post in the module forum after backend confirmation.
- Show pinned announcements distinctly when the current module has a pinned announcement.
- Reflect new posts and pin updates in real time where available.

#### S06 — Admin module catalogue management

**Purpose:** Allow an authorized admin to manage or verify institution and module catalogue information.

**Normal state**
- Clearly identify this as an admin-only area.
- Show institution and module catalogue information needed for verification/management.
- Support module codes such as `MAT2611` and `COS1511`.
- Provide only catalogue management controls that are confirmed by the implementation's agreed admin permissions.
- Do not invent bulk import, external integrations, audit dashboards, approval queues, or catalogue fields not defined in the PRD.

**Empty state**
- Show when the catalogue contains no entries available to the current admin.
- Do not fabricate institution or module records.

**Loading state**
- Show loading treatment while catalogue records are retrieved or a catalogue change is saved.

**Error state**
- Show a neutral message when catalogue data cannot be loaded or a permitted change fails.

**Offline state**
- Indicate that catalogue information cannot be refreshed or changes confirmed while offline.

**Success state**
- Show the updated catalogue information after a successful authorized operation.
- Exact create/edit/delete/verify actions and success copy remain subject to the admin permission decision.

#### S07 — Admin forum moderation

**Purpose:** Allow admins to moderate module forums and pin announcements.

**Normal state**
- Clearly identify the admin moderation context and current module.
- Show module forum posts.
- Visually distinguish pinned announcements from ordinary posts.
- Provide the confirmed admin action to pin an announcement.
- Include other moderation controls only after their permissions and behaviours are confirmed.
- Do not invent report queues, user bans, content-removal workflows, moderation analytics, or escalation tooling.

**Empty state**
- Show when the module forum contains no posts to moderate.

**Loading state**
- Show loading treatment while forum posts are retrieved or a pin action is processing.

**Error state**
- Show a neutral message when posts cannot be loaded or an admin pin action fails.
- Show an authorization error if a non-admin attempts to access this screen.

**Offline state**
- Indicate that moderation changes cannot be confirmed while offline.

**Success state**
- Show the post as pinned after the backend confirms the action.
- Reflect the pinned state in the student-facing module forum.

### 8.3 Shared UI components

Use these shared components consistently across the screens above. This inventory is limited to components required by the confirmed requirements.

| Component | Purpose | Required content / behaviour | Used on |
|---|---|---|---|
| StudySync brand/header area | Identify the product and current screen context | Display the StudySync name; avoid inventing a logo asset or tagline | S01–S07 |
| Form field | Collect email/password or module profile selections | Clear label, input/select area, validation/error presentation | S01, S02 |
| Primary action button | Trigger the main screen action | Clear action label; support normal, loading, disabled, and success feedback where applicable | S01–S07 |
| Secondary action button | Provide a secondary screen action where required | Lower visual emphasis than the primary action | As needed; exact actions must be supported by screen requirements |
| Module identifier | Identify the institution/module context | Display module codes such as `MAT2611` and `COS1511` | S02–S07 |
| Room result item | Represent a discoverable study room | Module identifier, participant count / 20 capacity, join availability | S03 |
| Participant video tile | Represent a live room participant | Video area, participant identity label if available, study-status tag; no audio control | S04 |
| Participant status tag | Display a participant's current study focus | Example: “Chapter 1 – Differential Equations”; support live update | S04 |
| Pomodoro timer | Display shared focus/break state | Phase label, remaining time, default 50/10 cycle | S04 |
| Shared checklist item | Represent a session milestone | Item text and complete/incomplete control | S04 |
| Checklist composer | Add a shared session milestone | Text entry and add action; no extra fields unless confirmed | S04 |
| Forum post item | Display a module post | Author, post content, and pinned distinction when applicable | S05, S07 |
| Forum composer | Create a module forum post | Text entry and publish action; attachments are not assumed | S05 |
| Pinned announcement marker | Distinguish pinned content | Clear visual treatment for a pinned post | S05, S07 |
| State feedback | Communicate loading, empty, error, offline, and success states | Consistent message placement and visual treatment; exact copy only where defined | S01–S07 |
| Icon | Support navigation and actions | Lucide Icons (`lucide-react`) only; no emojis or other icon libraries | S01–S07 |

**Component consistency rules**
- Reuse the same component shapes, control treatments, and state feedback patterns across all screens.
- Do not introduce additional product capabilities through decorative controls.
- Every visible control must correspond to a requirement or a confirmed decision.
- Do not display microphone controls in study rooms.
- Do not show more than 20 participant tiles in a room.
- Do not show invented user names, institutions, module catalogues, room schedules, forum posts, or analytics as if they were real product data. Where sample content is needed for the mock-up, use only the examples explicitly listed in this PRD and mark any illustrative placeholder as sample content.

## 9. Design values and visual constraints

This section records only design-relevant values and constraints explicitly present in the existing PRD and its source business specification. It intentionally does not invent a colour palette, font family, type scale, spacing scale, corner radius, shadow style, illustration style, or brand personality.

### 9.1 Confirmed design values

| Value | Confirmed requirement |
|---|---|
| Product name | StudySync |
| Target experience | Responsive web application for mobile and desktop |
| Icon library | Lucide Icons via `lucide-react` exclusively |
| Icon restriction | Zero emojis; do not use emoji as icons |
| Study-room mode | Silent, camera-on, video-only study experience |
| Microphone | Disabled at room level (`audioSource: false`); no microphone controls |
| Video quality target | Low-bandwidth 240p/360p video tiles |
| Room capacity | Maximum 20 participants |
| Timer | Shared Pomodoro timer; 50-minute focus and 10-minute break default |
| Collaboration | Shared checklist with real-time updates |
| Presence | Room participant presence and status tags update in real time |
| Status-tag example | “Chapter 1 – Differential Equations” |
| Module-code examples | `MAT2611`, `COS1511`, `ECS1501` |
| Schedule-update example | “Session moved from 16:00 to 18:00” |
| Backend/data context | Hosted Supabase, Supabase Auth, PostgreSQL, Supabase Realtime |
| Frontend context | React + TypeScript |

### 9.2 Values not defined by the PRD

The following visual decisions are deliberately unspecified and must be confirmed rather than invented:

- Brand colour palette and semantic colours.
- Light mode, dark mode, or both.
- Font family and typography scale.
- Spacing, grid, and layout-token system.
- Border, radius, elevation, and shadow values.
- Button, input, card, and navigation visual variants beyond their required function.
- Logo, brand mark, tagline, illustration, and photography direction.
- Exact mobile navigation pattern.
- Exact desktop navigation pattern.
- Motion and animation rules.
- Exact copy for most validation, error, offline, and success messages.

Google Stitch prompts must use the confirmed values above and neutral placeholders for unspecified visual tokens. The generated style guide should explicitly flag these missing decisions rather than silently choosing them.

## 10. Technical architecture

  -----------------------------------------------------------------------
  Layer                               Required technology /
                                      responsibility
  ----------------------------------- -----------------------------------
  Frontend                            React + TypeScript; responsive UI;
                                      Lucide Icons

  Backend                             Node.js + Express + TypeScript;
                                      validation, authorization, capacity
                                      enforcement, video-token generation

  Database                            Hosted Supabase PostgreSQL

  Authentication                      Supabase Auth

  Database authorization              Supabase Row-Level Security

  Realtime                            Supabase Realtime for checklists,
                                      room presence, and forum updates

  Video                               WebRTC SDK; Daily.co or LiveKit to
                                      be selected

  CI                                  GitHub Actions: lint, typecheck,
                                      test, build
  -----------------------------------------------------------------------

### 10.1 Architectural principles

1.  The backend is authoritative for room capacity and protected
    operations.
2.  Database RLS is a second authorization boundary, not a replacement
    for API authorization.
3.  Realtime updates are used for collaborative state; persistent
    records remain in the database where appropriate.
4.  Video access is granted through backend-generated tokens.
5.  The video provider is abstracted where practical so the product is
    not unnecessarily coupled to an unconfirmed provider.

## 11. High-level data entities

The following are logical entities inferred from the product
requirements. They are not a finalized database schema.

  -----------------------------------------------------------------------
  Entity                  Purpose                 Likely relationships
  ----------------------- ----------------------- -----------------------
  User profile            Stores application      Belongs to an
                          profile and role-linked authenticated Supabase
                          information             user

  Institution             Represents a university Has modules
                          or institution          

  Module                  Represents a module     Belongs to an
                          code and catalogue      institution; has
                          entry                   students, rooms, and
                                                  forum posts

  Student module          Associates a student    Links user profile and
  enrolment               with an active module   module

  Study room              Represents a module     Belongs to a module;
                          study room and its      has participants, timer
                          state                   state, and checklist
                                                  items

  Room participant /      Represents a user's     Links user and room
  presence                current room            
                          participation           

  Study status            Stores a participant's  Links participant and
                          current status tag      room

  Timer state             Stores the              Belongs to a room
                          authoritative           
                          focus/break cycle state 

  Checklist item          Stores a shared session Belongs to a room
                          milestone and           
                          completion state        

  Forum post              Stores a module         Belongs to a module and
                          discussion, schedule    author
                          update, or resource     
                          notice                  

  Announcement pin        Represents pinned forum Links an admin action
                          content or pin state    to a forum post
  -----------------------------------------------------------------------

Final columns, constraints, indexes, retention rules, and RLS policies
must be designed before migrations are considered complete.

## 12. UX and interface requirements

-   Use the approved Stitch designs as the visual source of truth.
-   Provide responsive layouts for mobile and desktop.
-   Use Lucide Icons only; do not use emoji iconography.
-   Make room capacity and full-room states clear to students.
-   Make the silent/video-only nature of study rooms clear before
    joining.
-   Display timer phase and remaining time prominently.
-   Make checklist changes and pinned forum announcements easy to
    identify.
-   Provide loading, empty, error, and offline/network-disconnected
    states for core flows. These states are implementation expectations;
    exact screen designs should follow the approved designs.

## 13. Release acceptance checklist

The MVP is ready for release when:

-   [ ] Email/password registration and login work through Supabase
    Auth.
-   [ ] `student` and `admin` roles are enforced by Express middleware
    and RLS.
-   [ ] Students can save an institution and active module selections.
-   [ ] Students can discover module-specific rooms.
-   [ ] The backend enforces the 20-participant room limit, including
    concurrent joins.
-   [ ] Study rooms operate in silent, video-only mode.
-   [ ] Video tiles are configured for the intended low-bandwidth
    quality.
-   [ ] Room presence and participant status tags update in real time.
-   [ ] The default 50/10 timer is synchronized for all room
    participants.
-   [ ] Shared checklist additions and completion changes synchronize in
    real time.
-   [ ] Module forums support posts and schedule updates.
-   [ ] Admins can pin announcements and access authorized moderation
    controls.
-   [ ] Core unit and integration tests pass.
-   [ ] Lint, typecheck, test, and production build pass in GitHub
    Actions.
-   [ ] Frontend and backend are deployed and connected to hosted
    Supabase.
-   [ ] Mobile and desktop layouts have been checked against Stitch
    designs.
-   [ ] README includes live URL, Stitch link, student/admin test
    logins, screenshots, and document links.
-   [ ] A five-minute-or-less investor pitch and live-demo recording are
    prepared before the stated deadline.

## 14. Open decisions and unresolved requirements

These items are not answered by the source specification and must not be
silently assumed:

1.  **Video provider:** Select Daily.co or LiveKit.
2.  **Room lifecycle:** Decide who can create rooms, whether rooms are
    scheduled or persistent, and when inactive rooms close.
3.  **Room join concurrency:** Define the exact transaction/locking
    approach used to guarantee the 20-seat limit.
4.  **Timer controls:** Decide who can start, pause, reset, or advance
    the shared timer.
5.  **Admin provisioning:** Define who can grant or revoke the `admin`
    role.
6.  **Admin permission levels:** Confirm whether class reps, tutors,
    moderators, and platform admins share one role or need separate
    permissions.
7.  **Module catalogue:** Define initial institutions/modules and the
    process for requesting or approving new entries.
8.  **Checklist lifecycle:** Decide whether items persist between
    sessions and who can edit or delete them.
9.  **Forum attachments:** Confirm whether MVP posts support file
    uploads, allowed formats, and limits.
10. **Moderation and reporting:** Define user reporting, content
    removal, and escalation workflows.
11. **Room status tags:** Set length limits and validation rules.
12. **Analytics:** Define event tracking and exact calculation rules for
    retention and study-minute metrics.
13. **Deployment providers:** The source requires live deployment but
    does not name frontend/backend hosting providers.
14. **Test accounts:** Define a safe process for creating student and
    admin demo accounts.

## 15. Source alignment

This PRD is based on the supplied **Business Plan & MVP Specification:
StudySync**. Product scope, target users, business model context,
success metrics, Day 1 feature groups, stack, and milestone dates are
derived from that source. Logical data entities, acceptance criteria,
quality checks, and open questions are structured elaborations to make
the source implementable; they are not additional confirmed product
decisions.
