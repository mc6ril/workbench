import type { Subscription } from "@/core/domain/schema/subscription.schema";
import {
  PLAN_RANK,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/core/domain/schema/subscription.schema";

/**
 * All gatable features in the application.
 * Boolean features are on/off; limit features have numeric thresholds.
 */
export enum PlanFeature {
  EPICS = "epics",
  BACKLOG_VIEW = "backlogView",
  SUBTASKS = "subtasks",
  PRIORITIES = "priorities",
  EXPORT_IMPORT = "exportImport",
  ADVANCED_ROLES = "advancedRoles",
  WORKSPACES = "workspaces",
  MEMBERS_PER_WORKSPACE = "membersPerWorkspace",
  TICKETS = "tickets",
  CUSTOM_COLUMNS = "customColumns",
}

export type FeatureAccessType = "boolean" | "limit";

type BooleanCapability = {
  type: "boolean";
  access: boolean;
};

type LimitCapability = {
  type: "limit";
  limit: number;
};

/** A single feature capability entry — either boolean access or a numeric limit (-1 = unlimited). */
export type FeatureCapability = BooleanCapability | LimitCapability;

export type PlanCapabilityMap = Record<PlanFeature, FeatureCapability>;

const UNLIMITED = -1;

/** Full capability matrix for each subscription plan. */
export const PLAN_CAPABILITIES: Record<SubscriptionPlan, PlanCapabilityMap> = {
  [SubscriptionPlan.FREE]: {
    [PlanFeature.EPICS]: { type: "boolean", access: true },
    [PlanFeature.BACKLOG_VIEW]: { type: "boolean", access: false },
    [PlanFeature.SUBTASKS]: { type: "boolean", access: false },
    [PlanFeature.PRIORITIES]: { type: "boolean", access: false },
    [PlanFeature.EXPORT_IMPORT]: { type: "boolean", access: false },
    [PlanFeature.ADVANCED_ROLES]: { type: "boolean", access: false },
    [PlanFeature.WORKSPACES]: { type: "limit", limit: 1 },
    [PlanFeature.MEMBERS_PER_WORKSPACE]: { type: "limit", limit: 2 },
    [PlanFeature.TICKETS]: { type: "limit", limit: 100 },
    [PlanFeature.CUSTOM_COLUMNS]: { type: "limit", limit: 0 },
  },
  [SubscriptionPlan.PRO]: {
    [PlanFeature.EPICS]: { type: "boolean", access: true },
    [PlanFeature.BACKLOG_VIEW]: { type: "boolean", access: true },
    [PlanFeature.SUBTASKS]: { type: "boolean", access: true },
    [PlanFeature.PRIORITIES]: { type: "boolean", access: true },
    [PlanFeature.EXPORT_IMPORT]: { type: "boolean", access: true },
    [PlanFeature.ADVANCED_ROLES]: { type: "boolean", access: false },
    [PlanFeature.WORKSPACES]: { type: "limit", limit: 5 },
    [PlanFeature.MEMBERS_PER_WORKSPACE]: { type: "limit", limit: 4 },
    [PlanFeature.TICKETS]: { type: "limit", limit: UNLIMITED },
    [PlanFeature.CUSTOM_COLUMNS]: { type: "limit", limit: UNLIMITED },
  },
  [SubscriptionPlan.TEAM]: {
    [PlanFeature.EPICS]: { type: "boolean", access: true },
    [PlanFeature.BACKLOG_VIEW]: { type: "boolean", access: true },
    [PlanFeature.SUBTASKS]: { type: "boolean", access: true },
    [PlanFeature.PRIORITIES]: { type: "boolean", access: true },
    [PlanFeature.EXPORT_IMPORT]: { type: "boolean", access: true },
    [PlanFeature.ADVANCED_ROLES]: { type: "boolean", access: true },
    [PlanFeature.WORKSPACES]: { type: "limit", limit: UNLIMITED },
    [PlanFeature.MEMBERS_PER_WORKSPACE]: { type: "limit", limit: 20 },
    [PlanFeature.TICKETS]: { type: "limit", limit: UNLIMITED },
    [PlanFeature.CUSTOM_COLUMNS]: { type: "limit", limit: UNLIMITED },
  },
};

/**
 * Whether the given plan has access to a boolean feature, or a non-zero limit for limit features.
 * For limit features, returns true if the limit is non-zero (including unlimited).
 */
export const canAccessFeature = (
  plan: SubscriptionPlan,
  feature: PlanFeature
): boolean => {
  const capability = PLAN_CAPABILITIES[plan][feature];
  if (capability.type === "boolean") {
    return capability.access;
  }
  return capability.limit !== 0;
};

/**
 * Returns the numeric limit for a limit feature. Returns -1 for unlimited.
 * For boolean features returns -1 if accessible, 0 otherwise.
 */
export const getFeatureLimit = (
  plan: SubscriptionPlan,
  feature: PlanFeature
): number => {
  const capability = PLAN_CAPABILITIES[plan][feature];
  if (capability.type === "limit") {
    return capability.limit;
  }
  return capability.access ? UNLIMITED : 0;
};

/**
 * Returns the lowest-tier plan that grants access to the given feature.
 * Iterates plans in rank order (FREE → PRO → TEAM).
 */
export const getMinimumPlanForFeature = (
  feature: PlanFeature
): SubscriptionPlan => {
  const plansByRank = Object.values(SubscriptionPlan).sort(
    (a, b) => PLAN_RANK[a] - PLAN_RANK[b]
  );

  for (const plan of plansByRank) {
    if (canAccessFeature(plan, feature)) {
      return plan;
    }
  }

  return SubscriptionPlan.TEAM;
};

/** Result of a feature access check, including the upgrade path when locked. */
export type FeatureAccessResult = {
  hasAccess: boolean;
  currentPlan: SubscriptionPlan;
  minimumPlan: SubscriptionPlan;
  limit?: number;
};

/**
 * Determines the effective plan for a subscription, accounting for degraded statuses.
 * Canceled or past-due subscriptions fall back to FREE; superusers get TEAM.
 */
export const getEffectivePlan = (
  subscription: Subscription
): SubscriptionPlan => {
  if (subscription.isSuperuser) {
    return SubscriptionPlan.TEAM;
  }

  const isDegraded =
    subscription.status === SubscriptionStatus.CANCELED ||
    subscription.status === SubscriptionStatus.PAST_DUE;

  if (isDegraded) {
    return SubscriptionPlan.FREE;
  }

  return subscription.plan;
};
