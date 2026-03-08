import type { TicketAssignee } from "@/core/domain/schema/ticket.schema";

import { getTicketAssigneesByProjectId } from "@/core/usecases/ticket/getTicketAssigneesByProjectId";

// eslint-disable-next-line no-restricted-imports -- Allow relative import from __tests__/ to __mocks__/
import { createTicketRepositoryMock } from "../../../../__mocks__/core/ports/ticketRepository";

describe("getTicketAssigneesByProjectId", () => {
  const projectId = "123e4567-e89b-12d3-a456-426614174000";

  it("should return assignees grouped by ticket id", async () => {
    const assigneesMap: Record<string, TicketAssignee[]> = {
      "223e4567-e89b-12d3-a456-426614174000": [
        {
          userId: "323e4567-e89b-12d3-a456-426614174000",
          displayName: "Jane",
          avatarUrl: null,
          assignedAt: new Date("2024-01-01T00:00:00Z"),
        },
      ],
    };
    const repository = createTicketRepositoryMock({
      getAssigneesByProjectId: jest.fn<
        Promise<Record<string, TicketAssignee[]>>,
        [string]
      >(async () => assigneesMap),
    });

    const result = await getTicketAssigneesByProjectId(repository, projectId);

    expect(repository.getAssigneesByProjectId).toHaveBeenCalledTimes(1);
    expect(repository.getAssigneesByProjectId).toHaveBeenCalledWith(projectId);
    expect(result).toEqual(assigneesMap);
  });

  it("should return empty object when projectId is missing", async () => {
    const repository = createTicketRepositoryMock();

    const result = await getTicketAssigneesByProjectId(repository, "");

    expect(repository.getAssigneesByProjectId).not.toHaveBeenCalled();
    expect(result).toEqual({});
  });

  it("should propagate repository errors", async () => {
    const repositoryError = new Error("Database connection failed");
    const repository = createTicketRepositoryMock({
      getAssigneesByProjectId: jest.fn<
        Promise<Record<string, TicketAssignee[]>>,
        [string]
      >(async () => {
        throw repositoryError;
      }),
    });

    await expect(
      getTicketAssigneesByProjectId(repository, projectId)
    ).rejects.toThrow(repositoryError);
  });
});
