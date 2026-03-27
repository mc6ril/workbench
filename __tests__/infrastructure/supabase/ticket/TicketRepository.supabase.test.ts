import type { SupabaseClient } from "@supabase/supabase-js";

import { createQueryBuilderMock } from "../testUtils/queryBuilderMock";

import { createTicketRepository } from "@/modules/board/infrastructure/supabase/ticket/TicketRepository.supabase";
import type { TicketRow } from "@/modules/board/infrastructure/supabase/ticket/types";

describe("TicketRepository.supabase active ticket filtering", () => {
  const projectId = "223e4567-e89b-12d3-a456-426614174000";
  const ticketId = "123e4567-e89b-12d3-a456-426614174000";

  const baseRow: TicketRow = {
    id: ticketId,
    project_id: projectId,
    title: "Active ticket",
    description: null,
    status: "todo",
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
    } as unknown as SupabaseClient;

    const repository = createTicketRepository(client);
    const result = await repository.listByProject(projectId);

    expect(client.from).toHaveBeenCalledWith("tickets");
    expect(ticketsQuery.eq).toHaveBeenCalledWith("project_id", projectId);
    expect(ticketsQuery.is).toHaveBeenCalledWith("archived_at", null);
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe(ticketId);
  });

  it("filters archived tickets out of status queries by default", async () => {
    const ticketsQuery = createQueryBuilderMock<TicketRow[]>([baseRow]);
    const client = {
      from: jest.fn(() => ticketsQuery),
    } as unknown as SupabaseClient;

    const repository = createTicketRepository(client);
    await repository.listByStatus(projectId, "todo");

    expect(ticketsQuery.eq).toHaveBeenCalledWith("project_id", projectId);
    expect(ticketsQuery.eq).toHaveBeenCalledWith("status", "todo");
    expect(ticketsQuery.is).toHaveBeenCalledWith("archived_at", null);
  });

  it("filters archived tickets out of code lookups by default", async () => {
    const ticketQuery = createQueryBuilderMock<TicketRow>(baseRow);
    const client = {
      from: jest.fn(() => ticketQuery),
    } as unknown as SupabaseClient;

    const repository = createTicketRepository(client);
    await repository.findByCode(projectId, 1);

    expect(ticketQuery.eq).toHaveBeenCalledWith("project_id", projectId);
    expect(ticketQuery.eq).toHaveBeenCalledWith("code_number", 1);
    expect(ticketQuery.is).toHaveBeenCalledWith("archived_at", null);
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
    } as unknown as SupabaseClient;

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
    } as unknown as SupabaseClient;
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
