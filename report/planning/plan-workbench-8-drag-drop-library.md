---
Generated: 2025-01-27 22:00:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: workbench-8
---

# Implementation Plan: Install Drag & Drop Library

## Summary

Goal: Install dnd-kit library for drag-and-drop functionality to enable ticket reordering and moving between columns in the board view, with full accessibility support.

Constraints: Must be compatible with React 19.2.1 and Next.js 16.0.10 App Router. Must support keyboard navigation and accessibility (WCAG 2.1 AA). react-beautiful-dnd is deprecated and not compatible with React 19.

## Solution Outline

- Domain: None
- Usecases: Move ticket, reorder ticket usecases (will use drag events)
- Infrastructure: None
- Presentation: Board components, draggable items, droppable zones (`presentation/components/board/`)
- Configuration: `package.json` (add dependencies)

## Sub-Tickets

### 8.1 - Install dnd-kit Core and Sortable Packages

- AC: [x] `@dnd-kit/core` installed (latest stable version - v6.3.1) [x] `@dnd-kit/sortable` installed for sortable lists (v10.0.0) [x] `@dnd-kit/utilities` installed for helper functions (v3.2.2) [x] Dependencies compatible with React 19.2.1 and Next.js 16
- DoD: [x] Tests N/A (no business logic) [x] A11y N/A [x] SCSS vars N/A [x] `package.json` updated with dnd-kit dependencies [x] No dependency conflicts [x] TypeScript types available
- Effort: 0.5h | Deps: none

### 8.2 - Verify Accessibility and TypeScript Support

- AC: [x] Library supports keyboard navigation (KeyboardSensor with sortableKeyboardCoordinates) [x] Accessibility features verified (ARIA attributes, role, tabIndex) [x] TypeScript compilation succeeds [x] Can import dnd-kit components without errors
- DoD: [x] Tests N/A [x] A11y N/A [x] SCSS vars N/A [x] TypeScript types working correctly [x] Keyboard navigation support confirmed [x] Basic draggable component created and verified
- Effort: 0.5h | Deps: 8.1

### 8.3 - Verify Integration with Next.js App Router

- AC: [x] dnd-kit works with Next.js App Router [x] Client components properly marked with "use client" [x] Build succeeds without errors [x] No SSR/hydration issues
- DoD: [x] Tests N/A [x] A11y N/A [x] SCSS vars N/A [x] `yarn build` succeeds [x] Test draggable component works in Next.js page [x] No hydration warnings
- Effort: 0.5h | Deps: 8.1, 8.2

## Unit Test Spec

- File path: N/A (no business logic to test)
- Status: tests N/A (dependency installation task only)

## Agent Prompts

### Architecture-Aware Dev

```
Install @dnd-kit/core, @dnd-kit/sortable, and @dnd-kit/utilities for drag-and-drop functionality. Verify compatibility with React 19.2.1 and Next.js 16.0.10 App Router. Ensure TypeScript types work correctly and create a test draggable component to verify the integration. Mark components with "use client" directive for Next.js App Router compatibility.
```

### UI Designer

N/A - No UI changes required (dependency installation task only).

### QA & Test Coach

```
Verify that dnd-kit packages are properly installed and can be imported without errors. Test that TypeScript compilation works, keyboard navigation is supported, and a basic draggable component works correctly in Next.js. No functional testing required - this is a dependency installation verification task.
```

### Unit Test Coach

N/A - No business logic to test.

## Open Questions

1. Should we install `@dnd-kit/modifiers` for additional drag modifiers (snap to grid, restrict to parent, etc.)?
2. Do we need `@dnd-kit/accessibility` for additional accessibility features, or is core accessibility sufficient?

## Notes

- dnd-kit is recommended over react-beautiful-dnd (deprecated, no React 19 support)
- @dnd-kit/core v6.3.1 is the latest stable version (compatible with React 19 and Next.js 16)
- @dnd-kit/sortable v10.0.0 provides sortable list functionality
- @dnd-kit/utilities v3.2.2 provides helper functions and utilities
- dnd-kit has built-in accessibility support (keyboard navigation, screen reader announcements)
- Components using dnd-kit must be Client Components ("use client" directive)
- dnd-kit uses a modular approach: core, sortable, utilities, modifiers, accessibility
- Board drag-and-drop will use DndContext, SortableContext, and SortableItem components
- Will need to handle drag events and call move/reorder ticket usecases
