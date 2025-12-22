---
Generated: 2025-12-22 00:00:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: workbench-3
---

### Summary

Define clear, explicit editorial rules for featured products and shops on the Buyer homepage to ensure ethical, diverse, transparent curation aligned with Workbench's positioning, while remaining operationally feasible. This is a documentation/definition ticket that will inform future domain modeling and implementation.

Key constraints: no code implementation in this ticket (documentation only), rules must align with B-HOME-01 messaging and B-HOME-02 section definitions, and output must be actionable for future technical implementation.

### Solution Outline

-   **Domain / Usecases**: Define eligibility, diversity, and rotation rules that will later inform domain types (e.g., `FeaturedProduct`, `FeaturedShop`, eligibility status flags) and usecases (e.g., `listFeaturedProducts`, `listFeaturedShops`).
-   **Infrastructure**: Document required fields/flags (e.g., `isFeatured`, `featuredUntil`, `eligibilityStatus`) for future Supabase schema design, but no implementation in this ticket.
-   **Presentation**: Establish the editorial contract that future UI/UX tickets must respect when displaying featured content, ensuring transparency and buyer trust.

### Sub-Tickets

```markdown
### B-HOME-03.1 - Define scope and terminology for "featured" surfaces

-   AC: [x] All "featured" surfaces on Buyer homepage identified and documented [x] Each surface's content type (products/shops/collections) clearly defined [x] Distinction from standard listings explained
-   DoD: [x] Written spec saved in docs/ [ ] Reviewed by product/UX
-   Effort: 2h | Deps: [B-HOME-02 section definitions]

### B-HOME-03.2 - Define eligibility rules for featured products

-   AC: [ ] Product eligibility criteria documented (ethics, quality, availability, data completeness) [ ] Metadata signals for featuring decisions defined [ ] Exclusion rules for non-eligible products specified
-   DoD: [ ] Written spec saved in docs/ [ ] Reviewed by product/brand
-   Effort: 3h | Deps: [B-HOME-03.1]

### B-HOME-03.3 - Define eligibility rules for featured shops

-   AC: [ ] Shop eligibility criteria documented (platform rules, profile completeness, activity level) [ ] Rotation/diversity logic to prevent over-exposure defined [ ] Exclusion rules for suspended/non-compliant shops specified
-   DoD: [ ] Written spec saved in docs/ [ ] Reviewed by product/brand
-   Effort: 3h | Deps: [B-HOME-03.1]

### B-HOME-03.4 - Define diversity, fairness, and recency criteria

-   AC: [x] Diversity guardrails documented (categories, styles, geographies, artisan profiles) [x] Rotation windows and repeat frequency rules defined [x] Recency/freshness rules and review cadence specified [x] Manual override process documented
-   DoD: [x] Written spec saved in docs/ [ ] Reviewed by product/brand/UX
-   Effort: 4h | Deps: [B-HOME-03.2, B-HOME-03.3]

### B-HOME-03.5 - Define operational workflow and transparency rules

-   AC: [x] Ownership and curation roles documented [x] Workflow for proposing/approving/updating featured content defined [x] Tooling dependencies listed [x] Transparency rules for buyer communication documented [x] Constraints/non-goals explicitly listed
-   DoD: [x] Written spec saved in docs/ [ ] Reviewed by product/brand/UX [ ] Follow-up tickets identified
-   Effort: 3h | Deps: [B-HOME-03.4]
```

### Unit Test Spec

-   File path: `__tests__/core/domain/featured-content-rules.test.ts`
-   Key tests:
    -   `defines_eligibility_criteria_for_featured_products`
    -   `defines_eligibility_criteria_for_featured_shops`
    -   `enforces_diversity_requirements_for_featured_content`
    -   `validates_recency_rules_for_featured_selection`
    -   `ensures_exclusion_rules_for_non_compliant_content`
-   Status: tests proposed (note: actual domain logic implementation will be in future tickets; this spec validates rule definitions)

### Agent Prompts

-   **Unit Test Coach**: "From `jira/3.md` and `report/planning/plan-workbench-3-b-home-03.md`, design a unit test spec in `__tests__/core/domain/featured-content-rules.test.ts` that validates eligibility criteria, diversity requirements, recency rules, and exclusion logic for featured products and shops."
-   **Architecture-Aware Dev**: "Using `jira/3.md` and `report/planning/plan-workbench-3-b-home-03.md`, prepare domain type definitions (schemas/types only, no implementation) for featured content eligibility, diversity signals, and rotation rules that will later support usecases like `listFeaturedProducts` and `listFeaturedShops`."
-   **UI Designer**: "Based on `jira/3.md` and `report/planning/plan-workbench-3-b-home-03.md`, ensure future UI designs for featured sections respect transparency requirements (e.g., 'editorial selection' labels) and diversity representation (visual balance across categories/styles)."
-   **QA & Test Coach**: "Using `jira/3.md` and `report/planning/plan-workbench-3-b-home-03.md`, draft a QA plan to validate that implemented featured content respects eligibility rules, diversity criteria, recency requirements, and exclusion rules defined in the editorial rules document."

### Open Questions

1. Should featured content rotation be automated (algorithm-based) or manual (editorial curation) in the MVP, or a hybrid approach?
2. Are there specific diversity quotas (e.g., minimum X% from different categories) that must be enforced, or are guidelines sufficient for MVP?
3. What is the minimum viable set of eligibility criteria that can be validated with current product/shop data, versus criteria requiring new data fields or infrastructure?

### MVP Cut List

If scope needs reduction, consider:

-   **Keep**: Core eligibility rules (ethics, quality, data completeness), basic diversity guidelines, exclusion rules
-   **Defer**: Complex rotation algorithms, detailed quota systems, advanced recency scoring, automated curation tooling
