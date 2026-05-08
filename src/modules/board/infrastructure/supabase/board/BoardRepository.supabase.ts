import {
  createDatabaseError,
  createNotFoundError,
} from "@/shared/errors/repositoryError";
import { handleRepositoryError } from "@/shared/infrastructure/errors/errorHandlers";
import { getPostgrestErrorCode } from "@/shared/infrastructure/supabase/postgrestErrorCode";
import type { AppSupabaseClient } from "@/shared/infrastructure/supabase/types";

import {
  mapBoardRowToDomain,
  mapColumnRowsToDomain,
  mapColumnRowToDomain,
} from "./BoardMapper.supabase";

import type {
  Board,
  Column,
  CreateBoardInput,
  CreateColumnInput,
  UpdateColumnInput,
} from "@/modules/board/core/domain/board.types";
import type { BoardRepository } from "@/modules/board/core/ports/boardRepository";
import type { ColumnRow } from "@/modules/board/infrastructure/supabase/board/types";

/**
 * Create a BoardRepository implementation using the provided Supabase client.
 * This allows using different clients (browser/server) based on context.
 *
 * @param client - Supabase client instance to use
 * @returns BoardRepository implementation
 */
export const createBoardRepository = (
  client: AppSupabaseClient
): BoardRepository => ({
  async findById(id: string): Promise<Board | null> {
    try {
      const { data, error } = await client
        .from("boards")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        // When .single() finds no rows, Supabase returns PGRST116.
        // For repository contracts that return null when not found,
        // we treat this specific case as "no board" instead of an error.
        if (getPostgrestErrorCode(error) === "PGRST116") {
          return null;
        }
        return handleRepositoryError(error, "Board");
      }

      if (!data) {
        return null;
      }

      return mapBoardRowToDomain(data);
    } catch (error) {
      return handleRepositoryError(error, "Board");
    }
  },

  async findByProject(projectId: string): Promise<Board | null> {
    try {
      const { data, error } = await client
        .from("boards")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();

      if (error) {
        return handleRepositoryError(error, "Board");
      }

      if (!data) {
        return null;
      }

      return mapBoardRowToDomain(data);
    } catch (error) {
      return handleRepositoryError(error, "Board");
    }
  },

  async create(input: CreateBoardInput): Promise<Board> {
    try {
      const { data, error } = await client
        .from("boards")
        .insert({
          project_id: input.projectId,
        })
        .select()
        .single();

      if (error) {
        return handleRepositoryError(error, "Board");
      }

      if (!data) {
        return handleRepositoryError(
          createDatabaseError("No data returned from insert"),
          "Board"
        );
      }

      return mapBoardRowToDomain(data);
    } catch (error) {
      return handleRepositoryError(error, "Board");
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await client.from("boards").delete().eq("id", id);

      if (error) {
        return handleRepositoryError(error, "Board", id);
      }
    } catch (error) {
      return handleRepositoryError(error, "Board", id);
    }
  },

  async listColumnsByBoard(boardId: string): Promise<Column[]> {
    try {
      const { data, error } = await client
        .from("columns")
        .select("*")
        .eq("board_id", boardId)
        .order("position", { ascending: true });

      if (error) {
        return handleRepositoryError(error, "Column");
      }

      if (!data) {
        return [];
      }

      return mapColumnRowsToDomain(data);
    } catch (error) {
      return handleRepositoryError(error, "Column");
    }
  },

  async findColumnById(id: string): Promise<Column | null> {
    try {
      const { data, error } = await client
        .from("columns")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return handleRepositoryError(error, "Column");
      }

      if (!data) {
        return null;
      }

      return mapColumnRowToDomain(data);
    } catch (error) {
      return handleRepositoryError(error, "Column");
    }
  },

  async createColumn(input: CreateColumnInput): Promise<Column> {
    try {
      const { data, error } = await client
        .from("columns")
        .insert({
          board_id: input.boardId,
          name: input.name,
          key: input.key,
          state: input.state,
          position: input.position ?? 0,
          visible: input.visible ?? true,
        })
        .select()
        .single();

      if (error) {
        return handleRepositoryError(error, "Column");
      }

      if (!data) {
        return handleRepositoryError(
          createDatabaseError("No data returned from insert"),
          "Column"
        );
      }

      return mapColumnRowToDomain(data);
    } catch (error) {
      return handleRepositoryError(error, "Column");
    }
  },

  async updateColumn(id: string, input: UpdateColumnInput): Promise<Column> {
    try {
      const updateData: Partial<ColumnRow> = {};

      if (input.name !== undefined) {
        updateData.name = input.name;
      }
      if (input.key !== undefined) {
        updateData.key = input.key;
      }
      if (input.state !== undefined) {
        updateData.state = input.state;
      }
      if (input.position !== undefined) {
        updateData.position = input.position;
      }
      if (input.visible !== undefined) {
        updateData.visible = input.visible;
      }

      const { data, error } = await client
        .from("columns")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return handleRepositoryError(error, "Column", id);
      }

      if (!data) {
        return handleRepositoryError(
          createNotFoundError("Column", id),
          "Column",
          id
        );
      }

      return mapColumnRowToDomain(data);
    } catch (error) {
      return handleRepositoryError(error, "Column", id);
    }
  },

  async deleteColumn(id: string): Promise<void> {
    try {
      const { error } = await client.from("columns").delete().eq("id", id);

      if (error) {
        return handleRepositoryError(error, "Column", id);
      }
    } catch (error) {
      return handleRepositoryError(error, "Column", id);
    }
  },

  async updateColumnPositions(
    columnPositions: Array<{ id: string; position: number }>
  ): Promise<Column[]> {
    try {
      const updatedColumns: Column[] = [];

      for (const { id, position } of columnPositions) {
        const { data, error } = await client
          .from("columns")
          .update({ position })
          .eq("id", id)
          .select()
          .single();

        if (error) {
          return handleRepositoryError(error, "Column", id);
        }

        if (!data) {
          return handleRepositoryError(
            createNotFoundError("Column", id),
            "Column",
            id
          );
        }

        updatedColumns.push(mapColumnRowToDomain(data));
      }

      return updatedColumns;
    } catch (error) {
      return handleRepositoryError(error, "Column");
    }
  },

  async countTicketsByColumnIds(
    columnIds: string[]
  ): Promise<Record<string, number>> {
    if (columnIds.length === 0) {
      return {};
    }

    try {
      const { data, error } = await client
        .from("tickets")
        .select("column_id")
        .in("column_id", columnIds);

      if (error) {
        return handleRepositoryError(error, "Ticket");
      }

      const counts: Record<string, number> = {};
      for (const columnId of columnIds) {
        counts[columnId] = 0;
      }

      for (const row of data ?? []) {
        if (!row.column_id) {
          continue;
        }
        counts[row.column_id] = (counts[row.column_id] ?? 0) + 1;
      }

      return counts;
    } catch (error) {
      return handleRepositoryError(error, "Ticket");
    }
  },
});
