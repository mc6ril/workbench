import { useQuery } from "@tanstack/react-query";

import { listLabels } from "@/domains/project-management/core/usecases/label";

import { labelRepository } from "@/domains/project-management/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

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
