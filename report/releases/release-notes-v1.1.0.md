---
Generated: 2026-03-22 16:40:12
Report Type: release
Version: 1.1.0
---

# Workbench v1.1.0

## Summary

This minor release delivers user-facing profile improvements (avatar upload), a large clean-architecture realignment (session, viewer, and project ownership), and decoupling between the project container and the board module. Internal refactors touch many files; integrators should expect no public API contract beyond this repository, but deployment and QA should follow a normal release checklist.

## Highlights

### Features

- **Avatar upload** — Profile flow supports uploading and managing user avatars (Supabase-backed), with related user/profile refactor work.

### Architecture & maintainability

- **Session, auth, and profile separation** — Clearer boundaries between session handling, authentication flows, and profile data; **viewer** read-model migration for current-user composition.
- **Project as a first-class domain** — `Project` canonically lives under `domains/project`; consumers updated to use the correct owner.
- **Decouple project ↔ board** — Reduced coupling between the project container and board module so each layer keeps its responsibilities.
- **Workspace domain scope** — `domains/workspace` narrowed to its intended role.
- **Routing** — Settings-related logic moved out of `src/app` into owning domains/modules.
- **Shared layer** — Removed shims, cleaned shared utilities, and refreshed documentation.
- **Tooling** — ESLint configuration updated.

## Statistics (vs `main`)

- ~277 files changed; large-scale refactor across domains, modules, and shared code.

## Upgrade notes

- After merging, run the usual `yarn install`, `yarn build`, and smoke tests (auth, project shell, board, profile/avatar).
- No dedicated migration script is documented here; follow any Supabase storage policies already applied in your environment for avatars.

## Versioning rationale

**1.1.0 (minor)** — New user-visible capability (avatars) plus substantial internal restructuring. Patch **1.0.3** would understate the scope relative to prior tags `v1.0.1` / `v1.0.2`.
