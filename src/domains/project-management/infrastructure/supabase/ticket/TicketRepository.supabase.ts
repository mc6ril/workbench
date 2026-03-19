import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createDatabaseError,
  createNotFoundError,
} from "@/shared/errors/repositoryError";
import type {
  CreateTicketInput,
  Ticket,
  TicketAssignee,
  TicketFilters,
  TicketSort,
  UpdateTicketInput,
} from "@/domains/project-management/core/domain/schema/ticket.schema";

import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";
import type { TicketRow } from "@/shared/infrastructure/types";

import {
  mapTicketRowsToDomain,
  mapTicketRowToDomain,
} from "./TicketMapper.supabase";

import type { TicketRepository } from "@/domains/project-management/core/ports/ticketRepository";

type TicketAssigneeRow = {
  ticket_id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  assigned_at: string;
};

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

/**
 * Create a TicketRepository implementation using the provided Supabase client.
 * This allows using different clients (browser/server) based on context.
 *
 * @param client - Supabase client instance to use
 * @returns TicketRepository implementation
 */
export const createTicketRepository = (
  client: SupabaseClient
): TicketRepository => {
  const getAssigneesByProjectIdFallback = async (
    projectId: string
  ): Promise<Record<string, TicketAssignee[]>> => {
    const { data: ticketRows, error: ticketIdsError } = await client
      .from("tickets")
      .select("id")
      .eq("project_id", projectId);

    if (ticketIdsError) {
      return handleRepositoryError(ticketIdsError, "TicketAssignee", projectId);
    }

    const ticketIds = (ticketRows ?? []).map((row: { id: string }) => row.id);
    if (ticketIds.length === 0) {
      return {};
    }

    const { data, error } = await client.rpc("get_ticket_assignees", {
      ticket_ids: ticketIds,
    });

    if (error) {
      return handleRepositoryError(error, "TicketAssignee", projectId);
    }

    return mapAssigneeRowsToTicketMap((data ?? []) as TicketAssigneeRow[]);
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

        return mapTicketRowToDomain(data as TicketRow);
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
          data &&
          typeof (data as { code_number: number }).code_number === "number"
            ? (data as { code_number: number }).code_number
            : 0;

        return currentMax + 1;
      } catch (error) {
        return handleRepositoryError(error, "Ticket");
      }
    },

    async listByProject(
      projectId: string,
      filters?: TicketFilters,
      sort?: TicketSort,
      search?: string,
      limit?: number
    ): Promise<Ticket[]> {
      try {
        let query = client
          .from("tickets")
          .select("*")
          .eq("project_id", projectId);

        // Apply filters if provided
        if (filters?.status) {
          query = query.eq("status", filters.status);
        }

        if (filters?.epicId) {
          query = query.eq("epic_id", filters.epicId);
        }

        // parentId filter is tri-state:
        // - undefined: don't filter by parent_id
        // - null: only top-level tickets (parent_id IS NULL)
        // - string: only subtasks of given parent (parent_id = value)
        if (filters && "parentId" in filters) {
          if (filters.parentId === null) {
            query = query.is("parent_id", null);
          } else if (typeof filters.parentId === "string") {
            query = query.eq("parent_id", filters.parentId);
          }
        }

        // sprintId filter: null = no sprint, string = specific sprint
        if (filters && "sprintId" in filters) {
          if (filters.sprintId === null) {
            query = query.is("sprint_id", null);
          } else if (typeof filters.sprintId === "string") {
            query = query.eq("sprint_id", filters.sprintId);
          }
        }

        if (filters?.priority) {
          query = query.eq("priority", filters.priority);
        }

        if (filters?.labelIds && filters.labelIds.length > 0) {
          const { data: labelTicketIds, error: labelFilterError } = await client
            .from("ticket_labels")
            .select("ticket_id")
            .in("label_id", filters.labelIds);

          if (labelFilterError) {
            return handleRepositoryError(labelFilterError, "Ticket");
          }

          const ticketIds = (labelTicketIds ?? []).map(
            (r: { ticket_id: string }) => r.ticket_id
          );

          if (ticketIds.length === 0) {
            return [];
          }
          query = query.in("id", ticketIds);
        }

        const searchTerm = search?.trim();
        if (searchTerm) {
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

          if (hasCodePrefixMatch) {
            const parsedPrefix = Number.parseInt(codePrefix, 10);
            const maxCodeNumber = 2_147_483_647;
            if (Number.isInteger(parsedPrefix) && parsedPrefix >= 0) {
              for (let scale = 0; scale <= 9; scale += 1) {
                const factor = 10 ** scale;
                const rangeStart = parsedPrefix * factor;
                if (rangeStart > maxCodeNumber) {
                  break;
                }

                const rangeEnd = Math.min(
                  (parsedPrefix + 1) * factor - 1,
                  maxCodeNumber
                );

                searchClauses.push(
                  `and(code_number.gte.${rangeStart},code_number.lte.${rangeEnd})`
                );
              }
            }
          }

          query = query.or(searchClauses.join(","));
        }

        const sortField = sort?.field ?? "createdAt";
        const sortDirection = sort?.direction ?? "desc";
        const sortFieldMap: Record<string, string> = {
          createdAt: "created_at",
          position: "position",
          title: "title",
          priority: "priority",
          sprint: "sprint_id",
          dueDate: "due_date",
        };
        const orderColumn = sortFieldMap[sortField] ?? "created_at";

        if (sortField !== "priority") {
          query = query.order(orderColumn, {
            ascending: sortDirection === "asc",
          });

          if (typeof limit === "number" && limit > 0) {
            query = query.limit(limit);
          }
        }

        const { data, error } = await query;

        if (error) {
          return handleRepositoryError(error, "Ticket");
        }

        if (!data) {
          return [];
        }

        const ticketRows = data as unknown as TicketRow[];

        if (sortField === "priority") {
          // DB stores priority as text, so semantic priority sort is done in-memory.
          // Trade-off: for this specific sort mode, all matching rows are fetched
          // before applying `limit`.
          const priorityRank: Record<string, number> = {
            highest: 5,
            high: 4,
            medium: 3,
            low: 2,
            lowest: 1,
          };

          ticketRows.sort((a, b) => {
            const rankA = a.priority ? (priorityRank[a.priority] ?? 0) : 0;
            const rankB = b.priority ? (priorityRank[b.priority] ?? 0) : 0;
            if (rankA === rankB) {
              // TicketRow timestamps are ISO strings from Supabase row types.
              return a.created_at.localeCompare(b.created_at);
            }

            return sortDirection === "asc" ? rankA - rankB : rankB - rankA;
          });
        }

        const limitedTicketRows =
          typeof limit === "number" && limit > 0
            ? ticketRows.slice(0, limit)
            : ticketRows;

        return mapTicketRowsToDomain(limitedTicketRows);
      } catch (error) {
        return handleRepositoryError(error, "Ticket");
      }
    },

    async listByStatus(projectId: string, status: string): Promise<Ticket[]> {
      try {
        const { data, error } = await client
          .from("tickets")
          .select("*")
          .eq("project_id", projectId)
          .eq("status", status)
          .order("position", { ascending: true });

        if (error) {
          return handleRepositoryError(error, "Ticket");
        }

        if (!data) {
          return [];
        }

        return mapTicketRowsToDomain(data as TicketRow[]);
      } catch (error) {
        return handleRepositoryError(error, "Ticket");
      }
    },

    async create(input: CreateTicketInput): Promise<Ticket> {
      try {
        const { data, error } = await client
          .from("tickets")
          .insert({
            project_id: input.projectId,
            title: input.title,
            description: input.description ?? null,
            status: input.status,
            position: input.position ?? 0,
            epic_id: input.epicId ?? null,
            parent_id: input.parentId ?? null,
            sprint_id: input.sprintId ?? null,
            priority: input.priority ?? null,
            due_date: input.dueDate?.toISOString() ?? null,
            story_points: input.storyPoints ?? null,
            created_by: input.createdBy ?? null,
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

        return mapTicketRowToDomain(data as TicketRow);
      } catch (error) {
        return handleRepositoryError(error, "Ticket");
      }
    },

    async update(id: string, input: UpdateTicketInput): Promise<Ticket> {
      try {
        const updateData: Partial<TicketRow> = {};

        if (input.title !== undefined) {
          updateData.title = input.title;
        }
        if (input.description !== undefined) {
          updateData.description = input.description;
        }
        if (input.status !== undefined) {
          updateData.status = input.status;
        }
        if (input.position !== undefined) {
          updateData.position = input.position;
        }
        if (input.epicId !== undefined) {
          updateData.epic_id = input.epicId;
        }
        if (input.parentId !== undefined) {
          updateData.parent_id = input.parentId;
        }
        if (input.sprintId !== undefined) {
          updateData.sprint_id = input.sprintId;
        }
        if (input.priority !== undefined) {
          updateData.priority = input.priority;
        }
        if (input.dueDate !== undefined) {
          updateData.due_date = input.dueDate?.toISOString() ?? null;
        }
        if (input.storyPoints !== undefined) {
          updateData.story_points = input.storyPoints;
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

        return mapTicketRowToDomain(data as TicketRow);
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

        return mapTicketRowsToDomain((data ?? []) as TicketRow[]);
      } catch (error) {
        return handleRepositoryError(error, "Ticket");
      }
    },

    async moveTicket(
      id: string,
      status: string,
      position: number
    ): Promise<Ticket> {
      try {
        const { data, error } = await client
          .from("tickets")
          .update({ status, position })
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

        return mapTicketRowToDomain(data as TicketRow);
      } catch (error) {
        return handleRepositoryError(error, "Ticket", id);
      }
    },

    async moveAndReorderTicket(input: {
      ticketId: string;
      status: string;
      position: number;
      ticketPositions: Array<{ id: string; position: number }>;
    }): Promise<Ticket[]> {
      try {
        const { data, error } = await client.rpc("move_and_reorder_ticket", {
          p_ticket_id: input.ticketId,
          p_status: input.status,
          p_position: input.position,
          p_positions: input.ticketPositions,
        });

        if (error) {
          return handleRepositoryError(error, "Ticket", input.ticketId);
        }

        const rows = (data ?? []) as TicketRow[];
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

    async assignToEpic(ticketId: string, epicId: string): Promise<Ticket> {
      return repo.update(ticketId, { epicId });
    },

    async unassignFromEpic(ticketId: string): Promise<Ticket> {
      return repo.update(ticketId, { epicId: null });
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
          .single();

        if (error) {
          return handleRepositoryError(error, "Ticket");
        }

        if (!data) {
          return null;
        }

        return mapTicketRowToDomain(data as TicketRow);
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
      }));

      try {
        const currentUser = await client.auth.getUser();
        const assignedBy = currentUser.data.user?.id ?? null;
        rows.forEach((row) => {
          row.assigned_by = assignedBy;
        });
      } catch {
        // assigned_by is optional
      }

      const { error } = await client.from("ticket_assignees").upsert(rows, {
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

      return ((data ?? []) as TicketAssigneeRow[]).map((row) => ({
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

      return mapAssigneeRowsToTicketMap((data ?? []) as TicketAssigneeRow[]);
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

      return mapAssigneeRowsToTicketMap((data ?? []) as TicketAssigneeRow[]);
    },
  };
  return repo;
};
