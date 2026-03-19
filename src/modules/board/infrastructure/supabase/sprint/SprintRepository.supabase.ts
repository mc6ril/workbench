import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createDatabaseError,
  createNotFoundError,
} from "@/shared/errors/repositoryError";
import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";

import {
  mapSprintRowsToDomain,
  mapSprintRowToDomain,
} from "./SprintMapper.supabase";

import type {
  CreateSprintInput,
  Sprint,
  UpdateSprintInput,
} from "@/modules/board/core/domain/schema/sprint.schema";
import type { SprintRepository } from "@/modules/board/core/ports/sprintRepository";
import type { SprintRow } from "@/modules/board/infrastructure/supabase/sprint/types";

export const countCompletedByDoneStatuses = (
  tickets: Array<{ status: string }>,
  doneStatuses: Set<string>
): number => {
  if (doneStatuses.size === 0) {
    return 0;
  }

  return tickets.filter((ticket) =>
    doneStatuses.has(ticket.status.trim().toLowerCase())
  ).length;
};

const normalizeWorkflowStatus = (status: string): string => {
  return status.trim().toLowerCase();
};

/**
 * Create a SprintRepository implementation using the provided Supabase client.
 */
export const createSprintRepository = (
  client: SupabaseClient
): SprintRepository => ({
  async findById(id: string): Promise<Sprint | null> {
    try {
      const { data, error } = await client
        .from("sprints")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return handleRepositoryError(error, "Sprint");
      }

      if (!data) {
        return null;
      }

      return mapSprintRowToDomain(data as SprintRow);
    } catch (error) {
      return handleRepositoryError(error, "Sprint");
    }
  },

  async listByProject(projectId: string): Promise<Sprint[]> {
    try {
      const { data, error } = await client
        .from("sprints")
        .select("*")
        .eq("project_id", projectId)
        .order("position", { ascending: true });

      if (error) {
        return handleRepositoryError(error, "Sprint");
      }

      if (!data) {
        return [];
      }

      return mapSprintRowsToDomain(data as SprintRow[]);
    } catch (error) {
      return handleRepositoryError(error, "Sprint");
    }
  },

  async create(input: CreateSprintInput): Promise<Sprint> {
    try {
      // Auto-assign position as next available
      const { data: maxPos } = await client
        .from("sprints")
        .select("position")
        .eq("project_id", input.projectId)
        .order("position", { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextPosition =
        maxPos && typeof (maxPos as { position: number }).position === "number"
          ? (maxPos as { position: number }).position + 1
          : 0;

      const { data, error } = await client
        .from("sprints")
        .insert({
          project_id: input.projectId,
          name: input.name,
          goal: input.goal ?? null,
          start_date: input.startDate?.toISOString() ?? null,
          end_date: input.endDate?.toISOString() ?? null,
          status: "planned",
          position: nextPosition,
        })
        .select()
        .single();

      if (error) {
        return handleRepositoryError(error, "Sprint");
      }

      if (!data) {
        return handleRepositoryError(
          createDatabaseError("No data returned from insert"),
          "Sprint"
        );
      }

      return mapSprintRowToDomain(data as SprintRow);
    } catch (error) {
      return handleRepositoryError(error, "Sprint");
    }
  },

  async update(id: string, input: UpdateSprintInput): Promise<Sprint> {
    try {
      const updateData: Partial<SprintRow> = {};

      if (input.name !== undefined) {
        updateData.name = input.name;
      }
      if (input.goal !== undefined) {
        updateData.goal = input.goal;
      }
      if (input.startDate !== undefined) {
        updateData.start_date = input.startDate?.toISOString() ?? null;
      }
      if (input.endDate !== undefined) {
        updateData.end_date = input.endDate?.toISOString() ?? null;
      }
      if (input.status !== undefined) {
        updateData.status = input.status;
      }

      const { data, error } = await client
        .from("sprints")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return handleRepositoryError(error, "Sprint", id);
      }

      if (!data) {
        return handleRepositoryError(
          createNotFoundError("Sprint", id),
          "Sprint",
          id
        );
      }

      return mapSprintRowToDomain(data as SprintRow);
    } catch (error) {
      return handleRepositoryError(error, "Sprint", id);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await client.from("sprints").delete().eq("id", id);

      if (error) {
        return handleRepositoryError(error, "Sprint", id);
      }
    } catch (error) {
      return handleRepositoryError(error, "Sprint", id);
    }
  },

  async getSprintStats(
    sprintId: string
  ): Promise<{ ticketCount: number; completedCount: number }> {
    try {
      const { data: sprintData, error: sprintError } = await client
        .from("sprints")
        .select("project_id")
        .eq("id", sprintId)
        .single();

      if (sprintError) {
        return handleRepositoryError(sprintError, "Sprint", sprintId);
      }

      const projectId = (sprintData as { project_id: string } | null)
        ?.project_id;

      if (!projectId) {
        return {
          ticketCount: 0,
          completedCount: 0,
        };
      }

      const { data: boardData, error: boardError } = await client
        .from("boards")
        .select("id")
        .eq("project_id", projectId)
        .maybeSingle();

      if (boardError) {
        return handleRepositoryError(boardError, "Board");
      }

      const boardId = (boardData as { id: string } | null)?.id;
      const doneStatuses = new Set<string>();

      if (boardId) {
        const { data: columnData, error: columnError } = await client
          .from("columns")
          .select("status")
          .eq("board_id", boardId)
          .eq("state", "done")
          .eq("visible", true);

        if (columnError) {
          return handleRepositoryError(columnError, "Column");
        }

        for (const row of (columnData ?? []) as Array<{ status: string }>) {
          doneStatuses.add(normalizeWorkflowStatus(row.status));
        }
      }

      const { data, error } = await client
        .from("tickets")
        .select("status")
        .eq("sprint_id", sprintId);

      if (error) {
        return handleRepositoryError(error, "Sprint", sprintId);
      }

      const tickets = (data ?? []) as Array<{ status: string }>;
      const completedCount = countCompletedByDoneStatuses(
        tickets,
        doneStatuses
      );

      return {
        ticketCount: tickets.length,
        completedCount,
      };
    } catch (error) {
      return handleRepositoryError(error, "Sprint", sprintId);
    }
  },
});
