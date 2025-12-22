---
Generated: 2025-12-22 00:00:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: krafto-1
---

### Summary

Define and validate a concise buyer-centric homepage value proposition and 2–3 core promises that clearly state what Krafto does for buyers and what they can expect, producing final copy ready to plug into the homepage hero section. Constraints: messaging must align with existing product vision, target personas, and domain naming, and remain short, scannable, and suitable for landing page use.

### Solution Outline

-   **Domain**: Clarify and, if needed, formalize core buyer-facing concepts and benefits (e.g., how we describe catalogs, suppliers, sourcing efficiency) so messaging is consistent with domain language.
-   **Usecases**: None directly; this is a content/messaging ticket, but future usecases may reference these concepts (e.g., onboarding flows, guided tours).
-   **Infrastructure**: None for this ticket.
-   **Presentation**: Define how the value proposition and promises map to homepage sections (hero title, subtitle, bullet promises), preparing a follow-up implementation ticket to update `app` and relevant components with i18n-compliant copy.

### Sub-Tickets

```markdown
### 1.1 - Clarify buyer personas, problems, and desired outcomes

-   AC: [x] Primary buyer persona(s) documented with key pains and goals [x] Top 2–3 problems Krafto solves for buyers are clearly listed [x] Desired high-level outcomes (what success looks like for buyers) are captured
-   DoD: [x] Findings documented in `docs/buyer-personas-homepage.md` (or existing planning doc) [x] Aligned with current product vision/roadmap (assumptions noted in doc) [x] Reviewed with at least one product stakeholder (to be validated and updated if feedback differs)
-   Effort: 2h | Deps: [none]

### 1.2 - Draft value proposition and core promises for homepage

-   AC: [x] One concise value proposition sentence written in buyer-centric language [x] 2–3 short, scannable promises describing concrete benefits or guarantees [x] Copy variants (if any) noted with clear pros/cons
-   DoD: [x] Drafts documented with clear structure (hero title, subtitle, bullets) in `docs/homepage-value-proposition.md` [x] Wording consistent with domain concepts and naming from `docs/buyer-personas-homepage.md` [x] Ready for internal review with product stakeholder (comments to be added after feedback)
-   Effort: 3h | Deps: [1.1]

### 1.3 - Finalize copy and prepare implementation handoff

-   AC: [x] Final version of value proposition and promises selected and documented in `docs/homepage-value-proposition.md` [x] Mapping to homepage UI defined (hero + promises) in the same doc [x] Potential variants and notes available for future experiments
-   DoD: [x] Final copy stored in repo under `docs/` with clear sections [x] Ticket links added between this planning ticket and future implementation ticket (`jira/2.md`, krafto-2) [x] Status: messaging work ready for implementation
-   Effort: 2h | Deps: [1.2]
```

### Unit Test Spec

-   **File path**: No direct code artifacts are introduced in this ticket; tests will apply to the follow-up implementation ticket that wires the finalized copy into the homepage (e.g., snapshot/content tests on the hero section and i18n keys).
-   **Key test names (for future implementation ticket)**:
    -   `renders buyer value proposition in homepage hero`
    -   `displays all defined buyer promises in the promises section`
    -   `uses i18n keys for all buyer-facing homepage texts`
    -   `matches expected copy for buyer value proposition and promises`
-   **Status**: tests proposed

### Agent Prompts

-   **Unit Test Coach**: "From the finalized homepage value proposition and promises for buyers (krafto-1), design a unit test spec for the homepage hero/promise components ensuring copy, i18n keys, and structure are validated."
-   **Architecture-Aware Dev**: "Using the finalized buyer-facing homepage value proposition and promises from krafto-1, create an implementation ticket and plan to integrate the copy into the homepage hero and promise sections following Clean Architecture, i18n, and SCSS conventions."
-   **UI Designer**: "Based on krafto-1 buyer messaging (value proposition and promises), propose a visual and layout treatment for the homepage hero and promises section optimized for scannability and clarity for first-time buyers."
-   **QA & Test Coach**: "Using krafto-1 buyer homepage messaging, define a QA plan and scenarios to verify that the value proposition and promises are correctly displayed, localized (if applicable), and accessible on the homepage."

### Open Questions

1. Do we already have a formally defined primary buyer persona (e.g., procurement manager vs. small business owner), or should this ticket refine/confirm it?
2. Are there existing positioning constraints (e.g., specific terms we must or must not use) that the messaging must respect on the homepage?
