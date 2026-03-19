import type { Epic } from "@/modules/board/core/domain/schema/epic.schema";

import type { EpicRow } from "@/shared/infrastructure/types";

import { toDate } from "@/shared/utils/guards";

/**
 * Maps a Supabase row to a domain Epic entity.
 * Translates snake_case database fields to camelCase domain fields.
 *
 * Pure transformation function: only translates structure and converts types (no validation, no error handling).
 *
 * @param row - Supabase row data
 * @returns Domain Epic entity
 */
export const mapEpicRowToDomain = (row: EpicRow): Epic => {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    description: row.description,
    codeNumber: row.code_number,
    startDate: row.start_date ? toDate(row.start_date) : null,
    targetDate: row.target_date ? toDate(row.target_date) : null,
    color: row.color,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
};

/**
 * Maps multiple Supabase rows to domain Epic entities.
 *
 * @param rows - Array of Supabase row data
 * @returns Array of domain Epic entities
 */
export const mapEpicRowsToDomain = (rows: EpicRow[]): Epic[] => {
  return rows.map(mapEpicRowToDomain);
};
