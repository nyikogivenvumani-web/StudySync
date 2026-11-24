# StudySync — Implementation Plan

**Document status:** MVP delivery plan (lightweight scope)
**Product:** StudySync
**Version:** 1.4
**Target deadline:** Wednesday, 25 November 2026, 15:30 SAST
**Development approach:** Phased delivery with test-driven verification

**Changes in v1.2:** aligned with PRD v1.2. Four feature areas were deferred to v2 to keep the work lightweight: camera enforcement and participant removal, room moderators with scheduling and expiry, forum file attachments, and dark mode. Changed items are marked **[v1.2]**.

**Changes in v1.3:** aligned with PRD v1.3: Daily.co selected as the video provider, motion and performance rules, creation-ordered checklist that stays readable after a room closes, "Closed rooms" list on discovery, 60-character status tags, "Edited" label on posts. Marked **[v1.3]**.

**Changes in v1.4:** aligned with PRD v1.4: simplified institution selection to institution type ("College" or "University") for current MVP to ensure on-time delivery; exhaustive DHET university/college catalogue listing deferred to v2. Marked **[v1.4]**.

---

## 1. Objective

Deliver the StudySync MVP described in `PRD.md` v1.4: authenticated student/admin access with password reset, module-based discovery and module requests, institution type selection (College/University), admin catalogue and room management, silent video-only 20-person study rooms, a synchronized 50/10 Pomodoro timer controlled by admins, live status tags, a persistent shared checklist, and text-based module forums with editing and admin moderation. **[v1.4]**

The implementation uses the specified stack:

- React + TypeScript frontend (single theme from the Stitch style guide). **[v1.2]**
- Node.js + Express + TypeScript backend.
- Hosted Supabase PostgreSQL, Auth, RLS, and Realtime.
- Daily.co for video-only WebRTC rooms (chosen by the product owner). Its pricing page lists 10,000 free participant minutes per month and $0.004 per participant minute after that (Daily pricing page, checked 23 November 2026). A 20-person, 50-minute session uses about 1,000 participant minutes, so keep test sessions short and small. **[v1.3]**
- GitHub Actions for lint, typecheck, tests, and production build.

## 2. Delivery milestones

| Phase | Date | Main outcome |
|---|---|---|
| Phase 1 — Foundation, designs, CI | Sunday, 22 November 2026 | Project structure, documentation, designs, Supabase foundation, RLS baseline, institution type baseline (College/University), CI |
| Phase 2 — Auth, roles, catalogue, forum, room shell | Monday, 23 November 2026 | Auth and password reset, role enforcement, module profile and requests, admin catalogue, room creation and capacity, checklist, forum |
| Phase 3 — Silent video rooms and TDD | Tuesday, 24 November 2026 | Video-only rooms, synchronized timer, status tags, automated test completion, deployment |
| Phase 4 — Polish, README, demo freeze | Wednesday, 25 November 2026 by 13:30 | Responsive QA, documentation, test accounts, investor pitch and live demo recording |
| Final deadline | Wednesday, 25 November 2026, 15:30 | MVP handoff/submission |

Any schedule change should be recorded explicitly.

## 3. Scope changes in v1.2

### 3.1 Deferred to v2 (do not build, design, or test now)

| Deferred area | Removed work |
|---|---|
| Camera enforcement and participant removal | Camera-mandatory rule, camera exceptions, "Report technical issue" flow, camera-off detection, kick/remove participant, remove-participant confirmation dialog, provider-side participant removal and token blocking |
| Room moderators, scheduling, and expiry | `room_moderators` table and nomination, two-moderator limit, room-level permission helper, scheduled sessions (`scheduled_start`), automatic expiry job |
| Forum file attachments | Supabase Storage bucket and policies, upload/validation, signed URLs, attachment UI |
| Dark mode | Dual theme tokens and dark variants, dark-mode QA |
| Exhaustive DHET institution catalogue | Full listing/dropdown of all South African universities and colleges; simplified to College/University type selection for MVP **[v1.4]** |

### 3.2 What remains in the MVP

- **Rooms:** created and closed by admins only, persistent until closed. Only admins control the timer. A participant whose camera is denied or unavailable sees a clear message and a placeholder tile; nothing else is enforced.
- **Checklist:** persists with the room, in creation order; creators can edit/delete their own items and admins can edit/delete any while the room is open; after the room closes it stays readable and read-only. **[v1.3]**
- **Forum:** text posts, edit own post, admin pin and admin remove-any-post.
- **Dialogs:** three confirmation dialogs (remove post, delete catalogue record, close room).
- **Kept from v1.1:** password reset, module requests and approval, DHET institution seed, admin catalogue CRUD, navigation shell, post-login routing.

### 3.3 Remaining cut line (if Phase 2 or 3 slips)

In order of what to defer first: hard delete of catalogue records (use archive only), the DHET seed beyond a representative subset of institutions, and edit/delete of checklist items (keep add and complete/incomplete). Do not cut capacity enforcement, role enforcement, the synchronized timer, or the demo walkthrough.

## 4. Phase 1 — Foundation, designs, and CI

**Target:** Sunday, 22 November 2026

### 4.1 Documentation and design

- [ ] Finalize `BUSINESS.md`.
- [ ] Review `docs/PRD.md` v1.3 and `IMPLEMENTATION_PLAN.md` v1.3.
- [ ] Update the Google Stitch prompts for v1.3 (single theme; "Closed rooms" section and read-only closed-room state; no moderator, camera-policy, attachment, or remove-participant designs). **[v1.3]**
- [ ] Complete Google Stitch designs for S01–S08 and the three dialogs.
- [ ] Export style-guide tokens to `docs/designs/` and store approved design references.
- [ ] Confirm blocking decisions: admin provisioning and the remaining items in PRD Section 14 (the video provider is decided: Daily.co).

### 4.2 Repository and application setup

- [ ] Create the React + TypeScript frontend application.
- [ ] Create the Node.js + Express + TypeScript backend application.
- [ ] Establish repository structure and development scripts.
- [ ] Configure environment-variable handling for local development and deployment.
- [ ] Add formatting/lint configuration and TypeScript compiler checks.
- [ ] Add a README with setup instructions and environment-variable names (never commit secrets).
- [ ] Use `lucide-react` for all icons; no emoji iconography.
- [ ] Apply the style-guide tokens as a single theme. **[v1.2]**
- [ ] Define motion tokens (durations 120 to 200 ms, ease-out), CSS transitions on `opacity`/`transform` only, and a global `prefers-reduced-motion` rule; no animation library (PRD Section 8.7). **[v1.3]**
- [ ] Set up route-level code splitting so the video SDK loads only on the room route. **[v1.3]**
- [ ] Create the single `NAV_ITEMS` config (`id`, `label`, `path`, `icon: LucideIcon`, `requiresAdmin?`) and the `<DesktopSidebar/>` and `<MobileBottomNav/>` components with a 1024px breakpoint.

### 4.3 Supabase foundation

- [ ] Create or configure the hosted Supabase project.
- [ ] Configure Supabase Auth for email/password registration, login, and password reset (set the reset redirect URL).
- [ ] Design initial tables: profiles, institutions / institution types (College/University), modules (with archived flag), `module_requests` (`pending`/`approved`/`rejected`, optional title), enrolments, rooms (module, open/closed state, created by admin), room participants/presence, study status (`CHECK` length 1 to 60 after trim), timer state, checklist items (creator, `created_at` for ordering, retained after the room closes), forum posts (text, `edited_at`). **[v1.4]**
- [ ] Add migrations or another repeatable schema-management process.
- [ ] Define role storage and the controlled admin-provisioning approach.
- [ ] Set up baseline institution types (College, University); comprehensive DHET institution seed deferred to v2. **[v1.4]**
- [ ] Implement baseline RLS policies for every table, including ownership-based checklist/forum editing and admin-only catalogue, room, timer, and moderation writes.
- [ ] Add RLS so module members can read a closed room's checklist but nobody can write to it, and so only the checklist item's creator or an admin can edit or delete it while the room is open. **[v1.3]**
- [ ] Test policies using student and admin identities.
- [ ] Configure Realtime for checklist, room presence, timer state, and forum updates.

**Important:** Treat the proposed entities as a starting point. Resolve open lifecycle items before locking the schema.

### 4.4 CI pipeline

- [ ] Configure GitHub Actions to run on every pull request.
- [ ] Add lint, TypeScript typecheck, automated test, and production build steps.
- [ ] Ensure a failing check blocks successful CI status.

**Phase 1 exit criteria**

- Frontend and backend run locally.
- Hosted Supabase project is reachable through environment configuration.
- Initial schema, RLS policies, and baseline institution options are applied and tested. **[v1.4]**
- Realtime is configured for the required data areas.
- Theme tokens and the navigation shell render in the single theme.
- GitHub Actions runs lint, typecheck, tests, and build.
- PRD, implementation plan, business document, and design references are in the repository.

## 5. Phase 2 — Auth, roles, catalogue, forum, and room shell

**Target:** Monday, 23 November 2026

### 5.1 Authentication, password reset, and authorization

- [ ] Implement email/password registration, login, and logout.
- [ ] Implement password reset: request screen and set-new-password screen (S08), with a neutral response that does not reveal whether an email is registered.
- [ ] Implement authenticated route handling and post-login redirect: missing modules → `/profile`; admin → `/admin/catalogue`; student → `/discover`.
- [ ] Add backend authentication middleware that validates Supabase-issued tokens.
- [ ] Add role-loading and role-enforcement middleware for `student` and `admin`.
- [ ] Ensure admin privileges cannot be self-assigned from client input.
- [ ] Verify RLS independently of frontend route guards and API middleware.

**Tests**

- [ ] Registration and login success; invalid credentials; unauthenticated access.
- [ ] Password reset request and set-new-password, including expired or invalid link.
- [ ] Post-login redirect for each of the three cases.
- [ ] Student denied from admin-only API actions; admin allowed.
- [ ] Direct database access attempts rejected by RLS where unauthorized.

### 5.2 Institution type, module profile, and module requests

- [ ] Create institution type and module catalogue read endpoints or queries. **[v1.4]**
- [ ] Implement institution type selection (College or University) and active-module selection in the student profile; persist associations. **[v1.4]**
- [ ] Implement the inline module request form on S02 (no modal) and the student's own request list with status.
- [ ] Implement admin module-request review: **Approve & Add** (insert into `modules`, mark `approved`, in a single transaction) and **Reject**.
- [ ] Implement admin catalogue actions: create/add, edit/update, verify, archive/delete (delete behind a confirmation dialog).
- [ ] Implement module-based room discovery.

**Tests**

- [ ] Student can save and retrieve institution type and module selections; cannot modify another student's profile. **[v1.4]**
- [ ] Student can create a request but cannot insert into `modules` or alter request status.
- [ ] Approve & Add creates the module and marks the request approved; Reject marks it rejected.
- [ ] Admin can create, edit, verify, archive/delete; student cannot.
- [ ] Discovery filters joinable open rooms by selected modules; closed rooms appear separately with read-only checklists.

### 5.3 Room creation, capacity, and closing **[v1.2]**

- [ ] Implement room listing and room details (module, occupancy, open/full state).
- [ ] Implement admin-only room creation and closing (closing behind a confirmation dialog). Closing sets the state to closed and keeps all room data, including the checklist. **[v1.3]**
- [ ] Implement a backend-controlled join operation with a hard maximum of 20 active participants, atomic or otherwise safe under concurrent requests.
- [ ] Implement leave-room behaviour and presence cleanup.
- [ ] Add full-room, closed-room, and join-error UI states.
- [ ] Add a "Closed rooms" section to room discovery (module, Closed badge, View checklist) and a read-only closed-room view of S04 (checklist only, no video, timer controls, or composer). **[v1.3]**

**Tests**

- [ ] Fewer than 20 accepts a valid join; 20 rejects another; concurrent final-seat attempts cannot produce 21.
- [ ] Leaving releases the slot.
- [ ] Only admins can create or close rooms.
- [ ] A closed room disappears from the open-room list and cannot be joined.
- [ ] A closed room appears under "Closed rooms" for students of that module and opens its checklist read-only. **[v1.3]**
- [ ] Unauthorized users cannot join rooms they are not permitted to access.

### 5.4 Shared checklist

- [ ] Implement checklist item creation and complete/incomplete updates, persisted against the room.
- [ ] Order items by `created_at` ascending; completing or editing an item never moves it. **[v1.3]**
- [ ] Make the checklist read-only once the room is closed (UI, API, and RLS). **[v1.3]**
- [ ] Implement edit and delete: creator for their own items; admin for any item. **[v1.2]**
- [ ] Subscribe room clients to checklist changes via Realtime.
- [ ] Implement loading, empty, error, and disconnected states.

**Tests**

- [ ] Authorized participant can add and update items; other participants receive the update.
- [ ] Participant can edit/delete own items but not others'; admin can.
- [ ] Items are still present after the room is revisited.
- [ ] Items render oldest first and keep their position when completed. **[v1.3]**
- [ ] After the room is closed, module members can read the checklist, and add/edit/complete/delete are rejected for everyone (UI, API, RLS). **[v1.3]**
- [ ] A user outside the room cannot modify its checklist.

### 5.5 Module forum **[v1.2]**

- [ ] Implement forum listing and text post creation, including schedule updates.
- [ ] Implement editing of own posts: set `edited_at` and show an "Edited" label only (no edit history). **[v1.3]**
- [ ] Implement admin pin/unpin and admin removal of any post (confirmation dialog).
- [ ] Subscribe to forum updates via Realtime.
- [ ] Add loading, empty, error, and moderation states.

**Tests**

- [ ] Authorized module member can view and create text posts.
- [ ] Unrelated or unauthorized user cannot access restricted module content.
- [ ] User can edit own post but not another's.
- [ ] Student cannot pin or remove others' posts; admin can pin and remove any post.
- [ ] New posts, edits, pins, and removals are reflected for other viewers.

**Phase 2 exit criteria**

- Authentication, password reset, role enforcement, and redirects work end to end.
- Students can select modules, request missing ones, and discover open rooms.
- Admins can manage the catalogue, review requests, and create and close rooms.
- Room capacity is enforced by the backend.
- Checklist updates synchronize in real time and persist.
- Forum supports text posts, edits, pinning, and admin removal.
- Core authorization and capacity tests pass.

## 6. Phase 3 — Silent live video rooms, timer, status, and TDD

**Target:** Tuesday, 24 November 2026

### 6.1 Select and configure video provider

- [ ] Record the decision: Daily.co, chosen by the product owner. **[v1.3]**
- [ ] Create the Daily account and API key; keep the API key in backend environment variables only. **[v1.3]**
- [ ] Store provider secrets only in backend environment variables.
- [ ] Implement backend-generated Daily meeting tokens through the Daily REST API, issued only to authorized users: scoped with `room_name`, a short `exp`, `user_id`, `user_name`, `start_audio_off: true`, and screen sharing disabled. Check whether participant permissions can restrict sending to video only and use that if available. **[v1.3]**
- [ ] Define how application room IDs map to provider room IDs.
- [ ] Create each Daily room when an admin creates a room: private (token required) with `max_participants` set to 20 as a second guard; the backend stays authoritative for capacity. **[v1.3]**
- [ ] Confirm provider settings support video-only participation and 20 participants.

Do not begin deep provider-specific integration until the decision is made.

### 6.2 Video-only room integration

- [ ] Integrate the selected WebRTC SDK into the room experience.
- [ ] Configure audio to remain disabled at the room level (`audioSource: false`).
- [ ] Configure video quality to target 240p/360p: publish a low simulcast layer with `updateSendSettings` (`maxQuality: 'low'`, with custom `encodings` if needed) and verify the actual resolution on a real device, because Daily's docs don't map presets to exact pixel sizes. Use receive settings so small tiles get lower-quality layers. **[v1.3]**
- [ ] Render participant video tiles (max 20).
- [ ] Handle camera permission denial and unavailable devices with a clear message and a placeholder tile. **[v1.2]**
- [ ] Handle reconnecting, participant departure, and provider errors.
- [ ] Verify that microphone audio cannot be enabled through the application.

**Tests / verification**

- [ ] A valid participant receives a valid token; a non-member or unauthorized user does not.
- [ ] Participants see video tiles; microphone remains disabled.
- [ ] Camera-denied and reconnect states are understandable.
- [ ] Tested on representative mobile and desktop browsers.

### 6.3 Synchronized Pomodoro timer

- [ ] Implement persisted room timer state; defaults of 50 minutes focus and 10 minutes break.
- [ ] Implement controller permissions: admin only; participants read-only. **[v1.2]**
- [ ] Broadcast timer-state changes to room participants.
- [ ] Ensure late joiners receive the current phase and remaining time.
- [ ] Do not treat each browser's independent countdown as authoritative.

**Tests / verification**

- [ ] Participants see the same phase and remaining time within expected latency.
- [ ] A late joiner receives the current state.
- [ ] Focus transitions to break and back per the configured cycle.
- [ ] Reconnect does not create a conflicting state.
- [ ] A non-admin cannot start, pause, reset, or advance the timer through UI or API.

### 6.4 Live status tags

- [ ] Implement status-tag update endpoint or authorized mutation: trim, require 1 to 60 characters of plain text, empty clears the status, enforce with a database `CHECK`; show a counter and truncate long tags with an ellipsis in the UI. **[v1.3]**
- [ ] Associate the status with the correct user and room; broadcast through Realtime.

**Tests**

- [ ] A participant can set and update their own status; others see it; no impersonation.
- [ ] A 61-character status is rejected by the API and the database; whitespace-only clears the status. **[v1.3]**

### 6.5 Automated testing and regression

- [ ] Unit tests for capacity, authorization, timer transitions, and validation.
- [ ] Integration tests for auth, password reset, module discovery and requests, catalogue, room joining, checklist, and forum.
- [ ] Tests for the video-provider token endpoint.
- [ ] Run the full CI pipeline; fix release-blocking failures before deployment.

### 6.6 Deployment

- [ ] Configure production environment variables and secrets.
- [ ] Deploy frontend and backend; connect to hosted Supabase.
- [ ] Configure production CORS, allowed origins, and auth redirect URLs (including password reset).
- [ ] Apply production migrations, RLS policies, and the DHET institution seed.
- [ ] Verify video-provider domain configuration.
- [ ] Run smoke tests against the deployed application.

**Phase 3 exit criteria**

- Silent video rooms work with the selected provider and the backend still enforces the 20-person cap.
- Timer is synchronized and controllable only by admins.
- Participant status is synchronized.
- Automated tests pass.
- Frontend and backend are deployed and connected to hosted Supabase.

## 7. Phase 4 — Polish, documentation, and demo freeze

**Target:** Wednesday, 25 November 2026; complete by 13:30 SAST

### 7.1 UX and responsive QA

- [ ] Compare implemented screens against approved Stitch designs.
- [ ] Verify mobile and desktop layouts, including the sidebar, bottom navigation, and the in-room desktop drawer and mobile segmented switch.
- [ ] Check loading, empty, error, offline, full-room, camera-denied, and disconnected states, and consistent system-message wording.
- [ ] Verify the three confirmation dialogs (remove post, delete catalogue record, close room) and that no other dialogs were introduced. **[v1.2]**
- [ ] Verify the silent video-only room experience is clear before joining.
- [ ] Check that only Lucide icons are used.
- [ ] Verify the motion rules (PRD 8.7): short transitions on `opacity`/`transform` only, no animation on video tiles or timer digits, no layout shift, and correct reduced-motion behaviour. **[v1.3]**

### 7.2 Security and release checks

- [ ] Re-test student and admin boundaries, including that admin controls (timer, close room, catalogue, moderation) are unavailable to students.
- [ ] Re-test RLS.
- [ ] Re-test concurrent room joins.
- [ ] Confirm no service-role keys or provider secrets are exposed to the frontend.
- [ ] Confirm video tokens are issued only after authorization.
- [ ] Confirm password reset does not reveal registered emails.
- [ ] Run lint, typecheck, tests, and production build on the release commit.

### 7.3 README and demo materials

- [ ] Finalize `README.md` with the live URL, Stitch project link, screenshots, and PRD/plan links.
- [ ] Provide student and admin test login instructions through an appropriate secure channel.
- [ ] Record an investor pitch and live demo of no more than five minutes; verify the recording is accessible and shows the working deployed MVP.

Do not commit real passwords, production secrets, or private tokens.

### 7.4 Demo walkthrough suggestion

1. Sign in as a student (first-time user routed to the module profile); select an institution and modules, and submit a module request.
2. Sign in as an admin: approve the request in the catalogue and create a room for the module.
3. As a student, discover the room, join it, and show the silent video grid and participant count.
4. Show the synchronized 50/10 timer (started by the admin) and a participant status tag.
5. Add a checklist milestone and mark it complete; show the update on another participant's session.
6. Open the module forum, publish a schedule update, and edit the post.
7. As an admin, pin an announcement and remove a post (confirm the dialog).
8. As an admin, close the room; as a student, open it under "Closed rooms" and show the read-only checklist. **[v1.3]**
9. Show that a student account cannot access admin-only controls.

This is a suggested order, not an additional requirement. With the five-minute limit, choose the strongest subset.

**Phase 4 exit criteria**

- Mobile and desktop QA is complete.
- Security and regression checks pass.
- README contains required links, screenshots, and demo-account instructions.
- Investor pitch and live demo recording are complete by 13:30 SAST.
- The release is ready before the 15:30 SAST deadline.

## 8. Suggested repository structure

```text
studysync/
├── apps/
│   ├── web/                     # React + TypeScript frontend
│   │   └── src/
│   │       ├── components/      # shared UI, nav, confirmation dialog
│   │       ├── features/
│   │       │   ├── auth/        # login, signup, password reset (S08)
│   │       │   ├── modules/     # profile, module requests
│   │       │   ├── rooms/       # discovery, room, admin room controls
│   │       │   ├── checklist/
│   │       │   ├── forum/       # text posts, moderation
│   │       │   └── admin/       # catalogue, requests, room admin
│   │       ├── hooks/
│   │       ├── lib/             # nav config (NAV_ITEMS), theme tokens
│   │       ├── pages/
│   │       └── types/
│   └── api/                     # Node.js + Express + TypeScript
│       └── src/
│           ├── middleware/      # auth, role
│           ├── modules/
│           │   ├── auth/
│           │   ├── institutions/
│           │   ├── modules/     # catalogue and module requests
│           │   ├── rooms/       # create, close, join, timer
│           │   ├── checklist/
│           │   ├── forum/
│           │   └── video/
│           ├── services/
│           ├── config/
│           └── types/
├── supabase/
│   ├── migrations/
│   ├── seed/                    # DHET institutions
│   └── tests/
├── docs/
│   ├── designs/                 # Stitch exports, style-guide tokens
│   ├── PRD.md
│   └── IMPLEMENTATION_PLAN.md
├── .github/
│   └── workflows/
├── BUSINESS.md
└── README.md
```

## 9. Recommended implementation order within each feature

1. Confirm behaviour and permissions from the PRD and open-decision list.
2. Define database changes and RLS policies.
3. Implement backend validation, authorization, and business rules.
4. Write unit and integration tests.
5. Implement frontend states and API integration.
6. Add realtime subscriptions where required.
7. Verify with at least two accounts where collaboration or roles are involved.
8. Run the complete CI pipeline before merging.

Do not rely on frontend-only restrictions for security or business rules.

## 10. Cross-cutting test plan

| Area | Minimum verification |
|---|---|
| Authentication | Registration, login, invalid credentials, protected routes, password reset |
| Routing | Post-login redirect for missing modules, admin, student; denied-access for non-admins |
| Roles | Student/admin separation in API and RLS |
| Module profile | Institution type (College/University) and module selection persist correctly **[v1.4]** |
| Module requests | Create, approve, reject; student cannot write to modules |
| Catalogue | Admin create, edit, verify, archive/delete; student denied |
| Discovery | Joinable open rooms filtered by selected modules; closed rooms listed separately with read-only checklists |
| Room management | Admin-only create and close |
| Room capacity | 20 allowed; 21st rejected; concurrent final-seat test |
| Video | Valid token, tiles, microphone disabled, reconnect, camera-denied message |
| Timer | 50/10 defaults, synchronized state, late join, reconnect, admin-only control |
| Status tags | Own-status update, realtime propagation, no impersonation |
| Checklist | Add, complete/incomplete, realtime, persistence, creation order, creator/admin edit and delete, read-only after room closes |
| Forum | View, post, schedule notice, edit own with "Edited" label, pin, admin removal, authorization |
| Dialogs | Three confirmation dialogs only |
| Responsive UI | Mobile and desktop layouts |
| Motion and performance | PRD 8.7 rules, reduced-motion, no layout shift, video SDK only on the room route |
| CI | Lint, typecheck, tests, production build |
| Deployment | Production smoke tests and environment configuration |

## 11. Risks and mitigations

| Risk | Why it matters | Mitigation |
|---|---|---|
| Time remaining vs. remaining scope | Phase 1 is due today and the deadline is fixed | Deferrals in Section 3.1 already applied; use the cut line in Section 3.3; protect the demo path |
| Video provider unknowns | Daily's free tier is 10,000 participant minutes; its docs don't give exact resolutions for quality presets or confirm video-only token permissions | Daily.co is chosen. Keep test sessions short and small, verify 240p/360p and silent-room behaviour early in Phase 3, and block the microphone in the client (`audioSource: false`) plus token settings |
| Room capacity race condition | Concurrent joins could exceed 20 | Enforce atomically on the backend; test concurrent joins |
| RLS misconfiguration | Student data or admin actions could be exposed | Test with student and admin identities |
| Admin role can be self-assigned | Unauthorized moderation | Controlled server-side provisioning; deny client role escalation |
| Admin-only timer and rooms | A room has no running timer unless an admin is present | Accepted for the MVP; make sure an admin is available for the demo; revisit in v2 |
| Camera not enforced | Students could join without video | Accepted for the MVP; enforcement deferred to v2 |
| Realtime state drift | Users may see different timer/checklist states | Persist authoritative state; use realtime as a synchronization signal |
| DHET list sourcing | Sourcing and cleaning the full registered-institution list is time-consuming and risks missing the deadline | Deferred to v2. For the MVP, students select institution type (College or University). **[v1.4]** |
| Video bandwidth/device constraints | Limited data or unavailable cameras | Target 240p/360p; test camera-denied and reconnect |
| Undefined lifecycle decisions | Inconsistent room, timer, checklist behaviour | Resolve the remaining PRD Section 14 items before finalizing related schema |

## 12. Critical decisions to resolve immediately

Resolved: video provider (Daily.co), room creation and closing (admin only), timer controls (admin only), checklist persistence, ordering and edit rules, closed-room checklist (read-only, still viewable), forum scope (text-only, "Edited" label), status tag limit (60), motion rules, no tagline or illustrations, admin catalogue actions, module requests, navigation, landing routes, password reset, and the single theme.

Still blocking or high-priority:

1. How admin accounts are created and approved.
2. The DHET source list and format.
3. Two Daily integration checks in Phase 3: whether participant permissions can restrict sending to video only, and which send settings give 240p/360p.

Record decisions in the PRD or an architecture decision log so the implementation and tests use one agreed behaviour.

## 13. Definition of done

A feature is complete only when:

- Its agreed behaviour is implemented.
- Backend validation and authorization are in place.
- RLS policies protect the underlying data.
- Relevant automated tests pass.
- Required realtime behaviour is verified with multiple clients.
- Loading, empty, error, and offline states are handled with consistent wording.
- It renders correctly on mobile and desktop.
- The feature works in the deployed environment.
- The implementation does not contradict the PRD.

The MVP is complete when all P0 requirements in `PRD.md` pass the release acceptance checklist and the Phase 4 deliverables are ready before the stated deadline.

## 14. Source alignment

This plan follows the four phases and dates in the supplied **Business Plan & MVP Specification: StudySync** and PRD v1.3. Tasks, exit criteria, test cases, repository layout, and risk mitigations are implementation-level elaborations. Items marked **[v1.2]** reflect the product owner's decision to defer four feature areas to v2; items marked **[v1.3]** resolve the remaining design questions; unresolved choices are identified rather than treated as confirmed.
