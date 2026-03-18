import { cache } from "react";

import type { Project } from "@/domains/project-management/core/domain/schema/project.schema";

import { getProject } from "@/domains/project-management/core/usecases/project/getProject";

import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";

import { createProjectRepository } from "@/domains/project-management/infrastructure/supabase/repositories";

/**
 * Shared server-side project loader for this route segment.
 * Uses React cache to deduplicate the same project lookup
 * between layout and page during a single request render.
 */
export const getProjectForRoute = cache(
  async (projectId: string): Promise<Project> => {
    const supabaseClient = await createSupabaseServerClient();
    const projectRepository = createProjectRepository(supabaseClient);

    return getProject(projectRepository, projectId);
  }
);
