import type { TicketRepository } from "@/modules/board/core/ports/ticketRepository";
import { assignTicket } from "@/modules/board/core/usecases/ticket/assignTicket";
import { unassignTicket } from "@/modules/board/core/usecases/ticket/unassignTicket";

const createTicketRepositoryMock = (
  overrides: Partial<TicketRepository> = {}
): TicketRepository =>
  ({
    assignUsers: jest.fn(async () => {}),
    unassignUsers: jest.fn(async () => {}),
    getAssignees: jest.fn(async () => []),
    getAssigneesByTicketIds: jest.fn(async () => ({})),
    ...overrides,
  }) as unknown as TicketRepository;

describe("assignTicket", () => {
  const ticketId = "123e4567-e89b-12d3-a456-426614174000";
  const userId1 = "456e7890-e89b-12d3-a456-426614174001";
  const userId2 = "456e7890-e89b-12d3-a456-426614174002";

  it("should assign users to a ticket", async () => {
    const repository = createTicketRepositoryMock();

    await assignTicket(repository, ticketId, [userId1, userId2]);

    expect(repository.assignUsers).toHaveBeenCalledWith(ticketId, [
      userId1,
      userId2,
    ]);
  });

  it("should throw ZodError for invalid ticketId", async () => {
    const repository = createTicketRepositoryMock();

    await expect(
      assignTicket(repository, "not-a-uuid", [userId1])
    ).rejects.toThrow();

    expect(repository.assignUsers).not.toHaveBeenCalled();
  });

  it("should throw ZodError for empty userIds array", async () => {
    const repository = createTicketRepositoryMock();

    await expect(assignTicket(repository, ticketId, [])).rejects.toThrow();

    expect(repository.assignUsers).not.toHaveBeenCalled();
  });

  it("should propagate repository errors", async () => {
    const error = new Error("Permission denied");
    const repository = createTicketRepositoryMock({
      assignUsers: jest.fn(async () => {
        throw error;
      }),
    });

    await expect(assignTicket(repository, ticketId, [userId1])).rejects.toThrow(
      error
    );
  });
});

describe("unassignTicket", () => {
  const ticketId = "123e4567-e89b-12d3-a456-426614174000";
  const userId1 = "456e7890-e89b-12d3-a456-426614174001";

  it("should unassign users from a ticket", async () => {
    const repository = createTicketRepositoryMock();

    await unassignTicket(repository, ticketId, [userId1]);

    expect(repository.unassignUsers).toHaveBeenCalledWith(ticketId, [userId1]);
  });

  it("should throw ZodError for invalid input", async () => {
    const repository = createTicketRepositoryMock();

    await expect(
      unassignTicket(repository, "not-a-uuid", [userId1])
    ).rejects.toThrow();
  });
});
