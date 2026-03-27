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
  {
    key: "membersPerWorkspace",
    free: "two",
    pro: "four",
    team: "twenty",
  },
  { key: "projectsPerAccount", free: "one", pro: "five", team: "unlimited" },
  { key: "tickets", free: "hundred", pro: "unlimited", team: "unlimited" },
  { key: "boardView", free: "included", pro: "included", team: "included" },
  {
    key: "customColumns",
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
];

export const FAQ_KEYS = ["cancel", "upgrade", "data", "payment"] as const;
