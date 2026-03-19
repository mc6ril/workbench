import { useQuery } from "@tanstack/react-query";

import { getProject } from "@/domains/workspace/core/usecases/project/getProject";

import { projectRepository } from "@/domains/workspace/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/workspace/presentation/hooks/queryKeys";

/**
 * Hook for fetching a project by ID.
 *
 * @param id - Project ID
 * @returns React Query hook result with project data, loading state, and error
 */
export const useProject = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => getProject(projectRepository, id),
    enabled: !!id && (options?.enabled ?? true),
  });
};
