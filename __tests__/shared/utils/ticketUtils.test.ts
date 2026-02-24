import type { Ticket } from "@/core/domain/schema/ticket.schema";

import { filterTicketsBySearch } from "@/shared/utils/ticketUtils";

const createTicket = (overrides: Partial<Ticket> = {}): Ticket =>
  ({
    id: "ticket-1",
    projectId: "project-1",
    title: "Default ticket",
    description: null,
    status: "todo",
    position: 0,
    codeNumber: 1,
    epicId: null,
    parentId: null,
    sprintId: null,
    priority: null,
    storyPoints: null,
    assigneeId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as Ticket;

describe("filterTicketsBySearch", () => {
  const tickets: Ticket[] = [
    createTicket({
      id: "1",
      title: "Fix login bug",
      description: "Auth issue",
    }),
    createTicket({ id: "2", title: "Add dashboard", description: null }),
    createTicket({
      id: "3",
      title: "Update API",
      description: "REST endpoints",
    }),
  ];

  it("should return all tickets when search is empty", () => {
    expect(filterTicketsBySearch(tickets, "")).toEqual(tickets);
  });

  it("should return all tickets when search is whitespace", () => {
    expect(filterTicketsBySearch(tickets, "   ")).toEqual(tickets);
  });

  it("should filter by title match (case-insensitive)", () => {
    const result = filterTicketsBySearch(tickets, "login");
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("1");
  });

  it("should filter by description match", () => {
    const result = filterTicketsBySearch(tickets, "REST");
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("3");
  });

  it("should return empty array when no match", () => {
    const result = filterTicketsBySearch(tickets, "nonexistent");
    expect(result).toHaveLength(0);
  });

  it("should handle tickets with null title gracefully", () => {
    const ticketsWithNull = [
      createTicket({
        id: "1",
        title: null as unknown as string,
        description: "Some desc",
      }),
    ];
    const result = filterTicketsBySearch(ticketsWithNull, "Some");
    expect(result).toHaveLength(1);
  });
});
