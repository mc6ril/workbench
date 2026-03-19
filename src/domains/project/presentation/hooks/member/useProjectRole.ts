import { useQuery } from "@tanstack/react-query";

import { getCurrentProjectRole } from "@/domains/project/core/usecases/member/getCurrentProjectRole";
import { memberRepository } from "@/domains/project/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/project/presentation/hooks/queryKeys";

/**
 * Hook for fetching the current authenticated user's role in a project.
 */
export const useProjectRole = (projectId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.projects.currentRole(projectId ?? ""),
    queryFn: () => getCurrentProjectRole(memberRepository, projectId!),
    enabled: Boolean(projectId),
  });
};
