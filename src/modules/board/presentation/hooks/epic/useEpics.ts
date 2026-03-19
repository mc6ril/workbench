import { useQuery } from "@tanstack/react-query";

import { listEpics } from "@/modules/board/core/usecases/epic/listEpics";

import {
  boardRepository,
  epicRepository,
} from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

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
