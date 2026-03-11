---
Generated: 2026-02-22 16:00:00
Report Type: audit
Command: feature-readiness-check
---

# Feature Readiness Audit — Board / Board / Epics

## Executive Summary

The codebase (~457 files) has a solid architectural foundation with Clean Architecture, full auth flow, workspace management, and a working Kanban board with drag-and-drop. However, most feature-rich components are **built but not wired** into their pages. The board page is a 5-line placeholder. The epics page is read-only. The project settings page is entirely non-functional. There are also critical gaps in the data model (no priorities, no due dates, no comments, no labels).

---

## Priority Classification

- **P0 — Blocker**: Prevents core usage of board/epics
- **P1 — Critical**: Missing feature that users expect from any project management tool
- **P2 — Important**: Significant gap vs Jira/Trello, noticeable to users
- **P3 — Nice-to-have**: Improves polish, not essential for MVP

---

## P0 — BLOCKERS (Must fix before usable)

### 1. Board Page is a Skeleton (5 lines)

`presentation/pages/board/index.tsx` renders `<div>BoardPage</div>`. All child components are **fully built** but not composed:

| Ready Component | Purpose |
|---|---|
| `TicketList` | List view with loading/error/empty |
| `TicketListItem` | Row with selection, badges, actions |
| `TicketFilters` | Search + status + epic filters |
| `TicketSort` | Sort by field + direction |
| `BulkActions` | Bulk move/status/delete toolbar |
| `QuickAddTicket` | Inline title-only creation |
| `CreateTicketForm` | Full ticket creation form |

**Work needed**: Compose these components into `BoardLayout`, wire hooks (`useTickets`, `useCreateTicket`, filter/sort stores), connect selection store for bulk actions.

### 2. ProjectShell Action Handlers are Stubs

The 3 main action buttons in the project navbar (Filter, Sort, Add) have empty TODO handlers:

```
handleFilterClick → // TODO: Open filter panel / modal
handleSortClick  → // TODO: Open sort panel / modal
handleAddClick   → // TODO: Open add ticket / add epic modal
```

Without these, users cannot create tickets/epics or filter the board from the navbar.

### 3. Create Ticket / Create Epic Flows Not Wired

`CreateTicketForm` and `CreateEpicForm` are fully built but never rendered. No modal or page triggers them. Users have no way to create tickets or epics from the UI.

### 4. Epics Page Actions Not Connected

`EpicsList` renders cards with View/Edit/Delete buttons, but the callbacks (`onItemViewDetail`, `onItemEdit`, `onItemDelete`) are **not connected** in the epics layout. Clicking does nothing.

### 5. Project Settings Page Entirely Non-Functional

All 4 settings tabs render UI but every handler is a no-op:
- Project name/description → no-op save
- Statuses/columns → receives empty `[]`, no-op changes
- Priorities → receives empty `[]`, no-op changes
- Export/Import → no-op handlers

Additionally, `projectName={projectId}` passes the raw UUID as the project name — a wiring bug.

---

## P1 — CRITICAL GAPS (Essential for a usable product)

### 6. No Comments System

No schema, no table, no port, no usecase, no component at any layer. Comments are the most fundamental collaboration feature.

### 7. No Priority Field on Tickets

`PrioritiesSettings.tsx` exists as a UI component, but there is:
- No `priority` column in the database
- No domain field in `ticket.schema.ts`
- No enum or type in the domain layer

This is a "phantom feature" — settings UI with zero backend.

### 8. No Due Dates on Tickets

No `dueDate` field anywhere. Essential for task management.

### 9. No Labels / Tags

No labeling system at any layer. Both Jira and Trello treat this as a core feature.

### 10. Ticket Detail Page Does Not Exist

`TicketOverview`, `TicketEditForm`, `SubtasksList`, `AssigneePicker`, `EpicLinkSelector` are all fully built components. But there is **no ticket detail route** (`/[projectId]/ticket/[ticketId]`). The board's edit button uses a hacky query param (`?edit=${ticketId}`).

### 11. Epic Detail Page Does Not Exist

`EpicDetail` component is fully built (shows name, description, progress, linked tickets) but there's no route or modal to display it.

### 12. Project Home Dashboard is Empty

The project home page renders only a header. Three dashboard widgets are fully built but unused:
- `MyWorkWidget` — tickets assigned to user
- `RecentActivityWidget` — activity timeline
- `ShortcutsWidget` — quick navigation links

### 13. Member Management Not Wired

`MemberList`, `InviteMemberModal`, `PendingInvitations` are complete components. No "Members" section exists in settings or anywhere in the project UI.

---

## P2 — IMPORTANT GAPS (Noticeable vs Jira/Trello)

### 14. Board Filters Not Rendered

`BoardFilters` component is fully built (search, status, epic, assignee dropdowns) but is **not rendered** in the board layout. Only `useFilterStore.search` is used for basic text filtering.

### 15. No `created_by` / Reporter on Tickets

No way to know who created a ticket.

### 16. No Epic Start/End Dates

Epics have no timeline. Progress is only derived from ticket completion ratio.

### 17. `assigneeIds` Filter Declared but Not Implemented

`TicketFilters` type includes `assigneeIds?: string[]` but `TicketRepository.supabase.ts` ignores it. Assignee filtering won't work at the database level.

### 18. Status Not Validated Against Board Columns

Ticket `status` is a free-form string. A ticket could have `status: "banana"` and it would pass schema validation. No enforcement that the status matches a board column.

### 19. No Bulk Mutation Hooks

`BulkActions` component exists but there are no `useBulkDelete`, `useBulkMove`, or `useBulkChangeStatus` hooks.

### 20. No Ticket Type (Bug/Story/Task)

No ticket typing system. All tickets are generic.

### 21. No Story Points / Estimation

`TicketCard` accepts `storyPoints` as a prop but it's never populated from the domain.

### 22. Barrel Export Gaps

`assignTicket` / `unassignTicket` usecases and their hooks are not exported from their barrel files. They work via direct imports but break the pattern.

---

## P3 — NICE-TO-HAVE (Polish items)

### 23. Non-Transactional Position Updates

`updatePositions` and `updateColumnPositions` update positions one-at-a-time in a loop. A failure mid-loop leaves the board in an inconsistent state.

### 24. Race Condition on Code Number Allocation

`getNextCodeNumberForProject` reads `MAX(code_number) + 1`. Concurrent inserts could produce duplicates. No retry logic.

### 25. No WIP Limits on Board Columns

No work-in-progress limit support per column.

### 26. No Swimlanes (by epic, assignee, priority)

Board shows flat columns only.

### 27. No Activity Log / History on Tickets

No audit trail for ticket changes.

### 28. No Attachments on Tickets

No file attachment system.

### 29. No Linked Issues / Dependencies

No "blocks" / "is blocked by" relationships.

### 30. Sidebar "Add Tab" is a Stub

Button renders but handler is empty.

### 31. ColumnsConfiguration Not Accessible from Board

`ColumnsConfiguration` component exists (toggle column visibility, reorder) but there's no UI trigger on the board page.

---

## What's Working Well

| Feature | Status |
|---|---|
| Auth (sign in, sign up, reset password, verify email, delete account) | Fully working |
| Workspace (list/create/join projects, reclaimable projects) | Fully working |
| Board (Kanban view with drag-and-drop move/reorder) | Working (basic) |
| Epics list (read-only display with progress) | Working (read-only) |
| Subscription / Feature gating | Fully working |
| Stripe integration (checkout, portal, webhooks) | Fully working |
| User settings (profile, avatar, password, preferences, theme) | Fully working |
| Pricing page | Fully working |
| Legal page | Fully working |
| Sidebar navigation with plan badges | Fully working |
| Breadcrumbs | Fully working |
| i18n system (FR/EN/ES) | Fully working |
| Accessibility (a11y IDs, ARIA, keyboard navigation) | Well implemented |
| Clean Architecture (domain/usecases/ports/infra separation) | Fully compliant |
| Supabase RLS + server-side access checks | Fully working |

---

## Recommended Execution Order

### Phase 1 — Wire Existing Components (Biggest ROI, least new code)

1. Wire `CreateTicketForm` + `CreateEpicForm` into modals triggered by ProjectShell
2. Wire board page (compose existing components into BoardLayout)
3. Wire epic page actions (view detail, edit, delete)
4. Wire project settings (fetch data, connect handlers)
5. Wire dashboard widgets on project home
6. Wire member management into settings
7. Render `BoardFilters` on board page

### Phase 2 — Build Missing Routes

8. Create ticket detail page/modal (`/[projectId]/ticket/[ticketId]`)
9. Create epic detail page/modal
10. Wire `TicketOverview`, `SubtasksList`, `AssigneePicker`, `EpicLinkSelector` into ticket detail

### Phase 3 — Extend Data Model

11. Add `priority` field to tickets (column, schema, domain, repository)
12. Add `dueDate` field to tickets
13. Add `createdBy` field to tickets
14. Add comments system (full stack: schema, table, port, usecase, repository, component)
15. Add labels/tags system
16. Add epic dates (start, target end)
17. Add story points field
18. Implement `assigneeIds` filter in repository

### Phase 4 — Robustness

19. Validate ticket status against board columns
20. Add bulk mutation hooks
21. Fix barrel exports
22. Add transactional position updates (RPC)
23. Add retry logic for code number allocation

---

## Inventory: Components Built vs Wired

| Component | Built | Wired | Gap |
|---|---|---|---|
| BoardView | Yes | Yes | — |
| BoardColumn | Yes | Yes | — |
| BoardFilters | Yes | **No** | Not rendered on board |
| TicketCard | Yes | Yes | Missing priority/storyPoints data |
| TicketList | Yes | **No** | Board is skeleton |
| TicketListItem | Yes | **No** | Board is skeleton |
| TicketFilters | Yes | **No** | Board is skeleton |
| TicketSort | Yes | **No** | Board is skeleton |
| BulkActions | Yes | **No** | Board is skeleton + no hooks |
| QuickAddTicket | Yes | **No** | Not placed anywhere |
| CreateTicketForm | Yes | **No** | No modal trigger |
| CreateEpicForm | Yes | **No** | No modal trigger |
| TicketEditForm | Yes | **No** | No edit page |
| TicketOverview | Yes | **No** | No detail page |
| EpicsList | Yes | Yes | Actions not connected |
| EpicCard | Yes | Yes | Actions not connected |
| EpicDetail | Yes | **No** | No detail route |
| EpicProgress | Yes | Yes | — |
| EpicLinkSelector | Yes | **No** | No detail page |
| SubtasksList | Yes | **No** | No detail page |
| SubtaskItem | Yes | **No** | No detail page |
| AssigneePicker | Yes | **No** | No detail page |
| ColumnsConfiguration | Yes | **No** | No UI trigger |
| StatusesColumnsSettings | Yes | Partial | No-op handlers |
| PrioritiesSettings | Yes | Partial | No backend + no-op |
| ProjectSettings | Yes | Partial | No-op handlers |
| MyWorkWidget | Yes | **No** | Dashboard empty |
| RecentActivityWidget | Yes | **No** | Dashboard empty |
| ShortcutsWidget | Yes | **No** | Dashboard empty |
| MemberList | Yes | **No** | No members section |
| InviteMemberModal | Yes | **No** | No members section |
| PendingInvitations | Yes | **No** | No members section |
| ExportImportSettings | Yes | Partial | No-op handlers |

**Summary: 33 components built, only 7 fully wired end-to-end.**
