export type EpicProgressFilter =
  | "all"
  | "notStarted"
  | "inProgress"
  | "completed";

export type EpicSortField = "name" | "createdAt" | "updatedAt" | "progress";

export type SortDirection = "asc" | "desc";
