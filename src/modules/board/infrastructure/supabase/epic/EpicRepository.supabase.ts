import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createDatabaseError,
  createNotFoundError,
} from "@/shared/errors/repositoryError";
import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";

import { mapEpicRowsToDomain, mapEpicRowToDomain } from "./EpicMapper.supabase";

import type {
  CreateEpicRepositoryInput,
  Epic,
  UpdateEpicInput,
} from "@/modules/board/core/domain/schema/epic.schema";
import type { Ticket } from "@/modules/board/core/domain/schema/ticket.schema";
import type { EpicRepository } from "@/modules/board/core/ports/epicRepository";
import type { EpicRow } from "@/modules/board/infrastructure/supabase/epic/types";
import { mapTicketRowsToDomain } from "@/modules/board/infrastructure/supabase/ticket/TicketMapper.supabase";
import type { TicketRow } from "@/modules/board/infrastructure/supabase/ticket/types";

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
  async getNextCodeNumberForProject(projectId: string): Promise<number> {
    try {
      const { data, error } = await client
        .from("epics")
        .select("code_number")
        .eq("project_id", projectId)
        .order("code_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        return handleRepositoryError(error, "Epic");
      }

      const currentMax =
        data &&
        typeof (data as { code_number: number }).code_number === "number"
          ? (data as { code_number: number }).code_number
          : 0;

      return currentMax + 1;
    } catch (error) {
      return handleRepositoryError(error, "Epic");
    }
  },
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

  async create(input: CreateEpicRepositoryInput): Promise<Epic> {
    try {
      const { data, error } = await client
        .from("epics")
        .insert({
          project_id: input.projectId,
          name: input.name,
          description: input.description ?? null,
          code_number: input.codeNumber,
          start_date: input.startDate?.toISOString() ?? null,
          target_date: input.targetDate?.toISOString() ?? null,
          color: input.color ?? "#6B7280",
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
      if (input.startDate !== undefined) {
        updateData.start_date = input.startDate?.toISOString() ?? null;
      }
      if (input.targetDate !== undefined) {
        updateData.target_date = input.targetDate?.toISOString() ?? null;
      }
      if (input.color !== undefined) {
        updateData.color = input.color;
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

  async findByCode(
    projectId: string,
    codeNumber: number
  ): Promise<Epic | null> {
    try {
      const { data, error } = await client
        .from("epics")
        .select("*")
        .eq("project_id", projectId)
        .eq("code_number", codeNumber)
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
});
