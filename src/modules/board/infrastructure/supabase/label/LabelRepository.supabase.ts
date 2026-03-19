import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createDatabaseError,
  createNotFoundError,
} from "@/shared/errors/repositoryError";
import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";

import {
  mapLabelRowsToDomain,
  mapLabelRowToDomain,
} from "./LabelMapper.supabase";

import type {
  CreateLabelInput,
  Label,
  UpdateLabelInput,
} from "@/modules/board/core/domain/schema/label.schema";
import type { LabelRepository } from "@/modules/board/core/ports/labelRepository";
import type { LabelRow } from "@/modules/board/infrastructure/supabase/label/types";

/**
 * Create a LabelRepository implementation using the provided Supabase client.
 */
export const createLabelRepository = (
  client: SupabaseClient
): LabelRepository => ({
  async listByProject(projectId: string): Promise<Label[]> {
    try {
      const { data, error } = await client
        .from("labels")
        .select("*")
        .eq("project_id", projectId)
        .order("name", { ascending: true });

      if (error) {
        return handleRepositoryError(error, "Label");
      }

      return mapLabelRowsToDomain((data ?? []) as LabelRow[]);
    } catch (error) {
      return handleRepositoryError(error, "Label");
    }
  },

  async create(input: CreateLabelInput): Promise<Label> {
    try {
      const { data, error } = await client
        .from("labels")
        .insert({
          project_id: input.projectId,
          name: input.name,
          color: input.color ?? "#6B7280",
        })
        .select()
        .single();

      if (error) {
        return handleRepositoryError(error, "Label");
      }

      if (!data) {
        return handleRepositoryError(
          createDatabaseError("No data returned from insert"),
          "Label"
        );
      }

      return mapLabelRowToDomain(data as LabelRow);
    } catch (error) {
      return handleRepositoryError(error, "Label");
    }
  },

  async update(id: string, input: UpdateLabelInput): Promise<Label> {
    try {
      const updateData: Partial<LabelRow> = {};

      if (input.name !== undefined) {
        updateData.name = input.name;
      }
      if (input.color !== undefined) {
        updateData.color = input.color;
      }

      const { data, error } = await client
        .from("labels")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return handleRepositoryError(error, "Label", id);
      }

      if (!data) {
        return handleRepositoryError(
          createNotFoundError("Label", id),
          "Label",
          id
        );
      }

      return mapLabelRowToDomain(data as LabelRow);
    } catch (error) {
      return handleRepositoryError(error, "Label", id);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await client.from("labels").delete().eq("id", id);

      if (error) {
        return handleRepositoryError(error, "Label", id);
      }
    } catch (error) {
      return handleRepositoryError(error, "Label", id);
    }
  },

  async getTicketLabelIds(ticketId: string): Promise<string[]> {
    try {
      const { data, error } = await client
        .from("ticket_labels")
        .select("label_id")
        .eq("ticket_id", ticketId);

      if (error) {
        return handleRepositoryError(error, "TicketLabel", ticketId);
      }

      return (data ?? []).map((row: { label_id: string }) => row.label_id);
    } catch (error) {
      return handleRepositoryError(error, "TicketLabel", ticketId);
    }
  },

  async addLabelsToTicket(ticketId: string, labelIds: string[]): Promise<void> {
    if (labelIds.length === 0) {
      return;
    }

    const rows = labelIds.map((labelId) => ({
      ticket_id: ticketId,
      label_id: labelId,
    }));

    const { error } = await client.from("ticket_labels").upsert(rows, {
      onConflict: "ticket_id,label_id",
      ignoreDuplicates: true,
    });

    if (error) {
      return handleRepositoryError(error, "TicketLabel", ticketId);
    }
  },

  async removeLabelsFromTicket(
    ticketId: string,
    labelIds: string[]
  ): Promise<void> {
    if (labelIds.length === 0) {
      return;
    }

    const { error } = await client
      .from("ticket_labels")
      .delete()
      .eq("ticket_id", ticketId)
      .in("label_id", labelIds);

    if (error) {
      return handleRepositoryError(error, "TicketLabel", ticketId);
    }
  },
});
