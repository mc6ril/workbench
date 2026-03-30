import { createAppError } from "@/shared/errors/appError";
import { INFRA_ERROR_CODE } from "@/shared/errors/appErrorCodes";
import { toDate } from "@/shared/utils/guards";

import {
  type Board,
  type Column,
  COLUMN_WORKFLOW_STATE_VALUES,
  type ColumnWorkflowState,
} from "@/modules/board/core/domain/board.types";
import type {
  BoardRow,
  ColumnRow,
} from "@/modules/board/infrastructure/supabase/board/types";

const parseColumnWorkflowState = (raw: string): ColumnWorkflowState => {
  if (
    (COLUMN_WORKFLOW_STATE_VALUES as readonly string[]).includes(raw)
  ) {
    return raw as ColumnWorkflowState;
  }

  throw createAppError(INFRA_ERROR_CODE.BOARD_INVALID_COLUMN_WORKFLOW_STATE, {
    debugMessage: `Invalid column workflow state: ${raw}`,
  });
};

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
    key: row.key,
    state: parseColumnWorkflowState(row.state),
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
