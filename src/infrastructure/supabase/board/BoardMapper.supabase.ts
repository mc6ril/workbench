import type { Board, Column } from "@/core/domain/schema/board.schema";

import type { BoardRow, ColumnRow } from "@/infrastructure/supabase/types";

import { toDate } from "@/shared/utils/guards";

/**
 * Maps a Supabase row to a domain Board entity.
 * Translates snake_case database fields to camelCase domain fields.
 *
 * Pure transformation function: only translates structure and converts types (no validation, no error handling).
 *
 * @param row - Supabase row data
 * @returns Domain Board entity
 */
export const mapBoardRowToDomain = (row: BoardRow): Board => {
  return {
    id: row.id,
    projectId: row.project_id,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
};

/**
 * Maps multiple Supabase rows to domain Board entities.
 *
 * @param rows - Array of Supabase row data
 * @returns Array of domain Board entities
 */
export const mapBoardRowsToDomain = (rows: BoardRow[]): Board[] => {
  return rows.map(mapBoardRowToDomain);
};

/**
 * Maps a Supabase row to a domain Column entity.
 * Translates snake_case database fields to camelCase domain fields.
 *
 * Pure transformation function: only translates structure and converts types (no validation, no error handling).
 *
 * @param row - Supabase row data
 * @returns Domain Column entity
 */
export const mapColumnRowToDomain = (row: ColumnRow): Column => {
  return {
    id: row.id,
    boardId: row.board_id,
    name: row.name,
    status: row.status,
    position: row.position,
    visible: row.visible,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
};

/**
 * Maps multiple Supabase rows to domain Column entities.
 *
 * @param rows - Array of Supabase row data
 * @returns Array of domain Column entities
 */
export const mapColumnRowsToDomain = (rows: ColumnRow[]): Column[] => {
  return rows.map(mapColumnRowToDomain);
};
