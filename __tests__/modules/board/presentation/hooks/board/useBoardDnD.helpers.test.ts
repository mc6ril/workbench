import { buildStableBoardColumnTickets } from "@/modules/board/presentation/hooks/board/useBoardDnD.helpers";
import type {
  BoardColumnConfig,
  BoardTicketViewModel,
} from "@/modules/board/presentation/types/boardView.types";

describe("useBoardDnD helpers", () => {
  const columns: BoardColumnConfig[] = [
    {
      id: "todo-column",
      title: "Todo",
      state: "todo",
    },
    {
      id: "doing-column",
      title: "Doing",
      state: "in_progress",
    },
    {
      id: "done-column",
      title: "Done",
      state: "done",
    },
  ];

  const createTicketViewModel = (
    id: string,
    title = `Ticket ${id}`
  ): BoardTicketViewModel => ({
    id,
    title,
  });

  it("reuses unaffected column arrays when only source and target columns move", () => {
    const ticketViewModelById = new Map<string, BoardTicketViewModel>([
      ["ticket-1", createTicketViewModel("ticket-1")],
      ["ticket-2", createTicketViewModel("ticket-2")],
      ["ticket-3", createTicketViewModel("ticket-3")],
      ["ticket-4", createTicketViewModel("ticket-4")],
    ]);
    const previousBoardTicketIds = {
      "todo-column": ["ticket-1", "ticket-2"],
      "doing-column": ["ticket-3"],
      "done-column": ["ticket-4"],
    };
    const previousBoardColumnTickets = buildStableBoardColumnTickets({
      columns,
      boardTicketIds: previousBoardTicketIds,
      ticketViewModelById,
    });
    const nextBoardTicketIds = {
      "todo-column": ["ticket-1"],
      "doing-column": ["ticket-3", "ticket-2"],
      "done-column": previousBoardTicketIds["done-column"],
    };

    const nextBoardColumnTickets = buildStableBoardColumnTickets({
      columns,
      boardTicketIds: nextBoardTicketIds,
      ticketViewModelById,
      previousBoardTicketIds,
      previousTicketViewModelById: ticketViewModelById,
      previousBoardColumnTickets,
    });

    expect(nextBoardColumnTickets.get("done-column")).toBe(
      previousBoardColumnTickets.get("done-column")
    );
    expect(nextBoardColumnTickets.get("todo-column")).not.toBe(
      previousBoardColumnTickets.get("todo-column")
    );
    expect(nextBoardColumnTickets.get("doing-column")).not.toBe(
      previousBoardColumnTickets.get("doing-column")
    );
  });

  it("reuses a column when ids are recreated but the ordered tickets stay the same", () => {
    const ticketViewModelById = new Map<string, BoardTicketViewModel>([
      ["ticket-1", createTicketViewModel("ticket-1")],
      ["ticket-2", createTicketViewModel("ticket-2")],
    ]);
    const previousBoardTicketIds = {
      "todo-column": ["ticket-1", "ticket-2"],
      "doing-column": [],
      "done-column": [],
    };
    const previousBoardColumnTickets = buildStableBoardColumnTickets({
      columns,
      boardTicketIds: previousBoardTicketIds,
      ticketViewModelById,
    });
    const recreatedBoardTicketIds = {
      "todo-column": ["ticket-1", "ticket-2"],
      "doing-column": [],
      "done-column": [],
    };

    const nextBoardColumnTickets = buildStableBoardColumnTickets({
      columns,
      boardTicketIds: recreatedBoardTicketIds,
      ticketViewModelById,
      previousBoardTicketIds,
      previousTicketViewModelById: ticketViewModelById,
      previousBoardColumnTickets,
    });

    expect(nextBoardColumnTickets.get("todo-column")).toBe(
      previousBoardColumnTickets.get("todo-column")
    );
  });

  it("rebuilds a column when a ticket view model changes", () => {
    const previousTicketViewModelById = new Map<string, BoardTicketViewModel>([
      ["ticket-1", createTicketViewModel("ticket-1", "Before")],
      ["ticket-2", createTicketViewModel("ticket-2")],
    ]);
    const boardTicketIds = {
      "todo-column": ["ticket-1", "ticket-2"],
      "doing-column": [],
      "done-column": [],
    };
    const previousBoardColumnTickets = buildStableBoardColumnTickets({
      columns,
      boardTicketIds,
      ticketViewModelById: previousTicketViewModelById,
    });
    const updatedTicket = createTicketViewModel("ticket-1", "After");
    const nextTicketViewModelById = new Map<string, BoardTicketViewModel>([
      ["ticket-1", updatedTicket],
      ["ticket-2", previousTicketViewModelById.get("ticket-2")!],
    ]);

    const nextBoardColumnTickets = buildStableBoardColumnTickets({
      columns,
      boardTicketIds,
      ticketViewModelById: nextTicketViewModelById,
      previousBoardTicketIds: boardTicketIds,
      previousTicketViewModelById: previousTicketViewModelById,
      previousBoardColumnTickets,
    });

    expect(nextBoardColumnTickets.get("todo-column")).not.toBe(
      previousBoardColumnTickets.get("todo-column")
    );
    expect(nextBoardColumnTickets.get("todo-column")?.[0]).toBe(updatedTicket);
  });
});
