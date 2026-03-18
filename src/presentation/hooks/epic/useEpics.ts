import { useQuery } from "@tanstack/react-query";

import { listEpics } from "@/domains/project-management/core/usecases/epic/listEpics";

import {
  boardRepository,
  epicRepository,
} from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for fetching epics for a project.
 */
export const useEpics = (
  projectId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: queryKeys.projects.epicsList(projectId),
    queryFn: () => listEpics(epicRepository, boardRepository, projectId),
    enabled: !!projectId && (options?.enabled ?? true),
  });
};
