import { cache } from "react";

import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";

import type { Project } from "@/domains/project/core/domain/schema/project.schema";
import { getProject } from "@/domains/project/core/usecases/project/getProject";
import { createProjectRepository } from "@/domains/project/infrastructure/supabase/repositories";

/**
 * Shared server-side project loader for the authenticated project route segment.
 * Uses React cache to deduplicate the same project lookup within a request render.
 */
export const getProjectForRoute = cache(
  async (projectId: string): Promise<Project> => {
    const supabaseClient = await createSupabaseServerClient();
    const projectRepository = createProjectRepository(supabaseClient);

    return getProject(projectRepository, projectId);
  }
);
