import { createTicketRepositoryMock } from "@/../__mocks__/core/ports/ticketRepository";
import { getTicketByCodeInProjectIncludingArchived } from "@/modules/board/core/usecases/ticket/getTicketByCodeInProjectIncludingArchived";

describe("getTicketByCodeInProjectIncludingArchived", () => {
  const projectId = "123e4567-e89b-12d3-a456-426614174000";

  it("delegates to repository.findByCodeIncludingArchived with (projectId, codeNumber)", async () => {
    const repository = createTicketRepositoryMock();
    const ticket = {
      id: "ticket-a",
      projectId,
      title: "Ticket A",
      description: null,
      columnId: "column-todo",
      position: 0,
      codeNumber: 3,
      priority: null,
      dueDate: null,
      storyPoints: null,
      createdBy: null,
      completedAt: null,
      archivedAt: new Date("2026-03-02T00:00:00.000Z"),
      archivedWeekStart: new Date("2026-03-01T00:00:00.000Z"),
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      updatedAt: new Date("2026-03-02T00:00:00.000Z"),
    };

    repository.findByCodeIncludingArchived.mockResolvedValueOnce(ticket);

    const result = await getTicketByCodeInProjectIncludingArchived(repository, {
      projectId,
      codeNumber: 3,
    });

    expect(repository.findByCodeIncludingArchived).toHaveBeenCalledWith(
      projectId,
      3
    );
    expect(result).toBe(ticket);
  });
});

