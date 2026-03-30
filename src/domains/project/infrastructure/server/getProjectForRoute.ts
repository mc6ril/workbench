import { cache } from "react";

import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";

import type { Project } from "@/domains/project/core/domain/project.types";
import { getProject } from "@/domains/project/core/usecases/project/getProject";
import { createProjectGateway } from "@/domains/project/infrastructure/supabase/gateways";

/**
 * Shared server-side project loader for the authenticated project route segment.
 * Uses React cache to deduplicate the same project lookup within a request render.
 */
export const getProjectForRoute = cache(
  async (projectId: string): Promise<Project> => {
    const supabaseClient = await createSupabaseServerClient();
    const projectGateway = createProjectGateway(supabaseClient);

    return getProject(projectGateway, projectId);
  }
);
