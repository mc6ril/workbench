import { useQuery } from "@tanstack/react-query";

import { listSprints } from "@/domains/project-management/core/usecases/sprint";

import { sprintRepository } from "@/domains/project-management/infrastructure/supabase/repositories";

import { queryKeys } from "@/domains/project-management/presentation/hooks/queryKeys";

/**
 * Hook for fetching sprints for a project with ticket statistics.
 */
export const useSprints = (
  projectId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: queryKeys.sprints.byProject(projectId),
    queryFn: () => listSprints(projectId, sprintRepository),
    enabled: !!projectId && (options?.enabled ?? true),
  });
};
