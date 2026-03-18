import type { Label } from "@/domains/project-management/core/domain/schema/label.schema";

import type { LabelRow } from "@/infrastructure/supabase/types";

import { toDate } from "@/shared/utils/guards";

/**
 * Maps a Supabase row to a domain Label entity.
 */
export const mapLabelRowToDomain = (row: LabelRow): Label => {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    color: row.color,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
};

export const mapLabelRowsToDomain = (rows: LabelRow[]): Label[] => {
  return rows.map(mapLabelRowToDomain);
};
