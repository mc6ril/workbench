import { createDatabaseError } from "@/shared/errors/repositoryError";
import type { AppSupabaseClient } from "@/shared/infrastructure/supabase/types";

import type { ProjectLookupRepository } from "@/modules/board/core/ports/projectLookupRepository";

export const createProjectLookupRepository = (
  client: AppSupabaseClient
): ProjectLookupRepository => ({
  async findIdByShortCode(shortCode) {
    const { data, error } = await client
      .from("projects")
      .select("id")
      .eq("short_code", shortCode.toUpperCase())
      .maybeSingle();

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
      .maybeSingle();

    if (error) {
      throw createDatabaseError(error.message);
    }

    return data?.short_code ?? null;
  },
});
