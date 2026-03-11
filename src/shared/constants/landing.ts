export const VALUE_KEYS = ["simplicity", "clarity", "control"] as const;
export const FEATURE_KEYS = ["backlog", "board", "epics", "subtasks"] as const;
export const PREVIEW_COLUMNS = ["todo", "inProgress", "done"] as const;
export const IMPACT_KEYS = ["time", "alignment", "serenity"] as const;
export const RHYTHM_KEYS = ["capture", "plan", "act"] as const;
export const HERO_PROOF_KEYS = [
  "proofNoCard",
  "proofFreeStart",
  "proofCancelAnytime",
] as const;
export const TRUST_ITEM_KEYS = [
  { iconKey: "freeForeverIcon", labelKey: "freeForever" },
  { iconKey: "noCreditCardIcon", labelKey: "noCreditCard" },
  { iconKey: "noComplexityIcon", labelKey: "noComplexity" },
] as const;

export const PREVIEW_ITEM_KEYS = {
  todo: ["todo1", "todo2"],
  inProgress: ["inProgress1"],
  done: ["done1"],
} as const;
