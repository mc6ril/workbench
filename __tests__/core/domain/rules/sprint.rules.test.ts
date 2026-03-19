import {
  canCompleteSprint,
  canStartSprint,
  isSprintEditable,
} from "@/modules/board/core/domain/rules/sprint.rules";
import type { Sprint } from "@/modules/board/core/domain/schema/sprint.schema";

describe("Sprint Business Rules", () => {
  const createSprint = (status: Sprint["status"]): Sprint => ({
    id: "sprint-1",
    projectId: "project-1",
    name: "Sprint 1",
    goal: null,
    startDate: null,
    endDate: null,
    status,
    position: 0,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  });

  describe("canStartSprint", () => {
    it("returns true only for planned sprints", () => {
      expect(canStartSprint(createSprint("planned"))).toBe(true);
      expect(canStartSprint(createSprint("active"))).toBe(false);
      expect(canStartSprint(createSprint("completed"))).toBe(false);
    });
  });

  describe("canCompleteSprint", () => {
    it("returns true only for active sprints", () => {
      expect(canCompleteSprint(createSprint("active"))).toBe(true);
      expect(canCompleteSprint(createSprint("planned"))).toBe(false);
      expect(canCompleteSprint(createSprint("completed"))).toBe(false);
    });
  });

  describe("isSprintEditable", () => {
    it("returns false only for completed sprints", () => {
      expect(isSprintEditable(createSprint("planned"))).toBe(true);
      expect(isSprintEditable(createSprint("active"))).toBe(true);
      expect(isSprintEditable(createSprint("completed"))).toBe(false);
    });
  });
});
