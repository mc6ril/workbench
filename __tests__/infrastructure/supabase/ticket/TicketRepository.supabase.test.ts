import type { AppSupabaseClient } from "@/shared/infrastructure/supabase/types";

import { createQueryBuilderMock } from "../testUtils/queryBuilderMock";

import { createTicketRepository } from "@/modules/board/infrastructure/supabase/ticket/TicketRepository.supabase";
import type {
  TicketRow,
  TicketSearchRow,
} from "@/modules/board/infrastructure/supabase/ticket/types";

describe("TicketRepository.supabase active ticket filtering", () => {
  const projectId = "223e4567-e89b-12d3-a456-426614174000";
  const ticketId = "123e4567-e89b-12d3-a456-426614174000";

  const baseRow: TicketRow = {
    id: ticketId,
    project_id: projectId,
    title: "Active ticket",
    description: null,
    column_id: "column-todo",
    position: 0,
    code_number: 1,
    priority: null,
    due_date: null,
    story_points: null,
    created_by: null,
    completed_at: null,
    archived_at: null,
    archived_week_start: null,
    created_at: "2026-03-25T08:00:00.000Z",
    updated_at: "2026-03-25T08:00:00.000Z",
  };

  it("filters archived tickets out of project list queries by default", async () => {
    const ticketsQuery = createQueryBuilderMock<TicketRow[]>([baseRow]);
    const client = {
      from: jest.fn(() => ticketsQuery),
    } as unknown as AppSupabaseClient;

    const repository = createTicketRepository(client);
    const result = await repository.listByProject(projectId);

    expect(client.from).toHaveBeenCalledWith("tickets");
    expect(ticketsQuery.eq).toHaveBeenCalledWith("project_id", projectId);
    expect(ticketsQuery.is).toHaveBeenCalledWith("archived_at", null);
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe(ticketId);
  });

  it("filters by the simplified priority value", async () => {
    const ticketsQuery = createQueryBuilderMock<TicketRow[]>([baseRow]);
    const client = {
      from: jest.fn(() => ticketsQuery),
    } as unknown as AppSupabaseClient;

    const repository = createTicketRepository(client);
    await repository.listByProject(projectId, { priority: "urgent" });

    expect(ticketsQuery.eq).toHaveBeenCalledWith("priority", "urgent");
  });

  it("loads lightweight ticket search suggestions with a scoped payload", async () => {
    const suggestionsQuery = createQueryBuilderMock<TicketSearchRow[]>([
      {
        id: ticketId,
        title: baseRow.title,
        code_number: baseRow.code_number,
      },
    ]);
    const client = {
      from: jest.fn(() => suggestionsQuery),
    } as unknown as AppSupabaseClient;

    const repository = createTicketRepository(client);
    const result = await repository.listSearchSuggestions(
      projectId,
      "ticket",
      6
    );

    expect(client.from).toHaveBeenCalledWith("tickets");
    expect(suggestionsQuery.select).toHaveBeenCalledWith(
      "id,title,code_number"
    );
    expect(suggestionsQuery.eq).toHaveBeenCalledWith("project_id", projectId);
    expect(suggestionsQuery.is).toHaveBeenCalledWith("archived_at", null);
    expect(suggestionsQuery.order).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
    expect(suggestionsQuery.limit).toHaveBeenCalledWith(6);
    expect(suggestionsQuery.or).toHaveBeenCalledWith(
      'title.ilike."%ticket%",description.ilike."%ticket%"'
    );
    expect(result).toEqual([
      {
        id: ticketId,
        title: baseRow.title,
        codeNumber: baseRow.code_number,
      },
    ]);
  });

  it("filters archived tickets out of column queries by default", async () => {
    const ticketsQuery = createQueryBuilderMock<TicketRow[]>([baseRow]);
    const client = {
      from: jest.fn(() => ticketsQuery),
    } as unknown as AppSupabaseClient;

    const repository = createTicketRepository(client);
    await repository.listByColumnId(projectId, "column-todo");

    expect(ticketsQuery.eq).toHaveBeenCalledWith("project_id", projectId);
    expect(ticketsQuery.eq).toHaveBeenCalledWith("column_id", "column-todo");
    expect(ticketsQuery.is).toHaveBeenCalledWith("archived_at", null);
  });

  it("filters archived tickets out of code lookups by default", async () => {
    const ticketQuery = createQueryBuilderMock<TicketRow>(baseRow);
    const client = {
      from: jest.fn(() => ticketQuery),
    } as unknown as AppSupabaseClient;

    const repository = createTicketRepository(client);
    await repository.findByCode(projectId, 1);

    expect(ticketQuery.eq).toHaveBeenCalledWith("project_id", projectId);
    expect(ticketQuery.eq).toHaveBeenCalledWith("code_number", 1);
    expect(ticketQuery.is).toHaveBeenCalledWith("archived_at", null);
  });

  it("includes archived tickets when using findByCodeIncludingArchived", async () => {
    const ticketQuery = createQueryBuilderMock<TicketRow>(baseRow);
    const client = {
      from: jest.fn(() => ticketQuery),
    } as unknown as AppSupabaseClient;

    const repository = createTicketRepository(client);
    await repository.findByCodeIncludingArchived(projectId, 1);

    expect(ticketQuery.eq).toHaveBeenCalledWith("project_id", projectId);
    expect(ticketQuery.eq).toHaveBeenCalledWith("code_number", 1);
    expect(ticketQuery.is).not.toHaveBeenCalledWith("archived_at", null);
  });

  it("keeps project assignee fallback scoped to active ticket ids", async () => {
    const ticketIdsQuery = createQueryBuilderMock<Array<{ id: string }>>([
      { id: ticketId },
    ]);
    const client = {
      from: jest.fn(() => ticketIdsQuery),
      rpc: jest
        .fn()
        .mockResolvedValueOnce({
          data: null,
          error: {
            code: "PGRST202",
            message: "get_project_ticket_assignees",
          },
        })
        .mockResolvedValueOnce({
          data: [
            {
              ticket_id: ticketId,
              user_id: "323e4567-e89b-12d3-a456-426614174000",
              display_name: "Cyril",
              avatar_url: null,
              assigned_at: "2026-03-25T09:00:00.000Z",
            },
          ],
          error: null,
        }),
    } as unknown as AppSupabaseClient;

    const repository = createTicketRepository(client);
    const result = await repository.getAssigneesByProjectId(projectId);

    expect(ticketIdsQuery.eq).toHaveBeenCalledWith("project_id", projectId);
    expect(ticketIdsQuery.is).toHaveBeenCalledWith("archived_at", null);
    expect(client.rpc).toHaveBeenNthCalledWith(2, "get_ticket_assignees", {
      ticket_ids: [ticketId],
    });
    expect(result[ticketId]).toHaveLength(1);
  });

  it("delegates weekly archival batches to the ticket archival rpc", async () => {
    const client = {
      rpc: jest.fn().mockResolvedValue({
        data: 5,
        error: null,
      }),
    } as unknown as AppSupabaseClient;
    const repository = createTicketRepository(client);
    const runAt = new Date("2026-03-30T00:05:00.000Z");

    const result = await repository.archiveCompletedTicketsBatch({
      runAt,
      timeZone: "Europe/Paris",
    });

    expect(client.rpc).toHaveBeenCalledWith("archive_completed_tickets_batch", {
      p_now: runAt.toISOString(),
      p_time_zone: "Europe/Paris",
    });
    expect(result).toBe(5);
  });
});
