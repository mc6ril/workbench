import {
  buildTicketAriaLabel,
  buildTicketCode,
  normalizeTicketSearch,
} from "@/modules/board/utils/ticketUtils";

describe("buildTicketCode", () => {
  it("returns uppercase code with number", () => {
    expect(buildTicketCode("wb", 12)).toBe("WB-12");
    expect(buildTicketCode("  prj ", 3)).toBe("PRJ-3");
  });

  it("returns null when short code is missing", () => {
    expect(buildTicketCode("", 1)).toBeNull();
    expect(buildTicketCode("   ", 1)).toBeNull();
    expect(buildTicketCode(null, 1)).toBeNull();
    expect(buildTicketCode(undefined, 1)).toBeNull();
  });
});

describe("normalizeTicketSearch", () => {
  it("returns empty for empty search", () => {
    expect(normalizeTicketSearch("", "WB")).toBe("");
    expect(normalizeTicketSearch("   ", "WB")).toBe("");
  });

  it("keeps regular terms", () => {
    expect(normalizeTicketSearch("bug", "WB")).toBe("bug");
    expect(normalizeTicketSearch("WB-12", "WB")).toBe("WB-12");
  });

  it("returns input when project short code is unavailable", () => {
    expect(normalizeTicketSearch("WB", undefined)).toBe("WB");
    expect(normalizeTicketSearch("WB", null)).toBe("WB");
    expect(normalizeTicketSearch("WB", "   ")).toBe("WB");
  });

  it("turns project shortcode terms into no-op search", () => {
    expect(normalizeTicketSearch("WB", "WB")).toBe("");
    expect(normalizeTicketSearch("wb-", "WB")).toBe("");
    expect(normalizeTicketSearch(" wb ", "WB")).toBe("");
  });
});

describe("buildTicketAriaLabel", () => {
  it("builds full aria label with all optional fields", () => {
    const result = buildTicketAriaLabel({
      ticketAriaLabel: "Ticket",
      title: "Fix login",
      ticketCode: "WB-1",
      status: "todo",
      statusLabel: "Status",
      assigneeName: "Alice",
      assigneeLabel: "Assignee",
      priority: "urgent",
      priorityLabel: "Priority",
      storyPointsLabel: "3 points",
    });

    expect(result).toBe(
      "Ticket: Fix login, WB-1, Status: todo, Assignee: Alice, Priority: urgent, 3 points"
    );
  });

  it("keeps only mandatory title when optional fields are absent", () => {
    const result = buildTicketAriaLabel({
      ticketAriaLabel: "Ticket",
      title: "Refactor API",
      ticketCode: null,
      assigneeName: null,
      priority: null,
    });

    expect(result).toBe("Ticket: Refactor API");
  });

  it("skips fields when value or label is missing", () => {
    const result = buildTicketAriaLabel({
      ticketAriaLabel: "Ticket",
      title: "Write tests",
      status: "in-progress",
      assigneeName: "Bob",
      priority: "normal",
      storyPointsLabel: "5 points",
    });

    expect(result).toBe("Ticket: Write tests, 5 points");
  });
});
