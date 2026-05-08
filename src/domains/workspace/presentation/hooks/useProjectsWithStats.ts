import { useQuery } from "@tanstack/react-query";

import { useAuthIdentity } from "@/domains/auth/presentation/hooks/identity/useAuthIdentity";
import { listProjectsWithStats } from "@/domains/workspace/core/usecases/project/listProjectsWithStats";
import { workspaceProjectCatalogGateway } from "@/domains/workspace/infrastructure/supabase/gateways";
import { queryKeys } from "@/domains/workspace/presentation/hooks/queryKeys";

/**
 * Hook for fetching all projects with statistics for workspace overview.
 * Returns projects with member count, ticket count, and status breakdown.
 * Uses optimized SQL function for aggregated counts.
 *
 * @param enabled - Whether the query should execute (default: true). Pass false to defer until session is ready.
 * @returns React Query hook result with projects array including stats
 */
export const useProjectsWithStats = (enabled = true) => {
  const { data: identity, isLoading: isIdentityLoading } = useAuthIdentity();

  return useQuery({
    queryKey: queryKeys.projects.withStats(),
    queryFn: () => listProjectsWithStats(workspaceProjectCatalogGateway),
    enabled: enabled && !isIdentityLoading && !!identity?.userId,
  });
};
