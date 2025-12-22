---
Generated: 2025-12-22 00:00:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: workbench-2
---

### Summary

Define and document the Buyer homepage content sections (hero, featured artisans, categories, collections, trust signals, and CTAs) into a clear information architecture that supports first-time visitors in understanding Workbench’s value and moving toward exploration or conversion, without yet implementing UI or data fetching.

Key constraints: respect Clean Architecture (no business logic in UI, no Supabase in presentation), keep this ticket content/IA-only (implementation in later tickets), and align copy, tone, and section purposes with B-HOME-01 Buyer messaging.

### Solution Outline

-   **Domain / Usecases**: No new logic; only clarify which domain concepts (artisans, categories, collections, trust signals) will later be modeled and which user flows they support (discovery, reassurance, conversion).
-   **Infrastructure**: None in this step; later tickets will define where data for each section comes from (Supabase tables, derived views, etc.).
-   **Presentation**: Produce a written spec that enumerates homepage sections, for each: goal, key content elements, entry/exit points, and section ordering; this spec will directly inform future UI design tickets and Next.js page/component breakdown.

### Sub-Tickets

```markdown
### B-HOME-02.1 - Define hero section content and CTAs

-   AC: [ ] Hero goal and key messages defined [ ] Primary/secondary CTAs and target flows documented
-   DoD: [ ] Tests [ ] A11y [ ] SCSS vars
-   Effort: 2h | Deps: [B-HOME-01 messaging]

### B-HOME-02.2 - Specify featured artisans and categories sections

-   AC: [ ] Featured artisans section purpose and content model described [ ] Categories list and labeling rules defined
-   DoD: [ ] Tests [ ] A11y [ ] SCSS vars
-   Effort: 3h | Deps: [B-HOME-01 messaging]

### B-HOME-02.3 - Define collections and trust signals sections

-   AC: [ ] Collections section types and usage scenarios documented [ ] Trust signals types and placement rules defined
-   DoD: [ ] Tests [ ] A11y [ ] SCSS vars
-   Effort: 3h | Deps: [B-HOME-01 messaging]

### B-HOME-02.4 - Consolidate homepage information architecture & navigation flows

-   AC: [ ] Final homepage section ordering and hierarchy defined [ ] Entry/exit points and key navigation paths mapped
-   DoD: [ ] Tests [ ] A11y [ ] SCSS vars
-   Effort: 2h | Deps: [B-HOME-02.1-3]
```

### Unit Test Spec

-   File path: `__tests__/core/domain/homepage-content-architecture.test.ts`
-   Key tests:
    -   `defines_required_homepage_sections_for_buyer`
    -   `enforces_consistent_ordering_of_sections_for_buyer_journey`
    -   `validates_that_each_section_has_goal_and_navigation_targets`
    -   `ensures_trust_signals_present_before_primary_conversion_ctas`
    -   `supports_future_extension_with_additional_optional_sections`
-   Status: tests proposed

### Agent Prompts

-   **Unit Test Coach**: “From `jira/2.md` and the planning report `report/planning/plan-workbench-2-b-home-02.md`, design a unit test spec in `__tests__/core/domain/homepage-content-architecture.test.ts` that validates required sections, ordering, and presence of trust signals before key CTAs.”
-   **Architecture-Aware Dev**: “Using `jira/2.md` and `report/planning/plan-workbench-2-b-home-02.md`, prepare domain/usecase scaffolding (types or schemas only, no infrastructure or UI) that can later support Buyer homepage sections and their relationships.”
-   **UI Designer**: “Based on `jira/2.md` and `report/planning/plan-workbench-2-b-home-02.md`, create low-fidelity wireframes for the Buyer homepage that visually express each section, their order, and primary/secondary CTAs.”
-   **QA & Test Coach**: “Using `jira/2.md` and `report/planning/plan-workbench-2-b-home-02.md`, draft a QA plan and high-level test scenarios (including a11y) to validate that the implemented Buyer homepage respects section definitions, ordering, and trust signal placement.”

### Open Questions

1. Should the initial MVP homepage include one or multiple collections (e.g., “new arrivals” and “best-sellers”), or start with a single curated collection to reduce scope?
2. Are there mandatory trust metrics (e.g., minimum number of testimonials, review score type) that must be present for launch, or can they be progressively enhanced later?

### Section Spec – B-HOME-02.1 Hero content and CTAs

-   **Goal of the hero section**:

    -   Make it immediately clear to first-time Buyer visitors what Workbench does for them and why it matters, using the finalized value proposition from workbench-1.
    -   Drive them toward a first exploration action (primary CTA) while also offering a learning path (secondary CTA) for visitors who need more context before acting.

-   **Core content (desktop and mobile)**:

-   **Hero title (H1)**: reuse the finalized hero title from `docs/homepage/value-proposition.md` (workbench-1): “Make supplier catalogs clear, centralized, and easy to act on.”
-   **Hero subtitle**: reuse the finalized subtitle from the same doc (`docs/homepage/value-proposition.md`), placed directly under the H1.
-   **Supporting promises**: visually connect (via layout) to the three core promises defined in `docs/homepage/value-proposition.md`, either as a nearby bullet list or as a short “key benefits” strip adjacent to the hero.

-   **Primary and secondary CTAs**:

    -   **Primary CTA (main action)**:
        -   Copy (working label): “Explore catalogs”.
        -   Target flow: leads buyers into the main discovery experience for supplier catalogs (future `/catalogs` or equivalent route).
        -   Behavior: scrolls or navigates to the first discovery section (e.g., featured artisans / categories) if on the same page, or routes to the dedicated catalogs page when implemented.
    -   **Secondary CTA (learn path)**:
        -   Copy (working label): “See how Workbench works”.
        -   Target flow: leads to an explanatory page or section (e.g., “How it works” section or `/how-it-works` route) that explains key steps and benefits before committing.
        -   Behavior: scrolls to an information section on the homepage in MVP, with the option to later link to a dedicated product explanation page.
    -   Optional tertiary action (text link only, lower priority): “Talk to us” or “Book a demo”, positioned near but visually lighter than the primary/secondary CTAs, linking to a contact or demo request flow (future ticket).

-   **Layout and placement guidelines**:

    -   Hero section must be fully visible “above the fold” on common desktop resolutions, with H1, subtitle, and at least the primary CTA visible without scrolling.
    -   On mobile, ensure the H1, subtitle, and primary CTA are visible within the first screen; secondary CTA may be stacked under the primary CTA.
    -   Visual hierarchy: primary CTA is visually dominant; secondary CTA uses a lighter visual style but remains clearly actionable.

-   **Entry and exit points**:
    -   Entry: default landing for `/` route for Buyer context (no special query or feature flags required).
    -   Exit (after primary CTA): user is directed toward discovery (featured artisans, categories, or collections) and can continue exploring without friction.
    -   Exit (after secondary CTA): user is directed toward an explanatory section or page, with a clear subsequent CTA back to exploration or contact/demo.

### Section Spec – B-HOME-02.2 Featured artisans and categories

-   **Overall goal of these sections**:

    -   Help Buyers quickly understand the variety and quality of artisans and products available on Workbench.
    -   Provide two complementary entry points into discovery: by **artisan** (human/brand angle) and by **category** (need/problem angle).

-   **Featured artisans section**:

    -   **Goal**: Highlight a small, curated set of artisans that represent the breadth and quality of the marketplace (styles, locations, product types), and make it easy to dive into each artisan’s shop.
    -   **Content model for each featured artisan card** (conceptual, not implementation):
        -   Primary visual: hero photo or representative image for the artisan (or their work).
        -   Name of the artisan or shop.
        -   Short positioning line (e.g., specialty, style, or location) – 1 short line only.
        -   Optional trust cue (e.g., “Verified”, “Top rated”, or similar) – actual trust logic defined in later tickets.
    -   **Section-level elements**:
        -   Title: communicates that this block is a curated selection of artisans (exact copy to be refined in a future messaging/UI ticket).
        -   Optional short description (one line) clarifying why these artisans are featured (e.g., “editor’s picks”, diversity, recency).
        -   “View all artisans” CTA that leads to the main artisan exploration page or route.
    -   **Ordering and quantity guidelines**:
        -   MVP: 3–6 featured artisans on desktop, 3–4 on mobile (scrollable if needed).
        -   Featured artisans section appears **before** categories, to emphasize the human side of the marketplace.

-   **Categories section**:

    -   **Goal**: Give Buyers a fast way to browse by high-level needs (product type, usage, or theme), using a small set of clear, mutually understandable categories.
    -   **Content model for each category tile/card**:
        -   Category label (short, plain language, no jargon).
        -   Visual element (icon or simple illustration) that helps scan and differentiate categories.
        -   Optional short helper text (one line) if needed to clarify what is inside the category.
    -   **Section-level elements**:
        -   Title: makes it explicit that this block is for browsing by category.
        -   Optional description to clarify that more categories exist beyond those listed (e.g., link to “See all categories” or “Browse all”).
    -   **Category selection rules (content, not data model)**:
        -   MVP: 6–10 top-level categories surfaced on the homepage, derived from the taxonomy defined in B-CAT-01.
        -   Categories chosen should cover the main use cases/persona needs identified in `docs/homepage/buyer-personas.md`.
        -   Avoid overlapping meanings; each category should be clearly distinct from the others.

-   **Relationship and navigation between the two sections**:

    -   Featured artisans and categories should be close to each other in the scroll, with a clear visual distinction (people vs topics).
    -   From featured artisans:
        -   Clicking an artisan card leads to the artisan’s shop page (future ticket: B-SHOP-01 implementation).
    -   From categories:
        -   Clicking a category leads to a pre-filtered exploration view (future implementation of B-EXPLORE-01 and B-CAT-01).

### Section Spec – B-HOME-02.3 Collections and trust signals

-   **Overall goal of these sections**:

    -   Reinforce that there is depth and curation in the catalog (collections) and that Workbench is **safe and trustworthy** (trust signals).
    -   Provide “editorial shortcuts” into the catalog (collections) and reduce perceived risk before conversion (trust section).

-   **Collections / thematic highlights section**:

    -   **Goal**: Surface a small number of curated entry points (e.g., seasonal themes, best-sellers, new arrivals) that help Buyers discover relevant products without having to know exactly what to search for.
    -   **Types of collections (conceptual)**:
        -   Seasonal or event-based collections (e.g., “Holiday gifting”, “Back to work”).
        -   Performance-based collections (e.g., “Best-sellers”, “Most loved by teams”).
        -   Freshness-based collections (e.g., “New arrivals”).
    -   **Content model for each collection block**:
        -   Title of the collection (short, action-friendly).
        -   Short description (one line) explaining what makes this collection special.
        -   Visual: either a hero image or a small grid of 2–4 representative products.
        -   CTA leading to the full collection view (future dedicated filtered page or search preset).
    -   **Section-level guidelines**:
        -   MVP: start with **one main collection** (e.g., “Best-sellers” or “Editor’s picks”) to keep scope manageable.
        -   Collections block should appear **after** featured artisans and categories to avoid overwhelming the top of the page.
        -   Make it visually distinct from categories (more editorial, less grid-like navigation).

-   **Trust signals section**:

    -   **Goal**: Provide clear, concise evidence that using Workbench is safe and professional-grade for purchasing teams (not a random marketplace).
    -   **Types of trust elements (conceptual)**:
        -   Social proof (e.g., short quote/testimonial from a buyer, overall satisfaction metric).
        -   Scale / credibility indicators (e.g., number of artisans, number of products, or companies using Workbench – when available).
        -   Guarantees and safeguards (e.g., secure payments, clear return/dispute policy, curated artisans).
    -   **Content model**:
        -   Section title focused on reassurance (exact wording to be refined later).
        -   2–4 trust “blocks” or bullets, each with:
            -   Short heading (e.g., “Verified artisans”).
            -   One short explanatory line.
            -   Optional icon or badge visual.
    -   **Placement**:
        -   Appears **before** the final strong CTAs or any conversion-heavy block (e.g., before a secondary hero or “Get started” strip).
        -   Can be close to or integrated with a global trust strategy defined in X-TRUST-01 later.

-   **Navigation and interaction notes**:

    -   Collections:
        -   Each collection CTA leads to a filtered product view that can be shared/linked.
        -   If collections are not yet fully implemented in infrastructure, the section can initially be static (manual curation) with clear constraints.
    -   Trust signals:
        -   Trust elements themselves are mostly informational, but they can link to more detailed pages (e.g., “How Workbench selects artisans”, “Security & payments”).

### Section Spec – B-HOME-02.4 Information architecture & navigation flows

-   **Goal of this consolidation step**:

    -   Define the **final ordering and grouping** of homepage sections for Buyers, based on the previous specs (hero, featured artisans, categories, collections, trust signals).
    -   Clarify the **main navigation paths** (from hero and CTAs) so that later implementation tickets know which routes/sections to connect.

-   **Final recommended section order (top → bottom)**:

    1. Hero (value proposition + primary/secondary CTAs, linked to buyer exploration and “how it works”).
    2. Core promises (if visually separated from hero) or integrated near hero.
    3. Featured artisans (human angle, curated set).
    4. Categories (overview of main product “entry points”).
    5. Collections / thematic highlights (editorial shortcuts: best-sellers, new arrivals, etc.).
    6. Trust signals (reassurance before committing).
    7. Footer or any global site-level elements (not specific to this ticket).

-   **Primary navigation flows (from CTAs and sections)**:

    -   From hero primary CTA (“Explore catalogs”):
        -   Scroll to or navigate into the exploration area anchored near featured artisans / categories.
        -   In a dedicated implementation ticket, this may map to a `/catalogs` or `/explore` route with pre-configured filters.
    -   From hero secondary CTA (“See how Workbench works”):
        -   Scroll to a “how it works” explanatory block on the homepage (to be defined in a later ticket) or navigate to a dedicated route (e.g., `/how-it-works`).
    -   From featured artisans:
        -   Each artisan card leads to the artisan’s shop page (later implementation of B-SHOP-01).
    -   From categories:
        -   Each category leads to a filtered product search or category page (later implementation of B-EXPLORE-01 and B-CAT-01).
    -   From collections:
        -   Each collection leads to a pre-filtered product listing representing that collection.

-   **Secondary navigation and loops**:

    -   After visiting an artisan shop or a category/collection page, users can navigate back to:
        -   The homepage (via logo or “Home” link).
        -   Another discovery entry point (e.g., categories menu, collections carousel) – details in future navigation/header tickets.
    -   Trust signals may include links (“Learn more about our guarantees”) that lead to:
        -   Dedicated informational pages (e.g., security, artisan selection policy).
        -   FAQ or help center (to be specified in cross-cutting tickets).

-   **Implications for future implementation tickets**:

    -   Navigation and routes:
        -   Implementation tickets must define the actual Next.js routes (e.g., `/`, `/catalogs`, `/how-it-works`, `/shops/[id]`, `/categories/[slug]`, `/collections/[slug]`).
    -   Shared components:
        -   Some elements (e.g., category tiles, collection cards, trust blocks) are good candidates for reusable UI components under `presentation/components/ui/`.
    -   Tracking/analytics (future):
        -   The main entry points (hero primary CTA, secondary CTA, clicks on featured artisans/categories/collections) can later be instrumented to understand buyer behavior.

### Sub-Ticket Status

-   [x] B-HOME-02.1 - Define hero section content and CTAs
-   [x] B-HOME-02.2 - Specify featured artisans and categories sections
-   [x] B-HOME-02.3 - Define collections and trust signals sections
-   [x] B-HOME-02.4 - Consolidate homepage information architecture & navigation flows
