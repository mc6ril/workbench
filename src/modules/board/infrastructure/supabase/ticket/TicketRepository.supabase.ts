import {
  createDatabaseError,
  createNotFoundError,
} from "@/shared/errors/repositoryError";
import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";
import type {
  AppSupabaseClient,
  TableInsert,
  TableUpdate,
} from "@/shared/infrastructure/supabase/types";

import {
  mapTicketRowsToDomain,
  mapTicketRowToDomain,
  mapTicketSearchRowsToDomain,
} from "./TicketMapper.supabase";

import { getCurrentAuthIdentity } from "@/domains/auth/infrastructure/supabase/currentAuthIdentity";
import type {
  CreateTicketInput,
  Ticket,
  TicketAssignee,
  TicketFilters,
  TicketSearchItem,
  UpdateTicketInput,
} from "@/modules/board/core/domain/ticket.types";
import type { TicketRepository } from "@/modules/board/core/ports/ticketRepository";
import type {
  TicketAssigneeRow,
  TicketRow,
} from "@/modules/board/infrastructure/supabase/ticket/types";

type PostgrestErrorLike = {
  code?: string;
  message?: string;
  details?: string;
};

const isMissingProjectAssigneesRpcError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const postgrestError = error as PostgrestErrorLike;
  if (postgrestError.code !== "PGRST202") {
    return false;
  }

  return [postgrestError.message, postgrestError.details].some(
    (value) =>
      typeof value === "string" &&
      value.includes("get_project_ticket_assignees")
  );
};

const mapAssigneeRowsToTicketMap = (
  rows: TicketAssigneeRow[]
): Record<string, TicketAssignee[]> => {
  const result: Record<string, TicketAssignee[]> = {};

  for (const row of rows) {
    if (!result[row.ticket_id]) {
      result[row.ticket_id] = [];
    }

    result[row.ticket_id].push({
      userId: row.user_id,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      assignedAt: new Date(row.assigned_at),
    });
  }

  return result;
};

const buildTicketSearchClauses = (searchTerm: string): string[] => {
  const escapedSearchTerm = searchTerm
    .replace(/\\/g, "\\\\")
    .replace(/[%_]/g, "\\$&")
    .replace(/"/g, '\\"');
  const codeMatch = searchTerm.match(/^(?:[a-z]+-)?(\d+)$/i);
  const codePrefix = codeMatch?.[1] ?? "";
  const hasCodePrefixMatch = codePrefix !== "";

  const searchClauses = [
    `title.ilike."%${escapedSearchTerm}%"`,
    `description.ilike."%${escapedSearchTerm}%"`,
  ];

  if (!hasCodePrefixMatch) {
    return searchClauses;
  }

  const parsedPrefix = Number.parseInt(codePrefix, 10);
  const maxCodeNumber = 2_147_483_647;
  if (!Number.isInteger(parsedPrefix) || parsedPrefix < 0) {
    return searchClauses;
  }

  for (let scale = 0; scale <= 9; scale += 1) {
    const factor = 10 ** scale;
    const rangeStart = parsedPrefix * factor;
    if (rangeStart > maxCodeNumber) {
      break;
    }

    const rangeEnd = Math.min((parsedPrefix + 1) * factor - 1, maxCodeNumber);

    searchClauses.push(
      `and(code_number.gte.${rangeStart},code_number.lte.${rangeEnd})`
    );
  }

  return searchClauses;
};

/**
 * Create a TicketRepository implementation using the provided Supabase client.
 * This allows using different clients (browser/server) based on context.
 *
 * @param client - Supabase client instance to use
 * @returns TicketRepository implementation
 */
export const createTicketRepository = (
  client: AppSupabaseClient
): TicketRepository => {
  const getAssigneesByProjectIdFallback = async (
    projectId: string
  ): Promise<Record<string, TicketAssignee[]>> => {
    const { data: ticketRows, error: ticketIdsError } = await client
      .from("tickets")
      .select("id")
      .eq("project_id", projectId)
      .is("archived_at", null);

    if (ticketIdsError) {
      return handleRepositoryError(ticketIdsError, "TicketAssignee", projectId);
    }

    const ticketIds = (ticketRows ?? []).map((row) => row.id);
    if (ticketIds.length === 0) {
      return {};
    }

    const { data, error } = await client.rpc("get_ticket_assignees", {
      ticket_ids: ticketIds,
    });

    if (error) {
      return handleRepositoryError(error, "TicketAssignee", projectId);
    }

    return mapAssigneeRowsToTicketMap(data ?? []);
  };

  const repo: TicketRepository = {
    async findById(id: string): Promise<Ticket | null> {
      try {
        const { data, error } = await client
          .from("tickets")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          return handleRepositoryError(error, "Ticket");
        }

        if (!data) {
          return null;
        }

        return mapTicketRowToDomain(data);
      } catch (error) {
        return handleRepositoryError(error, "Ticket");
      }
    },

    async getNextCodeNumberForProject(projectId: string): Promise<number> {
      try {
        const { data, error } = await client
          .from("tickets")
          .select("code_number")
          .eq("project_id", projectId)
          .order("code_number", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          return handleRepositoryError(error, "Ticket");
        }

        const currentMax =
          data && typeof data.code_number === "number" ? data.code_number : 0;

        return currentMax + 1;
      } catch (error) {
        return handleRepositoryError(error, "Ticket");
      }
    },

    async listByProject(
      projectId: string,
      filters?: TicketFilters,
      search?: string,
      limit?: number
    ): Promise<Ticket[]> {
      try {
        const hasUserAssigneeFilter = Boolean(filters?.assigneeUserId);
        const effectiveUnassignedOnly =
          Boolean(filters?.unassignedOnly) && !filters?.assigneeUserId;

        let assignedTicketIdsForExclusion: string[] = [];
        if (effectiveUnassignedOnly) {
          const { data: assigneeRows, error: assigneeIdsError } = await client
            .from("ticket_assignees")
            .select("ticket_id, tickets!inner(project_id, archived_at)")
            .eq("tickets.project_id", projectId)
            .is("tickets.archived_at", null);

          if (assigneeIdsError) {
            return handleRepositoryError(assigneeIdsError, "Ticket");
          }

          assignedTicketIdsForExclusion = [
            ...new Set((assigneeRows ?? []).map((row) => row.ticket_id)),
          ];
        }

        const hasAssigneeFilter = hasUserAssigneeFilter;
        let query = client
          .from("tickets")
          .select(
            hasAssigneeFilter
              ? `
                *,
                ticket_assignees!inner(user_id)
              `
              : "*"
          )
          .eq("project_id", projectId)
          .is("archived_at", null);

        if (
          effectiveUnassignedOnly &&
          assignedTicketIdsForExclusion.length > 0
        ) {
          query = query.not(
            "id",
            "in",
            `(${assignedTicketIdsForExclusion.join(",")})`
          );
        }

        // Apply filters if provided
        if (filters?.columnId) {
          query = query.eq("column_id", filters.columnId);
        }

        if (filters?.priority) {
          query = query.eq("priority", filters.priority);
        }

        if (filters?.assigneeUserId) {
          query = query.eq("ticket_assignees.user_id", filters.assigneeUserId);
        }

        const searchTerm = search?.trim();
        if (searchTerm) {
          query = query.or(buildTicketSearchClauses(searchTerm).join(","));
        }

        query = query.order("created_at", {
          ascending: false,
        });

        if (typeof limit === "number" && limit > 0) {
          query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) {
          return handleRepositoryError(error, "Ticket");
        }

        if (!data) {
          return [];
        }

        const ticketRows = data as unknown as TicketRow[];
        return mapTicketRowsToDomain(ticketRows);
      } catch (error) {
        return handleRepositoryError(error, "Ticket");
      }
    },

    async listSearchSuggestions(
      projectId: string,
      search: string,
      limit = 6
    ): Promise<TicketSearchItem[]> {
      try {
        const searchTerm = search.trim();
        if (searchTerm === "") {
          return [];
        }

        let query = client
          .from("tickets")
          .select("id,title,code_number")
          .eq("project_id", projectId)
          .is("archived_at", null)
          .order("created_at", {
            ascending: false,
          })
          .limit(limit);

        query = query.or(buildTicketSearchClauses(searchTerm).join(","));

        const { data, error } = await query;

        if (error) {
          return handleRepositoryError(error, "Ticket");
        }

        if (!data) {
          return [];
        }

        return mapTicketSearchRowsToDomain(data);
      } catch (error) {
        return handleRepositoryError(error, "Ticket");
      }
    },

    async listByColumnId(
      projectId: string,
      columnId: string
    ): Promise<Ticket[]> {
      try {
        const { data, error } = await client
          .from("tickets")
          .select("*")
          .eq("project_id", projectId)
          .eq("column_id", columnId)
          .is("archived_at", null)
          .order("position", { ascending: true });

        if (error) {
          return handleRepositoryError(error, "Ticket");
        }

        if (!data) {
          return [];
        }

        return mapTicketRowsToDomain(data);
      } catch (error) {
        return handleRepositoryError(error, "Ticket");
      }
    },

    async create(input: CreateTicketInput): Promise<Ticket> {
      try {
        if (input.codeNumber === undefined) {
          return handleRepositoryError(
            createDatabaseError("Ticket code number is required"),
            "Ticket"
          );
        }

        const { data, error } = await client
          .from("tickets")
          .insert({
            project_id: input.projectId,
            title: input.title,
            description: input.description ?? null,
            column_id: input.columnId,
            position: input.position ?? 0,
            priority: input.priority ?? null,
            due_date: input.dueDate ?? null,
            story_points: input.storyPoints ?? null,
            created_by: input.createdBy ?? null,
            completed_at: input.completedAt?.toISOString() ?? null,
            code_number: input.codeNumber,
          })
          .select()
          .single();

        if (error) {
          return handleRepositoryError(error, "Ticket");
        }

        if (!data) {
          return handleRepositoryError(
            createDatabaseError("No data returned from insert"),
            "Ticket"
          );
        }

        return mapTicketRowToDomain(data);
      } catch (error) {
        return handleRepositoryError(error, "Ticket");
      }
    },

    async update(id: string, input: UpdateTicketInput): Promise<Ticket> {
      try {
        const updateData: TableUpdate<"tickets"> = {};

        if (input.title !== undefined) {
          updateData.title = input.title;
        }
        if (input.description !== undefined) {
          updateData.description = input.description;
        }
        if (input.columnId !== undefined) {
          updateData.column_id = input.columnId;
        }
        if (input.position !== undefined) {
          updateData.position = input.position;
        }
        if (input.priority !== undefined) {
          updateData.priority = input.priority;
        }
        if (input.dueDate !== undefined) {
          updateData.due_date = input.dueDate ?? null;
        }
        if (input.storyPoints !== undefined) {
          updateData.story_points = input.storyPoints;
        }
        if (input.completedAt !== undefined) {
          updateData.completed_at = input.completedAt?.toISOString() ?? null;
        }
        if (input.archivedAt !== undefined) {
          updateData.archived_at = input.archivedAt?.toISOString() ?? null;
        }
        if (input.archivedWeekStart !== undefined) {
          updateData.archived_week_start =
            input.archivedWeekStart?.toISOString().slice(0, 10) ?? null;
        }

        const { data, error } = await client
          .from("tickets")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          return handleRepositoryError(error, "Ticket");
        }

        if (!data) {
          return handleRepositoryError(
            createNotFoundError("Ticket", id),
            "Ticket"
          );
        }

        return mapTicketRowToDomain(data);
      } catch (error) {
        return handleRepositoryError(error, "Ticket");
      }
    },

    async delete(id: string): Promise<void> {
      try {
        const { error } = await client.from("tickets").delete().eq("id", id);

        if (error) {
          return handleRepositoryError(error, "Ticket");
        }
      } catch (error) {
        return handleRepositoryError(error, "Ticket");
      }
    },

    async updatePositions(
      ticketPositions: Array<{ id: string; position: number }>
    ): Promise<Ticket[]> {
      try {
        const { data, error } = await client.rpc("update_ticket_positions", {
          p_positions: ticketPositions,
        });

        if (error) {
          return handleRepositoryError(error, "Ticket");
        }

        return mapTicketRowsToDomain(data ?? []);
      } catch (error) {
        return handleRepositoryError(error, "Ticket");
      }
    },

    async moveTicket(
      id: string,
      columnId: string,
      position: number,
      completedAt: Date | null
    ): Promise<Ticket> {
      try {
        const updateData = {
          column_id: columnId,
          position,
          completed_at: completedAt?.toISOString() ?? null,
        };

        const { data, error } = await client
          .from("tickets")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          return handleRepositoryError(error, "Ticket", id);
        }

        if (!data) {
          return handleRepositoryError(
            createNotFoundError("Ticket", id),
            "Ticket",
            id
          );
        }

        return mapTicketRowToDomain(data);
      } catch (error) {
        return handleRepositoryError(error, "Ticket", id);
      }
    },

    async moveAndReorderTicket(input: {
      ticketId: string;
      columnId: string;
      position: number;
      completedAt: Date | null;
      ticketPositions: Array<{ id: string; position: number }>;
    }): Promise<Ticket[]> {
      try {
        const { data, error } = await client.rpc("move_and_reorder_ticket", {
          p_ticket_id: input.ticketId,
          p_column_id: input.columnId,
          p_position: input.position,
          // The SQL arg accepts nullable timestamptz; generated RPC args omit nullability.
          p_completed_at: (input.completedAt?.toISOString() ?? null) as string,
          p_positions: input.ticketPositions,
        });

        if (error) {
          return handleRepositoryError(error, "Ticket", input.ticketId);
        }

        const rows = data ?? [];
        const movedTicketExists = rows.some((row) => row.id === input.ticketId);
        if (!movedTicketExists) {
          return handleRepositoryError(
            createNotFoundError("Ticket", input.ticketId),
            "Ticket",
            input.ticketId
          );
        }

        return mapTicketRowsToDomain(rows);
      } catch (error) {
        return handleRepositoryError(error, "Ticket", input.ticketId);
      }
    },

    async archiveCompletedTicketsBatch(input: {
      runAt: Date;
      timeZone: string;
    }): Promise<number> {
      try {
        const { data, error } = await client.rpc(
          "archive_completed_tickets_batch",
          {
            p_now: input.runAt.toISOString(),
            p_time_zone: input.timeZone,
          }
        );

        if (error) {
          return handleRepositoryError(error, "Ticket");
        }

        return typeof data === "number" ? data : 0;
      } catch (error) {
        return handleRepositoryError(error, "Ticket");
      }
    },

    async findByCode(
      projectId: string,
      codeNumber: number
    ): Promise<Ticket | null> {
      try {
        const { data, error } = await client
          .from("tickets")
          .select("*")
          .eq("project_id", projectId)
          .eq("code_number", codeNumber)
          .is("archived_at", null)
          .single();

        if (error) {
          return handleRepositoryError(error, "Ticket");
        }

        if (!data) {
          return null;
        }

        return mapTicketRowToDomain(data);
      } catch (error) {
        return handleRepositoryError(error, "Ticket");
      }
    },

    async findByCodeIncludingArchived(
      projectId: string,
      codeNumber: number
    ): Promise<Ticket | null> {
      try {
        const { data, error } = await client
          .from("tickets")
          .select("*")
          .eq("project_id", projectId)
          .eq("code_number", codeNumber)
          .single();

        if (error) {
          return handleRepositoryError(error, "Ticket");
        }

        if (!data) {
          return null;
        }

        return mapTicketRowToDomain(data);
      } catch (error) {
        return handleRepositoryError(error, "Ticket");
      }
    },

    async assignUsers(ticketId: string, userIds: string[]): Promise<void> {
      if (userIds.length === 0) {
        return;
      }

      const rows = userIds.map((userId) => ({
        ticket_id: ticketId,
        user_id: userId,
        assigned_by: null as string | null,
      })) satisfies Array<Omit<TableInsert<"ticket_assignees">, "project_id">>;

      try {
        const identity = await getCurrentAuthIdentity(client);
        const assignedBy = identity?.userId ?? null;
        rows.forEach((row) => {
          row.assigned_by = assignedBy;
        });
      } catch {
        // assigned_by is optional
      }

      const { error } = await client
        .from("ticket_assignees")
        // project_id is derived from ticket_id by the database trigger.
        .upsert(rows as TableInsert<"ticket_assignees">[], {
          onConflict: "ticket_id,user_id",
          ignoreDuplicates: true,
        });

      if (error) {
        return handleRepositoryError(error, "TicketAssignee", ticketId);
      }
    },

    async unassignUsers(ticketId: string, userIds: string[]): Promise<void> {
      if (userIds.length === 0) {
        return;
      }

      const { error } = await client
        .from("ticket_assignees")
        .delete()
        .eq("ticket_id", ticketId)
        .in("user_id", userIds);

      if (error) {
        return handleRepositoryError(error, "TicketAssignee", ticketId);
      }
    },

    async getAssignees(ticketId: string): Promise<TicketAssignee[]> {
      const { data, error } = await client.rpc("get_ticket_assignees", {
        ticket_ids: [ticketId],
      });

      if (error) {
        return handleRepositoryError(error, "TicketAssignee", ticketId);
      }

      return (data ?? []).map((row) => ({
        userId: row.user_id,
        displayName: row.display_name,
        avatarUrl: row.avatar_url,
        assignedAt: new Date(row.assigned_at),
      }));
    },

    async getAssigneesByTicketIds(
      ticketIds: string[]
    ): Promise<Record<string, TicketAssignee[]>> {
      if (ticketIds.length === 0) {
        return {};
      }

      const { data, error } = await client.rpc("get_ticket_assignees", {
        ticket_ids: ticketIds,
      });

      if (error) {
        return handleRepositoryError(error, "TicketAssignee");
      }

      return mapAssigneeRowsToTicketMap(data ?? []);
    },

    async getAssigneesByProjectId(
      projectId: string
    ): Promise<Record<string, TicketAssignee[]>> {
      const { data, error } = await client.rpc("get_project_ticket_assignees", {
        p_project_id: projectId,
      });

      if (error) {
        if (isMissingProjectAssigneesRpcError(error)) {
          return getAssigneesByProjectIdFallback(projectId);
        }

        return handleRepositoryError(error, "TicketAssignee", projectId);
      }

      return mapAssigneeRowsToTicketMap(data ?? []);
    },
  };
  return repo;
};
