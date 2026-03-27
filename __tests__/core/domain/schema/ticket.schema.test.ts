import {
  TicketSchema,
  UpdateTicketInputSchema,
} from "@/modules/board/core/domain/schema/ticket.schema";

describe("TicketSchema", () => {
  const validTicket = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    projectId: "223e4567-e89b-12d3-a456-426614174000",
    title: "Refactor archiving model",
    description: null,
    status: "todo",
    position: 0,
    codeNumber: 1,
    priority: null,
    dueDate: null,
    storyPoints: null,
    createdBy: null,
    completedAt: null,
    archivedAt: null,
    archivedWeekStart: null,
    createdAt: "2026-03-20T09:00:00.000Z",
    updatedAt: "2026-03-20T09:00:00.000Z",
  };

  it("accepts tickets with empty archival metadata", () => {
    const result = TicketSchema.safeParse(validTicket);

    expect(result.success).toBe(true);
  });

  it("coerces archival metadata to Date objects", () => {
    const result = TicketSchema.safeParse({
      ...validTicket,
      completedAt: "2026-03-21T10:00:00.000Z",
      archivedAt: "2026-03-24T08:30:00.000Z",
      archivedWeekStart: "2026-03-24",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.completedAt).toEqual(
        new Date("2026-03-21T10:00:00.000Z")
      );
      expect(result.data.archivedAt).toEqual(
        new Date("2026-03-24T08:30:00.000Z")
      );
      expect(result.data.archivedWeekStart).toEqual(new Date("2026-03-24"));
    }
  });

  it("accepts the simplified priority values", () => {
    const result = TicketSchema.safeParse({
      ...validTicket,
      priority: "urgent",
    });

    expect(result.success).toBe(true);
  });

  it("rejects legacy priority values", () => {
    const result = TicketSchema.safeParse({
      ...validTicket,
      priority: "high",
    });

    expect(result.success).toBe(false);
  });
});

describe("UpdateTicketInputSchema", () => {
  it("accepts archival metadata updates", () => {
    const result = UpdateTicketInputSchema.safeParse({
      completedAt: "2026-03-21T10:00:00.000Z",
      archivedAt: "2026-03-24T08:30:00.000Z",
      archivedWeekStart: "2026-03-24",
    });

    expect(result.success).toBe(true);
  });
});
