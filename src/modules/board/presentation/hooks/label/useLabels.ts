import { useQuery } from "@tanstack/react-query";

import { listLabels } from "@/modules/board/core/usecases/label";
import { labelRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

/**
 * Hook for fetching labels for a project.
 */
export const useLabels = (
  projectId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: queryKeys.labels.byProject(projectId),
    queryFn: () => listLabels(projectId, labelRepository),
    enabled: !!projectId && (options?.enabled ?? true),
  });
};
