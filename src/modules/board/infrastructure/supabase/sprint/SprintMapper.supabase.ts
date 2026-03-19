import type { SprintRow } from "@/shared/infrastructure/types";
import { toDate } from "@/shared/utils/guards";

import type { Sprint } from "@/modules/board/core/domain/schema/sprint.schema";

/**
 * Maps a Supabase row to a domain Sprint entity.
 * Translates snake_case database fields to camelCase domain fields.
 */
export const mapSprintRowToDomain = (row: SprintRow): Sprint => {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    goal: row.goal,
    startDate: row.start_date ? toDate(row.start_date) : null,
    endDate: row.end_date ? toDate(row.end_date) : null,
    status: row.status as Sprint["status"],
    position: row.position,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
};

export const mapSprintRowsToDomain = (rows: SprintRow[]): Sprint[] => {
  return rows.map(mapSprintRowToDomain);
};
