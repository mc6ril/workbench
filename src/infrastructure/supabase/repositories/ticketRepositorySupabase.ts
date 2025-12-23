import { createNotFoundError } from "@/core/domain/errors/repositoryError";
import type {
  CreateTicketInput,
  Ticket,
  UpdateTicketInput,
} from "@/core/domain/ticket/ticket.schema";

import { supabaseClient } from "@/infrastructure/supabase/client";
import {
  mapTicketRowsToDomain,
  mapTicketRowToDomain,
} from "@/infrastructure/supabase/mappers/ticketMapper";
import type { TicketRow } from "@/infrastructure/supabase/types/ticketRow";
import { mapSupabaseError } from "@/infrastructure/supabase/utils/errorMapper";

import type { TicketRepository } from "@/core/ports/ticketRepository";

/**
 * Supabase implementation of TicketRepository.
 * Handles all database operations for tickets using Supabase client.
 */
export const ticketRepositorySupabase: TicketRepository = {
  async findById(id: string): Promise<Ticket | null> {
    try {
      const { data, error } = await supabaseClient
        .from("tickets")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw mapSupabaseError(error, "Ticket");
      }

      if (!data) {
        return null;
      }

      return mapTicketRowToDomain(data as TicketRow);
    } catch (error) {
      // Re-throw domain errors, wrap unknown errors
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error.code === "NOT_FOUND" ||
          error.code === "CONSTRAINT_VIOLATION" ||
          error.code === "DATABASE_ERROR")
      ) {
        throw error;
      }
      throw mapSupabaseError(error, "Ticket");
    }
  },

  async listByProject(projectId: string): Promise<Ticket[]> {
    try {
      const { data, error } = await supabaseClient
        .from("tickets")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) {
        throw mapSupabaseError(error, "Ticket");
      }

      if (!data) {
        return [];
      }

      return mapTicketRowsToDomain(data as TicketRow[]);
    } catch (error) {
      // Re-throw domain errors, wrap unknown errors
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "DATABASE_ERROR"
      ) {
        throw error;
      }
      throw mapSupabaseError(error, "Ticket");
    }
  },

  async listByStatus(projectId: string, status: string): Promise<Ticket[]> {
    try {
      const { data, error } = await supabaseClient
        .from("tickets")
        .select("*")
        .eq("project_id", projectId)
        .eq("status", status)
        .order("position", { ascending: true });

      if (error) {
        throw mapSupabaseError(error, "Ticket");
      }

      if (!data) {
        return [];
      }

      return mapTicketRowsToDomain(data as TicketRow[]);
    } catch (error) {
      // Re-throw domain errors, wrap unknown errors
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "DATABASE_ERROR"
      ) {
        throw error;
      }
      throw mapSupabaseError(error, "Ticket");
    }
  },

  async create(input: CreateTicketInput): Promise<Ticket> {
    try {
      const { data, error } = await supabaseClient
        .from("tickets")
        .insert({
          project_id: input.projectId,
          title: input.title,
          description: input.description ?? null,
          status: input.status,
          position: input.position ?? 0,
          epic_id: input.epicId ?? null,
          parent_id: input.parentId ?? null,
        })
        .select()
        .single();

      if (error) {
        throw mapSupabaseError(error, "Ticket");
      }

      if (!data) {
        throw mapSupabaseError(
          new Error("No data returned from insert"),
          "Ticket"
        );
      }

      return mapTicketRowToDomain(data as TicketRow);
    } catch (error) {
      // Re-throw domain errors, wrap unknown errors
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error.code === "CONSTRAINT_VIOLATION" ||
          error.code === "DATABASE_ERROR")
      ) {
        throw error;
      }
      throw mapSupabaseError(error, "Ticket");
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

      const { data, error } = await supabaseClient
        .from("tickets")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw mapSupabaseError(error, "Ticket");
      }

      if (!data) {
        throw createNotFoundError("Ticket", id);
      }

      return mapTicketRowToDomain(data as TicketRow);
    } catch (error) {
      // Re-throw domain errors, wrap unknown errors
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error.code === "NOT_FOUND" ||
          error.code === "CONSTRAINT_VIOLATION" ||
          error.code === "DATABASE_ERROR")
      ) {
        throw error;
      }
      throw mapSupabaseError(error, "Ticket");
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabaseClient
        .from("tickets")
        .delete()
        .eq("id", id);

      if (error) {
        throw mapSupabaseError(error, "Ticket");
      }
    } catch (error) {
      // Re-throw domain errors, wrap unknown errors
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error.code === "NOT_FOUND" ||
          error.code === "CONSTRAINT_VIOLATION" ||
          error.code === "DATABASE_ERROR")
      ) {
        throw error;
      }
      throw mapSupabaseError(error, "Ticket");
    }
  },
};
