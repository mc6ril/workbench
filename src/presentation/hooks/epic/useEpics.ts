import { useQuery } from "@tanstack/react-query";

import { listEpics } from "@/core/usecases/epic/listEpics";

import { epicRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for fetching epics for a project.
 */
export const useEpics = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.projects.epicsList(projectId),
    queryFn: () => listEpics(epicRepository, projectId),
    enabled: !!projectId,
  });
};

