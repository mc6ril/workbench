import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createDatabaseError,
  createNotFoundError,
} from "@/core/domain/repositoryError";
import type {
  CreateEpicInput,
  Epic,
  UpdateEpicInput,
} from "@/core/domain/schema/epic.schema";
import type { Ticket } from "@/core/domain/schema/ticket.schema";

import { handleRepositoryError } from "@/infrastructure/supabase/shared/errors/errorHandlers";
import { mapTicketRowsToDomain } from "@/infrastructure/supabase/ticket/TicketMapper.supabase";
import type { EpicRow, TicketRow } from "@/infrastructure/supabase/types";

import { mapEpicRowsToDomain, mapEpicRowToDomain } from "./EpicMapper.supabase";

import type { EpicRepository } from "@/core/ports/epicRepository";

/**
 * Create an EpicRepository implementation using the provided Supabase client.
 * This allows using different clients (browser/server) based on context.
 *
 * @param client - Supabase client instance to use
 * @returns EpicRepository implementation
 */
export const createEpicRepository = (
  client: SupabaseClient
): EpicRepository => ({
  async findById(id: string): Promise<Epic | null> {
    try {
      const { data, error } = await client
        .from("epics")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return handleRepositoryError(error, "Epic");
      }

      if (!data) {
        return null;
      }

      return mapEpicRowToDomain(data as EpicRow);
    } catch (error) {
      return handleRepositoryError(error, "Epic");
    }
  },

  async listByProject(projectId: string): Promise<Epic[]> {
    try {
      const { data, error } = await client
        .from("epics")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) {
        return handleRepositoryError(error, "Epic");
      }

      if (!data) {
        return [];
      }

      return mapEpicRowsToDomain(data as EpicRow[]);
    } catch (error) {
      return handleRepositoryError(error, "Epic");
    }
  },

  async create(input: CreateEpicInput): Promise<Epic> {
    try {
      const { data, error } = await client
        .from("epics")
        .insert({
          project_id: input.projectId,
          name: input.name,
          description: input.description ?? null,
        })
        .select()
        .single();

      if (error) {
        return handleRepositoryError(error, "Epic");
      }

      if (!data) {
        return handleRepositoryError(
          createDatabaseError("No data returned from insert"),
          "Epic"
        );
      }

      return mapEpicRowToDomain(data as EpicRow);
    } catch (error) {
      return handleRepositoryError(error, "Epic");
    }
  },

  async update(id: string, input: UpdateEpicInput): Promise<Epic> {
    try {
      const updateData: Partial<EpicRow> = {};

      if (input.name !== undefined) {
        updateData.name = input.name;
      }
      if (input.description !== undefined) {
        updateData.description = input.description;
      }

      const { data, error } = await client
        .from("epics")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return handleRepositoryError(error, "Epic", id);
      }

      if (!data) {
        return handleRepositoryError(
          createNotFoundError("Epic", id),
          "Epic",
          id
        );
      }

      return mapEpicRowToDomain(data as EpicRow);
    } catch (error) {
      return handleRepositoryError(error, "Epic", id);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await client.from("epics").delete().eq("id", id);

      if (error) {
        return handleRepositoryError(error, "Epic", id);
      }
    } catch (error) {
      return handleRepositoryError(error, "Epic", id);
    }
  },

  async listTicketsByEpic(epicId: string): Promise<Ticket[]> {
    try {
      const { data, error } = await client
        .from("tickets")
        .select("*")
        .eq("epic_id", epicId);

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
});
