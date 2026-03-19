import type { Sprint } from "@/modules/board/core/domain/schema/sprint.schema";

/**
 * A sprint can only be started if it is currently in planned status.
 */
export const canStartSprint = (sprint: Sprint): boolean => {
  return sprint.status === "planned";
};

/**
 * A sprint can only be completed if it is currently active.
 */
export const canCompleteSprint = (sprint: Sprint): boolean => {
  return sprint.status === "active";
};

/**
 * Check if a sprint is editable (not completed).
 */
export const isSprintEditable = (sprint: Sprint): boolean => {
  return sprint.status !== "completed";
};
