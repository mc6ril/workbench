---
Generated: 2025-12-22 00:00:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: workbench-4
---

### Summary

Define the primary and secondary Buyer CTAs on the homepage (buy-side) and decide if/how Seller onboarding entry points appear, so that the Buyer journey stays clear while still giving Sellers a path to join when appropriate. Constraints: documentation-only ticket (no UI/infra), must stay consistent with B-HOME-01/02/03, and output must be actionable for later routing and UI implementation.

### Solution Outline

-   **Domain / Usecases**: Clarify flows and semantics only (no new domain types now); later usecases will use this as input for routing and onboarding flows.
-   **Infrastructure**: None in this ticket; note future needs for analytics (CTA tracking) and feature-flagging if relevant.
-   **Presentation**: Define CTA hierarchy, labels (at a conceptual level), and placement rules per section; later tickets will wire these into `src/app` and `presentation/components`.

### Sub-Tickets

```markdown
### B-HOME-04.1 - Map homepage CTA landscape and hierarchy

-   AC: [x] All Buyer and Seller-relevant homepage CTAs listed [x] Target audience and goal defined for each CTA [x] Primary/secondary/tertiary hierarchy mapped to homepage sections
-   DoD: [x] Tests [ ] A11y [ ] SCSS vars
-   Effort: 3h | Deps: [B-HOME-01, B-HOME-02, B-HOME-03]

### B-HOME-04.2 - Decide primary Buyer CTAs and their repetition rules

-   AC: [x] Primary Buyer CTAs chosen and documented (label + target flow) [x] Placement rules defined (hero + lower-page repeats) [x] Relationship to discovery sections (featured, categories, collections) described
-   DoD: [x] Tests [ ] A11y [ ] SCSS vars
-   Effort: 3h | Deps: [B-HOME-04.1]

### B-HOME-04.3 - Define Seller onboarding entry points and constraints

-   AC: [x] All potential Seller CTAs and locations (header, footer, blocks) documented [x] Rules for visual and hierarchy relationship to Buyer CTAs defined [x] MVP vs later-phase strategy for Seller CTAs clarified
-   DoD: [x] Tests [ ] A11y [ ] SCSS vars
-   Effort: 3h | Deps: [B-HOME-04.1]

### B-HOME-04.4 - Define conflict/dilution safeguards and experimentation rules

-   AC: [x] Guidelines to prevent conflicting Buyer/Seller CTAs in same block documented [x] Limits on CTA density and prominence defined [x] Guardrails for A/B tests so CTA variants respect agreed hierarchy described
-   DoD: [x] Tests [ ] A11y [ ] SCSS vars
-   Effort: 2h | Deps: [B-HOME-04.2, B-HOME-04.3]

### B-HOME-04.5 - Update cross-references and follow-up tickets

-   AC: [x] Required updates to `docs/homepage-implementation.md` and related docs listed [x] Follow-up tickets for routing/UI/analytics of CTAs identified [x] Dependencies with B-HOME-03 featured rules documented
-   DoD: [x] Tests [ ] A11y [ ] SCSS vars
-   Effort: 2h | Deps: [B-HOME-04.1–04.4]
```

### Unit Test Spec

-   File path: `__tests__/core/domain/homepage-cta-strategy.test.ts`
-   Key tests:
    -   `defines_primary_buyer_ctas_and_their_target_flows`
    -   `classifies_ctas_by_audience_and_hierarchy_without_overlap`
    -   `ensures_seller_ctas_do_not_conflict_with_primary_buyer_journey`
    -   `enforces_density_and_placement_guardrails_for_homepage_ctas`
    -   `supports_future_experiments_without_breaking_base_rules`
-   Status: tests proposed (to be refined once domain helpers for CTA metadata exist).

### Agent Prompts

-   **Unit Test Coach**: "From `jira/4.md` and `report/planning/plan-workbench-4-b-home-04.md`, design a unit test spec in `__tests__/core/domain/homepage-cta-strategy.test.ts` that validates CTA audience classification, hierarchy, conflict safeguards, and experimentation guardrails."
-   **Architecture-Aware Dev**: "Using `jira/4.md` and `report/planning/plan-workbench-4-b-home-04.md`, prepare domain-level types or configs (no implementation yet) to represent homepage CTAs, their audiences, hierarchy, and links to routes/flows."
-   **UI Designer**: "Based on `jira/4.md` and `report/planning/plan-workbench-4-b-home-04.md`, create low-fidelity layouts showing primary Buyer CTAs and Seller entry points across the homepage, respecting hierarchy and conflict/dilution safeguards."
-   **QA & Test Coach**: "Using `jira/4.md` and `report/planning/plan-workbench-4-b-home-04.md`, draft a QA plan and scenarios to verify that implemented homepage CTAs respect audience, hierarchy, placement rules, and do not dilute the Buyer journey."

### Open Questions

1. Should Seller onboarding CTAs appear at all on the Buyer homepage MVP, or only in global areas (e.g., header/footer) and separate Seller-focused pages?
2. Is there a maximum acceptable number of strong CTAs (primary/secondary) visible above the fold on desktop and mobile?
3. Do we need explicit analytics requirements (which CTAs must be tracked from day one) as part of this ticket, or should that be a dedicated analytics ticket?

### MVP Cut List

-   **Keep**: Clear primary Buyer CTAs and their placement; basic decision on whether and where Seller entry points appear; conflict/dilution safeguards.
-   **Defer**: Detailed experimentation rules and A/B test configurations; advanced analytics/attribution modeling; complex, dynamic CTA personalization.
