import { useQuery } from "@tanstack/react-query";

import { getCurrentProjectRole } from "@/domains/project/core/usecases/member/getCurrentProjectRole";
import { projectMemberGateway } from "@/domains/project/infrastructure/supabase/gateways";
import { queryKeys } from "@/domains/project/presentation/hooks/queryKeys";

/**
 * Hook for fetching the current authenticated user's role in a project.
 */
export const useProjectRole = (projectId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.projects.currentRole(projectId ?? ""),
    queryFn: () => getCurrentProjectRole(projectMemberGateway, projectId!),
    enabled: Boolean(projectId),
  });
};
