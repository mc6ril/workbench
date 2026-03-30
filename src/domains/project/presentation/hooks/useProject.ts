import { useQuery } from "@tanstack/react-query";

import { getProject } from "@/domains/project/core/usecases/project/getProject";
import { projectGateway } from "@/domains/project/infrastructure/supabase/gateways";
import { queryKeys } from "@/domains/project/presentation/hooks/queryKeys";

/**
 * Hook for fetching a project by ID.
 *
 * @param id - Project ID
 * @returns React Query hook result with project data, loading state, and error
 */
export const useProject = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => getProject(projectGateway, id),
    enabled: !!id && (options?.enabled ?? true),
  });
};
