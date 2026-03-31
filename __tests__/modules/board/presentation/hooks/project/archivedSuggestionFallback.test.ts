import { buildArchivedSuggestionFallback } from "@/modules/board/presentation/hooks/project/archivedSuggestionFallback";

const PROJECT_ID = "d782e965-c910-4463-9094-465fbb3409ad";

describe("buildArchivedSuggestionFallback", () => {
  it("returns empty when active tickets exist", () => {
    const result = buildArchivedSuggestionFallback({
      projectId: PROJECT_ID,
      projectShortCode: "WB",
      searchTerm: "WB-75",
      activeTicketsCount: 1,
      archivedTicket: {
        id: "11111111-1111-1111-1111-111111111111",
        projectId: PROJECT_ID,
        title: "Archived ticket",
        description: null,
        columnId: "22222222-2222-2222-2222-222222222222",
        position: 0,
        codeNumber: 75,
        priority: null,
        dueDate: null,
        storyPoints: null,
        createdAt: new Date("2026-03-01T00:00:00.000Z"),
        updatedAt: new Date("2026-03-01T00:00:00.000Z"),
        completedAt: new Date("2026-03-01T00:00:00.000Z"),
        archivedAt: new Date("2026-03-02T00:00:00.000Z"),
        archivedWeekStart: new Date("2026-03-01T00:00:00.000Z"),
        createdBy: null,
      },
    });

    expect(result).toEqual([]);
  });

  it("returns empty when search term is not a valid project ticket code", () => {
    const result = buildArchivedSuggestionFallback({
      projectId: PROJECT_ID,
      projectShortCode: "WB",
      searchTerm: "my first ticket",
      activeTicketsCount: 0,
      archivedTicket: null,
    });

    expect(result).toEqual([]);
  });

  it("returns empty when prefix does not match the project short code", () => {
    const result = buildArchivedSuggestionFallback({
      projectId: PROJECT_ID,
      projectShortCode: "WB",
      searchTerm: "ACME-75",
      activeTicketsCount: 0,
      archivedTicket: {
        id: "11111111-1111-1111-1111-111111111111",
        projectId: PROJECT_ID,
        title: "Archived ticket",
        description: null,
        columnId: "22222222-2222-2222-2222-222222222222",
        position: 0,
        codeNumber: 75,
        priority: null,
        dueDate: null,
        storyPoints: null,
        createdAt: new Date("2026-03-01T00:00:00.000Z"),
        updatedAt: new Date("2026-03-01T00:00:00.000Z"),
        completedAt: new Date("2026-03-01T00:00:00.000Z"),
        archivedAt: new Date("2026-03-02T00:00:00.000Z"),
        archivedWeekStart: new Date("2026-03-01T00:00:00.000Z"),
        createdBy: null,
      },
    });

    expect(result).toEqual([]);
  });

  it("returns empty when archived ticket is missing or not archived", () => {
    const missing = buildArchivedSuggestionFallback({
      projectId: PROJECT_ID,
      projectShortCode: "WB",
      searchTerm: "WB-75",
      activeTicketsCount: 0,
      archivedTicket: null,
    });

    const notArchived = buildArchivedSuggestionFallback({
      projectId: PROJECT_ID,
      projectShortCode: "WB",
      searchTerm: "WB-75",
      activeTicketsCount: 0,
      archivedTicket: {
        id: "11111111-1111-1111-1111-111111111111",
        projectId: PROJECT_ID,
        title: "Active ticket",
        description: null,
        columnId: "22222222-2222-2222-2222-222222222222",
        position: 0,
        codeNumber: 75,
        priority: null,
        dueDate: null,
        storyPoints: null,
        createdAt: new Date("2026-03-01T00:00:00.000Z"),
        updatedAt: new Date("2026-03-01T00:00:00.000Z"),
        completedAt: null,
        archivedAt: null,
        archivedWeekStart: null,
        createdBy: null,
      },
    });

    expect(missing).toEqual([]);
    expect(notArchived).toEqual([]);
  });

  it("returns one archived suggestion when term matches and no active matches exist", () => {
    const result = buildArchivedSuggestionFallback({
      projectId: PROJECT_ID,
      projectShortCode: "WB",
      searchTerm: "WB-75",
      activeTicketsCount: 0,
      archivedTicket: {
        id: "11111111-1111-1111-1111-111111111111",
        projectId: PROJECT_ID,
        title: "Archived ticket",
        description: null,
        columnId: "22222222-2222-2222-2222-222222222222",
        position: 0,
        codeNumber: 75,
        priority: null,
        dueDate: null,
        storyPoints: null,
        createdAt: new Date("2026-03-01T00:00:00.000Z"),
        updatedAt: new Date("2026-03-01T00:00:00.000Z"),
        completedAt: new Date("2026-03-01T00:00:00.000Z"),
        archivedAt: new Date("2026-03-02T00:00:00.000Z"),
        archivedWeekStart: new Date("2026-03-01T00:00:00.000Z"),
        createdBy: null,
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "11111111-1111-1111-1111-111111111111",
      isArchived: true,
    });
    expect(result[0].label).toContain("WB-75");
  });
});

