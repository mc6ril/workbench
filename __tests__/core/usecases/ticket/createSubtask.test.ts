import { createBoardRepositoryMock } from "../../../../__mocks__/core/ports/boardRepository";
import { createTicketRepositoryMock } from "../../../../__mocks__/core/ports/ticketRepository";

import type { Board, Column } from "@/modules/board/core/domain/schema/board.schema";
import type {
  CreateSubtaskInput,
  CreateTicketInput,
  Ticket,
} from "@/modules/board/core/domain/schema/ticket.schema";
import { createSubtask } from "@/modules/board/core/usecases/ticket/createSubtask";

describe("createSubtask completedAt workflow logic", () => {
  const projectId = "223e4567-e89b-12d3-a456-426614174000";
  const parentId = "123e4567-e89b-12d3-a456-426614174000";
  const boardId = "323e4567-e89b-12d3-a456-426614174000";
  const board: Board = {
    id: boardId,
    projectId,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };
  const columns: Column[] = [
    {
      id: "todo-column",
      boardId,
      name: "Todo",
      status: "todo",
      state: "todo",
      position: 0,
      visible: true,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    },
    {
      id: "done-column",
      boardId,
      name: "Done",
      status: "completed",
      state: "done",
      position: 1,
      visible: true,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    },
  ];
  const parentTicket: Ticket = {
    id: parentId,
    projectId,
    title: "Parent",
    description: null,
    status: "todo",
    position: 0,
    codeNumber: 1,
    epicId: null,
    parentId: null,
    priority: null,
    dueDate: null,
    storyPoints: null,
    createdBy: null,
    completedAt: null,
    archivedAt: null,
    archivedWeekStart: null,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-25T14:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("sets completedAt when a subtask is created directly in a done column", async () => {
    const now = new Date("2026-03-25T14:00:00.000Z");
    const input: CreateSubtaskInput = {
      projectId,
      parentId,
      title: "Done subtask",
      status: "completed",
      position: 0,
    };
    const boardRepository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(async () => board),
      listColumnsByBoard: jest.fn<Promise<Column[]>, [string]>(async () => columns),
    });
    const repository = createTicketRepositoryMock({
      findById: jest.fn<Promise<Ticket | null>, [string]>(
        async () => parentTicket
      ),
      listByProject: jest.fn<Promise<Ticket[]>, [string]>(async () => [
        parentTicket,
      ]),
      getNextCodeNumberForProject: jest.fn<Promise<number>, [string]>(
        async () => 2
      ),
      create: jest.fn<Promise<Ticket>, [CreateTicketInput]>(async (value) => ({
        ...parentTicket,
        id: "423e4567-e89b-12d3-a456-426614174000",
        title: value.title,
        parentId: value.parentId ?? null,
        status: value.status,
        position: value.position ?? 0,
        codeNumber: value.codeNumber ?? 2,
        completedAt: value.completedAt ?? null,
      })),
    });

    await createSubtask(repository, boardRepository, input);

    expect(repository.create).toHaveBeenCalledWith({
      ...input,
      completedAt: now,
      codeNumber: 2,
    });
  });
});
