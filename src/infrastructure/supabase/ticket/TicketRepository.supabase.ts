import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createDatabaseError,
  createNotFoundError,
} from "@/core/domain/repositoryError";
import type {
  CreateTicketInput,
  Ticket,
  TicketFilters,
  TicketSort,
  UpdateTicketInput,
} from "@/core/domain/schema/ticket.schema";

import { handleRepositoryError } from "@/infrastructure/supabase/shared/errors/errorHandlers";
import type { TicketRow } from "@/infrastructure/supabase/types";

import {
  mapTicketRowsToDomain,
  mapTicketRowToDomain,
} from "./TicketMapper.supabase";

import type { TicketRepository } from "@/core/ports/ticketRepository";

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
    sort?: TicketSort
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

      // sprintId filter: null = backlog (no sprint), string = specific sprint
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

      if (filters?.assigneeIds && filters.assigneeIds.length > 0) {
        const { data: assigneeTicketIds } = await client
          .from("ticket_assignees")
          .select("ticket_id")
          .in("user_id", filters.assigneeIds);

        const ticketIds = (assigneeTicketIds ?? []).map(
          (r: { ticket_id: string }) => r.ticket_id
        );

        if (ticketIds.length === 0) {
          return [];
        }
        query = query.in("id", ticketIds);
      }

      if (filters?.labelIds && filters.labelIds.length > 0) {
        const { data: labelTicketIds } = await client
          .from("ticket_labels")
          .select("ticket_id")
          .in("label_id", filters.labelIds);

        const ticketIds = (labelTicketIds ?? []).map(
          (r: { ticket_id: string }) => r.ticket_id
        );

        if (ticketIds.length === 0) {
          return [];
        }
        query = query.in("id", ticketIds);
      }

      const sortField = sort?.field ?? "createdAt";
      const sortDirection = sort?.direction ?? "desc";
      const sortFieldMap: Record<string, string> = {
        createdAt: "created_at",
        position: "position",
        title: "title",
        priority: "priority",
        dueDate: "due_date",
      };
      const orderColumn = sortFieldMap[sortField] ?? "created_at";

      const { data, error } = await query.order(orderColumn, {
        ascending: sortDirection === "asc",
      });

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

  async getAssignees(
    ticketId: string
  ): Promise<import("@/core/domain/schema/ticket.schema").TicketAssignee[]> {
    const { data, error } = await client.rpc("get_ticket_assignees", {
      ticket_ids: [ticketId],
    });

    if (error) {
      return handleRepositoryError(error, "TicketAssignee", ticketId);
    }

    return (
      (data ?? []) as Array<{
        ticket_id: string;
        user_id: string;
        display_name: string | null;
        avatar_url: string | null;
        assigned_at: string;
      }>
    ).map((row) => ({
      userId: row.user_id,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      assignedAt: new Date(row.assigned_at),
    }));
  },

  async getAssigneesByTicketIds(
    ticketIds: string[]
  ): Promise<
    Record<
      string,
      import("@/core/domain/schema/ticket.schema").TicketAssignee[]
    >
  > {
    if (ticketIds.length === 0) {
      return {};
    }

    const { data, error } = await client.rpc("get_ticket_assignees", {
      ticket_ids: ticketIds,
    });

    if (error) {
      return handleRepositoryError(error, "TicketAssignee");
    }

    const result: Record<
      string,
      import("@/core/domain/schema/ticket.schema").TicketAssignee[]
    > = {};

    for (const row of (data ?? []) as Array<{
      ticket_id: string;
      user_id: string;
      display_name: string | null;
      avatar_url: string | null;
      assigned_at: string;
    }>) {
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
  },
  };
  return repo;
};
