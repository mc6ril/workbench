import { createBoardRepositoryMock } from "../../../../__mocks__/core/ports/boardRepository";
import { createTicketRepositoryMock } from "../../../../__mocks__/core/ports/ticketRepository";

import type { Board, Column } from "@/modules/board/core/domain/schema/board.schema";
import type { CreateTicketInput, Ticket } from "@/modules/board/core/domain/schema/ticket.schema";
import { createTicket } from "@/modules/board/core/usecases/ticket/createTicket";

describe("createTicket completedAt workflow logic", () => {
  const projectId = "223e4567-e89b-12d3-a456-426614174000";
  const boardId = "323e4567-e89b-12d3-a456-426614174000";
  const todoColumnId = "423e4567-e89b-12d3-a456-426614174000";
  const doneColumnId = "523e4567-e89b-12d3-a456-426614174000";
  const board: Board = {
    id: boardId,
    projectId,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };
  const columns: Column[] = [
    {
      id: todoColumnId,
      boardId,
      name: "Todo",
      key: "todo",
      state: "todo",
      position: 0,
      visible: true,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    },
    {
      id: doneColumnId,
      boardId,
      name: "Done",
      key: "completed",
      state: "done",
      position: 1,
      visible: true,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    },
  ];

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-25T13:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("sets completedAt when a ticket is created directly in a done column", async () => {
    const now = new Date("2026-03-25T13:00:00.000Z");
    const input: CreateTicketInput = {
      projectId,
      title: "Done from create",
      columnId: doneColumnId,
      position: 0,
    };
    const boardRepository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(async () => board),
      listColumnsByBoard: jest.fn<Promise<Column[]>, [string]>(async () => columns),
    });
    const repository = createTicketRepositoryMock({
      getNextCodeNumberForProject: jest.fn<Promise<number>, [string]>(
        async () => 7
      ),
      create: jest.fn<Promise<Ticket>, [CreateTicketInput]>(async (value) => ({
        id: "123e4567-e89b-12d3-a456-426614174000",
        projectId: value.projectId,
        title: value.title,
        description: value.description ?? null,
        columnId: value.columnId,
        position: value.position ?? 0,
        codeNumber: value.codeNumber ?? 7,
        priority: value.priority ?? null,
        dueDate: value.dueDate ?? null,
        storyPoints: value.storyPoints ?? null,
        createdBy: value.createdBy ?? null,
        completedAt: value.completedAt ?? null,
        archivedAt: null,
        archivedWeekStart: null,
        createdAt: now,
        updatedAt: now,
      })),
    });

    await createTicket(repository, boardRepository, input);

    expect(repository.create).toHaveBeenCalledWith({
      ...input,
      completedAt: now,
      codeNumber: 7,
    });
  });

  it("keeps completedAt null when a ticket is created outside done", async () => {
    const input: CreateTicketInput = {
      projectId,
      title: "Todo from create",
      columnId: todoColumnId,
      position: 0,
    };
    const boardRepository = createBoardRepositoryMock({
      findByProject: jest.fn<Promise<Board | null>, [string]>(async () => board),
      listColumnsByBoard: jest.fn<Promise<Column[]>, [string]>(async () => columns),
    });
    const repository = createTicketRepositoryMock({
      getNextCodeNumberForProject: jest.fn<Promise<number>, [string]>(
        async () => 8
      ),
      create: jest.fn<Promise<Ticket>, [CreateTicketInput]>(async () => {
        throw new Error("stop");
      }),
    });

    await expect(createTicket(repository, boardRepository, input)).rejects.toThrow(
      "stop"
    );
    expect(repository.create).toHaveBeenCalledWith({
      ...input,
      completedAt: null,
      codeNumber: 8,
    });
  });
});
