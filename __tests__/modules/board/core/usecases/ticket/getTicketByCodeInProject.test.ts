import { createTicketRepositoryMock } from "@/../__mocks__/core/ports/ticketRepository";
import { getTicketByCodeInProject } from "@/modules/board/core/usecases/ticket/getTicketByCode";

describe("getTicketByCodeInProject", () => {
  const projectAId = "123e4567-e89b-12d3-a456-426614174000";
  const projectBId = "223e4567-e89b-12d3-a456-426614174000";

  it("looks up tickets by (projectId, codeNumber) without relying on short codes", async () => {
    const repository = createTicketRepositoryMock();
    const ticketA = {
      id: "ticket-a",
      projectId: projectAId,
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
      archivedAt: null,
      archivedWeekStart: null,
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      updatedAt: new Date("2026-03-01T00:00:00.000Z"),
    };
    const ticketB = {
      ...ticketA,
      id: "ticket-b",
      projectId: projectBId,
    };

    repository.findByCode.mockResolvedValueOnce(ticketA);
    const resultA = await getTicketByCodeInProject(repository, {
      projectId: projectAId,
      codeNumber: 3,
    });

    repository.findByCode.mockResolvedValueOnce(ticketB);
    const resultB = await getTicketByCodeInProject(repository, {
      projectId: projectBId,
      codeNumber: 3,
    });

    expect(repository.findByCode).toHaveBeenNthCalledWith(1, projectAId, 3);
    expect(repository.findByCode).toHaveBeenNthCalledWith(2, projectBId, 3);
    expect(resultA).toBe(ticketA);
    expect(resultB).toBe(ticketB);
  });

  it("validates input and rejects invalid project id or code number", async () => {
    const repository = createTicketRepositoryMock();

    await expect(
      getTicketByCodeInProject(repository, {
        projectId: "not-a-uuid" as unknown as string,
        codeNumber: 3,
      })
    ).rejects.toBeInstanceOf(Error);

    await expect(
      getTicketByCodeInProject(repository, {
        projectId: projectAId,
        codeNumber: 0 as unknown as number,
      })
    ).rejects.toBeInstanceOf(Error);
  });
});

