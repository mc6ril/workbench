# Project Overview — Workbench (Refocused)

## 1. Product Purpose

**Workbench** is a family-centered daily management app.

It helps households organize day-to-day responsibilities and medium-term goals with a clear, low-friction workflow.

The product direction is now explicitly:
- **Family first**
- **Free-plan first**
- **Simple by default**
- **Fast mobile usage**

---

## 2. Current Product Scope

The active in-app project navigation is intentionally reduced to:
- `Board`
- `Objectives` (epics)

Removed from the main app flow:
- `Home`
- `Backlog`
- Quick-add ticket shortcut on board

`Settings` is hidden for free users and only available through paid entitlements.

---

## 3. Core UX Rules

1. **Default landing**
   - Opening a project routes to `Board`.

2. **Single ticket creation path**
   - Ticket creation is opened from the board flow.
   - After creation, users remain on `Board`.
   - No alternate "quick add" path.

3. **Low cognitive load**
   - Minimal tabs
   - Predictable behavior
   - No duplicated actions

4. **Progress visibility**
   - `Board` is the operational view (what is being done now).
   - `Objectives` is the direction view (what this work contributes to).

---

## 4. Functional Capabilities (Current)

### 4.1 Board

- View tickets by status columns
- Move tickets via drag and drop
- Open ticket details
- Create a ticket through the standard create flow

### 4.2 Objectives

- Create and manage objectives (epics)
- Link tickets to objectives
- Track objective progression

### 4.3 Collaboration and Access

- Authentication required
- Project membership required
- Role-based permissions (`admin`, `member`, `viewer`)

---

## 5. Free-First Product Policy

The natural user journey must work on free plan without hacks:
- Core daily usage available on free plan
- Premium gates only for clearly advanced features
- No dead-end UX in the default flow

This principle drives both navigation and feature placement.

---

## 6. Technical Architecture

Workbench now uses a **modular domain architecture**:

- `src/app/` remains the Next.js routing layer
- `src/domains/project-management/` owns the project-management business module end to end
- `src/shared/` owns cross-cutting concerns such as design system, i18n, observability, auth, shared infrastructure clients, constants, types, utils, and accessibility

Inside each domain module, responsibilities are still layered:

- `core/domain/` for schemas, rules, and domain constants
- `core/ports/` for contracts
- `core/usecases/` for orchestration
- `infrastructure/` for adapters such as Supabase repositories
- `presentation/` for domain-specific hooks, stores, pages, layouts, and components

Guiding rules:
> `src/app/` stays thin and route-focused.
> Shared code stays cross-cutting.
> Business rules stay inside domain modules.

---

## 7. Data and Supabase Strategy

Current strategy is **safe cleanup, not destructive cleanup**:
- Keep essential collaboration tables (`project_invitations`, `labels`, `sprints`, `comments`, `ticket_assignees`)
- Reduce unnecessary queries in hot paths
- Add missing performance indexes
- Improve gradually, avoiding schema churn that risks regressions

---

## 8. Explicit Non-Goals (Current Phase)

- Enterprise positioning (Jira-like complexity)
- Feature proliferation before core simplicity is stable
- Reintroducing alternate parallel task flows that confuse users

---

## 9. Success Criteria for This Refactor

The refactor is successful when:
- Users always start on `Board`
- Ticket creation keeps users on `Board`
- Navigation remains only `Board` + `Objectives` for free users
- No dead code remains from removed views
- Lint, typecheck, tests, and build are all green

---

## 10. One-Sentence Summary

> Workbench is now a simple, family-first daily management app built around a single clear free-plan flow: `Board` to execute, `Objectives` to align.
