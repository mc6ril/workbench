/**
 * Pricing page configuration: plan definitions, feature comparison matrix, and FAQ keys.
 * Used by the pricing page to render plan cards, comparison table, and FAQ section.
 */

export type PlanKey = "free" | "pro" | "team";

export type FeatureRow = {
  key: string;
  free: string;
  pro: string;
  team: string;
};

export const PLAN_KEYS: PlanKey[] = ["free", "pro", "team"];

export const FEATURE_ROWS: FeatureRow[] = [
  { key: "workspaces", free: "one", pro: "five", team: "unlimited" },
  {
    key: "membersPerWorkspace",
    free: "three",
    pro: "ten",
    team: "twentyFive",
  },
  { key: "tickets", free: "fifty", pro: "unlimited", team: "unlimited" },
  { key: "boardView", free: "included", pro: "included", team: "included" },
  { key: "backlogView", free: "included", pro: "included", team: "included" },
  { key: "epics", free: "notIncluded", pro: "included", team: "included" },
  { key: "subtasks", free: "notIncluded", pro: "included", team: "included" },
  {
    key: "customColumns",
    free: "threeColumns",
    pro: "unlimited",
    team: "unlimited",
  },
  {
    key: "priorities",
    free: "notIncluded",
    pro: "included",
    team: "included",
  },
  {
    key: "exportImport",
    free: "notIncluded",
    pro: "included",
    team: "included",
  },
  {
    key: "advancedRoles",
    free: "notIncluded",
    pro: "notIncluded",
    team: "included",
  },
  {
    key: "prioritySupport",
    free: "notIncluded",
    pro: "notIncluded",
    team: "included",
  },
];

export const FAQ_KEYS = ["cancel", "upgrade", "data", "payment"] as const;
