import { useQuery } from "@tanstack/react-query";

import { getProjectShortCode } from "@/modules/board/core/usecases/project/getProjectShortCode";
import { projectLookupRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

/**
 * Fetches the short code for a project.
 * Used to build human-readable ticket codes in the board UI.
 */
export const useProjectShortCode = (
  projectId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: queryKeys.projects.shortCode(projectId),
    queryFn: () => getProjectShortCode(projectLookupRepository, projectId),
    enabled: !!projectId && (options?.enabled ?? true),
  });
};
