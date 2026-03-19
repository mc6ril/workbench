import { useQuery } from "@tanstack/react-query";

import { listSprints } from "@/modules/board/core/usecases/sprint";
import { sprintRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

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
