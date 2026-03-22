import { useQuery } from "@tanstack/react-query";

import { projectRepository } from "@/domains/project/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/project/presentation/hooks/queryKeys";
import { getProject } from "@/domains/workspace/core/usecases/project/getProject";

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
