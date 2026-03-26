# Tribu Nova QA Master Checklist (v1.0.1)

## Scope

This checklist consolidates all manual QA scenarios for Tribu Nova after `v1.0.1`.
It is organized by feature domain and includes execution notes.

## Test Environments

- Production: `https://tribu-nova.vercel.app`
- Supabase project: `qoonsjagwtmxfwityxiz`
- Stripe mode: verify current mode before billing tests (test/live)

## Required Test Accounts

- `A_ADMIN` (workspace/project admin)
- `B_MEMBER` (project member)
- `C_VIEWER` (project viewer)
- `D_NEW_USER` (fresh account, no project)
- Google OAuth account for external sign-in flow
- Superuser account (if enabled)

## Global Preconditions

- Start each suite from a known auth state (signed in or signed out).
- Clear stale sessions/cookies before authentication tests.
- Use two browser sessions/devices for real-time and invite acceptance scenarios.
- Record expected and actual results for each test case.

---

## 1) Authentication

- [ ] Sign in with email/password (valid credentials)
- [ ] Sign in with email/password (invalid credentials, proper error)
- [ ] Sign out
- [ ] Sign up (new account)
- [ ] Email verification flow and redirect behavior
- [ ] Sign in with Google OAuth
- [ ] OAuth-only account cannot update password from account settings
- [ ] Delete account (with existing project memberships)
- [ ] Profile update from account settings (name, email where applicable)
- [ ] Session guards:
  - [ ] no active session => protected routes redirect to auth/home
  - [ ] active session => access protected routes

---

## 2) Invitations

- [ ] Create invitation link with target role
- [ ] Open invitation link while authenticated:
  - [ ] project appears in workspace
  - [ ] role is correctly applied
- [ ] Open invitation link while not authenticated:
  - [ ] redirected to sign-in/sign-up
  - [ ] after auth, user lands correctly and joins project
- [ ] Invitation role validation (admin/member/viewer)
- [ ] Invalid/expired invitation link handling

---

## 3) Profile, Theme, Language

- [ ] Change theme (light/dark/system)
- [ ] Change language
- [ ] Theme persistence on same device after:
  - [ ] app refresh
  - [ ] sign out / sign in
  - [ ] account switch
- [ ] Language persistence on refresh/relogin
- [ ] Initial language detection on first arrival (pending implementation check)

---

## 4) Workspace and Projects

- [ ] Create project
- [ ] Delete project
- [ ] Project list visibility after refresh and relogin
- [ ] Invite users to project
- [ ] Change member role in project
- [ ] Enforce max number of projects by plan
- [ ] Enforce max number of users per project by plan

---

## 5) Tickets (Board)

- [ ] Create ticket
- [ ] Edit ticket
- [ ] Delete ticket
- [ ] Add comment
- [ ] Delete comment
- [ ] Set/update priority
- [ ] Set/update estimate
- [ ] Assign ticket
- [ ] Change assignee
- [ ] Move ticket across columns
- [ ] Reorder ticket in column
- [ ] Real-time sync on two accounts/sessions (column/move updates)
- [ ] Ticket search behavior
- [ ] Link ticket to objective
- [ ] Permissions:
  - [ ] admin/member can edit
  - [ ] viewer cannot edit
- [ ] Archive/cache behavior for completed tickets after weekly archival (if feature exists)

---

## 6) Objectives (Epics)

- [ ] Create objective
- [ ] Update objective
- [ ] Progress updates from linked ticket changes
- [ ] Progress reaches 100% when all linked tickets are completed
- [ ] Progress goes back down if a linked ticket is reopened
- [ ] Delete objective
- [ ] Archive/cache behavior for completed objectives (if feature exists)

---

## 7) Project Settings

- [ ] Add custom column based on plan limits
- [ ] Prevent custom column add on free plan
- [ ] Delete column with minimum columns safeguard (minimum 3)
- [ ] Role management works correctly
- [ ] Project deletion from settings works and is permission-protected

---

## 8) Navigation and Routing

- [ ] No active session => landing page
- [ ] Active session => workspace or last valid route
- [ ] Navigate between board/objectives/settings
- [ ] Navigate from project to workspace
- [ ] Navigate from workspace to project
- [ ] "Add board/tab" interactions (if enabled)
- [ ] Direct URL access guard checks

---

## 9) Legal and Public Pages

- [ ] Legal page renders when signed out
- [ ] Legal page renders when signed in
- [ ] Public landing page renders correctly when signed out

---

## 10) Plans, Billing, Stripe

- [ ] Plan cards visible: Free / Family / Tribu
- [ ] Plan comparison content accuracy
- [ ] Stripe checkout creation works
- [ ] Stripe customer portal access works
- [ ] Subscription cancellation flow works
- [ ] Pro-rata refund policy behavior validated against actual Stripe setup
- [ ] Monthly pricing display correctness
- [ ] Superuser full access behavior (admin-only path)
- [ ] Subscription management page works end-to-end

---

## 11) Plan Entitlements

### Free
- [ ] Maximum 1 project enforced
- [ ] Maximum 2 users enforced
- [ ] Custom column editing blocked

### Paid
- [ ] 3+ projects allowed according to configured plan caps
- [ ] User caps enforced for configured ranges (5 to 20 depending on plan)
- [ ] Custom column management enabled

---

## 12) Non-Functional QA Smoke

- [ ] No blocking console errors on key pages
- [ ] No major layout breakpoints on desktop/tablet/mobile
- [ ] Basic accessibility smoke checks (focus order, labels, keyboard navigation)
- [ ] Basic performance smoke (no severe regressions on workspace and board loads)

---

## Execution Notes

- Use this as a baseline release checklist.
- Add ticket IDs or bug references next to failed checks.
- Mark each test run with date, environment, tester, and app version.
