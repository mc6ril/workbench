import { countCompletedByDoneStatuses } from "@/infrastructure/supabase/sprint/SprintRepository.supabase";

describe("SprintRepository state-based completion", () => {
  it("counts tickets whose status maps to done workflow columns", () => {
    const tickets = [
      { status: "finit" },
      { status: "in-progress" },
      { status: "completed" },
    ];
    const doneStatuses = new Set(["finit", "completed"]);

    const result = countCompletedByDoneStatuses(tickets, doneStatuses);

    expect(result).toBe(2);
  });

  it("returns 0 when no done workflow state exists", () => {
    const tickets = [{ status: "finit" }, { status: "todo" }];
    const doneStatuses = new Set<string>();

    const result = countCompletedByDoneStatuses(tickets, doneStatuses);

    expect(result).toBe(0);
  });

  it("normalizes status comparison (trim + lowercase)", () => {
    const tickets = [{ status: "  FINIT  " }, { status: "Done" }];
    const doneStatuses = new Set(["finit", "done"]);

    const result = countCompletedByDoneStatuses(tickets, doneStatuses);

    expect(result).toBe(2);
  });
});
