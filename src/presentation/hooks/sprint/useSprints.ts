import { useQuery } from "@tanstack/react-query";

import { listSprints } from "@/core/usecases/sprint";

import { sprintRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for fetching sprints for a project with ticket statistics.
 */
export const useSprints = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.sprints.byProject(projectId),
    queryFn: () => listSprints(projectId, sprintRepository),
    enabled: !!projectId,
  });
};
