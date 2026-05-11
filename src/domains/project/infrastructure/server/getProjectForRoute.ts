import { cache } from "react";
import { notFound } from "next/navigation";
import { ZodError } from "zod";

import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";

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

    try {
      return await getProject(projectGateway, projectId);
    } catch (error) {
      if (error instanceof ZodError) {
        notFound();
      }
      throw error;
    }
  }
);
