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
): TicketRepository => ({
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

      const sortField = sort?.field ?? "createdAt";
      const sortDirection = sort?.direction ?? "desc";
      const orderColumn =
        sortField === "createdAt"
          ? "created_at"
          : sortField === "position"
            ? "position"
            : "title";

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
      const updatedTickets: Ticket[] = [];

      for (const { id, position } of ticketPositions) {
        const { data, error } = await client
          .from("tickets")
          .update({ position })
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

        updatedTickets.push(mapTicketRowToDomain(data as TicketRow));
      }

      return updatedTickets;
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
    try {
      const { data, error } = await client
        .from("tickets")
        .update({ epic_id: epicId })
        .eq("id", ticketId)
        .select()
        .single();

      if (error) {
        return handleRepositoryError(error, "Ticket", ticketId);
      }

      if (!data) {
        return handleRepositoryError(
          createNotFoundError("Ticket", ticketId),
          "Ticket",
          ticketId
        );
      }

      return mapTicketRowToDomain(data as TicketRow);
    } catch (error) {
      return handleRepositoryError(error, "Ticket", ticketId);
    }
  },

  async unassignFromEpic(ticketId: string): Promise<Ticket> {
    try {
      const { data, error } = await client
        .from("tickets")
        .update({ epic_id: null })
        .eq("id", ticketId)
        .select()
        .single();

      if (error) {
        return handleRepositoryError(error, "Ticket", ticketId);
      }

      if (!data) {
        return handleRepositoryError(
          createNotFoundError("Ticket", ticketId),
          "Ticket",
          ticketId
        );
      }

      return mapTicketRowToDomain(data as TicketRow);
    } catch (error) {
      return handleRepositoryError(error, "Ticket", ticketId);
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
});
