import { useQuery } from "@tanstack/react-query";

import { useAuthIdentity } from "@/domains/auth/presentation/hooks/identity/useAuthIdentity";
import { listReclaimableProjects } from "@/domains/workspace/core/usecases/project/listReclaimableProjects";
import { workspaceProjectCatalogGateway } from "@/domains/workspace/infrastructure/supabase/gateways";
import { queryKeys } from "@/domains/workspace/presentation/hooks/queryKeys";

/**
 * Hook for fetching orphaned projects reclaimable by the current user.
 * Returns projects where the orphaned_by_email matches the user's email.
 *
 * @param enabled - Whether the query should execute (default: true). Pass false to defer until session is ready.
 */
export const useReclaimableProjects = (enabled = true) => {
  const { data: identity, isLoading: isIdentityLoading } = useAuthIdentity();

  return useQuery({
    queryKey: queryKeys.projects.reclaimable(),
    queryFn: () => listReclaimableProjects(workspaceProjectCatalogGateway),
    enabled: enabled && !isIdentityLoading && !!identity?.userId,
  });
};
