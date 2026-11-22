# StudySync --- Implementation Plan

**Document status:** MVP delivery plan\
**Product:** StudySync\
**Version:** 1.0\
**Target deadline:** Wednesday, 25 November 2026, 15:30 SAST\
**Development approach:** Phased delivery with test-driven verification

------------------------------------------------------------------------

## 1. Objective

Deliver the StudySync MVP described in `PRD.md`: authenticated
student/admin access, module-based discovery, silent 20-person study
rooms, synchronized 50/10 Pomodoro timer, live status tags, shared
checklist, and module forums.

The implementation must use the specified stack:

-   React + TypeScript frontend.
-   Node.js + Express + TypeScript backend.
-   Hosted Supabase PostgreSQL, Auth, RLS, and Realtime.
-   Daily.co or LiveKit for video-only WebRTC rooms (provider selection
    is an early blocking decision).
-   GitHub Actions for lint, typecheck, tests, and production build.

## 2. Delivery milestones

  -----------------------------------------------------------------------
  Phase                   Date                    Main outcome
  ----------------------- ----------------------- -----------------------
  Phase 1 --- Foundation, Sunday, 22 November     Project structure,
  designs, CI             2026                    documentation, designs,
                                                  Supabase foundation,
                                                  RLS baseline, CI

  Phase 2 --- Auth,       Monday, 23 November     Working authentication,
  roles, forum, room      2026                    role enforcement,
  shell                                           module discovery, room
                                                  capacity, checklist,
                                                  forum

  Phase 3 --- Silent      Tuesday, 24 November    Video-only rooms,
  video rooms and TDD     2026                    synchronized
                                                  timer/status, automated
                                                  test completion,
                                                  deployment

  Phase 4 --- Polish,     Wednesday, 25 November  Responsive QA,
  README, demo freeze     2026 by 13:30           documentation, test
                                                  accounts, investor
                                                  pitch and live demo
                                                  recording

  Final deadline          Wednesday, 25 November  MVP handoff/submission
                          2026, 15:30             
  -----------------------------------------------------------------------

The dates and milestone sequence are taken from the supplied
specification. Any schedule change should be recorded explicitly.

## 3. Phase 1 --- Foundation, designs, and CI

**Target:** Sunday, 22 November 2026

### 3.1 Documentation and design

-   [ ] Finalize `BUSINESS.md`.
-   [ ] Create and review `docs/PRD.md`.
-   [ ] Create and review `IMPLEMENTATION_PLAN.md`.
-   [ ] Complete Google Stitch designs.
-   [ ] Store approved design references under `docs/designs/`.
-   [ ] Identify the required screens and shared UI components from the
    approved designs.
-   [ ] Confirm unresolved product decisions that block implementation,
    especially video provider, admin provisioning, and room/timer
    lifecycle.

### 3.2 Repository and application setup

-   [ ] Create the React + TypeScript frontend application.
-   [ ] Create the Node.js + Express + TypeScript backend application.
-   [ ] Establish a consistent repository structure and development
    scripts.
-   [ ] Configure environment-variable handling for local development
    and deployment.
-   [ ] Add formatting/lint configuration and TypeScript compiler
    checks.
-   [ ] Add a README with setup instructions and environment-variable
    names (never commit secrets).
-   [ ] Use `lucide-react` for all icons; do not introduce emoji
    iconography.

### 3.3 Supabase foundation

-   [ ] Create or configure the hosted Supabase project.
-   [ ] Configure Supabase Auth for email/password registration and
    login.
-   [ ] Design initial PostgreSQL tables for profiles, institutions,
    modules, enrolments, rooms, room participants/presence, timer state,
    checklist items, and forum posts.
-   [ ] Add migrations or another repeatable schema-management process.
-   [ ] Define role storage and the controlled admin-provisioning
    approach.
-   [ ] Implement baseline RLS policies for each table.
-   [ ] Test policies using student and admin identities.
-   [ ] Configure Supabase Realtime for checklist, room-presence, and
    forum updates.

**Important:** Treat the proposed entities as a starting point, not a
finalized schema. Confirm lifecycle and permission decisions before
locking the schema.

### 3.4 CI pipeline

-   [ ] Configure GitHub Actions to run on every pull request.
-   [ ] Add lint step.
-   [ ] Add TypeScript typecheck step.
-   [ ] Add automated test step.
-   [ ] Add production build step.
-   [ ] Ensure a failing check blocks successful CI status.

**Phase 1 exit criteria**

-   Frontend and backend run locally.
-   Hosted Supabase project is reachable through environment
    configuration.
-   Initial schema and RLS policies are applied and tested.
-   Realtime is enabled for the required data areas.
-   GitHub Actions runs lint, typecheck, tests, and build.
-   PRD, implementation plan, business document, and design references
    are in the repository.

## 4. Phase 2 --- Authentication, roles, forum, and room shell

**Target:** Monday, 23 November 2026

### 4.1 Authentication and authorization

-   [ ] Implement email/password registration.
-   [ ] Implement login and logout.
-   [ ] Implement authenticated frontend route handling.
-   [ ] Add backend authentication middleware that validates
    Supabase-issued identity tokens.
-   [ ] Add role-loading and role-enforcement middleware for `student`
    and `admin`.
-   [ ] Ensure admin privileges cannot be self-assigned from client
    input.
-   [ ] Verify RLS independently of frontend route guards and API
    middleware.

**Tests**

-   [ ] Registration and login success cases.
-   [ ] Invalid credentials and unauthenticated access.
-   [ ] Student denied from admin-only API actions.
-   [ ] Admin access to authorized admin actions.
-   [ ] Direct database access attempts rejected by RLS where
    unauthorized.

### 4.2 Institution and module profile

-   [ ] Create institution and module catalogue read endpoints or
    queries.
-   [ ] Implement institution selection in the student profile.
-   [ ] Implement active-module selection.
-   [ ] Persist student-module associations.
-   [ ] Implement module-based room discovery.
-   [ ] Add admin capability for the module-catalogue management
    required by the agreed permission model.

**Tests**

-   [ ] Student can save and retrieve institution/module selections.
-   [ ] Discovery filters rooms by selected modules.
-   [ ] A student cannot modify another student's module profile.

### 4.3 Room shell and capacity enforcement

-   [ ] Implement room listing and room details.
-   [ ] Implement the agreed room creation/lifecycle behaviour.
-   [ ] Implement a backend-controlled join operation.
-   [ ] Enforce a hard maximum of 20 active participants on the backend.
-   [ ] Ensure the capacity check and participant reservation are atomic
    or otherwise safe under concurrent requests.
-   [ ] Implement leave-room behaviour and presence cleanup.
-   [ ] Add clear full-room and join-error UI states.

**Tests**

-   [ ] A room with fewer than 20 participants accepts a valid join.
-   [ ] A room with 20 participants rejects another join.
-   [ ] Concurrent attempts for the final seat cannot produce 21
    participants.
-   [ ] Leaving a room releases the participant slot.
-   [ ] Unauthorized users cannot join rooms they are not permitted to
    access.

### 4.4 Shared checklist

-   [ ] Implement checklist item creation.
-   [ ] Implement complete/incomplete updates.
-   [ ] Persist checklist state against the relevant room.
-   [ ] Subscribe room clients to checklist changes using Supabase
    Realtime.
-   [ ] Implement loading, empty, error, and disconnected states.

**Tests**

-   [ ] Authorized participant can add an item.
-   [ ] Authorized participant can update completion state.
-   [ ] Other room participants receive the update.
-   [ ] A user outside the room cannot modify its checklist.

### 4.5 Module forum

-   [ ] Implement module forum listing.
-   [ ] Implement forum post creation.
-   [ ] Support schedule updates and resource-notice posts.
-   [ ] Implement admin-only pin/unpin behaviour.
-   [ ] Subscribe to forum updates using Supabase Realtime.
-   [ ] Add loading, empty, error, and moderation states.

**Tests**

-   [ ] Authorized module member can view and create posts.
-   [ ] Unrelated or unauthorized user cannot access restricted module
    content.
-   [ ] Student cannot pin an announcement unless explicitly authorized
    by the final permission model.
-   [ ] Admin can pin an announcement.
-   [ ] New posts and pin changes are reflected for other viewers.

**Phase 2 exit criteria**

-   Authentication and role enforcement work end to end.
-   Students can select modules and discover relevant rooms.
-   Room capacity is enforced by the backend.
-   Checklist updates synchronize in real time.
-   Module forum supports posts, schedule notices, and admin-pinned
    announcements.
-   Core authorization and capacity tests pass.

## 5. Phase 3 --- Silent live video rooms, timer, status, and TDD

**Target:** Tuesday, 24 November 2026

### 5.1 Select and configure video provider

-   [ ] Make and document the Daily.co versus LiveKit decision.
-   [ ] Create the provider project and configure allowed
    origins/domains.
-   [ ] Store provider secrets only in backend environment variables.
-   [ ] Implement backend-generated room access tokens.
-   [ ] Define how application room IDs map to provider room IDs.
-   [ ] Confirm provider settings support video-only participation and
    the intended participant count.

Do not begin a deep provider-specific integration until the provider
decision is made.

### 5.2 Video-only room integration

-   [ ] Integrate the selected WebRTC SDK into the room experience.
-   [ ] Configure audio to remain disabled at the room level
    (`audioSource: false`, as specified).
-   [ ] Configure video quality to target 240p/360p.
-   [ ] Render participant video tiles.
-   [ ] Handle camera permission denial and unavailable camera devices.
-   [ ] Handle reconnecting, participant departure, and provider errors.
-   [ ] Verify that microphone audio cannot be enabled through the
    application experience.

**Tests / verification**

-   [ ] A valid room participant receives a valid provider token.
-   [ ] A non-member or unauthorized user cannot obtain room access.
-   [ ] Room participants can see video tiles.
-   [ ] Microphone remains disabled.
-   [ ] Camera-denied and reconnect states are understandable.
-   [ ] The experience is tested on representative mobile and desktop
    browsers.

### 5.3 Synchronized Pomodoro timer

-   [ ] Implement persisted room timer state.
-   [ ] Set default focus duration to 50 minutes.
-   [ ] Set default break duration to 10 minutes.
-   [ ] Implement the agreed timer controller permissions.
-   [ ] Broadcast timer-state changes to room participants.
-   [ ] Ensure late joiners receive the current timer phase and
    remaining time.
-   [ ] Avoid treating each browser's independent countdown as the
    authoritative timer.

**Tests / verification**

-   [ ] Room participants see the same phase and remaining time within
    expected network/display latency.
-   [ ] A late joiner receives the current state.
-   [ ] Focus transitions to break and break transitions to focus
    according to the configured cycle.
-   [ ] Reconnect does not create a conflicting timer state.

### 5.4 Live status tags

-   [ ] Implement status-tag update endpoint or authorized data
    mutation.
-   [ ] Validate status-tag length and content according to the agreed
    limits.
-   [ ] Associate the status with the correct user and room.
-   [ ] Broadcast status updates through realtime subscriptions.

**Tests**

-   [ ] A participant can set and update their own status.
-   [ ] Other participants see the update.
-   [ ] A participant cannot impersonate another participant.

### 5.5 Automated testing and regression

-   [ ] Complete unit tests for capacity, authorization, timer
    transitions, and validation.
-   [ ] Complete integration tests for authentication, module discovery,
    room joining, checklist, and forum.
-   [ ] Add tests for the selected video-provider token endpoint.
-   [ ] Run the full CI pipeline.
-   [ ] Fix release-blocking failures before deployment.

### 5.6 Deployment

-   [ ] Configure production environment variables and secrets.
-   [ ] Deploy frontend and backend.
-   [ ] Connect deployed services to hosted Supabase.
-   [ ] Configure production CORS and allowed origins.
-   [ ] Apply production database migrations and RLS policies.
-   [ ] Verify auth redirect URLs and video-provider domain
    configuration.
-   [ ] Run smoke tests against the deployed application.

**Phase 3 exit criteria**

-   Silent video rooms work with the selected provider.
-   The backend still enforces the 20-person cap.
-   Timer and participant status are synchronized.
-   Automated tests pass.
-   Frontend and backend are deployed and connected to hosted Supabase.

## 6. Phase 4 --- Polish, documentation, and demo freeze

**Target:** Wednesday, 25 November 2026; complete by 13:30 SAST

### 6.1 UX and responsive QA

-   [ ] Compare implemented screens against approved Stitch designs.
-   [ ] Verify responsive layouts on mobile and desktop.
-   [ ] Check loading, empty, error, full-room, camera-denied, and
    disconnected states.
-   [ ] Verify the silent-room experience is clear to users.
-   [ ] Check that only Lucide icons are used.
-   [ ] Check forms, navigation, and primary user flows for usability
    issues.

### 6.2 Security and release checks

-   [ ] Re-test student/admin role boundaries.
-   [ ] Re-test RLS policies.
-   [ ] Re-test concurrent room joins.
-   [ ] Confirm no service-role keys or provider secrets are exposed to
    the frontend.
-   [ ] Confirm video tokens are issued only after authorization.
-   [ ] Confirm production environment configuration is correct.
-   [ ] Run lint, typecheck, tests, and production build on the release
    commit.

### 6.3 README and demo materials

-   [ ] Finalize `README.md`.
-   [ ] Add the live application URL.
-   [ ] Add the Google Stitch project link.
-   [ ] Provide student and admin test login instructions/credentials
    through an appropriate secure channel.
-   [ ] Add screenshots.
-   [ ] Link the PRD and implementation plan.
-   [ ] Record an investor pitch and live demo of no more than five
    minutes.
-   [ ] Verify the recording is accessible and demonstrates the working
    deployed MVP.

Do not commit real user passwords, production secrets, or private tokens
to the repository. Use dedicated demo accounts and share their
credentials only through an appropriate channel.

### 6.4 Demo walkthrough suggestion

The following sequence demonstrates the specified MVP features:

1.  Sign in as a student.
2.  Show institution and active-module selection.
3.  Discover a room for a selected module.
4.  Join the room and show the silent video grid and participant count.
5.  Show the synchronized 50/10 timer and a participant status tag.
6.  Add a checklist milestone and mark it complete; show the update on
    another participant's session.
7.  Open the module forum and publish a schedule update.
8.  Sign in as an admin and demonstrate a pinned announcement.
9.  Show that a student account cannot access admin-only controls.

This is a suggested demo order based on the required features, not an
additional product requirement.

**Phase 4 exit criteria**

-   Mobile and desktop QA is complete.
-   Security and regression checks pass.
-   README contains the required links, screenshots, and demo-account
    instructions.
-   Investor pitch and live demo recording are complete by 13:30 SAST.
-   The release is ready before the 15:30 SAST deadline.

## 7. Suggested repository structure

The following is a practical structure for the specified React/Express
stack. Adjust it to the existing repository if one already exists.

``` text
studysync/
├── apps/
│   ├── web/                     # React + TypeScript frontend
│   │   └── src/
│   │       ├── components/
│   │       ├── features/
│   │       │   ├── auth/
│   │       │   ├── modules/
│   │       │   ├── rooms/
│   │       │   ├── checklist/
│   │       │   └── forum/
│   │       ├── hooks/
│   │       ├── lib/
│   │       ├── pages/
│   │       └── types/
│   └── api/                     # Node.js + Express + TypeScript
│       └── src/
│           ├── middleware/
│           ├── modules/
│           │   ├── auth/
│           │   ├── institutions/
│           │   ├── modules/
│           │   ├── rooms/
│           │   ├── checklist/
│           │   ├── forum/
│           │   └── video/
│           ├── services/
│           ├── config/
│           └── types/
├── supabase/
│   ├── migrations/
│   └── tests/
├── docs/
│   ├── designs/
│   ├── PRD.md
│   └── IMPLEMENTATION_PLAN.md
├── .github/
│   └── workflows/
├── BUSINESS.md
└── README.md
```

## 8. Recommended implementation order within each feature

For each feature, follow this sequence:

1.  Confirm the behaviour and permissions from the PRD/open-decision
    list.
2.  Define the database changes and RLS policies.
3.  Implement backend validation, authorization, and business rules.
4.  Write unit and integration tests.
5.  Implement frontend states and API integration.
6.  Add realtime subscriptions where required.
7.  Verify the feature with at least two accounts where collaboration or
    roles are involved.
8.  Run the complete CI pipeline before merging.

This order is particularly important for role enforcement, room
capacity, and shared state. Do not rely on frontend-only restrictions
for security or business rules.

## 9. Cross-cutting test plan

  -----------------------------------------------------------------------
  Area                                Minimum verification
  ----------------------------------- -----------------------------------
  Authentication                      Registration, login, invalid
                                      credentials, protected routes

  Roles                               Student/admin separation in API and
                                      RLS

  Module profile                      Institution and module selection
                                      persist correctly

  Discovery                           Results are filtered by selected
                                      modules

  Room capacity                       20 participants allowed; 21st
                                      rejected; concurrent final-seat
                                      test

  Video                               Valid token, video tiles,
                                      microphone disabled, reconnect and
                                      camera-denied handling

  Timer                               50/10 defaults, synchronized state,
                                      late join, reconnect

  Status tags                         Own-status update, realtime
                                      propagation, no impersonation

  Checklist                           Add, complete/incomplete, realtime
                                      propagation, authorization

  Forum                               View, post, schedule notice, pin
                                      announcement, authorization

  Responsive UI                       Mobile and desktop layouts

  CI                                  Lint, typecheck, tests, production
                                      build

  Deployment                          Production smoke tests and
                                      environment configuration
  -----------------------------------------------------------------------

## 10. Risks and mitigations

  -----------------------------------------------------------------------
  Risk                    Why it matters          Mitigation
  ----------------------- ----------------------- -----------------------
  Video provider not      Video integration is a  Decide between Daily.co
  selected early          major Phase 3           and LiveKit at the
                          dependency              start of Phase 1

  Room capacity race      Two concurrent joins    Enforce capacity
  condition               could exceed 20 seats   atomically on the
                                                  backend and test
                                                  concurrent joins

  RLS misconfiguration    Student data or admin   Test RLS using separate
                          actions could be        student/admin
                          exposed                 identities; do not rely
                                                  only on UI checks

  Admin role can be       Unauthorized users      Use controlled
  self-assigned           could gain moderation   server-side
                          privileges              provisioning and deny
                                                  client role escalation

  Realtime state drift    Users may see different Persist authoritative
                          timer/checklist states  state and use realtime
                                                  updates as
                                                  synchronization signals

  Video bandwidth/device  Students may have       Target 240p/360p; test
  constraints             limited data or         camera-denied and
                          unavailable cameras     reconnect states

  Scope expansion         The deadline is short   Protect the five Day 1
                                                  feature groups; defer
                                                  monetization and
                                                  advanced analytics

  Undefined lifecycle     Room, timer, and        Resolve the open
  decisions               checklist behaviour may decisions before
                          become inconsistent     finalizing related
                                                  schema and flows
  -----------------------------------------------------------------------

## 11. Critical decisions to resolve immediately

The following are the highest-priority unanswered questions in the
source specification:

1.  Which video provider will be used: Daily.co or LiveKit?
2.  Who is allowed to create a room, and are rooms scheduled or
    persistent?
3.  Who controls starting, pausing, resetting, and advancing the timer?
4.  How are admin accounts created and approved?
5.  Are class representatives, tutors, moderators, and platform
    administrators all represented by the same `admin` role?
6.  Do checklist items persist after a session ends?
7.  Are resource attachments required in the MVP, or are forum posts
    text-only for the first release?

Record decisions in the PRD or an architecture decision log so the
implementation and tests use one agreed behaviour.

## 12. Definition of done

A feature is complete only when:

-   Its agreed behaviour is implemented.
-   Backend validation and authorization are in place.
-   RLS policies protect the underlying data.
-   Relevant automated tests pass.
-   Required realtime behaviour is verified with multiple clients.
-   Loading, empty, and error states are handled.
-   The feature works in the deployed environment.
-   The implementation does not contradict the PRD.

The MVP is complete when all P0 requirements in `PRD.md` pass the
release acceptance checklist and the Phase 4 deliverables are ready
before the stated deadline.

## 13. Source alignment

This plan follows the four phases and dates in the supplied **Business
Plan & MVP Specification: StudySync**. Tasks, exit criteria, test cases,
repository layout, and risk mitigations are implementation-level
elaborations of that specification. Unresolved product choices are
explicitly identified rather than treated as confirmed requirements.
