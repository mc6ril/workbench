## Krafto – Global Delivery Plan

This document lists all the work items needed to reach the Krafto vision, broken down into small, trackable bricks.  
It is organized by major area: buyer experience, seller experience, payments, admin, services, and multi‑tenant SaaS.

---

## Legend

| Column   | Meaning                                              |
| -------- | ---------------------------------------------------- |
| Area     | Big product domain (Buyer, Seller, Payments, etc.)   |
| Sub‑area | More focused scope inside the area                   |
| ID       | Short identifier you can reuse in tickets            |
| Task     | Concrete small thing to do                           |
| Outcome  | What is true once the task is done                   |
| Priority | Now / Next / Later (rough guidance, can be adjusted) |

---

## 1. Buyer Experience (Discovery → Purchase → Post‑purchase)

| Area  | Sub‑area         | ID           | Task                                                             | Outcome                                                                                  | Priority |
| ----- | ---------------- | ------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------- |
| Buyer | Home / Landing   | B-HOME-01    | Clarify key message and promises of Krafto for buyers            | A concise value proposition and 2–3 core promises are defined for the homepage           | Now      |
| Buyer | Home / Landing   | B-HOME-02    | List content sections of the home page                           | Sections (hero, featured artisans, categories, collections, trust signals, CTAs) are set | Now      |
| Buyer | Home / Landing   | B-HOME-03    | Define editorial rules for featured products and shops           | Clear rules exist for what can appear in “featured” (ethics, diversity, recency, etc.)   | Next     |
| Buyer | Home / Landing   | B-HOME-04    | Define buyer CTAs (buy vs. sell) and their placement             | Primary and secondary CTAs and entry points to seller onboarding are decided             | Now      |
| Buyer | Exploration      | B-EXPLORE-01 | List all filters and sort options for product search             | Full list of filters (price, category, location, style, etc.) and sort rules documented  | Now      |
| Buyer | Exploration      | B-EXPLORE-02 | Define search result card information                            | What appears on each product card (photo, title, price, artisan, badges, location) set   | Now      |
| Buyer | Exploration      | B-EXPLORE-03 | Define empty‑state behaviors for search and categories           | Copy and UX rules exist for “no results”, “adjust filters”, and suggested categories     | Next     |
| Buyer | Categories       | B-CAT-01     | Define category taxonomy (top‑level and subcategories)           | A first version of the category tree for the marketplace is validated                    | Now      |
| Buyer | Categories       | B-CAT-02     | Decide category ownership and governance                         | Who can create/edit categories and how changes are validated is defined                  | Later    |
| Buyer | Product Page     | B-PROD-01    | Define product page sections and order                           | Structure (gallery, title, price, variants, details, reviews, shipping info) is fixed    | Now      |
| Buyer | Product Page     | B-PROD-02    | Specify minimum information every listing must contain           | Mandatory fields (photos, dimensions, materials, processing time, return policy) set     | Now      |
| Buyer | Product Page     | B-PROD-03    | Define rules for “related products” suggestions                  | Simple rules (same category, same artisan, similar price) are documented                 | Next     |
| Buyer | Product Page     | B-PROD-04    | Define trust elements on product page                            | What trust badges, artisan info, verification status, and safeguards must be displayed   | Now      |
| Buyer | Shop Page        | B-SHOP-01    | Define structure of an artisan shop page                         | Sections (intro, listings grid, reviews, policies, contact, location) are listed         | Now      |
| Buyer | Shop Page        | B-SHOP-02    | Decide which shop customization options artisans have            | Rules on banner, logo, intro text, and links are set                                     | Next     |
| Buyer | Shop Page        | B-SHOP-03    | Define “follow shop” behavior and expectations                   | What following means (notifications, favorites, newsletters) is clarified                | Later    |
| Buyer | Cart             | B-CART-01    | Define cart behavior (per buyer, per device, guest vs logged in) | Functional rules of the cart (persistence, merging, multi‑shop) are written              | Now      |
| Buyer | Cart             | B-CART-02    | Decide what information appears in cart line items               | Line item details (photo, title, options, shop, delivery estimate, fees) are listed      | Now      |
| Buyer | Cart             | B-CART-03    | Define promo/gift card handling rules (MVP vs later)             | Decision taken on whether promos are in MVP and how they behave                          | Later    |
| Buyer | Checkout         | B-CHK-01     | Define step‑by‑step buyer checkout flow                          | The exact sequence (address → shipping → payment → review) is specified                  | Now      |
| Buyer | Checkout         | B-CHK-02     | Decide supported delivery address models (home, relay, local)    | MVP decision done on which delivery options are supported                                | Now      |
| Buyer | Checkout         | B-CHK-03     | Define wording and validation rules for checkout errors          | List of possible user‑visible errors and how they are presented                          | Next     |
| Buyer | Auth in checkout | B-AUTH-01    | Decide login requirements for checkout (guest vs account)        | Clear rule on whether guest checkout exists and when users must create an account        | Now      |
| Buyer | Auth in checkout | B-AUTH-02    | Define passwordless / magic‑link strategy (MVP or later)         | Choice made and documented for authentication method in checkout                         | Later    |
| Buyer | Account          | B-ACC-01     | List all sections of buyer account area                          | Sections (profile, orders, addresses, favorites, messages, reviews) are listed           | Now      |
| Buyer | Account          | B-ACC-02     | Define what appears in order history list vs order detail        | Level of detail per screen is clearly decided                                            | Now      |
| Buyer | Account          | B-ACC-03     | Define return/dispute flow for MVP vs later                      | Rules on how disputes/returns are handled (or not) at each phase are described           | Later    |
| Buyer | Post‑purchase    | B-POST-01    | Define review system for products and shops                      | Rules on who can review, when, how many stars, and what content is allowed               | Next     |
| Buyer | Post‑purchase    | B-POST-02    | Decide notification types after purchase                         | List of emails/notifications after purchase (confirmation, shipped, delivered, review)   | Next     |

---

## 2. Seller Experience (Onboarding → Publish → Sell → Ship → Payout)

| Area   | Sub‑area      | ID        | Task                                                              | Outcome                                                                                 | Priority |
| ------ | ------------- | --------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------- |
| Seller | Onboarding    | S-ONB-01  | Define the ideal artisan profile and eligibility criteria         | Written criteria for who can become a seller on Krafto                                  | Now      |
| Seller | Onboarding    | S-ONB-02  | Describe seller onboarding steps (account → shop → first listing) | A simple, documented funnel from sign‑up to first product online                        | Now      |
| Seller | Onboarding    | S-ONB-03  | Decide verification process (manual checks, documents, proofs)    | Verification workflow, required proofs, and expected processing time are documented     | Next     |
| Seller | Onboarding    | S-ONB-04  | Define communication during onboarding (emails, status updates)   | Messages and triggers that keep artisans informed during onboarding are listed          | Next     |
| Seller | Shop Settings | S-SHOP-01 | List all shop settings available to artisans                      | Settings (name, logo, description, policies, location, languages) are enumerated        | Now      |
| Seller | Shop Settings | S-SHOP-02 | Decide mandatory vs optional fields in shop profile               | Mandatory elements required for a shop to be “live” are clearly identified              | Now      |
| Seller | Listings      | S-LIST-01 | Define data model of a listing from artisan point of view         | All fields an artisan must fill for a product (title, price, stock, variants, etc.) set | Now      |
| Seller | Listings      | S-LIST-02 | Specify listing lifecycle states (draft, pending review, live)    | List of statuses and allowed transitions for product listings                           | Next     |
| Seller | Listings      | S-LIST-03 | Define rules for inventory management per listing                 | How stock is updated, reserved, and decremented is documented                           | Next     |
| Seller | Listings      | S-LIST-04 | Decide photo requirements and quality guidelines                  | Minimum number of photos, size, framing, and forbidden content rules exist              | Next     |
| Seller | Orders        | S-ORD-01  | Describe full order lifecycle from seller perspective             | States (new, accepted, prepared, shipped, delivered, cancelled) are documented          | Now      |
| Seller | Orders        | S-ORD-02  | Define what appears on seller order dashboard                     | Columns, filters, and actions in seller order list are decided                          | Now      |
| Seller | Orders        | S-ORD-03  | Decide rules for automatic vs manual order acceptance             | When an order is auto‑accepted vs requires manual confirmation is defined               | Later    |
| Seller | Shipping      | S-SHIP-01 | Define basic shipping model for MVP (manual tracking, carriers)   | MVP decision on how shipping is represented and tracked                                 | Now      |
| Seller | Shipping      | S-SHIP-02 | List required information to mark an order as shipped             | Fields such as tracking number, carrier, shipped date are listed                        | Next     |
| Seller | Shipping      | S-SHIP-03 | Decide if and how shipping labels are handled (MVP vs later)      | Decision made about integrated label purchase and its phase (MVP or mature)             | Later    |
| Seller | Payouts       | S-PAY-01  | Define payout frequency and minimum payout amount                 | Clear rules exist on when and how often artisans receive money                          | Now      |
| Seller | Payouts       | S-PAY-02  | Decide payout delays and safeguards (fraud, disputes)             | Rules on holding funds for a delay and conditions for releasing them are described      | Next     |
| Seller | Payouts       | S-PAY-03  | Define information shown in seller payout reports                 | What a seller sees for each payout (orders included, fees, net amount) is decided       | Next     |
| Seller | Analytics     | S-ANA-01  | Define MVP analytics for artisans (simple dashboard)              | Minimal KPIs (revenue, orders, views, conversion) for the first version are listed      | Later    |
| Seller | Support       | S-SUP-01  | Define support channels available to artisans                     | Which contact methods (email, form, chat) and SLA targets exist                         | Next     |

---

## 3. Marketplace Payments and Financial Flows

| Area    | Sub‑area           | ID          | Task                                                           | Outcome                                                                                   | Priority |
| ------- | ------------------ | ----------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------- |
| Payment | Pricing Model      | P-PRICE-01  | Finalize fee structure for artisans (commission tiers, promos) | Clear grid of fees and examples for artisans, aligned with positioning                    | Now      |
| Payment | Pricing Model      | P-PRICE-02  | Define minimum order amount and any special cases              | Rules on very small orders and edge cases are written                                     | Next     |
| Payment | Stripe Integration | P-STRIPE-01 | Describe buyer payment flow and main payment methods supported | Decision on which payment methods are part of MVP (card, etc.)                            | Now      |
| Payment | Stripe Integration | P-STRIPE-02 | Define marketplace split logic (platform vs artisan share)     | Rules for calculating platform fee and artisan share per order are documented             | Now      |
| Payment | Stripe Integration | P-STRIPE-03 | List all Stripe webhooks and their purpose                     | Table of events used (payment succeeded, failed, payouts, disputes) and what they trigger | Next     |
| Payment | Orders & Statuses  | P-ORD-01    | Map payment events to order status transitions                 | For each payment event, the new order status and side effects are defined                 | Next     |
| Payment | Refunds / Disputes | P-REF-01    | Decide MVP strategy for refunds (manual vs automated)          | Clear decision on who can trigger a refund and how it is processed                        | Later    |
| Payment | Refunds / Disputes | P-REF-02    | Define how disputes/chargebacks are communicated to artisans   | Rules and messages for when a dispute appears are documented                              | Later    |
| Payment | Ledger             | P-LEDGER-01 | Define financial records needed for auditing and reporting     | List of financial data Krafto must store for compliance and internal control              | Later    |

---

## 4. Admin Back‑office and Moderation

| Area  | Sub‑area           | ID         | Task                                                          | Outcome                                                                             | Priority |
| ----- | ------------------ | ---------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------- |
| Admin | Dashboard Overview | A-DASH-01  | Define main KPIs and widgets for admin home                   | List of indicators (revenue, active artisans, new listings, reports) is established | Next     |
| Admin | Users & Shops      | A-USERS-01 | List what admin can see and edit on user profiles             | Scope of admin visibility and edit rights on users is clarified                     | Next     |
| Admin | Users & Shops      | A-SHOPS-01 | Define review process for new shops and listings              | Steps and criteria to accept or reject shops/listings are written                   | Next     |
| Admin | Users & Shops      | A-SHOPS-02 | Decide actions admins can take on shops (suspend, warn, etc.) | Catalog of possible actions, with when and how they are used                        | Next     |
| Admin | Listings           | A-LIST-01  | Define how problematic listings are reported and escalated    | Simple flow from report to moderation outcome is designed                           | Next     |
| Admin | Orders             | A-ORD-01   | Decide when admins can intervene in an order                  | Rules on force‑cancelling, adjusting, or refunding orders are documented            | Later    |
| Admin | Payments & Fees    | A-PAY-01   | Decide what admin can configure in terms of fees and taxes    | List of configurable financial parameters in admin is ready                         | Later    |
| Admin | Disputes           | A-DISP-01  | Define dispute resolution playbook                            | Standard steps, timelines, and communication templates for disputes are written     | Later    |
| Admin | Configuration      | A-CONF-01  | List all global configuration toggles (feature flags, rules)  | Table of global settings the admin back‑office will expose                          | Later    |

---

## 5. Services, Automation, and Background Work

| Area   | Sub‑area      | ID          | Task                                                     | Outcome                                                                             | Priority |
| ------ | ------------- | ----------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------- |
| Worker | Emails        | S-EMAIL-01  | List all transactional emails and who receives them      | Catalog of emails with triggers (order placed, shipped, payout, verification, etc.) | Next     |
| Worker | Emails        | S-EMAIL-02  | Define tone of voice and key content guidelines          | Simple writing guidelines for all automated messages                                | Next     |
| Worker | Notifications | S-NOTIF-01  | Decide which events trigger in‑app or push notifications | First set of important notifications for buyers and sellers is identified           | Later    |
| Worker | Search Index  | S-SEARCH-01 | Define which product and shop fields must be searchable  | List of searchable fields and filters for the search engine is written              | Next     |
| Worker | Reporting     | S-REPORT-01 | List basic internal reports needed to pilot Krafto       | Minimal reporting requirements (revenue, growth, cohorts) are defined               | Later    |
| Worker | Fraud / Risk  | S-FRAUD-01  | Identify obvious fraud and abuse scenarios               | Top risky behaviors to watch for are documented                                     | Later    |

---

## 6. Multi‑tenant / White‑label Strategy (Longer‑term)

| Area   | Sub‑area        | ID         | Task                                                             | Outcome                                                                          | Priority |
| ------ | --------------- | ---------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------- |
| Tenant | Strategy        | T-STRAT-01 | Clarify why and when multi‑tenant SaaS is needed                 | Written articulation of the value of white‑label vs single marketplace           | Later    |
| Tenant | Strategy        | T-STRAT-02 | Define target customers for white‑label (cities, partners, etc.) | A short list of initial ideal tenants and their needs                            | Later    |
| Tenant | Isolation Rules | T-ISO-01   | Define which data must be isolated per tenant                    | Clear table of objects and rules that must never cross tenants                   | Later    |
| Tenant | Configuration   | T-CONF-01  | List tenant‑specific settings (branding, fees, categories)       | Overview of which parts of the marketplace can differ from one tenant to another | Later    |

---

## 7. Cross‑cutting Topics

| Area       | Sub‑area   | ID         | Task                                                   | Outcome                                                                              | Priority |
| ---------- | ---------- | ---------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------ | -------- |
| Brand / UX | Identity   | X-BRAND-01 | Finalize brand pillars and tone of voice               | Document that describes how Krafto speaks and looks across all touchpoints           | Next     |
| Brand / UX | Trust      | X-TRUST-01 | Define all trust signals shown across the site         | List of badges, labels, and messages that communicate ethics and safety              | Next     |
| Legal      | Policies   | X-LEGAL-01 | Draft core legal documents (T&Cs, privacy, cookies)    | First versions of legal texts for the marketplace are ready (even if later improved) | Now      |
| Legal      | Artisans   | X-LEGAL-02 | Define contract terms between Krafto and artisans      | Clear, written commitments on fees, responsibilities, and rights                     | Next     |
| Operations | Support    | X-OPS-01   | Define support workflow for buyers and sellers         | Simple process for receiving, triaging, and resolving tickets                        | Next     |
| Operations | Monitoring | X-OPS-02   | Decide minimal health and incident monitoring required | List of metrics and alerts needed to keep the platform healthy                       | Later    |

---

## How to Use This Plan

-   **Create tickets** by reusing the IDs in this table as references.
-   **Adjust priorities** (Now / Next / Later) as you refine the roadmap.
-   **Split further** any task that still feels too big when you start implementing it.
