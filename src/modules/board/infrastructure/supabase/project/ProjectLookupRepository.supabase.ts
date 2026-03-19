import type { SupabaseClient } from "@supabase/supabase-js";

import { createDatabaseError } from "@/shared/errors/repositoryError";

import type { ProjectLookupRepository } from "@/modules/board/core/ports/projectLookupRepository";
import type { ProjectLookupRow } from "@/modules/board/infrastructure/supabase/project/types";

export const createProjectLookupRepository = (
  client: SupabaseClient
): ProjectLookupRepository => ({
  async findIdByShortCode(shortCode) {
    const { data, error } = await client
      .from("projects")
      .select("id")
      .eq("short_code", shortCode.toUpperCase())
      .maybeSingle<Pick<ProjectLookupRow, "id">>();

    if (error) {
      throw createDatabaseError(error.message);
    }

    return data?.id ?? null;
  },

  async findShortCodeById(projectId) {
    const { data, error } = await client
      .from("projects")
      .select("short_code")
      .eq("id", projectId)
      .maybeSingle<Pick<ProjectLookupRow, "short_code">>();

    if (error) {
      throw createDatabaseError(error.message);
    }

    return data?.short_code ?? null;
  },
});
