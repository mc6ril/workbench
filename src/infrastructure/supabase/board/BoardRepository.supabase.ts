import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createDatabaseError,
  createNotFoundError,
} from "@/core/domain/repositoryError";
import type {
  Board,
  Column,
  CreateBoardInput,
  CreateColumnInput,
  UpdateColumnInput,
} from "@/core/domain/schema/board.schema";

import { handleRepositoryError } from "@/infrastructure/supabase/shared/errors/errorHandlers";
import type { BoardRow, ColumnRow } from "@/infrastructure/supabase/types";

import {
  mapBoardRowToDomain,
  mapColumnRowsToDomain,
  mapColumnRowToDomain,
} from "./BoardMapper.supabase";

import type { BoardRepository } from "@/core/ports/boardRepository";

/**
 * Create a BoardRepository implementation using the provided Supabase client.
 * This allows using different clients (browser/server) based on context.
 *
 * @param client - Supabase client instance to use
 * @returns BoardRepository implementation
 */
export const createBoardRepository = (
  client: SupabaseClient
): BoardRepository => ({
  async findById(id: string): Promise<Board | null> {
    try {
      const { data, error } = await client
        .from("boards")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return handleRepositoryError(error, "Board");
      }

      if (!data) {
        return null;
      }

      return mapBoardRowToDomain(data as BoardRow);
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
        .single();

      if (error) {
        return handleRepositoryError(error, "Board");
      }

      if (!data) {
        return null;
      }

      return mapBoardRowToDomain(data as BoardRow);
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

      return mapBoardRowToDomain(data as BoardRow);
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

      return mapColumnRowsToDomain(data as ColumnRow[]);
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

      return mapColumnRowToDomain(data as ColumnRow);
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
          status: input.status,
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

      return mapColumnRowToDomain(data as ColumnRow);
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
      if (input.status !== undefined) {
        updateData.status = input.status;
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

      return mapColumnRowToDomain(data as ColumnRow);
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

        updatedColumns.push(mapColumnRowToDomain(data as ColumnRow));
      }

      return updatedColumns;
    } catch (error) {
      return handleRepositoryError(error, "Column");
    }
  },
});
