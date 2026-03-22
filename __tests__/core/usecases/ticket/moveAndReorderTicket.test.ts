import { z } from "zod";

import { createNotFoundError } from "@/shared/errors/repositoryError";

import { createTicketRepositoryMock } from "../../../../__mocks__/core/ports/ticketRepository";

import type { Ticket } from "@/modules/board/core/domain/schema/ticket.schema";
import { moveAndReorderTicket } from "@/modules/board/core/usecases/ticket/moveAndReorderTicket";

describe("moveAndReorderTicket", () => {
  const ticketId = "123e4567-e89b-12d3-a456-426614174000";
  const projectId = "223e4567-e89b-12d3-a456-426614174000";

  const mockTicket: Ticket = {
    id: ticketId,
    projectId,
    title: "Test Ticket",
    description: "Test description",
    status: "todo",
    position: 0,
    codeNumber: 1,
    epicId: null,
    parentId: null,
    sprintId: null,
    priority: null,
    dueDate: null,
    storyPoints: null,
    createdBy: null,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };
  type MoveAndReorderInput = {
    ticketId: string;
    status: string;
    position: number;
    ticketPositions: Array<{ id: string; position: number }>;
  };

  it("should atomically move and reorder tickets", async () => {
    const input: MoveAndReorderInput = {
      ticketId,
      status: "in-progress",
      position: 1,
      ticketPositions: [{ id: ticketId, position: 1 }],
    };
    const updatedTickets: Ticket[] = [
      {
        ...mockTicket,
        status: "in-progress",
        position: 1,
      },
    ];
    const repository = createTicketRepositoryMock({
      moveAndReorderTicket: jest.fn<Promise<Ticket[]>, [typeof input]>(
        async () => updatedTickets
      ),
    });

    const result = await moveAndReorderTicket(repository, input);

    expect(repository.moveAndReorderTicket).toHaveBeenCalledTimes(1);
    expect(repository.moveAndReorderTicket).toHaveBeenCalledWith(input);
    expect(result).toEqual(updatedTickets);
  });

  it("should allow empty ticketPositions", async () => {
    const input: MoveAndReorderInput = {
      ticketId,
      status: "in-progress",
      position: 1,
      ticketPositions: [],
    };
    const repository = createTicketRepositoryMock({
      moveAndReorderTicket: jest.fn<Promise<Ticket[]>, [typeof input]>(
        async () => [
          {
            ...mockTicket,
            status: "in-progress",
            position: 1,
          },
        ]
      ),
    });

    await expect(moveAndReorderTicket(repository, input)).resolves.toEqual([
      {
        ...mockTicket,
        status: "in-progress",
        position: 1,
      },
    ]);
    expect(repository.moveAndReorderTicket).toHaveBeenCalledTimes(1);
  });

  it("should throw ZodError on invalid ticketId", async () => {
    const repository = createTicketRepositoryMock();

    await expect(
      moveAndReorderTicket(repository, {
        ticketId: "invalid-id",
        status: "in-progress",
        position: 1,
        ticketPositions: [],
      })
    ).rejects.toThrow(z.ZodError);
    expect(repository.moveAndReorderTicket).not.toHaveBeenCalled();
  });

  it("should propagate NotFoundError from repository", async () => {
    const repository = createTicketRepositoryMock({
      moveAndReorderTicket: jest.fn<
        Promise<Ticket[]>,
        [
          {
            ticketId: string;
            status: string;
            position: number;
            ticketPositions: Array<{ id: string; position: number }>;
          },
        ]
      >(async () => {
        throw createNotFoundError("Ticket", ticketId);
      }),
    });

    await expect(
      moveAndReorderTicket(repository, {
        ticketId,
        status: "in-progress",
        position: 1,
        ticketPositions: [{ id: ticketId, position: 1 }],
      })
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      entityType: "Ticket",
      entityId: ticketId,
    });
    expect(repository.moveAndReorderTicket).toHaveBeenCalledTimes(1);
  });
});
