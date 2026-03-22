/**
 * Bridge export for feature access across domains.
 *
 * Feature gating (plans, subscription tiers) is implemented in `domains/billing`.
 * However, other domains (board, project shell) need to check feature access
 * without coupling to the billing domain directly.
 *
 * All domains import feature access primitives from here — not from `@/domains/billing`.
 */
export { PlanFeature } from "@/domains/billing/core/domain/planFeatures.rules";
export { useFeatureAccess } from "@/domains/billing/presentation/hooks/useFeatureAccess";
